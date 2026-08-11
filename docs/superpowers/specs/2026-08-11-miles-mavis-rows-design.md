# MILES and MAVIS project rows, with CSS-built app screens

**Date:** 2026-08-11
**Page:** `public/projects.html`
**Branch:** `release/v3-primary`
**Status:** approved by the author, ready for planning

---

## 1. Why this change

The project log carries one combined row, `MILES / MAVIS` (`public/projects.html:1623`). Two
problems with it:

1. It is a bare codename pair. The project taxonomy
   (`docs/superpowers/specs/2026-08-08-project-taxonomy-design.md` §4) requires a public
   descriptor with the codename demoted into brackets, the shape already used by
   `Aircraft Refuelling Strategy Planner (FUEL)` and `Supply & Demand Logistics Pipeline (MatFlow)`.
2. MILES and MAVIS are two apps. MAVIS is standalone; it belongs to the same solution as MILES
   but is not part of the MILES codebase.

Separately, the row has no imagery, which
`docs/redesign-v2-outstanding-work.md` records as the single highest-value gap on the featured
work.

Source material for MILES now exists and is verified, so the row can carry real screens.

---

## 2. Source of record

`https://github.com/raid-ppcoe/MILES-Marketing-Content`, path
`marketing-pr/rsaf-vehicle-logbook/`. Analysed target commit `3e92a42` of
`raid-ppcoe/rsaf-vehicle-logbook`.

| Artefact | Use here |
|---|---|
| `MARKETING_SPEC.md` | Theme tokens, USPs with per-path provenance, scale markers, real tech stack |
| `screens/home.png` `860x2924` | Driver home, source for screen 1 |
| `screens/vehicles.png` `860x2862` | Fleet register, source for screen 2 |
| `screens/approvals.png` `860x3264` | Approval queue, source for screen 3 |
| `screens/admin.png` `860x2628` | Admin dashboard, source for screen 4 |
| `screens/login.png`, `screens/logs.png` | Read, not used. Login is a sign-in form with little to show; logs is 5,964px tall |

All six PNGs are real captures of the running app at 430x932 CSS px, `deviceScaleFactor: 2`,
`reducedMotion: 'reduce'`, against mock fixtures with no backend reachable. Every PNG dimension
above is therefore twice the CSS pixel size: `860` wide means `430` CSS px.

**Provenance rule for this work.** Every string, number, badge colour, icon and layout decision in
the four screens is read off those PNGs or off `MARKETING_SPEC.md`. Nothing is authored. Where a
detail is not legible in the capture it is omitted rather than guessed.

---

## 3. Decisions taken

| # | Decision | Rationale |
|---|---|---|
| D1 | Split into two rows | The author's choice. Two apps, two rows |
| D2 | Both rows link to the same case study, `/work#wp2` | The author's choice. The case-study prose covers both together and has six open author-copy slots; splitting it is a separate job |
| D3 | `work.html` is not edited | Follows from D2 |
| D4 | MAVIS gets prose only, no screens | No MAVIS source exists. Building screens would mean inventing them, which the author explicitly ruled out |
| D5 | No MAVIS repo is sought this round | The author's choice: leave MAVIS alone for now |
| D6 | Both rows keep `data-cat="platform"` (Scaling systems) | The author's ruling: MILES has not reached enterprise yet, it is still scaling. The `enterprise` category was considered and rejected on that ground |
| D7 | The `Built with` chips change to the shipped stack | The current chips describe the Power Apps prototype, not what runs. See §7 |
| D8 | The page's project count is corrected to thirty | It reads "Twenty-seven" against 29 rows today, before this change adds one. See §8 |

---

## 4. Row 1: Vehicle Logbook (MILES)

Replaces the existing `#miles-mavis` row in place, at the same position in the log.

```
<details class="log-row" id="miles" data-org="RAiD" data-cat="platform">
  <summary>
    <span class="lt">Vehicle Logbook (MILES)</span>
    <span class="tag tag-indigo">Scaling</span><span class="lorg">RAiD</span>
    <svg class="chev" ...>
  </summary>
```

**Intro paragraph.** The logbook half of the existing row copy, which stays true to the app:
usage records for Air Specialist Vehicles were spread across manual steps with no single record
of who was qualified for what. The platform pulls those workflows into one place, as structured
automation over centralised data.

