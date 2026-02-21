import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useChapterNav } from "./chapter-context";

/* ══════════════════════════════════════════════
   第十堂：實戰演練 — 從零到 GitHub 的三日旅程
   ══════════════════════════════════════════════ */

const ACCENT = "#E8C872";
const ACCENT2 = "#D4A843";

const STEPS = [
  /* ──── Day 1 ──── */
  {
    id: "first-mistake",
    title: "Day 1：專案完成！直接推上去！",
    emoji: "😄",
    type: "scenario",
    day: 1,
    story: "小陳花了兩週完成第一個 React 專案，興奮地想推上 GitHub。他直接 git init → git add . → git commit，完全沒想到要建 .gitignore……",
    fileBloatDemo: true,
    tip: "node_modules 資料夾通常有數萬個檔案、200MB 以上。把它 commit 進去不只浪費空間，還會讓 clone 變得極慢，甚至讓 GitHub 拒絕你的 push。",
    quiz: {
      question: "為什麼 .gitignore 必須在第一次 git add 之前建立？",
      options: [
        { text: "因為 git add 會把所有檔案加入暫存區，一旦追蹤就很難完全移除", correct: true },
        { text: "因為 GitHub 規定每個 repo 一定要有 .gitignore", correct: false },
        { text: "因為沒有 .gitignore 程式就跑不動", correct: false },
      ],
    },
  },
  {
    id: "messy-vs-clean",
    title: "Day 1：災難現場 vs 理想狀態",
    emoji: "😱",
    type: "concept",
    day: 1,
    conceptBlocks: [
      {
        title: "一個巨大 commit 的問題",
        color: "#EF4444",
        content: "小陳把所有程式碼、所有修改、甚至 node_modules 全部塞進一個 commit。結果：code review 根本看不完、出 bug 無法追溯是哪次改動造成的、想 revert 一個小功能卻要撤銷所有東西。",
      },
      {
        title: "Atomic Commits — 原子提交",
        color: "#10B981",
        content: "業界最佳實踐：每個 commit 只做一件事。一個 bug fix = 一個 commit，一個新功能 = 一個 commit。這樣 git log 就像一本清晰的開發日誌，任何人都能快速理解專案的演進過程。",
      },
    ],
    commitCompare: true,
    quiz: {
      question: "一個大 commit 包含所有改動，最大的缺點是什麼？",
      options: [
        { text: "難以 code review、無法精確追蹤 bug 來源、無法單獨 revert 某個改動", correct: true },
        { text: "沒有缺點，其實更有效率", correct: false },
        { text: "只是 commit 訊息比較長而已", correct: false },
      ],
    },
  },
  {
    id: "redo-init",
    title: "Day 1：重來一次，這次做對",
    emoji: "🔄",
    type: "scenario",
    day: 1,
    story: "小陳決定砍掉重來。刪除錯誤的 .git 資料夾，重新初始化，這次第一件事就是建立 .gitignore。",
    tip: "正確順序：git init → 建立 .gitignore → git add . → git commit。.gitignore 一定要在第一次 add 之前就準備好！",
    commands: [
      { prompt: "重新初始化 Git 儲存庫", answer: "git init", output: "Initialized empty Git repository in /alex-react-app/.git/", hint: "init 初始化" },
      { prompt: "確認 .gitignore 已建立後，將所有檔案加入暫存區", answer: "git add .", output: "", hint: "add . 加入全部" },
      { prompt: "查看現在暫存區有多少檔案（應該只有 18 個）", answer: "git status", output: "On branch main\n\nNo commits yet\n\nChanges to be committed:\n  new file:   .gitignore\n  new file:   package.json\n  new file:   vite.config.js\n  new file:   index.html\n  new file:   src/App.jsx\n  new file:   src/main.jsx\n  ... and 12 more files\n\n18 files total", hint: "status 查看狀態" },
      { prompt: "第一個 commit：描述這是專案初始設定", answer: "git commit -m \"feat: initial project setup\"", output: "[main (root-commit) a1b2c3d] feat: initial project setup\n 18 files changed, 1240 insertions(+)", hint: "commit -m \"feat: ...\"", flexible: true },
    ],
    quiz: {
      question: "小陳重做後，暫存區從 50,000+ 檔案變成 18 個，差別在哪？",
      options: [
        { text: ".gitignore 排除了 node_modules、dist 等不需要追蹤的資料夾", correct: true },
        { text: "用了不同的 git add 指令", correct: false },
        { text: "刪除了大部分原始碼", correct: false },
      ],
    },
  },
  /* ──── Day 2 ──── */
  {
    id: "bug-fix-flow",
    title: "Day 2：五個 Bug，混在一起了",
    emoji: "🐛",
    type: "scenario",
    day: 2,
    story: "隔天早上，小陳一口氣修了 5 個 bug。等到想 commit 的時候才發現：所有改動都混在工作目錄裡，根本分不清哪個改動是哪個 bug！",
    tip: "這是新手最常犯的錯誤之一：「先寫完再說」。正確的習慣是修完一個 bug 就立刻 commit，讓每個 commit 都有明確的目的。",
    bugFixFlow: true,
    quiz: {
      question: "如果 5 個不同的修改都在同一個檔案裡，還能拆成 5 個 commit 嗎？",
      options: [
        { text: "可以，用 git add -p 做 hunk-level staging，逐段暫存", correct: true },
        { text: "不行，同一個檔案只能一起 commit", correct: false },
        { text: "只能全部一起 commit，然後下次注意", correct: false },
      ],
    },
  },
  {
    id: "clean-history",
    title: "Day 2：看看歷史有多乾淨",
    emoji: "✨",
    type: "concept",
    day: 2,
    conceptBlocks: [
      {
        title: "git log --oneline 的力量",
        color: "#3B82F6",
        content: "當每個 commit 都有清晰的訊息和明確的改動範圍，git log 就變成了一本開發日誌。任何人都能快速了解：「什麼時候改了什麼？為什麼要改？」",
      },
      {
        title: "git bisect — 二分搜尋 bug",
        color: "#E8C872",
        content: "假如 6 個月後出現 bug，git bisect 可以用二分搜尋法，在數百個 commit 中快速找到「哪一個 commit 引入了 bug」。但前提是：每個 commit 都是完整且獨立的改動。",
      },
    ],
    cleanTimeline: true,
    quiz: {
      question: "假如線上出現 bug，怎樣的 git 歷史對除錯最有幫助？",
      options: [
        { text: "每個 commit 只做一件事，可以用 git bisect 快速定位問題", correct: true },
        { text: "一個大 commit 包含所有改動，好找", correct: false },
        { text: "不需要看 git 歷史，直接看程式碼就好", correct: false },
      ],
    },
  },
  /* ──── Day 3 ──── */
  {
    id: "push-to-github",
    title: "Day 3：推上 GitHub",
    emoji: "🚀",
    type: "scenario",
    day: 3,
    story: "乾淨的 commit 歷史準備好了！小陳在 GitHub 上建了新的 repo，準備把本地的程式碼推上去。",
    tip: "-u（--set-upstream）只需要在第一次 push 時使用，它會建立本地分支和遠端分支的追蹤關係。之後只要 git push 就夠了。",
    commands: [
      { prompt: "連結到 GitHub 遠端儲存庫", answer: "git remote add origin https://github.com/alex/react-app.git", output: "", hint: "remote add origin + URL" },
      { prompt: "確保分支名稱是 main", answer: "git branch -M main", output: "", hint: "branch -M main" },
      { prompt: "第一次推送到遠端（設定追蹤）", answer: "git push -u origin main", output: "Enumerating objects: 24, done.\nCounting objects: 100% (24/24), done.\nDelta compression using up to 8 threads\nCompressing objects: 100% (20/20), done.\nWriting objects: 100% (24/24), 8.12 KiB | 8.12 MiB/s, done.\nTo github.com:alex/react-app.git\n * [new branch]      main -> main\nBranch 'main' set up to track remote branch 'main' from 'origin'.", hint: "push -u origin main" },
    ],
    pushSuccessDemo: true,
    quiz: {
      question: "git push -u origin main 的 -u 是什麼意思？",
      options: [
        { text: "設定上游追蹤（upstream），讓之後的 push/pull 不用再指定遠端和分支", correct: true },
        { text: "強制覆蓋遠端的程式碼", correct: false },
        { text: "上傳（upload）的縮寫", correct: false },
      ],
    },
  },
  {
    id: "pull-before-push",
    title: "Day 3：被拒絕了！同事先推了程式碼",
    emoji: "🤝",
    type: "scenario",
    day: 3,
    story: "小陳修了一個小 bug 想 push，結果被拒絕了！原來同事已經推了 3 個 commit。遠端的歷史比本地還新，必須先 pull 才能 push。",
    pullDemo: true,
    commands: [
      { prompt: "嘗試推送你的修改", answer: "git push origin main", output: "To github.com:alex/react-app.git\n ! [rejected]        main -> main (fetch first)\nerror: failed to push some refs\nhint: Updates were rejected because the remote contains work that you do not have locally.", hint: "push origin main" },
      { prompt: "先拉取遠端的最新程式碼", answer: "git pull origin main", output: "remote: Counting objects: 9, done.\nFrom github.com:alex/react-app\n   a1b2c3d..f4e5d6c  main -> origin/main\nUpdating a1b2c3d..f4e5d6c\nFast-forward\n src/api.js  | 20 +++++++++++-\n src/data.js | 15 +++++++++\n src/utils.js|  8 +++--\n 3 files changed, 40 insertions(+), 3 deletions(-)", hint: "pull origin main" },
      { prompt: "查看合併後的歷史", answer: "git log --oneline", output: "g7h8i9j fix: correct input focus bug\nf4e5d6c feat: add loading spinner (Amy)\ne3d4c5b fix: API timeout handling (Amy)\nd2c3b4a feat: add search filter (Amy)\nc1b2a3d refactor: simplify auth logic\nb0a1c2d feat: add toast notification\na9b8c7d style: button hover feedback\n8e7f6g5 fix: nav active state\n7d6e5f4 fix: form validation\na1b2c3d feat: initial project setup", hint: "log --oneline 查看歷史" },
      { prompt: "再次推送（這次成功了！）", answer: "git push origin main", output: "Enumerating objects: 5, done.\nCounting objects: 100% (5/5), done.\nTo github.com:alex/react-app.git\n   f4e5d6c..g7h8i9j  main -> main", hint: "push origin main" },
    ],
    quiz: {
      question: "push 被拒絕時，正確的做法是什麼？",
      options: [
        { text: "先 git pull 取得遠端更新，合併後再 push", correct: true },
        { text: "用 git push --force 強制覆蓋遠端", correct: false },
        { text: "刪除遠端 repo 重新來過", correct: false },
      ],
    },
  },
  {
    id: "reflection",
    title: "三天旅程的成長回顧",
    emoji: "🎓",
    type: "summary",
    day: 0,
    journeyReflection: true,
    summaryPoints: [
      { icon: "📝", text: ".gitignore First — 在 git add 之前就建立好" },
      { icon: "🎯", text: "Atomic Commits — 一個改動 = 一個 commit" },
      { icon: "🔍", text: "Meaningful Messages — 用語意化前綴，未來的自己會感謝你" },
      { icon: "🤝", text: "Pull Before Push — 團隊協作的基本紀律" },
      { icon: "⏮️", text: "Clean History — 讓 git bisect 和 revert 成為你的超能力" },
    ],
    quiz: {
      question: "小陳的三天旅程中，最重要的一課是什麼？",
      options: [
        { text: "Git 紀律（.gitignore、atomic commits、pull before push）比指令本身更重要", correct: true },
        { text: "背熟所有 Git 指令就夠了", correct: false },
        { text: "只要 push 成功就好，歷史不重要", correct: false },
      ],
    },
  },
];

