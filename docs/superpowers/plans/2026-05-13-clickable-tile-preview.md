# Clickable Tile Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the image preview area of each "Your Panels" tile load that panel into the live designer on click, with a WIP guard modal.

**Architecture:** All changes are inside `configurator.html` — CSS hover, a new modal HTML block, two new JS functions (`triggerPanelSwitch` / `execPanelSwitch`), WIP modal JS, and a click listener attached to `.cart-preview` elements inside `updateCart()`.

**Tech Stack:** Vanilla HTML/CSS/JS, no build step, no test framework — verification is manual browser testing via `python3 -m http.server 8000`.

---

## File Map

| File | What changes |
|------|-------------|
| `configurator.html:250` | Add `cursor:pointer` + `transition:opacity` to `.cart-preview` rule; add `.cart-preview:hover` |
| `configurator.html:615` | Insert WIP modal HTML block after closing `</div>` of consult modal |
| `configurator.html:622` | Extend Escape keydown handler to also close WIP modal |
| `configurator.html:1458` | Add `item.dataset.idx = String(i)` so `.cart-preview` click can read index |
| `configurator.html:1507` | Attach `.cart-preview` click listeners after existing button listener block |
| `configurator.html:~1582` | Add `execPanelSwitch(idx)`, `triggerPanelSwitch(idx)`, and WIP modal JS after `loadPanelToEditor` closes |

---

## Task 1: CSS — cursor and hover on `.cart-preview`

**Files:**
- Modify: `configurator.html:250`

- [ ] **Step 1.1: Add cursor + transition to existing `.cart-preview` rule**

Find line 250 (the single-line `.cart-preview{…}` rule). Replace:

```css
.cart-preview{width:100%;min-height:180px;padding:18px;display:flex;align-items:center;justify-content:center;perspective:800px;background:var(--paper);border-bottom:1.5px solid var(--ink);overflow:hidden}
```

With:

```css
.cart-preview{width:100%;min-height:180px;padding:18px;display:flex;align-items:center;justify-content:center;perspective:800px;background:var(--paper);border-bottom:1.5px solid var(--ink);overflow:hidden;cursor:pointer;transition:opacity 0.15s}
.cart-preview:hover{opacity:0.82}
```

- [ ] **Step 1.2: Verify in browser**

Open `http://localhost:8000/configurator.html`. Design and save one panel. Hover over the image preview area in the "Your Panels" tile — cursor should change to a hand and the preview should dim slightly. No click behaviour yet.

- [ ] **Step 1.3: Commit**

```bash
git add configurator.html
git commit -m "style: add pointer cursor and hover opacity to cart tile preview"
```

---

## Task 2: WIP modal HTML

**Files:**
- Modify: `configurator.html:615`

- [ ] **Step 2.1: Insert WIP modal after the consult modal closing tag**

Find the closing `</div>` of the consult modal block (line 615 — the blank line before `<script>`). Insert the following block immediately after it (before the blank line that precedes `<script>`):

```html
<div class="consult-modal" id="wipModal" aria-hidden="true">
  <div class="consult-backdrop" id="wipBackdrop"></div>
  <div class="consult-panel" style="max-width:400px">
    <div class="consult-label">◆ Unsaved design</div>
    <h3>Save before <span class="consult-accent">switching?</span></h3>
    <p class="consult-desc">You have a design in progress. Save it to your panels first, or discard it and load the selected one.</p>
    <div class="consult-actions">
      <button type="button" class="consult-btn ghost" id="wipDiscard">Discard</button>
      <button type="button" class="consult-btn primary" id="wipSave">Save &amp; switch →</button>
    </div>
  </div>
</div>
```

- [ ] **Step 2.2: Verify markup renders**

Reload `http://localhost:8000/configurator.html`. Open browser DevTools → Elements, confirm `#wipModal` exists in the DOM with two child buttons `#wipDiscard` and `#wipSave`. The modal should not be visible (it has no `.open` class yet).

- [ ] **Step 2.3: Commit**

```bash
git add configurator.html
git commit -m "feat: add WIP guard modal HTML for tile preview switch"
```

---

## Task 3: JS — WIP modal logic + execPanelSwitch + triggerPanelSwitch

**Files:**
- Modify: `configurator.html:622` (Escape handler)
- Modify: `configurator.html:~1582` (after `loadPanelToEditor` closes)

### 3a — Extend the Escape keydown handler

- [ ] **Step 3a.1: Add wipModal to Escape handler**

Find line 622 (the single `document.addEventListener('keydown', …)` line that closes the consult modal on Escape). Replace:

```js
document.addEventListener('keydown', e => { if(e.key==='Escape' && consultModal.classList.contains('open')){ consultModal.classList.remove('open'); document.body.classList.remove('modal-open'); }});
```

With:

```js
document.addEventListener('keydown', e => {
  if(e.key==='Escape'){
    if(consultModal.classList.contains('open')){ consultModal.classList.remove('open'); document.body.classList.remove('modal-open'); }
    if(wipModal.classList.contains('open')){ closeWipModal(); }
  }
});
```

