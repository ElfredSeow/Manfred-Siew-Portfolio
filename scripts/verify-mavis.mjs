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
// Built only from the row's own prose (lead paragraph, note, "What it
// does" bullets, chips) — NOT from mavis.text/miles.text, which is the
// row's full textContent and therefore also includes the .mavis-mock
// screens. The mocks are allowed to show fabricated, disclosed demo data
// (e.g. "Base Bravo" appears in the Preventive Maintenance screen's
// Call-In/Handed Over cards, and the Reports screen's own caption
// discloses the dataset as fabricated) — that is not a claim about a
// real unit/base/squadron, so it must not trip this check.
function proseOf(row) {
  return [row.lead, row.note, ...row.feats, ...row.chips].join(' ');
}
const proseText = (mavis.found ? proseOf(mavis) : '') + (miles.found ? proseOf(miles) : '');
check('no adoption/fleet-size/ROI/time-saved figure',
  !/\b(ROI|adoption|time[- ]saved|hours saved|man[- ]hours|uptime)\b/i.test(proseText));
check('no qualification-tracking claim',
  !/qualification/i.test(proseText));
check('no unit/base/squadron named in the row copy (mock screens may show fabricated, disclosed demo data)',
  !/\b(squadron|Base Alpha|Base Bravo|AMS|GSS|AMTS)\b/.test(proseText));

// ── Check group 3: the legacy anchor and the old merged copy ─────────
const legacy = await page.evaluate(() => {
  const el = document.getElementById('miles-mavis');
  return { found: !!el, tag: el ? el.tagName : null };
});
check('legacy #miles-mavis id still resolves', legacy.found, JSON.stringify(legacy));

