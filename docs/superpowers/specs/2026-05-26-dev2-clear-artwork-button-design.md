# DEV-2: Clear Artwork Button — Design Spec

**Date:** 2026-05-26  
**File:** `configurator.html`  
**Status:** Approved

---

## Summary

Add a "Clear" button to the configurator's preview toolbar that resets only the artwork state, leaving panel size, orientation, and wood/fabric options intact. Lets users start a fresh upload without having to navigate away or reload.

---

## Placement

A new `ctrl-group` div inserted **immediately left of** the existing "↺ View" `ctrl-group` inside `.ctrl-group-wrap`. Matches the existing toolbar layout exactly — no new rows or containers needed.

```
[ Clear ] [ ↺ View ] [ − Fit + ]   (image controls hidden)
[ Clear ] [ ↺ View ] [ − Fit + ] [ − + ⇋ ↕ ⟳ ◎ Fit ]   (image controls visible)
```

---

## Appearance

- Element: `<button class="ctrl-btn" id="clearArtBtn">`
- Content: trash SVG icon + text "Clear" (same icon+word pattern as the "↺ View" button)
- Icon: `<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>` (standard trash outline)
- Styling: inherits `.ctrl-btn` — no extra CSS needed
- Visibility: `display:none` by default; shown when `currentPanel.image` is truthy

---

## Behaviour on Click

Partial reset — clears artwork only, preserves everything else:

**Clear:**
- `currentPanel.image = null`
- `currentPanel.imagePosition`, `imageScale`, `imageNaturalWidth`, `imageNaturalHeight`, `fileName`, `fileSize` → reset to defaults
- `imgZoom = 1`, `imgPos = {x:0,y:0}`, `imgNaturalW = 0`, `imgNaturalH = 0`
- `imgFlipH = false`, `imgFlipV = false`, `imgRotate = 0`

**UI updates:**
- `panelImage.style.display = 'none'`, `panelImage.src = ''`, `panelImage.style.transform = ''`
- `uploadInPanel.style.display = 'flex'`
- `replaceBtn.style.display = 'none'`
- `panelFace.classList.remove('has-image')`
- `imgCtrlGroup.style.display = 'none'`
- `imageInfo.classList.remove('visible')`
- `artworkLine.classList.remove('loaded')`, `artworkLine.innerHTML = 'No artwork yet · <span class="accent">upload in panel</span>'`
- Exit image mode: `imageMode = false`, `panelFace.classList.remove('image-armed')`, `panelContainer.classList.remove('image-mode')`, `modeIndicator.classList.remove('visible','image-mode')`
- Hide Clear button itself: `clearArtBtn.style.display = 'none'`
- `fileInput.value = ''`

**Preserve (no changes):**
- Size card selection
- Orientation toggle state
- `designer` active class (panel stays open)
- `customSection` (wood/fabric options)
- `panelActions` bar
- 3D scene rotation, yaw, pitch, zoom

---

## Visibility Logic

The button is shown/hidden in two places:

1. **After `handleImageUpload` succeeds** — set `clearArtBtn.style.display = 'block'`
2. **After the clear action itself** — set `clearArtBtn.style.display = 'none'`

No changes needed to `resetCurrentPanel` (full reset already hides all controls anyway).

---

## No Confirmation Dialog

The button clears only the current in-progress artwork — nothing saved to the cart. No confirmation needed.
