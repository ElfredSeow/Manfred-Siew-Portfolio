# SOAR Duty Scheduler: corrected copy + hand-built CSS screens

**Scope:** `public/projects.html` only. Rewrites one `.log-row` entry (currently "Flight Simulator Scheduling System") and adds a four-screen `.app-shots` gallery built entirely in HTML/CSS, plus a small generalisation of the existing shot-lightbox JS.

## Source of truth

`Project Management/SOAR Scheduling Marketing Content/marketing-pr/SOAR-Duty-Scheduling-App/` — a completed marketing run against `https://github.com/raid-ppcoe/SOAR-Duty-Scheduling-App` (read-only clone, commit `214d3ba`, analysed 2026-08-10/11).

Two artefacts in it drive this work:

- `MARKETING_SPEC.md` — theme tokens read out of the app's real `src/index.css`, the App Fidelity Map, the USP list with per-claim provenance, and the demo dataset used in the captures.
- `screens/{calendar,dashboard,covering,admin}.png` — 1600px real screenshots of the running app, captured against a mock Power Apps SDK (no live backend, no Dataverse connection). These are the **reference** for the CSS screens; they are not themselves published.

Every number, name, tag and flag reproduced in the mocks below is read off those four captures. Nothing is invented.

## Problem

Two independent defects in the same entry at `public/projects.html:999-1010`.

**The copy describes a different system.** The entry is titled "Flight Simulator Scheduling System" and says it is a "Scheduling system for reserving simulator resources for training and assessment: online slot booking, centralised schedule management and availability visibility." The app does not book simulator resources. It schedules *the assessors* — pairing a QFI with a Psych assessor on each simulator assessment mission across a two-wave day, tracking when that pairing is incomplete, and running an approve/reject workflow when someone needs their duty covered. The `Built with` chip list is a single `PowerApps`, which hides a React 19 / TypeScript / Vite / Tailwind 4 / TanStack Query / Recharts code app on Dataverse.

**The entry has no screens.** BOLDFACE, FUEL Up and the Facility Booking System all carry an `.app-shots` gallery; this entry carries none, despite four real captures existing.

## Decisions taken

| Decision | Choice | Why |
|---|---|---|
| Screen medium | Hand-built CSS, following the `.bf-mock` precedent | Crisp at any zoom, no image weight, matches a pattern already on the page, and publishes no literal defence-app pixels |
| Entry title | `Simulator Assessment Duty Scheduler (SOAR)` | Matches the file's own naming style (cf. `Aircraft Refuelling Strategy Planner (FUEL)`); keeps the codename while dropping the inaccurate description |
| Category | unchanged — `data-cat="automation"`, `data-org="RAiD"` | The reclassification is a separate judgement, out of scope here |
| "What I learned" copy | unchanged, verbatim | It is the author's own first-hand account, not a claim about the app |

## 1. Copy rewrite (`public/projects.html:999-1010`)

The `<details class="log-row" data-org="RAiD" data-cat="automation">` wrapper, the `Automation` tag, the `RAiD` org label and the chevron SVG are all unchanged.

**Summary title** becomes `Simulator Assessment Duty Scheduler (SOAR)`.

**Lead paragraph** replaces the existing one:

> Plans simulator assessment missions across AM and PM waves, pairing a QFI with a Psych assessor on every mission. A missing half is a first-class state — flagged as a broken pair in the grid, on the assessor's own schedule, and in the dashboard's stability metric. Assessors raise covering requests with a reason and a suggested replacement; supervisors and admins approve or reject. Built as Lead Developer.

**New `What it does` block**, an `<ul class="feat" role="list">` placed between the lead paragraph and `What I learned`, matching BOLDFACE's structure:

- Every weekday splits into an AM and a PM wave, with slot times and labels editable per day by an admin and copyable across days
- Each mission wants a QFI and a Psych assessor; an unfilled half is tracked as a broken pair rather than left silent
- Covering requests carry a reason and an optional suggested replacement, and move to History once decided
- Per-assessor duty counts drive a ranked workload chart, so over-tasking is visible before it is a problem; an admin can lock a published week against further changes