**What it does.** A `ul.feat` list, following the BOLDFACE row's pattern. Every item is traceable
to a USP in `MARKETING_SPEC.md` §5 and to a path in the target repo:

| Item | USP |
|---|---|
| A trip cannot start until it is cleared: `pending_approval` to `approved` to `ongoing` to `completed`, plus `rejected` | 1 |
| Bulk approvals: select many trips and clear or reject them in one action | 2 |
| Four roles, `admin`, `facilitator`, `approver` and `driver`, with one person able to hold several | 3 |
| Access enforced three times over: at the route, in the database under row-level security, and again inside every server function | 4 |
| Vehicles and ground support equipment book in and out of the same register | 5 |
| Pre-use inspections whose outcome sets fleet serviceability, so a failed vehicle is unbookable at once | 7 |
| Fuel accounted end to end, from bulk tank to refueller payload to a top-up on one named trip | 8 |
| Every action logged with actor, entity and timestamp | 9 |

**Scale.** A closing `<p class="note">` inside the same `What it does` block, carrying the
verified markers: 31 tables, 136 row-level security policies, 65 migrations, 14 routes, roughly
17,200 lines of application TypeScript, 5 server functions. No adoption, time-saved or ROI figure
appears, because the repository supports none.

**Built with.** The Power Apps to full-stack story stays in the prose, because it is the
strongest thing in the row and the case study leans on it. The chips describe what shipped.

Chips, nine: `React` `TypeScript` `Vite` `Tailwind CSS` `shadcn/ui` `Supabase` `PowerApps`
`Lovable` `PowerDocu`

The last three stay because they are true of how it was built, not of what it runs on.
TanStack Query and framer-motion are verified but omitted, to keep the chip row the length of
every other row's.

**Screens.** Four, per §6.

**Link.** `<a class="link-inline" href="/work#wp2">Full case study, on the Work page</a>`

**Anchor note.** The current `id="miles-mavis"` is not linked from anywhere in `public/`
(checked). Renaming it to `id="miles"` breaks no inbound link.

---

## 5. Row 2: Maintenance & Servicing System (MAVIS)

New row, placed directly after MILES.

```
<details class="log-row" id="mavis" data-org="RAiD" data-cat="platform">
  <summary>
    <span class="lt">Maintenance &amp; Servicing System (MAVIS)</span>
    <span class="tag tag-indigo">Scaling</span><span class="lorg">RAiD</span>
```

**Body.** The maintenance sentence already published on `public/work.html:317`, reused verbatim:
the maintenance system, planning preventive servicing, tracking corrective work on defective
vehicles, and giving the people who own a fleet one view of its serviceability and its defect
trends.

Plus one line of relationship: a standalone app that shares the MILES solution and reads the same
fleet records, so a vehicle marked unserviceable in one is unserviceable in the other.

**No `What it does` list, no `Built with` chips, no scale markers, no screens.** Nothing about
MAVIS is verified against a repository, so nothing beyond the sentence the author has already
published is claimed.

**Link.** Same `/work#wp2`.

---

## 6. The four screens

### 6.1 Fidelity contract

Each screen is a `430 x 860` phone viewport. `430` is the app's real width; `860` is slightly
shorter than the `932` capture device, which reads simply as a shorter phone. Content is
top-aligned and clipped at the fold, with the fixed bottom navigation pinned to the bottom edge,
exactly as the app renders it.

Type sizes, spacings and radii are authored at the app's own scale rather than shrunk, so the
mock's geometry is the app's geometry. The thumbnail scales the whole block down with a CSS
transform; the lightbox opens it at natural size, where it is a phone at life size.

**App UI strings keep their own punctuation verbatim**, including the em dashes in
`Apron 3 — Fuel Point B`, `Transit Camp — Personnel Move` and
`Locked — finish your ongoing trip first`. Those are the app's strings, not the author's prose.
The author's own copy in these rows and captions uses no em dashes.

### 6.2 Theme tokens

From `MARKETING_SPEC.md` §2, light theme, which is what every capture shows.

