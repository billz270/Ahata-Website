# Audial — Project Documentation

This file documents the Audial website project. It's read by Claude Code at the start of every session so the AI has consistent context. Edit it freely as the project evolves — this is a living document.

---

## What this is

**Audial** is a custom acoustic-panel business based in Mumbai. The website lets customers design panels with their own artwork, plan panel layouts in their rooms, and place orders. Five static HTML pages, no backend (yet), no build step.

The brand name is Sanskrit — "human effort striking sound" — paired with the concept of *Nada* in Carnatic music. Five logo shapes = five fingers of a hand = five letters of the name.

Email: hello@audial.in
Location: Mumbai

---

## File structure

```
audial-website/
├── CLAUDE.md                  ← this file
├── index.html                 ← landing page, design-led hero
├── configurator.html          ← panel designer (3D viewer, image upload, transforms)
├── room-visualizer.html       ← wall layout planner with drag/marquee/snap
├── how-it-works.html          ← explainer page (acoustics myths above CTA)
├── about.html                 ← about/founder page
└── design-references/
    └── assets/
        ├── logos/
        │   ├── Audial Logo.png        ← logo mark only (2000×2000)
        │   └── Audial Logo_Black.png  ← wordmark only (2000×300)
        ├── old-logo/              ← archived original SVG files
        └── website-icons/         ← ahata-v3-*.svg icon set
```

The nav logo is composed of two `<img>` tags inside `.logo`: `Audial Logo.png` (mark, 50px height) + `Audial Logo_Black.png` (wordmark, 64px height), gap 8px. Nav auto-sizes to 64px. Adding a font or photo? Drop it in `assets/` and ask Claude to wire it up.

---

## Color tokens

```css
--ink:#093d53          /* navy primary — borders, text, dark surfaces, selection states */
--shadow:#00171f       /* near-black — drop shadow tints, modal backdrops only */
--paper:#f2f2f9        /* off-white background */
--primary:#093d53      /* same as ink (kept for semantic clarity) */
--primary-light:#007da6 /* teal blue — gradient companion to primary on hover states */
--accent:#e26167       /* peach-red — CTA fills, brand dot ◆, accent words */
--wood:#7A5F3A         /* lightest wood tone */
--wood-mid:#4A3622     /* mid wood */
--wood-dark:#2A1C10    /* dark wood */
--wood-edge:#1A0F08    /* darkest wood (gradient inner edge) */
--wrap-black:#0F0904   /* fabric wrap when full-wrap is selected */
```

**Usage rules:**
- Selection states (selected panel, active button) → `--ink` (navy)
- Button/tile hover backgrounds → `linear-gradient(135deg, var(--primary), var(--primary-light))` with `color:var(--paper)`
- CTA buttons and accent words → `--accent` (peach-red), used sparingly
- Text hover highlights (nav links, footer links, labels) → `--accent` (peach-red)
- Wood gradient is dark-heavy (mid stop at 60%, not 50%)

---

## Layout conventions

- `body { max-width: 1320px; margin: 0 auto }` — content centers on wide screens with paper-colored gutters
- All borders are `1.5px solid var(--ink)`
- Body font: `'Archivo'`. Headlines: `'Archivo Black'`.
- Letter-spacing: `-0.02em` to `-0.04em` on Black weights, `0.05em` to `0.15em` on uppercase

---

## Cart data model

Saved in `localStorage` as `acousticCart` (key name kept for back-compat with old saved sessions).

```js
{
  id: number,
  size: '1x1' | '2x1' | '2x2' | '4x2' | '1x4',
  baseW: number, baseH: number,            // canonical feet (immutable per size)
  orientation: 'horizontal' | 'vertical',
  effectiveW: number, effectiveH: number,  // rendered feet after orientation
  image: string,                           // data URL
  imagePosition: { x, y },                 // pixel offset in saved-panel space
  imageScale: number,                      // 0.5..2.0 user zoom
  imageNaturalWidth: number,
  imageNaturalHeight: number,
  flipH: boolean, flipV: boolean,
  rotate: 0 | 90 | 180 | 270,
  fileName: string, fileSize: number,
  woodVarnish: 'light' | 'dark',
  fabricWrap: 'half' | 'full',
  quantity: number,                        // user can buy 2+ identical panels
  savedPanelWidth: number,                 // configurator pixel size at save time
  savedPanelHeight: number                 //   → used to rescale image transform downstream
}
```

