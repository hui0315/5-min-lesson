import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChapterNav } from "./chapter-context";
import { colors, lessonThemes, hexToRgba } from "./theme";

const { accent: ACCENT, accent2: ACCENT2 } = lessonThemes["/interview-fullstack"];

/* ══════════════════════════════════════════════
   面試複習：全端技術
   ══════════════════════════════════════════════ */

const STEPS = [
  /* ─── React ─── */
  {
    id: "react",
    title: "React",
    emoji: "⚛️",
    oneLiner: "React 是 Meta 開發的 UI 函式庫，用 Component-based 架構和 Virtual DOM 高效建構互動式前端介面。",
    projectUsage: "FindYourJob 的前端完全用 React 建構，使用 useState/useEffect 管理狀態，React Router 處理多頁路由，並用 Component 拆分實現可複用的 UI 模組。",
    projectTag: "FindYourJob 前端",
    interviewQA: [
      {
        q: "Virtual DOM 是什麼？為什麼 React 要用它？",
        a: "Virtual DOM 是真實 DOM 的 JavaScript 物件映射。React 先在 VDOM 上計算差異（diffing），再一次性更新真實 DOM（reconciliation）。直接操作 DOM 很慢（會觸發 reflow/repaint），VDOM 把多次變更批次處理，減少實際 DOM 操作次數。",
      },
      {
        q: "useState 和 useRef 的差別？",
        a: "useState 更新會觸發 re-render，適合需要反映在 UI 上的資料（如表單值、開關狀態）。useRef 更新不會 re-render，適合存不影響畫面的值（如 DOM 引用、timer ID、前一次的值）。我在 FindYourJob 用 useRef 儲存 terminal scroll position。",
      },
      {
        q: "useEffect 的 dependency array 為什麼重要？",
        a: "空陣列 [] = 只在 mount 時執行一次；有值 [a,b] = a 或 b 變化時重新執行；不傳 = 每次 render 都執行（通常是 bug）。依賴沒寫對會造成無限迴圈或過期資料。ESLint 的 exhaustive-deps 規則能幫你抓錯。",
      },
    ],
    quiz: {
      question: "以下哪個 Hook 在更新時不會觸發 re-render？",
      options: [
        { text: "useState", correct: false },
        { text: "useRef", correct: true },
        { text: "useEffect", correct: false },
      ],
    },
  },

  /* ─── JavaScript ─── */
  {
    id: "javascript",
    title: "JavaScript",
    emoji: "🟨",
    oneLiner: "JavaScript 是網頁的核心程式語言，也能用於伺服器端（Node.js），是全端開發的共同基礎。",
    projectUsage: "FindYourJob 前端所有互動邏輯（事件處理、API 呼叫、狀態管理、DOM 操作）以及 5-min-lesson 的動畫和互動元件全都用 JavaScript 實作。",
    projectTag: "FindYourJob + 5-min-lesson",
    interviewQA: [
      {
        q: "var / let / const 的差別？什麼是 hoisting？",
        a: "var 是函數作用域，let/const 是區塊作用域。var 會被 hoisted（宣告提升到頂部但值是 undefined），let/const 也會 hoist 但有 TDZ（temporal dead zone），存取會報錯。實務上全用 const，需要重新賦值才用 let，永遠不用 var。",
      },
      {
        q: "什麼是閉包（Closure）？給一個實用場景。",
        a: "閉包是函式能「記住」它被建立時的外部變數，即使外部函式已經執行完畢。實用場景：React 的 useState 就是閉包——setState 函式記住了對應的 state 變數。還有 debounce/throttle 函式也靠閉包保存 timer ID。",
      },
      {
        q: "Promise 和 async/await 的關係？",
        a: "async/await 是 Promise 的語法糖，讓非同步程式碼看起來像同步的。async 函式自動回傳 Promise，await 暫停執行直到 Promise resolve。底層還是 Promise，但可讀性大幅提升。錯誤處理用 try/catch 取代 .catch()。",
      },
    ],
    quiz: {
      question: "在現代 JavaScript 中，宣告變數的最佳實踐是？",
      options: [
        { text: "優先用 var，因為它是最早的語法", correct: false },
        { text: "優先用 const，需要重新賦值時才用 let", correct: true },
        { text: "let 和 const 混著用都可以，沒差別", correct: false },
      ],
    },
  },

  /* ─── FastAPI ─── */
  {
    id: "fastapi",
    title: "FastAPI",
    emoji: "⚡",
    oneLiner: "FastAPI 是 Python 高效能 Web 框架，內建 OpenAPI 文件和型別驗證，開發速度快且效能接近 Node.js。",
    projectUsage: "FindYourJob 後端用 FastAPI 建構 RESTful API，處理職缺搜尋、LLM 推論請求、使用者資料 CRUD，並利用自動生成的 Swagger 文件加速前後端對接。",
    projectTag: "FindYourJob 後端",
    interviewQA: [
      {
        q: "FastAPI 相比 Flask 的優勢？",
        a: "三大優勢：(1) 內建 type hint 型別驗證（Pydantic），請求資料格式錯會自動報 422 錯誤；(2) 原生 async 支援，高併發 I/O 效能好；(3) 自動生成 OpenAPI/Swagger 文件，不用手寫 API 文件。缺點是生態系比 Flask 小，但快速追趕中。",
      },
      {
        q: "Pydantic 在 FastAPI 中的角色？",
        a: "Pydantic 是資料驗證和序列化的核心。定義 BaseModel 子類描述請求/回應的 schema，FastAPI 自動驗證傳入資料、轉型、產生文件。錯誤時回傳詳細的驗證錯誤訊息。我在 FindYourJob 中定義了 JobQuery、UserProfile 等 model。",
      },
      {
        q: "async def 和 def 在 FastAPI 中的差異？",
        a: "async def 用 asyncio 事件循環處理，適合 I/O-bound（API 呼叫、資料庫查詢）；def 會在 threadpool 中執行。如果函式裡都是 await 呼叫就用 async def；如果用同步函式庫（如 sqlite3）就用 def。用錯不會壞，但效能不是最佳。",
      },
    ],
    quiz: {
      question: "FastAPI 的請求資料驗證主要靠哪個套件？",
      options: [
        { text: "marshmallow", correct: false },
        { text: "Pydantic", correct: true },
        { text: "cerberus", correct: false },
      ],
    },
  },

  /* ─── SQLite ─── */
  {
    id: "sqlite",
    title: "SQLite",
    emoji: "🗄️",
    oneLiner: "SQLite 是嵌入式關聯資料庫，不需要獨立伺服器，整個資料庫就是一個檔案，適合中小型應用和原型開發。",
    projectUsage: "FindYourJob 用 SQLite 儲存使用者個人檔案和職缺快取資料，搭配 Python 的 sqlite3 模組進行 CRUD 操作，部署時只要帶上一個 .db 檔案。",
    projectTag: "FindYourJob 資料層",
    interviewQA: [
      {
        q: "SQLite 和 PostgreSQL / MySQL 的差異？什麼情境用 SQLite？",
        a: "SQLite 是嵌入式（in-process），不需要啟動資料庫伺服器，整個 DB 是單一檔案。適合：單機應用、原型開發、嵌入式系統、行動 App。不適合：高併發寫入、多伺服器共用資料庫。FindYourJob 是單機應用所以 SQLite 正好。",
      },
      {
        q: "什麼是 SQL Injection？如何防止？",
        a: "攻擊者在輸入中注入惡意 SQL，例如 ' OR 1=1 --。防止方式：永遠使用參數化查詢（Parameterized Query），用 ? 或 :name 當佔位符，不要用 f-string 或字串拼接組 SQL。ORM 和 Pydantic 也能幫忙過濾。",
      },
      {
        q: "INDEX 的作用？什麼時候該加？",
        a: "INDEX 建立資料的快速查找結構（B-Tree），讓 WHERE、JOIN、ORDER BY 更快。該加：經常作為搜尋條件的欄位、外鍵。不該加：很少查詢的欄位、資料量小的表、頻繁寫入的欄位（因為每次寫入都要更新索引）。",
      },
    ],
    quiz: {
      question: "防止 SQL Injection 的最佳做法是？",
      options: [
        { text: "過濾使用者輸入中的特殊字元", correct: false },
        { text: "使用參數化查詢（Parameterized Query）", correct: true },
        { text: "限制使用者輸入的長度", correct: false },
      ],
    },
  },

  /* ─── Tailwind CSS ─── */
  {
    id: "tailwindcss",
    title: "Tailwind CSS",
    emoji: "🎨",
    oneLiner: "Tailwind CSS 是 utility-first 的 CSS 框架，用預定義的原子化 class 直接在 HTML 上寫樣式，不用寫自定義 CSS。",
    projectUsage: "FindYourJob 的前端介面用 Tailwind CSS 快速建構響應式佈局，用 flex、grid、p-4、text-lg 等 class 組合出 UI，大幅減少自定義 CSS 程式碼量。",
    projectTag: "FindYourJob 前端",
    interviewQA: [
      {
        q: "Utility-first CSS 和傳統 CSS（BEM / SCSS）的比較？",
        a: "傳統 CSS 先命名 class 再寫樣式（.card__title { font-size: 20px }），Tailwind 直接在 HTML 上組合 class（class='text-xl font-bold'）。優點：不用想命名、樣式和結構在一起好維護、PurgeCSS 自動移除沒用到的樣式。缺點：HTML 會比較長、學習曲線。",
      },
      {
        q: "Tailwind 的響應式設計怎麼做？",
        a: "用前綴指定斷點：sm:（640px）、md:（768px）、lg:（1024px）、xl:（1280px）。例如 class='w-full md:w-1/2 lg:w-1/3' 在不同寬度顯示不同欄寬。Tailwind 是 mobile-first，不加前綴就是最小螢幕的樣式。",
      },
    ],
    quiz: {
      question: "Tailwind CSS 的響應式設計是？",
      options: [
        { text: "Desktop-first，用前綴處理小螢幕", correct: false },
        { text: "Mobile-first，用前綴 (sm:, md:, lg:) 處理大螢幕", correct: true },
        { text: "不支援響應式，需要另外寫 media query", correct: false },
      ],
    },
  },

  /* ─── Vite ─── */
  {
    id: "vite",
    title: "Vite",
    emoji: "⚡",
    oneLiner: "Vite 是新世代前端建構工具，利用瀏覽器原生 ES Module 支援實現極快的開發伺服器啟動和即時熱更新（HMR）。",
    projectUsage: "FindYourJob 和 5-min-lesson 都用 Vite 作為開發和建構工具，享受毫秒級的 HMR 和秒級的專案啟動，搭配 React plugin 實現 Fast Refresh。",
    projectTag: "FindYourJob + 5-min-lesson",
    interviewQA: [
      {
        q: "Vite 為什麼比 Webpack 快？",
        a: "開發模式：Webpack 啟動時打包所有模組，Vite 利用瀏覽器原生 ESM 按需載入，啟動幾乎是瞬時的。HMR：Vite 只更新改變的模組，不像 Webpack 要重新計算整個模組圖。生產構建：Vite 用 Rollup（比 Webpack 更高效的 tree-shaking）。",
      },
      {
        q: "Vite 開發模式和生產模式的差異？",
        a: "開發模式：用 esbuild 做即時轉譯（JSX→JS），瀏覽器直接載入 ESM，不做 bundling。生產模式：用 Rollup 做完整 bundling、tree-shaking、code-splitting、壓縮。兩者行為不同，所以上線前一定要測生產 build。",
      },
      {
        q: "什麼是 HMR？它如何提升開發體驗？",
        a: "HMR（Hot Module Replacement）在你修改程式碼時，不重新整理整個頁面，只替換改變的模組，保留應用狀態（如表單輸入、滾動位置）。配合 React Fast Refresh，改 component 後畫面即時更新且 state 不丟失。",
      },
    ],
    quiz: {
      question: "Vite 在開發模式下為什麼啟動這麼快？",
      options: [
        { text: "它不做任何處理，直接給瀏覽器原始碼", correct: false },
        { text: "利用瀏覽器原生 ES Module，按需載入而非打包所有模組", correct: true },
        { text: "因為它跳過了型別檢查", correct: false },
      ],
    },
  },

  /* ─── Ollama ─── */
  {
    id: "ollama",
    title: "Ollama",
    emoji: "🦙",
    oneLiner: "Ollama 是本地 LLM 運行工具，讓你在自己的電腦上跑 Llama、Mistral 等開源模型，無需雲端 API、零成本、保護隱私。",
    projectUsage: "FindYourJob 用 Ollama 在本地運行 Llama 3 模型，透過 REST API 串接 FastAPI 後端，實現零 API 費用的 AI 功能，同時保護使用者的求職隱私資料。",
    projectTag: "FindYourJob AI 推論",
    interviewQA: [
      {
        q: "本地部署 LLM 和使用雲端 API（如 OpenAI）的優缺點？",
        a: "本地：零成本、低延遲、隱私保護、離線可用，但需要 GPU/記憶體、模型能力較弱。雲端：模型最強（GPT-4）、不吃本地資源，但有 API 費用、延遲、隱私疑慮、被 rate limit。FindYourJob 選本地因為成本和隱私考量。",
      },
      {
        q: "量化（Quantization）是什麼？為什麼本地部署需要它？",
        a: "量化把模型參數從 FP32/FP16 降到 INT8/INT4，大幅減少記憶體用量和推論時間，精度損失有限。例如 Llama 3 8B 原始需要 16GB，4-bit 量化後只要 ~4GB，一般筆電就能跑。Ollama 預設就提供量化版本。",
      },
      {
        q: "Ollama 的 REST API 怎麼用？",
        a: "Ollama 啟動後提供 HTTP API（預設 localhost:11434）。POST /api/generate 傳入 model 名稱和 prompt，回傳生成結果。支援 streaming 和 chat 模式。在 FindYourJob 中用 Python requests 或 httpx 呼叫這個 API。",
      },
    ],
    quiz: {
      question: "模型量化（Quantization）的主要目的是？",
      options: [
        { text: "提高模型的準確率", correct: false },
        { text: "減少記憶體用量，讓模型能在一般硬體上運行", correct: true },
        { text: "加快模型的訓練速度", correct: false },
      ],
    },
  },
];

