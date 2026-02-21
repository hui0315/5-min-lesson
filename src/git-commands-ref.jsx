import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useChapterNav } from "./chapter-context";
import { colors, lessonThemes, hexToRgba } from "./theme";

/* ══════════════════════════════════════════════
   第八堂：觀念澄清 — 易混淆指令 · 情境決策
   ══════════════════════════════════════════════ */

const { accent: ACCENT, accent2: ACCENT2 } = lessonThemes["/commands-ref"];

const STEPS = [
  /* ──── Step 1: 經典易混淆指令 ──── */
  {
    id: "classic-confusion",
    title: "經典易混淆：三組必懂的對比",
    emoji: "⚖️",
    type: "tripleCompare",
    intro: "學了七堂課，腦子裡一定有很多「等等，這個跟那個差在哪？」的困惑。這一堂課專門解決這些問題。",
    groups: [
      {
        title: "merge vs rebase",
        icon: "🔀",
        color: "#60A5FA",
        items: [
          { cmd: "git merge", desc: "保留分支歷史，建立合併節點", trait: "歷史真實、有分叉", safe: true },
          { cmd: "git rebase", desc: "把 commit 搬到目標頂端，改寫歷史", trait: "歷史乾淨、一條線", safe: false },
        ],
        rule: "已推到遠端且有人在看的分支 → merge。只有自己在用的本地分支 → rebase。",
        diagram: [
          "merge 後：",
          "A─B─C─F─G (main)  ← 保留分叉",
          "    └─D─E─┘",
          "",
          "rebase 後：",
          "A─B─C─F─D'─E' (main)  ← 一條直線",
        ],
      },
      {
        title: "reset vs revert",
        icon: "⏪",
        color: "#EF4444",
        items: [
          { cmd: "git reset", desc: "把分支指標往回移，commit 從歷史消失", trait: "改寫歷史", safe: false },
          { cmd: "git revert", desc: "建立反向 commit，抵銷指定 commit 的改動", trait: "不改寫歷史", safe: true },
        ],
        rule: "還沒 push → reset 安全。已經 push 且別人已 pull → 只能用 revert。",
      },
      {
        title: "fetch vs pull",
        icon: "🔄",
        color: "#F59E0B",
        items: [
          { cmd: "git fetch", desc: "只下載遠端更新，不動你的工作分支", trait: "安全、可預覽", safe: true },
          { cmd: "git pull", desc: "下載 + 自動合併（= fetch + merge）", trait: "方便但可能衝突", safe: false },
        ],
        rule: "不確定遠端改了什麼 → 先 fetch 看看。確定要同步 → pull。",
      },
    ],
    quiz: {
      question: "你的 feature 分支已推到遠端，隊友正在 review PR。develop 有新 commit 需要同步，你應該用？",
      options: [
        { text: "git rebase develop（歷史比較乾淨）", correct: false },
        { text: "git merge develop（不改寫共享歷史）", correct: true },
        { text: "都可以，看心情", correct: false },
      ],
    },
  },

  /* ──── Step 2: 看起來一樣但不一樣 ──── */
  {
    id: "look-alike",
    title: "看起來一樣，其實不一樣",
    emoji: "🔍",
    type: "concept",
    conceptBlocks: [
      {
        title: "checkout vs switch vs restore",
        icon: "🔀",
        color: "#60A5FA",
        desc: "checkout 是 Git 的「瑞士刀」——切分支、還原檔案都用它。但因為一個指令做太多事容易混淆，Git 2.23 把它拆成了 switch（切分支）和 restore（還原檔案）。三者關係：",
        points: [
          "git checkout <branch> ＝ git switch <branch>",
          "git checkout -b <new> ＝ git switch -c <new>",
          "git checkout -- <file> ＝ git restore <file>",
          "💡 新專案建議用 switch + restore，語意更清楚",
        ],
      },
      {
        title: "diff 的三種視角",
        icon: "🔎",
        color: "#10B981",
        desc: "git diff 不加參數只看「工作目錄 vs 暫存區」。加了 --staged 看「暫存區 vs 最新 commit」。加了 HEAD 看「工作目錄 vs 最新 commit」。",
        points: [
          "git diff → 還沒 add 的修改",
          "git diff --staged → 已經 add 但還沒 commit 的",
          "git diff HEAD → 所有修改（不管有沒有 add）",
          "💡 不確定的時候用 git diff HEAD 最全面",
        ],
      },
      {
        title: "log vs reflog",
        icon: "📜",
        color: "#F59E0B",
        desc: "log 顯示 commit 歷史（像公開的日記）。reflog 記錄所有 HEAD 的移動，包括 reset、rebase、checkout 等（像私人監視器）。",
        points: [
          "git log → 「這個分支做了哪些 commit？」",
          "git reflog → 「我的 HEAD 去過哪些地方？」",
          "💡 做壞了想回到之前的狀態？reflog 是你的救命稻草",
        ],
      },
    ],
    quiz: {
      question: "你 add 了一個檔案但還沒 commit，想看看 add 了什麼。應該用？",
      options: [
        { text: "git diff（看還沒 add 的）", correct: false },
        { text: "git diff --staged（看已 add 但未 commit 的）", correct: true },
        { text: "git log（看歷史）", correct: false },
      ],
    },
  },

  /* ──── Step 3: 情境決策樹 ──── */
  {
    id: "decision-tree",
    title: "情境決策：我該用哪個指令？",
    emoji: "🌳",
    type: "decisionTree",
    intro: "Git 的難度不在背指令，而在「什麼情境用什麼指令」。以下是三個最常見的情境，走一遍決策流程。",
    trees: [
      {
        title: "🔙 我想撤銷上一個 commit",
        id: "undo-commit",
        question: "這個 commit 已經 push 到遠端了嗎？",
        options: [
          {
            label: "還沒 push",
            next: "那你的修改還想保留嗎？",
            options: [
              { label: "想保留修改", result: "git reset --soft HEAD~1", explain: "commit 撤銷，修改留在暫存區，可以重新 commit" },
              { label: "全部丟掉", result: "git reset --hard HEAD~1", explain: "⚠️ commit 和修改全部消失，無法復原" },
            ],
          },
          {
            label: "已經 push 了",
            next: "別人已經 pull 了嗎？",
            options: [
              { label: "可能有人已 pull", result: "git revert HEAD", explain: "建立反向 commit，不改寫歷史，安全" },
              { label: "確定只有自己", result: "git reset --soft HEAD~1 + force push", explain: "reset 後用 --force-with-lease 推送" },
            ],
          },
        ],
      },
      {
        title: "🔀 我想把 feature 分支的改動整合到 main",
        id: "integrate-branch",
        question: "這個 feature 分支有別人在用嗎？",
        options: [
          {
            label: "只有自己在用",
            next: "你在意歷史是否是一條直線嗎？",
            options: [
              { label: "想要乾淨的直線歷史", result: "git rebase main（在 feature 上）", explain: "把你的 commit 搬到 main 最新的後面，再 fast-forward merge" },
              { label: "保留就好", result: "git merge feature（在 main 上）", explain: "保留完整的分支歷史" },
            ],
          },
          {
            label: "有別人在用 / 已推到遠端",
            result: "git merge feature（在 main 上）",
            explain: "共享的分支絕不 rebase，因為會改寫歷史",
          },
        ],
      },
      {
        title: "💾 我手上有未完成的修改，需要切到別的分支",
        id: "save-wip",
        question: "修改有完整到可以當一個 commit 嗎？",
        options: [
          {
            label: "還半成品，不值得 commit",
            result: "git stash → 切分支 → 回來後 git stash pop",
            explain: "stash 暫存修改，工作區回到乾淨狀態。回來後 pop 取回",
          },
          {
            label: "可以算一個進度點",
            result: "git commit -m \"wip: ...\" → 切分支 → 回來繼續",
            explain: "WIP commit 也行，之後可以 amend 或 squash 整理",
          },
        ],
      },
    ],
    quiz: {
      question: "你不小心把密碼 commit 並 push 了，隊友已經 pull。你應該？",
      options: [
        { text: "git reset --hard 然後 force push", correct: false },
        { text: "git revert 撤銷，然後立刻更換密碼", correct: true },
        { text: "刪掉整個 repo 重建", correct: false },
      ],
    },
  },

  /* ──── Step 4: 做錯了怎麼辦 ──── */
  {
    id: "git-rescue",
    title: "做錯了怎麼辦？Git 救援指南",
    emoji: "🆘",
    type: "rescue",
    intro: "每個人都會犯錯。重要的是知道怎麼救回來。以下是最常見的「完蛋了」情境和對應的解法。",
    scenarios: [
      {
        title: "Commit message 打錯了",
        icon: "✏️",
        color: "#60A5FA",
        danger: "low",
        condition: "還沒 push",
        solution: "git commit --amend -m \"正確的訊息\"",
        explain: "amend 會修改最近一次 commit 的訊息（和內容）。注意：如果已經 push 了，amend 會改 hash，需要 force push。",
      },
      {
        title: "Commit 了不該 commit 的檔案",
        icon: "📁",
        color: "#F59E0B",
        danger: "medium",
        condition: "還沒 push",
        solution: "git reset --soft HEAD~1\n然後用 .gitignore 排除，再重新 commit",
        explain: "--soft 保留所有修改在暫存區。你可以 git rm --cached <file> 把不該追蹤的檔案移出暫存區。",
      },
      {
        title: "不小心在 main 上寫了程式碼",
        icon: "🌿",
        color: "#10B981",
        danger: "low",
        condition: "還沒 commit",
        solution: "git stash\ngit checkout -b feature/my-work\ngit stash pop",
        explain: "stash 先把修改暫存，切到新分支後再 pop 取回。main 回到乾淨狀態。",
      },
      {
        title: "Push 了機密資料（密碼、API Key）",
        icon: "🔑",
        color: "#EF4444",
        danger: "critical",
        condition: "已經 push",
        solution: "1. 立刻更換密碼 / 撤銷 API Key\n2. git revert 撤銷該 commit\n3. 考慮用 git filter-branch 或 BFG 清除歷史",
        explain: "⚠️ 即使刪除了 commit，GitHub 上的 cache 可能還保留著。第一步永遠是「讓洩漏的憑證失效」，比清除歷史更重要。",
      },
      {
        title: "Reset --hard 後發現刪錯了",
        icon: "😱",
        color: "#EF4444",
        danger: "high",
        condition: "本地操作",
        solution: "git reflog\n找到 reset 前的 commit hash\ngit reset --hard <hash>",
        explain: "reflog 記錄了所有 HEAD 的移動。只要你曾經 commit 過的東西，reflog 通常都能幫你找回來（30 天內）。",
      },
    ],
    quiz: {
      question: "你用 git reset --hard 刪掉了三個 commit，但馬上後悔了。能救回來嗎？",
      options: [
        { text: "不能，reset --hard 是不可逆的", correct: false },
        { text: "可以，用 git reflog 找到之前的 commit hash，再 reset 回去", correct: true },
        { text: "只有備份過才能救", correct: false },
      ],
    },
  },

  /* ──── Step 5: 危險指令認知 ──── */
  {
    id: "dangerous-commands",
    title: "危險指令紅色警戒",
    emoji: "⚠️",
    type: "dangerZone",
    intro: "這些指令功能強大但有破壞力。不是說不能用，而是用之前一定要知道後果。",
    dangers: [
      {
        cmd: "git push --force",
        level: "🔴 高危",
        color: "#EF4444",
        what: "強制覆蓋遠端，不做檢查。可能覆蓋隊友的 commit。",
        instead: "用 git push --force-with-lease 替代",
        when: "幾乎不該直接使用。唯一例外：你是唯一的開發者。",
      },
      {
        cmd: "git reset --hard",
        level: "🔴 高危",
        color: "#EF4444",
        what: "丟棄所有未 commit 的修改 + 撤銷 commit。修改無法復原（除非有 commit 過可以用 reflog）。",
        instead: "先 git stash 保存修改，或用 --soft / --mixed",
        when: "確定要放棄所有修改時。建議先 git status 確認。",
      },
      {
        cmd: "git clean -fd",
        level: "🟠 中高",
        color: "#F59E0B",
        what: "刪除所有未追蹤的檔案和資料夾。不可逆。",
        instead: "先 git clean -n（dry run）預覽會刪什麼",
        when: "確定所有未追蹤的檔案都不需要時。",
      },
      {
        cmd: "git checkout -- <file>",
        level: "🟠 中高",
        color: "#F59E0B",
        what: "丟棄檔案的未暫存修改，回到最新 commit 的狀態。不可逆。",
        instead: "用 git stash 暫存而不是丟棄",
        when: "確定那個檔案的修改全部不要了。",
      },
      {
        cmd: "git rebase（對共享分支）",
        level: "🟡 看情境",
        color: "#F59E0B",
        what: "改寫 commit hash，導致隊友的本地歷史與遠端不一致。",
        instead: "對共享分支用 git merge",
        when: "只在個人的本地 feature 分支上使用。",
      },
    ],
    quiz: {
      question: "你想清除工作目錄裡的未追蹤檔案，最安全的做法是？",
      options: [
        { text: "直接 git clean -fd", correct: false },
        { text: "先 git clean -n 預覽，確認後再 git clean -fd", correct: true },
        { text: "git reset --hard", correct: false },
      ],
    },
  },

  /* ──── Step 6: 綜合情境 Quiz ──── */
  {
    id: "final-quiz",
    title: "綜合情境挑戰",
    emoji: "🏆",
    type: "multiQuiz",
    intro: "來測試你對這堂課的理解。每一題都是真實會遇到的情境。",
    quizzes: [
      {
        question: "隊友說他在 feature/payment 分支上推了一個 commit，你想先看看他改了什麼再決定要不要合併。你該怎麼做？",
        options: [
          { text: "git pull origin feature/payment", correct: false },
          { text: "git fetch origin → git log origin/feature/payment → 看完後再決定", correct: true },
          { text: "git merge origin/feature/payment", correct: false },
        ],
        explanation: "fetch 只下載不合併，讓你先用 log 或 diff 預覽。pull 會直接合併到你的分支。",
      },
      {
        question: "你在 feature 分支上做了 5 個 commit，想發 PR 前讓歷史更乾淨。這個分支只有你在用，還沒推到遠端。你該怎麼做？",
        options: [
          { text: "git rebase -i HEAD~5 做 interactive rebase，合併和整理 commit", correct: true },
          { text: "git merge --squash 把所有 commit 壓成一個", correct: false },
          { text: "不用管，PR 合併時 GitHub 會幫你 squash", correct: false },
        ],
        explanation: "Interactive rebase 讓你可以 squash、reword、reorder commit。因為還沒推到遠端，改寫歷史是安全的。",
      },
      {
        question: "你 commit 了一半，突然接到電話要你緊急修另一個 bug。你的修改還不完整。最佳做法？",
        options: [
          { text: "先 commit -m \"wip\" 然後切分支", correct: false },
          { text: "git stash → git checkout hotfix/urgent-bug → 修完後回來 stash pop", correct: true },
          { text: "直接 checkout 切分支，Git 會幫你處理", correct: false },
        ],
        explanation: "stash 專門為這個場景設計：暫存未完成的修改，讓你乾淨地切到其他分支工作。",
      },
      {
        question: "你發現線上有 bug，但最近兩週有 60 個 commit，不確定是哪個 commit 引入的。最有效的方法？",
        options: [
          { text: "git log 一個一個看", correct: false },
          { text: "git bisect 用二分搜尋法定位", correct: true },
          { text: "全部 revert 後一個一個加回來", correct: false },
        ],
        explanation: "bisect 只需約 6 次測試（log₂60 ≈ 6）就能找到第一個引入 bug 的 commit。",
      },
      {
        question: "你用 git reset --hard HEAD~3 後才發現第二個 commit 裡有重要程式碼。怎麼救？",
        options: [
          { text: "沒辦法了，--hard 是不可逆的", correct: false },
          { text: "git reflog 找到那個 commit 的 hash，然後 git cherry-pick 或 reset 回去", correct: true },
          { text: "只能從 GitHub 重新 clone", correct: false },
        ],
        explanation: "reflog 記錄了所有 HEAD 移動。只要曾經 commit 過，30 天內都能透過 reflog 找回。",
      },
    ],
    quiz: null, /* this step uses multiQuiz instead */
  },
];