Room plan saved as `acousticRoomPlan`:
```js
{
  room: { length, width, height },         // feet
  panels: [{ id, wall, x, y, w, h, ... }]
}
```

---

## Critical functions

**`computeArtTransform(panel, targetW, targetH)` (visualizer)**
Reproduces the configurator's image transform at a different panel size. Math:
1. `scale = min(targetW/savedW, targetH/savedH)` — uniform, never overflows
2. Final image transform: `translate(cssTx, cssTy) scale(zoom * scale) rotate(r) scaleX(±1) scaleY(±1)`
3. Bounding-box correction handles rotation/flip so the visible image stays inside the panel

**`panelToCartItem(p)` (configurator)**
Captures full design state. Always includes `savedPanelWidth/Height` so downstream renderers can scale properly.

**`loadDesignedCart()` (visualizer)**
Runs on initial load, on `pageshow` with `e.persisted === true` (bfcache restore), and on `storage` events (other-tab updates). Handles the sync bug where designed panels weren't appearing.

The configurator's `renderCartCardPreview` and the visualizer's `computeArtTransform` should stay in sync. Same math, different contexts.

---

## Issues & Backlog

### High Priority
_(none)_

### Medium Priority
_(none)_

### Recently resolved
- **Step-grid button swap & dividing lines (DEV-24)** ✓ — Swapped first two `.step-card` elements in homepage `.step-grid`: Design Panels is now step 01, Visualize Space is step 02. Fixed missing dividing lines by switching to shared-border pattern (`.step-grid` owns `border-top` + `border-left`, each `.step-card` owns `border-right` + `border-bottom`). Fixed border flicker caused by per-card `transform` during scroll-reveal creating competing GPU layers: moved `reveal` from individual cards to parent `.step-grid`, added staggered `nth-child` opacity delays (0s/0.12s/0.24s/0.36s). Narrowed `.reveal` transition from `all` to `opacity,transform` and changed end state to `transform:none`. (`index.html`, `.step-grid`, `.step-card`, `.reveal`)

- **Accent color rebrand + gradient hovers (DES-23)** ✓ — Replaced `--accent` from `#ecad49` (yellow) to `#e26167` (peach-red) across all 5 pages (135 usages). Hero heading on `index.html`: `.word-as` changed from `--primary-light` to `--primary` so "SOUND AS" is dark blue, "ART" is peach. Button/tile hover backgrounds changed from flat `background:var(--accent)` to `linear-gradient(135deg, var(--primary), var(--primary-light))` with `color:var(--paper)` — affects `.cta:hover`, `.action-btn.dup:hover`, `.cart-banner button:hover`, `.side-wall-label:hover`, `.dp-save:hover`. Primary light (`#007da6`) demoted from standalone color to gradient-only companion. (`index.html`, `configurator.html`, `room-visualizer.html`, `how-it-works.html`, `about.html`)

- **2×2 grid for "Sound That Works" on mobile (MOB-21)** ✓ — On mobile (≤560px), the 4 benefit cards in the "Sound That Works" section were stacking into a single column. Fix: changed `.benefits-grid` from `grid-template-columns:1fr` to `1fr 1fr` in the `@media(max-width:560px)` block, and removed the single-column border overrides (`.benefit{border-right:none}` and `.benefit:not(:last-child){border-bottom}`) so the tablet's 2-column border rules (`nth-child(2n)` removes right border, `nth-last-child(-n+2)` removes bottom border) apply correctly. Desktop and tablet layouts unchanged. (`how-it-works.html`, `.benefits-grid`, `@media(max-width:560px)`)

