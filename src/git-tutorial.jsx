import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useChapterNav } from "./chapter-context";

const STEPS = [
  {
    id: "intro",
    title: "什麼是版本控制？",
    emoji: "📸",
    content: `想像你在寫論文，每次修改都另存新檔：`,
    files: [
      "論文_v1.docx",
      "論文_v2_修改.docx",
      "論文_v3_最終版.docx",
      "論文_v3_最終版_真的最終.docx",
      "論文_v4_拜託這次是最終版.docx",
    ],
    explanation:
      "Git 就是解決這個混亂的工具。它幫你記錄每一次修改，隨時可以回到任何一個版本，再也不用手動管理一堆檔案。",
    quiz: {
      question: "版本控制最核心的功能是什麼？",
      options: [
        { text: "自動幫你寫程式", correct: false },
        { text: "記錄檔案的每一次變更歷史", correct: true },
        { text: "讓電腦跑更快", correct: false },
      ],
    },
  },
  {
    id: "concepts",
    title: "Git 的三個空間",
    emoji: "🏗️",
    content: "Git 用三個「空間」來管理你的檔案變更：",
    zones: [
      {
        name: "工作目錄",
        eng: "Working Directory",
        icon: "📝",
        desc: "你正在編輯的檔案",
        color: "#F59E0B",
      },
      {
        name: "暫存區",
        eng: "Staging Area",
        icon: "📦",
        desc: "準備好要提交的變更",
        color: "#3B82F6",
      },
      {
        name: "儲存庫",
        eng: "Repository",
        icon: "🏛️",
        desc: "永久保存的版本紀錄",
        color: "#10B981",
      },
    ],
    explanation:
      "就像寄包裹：你先打包物品（工作目錄），放到郵局櫃台（暫存區），最後寄出（提交到儲存庫）。每次提交就是一個永久的存檔點。",
    quiz: {
      question: "「git add」指令會把檔案移到哪裡？",
      options: [
        { text: "工作目錄", correct: false },
        { text: "暫存區（Staging Area）", correct: true },
        { text: "直接提交到儲存庫", correct: false },
      ],
    },
  },
  {
    id: "commands",
    title: "常用指令實戰",
    emoji: "⌨️",
    content: "來模擬一次 Git 操作流程！點擊下方指令，依序完成操作：",
    terminal: true,
    explanation:
      "這就是 Git 最基本的工作流程：修改 → 暫存 → 提交。每次 commit 都會產生一個獨特的 ID（hash），你可以隨時回到任何一個 commit。",
    quiz: {
      question: "正確的 Git 操作順序是？",
      options: [
        { text: "commit → add → push", correct: false },
        { text: "add → commit → push", correct: true },
        { text: "push → commit → add", correct: false },
      ],
    },
  },
  {
    id: "branch",
    title: "分支：平行宇宙",
    emoji: "🌿",
    content: "分支（Branch）是 Git 最強大的功能之一：",
    branchDemo: true,
    explanation:
      "分支讓你可以在不影響主線的情況下，安全地嘗試新功能。開發完成後，再用 merge 合併回主線。這在團隊協作中至關重要。",
    quiz: {
      question: "為什麼要使用分支？",
      options: [
        { text: "讓程式跑更快", correct: false },
        { text: "在不影響主線的情況下開發新功能", correct: true },
        { text: "減少硬碟空間", correct: false },
      ],
    },
  },
  {
    id: "summary",
    title: "課程回顧",
    emoji: "🎓",
    content: "恭喜你完成 Git 入門！讓我們回顧重點：",
    summary: true,
    summaryPoints: [
      { icon: "📸", text: "版本控制：記錄每一次檔案變更" },
      { icon: "🏗️", text: "三個空間：工作目錄 → 暫存區 → 儲存庫" },
      { icon: "⌨️", text: "基本流程：add → commit → push" },
      { icon: "🌿", text: "分支：安全地平行開發" },
    ],
    quiz: {
      question: "Git 和 GitHub 的關係是？",
      options: [
        { text: "完全一樣的東西", correct: false },
        { text: "Git 是工具，GitHub 是托管 Git 儲存庫的雲端平台", correct: true },
        { text: "GitHub 是 Git 的付費版", correct: false },
      ],
    },
  },
];

