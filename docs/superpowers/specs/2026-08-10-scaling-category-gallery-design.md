# Scaling rename + category gallery

**Scope:** `redesign-v3-projects.html` (primary), `redesign-v3-work.html`, `redesign-v3.html` (comment only).

## 1. Rename: Platform → Scaling

The "Full-stack platforms" category (indigo hue) is renamed to foreground scaling rather than ownership.

| Element | Was | Becomes |
|---|---|---|
| Filter card name | "Full-stack platforms" | "Scaling systems" |
| Entry tag badge (×3: 2 in projects, 1 in work) | "Platform" | "Scaling" |
| Claim text | "I own systems, not features." | "I take a system from first user to enterprise rollout." |
| CSS comment, `redesign-v3.html` `--indigo-*` legend | `/* Full-stack platforms */` | `/* Scaling systems */` |
| CSS comment, `redesign-v3-work.html` | `Full-stack platforms → indigo` | `Scaling systems → indigo` |
| Intro comment block, `redesign-v3.html` | "...Full-stack platforms, Enterprise..." | "...Scaling systems, Enterprise..." |

Card name is a 2-word noun phrase to match the cadence of the other five category names (Process automation, Enterprise applications, Developer enablement & R&D, Competitions & credentials, Simulation & decision support). The tag badge is a single word to match the existing badge pattern (Enterprise, Automation, Enablement, Competition, Credential).

The claim avoids the word "scale" verbatim since Developer enablement's claim already uses it ("I scale the practice past myself.") — reusing the word across two categories on the same rail would read as redundant.

`data-cat="platform"` value is internal wiring and does not change.

## 2. Category filter: flat pill row → scroll-snap card gallery

Today the 6 categories + "All" are a flat `flex-wrap` row of pills (`redesign-v3-projects.html:243–265`). This becomes a horizontally scrollable card rail.

### Structure

```
.filters (existing card)
  .cat-gallery-head          -- new: label + prev/next arrow pair
  .cat-gallery-wrap           -- new: relative-positioned scroll container + edge fade
    .cat-gallery               -- new: flex, overflow-x:auto, scroll-snap-type:x proximity
      button.cat-card.cat-card--all  (id="logReset", sticky left:0)
      button.cat-card.cat-sky        (Simulation, disabled)
      button.cat-card.cat-indigo     (Scaling systems)
      button.cat-card.cat-violet     (Enterprise applications)
      button.cat-card.cat-amber      (Process automation)
      button.cat-card.cat-coral      (Developer enablement & R&D)
      button.cat-card.cat-mint       (Competitions & credentials)
  .filter-row.filter-row--org (existing, unchanged)
```

### Card content

Each card shows, always visible (no more dynamic swap-on-select):
- Category name
- Count (or "(in preparation)" for the disabled Simulation card)
- One-line claim

The "All" card shows the existing default line ("Six groupings on one axis: how much of the system was mine to own.") in place of a claim.

### Visual behavior

- Cards: `border-radius:var(--r-lg)`, `box-shadow:var(--sh-1)`, same tint/ink hue system as today's pills (`cat-sky`/`cat-indigo`/etc. mirror `pill-sky`/`pill-indigo`). Unselected = tint background; `[aria-pressed="true"]` = solid `*-ink` background, white text — same rule the pills use today.
- "All" card: `position: sticky; left: 0; z-index: 2`, so it stays reachable while the rest of the rail scrolls underneath it. Solid `--ink` background by default (mirrors today's default-selected reset pill).
- Disabled Simulation card: same muted/disabled treatment as the current disabled pill (`opacity:.5`, `disabled` attribute, no click handler).
- `.cat-gallery-wrap` gets a right-edge fade mask (gradient to `var(--surface)`, matching the filters card background) to hint more content off-screen.
- Prev/next arrow buttons: small circular buttons in `.cat-gallery-head`, visible only under `(hover:hover) and (pointer:fine)` — hidden on touch, where native swipe/scroll-snap handles it. They call `scrollBy` on `.cat-gallery` and disable themselves at each scroll boundary.

### JS changes

Existing filtering logic (`org`/`cat` state, `apply()`, `aria-pressed` toggling, `data-org`/`data-cat` wiring) is reused unchanged — this is a markup/CSS restructuring of the same buttons, not new filtering logic.

Removed: the `#catClaim` element and the `claim.textContent = ...` swap in `setCat()` / the reset handler, since every card now shows its own claim text permanently.

Added: a small scroll-position listener wiring the two new arrow buttons to `scrollBy({left, behavior:'smooth'})` and toggling their `disabled` state at the scroll start/end.

### Unchanged

- Organisation filter row (`RAiD`/`RSAF`/`Temasek Polytechnic`/`Freelance`) stays as today's flat pill row.
- Project list, its `data-org`/`data-cat` attributes, and the `logCount` status line are unaffected.
