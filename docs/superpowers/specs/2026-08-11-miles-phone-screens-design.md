# MILES phone screens: a `.miles-mock` family and a portrait shot frame

**Date:** 2026-08-11
**Page:** `public/projects.html` only
**Branch:** `release/v3-primary`
**Status:** approved by the author, blocked on a dependency (§1)

Adds four hand-built CSS screens to the MILES project row, rebuilt from the app's own captures.
Registers a sixth mock family, `.miles-mock`, with the existing lightbox, and adds the page's
first portrait shot frame, because MILES is the first mobile app in the log.

---

## 1. Dependency: this is a follow-up, not a standalone change

`docs/superpowers/specs/2026-08-11-mavis-row-split-and-screens-design.md` (committed `e554e3c`,
still being edited at the time of writing) owns the surrounding change and **must land first**.
That spec splits the paired `MILES / MAVIS` row into two, writes both rows' copy, builds four
desktop MAVIS screens as a `.mavis-mock` family, and corrects the project count.

Its Decisions table reserves this work explicitly:

> **MILES screens | out of scope |** Its six captures exist and can get a `.miles-mock` family in
> a follow-up. Keeping this to one family keeps it implementable, with `.soar-mock` already
> queued unbuilt.

This spec is that follow-up. It takes the MILES row as that change leaves it and adds screens to
it. Nothing here edits row copy, chips, structure, ordering or counts.

**Sequencing rule.** Do not begin implementation until `.mavis-mock` is committed and the MILES
row exists as its own `<details>`. Then re-read `MOCK_SEL` and the `.shot-lightbox-mockwrap`
selector list before editing either, exactly as the MAVIS spec warns: `.soar-mock` is specified
in an earlier spec but not yet built, so the lists on disk are the only reliable record of what
is registered.

---

## 2. Handoff note: the project count is wrong in two places, not one

Recorded here because neither spec has the whole picture, and the MAVIS change is the one that
will touch it.

`public/projects.html` carries **six** hardcoded project counts in two families. The MAVIS spec §7
finds the first family. This work found the second. Both must be corrected together, or the page
ships stating two different totals.

| Line | String | Family | Found by |
|---|---|---|---|
| `:1031` | `aria-label="All 29 projects, clearing both filters"` | filter pill | MAVIS spec §7 |
| `:1032` | `All <span class="pill-count">29</span>` | filter pill | MAVIS spec §7 |
| `:1116` | `Showing all 29` | filter pill | MAVIS spec §7 |
| `:7` | `Twenty-seven projects, ...` (meta description) | prose | this spec |
| `:12` | `Twenty-seven projects, ...` (og:description) | prose | this spec |
| `:1015` | `Work across systems, software, and aerospace.` (`h1.page-title`) | prose | this spec |

The prose family is already wrong before either change: the log holds 29 rows today. After the
split it is 30. The three `29` strings become `30`; the three `Twenty-seven` strings become
`Thirty`.

Line numbers are as of commit `93c51bc` and will shift once the split lands. Match on the string,
not the line.

---

## 3. Source of record

`https://github.com/raid-ppcoe/MILES-Marketing-Content`, path
`marketing-pr/rsaf-vehicle-logbook/`. Analysed target commit `3e92a42` of
`raid-ppcoe/rsaf-vehicle-logbook`.

| Artefact | Use here |
|---|---|
| `MARKETING_SPEC.md` §2 | Theme tokens, header gradient, icon set, radius |
| `screens/home.png` `860x2924` | Screen 1, driver home |
| `screens/vehicles.png` `860x2862` | Screen 2, fleet register |
| `screens/approvals.png` `860x3264` | Screen 3, approval queue |
| `screens/admin.png` `860x2628` | Screen 4, admin dashboard |
| `screens/login.png`, `screens/logs.png` | Read, not used. Login is a sign-in form with little to show; logs is 5,964px tall |