const TERMINAL_COMMANDS = [
  {
    cmd: "git init",
    output: "Initialized empty Git repository in /my-project/.git/",
    desc: "初始化一個新的 Git 儲存庫",
  },
  {
    cmd: 'echo "Hello" > index.html',
    output: "",
    desc: "建立一個新檔案",
  },
  {
    cmd: "git add index.html",
    output: "",
    desc: "將檔案加入暫存區",
  },
  {
    cmd: 'git commit -m "first commit"',
    output: "[main (root-commit) a1b2c3d] first commit\n 1 file changed, 1 insertion(+)",
    desc: "提交變更到儲存庫",
  },
  {
    cmd: "git log --oneline",
    output: "a1b2c3d first commit",
    desc: "查看提交歷史",
  },
];

function ProgressBar({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background: i <= current ? "#E8C872" : "rgba(255,255,255,0.12)",
            transition: "background 0.4s ease",
          }}
        />
      ))}
      <span
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.4)",
          marginLeft: 8,
          fontFamily: "'JetBrains Mono', monospace",
          whiteSpace: "nowrap",
        }}
      >
        {current + 1}/{total}
      </span>
    </div>
  );
}

function FilesChaos({ files }) {
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    if (visible < files.length) {
      const t = setTimeout(() => setVisible((v) => v + 1), 400);
      return () => clearTimeout(t);
    }
  }, [visible, files.length]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "20px 0" }}>
      {files.map((f, i) => (
        <div
          key={i}
          style={{
            opacity: i < visible ? 1 : 0,
            transform: i < visible ? "translateX(0)" : "translateX(-20px)",
            transition: "all 0.4s ease",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 16px",
            background:
              i === files.length - 1 && i < visible
                ? "rgba(239,68,68,0.15)"
                : "rgba(255,255,255,0.04)",
            borderRadius: 8,
            border:
              i === files.length - 1 && i < visible
                ? "1px solid rgba(239,68,68,0.3)"
                : "1px solid rgba(255,255,255,0.06)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            color: i === files.length - 1 ? "#EF4444" : "rgba(255,255,255,0.7)",
          }}
        >
          <span style={{ fontSize: 16 }}>📄</span>
          {f}
        </div>
      ))}
    </div>
  );
}

