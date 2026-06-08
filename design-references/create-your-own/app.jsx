// app.jsx
const { useState, useMemo, useCallback, useEffect, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "fgA": "#1C1C1D",
  "fgB": "#434C56",
  "bg": "#FAF7F2",
  "mix": 50,
  "gap": 7,
  "unit": 25,
  "radius": 4,
  "squarePref": 75
}/*EDITMODE-END*/;

const COLOR_OPTIONS = ["#1C1C1D", "#434C56", "#0E1F28", "#2D2A24", "#3E2723", "#6B3F2A", "#0F5132", "#7A1F2B"];
const BG_OPTIONS    = ["#FAF7F2", "#FFFFFF", "#F1ECE3", "#E9E4D9", "#1C1C1D", "#434C56"];

// ── A single pattern card ───────────────────────────────────────────────────
function PatternCard({ label, dims, seed, onReseed, t, isDarkBg }) {
  const [w, h] = dims;
  const svgRef = useRef(null);

  const rects = useMemo(
    () => generatePattern({
      seed,
      width: w,
      height: h,
      unit: t.unit,
      squarePref: t.squarePref / 100,
    }),
    [seed, w, h, t.unit, t.squarePref]
  );

  const svgText = useMemo(
    () => renderPatternSVG(rects, {
      width: w, height: h,
      gap: t.gap,
      fillA: t.fgA, fillB: t.fgB, mix: t.mix,
      radius: t.radius,
      padding: t.gap / 2, // outer margin = inner half-gap → uniform whitespace
    }),
    [rects, w, h, t.gap, t.fgA, t.fgB, t.mix, t.radius]
  );

  const download = useCallback(() => {
    const blob = new Blob([svgText], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pattern-${label.toLowerCase().replace(/\s+/g, "-")}-${seed}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [svgText, label, seed]);

  const copySvg = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(svgText);
    } catch (e) {}
  }, [svgText]);

  const aspect = `${w} / ${h}`;
  const ratioLabel = simplifyRatio(w, h);

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-meta">
          <span className="card-label">{label}</span>
          <span className="card-dim">{w} × {h} <span className="dim-ratio">· {ratioLabel}</span></span>
        </div>
        <div className="card-actions">
          <button className="btn ghost" onClick={onReseed} title="Randomize this pattern">
            <ShuffleIcon /> <span>Shuffle</span>
          </button>
          <button className="btn ghost" onClick={copySvg} title="Copy SVG to clipboard">
            <CopyIcon /> <span>Copy SVG</span>
          </button>
          <button className="btn" onClick={download} title="Download SVG">
            <DownloadIcon /> <span>SVG</span>
          </button>
        </div>
      </div>

      <div
        className="card-stage"
        style={{
          background: t.bg,
          aspectRatio: `${w + t.gap} / ${h + t.gap}`,
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${w + t.gap} ${h + t.gap}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ display: "block", width: "100%", height: "100%" }}
        >
          {rects.map((r, i) => {
            const fill = t.fgB && r.tone != null && r.tone * 100 < t.mix ? t.fgB : t.fgA;
            return (
              <rect
                key={i}
                x={r.x + t.gap}
                y={r.y + t.gap}
                width={Math.max(0, r.w - t.gap)}
                height={Math.max(0, r.h - t.gap)}
                rx={t.radius}
                ry={t.radius}
                fill={fill}
              />
            );
          })}
        </svg>
      </div>

      <div className="card-foot">
        <span className="muted">{rects.length} cells · seed {seed}</span>
      </div>
    </div>
  );
}

function simplifyRatio(a, b) {
  const g = (x, y) => (y ? g(y, x % y) : x);
  const d = g(a, b);
  return `${a / d}:${b / d}`;
}

// ── Icons ───────────────────────────────────────────────────────────────────
const ShuffleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3h5v5"/><path d="M4 20l17-17"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const CopyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const DiceIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/><circle cx="16" cy="16" r="1.2" fill="currentColor"/><circle cx="16" cy="8" r="1.2" fill="currentColor"/><circle cx="8" cy="16" r="1.2" fill="currentColor"/>
  </svg>
);

