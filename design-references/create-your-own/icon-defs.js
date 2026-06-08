// icon-defs.js
// Geometry definitions for the Ahata icon library.
//
// Each icon is a list of "elements" (path / circle / rect / line / polyline /
// polygon). Each element has a `role`:
//   "main"   — rendered with the variation's primary stroke (always present)
//   "detail" — rendered with the secondary stroke (in some variations this is
//              dashed in #434c56; in hairline variation it matches main)
//   "fill"   — rendered as a filled shape (e.g. a pupil, a dot)
//
// All icons designed on a 24×24 grid. They render cleanly at any size because
// strokes use vector-effect:non-scaling-stroke in the reference HTML and
// explicit stroke-width in the exported SVGs.
//
// Authoring approach: every icon's geometry is hand-tuned to feel hand-drawn-
// adjacent but precise — no auto-generation, no shared primitives. Curves use
// short cubic Bézier segments; corners use small explicit radii (rx=2) on
// rects so they echo the rounding of the tile-pattern background.

const ICONS = {
  // ─── Brand ───────────────────────────────────────────────────────────────
  mark: {
    label: "Mark",
    category: "Brand",
    els: [
      { tag: "path", role: "main", d: "M12 3 L21 12 L12 21 L3 12 Z" },
    ],
  },

  // ─── Step / Section icons ───────────────────────────────────────────────
  visualize: {
    label: "Visualize",
    keyword: "eye",
    category: "Step",
    els: [
      // eye outline — two curves meeting at corners
      { tag: "path", role: "main",
        d: "M2.5 12 C 6 6.5, 11 5.5, 12 5.5 C 13 5.5, 18 6.5, 21.5 12 C 18 17.5, 13 18.5, 12 18.5 C 11 18.5, 6 17.5, 2.5 12 Z" },
      // iris
      { tag: "circle", role: "main", cx: 12, cy: 12, r: 3.6 },
      // pupil
      { tag: "circle", role: "fill", cx: 12, cy: 12, r: 1.3 },
      // catch-light
      { tag: "circle", role: "fill", cx: 13.4, cy: 10.7, r: 0.45, fillColor: "paper" },
    ],
  },

  design: {
    label: "Design",
    keyword: "hand with paintbrush",
    category: "Step",
    els: [
      // brush handle (long diagonal rect) — top-right to mid
      { tag: "path", role: "main",
        d: "M20 4 L21.2 5.2 L13.6 12.8 L12.4 11.6 Z" },
      // brush ferrule (the metal collar) — small rect at brush tip
      { tag: "path", role: "main",
        d: "M11.7 11.7 L13.7 13.7 L13 14.4 L11 12.4 Z" },
      // bristles — soft triangle below ferrule
      { tag: "path", role: "main",
        d: "M11 12.4 L13 14.4 L11.7 16.2 C 10.6 17.5, 9.4 17, 9.4 15.6 C 9.4 14.4, 10.1 13.2, 11 12.4 Z" },
      // paint drop / dot below
      { tag: "circle", role: "fill", cx: 8.4, cy: 18.2, r: 1.1 },
      // hand-as-base — a stylized wrist/thumb mark anchoring the brush
      { tag: "path", role: "main",
        d: "M4 20 L8 16 L10.4 18.4 L7.5 21.3 C 6.8 22, 5.6 22, 4.9 21.3 L4 20.4 C 3.8 20.2, 3.8 20.2, 4 20 Z" },
    ],
  },

  "how-it-works": {
    label: "How It Works",
    keyword: "hammer",
    category: "Step",
    els: [
      // hammer head — slightly tapered block, rotated ~25°
      { tag: "path", role: "main",
        d: "M4 8.5 L8.5 4 L14 4.6 L14.6 9.4 L10.1 13.9 Z" },
      // handle — diagonal from hammer head to lower right
      { tag: "path", role: "main",
        d: "M11.2 12.7 L19.8 21.3" },
      // handle grip — short cross marks near the bottom
      { tag: "path", role: "detail", d: "M16.6 17.2 L17.6 16.2" },
      { tag: "path", role: "detail", d: "M18 18.6 L19 17.6" },
      // claw notch on hammer head — small V
      { tag: "path", role: "detail", d: "M5.8 6.7 L7.2 8.1 L8.6 6.7" },
    ],
  },

  about: {
    label: "About",
    keyword: "user profile",
    category: "Step",
    els: [
      // head
      { tag: "circle", role: "main", cx: 12, cy: 8.5, r: 3.6 },
      // shoulders / body
      { tag: "path", role: "main",
        d: "M4.5 20.5 C 4.5 16.5, 8 14.5, 12 14.5 C 16 14.5, 19.5 16.5, 19.5 20.5" },
    ],
  },

  // ─── Construction (per request) ──────────────────────────────────────────
  ruler: {
    label: "Ruler",
    keyword: "ruler",
    category: "Construction",
    els: [
      // ruler body — diagonal long rect
      { tag: "path", role: "main",
        d: "M3.5 16.5 L7.5 20.5 L20.5 7.5 L16.5 3.5 Z" },
      // tick marks across the ruler
      { tag: "path", role: "detail", d: "M6.5 13.5 L8 15" },
      { tag: "path", role: "detail", d: "M9.5 10.5 L11.5 12.5" },
      { tag: "path", role: "detail", d: "M12.5 7.5 L14 9" },
      { tag: "path", role: "detail", d: "M15.5 4.5 L17.5 6.5" },
    ],
  },

  // ─── Specs / Hero tags ───────────────────────────────────────────────────
  density: {
    label: "Density",
    keyword: "layered material",
    category: "Spec",
    els: [
      // outer frame — slim rectangle
      { tag: "rect", role: "main", x: 3.5, y: 5.5, width: 17, height: 13, rx: 1.5 },
      // density bands — horizontal lines inside getting denser
      { tag: "path", role: "detail", d: "M5.5 8 L18.5 8" },
      { tag: "path", role: "detail", d: "M5.5 10.5 L18.5 10.5" },
      { tag: "path", role: "detail", d: "M5.5 12.5 L18.5 12.5" },
      { tag: "path", role: "detail", d: "M5.5 14 L18.5 14" },
      { tag: "path", role: "detail", d: "M5.5 15.2 L18.5 15.2" },
      { tag: "path", role: "detail", d: "M5.5 16.2 L18.5 16.2" },
    ],
  },

  "pine-frame": {
    label: "Pine Frame",
    keyword: "wooden frame",
    category: "Spec",
    els: [
      // outer frame
      { tag: "rect", role: "main", x: 3.5, y: 3.5, width: 17, height: 17, rx: 1.5 },
      // inner frame
      { tag: "rect", role: "main", x: 6.5, y: 6.5, width: 11, height: 11, rx: 1 },
      // corner miter lines (the 45° cuts visible at picture-frame corners)
      { tag: "path", role: "detail", d: "M3.5 3.5 L6.5 6.5" },
      { tag: "path", role: "detail", d: "M20.5 3.5 L17.5 6.5" },
      { tag: "path", role: "detail", d: "M3.5 20.5 L6.5 17.5" },
      { tag: "path", role: "detail", d: "M20.5 20.5 L17.5 17.5" },
    ],
  },

  "custom-print": {
    label: "Custom Print",
    keyword: "printer + sheet",
    category: "Spec",
    els: [
      // printer body
      { tag: "path", role: "main",
        d: "M5 11 L5 16.5 L7 16.5 L7 20 L17 20 L17 16.5 L19 16.5 L19 11 C 19 10, 18.4 9.4, 17.4 9.4 L6.6 9.4 C 5.6 9.4, 5 10, 5 11 Z" },
      // paper sheet on top (input)
      { tag: "path", role: "main", d: "M8 4 L16 4 L16 9.4 L8 9.4 Z" },
      // print preview lines on output paper
      { tag: "path", role: "detail", d: "M9 13.5 L15 13.5" },
      { tag: "path", role: "detail", d: "M9 15.5 L13 15.5" },
      { tag: "path", role: "detail", d: "M9 17.5 L15 17.5" },
      // status light
      { tag: "circle", role: "fill", cx: 17, cy: 12.5, r: 0.6 },
    ],
  },

  "seven-day": {
    label: "7-Day Build",
    keyword: "calendar",
    category: "Spec",
    els: [
      // calendar body
      { tag: "rect", role: "main", x: 3.5, y: 5, width: 17, height: 15.5, rx: 1.5 },
      // binding hooks
      { tag: "path", role: "main", d: "M8 3 L8 7" },
      { tag: "path", role: "main", d: "M16 3 L16 7" },
      // header divider
      { tag: "path", role: "main", d: "M3.5 10 L20.5 10" },
      // the "7" inside
      { tag: "path", role: "main",
        d: "M8.5 12.5 L15.5 12.5 L11.5 19" },
    ],
  },

  handmade: {
    label: "Hand Made",
    keyword: "hand",
    category: "Spec",
    els: [
      // palm + thumb (one continuous outline)
      { tag: "path", role: "main",
        d: "M8 11 L8 6.5 C 8 5.4, 8.8 4.7, 9.6 4.7 C 10.4 4.7, 11.2 5.4, 11.2 6.5 L11.2 10.5 L12.4 10.5 L12.4 5.2 C 12.4 4.1, 13.2 3.4, 14 3.4 C 14.8 3.4, 15.6 4.1, 15.6 5.2 L15.6 10.5 L16.8 10.5 L16.8 6.5 C 16.8 5.4, 17.6 4.7, 18.4 4.7 C 19.2 4.7, 20 5.4, 20 6.5 L20 14.5 C 20 18.4, 17.2 21, 13.6 21 C 10 21, 6 18.5, 6 14.5 L6 12 C 6 11.2, 6.6 10.6, 7.4 10.6 C 7.7 10.6, 8 10.7, 8 11 Z" },
    ],
  },

  // ─── Navigation ──────────────────────────────────────────────────────────
  consult: {
    label: "Consult",
    keyword: "chat",
    category: "Nav",
    els: [
      // speech bubble (rounded rect with a tail)
      { tag: "path", role: "main",
        d: "M4 6.5 C 4 5.4, 4.9 4.5, 6 4.5 L18 4.5 C 19.1 4.5, 20 5.4, 20 6.5 L20 14.5 C 20 15.6, 19.1 16.5, 18 16.5 L11 16.5 L7.5 20 L7.5 16.5 L6 16.5 C 4.9 16.5, 4 15.6, 4 14.5 Z" },
      // dots inside
      { tag: "circle", role: "fill", cx: 9, cy: 10.5, r: 0.7 },
      { tag: "circle", role: "fill", cx: 12, cy: 10.5, r: 0.7 },
      { tag: "circle", role: "fill", cx: 15, cy: 10.5, r: 0.7 },
    ],
  },

  // ─── Functional UI ───────────────────────────────────────────────────────
  upload: {
    label: "Upload",
    category: "UI",
    els: [
      // tray
      { tag: "path", role: "main",
        d: "M4 15 L4 18.5 C 4 19.3, 4.7 20, 5.5 20 L18.5 20 C 19.3 20, 20 19.3, 20 18.5 L20 15" },
      // arrow up
      { tag: "path", role: "main", d: "M12 16 L12 4" },
      { tag: "path", role: "main", d: "M7 9 L12 4 L17 9" },
    ],
  },

  rotate: {
    label: "Rotate",
    category: "UI",
    els: [
      // 3/4 arc
      { tag: "path", role: "main",
        d: "M19.5 12 A 7.5 7.5 0 1 1 12 4.5" },
      // arrowhead at top
      { tag: "path", role: "main", d: "M12 4.5 L9 3 M12 4.5 L9.8 7.5" },
    ],
  },

  grid: {
    label: "Grid",
    category: "UI",
    els: [
      { tag: "rect", role: "main", x: 3.5, y: 3.5, width: 17, height: 17, rx: 1 },
      { tag: "path", role: "main", d: "M9.5 3.5 L9.5 20.5" },
      { tag: "path", role: "main", d: "M15 3.5 L15 20.5" },
      { tag: "path", role: "main", d: "M3.5 9.5 L20.5 9.5" },
      { tag: "path", role: "main", d: "M3.5 15 L20.5 15" },
    ],
  },

  dimension: {
    label: "Dimension",
    category: "UI",
    els: [
      // measurement line
      { tag: "path", role: "main", d: "M4 12 L20 12" },
      // end caps (perpendicular ticks)
      { tag: "path", role: "main", d: "M4 8 L4 16" },
      { tag: "path", role: "main", d: "M20 8 L20 16" },
      // arrows on the line
      { tag: "path", role: "detail", d: "M6.5 10 L4 12 L6.5 14" },
      { tag: "path", role: "detail", d: "M17.5 10 L20 12 L17.5 14" },
    ],
  },

  "zoom-in": {
    label: "Zoom In",
    category: "UI",
    els: [
      { tag: "circle", role: "main", cx: 10.5, cy: 10.5, r: 6 },
      { tag: "path", role: "main", d: "M15 15 L20 20" },
      { tag: "path", role: "main", d: "M8 10.5 L13 10.5" },
      { tag: "path", role: "main", d: "M10.5 8 L10.5 13" },
    ],
  },

  "zoom-out": {
    label: "Zoom Out",
    category: "UI",
    els: [
      { tag: "circle", role: "main", cx: 10.5, cy: 10.5, r: 6 },
      { tag: "path", role: "main", d: "M15 15 L20 20" },
      { tag: "path", role: "main", d: "M8 10.5 L13 10.5" },
    ],
  },

  trash: {
    label: "Trash",
    category: "UI",
    els: [
      // lid line + handle
      { tag: "path", role: "main", d: "M3.5 6.5 L20.5 6.5" },
      { tag: "path", role: "main", d: "M9.5 6.5 L9.5 4.5 C 9.5 4, 9.9 3.5, 10.5 3.5 L13.5 3.5 C 14.1 3.5, 14.5 4, 14.5 4.5 L14.5 6.5" },
      // can body
      { tag: "path", role: "main",
        d: "M5.5 6.5 L6.5 19.5 C 6.6 20.3, 7.2 20.5, 7.7 20.5 L16.3 20.5 C 16.8 20.5, 17.4 20.3, 17.5 19.5 L18.5 6.5" },
      // vertical lines inside
      { tag: "path", role: "detail", d: "M10 10 L10 17" },
      { tag: "path", role: "detail", d: "M14 10 L14 17" },
    ],
  },

  check: {
    label: "Check",
    category: "UI",
    els: [
      { tag: "path", role: "main", d: "M4.5 12 L10 17.5 L19.5 7" },
    ],
  },

  close: {
    label: "Close",
    category: "UI",
    els: [
      { tag: "path", role: "main", d: "M5 5 L19 19" },
      { tag: "path", role: "main", d: "M19 5 L5 19" },
    ],
  },

  plus: {
    label: "Plus",
    category: "UI",
    els: [
      { tag: "path", role: "main", d: "M12 4.5 L12 19.5" },
      { tag: "path", role: "main", d: "M4.5 12 L19.5 12" },
    ],
  },

  minus: {
    label: "Minus",
    category: "UI",
    els: [
      { tag: "path", role: "main", d: "M4.5 12 L19.5 12" },
    ],
  },

  "arrow-right": {
    label: "Arrow Right",
    category: "UI",
    els: [
      { tag: "path", role: "main", d: "M4 12 L20 12" },
      { tag: "path", role: "main", d: "M14 6 L20 12 L14 18" },
    ],
  },

  info: {
    label: "Info",
    category: "UI",
    els: [
      { tag: "circle", role: "main", cx: 12, cy: 12, r: 8.5 },
      { tag: "path", role: "main", d: "M12 11 L12 16.5" },
      { tag: "circle", role: "fill", cx: 12, cy: 7.8, r: 0.95 },
    ],
  },

  // ─── Contact / Footer ────────────────────────────────────────────────────
  email: {
    label: "Email",
    category: "Contact",
    els: [
      { tag: "rect", role: "main", x: 3.5, y: 5.5, width: 17, height: 13, rx: 1.5 },
      { tag: "path", role: "main", d: "M4 6.5 L12 13 L20 6.5" },
    ],
  },

  phone: {
    label: "Phone",
    category: "Contact",
    els: [
      { tag: "path", role: "main",
        d: "M5 5.5 C 5 4.4, 5.9 3.5, 7 3.5 L9 3.5 C 10 3.5, 10.4 4, 10.6 4.7 L11.7 7.6 C 11.9 8.3, 11.6 9, 11 9.4 L9.6 10.3 C 10.7 12.7, 12.3 14.3, 14.7 15.4 L15.6 14 C 16 13.4, 16.7 13.1, 17.4 13.3 L20.3 14.4 C 21 14.6, 21.5 15, 21.5 16 L21.5 18 C 21.5 19.1, 20.6 20, 19.5 20 C 11.5 20, 5 13.5, 5 5.5 Z" },
    ],
  },

  instagram: {
    label: "Instagram",
    category: "Contact",
    els: [
      { tag: "rect", role: "main", x: 3.5, y: 3.5, width: 17, height: 17, rx: 4.5 },
      { tag: "circle", role: "main", cx: 12, cy: 12, r: 4 },
      { tag: "circle", role: "fill", cx: 17, cy: 7, r: 0.95 },
    ],
  },
};

