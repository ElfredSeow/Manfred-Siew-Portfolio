# MAVIS: split the paired row, and hand-build four CSS screens

**Scope:** `public/projects.html` only. Splits one `.log-row` (currently `MILES / MAVIS`) into two
sibling rows, rewrites both from verified sources, adds a four-screen `.app-shots` gallery to the
MAVIS row built entirely in HTML/CSS, registers a fifth mock family with the existing lightbox, and
corrects a hardcoded project count that the split invalidates.

## Source of truth

Two completed marketing runs, both analysed 2026-08-11, both read-only clones against a mocked
backend:

- **MAVIS** — `Project Management/MAVIS Marketing Content/marketing-pr/mavis-app/`, run against
  `https://github.com/raid-ppcoe/mavis-app`. Supplies `MARKETING_SPEC.md` (theme tokens read out of
  the app's real `tailwind.config.ts` and `src/index.css`, the App Fidelity Map, domain vocabulary,
  nine USPs with per-claim provenance, and the fixture dataset) and `screens/{00-signin,
  01-dashboard,02-corrective-maintenance,03-preventive-maintenance,04-reports}.png` — five real
  captures at 1440×900 @2×. All five are tagged `captured`; zero were reconstructed.
- **MILES** — `Project Management/MILES Marketing Content/marketing-pr/rsaf-vehicle-logbook/`, run
  against `https://github.com/raid-ppcoe/rsaf-vehicle-logbook`. Supplies `MARKETING_SPEC.md` only;
  its six captures are **not** used in this change.

The four MAVIS captures are the **reference** for the CSS screens. They are not themselves
published. Every asset number, defect, status, badge, date, count and label reproduced in the mocks
below is read off those four PNGs. Nothing is invented.

## Problem

Three defects in the same region of the page.

**One row is carrying two products.** `public/projects.html:1610-1622` is a single
`<details class="log-row" id="miles-mavis">` titled `MILES / MAVIS`, whose lead paragraph describes
a merged "platform". The two are separate products in separate repositories with separate design
systems, and neither codebase references the other:

| | MILES | MAVIS |
|---|---|---|
| Repo | `raid-ppcoe/rsaf-vehicle-logbook` | `raid-ppcoe/mavis-app` |
| What it is | Vehicle logbook — trips, inspections, fuel, GSE | Fleet maintenance — CM, PM, serviceability |
| Design system | self-described "MILES App Design System – Navy Blue + Teal" | own tokens, `#10407f` primary |
| Scale markers | 31 tables · 65 migrations · 136 RLS policies · 14 routes | 37 tables · 78 migrations · 5 edge functions |
| Captures on disk | 6 | 5 |

