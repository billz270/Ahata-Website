# DEV-2: Clear Artwork Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Clear" button to the configurator's preview toolbar that wipes the uploaded artwork and resets all image transforms, while keeping panel size, orientation, and wood/fabric options intact.

**Architecture:** Single-file change to `configurator.html`. Button lives in the `.ctrl-group-wrap` toolbar (just left of the existing "↺ View" button), hidden by default and shown whenever `currentPanel.image` is set. Click handler performs a partial reset — mirrors the structure of `resetCurrentPanel` but skips anything unrelated to the image.

**Tech Stack:** Vanilla JS, HTML, CSS — no build step, no framework.

---

## Files

| Action | Path | What changes |
|--------|------|--------------|
| Modify | `configurator.html` | Add HTML button, JS const reference, visibility wiring, click handler |

---

### Task 1: Add the HTML button element

**Files:**
- Modify: `configurator.html` (lines ~477–483, inside `.ctrl-group-wrap`)

- [ ] **Step 1: Insert the `clearArtGroup` ctrl-group**

In `configurator.html`, find this block (around line 477):

```html
      <div class="ctrl-group-wrap">
        <div class="ctrl-group" title="Reset 3D view">
```

Replace with:

```html
      <div class="ctrl-group-wrap">
        <div class="ctrl-group" id="clearArtGroup" style="display:none" title="Clear artwork">
          <button class="ctrl-btn" id="clearArtBtn">
            <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
            Clear
          </button>
        </div>
        <div class="ctrl-group" title="Reset 3D view">
```

- [ ] **Step 2: Verify it renders correctly**

Open `configurator.html` in a browser (via `python -m http.server 8000`). Select a panel size, upload an image — the Clear button should NOT appear yet (that wiring is in Task 2). Confirm no layout breakage in the toolbar.

- [ ] **Step 3: Commit**

```bash
git add configurator.html
git commit -m "feat: add Clear artwork button HTML to preview toolbar"
```

---

### Task 2: Wire button visibility

The button must appear after an image loads (via upload or cart edit) and disappear on full reset.

**Files:**
- Modify: `configurator.html` — three JS locations

- [ ] **Step 1: Add the `clearArtGroup` const reference**

Find this block (around line 668):

```js
const replaceBtn = $('replaceBtn');
const imgCtrlGroup = $('imgCtrlGroup');
```

Replace with:

```js
const replaceBtn = $('replaceBtn');
const clearArtGroup = $('clearArtGroup');
const imgCtrlGroup = $('imgCtrlGroup');
```

- [ ] **Step 2: Show the button after image upload**

In `handleImageUpload`, find (around line 911):

```js
      uploadInPanel.style.display = 'none';
      replaceBtn.style.display = 'block';
      panelFace.classList.add('has-image');
```

Replace with:

```js
      uploadInPanel.style.display = 'none';
      replaceBtn.style.display = 'block';
      clearArtGroup.style.display = 'flex';
      panelFace.classList.add('has-image');
```

- [ ] **Step 3: Show the button when loading a panel from cart (Edit flow)**

In `loadPanelToEditor`, find (around line 1565):

```js
  uploadInPanel.style.display = 'none';
  replaceBtn.style.display = 'block';
```

Replace with:

```js
  uploadInPanel.style.display = 'none';
  replaceBtn.style.display = 'block';
  clearArtGroup.style.display = 'flex';
```

- [ ] **Step 4: Hide the button on full reset**

In `resetCurrentPanel`, find (around line 1374):

```js
  imageInfo.classList.remove('visible');
  customSection.style.display = 'none';
  imgCtrlGroup.style.display = 'none';
```

Replace with:

```js
  imageInfo.classList.remove('visible');
  customSection.style.display = 'none';
  imgCtrlGroup.style.display = 'none';
  clearArtGroup.style.display = 'none';
```

- [ ] **Step 5: Verify visibility logic**

In the browser:
1. Select a panel size — Clear button should be hidden
2. Upload an image — Clear button should appear left of "↺ View"
3. Click "Start Another" (triggers `resetCurrentPanel`) — Clear button should disappear
4. Edit a panel from "Your Panels" (triggers `loadPanelToEditor`) — Clear button should appear

- [ ] **Step 6: Commit**

```bash
git add configurator.html
git commit -m "feat: wire Clear button visibility to image load/reset state"
```

---

### Task 3: Implement the clear action

**Files:**
- Modify: `configurator.html` — one new event listener

- [ ] **Step 1: Add the click handler**

Find the `resetViewBtn` listener (around line 1179):

```js
$('resetViewBtn').addEventListener('click',()=>{panYaw = -18; panPitch = 6; sceneZoom = 0.82; applyRotation()});
```

After that line, add:

```js
$('clearArtBtn').addEventListener('click', e => {
  e.stopPropagation();
  // Clear image state on currentPanel
  currentPanel.image = null;
  currentPanel.imagePosition = {x:0, y:0};
  currentPanel.imageScale = 1;
  currentPanel.imageNaturalWidth = 0;
  currentPanel.imageNaturalHeight = 0;
  currentPanel.fileName = '';
  currentPanel.fileSize = 0;
  // Reset image module vars
  imgZoom = 1; imgPos = {x:0,y:0}; imgNaturalW = 0; imgNaturalH = 0;
  imgFlipH = false; imgFlipV = false; imgRotate = 0;
  // Update panel face
  panelImage.style.display = 'none';
  panelImage.src = '';
  panelImage.style.transform = '';
  uploadInPanel.style.display = 'flex';
  replaceBtn.style.display = 'none';
  panelFace.classList.remove('has-image');
  // Hide image controls and Clear button
  imgCtrlGroup.style.display = 'none';
  clearArtGroup.style.display = 'none';
  // Hide image info chips
  imageInfo.classList.remove('visible');
  // Reset artwork line
  artworkLine.classList.remove('loaded');
  artworkLine.innerHTML = 'No artwork yet · <span class="accent">upload in panel</span>';
  // Exit image mode
  imageMode = false;
  panelFace.classList.remove('image-armed');
  panelContainer.classList.remove('image-mode');
  modeIndicator.classList.remove('visible', 'image-mode');
  // Clear file input
  fileInput.value = '';
});
```

- [ ] **Step 2: Verify the clear action end-to-end**

In the browser:
1. Select a panel size → upload an image → confirm artwork appears and Clear button is visible
2. Click "Clear" → confirm:
   - Upload prompt reappears in the panel face
   - Image info chips (File / Dims / Size / DPI est.) disappear
   - Artwork line resets to "No artwork yet · upload in panel"
   - Image controls group (− + ⇋ ↕ ⟳ ◎ Fit) disappears
   - Mode indicator disappears
   - Panel size, orientation, wood/fabric options all unchanged
   - Clear button itself disappears
3. Upload a new image immediately after — confirm it works cleanly (no stale state)
4. Edit a cart panel → click Clear → confirm same clean result
5. After clearing, click "Start Another" — confirm no JS errors

- [ ] **Step 3: Commit**

```bash
git add configurator.html
git commit -m "feat: implement Clear artwork button partial reset (DEV-2)"
```
