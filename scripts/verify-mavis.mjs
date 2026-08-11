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
check('mavis row: has 5 "What it does" bullets', mavis.found && mavis.feats.length === 5, mavis.found ? String(mavis.feats.length) : 'n/a');
check('miles row: has 5 "What it does" bullets', miles.found && miles.feats.length === 5, miles.found ? String(miles.feats.length) : 'n/a');
check('mavis row: chips are the real stack',
  mavis.found && JSON.stringify(mavis.chips) === JSON.stringify(
    ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Supabase', 'Lovable']),
  mavis.found ? JSON.stringify(mavis.chips) : 'n/a');
check('miles row: chips are the real stack',
  miles.found && JSON.stringify(miles.chips) === JSON.stringify(
    ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Supabase', 'Lovable']),
  miles.found ? JSON.stringify(miles.chips) : 'n/a');
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