/* ── Shared Components ── */
function ConceptBlocks({ blocks }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "16px 0" }}>
      {blocks.map((b, i) => (
        <div key={i} style={{
          padding: "14px 16px",
          background: hexToRgba(b.color, 0.031),
          borderLeft: `3px solid ${b.color}`,
          borderRadius: "0 10px 10px 0",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: b.color, marginBottom: 6 }}>{b.title}</div>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>{b.content}</div>
        </div>
      ))}
    </div>
  );
}

function InterviewQA({ qas }) {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "16px 0" }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: ACCENT, marginBottom: 4 }}>
        🎤 面試官會問
      </div>
      {qas.map((item, i) => (
        <div key={i} style={{
          background: "rgba(255,255,255,0.02)",
          border: `1px solid ${openIdx === i ? hexToRgba(ACCENT, 0.3) : "rgba(255,255,255,0.06)"}`,
          borderRadius: 10, overflow: "hidden", transition: "border-color 0.3s",
        }}>
          <button
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            style={{
              width: "100%", padding: "12px 16px",
              background: openIdx === i ? hexToRgba(ACCENT, 0.04) : "transparent",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10, textAlign: "left",
              transition: "background 0.3s",
            }}
          >
            <span style={{
              fontSize: 11, fontWeight: 800, color: ACCENT,
              background: hexToRgba(ACCENT, 0.12), padding: "2px 8px",
              borderRadius: 4, flexShrink: 0, fontFamily: "'JetBrains Mono', monospace",
            }}>Q{i + 1}</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", flex: 1, lineHeight: 1.5 }}>{item.q}</span>
            <span style={{
              color: "rgba(255,255,255,0.3)", fontSize: 12, flexShrink: 0,
              transform: openIdx === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s",
            }}>▼</span>
          </button>
          {openIdx === i && (
            <div style={{ padding: "0 16px 14px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#10B981", marginTop: 12, marginBottom: 6 }}>
                💡 你應該這樣回答：
              </div>
              <div style={{
                fontSize: 12.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.8,
                padding: "10px 14px", background: "rgba(16,185,129,0.04)",
                borderRadius: 8, borderLeft: "3px solid #10B981",
              }}>{item.a}</div>
            </div>
          )}
        </div>
      ))}
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
    <div style={{
      margin: "20px 0 0", padding: "18px",
      background: hexToRgba(ACCENT, 0.04), borderRadius: 12,
      border: `1px solid ${hexToRgba(ACCENT, 0.12)}`,
    }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: ACCENT, marginBottom: 12 }}>🧩 快速測驗</div>
      <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.85)", marginBottom: 12, lineHeight: 1.6 }}>{quiz.question}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {quiz.options.map((opt, i) => {
          let bg = "rgba(255,255,255,0.03)", bc = "rgba(255,255,255,0.07)", tc = "rgba(255,255,255,0.65)";
          if (selected === i) {
            if (opt.correct) { bg = "rgba(16,185,129,0.12)"; bc = "#10B981"; tc = "#10B981"; }
            else { bg = "rgba(239,68,68,0.12)"; bc = "#EF4444"; tc = "#EF4444"; }
          } else if (selected !== null && opt.correct) {
            bg = "rgba(16,185,129,0.08)"; bc = "#10B981"; tc = "#10B981";
          }
          return (
            <button key={i} onClick={() => handleSelect(i)} style={{
              padding: "11px 14px", background: bg, border: `1px solid ${bc}`,
              borderRadius: 8, color: tc, fontSize: 13, textAlign: "left",
              cursor: selected !== null ? "default" : "pointer",
              transition: "all 0.3s", fontFamily: "inherit", lineHeight: 1.5,
            }}>{opt.text}</button>
          );
        })}
      </div>
      {selected !== null && !quiz.options[selected].correct && (
        <div style={{ marginTop: 10, fontSize: 11.5, color: "rgba(239,68,68,0.7)" }}>正確答案已用綠色標示</div>
      )}
      {selected !== null && quiz.options[selected].correct && (
        <div style={{ marginTop: 10, fontSize: 11.5, color: "#10B981", fontWeight: 600 }}>✅ 正確！</div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════ */
export default function InterviewFullstack() {
  const [currentStep, setCurrentStep] = useState(0);
  useEffect(() => { window.scrollTo(0, 0); }, [currentStep]);
  const [quizDone, setQuizDone] = useState({});
  const [score, setScore] = useState(0);
  const navigate = useNavigate();
  const { prevPath, nextPath } = useChapterNav();

  const step = STEPS[currentStep];
  const goNext = () => { if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1); };
  const goPrev = () => { if (currentStep > 0) setCurrentStep((s) => s - 1); };
  const handleQuizDone = () => {
    if (!quizDone[currentStep]) {
      setQuizDone((p) => ({ ...p, [currentStep]: true }));
      setScore((s) => s + 1);
    }
  };

  return (
    <div style={{
      minHeight: "100%", background: "#080D14", color: "#E6EDF3",
      fontFamily: "'Noto Sans TC', 'Segoe UI', sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 24px",
    }}>
      <div style={{ width: "100%", maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 900, color: "#fff",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {"</>"}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>面試複習：全端技術</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                {STEPS.length} 個技術 · 模擬面試
              </div>
            </div>
          </div>
          <div style={{
            fontSize: 12, color: ACCENT, fontFamily: "'JetBrains Mono', monospace",
            background: hexToRgba(ACCENT, 0.1), padding: "4px 10px", borderRadius: 6,
          }}>
            ⭐ {score}/{STEPS.length}
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 28 }}>
          {STEPS.map((_, i) => (
            <div key={i} onClick={() => setCurrentStep(i)} style={{
              flex: 1, height: 4, borderRadius: 2, cursor: "pointer",
              background: i <= currentStep ? `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})` : "rgba(255,255,255,0.06)",
              transition: "background 0.4s",
            }} />
          ))}
          <span style={{
            fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 8,
            fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap",
          }}>
            {currentStep + 1}/{STEPS.length}
          </span>
        </div>

        {/* Content Card */}
        <div style={{
          background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: 16, padding: "26px 22px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>{step.emoji}</span>
            <div>
              <h2 style={{
                margin: 0, fontSize: 20, fontWeight: 900,
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>{step.title}</h2>
              <div style={{
                fontSize: 11, color: hexToRgba(ACCENT, 0.6), marginTop: 2,
                fontFamily: "'JetBrains Mono', monospace",
              }}>{step.projectTag}</div>
            </div>
          </div>

          <ConceptBlocks blocks={[
            { title: "一句話說清楚", color: ACCENT, content: step.oneLiner },
            { title: "我在專案裡怎麼用", color: "#10B981", content: step.projectUsage },
          ]} />

          <InterviewQA qas={step.interviewQA} />
          <Quiz key={`q-${currentStep}`} quiz={step.quiz} onComplete={handleQuizDone} />
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 12 }}>
          {currentStep === 0 ? (
            prevPath ? (
              <button onClick={() => navigate(prevPath)} style={{ padding: "12px 24px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← 上一章</button>
            ) : <div />
          ) : (
            <button onClick={goPrev} style={{ padding: "12px 24px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← 上一個技術</button>
          )}
          {currentStep === STEPS.length - 1 ? (
            nextPath ? (
              <button onClick={() => navigate(nextPath)} style={{ padding: "12px 24px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>下一章 →</button>
            ) : <div />
          ) : (
            <button onClick={goNext} style={{ padding: "12px 24px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>下一個技術 →</button>
          )}
        </div>

        {currentStep === STEPS.length - 1 && quizDone[currentStep] && (
          <div style={{
            marginTop: 24, textAlign: "center", padding: "24px",
            background: hexToRgba(ACCENT, 0.08), border: `1px solid ${hexToRgba(ACCENT, 0.2)}`, borderRadius: 14,
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: ACCENT, marginBottom: 6 }}>
              全端技術面試複習完成！
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
              你已經複習了 {STEPS.length} 個全端核心技術。<br />
              面試時記得搭配專案經驗具體說明！
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