All six are real captures of the running app at 430x932 CSS px, `deviceScaleFactor: 2`,
`reducedMotion: 'reduce'`, against mock fixtures with no backend reachable. Every PNG dimension
above is twice the CSS pixel size: `860` wide means `430` CSS px.

**Provenance rule.** Every string, number, badge colour, icon and layout decision below is read
off those PNGs or off `MARKETING_SPEC.md`. Nothing is authored. Where a detail is not legible in
the capture it is omitted rather than guessed.

**The captures are reference, not published output.** As with `.mavis-mock`, the PNGs are not
committed to this repository and no literal defence-app pixel is published. What ships is CSS.

**App UI strings keep their own punctuation verbatim**, including the em dashes in
`Apron 3 — Fuel Point B`, `Transit Camp — Personnel Move` and
`Locked — finish your ongoing trip first`. Those are the app's strings. The author's own prose,
including the four captions in §6, uses none.

---

## 4. Decisions taken

| # | Decision | Rationale |
|---|---|---|
| D1 | Family is named `.miles-mock`, not `.ml-mock` | The name the MAVIS spec reserves. Consistency across the six families beats brevity |
| D2 | Authored at the app's real 430px width and real type scale | The mock's geometry is then the app's geometry, not an approximation of it. It also makes the lightbox a phone at life size |
| D3 | Viewport is `430 x 860`, not the capture device's `430 x 932` | Reads as a slightly shorter phone. Nothing is distorted; the fold simply falls 72px higher. 860 also halves to a clean 430px thumbnail (§5.2) |
| D4 | Four screens: home, vehicles, approvals, admin | The four the MILES marketing page itself embeds. Login and logs are held in reserve for the reasons in §3 |
| D5 | Portrait frames via a new `.app-shot.is-phone` modifier | MILES is the first mobile app in the log and the shared frame is landscape. See §5.3 |
| D6 | No row copy, chips, structure or count changes | All owned by the MAVIS spec. See §1 |
| D7 | Light theme | Every capture is light, which is the app's rendered default. A dark mock beside light source screens would misrepresent the product. Same reasoning the MAVIS spec applies |

---

## 5. The `.miles-mock` CSS system

### 5.1 Tokens

From `MARKETING_SPEC.md` §2, light theme.

| Token | Hex | Role |
|---|---|---|
| `--miles-navy` | `#1B2A4B` | brand, header, primary buttons |
| `--miles-navy-2` | `#263A63` | header gradient end |
| `--miles-teal` | `#22C3C3` | accent, avatar, `Ongoing` pill, `facilitator` badge |
| `--miles-bg` | `#F8FAFB` | page |
| `--miles-card` | `#FFFFFF` | surfaces |
| `--miles-fg` | `#0F172A` | body text |
| `--miles-muted` | `#64748B` | secondary text |
| `--miles-line` | `#E2E8F0` | hairlines |
| `--miles-green` | `#16A34A` | `Serviceable`, `Approved`, `Full` |
| `--miles-amber` | `#F59E0B` | `Pending Approval`, `approver` badge |
| `--miles-red` | `#EF4444` | `Unserviceable`, `Cancel`, `Reject`, `admin` badge |
| `--miles-radius` | `12px` | the app's `0.75rem` |

Header gradient: `linear-gradient(135deg, #1B2A4B 0%, #263A63 100%)`, which
`MARKETING_SPEC.md:77-78` calls the app's single most recognisable visual element.

**Brand mark: omitted, deliberately.** `MARKETING_SPEC.md` §3a records that `miles-logo.png` is
not in the repository (it is a Lovable asset pointer that 404s off their CDN) and that
`favicon.ico` is the stock Lovable heart, not a MILES mark. The captures were taken with the
broken `<img>` hidden. The mocks therefore carry the `MILES APP` wordmark only, which is what the
app renders minus one decorative icon. No mark is invented.

