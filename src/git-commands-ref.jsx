import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChapterNav } from "./chapter-context";

const COMPARISONS = [
  { id: "fetch-pull", title: "fetch vs pull", emoji: "🔄",
    cmdA: { name: "git fetch", color: "#F59E0B", desc: "只下載遠端更新到本地的遠端追蹤分支，不動你的工作分支。安全、可預測。", when: "想先看看遠端改了什麼再決定", after: "需要手動 merge 或 rebase 整合" },
    cmdB: { name: "git pull", color: "#EF4444", desc: "等於 fetch + merge。下載並立即合併到目前分支。方便但可能觸發意外衝突。", when: "確定要同步且不擔心衝突", after: "變更已合併到你的工作分支" },
    scenario: "隊友推了新的 commit，你想同步但正在改敏感檔案，怕衝突打斷你。",
    correctIdx: 0, explanation: "先 fetch 下載，再用 diff/log 查看差異，確認安全後再手動 merge。" },
  { id: "merge-rebase", title: "merge vs rebase", emoji: "⚖️",
    cmdA: { name: "git merge", color: "#3B82F6", desc: "保留完整分支歷史，建立合併節點。歷史真實但有分叉。", when: "合併已推到遠端的共享分支", after: "產生一個合併 commit" },
    cmdB: { name: "git rebase", color: "#F59E0B", desc: "把 commit 搬到目標分支頂端，改寫歷史。歷史成直線但 hash 改變。", when: "整理個人 feature 分支", after: "需要 force push" },
    scenario: "你的 feature 分支已推到遠端，隊友正在 review PR。develop 有了新 commit 需要同步。",
    correctIdx: 0, explanation: "分支已共享，rebase 改寫歷史會導致隊友混亂。merge 不改寫歷史，安全。" },
  { id: "reset-revert", title: "reset vs revert", emoji: "⏪",
    cmdA: { name: "git reset", color: "#EF4444", desc: "把分支指標往回移，「刪除」commit。有 --soft/--mixed/--hard 三種模式。", when: "撤銷還沒 push 的 commit", after: "commit 從歷史消失（修改可保留）" },
    cmdB: { name: "git revert", color: "#10B981", desc: "建立「反向 commit」撤銷指定 commit。歷史不被改寫。", when: "撤銷已 push 到遠端的 commit", after: "多了一筆 revert commit" },
    scenario: "你不小心把 console.log 推到了 main，隊友已經 pull 了。",
    correctIdx: 1, explanation: "commit 已在遠端且隊友已同步，reset 會造成歷史不一致。revert 安全地建立反向 commit。" },
  { id: "stash-commit", title: "stash vs commit", emoji: "📦",
    cmdA: { name: "git stash", color: "#8B5CF6", desc: "臨時儲存未提交的修改，工作區回到乾淨狀態。用 stash pop 取回。", when: "需要臨時切換分支，修改還沒準備好", after: "修改暫存在 stash 堆疊中" },
    cmdB: { name: "git commit", color: "#3B82F6", desc: "把暫存區的修改永久記錄到歷史中。每個 commit 是完整快照。", when: "完成一個有意義的修改單元", after: "產生永久歷史記錄" },
    scenario: "你正在寫新功能改到一半，突然需要切到 hotfix 分支修 bug。修改還不完整。",
    correctIdx: 0, explanation: "修改還不完整，不該留半成品 commit。用 stash 暫存，修完 bug 後 stash pop 回來繼續。" },
  { id: "checkout-b", title: "checkout -b vs branch+checkout", emoji: "🌿",
    cmdA: { name: "git checkout -b new", color: "#10B981", desc: "一步完成：建立新分支 + 切換。最常用的方式。可指定來源分支。", when: "建立新分支並立刻開始工作", after: "新分支已建立，HEAD 指向新分支" },
    cmdB: { name: "branch + checkout", color: "#F59E0B", desc: "分兩步：先建立分支，再切換。結果和 checkout -b 完全一樣。", when: "只想建立分支但不切換", after: "branch 只建立，checkout 才切換" },
    scenario: "你要從 develop 建一個 feature 分支並開始開發。",
    correctIdx: 0, explanation: "一步到位較方便：git checkout -b feature/new develop" },
  { id: "add-commit-am", title: "add+commit vs commit -am", emoji: "⚡",
    cmdA: { name: "git add . + commit", color: "#3B82F6", desc: "分兩步：先選擇要提交的檔案，再 commit。可以精確控制。", when: "有新檔案需要追蹤", after: "完全控制哪些檔案進入暫存區" },
    cmdB: { name: "git commit -am", color: "#D4A843", desc: "-a 自動加入所有「已追蹤」的修改。注意：新檔案不被包含。", when: "快速提交已追蹤檔案的修改", after: "只有已追蹤檔案被 commit" },
    scenario: "你修改了 3 個已有檔案，同時新建了一個 utils.js。想全部提交。",
    correctIdx: 0, explanation: "新檔案 utils.js 從未被追蹤，commit -am 不包含它。必須先 git add ." },
  { id: "force", title: "--force vs --force-with-lease", emoji: "🛡️",
    cmdA: { name: "push --force", color: "#EF4444", desc: "強制覆蓋遠端，不做檢查。可能覆蓋隊友的 commit。", when: "⚠️ 幾乎不該使用", after: "遠端被強制覆蓋" },
    cmdB: { name: "--force-with-lease", color: "#10B981", desc: "有保險的強制推送。先檢查遠端是否有未知新 commit。", when: "rebase 後需要強制推送", after: "安全覆蓋，有未知 commit 會中斷" },
    scenario: "你做完 rebase 需要強制推送 feature 分支。隊友可能也推了 commit。",
    correctIdx: 1, explanation: "--force-with-lease 推送前檢查遠端狀態，避免覆蓋隊友工作。" },
];

