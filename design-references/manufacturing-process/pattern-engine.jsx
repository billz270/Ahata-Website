// pattern-engine.jsx
// Constrained-guillotine tessellation. Recursively subdivide the canvas in unit
// space until every leaf matches one of 5 allowed shapes. We only cut along
// positions where BOTH resulting pieces are themselves tileable by the allowed
// shapes (precomputed by canTile()). To reduce same-shape adjacency, equal-half
// cuts are deprioritized.

// Allowed tile shapes in unit space (w × h). Each aspect ratio appears at
// multiple scales so the final tessellation mixes small and large tiles —
// this is what makes the pattern read as "random" instead of "grid".
//   1:1 squares — 2×2 and 4×4
//   2:1 rects   — 4×2, 2×4, 8×4, 4×8
//   4:1 strips  — 4×1, 1×4, 8×2, 2×8
const TILE_SHAPES = [
  { w: 2, h: 2 }, { w: 4, h: 4 },
  { w: 4, h: 2 }, { w: 2, h: 4 },
  { w: 8, h: 4 }, { w: 4, h: 8 },
  { w: 4, h: 1 }, { w: 1, h: 4 },
  { w: 8, h: 2 }, { w: 2, h: 8 },
];
const LEAF_KEYS = new Set(TILE_SHAPES.map((t) => `${t.w},${t.h}`));

function makeRng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// canTile(w, h) — is (w × h) unit rectangle fillable by allowed shapes?
// Memoized; uses "false" placeholder during recursion to prevent infinite loop.
function canTile(w, h, cache) {
  if (w <= 0 || h <= 0) return false;
  const key = `${w},${h}`;
  if (LEAF_KEYS.has(key)) return true;
  if (key in cache) return cache[key];
  cache[key] = false; // tentative — break cycles
  // horizontal splits (cut height)
  for (let i = 1; i < h; i++) {
    if (canTile(w, i, cache) && canTile(w, h - i, cache)) {
      cache[key] = true;
      return true;
    }
  }
  // vertical splits (cut width)
  for (let i = 1; i < w; i++) {
    if (canTile(i, h, cache) && canTile(w - i, h, cache)) {
      cache[key] = true;
      return true;
    }
  }
  return cache[key];
}

// Recursively split (Wu × Hu) at (x0, y0) into leaf tiles, pushed onto `rects`.
// squarePref ∈ [0,1] — at any non-square leaf, probability of further splitting
// it into squares (which is always a valid sub-tiling). Raises the square count
// for visual balance. Tall (vertical) rectangles get an extra bump so the
// pattern doesn't visually skew tall.
function generateRec(rng, Wu, Hu, cache, rects, x0, y0, squarePref = 0) {
  // leaf
  if (LEAF_KEYS.has(`${Wu},${Hu}`)) {
    // Tall rectangles get an extra ×1.4 conversion chance (clamped to 0.95)
    const isTall = Hu > Wu;
    const pConvert = isTall ? Math.min(0.95, squarePref * 1.4) : squarePref;

    if (pConvert > 0 && rng() < pConvert) {
      // 4×2 → two 2×2
      if (Wu === 4 && Hu === 2) {
        rects.push({ x: x0,     y: y0, w: 2, h: 2 });
        rects.push({ x: x0 + 2, y: y0, w: 2, h: 2 });
        return;
      }
      // 2×4 → two 2×2
      if (Wu === 2 && Hu === 4) {
        rects.push({ x: x0, y: y0,     w: 2, h: 2 });
        rects.push({ x: x0, y: y0 + 2, w: 2, h: 2 });
        return;
      }
      // 8×4 → two 4×4
      if (Wu === 8 && Hu === 4) {
        rects.push({ x: x0,     y: y0, w: 4, h: 4 });
        rects.push({ x: x0 + 4, y: y0, w: 4, h: 4 });
        return;
      }
      // 4×8 → two 4×4
      if (Wu === 4 && Hu === 8) {
        rects.push({ x: x0, y: y0,     w: 4, h: 4 });
        rects.push({ x: x0, y: y0 + 4, w: 4, h: 4 });
        return;
      }
    }
    rects.push({ x: x0, y: y0, w: Wu, h: Hu });
    return;
  }
  // collect all valid splits
  const splits = [];
  for (let i = 1; i < Hu; i++) {
    if (canTile(Wu, i, cache) && canTile(Wu, Hu - i, cache)) {
      splits.push({ axis: "h", at: i, equal: i === Hu - i });
    }
  }
  for (let i = 1; i < Wu; i++) {
    if (canTile(i, Hu, cache) && canTile(Wu - i, Hu, cache)) {
      splits.push({ axis: "v", at: i, equal: i === Wu - i });
    }
  }
  if (!splits.length) return;

  // weighted pick — equal-half splits get less weight (they tend to mirror,
  // producing same-shape adjacents) and asymmetric splits are preferred.
  const weights = splits.map((s) => (s.equal ? 0.35 : 1));
  let total = 0;
  for (const w of weights) total += w;
  let pick = rng() * total;
  let idx = 0;
  for (; idx < splits.length - 1; idx++) {
    pick -= weights[idx];
    if (pick <= 0) break;
  }
  const s = splits[idx];

  if (s.axis === "h") {
    generateRec(rng, Wu, s.at, cache, rects, x0, y0, squarePref);
    generateRec(rng, Wu, Hu - s.at, cache, rects, x0, y0 + s.at, squarePref);
  } else {
    generateRec(rng, s.at, Hu, cache, rects, x0, y0, squarePref);
    generateRec(rng, Wu - s.at, Hu, cache, rects, x0 + s.at, y0, squarePref);
  }
}

