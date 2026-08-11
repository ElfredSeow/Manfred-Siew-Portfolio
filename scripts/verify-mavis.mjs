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
const rowOrder = await page.evaluate(() => {
  const rows = Array.prototype.slice.call(document.querySelectorAll('details.log-row'));
  return rows.map((r) => r.id).filter(Boolean);
});
check('mavis row: order precedes miles row',
  mavis.found && miles.found && rowOrder.indexOf('mavis') !== -1 && rowOrder.indexOf('mavis') < rowOrder.indexOf('miles'),
  JSON.stringify(rowOrder));

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

// Hash navigation: verify that visiting #miles-mavis opens the #mavis row
await page.goto(PAGE_URL + '#miles-mavis', { waitUntil: 'load' });
const hashNavResult = await page.evaluate(() => {
  const mavisRow = document.getElementById('mavis');
  return { mavisOpen: mavisRow ? mavisRow.open : null };
});
check('legacy hash #miles-mavis navigates to and opens #mavis', hashNavResult.mavisOpen === true, `mavis.open=${hashNavResult.mavisOpen}`);

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
      note: s.querySelector('.mavis-stat-note') ? s.querySelector('.mavis-stat-note').textContent.trim() : null,
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
      badgeClass: (r.querySelector('.mavis-badge-ic') || { className: '' }).className,
      badgeBg: (() => {
        const el = r.querySelector('.mavis-badge-ic');
        return el ? getComputedStyle(el).backgroundColor : '';
      })(),
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
  cm.found && cm.reqs.length === 3
  && cm.reqs[0].badgeClass.includes('b-amber')
  && cm.reqs[1].badgeClass.includes('b-orange')
  && cm.reqs[2].badgeClass.includes('b-purple'),
  cm.found ? JSON.stringify(cm.reqs.map((r) => r.badgeClass)) : 'n/a');
check('cm: badges actually render tinted (non-transparent background), not just labelled with a colour class',
  cm.found && cm.reqs.length === 3
  && cm.reqs.every((r) => r.badgeBg && r.badgeBg !== 'rgba(0, 0, 0, 0)' && r.badgeBg !== 'transparent'),
  cm.found ? JSON.stringify(cm.reqs.map((r) => r.badgeBg)) : 'n/a');

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
