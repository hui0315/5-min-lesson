import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useChapterNav } from "./chapter-context";
import { colors, lessonThemes, hexToRgba } from "./theme";

const { accent: ACCENT, accent2: ACCENT2 } = lessonThemes["/collaboration"];

/* ══════════════════════════════════════════════
   團隊協作：遠端與協作基礎
   ══════════════════════════════════════════════ */

const STEPS = [
  {
    id: "remote-concept",
    title: "本地 vs 遠端：兩個世界的橋樑",
    emoji: "🌐",
    type: "concept",
    conceptBlocks: [
      {
        title: "什麼是遠端儲存庫？",
        color: "#3B82F6",
        content: "到目前為止，你學的 add、commit、branch 都是「本地操作」——全部在你自己的電腦上。但團隊協作需要一個共用的地方存放程式碼，這就是遠端儲存庫（Remote Repository）。",
      },
      {
        title: "GitHub / GitLab / Bitbucket",
        color: ACCENT,
        content: "這些平台提供遠端儲存庫的託管服務。Git 是工具，它們是存放 Git 儲存庫的「雲端空間」。就像 Word 是工具，Google Drive 是存放文件的地方。",
      },
    ],
    diagram: {
      local: ["工作目錄", "暫存區", "本地儲存庫"],
      bridge: ["git push →", "← git fetch/pull"],
      remote: ["遠端儲存庫 (origin)"],
    },
    explanation: "你的電腦有完整的三個空間（工作目錄、暫存區、本地儲存庫），遠端儲存庫是另一個獨立的儲存庫。push 把本地的 commit 送上去，fetch/pull 把遠端的更新拉下來。",
    quiz: {
      question: "Git 和 GitHub 的關係最像下列哪一組？",
      options: [
        { text: "Chrome 和 Google", correct: false },
        { text: "Word 和 Google Drive", correct: true },
        { text: "iOS 和 iPhone", correct: false },
      ],
    },
  },
  {
    id: "clone-remote",
    title: "連接遠端：clone 與 remote",
    emoji: "🔗",
    type: "scenario",
    story: "你要開始參與一個已經存在的團隊專案。第一步是把遠端的程式碼複製到你的電腦上，並了解本地與遠端的連結關係。",
    tip: "clone 不只是下載程式碼，它會自動設定一個叫 origin 的遠端連結，指向你 clone 的來源。origin 只是一個慣用名稱，你可以改成任何名字，但業界幾乎都用 origin。",
    commands: [
      { prompt: "把遠端專案複製到本地", answer: "git clone https://github.com/team/app.git", output: "Cloning into 'app'...\nresolving deltas: 100% (856/856), done.", hint: "clone + 遠端 URL" },
      { prompt: "進入專案目錄", answer: "cd app", output: "", hint: "cd + 目錄名", notGit: true },
      { prompt: "查看目前設定了哪些遠端連結", answer: "git remote -v", output: "origin  https://github.com/team/app.git (fetch)\norigin  https://github.com/team/app.git (push)", hint: "remote -v 顯示遠端詳情" },
    ],
    quiz: {
      question: "git clone 做了哪些事？",
      options: [
        { text: "只下載最新版本的檔案", correct: false },
        { text: "下載完整的儲存庫（含所有歷史），並自動設定 origin 遠端連結", correct: true },
        { text: "在 GitHub 上建立一個新的儲存庫", correct: false },
      ],
    },
  },
  {
    id: "fetch-vs-pull",
    title: "取得更新：fetch vs pull",
    emoji: "📡",
    type: "concept",
    conceptBlocks: [
      {
        title: "git fetch — 「先看看有什麼更新」",
        color: "#3B82F6",
        content: "fetch 會從遠端下載最新的 commit 和分支資訊，但不會動你的工作目錄。你可以先檢查更新內容，再決定是否合併。安全、不會破壞你正在做的事。",
      },
      {
        title: "git pull — 「直接拿來合併」",
        color: "#10B981",
        content: "pull = fetch + merge。它會下載遠端更新，並且立刻嘗試合併到你目前的分支。方便但有風險：如果你有未提交的修改，可能會產生衝突。",
      },
      {
        title: "💡 實務建議",
        color: "#F59E0B",
        content: "新手建議先養成 fetch → 檢查 → merge 的習慣，等熟練後再用 pull 加速流程。很多資深工程師也偏好 fetch + rebase 來保持歷史乾淨。",
      },
    ],
    scenario: true,
    story: "你在本地開發了一陣子，想確認隊友有沒有推新的 commit 上去。你決定先用安全的方式檢查，再手動合併。",
    tip: "fetch 之後，遠端的分支會以 origin/分支名 的形式存在你的本地。例如 origin/main 就是遠端 main 的最新狀態。你可以用 git log 比較本地和遠端的差異。",
    commands: [
      { prompt: "從遠端取得最新資訊（不合併）", answer: "git fetch origin", output: "remote: Counting objects: 12, done.\nFrom https://github.com/team/app\n   a1b2c3d..e4f5g6h  main -> origin/main", hint: "fetch origin" },
      { prompt: "比較本地 main 和遠端 main 的差異", answer: "git log main..origin/main --oneline", output: "e4f5g6h feat: add notification system\nd3c2b1a fix: correct timezone offset", hint: "log 本地..遠端 --oneline" },
      { prompt: "確認沒問題後，合併遠端更新", answer: "git merge origin/main", output: "Updating a1b2c3d..e4f5g6h\nFast-forward\n notify.js | 42 ++++++\n utils.js  |  3 +-", hint: "merge origin/main" },
    ],
    quiz: {
      question: "git pull 等於哪兩個指令的組合？",
      options: [
        { text: "git clone + git merge", correct: false },
        { text: "git fetch + git merge", correct: true },
        { text: "git fetch + git rebase", correct: false },
      ],
    },
  },
  {
    id: "remote-branches",
    title: "遠端分支：追蹤與管理",
    emoji: "🛤️",
    type: "scenario",
    story: "隊友在遠端建了一個新的分支正在開發。你需要查看所有分支（包含遠端的），然後在本地建立對應的分支來協作。",
    tip: "git branch 只顯示本地分支，加上 -a 才會顯示遠端分支。遠端分支的格式是 remotes/origin/分支名。當你用 checkout 切換到遠端分支時，Git 會自動建立一個「追蹤分支」，本地分支會自動關聯到對應的遠端分支。",
    commands: [
      { prompt: "查看所有分支（包含遠端）", answer: "git branch -a", output: "* main\n  remotes/origin/main\n  remotes/origin/develop\n  remotes/origin/feature/payment", hint: "branch -a 列出所有分支" },
      { prompt: "切換到隊友的遠端分支（自動建立本地追蹤分支）", answer: "git checkout feature/payment", output: "Branch 'feature/payment' set up to track remote branch 'feature/payment' from 'origin'.\nSwitched to a new branch 'feature/payment'", hint: "直接 checkout 遠端分支名" },
      { prompt: "確認你的本地分支正在追蹤遠端分支", answer: "git branch -vv", output: "  main              a1b2c3d [origin/main] init project\n* feature/payment   h7i8j9k [origin/feature/payment] feat: payment form", hint: "branch -vv 顯示追蹤資訊" },
    ],
    quiz: {
      question: "git branch -a 中 remotes/origin/develop 代表什麼？",
      options: [
        { text: "你本地的 develop 分支", correct: false },
        { text: "遠端 origin 上的 develop 分支在本地的參照", correct: true },
        { text: "一個已經被刪除的分支", correct: false },
      ],
    },
  },
  {
    id: "branch-advanced",
    title: "分支進階：從指定分支建立與刪除",
    emoji: "🌿",
    type: "scenario",
    story: "你需要從 develop 分支（而不是 main）建立新的功能分支開發，完成後還要清理不再需要的舊分支。",
    tip: "git checkout -b A B 的意思是「以 B 為基礎，建立新分支 A 並切換過去」。如果不指定 B，預設是以你目前所在的分支為基礎。團隊通常會規定 feature 分支從 develop 建立，hotfix 從 main 建立。",
    commands: [
      { prompt: "從 develop 建立新的 feature 分支並切換", answer: "git checkout -b feature/cart develop", output: "Switched to a new branch 'feature/cart'", hint: "checkout -b 新分支 來源分支" },
      { prompt: "確認你在新分支上", answer: "git branch", output: "  main\n  develop\n* feature/cart\n  feature/payment", hint: "branch 查看本地分支" },
      { prompt: "刪除已經合併完成的本地分支", answer: "git branch -d feature/payment", output: "Deleted branch feature/payment (was h7i8j9k).", hint: "branch -d 分支名 刪除" },
      { prompt: "也刪除遠端上的舊分支", answer: "git push origin --delete feature/payment", output: "To https://github.com/team/app.git\n - [deleted]  feature/payment", hint: "push origin --delete 分支名" },
    ],
    quiz: {
      question: "git checkout -b feature/x develop 做了什麼？",
      options: [
        { text: "把 develop 分支改名為 feature/x", correct: false },
        { text: "以 develop 為基礎建立 feature/x 並切換到該分支", correct: true },
        { text: "把 feature/x 合併到 develop", correct: false },
      ],
    },
  },
  {
    id: "push-workflow",
    title: "推送到遠端：push 完整流程",
    emoji: "🚀",
    type: "scenario",
    story: "你在本地完成了一個功能的開發，現在要把修改推送到遠端讓團隊看到。這是你每天最常做的操作。",
    tip: "第一次推送新分支時，遠端還不存在這個分支，所以需要用 -u（或 --set-upstream）告訴 Git 建立追蹤關係。之後再推送同一個分支，只要 git push 就夠了。commit -am 是 -a（自動加入已追蹤檔案）和 -m（訊息）的組合，注意它不會加入全新的未追蹤檔案。",
    commands: [
      { prompt: "查看目前有哪些修改", answer: "git status", output: "On branch feature/cart\nChanges not staged for commit:\n  modified: cart.js\n  modified: cart.test.js", hint: "status 查看狀態" },
      { prompt: "用快捷方式同時加入已追蹤檔案並提交", answer: "git commit -am \"feat: add shopping cart\"", output: "[feature/cart m1n2o3p] feat: add shopping cart\n 2 files changed, 89 insertions(+), 3 deletions(-)", hint: "commit -am 同時 add + commit", flexible: true },
      { prompt: "第一次推送新分支到遠端（設定追蹤）", answer: "git push -u origin feature/cart", output: "Enumerating objects: 6, done.\n * [new branch] feature/cart -> feature/cart\nBranch 'feature/cart' set up to track remote branch 'feature/cart' from 'origin'.", hint: "push -u origin 分支名" },
      { prompt: "之後再推送同一分支（簡短寫法）", answer: "git push", output: "Everything up-to-date", hint: "設定追蹤後直接 push 即可" },
    ],
    quiz: {
      question: "git commit -am 和 git add . + git commit -m 的差異是？",
      options: [
        { text: "完全一樣，沒有差異", correct: false },
        { text: "commit -am 只會加入「已追蹤」的檔案，不會加入全新的檔案", correct: true },
        { text: "commit -am 會自動推送到遠端", correct: false },
      ],
    },
  },
  {
    id: "pr-naming",
    title: "Pull Request：命名與協作禮儀",
    emoji: "📋",
    type: "concept",
    conceptBlocks: [
      {
        title: "什麼是 Pull Request（PR）？",
        color: ACCENT,
        content: "Push 只是把程式碼推上遠端，但不會自動合併到主分支。你需要發一個 Pull Request（PR），請隊友幫你審查（Code Review）後才合併。PR 是團隊協作的核心流程。",
      },
      {
        title: "PR 標題命名慣例",
        color: "#3B82F6",
        content: "好的 PR 標題跟 commit 一樣遵循語意化格式，但要更完整。格式：「type: 簡短描述（#ticket）」。例如：feat: add shopping cart (#123)、fix: resolve payment timeout (#456)。",
      },
      {
        title: "PR 描述該寫什麼？",
        color: "#10B981",
        content: "三個必寫項目：1) What — 這個 PR 做了什麼（1-2 句話）、2) Why — 為什麼要做這個改動、3) How to test — 審查者如何測試你的修改。這不只是禮貌，是讓團隊有效率的關鍵。",
      },
    ],
    prNamingDemo: true,
    quiz: {
      question: "以下哪個是最好的 PR 標題？",
      options: [
        { text: "Update code", correct: false },
        { text: "feat: add user profile avatar upload (#234)", correct: true },
        { text: "I fixed the thing that was broken yesterday", correct: false },
      ],
    },
  },
];

