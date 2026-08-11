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
const railsIdentical = await page.evaluate(() =>
  Array.from(document.querySelectorAll('.soar-mock .soar-rail'))
    .map((r) => r.innerHTML.replace(/ soar-on/g, ''))
    .every((h, _, a) => h === a[0]));
check('rail: all four copies are identical apart from the active item', railsIdentical);

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
  cov.found && cov.reqs.length === 3 && cov.reqs.every((r) => r.approve && r.reject));
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
        reqcov: !!m.querySelector('.soar-reqcov'),
        obs: (m.querySelector('.soar-obs') || {}).textContent ? m.querySelector('.soar-obs').textContent.trim() : null,
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
check('calendar: Request Coverage on exactly the five spec cells',
  JSON.stringify(cal.missions.filter((m) => m.reqcov).map((m) => m.cell)) === JSON.stringify(
    ['mon-w1', 'tue-w1', 'wed-w2', 'thu-w2', 'fri-w3']),
  JSON.stringify(cal.missions.filter((m) => m.reqcov).map((m) => m.cell)));
check('calendar: exactly one observer row, J Farrow on thu-w2',
  JSON.stringify(cal.missions.filter((m) => m.obs).map((m) => `${m.cell}:${m.obs}`)) === JSON.stringify(
    ['thu-w2:J Farrow']),
  JSON.stringify(cal.missions.filter((m) => m.obs).map((m) => `${m.cell}:${m.obs}`)));
const galleryOrder = await page.evaluate(() =>
  Array.prototype.slice.call(document.querySelectorAll('.soar-mock')).map((m) => m.getAttribute('data-screen')));
check('calendar: Weekly Schedule leads the gallery, before the Dashboard screen',
  JSON.stringify(galleryOrder) === JSON.stringify(['calendar', 'dashboard', 'covering', 'admin']),
  JSON.stringify(galleryOrder));

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
// A hardcoded "<= 0" assumes an exact pixel fit that no mock family on this
// page actually achieves — .bf-mock, .mf-mock and .gr-mock all overflow
// their .app-shot-frame by the same amount (a shared border/padding
// artifact, confirmed identical across all four families — not something
// any single task introduced or can fix without touching the other three).
// Baseline against an existing family instead of a magic number, computed
// inside the browser context (document is not available out here in Node).
const baselineOverflow = await page.evaluate(() => {
  const bfFrame = document.querySelector('.bf-mock').closest('.app-shot').querySelector('.app-shot-frame');
  const bfMock = document.querySelector('.bf-mock');
  return Math.round(bfMock.getBoundingClientRect().width) - Math.round(bfFrame.getBoundingClientRect().width);
});
check('gallery: no SOAR mock overflows its frame more than the site\'s existing mock families do',
  gallery.overflow.every((d) => d !== null && d <= baselineOverflow),
  `soar=${JSON.stringify(gallery.overflow)} baseline=${baselineOverflow}`);
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
// Corrected: the original assumption ("four screens overflow the track")
// is false at 1440px — four 288px cards plus gaps fit inside the available
// width without scrolling, confirmed identical to two other already-shipped
// 4-item galleries on this same page (GRID and RSAF Facility Booking;
// only the 5- and 6-item galleries overflow). The original code also
// measured the wrong element — `.app-shots-wrap` is only a
// `position:relative` wrapper for the edge-fade pseudo-element;
// `.app-shots` itself has `overflow-x:auto`. The real, meaningful
// invariant isn't "this gallery must overflow" — it's that the arrow
// affordance's hidden state always matches whether there's actually
// anything to scroll.
const arrows = await page.evaluate(() => {
  const wrap = document.querySelector('.app-shots[aria-label^="SOAR Duty Scheduler"]')
    .closest('.log-shots-wrap');
  const group = wrap.querySelector('.shots-nav-group');
  const scroller = wrap.querySelector('.app-shots');
  return {
    overflows: scroller.scrollWidth > scroller.clientWidth,
    groupHidden: group.hidden,
  };
});
check('gallery: arrow affordance is hidden exactly when there is nothing to scroll',
  arrows.overflows ? !arrows.groupHidden : arrows.groupHidden,
  JSON.stringify(arrows));

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