/* ── Shared Components ── */
function CommandInput({ command, onComplete }) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("typing");
  const [showHint, setShowHint] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => { setInput(""); setStatus("typing"); setShowHint(false); setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 100); }, [command.answer]);

  const normalize = (s) => s.trim().replace(/\s+/g, " ").replace(/[""'']/g, c => c === "\u201C" || c === "\u201D" ? '"' : c === "\u2018" || c === "\u2019" ? "'" : c);

  const checkAnswer = () => {
    const n = normalize(input), e = normalize(command.answer);
    if (command.flexible) { const p = e.split('"')[0].split("'")[0].trim(); if (n.startsWith(normalize(p)) && (n.includes('"') || n.includes("'"))) { setStatus("correct"); setTimeout(onComplete, 700); return; } }
    if (n === e) { setStatus("correct"); setTimeout(onComplete, 700); } else { setStatus("wrong"); setShakeKey(k => k + 1); setTimeout(() => setStatus("typing"), 1200); }
  };

  const exp = command.answer;
  const cc = (i) => status !== "typing" || i >= input.length ? "rgba(255,255,255,0.1)" : input[i] === exp[i] ? "#10B981" : "#EF4444";
  const bc = status === "correct" ? "#10B981" : status === "wrong" ? "#EF4444" : "rgba(255,255,255,0.12)";

  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 8, display: "flex", gap: 8, lineHeight: 1.6 }}>
        <span style={{ color: ACCENT, fontWeight: 700, flexShrink: 0 }}>▸</span><span>{command.prompt}</span>
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, height: 16, overflow: "hidden", marginBottom: 4, marginLeft: 24 }}>
        {status === "typing" && exp.split("").map((ch, i) => <span key={i} style={{ color: cc(i) }}>{ch}</span>)}
      </div>
      <div key={shakeKey} style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.3)", border: `1.5px solid ${bc}`, borderRadius: 8, padding: "0 12px", marginLeft: 24, transition: "border-color 0.3s", animation: status === "wrong" ? "shake 0.4s ease" : "none" }}>
        <span style={{ color: ACCENT, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, marginRight: 8 }}>$</span>
        <input ref={inputRef} value={input} onChange={e => status === "typing" && setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && input.trim() && checkAnswer()} disabled={status === "correct"} placeholder="輸入指令..." autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: status === "correct" ? "#10B981" : status === "wrong" ? "#EF4444" : ACCENT, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, padding: "11px 0", caretColor: ACCENT }} />
        {status === "correct" && <span style={{ color: "#10B981", fontSize: 14 }}>✓</span>}
        {status === "wrong" && <span style={{ color: "#EF4444", fontSize: 11 }}>再試一次</span>}
      </div>
      {status === "typing" && <button onClick={() => setShowHint(!showHint)} style={{ marginTop: 4, marginLeft: 24, background: "none", border: "none", color: "rgba(255,255,255,0.22)", fontSize: 11, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>{showHint ? "隱藏提示" : "💡 提示"}</button>}
      {showHint && status === "typing" && <div style={{ marginTop: 2, marginLeft: 24, fontSize: 11.5, color: hexToRgba(ACCENT, 0.533), fontStyle: "italic" }}>{command.hint}</div>}
    </div>
  );
}