// ── Header ──────────────────────────────────────────────────────────────────
function Header({ onShuffleAll, masterSeed }) {
  return (
    <header className="hdr">
      <div className="hdr-left">
        <div className="hdr-mark">
          <svg width="22" height="22" viewBox="0 0 22 22"><rect x="1" y="1" width="9" height="13" fill="#0E1F28"/><rect x="12" y="1" width="9" height="6" fill="#0E1F28"/><rect x="1" y="16" width="13" height="5" fill="#0E1F28"/><rect x="16" y="9" width="5" height="12" fill="#0E1F28"/></svg>
        </div>
        <div>
          <div className="hdr-title">Pattern Studio</div>
          <div className="hdr-sub">Randomized rectangle tessellations for banners & bands</div>
        </div>
      </div>
      <div className="hdr-right">
        <span className="seed-tag">master seed · {masterSeed}</span>
        <button className="btn primary big" onClick={onShuffleAll}>
          <DiceIcon /> <span>Randomize all</span>
          <kbd>Space</kbd>
        </button>
      </div>
    </header>
  );
}

// ── App ─────────────────────────────────────────────────────────────────────
const PATTERNS = [
  { label: "Wide band",    dims: [1920, 480] },
  { label: "Thin band",    dims: [1920, 200] },
];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Each pattern owns its own seed; "Randomize all" jumps the master and
  // derives per-card seeds from it deterministically.
  const [master, setMaster] = useState(() => Math.floor(Math.random() * 9999) + 1);
  const [seeds, setSeeds] = useState(() =>
    PATTERNS.map((_, i) => (Math.floor(Math.random() * 9999) + 1) ^ (i * 1013))
  );

  const shuffleAll = useCallback(() => {
    const m = Math.floor(Math.random() * 9999) + 1;
    setMaster(m);
    setSeeds(PATTERNS.map((_, i) => ((m * 2654435761) ^ ((i + 1) * 1013904223)) >>> 0 % 9999));
  }, []);

  const shuffleOne = useCallback((i) => {
    setSeeds((prev) => {
      const next = prev.slice();
      next[i] = Math.floor(Math.random() * 9999) + 1;
      return next;
    });
  }, []);

  // Spacebar = randomize all
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space" && !e.target.matches("input,textarea,select,button")) {
        e.preventDefault();
        shuffleAll();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shuffleAll]);

  const isDarkBg = useMemo(() => {
    // crude luminance check
    const hex = t.bg.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
  }, [t.bg]);

  return (
    <div className={"app " + (isDarkBg ? "dark" : "")} style={{ "--app-bg": isDarkBg ? "#0B141A" : "#F4EFE6" }}>
      <Header onShuffleAll={shuffleAll} masterSeed={master} />

      <main className="stack">
        {PATTERNS.map((p, i) => (
          <PatternCard
            key={p.label}
            label={p.label}
            dims={p.dims}
            seed={seeds[i]}
            onReseed={() => shuffleOne(i)}
            t={t}
            isDarkBg={isDarkBg}
          />
        ))}
        <div className="footer-note">
          Press <kbd>Space</kbd> to randomize all · Each card has its own seed · Copy SVG ships a flat <code>&lt;svg&gt;</code> ready to paste into any layout.
        </div>
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Color" />
        <TweakColor label="Color A" value={t.fgA} options={COLOR_OPTIONS} onChange={(v) => setTweak("fgA", v)} />
        <TweakColor label="Color B" value={t.fgB} options={COLOR_OPTIONS} onChange={(v) => setTweak("fgB", v)} />
        <TweakSlider label="Mix (B → A)" value={t.mix} min={0} max={100} step={1} unit="%" onChange={(v) => setTweak("mix", v)} />
        <TweakColor label="Background" value={t.bg} options={BG_OPTIONS} onChange={(v) => setTweak("bg", v)} />

        <TweakSection label="Geometry" />
        <TweakSelect label="Block scale" value={t.unit} options={[
          { value: 15, label: "Small" },
          { value: 20, label: "Medium" },
          { value: 25, label: "Default" },
          { value: 30, label: "Large" },
          { value: 40, label: "X-Large" },
        ]} onChange={(v) => setTweak("unit", Number(v))} />
        <TweakSlider label="Gap" value={t.gap} min={0} max={20} step={1} unit="px" onChange={(v) => setTweak("gap", v)} />
        <TweakSlider label="Corner radius" value={t.radius} min={0} max={20} step={1} unit="px" onChange={(v) => setTweak("radius", v)} />
        <TweakSlider label="Square preference" value={t.squarePref} min={0} max={100} step={1} unit="%" onChange={(v) => setTweak("squarePref", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