const CHEATSHEET = [
  { title: "🏗️ 建立與設定", color: "#E8C872", cmds: [
    ["git init", "初始化新的本地儲存庫"], ["git clone <url>", "複製遠端儲存庫到本地"],
    ["git remote -v", "查看遠端連結"], ["git remote add <n> <url>", "新增遠端連結"],
    ["git remote show <n>", "查看遠端詳細資訊"],
  ]},
  { title: "📝 暫存與提交", color: "#E8C872", cmds: [
    ["git status", "查看工作區狀態"], ["git status -s", "精簡狀態"],
    ["git add <file>", "加入暫存區"], ["git add .", "所有變更加入暫存區"],
    ["git commit -m \"msg\"", "提交變更"], ["git commit -am \"msg\"", "auto add 已追蹤檔 + 提交"],
    ["git commit --amend -m \"msg\"", "修改上一次 commit 訊息"],
  ]},
  { title: "🌿 分支管理", color: "#10B981", cmds: [
    ["git branch", "列出本地分支"], ["git branch -a", "列出所有分支"], ["git branch -vv", "顯示追蹤關係"],
    ["git checkout <branch>", "切換分支"], ["git checkout -b <new> <base>", "建立新分支並切換"],
    ["git branch -d <branch>", "刪除本地分支"], ["git push origin --delete <branch>", "刪除遠端分支"],
  ]},
  { title: "🔄 同步與推送", color: "#60A5FA", cmds: [
    ["git fetch origin", "下載遠端更新（不合併）"], ["git pull origin <branch>", "下載並合併"],
    ["git push origin <branch>", "推送"], ["git push -u origin <branch>", "推送+建立追蹤"],
    ["git push --force-with-lease", "安全強制推送"], ["git push origin --tags", "推送所有標籤"],
  ]},
  { title: "🔀 合併與整合", color: "#E8C872", cmds: [
    ["git merge <branch>", "合併分支"], ["git rebase <branch>", "Rebase 到目標分支"],
    ["git rebase --continue", "解衝突後繼續 rebase"], ["git rebase --abort", "放棄 rebase"],
  ]},
  { title: "🔍 檢視歷史", color: "#F59E0B", cmds: [
    ["git log --oneline", "精簡歷史"], ["git log --oneline -n", "最近 n 筆"],
    ["git log A..B", "比較兩分支差異"], ["git diff", "未暫存的修改"],
    ["git diff --staged", "已暫存的修改"], ["git diff HEAD~1", "與上一 commit 比較"],
    ["git show <tag>", "查看標籤/commit 詳情"],
  ]},
  { title: "⏪ 撤銷與修復", color: "#EF4444", cmds: [
    ["git stash", "暫存未提交的修改"], ["git stash pop", "取回 stash"],
    ["git reset --soft HEAD~1", "撤銷 commit，保留暫存"], ["git reset --hard HEAD~1", "撤銷 commit，丟棄修改"],
    ["git revert HEAD", "反向 commit 撤銷"], ["git bisect start/bad/good/reset", "二分搜尋找 bug"],
  ]},
  { title: "🏷️ 標籤", color: "#E8C872", cmds: [
    ["git tag", "列出標籤"], ["git tag -a v1.0 -m \"msg\"", "建立附註標籤"], ["git tag v1.0", "建立輕量標籤"],
  ]},
];