**Structure.** A new scoped style block placed after the `.mavis-mock` block, with **every rule
qualified by the `.miles-mock` ancestor** so its specificity beats the page's own typography, and
opening with the same neutralising reset the other families carry. No existing block is edited.

**Icons** are lucide-react glyphs redrawn as inline SVG, matching the app's own imports recorded
in `MARKETING_SPEC.md` §3b: `Car`, `ClipboardCheck`, `CheckCircle`, `BarChart3`, `Fuel`,
`Droplets`, `ScrollText`, `PackageCheck`, `Home`, `FileText`, `Gauge`, `Route`, `Timer`, `User`,
`MapPin`, `Clock`, `Bell`, `Search`, `Calendar`, `Filter`, `Eye`, `Pencil`, `Trash2`, `Download`,
`Upload`, `Plus`, `ArrowLeft`, `ArrowRight`, `XCircle`, `ChevronDown`. No ad-hoc paths, no text
arrows.

### 5.2 Sizing

Half scale, which is already the house convention: `.mf-mock` and `.gr-mock` are authored at
720px and shown at 0.4, `.bf-mock` at 480px and shown at 0.6 into an 18rem card.

```css
.app-shot-frame .miles-mock{ width:430px; transform:scale(.5); transform-origin:top left; }
```

`430 x .5 = 215` and `860 x .5 = 430`, so the scaled mock fills a `215 x 430` frame exactly,
top-left anchored. No letterboxing, no centring maths, nothing overflows sideways.

Each mock element is `<div class="miles-mock" data-mock-width="430" aria-hidden="true">`, matching
how the other families declare themselves.

**Height is declared**, unlike `.mf-mock`. Each screen is a fixed `860px` box with
`overflow:hidden`, because a phone viewport is a fixed height and the fold position is part of
what the screen shows. Content is top-aligned and clipped at that fold, with the bottom navigation
pinned to the bottom edge, exactly as the app renders it.

### 5.3 The one genuinely new thing: portrait frames

`.app-shot-frame` is `aspect-ratio:8/5` landscape (`public/projects.html:309`) and `.app-shot` is
a fixed `18rem`. Both are correct for the five desktop families and wrong for a phone, which they
would letterbox to roughly a third of the frame's width.

```css
.app-shot.is-phone{ width:215px; }
.app-shot.is-phone .app-shot-frame{ aspect-ratio:auto; height:430px; }
.app-shot.is-phone .app-shot-dots{ display:none; }
```

Every rule is scoped to `.is-phone`, so no existing row moves by a pixel. The dark `#0f1c2e`
frame background is inherited unchanged and reads as the surround of a device.

`.app-shot-dots` is hidden because browser traffic lights on a mobile screen are a lie. The chrome
bar itself stays, since it carries the screen title and is the house pattern.

Narrow-viewport behaviour follows the rules the existing families carry at `:494-499`; check them
on disk after the MAVIS change lands, since `.mavis-mock` adds to that block.

### 5.4 Lightbox registration

Three lists, each **added to**, never rewritten. Read all three on disk first, because
`.mavis-mock` lands before this and `.soar-mock` is specified but unbuilt.

| # | Location | Change |
|---|---|---|
| I1 | `.shot-lightbox-mockwrap` selector list, near `:344` | Add `.shot-lightbox-mockwrap .miles-mock` |
| I2 | `var MOCK_SEL`, near `:2904` | Add `.miles-mock` |
| I3 | The mock scale rules, near `:486-492` | Add the `.app-shot-frame .miles-mock` rule from §5.2 |
| I4 | Each of the four figures | `data-mock-width="430"` |

`fitMockScale` clamps scale between 1 and 1.7, so a `430 x 860` mock opens at natural size on any
normal viewport, scrolling only slightly on a short window. That is the intended result: a phone
at life size.

---

## 6. The four screens

### 6.1 Shared shell

Present on all four.

