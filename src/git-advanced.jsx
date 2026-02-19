import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────
   COURSE DATA
   ───────────────────────────────────────────── */
const STEPS = [
  {
    id: "stash",
    title: "暫存工作：git stash",
    emoji: "🧊",
    scenario:
      "你正在開發新功能，突然接到緊急 bug 修復任務。但目前的修改還沒完成，不想 commit 半成品…",
    concept:
      "git stash 可以把目前未提交的修改「冰凍」起來，讓工作目錄回到乾淨狀態。等忙完後再「解凍」回來繼續開發。",
    commands: [
      {
        prompt: "先把目前的修改暫存起來",
        answer: "git stash",
        output: "Saved working directory and index state WIP on feature: a3f1d2e add login form",
        hint: "使用 stash 指令把修改暫存",
      },
      {
        prompt: "切換到 main 分支修復 bug",
        answer: "git checkout main",
        output: "Switched to branch 'main'",
        hint: "用 checkout 切換到 main",
      },
      {
        prompt: "bug 修好了，切回 feature 分支",
        answer: "git checkout feature",
        output: "Switched to branch 'feature'",
        hint: "用 checkout 切換回 feature",
      },
      {
        prompt: "把之前暫存的修改取回來",
        answer: "git stash pop",
        output: "On branch feature\nChanges not staged for commit:\n  modified: login.js\nDropped refs/stash@{0}",
        hint: "使用 stash pop 取回暫存",
      },
    ],
    quiz: {
      question: "git stash 和 git stash pop 的關係是？",
      options: [
        { text: "stash 刪除修改，pop 還原修改", correct: false },
        { text: "stash 暫存修改，pop 取回暫存的修改", correct: true },
        { text: "兩者功能完全相同", correct: false },
      ],
    },
  },
  {
    id: "log-diff",
    title: "追蹤歷史：log & diff",
    emoji: "🔍",
    scenario:
      "團隊成員回報某個功能壞了，你需要找出是哪一次 commit 引入了問題，並查看具體改了什麼。",
    concept:
      "git log 讓你瀏覽提交歷史，git diff 讓你精確看到每一行的變更。這兩個指令是 debug 和 code review 的核心工具。",
    commands: [
      {
        prompt: "查看精簡的提交歷史",
        answer: "git log --oneline",
        output:
          "e4f5a6b fix: resolve null pointer in auth\nc3d2e1a feat: add password validation\nb2c1d0f feat: add login form\na1b0c9e init: project setup",
        hint: "log 加上 --oneline 參數",
      },
      {
        prompt: "比較最近兩次 commit 的差異",
        answer: "git diff HEAD~1",
        output:
          "diff --git a/auth.js b/auth.js\n--- a/auth.js\n+++ b/auth.js\n@@ -12,6 +12,8 @@\n  function validate(user) {\n-   return user.token;\n+   if (!user) return null;\n+   return user.token;\n  }",
        hint: "diff HEAD~1 比較前一次 commit",
      },
      {
        prompt: "查看某個檔案的修改歷史",
        answer: "git log --oneline auth.js",
        output: "e4f5a6b fix: resolve null pointer in auth\nc3d2e1a feat: add password validation",
        hint: "在 log --oneline 後面加上檔名",
      },
      {
        prompt: "查看暫存區與上次 commit 的差異",
        answer: "git diff --staged",
        output:
          "diff --git a/config.js b/config.js\n--- a/config.js\n+++ b/config.js\n@@ -1,3 +1,4 @@\n+const DEBUG = true;\n const PORT = 3000;",
        hint: "diff 加上 --staged 參數",
      },
    ],
    quiz: {
      question: "要查看「已 git add 但尚未 commit」的變更，應該用？",
      options: [
        { text: "git diff", correct: false },
        { text: "git diff --staged", correct: true },
        { text: "git log --diff", correct: false },
      ],
    },
  },
  {
    id: "revert-reset",
    title: "後悔藥：reset & revert",
    emoji: "⏪",
    scenario: "你不小心 commit 了一個有問題的版本，需要撤銷這次提交。但什麼時候該用 reset，什麼時候該用 revert？",
    concept:
      "git reset 會「改寫歷史」，適合還沒推到遠端的情況。git revert 會「建立一個反向 commit」來撤銷變更，適合已經推到遠端、團隊共享的情況。",
    commands: [
      {
        prompt: "查看目前的提交歷史",
        answer: "git log --oneline",
        output:
          "f7a8b9c bug: accidentally broke login\ne4f5a6b fix: resolve null pointer\nc3d2e1a feat: add validation",
        hint: "用 log --oneline 查看歷史",
      },
      {
        prompt: "撤銷最近一次 commit（保留修改在工作區）",
        answer: "git reset --soft HEAD~1",
        output: "",
        hint: "reset --soft HEAD~1 保留修改",
      },
      {
        prompt: "確認修改還在暫存區",
        answer: "git status",
        output: "On branch main\nChanges to be committed:\n  modified: login.js",
        hint: "用 status 查看目前狀態",
      },
      {
        prompt: "如果已推到遠端，用安全的方式撤銷一個 commit",
        answer: "git revert HEAD",
        output: '[main g8h9i0j] Revert "bug: accidentally broke login"\n 1 file changed, 2 deletions(-)',
        hint: "用 revert HEAD 建立反向 commit",
      },
    ],
    quiz: {
      question: "已經 push 到遠端的 commit 要撤銷，應該用？",
      options: [
        { text: "git reset --hard", correct: false },
        { text: "git revert", correct: true },
        { text: "直接刪除遠端 branch", correct: false },
      ],
    },
  },
  {
    id: "rebase",
    title: "整理歷史：rebase",
    emoji: "🧬",
    scenario:
      "你的 feature 分支已經落後 main 好幾個 commit。merge 會產生一個合併節點讓歷史變得複雜，有沒有更乾淨的方式？",
    concept:
      "git rebase 會把你的 commit「搬到」目標分支的最新節點之後，產生一條線性的歷史。歷史更乾淨，但不要對已推到遠端的 commit 做 rebase。",
    commands: [
      {
        prompt: "先切換到你的 feature 分支",
        answer: "git checkout feature",
        output: "Switched to branch 'feature'",
        hint: "checkout 到 feature 分支",
      },
      {
        prompt: "把 feature 分支 rebase 到 main 的最新狀態",
        answer: "git rebase main",
        output:
          "First, rewinding head to replay your work on top of it...\nApplying: feat: add search bar\nApplying: feat: add filter options",
        hint: "rebase 後面接目標分支名稱",
      },
      {
        prompt: "Rebase 完成後，切回 main",
        answer: "git checkout main",
        output: "Switched to branch 'main'",
        hint: "checkout 回 main",
      },
      {
        prompt: "用 fast-forward 方式合併 feature",
        answer: "git merge feature",
        output: "Updating e4f5a6b..h1i2j3k\nFast-forward\n search.js | 45 +++++\n filter.js | 32 +++++",
        hint: "merge 加上分支名稱",
      },
    ],
    quiz: {
      question: "為什麼不該對已 push 到遠端的 commit 做 rebase？",
      options: [
        { text: "因為 rebase 太慢", correct: false },
        { text: "因為會改寫歷史，造成其他人的分支混亂", correct: true },
        { text: "因為遠端不支援 rebase", correct: false },
      ],
    },
  },
  {
    id: "workflow",
    title: "實戰：完整協作流程",
    emoji: "🚀",
    scenario: "你要為開源專案貢獻一個新功能。從 fork 到發 PR，走一遍完整的 Git 協作流程。",
    concept:
      "真實的 Git 工作流程通常是：fork → clone → branch → commit → push → Pull Request。這是業界標準的協作模式。",
    commands: [
      {
        prompt: "Clone 遠端儲存庫到本地",
        answer: "git clone https://github.com/user/repo.git",
        output: "Cloning into 'repo'...\nResolving deltas: 100% (234/234), done.",
        hint: "clone 加上遠端 URL",
      },
      {
        prompt: "建立並切換到新的 feature 分支",
        answer: "git checkout -b feature/search",
        output: "Switched to a new branch 'feature/search'",
        hint: "checkout -b 可以同時建立並切換",
      },
      {
        prompt: "完成開發後，加入所有修改到暫存區",
        answer: "git add .",
        output: "",
        hint: "add . 加入所有變更",
      },
      {
        prompt: "提交修改並寫上有意義的訊息",
        answer: "git commit -m \"feat: add search functionality\"",
        output: "[feature/search k4l5m6n] feat: add search functionality\n 3 files changed, 127 insertions(+)",
        hint: "commit -m 加上描述訊息",
        flexible: true,
      },
      {
        prompt: "推送分支到遠端",
        answer: "git push origin feature/search",
        output:
          "Enumerating objects: 8, done.\nCounting objects: 100% (8/8), done.\n * [new branch] feature/search -> feature/search",
        hint: "push origin 加上分支名稱",
      },
    ],
    quiz: {
      question: "git checkout -b new-branch 等同於哪兩個指令的組合？",
      options: [
        { text: "git branch new-branch + git checkout new-branch", correct: true },
        { text: "git init + git checkout new-branch", correct: false },
        { text: "git clone + git branch new-branch", correct: false },
      ],
    },
  },
];

