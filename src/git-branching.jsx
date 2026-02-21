import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useChapterNav } from "./chapter-context";
import { colors, lessonThemes, hexToRgba } from "./theme";

/* ── Animations ── */
const styles = document.createElement("style");
styles.textContent = `
  @keyframes goldGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.3); }
    50% { box-shadow: 0 0 0 8px rgba(52, 211, 153, 0); }
  }
`;
if (typeof document !== "undefined") document.head.appendChild(styles);

/* ══════════════════════════════════════════════
   第四堂：分支管理：安全地開發新功能
   ══════════════════════════════════════════════ */

const { accent: ACCENT, accent2: ACCENT2 } = lessonThemes["/branching"];

const STEPS = [
  {
    id: "why-branch",
    title: "為什麼需要分支？",
    emoji: "🌿",
    type: "concept",
    conceptBlocks: [
      {
        title: "想像 main 是你的正式作品",
        color: ACCENT,
        content:
          "你的網站已經上線，正常運作。如果你直接在 main 上面改程式碼，萬一改壞了，線上版本也會跟著壞。分支就是讓你「開一個副本」，在上面放心改，確認沒問題再合併回 main。",
      },
      {
        title: "分支 ≠ 複製整個專案",
        color: ACCENT2,
        content:
          "Git 的分支非常輕量，只是一個「指標」指向某個 commit。建立分支幾乎不佔空間，切換也是瞬間完成。所以不要怕開分支——開越多越安全。",
      },
      {
        title: "分支命名規範",
        color: "#10B981",
        content:
          "業界慣例用「前綴/描述」格式：feature/ 新功能、hotfix/ 緊急修復、bugfix/ 一般修 bug、chore/ 雜事維護。全小寫，用連字號 - 分隔單字。例：feature/dark-mode。",
      },
    ],
    branchNamingDemo: true,
    explanation: "口訣：在 main 上「看」，在分支上「改」，確認沒問題才「合」。",
    quiz: {
      question: "你想在網站加一個搜尋功能，應該怎麼做？",
      options: [
        { text: "直接在 main 上面改", correct: false },
        { text: "開一個 feature/search 分支來開發", correct: true },
        { text: "把整個專案複製一份到另一個資料夾", correct: false },
      ],
    },
  },
  {
    id: "create-branch",
    title: "建立 Feature 分支",
    emoji: "🔀",
    type: "scenario",
    story: "你想幫網站加上深色模式。第一步：從 main 建立一個新分支。",
    tip: "git checkout -b 是「建立 + 切換」一步完成。-b 代表 branch。也可以分兩步：git branch feature/dark-mode 然後 git checkout feature/dark-mode，但一步完成更方便。",
    commands: [
      {
        prompt: "查看目前有哪些分支",
        answer: "git branch",
        output: "* main",
        hint: "branch 列出分支列表",
      },
      {
        prompt: "建立並切換到新的 feature 分支",
        answer: "git checkout -b feature/dark-mode",
        output: "Switched to a new branch 'feature/dark-mode'",
        hint: "checkout -b 分支名稱",
      },
      {
        prompt: "確認你在 feature 分支上",
        answer: "git branch",
        output: "  main\n* feature/dark-mode",
        hint: "branch 看目前位置",
      },
    ],
    quiz: {
      question: "git checkout -b feature/dark-mode 做了什麼？",
      options: [
        { text: "只建立了分支但沒有切換", correct: false },
        { text: "建立了 feature/dark-mode 分支並自動切換過去", correct: true },
        { text: "把 main 的程式碼刪掉了", correct: false },
      ],
    },
  },
  {
    id: "develop-on-branch",
    title: "在分支上開發",
    emoji: "⚡",
    type: "scenario",
    story:
      "你現在在 feature/dark-mode 分支上。放心地開始寫程式碼！不管怎麼改，main 都不會受影響。",
    tip: "在分支上開發時，commit 的規則跟之前一樣：一次做一件事，寫清楚 commit 訊息。分支上的 commit 不會影響 main，直到你手動合併。",
    commands: [
      {
        prompt: "編輯完 theme.js 後，查看變更",
        answer: "git diff",
        output:
          "+ const darkTheme = { bg: '#0D1117', text: '#E6EDF3' }\n+ const lightTheme = { bg: '#FFFFFF', text: '#000000' }",
        hint: "diff 查看修改內容",
      },
      {
        prompt: "把修改加入暫存區",
        answer: "git add src/theme.js",
        output: "",
        hint: "add 檔案路徑",
      },
      {
        prompt: "提交這個變更",
        answer: 'git commit -m "feat: add dark theme color definitions"',
        output:
          "[feature/dark-mode abc1234] feat: add dark theme color definitions\n 1 file changed, 10 insertions(+)",
        hint: 'commit -m "訊息"',
        flexible: true,
      },
      {
        prompt: "查看分支上的 commit 記錄",
        answer: "git log --oneline",
        output:
          "abc1234 feat: add dark theme color definitions\n123abcd fix: correct button color\n456defg feat: initial project setup",
        hint: "log --oneline 簡潔記錄",
      },
    ],
    quiz: {
      question: "在 feature 分支上 commit 會影響 main 嗎？",
      options: [
        { text: "會，所有分支共用同一份程式碼", correct: false },
        {
          text: "不會，分支上的 commit 只存在這個分支，直到合併",
          correct: true,
        },
        { text: "會，但只有 push 之後才會影響", correct: false },
      ],
    },
  },
  {
    id: "switch-back",
    title: "切回 main 確認：它還是好的",
    emoji: "🔍",
    type: "scenario",
    story: "開發到一半，你想確認 main 還是正常的。切回去看看。",
    tip: "切換分支時，Git 會自動把你的工作目錄切換成該分支的狀態。如果有未 commit 的修改，Git 會警告你——這就是為什麼要養成「改完就 commit」的習慣。",
    commands: [
      {
        prompt: "切回 main 分支",
        answer: "git checkout main",
        output: "Switched to branch 'main'",
        hint: "checkout 分支名稱",
      },
      {
        prompt: "查看 main 上的 commit 記錄",
        answer: "git log --oneline",
        output:
          "123abcd fix: correct button color\n456defg feat: initial project setup\n(注意：沒有 dark theme 的 commit)",
        hint: "log --oneline",
      },
      {
        prompt: "切回 feature 分支繼續開發",
        answer: "git checkout feature/dark-mode",
        output: "Switched to branch 'feature/dark-mode'",
        hint: "checkout 分支名稱",
      },
    ],
    quiz: {
      question: "切回 main 後，你在 feature 分支上的修改去哪了？",
      options: [
        { text: "消失了需要重新寫", correct: false },
        {
          text: "還在 feature/dark-mode 分支上，安全地保存著",
          correct: true,
        },
        { text: "變成未追蹤的檔案了", correct: false },
      ],
    },
  },
  {
    id: "merge-branch",
    title: "合併分支：把成果收回 main",
    emoji: "🎯",
    type: "scenario",
    story:
      "深色模式開發完成！經過測試確認沒問題，現在要把 feature 分支的成果合併回 main。",
    tip: "合併的步驟：先切到 main → 再把 feature 分支 merge 進來 → 合併完成後可以刪掉 feature 分支（它的使命完成了）。刪掉分支不會刪掉 commit，歷史都還在。",
    commands: [
      {
        prompt: "確保你在 main 分支上",
        answer: "git checkout main",
        output: "Switched to branch 'main'",
        hint: "checkout main",
      },
      {
        prompt: "把 feature 分支合併進來",
        answer: "git merge feature/dark-mode",
        output:
          "Updating 123abcd..abc1234\nFast-forward\n src/theme.js | 10 +++++++++\n 1 file changed, 10 insertions(+)",
        hint: "merge 分支名稱",
      },
      {
        prompt: "刪除已完成的 feature 分支",
        answer: "git branch -d feature/dark-mode",
        output: "Deleted branch feature/dark-mode (was abc1234).",
        hint: "branch -d 分支名稱",
      },
      {
        prompt: "查看 main 上合併後的記錄",
        answer: "git log --oneline",
        output:
          "abc1234 feat: add dark theme color definitions\n123abcd fix: correct button color\n456defg feat: initial project setup",
        hint: "log --oneline",
      },
    ],
    quiz: {
      question: "刪掉 feature 分支後，上面的 commit 會消失嗎？",
      options: [
        { text: "會，所以不應該刪除分支", correct: false },
        {
          text: "不會，因為 commit 已經合併到 main 了",
          correct: true,
        },
        { text: "會，但可以用 git stash 救回來", correct: false },
      ],
    },
  },
  {
    id: "hotfix-practice",
    title: "實戰：緊急修 Bug 的完整流程",
    emoji: "🚨",
    type: "scenario",
    story:
      "合併完深色模式後，你發現切換按鈕有 bug。這是一個緊急修復，所以用 hotfix/ 前綴。讓我們練習完整的分支流程。",
    tip: "hotfix/ 分支通常直接從 main 建立，修完馬上合併回去。它的生命週期很短——從發現問題到修復上線，可能就幾分鐘到幾小時。",
    commands: [
      {
        prompt: "建立 hotfix 分支",
        answer: "git checkout -b hotfix/toggle-bug",
        output: "Switched to a new branch 'hotfix/toggle-bug'",
        hint: "checkout -b hotfix/名稱",
      },
      {
        prompt: "修復 bug 後加入暫存區",
        answer: "git add src/Toggle.jsx",
        output: "",
        hint: "add 檔案路徑",
      },
      {
        prompt: "提交 hotfix",
        answer: 'git commit -m "fix: resolve dark mode toggle not responding"',
        output:
          "[hotfix/toggle-bug xyz9876] fix: resolve dark mode toggle not responding\n 1 file changed, 2 insertions(+), 1 deletion(-)",
        hint: 'commit -m "訊息"',
        flexible: true,
      },
      {
        prompt: "切回 main",
        answer: "git checkout main",
        output: "Switched to branch 'main'",
        hint: "checkout main",
      },
      {
        prompt: "合併 hotfix",
        answer: "git merge hotfix/toggle-bug",
        output:
          "Updating abc1234..xyz9876\nFast-forward\n src/Toggle.jsx | 3 ++-\n 1 file changed, 2 insertions(+), 1 deletion(-)",
        hint: "merge 分支名稱",
      },
      {
        prompt: "刪除 hotfix 分支",
        answer: "git branch -d hotfix/toggle-bug",
        output: "Deleted branch hotfix/toggle-bug (was xyz9876).",
        hint: "branch -d 分支名稱",
      },
      {
        prompt: "推送修復到遠端",
        answer: "git push",
        output:
          "To https://github.com/user/my-project.git\n   abc1234..xyz9876  main -> main",
        hint: "push 推送",
      },
    ],
    quiz: {
      question: "hotfix/ 和 feature/ 分支的主要差異是？",
      options: [
        { text: "沒有差異，只是名字不同", correct: false },
        {
          text: "hotfix/ 用於緊急修復且從 main 建立，feature/ 用於新功能開發",
          correct: true,
        },
        { text: "hotfix/ 不需要 commit 就可以合併", correct: false },
      ],
    },
  },
];

