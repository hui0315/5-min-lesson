import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useChapterNav } from "./chapter-context";

/* ══════════════════════════════════════════════
   第三堂：日常工作流
   ══════════════════════════════════════════════ */

const ACCENT = "#E8C872";
const ACCENT2 = "#D4A843";

const STEPS = [
  {
    id: "check-status",
    title: "開工前：先看看現在的狀態",
    emoji: "🔍",
    type: "scenario",
    story:
      "你昨天把專案推上 GitHub，今天打開想繼續開發。第一步永遠是：先看看現在的狀態。",
    tip:
      "養成習慣：每次打開專案，先 git status + git log --oneline。就像醫生看診先量血壓，確認一切正常再開始。",
    commands: [
      {
        prompt: "查看目前的分支和未提交的變更",
        answer: "git status",
        output:
          "On branch main\nnothing to commit, working tree clean",
        hint: "status 查看狀態",
      },
      {
        prompt: "查看最近的 commit 歷史",
        answer: "git log --oneline",
        output:
          "a1b2c3d feat: initial project setup\nb4c5d6e docs: add README\nc7d8e9f style: format code",
        hint: "log --oneline 查看簡短歷史",
      },
    ],
    quiz: {
      question: "看到 'nothing to commit, working tree clean' 代表什麼？",
      options: [
        {
          text: "所有修改都已提交，目前沒有未追蹤的變更",
          correct: true,
        },
        { text: "Git 壞掉了什麼都沒追蹤", correct: false },
        { text: "你的程式碼沒有任何 bug", correct: false },
      ],
    },
  },
  {
    id: "fix-first-bug",
    title: "修第一個 Bug：一次只做一件事",
    emoji: "🐛",
    type: "scenario",
    story:
      "你發現首頁的按鈕顏色錯了、導航列有跑版、還有一個表單驗證沒寫。你的本能是全部改完再 commit，但這樣會讓歷史變成一團「什麼都改了但不知道改了什麼」。正確做法：一次只修一件事。",
    tip:
      "每次 commit 應該是一個「有意義的最小單位」。修了一個 bug 就 commit 一次。這樣未來出問題時，可以精確 revert 那一個修改，不會連帶影響其他東西。",
    commands: [
      {
        prompt: "檢查你修改了哪些檔案",
        answer: "git diff",
        output:
          "diff --git a/src/Button.jsx b/src/Button.jsx\n-  color: blue\n+  color: red",
        hint: "diff 查看修改差異",
      },
      {
        prompt: "暫存按鈕修改",
        answer: "git add src/Button.jsx",
        output: "",
        hint: "add 檔案名稱",
      },
      {
        prompt: "提交按鈕顏色修改",
        answer: 'git commit -m "fix: correct button color on homepage"',
        output:
          '[main d1e2f3g] fix: correct button color on homepage\n 1 file changed, 1 insertion(+), 1 deletion(-)',
        hint: 'commit -m "訊息"',
        flexible: true,
      },
    ],
    quiz: {
      question: "你一次改了 3 個 bug，最好的做法是？",
      options: [
        { text: "全部改完一次 commit 比較省事", correct: false },
        {
          text: "每修一個 bug 就 commit 一次，訊息寫清楚改了什麼",
          correct: true,
        },
        { text: "不 commit 直接 push 上去", correct: false },
      ],
    },
  },
  {
    id: "fix-second-bug",
    title: "修第二個 Bug：建立節奏感",
    emoji: "🔄",
    type: "scenario",
    story:
      "按鈕顏色修好了，接著處理導航列跑版。重複同樣的循環：修改 → 確認差異 → 暫存 → commit。",
    tip:
      "注意 commit 訊息的 type 前綴：修外觀用 style:（不影響邏輯），修功能性 bug 用 fix:。導航列「跑版」是樣式問題，所以用 style:。",
    commands: [
      {
        prompt: "檢查導航列的修改",
        answer: "git diff",
        output:
          "diff --git a/src/Navbar.css b/src/Navbar.css\n-  padding: 10px\n+  padding: 10px 16px",
        hint: "diff 查看差異",
      },
      {
        prompt: "暫存導航列修改",
        answer: "git add src/Navbar.css",
        output: "",
        hint: "add 檔案名稱",
      },
      {
        prompt: "提交導航列樣式修改",
        answer: 'git commit -m "style: fix navbar layout overflow"',
        output:
          '[main e4f5g6h] style: fix navbar layout overflow\n 1 file changed, 1 insertion(+), 1 deletion(-)',
        hint: 'commit -m "訊息"',
        flexible: true,
      },
      {
        prompt: "確認目前狀態",
        answer: "git status",
        output:
          "On branch main\nnothing to commit, working tree clean",
        hint: "status 確認",
      },
    ],
    quiz: {
      question: "導航列跑版是「樣式」問題，最適合的 commit 前綴是？",
      options: [
        { text: "fix: 因為是修復問題", correct: false },
        {
          text: "style: 因為是調整外觀且不影響功能邏輯",
          correct: true,
        },
        { text: "feat: 因為導航列變更好了", correct: false },
      ],
    },
  },
  {
    id: "push-and-verify",
    title: "推送上雲端：確認你的進度",
    emoji: "🚀",
    type: "scenario",
    story:
      "兩個 bug 修完了，先推上 GitHub 保存進度。不用等全部做完才推——頻繁推送就是頻繁備份。",
    tip:
      "有些人覺得「還沒做完不能 push」，這是錯的。Push 只是把你的 commit 同步到雲端。只要每個 commit 本身是完整的修改，隨時 push 都沒問題。",
    commands: [
      {
        prompt: "檢查目前有幾個本地 commit 還沒推到雲端",
        answer: "git log --oneline",
        output:
          "d1e2f3g fix: correct button color on homepage\ne4f5g6h style: fix navbar layout overflow\na1b2c3d feat: initial project setup",
        hint: "log --oneline 查看歷史",
      },
      {
        prompt: "推送到 GitHub",
        answer: "git push",
        output:
          "Enumerating objects: 8, done.\nCounting objects: 100% (8/8), done.\nTo https://github.com/user/my-project.git\n   c7d8e9f..e4f5g6h  main -> main",
        hint: "push 推送",
      },
    ],
    quiz: {
      question: "什麼時候應該 git push？",
      options: [
        { text: "等所有功能都完成才 push", correct: false },
        { text: "每天下班前 push 一次就好", correct: false },
        {
          text: "每做完一個有意義的 commit 就可以 push",
          correct: true,
        },
      ],
    },
  },
  {
    id: "another-bug",
    title: "糟糕，又發現新 Bug！",
    emoji: "😱",
    type: "scenario",
    story:
      "推完之後你檢查線上版本，發現表單驗證還沒寫。沒關係，這就是日常！繼續同樣的循環。",
    tip:
      "很多新手覺得「剛 push 完又要改，是不是效率很差？」其實不是。每個 commit 都很小、很清楚，這樣做反而是最高效的。比起攢了 20 個修改然後一次推、出問題了卻找不到是哪個修改弄壞的，頻繁小 commit 才是專業做法。",
    commands: [
      {
        prompt: "檢查表單驗證的修改",
        answer: "git diff",
        output:
          "diff --git a/src/Form.jsx b/src/Form.jsx\n+ const validateEmail = (email) => { ... }",
        hint: "diff 查看差異",
      },
      {
        prompt: "暫存表單修改",
        answer: "git add src/Form.jsx",
        output: "",
        hint: "add 檔案名稱",
      },
      {
        prompt: "提交表單驗證功能",
        answer: 'git commit -m "feat: add form input validation"',
        output:
          '[main h7i8j9k] feat: add form input validation\n 1 file changed, 8 insertions(+)',
        hint: 'commit -m "訊息"',
        flexible: true,
      },
      {
        prompt: "推送到 GitHub",
        answer: "git push",
        output:
          "Enumerating objects: 5, done.\nCounting objects: 100% (5/5), done.\nTo https://github.com/user/my-project.git\n   e4f5g6h..h7i8j9k  main -> main",
        hint: "push 推送",
      },
    ],
    quiz: {
      question: "為什麼「表單驗證」用 feat: 而不是 fix:？",
      options: [
        { text: "兩個都可以，沒差", correct: false },
        {
          text: "因為這是「新增」一個原本不存在的功能，不是修復壞掉的東西",
          correct: true,
        },
        { text: "因為 feat 比 fix 重要", correct: false },
      ],
    },
  },
  {
    id: "review-history",
    title: "回顧：你的 Git 日常節奏",
    emoji: "📊",
    type: "concept",
    conceptBlocks: [
      {
        title: "你今天的成果",
        color: ACCENT,
        content:
          "三個獨立的 commit，每個都有清楚的訊息。任何人看 git log 都能一眼看懂你做了什麼。",
      },
      {
        title: "日常節奏口訣",
        color: "#10B981",
        content:
          "開工先 status → 改一件事 → diff 確認 → add 相關檔案 → commit 寫清楚 → push 上雲端 → 重複。",
      },
      {
        title: "vs 新手常見做法",
        color: "#EF4444",
        content:
          "全部改完 → git add . → git commit -m 'update' → push。問題：歷史模糊、無法精確回溯、出問題時要全部 revert。",
      },
    ],
    explanation:
      "記住：Git 不是「做完才上傳」的工具，它是你的開發節奏。像呼吸一樣：改→ commit → 改 → commit → push。",
    quiz: {
      question: "以下哪個 git log 歷史最「健康」？",
      options: [
        {
          text: "a1b update\nb2c fix\nc3d update again",
          correct: false,
        },
        {
          text: "a1b fix: button color\nb2c style: navbar layout\nc3d feat: form validation",
          correct: true,
        },
        {
          text: "a1b changed everything in the project",
          correct: false,
        },
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
    setInput("");
    setStatus("typing");
    setShowHint(false);
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus({ preventScroll: true });
    }, 100);
  }, [command.answer]);

  const normalize = (s) =>
    s
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[""'']/g, (c) =>
        ({ "\u201C": '"', "\u201D": '"', "\u2018": "'", "\u2019": "'" }[c] || c)
      );

  const checkAnswer = () => {
    const norm = normalize(input),
      expected = normalize(command.answer);
    if (command.flexible) {
      const prefix = expected.split('"')[0].split("'")[0].trim();
      if (
        norm.startsWith(normalize(prefix)) &&
        (norm.includes('"') || norm.includes("'"))
      ) {
        setStatus("correct");
        setTimeout(onComplete, 700);
        return;
      }
    }
    if (norm === expected) {
      setStatus("correct");
      setTimeout(onComplete, 700);
    } else {
      setStatus("wrong");
      setShakeKey((k) => k + 1);
      setTimeout(() => setStatus("typing"), 1200);
    }
  };

  const expectedNorm = command.answer;
  const getCharColor = (i) => {
    if (status !== "typing" || i >= input.length)
      return "rgba(255,255,255,0.12)";
    return input[i] === expectedNorm[i] ? "#E8C872" : "#EF4444";
  };
  const borderColor =
    status === "correct"
      ? "#E8C872"
      : status === "wrong"
      ? "#EF4444"
      : "rgba(255,255,255,0.15)";

  return (
    <div style={{ marginBottom: 6 }}>
      <div
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.55)",
          marginBottom: 8,
          display: "flex",
          gap: 8,
          lineHeight: 1.6,
        }}
      >
        <span style={{ color: "#E8C872", fontWeight: 700, flexShrink: 0 }}>
          ▸
        </span>
        <span>{command.prompt}</span>
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11.5,
          height: 16,
          overflow: "hidden",
          marginBottom: 4,
          marginLeft: 24,
        }}
      >
        {status === "typing" &&
          expectedNorm
            .split("")
            .map((ch, i) => (
              <span key={i} style={{ color: getCharColor(i) }}>
                {ch}
              </span>
            ))}
      </div>
      <div
        key={shakeKey}
        style={{
          display: "flex",
          alignItems: "center",
          background: "rgba(0,0,0,0.3)",
          border: `1.5px solid ${borderColor}`,
          borderRadius: 8,
          padding: "0 12px",
          marginLeft: 24,
          transition: "border-color 0.3s",
          animation: status === "wrong" ? "shake 0.4s ease" : "none",
        }}
      >
        <span
          style={{
            color: "#E8C872",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            marginRight: 8,
            userSelect: "none",
          }}
        >
          $
        </span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => {
            if (status === "typing") setInput(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) checkAnswer();
          }}
          disabled={status === "correct"}
          placeholder="輸入指令..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color:
              status === "correct"
                ? "#E8C872"
                : status === "wrong"
                ? "#EF4444"
                : "#E8C872",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            padding: "11px 0",
            caretColor: "#E8C872",
          }}
        />
        {status === "correct" && (
          <span style={{ color: "#E8C872", fontSize: 14 }}>✓</span>
        )}
        {status === "wrong" && (
          <span style={{ color: "#EF4444", fontSize: 11 }}>再試一次</span>
        )}
      </div>
      {status === "typing" && (
        <button
          onClick={() => setShowHint(!showHint)}
          style={{
            marginTop: 4,
            marginLeft: 24,
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.25)",
            fontSize: 11,
            cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {showHint ? "隱藏提示" : "💡 提示"}
        </button>
      )}
      {showHint && status === "typing" && (
        <div
          style={{
            marginTop: 2,
            marginLeft: 24,
            fontSize: 11.5,
            color: "rgba(232,200,114,0.53)",
            fontStyle: "italic",
          }}
        >
          {command.hint}
        </div>
      )}
    </div>
  );
}

