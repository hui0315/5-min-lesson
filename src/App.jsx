import { useState, useEffect, useLayoutEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChapterContext } from "./chapter-context";
import CheatsheetPanel from "./git-cheatsheet-panel";
import { colors, lessonThemes, hexToRgba } from "./theme";
import GitTutorial from "./git-tutorial";
import GitGithubSetup from "./git-github-setup";
import GitDailyWorkflow from "./git-daily-workflow";
import GitBranching from "./git-branching";
import GitBridge1 from "./git-bridge-1";
import GitBridge2 from "./git-bridge-2";
import GitAdvanced from "./git-advanced";
import GitCommandsRef from "./git-commands-ref";
import GitReview from "./git-review";
import GitHandsOn from "./git-hands-on";

/* ─────────────────────────────────────
   Course metadata
   ───────────────────────────────────── */
const COURSES = [
  { path: "/tutorial",       label: "Git 入門",   subtitle: "版本控制基礎",           accent: lessonThemes["/tutorial"].accent,      accent2: lessonThemes["/tutorial"].accent2,      badge: "1",  element: <GitTutorial /> },
  { path: "/github-setup",   label: "本地到雲端", subtitle: "init · commit · push",    accent: lessonThemes["/github-setup"].accent,   accent2: lessonThemes["/github-setup"].accent2,   badge: "2",  element: <GitGithubSetup /> },
  { path: "/daily-workflow",  label: "日常工作流", subtitle: "改 Bug · 推送 · 循環",   accent: lessonThemes["/daily-workflow"].accent,  accent2: lessonThemes["/daily-workflow"].accent2,  badge: "3",  element: <GitDailyWorkflow /> },
  { path: "/branching",      label: "分支管理",   subtitle: "feature · merge · hotfix", accent: lessonThemes["/branching"].accent,      accent2: lessonThemes["/branching"].accent2,      badge: "4",  element: <GitBranching /> },
  { path: "/collaboration",  label: "團隊協作",   subtitle: "clone · fetch · pull",    accent: lessonThemes["/collaboration"].accent,  accent2: lessonThemes["/collaboration"].accent2,  badge: "5",  element: <GitBridge1 /> },
  { path: "/merge-advanced",  label: "合併進階",   subtitle: "rebase · conflict · tag", accent: lessonThemes["/merge-advanced"].accent,  accent2: lessonThemes["/merge-advanced"].accent2,  badge: "6",  element: <GitBridge2 /> },
  { path: "/advanced",       label: "進階技巧",   subtitle: "stash · reset · bisect",  accent: lessonThemes["/advanced"].accent,       accent2: lessonThemes["/advanced"].accent2,       badge: "7",  element: <GitAdvanced /> },
  { path: "/commands-ref",    label: "觀念澄清",   subtitle: "易混淆指令 · 情境決策",    accent: lessonThemes["/commands-ref"].accent,    accent2: lessonThemes["/commands-ref"].accent2,    badge: "8",  element: <GitCommandsRef /> },
  { path: "/review",         label: "總複習",     subtitle: "情境實戰演練",             accent: lessonThemes["/review"].accent,         accent2: lessonThemes["/review"].accent2,         badge: "9",  element: <GitReview /> },
  { path: "/hands-on",       label: "實戰演練",   subtitle: "從零到 GitHub 三日旅程",   accent: lessonThemes["/hands-on"].accent,       accent2: lessonThemes["/hands-on"].accent2,       badge: "10", element: <GitHandsOn /> },
];

/* ─────────────────────────────────────
   Page transition variants
   ───────────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0, x: 60, filter: "blur(4px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: -60, filter: "blur(4px)" },
};
const pageTransition = {
  type: "tween",
  ease: [0.4, 0, 0.2, 1],
  duration: 0.35,
};

/* ─────────────────────────────────────
   Sidebar component
   ───────────────────────────────────── */