- **Tighter step spacing on mobile (MOB-20)** ✓ — On mobile (≤900px), the 7 process step blocks in the horizontal scroll timeline had excess side padding making them feel spread apart. Fix: added `padding:0 2px` to `.process-step` inside the `@media(max-width:900px)` block, reducing side padding from the base `8px` down to `2px`. Desktop unchanged. (`how-it-works.html`, `.process-step`, `@media(max-width:900px)`)
- **Image tips layout on mobile (MOB-15)** ✓ — On mobile (≤560px), the "Works well" and "Avoid" columns in the image tips sidebar card were stacking below the SVG diagram. Fix: added a `@media (max-width:560px)` block that turns `.size-tips-inner` into a `grid` with `grid-template-columns:auto 1fr` — diagram pinned to column 1, `.stips-cols` to column 2, `.stips-bonus` and `details.stips-general` span both columns. Bottom border removed from `.stips-diagram` on mobile. Desktop unchanged. (`configurator.html`, `.size-tips-inner`, `.stips-diagram`, `.stips-cols`, `@media (max-width:560px)`)

- **Horizontal CTA buttons on hero (MOB-14)** ✓ — On mobile (≤560px), the "Design Panels" and "Visualize Space" CTA buttons in the hero were stacking vertically. Root cause: `@media (max-width:560px)` set `.cta-group{flex-direction:column}` and swapped border logic to `border-bottom` dividers. Fix: removed those three overrides so the base horizontal flex layout (`display:flex`, `flex:1` per button, `border-right` vertical divider, `max-width:480px`) now applies at all widths. Desktop unchanged. (`index.html`, `.cta-group`, `.cta`, `@media (max-width:560px)`)

- **Compact panel size buttons (MOB-18)** ✓ — On mobile, the 5 size chips in the visualizer sidebar were in a 2-column grid, requiring scrolling to see all options. Fix: switched `.panel-sizes` to `display:flex;flex-wrap:nowrap` at `@media (max-width:560px)` so all 5 chips sit in one horizontal row. Tightened per-chip styles: `flex:1;min-width:0;padding:6px 4px;min-height:44px` (meets 44px touch target), `.size-name` 12px → 11px, `.size-price` 10px → 9px. Desktop 2-column grid unchanged. (`room-visualizer.html`, `.panel-sizes`, `.size-chip`, `@media (max-width:560px)`)

- **Horizontal wall thumbnails (MOB-17)** ✓ — On mobile (≤560px), the 3 inactive wall thumbnails (Left/Back/Right Wall) were stacking vertically. Root cause: `@media (max-width:560px)` overrode `.wall-thumbs` to `grid-template-columns:1fr`. Fix: removed that override so the desktop `repeat(3,1fr)` grid persists at mobile. Also tightened spacing in the same block: gap 8px → 4px, thumb padding `6px 8px` → `4px 5px`, label font 10px → 9px, meta font 8px → 7px so all three thumbnails fit comfortably on narrow screens. (`room-visualizer.html`, `.wall-thumbs`, `@media (max-width:560px)`)

- **Horizontal room presets & dimensions (MOB-16)** ✓ — On mobile (≤560px), the 4 preset cards were collapsing to a single-column stack and the 4 dimension inputs were stacking individually (8 rows total). Root cause: the 560px media query overrode `.preset-grid` to `grid-template-columns:1fr` and added `flex-direction:column` to `.dim-row`. Fix: removed those overrides — the desktop `repeat(2,1fr)` grid and horizontal `flex` rows now persist at mobile, giving a 2×2 preset grid and two 2-field rows for dimensions. Existing border selectors (`nth-child(2n)`, `nth-last-child(-n+2)`, `:last-child`) correctly handle both layouts without extra overrides. (`room-visualizer.html`, `@media (max-width:560px)`)

- **"Your Designs" grid glitch (MOB-19)** ✓ — On mobile, design cards shrunk while the "+" add button stretched wider. Root cause: `.designs-add-btn` and `.designs-filler` were missing `width:100%;min-width:0`, unlike `.designed-card` which already had both. Added to both selectors so all four grid slots are equally constrained. (`room-visualizer.html`, `.designs-add-btn`, `.designs-filler`)