- **Header**, navy gradient, no bottom radius. The `rounded-b-[2rem]` in `Login.tsx` is on the
  sign-in screen only and does not appear on any of these four.
  Top row: either the `MILES APP` wordmark (white, bold, roughly 24px, slight letter-spacing) or a
  back arrow on the approvals screen; then a bell glyph and a teal circular avatar reading `DT`.
  Second row: the page identity. Home shows `Welcome back,` in small white at 80% opacity above
  `Hello!, Daryl` in bold. The others show one bold title: `Vehicle Info`,
  `Insp / Detail Approval`, `Admin Dashboard`.
- **Bottom navigation**, white, hairline top border, pinned to the viewport bottom. Left: `Home`
  with a house glyph on a grey rounded-square active background. Right: `Detail Logs` with a file
  glyph. Centre: a red `#EF4444` circle raised above the bar carrying a white car glyph, its
  `End Detail` label clipped by the bar's bottom edge. Reproduce the clipping: it is what all four
  captures show.

### 6.2 Screen 1: Driver home

Route `/home`, from `home.png`.

- **Quick Tools**, section label, then eight white cards in a 4 x 2 grid, each a coloured circular
  icon above a centred two or three line label:

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
    `Transit Camp — Personnel Move` with a pin, `12 Aug, 08:30 am` with a clock. A full-width red
    outlined `Cancel Request` button. Then `TRP-2411-0093`.
- **Ongoing Detail**, white card, teal `Ongoing` pill top right. `MID 30412`, `HTF-20 Refueller`,
  `Apron 3 — Fuel Point B`, `07:45 am`. Divider, then `TRP-2411-0087` on the left with a red
  `Cancel` and a navy `End Detail` button on the right.
- `Unit's Recent Details` falls past the 860px fold and is not drawn.

Caption: **Driver home**. "Quick Tools, the driver's own trip requests, and the detail currently
running, all reachable with one thumb."

### 6.3 Screen 2: Fleet register

Route `/vehicles`, from `vehicles.png`.

- Search field, `Search vehicle number...`, with a magnifier.
- Two selects side by side, `All status` and `All fuel`.
- A filter glyph, an `All Types` select, and a `DI date` button with a calendar glyph.
- Vehicle cards, each with a grey rounded-square car tile, the MID in bold, the model beneath, a
  grey type chip and a plain unit code, a divider, then a fuel badge, a reading and a date.
  Serviceability pill top right.

  | MID | Model | Type / Unit | Fuel | Reading | Date | Status |
  |---|---|---|---|---|---|---|
  | 10233 | Toyota Hilux 4x4 | Utility Vehicle / AMS | `Full` green | 87610.4 km | DI: Never | Serviceable |
  | 21877 | MAN TGS 26.440 | Prime Mover / AMS | `1/2` amber | 132455 km | Inspection: 10 Aug 2026 | Serviceable |
  | 30412 | HTF-20 Refueller | Refueller / GSS | `3/4` green | 48213.6 km | Inspection: 11 Aug 2026 | Serviceable |
  | 30418 | HTF-20 Refueller | Refueller / GSS | `Full` green | 51902.1 km | DI: Never | Serviceable |
  | 44120 | Hyster H5.0FT | Forklift / AMTS | `1/4` orange | 0 km | Inspection: 10 Aug 2026 | **Unserviceable** |

  The fold falls inside card 5, so `MID 44120` shows its heading row and its red `Unserviceable`
  pill while the rest of the card is clipped. That is the real above-the-fold view, and it is what
  makes the status system visible on the thumbnail.

Caption: **Fleet register**. "Serviceability, fuel level, reading and inspection date for every
vehicle, with ground support equipment in the same register."

### 6.4 Screen 3: Approval queue

Route `/approvals`, from `approvals.png`. The header carries a back arrow instead of the wordmark.

- `INSPECTION APPROVALS` label, then an empty-state card, centred clipboard glyph over
  `No pending inspection approvals`.
