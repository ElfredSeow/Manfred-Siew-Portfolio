# SOAR Duty Scheduler Screens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the copy of the "Flight Simulator Scheduling System" entry in `public/projects.html` so it describes the app that actually exists, and give it a four-screen gallery hand-built in HTML/CSS from the app's real captured screenshots.

**Architecture:** One static HTML file with its own inline `<style>` and `<script>`, no build step and no external request. The page already supports three hand-built "mock" screen families (`.bf-mock`, `.mf-mock`, `.gr-mock`); this work adds a fourth, `.soar-mock`, by **appending** to three lists — never by editing an existing family. The test harness is a new Playwright script, `scripts/verify-soar.mjs`, that loads the page over `file://` and asserts DOM and computed-style facts. Each task extends that harness with checks that fail before the change and pass after; that is the red-green cycle here, because there is no unit-test framework for a single HTML document.

**Tech Stack:** Plain HTML/CSS/vanilla JS. Node 18+. Playwright (already present in `node_modules`, no install needed). No package changes.

## Global Constraints

Copied from `docs/superpowers/specs/2026-08-11-soar-duty-scheduler-screens-design.md`. Every task's requirements implicitly include this section.

- **No BOLDFACE, MatFlow or GRID code is modified.** `.soar-mock` registers by appending to three lists. A `git diff` must show no `.bf-mock`, `.mf-mock` or `.gr-mock` line altered.
- **No new dependency, no new external request, no build step, no image file.** This work must add nothing that fetches from an external host — the `.soar-mock` screens load no font file, no image and no script of their own.
  **Correction, found during Task 1:** the page already loads Google Fonts from its `<head>` (`fonts.googleapis.com` preconnect + stylesheet, `public/projects.html:20-22`), so a run reports ~4 external requests before this work begins. The earlier wording — "the page must still load zero fonts, images or scripts from any external host" — was factually wrong about the page and is superseded. The measurable requirement is **no increase** against the baseline captured at BASE, not zero. Removing the site's existing font loading is out of scope.
- **Every screen fact comes from the four captures** in `Project Management/SOAR Scheduling Marketing Content/marketing-pr/SOAR-Duty-Scheduling-App/screens/`. No name, number, time, simulator, role tag or flag may be invented or "tidied".
- **No adoption, user-count, time-saved or ROI figures.** None exist in the source repo. None may be inferred.
- **Never describe role enforcement as a security boundary.** The source repo's README states enforcement is client-side and that Dataverse security roles must mirror the matrix. "Role-aware" is allowed; anything implying a security guarantee is not.
- **Every CSS rule in the new block is qualified with the `.soar-mock` ancestor,** so its specificity beats this page's own descendant rules (`.log-body p` and friends) without `!important`.
- **`.soar-mock` is authored at 720px and carries `data-mock-width="720"`** on every instance, scaled by `transform:scale(.4)` into the 288px `.app-shot-frame`.
- **Legibility liberty:** text below roughly 7px stops rendering as text, so the smallest micro-labels sit slightly above a strict proportional reduction. This is the same liberty `.mf-mock` and `.gr-mock` already document.
- **The demo-data disclosure is required** and lives on the fourth screen's caption.
- **Line numbers drift as tasks apply.** Every location below is given with an anchor string to search for. **Trust the string, not the number.**
- **`public/projects.html` and `public/index.html` are already modified and uncommitted** in the working tree. Do not revert, review or commit those pre-existing changes. Stage only the files each task names.

---

## File Structure

| File | Responsibility | Tasks |
|---|---|---|
| `scripts/verify-soar.mjs` | **Create.** Playwright harness: DOM + computed-style assertions for the SOAR entry, plus regression checks on the existing mock families | 1–6 |
| `public/projects.html` — the SOAR `.log-row` | Entry copy: title, lead, "What it does", chips | 1 |
| `public/projects.html` — `.shot-lightbox-mockwrap` rule | Lightbox clone positioning — one selector appended | 2 |
| `public/projects.html` — `.app-shot-frame` mock rules | Thumbnail scaling — one rule added | 2 |
| `public/projects.html` — `MOCK_SEL` in the lightbox script | Mock registry — one name appended | 2 |
| `public/projects.html` — new `.soar-mock` `<style>` block | SOAR tokens, shared rail, and per-screen components | 2–5 |
| `public/projects.html` — the SOAR `.log-shots-wrap` | Gallery wrapper + four `<figure class="app-shot">` | 2–5 |

**Task order is load-bearing.** Task 2 creates the tokens, the shared rail and the gallery wrapper that Tasks 3–5 add figures into. Task 1 is independent and can ship alone.

---

## Reference: the source captures

All four live in `C:\Users\manfr\Downloads\Project Management\SOAR Scheduling Marketing Content\marketing-pr\SOAR-Duty-Scheduling-App\screens\`. Open the relevant PNG with the Read tool before building each screen and compare against it after. `MARKETING_SPEC.md` in the same folder documents the theme tokens and the demo dataset.

---

## Task 1: Correct the entry copy

**Files:**
- Create: `scripts/verify-soar.mjs`
- Modify: `public/projects.html` — the `<details class="log-row">` whose `.lt` reads `Flight Simulator Scheduling System` (currently near line 1945)

**Interfaces:**
- Consumes: nothing.
- Produces: the entry's new title string `Simulator Assessment Duty Scheduler (SOAR)`, which Task 2's harness uses to locate the entry. The `<div class="log-body">` gains no gallery yet.

- [ ] **Step 1: Write the failing test**

Create `scripts/verify-soar.mjs`:

```js
// scripts/verify-soar.mjs
//
// Render/verification harness for the SOAR Duty Scheduler entry in
// public/projects.html. Measures, does not fix.
// Run: node scripts/verify-soar.mjs [path-to-html]
//
// Every assertion here is traceable to either the design spec
// (docs/superpowers/specs/2026-08-11-soar-duty-scheduler-screens-design.md)
// or to one of the four source captures it is built from.

import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const FILE = process.argv[2] ?? 'public/projects.html';
const PAGE_URL = pathToFileURL(path.resolve(FILE)).href;
const TITLE = 'Simulator Assessment Duty Scheduler (SOAR)';

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

// ── Check group 1: entry copy ────────────────────────────────────────
const copy = await page.evaluate((title) => {
  const rows = Array.prototype.slice.call(document.querySelectorAll('details.log-row'));
  const row = rows.find((r) => {
    const lt = r.querySelector('.lt');
    return lt && lt.textContent.trim() === title;
  });
  if (!row) return { found: false };
  const chips = Array.prototype.slice.call(row.querySelectorAll('.chips span'))
    .map((s) => s.textContent.trim());
  const feats = Array.prototype.slice.call(row.querySelectorAll('ul.feat > li'))
    .map((li) => li.textContent.trim());
  return {
    found: true,
    lead: (row.querySelector('.log-body > p') || {}).textContent || '',
    chips,
    featCount: feats.length,
    text: row.textContent,
    org: row.getAttribute('data-org'),
    cat: row.getAttribute('data-cat'),
  };
}, TITLE);

check('entry: exists under the corrected title', copy.found, TITLE);
check('entry: org/cat unchanged', copy.found && copy.org === 'RAiD' && copy.cat === 'automation',
  copy.found ? `${copy.org}/${copy.cat}` : 'n/a');
check('entry: lead describes QFI + Psych pairing',
  copy.found && /QFI/.test(copy.lead) && /Psych/.test(copy.lead) && /AM and PM waves/.test(copy.lead));
check('entry: "What it does" has 4 items', copy.found && copy.featCount === 4, String(copy.featCount));
check('entry: chips are the real stack',
  copy.found && JSON.stringify(copy.chips) === JSON.stringify(
    ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'PowerApps Code Apps', 'Dataverse']),
  JSON.stringify(copy.chips));
check('entry: no ROI / adoption / time-saved claim',
  copy.found && !/\b(ROI|adoption|time[- ]saved|hours saved|man[- ]hours)\b/i.test(copy.text));
check('entry: no security-boundary claim',
  copy.found && !/secur/i.test(copy.text));

// ── Check group 2: the superseded copy is gone ───────────────────────
const bodyText = await page.evaluate(() => document.body.textContent);
check('page: old title removed', !/Flight Simulator Scheduling System/.test(bodyText));
check('page: old description removed', !/reserving simulator resources/.test(bodyText));

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

Run: `node scripts/verify-soar.mjs`
Expected: FAIL on `entry: exists under the corrected title` and on both `page: old ... removed` checks. The entry-detail checks report `n/a`/`false` because the row was not found.

- [ ] **Step 3: Write the copy**

Find the anchor string `<span class="lt">Flight Simulator Scheduling System</span>`. Replace the whole `<details>` element it sits in — from `<details class="log-row" data-org="RAiD" data-cat="automation">` through its closing `</details>` — with:

```html
      <details class="log-row" data-org="RAiD" data-cat="automation">
        <summary>
          <span class="lt">Simulator Assessment Duty Scheduler (SOAR)</span>
          <span class="tag tag-amber">Automation</span><span class="lorg">RAiD</span>
          <svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </summary>
        <div class="log-body">
          <p>Plans simulator assessment missions across AM and PM waves, pairing a QFI with a Psych assessor on every mission. A missing half is a first-class state — flagged as a broken pair in the grid, on the assessor's own schedule, and in the dashboard's stability metric. Assessors raise covering requests with a reason and a suggested replacement; supervisors and admins approve or reject. Built as Lead Developer.</p>
          <div><div class="lab">What it does</div>
            <ul class="feat" role="list">
              <li>Every weekday splits into an AM and a PM wave, with slot times and labels editable per day by an admin and copyable across days</li>
              <li>Each mission wants a QFI and a Psych assessor; an unfilled half is tracked as a broken pair rather than left silent</li>
              <li>Covering requests carry a reason and an optional suggested replacement, and move to History once decided</li>
              <li>Per-assessor duty counts drive a ranked workload chart, so over-tasking is visible before it is a problem; an admin can lock a published week against further changes</li>
            </ul></div>
          <div><div class="lab">What I learned</div><p class="note">Using Lovable to create a quick prototype on the spot to gain user feedback, deploying to PowerApps safely. GitHub Copilot and Google AI Studio assisted the build; neither runs in the shipped app.</p></div>
          <div><div class="lab">Built with</div><div class="chips"><span>React</span><span>TypeScript</span><span>Vite</span><span>Tailwind CSS</span><span>PowerApps Code Apps</span><span>Dataverse</span></div></div>
        </div>
      </details>
```

The `What I learned` paragraph is byte-identical to what was there. Do not reword it.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node scripts/verify-soar.mjs`
Expected: PASS on all 9 checks. The run also prints `external requests: 4` — the page's pre-existing Google Fonts links, which this work neither adds nor removes. That line is informational output, not a check.

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-soar.mjs public/projects.html
git commit -m "Correct the SOAR entry copy to describe the app that exists

The entry claimed to book simulator resources. The app schedules the
assessors: it pairs a QFI with a Psych on each mission across a two-wave
day, tracks incomplete pairings, and runs a covering approve/reject
workflow. Retitled, rewritten, and the single PowerApps chip replaced
with the real code-app stack.

Adds scripts/verify-soar.mjs as the harness for this entry."
```

---

## Task 2: Register `.soar-mock`, build the shell, and add the Operations Dashboard

**Files:**
- Modify: `public/projects.html` — three list additions, a new `<style>` block, and the gallery wrapper with its first figure
- Modify: `scripts/verify-soar.mjs` — add registration, rail, dashboard and regression checks