- **Hamburger menu (MOB-13)** ✓ — Mobile navigation across all 5 pages. Three-line button in nav top-right, hidden on desktop (`display:none`), visible at `max-width:900px`. Animates to X on open (top/bottom spans rotate ±45°, middle fades). Mobile menu drops below nav bar full-width with `--ink` border-top, `--paper` bg, all 5 links vertical with 14px padding. Active page link highlighted in `--accent`. Closes on outside tap or link tap. Also unified `about.html` breakpoint from `600px` → `900px` to match all other pages. (`index.html`, `configurator.html`, `room-visualizer.html`, `how-it-works.html`, `about.html`, `.hamburger-btn`, `.mobile-menu`, `nav.nav-open`)

- **Custom size panel (DEV-12)** ✓ — Custom size chip in configurator now opens a floating pop-up (anchored above the card, `position:absolute` on `.size-grid`) with W/H steppers (1–8 ft, `−`/`+` buttons with disable-at-limits). Confirms into the full configurator experience — image upload, transforms, wood/wrap all work identically to catalog sizes. Preview uses fit-to-container scaling so extreme aspect ratios (8×1, 7×2) always fill the viewer. Pricing: ₹650/sq ft placeholder, stored on cart item as `price` field. `getPanelPrice(panel)` helper used in both `updateCart()` and `renderCheckoutCart()`. Checkout shows `"{W}×{H} ft Custom Panel"` with a `"Pricing confirmed within 24 hrs"` note. (`configurator.html`, `#customPickerPopup`, `getPanelPrice`, `updatePanelPreview`, `renderCartCardPreview`)

- **Hero slider (DES-9)** ✓ — Two-slide looping hero on `index.html`. Slide 1: three panel configurations (single 4×2, split 2×2 pair, triptych ×3) draw sequentially via `stroke-dashoffset` line-draw animation. Slide 2: 7-col × 5-row artwork grid (12 panels, p1–p12) zooms in from overhead and scatter-settles with spring easing. Crossfade: `1.2s ease-in-out` film dissolve. Dwell: 7.2s on slide 1, 4.9s on slide 2. Dots positioned `position:absolute; top:100%` on `.hero-right` (outside flex flow, below art area). Key layout fix: `.cfg` needs `min-height:0` so flex children can shrink below SVG intrinsic height; SVG uses `width:100%; height:100%` with `preserveAspectRatio="xMidYMid meet"` to letterbox within available space. Mobile: `.hero-right{height:auto}` + `.slide-wrapper{aspect-ratio:1.4;flex:none}`. (`index.html`, `.hero-right`, `.slide-wrapper`, `.slide-configs`, `.cfg`, `goHeroSlide()`)

- **Manufacturing process timeline (DES-10)** ✓ — 7-step horizontal timeline section on `how-it-works.html`, placed directly below the hero and above the Benefits section. Each step: accent number (01–07), inline SVG illustration (80×80, `stroke:var(--ink)`), uppercase step name. SVGs inlined for CSS animation targeting. Scroll-triggered line-draw animation via `stroke-dasharray/dashoffset` with 150ms stagger per step. Mobile: `overflow-x:auto` + `scroll-snap-type:x mandatory`, 7 dot indicators that update on scroll. CSS cascade note: process mobile overrides must live in a separate `@media` block *after* the base process styles, not inside the shared `@media(max-width:900px)` block. (`how-it-works.html`, `.process`, `.process-track`, `.process-step`, `.step-icon`, `#processScroll`, `#processDots`)

- **Nav logo swap (DES-11)** ✓ — Replaced inline SVG placeholder with two-PNG combo: `1.png` (logo mark, 50px) + `4.png` (wordmark, 64px), side by side with `gap:8px` in `.logo`. Nav height auto-sizes to 64px. Both PNGs have `--paper` background so whitespace is invisible. CSS classes: `.brand-logo-mark` / `.brand-logo-text`. Footer "ACOUSTIC◆" references and page title updates deferred. (`index.html`, `configurator.html`, `room-visualizer.html`, `how-it-works.html`, `about.html`)