const CATEGORIES = ["Brand", "Step", "Construction", "Spec", "Nav", "UI", "Contact"];

// 4 style variations
const VARIATIONS = {
  v1: {
    name: "Outline Precise",
    sub: "1.8px · round caps · 2u corner radius",
    main:   { stroke: "#1c1c1d", width: 1.8, cap: "round", join: "round", dash: "" },
    detail: { stroke: "#1c1c1d", width: 1.8, cap: "round", join: "round", dash: "" },
    fill: "#1c1c1d",
    paper: "#f8f8f8",
    decoration: null,
  },
  v2: {
    name: "Blueprint",
    sub: "1.4px main + 0.8px dashed · square caps · corner ticks",
    main:   { stroke: "#1c1c1d", width: 1.4, cap: "square", join: "miter", dash: "" },
    detail: { stroke: "#434c56", width: 0.8, cap: "butt",   join: "miter", dash: "1.4 1.2" },
    fill: "#1c1c1d",
    paper: "#f8f8f8",
    // Decoration: 4 tiny L-shapes at the corners of the icon's bounding box
    decoration: ({ pad = 1.5, arm = 1.6, stroke = "#434c56", width = 0.7 }) => `
      <g fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="square">
        <path d="M${pad} ${pad + arm} L${pad} ${pad} L${pad + arm} ${pad}"/>
        <path d="M${24 - pad} ${pad + arm} L${24 - pad} ${pad} L${24 - pad - arm} ${pad}"/>
        <path d="M${pad} ${24 - pad - arm} L${pad} ${24 - pad} L${pad + arm} ${24 - pad}"/>
        <path d="M${24 - pad} ${24 - pad - arm} L${24 - pad} ${24 - pad} L${24 - pad - arm} ${24 - pad}"/>
      </g>
    `,
  },
  v3: {
    name: "Hairline",
    sub: "1px · round caps · quiet, recedes",
    main:   { stroke: "#1c1c1d", width: 1, cap: "round", join: "round", dash: "" },
    detail: { stroke: "#1c1c1d", width: 1, cap: "round", join: "round", dash: "" },
    fill: "#1c1c1d",
    paper: "#f8f8f8",
    decoration: null,
  },
  v4: {
    name: "Bracketed",
    sub: "2px · with steel-grey corner brackets",
    main:   { stroke: "#1c1c1d", width: 2,   cap: "round", join: "round", dash: "" },
    detail: { stroke: "#1c1c1d", width: 1.4, cap: "round", join: "round", dash: "" },
    fill: "#1c1c1d",
    paper: "#f8f8f8",
    // Decoration: 4 corner brackets framing the icon (per design.md spec)
    decoration: ({ pad = 0.6, arm = 4, stroke = "#434c56", width = 1.4 }) => `
      <g fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">
        <path d="M${pad} ${pad + arm} L${pad} ${pad} L${pad + arm} ${pad}"/>
        <path d="M${24 - pad} ${pad + arm} L${24 - pad} ${pad} L${24 - pad - arm} ${pad}"/>
        <path d="M${pad} ${24 - pad - arm} L${pad} ${24 - pad} L${pad + arm} ${24 - pad}"/>
        <path d="M${24 - pad} ${24 - pad - arm} L${24 - pad} ${24 - pad} L${24 - pad - arm} ${24 - pad}"/>
      </g>
    `,
  },
};