/* ─────────────────────────────────────────────
   TYPEWRITER INPUT COMPONENT
   ───────────────────────────────────────────── */
function CommandInput({ command, onComplete }) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("typing"); // typing | correct | wrong
  const [showHint, setShowHint] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    setInput("");
    setStatus("typing");
    setShowHint(false);
    if (inputRef.current) inputRef.current.focus();
  }, [command.answer]);

  const normalize = (s) => s.trim().replace(/\s+/g, " ").replace(/[""'']/g, (c) => {
    if (c === "\u201C" || c === "\u201D") return '"';
    if (c === "\u2018" || c === "\u2019") return "'";
    return c;
  });

  const checkAnswer = () => {
    const norm = normalize(input);
    const expected = normalize(command.answer);

    // For flexible commands (like commit messages), check prefix
    if (command.flexible) {
      const prefix = expected.split('"')[0].split("'")[0].trim();
      if (norm.startsWith(normalize(prefix)) && (norm.includes('"') || norm.includes("'"))) {
        setStatus("correct");
        setTimeout(() => onComplete(), 800);
        return;
      }
    }

    if (norm === expected) {
      setStatus("correct");
      setTimeout(() => onComplete(), 800);
    } else {
      setStatus("wrong");
      setShakeKey((k) => k + 1);
      setTimeout(() => setStatus("typing"), 1200);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      checkAnswer();
    }
  };

  // Character-by-character match for visual feedback
  const expectedNorm = command.answer;
  const getCharStyle = (i) => {
    if (status !== "typing") return {};
    if (i >= input.length) return { color: "rgba(255,255,255,0.15)" };
    if (input[i] === expectedNorm[i]) return { color: "#10B981" };
    return { color: "#EF4444" };
  };

  const borderColor =
    status === "correct"
      ? "#10B981"
      : status === "wrong"
      ? "#EF4444"
      : "rgba(232,200,114,0.3)";

  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.55)",
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ color: "#E8C872", fontWeight: 700 }}>▸</span>
        {command.prompt}
      </div>

      {/* Expected command preview */}
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          color: "rgba(255,255,255,0.18)",
          marginBottom: 6,
          letterSpacing: 0.5,
          height: 18,
          overflow: "hidden",
        }}
      >
        {status === "typing" &&
          expectedNorm.split("").map((ch, i) => (
            <span key={i} style={getCharStyle(i)}>
              {ch}
            </span>
          ))}
      </div>

      {/* Input area */}
      <div
        key={shakeKey}
        style={{
          display: "flex",
          alignItems: "center",
          background: "#0D1117",
          border: `1.5px solid ${borderColor}`,
          borderRadius: 10,
          padding: "0 14px",
          transition: "border-color 0.3s",
          animation: status === "wrong" ? "shake 0.4s ease" : "none",
        }}
      >
        <span
          style={{
            color: "#10B981",
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
          onKeyDown={handleKeyDown}
          disabled={status === "correct"}
          placeholder="輸入 git 指令..."
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
                ? "#10B981"
                : status === "wrong"
                ? "#EF4444"
                : "#E8C872",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            padding: "12px 0",
            caretColor: "#E8C872",
          }}
        />
        {status === "correct" && (
          <span style={{ color: "#10B981", fontSize: 16 }}>✓</span>
        )}
        {status === "wrong" && (
          <span style={{ color: "#EF4444", fontSize: 12, whiteSpace: "nowrap" }}>
            再試一次
          </span>
        )}
      </div>

      {/* Hint toggle */}
      {status === "typing" && (
        <button
          onClick={() => setShowHint(!showHint)}
          style={{
            marginTop: 6,
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.3)",
            fontSize: 11,
            cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace",
            padding: "2px 4px",
          }}
        >
          {showHint ? "隱藏提示" : "💡 需要提示？"}
        </button>
      )}
      {showHint && status === "typing" && (
        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            color: "rgba(232,200,114,0.6)",
            fontStyle: "italic",
            paddingLeft: 4,
          }}
        >
          提示：{command.hint}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   TERMINAL SIMULATION
   ───────────────────────────────────────────── */