- **Contextual image tips (DES-8)** ✓ — Dynamic "Image tips" sidebar card in configurator. Appears on size selection, disappears on upload. Orientation-aware (2×1, 4×2, 1×4 each have horizontal + vertical tip sets). Shows aspect-ratio SVG diagram, Works well / Avoid columns, optional bonus tip, and collapsible general guidelines. (`configurator.html`, `SIZE_TIPS`, `showSizeTips`, `hideSizeTips`)

### Design/Brand (future)
1. **Logo refresh** — Waiting for new logo from designer friend. Current horizontal logo will be replaced.
2. **Three-tone color approach** — New gradient colors to be implemented when finalized. Keep current for now.
3. **Website layout revisit** — After logo and color finalization.


## Resolved bugs

- **4×2 panel preview glitch on first selection (DEV-13)** ✓ — `updatePanelPreview()` was called before `showDesigner()`. While `.designer` is `display:none`, `panelContainer.offsetWidth` returns 0 — the fallback 600×540 dimensions make the 4×2 panel render at 572px wide, overflowing a ~350px mobile container. Switching orientation and back fixed it because by then the designer was visible. Fix: call `showDesigner()` and `panelActions.classList.add('visible')` first, then `panelContainer.getBoundingClientRect()` to force a synchronous layout reflow, then `updatePanelPreview()`. Same reorder applied to the custom panel creation flow. (`configurator.html`, `updatePanelPreview`, size card click handler, custom panel `pickerCreate` handler)

- **Wall thumbnail palette fix (DES-7)** ✓ — Replaced off-palette `#D8D3C6` beige with `var(--line)` on `.thumb-surface-wrap` (the mini wall frame) and `.wall-ground` (the floor strip on the main canvas). Defined `--wall: var(--paper)` in `:root` so wall surfaces have an explicit background. Hover on `.wall-thumb` now uses a soft `rgba(9,61,83,0.05)` background tint + `--primary-light` border and text (architectural tab feel) instead of the full ink/paper flip used elsewhere. Count badge and meta text also shift to `--primary-light` on hover. (`room-visualizer.html`, `.wall-thumb`, `.thumb-surface-wrap`, `.wall-ground`, `--wall`)

- **Horizontal misconceptions tiles (DES-6)** ✓ — Replaced the vertical myth list in the `.myths` section with a 3-column `.misconceptions-grid`. Each `.misconception-tile` shows a large accent number, an italic dimmed misconception quote (38% opacity), a 1px divider, and a bold `--accent` reality headline + body copy. Hover: a paper-tint fill sweeps up from the tile bottom via `::before` (`rgba(242,242,249,0.07)`, `translateY(100%)→0`), misconception dims to 16%, reality brightens to full opacity, and an accent underline sweeps left-to-right under `.tile-reality-head` via `scaleX(0)→1`. Responsive: 2-col on tablet (tile 3 spans full width via `grid-column:1/-1`), 1-col on mobile. Semi-transparent paper borders (`rgba(242,242,249,0.2)`) used throughout instead of `--ink` (invisible on dark bg). (`how-it-works.html`, `.misconceptions-grid`, `.misconception-tile`, `.tile-reality-head`)

- **Notification band panel-mosaic pattern (DES-5)** ✓ — Band background changed from `--accent` (yellow) to `--paper`. A `::before` pseudo-element carries a 120×40px SVG tile (two rows of navy `--ink` rectangles in acoustic panel proportions) repeating horizontally. A `mask-image` gradient keeps the left 35% fully transparent (text area stays clean) and fades the pattern in to `opacity:0.70` at the right edge near the Dismiss button. Dismiss button hover updated from `--paper` (invisible on paper band) to `--accent` yellow. This treatment is saved as the standard pattern for all future website bands. (`room-visualizer.html`, `.cart-banner::before`)

- **"Your Designs" grid order & label** ✓ — Grid now fills column-first (top-left → bottom-left → top-right → bottom-right) by reordering `pageEls` to `[0, 2, 1, 3]` before appending to the CSS row-first grid. Add-button label reads "Click to Design Your First Panel" when cart is empty and switches to "Click to Design Your Next Panel" once any design exists. (`room-visualizer.html`, `renderDesignedPanels`)