> Note: `wipModal` and `closeWipModal` are defined in the next step. Because they are declared at script scope (not inside any block), this forward reference is safe in JS — the keydown handler only fires after the page is fully loaded.

### 3b — Add new functions after loadPanelToEditor

- [ ] **Step 3b.1: Add the new JS block immediately after `loadPanelToEditor` closes (the `}` on line ~1581)**

Paste this block in full:

```js
// ============ TILE PREVIEW CLICK ============
const wipModal = document.getElementById('wipModal');
const wipBackdrop = document.getElementById('wipBackdrop');
let _wipTargetIdx = null;

function openWipModal(idx){
  _wipTargetIdx = idx;
  wipModal.classList.add('open');
  wipModal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
}

function closeWipModal(){
  wipModal.classList.remove('open');
  wipModal.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
  _wipTargetIdx = null;
}

function execPanelSwitch(idx){
  const panel = cart[idx];
  loadPanelToEditor(panel);
  cart.splice(idx,1);
  cartSection.classList.remove('visible');
  saveCart();
  updateCart();
  requestAnimationFrame(()=>designer.scrollIntoView({behavior:'smooth',block:'start'}));
}

function triggerPanelSwitch(idx){
  if(currentPanel.image){
    openWipModal(idx);
  } else {
    execPanelSwitch(idx);
  }
}

wipBackdrop.addEventListener('click', closeWipModal);

document.getElementById('wipDiscard').addEventListener('click', ()=>{
  const idx = _wipTargetIdx;
  closeWipModal();
  execPanelSwitch(idx);
});

document.getElementById('wipSave').addEventListener('click', ()=>{
  const targetPanel = cart[_wipTargetIdx];
  cart.push(panelToCartItem(currentPanel));
  const newIdx = cart.indexOf(targetPanel);
  closeWipModal();
  execPanelSwitch(newIdx);
});
```

- [ ] **Step 3b.2: Verify functions exist**

In the browser console, type `triggerPanelSwitch`. It should print the function definition (not `undefined`). Type `execPanelSwitch` — same. Type `wipModal` — should print the DOM element.

- [ ] **Step 3b.3: Commit**

```bash
git add configurator.html
git commit -m "feat: add execPanelSwitch, triggerPanelSwitch, and WIP modal JS"
```

---

## Task 4: Wire click handler onto `.cart-preview` in `updateCart()`

**Files:**
- Modify: `configurator.html:1458` (add `data-idx` to `.cart-item`)
- Modify: `configurator.html:1507` (add preview click listener after button listener block)

- [ ] **Step 4.1: Add `data-idx` to `.cart-item`**

Find the line that reads `item.className = 'cart-item';` (line ~1458). Change it to:

```js
item.className = 'cart-item';
item.dataset.idx = String(i);
```

- [ ] **Step 4.2: Attach click listener to `.cart-preview` after the button listener block**

Find the closing `});` of the `cartStrip.querySelectorAll('.cart-remove, .qty-btn, .cart-mini-btn').forEach(…)` block (ends at line ~1507). Immediately after that closing `});`, add:

```js
  cartStrip.querySelectorAll('.cart-preview').forEach(el=>{
    el.addEventListener('click', ()=>{
      const idx = parseInt(el.closest('.cart-item').dataset.idx);
      triggerPanelSwitch(idx);
    });
  });
```

- [ ] **Step 4.3: Verify click works — no WIP**

In the browser:
1. Upload an image, configure a panel, click **Done** to save it.
2. The "Your Panels" section appears with the tile.
3. Click the image preview area of the tile.
4. The designer should load the panel (same as clicking Edit), the cart section should collapse, and the page should scroll to the designer.
5. The panel should no longer appear in "Your Panels" (it was removed from cart).

- [ ] **Step 4.4: Verify WIP guard — Discard path**

1. Click the image preview area of a saved tile to load it into the designer.
2. Click **Start Another** to reset and get a fresh panel.
3. Upload a new image (don't click Done).
4. Now click the image preview of a saved tile.
5. The WIP modal should appear with "Discard" and "Save & switch →".
6. Click **Discard** — the new upload is lost, the clicked tile loads into the designer.

- [ ] **Step 4.5: Verify WIP guard — Save path**

1. Repeat steps 1–4 from 4.4.
2. Click **Save & switch →** — the new WIP upload is saved as a new tile in "Your Panels", then the clicked tile loads into the designer.
3. "Your Panels" should now contain the saved WIP tile (the one you uploaded in step 3 above).

- [ ] **Step 4.6: Verify buttons still work**

Confirm that clicking the **Edit** button, **Remove** button, and qty **+/−** buttons on a tile all still behave as before. The click handler is only on `.cart-preview`, not the whole `.cart-item`.

- [ ] **Step 4.7: Verify Escape and backdrop close WIP modal**

Open the WIP modal (step 4.4), then press Escape — modal should close, no panel loaded. Repeat and click the dark backdrop — same result.

- [ ] **Step 4.8: Commit**

```bash
git add configurator.html
git commit -m "feat: make cart tile image preview clickable to load panel into designer"
```