/* ── Branch Naming Demo Component ── */
function BranchNamingDemo() {
  const [expanded, setExpanded] = useState(null);
  const examples = [
    {
      id: 0,
      type: "功能分支",
      icon: "✨",
      good: "feature/dark-mode",
      bad: "my-branch",
      description: "新功能開發時使用 feature/ 前綴，用小寫和連字號清楚描述功能",
    },
    {
      id: 1,
      type: "緊急修復",
      icon: "🔥",
      good: "hotfix/login-crash",
      bad: "fix-thing",
      description: "線上緊急修復用 hotfix/，後面加上簡短問題描述",
    },
    {
      id: 2,
      type: "一般修 Bug",
      icon: "🐛",
      good: "bugfix/typo-in-header",
      bad: "test123",
      description: "一般 bug 修復用 bugfix/，避免用不清楚的名字如 test、temp",
    },
    {
      id: 3,
      type: "維護工作",
      icon: "🔧",
      good: "chore/update-deps",
      bad: "misc",
      description: "套件更新、依賴升級等雜事用 chore/，說清楚在做什麼",
    },
  ];

  return (
    <div style={{ margin: "20px 0" }}>
      <div
        style={{
          background: colors.bgDeep,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 16 }}>📋</span>
          <span
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.5)",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
            }}
          >
            分支命名範例
          </span>
        </div>

        {/* Examples */}
        <div style={{ padding: "12px 16px" }}>
          {examples.map((ex) => (
            <div
              key={ex.id}
              onClick={() => setExpanded(expanded === ex.id ? null : ex.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                marginBottom: 8,
                background:
                  expanded === ex.id ? hexToRgba(ACCENT, 0.063) : "rgba(255,255,255,0.02)",
                border: `1px solid ${expanded === ex.id ? hexToRgba(ACCENT, 0.2) : "rgba(255,255,255,0.04)"}`,
                borderRadius: 10,
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{ex.icon}</span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: expanded === ex.id ? ACCENT : "rgba(255,255,255,0.7)",
                    marginBottom: expanded === ex.id ? 8 : 0,
                    transition: "color 0.3s",
                  }}
                >
                  {ex.type}
                </div>
                {expanded === ex.id && (
                  <div
                    style={{
                      fontSize: 11.5,
                      color: "rgba(255,255,255,0.45)",
                      lineHeight: 1.6,
                      marginBottom: 8,
                    }}
                  >
                    {ex.description}
                  </div>
                )}
                {expanded === ex.id && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <div
                      style={{
                        flex: 1,
                        padding: "8px 10px",
                        background: "#10B98120",
                        border: "1px solid #10B981",
                        borderRadius: 6,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 11,
                        color: "#10B981",
                      }}
                    >
                      ✓ {ex.good}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        padding: "8px 10px",
                        background: "#EF444420",
                        border: "1px solid #EF4444",
                        borderRadius: 6,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 11,
                        color: "#EF4444",
                      }}
                    >
                      ✗ {ex.bad}
                    </div>
                  </div>
                )}
              </div>
              <span
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.3)",
                  transition: "transform 0.3s",
                  transform: expanded === ex.id ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                ▼
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
    return input[i] === expectedNorm[i] ? "#10B981" : "#EF4444";
  };
  const borderColor =
    status === "correct"
      ? "#10B981"
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
        <span style={{ color: ACCENT, fontWeight: 700, flexShrink: 0 }}>
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
                ? "#10B981"
                : status === "wrong"
                ? "#EF4444"
                : ACCENT,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            padding: "11px 0",
            caretColor: ACCENT,
          }}
        />
        {status === "correct" && (
          <span style={{ color: "#10B981", fontSize: 14 }}>✓</span>
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
            color: hexToRgba(ACCENT, 0.533),
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
          terminal — branching
        </span>
      </div>
      <div ref={termRef} style={{ padding: "14px 16px", maxHeight: 400, overflowY: "auto" }}>
        {commands.slice(0, completedIdx + 1).map((cmd, i) => (
          <div key={`done-${i}`} style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
              <span style={{ color: "#10B981" }}>$ </span>
              <span style={{ color: ACCENT }}>{cmd.answer}</span>
              <span style={{ color: "#10B981", marginLeft: 8, fontSize: 11 }}>✓</span>
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
              color: "#10B981",
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
        background: hexToRgba(ACCENT, 0.016),
        borderRadius: 12,
        border: hexToRgba(ACCENT, 0.07),
      }}
    >
      <div style={{ fontSize: 12.5, fontWeight: 700, color: ACCENT, marginBottom: 12 }}>
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
              bg = "rgba(16,185,129,0.12)";
              bc = "#10B981";
              tc = "#10B981";
            } else {
              bg = "rgba(239,68,68,0.12)";
              bc = "#EF4444";
              tc = "#EF4444";
            }
          } else if (selected !== null && opt.correct) {
            bg = "rgba(16,185,129,0.08)";
            bc = "#10B981";
            tc = "#10B981";
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
        <div style={{ marginTop: 10, fontSize: 11.5, color: "#10B981", fontWeight: 600 }}>
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
export default function GitBranching() {
  const [currentStep, setCurrentStep] = useState(0);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);
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
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 900,
                color: colors.bg,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              4
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>
                分支管理：安全地開發新功能
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                Git 課程系列 · 第四堂
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 12,
              color: ACCENT,
              fontFamily: "'JetBrains Mono', monospace",
              background: hexToRgba(ACCENT, 0.08),
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
                    ? `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`
                    : "rgba(255,255,255,0.06)",
                transition: "background 0.4s",
                animation: i === currentStep ? "goldGlow 3s ease-in-out infinite" : "none",
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
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {step.title}
            </h2>
          </div>

          {step.conceptBlocks && <ConceptBlocks blocks={step.conceptBlocks} />}
          {step.branchNamingDemo && <BranchNamingDemo />}
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
                background: "rgba(16,185,129,0.04)",
                borderLeft: "3px solid #10B981",
                borderRadius: "0 10px 10px 0",
                fontSize: 12.5,
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.8,
                marginBottom: 4,
              }}
            >
              <span style={{ fontWeight: 700, color: "#10B981" }}>💼 實務觀點：</span>
              {step.tip}
            </div>
          )}
          {step.explanation && (
            <div
              style={{
                padding: "14px 16px",
                background: hexToRgba(ACCENT, 0.016),
                borderLeft: `3px solid ${ACCENT}`,
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
              <button
                onClick={() => navigate(prevPath)}
                style={{
                  padding: "12px 24px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10,
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ← 上一章
              </button>
            ) : (
              <div />
            )
          ) : (
            <button
              onClick={goPrev}
              style={{
                padding: "12px 24px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                color: "rgba(255,255,255,0.6)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ← 上一課
            </button>
          )}
          {currentStep === STEPS.length - 1 ? (
            nextPath ? (
              <button
                onClick={() => navigate(nextPath)}
                style={{
                  padding: "12px 24px",
                  background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
                  border: "none",
                  borderRadius: 10,
                  color: colors.bg,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                下一章 →
              </button>
            ) : (
              <div />
            )
          ) : (
            <button
              onClick={goNext}
              style={{
                padding: "12px 24px",
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
                border: "none",
                borderRadius: 10,
                color: colors.bg,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              下一課 →
            </button>
          )}
        </div>

        {/* Completion */}
        {currentStep === STEPS.length - 1 && quizDone[currentStep] && (
          <div
            style={{
              marginTop: 24,
              textAlign: "center",
              padding: "24px",
              background: hexToRgba(ACCENT, 0.031),
              border: `1px solid ${hexToRgba(ACCENT, 0.133)}`,
              borderRadius: 14,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: ACCENT, marginBottom: 6 }}>
              恭喜！你已掌握分支工作流程！
            </div>
            <div
              style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}
            >
              你現在可以放心地在分支上開發新功能，
              <br />
              不用擔心搞壞線上的 main！
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
