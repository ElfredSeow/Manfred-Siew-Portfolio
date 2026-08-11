// scripts/verify-miles.mjs
//
// Render/verification harness for the MILES phone screen gallery in
// public/projects.html. Measures, does not fix.
// Run: node scripts/verify-miles.mjs [path-to-html]
//
// Every assertion here is traceable to either the design spec
// (docs/superpowers/specs/2026-08-11-miles-phone-screens-design.md), the
// implementation plan (docs/superpowers/plans/2026-08-11-miles-phone-screens.md)
// or to one of the four source captures the mocks are built from:
// raid-ppcoe/MILES-Marketing-Content, marketing-pr/rsaf-vehicle-logbook/
// screens/{home,vehicles,approvals,admin}.png.
//
// Fold arithmetic used throughout: every capture is 860 device px wide at
// deviceScaleFactor 2, so device px / 2 is CSS px. The app's bottom nav is
// position:fixed and 68 CSS px tall, so content is visible from y=0 to
// y=864 CSS (device 1728) and anything below that is behind the nav.

import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const FILE = process.argv[2] ?? 'public/projects.html';
const PAGE_URL = pathToFileURL(path.resolve(FILE)).href;
const SRC = readFileSync(path.resolve(FILE), 'utf8');
const MILES_TITLE = 'Air Specialist Vehicle Logbook (MILES)';

const MOCK_W = 430;
const MOCK_H = 932;
const NAV_H = 68;
const FOLD = MOCK_H - NAV_H; // 864

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

// Every <details> is opened so content inside collapsed rows is laid out and
// measurable. Without this, getBoundingClientRect inside a closed <details>
// returns zeros and every size check lies.
await page.evaluate(() => {
  document.querySelectorAll('details').forEach((d) => { d.open = true; });
});

// ── Group 1: registration in the three shared lists ──────────────────
// The design spec §5.4 requires each list to be ADDED to, never rewritten.

