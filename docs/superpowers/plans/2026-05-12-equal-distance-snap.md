# Equal-Distance Snap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When dragging a panel between two others, snap it to the equal-gap position and show the same blue guide line used by edge/center snapping.

**Architecture:** Extend the existing drag snap pipeline in `room-visualizer.html`. The current code computes `bestX`/`bestY` (edge/center snap) and applies them immediately. We defer that application, compute an equal-distance candidate (`bestEqX`/`bestEqY`) using the same group bounding box, then apply whichever snap has the smaller delta. Guide rendering shows the winning snap.

**Tech Stack:** Vanilla JS, no build step, no test framework — verification is manual browser testing.

---

### Task 1: Defer bestX/bestY application and add equal-distance snap detection

**Files:**
- Modify: `room-visualizer.html` — drag handler snap block (~lines 987–1063)

The existing code applies `bestX.diff` to `allowedDx` immediately after computing it (line ~998) and `bestY.diff` immediately after bestY (line ~1018). We need to remove those two early applications and replace the whole block with deferred application that also accounts for equal-distance.

- [ ] **Step 1: Remove the two early application lines**

Find and remove these two blocks (they appear back-to-back in the snap section):

```js
if(bestX){
  allowedDx += bestX.diff;
}
```

```js
if(bestY){
  allowedDy += bestY.diff;
}
```

After removing them, the `bestX` and `bestY` variables are computed but never used yet — that's intentional.

- [ ] **Step 2: Add equal-distance detection + deferred application**

Immediately after the existing `if(bestY){ ... }` block (now removed), insert:

```js
    // Equal-distance X snap: nearest left/right neighbors, equal-gap position
    let bestEqX = null;
    {
      const groupW = gMaxX - gMinX;
      let leftN = null, rightN = null;
      otherPanels.forEach(p => {
        const re = p.x + p.w;
        if(re <= gMinX && (!leftN || re > leftN.x + leftN.w)) leftN = p;
        if(p.x >= gMaxX && (!rightN || p.x < rightN.x)) rightN = p;
      });
      if(leftN && rightN){
        const idealGMinX = ((leftN.x + leftN.w) + rightN.x - groupW) / 2;
        const diff = idealGMinX - gMinX;
        if(Math.abs(diff) < snapThresholdFtX)
          bestEqX = { diff, guideAt: idealGMinX + groupW / 2 };
      }
    }
    // Equal-distance Y snap: nearest top/bottom neighbors, equal-gap position
    let bestEqY = null;
    {
      const groupH = gMaxY - gMinY;
      let topN = null, bottomN = null;
      otherPanels.forEach(p => {
        const be = p.y + p.h;
        if(be <= gMinY && (!topN || be > topN.y + topN.h)) topN = p;
        if(p.y >= gMaxY && (!bottomN || p.y < bottomN.y)) bottomN = p;
      });
      if(topN && bottomN){
        const idealGMinY = ((topN.y + topN.h) + bottomN.y - groupH) / 2;
        const diff = idealGMinY - gMinY;
        if(Math.abs(diff) < snapThresholdFtY)
          bestEqY = { diff, guideAt: idealGMinY + groupH / 2 };
      }
    }
    // Apply best X snap — equal-distance wins if its delta is tighter or equal
    const useEqX = bestEqX && (!bestX || Math.abs(bestEqX.diff) <= Math.abs(bestX.diff));
    if(useEqX)       allowedDx += bestEqX.diff;
    else if(bestX)   allowedDx += bestX.diff;
    // Apply best Y snap
    const useEqY = bestEqY && (!bestY || Math.abs(bestEqY.diff) <= Math.abs(bestY.diff));
    if(useEqY)       allowedDy += bestEqY.diff;
    else if(bestY)   allowedDy += bestY.diff;
```

- [ ] **Step 3: Update guide rendering**

Find the existing guide rendering block (starts with `// Render snap guide lines`) and replace the entire block with:

```js
    // Render snap guide lines
    activeWallSurface.querySelectorAll('.snap-guide').forEach(g => g.remove());
    if(useEqX){
      const guide = document.createElement('div');
      guide.className = 'snap-guide vertical';
      guide.style.left = (bestEqX.guideAt * pxPerFtX) + 'px';
      guide.style.top = '0';
      guide.style.height = '100%';
      activeWallSurface.appendChild(guide);
    } else if(bestX){
      const guide = document.createElement('div');
      guide.className = 'snap-guide vertical';
      guide.style.left = (bestX.target * pxPerFtX) + 'px';
      guide.style.top = '0px';
      guide.style.height = '100%';
      activeWallSurface.appendChild(guide);
    }
    if(useEqY){
      const guide = document.createElement('div');
      guide.className = 'snap-guide horizontal';
      guide.style.top = (bestEqY.guideAt * pxPerFtY) + 'px';
      guide.style.left = '0';
      guide.style.width = '100%';
      activeWallSurface.appendChild(guide);
    } else if(bestY){
      const guide = document.createElement('div');
      guide.className = 'snap-guide horizontal';
      guide.style.top = (bestY.target * pxPerFtY) + 'px';
      guide.style.left = '0px';
      guide.style.width = '100%';
      activeWallSurface.appendChild(guide);
    }
```

- [ ] **Step 4: Verify in browser**

Open `http://localhost:8000/room-visualizer.html`. Place 3 panels on a wall with gaps between them. Drag the middle panel away, then drag it back toward the equal-gap position between the other two. Expected:
- Panel snaps to the equal-gap position when within ~6px of it
- A thin blue vertical line appears at the center of the dragged panel while snapped
- Line disappears on mouse-up (existing cleanup at line ~1097 handles this)
- Edge/center snapping still works normally when no left+right neighbors are present

Also test with panels stacked vertically (drag top/bottom neighbors, expect horizontal guide line).

- [ ] **Step 5: Commit**

```bash
git add room-visualizer.html
git commit -m "Add equal-distance snap with guide line in room visualizer"
```