function Quiz({ quiz, onComplete }) {
  const [sel, setSel] = useState(null);
  const pick = (i) => { if (sel !== null) return; setSel(i); if (quiz.options[i].correct) setTimeout(onComplete, 700); };
  return (
    <div style={{ margin: "20px 0 0", padding: "18px", background: hexToRgba(ACCENT, 0.04), borderRadius: 12, border: `1px solid ${hexToRgba(ACCENT, 0.12)}` }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: ACCENT, marginBottom: 12 }}>💡 觀念確認</div>
      <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.85)", marginBottom: 12, lineHeight: 1.6 }}>{quiz.question}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {quiz.options.map((o, i) => {
          let bg = "rgba(255,255,255,0.03)", bc = "rgba(255,255,255,0.06)", tc = "rgba(255,255,255,0.65)";
          if (sel === i) { if (o.correct) { bg="rgba(16,185,129,0.12)"; bc="#10B981"; tc="#10B981"; } else { bg="rgba(239,68,68,0.12)"; bc="#EF4444"; tc="#EF4444"; } }
          else if (sel !== null && o.correct) { bg="rgba(16,185,129,0.08)"; bc="#10B981"; tc="#10B981"; }
          return <button key={i} onClick={() => pick(i)} style={{ padding: "11px 14px", background: bg, border: `1px solid ${bc}`, borderRadius: 8, color: tc, fontSize: 13, textAlign: "left", cursor: sel !== null ? "default" : "pointer", transition: "all 0.3s", fontFamily: "inherit", lineHeight: 1.5 }}>{o.text}</button>;
        })}
      </div>
      {sel !== null && !quiz.options[sel].correct && <div style={{ marginTop: 10, fontSize: 11.5, color: "rgba(239,68,68,0.7)" }}>正確答案已用綠色標示 ✨</div>}
      {sel !== null && quiz.options[sel].correct && <div style={{ marginTop: 10, fontSize: 11.5, color: "#10B981", fontWeight: 600 }}>✅ 正確！</div>}
    </div>
  );
}

