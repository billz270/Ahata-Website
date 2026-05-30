# DES-5: Notification Band Grid Pattern

**Date:** 2026-05-31
**Status:** Approved — ready for implementation
**File:** `room-visualizer.html`

---

## Goal

Add a subtle acoustic-panel mosaic pattern to the "X designed panels loaded" notification band. The pattern fades in from the midpoint of the band toward the right, giving the band a brand-textured feel while keeping the text area fully clean and legible.

---

## Visual Structure

**Background:** Change band background from `--accent` (#ecad49, yellow) to `--paper` (#f2f2f9, off-white).

**Text & border:** Unchanged — `--ink` (navy) for text color, `1.5px solid var(--ink)` for border-bottom.

**Dismiss button:**
- Default: `background: var(--ink); color: var(--paper)` — same as current
- Hover: `background: var(--accent); color: var(--ink)` — changed from current (paper hover would be invisible against the paper band; accent yellow gives a clear pop)

**Pattern pseudo-element:**
- `::before` on `.cart-banner`
- `position: absolute; inset: 0; pointer-events: none; overflow: hidden`
- `z-index: 0` (behind text content, which gets `position: relative; z-index: 1`)
- Carries an SVG `<pattern>` tiling a panel mosaic — a 120×40px repeating unit with navy (`--ink`) rectangles in proportions matching real panel sizes (a 2×1, two 1×1s, a 2×2 section)
- Pattern fill color: `var(--ink)` (#093d53)

**Gradient mask:**
```css
mask-image: linear-gradient(to right, transparent 0%, transparent 50%, black 100%);
-webkit-mask-image: linear-gradient(to right, transparent 0%, transparent 50%, black 100%);
```
- Left half (0–50%): fully transparent — clean paper background only
- Right half (50–100%): pattern fades in, reaching ~12–15% opacity at the Dismiss button

**Overall pseudo-element opacity:** `opacity: 0.13` (controls the maximum pattern density at the far right)

---

## Behavior & Edge Cases

- Show/hide logic (`.cart-banner.visible`) is unchanged — no JS modifications needed
- Pattern is `overflow: hidden` on the pseudo-element — never bleeds outside the band border
- On narrow viewports (<500px), gradient breakpoint shifts to 60% so the text area stays clear if the band content wraps
- The `◆` glyph, count text, font size, letter-spacing, and padding are all unchanged

---

## What Is NOT Changing

- Band padding (`12px 32px`)
- Font size, weight, text-transform, letter-spacing on band text
- Border-bottom
- JS logic for showing/hiding/updating the band
- The `◆` glyph or the count string format

---

## Design References

- `design-references/existing-website/Website Pattern for Banners and Bands.png` — the branded panel mosaic used as visual reference for the SVG pattern proportions
- `design-references/textures/grid-pattern-example.png` — denser variant of the same mosaic, confirms the panel rectangle sizes

---

## Implementation Scope

Single file: `room-visualizer.html` (inline `<style>` block only). No new files, no JS changes.