/* ── Shared Components ── */
function CommandInput({ command, onComplete }) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("typing");
  const [showHint, setShowHint] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    setInput(""); setStatus("typing"); setShowHint(false);
    setTimeout(() => { if (inputRef.current) inputRef.current.focus({ preventScroll: true }); }, 100);
  }, [command.answer]);

  const normalize = (s) => s.trim().replace(/\s+/g, " ").replace(/[""'']/g, (c) => ({ "\u201C": '"', "\u201D": '"', "\u2018": "'", "\u2019": "'" }[c] || c));

  const checkAnswer = () => {
    const norm = normalize(input), expected = normalize(command.answer);
    if (command.flexible) {
      const prefix = expected.split('"')[0].split("'")[0].trim();
      if (norm.startsWith(normalize(prefix)) && (norm.includes('"') || norm.includes("'"))) { setStatus("correct"); setTimeout(onComplete, 700); return; }
    }
    if (norm === expected) { setStatus("correct"); setTimeout(onComplete, 700); }
    else { setStatus("wrong"); setShakeKey(k => k + 1); setTimeout(() => setStatus("typing"), 1200); }
  };

  const expectedNorm = command.answer;
  const getCharColor = (i) => {
    if (status !== "typing" || i >= input.length) return "rgba(255,255,255,0.12)";
    return input[i] === expectedNorm[i] ? "#10B981" : "#EF4444";
  };
  const borderColor = status === "correct" ? "#10B981" : status === "wrong" ? "#EF4444" : "rgba(255,255,255,0.15)";

  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 8, display: "flex", gap: 8, lineHeight: 1.6 }}>
        <span style={{ color: ACCENT, fontWeight: 700, flexShrink: 0 }}>▸</span><span>{command.prompt}</span>
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, height: 16, overflow: "hidden", marginBottom: 4, marginLeft: 24 }}>
        {status === "typing" && expectedNorm.split("").map((ch, i) => <span key={i} style={{ color: getCharColor(i) }}>{ch}</span>)}
      </div>
      <div key={shakeKey} style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.3)", border: `1.5px solid ${borderColor}`, borderRadius: 8, padding: "0 12px", marginLeft: 24, transition: "border-color 0.3s", animation: status === "wrong" ? "shake 0.4s ease" : "none" }}>
        <span style={{ color: "#10B981", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, marginRight: 8, userSelect: "none" }}>$</span>
        <input ref={inputRef} value={input} onChange={e => { if (status === "typing") setInput(e.target.value); }} onKeyDown={e => { if (e.key === "Enter" && input.trim()) checkAnswer(); }} disabled={status === "correct"} placeholder="輸入指令..." autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: status === "correct" ? "#10B981" : status === "wrong" ? "#EF4444" : ACCENT, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, padding: "11px 0", caretColor: ACCENT }} />
        {status === "correct" && <span style={{ color: "#10B981", fontSize: 14 }}>✓</span>}
        {status === "wrong" && <span style={{ color: "#EF4444", fontSize: 11 }}>再試一次</span>}
      </div>
      {status === "typing" && <button onClick={() => setShowHint(!showHint)} style={{ marginTop: 4, marginLeft: 24, background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: 11, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>{showHint ? "隱藏提示" : "💡 提示"}</button>}
      {showHint && status === "typing" && <div style={{ marginTop: 2, marginLeft: 24, fontSize: 11.5, color: hexToRgba(ACCENT, 0.55), fontStyle: "italic" }}>{command.hint}</div>}
    </div>
  );
}