function TerminalSim({ commands, onAllComplete }) {
  const [completedIdx, setCompletedIdx] = useState(-1);
  const termRef = useRef(null);
  useEffect(() => {
    setCompletedIdx(-1);
  }, [commands]);
  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
    if (completedIdx === commands.length - 1)
      setTimeout(() => onAllComplete?.(), 500);
  }, [completedIdx, commands.length, onAllComplete]);

  return (
    <div
      style={{
        background: "#080C12",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
        margin: "16px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "9px 14px",
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#EF4444" }} />
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#F59E0B" }} />
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#10B981" }} />
        <span
          style={{
            marginLeft: 8,
            fontSize: 10.5,
            color: "rgba(255,255,255,0.3)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          terminal — daily workflow
        </span>
      </div>
      <div ref={termRef} style={{ padding: "14px 16px", maxHeight: 400, overflowY: "auto" }}>
        {commands.slice(0, completedIdx + 1).map((cmd, i) => (
          <div key={`done-${i}`} style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
              <span style={{ color: "#10B981" }}>$ </span>
              <span style={{ color: "#E8C872" }}>{cmd.answer}</span>
              <span style={{ color: "#E8C872", marginLeft: 8, fontSize: 11 }}>✓</span>
            </div>
            {cmd.output && (
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11.5,
                  color: "rgba(255,255,255,0.4)",
                  whiteSpace: "pre-wrap",
                  marginTop: 3,
                  lineHeight: 1.5,
                }}
              >
                {cmd.output}
              </div>
            )}
          </div>
        ))}
        {completedIdx < commands.length - 1 && (
          <CommandInput
            key={completedIdx + 1}
            command={commands[completedIdx + 1]}
            onComplete={() => setCompletedIdx((i) => i + 1)}
          />
        )}
        {completedIdx === commands.length - 1 && (
          <div
            style={{
              textAlign: "center",
              padding: "10px 0 2px",
              color: "#E8C872",
              fontWeight: 700,
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            ✅ 所有指令完成！
          </div>
        )}
      </div>
    </div>
  );
}

function Quiz({ quiz, onComplete }) {
  const [selected, setSelected] = useState(null);
  const handleSelect = (i) => {
    if (selected !== null) return;
    setSelected(i);
    if (quiz.options[i].correct) setTimeout(onComplete, 700);
  };
  return (
    <div
      style={{
        margin: "20px 0 0",
        padding: "18px",
        background: "rgba(232,200,114,0.04)",
        borderRadius: 12,
        border: "1px solid rgba(232,200,114,0.12)",
      }}
    >
      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#E8C872", marginBottom: 12 }}>
        💡 觀念確認
      </div>
      <div
        style={{
          fontSize: 13.5,
          color: "rgba(255,255,255,0.85)",
          marginBottom: 12,
          lineHeight: 1.6,
        }}
      >
        {quiz.question}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {quiz.options.map((opt, i) => {
          let bg = "rgba(255,255,255,0.03)",
            bc = "rgba(255,255,255,0.07)",
            tc = "rgba(255,255,255,0.65)";
          if (selected === i) {
            if (opt.correct) {
              bg = "rgba(232,200,114,0.12)";
              bc = "#E8C872";
              tc = "#E8C872";
            } else {
              bg = "rgba(239,68,68,0.12)";
              bc = "#EF4444";
              tc = "#EF4444";
            }
          } else if (selected !== null && opt.correct) {
            bg = "rgba(232,200,114,0.08)";
            bc = "#E8C872";
            tc = "#E8C872";
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              style={{
                padding: "11px 14px",
                background: bg,
                border: `1px solid ${bc}`,
                borderRadius: 8,
                color: tc,
                fontSize: 13,
                textAlign: "left",
                cursor: selected !== null ? "default" : "pointer",
                transition: "all 0.3s",
                fontFamily: "inherit",
                lineHeight: 1.5,
              }}
            >
              {opt.text}
            </button>
          );
        })}
      </div>
      {selected !== null && !quiz.options[selected].correct && (
        <div style={{ marginTop: 10, fontSize: 11.5, color: "rgba(239,68,68,0.7)" }}>
          正確答案已用綠色標示 ✨
        </div>
      )}
      {selected !== null && quiz.options[selected].correct && (
        <div style={{ marginTop: 10, fontSize: 11.5, color: "#E8C872", fontWeight: 600 }}>
          ✅ 正確！
        </div>
      )}
    </div>
  );
}

function ConceptBlocks({ blocks }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "16px 0" }}>
      {blocks.map((b, i) => (
        <div
          key={i}
          style={{
            padding: "14px 16px",
            background: `${b.color}08`,
            borderLeft: `3px solid ${b.color}`,
            borderRadius: "0 10px 10px 0",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: b.color, marginBottom: 6 }}>
            {b.title}
          </div>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
            {b.content}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════ */
export default function GitDailyWorkflow() {
  const [currentStep, setCurrentStep] = useState(0);
  useEffect(() => { window.scrollTo(0, 0); }, [currentStep]);
  const [termDone, setTermDone] = useState({});
  const [quizDone, setQuizDone] = useState({});
  const [score, setScore] = useState(0);
  const navigate = useNavigate();
  const { prevPath, nextPath } = useChapterNav();

  const step = STEPS[currentStep];
  const goNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
  };
  const goPrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };
  const handleTermDone = useCallback(() => {
    setTermDone((p) => ({ ...p, [currentStep]: true }));
  }, [currentStep]);
  const handleQuizDone = () => {
    if (!quizDone[currentStep]) {
      setQuizDone((p) => ({ ...p, [currentStep]: true }));
      setScore((s) => s + 1);
    }
  };

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#080D14",
        color: "#E6EDF3",
        fontFamily: "'Noto Sans TC', 'Segoe UI', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "28px 24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 900 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "linear-gradient(135deg, #E8C872, #D4A843)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 900,
                color: "#0D1117",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              3
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>
                日常工作流：改 Bug、推送、再改 Bug
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                Git 課程系列 · 第三堂
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#E8C872",
              fontFamily: "'JetBrains Mono', monospace",
              background: "rgba(232,200,114,0.1)",
              padding: "4px 10px",
              borderRadius: 6,
            }}
          >
            ⭐ {score}/{STEPS.length}
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 28 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrentStep(i)}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                cursor: "pointer",
                background:
                  i <= currentStep
                    ? "linear-gradient(90deg, #E8C872, #D4A843)"
                    : "rgba(255,255,255,0.06)",
                transition: "background 0.4s",
                animation: i <= currentStep ? "goldGlow 3s ease-in-out infinite" : "none",
              }}
            />
          ))}
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              marginLeft: 8,
              fontFamily: "'JetBrains Mono', monospace",
              whiteSpace: "nowrap",
            }}
          >
            {currentStep + 1}/{STEPS.length}
          </span>
        </div>

        {/* Content Card */}
        <div
          style={{
            background: "rgba(255,255,255,0.015)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 16,
            padding: "26px 22px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>{step.emoji}</span>
            <h2
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 900,
                background: "linear-gradient(135deg, #E8C872, #D4A843)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {step.title}
            </h2>
          </div>

          {step.conceptBlocks && <ConceptBlocks blocks={step.conceptBlocks} />}
          {step.story && (
            <div
              style={{
                padding: "14px 16px",
                background: "rgba(245,158,11,0.05)",
                borderLeft: "3px solid #F59E0B",
                borderRadius: "0 10px 10px 0",
                fontSize: 13,
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.8,
                marginBottom: 8,
              }}
            >
              <span style={{ fontWeight: 700, color: "#F59E0B" }}>📖 情境：</span>
              {step.story}
            </div>
          )}
          {step.tip && (
            <div
              style={{
                padding: "14px 16px",
                background: "rgba(232,200,114,0.04)",
                borderLeft: "3px solid #E8C872",
                borderRadius: "0 10px 10px 0",
                fontSize: 12.5,
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.8,
                marginBottom: 4,
              }}
            >
              <span style={{ fontWeight: 700, color: "#E8C872" }}>💼 實務觀點：</span>
              {step.tip}
            </div>
          )}
          {step.explanation && (
            <div
              style={{
                padding: "14px 16px",
                background: "rgba(232,200,114,0.04)",
                borderLeft: "3px solid #E8C872",
                borderRadius: "0 10px 10px 0",
                fontSize: 12.5,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.8,
                margin: "12px 0",
              }}
            >
              {step.explanation}
            </div>
          )}
          {step.commands && (
            <TerminalSim
              key={currentStep}
              commands={step.commands}
              onAllComplete={handleTermDone}
            />
          )}
          <Quiz key={`q-${currentStep}`} quiz={step.quiz} onComplete={handleQuizDone} />
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 12 }}>
          {currentStep === 0 ? (
            prevPath ? (
              <button onClick={() => navigate(prevPath)} style={{ padding: "12px 24px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← 上一章</button>
            ) : <div />
          ) : (
            <button onClick={goPrev} style={{ padding: "12px 24px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← 上一課</button>
          )}
          {currentStep === STEPS.length - 1 ? (
            nextPath ? (
              <button onClick={() => navigate(nextPath)} style={{ padding: "12px 24px", background: "linear-gradient(135deg, #E8C872, #D4A843)", border: "none", borderRadius: 10, color: "#0D1117", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>下一章 →</button>
            ) : <div />
          ) : (
            <button onClick={goNext} style={{ padding: "12px 24px", background: "linear-gradient(135deg, #E8C872, #D4A843)", border: "none", borderRadius: 10, color: "#0D1117", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>下一課 →</button>
          )}
        </div>

        {/* Completion */}
        {currentStep === STEPS.length - 1 && quizDone[currentStep] && (
          <div
            style={{
              marginTop: 24,
              textAlign: "center",
              padding: "24px",
              background: "rgba(232,200,114,0.08)",
              border: "1px solid rgba(232,200,114,0.22)",
              borderRadius: 14,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#E8C872", marginBottom: 6 }}>
              恭喜！你掌握了 Git 的日常節奏！
            </div>
            <div
              style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}
            >
              從現在開始，每次開發都要這樣做：狀態、修改、commit、push。
              <br />
              這就是專業開發者的日常！
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