**Interfaces:**
- Consumes: the entry located by `TITLE` from Task 1.
- Produces: the `.soar-mock` token block; the shared rail markup (`.soar-rail`, reused verbatim by Tasks 3–5 with only the `.soar-on` nav item moving); the `.log-shots-wrap` gallery that Tasks 3–5 append `<figure>` elements into; and the shared pane header classes `.soar-h1` / `.soar-sub2`.

**Read `screens/dashboard.png` before starting.**

- [ ] **Step 1: Write the failing test**

In `scripts/verify-soar.mjs`, insert this block immediately **before** the line `// ── Report ─────`:

```js
// ── Check group 3: mock registration + regression on existing families ──
const reg = await page.evaluate(() => {
  const frameW = (sel) => {
    const el = document.querySelector(sel);
    return el ? getComputedStyle(el).width : null;
  };
  return {
    soarCount: document.querySelectorAll('.soar-mock').length,
    soarWidths: Array.prototype.slice.call(document.querySelectorAll('.soar-mock'))
      .map((m) => m.getAttribute('data-mock-width')),
    bfCount: document.querySelectorAll('.bf-mock').length,
    mfCount: document.querySelectorAll('.mf-mock').length,
    bfFrameW: frameW('.app-shot-frame .bf-mock'),
    mfFrameW: frameW('.app-shot-frame .mf-mock'),
    soarFrameW: frameW('.app-shot-frame .soar-mock'),
  };
});

check('regression: BOLDFACE still has 3 mocks', reg.bfCount === 3, String(reg.bfCount));
check('regression: MatFlow still has 5 mocks', reg.mfCount === 5, String(reg.mfCount));
check('regression: .bf-mock still authored at 480px', reg.bfFrameW === '480px', reg.bfFrameW);
check('regression: .mf-mock still authored at 720px', reg.mfFrameW === '720px', reg.mfFrameW);
check('soar: authored at 720px', reg.soarFrameW === '720px', reg.soarFrameW);
check('soar: every mock declares data-mock-width="720"',
  reg.soarCount > 0 && reg.soarWidths.every((w) => w === '720'), JSON.stringify(reg.soarWidths));

// ── Check group 4: the shared rail ───────────────────────────────────
const rail = await page.evaluate(() => {
  const mock = document.querySelector('.soar-mock');
  if (!mock) return { found: false };
  const wm = mock.querySelector('.soar-wordmark');
  const cs = wm ? getComputedStyle(wm) : null;
  return {
    found: true,
    nav: Array.prototype.slice.call(mock.querySelectorAll('.soar-ni')).map((n) => n.textContent.trim()),
    active: (mock.querySelector('.soar-ni.soar-on') || {}).textContent || '',
    wordmark: wm ? wm.textContent.trim() : '',
    gradient: cs ? cs.backgroundImage : '',
    clip: cs ? (cs.webkitBackgroundClip || cs.backgroundClip) : '',
    weight: cs ? cs.fontWeight : '',
    railText: (mock.querySelector('.soar-rail') || { textContent: '' }).textContent,
  };
});

check('rail: five nav entries in app order', rail.found && JSON.stringify(rail.nav) ===
  JSON.stringify(['Calendar', 'My Schedule', 'Covering', 'Dashboard', 'Admin']),
  JSON.stringify(rail.nav));
check('rail: wordmark reads SOAR', rail.found && rail.wordmark === 'SOAR', rail.wordmark);
check('rail: wordmark uses the app gradient #60a5fa to #ffffff',
  rail.found && /rgb\(96,\s*165,\s*250\)/.test(rail.gradient) && /rgb\(255,\s*255,\s*255\)/.test(rail.gradient),
  rail.gradient);
check('rail: wordmark is background-clip:text at weight 800',
  rail.found && rail.clip === 'text' && rail.weight === '800', `${rail.clip}/${rail.weight}`);
check('rail: carries the signed-in persona and version',
  rail.found && /t\.rahman@soar\.demo/.test(rail.railText) && /v1\.0\.11/.test(rail.railText));

// ── Check group 5: Operations Dashboard ──────────────────────────────
const dash = await page.evaluate(() => {
  const mock = document.querySelector('.soar-mock[data-screen="dashboard"]');
  if (!mock) return { found: false };
  return {
    found: true,
    active: (mock.querySelector('.soar-ni.soar-on') || {}).textContent.trim(),
    h1: (mock.querySelector('.soar-h1') || {}).textContent || '',
    sub: (mock.querySelector('.soar-sub2') || {}).textContent || '',
    tiles: Array.prototype.slice.call(mock.querySelectorAll('.soar-stat')).map((t) => ({
      v: (t.querySelector('.soar-stat-v') || {}).textContent.trim(),
      l: (t.querySelector('.soar-stat-l') || {}).textContent.trim(),
      live: !!t.querySelector('.soar-live'),
    })),
    bars: Array.prototype.slice.call(mock.querySelectorAll('.soar-bar')).map((b) => ({
      duty: b.getAttribute('data-duty'),
      name: (b.querySelector('.soar-bar-l') || {}).textContent.trim(),
      h: (b.querySelector('.soar-bar-i') || { style: {} }).style.height,
    })),
    axis: Array.prototype.slice.call(mock.querySelectorAll('.soar-ax')).map((a) => a.textContent.trim()),
    stable: (mock.querySelector('.soar-stable') || {}).textContent || '',
    gaps: (mock.querySelector('.soar-gaps') || {}).textContent || '',
    stableVal: (mock.querySelector('.soar-stable b') || {}).textContent || '',
    gapsVal: (mock.querySelector('.soar-gaps b') || {}).textContent || '',
  };
});

check('dashboard: screen exists', dash.found);
check('dashboard: Dashboard is the active nav item', dash.found && dash.active === 'Dashboard', dash.active);
check('dashboard: heading + subtitle match the capture',
  dash.found && dash.h1.trim() === 'Operations Dashboard'
  && dash.sub.trim() === 'System-wide workload and stability metrics');
check('dashboard: four LIVE stat tiles with the captured values',
  dash.found && JSON.stringify(dash.tiles) === JSON.stringify([
    { v: '10', l: 'Total Assessors', live: true },
    { v: '20', l: 'Active Missions', live: true },
    { v: '2', l: 'Pair Breaks', live: true },
    { v: '3', l: 'Covering Requests', live: true },
  ]), JSON.stringify(dash.tiles));
check('dashboard: eight workload bars in ranked order',
  dash.found && JSON.stringify(dash.bars.map((b) => `${b.name}:${b.duty}`)) === JSON.stringify([
    'T Rahman:14', 'L Okafor:13', 'S Whitfield:12', 'A Delgado:11',
    'K Nakamura:10', 'M Bianchi:9', 'R Alvarez:8', 'D Kowalski:7',
  ]), JSON.stringify(dash.bars.map((b) => `${b.name}:${b.duty}`)));
check('dashboard: bar heights are duty/16 of the plot',
  dash.found && dash.bars.every((b) => b.h === `${(Number(b.duty) / 16) * 100}%`),
  JSON.stringify(dash.bars.map((b) => b.h)));
check('dashboard: y-axis is 0/4/8/12/16',
  dash.found && JSON.stringify(dash.axis) === JSON.stringify(['16', '12', '8', '4', '0']),
  JSON.stringify(dash.axis));
check('dashboard: stability figures match the capture',
  // .soar-stable/.soar-gaps concatenate two adjacent inline elements with
  // no whitespace between them ("Stable Pairs90.0%" / "Critical Gaps2"),
  // so a \b-anchored regex on the trailing number has no word boundary
  // against the preceding letter and always fails. Read each <b> value
  // directly (captured as stableVal/gapsVal above) instead of pattern-
  // matching inside the concatenated blob.
  dash.found && dash.stableVal === '90.0%' && dash.gapsVal === '2',
  `${dash.stable} | ${dash.gaps}`);
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/verify-soar.mjs`
Expected: FAIL on every check in groups 3–5 (`soar: authored at 720px` reports `null`, `dashboard: screen exists` false). The Task 1 checks and the two BOLDFACE/MatFlow count checks still PASS.

- [ ] **Step 3a: Register the family — three list additions**

Find the anchor `.shot-lightbox-mockwrap .gr-mock{ position:absolute;` and change that rule's selector list to add a fourth line:

```css
.shot-lightbox-mockwrap .bf-mock,
.shot-lightbox-mockwrap .mf-mock,
.shot-lightbox-mockwrap .gr-mock,
.shot-lightbox-mockwrap .soar-mock{ position:absolute; top:0; left:0; transform-origin:top left; }
```

Find the anchor `/* .gr-mock is authored at the same 720px half-scale as .mf-mock. */` and add a new comment + rule directly **after** the `.app-shot-frame .gr-mock{...}` line that follows it:

```css
/* .soar-mock is authored at the same 720px half-scale as .mf-mock and
   .gr-mock — half of the app's own 1600px capture viewport, near enough
   that proportions carry across from the source PNGs directly. */
.app-shot-frame .soar-mock{width:720px;transform:scale(.4);transform-origin:top left}
```

Find the anchor `var MOCK_SEL = '.bf-mock, .mf-mock, .gr-mock';` and change **only** that string:

```js
  var MOCK_SEL = '.bf-mock, .mf-mock, .gr-mock, .soar-mock';
```

Do not touch any other line in any of these three regions.

- [ ] **Step 3b: Add the `.soar-mock` style block**

Find the end of the `.gr-mock` style block (the last rule whose selector starts `.gr-mock`) and insert this block immediately after it:

```css
/* ── SOAR Duty Scheduler screen mockup ────────────────────────────────
   Rebuilt in HTML/CSS from the app's own design tokens and its four
   captured screens, the same recipe .mf-mock and .gr-mock use. Source:
   SOAR Scheduling Marketing Content/marketing-pr/SOAR-Duty-Scheduling-App/
   MARKETING_SPEC.md (§2 theme tokens, §3 App Fidelity Map) plus
   screens/{calendar,dashboard,covering,admin}.png.
   Tokens are the app's real dark palette from its src/index.css, soar-
   prefixed. Authored at 720px; .app-shot-frame scales it to 0.4 for the
   8:5 thumbnail and the lightbox scales it back up. As with .mf-mock and
   .gr-mock the one liberty is legibility: text below about 7px stops
   rendering as text, so the smallest labels sit a little above a strict
   half-scale. Every rule is qualified with the .soar-mock ancestor so it
   outranks this page's own descendant rules (.log-body p and friends). */
.soar-mock{
  --soar-bg:hsl(220,20%,10%); --soar-card:hsl(220,20%,15%); --soar-card-2:hsl(220,20%,13%);
  --soar-border:hsl(220,20%,20%); --soar-fg:hsl(210,20%,98%);
  --soar-primary:hsl(210,60%,50%); --soar-primary-2:#60a5fa;
  --soar-fg-2:#cbd5e1; --soar-fg-3:#94a3b8; --soar-fg-4:#64748b;
  --soar-am:#3b82f6; --soar-pm:#a855f7; --soar-covering:#f59e0b; --soar-break:#ef4444;
  --soar-accent:hsl(40,90%,55%); --soar-good:#10b981;
  --soar-mono:"JetBrains Mono",ui-monospace,"SF Mono",Consolas,monospace;
  --soar-r:10px;
  width:720px; background:var(--soar-bg); color:var(--soar-fg);
  font-family:"Inter",system-ui,-apple-system,"Segoe UI",sans-serif;
  font-size:11px; line-height:1.35; letter-spacing:0;
}
.soar-mock p,.soar-mock b,.soar-mock small,.soar-mock span,.soar-mock div,.soar-mock h4{margin:0;font-size:inherit;line-height:inherit;color:inherit;font-weight:inherit}
.soar-mock .soar-screen{display:flex;min-height:450px;background:var(--soar-bg)}

/* Rail — identical on all four screens; only .soar-on moves. */
.soar-mock .soar-rail{width:116px;flex-shrink:0;background:var(--soar-bg);border-right:1px solid var(--soar-border);display:flex;flex-direction:column}
.soar-mock .soar-brand{padding:13px 12px 10px}
.soar-mock .soar-wordmark{display:block;font-size:15px;font-weight:800;letter-spacing:-.01em;line-height:1.1;background-image:linear-gradient(to right,#60a5fa,#ffffff);-webkit-background-clip:text;background-clip:text;color:transparent}
.soar-mock .soar-sub{display:block;margin-top:1px;font-family:var(--soar-mono);font-size:6.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--soar-fg-4)}
.soar-mock .soar-nav{padding:4px 7px;display:flex;flex-direction:column;gap:2px;flex:1}
.soar-mock .soar-ni{display:flex;align-items:center;gap:7px;padding:6px 8px;border-radius:8px;font-size:8.5px;color:var(--soar-fg-3)}
.soar-mock .soar-ni svg{flex-shrink:0;opacity:.85}
.soar-mock .soar-ni.soar-on{background:rgba(59,130,246,.16);color:var(--soar-primary-2);font-weight:600}
.soar-mock .soar-ni.soar-on svg{opacity:1}
.soar-mock .soar-rail-ft{border-top:1px solid var(--soar-border);padding:8px 8px 6px;display:flex;flex-direction:column;gap:6px}
.soar-mock .soar-rf{display:flex;align-items:center;gap:7px;padding:2px 4px;font-size:8.5px;color:var(--soar-fg-3)}
.soar-mock .soar-user{display:flex;align-items:center;gap:6px;padding:2px 4px}
.soar-mock .soar-uinfo{display:flex;flex-direction:column}
.soar-mock .soar-av{width:15px;height:15px;border-radius:50%;background:var(--soar-primary);color:#fff;display:grid;place-items:center;font-size:7.5px;font-weight:700;flex-shrink:0}
.soar-mock .soar-un{font-size:7.5px;font-weight:600;color:var(--soar-fg);line-height:1.25}
.soar-mock .soar-ur{font-size:7px;color:var(--soar-fg-4);line-height:1.25}
.soar-mock .soar-ver{text-align:center;font-family:var(--soar-mono);font-size:7px;color:var(--soar-fg-4)}

/* Pane header — shared by all four screens. */
.soar-mock .soar-pane{flex:1;padding:14px 16px;min-width:0}
.soar-mock .soar-h1{font-size:15px;font-weight:700;letter-spacing:-.01em;color:var(--soar-primary-2)}
.soar-mock .soar-sub2{font-size:8.5px;color:var(--soar-fg-3);margin-top:1px}
.soar-mock .soar-card{background:var(--soar-card);border:1px solid var(--soar-border);border-radius:var(--soar-r)}

/* Dashboard */
.soar-mock .soar-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:11px}
.soar-mock .soar-stat{padding:9px 10px 10px}
.soar-mock .soar-stat-top{display:flex;align-items:center;justify-content:space-between}
.soar-mock .soar-live{font-family:var(--soar-mono);font-size:7px;letter-spacing:.16em;color:var(--soar-fg-4)}
.soar-mock .soar-stat-v{font-size:17px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1.3;margin-top:5px}
.soar-mock .soar-stat-l{font-size:8px;color:var(--soar-fg-3)}
.soar-mock .soar-charts{display:grid;grid-template-columns:1.75fr 1fr;gap:8px;margin-top:8px}
.soar-mock .soar-chart{padding:11px 12px 10px}
.soar-mock .soar-ch-h{font-size:9.5px;font-weight:700;color:var(--soar-fg)}
.soar-mock .soar-plot{display:flex;gap:8px;margin-top:10px;height:120px}
.soar-mock .soar-axis{display:flex;flex-direction:column;justify-content:space-between;font-size:7px;color:var(--soar-fg-4);text-align:right;padding-bottom:11px}
.soar-mock .soar-bars{flex:1;display:flex;align-items:flex-end;gap:6px}
.soar-mock .soar-bar{flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:100%}
.soar-mock .soar-bar-p{height:calc(100% - 11px);display:flex;align-items:flex-end}
.soar-mock .soar-bar-i{width:100%;background:#1d2b45;border-radius:2px 2px 0 0}
.soar-mock .soar-bar.soar-top .soar-bar-i{background:var(--soar-am)}
.soar-mock .soar-bar-l{font-size:6.5px;color:var(--soar-fg-4);text-align:center;margin-top:3px;white-space:nowrap}
.soar-mock .soar-donut{width:98px;height:98px;margin:12px auto 10px;display:block}
.soar-mock .soar-krow{display:flex;align-items:center;justify-content:space-between;font-size:8.5px;color:var(--soar-fg-3);padding:2px 0}
.soar-mock .soar-krow b{font-weight:700;font-variant-numeric:tabular-nums}
.soar-mock .soar-stable b{color:var(--soar-primary-2)}
.soar-mock .soar-gaps b{color:var(--soar-break)}
```

- [ ] **Step 3c: Add the gallery and the Operations Dashboard figure**

Inside the SOAR entry's `<div class="log-body">`, **after** the `Built with` div and before the closing `</div>`, insert:

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
            <div class="app-shots" role="list" aria-label="SOAR Duty Scheduler app screens, rebuilt in HTML and CSS from the app's own interface code, design tokens and captured screens — not photos, not invented">
              <figure class="app-shot" role="listitem" tabindex="0">
                <div class="app-shot-chrome"><span class="app-shot-dots"><span></span><span></span><span></span></span><span class="app-shot-title">SOAR — Operations Dashboard</span></div>
                <div class="app-shot-frame">
                  <div class="soar-mock" data-mock-width="720" data-screen="dashboard" aria-hidden="true">
                    <div class="soar-screen">
                      <!--SOAR-RAIL:dashboard-->
                      <div class="soar-pane">
                        <div class="soar-h1">Operations Dashboard</div>
                        <div class="soar-sub2">System-wide workload and stability metrics</div>
                        <div class="soar-stats">
                          <div class="soar-card soar-stat">
                            <div class="soar-stat-top"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><span class="soar-live">LIVE</span></div>
                            <div class="soar-stat-v">10</div><div class="soar-stat-l">Total Assessors</div>
                          </div>
                          <div class="soar-card soar-stat">
                            <div class="soar-stat-top"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg><span class="soar-live">LIVE</span></div>
                            <div class="soar-stat-v">20</div><div class="soar-stat-l">Active Missions</div>
                          </div>
                          <div class="soar-card soar-stat">
                            <div class="soar-stat-top"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg><span class="soar-live">LIVE</span></div>
                            <div class="soar-stat-v">2</div><div class="soar-stat-l">Pair Breaks</div>
                          </div>
                          <div class="soar-card soar-stat">
                            <div class="soar-stat-top"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/></svg><span class="soar-live">LIVE</span></div>
                            <div class="soar-stat-v">3</div><div class="soar-stat-l">Covering Requests</div>
                          </div>
                        </div>
                        <div class="soar-charts">
                          <div class="soar-card soar-chart">
                            <div class="soar-ch-h">Assessor Workload (Duty Count)</div>
                            <div class="soar-plot">
                              <div class="soar-axis"><span class="soar-ax">16</span><span class="soar-ax">12</span><span class="soar-ax">8</span><span class="soar-ax">4</span><span class="soar-ax">0</span></div>
                              <div class="soar-bars">
                                <div class="soar-bar soar-top" data-duty="14"><div class="soar-bar-p"><i class="soar-bar-i" style="height:87.5%"></i></div><div class="soar-bar-l">T Rahman</div></div>
                                <div class="soar-bar" data-duty="13"><div class="soar-bar-p"><i class="soar-bar-i" style="height:81.25%"></i></div><div class="soar-bar-l">L Okafor</div></div>
                                <div class="soar-bar" data-duty="12"><div class="soar-bar-p"><i class="soar-bar-i" style="height:75%"></i></div><div class="soar-bar-l">S Whitfield</div></div>
                                <div class="soar-bar" data-duty="11"><div class="soar-bar-p"><i class="soar-bar-i" style="height:68.75%"></i></div><div class="soar-bar-l">A Delgado</div></div>
                                <div class="soar-bar" data-duty="10"><div class="soar-bar-p"><i class="soar-bar-i" style="height:62.5%"></i></div><div class="soar-bar-l">K Nakamura</div></div>
                                <div class="soar-bar" data-duty="9"><div class="soar-bar-p"><i class="soar-bar-i" style="height:56.25%"></i></div><div class="soar-bar-l">M Bianchi</div></div>
                                <div class="soar-bar" data-duty="8"><div class="soar-bar-p"><i class="soar-bar-i" style="height:50%"></i></div><div class="soar-bar-l">R Alvarez</div></div>
                                <div class="soar-bar" data-duty="7"><div class="soar-bar-p"><i class="soar-bar-i" style="height:43.75%"></i></div><div class="soar-bar-l">D Kowalski</div></div>
                              </div>
                            </div>
                          </div>
                          <div class="soar-card soar-chart">
                            <div class="soar-ch-h">Mission Stability</div>
                            <svg class="soar-donut" viewBox="0 0 100 100" aria-hidden="true">
                              <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" stroke-width="11"/>
                              <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" stroke-width="11" stroke-linecap="butt" stroke-dasharray="226.19 25.13" transform="rotate(-90 50 50)"/>
                            </svg>
                            <div class="soar-krow soar-stable"><span>Stable Pairs</span><b>90.0%</b></div>
                            <div class="soar-krow soar-gaps"><span>Critical Gaps</span><b>2</b></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <figcaption class="app-shot-cap"><div class="st">Operations Dashboard</div><div class="sd">Live workload and stability across the whole roster, so over-tasking shows up before it becomes a problem</div></figcaption>
              </figure>
            </div>
            </div>
          </div>
```

- [ ] **Step 3d: Expand the rail placeholder**

`<!--SOAR-RAIL:dashboard-->` above is a marker, not shippable output. Replace that single comment line with this markup, which is the rail in full:

```html
                      <div class="soar-rail">
                        <div class="soar-brand"><span class="soar-wordmark">SOAR</span><span class="soar-sub">Duty Scheduler</span></div>
                        <div class="soar-nav">
                          <span class="soar-ni"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg><span>Calendar</span></span>
                          <span class="soar-ni"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><span>My Schedule</span></span>
                          <span class="soar-ni"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/></svg><span>Covering</span></span>
                          <span class="soar-ni soar-on"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg><span>Dashboard</span></span>
                          <span class="soar-ni"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg><span>Admin</span></span>
                        </div>
                        <div class="soar-rail-ft">
                          <span class="soar-rf"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg><span>Light Mode</span></span>
                          <span class="soar-user"><span class="soar-av">T</span><span class="soar-uinfo"><span class="soar-un">t.rahman@soar.demo</span><span class="soar-ur">Admin</span></span></span>
                          <span class="soar-rf"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg><span>Logout</span></span>
                          <span class="soar-ver">v1.0.11</span>
                        </div>
                      </div>
```

**Tasks 3, 4 and 5 each reuse this exact rail block**, changing only which `.soar-ni` carries `soar-on`. Keep it byte-identical otherwise.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node scripts/verify-soar.mjs`
Expected: PASS on all checks, including the four regression checks. `console messages: 0`, `external requests: 0`.