/* ═══════════════════════════════════════
   Shared Components (same pattern as other lessons)
   ═══════════════════════════════════════ */

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
      {showHint && status === "typing" && <div style={{ marginTop: 2, marginLeft: 24, fontSize: 11.5, color: "rgba(232,200,114,0.55)", fontStyle: "italic" }}>{command.hint}</div>}
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
        {["#EF4444","#F59E0B","#10B981"].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
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
    <div style={{ margin: "20px 0 0", padding: "18px", background: "rgba(232,200,114,0.04)", borderRadius: 12, border: "1px solid rgba(232,200,114,0.12)" }}>
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

/* ═══════════════════════════════════════
   Custom Demo Components
   ═══════════════════════════════════════ */

/* Step 1: node_modules 災難展示 */
function FileBloatDemo() {
  const [revealed, setRevealed] = useState(false);
  const sampleFiles = [
    "node_modules/react/index.js", "node_modules/react/cjs/react.production.min.js",
    "node_modules/react-dom/index.js", "node_modules/react-dom/cjs/react-dom.production.min.js",
    "node_modules/scheduler/index.js", "node_modules/vite/dist/node/index.js",
    "node_modules/esbuild/bin/esbuild", "node_modules/postcss/lib/postcss.js",
    "node_modules/lodash/lodash.js", "node_modules/typescript/lib/tsc.js",
    "node_modules/webpack/lib/webpack.js", "node_modules/babel-core/index.js",
  ];
  return (
    <div style={{ margin: "16px 0", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
      <div style={{ padding: "14px 16px", background: "rgba(239,68,68,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#EF4444", marginBottom: 4 }}>🚨 小陳的 git status 輸出</div>
        <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)" }}>忘記建 .gitignore 的後果</div>
      </div>
      <div style={{ padding: "16px", background: "#080C12" }}>
        {!revealed ? (
          <div style={{ textAlign: "center" }}>
            <button onClick={() => setRevealed(true)} style={{ padding: "10px 24px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, color: "#EF4444", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
              執行 git status 看看發生什麼事
            </button>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
              <span style={{ color: "#10B981" }}>$</span> git status
            </div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>Changes to be committed:</div>
                <div style={{ maxHeight: 180, overflowY: "auto", paddingRight: 4 }}>
                  {sampleFiles.map((f, i) => (
                    <div key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#EF4444", padding: "2px 0", animation: `fadeInUp 0.3s ease ${i * 0.05}s both` }}>
                      new file: {f}
                    </div>
                  ))}
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#EF4444", padding: "4px 0", fontWeight: 700 }}>
                    ... 還有 49,988 個檔案
                  </div>
                </div>
              </div>
              <div style={{ minWidth: 200 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>災難數據</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "被追蹤的檔案", value: "50,000+", color: "#EF4444" },
                    { label: "儲存庫大小", value: "~200 MB", color: "#EF4444" },
                    { label: "正常應該是", value: "18 files / 2 MB", color: "#10B981" },
                  ].map((d, i) => (
                    <div key={i} style={{ padding: "8px 12px", background: `${d.color}0A`, border: `1px solid ${d.color}25`, borderRadius: 8 }}>
                      <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)" }}>{d.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: d.color, fontFamily: "'JetBrains Mono', monospace" }}>{d.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* Step 2: Messy vs Clean commit 對比 */
function CommitCompare() {
  const [hovered, setHovered] = useState(null);
  const messy = {
    hash: "a1b2c3d",
    message: "add everything + fix bugs + cleanup",
    stats: "50,000 files changed, 5,240 insertions(+)",
    files: ["node_modules/... (49,982 files)", "src/App.jsx", "src/Form.jsx", "src/Navbar.jsx", "src/Toast.jsx", "src/auth.js", "package.json", "..."],
  };
  const clean = [
    { hash: "f5e4d3c", message: "refactor: simplify auth logic", files: 1, ins: 8, del: 12, color: "#8B5CF6" },
    { hash: "e4d3c2b", message: "feat: add toast notification", files: 2, ins: 45, del: 0, color: "#3B82F6" },
    { hash: "d3c2b1a", message: "style: button hover feedback", files: 1, ins: 6, del: 2, color: ACCENT },
    { hash: "c2b1a0f", message: "fix: nav active state indicator", files: 1, ins: 4, del: 3, color: "#10B981" },
    { hash: "b1a0f9e", message: "fix: form validation email format", files: 1, ins: 8, del: 4, color: "#10B981" },
    { hash: "a1b2c3d", message: "feat: initial project setup", files: 18, ins: 1240, del: 0, color: "#3B82F6" },
  ];

  return (
    <div style={{ margin: "16px 0", display: "flex", gap: 12, flexWrap: "wrap" }}>
      {/* Messy side */}
      <div onMouseEnter={() => setHovered("messy")} onMouseLeave={() => setHovered(null)}
        style={{ flex: 1, minWidth: 260, padding: "16px", background: "rgba(239,68,68,0.04)", border: `1.5px solid ${hovered === "messy" ? "rgba(239,68,68,0.4)" : "rgba(239,68,68,0.15)"}`, borderRadius: 12, transition: "all 0.3s" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>❌ 小陳的做法</div>
        <div style={{ padding: "10px 12px", background: "rgba(0,0,0,0.3)", borderRadius: 8, fontFamily: "'JetBrains Mono', monospace" }}>
          <div style={{ fontSize: 11, color: "#EF4444" }}>* {messy.hash}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginLeft: 12 }}>{messy.message}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginLeft: 12, marginTop: 4 }}>{messy.stats}</div>
        </div>
        <div style={{ marginTop: 12, fontSize: 11.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
          ⚠️ 無法分辨每個改動的目的<br/>
          ⚠️ 無法單獨 revert 某個修改<br/>
          ⚠️ Code review 幾乎不可能
        </div>
      </div>
      {/* Clean side */}
      <div onMouseEnter={() => setHovered("clean")} onMouseLeave={() => setHovered(null)}
        style={{ flex: 1, minWidth: 260, padding: "16px", background: "rgba(16,185,129,0.04)", border: `1.5px solid ${hovered === "clean" ? "rgba(16,185,129,0.4)" : "rgba(16,185,129,0.15)"}`, borderRadius: 12, transition: "all 0.3s" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#10B981", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>✅ 正確的做法</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {clean.map((c, i) => (
            <div key={i} style={{ padding: "6px 10px", background: "rgba(0,0,0,0.25)", borderRadius: 6, borderLeft: `2px solid ${c.color}`, fontFamily: "'JetBrains Mono', monospace", animation: `fadeInUp 0.3s ease ${i * 0.08}s both` }}>
              <div style={{ fontSize: 10.5, color: c.color }}>* {c.hash}</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.55)", marginLeft: 10 }}>{c.message}</div>
              <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.2)", marginLeft: 10 }}>{c.files} file{c.files > 1 ? "s" : ""}, +{c.ins} -{c.del}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 11.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
          ✓ 每個 commit 目的清晰<br/>
          ✓ 可精確 revert 任何改動<br/>
          ✓ Code review 輕鬆高效
        </div>
      </div>
    </div>
  );
}

/* Step 4: 逐一修 Bug 並 commit 的互動流程 */
function BugFixFlow({ onAllComplete }) {
  const bugs = [
    { id: 0, type: "fix", label: "表單驗證：email 格式錯誤", file: "src/Form.jsx", color: "#3B82F6", commit: "fix: form validation email format", lines: "+8 -4" },
    { id: 1, type: "style", label: "按鈕 hover 視覺回饋", file: "src/Button.css", color: "#10B981", commit: "style: improve button hover feedback", lines: "+6 -2" },
    { id: 2, type: "fix", label: "導航列 active 狀態錯誤", file: "src/Navbar.jsx", color: "#F59E0B", commit: "fix: nav active state indicator", lines: "+4 -3" },
    { id: 3, type: "feat", label: "新增 toast 通知系統", file: "src/Toast.jsx", color: "#8B5CF6", commit: "feat: add toast notification system", lines: "+45 -0" },
    { id: 4, type: "refactor", label: "簡化認證邏輯", file: "src/auth.js", color: "#EF4444", commit: "refactor: simplify auth logic", lines: "+8 -12" },
  ];
  const [currentBug, setCurrentBug] = useState(0);
  const [phase, setPhase] = useState("view"); // view → staging → committing → done
  const [allDone, setAllDone] = useState(false);
  const [commitLog, setCommitLog] = useState([]);

  const handleStage = () => setPhase("staging");
  const handleCommit = () => {
    const bug = bugs[currentBug];
    const newLog = [{ hash: `${String.fromCharCode(97 + currentBug)}1b2c3d`, message: bug.commit }, ...commitLog];
    setCommitLog(newLog);
    setPhase("done");
    if (currentBug === bugs.length - 1) {
      setTimeout(() => { setAllDone(true); onAllComplete?.(); }, 800);
    }
  };
  const handleNext = () => {
    if (currentBug < bugs.length - 1) {
      setCurrentBug(c => c + 1);
      setPhase("view");
    }
  };

  return (
    <div style={{ margin: "16px 0", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
      {/* Progress bar */}
      <div style={{ display: "flex", gap: 3, padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {bugs.map((b, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: "100%", height: 4, borderRadius: 2, background: i < currentBug || (i === currentBug && phase === "done") ? b.color : i === currentBug ? `${b.color}50` : "rgba(255,255,255,0.06)", transition: "all 0.4s" }} />
            <span style={{ fontSize: 9, color: i <= currentBug ? b.color : "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>{b.type}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: "16px" }}>
        {!allDone ? (
          <>
            {/* Current bug card */}
            <div style={{ padding: "14px 16px", background: `${bugs[currentBug].color}0A`, border: `1px solid ${bugs[currentBug].color}30`, borderRadius: 10, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: bugs[currentBug].color }}>Bug #{currentBug + 1}: {bugs[currentBug].label}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>{bugs[currentBug].lines}</span>
              </div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>📁 {bugs[currentBug].file}</div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {phase === "view" && (
                <button onClick={handleStage} style={{ flex: 1, padding: "10px 16px", background: `${bugs[currentBug].color}15`, border: `1px solid ${bugs[currentBug].color}40`, borderRadius: 8, color: bugs[currentBug].color, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>
                  git add {bugs[currentBug].file}
                </button>
              )}
              {phase === "staging" && (
                <button onClick={handleCommit} style={{ flex: 1, padding: "10px 16px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, color: "#10B981", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>
                  git commit -m "{bugs[currentBug].commit}"
                </button>
              )}
              {phase === "done" && currentBug < bugs.length - 1 && (
                <button onClick={handleNext} style={{ flex: 1, padding: "10px 16px", background: "linear-gradient(135deg, #E8C872, #D4A843)", border: "none", borderRadius: 8, color: "#0D1117", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  ✅ 已提交！繼續下一個 Bug →
                </button>
              )}
              {phase === "done" && currentBug === bugs.length - 1 && (
                <div style={{ flex: 1, padding: "10px 16px", background: "rgba(16,185,129,0.08)", borderRadius: 8, textAlign: "center", color: "#10B981", fontSize: 12, fontWeight: 700 }}>
                  🎉 全部 5 個 Bug 都已正確提交！
                </div>
              )}
            </div>

            {/* Live git log */}
            {commitLog.length > 0 && (
              <div style={{ padding: "10px 12px", background: "#080C12", borderRadius: 8, fontFamily: "'JetBrains Mono', monospace" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginBottom: 6 }}>$ git log --oneline</div>
                {commitLog.map((c, i) => (
                  <div key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", padding: "2px 0", animation: i === 0 ? "fadeInUp 0.3s ease" : "none" }}>
                    <span style={{ color: ACCENT }}>{c.hash.slice(0, 7)}</span> {c.message}
                  </div>
                ))}
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", padding: "2px 0" }}>
                  <span style={{ color: "rgba(232,200,114,0.4)" }}>a1b2c3d</span> feat: initial project setup
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#10B981", marginBottom: 4 }}>完美！5 個 Atomic Commits</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>每個 commit 都只做一件事，歷史清晰可追溯</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Step 5: 美化的 git log 時間線 */
function CleanTimeline() {
  const [expanded, setExpanded] = useState(null);
  const commits = [
    { hash: "f5e4d3c", message: "refactor: simplify auth logic", type: "refactor", color: "#8B5CF6", files: ["src/auth.js"], detail: "移除多餘的 try-catch 層級，使用 async/await 簡化流程" },
    { hash: "e4d3c2b", message: "feat: add toast notification", type: "feat", color: "#3B82F6", files: ["src/Toast.jsx", "src/App.jsx"], detail: "新增可自動消失的 toast 通知元件" },
    { hash: "d3c2b1a", message: "style: button hover feedback", type: "style", color: ACCENT, files: ["src/Button.css"], detail: "增加 hover 時的陰影和位移效果" },
    { hash: "c2b1a0f", message: "fix: nav active state indicator", type: "fix", color: "#10B981", files: ["src/Navbar.jsx"], detail: "修正切換頁面時導航列的 active 狀態沒有更新" },
    { hash: "b1a0f9e", message: "fix: form validation email format", type: "fix", color: "#10B981", files: ["src/Form.jsx"], detail: "修正 email 欄位沒有正確驗證格式" },
    { hash: "a1b2c3d", message: "feat: initial project setup", type: "feat", color: "#3B82F6", files: ["18 files"], detail: "React + Vite 專案初始化" },
  ];

  return (
    <div style={{ margin: "16px 0", padding: "16px 0" }}>
      <div style={{ position: "relative" }}>
        {/* Vertical line */}
        <div style={{ position: "absolute", left: 15, top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.06)" }} />
        {commits.map((c, i) => (
          <div key={i} onClick={() => setExpanded(expanded === i ? null : i)} style={{ position: "relative", paddingLeft: 40, paddingBottom: 12, cursor: "pointer" }}>
            {/* Dot */}
            <div style={{ position: "absolute", left: 9, top: 4, width: 14, height: 14, borderRadius: "50%", background: c.color, border: "2px solid #0D1117", transition: "transform 0.2s", transform: expanded === i ? "scale(1.3)" : "scale(1)" }} />
            {/* Content */}
            <div style={{ padding: "8px 12px", background: expanded === i ? `${c.color}0A` : "rgba(255,255,255,0.02)", border: `1px solid ${expanded === i ? `${c.color}30` : "rgba(255,255,255,0.05)"}`, borderRadius: 8, transition: "all 0.3s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, color: c.color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{c.hash.slice(0, 7)}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{c.message}</span>
                <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: `${c.color}20`, color: c.color, fontWeight: 600 }}>{c.type}</span>
              </div>
              {expanded === i && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${c.color}20`, animation: "fadeInUp 0.2s ease" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>{c.detail}</div>
                  <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>📁 {c.files.join(", ")}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Step 6: Push 成功後的模擬 GitHub 頁面 */
function PushSuccessDemo() {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 500); return () => clearTimeout(t); }, []);
  if (!show) return null;
  const commits = [
    { hash: "f5e4d3c", msg: "refactor: simplify auth logic", time: "2 minutes ago" },
    { hash: "e4d3c2b", msg: "feat: add toast notification", time: "5 minutes ago" },
    { hash: "d3c2b1a", msg: "style: button hover feedback", time: "8 minutes ago" },
    { hash: "c2b1a0f", msg: "fix: nav active state indicator", time: "10 minutes ago" },
    { hash: "b1a0f9e", msg: "fix: form validation email format", time: "12 minutes ago" },
    { hash: "a1b2c3d", msg: "feat: initial project setup", time: "15 minutes ago" },
  ];
  return (
    <div style={{ margin: "16px 0", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", animation: "fadeInUp 0.4s ease" }}>
      {/* GitHub header mockup */}
      <div style={{ padding: "10px 16px", background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "'JetBrains Mono', monospace" }}>alex / react-app</span>
        <span style={{ fontSize: 9, padding: "2px 6px", background: "rgba(255,255,255,0.06)", borderRadius: 10, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>public</span>
      </div>
      <div style={{ padding: "12px 16px" }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>📋 6 commits · main</div>
        {commits.map((c, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < commits.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10.5, color: ACCENT, fontFamily: "'JetBrains Mono', monospace" }}>{c.hash.slice(0, 7)}</span>
              <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.6)" }}>{c.msg}</span>
            </div>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{c.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Step 7: Pull 情境示意圖 */
function PullDemo() {
  const [step, setStep] = useState(0); // 0=initial, 1=pushed Amy's, 2=pulled
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 800);
    return () => clearTimeout(t1);
  }, []);

  const localCommits = ["feat: initial project setup", "fix: form validation", "fix: nav active state", "style: button hover", "feat: add toast", "refactor: simplify auth"];
  const amyCommits = ["feat: add search filter (Amy)", "fix: API timeout handling (Amy)", "feat: add loading spinner (Amy)"];

  return (
    <div style={{ margin: "16px 0", display: "flex", gap: 12, flexWrap: "wrap" }}>
      {/* Local */}
      <div style={{ flex: 1, minWidth: 200, padding: "12px", background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#3B82F6", marginBottom: 8, textAlign: "center" }}>🖥️ 你的電腦 (local)</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>main: {localCommits.length} commits</div>
        {localCommits.slice(-3).reverse().map((c, i) => (
          <div key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", padding: "2px 0", fontFamily: "'JetBrains Mono', monospace" }}>· {c}</div>
        ))}
        <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>...</div>
      </div>
      {/* Arrow */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: 60, gap: 4 }}>
        {step === 0 && <div style={{ fontSize: 11, color: "#EF4444", fontWeight: 700 }}>❌ push 被拒</div>}
        {step >= 1 && (
          <>
            <div style={{ fontSize: 11, color: "#10B981", fontFamily: "'JetBrains Mono', monospace" }}>← pull</div>
            <div style={{ fontSize: 11, color: ACCENT, fontFamily: "'JetBrains Mono', monospace" }}>push →</div>
          </>
        )}
      </div>
      {/* Remote */}
      <div style={{ flex: 1, minWidth: 200, padding: "12px", background: "rgba(232,200,114,0.04)", border: "1px solid rgba(232,200,114,0.15)", borderRadius: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, marginBottom: 8, textAlign: "center" }}>☁️ GitHub (origin/main)</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>main: {localCommits.length + amyCommits.length} commits</div>
        {step >= 1 && amyCommits.slice().reverse().map((c, i) => (
          <div key={i} style={{ fontSize: 10, color: "#F59E0B", padding: "2px 0", fontFamily: "'JetBrains Mono', monospace", animation: "fadeInUp 0.3s ease" }}>· {c}</div>
        ))}
        {localCommits.slice(-2).reverse().map((c, i) => (
          <div key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", padding: "2px 0", fontFamily: "'JetBrains Mono', monospace" }}>· {c}</div>
        ))}
        <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>...</div>
      </div>
    </div>
  );
}

/* Step 8: 三天旅程回顧 */
function JourneyReflection({ summaryPoints }) {
  const [visibleIdx, setVisibleIdx] = useState(-1);
  useEffect(() => {
    const t = setInterval(() => setVisibleIdx(i => { if (i >= 2) { clearInterval(t); return i; } return i + 1; }), 600);
    return () => clearInterval(t);
  }, []);

  const days = [
    { day: 1, emoji: "❌", label: "混亂的開始", desc: "忘記 .gitignore、一個巨大 commit、node_modules 災難", color: "#EF4444" },
    { day: 2, emoji: "💡", label: "覺醒與重做", desc: "學會 atomic commits、逐一修 bug 逐一提交", color: "#F59E0B" },
    { day: 3, emoji: "✅", label: "團隊協作", desc: "乾淨推送、pull before push、與同事同步", color: "#10B981" },
  ];

  return (
    <div style={{ margin: "16px 0" }}>
      {/* 3-day timeline */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {days.map((d, i) => (
          <div key={i} style={{ flex: 1, minWidth: 160, padding: "14px", background: `${d.color}08`, border: `1px solid ${d.color}20`, borderRadius: 12, opacity: visibleIdx >= i ? 1 : 0.2, transform: visibleIdx >= i ? "translateY(0)" : "translateY(10px)", transition: "all 0.5s ease" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{d.emoji}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: d.color, marginBottom: 4 }}>Day {d.day}：{d.label}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{d.desc}</div>
          </div>
        ))}
      </div>

      {/* Key takeaways */}
      <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, marginBottom: 10 }}>🏆 關鍵收穫</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {summaryPoints.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(232,200,114,0.04)", border: "1px solid rgba(232,200,114,0.1)", borderRadius: 8, animation: `fadeInUp 0.3s ease ${0.8 + i * 0.1}s both` }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{p.icon}</span>
            <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>{p.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Day Divider
   ═══════════════════════════════════════ */
function DayDivider({ day, label, emoji }) {
  const colors = { 1: "#3B82F6", 2: "#F59E0B", 3: "#10B981" };
  const c = colors[day] || ACCENT;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0 16px", padding: "10px 16px", background: `${c}0A`, borderRadius: 10, border: `1px solid ${c}20` }}>
      <span style={{ fontSize: 22 }}>{emoji}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, color: c }}>Day {day}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{label}</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════ */
export default function GitHandsOn() {
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

  /* Day divider logic */
  const prevDay = currentStep > 0 ? STEPS[currentStep - 1].day : 0;
  const showDayDivider = step.day > 0 && step.day !== prevDay;
  const dayLabels = { 1: { label: "興奮的開始（和踩坑）", emoji: "😄" }, 2: { label: "混亂中學習", emoji: "🐛" }, 3: { label: "團隊協作", emoji: "🚀" } };

  return (
    <div style={{ minHeight: "100%", background: "#080C12", color: "#E6EDF3", fontFamily: "'Noto Sans TC', 'Segoe UI', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 24px" }}>
      <div style={{ width: "100%", maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#0D1117", fontFamily: "'JetBrains Mono', monospace" }}>10</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>實戰演練：從零到 GitHub</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Git 課程系列 · 第十堂</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: ACCENT, fontFamily: "'JetBrains Mono', monospace", background: "rgba(232,200,114,0.1)", padding: "4px 10px", borderRadius: 6 }}>⭐ {score}/{STEPS.length}</div>
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 28 }}>
          {STEPS.map((_, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= currentStep ? `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})` : "rgba(255,255,255,0.06)", transition: "background 0.4s" }} />)}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 8, fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap" }}>{currentStep + 1}/{STEPS.length}</span>
        </div>

        {/* Day divider */}
        {showDayDivider && <DayDivider day={step.day} {...dayLabels[step.day]} />}

        {/* Step content */}
        <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "26px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>{step.emoji}</span>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{step.title}</h2>
          </div>

          {step.conceptBlocks && <ConceptBlocks blocks={step.conceptBlocks} />}
          {step.story && <div style={{ padding: "14px 16px", background: "rgba(245,158,11,0.05)", borderLeft: "3px solid #F59E0B", borderRadius: "0 10px 10px 0", fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, marginBottom: 8 }}><span style={{ fontWeight: 700, color: "#F59E0B" }}>📖 情境：</span>{step.story}</div>}
          {step.tip && <div style={{ padding: "14px 16px", background: "rgba(16,185,129,0.04)", borderLeft: "3px solid #10B981", borderRadius: "0 10px 10px 0", fontSize: 12.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, marginBottom: 4 }}><span style={{ fontWeight: 700, color: "#10B981" }}>💼 實務觀點：</span>{step.tip}</div>}

          {/* Custom demos */}
          {step.fileBloatDemo && <FileBloatDemo />}
          {step.commitCompare && <CommitCompare />}
          {step.bugFixFlow && <BugFixFlow onAllComplete={handleTermDone} />}
          {step.cleanTimeline && <CleanTimeline />}
          {step.pushSuccessDemo && <PushSuccessDemo />}
          {step.pullDemo && <PullDemo />}
          {step.journeyReflection && <JourneyReflection summaryPoints={step.summaryPoints} />}

          {/* Terminal sim for command steps */}
          {step.commands && <TerminalSim key={currentStep} commands={step.commands} onAllComplete={handleTermDone} />}

          {/* Quiz */}
          <Quiz key={`q-${currentStep}`} quiz={step.quiz} onComplete={handleQuizDone} />
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 12 }}>
          {currentStep === 0 ? (
            prevPath ? <button onClick={() => navigate(prevPath)} className="btn-nav" style={{ padding: "12px 24px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← 上一章</button> : <div />
          ) : (
            <button onClick={goPrev} className="btn-nav" style={{ padding: "12px 24px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← 上一課</button>
          )}
          {currentStep === STEPS.length - 1 ? (
            nextPath ? <button onClick={() => navigate(nextPath)} className="btn-gold" style={{ padding: "12px 24px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, border: "none", borderRadius: 10, color: "#0D1117", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>下一章 →</button> : <div />
          ) : (
            <button onClick={goNext} className="btn-gold" style={{ padding: "12px 24px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, border: "none", borderRadius: 10, color: "#0D1117", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>下一課 →</button>
          )}
        </div>
      </div>
    </div>
  );
}