| Token | Hex | Role |
|---|---|---|
| `--ml-navy` | `#1B2A4B` | brand, header, primary buttons |
| `--ml-navy-2` | `#263A63` | header gradient end |
| `--ml-teal` | `#22C3C3` | accent, avatar, Ongoing pill, facilitator badge |
| `--ml-bg` | `#F8FAFB` | page |
| `--ml-card` | `#FFFFFF` | surfaces |
| `--ml-fg` | `#0F172A` | body text |
| `--ml-muted` | `#64748B` | secondary text |
| `--ml-line` | `#E2E8F0` | hairlines |
| `--ml-green` | `#16A34A` | Serviceable, Approved, Full |
| `--ml-amber` | `#F59E0B` | Pending Approval, approver badge |
| `--ml-red` | `#EF4444` | Unserviceable, Cancel, Reject, admin badge |
| `--ml-radius` | `12px` | the app's `0.75rem` |

Header gradient: `linear-gradient(135deg, #1B2A4B 0%, #263A63 100%)`, the app's single most
recognisable element.

Icons are lucide-react glyphs redrawn as inline SVG, matching the app's own imports: `Car`,
`ClipboardCheck`, `CheckCircle`, `BarChart3`, `Fuel`, `Droplets`, `ScrollText`, `PackageCheck`,
`Home`, `FileText`, `Gauge`, `Route`, `Timer`, `User`, `MapPin`, `Clock`, `Bell`, `Search`,
`Calendar`, `Filter`, `Eye`, `Pencil`, `Trash2`, `Download`, `Upload`, `Plus`, `ArrowLeft`,
`ArrowRight`, `XCircle`, `ChevronDown`. No ad-hoc paths, no text arrows.

### 6.3 Shared shell

Present on all four.

- **Header**, navy gradient, no bottom radius. Top row: either the `MILES APP` wordmark (white,
  bold, roughly 24px, slight letter-spacing) or a back arrow on the approvals screen; then a bell
  icon and a teal circular avatar reading `DT`, both white.
  Second row: the page identity. Home shows `Welcome back,` in small white at 80% opacity above
  `Hello!, Daryl` in bold. The others show a single bold title: `Vehicle Info`,
  `Insp / Detail Approval`, `Admin Dashboard`.
- **Bottom navigation**, white, hairline top border, pinned. Left: `Home` with a house glyph on a
  grey rounded-square active background. Right: `Detail Logs` with a file glyph. Centre: a red
  `#EF4444` circle raised above the bar carrying a white car glyph, with its `End Detail` label
  clipped by the bar's bottom edge, which is what the captures show.

### 6.4 Screen 1: Driver home

Route `/home`, from `home.png`.

- **Quick Tools**, section label, then eight white cards in a 4 x 2 grid, each a coloured
  circular icon above a centred two or three line label:

  | Label | Circle | Glyph |
  |---|---|---|
  | Vehicle Info | `#16294A` | Car |
  | Vehicle Inspection | `#22C3C3` | ClipboardCheck |
  | Insp / Detail Approval | `#16A34A` | CheckCircle |
  | Summary Report | `#16A34A` | BarChart3 |
  | Ground Fuel Top-Up | `#F97316` | Fuel |
  | Refueller Fuel Stock Update | `#0EA5E9` | Droplets |
  | Refueller Fuel Stock Log | `#6366F1` | ScrollText |
  | GSE Booking In/Out | `#F59E0B` | PackageCheck |

- **My Trip Requests**, a white card holding two grey sub-cards:
  - `MID 10233`, `Toyota Hilux 4x4`, green `Approved` pill, mint-tinted car tile.
    Italic muted `Locked — finish your ongoing trip first.` Then `2 destinations` with a chevron,
    then `TRP-2411-0091`.
  - `MID 55901`, `Mercedes-Benz OC500`, amber `Pending Approval` pill, amber-tinted car tile.
    `Transit Camp — Personnel Move` with a pin, `12 Aug, 08:30 am` with a clock. A full-width
    red outlined `Cancel Request` button. Then `TRP-2411-0093`.
- **Ongoing Detail**, white card, teal `Ongoing` pill top right. `MID 30412`, `HTF-20 Refueller`,
  `Apron 3 — Fuel Point B`, `07:45 am`. Divider, then `TRP-2411-0087` on the left with a red
  `Cancel` and a navy `End Detail` button on the right.
- **Unit's Recent Details** falls below the 860px fold and is not drawn.

Caption: *Driver home*. "Quick Tools, the driver's own trip requests and the detail currently
running, all reachable with one thumb."

### 6.5 Screen 2: Fleet register

Route `/vehicles`, from `vehicles.png`.