check('.miles-mock is in the .shot-lightbox-mockwrap selector list',
  /\.shot-lightbox-mockwrap \.miles-mock\{/.test(SRC.replace(/\s+\{/g, '{')));

const mockSelLine = (SRC.match(/var MOCK_SEL = '([^']+)'/) || [])[1] || '';
const FAMILIES = ['.bf-mock', '.mf-mock', '.gr-mock', '.soar-mock', '.mavis-mock', '.miles-mock'];
check('MOCK_SEL names all six mock families, none dropped',
  FAMILIES.every((f) => mockSelLine.split(',').map((s) => s.trim()).includes(f)),
  mockSelLine);

const frameRules = SRC.match(/\.app-shot-frame \.miles-mock\{[^}]*\}/g) || [];
check('exactly one .app-shot-frame .miles-mock scale rule, at 430px and half scale',
  frameRules.length === 1
    && /width:430px/.test(frameRules[0])
    && /transform:scale\(\.5\)/.test(frameRules[0]),
  JSON.stringify(frameRules));

check('fitMockScale honours an opt-in data-mock-minscale floor',
  /getAttribute\('data-mock-minscale'\)/.test(SRC) && /Math\.max\(floor, scale\)/.test(SRC));

// ── Group 2: the portrait frame, and that it reaches nothing else ────

const frame = await page.evaluate(({ W, H }) => {
  const fig = document.querySelector('.app-shot.is-phone');
  if (!fig) return { found: false };
  const f = fig.querySelector('.app-shot-frame');
  const dots = fig.querySelector('.app-shot-dots');
  const mock = fig.querySelector('.miles-mock');
  return {
    found: true,
    figW: Math.round(fig.getBoundingClientRect().width),
    frameH: Math.round(f.getBoundingClientRect().height),
    dotsDisplay: dots ? getComputedStyle(dots).display : 'missing',
    mockW: Math.round(mock.getBoundingClientRect().width / 0.5),
    mockH: Math.round(mock.getBoundingClientRect().height / 0.5),
    expectW: W, expectH: H,
  };
}, { W: MOCK_W, H: MOCK_H });

check('.app-shot.is-phone is 215px wide, half of the mock\'s 430px', frame.figW === 215, `${frame.figW}px`);
check('.app-shot.is-phone frame is 466px tall, half of the mock\'s 932px', frame.frameH === 466, `${frame.frameH}px`);
check('.app-shot.is-phone hides the browser traffic lights', frame.dotsDisplay === 'none', frame.dotsDisplay);
check('the scaled mock fills the frame exactly, no letterboxing',
  frame.mockW === MOCK_W && frame.mockH === MOCK_H, `${frame.mockW}x${frame.mockH}`);

const others = await page.evaluate(() => {
  const out = {};
  for (const fam of ['bf-mock', 'mf-mock', 'gr-mock', 'soar-mock', 'mavis-mock']) {
    const m = document.querySelector('.' + fam);
    if (!m) { out[fam] = null; continue; }
    const fig = m.closest('.app-shot');
    out[fam] = fig ? Math.round(fig.getBoundingClientRect().width) : null;
  }
  return out;
});
check('the .is-phone rules do not reach any landscape family (all still 288px)',
  Object.values(others).every((w) => w === 288), JSON.stringify(others));

// ── Group 3: the four mocks themselves ───────────────────────────────

const mocks = await page.evaluate(() => {
  const row = Array.prototype.slice.call(document.querySelectorAll('details.log-row'))
    .find((r) => r.querySelector('.miles-mock'));
  const figs = Array.prototype.slice.call(row.querySelectorAll('figure.app-shot'));
  return {
    rowTitle: row.querySelector('.lt').textContent.trim(),
    rowId: row.id,
    listLabel: row.querySelector('.app-shots').getAttribute('aria-label'),
    count: figs.length,
    phoneCount: figs.filter((f) => f.classList.contains('is-phone')).length,
    figs: figs.map((f) => {
      const m = f.querySelector('.miles-mock');
      const r = m.getBoundingClientRect();
      // Every descendant's bottom, measured in the mock's own unscaled
      // coordinates, so "does this land above the fold" is answerable.
      const kids = Array.prototype.slice.call(m.querySelectorAll('*')).map((el) => {
        const b = el.getBoundingClientRect();
        return { bottom: (b.bottom - r.top) / 0.5, right: (b.right - r.left) / 0.5 };
      });
      return {
        title: f.querySelector('.app-shot-title').textContent.trim(),
        cap: f.querySelector('.app-shot-cap .st').textContent.trim(),
        capDesc: f.querySelector('.app-shot-cap .sd').textContent.trim(),
        mockWidth: m.getAttribute('data-mock-width'),
        minScale: m.getAttribute('data-mock-minscale'),
        text: m.textContent.replace(/\s+/g, ' ').trim(),
        maxBottom: Math.max(...kids.map((k) => k.bottom)),
        maxRight: Math.max(...kids.map((k) => k.right)),
        navBottom: (m.querySelector('.miles-nav').getBoundingClientRect().bottom - r.top) / 0.5,
        bodyBottom: (m.querySelector('.miles-body').getBoundingClientRect().bottom - r.top) / 0.5,
        hasFab: !!m.querySelector('.miles-fab'),
        tools: Array.prototype.slice.call(m.querySelectorAll('.miles-tool-l')).map((s) => s.textContent.trim()),
        toolColours: Array.prototype.slice.call(m.querySelectorAll('.miles-tool-ico'))
          .map((s) => getComputedStyle(s).backgroundColor),
        tabs: m.querySelectorAll('.miles-tab').length,
        tabsOn: m.querySelectorAll('.miles-tab.miles-on').length,
        roleColours: Array.prototype.slice.call(m.querySelectorAll('.miles-role'))
          .map((s) => s.className.replace('miles-role ', '') + '=' + getComputedStyle(s).backgroundColor),
      };
    }),
  };
});

check('the gallery sits in the MILES row', mocks.rowTitle === MILES_TITLE && mocks.rowId === 'miles',
  `${mocks.rowTitle} #${mocks.rowId}`);
check('the MILES row holds exactly four figures, all .is-phone',
  mocks.count === 4 && mocks.phoneCount === 4, `${mocks.count} figures, ${mocks.phoneCount} phone`);
check('the list aria-label states these are rebuilt, not photos and not invented',
  /rebuilt from the app's own interface code and design tokens, not photos and not invented/.test(mocks.listLabel || ''),
  mocks.listLabel);
check('every mock declares data-mock-width="430" and a minscale floor',
  mocks.figs.every((f) => f.mockWidth === '430' && parseFloat(f.minScale) > 0 && parseFloat(f.minScale) < 1),
  JSON.stringify(mocks.figs.map((f) => `${f.mockWidth}/${f.minScale}`)));
check('nothing in any mock overflows 430px sideways',
  mocks.figs.every((f) => f.maxRight <= MOCK_W + 0.5),
  JSON.stringify(mocks.figs.map((f) => Math.round(f.maxRight))));
check('every mock pins its bottom navigation to the 932px bottom edge',
  mocks.figs.every((f) => Math.abs(f.navBottom - MOCK_H) < 1 && f.hasFab),
  JSON.stringify(mocks.figs.map((f) => Math.round(f.navBottom))));

const [home, vehicles, approvals, admin] = mocks.figs;

check('the four chrome titles and captions are the four screens, in order',
  home.title === 'MILES · Driver home' && home.cap === 'Driver home'
  && vehicles.title === 'MILES · Fleet register' && vehicles.cap === 'Fleet register'
  && approvals.title === 'MILES · Approval queue' && approvals.cap === 'Approval queue'
  && admin.title === 'MILES · Admin dashboard' && admin.cap === 'Admin dashboard',
  mocks.figs.map((f) => f.title).join(' | '));

// The author's own prose carries no em dash; the app's own UI strings keep
// theirs verbatim. Both halves of that rule are asserted.
check('no caption written for this page contains an em dash',
  mocks.figs.every((f) => !f.cap.includes('—') && !f.capDesc.includes('—')),
  mocks.figs.map((f) => f.capDesc).join(' | '));

// ── Group 4: screen 1, driver home (screens/home.png) ────────────────

const TOOLS = [
  ['Vehicle Info', 'rgb(22, 41, 74)'],
  ['Vehicle Inspection', 'rgb(34, 195, 195)'],
  ['Insp / Detail Approval', 'rgb(22, 163, 74)'],
  ['Summary Report', 'rgb(22, 163, 74)'],
  ['Ground Fuel Top-Up', 'rgb(249, 115, 22)'],
  ['Refueller Fuel Stock Update', 'rgb(14, 165, 233)'],
  ['Refueller Fuel Stock Log', 'rgb(99, 102, 241)'],
  ['GSE Booking In/Out', 'rgb(245, 158, 11)'],
];
check('home draws all eight Quick Tools, labelled as captured and in order',
  home.tools.length === 8 && TOOLS.every(([l], i) => home.tools[i] === l),
  JSON.stringify(home.tools));
check('the eight Quick Tool icon circles carry the captured colours',
  TOOLS.every(([, c], i) => home.toolColours[i] === c),
  JSON.stringify(home.toolColours));
for (const s of ['MILES APP', 'Welcome back,', 'Hello!, Daryl', 'My Trip Requests',
  'MID 10233', 'Toyota Hilux 4x4', 'Approved', '2 destinations', 'TRP-2411-0091',
  'MID 55901', 'Mercedes-Benz OC500', 'Pending Approval', '12 Aug, 08:30 am',
  'Cancel Request', 'TRP-2411-0093', 'Home', 'Detail Logs', 'End Detail']) {
  check(`home reproduces "${s}"`, home.text.includes(s));
}
check('home keeps the app\'s own em dashes verbatim',
  home.text.includes('Locked — finish your ongoing trip first.')
  && home.text.includes('Transit Camp — Personnel Move'));
check('home stops at the fold: the Ongoing Detail card is below it and is not drawn',
  !home.text.includes('Ongoing Detail') && !home.text.includes("Unit's Recent Details"));
// The My Trip Requests card is the last thing home shows, and in the capture
// it terminates just clear of the navigation rather than running under it.
check('home\'s last content clears the navigation instead of running under it',
  home.bodyBottom <= FOLD + 1, `${Math.round(home.bodyBottom)} <= ${FOLD}`);

// ── Group 5: screen 2, fleet register (screens/vehicles.png) ─────────

for (const s of ['Vehicle Info', 'Search vehicle number...', 'All status', 'All fuel',
  'All Types', 'DI date',
  'MID 10233', 'Utility Vehicle', 'AMS', 'Full', '87610.4 km', 'DI: Never',
  'MID 21877', 'MAN TGS 26.440', 'Prime Mover', '1/2', '132455 km', 'Inspection: 10 Aug 2026',
  'MID 30412', 'HTF-20 Refueller', 'Refueller', 'GSS', '3/4', '48213.6 km', 'Inspection: 11 Aug 2026',
  'MID 30418', 'Serviceable']) {
  check(`fleet register reproduces "${s}"`, vehicles.text.includes(s));
}
check('fleet register stops at the fold: MID 44120 and the Unserviceable pill are below it',
  !vehicles.text.includes('44120') && !vehicles.text.includes('Unserviceable')
  && !vehicles.text.includes('Hyster'));

// ── Group 6: screen 3, approval queue (screens/approvals.png) ────────

for (const s of ['Insp / Detail Approval', 'INSPECTION APPROVALS', 'No pending inspection approvals',
  'TRIP APPROVALS', 'Select all', '0 of 3 selected', 'Approve selected', 'Reject',
  'Select for bulk action', 'TRP-2411-0095', 'MID 30418 - HTF-20 Refueller', 'Single Trip',
  'Rajesh Kumar', 'Expected: 12 Aug 09:30', 'Starting: 51902.1', 'Approve',
  'TRP-2411-0094', 'MID 21877 - MAN TGS 26.440', 'Wei Ming Lim']) {
  check(`approval queue reproduces "${s}"`, approvals.text.includes(s));
}
check('approval queue keeps the app\'s own em dash verbatim',
  approvals.text.includes('Apron 3 — Fuel Point C'));
check('approval queue stops at the fold: the second card is cut above its location row',
  !approvals.text.includes('Ammo Dump'));
check('approval queue\'s header carries a back arrow instead of the wordmark',
  !approvals.text.includes('MILES APP'));

// ── Group 7: screen 4, admin dashboard (screens/admin.png) ───────────

check('admin draws nine icon tabs with exactly one active',
  admin.tabs === 9 && admin.tabsOn === 1, `${admin.tabs} tabs, ${admin.tabsOn} active`);
for (const s of ['Admin Dashboard', 'User Account Template', 'Download',
  'Download a CSV template to prepare user accounts for bulk import.',
  'Add User', 'Bulk Import Users', 'Sort by', 'Name (A–Z)',
  'Daryl Tan', 'Ground Support Squadron', 'admin', 'driver', '2 categories',
  'Jason Ong', 'Air Movement Squadron', 'facilitator',
  'Nurul Iman', 'approver']) {
  check(`admin dashboard reproduces "${s}"`, admin.text.includes(s));
}
check('admin reproduces the roles note verbatim, em dash included',
  admin.text.includes('Roles: driver, approver, admin (combine multiple with |). temp_password must be at least 6 characters — users will be required to change it on first login. Separate multiple vehicle categories with |. Leave department / categories blank if not applicable.'));
check('all four role colours are visible above the fold',
  ['miles-role-admin=rgb(239, 68, 68)', 'miles-role-driver=rgb(27, 42, 75)',
    'miles-role-fac=rgb(34, 195, 195)', 'miles-role-app=rgb(245, 158, 11)']
    .every((want) => admin.roleColours.includes(want)),
  JSON.stringify(admin.roleColours));
check('admin stops at the fold: Rajesh Kumar and Wei Ming Lim are below it',
  !admin.text.includes('Rajesh Kumar') && !admin.text.includes('Wei Ming Lim'));

// ── Group 8: the lightbox ────────────────────────────────────────────
// A 932px phone is taller than the dialog body on an ordinary laptop. The
// point of data-mock-minscale is that it scales down to fit WHOLE rather
// than being cut in half with the body scrolling, so that is what is checked.

const milesFigures = page.locator('details.log-row#miles figure.app-shot');
for (let i = 0; i < 4; i++) {
  const label = mocks.figs[i].cap;
  const fig = milesFigures.nth(i);
  await fig.click();
  await page.waitForTimeout(150); // let render()/fitMockScale settle
  const box = await page.evaluate(() => {
    const lb = document.querySelector('.shot-lightbox');
    const body = lb.querySelector('.shot-lightbox-body');
    const mock = lb.querySelector('.miles-mock');
    const wrap = lb.querySelector('.shot-lightbox-mockwrap');
    return {
      visible: !lb.hasAttribute('hidden'),
      hasClone: !!mock,
      wrapH: wrap ? Math.round(wrap.getBoundingClientRect().height) : 0,
      wrapW: wrap ? Math.round(wrap.getBoundingClientRect().width) : 0,
      bodyScrolls: body.scrollHeight > body.clientHeight + 1,
      capText: lb.querySelector('.shot-lightbox-cap .st').textContent.trim(),
    };
  });
  check(`lightbox: ${label} opens with a cloned .miles-mock, scaled to fit whole`,
    box.visible && box.hasClone && !box.bodyScrolls && box.capText === label,
    JSON.stringify(box));
  check(`lightbox: ${label} keeps the phone's 430:932 proportion`,
    Math.abs(box.wrapW / box.wrapH - MOCK_W / MOCK_H) < 0.01,
    `${box.wrapW}x${box.wrapH}`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
  const hidden = await page.evaluate(() => document.querySelector('.shot-lightbox').hidden);
  const focusReturned = await fig.evaluate((el) => el === document.activeElement);
  check(`lightbox: ${label} Escape closes and returns focus to the trigger`,
    hidden && focusReturned, `hidden=${hidden} focusReturned=${focusReturned}`);
}

// ── Group 9: the strip, wide and narrow ──────────────────────────────

const wide = await page.evaluate(() => {
  const row = Array.prototype.slice.call(document.querySelectorAll('details.log-row'))
    .find((r) => r.querySelector('.miles-mock'));
  const wrap = row.querySelector('.app-shots-wrap');
  const strip = row.querySelector('.app-shots');
  const navGroup = row.querySelector('.shots-nav-group');
  return {
    overflow: wrap.getAttribute('data-overflow'),
    scrollable: strip.scrollWidth > strip.clientWidth + 1,
    navShown: navGroup && !navGroup.hasAttribute('hidden'),
  };
});
// Four phones at 215px plus gaps come to roughly 900px, so unlike every
// landscape gallery on this page the MILES strip FITS at desktop width. The
// arrows must therefore stay hidden here and appear only when it does not
// fit, which is checked at 390px below.
check('at 1440px all four phones fit, so the strip does not scroll and the arrows stay hidden',
  wide.overflow === 'false' && !wide.scrollable && !wide.navShown, JSON.stringify(wide));

await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => new Promise((r) => setTimeout(r, 250)));
const narrow = await page.evaluate(() => {
  const row = Array.prototype.slice.call(document.querySelectorAll('details.log-row'))
    .find((r) => r.querySelector('.miles-mock'));
  const card = row.querySelector('.log-shots-wrap').getBoundingClientRect();
  const figs = Array.prototype.slice.call(row.querySelectorAll('figure.app-shot'));
  const strip = row.querySelector('.app-shots');
  return {
    scrollable: strip.scrollWidth > strip.clientWidth + 1,
    widest: Math.max(...figs.map((f) => f.getBoundingClientRect().width)),
    cardW: card.width,
    navShown: !row.querySelector('.shots-nav-group').hasAttribute('hidden'),
    docOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  };
});
check('at 390px no phone thumbnail is wider than its own row card',
  narrow.widest <= narrow.cardW + 1, JSON.stringify(narrow));
check('at 390px the strip scrolls, its arrows appear, and the page itself does not scroll sideways',
  narrow.scrollable && narrow.navShown && !narrow.docOverflow, JSON.stringify(narrow));

// ── Group 10: the page still states one project total ────────────────

const counts = await page.evaluate(() => {
  const rows = document.querySelectorAll('details.log-row').length;
  const pill = document.querySelector('#logReset .pill-count');
  const status = document.querySelector('#logCount');
  const metas = Array.prototype.slice.call(document.querySelectorAll('meta[name="description"], meta[property="og:description"]'))
    .map((m) => m.getAttribute('content'));
  return {
    rows,
    pill: pill ? pill.textContent.trim() : null,
    status: status ? status.textContent.trim() : null,
    metas,
  };
});
const WORDS = { 28: 'Twenty-eight', 29: 'Twenty-nine', 30: 'Thirty', 31: 'Thirty-one' };
check('the filter pill and the status line agree with the real row count',
  counts.pill === String(counts.rows) && counts.status === `Showing all ${counts.rows}`,
  JSON.stringify(counts));
check('both meta descriptions state the same total in words',
  counts.metas.length === 2 && counts.metas.every((m) => m.startsWith(`${WORDS[counts.rows]} projects,`)),
  JSON.stringify(counts.metas));

// ── Report ───────────────────────────────────────────────────────────
check('no console messages', consoleMsgs.length === 0, JSON.stringify(consoleMsgs));
// Observed on a clean run: Google Fonts stylesheet and woff2 only. Anything
// else is new and should be looked at before being added to this list.
const ALLOWED_EXTERNAL_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
check('external requests are only the known Google Fonts hosts',
  external.every((u) => ALLOWED_EXTERNAL_HOSTS.some((h) => u.includes(h))),
  JSON.stringify([...new Set(external)]));

await browser.close();

let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  — ${r.detail}` : ''}`);
}
console.log(`\nconsole messages: ${consoleMsgs.length}`);
consoleMsgs.forEach((m) => console.log(`  ${m}`));
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