/* ── Triple Compare (Step 1) ── */
function TripleCompare({ groups }) {
  const [active, setActive] = useState(0);
  const g = groups[active];

  return (
    <div style={{ margin: "16px 0" }}>
      {/* Tab buttons */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {groups.map((gr, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            flex: 1, padding: "10px 8px", textAlign: "center",
            background: active === i ? `${gr.color}15` : "rgba(255,255,255,0.02)",
            border: `1.5px solid ${active === i ? gr.color + "55" : "rgba(255,255,255,0.06)"}`,
            borderRadius: 10, cursor: "pointer", transition: "all 0.3s",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: active === i ? gr.color : "rgba(255,255,255,0.5)" }}>{gr.icon} {gr.title}</div>
          </button>
        ))}
      </div>

      {/* Compare cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        {g.items.map((item, i) => (
          <div key={i} style={{
            background: `${g.color}08`, border: `1px solid ${g.color}22`, borderRadius: 12, padding: "16px 14px",
          }}>
            <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: g.color, fontWeight: 700 }}>{item.cmd}</code>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: "8px 0" }}>{item.desc}</div>
            <div style={{ fontSize: 11.5, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                padding: "2px 8px", borderRadius: 4, fontSize: 10.5, fontWeight: 700,
                background: item.safe ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                color: item.safe ? "#10B981" : "#EF4444",
              }}>
                {item.safe ? "安全" : "改寫歷史"}
              </span>
              <span style={{ color: "rgba(255,255,255,0.35)" }}>{item.trait}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Diagram (if exists) */}
      {g.diagram && (
        <div style={{ background: "#060A10", borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 12 }}>
          {g.diagram.map((line, i) => (
            <div key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: line ? `${g.color}99` : "transparent", lineHeight: 1.6 }}>{line || " "}</div>
          ))}
        </div>
      )}

      {/* Golden rule */}
      <div style={{
        padding: "14px 16px", background: hexToRgba(ACCENT, 0.06), borderRadius: 10,
        border: `1px solid ${hexToRgba(ACCENT, 0.15)}`, textAlign: "center",
      }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: ACCENT, marginBottom: 4 }}>🏆 口訣</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>{g.rule}</div>
      </div>
    </div>
  );
}