Then confirm visually: open the page, expand the SOAR entry, and compare the thumbnail against `screens/dashboard.png`. Click it and confirm the lightbox opens the mock scaled up, not clipped.

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-soar.mjs public/projects.html
git commit -m "Add the SOAR screen gallery and its Operations Dashboard

Registers .soar-mock as a fourth mock family by appending to MOCK_SEL,
the lightbox positioning rule and the frame-scale rules — no .bf-mock,
.mf-mock or .gr-mock line is touched. Authored at 720px/scale(.4), the
convention .mf-mock and .gr-mock already use.

Builds the shared rail (wordmark, five nav entries, persona, version)
and the first screen: four LIVE stat tiles, the ranked workload chart
and the stability donut, all read off screens/dashboard.png."
```

---

## Task 3: Covering Requests screen

**Files:**
- Modify: `public/projects.html` — append CSS to the `.soar-mock` block; append a `<figure>` to the SOAR `.app-shots`
- Modify: `scripts/verify-soar.mjs` — add covering checks

**Interfaces:**
- Consumes: `.soar-mock` tokens, `.soar-rail` markup and `.soar-h1`/`.soar-sub2`/`.soar-card` from Task 2.
- Produces: nothing later tasks depend on.

**Read `screens/covering.png` before starting.**

- [ ] **Step 1: Write the failing test**

In `scripts/verify-soar.mjs`, insert immediately **before** `// ── Report ─────`:

```js
// ── Check group 6: Covering Requests ─────────────────────────────────
const cov = await page.evaluate(() => {
  const mock = document.querySelector('.soar-mock[data-screen="covering"]');
  if (!mock) return { found: false };
  return {
    found: true,
    active: (mock.querySelector('.soar-ni.soar-on') || {}).textContent.trim(),
    h1: (mock.querySelector('.soar-h1') || {}).textContent.trim(),
    sub: (mock.querySelector('.soar-sub2') || {}).textContent.trim(),
    tabs: Array.prototype.slice.call(mock.querySelectorAll('.soar-tab')).map((t) => t.textContent.trim()),
    pending: (mock.querySelector('.soar-tab.soar-on-tab .soar-count') || {}).textContent || '',
    reqs: Array.prototype.slice.call(mock.querySelectorAll('.soar-req')).map((r) => ({
      date: (r.querySelector('.soar-req-d') || {}).textContent.trim(),
      sim: (r.querySelector('.soar-req-s') || {}).textContent.trim(),
      by: (r.querySelector('.soar-req-by') || {}).textContent.trim(),
      rep: (r.querySelector('.soar-rep') || {}).textContent.trim(),
      reason: (r.querySelector('.soar-reason-t') || {}).textContent.trim(),
      approve: !!r.querySelector('.soar-approve'),
      reject: !!r.querySelector('.soar-reject'),
    })),
  };
});

check('covering: screen exists', cov.found);
check('covering: Covering is the active nav item', cov.found && cov.active === 'Covering', cov.active);
check('covering: heading + subtitle match the capture',
  cov.found && cov.h1 === 'Covering Requests'
  && cov.sub === 'Manage mission coverage and assessor replacements');
check('covering: Pending/History tabs with a count of 3',
  cov.found && cov.tabs.length === 2 && /^Pending/.test(cov.tabs[0]) && cov.tabs[1] === 'History'
  && cov.pending.trim() === '3', `${JSON.stringify(cov.tabs)} count=${cov.pending}`);
check('covering: three request cards matching the capture',
  cov.found && JSON.stringify(cov.reqs.map((r) => `${r.date}|${r.sim}|${r.by}|${r.rep}`)) === JSON.stringify([
    'Tuesday, Aug 11th|SIM 1|S Whitfield|SUGGESTED REPLACEMENT: R ALVAREZ',
    'Thursday, Aug 13th|SIM 5|M Bianchi|SUGGESTED REPLACEMENT: L OKAFOR',
    'Wednesday, Aug 12th|SIM 1|K Nakamura|SUGGESTED REPLACEMENT: P NGUYEN',
  ]), JSON.stringify(cov.reqs.map((r) => `${r.date}|${r.sim}|${r.by}|${r.rep}`)));
check('covering: every card carries its reason and both actions',
  cov.found && cov.reqs.length === 3 && cov.reqs.every((r) => r.reason.length > 20 && r.approve && r.reject));
check('covering: reasons are the captured text, exactly',
  // Anchor-phrase substring checks let a corrupted reason (dropped clause,
  // swapped punctuation, wrong dash character) still pass as long as one
  // phrase survives. Compare the full string instead, byte-identical to
  // the capture, quote marks and em dash included.
  cov.found && JSON.stringify(cov.reqs.map((r) => r.reason)) === JSON.stringify([
    '"Medical appointment scheduled at short notice — unable to attend the afternoon wave."',
    '"Recalled to squadron duty for the Thursday PM wave. Handover notes prepared."',
    '"Currency renewal course clashes with the Wednesday PM slot."',
  ]), JSON.stringify(cov.reqs.map((r) => r.reason)));
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/verify-soar.mjs`
Expected: FAIL on all seven group-6 checks (`covering: screen exists` false). Everything from Tasks 1–2 still PASSes.

- [ ] **Step 3a: Append the CSS**

Add to the end of the `.soar-mock` style block:

```css
/* Covering Requests */
.soar-mock .soar-pane-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.soar-mock .soar-tabs{display:inline-flex;background:var(--soar-card);border:1px solid var(--soar-border);border-radius:8px;padding:3px;gap:2px;flex-shrink:0}
.soar-mock .soar-tab{display:flex;align-items:center;gap:5px;border-radius:6px;padding:4px 10px;font-size:8.5px;color:var(--soar-fg-3)}
.soar-mock .soar-tab.soar-on-tab{background:var(--soar-primary);color:#fff;font-weight:600}
.soar-mock .soar-count{background:rgba(255,255,255,.25);border-radius:999px;padding:0 4px;font-size:7px;font-weight:700}
.soar-mock .soar-req{display:flex;margin-top:9px;overflow:hidden}
.soar-mock .soar-req-main{flex:1;padding:10px 11px;min-width:0}
.soar-mock .soar-req-hd{display:flex;align-items:flex-start;gap:8px}
.soar-mock .soar-wave-badge{width:22px;height:22px;border-radius:7px;background:var(--soar-pm);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;font-size:6px;font-weight:700;letter-spacing:.06em;line-height:1}
.soar-mock .soar-req-d{font-size:10.5px;font-weight:700;color:var(--soar-fg)}
.soar-mock .soar-req-s{font-family:var(--soar-mono);font-size:7px;letter-spacing:.14em;color:var(--soar-fg-4)}
.soar-mock .soar-req-who{margin-left:auto;text-align:right;flex-shrink:0}
.soar-mock .soar-req-wl{font-family:var(--soar-mono);font-size:6.5px;letter-spacing:.14em;color:var(--soar-fg-4)}
.soar-mock .soar-req-by{font-size:9px;font-weight:700;color:var(--soar-fg)}
.soar-mock .soar-reason{background:var(--soar-card-2);border:1px solid var(--soar-border);border-radius:7px;padding:7px 9px;margin-top:8px}
.soar-mock .soar-reason-l{font-family:var(--soar-mono);font-size:6.5px;letter-spacing:.14em;color:var(--soar-fg-4)}
.soar-mock .soar-reason-t{font-size:8.5px;font-style:italic;color:var(--soar-fg-2);margin-top:3px}
.soar-mock .soar-rep{display:flex;align-items:center;gap:6px;background:rgba(16,185,129,.09);border:1px solid rgba(16,185,129,.25);border-radius:7px;padding:6px 9px;margin-top:7px;font-family:var(--soar-mono);font-size:7px;letter-spacing:.13em;color:var(--soar-good)}
.soar-mock .soar-req-act{width:88px;flex-shrink:0;border-left:1px solid var(--soar-border);display:flex;flex-direction:column;gap:6px;padding:10px}
.soar-mock .soar-btn2{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;border-radius:8px;font-size:9px;font-weight:700;padding:11px 0}
.soar-mock .soar-approve{background:var(--soar-good);color:#04231b}
.soar-mock .soar-reject{background:rgba(239,68,68,.14);border:1px solid rgba(239,68,68,.35);color:var(--soar-break)}
```

- [ ] **Step 3b: Append the figure**

Add inside the SOAR `<div class="app-shots">`, after the dashboard `</figure>`:

```html
              <figure class="app-shot" role="listitem" tabindex="0">
                <div class="app-shot-chrome"><span class="app-shot-dots"><span></span><span></span><span></span></span><span class="app-shot-title">SOAR — Covering Requests</span></div>
                <div class="app-shot-frame">
                  <div class="soar-mock" data-mock-width="720" data-screen="covering" aria-hidden="true">
                    <div class="soar-screen">
                      <!-- rail: copy Task 2's rail block verbatim, moving soar-on to the Covering entry -->
                      <div class="soar-pane">
                        <div class="soar-pane-top">
                          <div>
                            <div class="soar-h1">Covering Requests</div>
                            <div class="soar-sub2">Manage mission coverage and assessor replacements</div>
                          </div>
                          <div class="soar-tabs">
                            <span class="soar-tab soar-on-tab">Pending<span class="soar-count">3</span></span>
                            <span class="soar-tab">History</span>
                          </div>
                        </div>
                        <div class="soar-card soar-req">
                          <div class="soar-req-main">
                            <div class="soar-req-hd">
                              <span class="soar-wave-badge">PM</span>
                              <span><span class="soar-req-d">Tuesday, Aug 11th</span><span class="soar-req-s" style="display:block">SIM 1</span></span>
                              <span class="soar-req-who"><span class="soar-req-wl" style="display:block">REQUESTED BY</span><span class="soar-req-by">S Whitfield</span></span>
                            </div>
                            <div class="soar-reason"><span class="soar-reason-l">REASON FOR ABSENCE</span><div class="soar-reason-t">"Medical appointment scheduled at short notice — unable to attend the afternoon wave."</div></div>
                            <div class="soar-rep"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg><span>SUGGESTED REPLACEMENT: R ALVAREZ</span></div>
                          </div>
                          <div class="soar-req-act">
                            <span class="soar-btn2 soar-approve"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Approve</span>
                            <span class="soar-btn2 soar-reject"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>Reject</span>
                          </div>
                        </div>
                        <div class="soar-card soar-req">
                          <div class="soar-req-main">
                            <div class="soar-req-hd">
                              <span class="soar-wave-badge">PM</span>
                              <span><span class="soar-req-d">Thursday, Aug 13th</span><span class="soar-req-s" style="display:block">SIM 5</span></span>
                              <span class="soar-req-who"><span class="soar-req-wl" style="display:block">REQUESTED BY</span><span class="soar-req-by">M Bianchi</span></span>
                            </div>
                            <div class="soar-reason"><span class="soar-reason-l">REASON FOR ABSENCE</span><div class="soar-reason-t">"Recalled to squadron duty for the Thursday PM wave. Handover notes prepared."</div></div>
                            <div class="soar-rep"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg><span>SUGGESTED REPLACEMENT: L OKAFOR</span></div>
                          </div>
                          <div class="soar-req-act">
                            <span class="soar-btn2 soar-approve"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Approve</span>
                            <span class="soar-btn2 soar-reject"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>Reject</span>
                          </div>
                        </div>
                        <div class="soar-card soar-req">
                          <div class="soar-req-main">
                            <div class="soar-req-hd">
                              <span class="soar-wave-badge">PM</span>
                              <span><span class="soar-req-d">Wednesday, Aug 12th</span><span class="soar-req-s" style="display:block">SIM 1</span></span>
                              <span class="soar-req-who"><span class="soar-req-wl" style="display:block">REQUESTED BY</span><span class="soar-req-by">K Nakamura</span></span>
                            </div>
                            <div class="soar-reason"><span class="soar-reason-l">REASON FOR ABSENCE</span><div class="soar-reason-t">"Currency renewal course clashes with the Wednesday PM slot."</div></div>
                            <div class="soar-rep"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg><span>SUGGESTED REPLACEMENT: P NGUYEN</span></div>
                          </div>
                          <div class="soar-req-act">
                            <span class="soar-btn2 soar-approve"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Approve</span>
                            <span class="soar-btn2 soar-reject"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>Reject</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <figcaption class="app-shot-cap"><div class="st">Covering Requests</div><div class="sd">An assessor raises a request with a reason and a suggested stand-in; a supervisor approves or rejects, and the decision lands in History</div></figcaption>
              </figure>
```

