# Checkout Flow Design — DEV-3

**Date:** 2026-05-26
**Status:** Approved
**Task:** DEV-3 — Checkout Button in Room Visualizer (extended to Configurator)

---

## Overview

Add a checkout flow to both the Configurator and Room Visualizer pages. The flow is a dummy order prototype — no payment processing. Submissions route to `rohan270@gmail.com` via Formspree until a business email account is set up.

---

## Entry Points

### Configurator (`configurator.html`)
- Replace the existing "Request Quote" button in the bottom summary bar (alongside "+ Add More Panels" and "Visualize Your Space") with a **"Checkout →"** button
- Style: accent yellow fill (`--accent`), navy text (`--ink`), `1.5px solid var(--ink)` border — standard Ahata CTA

### Room Visualizer (`room-visualizer.html`)
- In the sidebar "Next step" section: replace "Clear All Panels" with a full-width **"Checkout →"** button (same yellow CTA style)
- "Clear All Panels" moves to the main canvas area, below the "Select A Panel First" text block, styled as a button matching that text block's visual treatment
- Both the sidebar "Checkout →" and any future floating pill open the same modal

---

## Cart Data

- Source of truth: `acousticCart` in `localStorage`
- Each item in the cart maps to one designed panel (with artwork, transforms, size, varnish, wrap, quantity)
- Quantity per panel: pulled from `cartItem.quantity` (set in configurator; user can specify 2+ identical panels)
- If `acousticCart` is empty when modal opens: show "No panels designed yet" with a link to `configurator.html`

---

## Modal Structure

Follows the existing consult modal pattern: centered overlay, blurred backdrop, `×` close button.

Two steps navigated by buttons (not tabs). Step indicator shown in the header.

### Step 1 — Cart Review

Header: `◆ Your Order · Step 1 of 2`

Each panel renders as a row:
- Thumbnail (same canvas preview used in "Your Designs" grid)
- Panel size (e.g. "2×2 ft Panel")
- Wood varnish + fabric wrap as secondary text
- Quantity and price right-aligned

Below the list:
- Subtotal (sum of `price × quantity` for all items)

CTA: `Continue to Details →` (yellow, navy text) — advances to Step 2

---

### Step 2 — Order Form

Header: `← Back · Order Details · Step 2 of 2`

Fields:
| Field | Type | Required |
|---|---|---|
| Full name | text | yes |
| Email | email | yes |
| Phone | tel | yes |
| Delivery address | text | yes |
| Pincode | text | yes |
| City | text | yes |
| Notes | textarea | no |

Layout: Email + Phone on one row; Pincode + City on one row — matches existing consult form two-column pattern.

"← Back" returns to Step 1 without losing form data.

CTA: `Place Order →` (yellow, navy text)

**Submission:** Formspree endpoint. On submit, the payload includes all form fields plus a formatted order summary (panel sizes, quantities, total).

**Validation:** Name, email, phone, address, pincode, city are required. Show inline field errors on submit attempt.

**On network error:** Inline error message below the CTA; form stays open for retry.

---

### Success State

Shown after successful Formspree submission. Replaces modal content (not a numbered step).

Content:
- `◆` brand mark in `--accent`, centered
- "Order Received." heading
- "We'll be in touch at [user's email] within 1–2 business days to confirm your order and arrange delivery."
- Single CTA: "Back to Visualizer" (or "Back to Configurator" depending on which page opened the modal) — closes the modal

---

## Formspree Setup

- Create a free Formspree account at formspree.io
- Create a form targeting `rohan270@gmail.com`
- Replace the placeholder `YOUR_FORMSPREE_ID` in the implementation with the actual form ID
- Free tier: 50 submissions/month (sufficient for prototype)

---

## Future Considerations

- **Slide-in drawer** — noted as a preferred UI direction once the flow is validated. Would replace the centered modal with a right-side panel.
- **Business email** — swap `rohan270@gmail.com` for `hello@ahata.in` once set up
- **Real payment** — Razorpay integration requires a backend (serverless function on Vercel/Render); this is a separate future project
- **Floating cart pill** — a persistent bottom-right pill showing panel count + running total, opening the same modal. Noted for future; not in this implementation.

---

## Files Affected

- `configurator.html` — replace "Request Quote" button; add checkout modal HTML + JS
- `room-visualizer.html` — replace "Clear All Panels" in sidebar; relocate clear button to canvas area; add checkout modal HTML + JS