**`What I learned`** — unchanged.

**`Built with`** chips replace the single `PowerApps` chip with: `React`, `TypeScript`, `Vite`, `Tailwind CSS`, `PowerApps Code Apps`, `Dataverse`.

### Claims that must not appear

Both are explicit prohibitions carried over from `MARKETING_SPEC.md §4`:

1. **No adoption, user-count, time-saved or ROI figures.** None exist anywhere in the source repo. None may be inferred.
2. **Role enforcement is client-side.** The source repo's own README says Dataverse security roles must mirror the role matrix. The copy may describe the app as role-aware; it may never describe this as a security boundary.

## 2. The `.soar-mock` CSS system

A new scoped style block, placed immediately after the existing BOLDFACE block in the `<style>` element, modelled on `.bf-mock` and carrying the same kind of provenance comment.

### Tokens

Lifted verbatim from `MARKETING_SPEC.md §2`, which read them out of the app's real `src/index.css` (Tailwind v4 `@theme`; no `tailwind.config.*` and no `theme.ts` exist in the repo). The app's **dark** palette is used, because all four captures are dark — the app's default theme.

```
--soar-bg:        hsl(220,20%,10%)   /* --background */
--soar-card:      hsl(220,20%,15%)   /* --card       */
--soar-border:    hsl(220,20%,20%)   /* --border     */
--soar-fg:        hsl(210,20%,98%)   /* --foreground */
--soar-primary:   hsl(210,60%,50%)   /* --primary    */
--soar-accent:    hsl(40,90%,55%)    /* --color-accent      */
--soar-am:        #3b82f6            /* --color-wave-am     : AM wave, QFI */
--soar-pm:        #a855f7            /* --color-wave-pm     : PM wave, Psych */
--soar-covering:  #f59e0b            /* --color-covering    */
--soar-break:     #ef4444            /* --color-pair-break  */
```

Muted text uses the slate ramp the captures show (`#94a3b8` body-muted, `#64748b` micro-labels). Radii: 12–16px on cards, pill on chips. Hairlines are 1px `--soar-border`.

Font stack is `Inter, system-ui, -apple-system, sans-serif` — the app's declared stack. **No font file is loaded.** The source repo declares Inter but never loads it either (no `@font-face`, no CDN), so this matches the app's real behaviour and keeps the page's zero-external-request property intact.

### The brand mark

The app has no logo, no favicon and no splash. Its only brand mark is the sidebar wordmark, and it is reproduced exactly, not redrawn:

```css
.soar-mock .soar-wordmark{
  font-weight:800;
  background-image:linear-gradient(to right,#60a5fa,#ffffff);
  -webkit-background-clip:text; background-clip:text; color:transparent;
}
```

with `DUTY SCHEDULER` beneath it in a monospace stack, uppercase, wide letter-spacing, in slate-500. No substitute glyph, no invented emblem.

### The shared rail

One rail markup block, reused across all four screens with only the active item changing. Contents, exactly as captured: the wordmark lockup; nav entries **Calendar · My Schedule · Covering · Dashboard · Admin**; then a footer group of **Light Mode**, a circular `T` avatar over `t.rahman@soar.demo` / `Admin`, **Logout**, and `v1.0.11`.

Icons are the app's own lucide-react glyphs (v0.546.0) inlined as SVG. `MARKETING_SPEC.md §3d` extracted these verbatim from the app's `node_modules`, and they are used as-is: `calendar`, `clock`, `layout-dashboard`, `shield-check`, `user-check`, `arrow-left-right`, `triangle-alert`, `lock`, `circle-plus`, `check`, `arrow-right`, `users`, `trending-up`, `settings`, `tag`, `power`, `chevron-right`, `circle-alert`, `map-pin`, `user`, `plus`.

Four further glyphs are plainly visible in the captures but fall outside that extracted list — `sun` (Light Mode), `log-out` (Logout), `x` (Reject) and `pencil` (edit assessor). These are drawn from the same lucide v0.546.0 set by name, matching what the captures show. Recorded here so the provenance gap is explicit rather than silent. No generic arrow entities and no ad-hoc paths.

### Sizing