- **Checkout flow** ✓ — Two-step checkout modal on both Configurator and Room Visualizer pages. "Checkout →" button in visualizer sidebar replaces "Clear All Panels"; "Checkout →" in configurator replaces "Request Quote →". Step 1: cart review (panel thumbnails, size, varnish, wrap, qty, subtotal from `acousticCart`). Step 2: full order form (name, email, phone, address, pincode, city, notes). Submits to `rohan270@gmail.com` via Formspree (`xbdbzvao`). Success state echoes the customer's email. (`configurator.html`, `room-visualizer.html`)

- **"Clear All Panels" button relocated** ✓ — Removed from sidebar "Next step" section (replaced by "Checkout →") and moved to the main canvas area directly below the "Select a panel size first" hint. Styled as `.clear-canvas-btn` — same 10px uppercase typographic treatment as the hint, `width:fit-content`, `margin-left:auto` so it sits right-aligned flush under the hint. Confirm prompt on click. (`room-visualizer.html`)

- **Placed panels lost on page return** ✓ — `acousticRoomPlan` was saved to localStorage on navigation but never read back on a fresh page load (only bfcache restores were handled). Added `loadRoomPlan()` which restores `state.panels` and room dimensions (including input field values) from localStorage on every page load, called before `loadDesignedCart()`. Also wired `saveRoomPlan()` to the "Your Designs" + button click so the plan is always persisted before navigating to the configurator. (`room-visualizer.html`, `loadRoomPlan`, `buildAddBtn`)

- **"Clear" artwork button in configurator** ✓ — A "Clear" button (trash icon + text) sits in the preview toolbar immediately left of "↺ View". It appears only when an image is loaded (upload or cart Edit flow) and disappears after use. Clicking performs a partial reset: clears the image, all transforms, and the file-info chips, then restores the upload prompt — while keeping panel size, orientation, wood/fabric selection, and the designer open. Implemented as `#clearArtGroup` / `#clearArtBtn` in `.ctrl-group-wrap`; visibility wired in `handleImageUpload`, `loadPanelToEditor`, and `resetCurrentPanel`. (`configurator.html`)

- **Mouse-driven wall resize** ✓ — Hovering near any of the 4 edges of the active wall surface shows a directional resize cursor (`ns-resize` top/bottom, `ew-resize` left/right) and a floating readout (e.g. `10.0 ft`). Dragging adjusts the room dimension in 0.1 ft steps (Shift = 0.5 ft), syncs the "Enter Exact Dimensions" input fields live, and respects min/max limits (width/length 6–40 ft, height 7–14 ft). Implementation: 4 invisible `.resize-handle` overlay divs straddling each wall edge, repositioned by `updateResizeHandles()` after every `sizeWallSurface()` call; drag math anchored to start px/ft ratio so precision stays linear. (`room-visualizer.html`, `createResizeHandles`, `updateResizeHandles`, `bigWallScene` pointer events)

- **"Your Designs" persistent add tile** ✓ — Empty state now shows 1 "+" tile in the first slot of the 2×2 grid (3 filler cells alongside it) instead of a full-grid spanning block. The add button and fillers use the same two-section structure (`.designed-card-preview` + `.designed-card-info`) as real design cards so all tiles are the same height. (`room-visualizer.html`, `renderDesignedPanels`, `.designs-add-btn`, `.designs-filler`)

- **Room visualizer decimal dimensions** ✓ — "Enter Exact Dimensions" inputs now accept one decimal place (e.g. 8.7 ft). Added `step="0.1"` to all three inputs; switched `parseInt` → `parseFloat` + `Math.round(...*10)/10` in `updateDimensions` so typed decimals are preserved. Total wall area also rounds to 1 decimal. (`room-visualizer.html`)