Replace the `<!-- rail: ... -->` comment with Task 2's full rail block, moving `soar-on` from the Dashboard `.soar-ni` to the Covering one. Everything else in the rail stays byte-identical.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node scripts/verify-soar.mjs`
Expected: PASS on all checks. Compare the thumbnail against `screens/covering.png`.

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-soar.mjs public/projects.html
git commit -m "Add the SOAR Covering Requests screen

Pending/History tabs and the three pending request cards from
screens/covering.png, each with its requester, reason quote, suggested
replacement and Approve/Reject actions."
```

---

## Task 4: System Administration screen

**Files:**
- Modify: `public/projects.html` — append CSS; append a `<figure>`
- Modify: `scripts/verify-soar.mjs` — add admin checks

**Interfaces:**
- Consumes: `.soar-mock` tokens, the rail, `.soar-h1`/`.soar-sub2`/`.soar-card` from Task 2.
- Produces: nothing later tasks depend on.

**Read `screens/admin.png` before starting.**

- [ ] **Step 1: Write the failing test**

Insert immediately **before** `// ── Report ─────`:

```js
// ── Check group 7: System Administration ─────────────────────────────
const adm = await page.evaluate(() => {
  const mock = document.querySelector('.soar-mock[data-screen="admin"]');
  if (!mock) return { found: false };
  return {
    found: true,
    active: (mock.querySelector('.soar-ni.soar-on') || {}).textContent.trim(),
    h1: (mock.querySelector('.soar-h1') || {}).textContent.trim(),
    sub: (mock.querySelector('.soar-sub2') || {}).textContent.trim(),
    tabs: Array.prototype.slice.call(mock.querySelectorAll('.soar-atab')).map((t) => t.textContent.trim()),
    activeTab: (mock.querySelector('.soar-atab.soar-on-tab') || {}).textContent.trim(),
    people: Array.prototype.slice.call(mock.querySelectorAll('.soar-person')).map((p) => ({
      name: (p.querySelector('.soar-pn') || {}).textContent.trim(),
      roles: Array.prototype.slice.call(p.querySelectorAll('.soar-role')).map((r) => r.textContent.trim()),
      duties: (p.querySelector('.soar-duties') || {}).textContent.trim(),
      sup: !!p.querySelector('.soar-tg-sup.soar-tg-on'),
      off: !!p.querySelector('.soar-tg-pwr.soar-tg-off'),
    })),
  };
});

check('admin: screen exists', adm.found);
check('admin: Admin is the active nav item', adm.found && adm.active === 'Admin', adm.active);
check('admin: heading + subtitle match the capture',
  adm.found && adm.h1 === 'System Administration'
  && adm.sub === 'Manage assessors, wave configurations, and system parameters');
check('admin: five tabs, Assessors active',
  adm.found && JSON.stringify(adm.tabs) === JSON.stringify(
    ['ASSESSORS', 'ROLE TYPES', 'WAVE SLOTS', 'USER ACCOUNTS', 'SIMULATORS'])
  && adm.activeTab === 'ASSESSORS', JSON.stringify(adm.tabs));
check('admin: ten assessors with the captured duty counts',
  adm.found && JSON.stringify(adm.people.map((p) => `${p.name}:${p.duties}`)) === JSON.stringify([
    'T Rahman:14', 'L Okafor:13', 'S Whitfield:12', 'A Delgado:11', 'K Nakamura:10',
    'M Bianchi:9', 'R Alvarez:8', 'D Kowalski:7', 'P Nguyen:6', 'J Farrow:5',
  ]), JSON.stringify(adm.people.map((p) => `${p.name}:${p.duties}`)));
check('admin: role tags match the capture',
  adm.found && JSON.stringify(adm.people.map((p) => p.roles.join('+'))) === JSON.stringify([
    'QFI+SENIOR PSYCH', 'REGULAR PSYCH', 'QFI', 'REGULAR PSYCH', 'QFI',
    'SENIOR PSYCH', 'QFI', 'REGULAR PSYCH', 'QFI', 'TRAINEE ASSESSOR',
  ]), JSON.stringify(adm.people.map((p) => p.roles.join('+'))));
check('admin: supervisors are exactly T Rahman and S Whitfield',
  adm.found && JSON.stringify(adm.people.filter((p) => p.sup).map((p) => p.name))
    === JSON.stringify(['T Rahman', 'S Whitfield']),
  JSON.stringify(adm.found ? adm.people.filter((p) => p.sup).map((p) => p.name) : []));
check('admin: J Farrow is the only inactive assessor',
  adm.found && JSON.stringify(adm.people.filter((p) => p.off).map((p) => p.name))
    === JSON.stringify(['J Farrow']),
  JSON.stringify(adm.found ? adm.people.filter((p) => p.off).map((p) => p.name) : []));
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/verify-soar.mjs`
Expected: FAIL on all eight group-7 checks. Tasks 1–3 checks still PASS.

- [ ] **Step 3a: Append the CSS**

```css
/* System Administration */
.soar-mock .soar-atabs{display:flex;gap:14px;border-bottom:1px solid var(--soar-border);margin-top:11px}
.soar-mock .soar-atab{display:flex;align-items:center;gap:5px;padding:0 0 7px;font-family:var(--soar-mono);font-size:7.5px;letter-spacing:.13em;color:var(--soar-fg-4)}
.soar-mock .soar-atab.soar-on-tab{color:var(--soar-primary-2);border-bottom:2px solid var(--soar-primary-2);margin-bottom:-1px}
.soar-mock .soar-roster{display:flex;align-items:center;justify-content:space-between;margin-top:11px}
.soar-mock .soar-roster-h{font-size:11px;font-weight:700}
.soar-mock .soar-add{display:flex;align-items:center;gap:5px;background:var(--soar-primary);color:#fff;border-radius:7px;padding:6px 10px;font-size:8.5px;font-weight:600}
.soar-mock .soar-people{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:9px}
.soar-mock .soar-person{padding:9px 10px}
.soar-mock .soar-p-top{display:flex;align-items:flex-start;justify-content:space-between;gap:6px}
.soar-mock .soar-pn{font-size:10px;font-weight:700;color:var(--soar-fg)}
.soar-mock .soar-roles{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}
.soar-mock .soar-role{background:rgba(59,130,246,.14);color:#93c5fd;border-radius:999px;padding:1px 6px;font-family:var(--soar-mono);font-size:6.5px;letter-spacing:.1em}
.soar-mock .soar-p-ft{display:flex;align-items:flex-end;justify-content:space-between;border-top:1px solid var(--soar-border);margin-top:8px;padding-top:7px}
.soar-mock .soar-duties{font-size:10px;font-weight:600;color:var(--soar-primary-2);font-variant-numeric:tabular-nums;line-height:1.1}
.soar-mock .soar-duties-l{font-family:var(--soar-mono);font-size:6.5px;letter-spacing:.13em;color:var(--soar-fg-4)}
.soar-mock .soar-tgs{display:flex;gap:5px}
.soar-mock .soar-tg{width:19px;height:19px;border-radius:6px;display:grid;place-items:center;background:rgba(148,163,184,.1);color:var(--soar-fg-4)}
.soar-mock .soar-tg-sup.soar-tg-on{background:rgba(245,158,11,.16);color:var(--soar-covering)}
.soar-mock .soar-tg-pwr{background:rgba(16,185,129,.14);color:var(--soar-good)}
.soar-mock .soar-tg-pwr.soar-tg-off{background:rgba(239,68,68,.16);color:var(--soar-break)}
```

- [ ] **Step 3b: Append the figure**

Add after the covering `</figure>`. The person card is repetitive, so the block below shows the three structural variants in full — a supervisor with two role tags, a plain assessor, and the inactive one — then the table gives the remaining seven. Emit all ten.

```html
              <figure class="app-shot" role="listitem" tabindex="0">
                <div class="app-shot-chrome"><span class="app-shot-dots"><span></span><span></span><span></span></span><span class="app-shot-title">SOAR — System Administration</span></div>
                <div class="app-shot-frame">
                  <div class="soar-mock" data-mock-width="720" data-screen="admin" aria-hidden="true">
                    <div class="soar-screen">
                      <!-- rail: copy Task 2's rail block verbatim, moving soar-on to the Admin entry -->
                      <div class="soar-pane">
                        <div class="soar-h1">System Administration</div>
                        <div class="soar-sub2">Manage assessors, wave configurations, and system parameters</div>
                        <div class="soar-atabs">
                          <span class="soar-atab soar-on-tab"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>ASSESSORS</span>
                          <span class="soar-atab"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>ROLE TYPES</span>
                          <span class="soar-atab"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>WAVE SLOTS</span>
                          <span class="soar-atab"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>USER ACCOUNTS</span>
                          <span class="soar-atab"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>SIMULATORS</span>
                        </div>
                        <div class="soar-roster">
                          <span class="soar-roster-h">Personnel Roster</span>
                          <span class="soar-add"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5v14"/></svg>Add Assessor</span>
                        </div>
                        <div class="soar-people">

                          <!-- Variant A: supervisor, two role tags -->
                          <div class="soar-card soar-person">
                            <div class="soar-p-top"><span class="soar-pn">T Rahman</span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg></div>
                            <div class="soar-roles"><span class="soar-role">QFI</span><span class="soar-role">SENIOR PSYCH</span></div>
                            <div class="soar-p-ft">
                              <span><span class="soar-duties" style="display:block">14</span><span class="soar-duties-l">DUTIES</span></span>
                              <span class="soar-tgs">
                                <span class="soar-tg soar-tg-sup soar-tg-on"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg></span>
                                <span class="soar-tg soar-tg-pwr"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/></svg></span>
                              </span>
                            </div>
                          </div>

                          <!-- Variant B: plain active assessor, one role tag -->
                          <div class="soar-card soar-person">
                            <div class="soar-p-top"><span class="soar-pn">L Okafor</span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg></div>
                            <div class="soar-roles"><span class="soar-role">REGULAR PSYCH</span></div>
                            <div class="soar-p-ft">
                              <span><span class="soar-duties" style="display:block">13</span><span class="soar-duties-l">DUTIES</span></span>
                              <span class="soar-tgs">
                                <span class="soar-tg soar-tg-sup"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg></span>
                                <span class="soar-tg soar-tg-pwr"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/></svg></span>
                              </span>
                            </div>
                          </div>

                          <!-- Cards 3-9 follow Variant B exactly, per the table below.
                               S Whitfield additionally takes soar-tg-on on its shield,
                               like Variant A. -->

                          <!-- Variant C: inactive (power toggle red) -->
                          <div class="soar-card soar-person">
                            <div class="soar-p-top"><span class="soar-pn">J Farrow</span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg></div>
                            <div class="soar-roles"><span class="soar-role">TRAINEE ASSESSOR</span></div>
                            <div class="soar-p-ft">
                              <span><span class="soar-duties" style="display:block">5</span><span class="soar-duties-l">DUTIES</span></span>
                              <span class="soar-tgs">
                                <span class="soar-tg soar-tg-sup"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg></span>
                                <span class="soar-tg soar-tg-pwr soar-tg-off"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/></svg></span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <figcaption class="app-shot-cap"><div class="st">System Administration</div><div class="sd">Assessors, role types, wave slots, user accounts and simulators are all managed in-app. Demonstration dataset — all personnel and reasons shown across these screens are fabricated.</div></figcaption>
              </figure>
```

