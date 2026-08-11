# MAVIS Row Split and Screens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the merged `MILES / MAVIS` entry in `public/projects.html` into two cross-linked rows, each rewritten from its own verified marketing spec, and give the MAVIS row a four-screen gallery hand-built in HTML/CSS from the app's real captured screenshots.

**Architecture:** One static HTML file with its own inline `<style>` and `<script>`, no build step and no external request. The page already supports four hand-built "mock" screen families (`.bf-mock`, `.mf-mock`, `.gr-mock`, and possibly `.soar-mock` if that plan landed first); this work adds a fifth, `.mavis-mock`, by **appending** to three lists — never by editing an existing family. The test harness is a new Playwright script, `scripts/verify-mavis.mjs`, that loads the page over `file://` and asserts DOM and computed-style facts. Each task extends that harness with checks that fail before the change and pass after; that is the red-green cycle here, because there is no unit-test framework for a single HTML document.

**Tech Stack:** Plain HTML/CSS/vanilla JS. Node 18+. Playwright (already present in `node_modules`, no install needed). No package changes.

## Global Constraints

Copied from `docs/superpowers/specs/2026-08-11-mavis-row-split-and-screens-design.md`. Every task's requirements implicitly include this section.

- **No `.bf-mock`, `.mf-mock`, `.gr-mock` or `.soar-mock` code is modified.** `.mavis-mock` registers by appending to three lists. A `git diff` must show no existing mock family's line altered.
- **No new dependency, no new external request, no build step, no image file.** The page must still load zero fonts, images or scripts from any external host.
- **Every screen fact comes from the four captures** in `Project Management/MAVIS Marketing Content/marketing-pr/mavis-app/screens/`. No asset ID, status, date, count, chip or label may be invented or "tidied". Two intentional exceptions are on the record: the third defect card on the Corrective Maintenance screen is genuinely cut off in its source capture and stays cut off (§ Task 3); the Corrective-Maintenance and Dashboard screens use **different** colours for the same status name, and both are reproduced as captured, not harmonised (§ Task 2/3).
- **No adoption, fleet-size, uptime, time-saved or ROI figure**, in either row. Neither source repo supports one.
- **No qualification-tracking claim** in either row — dropped as unbacked by both shipped repos (still present, untouched, in `public/work.html`'s first-hand account).
- **No unit, base or squadron is named** in either row.
- **Every CSS rule in the new block is qualified with the `.mavis-mock` ancestor**, so its specificity beats this page's own descendant rules (`.log-body p` and friends) without `!important`.
- **`.mavis-mock` is authored at 720px width and carries `data-mock-width="720"`** on every instance, scaled by `transform:scale(.4)` into the 288px `.app-shot-frame`. It declares **no fixed height** — it follows `.mf-mock`'s convention, not `.gr-mock`'s — so `.app-shot-frame`'s own `aspect-ratio:8/5; overflow:hidden` does the thumbnail cropping.
- **Every screen is budgeted to roughly 700px of content.** The lightbox's `fitMockScale` never scales below `1` (`Math.max(1, scale)`), so a taller mock renders at natural size and the dialog body scrolls — undesirable for a screen that's supposed to read as one glance. Where a captured page runs longer, the mock stops at a card/section boundary rather than continuing into a boundary-crossing cut. Two screens (Fleet Overview, Reports) stop before the bottom of their capture; this is recorded on each, not invented at build time.
- **Legibility liberty:** text below roughly 7px stops rendering as text, so the smallest micro-labels sit slightly above a strict proportional reduction. This is the same liberty `.mf-mock`, `.gr-mock` and (if built) `.soar-mock` already document.
- **The demo-data disclosure is required** and lives on the fourth screen's (Reports) caption.
- **The legacy anchor `#miles-mavis` must still resolve** to the top of the pair.
- **Line numbers drift as tasks apply, and this file's own line numbers are approximate** (grep and the Read tool disagree by a few lines on this CRLF file). Every location below is given with an anchor string to search for. **Trust the string, not the number.**
- **`public/projects.html` and `public/index.html` are already modified and uncommitted** in the working tree. Do not revert, review or commit those pre-existing changes. Stage only the files each task names.
- **If `docs/superpowers/plans/2026-08-11-soar-duty-scheduler-screens.md` has already been executed**, `MOCK_SEL`, the `.shot-lightbox-mockwrap` selector list and the `.app-shot-frame` mock-sizing rules will already contain a `.soar-mock` entry. Every "append" instruction below still applies — append after whatever is already there, and do not touch the `.soar-mock` entries.

---

## File Structure

| File | Responsibility | Tasks |
|---|---|---|
| `scripts/verify-mavis.mjs` | **Create.** Playwright harness: DOM + computed-style assertions for both rows and the MAVIS gallery, plus regression checks on the existing mock families | 1–5 |
| `public/projects.html` — the `MILES / MAVIS` `.log-row` | Split into two rows; each row's copy, cross-reference line, chips | 1 |
| `public/projects.html` — the three hardcoded `29`s | Project count | 1 |
| `public/projects.html` — `.shot-lightbox-mockwrap` rule | Lightbox clone positioning — one selector appended | 2 |
| `public/projects.html` — `.app-shot-frame` mock rules | Thumbnail scaling — one rule added | 2 |
| `public/projects.html` — `MOCK_SEL` in the lightbox script | Mock registry — one name appended | 2 |
| `public/projects.html` — new `.mavis-mock` `<style>` block | MAVIS tokens, shared navbar, and per-screen components | 2–5 |
| `public/projects.html` — the MAVIS row's `.log-shots-wrap` | Gallery wrapper + four `<figure class="app-shot">` | 2–5 |

**Task order is load-bearing.** Task 2 creates the tokens, the shared navbar and the gallery wrapper that Tasks 3–5 add figures into. Task 1 is independent and can ship alone.

---

## Reference: the source captures

All four live in `C:\Users\manfr\Downloads\Project Management\MAVIS Marketing Content\marketing-pr\mavis-app\screens\` — `01-dashboard.png`, `02-corrective-maintenance.png`, `03-preventive-maintenance.png`, `04-reports.png`. Open the relevant PNG with the Read tool before building each screen and compare against it after. `MARKETING_SPEC.md` in the same folder documents the theme tokens, the App Fidelity Map and the fixture dataset. The MILES row's copy is sourced from `Project Management/MILES Marketing Content/marketing-pr/rsaf-vehicle-logbook/MARKETING_SPEC.md` — no screens are built from it in this plan.

---

## Task 1: Split the row, fix the count

**Files:**
- Create: `scripts/verify-mavis.mjs`
- Modify: `public/projects.html` — the `<details class="log-row" id="miles-mavis">` element (currently near line 1704), and the three `29` occurrences (currently near lines 1109, 1110, 1193)

**Interfaces:**
- Consumes: nothing.
- Produces: the MAVIS row's title string `Fleet Maintenance Management System (MAVIS)` and its `id="mavis"`, which Task 2's harness uses to locate the entry and insert the gallery. The MILES row's title string `Air Specialist Vehicle Logbook (MILES)` and its `id="miles"`. Neither row's `<div class="log-body">` gains a gallery in this task — Task 2 adds MAVIS's.

- [ ] **Step 1: Write the failing test**

Create `scripts/verify-mavis.mjs`:

```js
// scripts/verify-mavis.mjs
//
// Render/verification harness for the MAVIS / MILES row split and the
// MAVIS screen gallery in public/projects.html. Measures, does not fix.
// Run: node scripts/verify-mavis.mjs [path-to-html]
//
// Every assertion here is traceable to either the design spec
// (docs/superpowers/specs/2026-08-11-mavis-row-split-and-screens-design.md)
// or to one of the four source captures it is built from.

import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const FILE = process.argv[2] ?? 'public/projects.html';
const PAGE_URL = pathToFileURL(path.resolve(FILE)).href;
const MAVIS_TITLE = 'Fleet Maintenance Management System (MAVIS)';
const MILES_TITLE = 'Air Specialist Vehicle Logbook (MILES)';

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail ?? '' });
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const consoleMsgs = [];
page.on('console', (m) => consoleMsgs.push(`${m.type()}: ${m.text()}`));
page.on('pageerror', (e) => consoleMsgs.push(`pageerror: ${e.message}`));

const external = [];
page.on('request', (r) => {
  if (!r.url().startsWith('file://') && !r.url().startsWith('data:')) external.push(r.url());
});

await page.goto(PAGE_URL, { waitUntil: 'load' });

// Every <details> on this page is opened, so content inside collapsed rows
// is laid out and measurable. Without this, getBoundingClientRect on a
// mock inside a closed <details> returns zeros and every size check lies.
await page.evaluate(() => {
  document.querySelectorAll('details').forEach((d) => { d.open = true; });
});

function findRowByTitle(title) {
  return page.evaluate((t) => {
    const rows = Array.prototype.slice.call(document.querySelectorAll('details.log-row'));
    const row = rows.find((r) => {
      const lt = r.querySelector('.lt');
      return lt && lt.textContent.trim() === t;
    });
    if (!row) return { found: false };
    const chips = Array.prototype.slice.call(row.querySelectorAll('.chips span'))
      .map((s) => s.textContent.trim());
    const feats = Array.prototype.slice.call(row.querySelectorAll('ul.feat > li'))
      .map((li) => li.textContent.trim());
    return {
      found: true,
      id: row.id,
      lead: (row.querySelector('.log-body > p') || {}).textContent || '',
      note: (row.querySelector('.log-body > p.note') || {}).textContent || '',
      chips,
      feats,
      text: row.textContent,
      org: row.getAttribute('data-org'),
      cat: row.getAttribute('data-cat'),
      workLink: (row.querySelector('a.link-inline') || {}).getAttribute
        ? row.querySelector('a.link-inline').getAttribute('href') : null,
    };
  }, title);
}

// ── Check group 1: the two rows exist, in order, both linking to /work#wp2 ─
const mavis = await findRowByTitle(MAVIS_TITLE);
const miles = await findRowByTitle(MILES_TITLE);

check('mavis row: exists under the split title', mavis.found, MAVIS_TITLE);
check('miles row: exists under the split title', miles.found, MILES_TITLE);
check('mavis row: id="mavis"', mavis.found && mavis.id === 'mavis', mavis.id);
check('miles row: id="miles"', miles.found && miles.id === 'miles', miles.id);
check('mavis row: org/cat unchanged', mavis.found && mavis.org === 'RAiD' && mavis.cat === 'platform',
  mavis.found ? `${mavis.org}/${mavis.cat}` : 'n/a');
check('miles row: org/cat unchanged', miles.found && miles.org === 'RAiD' && miles.cat === 'platform',
  miles.found ? `${miles.org}/${miles.cat}` : 'n/a');
