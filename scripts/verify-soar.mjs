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