Authored at a fixed **600px** natural width and scaled to the existing 288px (18rem) `.app-shot-frame`:

```css
.app-shot-frame .soar-mock{width:600px;transform:scale(.48);transform-origin:top left}
```

600 × .48 = 288, so nothing overflows sideways — the same arithmetic BOLDFACE uses at 480 × .6. SOAR needs the extra 120px because the Weekly Schedule renders five day columns beside the rail.

A `@media (max-width:520px)` rule collapses the rail to an icon strip and drops the calendar to three day columns, mirroring the existing BOLDFACE narrow-viewport rule.

## 3. The four screens

Four `<figure class="app-shot" role="listitem" tabindex="0">` entries, each with an `.app-shot-chrome` title bar, the `.soar-mock` in an `.app-shot-frame`, and an `.app-shot-cap` figcaption. The mock itself is `aria-hidden="true"`; the accessible description lives in the figcaption and the gallery label, exactly as BOLDFACE does it.

### 3.1 Weekly Schedule — `screens/calendar.png`

Header: `Weekly Schedule` beside a green `OPEN` state chip; a `‹ TODAY ›` control over `Week of August 10th, 2026`; an amber-outlined **Lock Week** button and a filled blue **Create Mission** button.

Legend row, five swatches: `QFI Assigned` (blue) · `Psych Assigned` (purple) · `Unassigned` (red) · `Broken Pair` (red triangle) · `Covering Mission` (swap glyph).

Five day columns — **Monday Aug 10** through **Friday Aug 14** — each split into an `AM WAVE` group (blue dot) and a `PM WAVE` group (purple dot), with slot rows labelled `08:00 / WAVE 1`, `10:15 / WAVE 2`, `13:30 / WAVE 3`, `15:45 / WAVE 4`. Every mission card shows its simulator, then a `Q` row and a `P` row.

The full grid, read off the capture — 20 missions:

| Day | 08:00 W1 | 10:15 W2 | 13:30 W3 | 15:45 W4 |
|---|---|---|---|---|
| Mon 10 | Sim 1 · Q T Rahman · P L Okafor · *Request Coverage* | Sim 2 · Q S Whitfield · P A Delgado | Sim 1 · Q K Nakamura · P M Bianchi | Sim 3 · Q R Alvarez · P D Kowalski |
| Tue 11 | Sim 2 · Q T Rahman · P M Bianchi · *Request Coverage* | Sim 4 · Q P Nguyen · P L Okafor | **Sim 1 · Q S Whitfield · P Unassigned** | Sim 3 · Q K Nakamura · P A Delgado |
| Wed 12 | Sim 5 · Q R Alvarez · P D Kowalski | Sim 2 · Q T Rahman · P A Delgado · *Request Coverage* | *Sim 4 · Q P Nguyen · P M Bianchi* | Sim 1 · Q K Nakamura · P L Okafor |
| Thu 13 | Sim 3 · Q S Whitfield · P D Kowalski | Sim 1 · Q T Rahman · P L Okafor · +J Farrow | **Sim 5 · Q Unassigned · P M Bianchi** | Sim 2 · Q R Alvarez · P A Delgado |
| Fri 14 | Sim 4 · Q K Nakamura · P M Bianchi | *Sim 2 · Q P Nguyen · P D Kowalski* | Sim 1 · Q T Rahman · P L Okafor · *Request Coverage* | Sim 3 · Q S Whitfield · P A Delgado |

**Bold** = broken pair: red card border and a red `triangle-alert` glyph top-right, with the missing half rendered as `Unassigned` in red. There are exactly two, matching the dashboard's `2 Pair Breaks`.

*Italic* = covering mission: amber card border and an amber `arrow-left-right` glyph top-right. There are exactly two.

`+J Farrow` on Thursday's 10:15 slot is the extra observer row the capture shows beneath that mission's Q/P pair — a `user` glyph and a name in muted slate, above the Request Coverage button, not a third assigned assessor.

Caption: **Weekly Schedule** — "Five days, two waves, four slots. Broken pairs and covering missions are flagged in the grid, not buried."

### 3.2 Operations Dashboard — `screens/dashboard.png`