/* ── Decision Tree (Step 3) ── */
function DecisionTree({ trees }) {
  const [activeTree, setActiveTree] = useState(0);
  const [path, setPath] = useState([]);
  const tree = trees[activeTree];

  const reset = (idx) => { setActiveTree(idx); setPath([]); };

  const selectOption = (level, optIdx) => {
    setPath(prev => {
      const next = [...prev.slice(0, level)];
      next.push(optIdx);
      return next;
    });
  };

  /* Navigate the tree based on path */
  const renderTree = () => {
    let current = { question: tree.question, options: tree.options };
    const nodes = [{ ...current, level: 0 }];

    for (let i = 0; i < path.length; i++) {
      const chosen = current.options[path[i]];
      if (chosen.result) {
        nodes.push({ result: chosen.result, explain: chosen.explain, label: chosen.label, level: i + 1 });
        break;
      }
      if (chosen.next) {
        current = { question: chosen.next, options: chosen.options };
        nodes.push({ ...current, label: chosen.label, level: i + 1 });
      }
    }

    return nodes;
  };

  const nodes = renderTree();

  return (
    <div style={{ margin: "16px 0" }}>
      {/* Tree selector */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
        {trees.map((t, i) => (
          <button key={i} onClick={() => reset(i)} style={{
            padding: "12px 14px", textAlign: "left",
            background: activeTree === i ? hexToRgba(ACCENT, 0.08) : "rgba(255,255,255,0.02)",
            border: `1.5px solid ${activeTree === i ? hexToRgba(ACCENT, 0.3) : "rgba(255,255,255,0.06)"}`,
            borderRadius: 10, cursor: "pointer", transition: "all 0.3s",
            fontSize: 13.5, fontWeight: activeTree === i ? 700 : 500,
            color: activeTree === i ? ACCENT : "rgba(255,255,255,0.6)",
          }}>
            {t.title}
          </button>
        ))}
      </div>

      {/* Decision flow */}
      <div style={{ padding: "16px", background: "rgba(0,0,0,0.2)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
        {nodes.map((node, ni) => (
          <div key={ni} style={{ marginBottom: ni < nodes.length - 1 ? 16 : 0 }}>
            {/* Chosen label */}
            {node.label && (
              <div style={{
                display: "inline-block", padding: "3px 10px", background: hexToRgba(ACCENT, 0.1),
                borderRadius: 6, fontSize: 11.5, color: ACCENT, fontWeight: 600, marginBottom: 8,
              }}>
                ✓ {node.label}
              </div>
            )}

            {/* Question node */}
            {node.question && (
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 10, lineHeight: 1.6 }}>
                  {node.question}
                </div>
                {path.length <= node.level && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {node.options.map((opt, oi) => (
                      <button key={oi} onClick={() => selectOption(node.level, oi)} style={{
                        padding: "10px 16px", background: hexToRgba(ACCENT, 0.06),
                        border: `1.5px solid ${hexToRgba(ACCENT, 0.2)}`, borderRadius: 8,
                        color: ACCENT, fontSize: 13, fontWeight: 600, cursor: "pointer",
                        transition: "all 0.2s", flex: 1, minWidth: 140, textAlign: "center",
                      }}
                        onMouseOver={e => { e.currentTarget.style.background = hexToRgba(ACCENT, 0.12); e.currentTarget.style.borderColor = hexToRgba(ACCENT, 0.4); }}
                        onMouseOut={e => { e.currentTarget.style.background = hexToRgba(ACCENT, 0.06); e.currentTarget.style.borderColor = hexToRgba(ACCENT, 0.2); }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Result node */}
            {node.result && (
              <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#10B981", marginBottom: 6 }}>✅ 建議做法</div>
                <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: ACCENT, fontWeight: 600, display: "block", whiteSpace: "pre-wrap", lineHeight: 1.6, marginBottom: 8 }}>
                  {node.result}
                </code>
                <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{node.explain}</div>
                <button onClick={() => setPath([])} style={{
                  marginTop: 10, padding: "6px 14px", background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6,
                  color: "rgba(255,255,255,0.4)", fontSize: 11.5, cursor: "pointer", fontFamily: "inherit",
                }}>
                  🔄 再走一次
                </button>
              </div>
            )}

            {/* Connector line */}
            {ni < nodes.length - 1 && (
              <div style={{ width: 2, height: 16, background: hexToRgba(ACCENT, 0.15), marginLeft: 20, marginTop: 8 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Rescue Guide (Step 4) ── */
function RescueGuide({ scenarios }) {
  const [expanded, setExpanded] = useState(null);
  const dangerColors = { low: "#60A5FA", medium: "#F59E0B", high: "#EF4444", critical: "#EF4444" };
  const dangerLabels = { low: "容易修復", medium: "需要注意", high: "有風險", critical: "緊急處理" };

  return (
    <div style={{ margin: "16px 0", display: "flex", flexDirection: "column", gap: 8 }}>
      {scenarios.map((s, i) => (
        <div key={i} style={{
          background: expanded === i ? `${s.color}08` : "rgba(255,255,255,0.02)",
          border: `1px solid ${expanded === i ? s.color + "33" : "rgba(255,255,255,0.06)"}`,
          borderRadius: 12, overflow: "hidden", transition: "all 0.3s",
        }}>
          <button onClick={() => setExpanded(expanded === i ? null : i)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
            background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
          }}>
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: expanded === i ? s.color : "rgba(255,255,255,0.75)" }}>
                {s.title}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                前提：{s.condition}
              </div>
            </div>
            <span style={{
              padding: "3px 10px", borderRadius: 6, fontSize: 10.5, fontWeight: 700,
              background: `${dangerColors[s.danger]}15`, color: dangerColors[s.danger],
            }}>
              {dangerLabels[s.danger]}
            </span>
            <span style={{
              color: "rgba(255,255,255,0.25)", fontSize: 10, transition: "transform 0.2s",
              transform: expanded === i ? "rotate(90deg)" : "rotate(0)",
            }}>▶</span>
          </button>

          {expanded === i && (
            <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#10B981", marginBottom: 6 }}>解法：</div>
                <code style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: ACCENT,
                  display: "block", whiteSpace: "pre-wrap", lineHeight: 1.6,
                  background: "rgba(0,0,0,0.3)", padding: "10px 14px", borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  {s.solution}
                </code>
              </div>
              <div style={{ marginTop: 10, fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
                {s.explain}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Danger Zone (Step 5) ── */
function DangerZone({ dangers }) {
  return (
    <div style={{ margin: "16px 0", display: "flex", flexDirection: "column", gap: 10 }}>
      {dangers.map((d, i) => (
        <div key={i} style={{
          background: `${d.color}06`, border: `1px solid ${d.color}22`,
          borderRadius: 12, padding: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: d.color, fontWeight: 700 }}>{d.cmd}</code>
            <span style={{
              padding: "2px 8px", borderRadius: 4, fontSize: 10.5, fontWeight: 700,
              background: `${d.color}15`, color: d.color,
            }}>
              {d.level}
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 8 }}>{d.what}</div>
          <div style={{ fontSize: 12, lineHeight: 1.7 }}>
            <span style={{ fontWeight: 700, color: "#10B981" }}>✅ 替代方案：</span>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>{d.instead}</span>
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.7, marginTop: 4 }}>
            <span style={{ fontWeight: 700, color: "#F59E0B" }}>📌 適用時機：</span>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>{d.when}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Multi Quiz (Step 6) ── */
function MultiQuiz({ quizzes, onAllComplete }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);

  const handlePick = (qIdx, optIdx) => {
    if (answers[qIdx] !== undefined) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
    if (quizzes[qIdx].options[optIdx].correct) setScore(s => s + 1);
  };

  const allDone = Object.keys(answers).length === quizzes.length;

  useEffect(() => {
    if (allDone) setTimeout(() => onAllComplete?.(score), 500);
  }, [allDone, score, onAllComplete]);

  const q = quizzes[current];

  return (
    <div style={{ margin: "16px 0" }}>
      {/* Progress */}
      <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 16 }}>
        {quizzes.map((_, i) => (
          <div key={i} onClick={() => setCurrent(i)} style={{
            flex: 1, height: 4, borderRadius: 2, cursor: "pointer",
            background: answers[i] !== undefined
              ? (quizzes[i].options[answers[i]].correct ? "#10B981" : "#EF4444")
              : i === current ? ACCENT : "rgba(255,255,255,0.06)",
            transition: "background 0.4s",
          }} />
        ))}
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginLeft: 8, fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap" }}>
          {current + 1}/{quizzes.length}
        </span>
      </div>

      {/* Question */}
      <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 14, lineHeight: 1.7 }}>
        {q.question}
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 12 }}>
        {q.options.map((o, oi) => {
          const sel = answers[current];
          let bg = "rgba(255,255,255,0.03)", bc = "rgba(255,255,255,0.06)", tc = "rgba(255,255,255,0.65)";
          if (sel !== undefined) {
            if (sel === oi) {
              if (o.correct) { bg = "rgba(16,185,129,0.12)"; bc = "#10B981"; tc = "#10B981"; }
              else { bg = "rgba(239,68,68,0.12)"; bc = "#EF4444"; tc = "#EF4444"; }
            } else if (o.correct) { bg = "rgba(16,185,129,0.08)"; bc = "#10B981"; tc = "#10B981"; }
          }
          return (
            <button key={oi} onClick={() => handlePick(current, oi)} style={{
              padding: "11px 14px", background: bg, border: `1px solid ${bc}`, borderRadius: 8,
              color: tc, fontSize: 13, textAlign: "left", cursor: sel !== undefined ? "default" : "pointer",
              transition: "all 0.3s", fontFamily: "inherit", lineHeight: 1.5,
            }}>
              {o.text}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {answers[current] !== undefined && q.explanation && (
        <div style={{ padding: "12px 14px", background: hexToRgba(ACCENT, 0.04), borderRadius: 8, border: `1px solid ${hexToRgba(ACCENT, 0.12)}`, fontSize: 12.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 12 }}>
          <span style={{ fontWeight: 700, color: ACCENT }}>💡 解說：</span>{q.explanation}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        {current > 0 ? (
          <button onClick={() => setCurrent(c => c - 1)} style={{ padding: "8px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}>← 上一題</button>
        ) : <div />}
        {current < quizzes.length - 1 ? (
          <button onClick={() => setCurrent(c => c + 1)} style={{ padding: "8px 18px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, border: "none", borderRadius: 8, color: colors.bg, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>下一題 →</button>
        ) : <div />}
      </div>

      {/* Final score */}
      {allDone && (
        <div style={{ marginTop: 16, textAlign: "center", padding: "18px", background: hexToRgba(ACCENT, 0.08), border: `1px solid ${hexToRgba(ACCENT, 0.2)}`, borderRadius: 12 }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🎯</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: ACCENT }}>{score}/{quizzes.length} 答對</div>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
            {score === quizzes.length ? "滿分！你已經掌握了所有觀念 🏆" : score >= 3 ? "不錯！大部分觀念都理解了 👍" : "可以回去複習一下前面的課程 💪"}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Concept Page ── */
function ConceptPage({ step }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "16px 0" }}>
        {step.conceptBlocks.map((b, i) => (
          <div key={i} style={{ background: `${b.color}08`, border: `1px solid ${b.color}20`, borderRadius: 12, padding: "18px 16px" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{b.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: b.color, marginBottom: 8 }}>{b.title}</div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 12 }}>{b.desc}</div>
            {b.points && b.points.map((p, j) => <div key={j} style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 4, lineHeight: 1.6 }}>{p}</div>)}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ── */
export default function GitCommandsRef() {
  const [cur, setCur] = useState(0);
  useEffect(() => { window.scrollTo(0, 0); }, [cur]);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [quizDone, setQuizDone] = useState({});
  const [score, setScore] = useState(0);
  const navigate = useNavigate();
  const { prevPath, nextPath } = useChapterNav();
  const step = STEPS[cur], total = STEPS.length;

  const handleQuizDone = () => {
    if (!quizDone[cur]) { setQuizDone(p => ({ ...p, [cur]: true })); setScore(s => s + 1); }
  };

  return (
    <div style={{ minHeight: "100%", background: colors.bgDeep, color: colors.text, fontFamily: "'Noto Sans TC', 'Segoe UI', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 24px" }}>
      <div style={{ width: "100%", maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: colors.bg, fontFamily: "'JetBrains Mono', monospace" }}>8</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>觀念澄清：易混淆指令與情境決策</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Git 課程系列 · 第八堂</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: ACCENT, fontFamily: "'JetBrains Mono', monospace", background: hexToRgba(ACCENT, 0.08), padding: "4px 10px", borderRadius: 6 }}>⭐ {score}/{total}</div>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 28 }}>
          {STEPS.map((_, i) => (
            <div key={i} onClick={() => setCur(i)} style={{
              flex: 1, height: 4, borderRadius: 2, cursor: "pointer",
              background: i <= cur ? `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})` : "rgba(255,255,255,0.06)",
              transition: "background 0.4s",
            }} />
          ))}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginLeft: 8, fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap" }}>{cur + 1}/{total}</span>
        </div>

        {/* Content */}
        <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "26px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>{step.emoji}</span>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{step.title}</h2>
          </div>

          {/* Intro text */}
          {step.intro && (
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, marginBottom: 16 }}>{step.intro}</div>
          )}

          {/* Step type renderers */}
          {step.type === "tripleCompare" && <TripleCompare groups={step.groups} />}
          {step.type === "concept" && <ConceptPage step={step} />}
          {step.type === "decisionTree" && <DecisionTree trees={step.trees} />}
          {step.type === "rescue" && <RescueGuide scenarios={step.scenarios} />}
          {step.type === "dangerZone" && <DangerZone dangers={step.dangers} />}
          {step.type === "multiQuiz" && <MultiQuiz quizzes={step.quizzes} onAllComplete={(s) => { if (!quizDone[cur]) { setQuizDone(p => ({ ...p, [cur]: true })); setScore(sc => sc + 1); } }} />}

          {/* Quiz (for non-multiQuiz steps) */}
          {step.quiz && <Quiz key={`q-${cur}`} quiz={step.quiz} onComplete={handleQuizDone} />}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 12 }}>
          {cur === 0 ? (
            prevPath ? <button onClick={() => navigate(prevPath)} style={{ padding: "12px 24px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← 上一章</button> : <div />
          ) : (
            <button onClick={() => setCur(s => s - 1)} style={{ padding: "12px 24px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← 上一課</button>
          )}
          {cur === total - 1 ? (
            nextPath ? <button onClick={() => navigate(nextPath)} style={{ padding: "12px 24px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, border: "none", borderRadius: 10, color: colors.bg, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>下一章 →</button> : <div />
          ) : (
            <button onClick={() => setCur(s => s + 1)} style={{ padding: "12px 24px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, border: "none", borderRadius: 10, color: colors.bg, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>下一課 →</button>
          )}
        </div>

        {/* Completion celebration */}
        {cur === total - 1 && quizDone[cur] && (
          <div style={{ marginTop: 24, textAlign: "center", padding: "24px", background: hexToRgba(ACCENT, 0.08), border: `1px solid ${hexToRgba(ACCENT, 0.22)}`, borderRadius: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: ACCENT, marginBottom: 6 }}>觀念澄清完成！</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>你已掌握易混淆指令、情境決策、和 Git 救援技巧。<br />接下來進入總複習！</div>
          </div>
        )}
      </div>
    </div>
  );
}