Cards 3–9 sit between Variant B and Variant C, in this order, each an exact copy of Variant B with only the name, role tag(s) and duty number substituted:

| # | Name | Role tag | Duties | Shield |
|---|---|---|---|---|
| 3 | S Whitfield | QFI | 12 | `soar-tg-sup soar-tg-on` |
| 4 | A Delgado | REGULAR PSYCH | 11 | `soar-tg-sup` |
| 5 | K Nakamura | QFI | 10 | `soar-tg-sup` |
| 6 | M Bianchi | SENIOR PSYCH | 9 | `soar-tg-sup` |
| 7 | R Alvarez | QFI | 8 | `soar-tg-sup` |
| 8 | D Kowalski | REGULAR PSYCH | 7 | `soar-tg-sup` |
| 9 | P Nguyen | QFI | 6 | `soar-tg-sup` |

Replace the `<!-- rail: ... -->` comment with Task 2's full rail block, `soar-on` on Admin. Delete the `<!-- Cards 3-9 ... -->` comment once the cards are in — no explanatory comments ship inside the markup.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node scripts/verify-soar.mjs`
Expected: PASS on all checks. Compare against `screens/admin.png`.

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-soar.mjs public/projects.html
git commit -m "Add the SOAR System Administration screen

Five admin tabs and the ten-person roster from screens/admin.png, with
role tags, duty counts, the two lit supervisor shields and J Farrow's
inactive state. Carries the fabricated-dataset disclosure."
```

---

## Task 5: Weekly Schedule screen

**Files:**
- Modify: `public/projects.html` — append CSS; append a `<figure>`
- Modify: `scripts/verify-soar.mjs` — add calendar checks

**Interfaces:**
- Consumes: `.soar-mock` tokens, the rail, `.soar-h1` from Task 2.
- Produces: nothing later tasks depend on.

**Read `screens/calendar.png` before starting.** This is the densest screen — 20 missions across five columns.

- [ ] **Step 1: Write the failing test**

Insert immediately **before** `// ── Report ─────`:

```js
// ── Check group 8: Weekly Schedule ───────────────────────────────────
const cal = await page.evaluate(() => {
  const mock = document.querySelector('.soar-mock[data-screen="calendar"]');
  if (!mock) return { found: false };
  const missions = Array.prototype.slice.call(mock.querySelectorAll('.soar-mission'));
  return {
    found: true,
    active: (mock.querySelector('.soar-ni.soar-on') || {}).textContent.trim(),
    h1: (mock.querySelector('.soar-h1') || {}).textContent.trim(),
    week: (mock.querySelector('.soar-week') || {}).textContent.trim(),
    state: (mock.querySelector('.soar-state') || {}).textContent.trim(),
    actions: Array.prototype.slice.call(mock.querySelectorAll('.soar-cal-btn')).map((b) => b.textContent.trim()),
    legend: Array.prototype.slice.call(mock.querySelectorAll('.soar-lg')).map((l) => l.textContent.trim()),
    days: Array.prototype.slice.call(mock.querySelectorAll('.soar-day-h')).map((d) => d.textContent.trim()),
    slots: Array.prototype.slice.call(mock.querySelectorAll('.soar-slot-t')).map((s) => s.textContent.trim()),
    missionCount: missions.length,
    broken: missions.filter((m) => m.classList.contains('soar-break-c'))
      .map((m) => m.getAttribute('data-cell')),
    covering: missions.filter((m) => m.classList.contains('soar-cover-c'))
      .map((m) => m.getAttribute('data-cell')),
    unassigned: Array.prototype.slice.call(mock.querySelectorAll('.soar-unassigned')).length,
    missions: missions.map((m) => {
      const prs = Array.prototype.slice.call(m.querySelectorAll('.soar-pr'));
      const q = prs.find((p) => p.querySelector('.soar-tagq'));
      const p = prs.find((p) => p.querySelector('.soar-tagp'));
      return {
        cell: m.getAttribute('data-cell'),
        sim: (m.querySelector('.soar-sim') || {}).textContent.trim(),
        q: q ? q.textContent.replace(/^Q/, '').trim() : null,
        p: p ? p.textContent.replace(/^P/, '').trim() : null,
      };
    }),
  };
});

check('calendar: screen exists', cal.found);
check('calendar: Calendar is the active nav item', cal.found && cal.active === 'Calendar', cal.active);
check('calendar: heading, week and OPEN state match the capture',
  cal.found && cal.h1 === 'Weekly Schedule'
  && cal.week === 'Week of August 10th, 2026' && cal.state === 'OPEN',
  `${cal.h1} | ${cal.week} | ${cal.state}`);
check('calendar: Lock Week + Create Mission actions',
  cal.found && JSON.stringify(cal.actions) === JSON.stringify(['Lock Week', 'Create Mission']),
  JSON.stringify(cal.actions));
check('calendar: five-item legend',
  cal.found && JSON.stringify(cal.legend) === JSON.stringify(
    ['QFI Assigned', 'Psych Assigned', 'Unassigned', 'Broken Pair', 'Covering Mission']),
  JSON.stringify(cal.legend));
check('calendar: five day columns Mon 10 to Fri 14',
  cal.found && JSON.stringify(cal.days) === JSON.stringify([
    'MondayAug 10', 'TuesdayAug 11', 'WednesdayAug 12', 'ThursdayAug 13', 'FridayAug 14',
  ]), JSON.stringify(cal.days));
check('calendar: 20 wave-slot headers (4 per day)',
  cal.found && cal.slots.length === 20, String(cal.slots.length));
check('calendar: slot times repeat 08:00/10:15/13:30/15:45 per day',
  cal.found && cal.slots.every((s, i) => s === ['08:00', '10:15', '13:30', '15:45'][i % 4]),
  JSON.stringify(cal.slots.slice(0, 4)));
check('calendar: 20 missions', cal.found && cal.missionCount === 20, String(cal.missionCount));
check('calendar: exactly the two captured broken pairs',
  cal.found && JSON.stringify(cal.broken) === JSON.stringify(['tue-w3', 'thu-w3']),
  JSON.stringify(cal.broken));
check('calendar: exactly the two captured covering missions',
  cal.found && JSON.stringify(cal.covering) === JSON.stringify(['wed-w3', 'fri-w2']),
  JSON.stringify(cal.covering));
check('calendar: two Unassigned slots, one per broken pair',
  cal.found && cal.unassigned === 2, String(cal.unassigned));
check('calendar: all 20 missions match the capture exactly — sim, Q and P per cell',
  // The checks above assert aggregate counts and which cells are flagged,
  // but never the actual name/simulator on any cell — a transposed name on
  // one of the 16 unflagged missions would still pass all of them. Assert
  // the full grid as one exact array comparison instead.
  cal.found && JSON.stringify(cal.missions.map((m) => `${m.cell}:${m.sim}|${m.q}|${m.p}`)) === JSON.stringify([
    'mon-w1:Sim 1|T Rahman|L Okafor', 'mon-w2:Sim 2|S Whitfield|A Delgado',
    'mon-w3:Sim 1|K Nakamura|M Bianchi', 'mon-w4:Sim 3|R Alvarez|D Kowalski',
    'tue-w1:Sim 2|T Rahman|M Bianchi', 'tue-w2:Sim 4|P Nguyen|L Okafor',
    'tue-w3:Sim 1|S Whitfield|Unassigned', 'tue-w4:Sim 3|K Nakamura|A Delgado',
    'wed-w1:Sim 5|R Alvarez|D Kowalski', 'wed-w2:Sim 2|T Rahman|A Delgado',
    'wed-w3:Sim 4|P Nguyen|M Bianchi', 'wed-w4:Sim 1|K Nakamura|L Okafor',
    'thu-w1:Sim 3|S Whitfield|D Kowalski', 'thu-w2:Sim 1|T Rahman|L Okafor',
    'thu-w3:Sim 5|Unassigned|M Bianchi', 'thu-w4:Sim 2|R Alvarez|A Delgado',
    'fri-w1:Sim 4|K Nakamura|M Bianchi', 'fri-w2:Sim 2|P Nguyen|D Kowalski',
    'fri-w3:Sim 1|T Rahman|L Okafor', 'fri-w4:Sim 3|S Whitfield|A Delgado',
  ]), JSON.stringify(cal.missions.map((m) => `${m.cell}:${m.sim}|${m.q}|${m.p}`)));
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/verify-soar.mjs`
Expected: FAIL on all twelve group-8 checks. Tasks 1–4 checks still PASS.

- [ ] **Step 3a: Append the CSS**

```css
/* Weekly Schedule */
.soar-mock .soar-cal-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.soar-mock .soar-h1-row{display:flex;align-items:center;gap:8px}
.soar-mock .soar-state{display:inline-flex;align-items:center;gap:4px;background:rgba(16,185,129,.14);border:1px solid rgba(16,185,129,.3);color:var(--soar-good);border-radius:999px;padding:2px 8px;font-family:var(--soar-mono);font-size:7px;letter-spacing:.13em;font-weight:700}
.soar-mock .soar-navweek{display:flex;align-items:center;gap:8px;margin-top:5px}
.soar-mock .soar-today{font-family:var(--soar-mono);font-size:7.5px;letter-spacing:.13em;color:var(--soar-primary-2);font-weight:700}
.soar-mock .soar-week{font-size:9.5px;color:var(--soar-fg-2)}
.soar-mock .soar-cal-acts{display:flex;gap:7px;flex-shrink:0}
.soar-mock .soar-cal-btn{display:flex;align-items:center;gap:5px;border-radius:8px;padding:6px 11px;font-size:9px;font-weight:700}
.soar-mock .soar-cal-btn.soar-lock{background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.4);color:var(--soar-covering)}
.soar-mock .soar-cal-btn.soar-create{background:var(--soar-primary);color:#fff}
.soar-mock .soar-legend{display:flex;flex-wrap:wrap;gap:14px;background:var(--soar-card);border:1px solid var(--soar-border);border-radius:var(--soar-r);padding:7px 11px;margin-top:9px}
.soar-mock .soar-lg{display:flex;align-items:center;gap:5px;font-size:8px;color:var(--soar-fg-3)}
.soar-mock .soar-sw{width:8px;height:8px;border-radius:2px;flex-shrink:0}
.soar-mock .soar-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:8px}
.soar-mock .soar-day-h{background:var(--soar-card);border:1px solid var(--soar-border);border-radius:8px;text-align:center;padding:6px 4px}
.soar-mock .soar-dn{display:block;font-size:9.5px;font-weight:700;color:var(--soar-fg)}
.soar-mock .soar-dd{display:block;font-size:7.5px;color:var(--soar-fg-4)}
.soar-mock .soar-wave-h{display:flex;align-items:center;gap:5px;margin:8px 0 4px;font-family:var(--soar-mono);font-size:7px;letter-spacing:.14em;font-weight:700}
.soar-mock .soar-wave-h.soar-am{color:var(--soar-am)}
.soar-mock .soar-wave-h.soar-pm{color:var(--soar-pm)}
.soar-mock .soar-wave-dot{width:5px;height:5px;border-radius:50%;background:currentColor;flex-shrink:0}
.soar-mock .soar-slot{display:flex;align-items:center;justify-content:space-between;padding:0 1px 3px;font-family:var(--soar-mono);font-size:6.5px;letter-spacing:.1em;color:var(--soar-fg-4)}
.soar-mock .soar-slot-t{display:flex;align-items:center;gap:3px}
.soar-mock .soar-mission{background:var(--soar-card);border:1px solid var(--soar-border);border-radius:8px;padding:6px 7px;margin-bottom:6px;position:relative}
.soar-mock .soar-mission.soar-break-c{border-color:rgba(239,68,68,.55)}
.soar-mock .soar-mission.soar-cover-c{border-color:rgba(245,158,11,.55)}
.soar-mock .soar-flag{position:absolute;top:5px;right:6px}
.soar-mock .soar-sim{font-size:8.5px;font-weight:700;color:var(--soar-fg);margin-bottom:3px}
.soar-mock .soar-pr{display:flex;align-items:center;gap:5px;font-size:8px;color:var(--soar-fg-2);padding:1px 0}
.soar-mock .soar-tagq,.soar-mock .soar-tagp{width:11px;height:11px;border-radius:3px;display:grid;place-items:center;font-size:6.5px;font-weight:700;flex-shrink:0}
.soar-mock .soar-tagq{background:rgba(59,130,246,.2);color:#93c5fd}
.soar-mock .soar-tagp{background:rgba(168,85,247,.2);color:#d8b4fe}
.soar-mock .soar-unassigned{color:var(--soar-break)}
.soar-mock .soar-obs{display:flex;align-items:center;gap:5px;font-size:7.5px;color:var(--soar-fg-4);padding:2px 0;border-top:1px solid var(--soar-border);margin-top:4px;padding-top:4px}
.soar-mock .soar-reqcov{display:block;text-align:center;border:1px solid rgba(245,158,11,.4);color:var(--soar-covering);border-radius:6px;padding:3px 0;margin-top:5px;font-family:var(--soar-mono);font-size:6.5px;letter-spacing:.11em;font-weight:700}
```