Header `Operations Dashboard` over `System-wide workload and stability metrics`.

Four stat tiles, each with a tinted glyph top-left and a mono `LIVE` micro-label top-right:

| Glyph | Value | Label |
|---|---|---|
| `users` (blue) | **10** | Total Assessors |
| `calendar` (purple) | **20** | Active Missions |
| `circle-alert` (red) | **2** | Pair Breaks |
| `trending-up` (amber) | **3** | Covering Requests |

`Assessor Workload (Duty Count)` card: an eight-bar chart on a `0 / 4 / 8 / 12 / 16` y-axis. Bars, left to right — T Rahman 14 (the only bar in solid `--soar-am`; the rest are the muted deep-navy fill the capture shows), L Okafor 13, S Whitfield 12, A Delgado 11, K Nakamura 10, M Bianchi 9, R Alvarez 8, D Kowalski 7. Built as flex columns with percentage heights, not an SVG chart.

`Mission Stability` card: a donut as inline SVG, `stroke-dasharray` split 90 / 10 between `--soar-am` and `--soar-break` — the same technique the existing `.bf-ring` uses. Beneath it, two rows: `Stable Pairs` **90.0%** (blue) and `Critical Gaps` **2** (red).

Caption: **Operations Dashboard** — "Live workload and stability across the whole roster, so over-tasking shows up before it becomes a problem."

### 3.3 Covering Requests — `screens/covering.png`

Header `Covering Requests` over `Manage mission coverage and assessor replacements`, with a right-aligned segmented control: `Pending` + a `3` count pill (active, blue), and `History`.

Three request cards. Each has a purple rounded `PM` clock badge; the date as a heading with the simulator beneath in mono uppercase; a right-aligned `REQUESTED BY` micro-label over the requester's name; an inset `REASON FOR ABSENCE` panel holding the quoted reason in italic; a green-tinted `SUGGESTED REPLACEMENT` strip with an `arrow-right` glyph; and a right-hand action column of a green **Approve** and a red **Reject** button.

| Date | Sim | Requested by | Reason | Suggested replacement |
|---|---|---|---|---|
| Tuesday, Aug 11th | SIM 1 | S Whitfield | "Medical appointment scheduled at short notice — unable to attend the afternoon wave." | R Alvarez |
| Thursday, Aug 13th | SIM 5 | M Bianchi | "Recalled to squadron duty for the Thursday PM wave. Handover notes prepared." | L Okafor |
| Wednesday, Aug 12th | SIM 1 | K Nakamura | "Currency renewal course clashes with the Wednesday PM slot." | P Nguyen |

Caption: **Covering Requests** — "An assessor raises a request with a reason and a suggested stand-in; a supervisor approves or rejects, and the decision lands in History."

### 3.4 System Administration — `screens/admin.png`

Header `System Administration` over `Manage assessors, wave configurations, and system parameters`.

A five-tab strip, each with its lucide glyph, uppercase and wide-tracked: **ASSESSORS** (active — blue text, blue underline) · ROLE TYPES · WAVE SLOTS · USER ACCOUNTS · SIMULATORS.

`Personnel Roster` heading with a filled blue `+ Add Assessor` button, then a three-column grid of ten assessor cards. Each card: name, one or more role tags as small tinted pills, a hairline divider, then a duty count over a mono `DUTIES` label on the left and two square toggle buttons on the right — a `shield-check` (supervisor) and a `power` (active).

| Assessor | Role tags | Duties | Supervisor | Active |
|---|---|---|---|---|
| T Rahman | QFI, SENIOR PSYCH | 14 | lit (amber) | green |
| L Okafor | REGULAR PSYCH | 13 | dim | green |
| S Whitfield | QFI | 12 | lit (amber) | green |
| A Delgado | REGULAR PSYCH | 11 | dim | green |
| K Nakamura | QFI | 10 | dim | green |
| M Bianchi | SENIOR PSYCH | 9 | dim | green |
| R Alvarez | QFI | 8 | dim | green |
| D Kowalski | REGULAR PSYCH | 7 | dim | green |
| P Nguyen | QFI | 6 | dim | green |
| J Farrow | TRAINEE ASSESSOR | 5 | dim | **red (inactive)** |

