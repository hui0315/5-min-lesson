import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useChapterNav } from "./chapter-context";
import { colors, hexToRgba } from "./theme";

/* ══════════════════════════════════════════════
   第四堂：Git 命名規範與慣例
   ══════════════════════════════════════════════ */

const ACCENT = "#F97316";
const ACCENT2 = "#FB923C";

const STEPS = [
  {
    id: "commit-message",
    title: "Commit 訊息規範：Conventional Commits",
    emoji: "📝",
    type: "concept",
    conceptBlocks: [
      {
        title: "為什麼需要規範？",
        color: "#F97316",
        content:
          "想像你打開 git log，看到一堆「update」「fix bug」「asdf」，完全不知道每次改了什麼。Conventional Commits 是業界通用的 commit 訊息格式，讓你和隊友一眼看懂每個 commit 的目的。",
      },
      {
        title: "基本格式",
        color: "#FB923C",
        content:
          "格式：<type>: <description>。type 表示這次改動的類型，description 用簡短的英文或中文描述做了什麼。例如：feat: add login page。",
      },
    ],
    prefixTable: true,
    explanation:
      "選對 type 很重要！如果你新增了一個功能就用 feat:，修了一個 bug 就用 fix:。不確定的話，先問自己：「這次改動的目的是什麼？」",
    quiz: {
      question: "你剛修好了一個「按鈕點擊沒反應」的問題，應該用哪個前綴？",
      options: [
        { text: "feat: fix button click", correct: false },
        { text: "fix: resolve button click not responding", correct: true },
        { text: "update: button fix", correct: false },
      ],
    },
  },
  {
    id: "commit-practice",
    title: "Commit 訊息實戰練習",
    emoji: "⌨️",
    type: "scenario",
    story:
      "你正在開發一個 React 專案，每做完一件事就要 commit。根據情境選擇正確的 type 前綴，寫出符合規範的 commit 訊息。",
    tip:
      "好的 commit 訊息使用祈使句（imperative mood），像是在下命令：「add login page」而不是「added login page」或「adding login page」。描述要簡潔，一行不超過 50 個字元。",
    commands: [
      {
        prompt: "情境：你剛建立了一個新的使用者註冊頁面",
        answer: 'git commit -m "feat: add user registration page"',
        output:
          '[main a1b2c3d] feat: add user registration page\n 3 files changed, 128 insertions(+)',
        hint: "新功能用 feat:，描述用祈使句",
        flexible: true,
      },
      {
        prompt: "情境：你修正了登入時密碼驗證失敗的 bug",
        answer: 'git commit -m "fix: resolve password validation error on login"',
        output:
          '[main d4e5f6g] fix: resolve password validation error on login\n 1 file changed, 5 insertions(+), 3 deletions(-)',
        hint: "修 bug 用 fix:",
        flexible: true,
      },
      {
        prompt: "情境：你重新整理了 API 呼叫的程式碼結構（沒改功能）",
        answer: 'git commit -m "refactor: restructure API call modules"',
        output:
          '[main g7h8i9j] refactor: restructure API call modules\n 4 files changed, 45 insertions(+), 52 deletions(-)',
        hint: "重構用 refactor:，功能不變只是改結構",
        flexible: true,
      },
      {
        prompt: "情境：你在 README 加了安裝說明",
        answer: 'git commit -m "docs: add installation guide to README"',
        output:
          '[main j1k2l3m] docs: add installation guide to README\n 1 file changed, 20 insertions(+)',
        hint: "文件相關用 docs:",
        flexible: true,
      },
    ],
    quiz: {
      question: "哪個 commit 訊息最符合規範？",
      options: [
        { text: 'fix: Fixed the login bug yesterday', correct: false },
        { text: 'feat: add dark mode toggle to settings', correct: true },
        { text: 'updated some stuff', correct: false },
      ],
    },
  },
  {
    id: "branch-naming",
    title: "分支命名規則：Git Flow",
    emoji: "🌿",
    type: "concept",
    conceptBlocks: [
      {
        title: "為什麼要規範分支名稱？",
        color: "#10B981",
        content:
          "團隊協作時，大家都在建分支。如果命名混亂（my-branch、test123、aaa），根本看不出哪條分支在做什麼。統一的命名規則讓每個人一看分支名就知道：這是在開發新功能？還是在修 bug？",
      },
      {
        title: "常見前綴分類",
        color: "#22D3EE",
        content:
          "feature/ → 新功能開發（例：feature/user-auth）\nhotfix/ → 緊急修復（例：hotfix/login-crash）\nbugfix/ → 一般 bug 修復（例：bugfix/typo-in-header）\nrelease/ → 發布版本準備（例：release/v2.1.0）\nchore/ → 雜事維護（例：chore/update-dependencies）",
      },
      {
        title: "命名技巧",
        color: "#8B5CF6",
        content:
          "使用全小寫英文，用連字號 - 分隔單字（不要用底線或空格）。名稱要簡潔但有描述性。可以加上 issue 編號：feature/123-add-login。避免用自己的名字當分支名！",
      },
    ],
    branchDemo: true,
    explanation:
      "記住口訣：「前綴/簡短描述」。feature/add-login 比 my-new-branch 好一萬倍。團隊一看就知道你在做什麼。",
    quiz: {
      question: "你要開發「購物車」新功能，最佳的分支名稱是？",
      options: [
        { text: "shopping-cart", correct: false },
        { text: "feature/shopping-cart", correct: true },
        { text: "Feature_Shopping_Cart", correct: false },
        { text: "my-branch", correct: false },
      ],
    },
  },
  {
    id: "semver",
    title: "版本號規則：Semantic Versioning",
    emoji: "🏷️",
    type: "concept",
    conceptBlocks: [
      {
        title: "什麼是語意化版本？",
        color: "#F97316",
        content:
          "你一定看過版本號像 v2.1.3，但這三個數字到底代表什麼？Semantic Versioning（簡稱 SemVer）用 MAJOR.MINOR.PATCH 三個數字來表達版本的變動程度。",
      },
      {
        title: "三個數字的意義",
        color: "#3B82F6",
        content:
          "MAJOR（主版本）：有「破壞性變更」，舊版程式碼可能無法直接升級。例：API 介面大改。\nMINOR（次版本）：新增功能，但「向下相容」，舊功能不受影響。例：多了一個匯出 PDF 功能。\nPATCH（修訂版）：修復 bug，沒有新功能。例：修正了計算錯誤。",
      },
    ],
    versionDemo: true,
    explanation:
      "簡單記法：MAJOR = 破壞、MINOR = 新功能、PATCH = 修 bug。每次 MAJOR 升版時，MINOR 和 PATCH 歸零；MINOR 升版時 PATCH 歸零。",
    quiz: {
      question: "目前版本是 v1.3.2，你新增了一個不影響舊功能的搜尋功能，版本號應該變成？",
      options: [
        { text: "v2.0.0", correct: false },
        { text: "v1.4.0", correct: true },
        { text: "v1.3.3", correct: false },
      ],
    },
  },
  {
    id: "pr-writing",
    title: "PR 標題與描述的寫法",
    emoji: "📋",
    type: "concept",
    conceptBlocks: [
      {
        title: "什麼是 PR？",
        color: "#8B5CF6",
        content:
          "Pull Request（簡稱 PR）是你在 GitHub 上告訴隊友「我的程式碼改好了，請檢查後合併」的正式請求。好的 PR 標題和描述能幫助 reviewer 快速理解你改了什麼、為什麼改。",
      },
      {
        title: "標題寫法",
        color: "#A78BFA",
        content:
          "格式與 commit 類似：<type>: <簡短描述>。控制在 70 字元以內。例如：feat: add user authentication with JWT。如果有對應的 issue，可以加上編號：fix: resolve #42 login timeout error。",
      },
      {
        title: "描述（body）的結構",
        color: "#C084FC",
        content:
          "一般包含三個部分：\n① Summary — 用 1-3 句話說明改了什麼、為什麼改\n② Changes — 列出主要的程式碼變動\n③ Test Plan — 說明如何測試這些改動（手動測試或自動測試都可以）",
      },
    ],
    prDemo: true,
    explanation:
      "寫 PR 就像寫一封「求合併信」：標題讓人一眼知道主題，描述讓 reviewer 不用看程式碼就能理解大方向。好的 PR 描述能大幅提升 code review 的效率。",
    quiz: {
      question: "哪個 PR 標題最符合規範？",
      options: [
        { text: "Update files", correct: false },
        { text: "feat: add dark mode support with system preference detection", correct: true },
        { text: "I fixed the bug that John told me about last week", correct: false },
      ],
    },
  },
  {
    id: "gitignore",
    title: ".gitignore 常見設定",
    emoji: "🙈",
    type: "concept",
    conceptBlocks: [
      {
        title: "為什麼需要 .gitignore？",
        color: "#EF4444",
        content:
          "有些檔案不應該被 Git 追蹤：node_modules/（幾萬個套件檔案）、.env（密鑰和密碼）、dist/（編譯產出）。如果不小心 commit 了這些，不但 repo 會暴肥，密鑰還可能外洩！",
      },
      {
        title: "基本語法",
        color: "#F59E0B",
        content:
          "每行一個規則。資料夾用 / 結尾：node_modules/。萬用字元 * 代表任何字：*.log 忽略所有 log 檔。驚嘆號 ! 代表例外：!important.log 保留這個檔案。# 開頭是註解。",
      },
    ],
    ignoreDemo: true,
    explanation:
      "最重要的原則：密鑰（.env）和大型產出（node_modules/、dist/）絕對不要進 Git。GitHub 提供各種語言/框架的 .gitignore 模板，建立 repo 時可以直接選用。",
    quiz: {
      question: "以下哪個檔案最不應該被 commit 到 GitHub？",
      options: [
        { text: "package.json", correct: false },
        { text: ".env（包含資料庫密碼和 API key）", correct: true },
        { text: "README.md", correct: false },
      ],
    },
  },
];

