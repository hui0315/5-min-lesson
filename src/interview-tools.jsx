import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChapterNav } from "./chapter-context";
import { colors, lessonThemes, hexToRgba } from "./theme";

const { accent: ACCENT, accent2: ACCENT2 } = lessonThemes["/interview-tools"];

/* ══════════════════════════════════════════════
   面試複習：工具 — Git & GitHub
   ══════════════════════════════════════════════ */

const STEPS = [
  /* ─── Git ─── */
  {
    id: "git",
    title: "Git",
    emoji: "🔀",
    oneLiner: "Git 是分散式版本控制系統，追蹤程式碼的每次變更，支援分支和合併，讓個人和團隊能安全地管理程式碼演進。",
    projectUsage: "所有專案（FindYourJob、5-min-lesson、論文程式碼、AIGO）都用 Git 管理版本，使用 feature branch workflow，每個功能一個分支，完成後 merge 回 main。",
    projectTag: "所有專案",
    interviewQA: [
      {
        q: "git merge 和 git rebase 的差別？什麼時候用哪個？",
        a: "merge 保留完整歷史，產生一個 merge commit，歷史圖會有分支匯流。rebase 把 commit「搬到」目標分支最新位置，歷史是一條直線。用 merge：合進 main、團隊協作（保留歷史）。用 rebase：個人分支更新 main 最新程式碼（保持歷史乾淨）。黃金規則：不要 rebase 已經推到遠端的公共分支。",
      },
      {
        q: "如果不小心 commit 了敏感資訊（如 API key），怎麼處理？",
        a: "如果還沒 push：git reset --soft HEAD~1 撤回 commit，刪除敏感檔案，加入 .gitignore，重新 commit。如果已經 push：用 git filter-branch 或 BFG Repo-Cleaner 從所有歷史中移除該檔案，然後 force push。最重要：立刻撤銷並更換那個 key，因為 GitHub 上的歷史可能已被快取。",
      },
      {
        q: "什麼是 Git Flow？你實際怎麼使用分支策略？",
        a: "Git Flow 定義了 main（正式版）、develop（開發版）、feature/*、release/*、hotfix/* 等分支。我在個人專案中用簡化版：main 是穩定版，每個功能開 feature/xxx 分支，完成後 PR merge 回 main。小團隊不需要完整 Git Flow，GitHub Flow（main + feature branch）就夠了。",
      },
    ],
    quiz: {
      question: "以下哪個情境最適合用 git rebase？",
      options: [
        { text: "把 feature branch 合進 main", correct: false },
        { text: "讓個人的 feature branch 更新到最新的 main", correct: true },
        { text: "解決已推到遠端的 merge conflict", correct: false },
      ],
    },
  },

  /* ─── GitHub ─── */
  {
    id: "github",
    title: "GitHub",
    emoji: "🐙",
    oneLiner: "GitHub 是基於 Git 的程式碼託管平台，提供 Pull Request、Issues、Actions（CI/CD）等協作和自動化功能。",
    projectUsage: "所有專案都託管在 GitHub 上：用 Pull Request 做 Code Review、用 Issues 追蹤 bug 和功能需求、用 GitHub Pages 部署 5-min-lesson 靜態站點。",
    projectTag: "所有專案",
    interviewQA: [
      {
        q: "Pull Request 的流程是什麼？為什麼重要？",
        a: "流程：(1) 從 main 開 feature branch → (2) 開發完 push 到 GitHub → (3) 開 PR 描述改了什麼、為什麼改 → (4) 團隊成員 Code Review → (5) 修改回饋 → (6) Approve 後 merge。重要性：確保程式碼品質、知識分享、減少 bug、留下討論紀錄。即使是個人專案，PR 也能幫你自我檢查。",
      },
      {
        q: "GitHub Actions 是什麼？你怎麼用它？",
        a: "GitHub Actions 是 GitHub 內建的 CI/CD 工具，用 YAML 定義 workflow，在 push、PR、schedule 等事件時自動執行。我用它做：push 時自動跑 lint + test、PR 時自動建構確認不會壞、merge 到 main 時自動部署到 GitHub Pages。配置檔放在 .github/workflows/ 目錄。",
      },
      {
        q: "Fork 和 Clone 的差別？",
        a: "Clone 是把 repo 下載到本地，還是連著原本的 remote。Fork 是在你的 GitHub 帳號下建立一份完整副本（獨立 repo），你有完整的寫入權限。貢獻開源專案的流程：Fork → Clone → 開分支修改 → Push 到你的 Fork → 向原始 repo 開 PR。",
      },
    ],
    quiz: {
      question: "想貢獻一個你沒有寫入權限的開源專案，第一步應該？",
      options: [
        { text: "直接 clone 然後 push", correct: false },
        { text: "先 Fork 到自己帳號，再 clone 下來修改", correct: true },
        { text: "發 Issue 請維護者幫你改", correct: false },
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
export default function InterviewTools() {
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
              fontSize: 16, fontWeight: 900, color: colors.bg,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {"#_"}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>面試複習：開發工具</div>
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
              <button onClick={() => navigate(nextPath)} style={{ padding: "12px 24px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, border: "none", borderRadius: 10, color: colors.bg, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>下一章 →</button>
            ) : <div />
          ) : (
            <button onClick={goNext} style={{ padding: "12px 24px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, border: "none", borderRadius: 10, color: colors.bg, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>下一個技術 →</button>
          )}
        </div>

        {currentStep === STEPS.length - 1 && quizDone[currentStep] && (
          <div style={{
            marginTop: 24, textAlign: "center", padding: "24px",
            background: hexToRgba(ACCENT, 0.08), border: `1px solid ${hexToRgba(ACCENT, 0.2)}`, borderRadius: 14,
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: ACCENT, marginBottom: 6 }}>
              開發工具面試複習完成！
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
              Git 和 GitHub 是每個工程師的基本功。<br />
              面試時展現你實際的工作流程，而不是背指令！
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