- [ ] **Step 3b: Insert the figure — as the FIRST screen in the gallery**

Insert this **before** the Operations Dashboard `<figure>`, not after the admin one. The spec's screen order is Weekly Schedule → Dashboard → Covering → Admin: the schedule is the app's primary screen and leads the gallery, while the demonstration-dataset disclosure stays last on the Admin caption. Build order and gallery order differ deliberately — this screen is built last because it is the densest, but it ships first.

The Monday column below is complete and shows every structural variant except the two flags; the broken-pair and covering variants follow it in full. Emit all five columns.

```html
              <figure class="app-shot" role="listitem" tabindex="0">
                <div class="app-shot-chrome"><span class="app-shot-dots"><span></span><span></span><span></span></span><span class="app-shot-title">SOAR — Weekly Schedule</span></div>
                <div class="app-shot-frame">
                  <div class="soar-mock" data-mock-width="720" data-screen="calendar" aria-hidden="true">
                    <div class="soar-screen">
                      <!-- rail: copy Task 2's rail block verbatim, moving soar-on to the Calendar entry -->
                      <div class="soar-pane">
                        <div class="soar-cal-hd">
                          <div>
                            <div class="soar-h1-row"><span class="soar-h1">Weekly Schedule</span><span class="soar-state"><span class="soar-wave-dot"></span>OPEN</span></div>
                            <div class="soar-navweek">
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>
                              <span class="soar-today">TODAY</span>
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
                              <span class="soar-week">Week of August 10th, 2026</span>
                            </div>
                          </div>
                          <div class="soar-cal-acts">
                            <span class="soar-cal-btn soar-lock"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>Lock Week</span>
                            <span class="soar-cal-btn soar-create"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>Create Mission</span>
                          </div>
                        </div>
                        <div class="soar-legend">
                          <span class="soar-lg"><span class="soar-sw" style="background:#3b82f6"></span>QFI Assigned</span>
                          <span class="soar-lg"><span class="soar-sw" style="background:#a855f7"></span>Psych Assigned</span>
                          <span class="soar-lg"><span class="soar-sw" style="background:#ef4444"></span>Unassigned</span>
                          <span class="soar-lg"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>Broken Pair</span>
                          <span class="soar-lg"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>Covering Mission</span>
                        </div>
                        <div class="soar-grid">
                          <div class="soar-day-h"><span class="soar-dn">Monday</span><span class="soar-dd">Aug 10</span></div>
                          <div class="soar-day-h"><span class="soar-dn">Tuesday</span><span class="soar-dd">Aug 11</span></div>
                          <div class="soar-day-h"><span class="soar-dn">Wednesday</span><span class="soar-dd">Aug 12</span></div>
                          <div class="soar-day-h"><span class="soar-dn">Thursday</span><span class="soar-dd">Aug 13</span></div>
                          <div class="soar-day-h"><span class="soar-dn">Friday</span><span class="soar-dd">Aug 14</span></div>
                        </div>
                        <div class="soar-grid" style="margin-top:0">

                          <!-- ── Monday: the complete column pattern ── -->
                          <div>
                            <div class="soar-wave-h soar-am"><span class="soar-wave-dot"></span>AM WAVE</div>
                            <div class="soar-slot"><span class="soar-slot-t"><svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>08:00</span><span>WAVE 1</span></div>
                            <div class="soar-mission" data-cell="mon-w1">
                              <div class="soar-sim">Sim 1</div>
                              <div class="soar-pr"><span class="soar-tagq">Q</span>T Rahman</div>
                              <div class="soar-pr"><span class="soar-tagp">P</span>L Okafor</div>
                              <span class="soar-reqcov">REQUEST COVERAGE</span>
                            </div>
                            <div class="soar-slot"><span class="soar-slot-t"><svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>10:15</span><span>WAVE 2</span></div>
                            <div class="soar-mission" data-cell="mon-w2">
                              <div class="soar-sim">Sim 2</div>
                              <div class="soar-pr"><span class="soar-tagq">Q</span>S Whitfield</div>
                              <div class="soar-pr"><span class="soar-tagp">P</span>A Delgado</div>
                            </div>
                            <div class="soar-wave-h soar-pm"><span class="soar-wave-dot"></span>PM WAVE</div>
                            <div class="soar-slot"><span class="soar-slot-t"><svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>13:30</span><span>WAVE 3</span></div>
                            <div class="soar-mission" data-cell="mon-w3">
                              <div class="soar-sim">Sim 1</div>
                              <div class="soar-pr"><span class="soar-tagq">Q</span>K Nakamura</div>
                              <div class="soar-pr"><span class="soar-tagp">P</span>M Bianchi</div>
                            </div>
                            <div class="soar-slot"><span class="soar-slot-t"><svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>15:45</span><span>WAVE 4</span></div>
                            <div class="soar-mission" data-cell="mon-w4">
                              <div class="soar-sim">Sim 3</div>
                              <div class="soar-pr"><span class="soar-tagq">Q</span>R Alvarez</div>
                              <div class="soar-pr"><span class="soar-tagp">P</span>D Kowalski</div>
                            </div>
                          </div>

                          <!-- Tuesday, Wednesday, Thursday, Friday columns follow the
                               same shape, per the table below. -->
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <figcaption class="app-shot-cap"><div class="st">Weekly Schedule</div><div class="sd">Five days, two waves, four slots. Broken pairs and covering missions are flagged in the grid, not buried</div></figcaption>
              </figure>
```

**The broken-pair variant** (used at `tue-w3` and `thu-w3`) — note the extra class, the flag, and the red `Unassigned` half:

```html
                            <div class="soar-mission soar-break-c" data-cell="tue-w3">
                              <span class="soar-flag"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg></span>
                              <div class="soar-sim">Sim 1</div>
                              <div class="soar-pr"><span class="soar-tagq">Q</span>S Whitfield</div>
                              <div class="soar-pr soar-unassigned"><span class="soar-tagp">P</span>Unassigned</div>
                            </div>
```

**The covering variant** (used at `wed-w3` and `fri-w2`):

```html
                            <div class="soar-mission soar-cover-c" data-cell="wed-w3">
                              <span class="soar-flag"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg></span>
                              <div class="soar-sim">Sim 4</div>
                              <div class="soar-pr"><span class="soar-tagq">Q</span>P Nguyen</div>
                              <div class="soar-pr"><span class="soar-tagp">P</span>M Bianchi</div>
                            </div>
```

**The observer row** (Thursday W2 only) sits after the `P` row and before the Request Coverage button:

```html
                              <div class="soar-obs"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>J Farrow</div>
```

The full grid — every `data-cell`, simulator, Q, P and extra. `RC` = Request Coverage button; `BREAK` = broken-pair variant; `COVER` = covering variant:

| Cell | Sim | Q | P | Extra |
|---|---|---|---|---|
| `mon-w1` | Sim 1 | T Rahman | L Okafor | RC |
| `mon-w2` | Sim 2 | S Whitfield | A Delgado | — |
| `mon-w3` | Sim 1 | K Nakamura | M Bianchi | — |
| `mon-w4` | Sim 3 | R Alvarez | D Kowalski | — |
| `tue-w1` | Sim 2 | T Rahman | M Bianchi | RC |
| `tue-w2` | Sim 4 | P Nguyen | L Okafor | — |
| `tue-w3` | Sim 1 | S Whitfield | Unassigned | **BREAK** |
| `tue-w4` | Sim 3 | K Nakamura | A Delgado | — |
| `wed-w1` | Sim 5 | R Alvarez | D Kowalski | — |
| `wed-w2` | Sim 2 | T Rahman | A Delgado | RC |
| `wed-w3` | Sim 4 | P Nguyen | M Bianchi | **COVER** |
| `wed-w4` | Sim 1 | K Nakamura | L Okafor | — |
| `thu-w1` | Sim 3 | S Whitfield | D Kowalski | — |
| `thu-w2` | Sim 1 | T Rahman | L Okafor | observer J Farrow, then RC |
| `thu-w3` | Sim 5 | Unassigned | M Bianchi | **BREAK** (the `Q` row is the red one here) |
| `thu-w4` | Sim 2 | R Alvarez | A Delgado | — |
| `fri-w1` | Sim 4 | K Nakamura | M Bianchi | — |
| `fri-w2` | Sim 2 | P Nguyen | D Kowalski | **COVER** |
| `fri-w3` | Sim 1 | T Rahman | L Okafor | RC |
| `fri-w4` | Sim 3 | S Whitfield | A Delgado | — |

Every column repeats Monday's `AM WAVE` / slot / `PM WAVE` / slot scaffolding verbatim — four `.soar-slot` headers per day in the order 08:00 WAVE 1, 10:15 WAVE 2, 13:30 WAVE 3, 15:45 WAVE 4, with the `PM WAVE` header between WAVE 2 and WAVE 3.

Replace the `<!-- rail: ... -->` comment with Task 2's rail block, `soar-on` on Calendar. Delete the `<!-- Tuesday, Wednesday ... -->` comment once the columns are in.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node scripts/verify-soar.mjs`
Expected: PASS on all checks. Compare carefully against `screens/calendar.png` — this is the screen where a transposed name or simulator is easiest to miss.

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-soar.mjs public/projects.html
git commit -m "Add the SOAR Weekly Schedule screen

