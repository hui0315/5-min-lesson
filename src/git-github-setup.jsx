import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useChapterNav } from "./chapter-context";

/* ══════════════════════════════════════════════
   第二堂：本地到雲端
   ══════════════════════════════════════════════ */

const STEPS = [
  {
    id: "github-repo",
    title: "在 GitHub 建立 Repository",
    emoji: "🏠",
    type: "concept",
    conceptBlocks: [
      {
        title: "什麼是 Repository？",
        color: "#E8C872",
        content:
          "Repository（簡稱 repo）就是你專案在雲端的「家」。目前你所有的 commit 都在你自己的電腦上，建立 GitHub repo 後，就能把程式碼推到雲端，讓別人看到、備份也不怕電腦壞掉。",
      },
      {
        title: "建立 repo 時的四個選項",
        color: "#E8C872",
        content:
          "Description（專案簡介）、Visibility（Public 公開 / Private 私有）、Add a README（專案說明書）、License（授權條款，MIT 最常用）。如果本地已經有專案，README 和 License 建議不要勾，避免和本地歷史衝突。",
      },
    ],
    settingsDemo: true,
    explanation:
      "關鍵原則：如果你是「先有本地專案，再建 GitHub repo」，就讓 repo 保持空的。如果是「先建 repo，再 clone 到本地開始寫」，就可以勾選 README 和 License，讓 GitHub 幫你生成。",
    quiz: {
      question: "本地已經有完整專案，建 GitHub repo 時應該怎麼做？",
      options: [
        { text: "勾選 README 和 License，讓 GitHub 幫你設定好", correct: false },
        { text: "什麼都不勾，保持空的 repo，直接推本地程式碼上去", correct: true },
        { text: "先刪掉本地專案，再從 GitHub clone 下來", correct: false },
      ],
    },
  },
  {
    id: "git-config",
    title: "初始設定：告訴 Git 你是誰",
    emoji: "🪪",
    type: "scenario",
    story:
      "你第一次使用 Git 嘗試 commit，結果被擋下來：「Author identity unknown」。Git 需要知道你的名字和 email，才能記錄在每個 commit 裡面。",
    tip:
      "加了 --global 代表這個設定適用於你電腦上所有的 Git 專案，只需要設定一次。如果某個專案想用不同的身份（例如公司信箱），可以在該專案目錄下用不加 --global 的版本覆蓋。",
    commands: [
      {
        prompt: "設定你的使用者名稱（全域）",
        answer: 'git config --global user.name "Your Name"',
        output: "",
        hint: "config --global user.name + 你的名字",
        flexible: true,
      },
      {
        prompt: "設定你的 email（全域）",
        answer: 'git config --global user.email "you@email.com"',
        output: "",
        hint: "config --global user.email + 你的信箱",
        flexible: true,
      },
      {
        prompt: "確認設定是否正確",
        answer: "git config --list",
        output:
          "user.name=Your Name\nuser.email=you@email.com\ncore.autocrlf=true\ninit.defaultbranch=main",
        hint: "config --list 查看所有設定",
      },
    ],
    quiz: {
      question: "git config --global 的 --global 是什麼意思？",
      options: [
        { text: "設定只對目前的專案有效", correct: false },
        { text: "設定對你電腦上所有的 Git 專案有效", correct: true },
        { text: "設定會同步到 GitHub 上", correct: false },
      ],
    },
  },
  {
    id: "init-add-commit",
    title: "初始化並提交：init → add → commit",
    emoji: "📦",
    type: "scenario",
    story:
      "你有一個完整的 React 專案，想開始用 Git 管理。第一步是在專案目錄裡初始化 Git，然後把所有檔案加入並做第一次 commit。",
    tip:
      "git init 會在專案裡建立一個隱藏的 .git 資料夾，這就是 Git 的「資料庫」。另外，.gitignore 檔案很重要——它告訴 Git 哪些檔案不要追蹤，例如 node_modules/（幾萬個套件檔案）和 .env（密鑰）。Vite 建立專案時通常會自動生成 .gitignore。",
    commands: [
      {
        prompt: "在專案目錄中初始化 Git 儲存庫",
        answer: "git init",
        output:
          "Initialized empty Git repository in /my-react-app/.git/",
        hint: "init 初始化",
      },
      {
        prompt: "查看目前有哪些檔案需要追蹤",
        answer: "git status",
        output:
          "On branch main\n\nNo commits yet\n\nUntracked files:\n  .gitignore\n  index.html\n  package.json\n  src/\n  public/\n  vite.config.js",
        hint: "status 查看狀態",
      },
      {
        prompt: "將所有檔案加入暫存區",
        answer: "git add .",
        output: "",
        hint: "add . 加入全部",
      },
      {
        prompt: "建立第一個 commit",
        answer: 'git commit -m "feat: initial project setup"',
        output:
          '[main (root-commit) a1b2c3d] feat: initial project setup\n 12 files changed, 1205 insertions(+)',
        hint: 'commit -m "訊息"',
        flexible: true,
      },
    ],
    quiz: {
      question: ".gitignore 的作用是什麼？",
      options: [
        { text: "讓 Git 忽略指定的檔案或資料夾，不追蹤它們", correct: true },
        { text: "刪除不需要的檔案", correct: false },
        { text: "把檔案隱藏起來不讓別人看到", correct: false },
      ],
    },
  },
  {
    id: "remote-push",
    title: "連結遠端並推送：remote → push",
    emoji: "🚀",
    type: "scenario",
    story:
      "本地的 commit 完成了，現在要把專案推到剛剛在 GitHub 建立的空 repo 上。你需要告訴 Git 遠端 repo 的位址，然後推送上去。",
    tip:
      "origin 是遠端連結的「別名」，這是慣例名稱，你可以取任何名字但幾乎所有人都用 origin。-M main 把預設分支名改為 main（GitHub 的標準）。-u 讓 Git 記住「這個本地分支對應哪個遠端分支」，之後 git push 就不用每次都打完整路徑。",
    commands: [
      {
        prompt: "把 GitHub repo 的網址加為遠端連結",
        answer: "git remote add origin https://github.com/user/my-project.git",
        output: "",
        hint: "remote add origin + GitHub URL",
      },
      {
        prompt: "確保主分支名稱是 main",
        answer: "git branch -M main",
        output: "",
        hint: "branch -M main 重新命名",
      },
      {
        prompt: "第一次推送到 GitHub（建立追蹤關係）",
        answer: "git push -u origin main",
        output:
          "Enumerating objects: 18, done.\nCounting objects: 100% (18/18), done.\nTo https://github.com/user/my-project.git\n * [new branch]      main -> main\nBranch 'main' set up to track remote branch 'main' from 'origin'.",
        hint: "push -u origin main",
      },
    ],
    quiz: {
      question: "git push -u origin main 中的 -u 是做什麼用的？",
      options: [
        { text: "強制覆蓋遠端的程式碼", correct: false },
        { text: "建立本地分支與遠端分支的追蹤關係，之後只需 git push", correct: true },
        { text: "上傳未追蹤的檔案", correct: false },
      ],
    },
  },
  {
    id: "troubleshooting",
    title: "常見問題排除",
    emoji: "🔧",
    type: "concept",
    conceptBlocks: [
      {
        title: "❌ 中文路徑亂碼 / write failure",
        color: "#EF4444",
        content:
          "Windows CMD/PowerShell 對中文路徑支援差，可能出現亂碼或 write failure 錯誤。解法：改用 Git Bash（安裝 Git 時會附帶），或把專案搬到純英文路徑（例如 C:\\Projects\\）。",
      },
      {
        title: "❌ remote origin already exists",
        color: "#F59E0B",
        content:
          "代表你已經加過 origin 了（可能上次打錯了網址）。用 git remote set-url origin <正確URL> 修改，而不是再 add 一次。用 git remote -v 可以確認目前的遠端設定。",
      },
      {
        title: "❌ pull 時發生 merge conflict",
        color: "#8B5CF6",
        content:
          "如果你在 GitHub 上建 repo 時勾了 README，本地推送前要先 git pull origin main --allow-unrelated-histories。若產生衝突，用 git checkout --theirs README.md 保留 GitHub 版本，然後 git add + git commit 完成合併。",
      },
    ],
    explanation:
      "碰到錯誤很正常！重要的是看懂錯誤訊息。Git 的錯誤訊息通常會直接告訴你該怎麼修。養成習慣：先讀錯誤訊息 → 理解原因 → 再找解法。",
    quiz: {
      question: "遠端網址設錯了，應該用哪個指令修改？",
      options: [
        { text: "git remote add origin <新URL>", correct: false },
        { text: "git remote set-url origin <正確URL>", correct: true },
        { text: "git push --force origin main", correct: false },
      ],
    },
  },
];

