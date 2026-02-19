import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import GitTutorial from "./git-tutorial";
import GitAdvanced from "./git-advanced";
import GitBridge1 from "./git-bridge-1";
import GitBridge2 from "./git-bridge-2";
import GitCommandsRef from "./git-commands-ref";
import GitReview from "./git-review";

/* ─────────────────────────────────────
   Course metadata
   ───────────────────────────────────── */
const COURSES = [
  {
    path: "/tutorial",
    label: "Git 入門",
    subtitle: "版本控制基礎",
    icon: "G",
    accent: "#E8C872",
    badge: "1",
    element: <GitTutorial />,
  },
  {
    path: "/advanced",
    label: "Git 進階",
    subtitle: "stash · log · rebase",
    icon: "G+",
    accent: "#3B82F6",
    badge: "2",
    element: <GitAdvanced />,
  },
  {
    path: "/bridge-1",
    label: "遠端與協作",
    subtitle: "clone · fetch · push",
    icon: "G3",
    accent: "#8B5CF6",
    badge: "3",
    element: <GitBridge1 />,
  },
  {
    path: "/bridge-2",
    label: "合併與衝突",
    subtitle: "merge · rebase · tag",
    icon: "4",
    accent: "#A78BFA",
    badge: "4",
    element: <GitBridge2 />,
  },
  {
    path: "/commands-ref",
    label: "指令總覽",
    subtitle: "比較 · 速查表",
    icon: "5",
    accent: "#F472B6",
    badge: "5",
    element: <GitCommandsRef />,
  },
  {
    path: "/review",
    label: "總複習",
    subtitle: "情境實戰演練",
    icon: "G★",
    accent: "#F59E0B",
    badge: "6",
    element: <GitReview />,
  },
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
function Sidebar({ open, onClose }) {
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
          background: "#0A0E17",
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
                    ? `${c.accent}15`
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
                    color: isActive ? "#0D1117" : "rgba(255,255,255,0.35)",
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
                        ? `${c.accent}88`
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

  return (
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
  );
}

/* ─────────────────────────────────────
   Main App
   ───────────────────────────────────── */
function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 900);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 900);

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
        background: "#0D1117",
      }}
    >
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
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