- **"Add Design" on default wall panels** ✓ — Hovering a default panel reveals an "Add Design" button. Clicking opens a floating configurator popup (blurred backdrop, no dimming) with the panel's size and orientation pre-selected. On Save, the artwork is merged directly onto the wall panel and the design is added to "Your Designs". Closing without saving prompts Save / Continue Editing / Discard if an image was uploaded. Also fixed: default panels placed from size chips were missing an `orientation` field, causing the popup to always default to horizontal. (`room-visualizer.html` + `configurator.html`)

- **"Your Designs" repositioned to sidebar** ✓ — Moved from horizontal scrollable strip below the wall canvas to a 2×2 paged grid in the right sidebar, between "Panel sizes" and "Your plan". Cards fill row-by-row in pages of 4; scrolling snaps one page (2 columns) at a time. Empty state shows a full-page `+` button linking to the configurator. (`room-visualizer.html`, `renderDesignedPanels` + CSS/HTML restructure)

- **Designed panels missing in visualizer** ✓ — Root cause: raw base64 images (4–8 MB each) silently exceeded localStorage's 5 MB cap; `saveCart()` swallowed the `QuotaExceededError` with an empty catch. Fix: compress images to max 1200px / JPEG 0.82 on upload (~200 KB each), and surface the error to the user if quota is ever hit again. (`configurator.html`, `handleImageUpload` + `saveCart`)

- **Image edge clipping on upload** ✓ — Root cause: `fitImageToPanel`, `recenterImage`, and `clampImagePosition` used `panelFace.offsetWidth/offsetHeight` (which includes the 1.5px border) to calculate fit scale, causing the image to be scaled 2px too large and clipped by `overflow: hidden`. Fix: switched to `clientWidth/clientHeight` (border excluded). (`configurator.html`)

- **Placement cursor lock in visualizer** ✓ — Root cause: after placing the last copy of a designed panel, placement mode was never exited and `updateArmedState()` wasn't called after each placement, so the crosshair cursor and hint text stayed active indefinitely. Fix: auto-exit placement mode when remaining count hits 0, allow clicking an active designed card to deselect even at 0 remaining (matching size-chip toggle behaviour), and call `updateArmedState()` after every placement. (`room-visualizer.html`)

- **Equal-distance alignment arrows** ✓ — Root cause: no equal-distance detection existed; only edge/center snapping was implemented. Fix: added equal-distance snap for all 3 configurations (sandwiched, rightmost, leftmost panel) on both X and Y axes. Shows double-headed arrows (↔/↕) in each equal gap rather than a full-wall line. Full-wall scan on every drag tick so all equal-gap runs across all panels are highlighted simultaneously. (`room-visualizer.html`)

- **"Start Another" scroll position** ✓ — Two compounding issues: (1) `updateCart()` expanding the cart section caused a layout reflow after `scrollTo({top:0})` fired, drifting the page down — fixed by wrapping the scroll in `requestAnimationFrame`; (2) sticky nav (56px) overlapped the designer section's top, hiding the orientation toggle — fixed by adding `scroll-margin-top:64px` to `.designer`. (`configurator.html`)

- **"Start Another" hides panel preview** ✓ — `resetCurrentPanel()` removed `active` from `.designer`, collapsing the live preview. Fix: save the current size before reset, then re-click the same size card to reactivate the designer. A `_skipDesignerScroll` flag suppresses `showDesigner()`'s built-in scroll so the page instead lands on `.size-section` (with `scroll-margin-top:64px` for nav clearance). (`configurator.html`)

- **"Your Panels" tile sizing glitch** ✓ — Root cause: `min-height: 180px` on `.cart-preview` let the 4×2 vertical tile (160px 3D content + 36px padding = 196px) grow taller than all other tiles (clamped at 180px), causing the flex row to stretch shorter cards 16px extra with no mechanism to pin the buttons to the bottom. Fix: replaced `min-height: 180px` with fixed `height: 196px` so all tiles share the same dividing border; added `margin-top: auto` to `.cart-actions-row` to pin Edit/Remove to the card bottom; removed the quantity +/− bar entirely. (`configurator.html`, `.cart-preview`, `.cart-actions-row`)

