# MILES Phone Screens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the MILES row on `public/projects.html` four hand-built CSS screens, rebuilt from the app's own captures, shown as phones rather than the landscape frames every other row uses.

**Architecture:** A sixth mock family, `.miles-mock`, authored at the app's real `430 x 932` device viewport, added after the `.mavis-mock` block and scoped so every rule carries the `.miles-mock` ancestor. A new `.app-shot.is-phone` modifier turns the shared landscape shot frame portrait for this row only. The existing shared lightbox picks the family up through three additive registration lists plus one new opt-in attribute, `data-mock-minscale`, which lets a mock taller than the dialog scale down to fit instead of forcing the body to scroll.

**Tech Stack:** Static HTML + CSS in a single page file. Playwright (already in `node_modules`) for the verification harness, following `scripts/verify-mavis.mjs` and `scripts/verify-soar.mjs`.

## Global Constraints

- **Source of record.** `raid-ppcoe/MILES-Marketing-Content`, path `marketing-pr/rsaf-vehicle-logbook/`. Design spec: `docs/superpowers/specs/2026-08-11-miles-phone-screens-design.md`.
- **Nothing is authored.** Every string, number, badge colour, icon and layout decision is read off `screens/{home,vehicles,approvals,admin}.png` or off `MARKETING_SPEC.md`. Where a detail is not legible in the capture it is omitted, never guessed.
- **The captures are reference, not output.** No PNG is committed to this repository. Only CSS ships.
- **App UI strings keep their own punctuation verbatim**, including the em dashes in `Apron 3 — Fuel Point B`, `Transit Camp — Personnel Move`, `Ammo Dump — Escort Run`, `Apron 3 — Fuel Point C` and `Locked — finish your ongoing trip first.` The author's own prose, which is the four captions only, uses no em dash.
- **No metrics.** No adoption, fleet-size, uptime, time-saved or ROI figure appears anywhere. Neither repository supports one.
- **The customer unit, base or squadron is never named.** Squadron names that appear inside a mock (`Ground Support Squadron`, `Air Movement Squadron`) are the app's own mock-fixture data, visible in the capture, and are reproduced as data, not as a claim about a customer.
- **Brand mark omitted deliberately.** `miles-logo.png` is a Lovable asset pointer that 404s and `favicon.ico` is the stock Lovable heart. The captures were taken with the broken `<img>` hidden. The mocks carry the `MILES APP` wordmark only. No mark is invented.
- **Nothing outside the MILES row changes.** No `.bf-mock`, `.mf-mock`, `.gr-mock`, `.soar-mock` or `.mavis-mock` rule, class or element is altered, and no row copy, chip, category or ordering is touched. The two exceptions are named explicitly in Task 6.
- **Every new CSS rule is qualified by `.miles-mock`** (or `.app-shot.is-phone`), so its specificity beats the page's own descendant rules such as `.log-body p`.
- **Icons are lucide-react glyphs redrawn as inline SVG**, matching the app's own imports in `MARKETING_SPEC.md` §3b. No ad-hoc paths, no text arrows.

---

## Corrections to the design spec

The design spec was written before the captures were measured band by band. Three of its statements are wrong and this plan supersedes them. Task 7 writes the corrections back into the spec.

| Spec | Said | Truth from the captures |
|---|---|---|
| D3 / §5.2 | Viewport `430 x 860`, "reads as a slightly shorter phone" | Viewport is `430 x 932`, the real capture device. 860 invents a device that does not exist, and the instruction was to use the exact screen. `932 x .5 = 466`, still a clean half-scale thumbnail, and `430/932 = 0.461` is a real phone's proportion where `0.5` is a stubby one |
| §6.2 | The Ongoing Detail card is drawn; `Unit's Recent Details` falls past the fold | The **Ongoing Detail card** falls past the fold. Its heading starts at device y≈1740 and content is only visible to y=1728. Home shows header, Quick Tools and My Trip Requests |
| §6.3 | The fold falls inside card 5, showing `MID 44120`'s red `Unserviceable` pill | The fold falls inside **card 4** (`MID 30418`), cutting at its divider. `MID 44120` and the only `Unserviceable` pill are below the fold and are not drawn |

### How the fold was measured

Every capture is `860` device px wide at `deviceScaleFactor: 2`, so **device px / 2 = CSS px**. The app's bottom navigation is `position:fixed`, confirmed by the band of page padding above it in each full-page capture. So on the real device:

- viewport is `932` CSS px tall = `1864` device px
- the nav occupies the bottom `68` CSS px = `136` device px
- **content is visible from device y=0 to y=1728**, and anything below that is behind the nav

Every "clipped at" note in Task 2 through Task 5 is that y=1728 line.

---

## File Structure

| File | Responsibility |
|---|---|
| `public/projects.html` | Modified. One new scoped `.miles-mock` style block, three one-line registration edits, one `fitMockScale` edit, one `.app-shot.is-phone` block, and one `.log-shots-wrap` gallery inside the existing `<details id="miles">` |
| `scripts/verify-miles.mjs` | Created. Playwright harness asserting the family renders, registers, fits, and reproduces the captured content |
| `docs/superpowers/specs/2026-08-11-miles-phone-screens-design.md` | Modified in Task 7 only, to carry the three corrections above |

---

## Task 1: Registration, frame, and the shared shell

Everything the four screens sit inside, plus the harness that proves it. No screen content yet.