The five-day, two-wave, four-slot grid from screens/calendar.png: all 20
missions with their QFI/Psych pairs, the two broken pairs flagged red
with their Unassigned half, the two covering missions flagged amber, the
Thursday observer row, and the week's OPEN state."
```

---

## Task 6: Page-level verification and responsive behaviour

**Files:**
- Modify: `public/projects.html` — add the narrow-viewport rule to the `.soar-mock` block
- Modify: `scripts/verify-soar.mjs` — add page-level, interaction and responsive checks

**Interfaces:**
- Consumes: all four screens from Tasks 2–5.
- Produces: the finished, verified entry.

- [ ] **Step 1: Write the failing test**

Insert immediately **before** `// ── Report ─────`:

```js
// ── Check group 9: thumbnails, lightbox interaction, disclosure ──────
const gallery = await page.evaluate(() => {
  const shots = Array.prototype.slice.call(
    document.querySelectorAll('.app-shots[aria-label^="SOAR Duty Scheduler"] .app-shot'));
  return {
    count: shots.length,
    titles: shots.map((s) => (s.querySelector('.app-shot-title') || {}).textContent.trim()),
    caps: shots.map((s) => (s.querySelector('.app-shot-cap .st') || {}).textContent.trim()),
    overflow: shots.map((s) => {
      const frame = s.querySelector('.app-shot-frame');
      const mock = s.querySelector('.soar-mock');
      if (!frame || !mock) return null;
      return Math.round(mock.getBoundingClientRect().width) - Math.round(frame.getBoundingClientRect().width);
    }),
    tabbable: shots.every((s) => s.getAttribute('tabindex') === '0'),
    disclosure: shots.some((s) => /Demonstration dataset/.test(s.textContent)),
    lastCap: shots.length ? shots[shots.length - 1].textContent : '',
  };
});

check('gallery: four SOAR screens', gallery.count === 4, String(gallery.count));
check('gallery: four screens in the spec order, Weekly Schedule first',
  JSON.stringify(gallery.titles) === JSON.stringify([
    'SOAR — Weekly Schedule', 'SOAR — Operations Dashboard',
    'SOAR — Covering Requests', 'SOAR — System Administration',
  ]), JSON.stringify(gallery.titles));
check('gallery: the disclosure sits on the last caption',
  /Demonstration dataset/.test(gallery.lastCap), gallery.lastCap);
check('gallery: no mock overflows its 288px frame',
  gallery.overflow.every((d) => d !== null && d <= 0), JSON.stringify(gallery.overflow));
check('gallery: every figure is keyboard-reachable', gallery.tabbable);
check('gallery: the demonstration-dataset disclosure is present', gallery.disclosure);

// Lightbox: open the first SOAR screen by keyboard, confirm it scales, close it.
await page.evaluate(() => {
  const s = document.querySelector('.app-shots[aria-label^="SOAR Duty Scheduler"] .app-shot');
  s.focus();
});
await page.keyboard.press('Enter');
await page.waitForTimeout(250);
const lb = await page.evaluate(() => {
  const clone = document.querySelector('#shotLightboxBody .shot-lightbox-mockwrap .soar-mock');
  if (!clone) return { open: false };
  const m = /scale\(([\d.]+)\)/.exec(clone.style.transform || '');
  return { open: true, width: clone.style.width, scale: m ? Number(m[1]) : 0 };
});
check('lightbox: Enter opens the SOAR mock clone', lb.open);
check('lightbox: clone is restored to its 720px authoring width', lb.width === '720px', lb.width);
check('lightbox: clone is scaled up, not down', lb.scale >= 1, String(lb.scale));

await page.keyboard.press('Escape');
await page.waitForTimeout(200);
// Assert on visibility and on focus return, not on a guessed class name —
// a `!classList.contains(...)` test passes trivially if the page uses a
// different class, which would make this check worthless.
const closed = await page.evaluate(() => {
  const el = document.getElementById('shotLightbox');
  const r = el.getBoundingClientRect();
  return {
    invisible: el.hidden || getComputedStyle(el).display === 'none'
      || getComputedStyle(el).visibility === 'hidden' || r.width === 0,
    focusReturned: document.activeElement
      && document.activeElement.classList.contains('app-shot'),
  };
});
check('lightbox: Escape closes it', closed.invisible);
check('lightbox: focus returns to the trigger figure', closed.focusReturned);

// Regression: a BOLDFACE screen still opens as a .bf-mock clone.
await page.evaluate(() => {
  document.querySelector('.app-shots[aria-label^="BOLDFACE"] .app-shot').focus();
});
await page.keyboard.press('Enter');
await page.waitForTimeout(250);
const bfLb = await page.evaluate(() => {
  const c = document.querySelector('#shotLightboxBody .shot-lightbox-mockwrap .bf-mock');
  return { open: !!c, width: c ? c.style.width : null };
});
check('regression: BOLDFACE still opens at its own 480px width',
  bfLb.open && bfLb.width === '480px', String(bfLb.width));
await page.keyboard.press('Escape');

// ── Check group 9b: the gallery's own overflow affordance ────────────
// Spec verification step 2: four screens overflow the 288px-per-item
// track, so the prev/next arrows must un-hide and actually scroll.
const arrows = await page.evaluate(async () => {
  const wrap = document.querySelector('.app-shots[aria-label^="SOAR Duty Scheduler"]')
    .closest('.log-shots-wrap');
  const group = wrap.querySelector('.shots-nav-group');
  const scroller = wrap.querySelector('.app-shots-wrap');
  const before = scroller.scrollLeft;
  wrap.querySelector('[data-shots-next]').click();
  await new Promise((r) => setTimeout(r, 400));
  return {
    revealed: !group.hidden,
    scrollable: scroller.scrollWidth > scroller.clientWidth,
    moved: scroller.scrollLeft > before,
  };
});
check('gallery: prev/next arrows are revealed on overflow', arrows.revealed);
check('gallery: the track actually overflows', arrows.scrollable);
check('gallery: next arrow scrolls the track', arrows.moved);

// ── Check group 10: no overflow at either viewport ───────────────────
for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  await page.setViewportSize(vp);
  await page.waitForTimeout(200);
  const wide = await page.evaluate(() =>
    document.documentElement.scrollWidth - window.innerWidth);
  check(`layout: no horizontal overflow at ${vp.width}x${vp.height}`, wide <= 0, `${wide}px`);
}

check('page: zero console messages', consoleMsgs.length === 0, String(consoleMsgs.length));

// The page loads Google Fonts from its <head> — pre-existing and out of
// scope for this work. The requirement is that .soar-mock adds NO external
// request of its own, so assert against the known baseline rather than
// against zero, and name any host that is not the font CDN.
const EXTERNAL_BASELINE = 4; // fonts.googleapis.com preconnect + css2, fonts.gstatic.com preconnect
const nonFont = external.filter((u) => !/^https:\/\/fonts\.(googleapis|gstatic)\.com/.test(u));
check('page: this work adds no external request',
  external.length <= EXTERNAL_BASELINE, `${external.length} vs baseline ${EXTERNAL_BASELINE}`);
check('page: no non-font external host', nonFont.length === 0, JSON.stringify(nonFont));
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/verify-soar.mjs`
Expected: FAIL on `layout: no horizontal overflow at 390x844` — the calendar's five columns force the page wide on a phone. The other group-9/9b/10 checks should already PASS from Tasks 2–5; if any fail, fix that screen before continuing rather than weakening the check.

Note the ordering check will also fail if Task 5's figure was appended instead of inserted first. Move it rather than changing the expectation.

- [ ] **Step 3: Add the narrow-viewport rule**

Append to the end of the `.soar-mock` style block:

```css
@media (max-width:520px){
  .soar-mock .soar-rail{width:34px}
  .soar-mock .soar-brand,.soar-mock .soar-ni span,.soar-mock .soar-rf span,
  .soar-mock .soar-user > span:last-child,.soar-mock .soar-ver{display:none}
  .soar-mock .soar-ni,.soar-mock .soar-rf,.soar-mock .soar-user{justify-content:center}
  .soar-mock .soar-stats{grid-template-columns:repeat(2,1fr)}
  .soar-mock .soar-charts,.soar-mock .soar-people{grid-template-columns:1fr}
  .soar-mock .soar-grid{grid-template-columns:repeat(3,1fr)}
  .soar-mock .soar-grid > *:nth-child(n+4){display:none}
  .soar-mock .soar-req{flex-direction:column}
  .soar-mock .soar-req-act{width:auto;border-left:0;border-top:1px solid var(--soar-border);flex-direction:row}
}
```

The `nth-child(n+4)` rule drops Thursday and Friday on a phone, in both the day-header row and the column row, so three legible columns remain rather than five unreadable ones.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node scripts/verify-soar.mjs`
Expected: PASS on every check in every group. `console messages: 0`; `external requests: 4`, all of them the page's pre-existing Google Fonts hosts.

Then run the required regression diff, against `d565e89` — the commit where `public/projects.html` was last clean of any SOAR work — rather than an unstaged working-tree diff:

```bash
git diff -U0 d565e89 HEAD -- public/projects.html scripts/verify-soar.mjs | grep -E '^-.*(bf-mock|mf-mock|gr-mock)'
```

**Correction, found during Task 6:** by the time this task runs, other concurrent work on this branch has legitimately added real new `.bf-mock`/`.gr-mock` content of its own (confirmed to have happened during Tasks 2–5). The earlier expectation — "only the four added lines" — assumed a single session and is stale; a `+`-only grep would now also catch that unrelated legitimate work and read as a false alarm. Filtering to `-` (removal) lines only is the correct fix — except it is not empty either. Run it and you get exactly these two lines, already found and adjudicated in Task 2's own review, not new:

```
-.shot-lightbox-mockwrap .gr-mock{ position:absolute; top:0; left:0; transform-origin:top left; }
-  var MOCK_SEL = '.bf-mock, .mf-mock, .gr-mock';
```

Both are the mechanical, unavoidable consequence of appending `.soar-mock` to a comma-joined CSS selector group and to a single-line JS array-string — the line that used to terminate the construct necessarily gets rewritten to add the new entry. Task 2's reviewer confirmed no rule *body* changed and the regression checks (`bfCount===3`, `mfCount===5`, unchanged frame widths) passed; the controller ruled this is not a defect (see the Task 2 entries in the ledger at `.superpowers/sdd/2026-08-11-soar-duty-scheduler-screens/progress.md`). **Expected output at this step: exactly those two lines, nothing else.** If a THIRD `-` line appears, or either of these two differs from what's shown above, stop and report it — that would mean an existing rule was genuinely altered.

Finally, open the page and compare each of the four screens against its source PNG one last time, at thumbnail size and in the lightbox.

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-soar.mjs public/projects.html
git commit -m "Verify the SOAR gallery end to end and handle narrow viewports

Adds thumbnail-overflow, keyboard-lightbox, console, external-request
and dual-viewport checks, plus a regression check that BOLDFACE still
opens at its own 480px width. Collapses the rail to an icon strip and
the calendar to three columns below 520px, so nothing forces the page
to scroll sideways on a phone."
```

---

## Notes for the implementer

- **The rail is copied four times.** That is deliberate and matches how `.mf-mock` repeats its own chrome per screen. Do not extract it into a template — there is no build step, and the lightbox clones whatever is in the DOM.
- **`data-cell`, `data-duty` and `data-screen` are load-bearing**, not test scaffolding. The harness reads them, and they encode real data. Keep them.
- **If a check fails on a value you believe is right, re-open the source PNG.** The capture is the authority, not this plan and not the harness.
- **Do not run `npm install`.** Playwright is already resolvable from `node_modules`.