/* ── Settings Demo Component ── */
function SettingsDemo() {
  const [step, setStep] = useState(0);
  const settings = [
    {
      name: "Description",
      desc: "專案簡介（選填）",
      example: "Interactive 5-minute micro-lessons built with React",
      icon: "📝",
      color: "#E8C872",
    },
    {
      name: "Visibility",
      desc: "誰能看到你的 repo",
      example: "Public（公開）→ 建立作品集　Private（私有）→ 個人專案",
      icon: "👁️",
      color: "#E8C872",
    },
    {
      name: "README",
      desc: "專案的「首頁說明書」",
      example: "本地已有專案 → 不勾　從零開始 → 可以勾",
      icon: "📄",
      color: "#E8C872",
    },
    {
      name: "License",
      desc: "授權條款，決定別人能怎麼用你的程式碼",
      example: "MIT → 最寬鬆，別人可以自由使用　不選 → 保留所有權利",
      icon: "⚖️",
      color: "#E8C872",
    },
  ];

  return (
    <div style={{ margin: "20px 0" }}>
      <div
        style={{
          background: "#0A0E17",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        {/* Mock GitHub header */}
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
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
            }}
          >
            +
          </div>
          <span
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.5)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Create a new repository
          </span>
        </div>

        {/* Settings list */}
        <div style={{ padding: "14px 16px" }}>
          {settings.map((s, i) => (
            <div
              key={i}
              onClick={() => setStep(i)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "12px 14px",
                marginBottom: 6,
                background:
                  step === i ? `${s.color}10` : "rgba(255,255,255,0.02)",
                border: `1px solid ${step === i ? `${s.color}33` : "rgba(255,255,255,0.04)"}`,
                borderRadius: 10,
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>
                {s.icon}
              </span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: step === i ? s.color : "rgba(255,255,255,0.7)",
                    marginBottom: 4,
                    transition: "color 0.3s",
                  }}
                >
                  {s.name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.45)",
                    lineHeight: 1.6,
                    marginBottom: step === i ? 8 : 0,
                  }}
                >
                  {s.desc}
                </div>
                {step === i && (
                  <div
                    style={{
                      fontSize: 11.5,
                      color: `${s.color}cc`,
                      fontFamily: "'JetBrains Mono', monospace",
                      background: `${s.color}0a`,
                      padding: "8px 10px",
                      borderRadius: 6,
                      lineHeight: 1.6,
                    }}
                  >
                    {s.example}
                  </div>
                )}
              </div>
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
  const accent = "#E8C872";
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
        <span style={{ color: accent, fontWeight: 700, flexShrink: 0 }}>
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
                : accent,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            padding: "11px 0",
            caretColor: accent,
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
            color: `${accent}88`,
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
          terminal — git setup
        </span>
      </div>
      <div ref={termRef} style={{ padding: "14px 16px", maxHeight: 400, overflowY: "auto" }}>
        {commands.slice(0, completedIdx + 1).map((cmd, i) => (
          <div key={`done-${i}`} style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
              <span style={{ color: "#10B981" }}>$ </span>
              <span style={{ color: "#E8C872" }}>{cmd.answer}</span>
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
export default function GitGithubSetup() {
  const [currentStep, setCurrentStep] = useState(0);
  useEffect(() => { window.scrollTo(0, 0); }, [currentStep]);
  const [termDone, setTermDone] = useState({});
  const [quizDone, setQuizDone] = useState({});
  const [score, setScore] = useState(0);
  const navigate = useNavigate();
  const { prevPath, nextPath } = useChapterNav();

  const step = STEPS[currentStep];
  const accent = "#E8C872";
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
                background: `linear-gradient(135deg, #E8C872, #D4A843)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 900,
                color: "#0D1117",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              2
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>
                本地到雲端：首次推上 GitHub
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                Git 課程系列 · 第二堂
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#E8C872",
              fontFamily: "'JetBrains Mono', monospace",
              background: `rgba(232,200,114,0.1)`,
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
                    ? `linear-gradient(90deg, #E8C872, #D4A843)`
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
                background: `linear-gradient(135deg, #E8C872, #D4A843)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {step.title}
            </h2>
          </div>

          {step.conceptBlocks && <ConceptBlocks blocks={step.conceptBlocks} />}
          {step.settingsDemo && <SettingsDemo />}
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
                background: "rgba(232,200,114,0.04)",
                borderLeft: `3px solid #E8C872`,
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
              <button onClick={() => navigate(prevPath)} style={{ padding: "12px 24px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← 上一章</button>
            ) : <div />
          ) : (
            <button onClick={goPrev} style={{ padding: "12px 24px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← 上一課</button>
          )}
          {currentStep === STEPS.length - 1 ? (
            nextPath ? (
              <button onClick={() => navigate(nextPath)} style={{ padding: "12px 24px", background: "linear-gradient(135deg, #E8C872, #D4A843)", border: "none", borderRadius: 10, color: "#0D1117", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>下一章 →</button>
            ) : <div />
          ) : (
            <button onClick={goNext} style={{ padding: "12px 24px", background: `linear-gradient(135deg, #E8C872, #D4A843)`, border: "none", borderRadius: 10, color: "#0D1117", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>下一課 →</button>
          )}
        </div>

        {/* Completion */}
        {currentStep === STEPS.length - 1 && quizDone[currentStep] && (
          <div
            style={{
              marginTop: 24,
              textAlign: "center",
              padding: "24px",
              background: `rgba(232,200,114,0.08)`,
              border: `1px solid rgba(232,200,114,0.2)`,
              borderRadius: 14,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#E8C872", marginBottom: 6 }}>
              恭喜！你的專案已推上 GitHub！
            </div>
            <div
              style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}
            >
              你已掌握從本地到 GitHub 的完整流程。
              <br />
              接下來學習遠端協作：clone、fetch、pull！
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