check('mavis row: links to /work#wp2', mavis.found && mavis.workLink === '/work#wp2', mavis.workLink);
check('miles row: links to /work#wp2', miles.found && miles.workLink === '/work#wp2', miles.workLink);
check('mavis row: cross-references MILES', mavis.found && /MILES/.test(mavis.note), mavis.note);
check('miles row: cross-references MAVIS', miles.found && /MAVIS/.test(miles.note), miles.note);
check('mavis row: has 5 "What it does" bullets', mavis.found && mavis.feats.length === 5, String(mavis.feats.length));
check('miles row: has 5 "What it does" bullets', miles.found && miles.feats.length === 5, String(miles.feats.length));
check('mavis row: chips are the real stack',
  mavis.found && JSON.stringify(mavis.chips) === JSON.stringify(
    ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Supabase', 'Lovable']),
  JSON.stringify(mavis.chips));
check('miles row: chips are the real stack',
  miles.found && JSON.stringify(miles.chips) === JSON.stringify(
    ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Supabase', 'Lovable']),
  JSON.stringify(miles.chips));
check('mavis row: order precedes miles row', mavis.found && miles.found && (async () => {
  const order = await page.evaluate(() => {
    const rows = Array.prototype.slice.call(document.querySelectorAll('details.log-row'));
    return rows.map((r) => r.id).filter(Boolean);
  });
  return order.indexOf('mavis') !== -1 && order.indexOf('mavis') < order.indexOf('miles');
})());

// ── Check group 2: forbidden claims ──────────────────────────────────
const bothText = (mavis.text || '') + (miles.text || '');
check('no adoption/fleet-size/ROI/time-saved figure',
  !/\b(ROI|adoption|time[- ]saved|hours saved|man[- ]hours|uptime)\b/i.test(bothText));
check('no qualification-tracking claim',
  !/qualification/i.test(bothText));
check('no unit/base/squadron named',
  !/\b(squadron|Base Alpha|Base Bravo|AMS|GSS|AMTS)\b/.test(bothText));

// ── Check group 3: the legacy anchor and the old merged copy ─────────
const legacy = await page.evaluate(() => {
  const el = document.getElementById('miles-mavis');
  return { found: !!el, tag: el ? el.tagName : null };
});
check('legacy #miles-mavis id still resolves', legacy.found, JSON.stringify(legacy));

const bodyText = await page.evaluate(() => document.body.textContent);
check('page: old merged title removed', !/>MILES \/ MAVIS</.test(await page.content()));
check('page: old merged lead removed', !/were spread across manual steps with no single record/.test(bodyText));

// ── Check group 4: project count ─────────────────────────────────────
const counts = await page.evaluate(() => ({
  resetAria: (document.getElementById('logReset') || {}).getAttribute
    ? document.getElementById('logReset').getAttribute('aria-label') : null,
  pillCount: (document.querySelector('.pill-count') || {}).textContent || null,
  logCount: (document.getElementById('logCount') || {}).textContent || null,
  rowCount: document.querySelectorAll('details.log-row').length,
}));
check('count: reset pill aria-label says 30', counts.resetAria === 'All 30 projects, clearing both filters', counts.resetAria);
check('count: pill-count reads 30', counts.pillCount && counts.pillCount.trim() === '30', counts.pillCount);
check('count: logCount reads "Showing all 30"', counts.logCount && counts.logCount.trim() === 'Showing all 30', counts.logCount);
check('count: 30 actual .log-row elements', counts.rowCount === 30, String(counts.rowCount));

// ── Report ───────────────────────────────────────────────────────────
await browser.close();

let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  — ${r.detail}` : ''}`);
}
console.log(`\nconsole messages: ${consoleMsgs.length}`);
consoleMsgs.forEach((m) => console.log(`  ${m}`));
console.log(`external requests: ${external.length}`);
external.forEach((u) => console.log(`  ${u}`));
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/verify-mavis.mjs`
Expected: FAIL on both row-existence checks, both cross-reference checks, both chip checks, the count checks (still reading `29`), and `page: old merged title removed`. The legacy-anchor check PASSes (the id already exists on the merged row).

- [ ] **Step 3a: Replace the merged row with two rows**

Find the anchor `<details class="log-row" id="miles-mavis" data-org="RAiD" data-cat="platform">` and replace that whole `<details>` element, through its closing `</details>`, with:

```html
      <details class="log-row" id="mavis" data-org="RAiD" data-cat="platform">
        <summary>
          <span id="miles-mavis" aria-hidden="true"></span>
          <span class="lt">Fleet Maintenance Management System (MAVIS)</span>
          <span class="tag tag-indigo">Scaling</span><span class="lorg">RAiD</span>
          <svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </summary>
        <div class="log-body">
          <p>Tracks vehicle and ground-equipment serviceability across an air-force fleet. Availability is computed, not typed — derived live from three independent sources of unserviceability, mirroring the database rule so the dashboard and the store cannot disagree. Corrective and preventive work each run through their own approval chain, and what any one person sees is the intersection of vehicle category, base, department and sub-department.</p>
          <p class="note">The maintenance half of the Air Specialist Vehicle platform. MILES, below, is the logbook half.</p>
          <div><div class="lab">What it does</div>
            <ul class="feat" role="list">
              <li>A defect walks Waiting for assessment → Pending CEN Endorsement → Pending for Approval → Approved → Repair in progress → Ready for collection → Collected, with ADDL (Acceptable Defect Deferred Log), ADDL Expired and Rejected as branch states, and every transition gated by role</li>
              <li>Moving a scheduled Preventive Maintenance date is not a free edit but an LOS — Latitude of Servicing — request that clears approval bands before the dashboard reflects it</li>
              <li>A defect formally deferred as an ADDL keeps the asset serviceable only until its expiry date, after which the asset flips itself to ADDL Expired</li>
              <li>Eleven built-in roles plus custom roles, resolved by a security-definer function server-side rather than trusted from the client</li>
              <li>Five Postgres realtime channels push changes to the dashboard, coalesced through a 150ms per-table debounce so a burst write does not thrash the UI</li>
            </ul></div>
          <div><div class="lab">Built with</div><p>The functions were proved in Power Apps first, then rebuilt as a full-stack application once per-user licensing stopped being viable for a user base that reached beyond the RSAF.</p><div class="chips"><span>React</span><span>TypeScript</span><span>Vite</span><span>Tailwind CSS</span><span>Supabase</span><span>Lovable</span></div></div>
          <p><a class="link-inline" href="/work#wp2">Full case study, on the Work page →</a></p>
        </div>
      </details>

      <details class="log-row" id="miles" data-org="RAiD" data-cat="platform">
        <summary>
          <span class="lt">Air Specialist Vehicle Logbook (MILES)</span>
          <span class="tag tag-indigo">Scaling</span><span class="lorg">RAiD</span>
          <svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </summary>
        <div class="log-body">
          <p>The logbook side of the same fleet: a mobile-first record of vehicle movement and use, built for people standing on a flight line rather than sitting at a desk. A trip runs a full lifecycle behind an approval gate, and pre-use inspections feed the same serviceability picture the maintenance system works from.</p>
          <p class="note">The logbook half of the Air Specialist Vehicle platform. MAVIS, above, is the maintenance half.</p>
          <div><div class="lab">What it does</div>
            <ul class="feat" role="list">
              <li>A trip walks pending_approval → approved → ongoing → completed, with rejected as a branch, and approvers can clear many at once rather than one at a time</li>
              <li>Four roles — admin, facilitator, approver, driver — with more than one assignable to a person, enforced at three layers: route guards, 136 row-level-security policies over 31 tables, and per-request auth inside every edge function</li>
              <li>Digital pre-use inspections, configurable per vehicle type and per model, whose outcome drives whether the vehicle reads as serviceable</li>
              <li>Fuel accounted end to end — bulk tanks to refueller payload holdings to POL top-ups to a summary report — with forklifts tracked by hour-meter and vehicles by odometer</li>
              <li>Ground support equipment booked in and out of the same register as the vehicles, and every action written to an audit trail with actor, entity and timestamp</li>
            </ul></div>
          <div><div class="lab">Built with</div><p>The functions were proved in Power Apps first, then rebuilt as a full-stack application once per-user licensing stopped being viable for a user base that reached beyond the RSAF.</p><div class="chips"><span>React</span><span>TypeScript</span><span>Vite</span><span>Tailwind CSS</span><span>Supabase</span><span>Lovable</span></div></div>
          <p><a class="link-inline" href="/work#wp2">Full case study, on the Work page →</a></p>
        </div>
      </details>
```

The `id="miles-mavis"` legacy anchor is an empty `<span>`, first child of `<summary>`, deliberately empty and `aria-hidden` — it exists only so `/projects#miles-mavis` still scrolls to the right place, and it must render nothing visible.

- [ ] **Step 3b: Fix the hardcoded project count**

Find the anchor `aria-label="All 29 projects, clearing both filters"` and change it to `aria-label="All 30 projects, clearing both filters"`.

Find the anchor `All <span class="pill-count">29</span>` and change it to `All <span class="pill-count">30</span>`.

Find the anchor `Showing all 29` and change it to `Showing all 30`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node scripts/verify-mavis.mjs`
Expected: PASS on all checks in groups 1–4. `external requests: 0`.

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-mavis.mjs public/projects.html
git commit -m "Split the merged MILES / MAVIS row into two cross-linked rows

MILES and MAVIS are two separate repositories with two separate design
systems that never reference each other in code; the merged row hid
MAVIS's actual depth behind a shared summary. Splits into id=mavis and
id=miles, both rewritten from their own MARKETING_SPEC.md, each
cross-referencing the other and both linking to the same /work#wp2
case study. The legacy #miles-mavis fragment still resolves.

Drops the qualification-tracking claim neither shipped repo backs
(left untouched in work.html's own first-hand account). Fixes the
three hardcoded '29 projects' counts the split invalidates.

Adds scripts/verify-mavis.mjs as the harness for this work."
```

---

## Task 2: Register `.mavis-mock`, build the shell, and add Fleet Overview

**Files:**
- Modify: `public/projects.html` — three list additions, a new `<style>` block, and the gallery wrapper with its first figure
- Modify: `scripts/verify-mavis.mjs` — add registration, navbar and Fleet Overview checks

**Interfaces:**
- Consumes: the MAVIS row located by `MAVIS_TITLE` from Task 1.
- Produces: the `.mavis-mock` token block; the shared navbar markup (`.mavis-nav`, reused verbatim by Tasks 3–5 with only the active `.mavis-pill` moving); the `.log-shots-wrap` gallery that Tasks 3–5 append `<figure>` elements into; and the shared pane classes `.mavis-h1` / `.mavis-sub` / `.mavis-card`.

**Read `screens/01-dashboard.png` before starting.**

- [ ] **Step 1: Write the failing test**

In `scripts/verify-mavis.mjs`, insert this block immediately **before** the line `// ── Report ─────`:

```js
// ── Check group 5: mock registration + regression on existing families ──
const reg = await page.evaluate(() => {
  const frameW = (sel) => {
    const el = document.querySelector(sel);
    return el ? getComputedStyle(el).width : null;
  };
  return {
    mavisCount: document.querySelectorAll('.mavis-mock').length,
    mavisWidths: Array.prototype.slice.call(document.querySelectorAll('.mavis-mock'))
      .map((m) => m.getAttribute('data-mock-width')),
    bfCount: document.querySelectorAll('.bf-mock').length,
    mfCount: document.querySelectorAll('.mf-mock').length,
    grCount: document.querySelectorAll('.gr-mock').length,
    bfFrameW: frameW('.app-shot-frame .bf-mock'),
    mfFrameW: frameW('.app-shot-frame .mf-mock'),
    grFrameW: frameW('.app-shot-frame .gr-mock'),
    mavisFrameW: frameW('.app-shot-frame .mavis-mock'),
  };
});

check('regression: BOLDFACE still has 3 mocks', reg.bfCount === 3, String(reg.bfCount));
check('regression: MatFlow still has 5 mocks', reg.mfCount === 5, String(reg.mfCount));
check('regression: GRID still has 4 mocks', reg.grCount === 4, String(reg.grCount));
check('regression: .bf-mock still authored at 480px', reg.bfFrameW === '480px', reg.bfFrameW);
check('regression: .mf-mock still authored at 720px', reg.mfFrameW === '720px', reg.mfFrameW);
check('regression: .gr-mock still authored at 720px', reg.grFrameW === '720px', reg.grFrameW);
check('mavis: authored at 720px', reg.mavisFrameW === '720px', reg.mavisFrameW);
check('mavis: every mock declares data-mock-width="720"',
  reg.mavisCount > 0 && reg.mavisWidths.every((w) => w === '720'), JSON.stringify(reg.mavisWidths));

// ── Check group 6: the shared navbar ─────────────────────────────────
const nav = await page.evaluate(() => {
  const mock = document.querySelector('.mavis-mock');
  if (!mock) return { found: false };
  const wm = mock.querySelector('.mavis-wordmark');
  return {
    found: true,
    wordmark: wm ? wm.textContent.trim() : '',
    pills: Array.prototype.slice.call(mock.querySelectorAll('.mavis-pill')).map((p) => p.textContent.trim()),
    active: (mock.querySelector('.mavis-pill.on') || {}).textContent.trim() || '',
    bellBadge: (mock.querySelector('.mavis-bell-badge') || {}).textContent.trim() || '',
    userName: (mock.querySelector('.mavis-user-name') || {}).textContent.trim() || '',
    userRole: (mock.querySelector('.mavis-user-role') || {}).textContent.trim() || '',
  };
});

check('nav: wordmark reads MAVIS', nav.found && nav.wordmark === 'MAVIS', nav.wordmark);
check('nav: five pills in app order', nav.found && JSON.stringify(nav.pills) === JSON.stringify(
  ['Dashboard', 'Corrective Maintenance', 'Preventive Maintenance', 'Workshop Status', 'Reports']),
  JSON.stringify(nav.pills));
check('nav: bell carries the captured badge count', nav.found && nav.bellBadge === '2', nav.bellBadge);
check('nav: signed-in persona matches the capture',
  nav.found && nav.userName === 'Ops Duty Officer' && nav.userRole === 'Admin',
  `${nav.userName} / ${nav.userRole}`);

// ── Check group 7: Fleet Overview ────────────────────────────────────
const dash = await page.evaluate(() => {
  const mock = document.querySelector('.mavis-mock[data-screen="dashboard"]');
  if (!mock) return { found: false };
  return {
    found: true,
    active: (mock.querySelector('.mavis-pill.on') || {}).textContent.trim(),
    h1: (mock.querySelector('.mavis-h1') || {}).textContent.trim(),
    sub: (mock.querySelector('.mavis-sub') || {}).textContent.trim(),
    tabs: Array.prototype.slice.call(mock.querySelectorAll('.mavis-tab')).map((t) => t.textContent.trim()),
    activeTab: (mock.querySelector('.mavis-tab.on') || {}).textContent.trim(),
    stats: Array.prototype.slice.call(mock.querySelectorAll('.mavis-stat')).map((s) => ({
      label: (s.querySelector('.mavis-stat-label') || {}).textContent.trim(),
      value: (s.querySelector('.mavis-stat-value') || {}).textContent.trim(),
      note: (s.querySelector('.mavis-stat-note') || {}).textContent.trim() || null,
    })),
    defects: Array.prototype.slice.call(mock.querySelectorAll('.mavis-defect')).map((d) => ({
      title: (d.querySelector('.mavis-defect-title') || {}).textContent.trim(),
      asset: (d.querySelector('.mavis-defect-asset') || {}).textContent.trim(),
      badge: (d.querySelector('.mavis-badge') || {}).textContent.trim(),
      viewOnly: !!d.querySelector('.mavis-view-only'),
    })),
    assets: Array.prototype.slice.call(mock.querySelectorAll('.mavis-asset')).map((a) => ({
      id: (a.querySelector('.mavis-asset-id') || {}).textContent.trim(),
      type: (a.querySelector('.mavis-asset-type') || {}).textContent.trim(),
      badge: (a.querySelector('.mavis-badge') || {}).textContent.trim(),
    })),
    cmTiles: Array.prototype.slice.call(mock.querySelectorAll('.mavis-cmtile')).map((t) => ({
      value: (t.querySelector('.mavis-cmtile-value') || {}).textContent.trim(),
      label: (t.querySelector('.mavis-cmtile-label') || {}).textContent.trim(),
    })),
    hasPmSummary: !!mock.querySelector('.mavis-pmtiles'),
    hasPendingApproval: !!mock.querySelector('.mavis-pending'),
    hasFooter: !!mock.querySelector('.mavis-footer'),
  };
});

check('dashboard: screen exists', dash.found);
check('dashboard: Dashboard is the active nav pill', dash.found && dash.active === 'Dashboard', dash.active);
check('dashboard: heading + subtitle match the capture',
  dash.found && dash.h1 === 'Fleet Overview'
  && dash.sub === 'Monitor vehicle/equipment status, serviceability trends, and maintenance requirements.');
check('dashboard: four tabs, Overview active',
  dash.found && JSON.stringify(dash.tabs) === JSON.stringify(
    ['Overview', 'Scheduled Maintenance', 'Maintenance History', 'ADDL'])
  && dash.activeTab === 'Overview', JSON.stringify(dash.tabs));
check('dashboard: four stat tiles with the captured values',
  dash.found && JSON.stringify(dash.stats) === JSON.stringify([
    { label: 'Total Assets', value: '48', note: null },
    { label: 'Serviceable', value: '36', note: '75.0% Availability' },
    { label: 'Unserviceable', value: '12', note: null },
    { label: 'Reported Today', value: '3', note: null },
  ]), JSON.stringify(dash.stats));
check('dashboard: three defect rows matching the capture',
  dash.found && JSON.stringify(dash.defects) === JSON.stringify([
    { title: 'Air brake pressure drops below threshold on hold', asset: 'Asset ID: MID 4423', badge: 'Waiting for assessment', viewOnly: false },
    { title: 'Hydraulic seep at tow-arm cylinder', asset: 'Asset ID: AGE 1119', badge: 'Pending CEN Endorsement', viewOnly: false },
    { title: 'Coolant temperature sensor intermittent', asset: 'Asset ID: MID 4490', badge: 'Ready for collection', viewOnly: true },
  ]), JSON.stringify(dash.defects));
check('dashboard: three asset-status rows matching the capture',
  dash.found && JSON.stringify(dash.assets) === JSON.stringify([
    { id: 'AGE 1107', type: 'Ground Power Unit', badge: 'Serviceable' },
    { id: 'AGE 1112', type: 'Aircraft Tug', badge: 'Serviceable' },
    { id: 'AGE 1119', type: 'Air Start Unit', badge: 'Defect' },
  ]), JSON.stringify(dash.assets));
check('dashboard: three CM summary tiles matching the capture',
  dash.found && JSON.stringify(dash.cmTiles) === JSON.stringify([
    { value: '3', label: 'In Maintenance' },
    { value: '2', label: 'Ready for Collection' },
    { value: '2', label: 'Active ADDL' },
  ]), JSON.stringify(dash.cmTiles));
check('dashboard: stops before PM Summary / Pending Approval / footer (spec §5.1)',
  dash.found && !dash.hasPmSummary && !dash.hasPendingApproval && !dash.hasFooter,
  `pm=${dash.hasPmSummary} pending=${dash.hasPendingApproval} footer=${dash.hasFooter}`);
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/verify-mavis.mjs`
Expected: FAIL on every check in groups 5–7 (`mavis: authored at 720px` reports `null`, `dashboard: screen exists` false). Everything from Task 1 and the three regression counts still PASS.