// Render an element to SVG string given a variation
function renderElement(el, variation) {
  const s = el.role === "main"   ? variation.main
          : el.role === "detail" ? variation.detail
          : null;
  if (el.role === "fill") {
    const color = el.fillColor === "paper" ? variation.paper : variation.fill;
    if (el.tag === "circle") {
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${color}"/>`;
    }
    if (el.tag === "path") {
      return `<path d="${el.d}" fill="${color}"/>`;
    }
  }
  // stroked element
  const attrs = `fill="none" stroke="${s.stroke}" stroke-width="${s.width}" stroke-linecap="${s.cap}" stroke-linejoin="${s.join}"${s.dash ? ` stroke-dasharray="${s.dash}"` : ""}`;
  if (el.tag === "circle") return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" ${attrs}/>`;
  if (el.tag === "rect")   return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"${el.rx != null ? ` rx="${el.rx}"` : ""} ${attrs}/>`;
  if (el.tag === "path")   return `<path d="${el.d}" ${attrs}/>`;
  if (el.tag === "line")   return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" ${attrs}/>`;
  return "";
}

// Render a full icon SVG given a variation
function renderIcon(iconKey, variationKey, opts = {}) {
  const icon = ICONS[iconKey];
  const variation = VARIATIONS[variationKey];
  if (!icon || !variation) return "";
  const decoration = variation.decoration ? variation.decoration({}) : "";
  const body = icon.els.map(el => renderElement(el, variation)).join("\n  ");
  const size = opts.size || 24;
  const xmlns = opts.standalone ? ` xmlns="http://www.w3.org/2000/svg"` : "";
  return `<svg${xmlns} viewBox="0 0 24 24" width="${size}" height="${size}">
  ${decoration}
  ${body}
</svg>`;
}

if (typeof window !== "undefined") {
  Object.assign(window, { ICONS, CATEGORIES, VARIATIONS, renderIcon, renderElement });
}
if (typeof module !== "undefined") {
  module.exports = { ICONS, CATEGORIES, VARIATIONS, renderIcon, renderElement };
}