function TerminalSim({ commands, onAllComplete }) {
  const [completedIdx, setCompletedIdx] = useState(-1);
  const termRef = useRef(null);
  useEffect(() => { setCompletedIdx(-1); }, [commands]);
  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
    if (completedIdx === commands.length - 1) setTimeout(() => onAllComplete?.(), 500);
  }, [completedIdx, commands.length, onAllComplete]);

  return (
    <div style={{ background: "#080C12", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", margin: "16px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#EF4444" }} />
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#F59E0B" }} />
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#10B981" }} />
        <span style={{ marginLeft: 8, fontSize: 10.5, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>terminal</span>
      </div>
      <div ref={termRef} style={{ padding: "14px 16px", maxHeight: 400, overflowY: "auto" }}>
        {commands.slice(0, completedIdx + 1).map((cmd, i) => (
          <div key={`done-${i}`} style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
              <span style={{ color: "#10B981" }}>$ </span><span style={{ color: ACCENT }}>{cmd.answer}</span><span style={{ color: "#10B981", marginLeft: 8, fontSize: 11 }}>✓</span>
            </div>
            {cmd.output && <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "rgba(255,255,255,0.4)", whiteSpace: "pre-wrap", marginTop: 3, lineHeight: 1.5 }}>{cmd.output}</div>}
          </div>
        ))}
        {completedIdx < commands.length - 1 && <CommandInput key={completedIdx + 1} command={commands[completedIdx + 1]} onComplete={() => setCompletedIdx(i => i + 1)} />}
        {completedIdx === commands.length - 1 && <div style={{ textAlign: "center", padding: "10px 0 2px", color: "#10B981", fontWeight: 700, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>✅ 所有指令完成！</div>}
      </div>
    </div>
  );
}

function Quiz({ quiz, onComplete }) {
  const [selected, setSelected] = useState(null);
  const handleSelect = (i) => { if (selected !== null) return; setSelected(i); if (quiz.options[i].correct) setTimeout(onComplete, 700); };
  return (
    <div style={{ margin: "20px 0 0", padding: "18px", background: hexToRgba(ACCENT, 0.04), borderRadius: 12, border: `1px solid ${hexToRgba(ACCENT, 0.12)}` }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: ACCENT, marginBottom: 12 }}>💡 觀念確認</div>
      <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.85)", marginBottom: 12, lineHeight: 1.6 }}>{quiz.question}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {quiz.options.map((opt, i) => {
          let bg = "rgba(255,255,255,0.03)", bc = "rgba(255,255,255,0.07)", tc = "rgba(255,255,255,0.65)";
          if (selected === i) { if (opt.correct) { bg = "rgba(16,185,129,0.12)"; bc = "#10B981"; tc = "#10B981"; } else { bg = "rgba(239,68,68,0.12)"; bc = "#EF4444"; tc = "#EF4444"; } }
          else if (selected !== null && opt.correct) { bg = "rgba(16,185,129,0.08)"; bc = "#10B981"; tc = "#10B981"; }
          return <button key={i} onClick={() => handleSelect(i)} style={{ padding: "11px 14px", background: bg, border: `1px solid ${bc}`, borderRadius: 8, color: tc, fontSize: 13, textAlign: "left", cursor: selected !== null ? "default" : "pointer", transition: "all 0.3s", fontFamily: "inherit", lineHeight: 1.5 }}>{opt.text}</button>;
        })}
      </div>
      {selected !== null && !quiz.options[selected].correct && <div style={{ marginTop: 10, fontSize: 11.5, color: "rgba(239,68,68,0.7)" }}>正確答案已用綠色標示 ✨</div>}
      {selected !== null && quiz.options[selected].correct && <div style={{ marginTop: 10, fontSize: 11.5, color: "#10B981", fontWeight: 600 }}>✅ 正確！</div>}
    </div>
  );
}