Caption: **System Administration** — "Assessors, role types, wave slots, user accounts and simulators are all managed in-app. Demonstration dataset — all personnel and reasons shown across these screens are fabricated."

That closing sentence is the page's single disclosure that the data is not operational, and it is required. It sits on the last caption so it is the last thing read in the gallery.

## 4. Gallery wrapper

Copied verbatim from BOLDFACE's block at `public/projects.html:686-698`: `.log-shots-wrap` → `.shots-head` (holding the `The actual screens` label and the hidden-until-needed prev/next `.shots-nav-group`) → `.app-shots-wrap` → `.app-shots`.

Because the existing JS binds by `.log-shots-wrap` / `.app-shots` via `closest()`, the overflow arrows, edge fade, horizontal scrolling and click/Enter/Space activation all work with no new wiring.

Gallery `aria-label`: *"SOAR Duty Scheduler app screens, rebuilt in HTML and CSS from the app's own interface code, design tokens and captured screens — not photos, not invented."*

## 5. Generalising the shot lightbox

`docs/superpowers/specs/2026-08-10-screen-showcase-lightbox-design.md` states the lightbox handles "a `.bf-mock` (or any future `*-mock` CSS screen)". It does not. The shipped JS hardcodes both the selector and the natural width in three places:

- `public/projects.html:1541` — `var natural = 480;`
- `public/projects.html:1559` — `var mock = el.querySelector('.bf-mock');`
- `public/projects.html:1646` — `var mock = body.querySelector('.bf-mock');`

Adding a second CSS screen system makes the promise real rather than working around it.

**Change:** mocks are identified by a `data-mock` attribute and carry their own authored width in `data-mock-w`.

- `fitMockScale` reads `parseFloat(mock.getAttribute('data-mock-w')) || 480` instead of the literal `480`.
- Both `querySelector('.bf-mock')` calls become `querySelector('[data-mock]')`.
- The clone's `style.width` is set from the same attribute value rather than the literal `'480px'`.
- Every existing `.bf-mock` element gains `data-mock data-mock-w="480"`; every `.soar-mock` ships with `data-mock data-mock-w="600"`.

The `.bf-mock` CSS class and all its rules stay exactly as they are — the attribute is additive, so BOLDFACE's rendering and lightbox behaviour are unchanged. The `.shot-lightbox-mockwrap .bf-mock` positioning rule at `public/projects.html:335` gains a `[data-mock]` sibling selector so the clone is positioned regardless of which mock system it came from.

After this change a future CSS screen needs no JS edit, which is what the earlier spec assumed.

## Verification

1. The page loads with zero console messages, and no horizontal overflow at 1440×900 and 390×844 (`documentElement.scrollWidth <= innerWidth`).
2. All four SOAR figures render inside the 288px frame with no sideways overflow, and the gallery's prev/next arrows appear and function.
3. Clicking each of the four SOAR screens, and each of the three BOLDFACE screens, opens the lightbox scaled to fit — confirming the `data-mock` change did not regress BOLDFACE.
4. Keyboard: Tab reaches each figure, Enter and Space open it, Esc closes it, and focus returns to the trigger.
5. Each of the four mocks is compared side by side against its source PNG: every name, number, simulator, time, wave label, role tag, flag and button label matches.
6. The entry contains no adoption/ROI/time-saved figure and no claim that role enforcement is a security boundary.
7. No new external request: the page still loads zero fonts, images or scripts from any external host.

## Out of scope

- The four PNG captures are not copied into `public/`. Nothing under `public/soar/` is created.
- `public/index.html`, `public/work.html` and `public/experience.html` are untouched.
- No other `.log-row` entry's copy, title, category or chips change.
- The entry's category (`automation`) and org (`RAiD`) are not revisited.
- The light palette defined in the app's CSS is not built. The captures are dark, and rendering a light mock beside dark source screens would misrepresent the product.
- `MySchedulePage` and `unauthorized` — two further real screens in the app — are not built. The four selected cover the value story without repetition.