function CompCard({ comp, onCorrect }) {
  const [sel, setSel] = useState(null);
  const [showExp, setShowExp] = useState(false);
  const pick = (idx) => {
    if (sel !== null) return; setSel(idx);
    if (idx === comp.correctIdx) setTimeout(() => { setShowExp(true); onCorrect(); }, 600);
    else setTimeout(() => setShowExp(true), 600);
  };
  const getStyle = (idx) => {
    if (sel === null) return { border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" };
    const isCorrect = idx === comp.correctIdx;
    if (sel === idx) return isCorrect ? { border: "1.5px solid #10B981", background: "rgba(16,185,129,0.08)" } : { border: "1.5px solid #EF4444", background: "rgba(239,68,68,0.08)" };
    if (isCorrect) return { border: "1.5px solid #10B981", background: "rgba(16,185,129,0.06)" };
    return { border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" };
  };
  const cmds = [comp.cmdA, comp.cmdB];
  return (
    <div>
      <div style={{ padding: "14px 16px", background: "rgba(232,200,114,0.04)", borderLeft: "3px solid #E8C872", borderRadius: "0 10px 10px 0", fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, marginBottom: 14 }}>
        <span style={{ fontWeight: 700, color: "#E8C872" }}>🎯 情境：</span>{comp.scenario}
      </div>
      <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)", marginBottom: 10, textAlign: "center" }}>你會選擇哪一個？</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        {cmds.map((cmd, idx) => (
          <button key={idx} onClick={() => pick(idx)} disabled={sel !== null} style={{ ...getStyle(idx), borderRadius: 12, padding: "16px 14px", cursor: sel !== null ? "default" : "pointer", transition: "all 0.3s", textAlign: "left", display: "flex", flexDirection: "column", gap: 8 }}>
            <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: cmd.color, fontWeight: 700 }}>{cmd.name}</code>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{cmd.desc}</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}><strong>適用：</strong>{cmd.when}</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}><strong>之後：</strong>{cmd.after}</div>
          </button>
        ))}
      </div>
      {sel !== null && (
        <div style={{ padding: "14px 16px", background: showExp ? "rgba(16,185,129,0.05)" : "transparent", borderRadius: 10, border: showExp ? "1px solid rgba(16,185,129,0.15)" : "none", fontSize: 12.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, transition: "all 0.3s" }}>
          {sel === comp.correctIdx ? <span style={{ color: "#10B981", fontWeight: 700 }}>✅ 正確！</span> : <span style={{ color: "#EF4444", fontWeight: 700 }}>✗ 不太對</span>}
          {showExp && <div style={{ marginTop: 6 }}><span style={{ fontWeight: 700, color: "#10B981" }}>解說：</span>{comp.explanation}</div>}
        </div>
      )}
    </div>
  );
}

