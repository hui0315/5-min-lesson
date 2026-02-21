import { useState, useEffect, useRef } from "react";

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
    ["git switch <branch>", "切換分支（新語法）"], ["git switch -c <new>", "建立新分支並切換（新語法）"],
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
    ["git cherry-pick <hash>", "撿取特定 commit"],
  ]},
  { title: "🔍 檢視歷史", color: "#F59E0B", cmds: [
    ["git log --oneline", "精簡歷史"], ["git log --oneline -n", "最近 n 筆"],
    ["git log A..B", "比較兩分支差異"], ["git diff", "未暫存的修改"],
    ["git diff --staged", "已暫存的修改"], ["git diff HEAD~1", "與上一 commit 比較"],
    ["git reflog", "查看所有 HEAD 移動紀錄"],
    ["git show <tag>", "查看標籤/commit 詳情"],
  ]},
  { title: "⏪ 撤銷與修復", color: "#EF4444", cmds: [
    ["git stash", "暫存未提交的修改"], ["git stash pop", "取回 stash"],
    ["git stash list", "查看 stash 列表"],
    ["git reset --soft HEAD~1", "撤銷 commit，保留暫存"], ["git reset --hard HEAD~1", "撤銷 commit，丟棄修改"],
    ["git revert HEAD", "反向 commit 撤銷"],
    ["git restore <file>", "丟棄檔案的修改"],
    ["git bisect start/bad/good/reset", "二分搜尋找 bug"],
  ]},
  { title: "🏷️ 標籤", color: "#E8C872", cmds: [
    ["git tag", "列出標籤"], ["git tag -a v1.0 -m \"msg\"", "建立附註標籤"], ["git tag v1.0", "建立輕量標籤"],
  ]},
  { title: "📝 Commit Type 規範", color: "#A78BFA", cmds: [
    ["feat:", "新增功能（對使用者可見的新能力）"],
    ["fix:", "修復 Bug"],
    ["docs:", "文件變更（README、註解等）"],
    ["style:", "格式調整（空白、分號、不影響程式邏輯）"],
    ["refactor:", "重構（不修 bug 也不加功能的程式碼變動）"],
    ["test:", "新增或修改測試"],
    ["chore:", "雜務（建構流程、套件升級、CI 設定等）"],
    ["perf:", "效能優化"],
    ["ci:", "CI/CD 相關變更"],
    ["revert:", "撤銷先前的 commit"],
  ]},
];

export default function CheatsheetPanel({ open, onClose }) {
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(null);
  const panelRef = useRef(null);
  const searchRef = useRef(null);

  /* Focus search on open */
  useEffect(() => {
    if (open) {
      setSearch("");
      setExpanded(null);
      setTimeout(() => searchRef.current?.focus(), 200);
    }
  }, [open]);

  /* ESC to close */
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  /* Click outside to close */
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const copyCmd = (cmd) => {
    navigator.clipboard?.writeText(cmd);
    setCopied(cmd);
    setTimeout(() => setCopied(null), 1200);
  };

  const filtered = search.trim()
    ? CHEATSHEET.map(c => ({
        ...c,
        cmds: c.cmds.filter(([cmd, desc]) =>
          cmd.toLowerCase().includes(search.toLowerCase()) || desc.includes(search)
        ),
      })).filter(c => c.cmds.length > 0)
    : CHEATSHEET;

  if (!open) return null;

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(3px)",
        zIndex: 200,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: 60,
        overflowY: "auto",
      }}
    >
      <div
        ref={panelRef}
        style={{
          width: "100%",
          maxWidth: 640,
          maxHeight: "calc(100vh - 100px)",
          overflowY: "auto",
          background: "#0D1117",
          border: "1px solid rgba(232,200,114,0.2)",
          borderRadius: 16,
          padding: "22px 20px",
          margin: "0 16px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          animation: "panelSlideIn 0.25s ease-out",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>⚡</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, background: "linear-gradient(135deg, #E8C872, #D4A843)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Git 指令速查表
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>
                隨時查閱 · 點擊複製
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              color: "rgba(255,255,255,0.4)",
              fontSize: 13,
              cursor: "pointer",
              padding: "6px 10px",
              fontFamily: "'JetBrains Mono', monospace",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>ESC</span> ✕
          </button>
        </div>

        {/* Search */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          background: "rgba(0,0,0,0.3)",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.08)",
          marginBottom: 16,
        }}>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>🔍</span>
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜尋指令或描述..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "rgba(255,255,255,0.8)",
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 12 }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Categories */}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
            找不到符合「{search}」的指令
          </div>
        )}

        {filtered.map((cat, ci) => {
          const isOpen = expanded === ci || !!search.trim();
          return (
            <div key={ci} style={{ marginBottom: 8 }}>
              <button
                onClick={() => setExpanded(expanded === ci ? null : ci)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  background: isOpen ? `${cat.color}10` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isOpen ? cat.color + "33" : "rgba(255,255,255,0.05)"}`,
                  borderRadius: isOpen ? "10px 10px 0 0" : 10,
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: isOpen ? cat.color : "rgba(255,255,255,0.7)" }}>
                  {cat.title}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {cat.cmds.length} 個指令
                  </span>
                  <span style={{
                    color: "rgba(255,255,255,0.25)",
                    fontSize: 10,
                    transition: "transform 0.2s",
                    transform: isOpen ? "rotate(90deg)" : "rotate(0)",
                  }}>
                    ▶
                  </span>
                </div>
              </button>
              {isOpen && (
                <div style={{
                  border: `1px solid ${cat.color}22`,
                  borderTop: "none",
                  borderRadius: "0 0 10px 10px",
                  overflow: "hidden",
                }}>
                  {cat.cmds.map(([cmd, desc], i) => (
                    <div
                      key={i}
                      onClick={() => copyCmd(cmd)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 14px",
                        background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.025)",
                        borderBottom: i < cat.cmds.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseOver={e => e.currentTarget.style.background = "rgba(232,200,114,0.06)"}
                      onMouseOut={e => e.currentTarget.style.background = i % 2 === 0 ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.025)"}
                    >
                      <code style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 12,
                        color: cat.color,
                        fontWeight: 600,
                        minWidth: 240,
                        flexShrink: 0,
                      }}>
                        {cmd}
                      </code>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", flex: 1 }}>
                        {desc}
                      </span>
                      <span style={{
                        fontSize: 10,
                        color: copied === cmd ? "#10B981" : "rgba(255,255,255,0.15)",
                        fontFamily: "'JetBrains Mono', monospace",
                        flexShrink: 0,
                        transition: "color 0.3s",
                      }}>
                        {copied === cmd ? "已複製 ✓" : "複製"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Footer hint */}
        <div style={{
          marginTop: 12,
          textAlign: "center",
          fontSize: 11,
          color: "rgba(255,255,255,0.2)",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          點擊指令可複製 · 按 ESC 關閉
        </div>
      </div>

      <style>{`
        @keyframes panelSlideIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