- Search field, `Search vehicle number...` with a magnifier.
- Two selects side by side, `All status` and `All fuel`.
- A filter glyph, an `All Types` select and a `DI date` button with a calendar glyph.
- Vehicle cards, each with a grey rounded-square car tile, the MID in bold, the model beneath, a
  grey type chip and a plain unit code, a divider, then a fuel badge, an odometer reading and a
  DI or inspection date. Serviceability pill top right.

  | MID | Model | Type / Unit | Fuel | Reading | Date | Status |
  |---|---|---|---|---|---|---|
  | 10233 | Toyota Hilux 4x4 | Utility Vehicle / AMS | `Full` green | 87610.4 km | DI: Never | Serviceable |
  | 21877 | MAN TGS 26.440 | Prime Mover / AMS | `1/2` amber | 132455 km | Inspection: 10 Aug 2026 | Serviceable |
  | 30412 | HTF-20 Refueller | Refueller / GSS | `3/4` green | 48213.6 km | Inspection: 11 Aug 2026 | Serviceable |
  | 30418 | HTF-20 Refueller | Refueller / GSS | `Full` green | 51902.1 km | DI: Never | Serviceable |
  | 44120 | Hyster H5.0FT | Forklift / AMTS | `1/4` orange | 0 km | Inspection: 10 Aug 2026 | **Unserviceable** |

  The fold falls inside card 5, so `MID 44120` shows its heading row and its red `Unserviceable`
  pill while the rest of the card is clipped. That is the real above-the-fold view and it is what
  makes the status system visible.

Caption: *Fleet register*. "Serviceability, fuel level, odometer and inspection date for every
vehicle, with ground support equipment in the same register."

### 6.6 Screen 3: Approval queue

Route `/approvals`, from `approvals.png`. Header carries a back arrow instead of the wordmark.

- `INSPECTION APPROVALS` label, then an empty-state card, centred clipboard glyph over
  `No pending inspection approvals`.
- `TRIP APPROVALS` label, then a bulk bar: a circular checkbox, `Select all`, muted
  `0 of 3 selected`, and two disabled buttons, grey `Approve selected` and pale red `Reject`.
- Trip cards, white with a 4px amber left spine. Card one is drawn in full:
  circular checkbox with `Select for bulk action`; `TRP-2411-0095` in bold with an amber
  `Pending Approval` pill and a grey `Single Trip` chip beneath it; `MID 30418 - HTF-20 Refueller`;
  then `Rajesh Kumar`, `Apron 3 — Fuel Point C`, `Expected: 12 Aug 09:30`, `Starting: 51902.1`,
  each with its glyph; then a navy full-width `Approve` button beside a square red reject button.
- Card two, `TRP-2411-0094`, begins at the fold and is clipped.

Caption: *Approval queue*. "A trip cannot start until it is cleared, and a queue of them can be
cleared in one action."

### 6.7 Screen 4: Admin dashboard

Route `/admin`, from `admin.png`.

- A white tab strip of nine icon tabs, the first active as a white pill with a border and shadow.
  Order: users, bank, building, folder, tag, car, clipboard-check, fuel, package.
- `User Account Template` card, grey, with a `Download` button top right, then
  `Download a CSV template to prepare user accounts for bulk import.` and the smaller roles note
  beneath it.
- A navy full-width `Add User` button, then a white outlined `Bulk Import Users` button.
- `Sort by` with a `Name (A-Z)` select.
- User cards, each with the name in bold, the squadron muted beneath, role pills, and eye, pencil
  and red trash actions on the right:

  | Name | Squadron | Pills |
  |---|---|---|
  | Daryl Tan | Ground Support Squadron | red `admin`, navy `driver`, outlined `2 categories` |
  | Jason Ong | Air Movement Squadron | teal `facilitator` |
  | Nurul Iman | Ground Support Squadron | amber `approver` |

  `Rajesh Kumar` and `Wei Ming Lim`, both `driver`, fall past the fold. All four role colours are
  visible above it.

Caption: *Admin dashboard*. "Four roles across nine admin surfaces, and one person can hold more
than one of them."

---

## 7. CSS and JavaScript integration

A new mock family, `.ml-mock`, joining `.bf-mock`, `.mf-mock` and `.gr-mock`. The existing
lightbox machinery is designed for this; the comment at `public/projects.html:2901` says a new
family only has to join the list.