// Hash navigation: verify that visiting #miles-mavis opens the #mavis row.
// This MUST use a fresh page, never the shared `page` (which already has
// every <details> force-opened above) — navigating the shared page to a
// same-document fragment (file:...html -> file:...html#miles-mavis) does
// not reload the document, so its DOM state (all rows already open)
// would make this check pass even if openFromHash()'s legacy-hash
// normalization were deleted entirely.
const hashPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await hashPage.goto(`${PAGE_URL}#miles-mavis`, { waitUntil: 'load' });
await hashPage.waitForTimeout(300);
const mavisOpenViaLegacyHash = await hashPage.evaluate(() => {
  const el = document.getElementById('mavis');
  return el ? el.open : null;
});
await hashPage.close();
check('legacy hash #miles-mavis navigates to and opens #mavis', mavisOpenViaLegacyHash === true, String(mavisOpenViaLegacyHash));

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
    active: (mock.querySelector('.mavis-pill.on') || { textContent: '' }).textContent.trim() || '',
    bellBadge: (mock.querySelector('.mavis-bell-badge') || { textContent: '' }).textContent.trim() || '',
    userName: (mock.querySelector('.mavis-user-name') || { textContent: '' }).textContent.trim() || '',
    userRole: (mock.querySelector('.mavis-user-role') || { textContent: '' }).textContent.trim() || '',
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
    active: (mock.querySelector('.mavis-pill.on') || { textContent: '' }).textContent.trim(),
    h1: (mock.querySelector('.mavis-h1') || { textContent: '' }).textContent.trim(),
    sub: (mock.querySelector('.mavis-sub') || { textContent: '' }).textContent.trim(),
    tabs: Array.prototype.slice.call(mock.querySelectorAll('.mavis-tab')).map((t) => t.textContent.trim()),
    activeTab: (mock.querySelector('.mavis-tab.on') || { textContent: '' }).textContent.trim(),
    stats: Array.prototype.slice.call(mock.querySelectorAll('.mavis-stat')).map((s) => ({
      label: (s.querySelector('.mavis-stat-label') || { textContent: '' }).textContent.trim(),
      value: (s.querySelector('.mavis-stat-value') || { textContent: '' }).textContent.trim(),
      note: s.querySelector('.mavis-stat-note') ? s.querySelector('.mavis-stat-note').textContent.trim() : null,
    })),
    defects: Array.prototype.slice.call(mock.querySelectorAll('.mavis-defect')).map((d) => ({
      title: (d.querySelector('.mavis-defect-title') || { textContent: '' }).textContent.trim(),
      asset: (d.querySelector('.mavis-defect-asset') || { textContent: '' }).textContent.trim(),
      badge: (d.querySelector('.mavis-badge') || { textContent: '' }).textContent.trim(),
      viewOnly: !!d.querySelector('.mavis-view-only'),
    })),
    assets: Array.prototype.slice.call(mock.querySelectorAll('.mavis-asset')).map((a) => ({
      id: (a.querySelector('.mavis-asset-id') || { textContent: '' }).textContent.trim(),
      type: (a.querySelector('.mavis-asset-type') || { textContent: '' }).textContent.trim(),
      badge: (a.querySelector('.mavis-badge') || { textContent: '' }).textContent.trim(),
    })),
    cmTiles: Array.prototype.slice.call(mock.querySelectorAll('.mavis-cmtile')).map((t) => ({
      value: (t.querySelector('.mavis-cmtile-value') || { textContent: '' }).textContent.trim(),
      label: (t.querySelector('.mavis-cmtile-label') || { textContent: '' }).textContent.trim(),
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
check('dashboard: stops before PM Summary / Pending Approval / footer (plan’s Global Constraints, ~700px content budget)',
  dash.found && !dash.hasPmSummary && !dash.hasPendingApproval && !dash.hasFooter,
  `pm=${dash.hasPmSummary} pending=${dash.hasPendingApproval} footer=${dash.hasFooter}`);

// ── Check group 8: Corrective Maintenance ────────────────────────────
const cm = await page.evaluate(() => {
  const mock = document.querySelector('.mavis-mock[data-screen="corrective"]');
  if (!mock) return { found: false };
  return {
    found: true,
    active: (mock.querySelector('.mavis-pill.on') || { textContent: '' }).textContent.trim(),
    h1: (mock.querySelector('.mavis-h1') || { textContent: '' }).textContent.trim(),
    sub: (mock.querySelector('.mavis-sub') || { textContent: '' }).textContent.trim(),
    btn: (mock.querySelector('.mavis-cm-btn') || { textContent: '' }).textContent.trim(),
    section: (mock.querySelector('.mavis-cm-h2') || { textContent: '' }).textContent.trim(),
    reqs: Array.prototype.slice.call(mock.querySelectorAll('.mavis-req')).map((r) => ({
      id: (r.querySelector('.mavis-req-id') || { textContent: '' }).textContent.trim(),
      badge: (r.querySelector('.mavis-badge-ic') || { textContent: '' }).textContent.trim(),
      badgeClass: (r.querySelector('.mavis-badge-ic') || { className: '' }).className,
      badgeBg: (() => {
        const el = r.querySelector('.mavis-badge-ic');
        return el ? getComputedStyle(el).backgroundColor : '';
      })(),
      refid: (r.querySelector('.mavis-req-refid') || { textContent: '' }).textContent.trim(),
      descLabel: (r.querySelector('.mavis-req-desc-label') || { textContent: '' }).textContent.trim(),
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

// ── Check group 9: Preventive Maintenance ────────────────────────────
const pm = await page.evaluate(() => {
  const mock = document.querySelector('.mavis-mock[data-screen="preventive"]');
  if (!mock) return { found: false };
  const sectionHeads = Array.prototype.slice.call(mock.querySelectorAll('.mavis-section-head')).map((s) => ({
    label: (s.querySelector('.mavis-section-label') || { textContent: '' }).textContent.trim(),
    count: (s.querySelector('.mavis-section-count') || { textContent: '' }).textContent.trim(),
  }));
  return {
    found: true,
    active: (mock.querySelector('.mavis-pill.on') || { textContent: '' }).textContent.trim(),
    h1: (mock.querySelector('.mavis-h1') || { textContent: '' }).textContent.trim(),
    sub: (mock.querySelector('.mavis-sub') || { textContent: '' }).textContent.trim(),
    btn: (mock.querySelector('.mavis-pm-btn') || { textContent: '' }).textContent.trim(),
    sectionHeads,
    callins: Array.prototype.slice.call(mock.querySelectorAll('.mavis-callin-card')).map((c) => ({
      id: (c.querySelector('.mavis-callin-id') || { textContent: '' }).textContent.trim(),
      meta: (c.querySelector('.mavis-callin-meta') || { textContent: '' }).textContent.trim(),
      pills: Array.prototype.slice.call(c.querySelectorAll('.mavis-chip-outline')).map((p) => p.textContent.trim()),
      calledIn: (c.querySelector('.mavis-callin-calledin') || { textContent: '' }).textContent.trim(),
      pmDue: [c.querySelector('.mavis-callin-pmdue'), c.querySelector('.mavis-callin-duechip')]
        .map((el) => (el ? el.textContent.trim() : '')).join(' ').trim(),
      dueChipClass: (c.querySelector('.mavis-callin-duechip') || { className: '' }).className,
    })),
    handed: Array.prototype.slice.call(mock.querySelectorAll('.mavis-handed-card')).map((c) => ({
      id: (c.querySelector('.mavis-handed-id') || { textContent: '' }).textContent.trim(),
      dept: (c.querySelector('.mavis-handed-dept') || { textContent: '' }).textContent.trim(),
      subdept: (c.querySelector('.mavis-handed-subdept') || { textContent: '' }).textContent.trim(),
      pill: (c.querySelector('.mavis-chip-outline') || { textContent: '' }).textContent.trim(),
      row: (c.querySelector('.mavis-handed-row') || { textContent: '' }).textContent.trim(),
      btn: (c.querySelector('.mavis-handed-btn') || { textContent: '' }).textContent.trim(),
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
  pm.found ? JSON.stringify(pm.callins.map((c) => c.dueChipClass)) : 'n/a');
check('pm: two Handed Over cards matching the capture',
  pm.found && JSON.stringify(pm.handed) === JSON.stringify([
    { id: 'AGE 1170', dept: 'Engineering Support', subdept: 'Sub-Dept: Workshop Engineering', pill: 'C1/TCP', row: 'Handed over 2 days ago', btn: 'Start PM' },
    { id: 'MID 4483', dept: 'Engineering Support', subdept: 'Sub-Dept: Workshop Engineering', pill: 'C2/TA1', row: 'Handed over 3 days ago', btn: 'Start PM' },
  ]), JSON.stringify(pm.handed));

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
    active: (mock.querySelector('.mavis-pill.on') || { textContent: '' }).textContent.trim(),
    h1: (mock.querySelector('.mavis-h1') || { textContent: '' }).textContent.trim(),
    sub: (mock.querySelector('.mavis-sub') || { textContent: '' }).textContent.trim(),
    tabs: Array.prototype.slice.call(mock.querySelectorAll('.mavis-rp-tab')).map((t) => t.textContent.trim()),
    activeTab: (mock.querySelector('.mavis-rp-tab.on') || { textContent: '' }).textContent.trim(),
    filters: Array.prototype.slice.call(mock.querySelectorAll('.mavis-filter-field')).map((f) => ({
      label: (f.querySelector('.mavis-filter-label') || { textContent: '' }).textContent.trim(),
      value: (f.querySelector('.mavis-filter-box') || { textContent: '' }).textContent.trim(),
    })),
    stats: Array.prototype.slice.call(mock.querySelectorAll('.mavis-rp-stat')).map((s) => ({
      label: (s.querySelector('.mavis-rp-stat-label') || { textContent: '' }).textContent.trim(),
      value: (s.querySelector('.mavis-rp-stat-value') || { textContent: '' }).textContent.trim(),
    })),
    chartTitle: (mock.querySelector('.mavis-chart-title') || { textContent: '' }).textContent.trim(),
    chartSub: (mock.querySelector('.mavis-chart-sub') || { textContent: '' }).textContent.trim(),
    cols,
    legend: Array.prototype.slice.call(mock.querySelectorAll('.mavis-chart-legend-item')).map((l) => l.textContent.trim()),
    hasSubsystemsCard: !!mock.querySelector('.mavis-subsystems-card'),
    hasByTypeCard: !!mock.querySelector('.mavis-bytype-card'),
    captionSd: (() => {
      const fig = mock.closest('figure');
      const sd = fig ? fig.querySelector('.app-shot-cap .sd') : null;
      return sd ? sd.textContent : '';
    })(),
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
check('reports: stops before Top subsystems / By type (plan’s Global Constraints, ~700px content budget)',
  rp.found && !rp.hasSubsystemsCard && !rp.hasByTypeCard,
  `subsystems=${rp.hasSubsystemsCard} bytype=${rp.hasByTypeCard}`);
check('reports: closing caption carries the demo-data disclosure',
  rp.found && /Demonstration dataset.*fabricated/.test(rp.captionSd));

// ── Check group 11: no horizontal overflow at two viewports ───────────
// Design spec verification item 1. Opened in fresh pages (not the shared
// `page`) so each gets its own viewport; every <details> is opened first,
// the same reason Task 1's setup opens them on `page` — a closed <details>
// has no layout box, so a mock inside one would under-report its width.
// These pages are monitored for external requests too (folded into the
// same `external` array checked below), so a regression at either
// viewport is caught the same way as one on the main `page`.
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const vp = await browser.newPage({ viewport: { width: w, height: h } });
  vp.on('request', (r) => {
    if (!r.url().startsWith('file://') && !r.url().startsWith('data:')) external.push(r.url());
  });
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

// ── Check group 12: lightbox coverage for the four MAVIS screens ──────
// None of groups 1-11 ever open the lightbox — the shared MOCK_SEL /
// .shot-lightbox-mockwrap / .app-shot-frame sizing registrations are the
// whole architectural point of this feature and were previously
// untested. Reuses the real interaction pattern from the page's own JS
// (click a .app-shot to open, Escape to close — see the `shot-lightbox`
// script near the end of public/projects.html).
const mavisFigures = page.locator('.app-shot:has(.mavis-mock)');
const mavisFigureCount = await mavisFigures.count();
check('lightbox: four MAVIS .app-shot figures found to test', mavisFigureCount === 4, String(mavisFigureCount));
for (let i = 0; i < mavisFigureCount; i++) {
  const fig = mavisFigures.nth(i);
  const screen = await fig.evaluate((el) => (el.querySelector('.mavis-mock') || {}).getAttribute
    ? el.querySelector('.mavis-mock').getAttribute('data-screen') : 'unknown');
  await fig.click();
  await page.waitForTimeout(150); // let render()/fitMockScale settle
  const state = await page.evaluate(() => {
    const lightbox = document.getElementById('shotLightbox');
    const body = document.getElementById('shotLightboxBody');
    const clone = body ? body.querySelector('.mavis-mock') : null;
    return {
      visible: lightbox ? !lightbox.hidden : false,
      hasClone: !!clone,
      fits: body ? body.scrollHeight <= body.clientHeight : null,
    };
  });
  check(`lightbox: ${screen} opens with a cloned .mavis-mock, no dialog scroll`,
    state.visible && state.hasClone && state.fits, JSON.stringify(state));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
  const closedAndFocusReturned = await page.evaluate(() => {
    const lightbox = document.getElementById('shotLightbox');
    return lightbox ? lightbox.hidden : null;
  });
  const focusReturned = await fig.evaluate((el) => el === document.activeElement);
  check(`lightbox: ${screen} Escape closes and returns focus to the trigger`,
    closedAndFocusReturned === true && focusReturned === true,
    `closed=${closedAndFocusReturned} focusReturned=${focusReturned}`);
}

// ── Report ───────────────────────────────────────────────────────────
check('no console messages', consoleMsgs.length === 0, JSON.stringify(consoleMsgs));
// Observed on a clean run: Google Fonts preconnect/stylesheet/woff2 only
// (fonts.googleapis.com, fonts.gstatic.com). Anything else is new and
// should be looked at before being added to this list.
const ALLOWED_EXTERNAL_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
check('external requests are only the known Google Fonts hosts',
  external.every((u) => ALLOWED_EXTERNAL_HOSTS.some((h) => u.includes(h))), JSON.stringify(external));

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