function TerminalSim({ commands, onAllComplete }) {
  const [completedIdx, setCompletedIdx] = useState(-1);
  const termRef = useRef(null);

  useEffect(() => {
    setCompletedIdx(-1);
  }, [commands]);

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
    if (completedIdx === commands.length - 1) {
      setTimeout(() => onAllComplete?.(), 600);
    }
  }, [completedIdx, commands.length, onAllComplete]);

  return (
    <div
      style={{
        background: "#0D1117",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden",
        margin: "20px 0",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "10px 14px",
          background: "rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10B981" }} />
        <span
          style={{
            marginLeft: 8,
            fontSize: 11,
            color: "rgba(255,255,255,0.35)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          ~/project — git advanced
        </span>
      </div>

      {/* Terminal body */}
      <div ref={termRef} style={{ padding: "16px", maxHeight: 420, overflowY: "auto" }}>
        {/* Completed commands */}
        {commands.slice(0, completedIdx + 1).map((cmd, i) => (
          <div key={`done-${i}`} style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5 }}>
              <span style={{ color: "#10B981" }}>$ </span>
              <span style={{ color: "#E8C872" }}>{cmd.answer}</span>
              <span style={{ color: "#10B981", marginLeft: 8 }}>✓</span>
            </div>
            {cmd.output && (
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.45)",
                  whiteSpace: "pre-wrap",
                  marginTop: 4,
                  lineHeight: 1.6,
                }}
              >
                {cmd.output}
              </div>
            )}
          </div>
        ))}

        {/* Current command input */}
        {completedIdx < commands.length - 1 && (
          <CommandInput
            key={completedIdx + 1}
            command={commands[completedIdx + 1]}
            onComplete={() => setCompletedIdx((i) => i + 1)}
          />
        )}

        {/* All done */}
        {completedIdx === commands.length - 1 && (
          <div
            style={{
              textAlign: "center",
              padding: "12px 0 4px",
              color: "#10B981",
              fontWeight: 700,
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            🎉 所有指令執行完畢！
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   QUIZ COMPONENT
   ───────────────────────────────────────────── */
function Quiz({ quiz, onComplete }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (i) => {
    if (selected !== null) return;
    setSelected(i);
    if (quiz.options[i].correct) {
      setTimeout(onComplete, 800);
    }
  };

  return (
    <div
      style={{
        margin: "24px 0 0",
        padding: "20px",
        background: "rgba(232,200,114,0.05)",
        borderRadius: 12,
        border: "1px solid rgba(232,200,114,0.15)",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#E8C872",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span>💡</span> 觀念測驗
      </div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", marginBottom: 14 }}>
        {quiz.question}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {quiz.options.map((opt, i) => {
          let bg = "rgba(255,255,255,0.04)";
          let bc = "rgba(255,255,255,0.08)";
          let tc = "rgba(255,255,255,0.7)";
          if (selected === i) {
            if (opt.correct) { bg = "rgba(16,185,129,0.15)"; bc = "#10B981"; tc = "#10B981"; }
            else { bg = "rgba(239,68,68,0.15)"; bc = "#EF4444"; tc = "#EF4444"; }
          } else if (selected !== null && opt.correct) {
            bg = "rgba(16,185,129,0.1)"; bc = "#10B981"; tc = "#10B981";
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              style={{
                padding: "12px 16px", background: bg,
                border: `1px solid ${bc}`, borderRadius: 8,
                color: tc, fontSize: 13, textAlign: "left",
                cursor: selected !== null ? "default" : "pointer",
                transition: "all 0.3s", fontFamily: "inherit",
              }}
            >
              {opt.text}
            </button>
          );
        })}
      </div>
      {selected !== null && !quiz.options[selected].correct && (
        <div style={{ marginTop: 12, fontSize: 12, color: "rgba(239,68,68,0.8)" }}>
          不太對喔，正確答案已用綠色標示 ✨
        </div>
      )}
      {selected !== null && quiz.options[selected].correct && (
        <div style={{ marginTop: 12, fontSize: 12, color: "#10B981", fontWeight: 600 }}>
          ✅ 完全正確！
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PROGRESS BAR
   ───────────────────────────────────────────── */
function ProgressBar({ current, total, score }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i <= current
              ? "linear-gradient(90deg, #E8C872, #D4A843)"
              : "rgba(255,255,255,0.08)",
            transition: "background 0.4s ease",
          }}
        />
      ))}
      <span
        style={{
          fontSize: 11, color: "rgba(255,255,255,0.35)",
          marginLeft: 8, fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap",
        }}
      >
        {current + 1}/{total}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN APP
   ───────────────────────────────────────────── */
export default function GitAdvanced() {
  const [currentStep, setCurrentStep] = useState(0);
  const [terminalDone, setTerminalDone] = useState({});
  const [quizDone, setQuizDone] = useState({});
  const [score, setScore] = useState(0);

  const step = STEPS[currentStep];

  const goNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
  };
  const goPrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleTerminalDone = useCallback(() => {
    setTerminalDone((prev) => ({ ...prev, [currentStep]: true }));
  }, [currentStep]);

  const handleQuizDone = () => {
    if (!quizDone[currentStep]) {
      setQuizDone((prev) => ({ ...prev, [currentStep]: true }));
      setScore((s) => s + 1);
    }
  };

  const canProceed = terminalDone[currentStep] || false;

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#0B0F15",
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38, height: 38, borderRadius: 10,
                background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 900, color: "#fff",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              G+
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Git 版本控制進階</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                互動實戰課程 · 親手輸入每一條指令
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 12, color: "#3B82F6",
              fontFamily: "'JetBrains Mono', monospace",
              background: "rgba(59,130,246,0.1)",
              padding: "4px 10px", borderRadius: 6,
            }}
          >
            ⭐ {score}/{STEPS.length}
          </div>
        </div>

        <ProgressBar current={currentStep} total={STEPS.length} score={score} />

        {/* Step card */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16, padding: "28px 24px",
          }}
        >
          {/* Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>{step.emoji}</span>
            <h2
              style={{
                margin: 0, fontSize: 22, fontWeight: 900,
                background: "linear-gradient(135deg, #60A5FA, #3B82F6)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}
            >
              {step.title}
            </h2>
          </div>

          {/* Scenario */}
          <div
            style={{
              padding: "14px 16px",
              background: "rgba(239,68,68,0.05)",
              borderLeft: "3px solid #F59E0B",
              borderRadius: "0 10px 10px 0",
              fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.8,
              marginBottom: 6,
            }}
          >
            <span style={{ fontWeight: 700, color: "#F59E0B" }}>情境：</span>{step.scenario}
          </div>

          {/* Concept */}
          <div
            style={{
              padding: "14px 16px",
              background: "rgba(59,130,246,0.05)",
              borderLeft: "3px solid #3B82F6",
              borderRadius: "0 10px 10px 0",
              fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.8,
              marginBottom: 4,
            }}
          >
            <span style={{ fontWeight: 700, color: "#3B82F6" }}>概念：</span>{step.concept}
          </div>

          {/* Terminal */}
          <TerminalSim
            key={currentStep}
            commands={step.commands}
            onAllComplete={handleTerminalDone}
          />

          {/* Quiz */}
          <Quiz key={`quiz-${currentStep}`} quiz={step.quiz} onComplete={handleQuizDone} />
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 12 }}>
          <button
            onClick={goPrev}
            disabled={currentStep === 0}
            style={{
              padding: "12px 24px",
              background: currentStep === 0 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10,
              color: currentStep === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.7)",
              fontSize: 13, fontWeight: 600,
              cursor: currentStep === 0 ? "default" : "pointer",
            }}
          >
            ← 上一課
          </button>
          <button
            onClick={goNext}
            disabled={currentStep === STEPS.length - 1}
            style={{
              padding: "12px 24px",
              background:
                currentStep === STEPS.length - 1
                  ? "rgba(255,255,255,0.02)"
                  : "linear-gradient(135deg, #60A5FA, #3B82F6)",
              border: "none", borderRadius: 10,
              color: currentStep === STEPS.length - 1 ? "rgba(255,255,255,0.15)" : "#fff",
              fontSize: 13, fontWeight: 700,
              cursor: currentStep === STEPS.length - 1 ? "default" : "pointer",
            }}
          >
            下一課 →
          </button>
        </div>

        {/* Final completion */}
        {currentStep === STEPS.length - 1 && quizDone[currentStep] && (
          <div
            style={{
              marginTop: 24, textAlign: "center", padding: "24px",
              background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: 14,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>🎓</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#10B981", marginBottom: 6 }}>
              恭喜完成進階課程！
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
              你已經掌握了 stash、log/diff、reset/revert、rebase 以及完整的協作流程。
              <br />
              接下來可以實際在專案中練習這些技巧！
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