/* ── Prefix Table Component ── */
function PrefixTable() {
  const [hovered, setHovered] = useState(null);
  const prefixes = [
    { type: "feat:", desc: "新增功能", example: 'feat: add search bar', color: "#10B981", icon: "✨" },
    { type: "fix:", desc: "修復 bug", example: 'fix: resolve login crash', color: "#EF4444", icon: "🐛" },
    { type: "docs:", desc: "文件相關", example: 'docs: update API guide', color: "#3B82F6", icon: "📄" },
    { type: "style:", desc: "格式調整（不影響邏輯）", example: 'style: format with prettier', color: "#8B5CF6", icon: "🎨" },
    { type: "refactor:", desc: "重構（不改功能）", example: 'refactor: extract auth module', color: "#F59E0B", icon: "♻️" },
    { type: "test:", desc: "測試相關", example: 'test: add unit tests for utils', color: "#22D3EE", icon: "🧪" },
    { type: "chore:", desc: "雜事維護", example: 'chore: update dependencies', color: "#6B7280", icon: "🔧" },
    { type: "perf:", desc: "效能改善", example: 'perf: optimize image loading', color: "#EC4899", icon: "⚡" },
  ];

  return (
    <div style={{ margin: "16px 0" }}>
      <div
        style={{
          background: colors.bgDeep,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "10px 16px",
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            fontSize: 11,
            color: "rgba(255,255,255,0.4)",
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
          }}
        >
          Conventional Commits · 常用 Type 一覽
        </div>
        <div style={{ padding: "8px 10px" }}>
          {prefixes.map((p, i) => (
            <div
              key={i}
              onMouseOver={() => setHovered(i)}
              onMouseOut={() => setHovered(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 8,
                background: hovered === i ? hexToRgba(p.color, 0.039) : "transparent",
                transition: "background 0.2s",
                cursor: "default",
              }}
            >
              <span style={{ fontSize: 16, flexShrink: 0, width: 24, textAlign: "center" }}>
                {p.icon}
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  fontWeight: 700,
                  color: p.color,
                  minWidth: 90,
                  flexShrink: 0,
                }}
              >
                {p.type}
              </span>
              <span
                style={{
                  fontSize: 12.5,
                  color: "rgba(255,255,255,0.55)",
                  minWidth: 120,
                  flexShrink: 0,
                }}
              >
                {p.desc}
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.25)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {p.example}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Branch Demo Component ── */
function BranchDemo() {
  const [selected, setSelected] = useState(0);
  const branches = [
    {
      name: "feature/user-auth",
      type: "feature/",
      desc: "開發使用者驗證功能",
      color: "#10B981",
      bad: "my-login-stuff",
    },
    {
      name: "hotfix/payment-crash",
      type: "hotfix/",
      desc: "緊急修復付款頁面當機",
      color: "#EF4444",
      bad: "fix-thing",
    },
    {
      name: "release/v2.0.0",
      type: "release/",
      desc: "準備 2.0 版本發布",
      color: "#3B82F6",
      bad: "new-version",
    },
    {
      name: "chore/update-deps",
      type: "chore/",
      desc: "更新套件依賴",
      color: "#6B7280",
      bad: "misc",
    },
  ];

  return (
    <div style={{ margin: "16px 0" }}>
      <div
        style={{
          background: colors.bgDeep,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "10px 16px",
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ color: "#10B981", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
            ⑂
          </span>
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            branch naming · 點擊查看對比
          </span>
        </div>
        <div style={{ padding: "12px" }}>
          {branches.map((b, i) => (
            <div
              key={i}
              onClick={() => setSelected(i)}
              style={{
                padding: "12px 14px",
                marginBottom: 6,
                background: selected === i ? hexToRgba(b.color, 0.039) : "rgba(255,255,255,0.02)",
                border: `1px solid ${selected === i ? hexToRgba(b.color, 0.2) : "rgba(255,255,255,0.04)"}`,
                borderRadius: 10,
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: selected === i ? 8 : 0 }}>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: b.color,
                  }}
                >
                  {b.name}
                </span>
                <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)" }}>
                  {b.desc}
                </span>
              </div>
              {selected === i && (
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    fontSize: 11.5,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      background: "rgba(16,185,129,0.06)",
                      borderRadius: 6,
                      border: "1px solid rgba(16,185,129,0.15)",
                    }}
                  >
                    <div style={{ color: "#10B981", marginBottom: 4, fontSize: 10, fontWeight: 600 }}>
                      ✓ 好的命名
                    </div>
                    <div style={{ color: "#10B981" }}>{b.name}</div>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      background: "rgba(239,68,68,0.06)",
                      borderRadius: 6,
                      border: "1px solid rgba(239,68,68,0.15)",
                    }}
                  >
                    <div style={{ color: "#EF4444", marginBottom: 4, fontSize: 10, fontWeight: 600 }}>
                      ✗ 不好的命名
                    </div>
                    <div style={{ color: "#EF4444" }}>{b.bad}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Version Demo Component ── */
function VersionDemo() {
  const [version, setVersion] = useState([1, 0, 0]);
  const [history, setHistory] = useState([]);

  const bump = (type) => {
    let next;
    let label;
    if (type === "major") {
      next = [version[0] + 1, 0, 0];
      label = "MAJOR — 破壞性變更";
    } else if (type === "minor") {
      next = [version[0], version[1] + 1, 0];
      label = "MINOR — 新增功能";
    } else {
      next = [version[0], version[1], version[2] + 1];
      label = "PATCH — 修復 bug";
    }
    setHistory((h) => [...h.slice(-4), { from: `v${version.join(".")}`, to: `v${next.join(".")}`, label }]);
    setVersion(next);
  };

  return (
    <div style={{ margin: "16px 0" }}>
      <div
        style={{
          background: colors.bgDeep,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "10px 16px",
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            fontSize: 11,
            color: "rgba(255,255,255,0.4)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          Semantic Versioning · 互動模擬器
        </div>
        <div style={{ padding: "20px 16px", textAlign: "center" }}>
          <div
            style={{
              fontSize: 36,
              fontWeight: 900,
              fontFamily: "'JetBrains Mono', monospace",
              color: "rgba(255,255,255,0.9)",
              marginBottom: 6,
              letterSpacing: 2,
            }}
          >
            <span style={{ color: "#EF4444" }}>v{version[0]}</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>.</span>
            <span style={{ color: "#F59E0B" }}>{version[1]}</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>.</span>
            <span style={{ color: "#10B981" }}>{version[2]}</span>
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: 16,
            }}
          >
            <span style={{ color: "#EF4444" }}>MAJOR</span>
            {" . "}
            <span style={{ color: "#F59E0B" }}>MINOR</span>
            {" . "}
            <span style={{ color: "#10B981" }}>PATCH</span>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
            {[
              { type: "major", label: "MAJOR", color: "#EF4444", desc: "破壞性變更" },
              { type: "minor", label: "MINOR", color: "#F59E0B", desc: "新功能" },
              { type: "patch", label: "PATCH", color: "#10B981", desc: "修 bug" },
            ].map((b) => (
              <button
                key={b.type}
                onClick={() => bump(b.type)}
                style={{
                  padding: "8px 16px",
                  background: hexToRgba(b.color, 0.08),
                  border: `1px solid ${hexToRgba(b.color, 0.2)}`,
                  borderRadius: 8,
                  color: b.color,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                + {b.label}
                <div style={{ fontSize: 9, fontWeight: 400, marginTop: 2, opacity: 0.7 }}>
                  {b.desc}
                </div>
              </button>
            ))}
          </div>
          {history.length > 0 && (
            <div style={{ textAlign: "left", padding: "0 8px" }}>
              {history.map((h, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "rgba(255,255,255,0.35)",
                    padding: "4px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                  }}
                >
                  {h.from} → <span style={{ color: "rgba(255,255,255,0.7)" }}>{h.to}</span>{" "}
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>({h.label})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── PR Demo Component ── */
function PRDemo() {
  const [activeTab, setActiveTab] = useState(0);
  const examples = [
    {
      label: "好的 PR",
      color: "#10B981",
      title: "feat: add dark mode support with system preference detection",
      body: `## Summary\n- 新增深色模式，自動偵測系統主題偏好\n- 使用 CSS custom properties 實現主題切換\n\n## Changes\n- 新增 ThemeProvider component\n- 更新 App.jsx 引入主題狀態\n- 新增 dark-mode.css 變數定義\n\n## Test Plan\n- [x] 手動切換明/暗模式\n- [x] 系統偏好自動偵測\n- [x] 所有頁面樣式正確`,
    },
    {
      label: "不好的 PR",
      color: "#EF4444",
      title: "update stuff",
      body: "changed some files\nplease merge",
    },
  ];

  return (
    <div style={{ margin: "16px 0" }}>
      <div
        style={{
          background: colors.bgDeep,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              style={{
                flex: 1,
                padding: "10px 16px",
                background: activeTab === i ? "rgba(255,255,255,0.03)" : "transparent",
                border: "none",
                borderBottom: activeTab === i ? `2px solid ${ex.color}` : "2px solid transparent",
                color: activeTab === i ? ex.color : "rgba(255,255,255,0.35)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
                transition: "all 0.2s",
              }}
            >
              {i === 0 ? "✓ " : "✗ "}{ex.label}
            </button>
          ))}
        </div>
        <div style={{ padding: "16px" }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: examples[activeTab].color,
              marginBottom: 12,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {examples[activeTab].title}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.5)",
              fontFamily: "'JetBrains Mono', monospace",
              whiteSpace: "pre-wrap",
              lineHeight: 1.7,
              padding: "12px 14px",
              background: "rgba(255,255,255,0.02)",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {examples[activeTab].body}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Gitignore Demo Component ── */
function GitignoreDemo() {
  const [framework, setFramework] = useState("react");
  const templates = {
    react: {
      label: "React / Vite",
      color: "#22D3EE",
      lines: [
        { text: "# Dependencies", type: "comment" },
        { text: "node_modules/", type: "rule", desc: "套件資料夾（超大，npm install 就能還原）" },
        { text: "", type: "blank" },
        { text: "# Build output", type: "comment" },
        { text: "dist/", type: "rule", desc: "編譯產出（npm run build 可重新產生）" },
        { text: "dist-ssr/", type: "rule", desc: "SSR 編譯產出" },
        { text: "", type: "blank" },
        { text: "# Environment variables", type: "comment" },
        { text: ".env", type: "danger", desc: "⚠️ 包含密鑰和密碼，絕對不能上傳！" },
        { text: ".env.local", type: "danger", desc: "⚠️ 本地環境變數" },
        { text: ".env.production", type: "danger", desc: "⚠️ 正式環境變數" },
        { text: "", type: "blank" },
        { text: "# IDE / Editor", type: "comment" },
        { text: ".vscode/", type: "rule", desc: "VS Code 設定（個人偏好，不該強加給別人）" },
        { text: ".idea/", type: "rule", desc: "WebStorm/IntelliJ 設定" },
        { text: "", type: "blank" },
        { text: "# OS files", type: "comment" },
        { text: ".DS_Store", type: "rule", desc: "macOS 系統檔案" },
        { text: "Thumbs.db", type: "rule", desc: "Windows 縮圖快取" },
        { text: "", type: "blank" },
        { text: "# Logs", type: "comment" },
        { text: "*.log", type: "rule", desc: "所有 log 檔（* 是萬用字元）" },
      ],
    },
    python: {
      label: "Python",
      color: "#F59E0B",
      lines: [
        { text: "# Virtual environment", type: "comment" },
        { text: "venv/", type: "rule", desc: "Python 虛擬環境" },
        { text: "__pycache__/", type: "rule", desc: "Python 快取檔案" },
        { text: "*.pyc", type: "rule", desc: "編譯過的 Python 檔案" },
        { text: "", type: "blank" },
        { text: "# Environment", type: "comment" },
        { text: ".env", type: "danger", desc: "⚠️ 密鑰和密碼" },
        { text: "", type: "blank" },
        { text: "# Distribution", type: "comment" },
        { text: "dist/", type: "rule", desc: "打包產出" },
        { text: "*.egg-info/", type: "rule", desc: "套件資訊" },
        { text: "", type: "blank" },
        { text: "# IDE", type: "comment" },
        { text: ".vscode/", type: "rule", desc: "VS Code 設定" },
        { text: ".idea/", type: "rule", desc: "PyCharm 設定" },
      ],
    },
  };

  const tmpl = templates[framework];

  return (
    <div style={{ margin: "16px 0" }}>
      <div
        style={{
          background: colors.bgDeep,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "10px 16px",
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            📄 .gitignore
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {Object.entries(templates).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setFramework(key)}
                style={{
                  padding: "3px 10px",
                  fontSize: 10.5,
                  fontFamily: "'JetBrains Mono', monospace",
                  background: framework === key ? hexToRgba(val.color, 0.08) : "transparent",
                  border: `1px solid ${framework === key ? hexToRgba(val.color, 0.267) : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 5,
                  color: framework === key ? val.color : "rgba(255,255,255,0.35)",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
              >
                {val.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: "10px 16px", maxHeight: 360, overflowY: "auto" }}>
          {tmpl.lines.map((line, i) => {
            if (line.type === "blank") return <div key={i} style={{ height: 8 }} />;
            if (line.type === "comment")
              return (
                <div
                  key={i}
                  style={{
                    fontSize: 11.5,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "rgba(255,255,255,0.2)",
                    padding: "2px 0",
                  }}
                >
                  {line.text}
                </div>
              );
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "4px 0",
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    color: line.type === "danger" ? "#EF4444" : tmpl.color,
                    fontWeight: 600,
                    minWidth: 160,
                    flexShrink: 0,
                  }}
                >
                  {line.text}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: line.type === "danger" ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.3)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {line.desc}
                </span>
              </div>
            );
          })}
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
      if (inputRef.current) inputRef.current.focus();
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
          terminal — git conventions
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
        background: hexToRgba(ACCENT, 0.024),
        borderRadius: 12,
        border: `1px solid ${hexToRgba(ACCENT, 0.094)}`,
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
            background: hexToRgba(b.color, 0.031),
            borderLeft: `3px solid ${b.color}`,
            borderRadius: "0 10px 10px 0",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: b.color, marginBottom: 6 }}>
            {b.title}
          </div>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
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
export default function GitConventions() {
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
        background: "#0C0810",
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
                Git 命名規範與慣例
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
          {step.prefixTable && <PrefixTable />}
          {step.branchDemo && <BranchDemo />}
          {step.versionDemo && <VersionDemo />}
          {step.prDemo && <PRDemo />}
          {step.ignoreDemo && <GitignoreDemo />}
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
                background: hexToRgba(ACCENT, 0.024),
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
              <button onClick={() => navigate(prevPath)} style={{ padding: "12px 24px", background: "rgba(139,92,246,0.10)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 10, color: "#A78BFA", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← 上一章</button>
            ) : <div />
          ) : (
            <button onClick={goPrev} style={{ padding: "12px 24px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← 上一課</button>
          )}
          {currentStep === STEPS.length - 1 ? (
            nextPath ? (
              <button onClick={() => navigate(nextPath)} style={{ padding: "12px 24px", background: "linear-gradient(135deg, #8B5CF6, #A78BFA)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>下一章 →</button>
            ) : <div />
          ) : (
            <button onClick={goNext} style={{ padding: "12px 24px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, border: "none", borderRadius: 10, color: colors.bg, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>下一課 →</button>
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
              恭喜！你已掌握 Git 命名規範！
            </div>
            <div
              style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}
            >
              從 commit 訊息到分支命名、版本號到 PR 寫法，
              <br />
              這些規範能讓你在團隊協作中更專業。
              <br />
              接下來學習遠端協作：clone、fetch、pull！
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