| # | Location | Change |
|---|---|---|
| I1 | `:344-346` | Add `.shot-lightbox-mockwrap .ml-mock` to the absolute-positioning selector list |
| I2 | `:2904` | Add `.ml-mock` to `var MOCK_SEL` |
| I3 | new rule near `:486-492` | `.app-shot-frame .ml-mock{ width:430px; transform:scale(.5); transform-origin:top left }` |
| I4 | each figure | `data-mock-width="430"` on the `.ml-mock` element |
| I5 | new CSS block | The `.ml-mock` family itself, every rule qualified by the `.ml-mock` ancestor so its specificity beats the page, matching how `.bf-mock` is written |

### 7.1 The one genuinely new thing: portrait frames

MILES is the first mobile app in the log. The shared frame is `aspect-ratio:8/5` landscape
(`:309`) and `.app-shot` is a fixed `18rem` wide (`:292`), which would letterbox a phone badly.

A new `.app-shot.is-phone` modifier. The numbers fall out cleanly at exactly half scale, which is
already the house convention: `.mf-mock` and `.gr-mock` are authored at 720px and shown at 0.4,
and a `430 x 860` phone at 0.5 is a `215 x 430` thumbnail.

```css
.app-shot.is-phone{ width:215px; }
.app-shot.is-phone .app-shot-frame{ aspect-ratio:auto; height:430px; }
.app-shot.is-phone .app-shot-dots{ display:none; }
.app-shot-frame .ml-mock{ width:430px; transform:scale(.5); transform-origin:top left; }
```

The scaled mock fills the frame exactly, top-left anchored, the same way `.bf-mock` does at
`480px x 0.6 = 288px` against its `18rem` card. No letterboxing and no centring maths.
`.app-shot-dots` is hidden because browser traffic lights on a mobile screen are a lie; the chrome
bar itself stays, since it carries the screen title and is the house pattern.

Every rule is scoped to `.is-phone`. No existing row moves by a pixel.

### 7.2 Lightbox behaviour

`fitMockScale` clamps scale to at least 1 and at most 1.7. A `430 x 860` mock therefore opens at
natural size on any normal viewport, scrolling only slightly if the window is short. That is the
intended result: a phone at life size.

---

## 8. Project count correction

`public/projects.html` states "Twenty-seven" in three places while the log holds 29 rows. Adding
MAVIS makes 30.

| Line | Current | Becomes |
|---|---|---|
| `:7` meta description | `Twenty-seven projects, ...` | `Thirty projects, ...` |
| `:12` og:description | `Twenty-seven projects, ...` | `Thirty projects, ...` |
| `:1010` `h1.page-title` | `Twenty-seven, filterable two ways.` | `Thirty, filterable two ways.` |

Verification is a count of `class="log-row"` in the file, which must read 30 afterwards.

---

## 9. Out of scope

- `public/work.html`. One case study, unchanged, still `#wp2`.
- `public/index.html`. Its featured slide still reads `MILES / MAVIS`, which remains accurate as
  a solution name.
- The six open author-copy slots in the `wp2` case study.
- Any MAVIS screen, screenshot, feature list, stack or metric.
- Re-categorising MILES from `platform` to `enterprise`. Considered and rejected: it is still
  scaling, not enterprise yet.
- The `login.png` and `logs.png` screens.

---

## 10. Verification

1. `class="log-row"` appears 30 times.
2. `Twenty-seven` appears zero times in `public/`.
3. `miles-mavis` appears zero times; `id="miles"` and `id="mavis"` each appear once.
4. Both new rows contain `href="/work#wp2"`.
5. `.ml-mock` appears in the lightbox selector list, in `MOCK_SEL`, and in a
   `.app-shot-frame` scale rule.
6. Four `.ml-mock` figures exist, each with `data-mock-width="430"`.
7. The MAVIS row contains no `.app-shot`, no `chips`, and no `feat` list.
8. Opened in a browser: the four thumbnails render as phones on the dark frame, the row scrolls
   horizontally, each opens in the lightbox at natural size, and the other rows' screens are
   unchanged.
9. Every string in the four mocks is present in the corresponding PNG.

---

## 11. Known gap carried forward

MAVIS is published with one sentence and no evidence. When a MAVIS repository or marketing
content set exists, the row is ready to receive a `What it does` list, a `Built with` block and
its own screens by the same recipe. That is the follow-up.