function ConceptBlocks({ blocks }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "16px 0" }}>
      {blocks.map((b, i) => (
        <div key={i} style={{ padding: "14px 16px", background: `${b.color}08`, borderLeft: `3px solid ${b.color}`, borderRadius: "0 10px 10px 0" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: b.color, marginBottom: 6 }}>{b.title}</div>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>{b.content}</div>
        </div>
      ))}
    </div>
  );
}

function PRNamingDemo() {
  const [selected, setSelected] = useState({});
  const examples = [
    { pr: "fix stuff", good: false, why: "太模糊，沒有說明修了什麼" },
    { pr: "feat: add dark mode toggle (#89)", good: true, why: "語意清楚，有 ticket 編號" },
    { pr: "update", good: false, why: "完全沒有資訊量" },
    { pr: "fix: resolve crash on empty cart (#102)", good: true, why: "明確說明修了什麼 bug" },
    { pr: "Changes", good: false, why: "不知道改了什麼" },
    { pr: "refactor: extract auth middleware (#67)", good: true, why: "說明重構的內容" },
  ];
  return (
    <div style={{ margin: "16px 0", padding: "18px", background: hexToRgba(ACCENT, 0.04), borderRadius: 12, border: `1px solid ${hexToRgba(ACCENT, 0.12)}` }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, marginBottom: 12 }}>🎯 PR 命名判斷練習：點擊判斷好壞</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {examples.map((ex, i) => {
          const answered = selected[i] !== undefined;
          const correct = selected[i] === ex.good;
          return (
            <div key={i} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "12px 14px", border: `1px solid ${answered ? (correct ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)") : "rgba(255,255,255,0.06)"}`, transition: "all 0.3s" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: "rgba(255,255,255,0.75)", marginBottom: 8 }}>{ex.pr}</div>
              {!answered ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setSelected(p => ({ ...p, [i]: true }))} style={{ padding: "5px 14px", fontSize: 11.5, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 6, color: "#10B981", cursor: "pointer", fontFamily: "inherit" }}>👍 好</button>
                  <button onClick={() => setSelected(p => ({ ...p, [i]: false }))} style={{ padding: "5px 14px", fontSize: 11.5, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, color: "#EF4444", cursor: "pointer", fontFamily: "inherit" }}>👎 壞</button>
                </div>
              ) : (
                <div style={{ fontSize: 11.5, color: correct ? "#10B981" : "#EF4444", lineHeight: 1.6 }}>
                  {correct ? "✅ 正確！" : `❌ 這其實是${ex.good ? "好的" : "壞的"}命名。`} {ex.why}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {Object.keys(selected).length === examples.length && (
        <div style={{ marginTop: 12, padding: "10px 14px", background: hexToRgba(ACCENT, 0.06), borderRadius: 8, fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
          💡 <strong style={{ color: ACCENT }}>記住公式：</strong>type: 簡短動詞描述 (#ticket)。好的 PR 標題讓審查者一眼就知道這個 PR 在做什麼。
        </div>
      )}
    </div>
  );
}

function RemoteDiagram({ diagram }) {
  return (
    <div style={{ margin: "20px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
      <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 12, padding: "14px 16px", minWidth: 150 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#3B82F6", marginBottom: 10, textAlign: "center" }}>🖥️ 你的電腦</div>
        {diagram.local.map((l, i) => (
          <div key={i} style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", padding: "4px 8px", background: "rgba(255,255,255,0.04)", borderRadius: 6, marginBottom: 4, textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}>{l}</div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        {diagram.bridge.map((b, i) => (
          <div key={i} style={{ fontSize: 11, color: ACCENT, fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap" }}>{b}</div>
        ))}
      </div>
      <div style={{ background: hexToRgba(ACCENT, 0.06), border: `1px solid ${hexToRgba(ACCENT, 0.2)}`, borderRadius: 12, padding: "14px 16px", minWidth: 150 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, marginBottom: 10, textAlign: "center" }}>☁️ 遠端</div>
        {diagram.remote.map((r, i) => (
          <div key={i} style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", padding: "4px 8px", background: "rgba(255,255,255,0.04)", borderRadius: 6, marginBottom: 4, textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}>{r}</div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════ */
export default function GitBridge1() {
  const [currentStep, setCurrentStep] = useState(0);
  useEffect(() => { window.scrollTo(0, 0); }, [currentStep]);
  const [termDone, setTermDone] = useState({});
  const [quizDone, setQuizDone] = useState({});
  const [score, setScore] = useState(0);
  const navigate = useNavigate();
  const { prevPath, nextPath } = useChapterNav();

  const step = STEPS[currentStep];
  const goNext = () => { if (currentStep < STEPS.length - 1) setCurrentStep(s => s + 1); };
  const goPrev = () => { if (currentStep > 0) setCurrentStep(s => s - 1); };
  const handleTermDone = useCallback(() => { setTermDone(p => ({ ...p, [currentStep]: true })); }, [currentStep]);
  const handleQuizDone = () => { if (!quizDone[currentStep]) { setQuizDone(p => ({ ...p, [currentStep]: true })); setScore(s => s + 1); } };

  return (
    <div style={{ minHeight: "100%", background: "#080C12", color: "#E6EDF3", fontFamily: "'Noto Sans TC', 'Segoe UI', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 24px" }}>
      <div style={{ width: "100%", maxWidth: 900 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900, color: colors.bg, fontFamily: "'JetBrains Mono', monospace" }}>5</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>團隊協作：遠端與協作基礎</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Git 課程系列 · 第五堂</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: ACCENT, fontFamily: "'JetBrains Mono', monospace", background: hexToRgba(ACCENT, 0.1), padding: "4px 10px", borderRadius: 6 }}>⭐ {score}/{STEPS.length}</div>
        </div>

        <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 28 }}>
          {STEPS.map((_, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= currentStep ? `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})` : "rgba(255,255,255,0.06)", transition: "background 0.4s" }} />)}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 8, fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap" }}>{currentStep + 1}/{STEPS.length}</span>
        </div>

        <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "26px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>{step.emoji}</span>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{step.title}</h2>
          </div>

          {step.conceptBlocks && <ConceptBlocks blocks={step.conceptBlocks} />}
          {step.prNamingDemo && <PRNamingDemo />}
          {step.diagram && <RemoteDiagram diagram={step.diagram} />}
          {step.explanation && <div style={{ padding: "14px 16px", background: "rgba(59,130,246,0.04)", borderLeft: "3px solid #3B82F6", borderRadius: "0 10px 10px 0", fontSize: 12.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, margin: "12px 0" }}>{step.explanation}</div>}
          {step.story && <div style={{ padding: "14px 16px", background: "rgba(245,158,11,0.05)", borderLeft: "3px solid #F59E0B", borderRadius: "0 10px 10px 0", fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, marginBottom: 8 }}><span style={{ fontWeight: 700, color: "#F59E0B" }}>📖 情境：</span>{step.story}</div>}
          {step.tip && <div style={{ padding: "14px 16px", background: "rgba(16,185,129,0.04)", borderLeft: "3px solid #10B981", borderRadius: "0 10px 10px 0", fontSize: 12.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, marginBottom: 4 }}><span style={{ fontWeight: 700, color: "#10B981" }}>💼 實務觀點：</span>{step.tip}</div>}
          {step.commands && <TerminalSim key={currentStep} commands={step.commands} onAllComplete={handleTermDone} />}
          <Quiz key={`q-${currentStep}`} quiz={step.quiz} onComplete={handleQuizDone} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 12 }}>
          {currentStep === 0 ? (
            prevPath ? <button onClick={() => navigate(prevPath)} style={{ padding: "12px 24px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← 上一章</button> : <div />
          ) : (
            <button onClick={goPrev} style={{ padding: "12px 24px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← 上一課</button>
          )}
          {currentStep === STEPS.length - 1 ? (
            nextPath ? <button onClick={() => navigate(nextPath)} style={{ padding: "12px 24px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, border: "none", borderRadius: 10, color: colors.bg, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>下一章 →</button> : <div />
          ) : (
            <button onClick={goNext} style={{ padding: "12px 24px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, border: "none", borderRadius: 10, color: colors.bg, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>下一課 →</button>
          )}
        </div>
      </div>
    </div>
  );
}