**Files:**
- Modify: `public/projects.html`
- Create: `scripts/verify-miles.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: the CSS classes every later task uses — `.miles-mock`, `.miles-head`, `.miles-wordmark`, `.miles-bell`, `.miles-avatar`, `.miles-back`, `.miles-eyebrow`, `.miles-title`, `.miles-body`, `.miles-nav`, `.miles-nav-item`, `.miles-fab`; the `.app-shot.is-phone` modifier; and the `data-mock-minscale` attribute contract on `fitMockScale`.

- [ ] **Step 1: Add `.miles-mock` to the three registration lists**

Read all three on disk first and **add to** them, never retype them.

`.shot-lightbox-mockwrap` selector list — change the last selector's terminator and append:

```css
.shot-lightbox-mockwrap .soar-mock,
.shot-lightbox-mockwrap .mavis-mock,
.shot-lightbox-mockwrap .miles-mock{ position:absolute; top:0; left:0; transform-origin:top left; }
```

`MOCK_SEL`, and the comment above it that enumerates the families:

```js
  // Hand-built screen mocks (.bf-mock, .mf-mock, .gr-mock, .soar-mock,
  // .mavis-mock, .miles-mock) each have a fixed authoring width, declared on
  // the element as data-mock-width and defaulting to 480. A new mock family
  // only has to join this list.
  var MOCK_SEL = '.bf-mock, .mf-mock, .gr-mock, .soar-mock, .mavis-mock, .miles-mock';
```

The `.app-shot-frame` scale rules, appended after the `.mavis-mock` one:

```css
.app-shot-frame .miles-mock{width:430px;transform:scale(.5);transform-origin:top left}
```

- [ ] **Step 2: Teach `fitMockScale` an opt-in floor**

The existing floor is a hard `Math.max(1, scale)`, which is right for a landscape mock that is wider than it is tall. A `430 x 932` phone is taller than the dialog body on an ordinary laptop, so that floor would force the body to scroll and cut the phone in half. Give the floor an opt-in override instead of changing it for everyone. Replace the single `scale = Math.max(1, scale);` line with:

```js
    // Never shrink a mock below its natural size by default — the body
    // scrolls if it still doesn't fit. A mock TALLER than the dialog (a
    // phone) opts out with data-mock-minscale, so it fits whole instead of
    // being cut in half. Landscape families carry no attribute and are
    // unaffected.
    var floor = parseFloat(mock.getAttribute('data-mock-minscale'));
    if (!(floor > 0)) floor = 1;
    scale = Math.max(floor, scale);
```

- [ ] **Step 3: Add the portrait frame modifier**

Place it immediately after the `.app-shot-frame .miles-mock` rule from Step 1.

```css
/* Portrait shot frames — MILES is the first mobile app in the log, and the
   shared .app-shot-frame is aspect-ratio:8/5 landscape, which would
   letterbox a phone to about a third of the frame's width. Every rule here
   is scoped to .is-phone, so no existing row moves by a pixel.
   430 x .5 = 215 and 932 x .5 = 466, so the scaled mock fills the frame
   exactly, top-left anchored: no letterboxing, no centring maths, nothing
   overflowing sideways. The dark frame background is inherited unchanged and
   reads as the surround of a device. The chrome bar stays because it carries
   the screen title, but its traffic lights are hidden — browser dots on a
   mobile screen are a lie. */
.app-shot.is-phone{ width:215px; }
.app-shot.is-phone .app-shot-frame{ aspect-ratio:auto; height:466px; }
.app-shot.is-phone .app-shot-dots{ display:none; }
```

- [ ] **Step 4: Add the `.miles-mock` token block, reset and shared shell**

Place the whole block immediately after the last `.mavis-mock` rule, which is the comment ending `…(verify group 11) already confirms this holds. */`. Tokens are from `MARKETING_SPEC.md` §2, light theme, `miles-` prefixed.

```css
/* ── MILES phone screen mockups ───────────────────────────────────────
   The sixth hand-built family on this page and the first PHONE one, so
   it is also the only one that uses the .app-shot.is-phone frame above.
   Same recipe as .mavis-mock: rebuilt in HTML/CSS from the app's own
   design tokens and four of its captured screens, never a photo and
   never invented. Source: raid-ppcoe/MILES-Marketing-Content,
   marketing-pr/rsaf-vehicle-logbook/MARKETING_SPEC.md (§2 theme tokens,
   §3b lucide icon set) plus screens/{home,vehicles,approvals,admin}.png.

   Authored at 430 x 932, which is the app's REAL device viewport: every
   capture is 860 device px wide at deviceScaleFactor 2, so device px / 2
   is CSS px. Each screen is therefore a fixed 932px box with the header
   at the top, the content clipped where the real fold clips it, and the
   bottom navigation pinned to the bottom edge because the app's own nav
   is position:fixed. Content is visible to CSS y=864 (device 1728); the
   nav owns the last 68px. Where a card is cut by that line it is drawn
   cut, because that is what the app shows.

   The brand mark is omitted deliberately: MARKETING_SPEC.md §3a records
   that miles-logo.png is a Lovable asset pointer that 404s off their CDN
   and favicon.ico is the stock Lovable heart, so the captures were taken
   with the broken <img> hidden. These mocks carry the MILES APP wordmark
   only, which is what the app renders minus one decorative icon.

   Every rule is qualified with the .miles-mock ancestor so it outranks
   this page's own descendant rules (.log-body p and friends). Unlike the
   landscape families this one declares a height, because a phone
   viewport IS a fixed height and the fold position is part of what the
   screen shows. It also carries data-mock-minscale in the markup, so the
   lightbox may scale it DOWN to fit the dialog rather than cut a 932px
   phone in half. */
.miles-mock{
  --miles-navy:#1b2a4b; --miles-navy-2:#263a63; --miles-teal:#22c3c3;
  --miles-bg:#f8fafb; --miles-card:#ffffff; --miles-fg:#0f172a;
  --miles-muted:#64748b; --miles-line:#e2e8f0; --miles-sunken:#f1f5f9;
  --miles-green:#16a34a; --miles-amber:#f59e0b; --miles-red:#ef4444;
  --miles-r:12px;
  position:relative; width:430px; height:932px; overflow:hidden;
  background:var(--miles-bg); color:var(--miles-fg);
  font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
  font-size:13px; line-height:1.35;
}
.miles-mock p,.miles-mock b,.miles-mock span,.miles-mock div,.miles-mock h1,.miles-mock h2{margin:0;font-size:inherit;line-height:inherit;color:inherit;font-weight:inherit}
.miles-mock svg{display:block;flex-shrink:0}

