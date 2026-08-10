# Screen showcase: clickable lightbox + scrollable overflow

**Scope:** `redesign-v3-projects.html` only — the only page with `.app-shot`/`.shot` screens today. Written as a copy-pasteable rule for any future page (e.g. `redesign-v3-work.html`) that gains its own screens.

## Problem

`.app-shots` galleries (real `<img>` screenshots and hand-built `.bf-mock` CSS screens, e.g. BOLDFACE) and standalone `.shot`/`.shot-pair` photos are not clickable, so a viewer is stuck at thumbnail size. `.app-shots` already scrolls horizontally on overflow (no clipping), but has no visible affordance hinting there's more off-screen — unlike `.cat-gallery` above it, which has prev/next arrows and an edge fade. Standalone `.shot` photos (e.g. the WorkCICO screenshot) render full-width/full-bleed instead of as a thumbnail.

## The rule

Any element showing a mockup or screen — `.app-shot` (image or `.bf-mock`) inside `.app-shots`, or a standalone `.shot`/`.shot-pair` photo — must be:
1. Clickable/keyboard-activatable, opening a shared lightbox at a larger, legible size.
2. Never clipped by container overflow — a horizontally-scrolling gallery gets visible prev/next arrows plus an edge fade once it has more items than fit.

## 1. Shared lightbox (one instance per page)

A single `#shotLightbox` overlay (fixed inset:0, backdrop blur, centered card, rounded corners matching the site's radius system) is added once near the end of `<body>`. Event delegation on `document` listens for click/Enter/Space on any `.app-shot` or `.shot` figure — no per-figure wiring needed, so future screens added following the existing markup pattern work automatically.

On open:
- If the figure contains an `<img>`, the lightbox shows that image at `max-width:92vw; max-height:80vh; object-fit:contain`.
- If it contains a `.bf-mock` (or any future `*-mock` CSS screen), the lightbox deep-clones that node and scales it up via `transform:scale()`, computed in JS as `min(maxScale, availableWidth / mock's natural px width)` so it always fits the viewport instead of using a fixed scale that could overflow on small screens.
- Caption text is carried over from the figure's `figcaption`/`.app-shot-cap`.
- Prev/Next arrows step through sibling figures in the same `.app-shots` gallery (or the two photos in a `.shot-pair`); hidden when there's only one item.
- Esc, backdrop click, or the close button dismiss it; focus moves to the close button on open and returns to the trigger element on close; background scroll is locked while open.

## 2. Overflow gets arrows, not silent clipping

Every `.app-shots` gallery is wrapped in `.log-shots-wrap` (already true for FUEL Up and Facility Booking; added to BOLDFACE for consistency) and gains the same prev/next arrow + edge-fade treatment `.cat-gallery` already uses — reusing that visual style, but wired via event delegation scoped to each `.log-shots-wrap` (`closest()`) rather than one global pair of IDs, since a page can have multiple galleries.

## 3. Infographic photos shrink to thumbnails

`.shot` (outside `.shot-pair`) currently renders `width:100%` of the card body — full-bleed. Its default max-width drops to a thumbnail size (matching the existing `.shot--cert` treatment: `max-width:20rem`). `.shot-pair` children are unaffected (already sized by the 2-column grid). Clicking any `.shot` opens the same lightbox at full/natural size.

## Out of scope

- No new image assets or higher-resolution sources — the lightbox reuses each screen's existing `src`/markup.
- `redesign-v3.html`'s homepage teaser thumbnails (`.work-thumb` inside `<a class="work-card">`) are navigation links to the project's anchor, not screens to inspect in place — left untouched.
- Other v3 pages get nothing yet; they pick up this exact CSS/JS block verbatim if/when they add their own `.app-shots`/`.shot` screens.