function ZonesDemo({ zones }) {
  const [activeZone, setActiveZone] = useState(-1);
  const [filePos, setFilePos] = useState(0);

  const handleClick = () => {
    if (filePos < 3) {
      setActiveZone(filePos);
      setFilePos((p) => p + 1);
    }
  };

  const arrows = ["git add →", "git commit →"];

  return (
    <div style={{ margin: "24px 0" }}>
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "stretch",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {zones.map((z, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                background:
                  filePos > i ? `${z.color}22` : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${filePos > i ? z.color : "rgba(255,255,255,0.08)"}`,
                borderRadius: 12,
                padding: "20px 18px",
                textAlign: "center",
                minWidth: 130,
                transition: "all 0.5s ease",
                transform: filePos > i ? "scale(1.02)" : "scale(1)",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{z.icon}</div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: filePos > i ? z.color : "rgba(255,255,255,0.8)",
                  marginBottom: 2,
                }}
              >
                {z.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.35)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {z.eng}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.5)",
                  marginTop: 8,
                }}
              >
                {z.desc}
              </div>
              {filePos > i && (
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 11,
                    color: z.color,
                    fontFamily: "'JetBrains Mono', monospace",
                    background: `${z.color}15`,
                    padding: "3px 8px",
                    borderRadius: 4,
                    display: "inline-block",
                  }}
                >
                  ✓ my_file.py
                </div>
              )}
            </div>
            {i < 2 && (
              <div
                style={{
                  fontSize: 11,
                  color:
                    filePos > i ? zones[i + 1].color : "rgba(255,255,255,0.2)",
                  fontFamily: "'JetBrains Mono', monospace",
                  textAlign: "center",
                  transition: "color 0.4s",
                  minWidth: 50,
                }}
              >
                {arrows[i]}
              </div>
            )}
          </div>
        ))}
      </div>
      {filePos < 3 && (
        <button
          onClick={handleClick}
          style={{
            display: "block",
            margin: "20px auto 0",
            padding: "10px 24px",
            background: zones[filePos]?.color || "#E8C872",
            color: "#0D1117",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace",
            transition: "transform 0.2s",
          }}
          onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
        >
          {filePos === 0
            ? "📝 編輯檔案"
            : filePos === 1
            ? "📦 git add"
            : "🏛️ git commit"}
        </button>
      )}
      {filePos >= 3 && (
        <div
          style={{
            textAlign: "center",
            marginTop: 16,
            color: "#10B981",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          ✅ 完成！檔案已成功提交到儲存庫
        </div>
      )}
    </div>
  );
}

function TerminalDemo() {
  const [executed, setExecuted] = useState([]);
  const termRef = useRef(null);

  const nextCmd = executed.length;

  const handleExecute = () => {
    if (nextCmd < TERMINAL_COMMANDS.length) {
      setExecuted((prev) => [...prev, TERMINAL_COMMANDS[nextCmd]]);
    }
  };

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [executed]);

  return (
    <div style={{ margin: "20px 0" }}>
      <div
        style={{
          background: "#0D1117",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.1)",
          overflow: "hidden",
        }}
      >
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
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#EF4444",
            }}
          />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#F59E0B",
            }}
          />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#10B981",
            }}
          />
          <span
            style={{
              marginLeft: 8,
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            ~/my-project
          </span>
        </div>
        <div
          ref={termRef}
          style={{
            padding: "14px 16px",
            minHeight: 140,
            maxHeight: 250,
            overflowY: "auto",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12.5,
            lineHeight: 1.7,
          }}
        >
          {executed.map((item, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <div>
                <span style={{ color: "#10B981" }}>$ </span>
                <span style={{ color: "#E8C872" }}>{item.cmd}</span>
              </div>
              {item.output && (
                <div
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {item.output}
                </div>
              )}
            </div>
          ))}
          {nextCmd < TERMINAL_COMMANDS.length && (
            <div style={{ color: "rgba(255,255,255,0.25)" }}>
              <span style={{ color: "#10B981" }}>$ </span>
              <span style={{ animation: "blink 1s infinite" }}>▌</span>
            </div>
          )}
        </div>
      </div>

      {nextCmd < TERMINAL_COMMANDS.length ? (
        <button
          onClick={handleExecute}
          style={{
            display: "block",
            margin: "14px auto 0",
            padding: "10px 20px",
            background: "#E8C872",
            color: "#0D1117",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace",
          }}
          onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
        >
          ▶ 執行：{TERMINAL_COMMANDS[nextCmd].cmd}
        </button>
      ) : (
        <div
          style={{
            textAlign: "center",
            marginTop: 14,
            color: "#10B981",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          🎉 完成所有指令！
        </div>
      )}

      {nextCmd > 0 && nextCmd <= TERMINAL_COMMANDS.length && (
        <div
          style={{
            marginTop: 10,
            textAlign: "center",
            fontSize: 12,
            color: "rgba(255,255,255,0.45)",
            fontStyle: "italic",
          }}
        >
          💡 {TERMINAL_COMMANDS[Math.min(nextCmd - 1, TERMINAL_COMMANDS.length - 1)].desc}
        </div>
      )}
    </div>
  );
}

function BranchDemo() {
  const [step, setStep] = useState(0);
  const stages = [
    { label: "建立分支", desc: "git branch feature" },
    { label: "切換分支", desc: "git checkout feature" },
    { label: "在分支上開發", desc: '修改並 commit "新功能"' },
    { label: "合併回主線", desc: "git merge feature" },
  ];

  return (
    <div style={{ margin: "24px 0" }}>
      <svg viewBox="0 0 500 160" style={{ width: "100%", maxWidth: 500, display: "block", margin: "0 auto" }}>
        {/* Main branch */}
        <line x1="40" y1="50" x2="460" y2="50" stroke="#E8C872" strokeWidth="3" strokeLinecap="round" />
        <text x="20" y="28" fill="#E8C872" fontSize="11" fontFamily="JetBrains Mono, monospace" fontWeight="700">main</text>
        
        {/* Main branch commits */}
        {[80, 160, 400].map((cx, i) => (
          <circle key={i} cx={cx} cy={50} r={8} fill={i <= (step >= 3 ? 2 : 0) ? "#E8C872" : "#1a1f2e"} stroke="#E8C872" strokeWidth="2" />
        ))}

        {/* Feature branch */}
        {step >= 0 && (
          <>
            <path
              d={`M 160 50 Q 200 50 220 100`}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="3"
              strokeLinecap="round"
              opacity={step >= 0 ? 1 : 0.2}
              style={{ transition: "opacity 0.5s" }}
            />
            <line
              x1="220"
              y1="100"
              x2={step >= 3 ? "340" : "340"}
              y2="100"
              stroke="#3B82F6"
              strokeWidth="3"
              strokeLinecap="round"
              opacity={step >= 1 ? 1 : 0.2}
              style={{ transition: "opacity 0.5s" }}
            />
            <text x="220" y="135" fill="#3B82F6" fontSize="11" fontFamily="JetBrains Mono, monospace" fontWeight="700"
              opacity={step >= 0 ? 1 : 0}
            >feature</text>
          </>
        )}

        {/* Feature branch commits */}
        {step >= 2 && (
          <>
            <circle cx={280} cy={100} r={8} fill="#3B82F6" stroke="#3B82F6" strokeWidth="2" />
            <circle cx={340} cy={100} r={8} fill="#3B82F6" stroke="#3B82F6" strokeWidth="2" />
          </>
        )}

        {/* Merge line */}
        {step >= 3 && (
          <>
            <path
              d="M 340 100 Q 370 100 400 50"
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="6,4"
            />
            <circle cx={400} cy={50} r={10} fill="#10B981" stroke="#10B981" strokeWidth="2" />
            <text x="390" y="28" fill="#10B981" fontSize="10" fontFamily="JetBrains Mono, monospace" fontWeight="700">merge!</text>
          </>
        )}
      </svg>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
        {stages.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            style={{
              padding: "8px 14px",
              background: step === i ? "rgba(232,200,114,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${step === i ? "#E8C872" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 8,
              color: step === i ? "#E8C872" : "rgba(255,255,255,0.5)",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
              transition: "all 0.3s",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div
        style={{
          textAlign: "center",
          marginTop: 10,
          fontSize: 12,
          color: "rgba(255,255,255,0.45)",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {stages[step].desc}
      </div>
    </div>
  );
}

function Quiz({ quiz, onComplete }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (i) => {
    if (selected !== null) return;
    setSelected(i);
    if (quiz.options[i].correct) {
      setTimeout(onComplete, 1000);
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
        <span>💡</span> 小測驗
      </div>
      <div
        style={{
          fontSize: 14,
          color: "rgba(255,255,255,0.85)",
          marginBottom: 14,
        }}
      >
        {quiz.question}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {quiz.options.map((opt, i) => {
          let bg = "rgba(255,255,255,0.04)";
          let borderColor = "rgba(255,255,255,0.08)";
          let textColor = "rgba(255,255,255,0.7)";

          if (selected === i) {
            if (opt.correct) {
              bg = "rgba(16,185,129,0.15)";
              borderColor = "#10B981";
              textColor = "#10B981";
            } else {
              bg = "rgba(239,68,68,0.15)";
              borderColor = "#EF4444";
              textColor = "#EF4444";
            }
          } else if (selected !== null && opt.correct) {
            bg = "rgba(16,185,129,0.1)";
            borderColor = "#10B981";
            textColor = "#10B981";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              style={{
                padding: "12px 16px",
                background: bg,
                border: `1px solid ${borderColor}`,
                borderRadius: 8,
                color: textColor,
                fontSize: 13,
                cursor: selected !== null ? "default" : "pointer",
                textAlign: "left",
                transition: "all 0.3s",
                fontFamily: "inherit",
              }}
              onMouseOver={(e) => {
                if (selected === null) {
                  e.target.style.background = "rgba(255,255,255,0.08)";
                }
              }}
              onMouseOut={(e) => {
                if (selected === null) {
                  e.target.style.background = bg;
                }
              }}
            >
              {opt.text}
            </button>
          );
        })}
      </div>
      {selected !== null && !quiz.options[selected].correct && (
        <div
          style={{
            marginTop: 12,
            fontSize: 12,
            color: "rgba(239,68,68,0.8)",
          }}
        >
          再想想看！正確答案已用綠色標示 ✨
        </div>
      )}
      {selected !== null && quiz.options[selected].correct && (
        <div
          style={{
            marginTop: 12,
            fontSize: 12,
            color: "#10B981",
            fontWeight: 600,
          }}
        >
          ✅ 答對了！
        </div>
      )}
    </div>
  );
}

function SummaryView({ points }) {
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    if (visible < points.length) {
      const t = setTimeout(() => setVisible((v) => v + 1), 500);
      return () => clearTimeout(t);
    }
  }, [visible, points.length]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, margin: "20px 0" }}>
      {points.map((p, i) => (
        <div
          key={i}
          style={{
            opacity: i < visible ? 1 : 0,
            transform: i < visible ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.5s ease",
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "14px 18px",
            background: "rgba(232,200,114,0.06)",
            borderRadius: 10,
            border: "1px solid rgba(232,200,114,0.12)",
          }}
        >
          <span style={{ fontSize: 22 }}>{p.icon}</span>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{p.text}</span>
        </div>
      ))}
    </div>
  );
}

export default function GitTutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  useEffect(() => { window.scrollTo(0, 0); }, [currentStep]);
  const [quizCompleted, setQuizCompleted] = useState({});
  const [score, setScore] = useState(0);
  const navigate = useNavigate();
  const { prevPath, nextPath } = useChapterNav();

  const step = STEPS[currentStep];

  const goNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleQuizComplete = () => {
    if (!quizCompleted[currentStep]) {
      setQuizCompleted((prev) => ({ ...prev, [currentStep]: true }));
      setScore((s) => s + 1);
    }
  };

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#0D1117",
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
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #E8C872, #D4A843)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 900,
                color: "#0D1117",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              G
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Git 版本控制入門</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>5 分鐘互動課程</div>
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

        <ProgressBar current={currentStep} total={STEPS.length} />

        {/* Step Content */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16,
            padding: "28px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 28 }}>{step.emoji}</span>
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 900,
                background: "linear-gradient(135deg, #E8C872, #F5E6B8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {step.title}
            </h2>
          </div>

          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.7,
              margin: "0 0 4px",
            }}
          >
            {step.content}
          </p>

          {/* Conditional renders */}
          {step.files && <FilesChaos files={step.files} />}
          {step.zones && <ZonesDemo zones={step.zones} />}
          {step.terminal && <TerminalDemo />}
          {step.branchDemo && <BranchDemo />}
          {step.summary && <SummaryView points={step.summaryPoints} />}

          {/* Explanation */}
          <div
            style={{
              margin: "20px 0 0",
              padding: "16px",
              background: "rgba(59,130,246,0.06)",
              borderLeft: "3px solid #3B82F6",
              borderRadius: "0 8px 8px 0",
              fontSize: 13,
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.8,
            }}
          >
            {step.explanation}
          </div>

          {/* Quiz */}
          <Quiz
            key={currentStep}
            quiz={step.quiz}
            onComplete={handleQuizComplete}
          />
        </div>

        {/* Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 20,
            gap: 12,
          }}
        >
          {currentStep === 0 ? (
            prevPath ? (
              <button onClick={() => navigate(prevPath)} style={{ padding: "12px 24px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.3s" }}>← 上一章</button>
            ) : <div />
          ) : (
            <button onClick={goPrev} style={{ padding: "12px 24px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.3s" }}>← 上一課</button>
          )}
          {currentStep === STEPS.length - 1 ? (
            nextPath ? (
              <button onClick={() => navigate(nextPath)} style={{ padding: "12px 24px", background: "linear-gradient(135deg, #E8C872, #D4A843)", border: "none", borderRadius: 10, color: "#0D1117", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.3s" }}>下一章 →</button>
            ) : <div />
          ) : (
            <button onClick={goNext} style={{ padding: "12px 24px", background: "linear-gradient(135deg, #E8C872, #D4A843)", border: "none", borderRadius: 10, color: "#0D1117", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.3s" }}>下一課 →</button>
          )}
        </div>
      </div>
    </div>
  );
}