- `TRIP APPROVALS` label, then a bulk bar: a circular checkbox, `Select all`, muted
  `0 of 3 selected`, and two disabled buttons, grey `Approve selected` and pale red `Reject`.
- Trip cards, white with a 4px amber left spine. Card one is drawn in full: circular checkbox with
  `Select for bulk action`; `TRP-2411-0095` in bold with an amber `Pending Approval` pill and a
  grey `Single Trip` chip beneath it; `MID 30418 - HTF-20 Refueller`; then `Rajesh Kumar`,
  `Apron 3 — Fuel Point C`, `Expected: 12 Aug 09:30` and `Starting: 51902.1`, each with its glyph;
  then a navy full-width `Approve` button beside a square red reject button.
- Card two, `TRP-2411-0094`, begins at the fold and is clipped.

Caption: **Approval queue**. "A trip cannot start until it is cleared, and a queue of them can be
cleared in one action."

### 6.5 Screen 4: Admin dashboard

Route `/admin`, from `admin.png`.

- A white tab strip of nine icon tabs, the first active as a white pill with a border and shadow.
  Order: users, bank, building, folder, tag, car, clipboard-check, fuel, package.
- `User Account Template` card, grey, `Download` button top right, then
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

Caption: **Admin dashboard**. "Four roles across nine admin surfaces, and one person can hold more
than one of them."

### 6.6 Gallery wrapper

The same wrapper the BOLDFACE, MatFlow, GRID and MAVIS rows use: a `.log-shots-wrap` with a
`.shots-head` carrying the `The actual screens` label and the prev/next buttons, then an
`.app-shots-wrap` and an `.app-shots` list. Each figure is
`<figure class="app-shot is-phone" role="listitem" tabindex="0">` with an `.app-shot-chrome` title
bar, the `.miles-mock` inside an `.app-shot-frame`, and an `.app-shot-cap` figcaption.

The list's `aria-label` states what these are, following the BOLDFACE precedent: MILES app screens,
rebuilt from the app's own interface code and design tokens, not photos and not invented.

---

## 7. Out of scope

- The row split, both rows' copy, chips, ordering and the `id="miles-mavis"` anchor. Owned by the
  MAVIS spec.
- The project count. Recorded in §2 as a handoff, corrected by the MAVIS change.
- `public/work.html`, `public/index.html`, `public/experience.html`.
- `.mavis-mock`, `.soar-mock`, `.bf-mock`, `.mf-mock`, `.gr-mock`. Untouched.
- The `login.png` and `logs.png` screens.
- Re-categorising MILES from `platform` to `enterprise`. Considered and rejected on the author's
  ruling: it is still scaling, not enterprise yet.

---

## 8. Verification

1. The MILES row contains exactly four `.app-shot.is-phone` figures, each holding one
   `.miles-mock` with `data-mock-width="430"`.
2. `.miles-mock` appears in the `.shot-lightbox-mockwrap` selector list, in `MOCK_SEL`, and in one
   `.app-shot-frame` scale rule.
3. `MOCK_SEL` still contains every family it contained before this change. Diff it, do not retype
   it.
4. No `.bf-mock`, `.mf-mock`, `.gr-mock` or `.mavis-mock` rule, class or element is altered.
   `git diff` touches only added lines outside the `.miles-mock` block and the three registration
   lists.
5. The MAVIS row's own screens still render, and its thumbnails are unchanged in size. The
   `.is-phone` rules must not reach them.
6. Every string in the four mocks is present in the corresponding PNG. Check the em dashes inside
   app strings survived, and that no em dash appears in the four captions.
7. Opened in a browser at desktop width: the four thumbnails render as phones on the dark frame,
   the strip scrolls horizontally, the prev/next buttons enable, and each opens in the lightbox at
   `430px` natural width.
8. Opened at 400px viewport width: the strip still scrolls and no thumbnail overflows the card.
9. Both count families read the same total (§2).