// Post-process: scan adjacencies; for each same-shape neighbor pair, attempt a
// local "rotate" — if the pair forms a rectangle that has an alternate tiling
// using a different tile shape at the same spot, swap to it. Best-effort, runs
// a few passes.
function reduceAdjacency(rects, rng, cache, passes = 3) {
  function key(r) { return `${r.w}x${r.h}`; }
  for (let pass = 0; pass < passes; pass++) {
    let changed = false;
    for (let a = 0; a < rects.length; a++) {
      const A = rects[a];
      for (let b = a + 1; b < rects.length; b++) {
        const B = rects[b];
        if (key(A) !== key(B)) continue;
        // adjacent? share a full edge
        const horizAdj =
          A.y === B.y && A.h === B.h && (A.x + A.w === B.x || B.x + B.w === A.x);
        const vertAdj =
          A.x === B.x && A.w === B.w && (A.y + A.h === B.y || B.y + B.h === A.y);
        if (!horizAdj && !vertAdj) continue;

        // combined rect dimensions
        const cx = Math.min(A.x, B.x);
        const cy = Math.min(A.y, B.y);
        const cw = horizAdj ? A.w + B.w : A.w;
        const ch = vertAdj ? A.h + B.h : A.h;

        // try to re-tile (cw × ch) differently from the current pair
        // gather alternate splits that produce DIFFERENT child shapes
        const alts = [];
        for (let i = 1; i < ch; i++) {
          if (canTile(cw, i, cache) && canTile(cw, ch - i, cache)) {
            // skip the existing split if vertAdj at the original cut
            const existingCut = vertAdj && A.y === cy ? A.h : (vertAdj ? B.h : null);
            if (existingCut !== i) alts.push({ axis: "h", at: i });
          }
        }
        for (let i = 1; i < cw; i++) {
          if (canTile(i, ch, cache) && canTile(cw - i, ch, cache)) {
            const existingCut = horizAdj && A.x === cx ? A.w : (horizAdj ? B.w : null);
            if (existingCut !== i) alts.push({ axis: "v", at: i });
          }
        }
        if (!alts.length) continue;

        // pick a random alternate, generate sub-tiles for the combined region
        const alt = alts[Math.floor(rng() * alts.length)];
        const newPieces = [];
        if (alt.axis === "h") {
          generateRec(rng, cw, alt.at, cache, newPieces, cx, cy);
          generateRec(rng, cw, ch - alt.at, cache, newPieces, cx, cy + alt.at);
        } else {
          generateRec(rng, alt.at, ch, cache, newPieces, cx, cy);
          generateRec(rng, cw - alt.at, ch, cache, newPieces, cx + alt.at, cy);
        }
        // replace A and B with newPieces
        const removeIdx = [a, b].sort((x, y) => y - x);
        for (const ri of removeIdx) rects.splice(ri, 1);
        rects.push(...newPieces);
        changed = true;
        break;
      }
      if (changed) break;
    }
    if (!changed) break;
  }
}

function generatePattern(opts) {
  const { seed = 1, width = 1920, height = 480, unit = 20, reduceDupes = true, squarePref = 0.3 } = opts;
  const Wu = Math.floor(width / unit);
  const Hu = Math.floor(height / unit);
  const rng = makeRng(seed);
  const cache = {};

  if (!canTile(Wu, Hu, cache)) {
    console.warn(`Cannot tile ${Wu}×${Hu} units with current shape set.`);
    return [];
  }

  const unitRects = [];
  generateRec(rng, Wu, Hu, cache, unitRects, 0, 0, squarePref);

  if (reduceDupes) reduceAdjacency(unitRects, rng, cache);

  // Center the unit grid within the canvas when dimensions don't divide evenly,
  // so any leftover space is split equally on both edges instead of all on one side.
  const offsetX = (width - Wu * unit) / 2;
  const offsetY = (height - Hu * unit) / 2;

  // attach a per-tile tone (for two-color mix) and scale to pixels
  return unitRects.map((r) => ({
    x: r.x * unit + offsetX,
    y: r.y * unit + offsetY,
    w: r.w * unit,
    h: r.h * unit,
    tone: rng(),
  }));
}

function renderPatternSVG(rects, { width, height, gap = 10, fillA = "#1C1C1D", fillB = null, mix = 50, radius = 0, padding = 0 }) {
  const inset = gap / 2;
  const body = rects.map((r) => {
    const x = r.x + inset + padding;
    const y = r.y + inset + padding;
    const w = Math.max(0, r.w - gap);
    const h = Math.max(0, r.h - gap);
    const rx = radius > 0 ? ` rx="${radius}" ry="${radius}"` : "";
    const fill = fillB && r.tone != null && r.tone * 100 < mix ? fillB : fillA;
    return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" fill="${fill}"${rx}/>`;
  }).join("");
  const totalW = width + padding * 2;
  const totalH = height + padding * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}">${body}</svg>`;
}

Object.assign(window, { makeRng, generatePattern, renderPatternSVG });