- [ ] **Step 3a: Register the family — three list additions**

Find the anchor `.shot-lightbox-mockwrap .gr-mock{ position:absolute;` (if `.soar-mock` was added by a prior plan, the anchor is instead whichever family's line currently comes last in that selector list) and add a new final line to that selector list:

```css
.shot-lightbox-mockwrap .bf-mock,
.shot-lightbox-mockwrap .mf-mock,
.shot-lightbox-mockwrap .gr-mock,
.shot-lightbox-mockwrap .mavis-mock{ position:absolute; top:0; left:0; transform-origin:top left; }
```

(If `.soar-mock` is already present, keep its line and add `.mavis-mock` as the new final line instead — never remove or reorder an existing selector.)

Find the anchor `.app-shot-frame .gr-mock{width:720px;transform:scale(.4);transform-origin:top left}` and add a new comment + rule directly **after** it (after `.soar-mock`'s rule too, if present):

```css
/* .mavis-mock is authored at the same 720px half-scale as .mf-mock and
   .gr-mock — half of the app's own 1440px capture viewport, so
   proportions carry across from the source PNGs directly. Unlike
   .gr-mock it declares no fixed height: it follows .mf-mock's
   convention and lets .app-shot-frame's own aspect-ratio:8/5;
   overflow:hidden crop the thumbnail, because each screen's natural
   content height varies. */
.app-shot-frame .mavis-mock{width:720px;transform:scale(.4);transform-origin:top left}
```

Find the anchor `var MOCK_SEL = '.bf-mock, .mf-mock, .gr-mock';` (or, if a prior plan already appended `.soar-mock`, `var MOCK_SEL = '.bf-mock, .mf-mock, .gr-mock, .soar-mock';`) and append `, .mavis-mock` to the end of that string only:

```js
  var MOCK_SEL = '.bf-mock, .mf-mock, .gr-mock, .mavis-mock';
```

Do not touch any other line in any of these three regions.

- [ ] **Step 3b: Add the `.mavis-mock` style block**

Find the end of the `.gr-mock` style block (or the `.soar-mock` block, if a prior plan added one after it — insert after whichever mock family's rules currently come last) and insert this block immediately after:

```css
/* ── MAVIS Fleet Maintenance screen mockup ────────────────────────────
   Rebuilt in HTML/CSS from the app's own design tokens and four of its
   captured screens, the same recipe .mf-mock and .gr-mock use. Source:
   MAVIS Marketing Content/marketing-pr/mavis-app/MARKETING_SPEC.md
   (§3 theme tokens, §6 App Fidelity Map) plus
   screens/{01-dashboard,02-corrective-maintenance,
   03-preventive-maintenance,04-reports}.png.
   Tokens are the app's real LIGHT palette from its tailwind.config.ts /
   src/index.css (every capture is light), mavis- prefixed. Authored at
   720px, no fixed height — .app-shot-frame crops the 8:5 thumbnail and
   the lightbox scales it back up, never below natural size. As with
   .mf-mock and .gr-mock the one liberty is legibility: text below
   about 7px stops rendering as text, so the smallest labels sit a
   little above a strict half-scale. Every rule is qualified with the
   .mavis-mock ancestor so it outranks this page's own descendant rules
   (.log-body p and friends). Each screen is budgeted to ~700px of
   content so the lightbox (which never scales below 1×) doesn't force
   the dialog body to scroll; where a capture runs longer, the mock
   stops at a card boundary rather than continuing into a cut — see the
   design spec §5.1 and §5.4 for exactly what's omitted and why.

   Colour note: "Waiting for assessment" and "Ready for collection" are
   rendered in DIFFERENT colours on the dashboard vs. the Corrective
   Maintenance screen in the real app's own captures — both are
   reproduced as captured, not harmonised. See design spec §5,
   "Observed inconsistency — reproduce it, do not correct it". */
.mavis-mock{
  --mavis-bg:#f8fafc; --mavis-card:#ffffff; --mavis-ink:#1d232e;
  --mavis-primary:#10407f; --mavis-secondary:#e2e8f0; --mavis-muted:#f1f5f9;
  --mavis-fg-2:#64748b; --mavis-fg-3:#94a3b8; --mavis-border:#dae0e8;
  --mavis-ring:#3b82f6; --mavis-warning:#f59e0b; --mavis-success:#16a34a;
  --mavis-danger:#ef4444;
  --mavis-blue-bg:#eff6ff; --mavis-blue-fg:#1d4ed8;
  --mavis-green-bg:#ecfdf5; --mavis-green-fg:#047857;
  --mavis-amber-bg:#fffbeb; --mavis-amber-fg:#b45309;
  --mavis-orange-bg:#fff7ed; --mavis-orange-fg:#c2410c;
  --mavis-red-bg:#fef2f2; --mavis-red-fg:#b91c1c;
  --mavis-purple-bg:#faf5ff; --mavis-purple-fg:#7e22ce;
  width:720px; background:var(--mavis-bg); color:var(--mavis-ink);
  font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
  font-size:11px; line-height:1.35;
}
.mavis-mock p,.mavis-mock b,.mavis-mock span,.mavis-mock div,.mavis-mock h1,.mavis-mock h2{margin:0;font-size:inherit;line-height:inherit;color:inherit;font-weight:inherit}

/* Navbar — shared verbatim by all four screens; only .mavis-pill.on moves. */
.mavis-mock .mavis-nav{display:flex;align-items:center;justify-content:space-between;height:32px;padding:0 16px;background:var(--mavis-card);border-bottom:1px solid var(--mavis-border)}
.mavis-mock .mavis-nav-left{display:flex;align-items:center;gap:18px}
.mavis-mock .mavis-wordmark{font-size:13px;font-weight:800;color:var(--mavis-primary)}
.mavis-mock .mavis-pills{display:flex;align-items:center;gap:2px}
.mavis-mock .mavis-pill{display:flex;align-items:center;gap:4px;padding:5px 8px;border-radius:6px;font-size:7.5px;font-weight:500;color:var(--mavis-fg-2);white-space:nowrap}
.mavis-mock .mavis-pill svg{flex-shrink:0}
.mavis-mock .mavis-pill.on{background:var(--mavis-primary);color:#fff;font-weight:600}
.mavis-mock .mavis-nav-right{display:flex;align-items:center;gap:12px}
.mavis-mock .mavis-nav-icon{position:relative;color:var(--mavis-fg-2);display:flex}
.mavis-mock .mavis-bell-badge{position:absolute;top:-4px;right:-5px;background:#ef4444;color:#fff;border-radius:999px;min-width:9px;height:9px;padding:0 2px;font-size:5.5px;font-weight:700;display:flex;align-items:center;justify-content:center;line-height:1}
.mavis-mock .mavis-user{display:flex;align-items:center;gap:6px}
.mavis-mock .mavis-user-text{text-align:right;line-height:1.2}
.mavis-mock .mavis-user-name{font-size:7.5px;font-weight:700;color:var(--mavis-ink)}
.mavis-mock .mavis-user-role{font-size:6.5px;color:var(--mavis-fg-2)}

/* Pane — shared header conventions across all four screens. */
.mavis-mock .mavis-body{padding:14px 16px}
.mavis-mock .mavis-h1{font-size:16px;font-weight:800;letter-spacing:-.01em;color:var(--mavis-ink)}
.mavis-mock .mavis-sub{font-size:8.5px;color:var(--mavis-fg-2);margin-top:2px}
.mavis-mock .mavis-card{background:var(--mavis-card);border:1px solid var(--mavis-border);border-radius:10px}

/* Fleet Overview */
.mavis-mock .mavis-tabs{display:inline-flex;background:var(--mavis-muted);border-radius:8px;padding:3px;gap:2px;margin-top:10px}
.mavis-mock .mavis-tab{padding:4px 10px;border-radius:6px;font-size:7.5px;color:var(--mavis-fg-2)}
.mavis-mock .mavis-tab.on{background:#fff;color:var(--mavis-ink);font-weight:600;box-shadow:0 1px 2px rgba(0,0,0,.06)}
.mavis-mock .mavis-filterrow{display:flex;align-items:center;justify-content:space-between;margin-top:10px;font-size:7.5px;color:var(--mavis-fg-2)}
.mavis-mock .mavis-filterrow b{color:var(--mavis-ink);font-weight:600}
.mavis-mock .mavis-selects{display:flex;gap:6px}
.mavis-mock .mavis-select{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--mavis-border);border-radius:6px;padding:4px 8px;font-size:7px;color:var(--mavis-ink);background:#fff}
.mavis-mock .mavis-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}
.mavis-mock .mavis-stat{padding:10px 6px;text-align:center}
.mavis-mock .mavis-stat-icon{width:22px;height:22px;border-radius:8px;display:grid;place-items:center;margin:0 auto}
.mavis-mock .mavis-stat-label{font-size:7.5px;color:var(--mavis-fg-2);margin-top:6px}
.mavis-mock .mavis-stat-value{font-size:17px;font-weight:700;margin-top:1px}
.mavis-mock .mavis-stat-note{font-size:6.5px;font-weight:600;color:var(--mavis-success);margin-top:2px}
.mavis-mock .mavis-2col{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
.mavis-mock .mavis-card-inner{padding:10px 11px}
.mavis-mock .mavis-card-head{display:flex;align-items:flex-start;justify-content:space-between}
.mavis-mock .mavis-card-title{font-size:9.5px;font-weight:700;color:var(--mavis-ink)}
.mavis-mock .mavis-card-sub{font-size:7px;color:var(--mavis-fg-3);margin-top:1px}
.mavis-mock .mavis-card-link{font-size:7px;color:var(--mavis-primary);font-weight:600;white-space:nowrap}
.mavis-mock .mavis-badge{display:inline-flex;align-items:center;padding:2px 7px;border-radius:999px;font-size:6.5px;font-weight:700;white-space:nowrap}
.mavis-mock .mavis-badge.b-red{background:var(--mavis-red-bg);color:var(--mavis-red-fg)}
.mavis-mock .mavis-badge.b-orange{background:var(--mavis-orange-bg);color:var(--mavis-orange-fg)}
.mavis-mock .mavis-badge.b-amber{background:var(--mavis-amber-bg);color:var(--mavis-amber-fg)}
.mavis-mock .mavis-badge.b-green{background:var(--mavis-green-bg);color:var(--mavis-green-fg)}
.mavis-mock .mavis-badge.b-purple{background:var(--mavis-purple-bg);color:var(--mavis-purple-fg)}
.mavis-mock .mavis-badge.b-blue{background:var(--mavis-blue-bg);color:var(--mavis-blue-fg)}
.mavis-mock .mavis-defect{display:flex;align-items:flex-start;gap:7px;padding:6px 0}
.mavis-mock .mavis-defect + .mavis-defect{border-top:1px solid var(--mavis-border)}
.mavis-mock .mavis-defect-icon{width:16px;height:16px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;margin-top:1px}
.mavis-mock .mavis-defect-body{flex:1;min-width:0}
.mavis-mock .mavis-defect-title{font-size:7.5px;font-weight:600;color:var(--mavis-ink)}
.mavis-mock .mavis-defect-asset{font-size:6.5px;color:var(--mavis-fg-3);margin-top:2px}
.mavis-mock .mavis-defect-badgerow{display:flex;align-items:center;gap:4px;margin-top:3px}
.mavis-mock .mavis-view-only{display:inline-flex;align-items:center;gap:3px;border:1px solid var(--mavis-border);border-radius:999px;padding:1px 6px;font-size:6px;color:var(--mavis-fg-2)}
.mavis-mock .mavis-chev{color:var(--mavis-fg-3);flex-shrink:0;margin-top:2px}
.mavis-mock .mavis-asset{padding:6px 0}
.mavis-mock .mavis-asset + .mavis-asset{border-top:1px solid var(--mavis-border)}
.mavis-mock .mavis-asset-top{display:flex;align-items:center;gap:6px}
.mavis-mock .mavis-asset-id{font-size:8px;font-weight:700;color:var(--mavis-ink)}
.mavis-mock .mavis-asset-type{border:1px solid var(--mavis-border);border-radius:999px;padding:1px 6px;font-size:6px;color:var(--mavis-fg-2)}
.mavis-mock .mavis-asset .mavis-badge{margin-left:auto}
.mavis-mock .mavis-asset-meta{display:flex;justify-content:space-between;margin-top:3px;font-size:6.5px;color:var(--mavis-fg-3)}
.mavis-mock .mavis-cmtiles{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}
.mavis-mock .mavis-cmtile{background:var(--mavis-muted);border-radius:10px;padding:9px 6px;text-align:center}
.mavis-mock .mavis-cmtile-icon{width:18px;height:18px;border-radius:7px;display:grid;place-items:center;margin:0 auto}
.mavis-mock .mavis-cmtile-value{font-size:14px;font-weight:700;margin-top:5px}
.mavis-mock .mavis-cmtile-label{font-size:7px;font-weight:600;color:var(--mavis-ink);margin-top:2px}
.mavis-mock .mavis-cmtile-note{font-size:6px;color:var(--mavis-fg-3);margin-top:1px;line-height:1.3}
```

- [ ] **Step 3c: Add the gallery and the Fleet Overview figure**

Inside the MAVIS entry's `<div class="log-body">`, find the `Built with` div added in Task 1 (`<div><div class="lab">Built with</div><p>The functions were proved in Power Apps first`) and insert the gallery **between** that div and the `<p><a class="link-inline" href="/work#wp2">` paragraph that follows it:

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
            <div class="app-shots" role="list" aria-label="MAVIS app screens, rebuilt in HTML and CSS from the app's own interface code, design tokens and captured screens — not photos, not invented">
              <figure class="app-shot" role="listitem" tabindex="0">
                <div class="app-shot-chrome"><span class="app-shot-dots"><span></span><span></span><span></span></span><span class="app-shot-title">MAVIS — Fleet Overview</span></div>
                <div class="app-shot-frame">
                  <div class="mavis-mock" data-mock-width="720" data-screen="dashboard" aria-hidden="true">
                    <!--MAVIS-NAV:dashboard-->
                    <div class="mavis-body">
                      <div class="mavis-h1">Fleet Overview</div>
                      <div class="mavis-sub">Monitor vehicle/equipment status, serviceability trends, and maintenance requirements.</div>
                      <div class="mavis-tabs">
                        <span class="mavis-tab on">Overview</span>
                        <span class="mavis-tab">Scheduled Maintenance</span>
                        <span class="mavis-tab">Maintenance History</span>
                        <span class="mavis-tab">ADDL</span>
                      </div>
                      <div class="mavis-filterrow">
                        <span>Showing metrics for <b>all vehicle types</b> · <b>all categories</b></span>
                        <div class="mavis-selects">
                          <span class="mavis-select"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>All Categories<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>
                          <span class="mavis-select"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>All Types<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>
                        </div>
                      </div>
                      <div class="mavis-stats">
                        <div class="mavis-card mavis-stat">
                          <div class="mavis-stat-icon" style="background:var(--mavis-blue-bg)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg></div>
                          <div class="mavis-stat-label">Total Assets</div>
                          <div class="mavis-stat-value">48</div>
                        </div>
                        <div class="mavis-card mavis-stat">
                          <div class="mavis-stat-icon" style="background:var(--mavis-green-bg)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#047857" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg></div>
                          <div class="mavis-stat-label">Serviceable</div>
                          <div class="mavis-stat-value">36</div>
                          <div class="mavis-stat-note">75.0% Availability</div>
                        </div>
                        <div class="mavis-card mavis-stat">
                          <div class="mavis-stat-icon" style="background:var(--mavis-amber-bg)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg></div>
                          <div class="mavis-stat-label">Unserviceable</div>
                          <div class="mavis-stat-value">12</div>
                        </div>
                        <div class="mavis-card mavis-stat">
                          <div class="mavis-stat-icon" style="background:var(--mavis-blue-bg)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg></div>
                          <div class="mavis-stat-label">Reported Today</div>
                          <div class="mavis-stat-value">3</div>
                        </div>
                      </div>
                      <div class="mavis-2col">
                        <div class="mavis-card mavis-card-inner">
                          <div class="mavis-card-head">
                            <div><div class="mavis-card-title">Reported Defects</div><div class="mavis-card-sub">Recent issues requiring triage</div></div>
                            <span class="mavis-card-link">View All</span>
                          </div>
                          <div class="mavis-defect">
                            <span class="mavis-defect-icon" style="background:var(--mavis-red-bg)"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg></span>
                            <div class="mavis-defect-body">
                              <div class="mavis-defect-title">Air brake pressure drops below threshold on hold</div>
                              <div class="mavis-defect-asset">Asset ID: MID 4423</div>
                              <div class="mavis-defect-badgerow"><span class="mavis-badge b-red">Waiting for assessment</span></div>
                            </div>
                            <svg class="mavis-chev" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                          </div>
                          <div class="mavis-defect">
                            <span class="mavis-defect-icon" style="background:var(--mavis-amber-bg)"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg></span>
                            <div class="mavis-defect-body">
                              <div class="mavis-defect-title">Hydraulic seep at tow-arm cylinder</div>
                              <div class="mavis-defect-asset">Asset ID: AGE 1119</div>
                              <div class="mavis-defect-badgerow"><span class="mavis-badge b-orange">Pending CEN Endorsement</span></div>
                            </div>
                            <svg class="mavis-chev" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                          </div>
                          <div class="mavis-defect">
                            <span class="mavis-defect-icon" style="background:var(--mavis-green-bg)"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#047857" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg></span>
                            <div class="mavis-defect-body">
                              <div class="mavis-defect-title">Coolant temperature sensor intermittent</div>
                              <div class="mavis-defect-asset">Asset ID: MID 4490</div>
                              <div class="mavis-defect-badgerow"><span class="mavis-badge b-green">Ready for collection</span><span class="mavis-view-only">View Only</span></div>
                            </div>
                            <svg class="mavis-chev" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                          </div>
                        </div>
                        <div class="mavis-card mavis-card-inner">
                          <div class="mavis-card-head">
                            <div><div class="mavis-card-title">Asset Status</div><div class="mavis-card-sub">Monitor asset status…</div></div>
                            <span class="mavis-select"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>All Statuses</span>
                          </div>
                          <div class="mavis-asset">
                            <div class="mavis-asset-top">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
                              <span class="mavis-asset-id">AGE 1107</span>
                              <span class="mavis-asset-type">Ground Power Unit</span>
                              <span class="mavis-badge b-green">Serviceable</span>
                            </div>
                            <div class="mavis-asset-meta"><span>Dept: Air Power Generation<br>Sub-Dept: Flightline Ops</span><span>Last Service: 2mo ago</span></div>
                          </div>
                          <div class="mavis-asset">
                            <div class="mavis-asset-top">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
                              <span class="mavis-asset-id">AGE 1112</span>
                              <span class="mavis-asset-type">Aircraft Tug</span>
                              <span class="mavis-badge b-green">Serviceable</span>
                            </div>
                            <div class="mavis-asset-meta"><span>Dept: Air Power Generation<br>Sub-Dept: Flightline Ops</span><span>Last Service: Yesterday</span></div>
                          </div>
                          <div class="mavis-asset">
                            <div class="mavis-asset-top">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
                              <span class="mavis-asset-id">AGE 1119</span>
                              <span class="mavis-asset-type">Air Start Unit</span>
                              <span class="mavis-badge b-red">Defect</span>
                            </div>
                            <div class="mavis-asset-meta"><span>Dept: Air Power Generation<br>Sub-Dept: Flightline Ops</span><span>Reported: Today</span></div>
                          </div>
                        </div>
                      </div>
                      <div class="mavis-card mavis-card-inner" style="margin-top:8px">
                        <div class="mavis-card-head">
                          <div><div class="mavis-card-title">Corrective Maintenance Summary</div><div class="mavis-card-sub">CM activity at a glance — vehicles/equipment undergoing CM, ready for collection, and active ADDLs</div></div>
                          <span class="mavis-card-link">View All</span>
                        </div>
                        <div class="mavis-cmtiles">
                          <div class="mavis-cmtile">
                            <div class="mavis-cmtile-icon" style="background:var(--mavis-blue-bg)"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div>
                            <div class="mavis-cmtile-value">3</div>
                            <div class="mavis-cmtile-label">In Maintenance</div>
                            <div class="mavis-cmtile-note">Vehicles undergoing CM</div>
                          </div>
                          <div class="mavis-cmtile">
                            <div class="mavis-cmtile-icon" style="background:var(--mavis-green-bg)"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#047857" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg></div>
                            <div class="mavis-cmtile-value">2</div>
                            <div class="mavis-cmtile-label">Ready for Collection</div>
                            <div class="mavis-cmtile-note">Vehicles ready for collection after CM</div>
                          </div>
                          <div class="mavis-cmtile">
                            <div class="mavis-cmtile-icon" style="background:var(--mavis-blue-bg)"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></div>
                            <div class="mavis-cmtile-value">2</div>
                            <div class="mavis-cmtile-label">Active ADDL</div>
                            <div class="mavis-cmtile-note">Acceptable Defect Deferred Logs currently active</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <figcaption class="app-shot-cap"><div class="st">Fleet Overview</div><div class="sd">Availability is computed from three independent unserviceability sources, not typed in — so the dashboard and the database cannot disagree</div></figcaption>
              </figure>
            </div>
            </div>
          </div>
```

- [ ] **Step 3d: Expand the navbar placeholder**

`<!--MAVIS-NAV:dashboard-->` above is a marker, not shippable output. Replace that single comment line with this markup, which is the navbar in full:

```html
                    <div class="mavis-nav">
                      <div class="mavis-nav-left">
                        <span class="mavis-wordmark">MAVIS</span>
                        <div class="mavis-pills">
                          <span class="mavis-pill on"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg><span>Dashboard</span></span>
                          <span class="mavis-pill"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg><span>Corrective Maintenance</span></span>
                          <span class="mavis-pill"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/></svg><span>Preventive Maintenance</span></span>
                          <span class="mavis-pill"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg><span>Workshop Status</span></span>
                          <span class="mavis-pill"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg><span>Reports</span></span>
                        </div>
                      </div>
                      <div class="mavis-nav-right">
                        <span class="mavis-nav-icon"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg></span>
                        <span class="mavis-nav-icon"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg><span class="mavis-bell-badge">2</span></span>
                        <span class="mavis-user">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          <span class="mavis-user-text"><span class="mavis-user-name">Ops Duty Officer</span><br><span class="mavis-user-role">Admin</span></span>
                        </span>
                      </div>
                    </div>
```

**Tasks 3, 4 and 5 each reuse this exact navbar block**, changing only which `.mavis-pill` carries `on`. Keep it byte-identical otherwise.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node scripts/verify-mavis.mjs`
Expected: PASS on all checks, including the three regression checks. `console messages: 0`, `external requests: 0`.

Then confirm visually: open the page, expand the MAVIS entry, and compare the thumbnail against `screens/01-dashboard.png`. Click it and confirm the lightbox opens the mock scaled up, not clipped, and does not force the dialog body to scroll.

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-mavis.mjs public/projects.html
git commit -m "Add the MAVIS screen gallery and its Fleet Overview

Registers .mavis-mock as a fifth mock family by appending to MOCK_SEL,
the lightbox positioning rule and the frame-scale rules — no existing
mock family's line is touched. Authored at 720px with no fixed height
(the .mf-mock convention, not .gr-mock's), scaled by transform:scale(.4)
into the 288px frame.

Builds the shared navbar (wordmark, five pills, bell badge, signed-in
persona) and the first screen: four stat tiles, the Reported Defects
and Asset Status panels, and the Corrective Maintenance summary tiles,
all read off screens/01-dashboard.png. Stops before the PM Summary
tiles, Pending Approval card and footer per the design spec's ~700px
content budget."
```

---

## Task 3: Corrective Maintenance screen

**Files:**
- Modify: `public/projects.html` — append CSS to the `.mavis-mock` block; append a `<figure>` to the MAVIS `.app-shots`
- Modify: `scripts/verify-mavis.mjs` — add Corrective Maintenance checks

**Interfaces:**
- Consumes: `.mavis-mock` tokens, the navbar markup and `.mavis-h1`/`.mavis-sub`/`.mavis-card`/`.mavis-badge` from Task 2.
- Produces: nothing later tasks depend on.

**Read `screens/02-corrective-maintenance.png` before starting.**

- [ ] **Step 1: Write the failing test**

In `scripts/verify-mavis.mjs`, insert immediately **before** `// ── Report ─────`:

```js
// ── Check group 8: Corrective Maintenance ────────────────────────────
const cm = await page.evaluate(() => {
  const mock = document.querySelector('.mavis-mock[data-screen="corrective"]');
  if (!mock) return { found: false };
  return {
    found: true,
    active: (mock.querySelector('.mavis-pill.on') || {}).textContent.trim(),
    h1: (mock.querySelector('.mavis-h1') || {}).textContent.trim(),
    sub: (mock.querySelector('.mavis-sub') || {}).textContent.trim(),
    btn: (mock.querySelector('.mavis-cm-btn') || {}).textContent.trim(),
    section: (mock.querySelector('.mavis-cm-h2') || {}).textContent.trim(),
    reqs: Array.prototype.slice.call(mock.querySelectorAll('.mavis-req')).map((r) => ({
      id: (r.querySelector('.mavis-req-id') || {}).textContent.trim(),
      badge: (r.querySelector('.mavis-badge-ic') || {}).textContent.trim(),
      refid: (r.querySelector('.mavis-req-refid') || {}).textContent.trim(),
      descLabel: (r.querySelector('.mavis-req-desc-label') || {}).textContent.trim(),
      descText: (r.querySelector('.mavis-req-desc-text') || { textContent: '' }).textContent.trim(),
      loc: (r.querySelector('.mavis-req-loc') || { textContent: '' }).textContent.trim(),
      addlBtn: !!r.querySelector('.mavis-req-addl-btn'),
      reported: (r.querySelector('.mavis-req-reported') || { textContent: '' }).textContent.trim(),
      recovery: (r.querySelector('.mavis-req-recovery') || { textContent: '' }).textContent.trim(),
    })),
  };
});

check('cm: screen exists', cm.found);
check('cm: Corrective Maintenance is the active nav pill', cm.found && cm.active === 'Corrective Maintenance', cm.active);
check('cm: heading + subtitle match the capture',
  cm.found && cm.h1 === 'Corrective Maintenance'
  && cm.sub === 'Manage and track vehicle defects and repairs');
check('cm: Create New Report button present', cm.found && cm.btn === 'Create New Report', cm.btn);
check('cm: section heading reads Active Defect Reports', cm.found && cm.section === 'Active Defect Reports', cm.section);
check('cm: three defect cards', cm.found && cm.reqs.length === 3, String(cm.reqs.length));
check('cm: card 1 (MID 4423) matches the capture',
  cm.found && cm.reqs[0] && cm.reqs[0].id === 'MID 4423'
  && cm.reqs[0].badge === 'Waiting for assessment' && cm.reqs[0].refid === 'ID: #REQ-2026-001'
  && cm.reqs[0].descLabel === 'DEFECT DESCRIPTION'
  && cm.reqs[0].descText === 'Air brake pressure drops below threshold on hold'
  && cm.reqs[0].loc === 'Location: Hangar 2 Apron'
  && !cm.reqs[0].addlBtn
  && /11 Aug 2026/.test(cm.reqs[0].reported) && /12:39 AM/.test(cm.reqs[0].reported),
  JSON.stringify(cm.reqs[0]));
check('cm: card 2 (AGE 1119) matches the capture, with Raise ADDL and Expected Recovery',
  cm.found && cm.reqs[1] && cm.reqs[1].id === 'AGE 1119'
  && cm.reqs[1].badge === 'Pending CEN Endorsement' && cm.reqs[1].refid === 'ID: #REQ-2026-002'
  && cm.reqs[1].descText === 'Hydraulic seep at tow-arm cylinder'
  && cm.reqs[1].loc === 'Location: Vehicle Park North'
  && cm.reqs[1].addlBtn
  && cm.reqs[1].recovery === 'Expected Recovery: 17 Aug 2026',
  JSON.stringify(cm.reqs[1]));
check('cm: card 3 (MID 4490) is deliberately cut off, matching the capture',
  cm.found && cm.reqs[2] && cm.reqs[2].id === 'MID 4490'
  && cm.reqs[2].badge === 'Ready for collection' && cm.reqs[2].refid === 'ID: #REQ-2026-003'
  && cm.reqs[2].descLabel === 'DEFECT DESCRIPTION'
  && cm.reqs[2].descText === '' && cm.reqs[2].loc === '' && cm.reqs[2].reported === '',
  JSON.stringify(cm.reqs[2]));
check('cm: badge colours per screen — amber/orange/purple, not the dashboard\'s red/orange/green',
  cm.found && cm.reqs.length === 3 && (() => {
    const classes = Array.prototype.slice.call(
      document.querySelector('.mavis-mock[data-screen="corrective"]').querySelectorAll('.mavis-badge-ic')
    ).map((b) => b.className);
    return classes[0].includes('b-amber') && classes[1].includes('b-orange') && classes[2].includes('b-purple');
  })());
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/verify-mavis.mjs`
Expected: FAIL on all group-8 checks (`cm: screen exists` false). Everything from Tasks 1–2 still PASSes.

- [ ] **Step 3a: Append the CSS**

Add to the end of the `.mavis-mock` style block:

```css
/* Corrective Maintenance */
.mavis-mock .mavis-cm-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.mavis-mock .mavis-cm-btn{background:var(--mavis-primary);color:#fff;border-radius:8px;padding:8px 14px;font-size:8px;font-weight:700;white-space:nowrap}
.mavis-mock .mavis-cm-h2{font-size:11px;font-weight:700;color:var(--mavis-ink);margin-top:14px}
.mavis-mock .mavis-badge-ic{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:999px;font-size:7.5px;font-weight:700}
.mavis-mock .mavis-req{margin-top:9px;padding:10px 12px}
.mavis-mock .mavis-req-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.mavis-mock .mavis-req-top-l{display:flex;align-items:center;gap:8px}
.mavis-mock .mavis-req-id{font-size:12px;font-weight:800;color:var(--mavis-ink)}
.mavis-mock .mavis-req-refid{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:7px;color:var(--mavis-fg-3)}
.mavis-mock .mavis-req-desc-wrap{border-left:3px solid var(--mavis-primary);padding-left:8px;margin-top:8px}
.mavis-mock .mavis-req-desc-label{font-size:6.5px;letter-spacing:.06em;font-weight:700;color:var(--mavis-fg-3)}
.mavis-mock .mavis-req-desc-text{font-size:9px;color:var(--mavis-ink);margin-top:2px}
.mavis-mock .mavis-req-loc{font-size:7.5px;color:var(--mavis-fg-2);margin-top:7px}
.mavis-mock .mavis-req-loc b{color:var(--mavis-ink);font-weight:600}
.mavis-mock .mavis-req-addl-btn{display:inline-flex;align-items:center;gap:5px;background:var(--mavis-primary);color:#fff;border-radius:7px;padding:6px 11px;font-size:7.5px;font-weight:700;margin-top:8px}
.mavis-mock .mavis-req-footer{display:flex;align-items:center;justify-content:space-between;margin-top:9px;padding-top:8px;border-top:1px solid var(--mavis-border)}
.mavis-mock .mavis-req-reported{display:flex;align-items:center;gap:10px;font-size:7px;color:var(--mavis-fg-3)}
.mavis-mock .mavis-req-reported span{display:inline-flex;align-items:center;gap:3px}
.mavis-mock .mavis-req-recovery{display:inline-flex;align-items:center;border:1px solid var(--mavis-ring);color:var(--mavis-blue-fg);border-radius:999px;padding:2px 8px;font-size:6.5px;font-weight:600}
```

- [ ] **Step 3b: Append the figure**

Add inside the MAVIS `<div class="app-shots">`, after the Fleet Overview `</figure>`:

```html
              <figure class="app-shot" role="listitem" tabindex="0">
                <div class="app-shot-chrome"><span class="app-shot-dots"><span></span><span></span><span></span></span><span class="app-shot-title">MAVIS — Corrective Maintenance</span></div>
                <div class="app-shot-frame">
                  <div class="mavis-mock" data-mock-width="720" data-screen="corrective" aria-hidden="true">
                    <div class="mavis-nav">
                      <div class="mavis-nav-left">
                        <span class="mavis-wordmark">MAVIS</span>
                        <div class="mavis-pills">
                          <span class="mavis-pill"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg><span>Dashboard</span></span>
                          <span class="mavis-pill on"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg><span>Corrective Maintenance</span></span>
                          <span class="mavis-pill"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/></svg><span>Preventive Maintenance</span></span>
                          <span class="mavis-pill"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg><span>Workshop Status</span></span>
                          <span class="mavis-pill"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg><span>Reports</span></span>
                        </div>
                      </div>
                      <div class="mavis-nav-right">
                        <span class="mavis-nav-icon"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg></span>
                        <span class="mavis-nav-icon"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg><span class="mavis-bell-badge">2</span></span>
                        <span class="mavis-user">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          <span class="mavis-user-text"><span class="mavis-user-name">Ops Duty Officer</span><br><span class="mavis-user-role">Admin</span></span>
                        </span>
                      </div>
                    </div>
                    <div class="mavis-body">
                      <div class="mavis-cm-head">
                        <div>
                          <div class="mavis-h1">Corrective Maintenance</div>
                          <div class="mavis-sub">Manage and track vehicle defects and repairs</div>
                        </div>
                        <span class="mavis-cm-btn">Create New Report</span>
                      </div>
                      <div class="mavis-cm-h2">Active Defect Reports</div>

                      <div class="mavis-card mavis-req">
                        <div class="mavis-req-top">
                          <div class="mavis-req-top-l">
                            <span class="mavis-req-id">MID 4423</span>
                            <span class="mavis-badge-ic b-amber"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>Waiting for assessment</span>
                          </div>
                          <span class="mavis-req-refid">ID: #REQ-2026-001</span>
                        </div>
                        <div class="mavis-req-desc-wrap">
                          <div class="mavis-req-desc-label">DEFECT DESCRIPTION</div>
                          <div class="mavis-req-desc-text">Air brake pressure drops below threshold on hold</div>
                        </div>
                        <div class="mavis-req-loc"><b>Location:</b> Hangar 2 Apron</div>
                        <div class="mavis-req-footer">
                          <span class="mavis-req-reported"><span><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>Reported: 11 Aug 2026</span><span><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>12:39 AM</span></span>
                        </div>
                      </div>

                      <div class="mavis-card mavis-req">
                        <div class="mavis-req-top">
                          <div class="mavis-req-top-l">
                            <span class="mavis-req-id">AGE 1119</span>
                            <span class="mavis-badge-ic b-orange"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>Pending CEN Endorsement</span>
                          </div>
                          <span class="mavis-req-refid">ID: #REQ-2026-002</span>
                        </div>
                        <div class="mavis-req-desc-wrap">
                          <div class="mavis-req-desc-label">DEFECT DESCRIPTION</div>
                          <div class="mavis-req-desc-text">Hydraulic seep at tow-arm cylinder</div>
                        </div>
                        <div class="mavis-req-loc"><b>Location:</b> Vehicle Park North</div>
                        <span class="mavis-req-addl-btn"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>Raise ADDL</span>
                        <div class="mavis-req-footer">
                          <span class="mavis-req-reported"><span><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>Reported: 11 Aug 2026</span><span><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>12:39 AM</span></span>
                          <span class="mavis-req-recovery">Expected Recovery: 17 Aug 2026</span>
                        </div>
                      </div>

                      <!-- Card 3 is deliberately cut off here, matching the source
                           capture (screens/02-corrective-maintenance.png), which
                           clips mid-card. Do NOT fill in a description, location
                           or footer from MARKETING_SPEC.md §7 — that table is
                           highly likely correct but is not what the capture
                           shows, and this file's rule is "read off the capture",
                           not "read off the fixture list". See design spec §5.2. -->
                      <div class="mavis-card mavis-req" style="padding-bottom:4px">
                        <div class="mavis-req-top">
                          <div class="mavis-req-top-l">
                            <span class="mavis-req-id">MID 4490</span>
                            <span class="mavis-badge-ic b-purple"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>Ready for collection</span>
                          </div>
                          <span class="mavis-req-refid">ID: #REQ-2026-003</span>
                        </div>
                        <div class="mavis-req-desc-wrap">
                          <div class="mavis-req-desc-label">DEFECT DESCRIPTION</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <figcaption class="app-shot-cap"><div class="st">Corrective Maintenance</div><div class="sd">Every defect is a seven-state approval chain, not a status dropdown — and a deferred one (ADDL) carries its own expected-recovery date</div></figcaption>
              </figure>
```

**Card 3's markup is not a mistake — it is meant to end after the `DEFECT DESCRIPTION` label, with no description text, no location, no footer.** This reproduces the source capture, which is itself cut off there. Do not "complete" this card.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node scripts/verify-mavis.mjs`
Expected: PASS on all checks, including the group-8 badge-colour check confirming `b-amber` / `b-orange` / `b-purple` — deliberately different from the dashboard's `b-red` / `b-orange` / `b-green`.

Then confirm visually: compare the thumbnail against `screens/02-corrective-maintenance.png`, and open the lightbox to confirm card 3 visibly ends after "DEFECT DESCRIPTION" with no further content, matching the capture's own cutoff.

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-mavis.mjs public/projects.html
git commit -m "Add the Corrective Maintenance screen to the MAVIS gallery

Three defect cards read off screens/02-corrective-maintenance.png: the
full seven-state approval chain vocabulary (Waiting for assessment,
Pending CEN Endorsement, Ready for collection), the Raise ADDL action
and its Expected Recovery chip. Card 3 is left exactly as cut off in
the source capture rather than completed from the fixture table in
MARKETING_SPEC.md — recorded in a code comment so it isn't 'fixed'
later.

Badge colours deliberately do not match the dashboard's for the same
two status names (amber/purple here vs. red/green there) — both are
what their own screen actually shows."
```

---

## Task 4: Preventive Maintenance screen

**Files:**
- Modify: `public/projects.html` — append CSS to the `.mavis-mock` block; append a `<figure>` to the MAVIS `.app-shots`
- Modify: `scripts/verify-mavis.mjs` — add Preventive Maintenance checks

**Interfaces:**
- Consumes: `.mavis-mock` tokens, the navbar markup and `.mavis-card` from Task 2.
- Produces: nothing later tasks depend on.

**Read `screens/03-preventive-maintenance.png` before starting.**

- [ ] **Step 1: Write the failing test**

In `scripts/verify-mavis.mjs`, insert immediately **before** `// ── Report ─────`:

```js
// ── Check group 9: Preventive Maintenance ────────────────────────────
const pm = await page.evaluate(() => {
  const mock = document.querySelector('.mavis-mock[data-screen="preventive"]');
  if (!mock) return { found: false };
  const sectionHeads = Array.prototype.slice.call(mock.querySelectorAll('.mavis-section-head')).map((s) => ({
    label: (s.querySelector('.mavis-section-label') || {}).textContent.trim(),
    count: (s.querySelector('.mavis-section-count') || {}).textContent.trim(),
  }));
  return {
    found: true,
    active: (mock.querySelector('.mavis-pill.on') || {}).textContent.trim(),
    h1: (mock.querySelector('.mavis-h1') || {}).textContent.trim(),
    sub: (mock.querySelector('.mavis-sub') || {}).textContent.trim(),
    btn: (mock.querySelector('.mavis-pm-btn') || {}).textContent.trim(),
    sectionHeads,
    callins: Array.prototype.slice.call(mock.querySelectorAll('.mavis-callin-card')).map((c) => ({
      id: (c.querySelector('.mavis-callin-id') || {}).textContent.trim(),
      meta: (c.querySelector('.mavis-callin-meta') || {}).textContent.trim(),
      pills: Array.prototype.slice.call(c.querySelectorAll('.mavis-chip-outline')).map((p) => p.textContent.trim()),
      calledIn: (c.querySelector('.mavis-callin-calledin') || {}).textContent.trim(),
      pmDue: (c.querySelector('.mavis-callin-pmdue') || {}).textContent.trim(),
      dueChipClass: (c.querySelector('.mavis-callin-duechip') || { className: '' }).className,
    })),
    handed: Array.prototype.slice.call(mock.querySelectorAll('.mavis-handed-card')).map((c) => ({
      id: (c.querySelector('.mavis-handed-id') || {}).textContent.trim(),
      dept: (c.querySelector('.mavis-handed-dept') || {}).textContent.trim(),
      subdept: (c.querySelector('.mavis-handed-subdept') || {}).textContent.trim(),
      pill: (c.querySelector('.mavis-chip-outline') || {}).textContent.trim(),
      row: (c.querySelector('.mavis-handed-row') || {}).textContent.trim(),
      btn: (c.querySelector('.mavis-handed-btn') || {}).textContent.trim(),
    })),
  };
});

check('pm: screen exists', pm.found);
check('pm: Preventive Maintenance is the active nav pill', pm.found && pm.active === 'Preventive Maintenance', pm.active);
check('pm: heading + subtitle match the capture',
  pm.found && pm.h1 === 'Preventive Maintenance' && pm.sub === 'Track vehicle handovers and scheduled maintenance');
check('pm: Handover Vehicle button present', pm.found && pm.btn === 'Handover Vehicle', pm.btn);
check('pm: three section headers with the captured counts',
  pm.found && JSON.stringify(pm.sectionHeads) === JSON.stringify([
    { label: 'Call-In', count: '3' },
    { label: 'Handed Over', count: '2' },
    { label: 'Pending Quotation Endorsement', count: '1' },
  ]), JSON.stringify(pm.sectionHeads));
check('pm: three Call-In cards matching the capture',
  pm.found && JSON.stringify(pm.callins.map((c) => ({
    id: c.id, meta: c.meta, pills: c.pills, calledIn: c.calledIn, pmDue: c.pmDue,
  }))) === JSON.stringify([
    { id: 'MID 4460', meta: 'Ground Logistics · Utility Truck', pills: ['Vehicle', 'Base Bravo', 'C1'],
      calledIn: 'Called in: 14 Aug 2026 (in 3 days)', pmDue: 'PM Due: 03 Sep 2026 (in 24d)' },
    { id: 'AGE 1151', meta: 'Ground Logistics · Ground Power Unit', pills: ['Aviation Ground Equipment', 'Base Bravo', 'Monthly Inspection'],
      calledIn: 'Called in: 16 Aug 2026 (in 5 days)', pmDue: 'PM Due: 16 Aug 2026 (in 6d)' },
    { id: 'MID 4514', meta: 'Ground Logistics · Utility Truck', pills: ['Vehicle', 'Base Bravo', 'B'],
      calledIn: 'Called in: 18 Aug 2026 (in 7 days)', pmDue: 'PM Due: 07 Sep 2026 (in 28d)' },
  ]), JSON.stringify(pm.callins));
check('pm: PM Due urgency chip colours — green, amber, green',
  pm.found && pm.callins.length === 3
  && pm.callins[0].dueChipClass.includes('due-green')
  && pm.callins[1].dueChipClass.includes('due-amber')
  && pm.callins[2].dueChipClass.includes('due-green'),
  JSON.stringify(pm.callins.map((c) => c.dueChipClass)));
check('pm: two Handed Over cards matching the capture',
  pm.found && JSON.stringify(pm.handed) === JSON.stringify([
    { id: 'AGE 1170', dept: 'Engineering Support', subdept: 'Sub-Dept: Workshop Engineering', pill: 'C1/TCP', row: 'Handed over 2 days ago', btn: 'Start PM' },
    { id: 'MID 4483', dept: 'Engineering Support', subdept: 'Sub-Dept: Workshop Engineering', pill: 'C2/TA1', row: 'Handed over 3 days ago', btn: 'Start PM' },
  ]), JSON.stringify(pm.handed));
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/verify-mavis.mjs`
Expected: FAIL on all group-9 checks (`pm: screen exists` false). Everything from Tasks 1–3 still PASSes.

- [ ] **Step 3a: Append the CSS**

Add to the end of the `.mavis-mock` style block:

```css
/* Preventive Maintenance */
.mavis-mock .mavis-pm-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.mavis-mock .mavis-pm-btn{display:inline-flex;align-items:center;gap:5px;background:var(--mavis-primary);color:#fff;border-radius:8px;padding:8px 14px;font-size:8px;font-weight:700;white-space:nowrap}
.mavis-mock .mavis-section-head{display:flex;align-items:center;gap:6px;margin-top:14px}
.mavis-mock .mavis-section-label{font-size:10px;font-weight:700;color:var(--mavis-ink)}
.mavis-mock .mavis-section-count{background:var(--mavis-muted);color:var(--mavis-fg-2);border-radius:999px;padding:1px 7px;font-size:7px;font-weight:700}
.mavis-mock .mavis-chip-outline{display:inline-flex;align-items:center;border:1px solid var(--mavis-border);border-radius:999px;padding:2px 7px;font-size:6.5px;color:var(--mavis-ink);font-weight:500}
.mavis-mock .mavis-callin-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}
.mavis-mock .mavis-callin-card{border-top:3px solid var(--mavis-ring);padding:9px 10px}
.mavis-mock .mavis-callin-top{display:flex;align-items:flex-start;justify-content:space-between;gap:6px}
.mavis-mock .mavis-callin-label{font-size:6px;letter-spacing:.06em;font-weight:700;color:var(--mavis-fg-3)}
.mavis-mock .mavis-callin-id{font-size:10px;font-weight:800;color:var(--mavis-ink);margin-top:2px}
.mavis-mock .mavis-callin-meta{font-size:6.5px;color:var(--mavis-fg-2);margin-top:2px}
.mavis-mock .mavis-callin-pills{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}
.mavis-mock .mavis-callin-row{display:flex;align-items:center;gap:4px;font-size:6.5px;color:var(--mavis-fg-2);margin-top:6px}
.mavis-mock .mavis-callin-duechip{display:inline-block;border-radius:5px;padding:1px 6px;font-size:6.5px;font-weight:600;margin-left:auto}
.mavis-mock .mavis-callin-duechip.due-green{background:var(--mavis-green-bg);color:var(--mavis-green-fg)}
.mavis-mock .mavis-callin-duechip.due-amber{background:var(--mavis-amber-bg);color:var(--mavis-amber-fg)}
.mavis-mock .mavis-handed-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:8px}
.mavis-mock .mavis-handed-card{border-top:3px solid var(--mavis-warning);padding:9px 10px}
.mavis-mock .mavis-handed-top{display:flex;align-items:flex-start;justify-content:space-between;gap:6px}
.mavis-mock .mavis-handed-id{font-size:10px;font-weight:800;color:var(--mavis-ink);margin-top:2px}
.mavis-mock .mavis-handed-dept{font-size:6.5px;color:var(--mavis-fg-2);margin-top:2px}
.mavis-mock .mavis-handed-subdept{font-size:6.5px;color:var(--mavis-fg-3);margin-top:1px}
.mavis-mock .mavis-handed-row{display:flex;align-items:center;gap:4px;font-size:6.5px;color:var(--mavis-fg-2);margin-top:7px}
.mavis-mock .mavis-handed-btn{display:flex;align-items:center;justify-content:center;gap:5px;width:100%;background:var(--mavis-primary);color:#fff;border-radius:7px;padding:6px 0;font-size:7.5px;font-weight:700;margin-top:8px}
```

- [ ] **Step 3b: Append the figure**

Add inside the MAVIS `<div class="app-shots">`, after the Corrective Maintenance `</figure>`:

```html
              <figure class="app-shot" role="listitem" tabindex="0">
                <div class="app-shot-chrome"><span class="app-shot-dots"><span></span><span></span><span></span></span><span class="app-shot-title">MAVIS — Preventive Maintenance</span></div>
                <div class="app-shot-frame">
                  <div class="mavis-mock" data-mock-width="720" data-screen="preventive" aria-hidden="true">
                    <div class="mavis-nav">
                      <div class="mavis-nav-left">
                        <span class="mavis-wordmark">MAVIS</span>
                        <div class="mavis-pills">
                          <span class="mavis-pill"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg><span>Dashboard</span></span>
                          <span class="mavis-pill"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg><span>Corrective Maintenance</span></span>
                          <span class="mavis-pill on"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/></svg><span>Preventive Maintenance</span></span>
                          <span class="mavis-pill"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg><span>Workshop Status</span></span>
                          <span class="mavis-pill"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg><span>Reports</span></span>
                        </div>
                      </div>
                      <div class="mavis-nav-right">
                        <span class="mavis-nav-icon"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg></span>
                        <span class="mavis-nav-icon"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg><span class="mavis-bell-badge">2</span></span>
                        <span class="mavis-user">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          <span class="mavis-user-text"><span class="mavis-user-name">Ops Duty Officer</span><br><span class="mavis-user-role">Admin</span></span>
                        </span>
                      </div>
                    </div>
                    <div class="mavis-body">
                      <div class="mavis-pm-head">
                        <div>
                          <div class="mavis-h1">Preventive Maintenance</div>
                          <div class="mavis-sub">Track vehicle handovers and scheduled maintenance</div>
                        </div>
                        <span class="mavis-pm-btn"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>Handover Vehicle</span>
                      </div>

                      <div class="mavis-section-head"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2a9 9 0 0 1 9 9"/><path d="M13 6a5 5 0 0 1 5 5"/><path d="M10.268 21.487a.5.5 0 0 0 .686-.172l1.545-2.058a1 1 0 0 1 1.099-.398l4.435 1.108a1 1 0 0 1 .767.972V19.9a2 2 0 0 1-2.083 2A17.607 17.607 0 0 1 2.1 6.083 2 2 0 0 1 4.1 4h1.83a1 1 0 0 1 .972.777l1.108 4.435a1 1 0 0 1-.397 1.1l-2.06 1.544a.5.5 0 0 0-.172.686 12.06 12.06 0 0 0 5.887 5.905"/></svg><span class="mavis-section-label">Call-In</span><span class="mavis-section-count">3</span></div>
                      <div class="mavis-callin-grid">
                        <div class="mavis-card mavis-callin-card">
                          <div class="mavis-callin-top">
                            <div><div class="mavis-callin-label">VEHICLE</div><div class="mavis-callin-id">MID 4460</div></div>
                            <span class="mavis-badge b-blue">Awaiting Handover</span>
                          </div>
                          <div class="mavis-callin-meta">Ground Logistics · Utility Truck</div>
                          <div class="mavis-callin-pills"><span class="mavis-chip-outline">Vehicle</span><span class="mavis-chip-outline">Base Bravo</span><span class="mavis-chip-outline">C1</span></div>
                          <div class="mavis-callin-row"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2a9 9 0 0 1 9 9"/><path d="M13 6a5 5 0 0 1 5 5"/><path d="M10.268 21.487a.5.5 0 0 0 .686-.172l1.545-2.058a1 1 0 0 1 1.099-.398l4.435 1.108a1 1 0 0 1 .767.972V19.9a2 2 0 0 1-2.083 2A17.607 17.607 0 0 1 2.1 6.083 2 2 0 0 1 4.1 4h1.83a1 1 0 0 1 .972.777l1.108 4.435a1 1 0 0 1-.397 1.1l-2.06 1.544a.5.5 0 0 0-.172.686 12.06 12.06 0 0 0 5.887 5.905"/></svg><span class="mavis-callin-calledin">Called in: 14 Aug 2026 (in 3 days)</span></div>
                          <div class="mavis-callin-row"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg><span class="mavis-callin-pmdue">PM Due:</span><span class="mavis-callin-duechip due-green">03 Sep 2026 (in 24d)</span></div>
                        </div>
                        <div class="mavis-card mavis-callin-card">
                          <div class="mavis-callin-top">
                            <div><div class="mavis-callin-label">VEHICLE</div><div class="mavis-callin-id">AGE 1151</div></div>
                            <span class="mavis-badge b-blue">Awaiting Handover</span>
                          </div>
                          <div class="mavis-callin-meta">Ground Logistics · Ground Power Unit</div>
                          <div class="mavis-callin-pills"><span class="mavis-chip-outline">Aviation Ground Equipment</span><span class="mavis-chip-outline">Base Bravo</span><span class="mavis-chip-outline">Monthly Inspection</span></div>
                          <div class="mavis-callin-row"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2a9 9 0 0 1 9 9"/><path d="M13 6a5 5 0 0 1 5 5"/><path d="M10.268 21.487a.5.5 0 0 0 .686-.172l1.545-2.058a1 1 0 0 1 1.099-.398l4.435 1.108a1 1 0 0 1 .767.972V19.9a2 2 0 0 1-2.083 2A17.607 17.607 0 0 1 2.1 6.083 2 2 0 0 1 4.1 4h1.83a1 1 0 0 1 .972.777l1.108 4.435a1 1 0 0 1-.397 1.1l-2.06 1.544a.5.5 0 0 0-.172.686 12.06 12.06 0 0 0 5.887 5.905"/></svg><span class="mavis-callin-calledin">Called in: 16 Aug 2026 (in 5 days)</span></div>
                          <div class="mavis-callin-row"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg><span class="mavis-callin-pmdue">PM Due:</span><span class="mavis-callin-duechip due-amber">16 Aug 2026 (in 6d)</span></div>
                        </div>
                        <div class="mavis-card mavis-callin-card">
                          <div class="mavis-callin-top">
                            <div><div class="mavis-callin-label">VEHICLE</div><div class="mavis-callin-id">MID 4514</div></div>
                            <span class="mavis-badge b-blue">Awaiting Handover</span>
                          </div>
                          <div class="mavis-callin-meta">Ground Logistics · Utility Truck</div>
                          <div class="mavis-callin-pills"><span class="mavis-chip-outline">Vehicle</span><span class="mavis-chip-outline">Base Bravo</span><span class="mavis-chip-outline">B</span></div>
                          <div class="mavis-callin-row"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2a9 9 0 0 1 9 9"/><path d="M13 6a5 5 0 0 1 5 5"/><path d="M10.268 21.487a.5.5 0 0 0 .686-.172l1.545-2.058a1 1 0 0 1 1.099-.398l4.435 1.108a1 1 0 0 1 .767.972V19.9a2 2 0 0 1-2.083 2A17.607 17.607 0 0 1 2.1 6.083 2 2 0 0 1 4.1 4h1.83a1 1 0 0 1 .972.777l1.108 4.435a1 1 0 0 1-.397 1.1l-2.06 1.544a.5.5 0 0 0-.172.686 12.06 12.06 0 0 0 5.887 5.905"/></svg><span class="mavis-callin-calledin">Called in: 18 Aug 2026 (in 7 days)</span></div>
                          <div class="mavis-callin-row"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg><span class="mavis-callin-pmdue">PM Due:</span><span class="mavis-callin-duechip due-green">07 Sep 2026 (in 28d)</span></div>
                        </div>
                      </div>

                      <div class="mavis-section-head"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg><span class="mavis-section-label">Handed Over</span><span class="mavis-section-count">2</span></div>
                      <div class="mavis-handed-grid">
                        <div class="mavis-card mavis-handed-card">
                          <div class="mavis-handed-top">
                            <div><div class="mavis-callin-label">ASSET</div><div class="mavis-handed-id">AGE 1170</div></div>
                            <span class="mavis-badge b-amber">Awaiting Start</span>
                          </div>
                          <div class="mavis-handed-dept">Engineering Support</div>
                          <div class="mavis-handed-subdept">Sub-Dept: Workshop Engineering</div>
                          <div class="mavis-callin-pills"><span class="mavis-chip-outline">C1/TCP</span></div>
                          <div class="mavis-handed-row"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>Handed over 2 days ago</div>
                          <span class="mavis-handed-btn"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>Start PM</span>
                        </div>
                        <div class="mavis-card mavis-handed-card">
                          <div class="mavis-handed-top">
                            <div><div class="mavis-callin-label">ASSET</div><div class="mavis-handed-id">MID 4483</div></div>
                            <span class="mavis-badge b-amber">Awaiting Start</span>
                          </div>
                          <div class="mavis-handed-dept">Engineering Support</div>
                          <div class="mavis-handed-subdept">Sub-Dept: Workshop Engineering</div>
                          <div class="mavis-callin-pills"><span class="mavis-chip-outline">C2/TA1</span></div>
                          <div class="mavis-handed-row"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>Handed over 3 days ago</div>
                          <span class="mavis-handed-btn"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>Start PM</span>
                        </div>
                      </div>

                      <!-- The top edge of the next section, exactly as the capture
                           shows it before the crop — header only, no cards. Per
                           design spec §5.3, MID 4514 appears here but not in
                           MARKETING_SPEC.md §7's named-asset list; it is one of
                           the fleet's quiet filler assets and is reproduced as
                           captured, not "corrected" against that list. -->
                      <div class="mavis-section-head" style="margin-top:14px"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 12v6"/><path d="m9 15 3-3 3 3"/></svg><span class="mavis-section-label">Pending Quotation Endorsement</span><span class="mavis-section-count">1</span></div>
                    </div>
                  </div>
                </div>
                <figcaption class="app-shot-cap"><div class="st">Preventive Maintenance</div><div class="sd">A call-in summons a vehicle ahead of its service. Moving the scheduled date is not a free edit — it is an LOS request that has to clear approval bands</div></figcaption>
              </figure>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node scripts/verify-mavis.mjs`
Expected: PASS on all checks, including the PM-Due urgency-colour check (green/amber/green — the amber card is the one due soonest).

Then confirm visually: compare the thumbnail against `screens/03-preventive-maintenance.png`, and confirm the "Pending Quotation Endorsement" section header is visible at the very bottom edge with no cards beneath it, matching the capture's own crop.

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-mavis.mjs public/projects.html
git commit -m "Add the Preventive Maintenance screen to the MAVIS gallery

Three Call-In cards and two Handed Over cards read off
screens/03-preventive-maintenance.png, including the PM-Due urgency
chip that changes colour with how soon a service is due (two green,
one amber) rather than being a flat label. Stops at the top edge of
the next section (Pending Quotation Endorsement), matching where the
source capture itself is cropped.

Records that MID 4514 appears in the capture but not in
MARKETING_SPEC.md's named-asset table — reproduced as captured."
```

---

## Task 5: Reports screen

**Files:**
- Modify: `public/projects.html` — append CSS to the `.mavis-mock` block; append a `<figure>` to the MAVIS `.app-shots`
- Modify: `scripts/verify-mavis.mjs` — add Reports checks

**Interfaces:**
- Consumes: `.mavis-mock` tokens, the navbar markup and `.mavis-card` from Task 2.
- Produces: nothing later tasks depend on. This is the last screen — after this task the MAVIS gallery has all four figures.

**Read `screens/04-reports.png` before starting.**

- [ ] **Step 1: Write the failing test**

In `scripts/verify-mavis.mjs`, insert immediately **before** `// ── Report ─────`:

```js
// ── Check group 10: Reports ──────────────────────────────────────────
const rp = await page.evaluate(() => {
  const mock = document.querySelector('.mavis-mock[data-screen="reports"]');
  if (!mock) return { found: false };
  const cols = Array.prototype.slice.call(mock.querySelectorAll('.mavis-chart-col')).map((c) => ({
    month: c.getAttribute('data-month'),
    total: c.getAttribute('data-total'),
    segs: Array.prototype.slice.call(c.querySelectorAll('.mavis-chart-seg')).map((s) => ({
      series: s.getAttribute('data-series'), count: s.getAttribute('data-count'),
    })),
  }));
  return {
    found: true,
    active: (mock.querySelector('.mavis-pill.on') || {}).textContent.trim(),
    h1: (mock.querySelector('.mavis-h1') || {}).textContent.trim(),
    sub: (mock.querySelector('.mavis-sub') || {}).textContent.trim(),
    tabs: Array.prototype.slice.call(mock.querySelectorAll('.mavis-rp-tab')).map((t) => t.textContent.trim()),
    activeTab: (mock.querySelector('.mavis-rp-tab.on') || {}).textContent.trim(),
    filters: Array.prototype.slice.call(mock.querySelectorAll('.mavis-filter-field')).map((f) => ({
      label: (f.querySelector('.mavis-filter-label') || {}).textContent.trim(),
      value: (f.querySelector('.mavis-filter-box') || {}).textContent.trim(),
    })),
    stats: Array.prototype.slice.call(mock.querySelectorAll('.mavis-rp-stat')).map((s) => ({
      label: (s.querySelector('.mavis-rp-stat-label') || {}).textContent.trim(),
      value: (s.querySelector('.mavis-rp-stat-value') || {}).textContent.trim(),
    })),
    chartTitle: (mock.querySelector('.mavis-chart-title') || {}).textContent.trim(),
    chartSub: (mock.querySelector('.mavis-chart-sub') || {}).textContent.trim(),
    cols,
    legend: Array.prototype.slice.call(mock.querySelectorAll('.mavis-chart-legend-item')).map((l) => l.textContent.trim()),
    hasSubsystemsCard: !!mock.querySelector('.mavis-subsystems-card'),
    hasByTypeCard: !!mock.querySelector('.mavis-bytype-card'),
  };
});

check('reports: screen exists', rp.found);
check('reports: Reports is the active nav pill', rp.found && rp.active === 'Reports', rp.active);
check('reports: heading + subtitle match the capture',
  rp.found && rp.h1 === 'Reports' && rp.sub === 'Defect trending and monthly fleet availability analytics.');
check('reports: five tabs, Defect Trending active',
  rp.found && JSON.stringify(rp.tabs) === JSON.stringify(
    ['Defect Trending', 'Rejection Rate', 'Fleet Availability', 'Projection', 'Deployment'])
  && rp.activeTab === 'Defect Trending', JSON.stringify(rp.tabs));
check('reports: five filters matching the capture',
  rp.found && JSON.stringify(rp.filters) === JSON.stringify([
    { label: 'From', value: '01 Jan 2026' },
    { label: 'To', value: '31 Aug 2026' },
    { label: 'Category', value: 'All categories' },
    { label: 'Type', value: 'All types' },
    { label: 'Base / Camp', value: 'All bases' },
  ]), JSON.stringify(rp.filters));
check('reports: three stat cards matching the capture',
  rp.found && JSON.stringify(rp.stats) === JSON.stringify([
    { label: 'Total defects in range', value: '12' },
    { label: 'Distinct subsystems', value: '7' },
    { label: 'Types affected', value: '6' },
  ]), JSON.stringify(rp.stats));
check('reports: chart card title + subtitle match the capture',
  rp.found && rp.chartTitle === 'Defects per month, by type'
  && rp.chartSub === 'Stacked count of defects created each month, grouped by type.');
check('reports: eight month columns, six empty, two with the captured totals',
  rp.found && JSON.stringify(rp.cols.map((c) => `${c.month}:${c.total}`)) === JSON.stringify([
    'Jan 2026:0', 'Feb 2026:0', 'Mar 2026:0', 'Apr 2026:0', 'May 2026:0', 'Jun 2026:0',
    'Jul 2026:4', 'Aug 2026:8',
  ]), JSON.stringify(rp.cols.map((c) => `${c.month}:${c.total}`)));
check('reports: July stack — Aircraft Tug 1, Ground Power Unit 1, Prime Mover 2, bottom to top',
  rp.found && JSON.stringify((rp.cols.find((c) => c.month === 'Jul 2026') || {}).segs) === JSON.stringify([
    { series: 'Aircraft Tug', count: '1' }, { series: 'Ground Power Unit', count: '1' }, { series: 'Prime Mover', count: '2' },
  ]));
check('reports: August stack — Air Start Unit 2, Aircraft Tug 1, Prime Mover 3, Recovery Vehicle 1, Refueller 1, bottom to top',
  rp.found && JSON.stringify((rp.cols.find((c) => c.month === 'Aug 2026') || {}).segs) === JSON.stringify([
    { series: 'Air Start Unit', count: '2' }, { series: 'Aircraft Tug', count: '1' }, { series: 'Prime Mover', count: '3' },
    { series: 'Recovery Vehicle', count: '1' }, { series: 'Refueller', count: '1' },
  ]));
check('reports: six-entry legend matching the capture',
  rp.found && JSON.stringify(rp.legend) === JSON.stringify([
    'Air Start Unit', 'Aircraft Tug', 'Ground Power Unit', 'Prime Mover', 'Recovery Vehicle', 'Refueller',
  ]), JSON.stringify(rp.legend));
check('reports: stops before Top subsystems / By type (spec §5.4)',
  rp.found && !rp.hasSubsystemsCard && !rp.hasByTypeCard,
  `subsystems=${rp.hasSubsystemsCard} bytype=${rp.hasByTypeCard}`);
check('reports: closing caption carries the demo-data disclosure',
  rp.found && /Demonstration dataset.*fabricated/.test(
    (mock => mock ? mock.closest('figure').querySelector('.app-shot-cap .sd').textContent : '')(
      document.querySelector('.mavis-mock[data-screen="reports"]'))));

// ── Check group 11: no horizontal overflow at two viewports ───────────
// Design spec verification item 1. Opened in fresh pages (not the shared
// `page`) so each gets its own viewport; every <details> is opened first,
// the same reason Task 1's setup opens them on `page` — a closed <details>
// has no layout box, so a mock inside one would under-report its width.
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const vp = await browser.newPage({ viewport: { width: w, height: h } });
  await vp.goto(PAGE_URL, { waitUntil: 'load' });
  await vp.evaluate(() => { document.querySelectorAll('details').forEach((d) => { d.open = true; }); });
  const dims = await vp.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  check(`overflow: no horizontal scroll at ${w}x${h}`, dims.scrollWidth <= dims.clientWidth,
    `scrollWidth=${dims.scrollWidth} clientWidth=${dims.clientWidth}`);
  await vp.close();
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/verify-mavis.mjs`
Expected: FAIL on all group-10 checks (`reports: screen exists` false). Everything from Tasks 1–4 still PASSes. All four figures should now be present once this task's markup lands — this is the last screen.

- [ ] **Step 3a: Append the CSS**

Add to the end of the `.mavis-mock` style block:

```css
/* Reports */
.mavis-mock .mavis-rp-tabs{display:inline-flex;background:var(--mavis-muted);border-radius:8px;padding:3px;gap:2px;margin-top:10px;flex-wrap:wrap}
.mavis-mock .mavis-rp-tab{display:flex;align-items:center;gap:4px;padding:4px 9px;border-radius:6px;font-size:7px;color:var(--mavis-fg-2);white-space:nowrap}
.mavis-mock .mavis-rp-tab.on{background:#fff;color:var(--mavis-ink);font-weight:600;box-shadow:0 1px 2px rgba(0,0,0,.06)}
.mavis-mock .mavis-filters-card{padding:10px 12px;margin-top:10px}
.mavis-mock .mavis-filters-head{display:flex;align-items:center;gap:5px;font-size:9px;font-weight:700;color:var(--mavis-ink)}
.mavis-mock .mavis-filters-row{display:flex;gap:12px;margin-top:9px;flex-wrap:wrap}
.mavis-mock .mavis-filter-field{display:flex;flex-direction:column;gap:3px}
.mavis-mock .mavis-filter-label{font-size:6.5px;color:var(--mavis-fg-2);font-weight:600}
.mavis-mock .mavis-filter-box{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--mavis-border);border-radius:6px;padding:4px 8px;font-size:7px;color:var(--mavis-ink);background:#fff}
.mavis-mock .mavis-rp-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}
.mavis-mock .mavis-rp-stat{padding:10px;text-align:center}
.mavis-mock .mavis-rp-stat-label{font-size:7.5px;color:var(--mavis-fg-2)}
.mavis-mock .mavis-rp-stat-value{font-size:17px;font-weight:700;margin-top:3px}
.mavis-mock .mavis-chart-card{padding:11px 12px;margin-top:8px}
.mavis-mock .mavis-chart-title{font-size:10px;font-weight:700;color:var(--mavis-ink)}
.mavis-mock .mavis-chart-sub{font-size:7px;color:var(--mavis-fg-3);margin-top:1px}
.mavis-mock .mavis-chart-plot{display:flex;gap:8px;margin-top:10px;height:110px}
.mavis-mock .mavis-chart-axis{display:flex;flex-direction:column;justify-content:space-between;font-size:6.5px;color:var(--mavis-fg-3);text-align:right;padding-bottom:12px}
.mavis-mock .mavis-chart-bars{flex:1;display:flex;align-items:flex-end;gap:5px}
.mavis-mock .mavis-chart-col{flex:1;display:flex;flex-direction:column;height:100%}
.mavis-mock .mavis-chart-colbar-wrap{flex:1;display:flex;align-items:flex-end}
.mavis-mock .mavis-chart-colbar{width:100%;display:flex;flex-direction:column-reverse;border-radius:2px 2px 0 0;overflow:hidden}
.mavis-mock .mavis-chart-collabel{font-size:5.5px;color:var(--mavis-fg-3);text-align:center;margin-top:3px;white-space:nowrap;flex-shrink:0}
.mavis-mock .mavis-chart-legend{display:flex;flex-wrap:wrap;gap:9px;margin-top:9px}
.mavis-mock .mavis-chart-legend-item{display:flex;align-items:center;gap:4px;font-size:6.5px;color:var(--mavis-fg-2)}
.mavis-mock .mavis-chart-swatch{width:7px;height:7px;border-radius:2px;flex-shrink:0}
```

- [ ] **Step 3b: Append the figure**

Add inside the MAVIS `<div class="app-shots">`, after the Preventive Maintenance `</figure>`:

```html
              <figure class="app-shot" role="listitem" tabindex="0">
                <div class="app-shot-chrome"><span class="app-shot-dots"><span></span><span></span><span></span></span><span class="app-shot-title">MAVIS — Reports</span></div>
                <div class="app-shot-frame">
                  <div class="mavis-mock" data-mock-width="720" data-screen="reports" aria-hidden="true">
                    <div class="mavis-nav">
                      <div class="mavis-nav-left">
                        <span class="mavis-wordmark">MAVIS</span>
                        <div class="mavis-pills">
                          <span class="mavis-pill"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg><span>Dashboard</span></span>
                          <span class="mavis-pill"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg><span>Corrective Maintenance</span></span>
                          <span class="mavis-pill"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/></svg><span>Preventive Maintenance</span></span>
                          <span class="mavis-pill"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg><span>Workshop Status</span></span>
                          <span class="mavis-pill on"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg><span>Reports</span></span>
                        </div>
                      </div>
                      <div class="mavis-nav-right">
                        <span class="mavis-nav-icon"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg></span>
                        <span class="mavis-nav-icon"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg><span class="mavis-bell-badge">2</span></span>
                        <span class="mavis-user">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          <span class="mavis-user-text"><span class="mavis-user-name">Ops Duty Officer</span><br><span class="mavis-user-role">Admin</span></span>
                        </span>
                      </div>
                    </div>
                    <div class="mavis-body">
                      <div class="mavis-h1">Reports</div>
                      <div class="mavis-sub">Defect trending and monthly fleet availability analytics.</div>

                      <div class="mavis-rp-tabs">
                        <span class="mavis-rp-tab on"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/></svg>Defect Trending</span>
                        <span class="mavis-rp-tab"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 14V2"/><path d="M9 18.4V2"/><path d="M1 10.4V2"/><path d="M1 14a5 5 0 0 0 5 5h11.7l-3.9 4"/><path d="M18.2 22.4A7.9 7.9 0 0 0 22 15.5"/></svg>Rejection Rate</span>
                        <span class="mavis-rp-tab"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>Fleet Availability</span>
                        <span class="mavis-rp-tab"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>Projection</span>
                        <span class="mavis-rp-tab"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>Deployment</span>
                      </div>

                      <div class="mavis-card mavis-filters-card">
                        <div class="mavis-filters-head"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>Filters</div>
                        <div class="mavis-filters-row">
                          <div class="mavis-filter-field"><span class="mavis-filter-label">From</span><span class="mavis-filter-box"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>01 Jan 2026</span></div>
                          <div class="mavis-filter-field"><span class="mavis-filter-label">To</span><span class="mavis-filter-box"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>31 Aug 2026</span></div>
                          <div class="mavis-filter-field"><span class="mavis-filter-label">Category</span><span class="mavis-filter-box">All categories<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span></div>
                          <div class="mavis-filter-field"><span class="mavis-filter-label">Type</span><span class="mavis-filter-box">All types<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span></div>
                          <div class="mavis-filter-field"><span class="mavis-filter-label">Base / Camp</span><span class="mavis-filter-box">All bases<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span></div>
                        </div>
                      </div>

                      <div class="mavis-rp-stats">
                        <div class="mavis-card mavis-rp-stat"><div class="mavis-rp-stat-label">Total defects in range</div><div class="mavis-rp-stat-value">12</div></div>
                        <div class="mavis-card mavis-rp-stat"><div class="mavis-rp-stat-label">Distinct subsystems</div><div class="mavis-rp-stat-value">7</div></div>
                        <div class="mavis-card mavis-rp-stat"><div class="mavis-rp-stat-label">Types affected</div><div class="mavis-rp-stat-value">6</div></div>
                      </div>

                      <div class="mavis-card mavis-chart-card">
                        <div class="mavis-chart-title">Defects per month, by type</div>
                        <div class="mavis-chart-sub">Stacked count of defects created each month, grouped by type.</div>
                        <div class="mavis-chart-plot">
                          <div class="mavis-chart-axis"><span>8</span><span>6</span><span>4</span><span>2</span><span>0</span></div>
                          <div class="mavis-chart-bars">
                            <div class="mavis-chart-col" data-month="Jan 2026" data-total="0"><div class="mavis-chart-colbar-wrap"></div><div class="mavis-chart-collabel">Jan 2026</div></div>
                            <div class="mavis-chart-col" data-month="Feb 2026" data-total="0"><div class="mavis-chart-colbar-wrap"></div><div class="mavis-chart-collabel">Feb 2026</div></div>
                            <div class="mavis-chart-col" data-month="Mar 2026" data-total="0"><div class="mavis-chart-colbar-wrap"></div><div class="mavis-chart-collabel">Mar 2026</div></div>
                            <div class="mavis-chart-col" data-month="Apr 2026" data-total="0"><div class="mavis-chart-colbar-wrap"></div><div class="mavis-chart-collabel">Apr 2026</div></div>
                            <div class="mavis-chart-col" data-month="May 2026" data-total="0"><div class="mavis-chart-colbar-wrap"></div><div class="mavis-chart-collabel">May 2026</div></div>
                            <div class="mavis-chart-col" data-month="Jun 2026" data-total="0"><div class="mavis-chart-colbar-wrap"></div><div class="mavis-chart-collabel">Jun 2026</div></div>
                            <div class="mavis-chart-col" data-month="Jul 2026" data-total="4">
                              <div class="mavis-chart-colbar-wrap">
                                <div class="mavis-chart-colbar" style="height:50%">
                                  <span class="mavis-chart-seg" data-series="Aircraft Tug" data-count="1" style="flex:1;background:#0ea5e9"></span>
                                  <span class="mavis-chart-seg" data-series="Ground Power Unit" data-count="1" style="flex:1;background:#22c55e"></span>
                                  <span class="mavis-chart-seg" data-series="Prime Mover" data-count="2" style="flex:2;background:#f59e0b"></span>
                                </div>
                              </div>
                              <div class="mavis-chart-collabel">Jul 2026</div>
                            </div>
                            <div class="mavis-chart-col" data-month="Aug 2026" data-total="8">
                              <div class="mavis-chart-colbar-wrap">
                                <div class="mavis-chart-colbar" style="height:100%">
                                  <span class="mavis-chart-seg" data-series="Air Start Unit" data-count="2" style="flex:2;background:#1e3a8a"></span>
                                  <span class="mavis-chart-seg" data-series="Aircraft Tug" data-count="1" style="flex:1;background:#0ea5e9"></span>
                                  <span class="mavis-chart-seg" data-series="Prime Mover" data-count="3" style="flex:3;background:#f59e0b"></span>
                                  <span class="mavis-chart-seg" data-series="Recovery Vehicle" data-count="1" style="flex:1;background:#8b5cf6"></span>
                                  <span class="mavis-chart-seg" data-series="Refueller" data-count="1" style="flex:1;background:#ef4444"></span>
                                </div>
                              </div>
                              <div class="mavis-chart-collabel">Aug 2026</div>
                            </div>
                          </div>
                        </div>
                        <div class="mavis-chart-legend">
                          <span class="mavis-chart-legend-item"><span class="mavis-chart-swatch" style="background:#1e3a8a"></span>Air Start Unit</span>
                          <span class="mavis-chart-legend-item"><span class="mavis-chart-swatch" style="background:#0ea5e9"></span>Aircraft Tug</span>
                          <span class="mavis-chart-legend-item"><span class="mavis-chart-swatch" style="background:#22c55e"></span>Ground Power Unit</span>
                          <span class="mavis-chart-legend-item"><span class="mavis-chart-swatch" style="background:#f59e0b"></span>Prime Mover</span>
                          <span class="mavis-chart-legend-item"><span class="mavis-chart-swatch" style="background:#8b5cf6"></span>Recovery Vehicle</span>
                          <span class="mavis-chart-legend-item"><span class="mavis-chart-swatch" style="background:#ef4444"></span>Refueller</span>
                        </div>
                      </div>

                      <!-- Screen stops here per design spec §5.4. "Top subsystems"
                           and "By type" — two further half-width chart cards
                           visible in screens/04-reports.png below this point —
                           are NOT built: the stacked chart above already carries
                           the analytics claim, and building them would push this
                           mock's natural height past the ~700px budget in the
                           Global Constraints, forcing the lightbox to scroll. -->
                    </div>
                  </div>
                </div>
                <figcaption class="app-shot-cap"><div class="st">Reports</div><div class="sd">Defect trending, rejection rate, fleet availability and projection, read from the same store the work is recorded in. Demonstration dataset — every asset number, defect, date and person shown across these screens is fabricated.</div></figcaption>
              </figure>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node scripts/verify-mavis.mjs`
Expected: PASS on all checks — every group from Task 1 through Task 5. `console messages: 0`, `external requests: 0`.

Then run the full regression pass this task completes the set for:

1. Open the page, expand the MAVIS entry, and step through all four thumbnails against their captures (`01-dashboard.png` through `04-reports.png`).
2. Click each of the four screens; confirm the lightbox opens each scaled to fit and none forces the dialog body to scroll.
3. Keyboard round-trip: Tab to each of the four `.app-shot` figures, press Enter (or Space) to open the lightbox, confirm arrow-key navigation steps between the four screens, press Esc to close, and confirm focus returns to the figure that opened it.
4. Expand BOLDFACE, MatFlow and GRID and confirm their galleries are visually unchanged and their lightboxes still open correctly.
5. `git diff` against the last commit before Task 2 and confirm no `.bf-mock`, `.mf-mock` or `.gr-mock` (and, if present, `.soar-mock`) line was touched anywhere in the whole plan.

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-mavis.mjs public/projects.html
git commit -m "Add the Reports screen, completing the MAVIS gallery

Five analytics tabs, the five-field filter row, the 12/7/6 stat row,
and the stacked defects-per-month chart — built as flex columns with
percentage heights and flex-weighted segments, the same technique
.gr-mock already uses, not an SVG chart. All eight months and both
non-empty stacks (July, August) are read off screens/04-reports.png.

Carries the gallery's one required disclosure on its caption: the
dataset is fabricated. Stops before the Top subsystems / By type
cards per the design spec's ~700px content budget — the stacked chart
above already carries the analytics claim.

This completes the four-screen MAVIS gallery started in the previous
three commits."
```

---