function CheatSheet() {
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");
  const filtered = search.trim() ? CHEATSHEET.map(c => ({ ...c, cmds: c.cmds.filter(([cmd, desc]) => cmd.toLowerCase().includes(search.toLowerCase()) || desc.includes(search)) })).filter(c => c.cmds.length > 0) : CHEATSHEET;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(0,0,0,0.3)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", marginBottom: 16 }}>
        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋指令或描述..." style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }} />
        {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 12 }}>✕</button>}
      </div>
      {filtered.map((cat, ci) => (
        <div key={ci} style={{ marginBottom: 8 }}>
          <button onClick={() => setExpanded(expanded === ci ? null : ci)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: expanded === ci ? `${cat.color}10` : "rgba(255,255,255,0.02)", border: `1px solid ${expanded === ci ? cat.color + "33" : "rgba(255,255,255,0.05)"}`, borderRadius: expanded === ci || search ? "10px 10px 0 0" : 10, cursor: "pointer", transition: "all 0.3s" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: expanded === ci ? cat.color : "rgba(255,255,255,0.7)" }}>{cat.title}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>{cat.cmds.length} 個指令</span>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, transition: "transform 0.2s", transform: expanded === ci || search ? "rotate(90deg)" : "rotate(0)" }}>▶</span>
            </div>
          </button>
          {(expanded === ci || search) && (
            <div style={{ border: `1px solid ${cat.color}22`, borderTop: "none", borderRadius: "0 0 10px 10px", overflow: "hidden" }}>
              {cat.cmds.map(([cmd, desc], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.025)", borderBottom: i < cat.cmds.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
                  <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: cat.color, fontWeight: 600, minWidth: 250, flexShrink: 0 }}>{cmd}</code>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function GitRef() {
  const [tab, setTab] = useState("compare");
  const [cur, setCur] = useState(0);
  useEffect(() => { window.scrollTo(0, 0); }, [cur]);
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes goldGlow {
        0%, 100% { box-shadow: inset 0 0 0 0 rgba(232, 200, 114, 0.3); }
        50% { box-shadow: inset 0 0 12px 0 rgba(232, 200, 114, 0.5); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const [done, setDone] = useState({});
  const [score, setScore] = useState(0);
  const navigate = useNavigate();
  const { prevPath, nextPath } = useChapterNav();
  const comp = COMPARISONS[cur], total = COMPARISONS.length, accent = "#E8C872";
  const handleCorrect = () => { if (!done[cur]) { setDone(p => ({ ...p, [cur]: true })); setScore(s => s + 1); } };

  return (
    <div style={{ minHeight: "100%", background: "#0A0A12", color: "#E6EDF3", fontFamily: "'Noto Sans TC', 'Segoe UI', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 24px" }}>
      <div style={{ width: "100%", maxWidth: 900 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #E8C872, #D4A843)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#0D1117", fontFamily: "'JetBrains Mono', monospace" }}>8</div>
            <div><div style={{ fontSize: 15, fontWeight: 700 }}>指令總覽與比較</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Git 課程系列 · 第八堂</div></div>
          </div>
          {tab === "compare" && <div style={{ fontSize: 12, color: "#E8C872", fontFamily: "'JetBrains Mono', monospace", background: "rgba(232,200,114,0.1)", padding: "4px 10px", borderRadius: 6 }}>⭐ {score}/{total}</div>}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[{ key: "compare", label: "⚔️ 指令比較", desc: "情境選擇題" }, { key: "cheatsheet", label: "📋 速查表", desc: "完整指令參考" }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: "14px 16px", textAlign: "center", cursor: "pointer", background: tab === t.key ? "rgba(232,200,114,0.12)" : "rgba(255,255,255,0.02)", border: `1.5px solid ${tab === t.key ? "rgba(232,200,114,0.4)" : "rgba(255,255,255,0.06)"}`, borderRadius: 12, transition: "all 0.3s" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: tab === t.key ? "#E8C872" : "rgba(255,255,255,0.6)", marginBottom: 2 }}>{t.label}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{t.desc}</div>
            </button>
          ))}
        </div>

        {tab === "compare" && (<>
          <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 20 }}>
            {COMPARISONS.map((_, i) => <div key={i} onClick={() => setCur(i)} style={{ flex: 1, height: 4, borderRadius: 2, cursor: "pointer", background: i <= cur ? "linear-gradient(90deg, #E8C872, #D4A843)" : "rgba(255,255,255,0.06)", transition: "background 0.4s", animation: i <= cur ? "goldGlow 3s ease-in-out infinite" : "none" }} />)}
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginLeft: 8, fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap" }}>{cur + 1}/{total}</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "26px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <span style={{ fontSize: 28 }}>{comp.emoji}</span>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, background: "linear-gradient(135deg, #E8C872, #D4A843)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{comp.title}</h2>
            </div>
            <CompCard key={cur} comp={comp} onCorrect={handleCorrect} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 12 }}>
            {cur === 0 ? (
              prevPath ? <button onClick={() => navigate(prevPath)} style={{ padding: "12px 24px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← 上一章</button> : <div />
            ) : (
              <button onClick={() => setCur(c => c - 1)} style={{ padding: "12px 24px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← 上一組</button>
            )}
            {cur === total - 1 ? (
              nextPath ? <button onClick={() => navigate(nextPath)} style={{ padding: "12px 24px", background: "linear-gradient(135deg, #E8C872, #D4A843)", border: "none", borderRadius: 10, color: "#0D1117", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>下一章 →</button> : <div />
            ) : (
              <button onClick={() => setCur(c => c + 1)} style={{ padding: "12px 24px", background: "linear-gradient(135deg, #E8C872, #D4A843)", border: "none", borderRadius: 10, color: "#0D1117", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>下一組 →</button>
            )}
          </div>
          {cur === total - 1 && done[cur] && (
            <div style={{ marginTop: 24, textAlign: "center", padding: "24px", background: "rgba(232,200,114,0.08)", border: "1px solid rgba(232,200,114,0.2)", borderRadius: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#E8C872", marginBottom: 6 }}>指令比較全部完成！</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>切換到「📋 速查表」可隨時查閱所有指令。<br />接下來進入總複習實戰！</div>
            </div>
          )}
        </>)}

        {tab === "cheatsheet" && (
          <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "22px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>📋</span>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, background: "linear-gradient(135deg, #E8C872, #D4A843)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Git 指令速查表</h2>
            </div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)", marginBottom: 16, lineHeight: 1.6 }}>涵蓋課程中所有學過的指令，按工作階段分類。點擊分類展開，或直接搜尋。</div>
            <CheatSheet />
          </div>
        )}
      </div>
    </div>
  );
}