/* Header — navy gradient, no bottom radius. The rounded-b-[2rem] in
   Login.tsx is on the sign-in screen only and appears on none of these
   four. MARKETING_SPEC.md:77-78 calls this gradient the app's single
   most recognisable visual element. */
.miles-mock .miles-head{background:linear-gradient(135deg,var(--miles-navy) 0%,var(--miles-navy-2) 100%);padding:22px 16px 18px;color:#fff}
.miles-mock .miles-head-top{display:flex;align-items:center;gap:14px}
.miles-mock .miles-wordmark{font-size:24px;font-weight:800;letter-spacing:.01em}
.miles-mock .miles-back{margin-right:auto}
.miles-mock .miles-bell{margin-left:auto;opacity:.95}
.miles-mock .miles-back + .miles-bell{margin-left:0}
.miles-mock .miles-avatar{width:36px;height:36px;border-radius:50%;background:var(--miles-teal);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;letter-spacing:.02em}
.miles-mock .miles-eyebrow{margin-top:16px;font-size:15px;color:rgba(255,255,255,.8)}
.miles-mock .miles-title{font-size:22px;font-weight:700;margin-top:2px}
.miles-mock .miles-head-top + .miles-title{margin-top:18px}

/* Scrolling body. Clipped by the family's own overflow:hidden at the
   real fold; the nav below floats over its last 68px. */
.miles-mock .miles-body{padding:16px}

/* Bottom navigation — white, hairline top border, pinned. The centre FAB
   is raised above the bar and its End Detail label is CLIPPED by the
   bar's bottom edge. Reproduce the clipping: it is what all four
   captures show. */
.miles-mock .miles-nav{position:absolute;left:0;right:0;bottom:0;height:68px;background:var(--miles-card);border-top:1px solid var(--miles-line);display:flex;align-items:center;justify-content:space-between;padding:0 34px}
.miles-mock .miles-nav-item{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:14px;font-weight:600;color:var(--miles-navy)}
.miles-mock .miles-nav-item .miles-nav-ico{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center}
.miles-mock .miles-nav-item.miles-on .miles-nav-ico{background:var(--miles-sunken)}
.miles-mock .miles-fab-wrap{position:absolute;left:50%;bottom:0;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:4px;overflow:hidden;height:73px}
.miles-mock .miles-fab{width:61px;height:61px;border-radius:50%;background:var(--miles-red);color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.miles-mock .miles-fab-l{font-size:14px;font-weight:700;color:var(--miles-navy);white-space:nowrap}
```

- [ ] **Step 5: Add the gallery wrapper with no figures yet**

Inside `<details class="log-row" id="miles">`, immediately after the `Built with` block and **before** the `Full case study, on the Work page →` paragraph, matching where every other row puts it. Copy the `.shots-head` and nav-button markup verbatim from the BOLDFACE row so the shared JS finds what it expects.

```html
          <div class="log-shots-wrap">
            <div class="shots-head">
              <div class="lab">The actual screens</div>
              <div class="shots-nav-group" hidden>
                <button type="button" class="shots-nav" data-shots-prev aria-label="Scroll screens left" disabled>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <button type="button" class="shots-nav" data-shots-next aria-label="Scroll screens right">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </div>
            </div>
            <div class="app-shots-wrap">
            <div class="app-shots" role="list" aria-label="MILES app screens, rebuilt from the app's own interface code and design tokens, not photos and not invented">
            </div>
            </div>
          </div>
```

- [ ] **Step 6: Write `scripts/verify-miles.mjs`**

Model it on `scripts/verify-mavis.mjs`: same `pass`/`fail` counters, same `file://` load of `public/projects.html`, same final `N/N checks passed` line and non-zero exit on failure. This task's groups:

1. `.miles-mock` appears in the `.shot-lightbox-mockwrap` rule, in `MOCK_SEL`, and in exactly one `.app-shot-frame` scale rule (assert against the page source text).
2. `MOCK_SEL` still names all six families, `.bf-mock` through `.miles-mock`.
3. `.app-shot.is-phone` computed styles: width `215px`, frame height `466px`, `.app-shot-dots` `display:none`.
4. Regression: a `.mavis-mock` figure's `.app-shot` is still `288px` wide and its frame still reports an 8:5 box. The `.is-phone` rules must not reach it.
5. Every `.miles-mock` is `430 x 932` and carries `data-mock-width="430"` and `data-mock-minscale`.

- [ ] **Step 7: Run it and confirm groups 1 to 4 pass and group 5 finds nothing yet**

```bash
node scripts/verify-miles.mjs
```

Expected: groups 1 to 4 PASS; group 5 reports zero `.miles-mock` elements, which is correct at this point. Also run `node scripts/verify-mavis.mjs` and `node scripts/verify-soar.mjs` and confirm `92/92` and `78/78` still pass.

- [ ] **Step 8: Commit**

```bash
git add public/projects.html scripts/verify-miles.mjs
git commit -m "Register the .miles-mock family and the portrait shot frame"
```

---

## Task 2: Screen 1, Driver home

**Files:**
- Modify: `public/projects.html`

**Interfaces:**
- Consumes: the shell classes from Task 1.
- Produces: `.miles-tools`, `.miles-tool`, `.miles-tool-ico`, `.miles-sec`, `.miles-card`, `.miles-sub`, `.miles-mid`, `.miles-model`, `.miles-pill`, `.miles-tile`, `.miles-meta`, `.miles-btn`, used again by Tasks 3 to 5.

Route `/home`, from `screens/home.png` (`860 x 2924`).

**Header:** wordmark, bell, teal `DT` avatar; then `Welcome back,` as the eyebrow and `Hello!, Daryl` as the title. This is the only screen with a two-line header.

**Quick Tools:** the section label `Quick Tools`, then eight white cards in a 4 x 2 grid, each a coloured circular icon over a centred label that wraps to two or three lines. Card `91px` wide, `12px` gap, `12px` radius; circle `48px`; label `13px`.

| Label | Circle | lucide glyph |
|---|---|---|
| Vehicle Info | `#16294a` | Car |
| Vehicle Inspection | `#22c3c3` | ClipboardCheck |
| Insp / Detail Approval | `#16a34a` | CheckCircle |
| Summary Report | `#16a34a` | BarChart3 |
| Ground Fuel Top-Up | `#f97316` | Fuel |
| Refueller Fuel Stock Update | `#0ea5e9` | Droplets |
| Refueller Fuel Stock Log | `#6366f1` | ScrollText |
| GSE Booking In/Out | `#f59e0b` | PackageCheck |

**My Trip Requests:** a white card holding the muted bold label `My Trip Requests` and two sunken sub-cards.

- Sub-card 1: mint-tinted rounded car tile, `MID 10233` bold, `Toyota Hilux 4x4` muted, green `Approved` pill on the right. Then italic muted `Locked — finish your ongoing trip first.` Then `2 destinations` with a ChevronDown on the right, then `TRP-2411-0091` muted.
- Sub-card 2: amber-tinted car tile, `MID 55901` bold, `Mercedes-Benz OC500` muted, amber `Pending Approval` pill. Then `Transit Camp — Personnel Move` with a MapPin and `12 Aug, 08:30 am` with a Clock on one row. Then a full-width red-outlined `Cancel Request` button with an X glyph. Then `TRP-2411-0093` muted.

**Below the fold, not drawn:** the `Ongoing Detail` card and `Unit's Recent Details`. The My Trip Requests card ends at CSS y≈810 and the nav starts at 864.

**Bottom nav:** `Home` active (house glyph on the sunken rounded square) on the left, `Detail Logs` with a FileText glyph on the right, red FAB with a Car glyph in the centre, its `End Detail` label clipped.

- [ ] **Step 1: Add the screen-1 CSS**

```css
/* Screen 1 — driver home */
.miles-mock .miles-sec{font-size:16px;font-weight:600;color:var(--miles-muted);margin-bottom:12px}
.miles-mock .miles-tools{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.miles-mock .miles-tool{background:var(--miles-card);border-radius:var(--miles-r);padding:14px 6px 12px;display:flex;flex-direction:column;align-items:center;gap:10px;box-shadow:0 1px 2px rgba(15,23,42,.05)}
.miles-mock .miles-tool-ico{width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff}
.miles-mock .miles-tool-l{font-size:13px;font-weight:600;text-align:center;line-height:1.25}
.miles-mock .miles-card{background:var(--miles-card);border-radius:16px;padding:16px;margin-top:20px;box-shadow:0 1px 2px rgba(15,23,42,.05)}
.miles-mock .miles-sub{background:var(--miles-sunken);border-radius:var(--miles-r);padding:12px;margin-top:12px}
.miles-mock .miles-row{display:flex;align-items:flex-start;gap:12px}
.miles-mock .miles-tile{width:29px;height:28px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.miles-mock .miles-mid{font-size:17px;font-weight:700}
.miles-mock .miles-model{font-size:15px;color:var(--miles-muted)}
.miles-mock .miles-pill{margin-left:auto;border-radius:999px;padding:4px 12px;font-size:13px;font-weight:700;color:#fff;white-space:nowrap}
.miles-mock .miles-pill-green{background:var(--miles-green)}
.miles-mock .miles-pill-amber{background:var(--miles-amber)}
.miles-mock .miles-pill-teal{background:var(--miles-teal)}
.miles-mock .miles-locked{font-size:14px;font-style:italic;color:var(--miles-muted);margin-top:10px}
.miles-mock .miles-meta{display:flex;align-items:center;gap:7px;font-size:14px;color:var(--miles-muted);margin-top:10px}
.miles-mock .miles-meta-2{display:flex;align-items:center;gap:18px;margin-top:10px}
.miles-mock .miles-meta-2 .miles-meta{margin-top:0}
.miles-mock .miles-ref{font-size:14px;color:var(--miles-muted);margin-top:8px}
.miles-mock .miles-chevrow{display:flex;align-items:center;justify-content:space-between;color:var(--miles-muted);font-size:14px;margin-top:10px}
.miles-mock .miles-btn{display:flex;align-items:center;justify-content:center;gap:10px;border-radius:var(--miles-r);font-size:15px;font-weight:600;padding:11px 0;margin-top:10px}
.miles-mock .miles-btn-cancel{border:1px solid var(--miles-red);color:var(--miles-red)}
```

- [ ] **Step 2: Add the figure**

Inside the `.app-shots` list from Task 1. The chrome title is `MILES · Driver home`.

```html
              <figure class="app-shot is-phone" role="listitem" tabindex="0">
                <div class="app-shot-chrome"><span class="app-shot-dots"><span></span><span></span><span></span></span><span class="app-shot-title">MILES · Driver home</span></div>
                <div class="app-shot-frame">
                  <div class="miles-mock" data-mock-width="430" data-mock-minscale=".6" aria-hidden="true">
                    <!-- header, .miles-body with Quick Tools and My Trip Requests, .miles-nav -->
                  </div>
                </div>
                <figcaption class="app-shot-cap">
                  <div class="st">Driver home</div>
                  <div class="sd">Quick Tools, and the driver's own trip requests, all reachable with one thumb.</div>
                </figcaption>
              </figure>
```

- [ ] **Step 3: Extend `verify-miles.mjs` with the screen-1 assertions**

Assert, inside the first `.miles-mock`: the wordmark reads `MILES APP`; the eyebrow reads `Welcome back,` and the title `Hello!, Daryl`; there are exactly 8 `.miles-tool` cards whose labels match the table above in order; the eight `.miles-tool-ico` background colours match the table; both `MID` values and both `TRP-` references are present; `Locked — finish your ongoing trip first.` is present with its em dash intact; the nav has `Home` and `Detail Logs` and one `.miles-fab`; and no element in the mock has a bottom beyond 932.

- [ ] **Step 4: Run it**

```bash
node scripts/verify-miles.mjs
```

Expected: all groups PASS.

- [ ] **Step 5: Commit**

```bash
git add public/projects.html scripts/verify-miles.mjs
git commit -m "Add the MILES driver home screen"
```

---

## Task 3: Screen 2, Fleet register

**Files:**
- Modify: `public/projects.html`

**Interfaces:**
- Consumes: everything from Tasks 1 and 2.
- Produces: `.miles-search`, `.miles-select`, `.miles-vcard`, `.miles-chip`, `.miles-fuel`, `.miles-div`.

Route `/vehicles`, from `screens/vehicles.png` (`860 x 2862`). Header is the wordmark row plus the single bold title `Vehicle Info`.

**Filters:** a full-width search field reading `Search vehicle number...` with a Search glyph; then two selects side by side, `All status` and `All fuel`, each with a ChevronDown; then a row of a Filter glyph, an `All Types` select and a `DI date` button with a Calendar glyph and muted placeholder text.

**Vehicle cards:** white, `16px` radius. Each has a grey rounded-square car tile on the left (`66px`), then the MID bold, the model muted, a grey type chip and a plain unit code; a hairline divider; then a Fuel glyph, the fuel badge, the reading, and a Calendar glyph with the date. The serviceability pill sits top right.

| MID | Model | Type chip | Unit | Fuel badge | Reading | Date | Status |
|---|---|---|---|---|---|---|---|
| 10233 | Toyota Hilux 4x4 | Utility Vehicle | AMS | `Full` green | 87610.4 km | DI: Never | Serviceable |
| 21877 | MAN TGS 26.440 | Prime Mover | AMS | `1/2` amber | 132455 km | Inspection: 10 Aug 2026 | Serviceable |
| 30412 | HTF-20 Refueller | Refueller | GSS | `3/4` green | 48213.6 km | Inspection: 11 Aug 2026 | Serviceable |
| 30418 | HTF-20 Refueller | Refueller | GSS | — clipped — | — clipped — | — clipped — | Serviceable |

Card 4 is cut by the fold at CSS y=864, just below its `Refueller` / `GSS` row and above its divider. Draw it cut. `MID 44120`, the forklift with the only red `Unserviceable` pill, is below the fold and is not drawn.

- [ ] **Step 1: Add the screen-2 CSS**

```css
/* Screen 2 — fleet register */
.miles-mock .miles-search{display:flex;align-items:center;gap:12px;background:var(--miles-card);border:1px solid var(--miles-line);border-radius:var(--miles-r);padding:13px 16px;font-size:16px;color:var(--miles-muted)}
.miles-mock .miles-frow{display:flex;align-items:center;gap:12px;margin-top:12px}
.miles-mock .miles-select{flex:1;display:flex;align-items:center;justify-content:space-between;gap:8px;background:var(--miles-card);border:1px solid var(--miles-line);border-radius:var(--miles-r);padding:12px 14px;font-size:15px;color:var(--miles-fg)}
.miles-mock .miles-select.miles-ph{color:var(--miles-muted)}
.miles-mock .miles-select-l{display:flex;align-items:center;gap:10px;min-width:0}
.miles-mock .miles-vcard{background:var(--miles-card);border-radius:16px;padding:14px;margin-top:14px;box-shadow:0 1px 2px rgba(15,23,42,.05)}
.miles-mock .miles-vtile{width:66px;height:66px;border-radius:14px;background:var(--miles-sunken);color:var(--miles-navy);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.miles-mock .miles-chip{background:var(--miles-sunken);border-radius:8px;padding:4px 10px;font-size:14px;color:var(--miles-muted)}
.miles-mock .miles-chiprow{display:flex;align-items:center;gap:14px;margin-top:8px;font-size:14px;color:var(--miles-muted)}
.miles-mock .miles-div{height:1px;background:var(--miles-line);margin:12px 0 10px}
.miles-mock .miles-fuelrow{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:14px;color:var(--miles-muted)}
.miles-mock .miles-fuel{border-radius:999px;padding:3px 12px;font-size:14px;font-weight:700;color:#fff}
.miles-mock .miles-fuel-green{background:var(--miles-green)}
.miles-mock .miles-fuel-amber{background:var(--miles-amber)}
```

- [ ] **Step 2: Add the figure**

Chrome title `MILES · Fleet register`. Caption:

```html
                <figcaption class="app-shot-cap">
                  <div class="st">Fleet register</div>
                  <div class="sd">Serviceability, fuel level, reading and inspection date for every vehicle, with ground support equipment in the same register.</div>
                </figcaption>
```

- [ ] **Step 3: Extend `verify-miles.mjs`**

Assert the title is `Vehicle Info`; the search placeholder text is `Search vehicle number...`; the three filter controls read `All status`, `All fuel`, `All Types`, `DI date`; the four MIDs appear in the table's order; the three fuel badges read `Full`, `1/2`, `3/4` with the first and third green and the second amber; `Unserviceable` and `44120` do **not** appear; and nothing overflows 430 x 932.

- [ ] **Step 4: Run it**

```bash
node scripts/verify-miles.mjs
```

- [ ] **Step 5: Commit**

```bash
git add public/projects.html scripts/verify-miles.mjs
git commit -m "Add the MILES fleet register screen"
```

---

## Task 4: Screen 3, Approval queue

**Files:**
- Modify: `public/projects.html`

**Interfaces:**
- Consumes: Tasks 1 to 3.
- Produces: `.miles-lab`, `.miles-empty`, `.miles-bulk`, `.miles-check`, `.miles-tcard`, `.miles-btn-approve`, `.miles-btn-x`.

Route `/approvals`, from `screens/approvals.png` (`860 x 3264`). The header carries an **ArrowLeft** where the other screens carry the wordmark, then the bell and the `DT` avatar, then the title `Insp / Detail Approval`.

- `INSPECTION APPROVALS` in small caps-styled label type, then an empty-state card: a centred ClipboardCheck glyph over `No pending inspection approvals`.
- `TRIP APPROVALS`, then a bulk bar: a circular checkbox, `Select all`, muted `0 of 3 selected`, and two disabled buttons on a second line, grey `Approve selected` with a CheckCircle and pale red `Reject` with an XCircle.
- Trip card 1, white with a 4px amber left spine: circular checkbox with `Select for bulk action`; `TRP-2411-0095` bold with an amber `Pending Approval` pill and a grey `Single Trip` chip beneath it; `MID 30418 - HTF-20 Refueller` muted; then `Rajesh Kumar` with a User glyph, `Apron 3 — Fuel Point C` with a MapPin, `Expected: 12 Aug 09:30` with a Clock and `Starting: 51902.1` with a Gauge; then a navy full-width `Approve` button beside a square red reject button.
- Trip card 2, same shell: checkbox, `TRP-2411-0094`, amber `Pending Approval`, `Single Trip`, `MID 21877 - MAN TGS 26.440`, `Wei Ming Lim`. Cut by the fold immediately below that name, above `Ammo Dump — Escort Run`. Draw it cut.

- [ ] **Step 1: Add the screen-3 CSS**

```css
/* Screen 3 — approval queue */
.miles-mock .miles-lab{font-size:15px;font-weight:700;letter-spacing:.01em;color:var(--miles-fg);margin-bottom:12px}
.miles-mock .miles-lab-2{margin-top:20px}
.miles-mock .miles-empty{border:1px solid var(--miles-line);border-radius:16px;padding:26px 0;display:flex;flex-direction:column;align-items:center;gap:16px;color:var(--miles-muted);font-size:16px}
.miles-mock .miles-bulk{border:1px solid var(--miles-line);border-radius:16px;padding:14px}
.miles-mock .miles-bulkrow{display:flex;align-items:center;gap:12px;font-size:16px;font-weight:600}
.miles-mock .miles-bulkrow small{font-size:14px;font-weight:400;color:var(--miles-muted)}
.miles-mock .miles-check{width:22px;height:22px;border-radius:50%;border:2px solid var(--miles-muted);flex-shrink:0}
.miles-mock .miles-bulkbtns{display:flex;gap:10px;justify-content:flex-end;margin-top:12px}
.miles-mock .miles-bulkbtn{display:flex;align-items:center;gap:10px;border-radius:var(--miles-r);padding:11px 18px;font-size:16px;font-weight:600;color:#fff}
.miles-mock .miles-bulkbtn.miles-dim{background:#6b7688}
.miles-mock .miles-bulkbtn.miles-dimred{background:#f2a1a1}
.miles-mock .miles-tcard{background:var(--miles-card);border:1px solid var(--miles-line);border-left:4px solid var(--miles-amber);border-radius:16px;padding:14px;margin-top:14px}
.miles-mock .miles-tsel{display:flex;align-items:center;gap:12px;font-size:15px;color:var(--miles-muted)}
.miles-mock .miles-thead{display:flex;align-items:flex-start;gap:12px;margin-top:12px}
.miles-mock .miles-tref{font-size:18px;font-weight:700}
.miles-mock .miles-tright{margin-left:auto;display:flex;flex-direction:column;align-items:flex-end;gap:6px}
.miles-mock .miles-tactions{display:flex;gap:10px;margin-top:12px}
.miles-mock .miles-btn-approve{flex:1;display:flex;align-items:center;justify-content:center;gap:12px;background:var(--miles-navy);color:#fff;border-radius:var(--miles-r);font-size:17px;font-weight:700;padding:14px 0}
.miles-mock .miles-btn-x{width:48px;border-radius:var(--miles-r);background:var(--miles-red);color:#fff;display:flex;align-items:center;justify-content:center}
```

- [ ] **Step 2: Add the figure**

Chrome title `MILES · Approval queue`. Caption:

```html
                <figcaption class="app-shot-cap">
                  <div class="st">Approval queue</div>
                  <div class="sd">A trip cannot start until it is cleared, and a queue of them can be cleared in one action.</div>
                </figcaption>
```

- [ ] **Step 3: Extend `verify-miles.mjs`**

Assert the header has a back arrow and no wordmark; the title is `Insp / Detail Approval`; both section labels are present; the empty state reads `No pending inspection approvals`; the bulk bar reads `Select all` and `0 of 3 selected`; both trip refs `TRP-2411-0095` and `TRP-2411-0094` are present in that order; `Apron 3 — Fuel Point C` keeps its em dash; `Ammo Dump` does **not** appear; and nothing overflows.

- [ ] **Step 4: Run it**

```bash
node scripts/verify-miles.mjs
```

- [ ] **Step 5: Commit**

```bash
git add public/projects.html scripts/verify-miles.mjs
git commit -m "Add the MILES approval queue screen"
```

---

## Task 5: Screen 4, Admin dashboard

**Files:**
- Modify: `public/projects.html`

**Interfaces:**
- Consumes: Tasks 1 to 4.
- Produces: `.miles-tabs`, `.miles-tab`, `.miles-tpl`, `.miles-ucard`, `.miles-role`.

Route `/admin`, from `screens/admin.png` (`860 x 2628`). Header is the wordmark row plus the title `Admin Dashboard`.

- A sunken tab strip of nine icon-only tabs, the first active as a white pill with a border and a soft shadow. Order: Users, Landmark, Building2, Folder, Tag, Car, ClipboardCheck, Fuel, Package.
- `User Account Template` card, outlined, with a `Download` button top right carrying a Download glyph, then `Download a CSV template to prepare user accounts for bulk import.` and, in smaller muted type, `Roles: driver, approver, admin (combine multiple with |). temp_password must be at least 6 characters — users will be required to change it on first login. Separate multiple vehicle categories with |. Leave department / categories blank if not applicable.`
- A navy full-width `Add User` button with a Plus glyph, then a white outlined `Bulk Import Users` button with an Upload glyph.
- `Sort by` beside a `Name (A–Z)` select.
- User cards: name bold, squadron muted beneath, role pills, then Eye, Pencil and red Trash2 actions on the right.

| Name | Squadron | Pills |
|---|---|---|
| Daryl Tan | Ground Support Squadron | red `admin`, navy `driver`, outlined `2 categories` |
| Jason Ong | Air Movement Squadron | teal `facilitator` |
| Nurul Iman | Ground Support Squadron | amber `approver` |

`Rajesh Kumar` and `Wei Ming Lim`, both `driver`, begin at the fold and are not drawn. All four role colours are visible above it.

- [ ] **Step 1: Add the screen-4 CSS**

```css
/* Screen 4 — admin dashboard */
.miles-mock .miles-tabs{display:flex;align-items:center;gap:2px;background:var(--miles-sunken);border-radius:var(--miles-r);padding:6px}
.miles-mock .miles-tab{flex:1;display:flex;align-items:center;justify-content:center;padding:9px 0;border-radius:9px;color:var(--miles-navy)}
.miles-mock .miles-tab.miles-on{background:var(--miles-card);border:1px solid var(--miles-line);box-shadow:0 1px 2px rgba(15,23,42,.06)}
.miles-mock .miles-tpl{border:1px solid var(--miles-line);border-radius:16px;padding:16px;margin-top:14px}
.miles-mock .miles-tpl-hd{display:flex;align-items:flex-start;gap:12px}
.miles-mock .miles-tpl-h{font-size:18px;font-weight:700}
.miles-mock .miles-tpl-btn{margin-left:auto;display:flex;align-items:center;gap:10px;border:1px solid var(--miles-line);border-radius:var(--miles-r);padding:11px 16px;font-size:17px;font-weight:600}
.miles-mock .miles-tpl-d{font-size:16px;color:var(--miles-muted);margin-top:10px}
.miles-mock .miles-tpl-n{font-size:14px;color:var(--miles-muted);margin-top:12px}
.miles-mock .miles-btn-add{display:flex;align-items:center;justify-content:center;gap:12px;background:var(--miles-navy);color:#fff;border-radius:var(--miles-r);font-size:17px;font-weight:700;padding:15px 0;margin-top:16px}
.miles-mock .miles-btn-import{display:flex;align-items:center;justify-content:center;gap:12px;border:1px solid var(--miles-line);background:var(--miles-card);border-radius:var(--miles-r);font-size:17px;font-weight:600;padding:14px 0;margin-top:12px}
.miles-mock .miles-sort{display:flex;align-items:center;gap:14px;margin-top:16px;font-size:15px;color:var(--miles-muted)}
.miles-mock .miles-ucard{background:var(--miles-card);border:1px solid var(--miles-line);border-radius:16px;padding:14px;margin-top:14px;display:flex;align-items:center;gap:12px}
.miles-mock .miles-uname{font-size:17px;font-weight:700}
.miles-mock .miles-usq{font-size:15px;color:var(--miles-muted);max-width:100px}
.miles-mock .miles-roles{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.miles-mock .miles-role{border-radius:999px;padding:5px 12px;font-size:14px;font-weight:700;color:#fff;white-space:nowrap}
.miles-mock .miles-role-admin{background:var(--miles-red)}
.miles-mock .miles-role-driver{background:var(--miles-navy)}
.miles-mock .miles-role-fac{background:var(--miles-teal)}
.miles-mock .miles-role-app{background:var(--miles-amber)}
.miles-mock .miles-role-out{border:1px solid var(--miles-line);color:var(--miles-fg);background:transparent;font-weight:600}
.miles-mock .miles-uacts{margin-left:auto;display:flex;align-items:center;gap:16px;color:var(--miles-navy)}
.miles-mock .miles-uacts .miles-trash{color:var(--miles-red)}
```

- [ ] **Step 2: Add the figure**

Chrome title `MILES · Admin dashboard`. Caption:

```html
                <figcaption class="app-shot-cap">
                  <div class="st">Admin dashboard</div>
                  <div class="sd">Four roles across nine admin surfaces, and one person can hold more than one of them.</div>
                </figcaption>
```

- [ ] **Step 3: Extend `verify-miles.mjs`**

Assert the title is `Admin Dashboard`; there are exactly 9 `.miles-tab` elements with exactly one `.miles-on`; the template card's heading and both paragraphs are present verbatim; `Add User` and `Bulk Import Users` are present; the three user names appear in order with the right squadrons; the four role-pill colours resolve to `#ef4444`, `#1b2a4b`, `#22c3c3` and `#f59e0b`; `Rajesh Kumar` does **not** appear on this screen; and nothing overflows.

- [ ] **Step 4: Run it**

```bash
node scripts/verify-miles.mjs
```

- [ ] **Step 5: Commit**

```bash
git add public/projects.html scripts/verify-miles.mjs
git commit -m "Add the MILES admin dashboard screen, completing the gallery"
```

---

## Task 6: Whole-page verification and the count fix

**Files:**
- Modify: `public/projects.html`
- Modify: `scripts/verify-miles.mjs`

Two changes here fall outside the design spec's §7 and are made deliberately.

1. **The project count.** The design spec §2 recorded that the page states its total in two families and handed the fix to the MAVIS change. The MAVIS change corrected only the filter-pill family, so the page now ships `All 30` and `Showing all 30` alongside two meta descriptions still reading `Twenty-seven projects, …`. Adding a gallery without fixing this would ship a page claiming two different totals. Change both `Twenty-seven` to `Thirty`. There are exactly two, in `<meta name="description">` and `<meta property="og:description">`; the `h1` carries no number.
2. **The `<h1>`.** No change. The spec listed `h1.page-title` in the count table, but on disk it reads `Work across systems, software, and aerospace.` and states no total.

- [ ] **Step 1: Fix both meta descriptions**

- [ ] **Step 2: Add the cross-family lightbox and layout groups to `verify-miles.mjs`**

- Each of the four MILES figures opens in the lightbox with a cloned `.miles-mock`, and the clone's rendered height is at most the dialog body's scroll height, that is: the phone fits whole rather than being cut.
- Escape closes the lightbox and returns focus to the figure that opened it, for all four.
- At a 1280px viewport the MILES strip reports `data-overflow="true"` and the prev/next buttons are enabled.
- At a 390px viewport no `.app-shot.is-phone` overflows its row card, and the strip still scrolls.
- The MAVIS, SOAR, GRID, MatFlow and BOLDFACE galleries each still report their own figure count and their `.app-shot` width is unchanged at `288px`.
- Zero console messages, and no external request beyond the two known Google Fonts hosts.

- [ ] **Step 3: Run the full suite**

```bash
node scripts/verify-miles.mjs
node scripts/verify-mavis.mjs
node scripts/verify-soar.mjs
node scripts/verify-page.mjs
```

Expected: all four pass, with `verify-mavis` still at `92/92` and `verify-soar` still at `78/78`.

- [ ] **Step 4: Confirm the diff touches nothing it should not**

```bash
git diff --stat
git diff public/projects.html | grep -E "^-" | grep -vE "^---" | grep -E "bf-mock|mf-mock|gr-mock|soar-mock|mavis-mock"
```

Expected: the second command prints nothing. The only removed lines should be the two meta descriptions, the `MOCK_SEL` line and its comment, the `.shot-lightbox-mockwrap` terminator line, and the `Math.max(1, scale)` line.

- [ ] **Step 5: Commit**

```bash
git add public/projects.html scripts/verify-miles.mjs
git commit -m "Verify the MILES gallery end to end and align the project count"
```

---

## Task 7: Write the measured corrections back into the design spec

**Files:**
- Modify: `docs/superpowers/specs/2026-08-11-miles-phone-screens-design.md`

The spec is the record of what was decided and why. Three of its statements were measured wrong before implementation, and a stale spec is worse than no spec.

- [ ] **Step 1: Correct D3 and §5.2**

Viewport is `430 x 932`, the app's real capture device, not `430 x 860`. Record the reason: the instruction was to use the exact screen, `860` invents a device that does not exist, `932 x .5 = 466` is equally clean, and `430/932` is a real phone's proportion.

- [ ] **Step 2: Correct §6.2 and §6.3**

Home: the Ongoing Detail card is below the fold, not drawn. Vehicles: the fold falls inside card 4 (`MID 30418`), and `MID 44120` with the only `Unserviceable` pill is below it.

- [ ] **Step 3: Add the fold arithmetic**

Record the measurement so it is never re-derived: device px / 2 = CSS px; the nav is `position:fixed` and `68` CSS px tall; content is visible from y=0 to y=864 CSS, which is device y=1728.

- [ ] **Step 4: Note the two Task 6 changes and the `data-mock-minscale` addition**

§7 said the count was out of scope and owned by the MAVIS change. Record that the MAVIS change fixed only one of the two families, so this change fixed the other. Record `data-mock-minscale` as an addition to the shared lightbox that §5.4 did not anticipate.

- [ ] **Step 5: Update the status line**

From `approved by the author, blocked on a dependency (§1)` to shipped, naming the merge commit that unblocked it.

- [ ] **Step 6: Commit**

```bash
git add docs/superpowers/specs/2026-08-11-miles-phone-screens-design.md
git commit -m "Correct the MILES spec's viewport and fold claims against the captures"
```

---

## Self-review

**Spec coverage.** §3 source of record → Global Constraints. §4 D1 `.miles-mock` → Task 1. D2 real width → Task 1 Step 4. D3 viewport → corrected, Task 7. D4 four screens → Tasks 2 to 5. D5 `.is-phone` → Task 1 Step 3. D6 no row copy changes → Global Constraints. D7 light theme → Task 1 tokens. §5.1 tokens, reset, brand-mark omission, icon set → Task 1 Step 4 and Global Constraints. §5.2 sizing → Task 1 Steps 1 and 3. §5.3 portrait frames → Task 1 Step 3; the narrow-viewport check it defers is Task 6 Step 2. §5.4 I1 to I4 → Task 1 Steps 1 and 2, and the `data-mock-width` on every figure in Tasks 2 to 5. §6.1 shared shell → Task 1 Step 4. §6.2 to §6.5 → Tasks 2 to 5. §6.6 wrapper → Task 1 Step 5. §8 verification 1 to 9 → the `verify-miles.mjs` groups across Tasks 1 to 6.

**Placeholder scan.** The only `<!-- comment -->` stand-in is the mock body in Task 2 Step 2, which the prose immediately above it specifies element by element with every string verbatim. Every CSS block is final.

**Type consistency.** `.miles-tool-ico` is used in Task 2's CSS and in Task 2's verification. `.miles-tab` / `.miles-on` in Task 5's CSS and verification. `data-mock-minscale` is defined in Task 1 Step 2, set in Task 2 Step 2 and read in Task 6 Step 2. `.miles-nav-item.miles-on` reuses `.miles-on` from Task 1, and Task 5's `.miles-tab.miles-on` reuses it again; both are scoped by their parent so they do not collide.