The pairing is real, but it is a *portfolio-level* narrative, and it is already told properly on the
Work page (`public/work.html:314-321`, "Two paired systems for the RSAF's Air Specialist Vehicle
fleet"). The merged row buys nothing and hides MAVIS's actual depth behind a shared summary.

**The entry has no screens,** despite four strong captures existing. Six entries on the page already
carry an `.app-shots` gallery, three of them (MatFlow, BOLDFACE, GRID) hand-written CSS.

**The `Built with` chips are wrong for the shipped products.** `PowerApps · Lovable · PowerDocu`
names the tooling and the prototype era, not the applications that exist now — React /
TypeScript / Vite / Tailwind / shadcn-ui on Supabase, in both repos. (No React major version is
stated in either `MARKETING_SPEC.md`, so none is claimed anywhere in this change.)

## Working-tree note

`public/projects.html` and `public/index.html` are both modified and uncommitted as of writing
(3,100+ lines in `projects.html`). Every line number in this spec refers to that **working-tree**
state, not to `HEAD`. Re-confirm the anchors before editing if the tree has moved on.

**Line numbers in this file are approximate — search for the anchor string instead.** `grep` and the
Read tool disagree by about six lines on `public/projects.html` (`MOCK_SEL` reports at `:2898` from
one and `:2904` from the other), which the file's CRLF line endings explain. Every location cited
here is also given as a quoted anchor string. **Trust the string, not the number.**

**The SOAR spec is written but not implemented.** `docs/superpowers/specs/2026-08-11-soar-duty-scheduler-screens-design.md`
(commits `237da6d`, `9a30d56`) specifies a `.soar-mock` family, but `MOCK_SEL` at
`public/projects.html:2898` is still `'.bf-mock, .mf-mock, .gr-mock'` and no `.soar-mock` rule
exists. `.mavis-mock` is therefore the **fifth** family by spec and the **fourth** by implementation.
Whichever lands second must re-read `MOCK_SEL` and the `.shot-lightbox-mockwrap` selector list
before editing them — both specs append to the same two lists, and both sets of line numbers will
have shifted.

## Decisions taken

| Decision | Choice | Why |
|---|---|---|
| Row structure | Two sibling rows, cross-linked, both deep-linking `/work#wp2` | Separate repos, separate products, separate design systems; the Work page already carries the pairing narrative |
| Screen medium | Hand-built CSS — a fifth mock family beside `.bf-mock`, `.mf-mock`, `.gr-mock` and the spec'd `.soar-mock` | Crisp at any zoom, no image weight, matches a pattern used three times on the page, and publishes no literal defence-app pixels |
| Existing mocks | untouched | `.mavis-mock` registers by **adding** to three lists (§6). No BOLDFACE, MatFlow or GRID rule, class or element changes |
| Palette | the app's **light** theme | All five captures are light — the app's rendered default. A dark mock beside light source screens would misrepresent the product |
| Screens built | 4 — dashboard, CM, PM, Reports | Sign-in is excluded: a login form demonstrates no capability, and the in-app `MAVIS` wordmark appears in the navbar of all four anyway |
| MILES screens | out of scope | Its six captures exist and can get a `.miles-mock` family in a follow-up. Keeping this to one family keeps it implementable, with `.soar-mock` already queued unbuilt |
| Category / org | unchanged — `data-cat="platform"`, `data-org="RAiD"` on both rows | Reclassification is a separate judgement, out of scope |
| `work.html` | untouched | Its `#wp2` case study is the author's own first-hand account and remains the single narrative home for the pairing |

## 1. Row structure (`public/projects.html:1610-1622`)

The one `<details>` becomes two, in this order, both immediately before the existing BOLDFACE row at
`:1624`. Both keep `data-org="RAiD" data-cat="platform"`, the `<span class="tag tag-indigo">Scaling</span>`
tag, the `<span class="lorg">RAiD</span>` org label and the chevron SVG, all copied verbatim from the
row being replaced.

| Order | `summary` title | `id` | Gallery |
|---|---|---|---|
| 1 | `Fleet Maintenance Management System (MAVIS)` | `mavis` | 4 screens |
| 2 | `Air Specialist Vehicle Logbook (MILES)` | `miles` | none |

Both titles follow the file's established `Descriptive Name (CODENAME)` style — cf.
`Aircraft Refuelling Strategy Planner (FUEL)`.

**The old anchor is preserved.** `id="miles-mavis"` is referenced from nowhere else in `public/`
(verified by grep across the directory), but an external or bookmarked `/projects#miles-mavis` must
still land somewhere sensible. The MAVIS row therefore carries **both**: `id="mavis"` on the
`<details>`, plus an empty `<span id="miles-mavis" aria-hidden="true"></span>` as its first child
inside `<summary>`, so the legacy fragment resolves to the top of the pair. Two `id` attributes
cannot sit on one element; this is the reason for the span rather than a second attribute.

**Neither row expands "MILES".** No expansion appears in the repository, its README, or its
`MARKETING_SPEC.md`, which titles it only "MILES · RSAF Vehicle Logbook". Inventing a backronym is
the exact failure mode this spec exists to avoid. The row title uses the descriptive name the spec
itself uses.

## 2. Row 1 — MAVIS copy

**Lead paragraph:**

> Tracks vehicle and ground-equipment serviceability across an air-force fleet. Availability is
> computed, not typed — derived live from three independent sources of unserviceability, mirroring
> the database rule so the dashboard and the store cannot disagree. Corrective and preventive work
> each run through their own approval chain, and what any one person sees is the intersection of
> vehicle category, base, department and sub-department.

**Cross-reference line**, immediately after the lead, as a `<p class="note">`:

> The maintenance half of the Air Specialist Vehicle platform. MILES, below, is the logbook half.

**`What it does`** — an `<ul class="feat" role="list">`, matching the structure the page's fuller
entries already use. Each item traces to a USP in `MARKETING_SPEC.md §5`:

- A defect walks `Waiting for assessment → Pending CEN Endorsement → Pending for Approval → Approved → Repair in progress → Ready for collection → Collected`, with `ADDL`, `ADDL Expired` and `Rejected` as branch states, and every transition gated by role *(USP 2)*
- Moving a scheduled PM date is not a free edit but an **LOS** — Latitude of Servicing — request that clears approval bands before the dashboard reflects it *(USP 3)*
- A defect can be formally deferred as an **ADDL**, which keeps the asset serviceable only until its expiry date, after which the asset flips itself to `ADDL Expired` *(USP 7)*
- Eleven built-in roles plus custom roles, resolved by a security-definer function server-side rather than trusted from the client *(USP 4)*
- Five Postgres realtime channels push changes to the dashboard, coalesced through a 150 ms per-table debounce so a burst write does not thrash the UI *(USP 6)*

**`What I learned`** — the existing entry has no such block, and none is invented. Omitted.

**`Built with`**, replacing `PowerApps · Lovable · PowerDocu`:

> The functions were proved in Power Apps first, then rebuilt as a full-stack application once
> per-user licensing stopped being viable for a user base that reached beyond the RSAF.

Chips: `React`, `TypeScript`, `Vite`, `Tailwind CSS`, `Supabase`, `Lovable`.

**Work-page link**, unchanged in form: `<a class="link-inline" href="/work#wp2">Full case study, on the Work page →</a>`.

### Domain vocabulary — use verbatim

From `MARKETING_SPEC.md §4`, which marks these "do not paraphrase into civilian terms": **CM**
(Corrective Maintenance), **PM** (Preventive Maintenance), **ADDL** (Acceptable Defect Deferred
Log), **LOS** (Latitude of Servicing), **Call-In**, **Serviceability**. Every one of these must be
expanded on first use in the row copy, because the projects page has a general reader.

## 3. Row 2 — MILES copy

**Lead paragraph:**

> The logbook side of the same fleet: a mobile-first record of vehicle movement and use, built for
> people standing on a flight line rather than sitting at a desk. A trip runs a full lifecycle
> behind an approval gate, and pre-use inspections feed the same serviceability picture the
> maintenance system works from.

**Cross-reference line**, as a `<p class="note">`:

> The logbook half of the Air Specialist Vehicle platform. MAVIS, above, is the maintenance half.

**`What it does`** — each item traces to a USP in the MILES `MARKETING_SPEC.md §5`:

- A trip walks `pending_approval → approved → ongoing → completed`, with `rejected` as a branch, and approvers can clear many at once rather than one at a time *(USP 1, 2)*
- Four roles — admin, facilitator, approver, driver — with more than one assignable to a person, enforced at three layers: route guards, 136 row-level-security policies over 31 tables, and per-request auth inside every edge function *(USP 3, 4)*
- Digital pre-use inspections, configurable per vehicle type *and* per model, whose outcome drives whether the vehicle reads as serviceable *(USP 7)*
- Fuel accounted end to end — bulk tanks to refueller payload holdings to POL top-ups to a summary report — with forklifts tracked by hour-meter and vehicles by odometer *(USP 6, 8)*
- Ground support equipment booked in and out of the same register as the vehicles, and every action written to an audit trail with actor, entity and timestamp *(USP 5, 9)*

**`Built with`** — the same paragraph as the MAVIS row, since the licensing decision drove both
rebuilds. Chips: `React`, `TypeScript`, `Vite`, `Tailwind CSS`, `Supabase`, `Lovable`.

**Work-page link:** identical `/work#wp2` link.

### Claims removed, and why

**"Per-person qualification records" and "qualification tracking as a first-class part of the
model"** are dropped from both rows. Neither repository has a qualification table, page, hook or
route — MAVIS has role and four-way access scoping, MILES has four-role RBAC. The claim is likely
true of the earlier Power Apps version, so it is **not** removed from `work.html:346`, where it sits
inside the author's own first-hand account. It is removed only from the projects rows, which now sit
directly above screenshots of the shipped products, where an unbacked claim would be checkable and
wrong.

### Claims that must not appear

Both prohibitions are explicit in both `MARKETING_SPEC.md` files:

1. **No adoption, user-count, fleet-size, uptime, time-saved or ROI figures.** Neither repository
   supports one. None may be inferred.
2. **The customer is not named**, despite both repos making the organisation identifiable. "RSAF"
   already appears elsewhere on this page in the author's own employment context and stays as-is;
   no *unit*, *base* or *squadron* is named in either row.

## 4. The `.mavis-mock` CSS system

A new scoped style block, placed after the existing `.gr-mock` block (which begins at
`public/projects.html:706`), following the recipe those blocks use: `mavis-` prefixed tokens, and
**every rule qualified with the `.mavis-mock` ancestor** so its specificity beats this page's own
descendant rules (`.log-body p` and friends) without any `!important`. It opens with the same
neutralising reset `.gr-mock` carries at `:718-720`, which resets `margin`, `font-size`,
`line-height`, `color`, `font-style`, `font-weight` and `text-decoration` on every inline and block
element the mock uses. No existing block is edited.

### Tokens

Lifted verbatim from `MARKETING_SPEC.md §3`, which read them out of `tailwind.config.ts` and
`src/index.css` and confirmed the two agree. The **light** (`:root`) set is used.

```
--mavis-bg:        #f8fafc   /* --background        210 20% 98% */
--mavis-card:      #ffffff   /* --card              0 0% 100%   */
--mavis-ink:       #1d232e   /* --foreground        215 25% 15% */
--mavis-primary:   #10407f   /* --primary           215 77% 28% */
--mavis-secondary: #e2e8f0   /* --secondary         214 32% 91% */
--mavis-muted:     #f1f5f9   /* --muted             210 20% 96% */
--mavis-fg-2:      #64748b   /* --muted-foreground  215 16% 47% */
--mavis-border:    #dae0e8   /* --border            214 32% 88% */
--mavis-ring:      #3b82f6   /* --ring              217 91% 60% */
--mavis-warning:   #f59e0b   /* --accent/--warning  38 92% 50%  */
--mavis-success:   #16a34a   /* --success           142 76% 36% */
--mavis-danger:    #ef4444   /* --destructive       0 84% 60%   */
```

Radius is the app's `--radius: 0.5rem` → 8px on cards at full authoring scale, with the `rounded-xl`
stat tiles at 12px and status badges as pills. Hairlines are 1px `--mavis-border`.

Badge fills are pastel-tint + saturated-text pairs, per `MARKETING_SPEC.md §6.4`. The tint ramp
(`#eff6ff/#1d4ed8` blue, `#ecfdf5/#047857` green, `#fffbeb/#b45309` amber, `#fef2f2/#b91c1c` red,
`#faf5ff/#7e22ce` purple) is the Tailwind 50/700 ramp the app's utility classes resolve to, and is
the same ramp `.gr-mock` already declares at `:710-713`.

Font stack is `ui-sans-serif, system-ui, sans-serif` — the app's own declared stack, verbatim
(`MARKETING_SPEC.md §3`: "the app already uses a system stack, so no substitution needed"). Mono is
`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`. **No font file is loaded**, preserving
the page's zero-external-request property.

### The brand mark

The app's in-app mark is plain text: the navbar renders `MAVIS` at `text-2xl font-bold
text-primary` (`MARKETING_SPEC.md §6.1`, citing `src/components/Navigation.tsx:99`). That is what
all four mocks show — a bold `#10407f` wordmark, nothing else.

The richer lockup (a 64px `--primary`-at-10% circle holding a lucide `settings` gear, with a 20px
green `check-circle` badge pinned top-right) exists **only on the sign-in screen**, which this
change does not build. It is therefore not drawn. No substitute glyph and no invented emblem
appears anywhere.

### The shared navbar

One markup block, reused across all four screens with only the active pill changing. Contents,
exactly as captured: the `MAVIS` wordmark; five nav pills — **Dashboard · Corrective Maintenance ·
Preventive Maintenance · Workshop Status · Reports** — each with its lucide glyph, the active one
solid `--mavis-primary` with white text and the rest `--mavis-fg-2`; then a right group of a `sun`
theme toggle, a `bell` carrying a red `2` badge, and a `user` glyph beside `Ops Duty Officer` over a
smaller `Admin`.

Icons are the app's own lucide-react glyphs inlined as SVG at 24×24 viewBox, `stroke-width: 2`,
round caps and joins — the treatment `MARKETING_SPEC.md §6.1` mandates ("never a generic gear or
tick"). Glyphs used: `layout-grid`, `file-text`, `calendar-check`, `wrench`, `bar-chart-3`, `sun`,
`bell`, `user`, `truck`, `check-circle`, `alert-triangle`, `calendar`, `filter`, `chevron-right`,
`chevron-down`, `eye`, `clipboard-check`, `info`, `settings`, `calendar-clock`, `calendar-x`,
`phone-call`, `circle-arrow-right`, `alert-circle`, `clock`, `shield`, `package`, `trending-up`,
`thumbs-down`, `file-up`.

### Sizing

Authored at a fixed **720px width** and a **natural, content-determined height**, scaled to the
existing 288px (18rem) `.app-shot-frame`:

```css
.app-shot-frame .mavis-mock{width:720px;transform:scale(.4);transform-origin:top left}
```

720 × .4 = 288, so nothing overflows sideways. This follows the `.mf-mock` / `.gr-mock` convention
(both 720 × .4, per the comments at `:488-493`) rather than BOLDFACE's older 480 × .6. 720px is half
the app's 1440px capture viewport, so proportions carry over directly from the source PNGs.

As `.mf-mock` and `.gr-mock` already record in their own comments, **the one liberty is
legibility**: text below roughly 7px stops rendering as text, so the smallest micro-labels sit
slightly above a strict proportional reduction.

**Height follows `.mf-mock`, not `.gr-mock`.** `.gr-mock` declares `height:450px` and curates its
content to fit; `.mf-mock` declares no height at all and lets `.app-shot-frame` (`aspect-ratio:8/5;
overflow:hidden`) crop it. `.mavis-mock` follows `.mf-mock`: no `height`, so each screen carries its
real content and the thumbnail shows the top 450px — the same "peek at the top of a taller screen"
crop a real screenshot in this frame gets, and exactly what the comment at `:483-486` describes.

**But the lightbox never scales below 1.** `fitMockScale` ends in
`scale = Math.max(1, scale)` (near `public/projects.html:2925`), so a mock taller than the available
dialog height renders at natural size and the body scrolls. On a 900px viewport the usable height is
roughly 700px. Each screen is therefore **budgeted to about 700px tall**, and where the source page
runs longer than that the screen stops at a section boundary rather than mid-card. The two places
this bites are recorded in §5.1 and §5.4.

A `@media (max-width:520px)` rule collapses the navbar to a wordmark plus an icon strip, drops the
dashboard's four stat tiles to two columns and the PM board's three Call-In cards to one, mirroring
the narrow-viewport rules the existing mock families carry at `:494-499`.

## 5. The four screens

Four `<figure class="app-shot" role="listitem" tabindex="0">` entries, each with an
`.app-shot-chrome` title bar, the `.mavis-mock` inside an `.app-shot-frame`, and an
`.app-shot-cap` figcaption. Each mock element is
`<div class="mavis-mock" data-mock-width="720" aria-hidden="true">`, matching how the five
`.mf-mock` elements are declared at `:1199`, `:1308`, `:1375`, `:1464`, `:1526`. The accessible
description lives in the figcaption and the gallery label.

### Observed inconsistency — reproduce it, do not correct it

The same defect status renders in **different colours on different screens**, and both renderings
are real:

| Status | On `01-dashboard.png` | On `02-corrective-maintenance.png` |
|---|---|---|
| Waiting for assessment | red tint, red text | amber tint, amber text, `clock` glyph |
| Ready for collection | green tint, green text | purple tint, purple text, `check-circle` glyph |

`MARKETING_SPEC.md §6.4` documents the dashboard's ramp (from `src/pages/Index.tsx:531-542`); the CM
page evidently resolves its own. Each mock reproduces **its own screen's** colours. Do not
harmonise them — the divergence is a property of the app, and smoothing it would make the mocks
less accurate, not more polished. Recorded here so a future reader does not "fix" it.

### 5.1 Fleet Overview — `screens/01-dashboard.png`

Navbar with **Dashboard** active. Page heading `Fleet Overview` over
`Monitor vehicle/equipment status, serviceability trends, and maintenance requirements.`

A four-tab strip — **Overview** (active, white pill on `--mavis-muted`) · Scheduled Maintenance ·
Maintenance History · ADDL. Beneath it, `Showing metrics for **all vehicle types** · **all
categories**` on the left, and two `filter`-glyphed selects on the right: `All Categories`,
`All Types`.

Four stat cards, each a white card with a pastel `rounded-xl` icon chip above a centred
`text-3xl` figure:

| Glyph | Value | Label | Note |
|---|---|---|---|
| `truck` (blue chip) | **48** | Total Assets | |
| `check-circle` (green chip) | **36** | Serviceable | `75.0% Availability` in green beneath |
| `alert-triangle` (amber chip) | **12** | Unserviceable | |
| `calendar` (blue chip) | **3** | Reported Today | |

`Reported Defects` card — subtitle `Recent issues requiring triage`, `View All` link right. Three
rows, each a tinted `alert-circle` glyph, a defect title, `Asset ID:` in bold, a status badge, and a
`chevron-right`:

| Glyph tint | Defect | Asset ID | Badge |
|---|---|---|---|
| red | Air brake pressure drops below threshold on hold | MID 4423 | red `Waiting for assessment` |
| amber | Hydraulic seep at tow-arm cylinder | AGE 1119 | orange `Pending CEN Endorsement` |
| green | Coolant temperature sensor intermittent | MID 4490 | green `Ready for collection`, plus an `eye`-glyphed `View Only` button before the chevron |

`Asset Status` card — subtitle `Monitor asset status…` with an `All Statuses` filter select. Three
asset rows, each a `truck` glyph, the asset ID in bold, a type pill, a status badge, then two lines
of `Dept:` / `Sub-Dept:` on the left and a right-aligned service line:

| Asset | Type pill | Badge | Dept / Sub-Dept | Right |
|---|---|---|---|---|
| AGE 1107 | Ground Power Unit | green `Serviceable` | Air Power Generation / Flightline Ops | Last Service: 2mo ago |
| AGE 1112 | Aircraft Tug | green `Serviceable` | Air Power Generation / Flightline Ops | Last Service: Yesterday |
| AGE 1119 | Air Start Unit | red `Defect` | Air Power Generation / Flightline Ops | Reported: Today |

`Corrective Maintenance Summary` card — subtitle `CM activity at a glance — vehicles/equipment
undergoing CM, ready for collection, and active ADDLs`, `View All` right. Three tiles on
`--mavis-muted`:

| Glyph | Value | Label | Caption |
|---|---|---|---|
| `wrench` (blue) | **3** | In Maintenance | Vehicles undergoing CM |
| `clipboard-check` (green) | **2** | Ready for Collection | Vehicles ready for collection after CM |
| `info` (cyan) | **2** | Active ADDL | Acceptable Defect Deferred Logs currently active |

**The screen stops here, at about 700px.** Three further blocks are visible in the capture and are
**not** built, for the height reason in §4: the `Preventive Maintenance Summary` (six tiles —
Upcoming PM 7, Overdue PM 2, Call-In 3, Handed Over 2, In Maintenance 2, Ready for Collection 1),
the amber `Pending Your Approval` card (`MID 4455` / `Alternator undercharging at idle` / `1 pending`),
and the page footer. The PM story is not lost — it has its own screen at §5.3. Recorded here so the
omission is a decision on the record, not an oversight, and so nobody later "completes" the screen
and silently pushes the lightbox into scrolling.

Caption: **Fleet Overview** — "Availability is computed from three independent unserviceability
sources, not typed in — so the dashboard and the database cannot disagree."

### 5.2 Corrective Maintenance — `screens/02-corrective-maintenance.png`

Navbar with **Corrective Maintenance** active. Heading `Corrective Maintenance` over `Manage and
track vehicle defects and repairs`, with a solid `--mavis-primary` **Create New Report** button
right. Section heading `Active Defect Reports`.

Three defect cards. Each: the asset ID as a large bold heading, a status badge beside it, a
right-aligned mono `ID: #REQ-2026-00n`; a `DEFECT DESCRIPTION` micro-label over the description
text, both behind a 3px `--mavis-primary` left rule; a `Location:` line; then a hairline divider
above a footer of `Reported: <date>` (`calendar` glyph) and a time (`clock` glyph).

| Asset | Badge | ID | Description | Location | Extra |
|---|---|---|---|---|---|
| MID 4423 | amber `Waiting for assessment`, `clock` glyph | #REQ-2026-001 | Air brake pressure drops below threshold on hold | Hangar 2 Apron | — |
| AGE 1119 | orange `Pending CEN Endorsement`, `alert-circle` glyph | #REQ-2026-002 | Hydraulic seep at tow-arm cylinder | Vehicle Park North | a `shield`-glyphed solid **Raise ADDL** button above the divider; a blue-outlined `Expected Recovery: 17 Aug 2026` chip right of the footer |
| MID 4490 | purple `Ready for collection`, `check-circle` glyph | #REQ-2026-003 | *(partially below the fold — see note)* | | |

All three carry `Reported: 11 Aug 2026` and `12:39 AM`.

**Third card, honest handling.** The capture is a top-of-page clip and cuts off inside the third
card, showing only its heading row, badge, ID and the start of its `DEFECT DESCRIPTION` label. The
mock reproduces exactly that much and lets the card run past the 450px edge, which is what a real
screenshot in this frame does. The defect text is **not** filled in from `MARKETING_SPEC.md §7` —
that table lists `MID 4490 / Coolant temperature sensor intermittent / Cooling / Ready for
collection`, which is almost certainly what the card says, but "almost certainly" is not "read off
the capture", and this spec's rule is the latter.

Caption: **Corrective Maintenance** — "Every defect is a seven-state approval chain, not a status
dropdown — and a deferred one (ADDL) carries its own expected-recovery date."

### 5.3 Preventive Maintenance — `screens/03-preventive-maintenance.png`

Navbar with **Preventive Maintenance** active. Heading `Preventive Maintenance` over `Track vehicle
handovers and scheduled maintenance`, with a `package`-glyphed solid **Handover Vehicle** button
right.

`Call-In` section header — `phone-call` glyph, heading, and a grey `3` count chip. Three cards in a
row, each with a 3px `--mavis-ring` top border: a `VEHICLE` micro-label, a blue `Awaiting Handover`
badge top-right, the asset ID as a bold heading, a `Dept · Type` line in `--mavis-fg-2`, a wrap of
outlined pills, then a `phone-call` `Called in:` line and a `calendar` `PM Due:` line ending in a
tinted chip:

| Asset | Dept · Type | Pills | Called in | PM Due |
|---|---|---|---|---|
| MID 4460 | Ground Logistics · Utility Truck | Vehicle, Base Bravo, C1 | 14 Aug 2026 (in 3 days) | green `03 Sep 2026 (in 24d)` |
| AGE 1151 | Ground Logistics · Ground Power Unit | Aviation Ground Equipment, Base Bravo, Monthly Inspection | 16 Aug 2026 (in 5 days) | amber `16 Aug 2026 (in 6d)` |
| MID 4514 | Ground Logistics · Utility Truck | Vehicle, Base Bravo, B | 18 Aug 2026 (in 7 days) | green `07 Sep 2026 (in 28d)` |

The amber chip on AGE 1151 against the two green ones is the point of the screen: the chip colour
encodes how close the due date is, so urgency is visible without reading a date.

`Handed Over` section header — `package` glyph and a `2` chip. Two cards with a 3px
`--mavis-warning` top border: an `ASSET` micro-label, an amber `Awaiting Start` badge, the asset ID,
a department line, a `Sub-Dept:` line, one PM-type pill, a `clock` `Handed over N days ago` line,
and a full-width `wrench`-glyphed solid **Start PM** button.

| Asset | Dept | Sub-Dept | Pill | Handed over |
|---|---|---|---|---|
| AGE 1170 | Engineering Support | Workshop Engineering | C1/TCP | 2 days ago |
| MID 4483 | Engineering Support | Workshop Engineering | C2/TA1 | 3 days ago |

Below that, the top edge of the next section — `file-up` glyph, `Pending Quotation Endorsement`,
`1` chip — running past the 450px boundary, as the capture shows.

**Note on `MID 4514`:** it appears in the capture but not in the 24 named assets of
`MARKETING_SPEC.md §7`. The capture is authoritative — §7 explicitly says the 24 named assets "carry
the story" while the fleet is 48, so `MID 4514` is one of the quiet filler assets that surfaced.
Recorded so it is not later "corrected" against the §7 list.

Caption: **Preventive Maintenance** — "A call-in summons a vehicle ahead of its service. Moving the
scheduled date is not a free edit — it is an LOS request that has to clear approval bands."

### 5.4 Reports — `screens/04-reports.png`

Navbar with **Reports** active. Heading `Reports` over `Defect trending and monthly fleet
availability analytics.`

A five-tab strip on `--mavis-muted`, each with its glyph: **Defect Trending** (active, white pill,
`trending-up`) · Rejection Rate (`thumbs-down`) · Fleet Availability (`bar-chart-3`) · Projection
(`calendar`) · Deployment (`truck`).

`Filters` card — `filter`-glyphed heading over five labelled controls in a row: `From`
`01 Jan 2026` and `To` `31 Aug 2026` (both `calendar`-glyphed inputs), then `Category`
`All categories`, `Type` `All types`, `Base / Camp` `All bases` (all three `chevron-down` selects).

Three wide stat cards, label above figure, centred: `Total defects in range` **12** ·
`Distinct subsystems` **7** · `Types affected` **6**.

`Defects per month, by type` card — subtitle `Stacked count of defects created each month, grouped
by type.` A stacked column chart on a `0 / 2 / 4 / 6 / 8` y-axis with dashed gridlines, x-axis
`Jan 2026` through `Aug 2026`. Six of the eight months are empty; two carry data:

| Month | Total | Stack, bottom to top |
|---|---|---|
| Jul 2026 | 4 | Aircraft Tug 1 · Ground Power Unit 1 · Prime Mover 2 |
| Aug 2026 | 8 | Air Start Unit 2 · Aircraft Tug 1 · Prime Mover 3 · Recovery Vehicle 1 · Refueller 1 |

Legend beneath, six swatch-and-label pairs in the chart's own colours: Air Start Unit `#1e3a8a`
navy · Aircraft Tug `#0ea5e9` · Ground Power Unit `#22c55e` · Prime Mover `#f59e0b` · Recovery
Vehicle `#8b5cf6` · Refueller `#ef4444`. Built as flex columns with percentage heights, not an SVG
chart — the technique `.gr-mock` already uses.

**The screen stops here, at about 700px.** Two half-width cards sit beneath in the capture and are
**not** built, for the height reason in §4: `Top subsystems` (horizontal navy bars — Bodywork 4,
Electrical 2, Steering 2, Braking 1, Hydraulics 1, Transmission 1, Cooling 1) and `By type`
(vertical `#0ea5e9` bars — Prime Mover 5, Air Start Unit 2, Aircraft Tug 2, Refueller 1, Recovery
Vehicle 1, Ground Power Unit 1). The stacked chart above already carries the analytics claim; these
two restate it in another form. Recorded for the same reason as §5.1.

Caption: **Reports** — "Defect trending, rejection rate, fleet availability and projection, read
from the same store the work is recorded in. Demonstration dataset — every asset number, defect,
date and person shown across these screens is fabricated."

That closing sentence is the gallery's single disclosure that the data is not operational, and it is
required. It sits on the last caption so it is the last thing read.

## 6. Gallery wrapper and lightbox registration

### Wrapper

Copied verbatim from the MatFlow gallery at `public/projects.html:1180-1198` — the nearest
precedent, being the other 720px mock family: `.log-shots-wrap` → `.shots-head` (holding the
`The actual screens` label and the hidden-until-needed prev/next `.shots-nav-group`) →
`.app-shots-wrap` → `.app-shots`.

Because the existing JS binds by `.log-shots-wrap` / `.app-shots` via `closest()`, the overflow
arrows, edge fade, horizontal scrolling and click/Enter/Space activation all work with no new
wiring.

Gallery `aria-label`: *"MAVIS app screens, rebuilt in HTML and CSS from the app's own interface
code, design tokens and captured screens — not photos, not invented."*

### Registration

**No BOLDFACE, MatFlow or GRID code, markup, class or rule is modified by this work.** `.mavis-mock`
joins by the route the page already provides. The lightbox was generalised when `.mf-mock` and
`.gr-mock` were added; as shipped today:

- `public/projects.html:2898` — `var MOCK_SEL = '.bf-mock, .mf-mock, .gr-mock';`, above the comment
  *"A new mock family only has to join this list."*
- `public/projects.html:2913` — `function mockWidth(mock) { return parseFloat(mock.getAttribute('data-mock-width')) || 480; }`

So the per-mock authoring width is already an element attribute and the selector is already a list.
Three additive edits register MAVIS:

1. `:2898` — `MOCK_SEL` becomes `'.bf-mock, .mf-mock, .gr-mock, .mavis-mock'`. Appended; the three
   existing entries untouched.
2. `:345-347` — the `.shot-lightbox-mockwrap` positioning rule gains a fourth selector line,
   `.shot-lightbox-mockwrap .mavis-mock`, alongside the existing three.
3. A new `.app-shot-frame .mavis-mock{width:720px;transform:scale(.4);transform-origin:top left}`
   rule is added beside the three at `:487-493`.

Every `.mavis-mock` element carries `data-mock-width="720"`, exactly as the five `.mf-mock` elements
do today.

Because all three edits are additions to lists, the existing families' thumbnail rendering and
lightbox behaviour cannot change — but verification step 4 re-tests them anyway.

## 7. Project count

The split takes the page from 29 rows to 30. Three occurrences of `29` are hardcoded and become
`30`:

| Line | Current | Becomes |
|---|---|---|
| `:1027` | `aria-label="All 29 projects, clearing both filters"` | `All 30 projects, clearing both filters` |
| `:1028` | `All <span class="pill-count">29</span>` | `<span class="pill-count">30</span>` |
| `:1112` | `<span class="num log-count" id="logCount" role="status">Showing all 29</span>` | `Showing all 30` |

`:2777-2778` already derives its text from `rows.length` and needs no edit. The category filter
pills carry no per-category counts, so `platform`'s move from 4 to 5 needs no other change — but
verification step 6 confirms this by reading the rendered pills rather than assuming it.

## Verification

1. The page loads with zero console messages, and no horizontal overflow at 1440×900 and 390×844
   (`documentElement.scrollWidth <= innerWidth`).
2. Both new rows render, open and close; `/projects#mavis`, `/projects#miles` and the legacy
   `/projects#miles-mavis` each scroll to the right place.
3. All four MAVIS figures render inside the 288px frame with no sideways overflow, and the gallery's
   prev/next arrows appear and function.
4. **Regression check on the existing mock families.** Clicking each of the four MAVIS screens opens
   the lightbox scaled to fit; so does each of the three BOLDFACE screens, each of the five MatFlow
   screens and each of the four GRID screens, at their own unchanged scales. A `git diff` on
   `public/projects.html` shows no `.bf-mock`, `.mf-mock` or `.gr-mock` line altered — only the
   three list additions in §6.
5. Keyboard: Tab reaches each figure, Enter and Space open it, Esc closes it, and focus returns to
   the trigger.
6. The reset pill reads `All 30`, its `aria-label` reads `All 30 projects`, the count reads
   `Showing all 30`, and filtering by `Scaling`/`RAiD` shows both new rows. The rendered category
   pills are read back to confirm none carries a stale count.
7. Each of the four mocks is compared side by side against its source PNG: every asset ID, defect,
   status badge and its colour, date, count, pill, chip, button label and section header matches —
   including the two per-screen colour divergences recorded in §5.
8. Neither row contains an adoption/fleet-size/ROI/time-saved figure, a qualification-tracking
   claim, or a named unit, base or squadron.
9. No new external request: the page still loads zero fonts, images or scripts from any external
   host.

## Out of scope

- The five PNG captures are not copied into `public/`. Nothing under `public/mavis/` is created.
- `public/index.html`, `public/work.html` and `public/experience.html` are untouched. In particular
  `work.html:346` keeps its qualification-tracking sentence.
- MILES gets **no** `.miles-mock` family and no screens in this change; its six captures remain
  unused.
- The sign-in screen and the app's full gear-and-check lockup are not built.
- The `Workshop Status` page — a fifth real screen in the app, uncaptured — is not built.
- The dark palette defined in the app's CSS is not built. Every capture is light.
- No other `.log-row` entry's copy, title, category or chips change.
- The `.bf-mock`, `.mf-mock` and `.gr-mock` style blocks, their elements and their sizing rules are
  not edited. `.mavis-mock` is additive throughout.
- The SOAR spec is neither implemented nor revised here, though whichever of the two lands second
  must re-read the two shared lists first (see *Working-tree note*).
- The uncommitted changes already sitting in `public/projects.html` and `public/index.html` are not
  reviewed, reverted or committed as part of this work.