- **"Your Designs" right border** ✓ — Root cause: the grid used a gap-trick (`gap:1.5px; background:var(--ink)` on the page, `border:1.5px solid var(--ink)` on the outer container) which only gives tiles visual right/bottom borders via the container's outer border — individual tiles had `border:none`. Fix: switched to individual tile borders — container keeps `border-top` + `border-left` (the two sides no tile can own), every tile (`.designed-card`, `.designs-filler`, `.designs-add-btn`) gets `border-right:1.5px solid var(--ink); border-bottom:1.5px solid var(--ink)`. No double-borders; consistent with `size-chip` approach. (`room-visualizer.html`, `.designs-grid-outer`, `.designs-page`, `.designed-card`, `.designs-filler`, `.designs-add-btn`)

- **"Your Panels" tile click to preview** ✓ — Clicking the image preview area of a saved tile now loads it into the live 3D viewer without removing it from "Your Panels", so designs can be browsed freely. The panel stays in the cart; only the Edit button removes and opens for editing. (`configurator.html`, `updateCart` click handler on `.cart-preview`)

- **Horizontal logo sizing and background blending** ✓ — Three compounding issues: (1) CSS `height: 32px` too small; (2) `viewBox="0 0 1874.9 750"` had ~258 units of blank margin top/bottom so the actual content (y≈258–492) rendered at only ~10px; (3) Inkscape baked a `<g fill="#fff">` background rect into the SVG which appeared as a white rectangle in the nav (the `style="fill:#f2f2f9"` override was stripped when inlining). Fix: trimmed viewBox to `"0 258 1874.9 234"` (exact content bounds), set nav `padding: 0 32px`, set `height: 56px`, and removed the background rect group and its clipPath def. Applied to all 5 HTML files and the asset SVG.

- **Panel preview sizes** ✓ — All sizes now use per-size overrides in `updatePanelPreview()` instead of a single sqrt(area) formula. 1×1 and 2×1 share a fixed unit of `0.44 × refMaxLinear` px/ft (2×1 is 2 units on the long axis). 4×2 and 1×4 share `1.127 × refMaxLinear / 4` px/ft so their 4ft long sides render identically regardless of orientation. 2×2 uses the original proportional formula unchanged. The preview container is locked to a fixed height (`max-height:540px`) to prevent it from growing when tall/vertical panels are selected; any slight overflow is clipped cleanly by `overflow:hidden`. (`configurator.html`, `updatePanelPreview`, `.panel-3d-container`)

---

## Brand voice (for content)

- Sparse, technical, slightly philosophical
- Never cute, never marketing-speak
- Use real numbers: 7-day build, 100% rockwool density, etc.
- Hindi/Sanskrit grace where natural (e.g., "Audial", "Nada"), never forced
- Pair with English clarity — bilingual readers should feel at home, English-only readers should never feel locked out
- Use ₹ for prices, never $

---

## Audience segments (for future content)

Three distinct audiences map to different entry points:
1. **Home Studios** — musicians, producers recording at home
2. **Listening Rooms** — home theaters, DJ booths, dedicated music rooms
3. **Podcasters & Creators** — voice work, streaming, content creation

Bar/pub/commercial is a separate flow — different sales motion (B2B, larger orders, on-site consultation) — should live on a future "Commercial" page, not on consumer homepage.

---

## What's planned

Content rewrites are the bottleneck. In progress (by founder):
- Hero copy with origin story
- Audience-segmented entry points
- About page Carnatic music origin
- Real workshop photos to replace SVG mockups in hero showcase

Future features to consider (from past discussions):
- Equal-distance alignment arrows in visualizer
- Save/share room layout
- B2B Commercial page
- Custom-size flow (currently a placeholder alert)

---

## Conventions for working with Claude

- Always run a local dev server (`python3 -m http.server 8000`) so changes preview live
- Don't ask Claude to fix bugs in the first message of a session — give context first (read CLAUDE.md, walk through the affected page)
- Commit to git after each meaningful change so rollback is easy
- When adding new tokens (colors, fonts, sizes), update this file in the same session