function Sidebar({ open, onClose, onOpenCheatsheet }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (path) => {
    navigate(path);
    if (window.innerWidth < 900) onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 90,
            display: window.innerWidth >= 900 ? "none" : "block",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 270,
          background: colors.bgDeep,
          borderRight: "1px solid rgba(255,255,255,0.06)",
          zIndex: 100,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Sidebar header */}
        <div
          style={{
            padding: "20px 18px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 900,
                color: colors.bg,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Git
            </div>
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                5 分鐘學 Git
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  color: "rgba(255,255,255,0.3)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                互動課程系列
              </div>
            </div>
          </div>

          {/* Close button (mobile) */}
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              fontSize: 20,
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: 6,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Course list */}
        <div style={{ padding: "12px 10px", flex: 1 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(255,255,255,0.25)",
              textTransform: "uppercase",
              letterSpacing: 1.5,
              padding: "0 8px 10px",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            課程目錄
          </div>

          {COURSES.map((c) => {
            const isActive =
              location.pathname === c.path ||
              (location.pathname === "/" && c.path === "/tutorial");
            return (
              <button
                key={c.path}
                onClick={() => handleNav(c.path)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 12px",
                  marginBottom: 4,
                  background: isActive
                    ? hexToRgba(c.accent, 0.08)
                    : "transparent",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  textAlign: "left",
                  borderLeft: isActive
                    ? `3px solid ${c.accent}`
                    : "3px solid transparent",
                }}
                onMouseOver={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.04)";
                }}
                onMouseOut={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Badge */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: isActive
                      ? `linear-gradient(135deg, ${c.accent}, ${c.accent}99)`
                      : "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 900,
                    color: isActive ? colors.bg : "rgba(255,255,255,0.35)",
                    fontFamily: "'JetBrains Mono', monospace",
                    flexShrink: 0,
                    transition: "all 0.25s ease",
                  }}
                >
                  {c.badge}
                </div>

                {/* Text */}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive
                        ? c.accent
                        : "rgba(255,255,255,0.65)",
                      transition: "color 0.25s",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {c.label}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: isActive
                        ? hexToRgba(c.accent, 0.53)
                        : "rgba(255,255,255,0.25)",
                      fontFamily: "'JetBrains Mono', monospace",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      transition: "color 0.25s",
                    }}
                  >
                    {c.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Cheatsheet button */}
        <div style={{ padding: "0 10px 8px" }}>
          <div style={{
            borderTop: "1px dashed rgba(255,255,255,0.08)",
            margin: "0 8px 10px",
          }} />
          <button
            onClick={() => { onOpenCheatsheet(); if (window.innerWidth < 900) onClose(); }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 12px",
              background: hexToRgba(colors.gold, 0.04),
              border: `1px dashed ${hexToRgba(colors.gold, 0.2)}`,
              borderRadius: 10,
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.25s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = hexToRgba(colors.gold, 0.1);
              e.currentTarget.style.borderColor = hexToRgba(colors.gold, 0.35);
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = hexToRgba(colors.gold, 0.04);
              e.currentTarget.style.borderColor = hexToRgba(colors.gold, 0.2);
            }}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: hexToRgba(colors.gold, 0.12),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              flexShrink: 0,
            }}>
              ⚡
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: colors.gold,
                whiteSpace: "nowrap",
              }}>
                指令速查表
              </div>
              <div style={{
                fontSize: 11,
                color: hexToRgba(colors.gold, 0.5),
                fontFamily: "'JetBrains Mono', monospace",
                whiteSpace: "nowrap",
              }}>
                隨時查閱所有指令
              </div>
            </div>
          </button>
        </div>

        {/* Sidebar footer */}
        <div
          style={{
            padding: "14px 18px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            fontSize: 10.5,
            color: "rgba(255,255,255,0.2)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {COURSES.length} 堂課程
        </div>
      </aside>
    </>
  );
}

/* ─────────────────────────────────────
   Animated Routes
   ───────────────────────────────────── */
function AnimatedRoutes() {
  const location = useLocation();

  /* Scroll to top on route change (chapter navigation) */
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  /* Determine prev / next chapter for current route */
  const currentIdx = COURSES.findIndex(
    (c) => c.path === location.pathname || (location.pathname === "/" && c.path === "/tutorial")
  );
  const chapterNav = {
    prevPath: currentIdx > 0 ? COURSES[currentIdx - 1].path : null,
    nextPath: currentIdx < COURSES.length - 1 ? COURSES[currentIdx + 1].path : null,
    prevLabel: currentIdx > 0 ? COURSES[currentIdx - 1].label : null,
    nextLabel: currentIdx < COURSES.length - 1 ? COURSES[currentIdx + 1].label : null,
  };

  return (
    <ChapterContext.Provider value={chapterNav}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          style={{ width: "100%", minHeight: "100%" }}
        >
          <Routes location={location}>
            {COURSES.map((c) => (
              <Route key={c.path} path={c.path} element={c.element} />
            ))}
            <Route path="*" element={<GitTutorial />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </ChapterContext.Provider>
  );
}

/* ─────────────────────────────────────
   Main App
   ───────────────────────────────────── */
function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 900);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 900);
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 900;
      setIsDesktop(desktop);
      if (desktop) setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: colors.bg,
      }}
    >
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenCheatsheet={() => setCheatsheetOpen(true)}
      />
      <CheatsheetPanel
        open={cheatsheetOpen}
        onClose={() => setCheatsheetOpen(false)}
      />

      {/* Main content */}
      <div
        style={{
          flex: 1,
          marginLeft: isDesktop && sidebarOpen ? 270 : 0,
          transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          position: "relative",
        }}
      >
        {/* Top bar with hamburger */}
        <div
          className="topbar"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            height: 52,
            background: "rgba(13,17,23,0.85)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              fontSize: 20,
              cursor: "pointer",
              padding: "6px 10px",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background =
                "rgba(255,255,255,0.06)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            title={sidebarOpen ? "收起導航" : "展開導航"}
          >
            {sidebarOpen && isDesktop ? (
              /* Collapse icon */
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <polyline points="14 9 11 12 14 15" />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>

          <div
            style={{
              marginLeft: 12,
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Git 互動課程
          </div>

          {/* Cheatsheet quick access in topbar */}
          <button
            onClick={() => setCheatsheetOpen(true)}
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              background: hexToRgba(colors.gold, 0.06),
              border: `1px solid ${hexToRgba(colors.gold, 0.15)}`,
              borderRadius: 8,
              cursor: "pointer",
              transition: "all 0.2s",
              color: hexToRgba(colors.gold, 0.6),
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = hexToRgba(colors.gold, 0.12);
              e.currentTarget.style.color = colors.gold;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = hexToRgba(colors.gold, 0.06);
              e.currentTarget.style.color = hexToRgba(colors.gold, 0.6);
            }}
            title="指令速查表"
          >
            ⚡ 速查表
          </button>
        </div>

        {/* Page content */}
        <div
          style={{
            flex: 1,
            overflowX: "hidden",
          }}
        >
          <AnimatedRoutes />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
