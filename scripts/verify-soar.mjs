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
check('covering: reasons are the captured text',
  cov.found && /Medical appointment scheduled at short notice/.test(cov.reqs[0].reason)
  && /Recalled to squadron duty/.test(cov.reqs[1].reason)
  && /Currency renewal course clashes/.test(cov.reqs[2].reason));

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
