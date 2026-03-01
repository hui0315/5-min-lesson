/* ══════════════════════════════════════════════
   Design Tokens — Single Source of Truth
   ══════════════════════════════════════════════ */

// Global palette
export const colors = {
  bg:        "#0D1117",
  bgDeep:    "#0A0E17",
  text:      "#E6EDF3",
  textMuted: "#8B949E",
  border:    "rgba(255,255,255,0.06)",
  gold:      "#E8C872",
  goldDark:  "#D4A843",
  // semantic (used inside content blocks — NOT per-lesson accent)
  green:     "#10B981",
  blue:      "#3B82F6",
  orange:    "#F59E0B",
  red:       "#EF4444",
};

// Per-lesson accent themes
export const lessonThemes = {
  "/tutorial":       { accent: "#E8C872", accent2: "#D4A843" },  // Gold — foundation
  "/github-setup":   { accent: "#60A5FA", accent2: "#3B82F6" },  // Sky Blue — cloud
  "/daily-workflow":  { accent: "#2DD4BF", accent2: "#14B8A6" },  // Teal — routine
  "/branching":      { accent: "#34D399", accent2: "#10B981" },  // Green — branches
  "/collaboration":  { accent: "#818CF8", accent2: "#6366F1" },  // Indigo — teamwork
  "/merge-advanced":  { accent: "#A78BFA", accent2: "#8B5CF6" },  // Purple — advanced merge
  "/advanced":       { accent: "#FB7185", accent2: "#F43F5E" },  // Rose — power tools
  "/commands-ref":    { accent: "#FBBF24", accent2: "#F59E0B" },  // Amber — clarity
  "/review":         { accent: "#22D3EE", accent2: "#06B6D4" },  // Cyan — review
  "/hands-on":       { accent: "#FB923C", accent2: "#F97316" },  // Orange — action
  // Interview prep courses
  "/interview-ai-ml":      { accent: "#F472B6", accent2: "#EC4899" },  // Pink — AI/ML
  "/interview-fullstack":  { accent: "#38BDF8", accent2: "#0EA5E9" },  // Sky — Full-stack
  "/interview-tools":      { accent: "#A3E635", accent2: "#84CC16" },  // Lime — Tools
};

// Helper: convert hex (#RRGGBB) to rgba string
export function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
