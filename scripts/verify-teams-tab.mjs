/* ============================================================================
   verify-teams-tab.mjs — end-to-end checks for the Microsoft Teams tab layer.

   Serves public/ through a small server that mirrors the Firebase Hosting
   config (cleanUrls + the real headers block from firebase.json), then drives
   Chromium through the three states the tab layer can be in:

     web      plain browser, no Teams               -> must be a total no-op
     nosdk    hosted, Teams JS CDN unreachable      -> must degrade, not break
     sdk      hosted, SDK present and initialising  -> must theme + route links

   Run:  node scripts/verify-teams-tab.mjs
   Exits non-zero on the first failing assertion group.

   Requires playwright (npm install --no-save playwright).
   ========================================================================== */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const SDK_HOST_GLOB = 'https://res.cdn.office.net/**';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.gif': 'image/gif', '.json': 'application/json',
};

/* --- results ------------------------------------------------------------ */
const results = [];
let failed = 0;
function check(group, name, pass, detail = '') {
  results.push({ group, name, pass, detail });
  if (!pass) failed++;
}
const progress = (msg) => process.stderr.write(`  ... ${msg}\n`);

/* --- Firebase-equivalent static server ---------------------------------- */
function hostingHeaders() {
  const cfg = JSON.parse(readFileSync(path.join(ROOT, 'firebase.json'), 'utf8'));
  return cfg.hosting.headers.find((h) => h.source === '**').headers;
}

async function resolveFile(urlPath) {
  // Mirror firebase.json: cleanUrls true, trailingSlash false.
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const rel = clean.replace(/^\/+/, '');
  const candidates = rel === ''
    ? ['index.html']
    : [rel, `${rel}.html`, path.join(rel, 'index.html')];
  for (const c of candidates) {
    const abs = path.join(PUBLIC, c);
    if (!abs.startsWith(PUBLIC)) continue;           // no traversal
    if (existsSync(abs) && !abs.endsWith(path.sep)) {
      try { return { abs, body: await readFile(abs) }; } catch { /* dir */ }
    }
  }
  return null;
}

function startServer() {
  const globals = hostingHeaders();
  const server = createServer(async (req, res) => {
    const found = await resolveFile(req.url);
    for (const h of globals) res.setHeader(h.key, h.value);
    if (!found) { res.writeHead(404); res.end('not found'); return; }
    res.setHeader('Content-Type', MIME[path.extname(found.abs)] || 'application/octet-stream');
    res.writeHead(200);
    res.end(found.body);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve({ server, base: `http://127.0.0.1:${server.address().port}` });
    });
  });
}

/* --- SDK stub, served in place of the real CDN bundle ------------------- */
function sdkStub(theme) {
  return `
    window.__teamsStub = { openedLinks: [], notified: false, themeHandler: null };
    window.microsoftTeams = {
      app: {
        initialize: function () { return Promise.resolve(); },
        getContext: function () {
          return Promise.resolve({ app: { theme: ${JSON.stringify(theme)}, host: { name: 'Teams' } } });
        },
        registerOnThemeChangeHandler: function (h) { window.__teamsStub.themeHandler = h; },
        openLink: function (url) { window.__teamsStub.openedLinks.push(url); return Promise.resolve(); },
        notifySuccess: function () { window.__teamsStub.notified = true; }
      }
    };`;
}

/* Subresource Integrity would reject our stub body, so neutralise the
   attribute in the harness only. Production keeps the real hash. */
const DISABLE_SRI = `Object.defineProperty(HTMLScriptElement.prototype, 'integrity', {
    configurable: true, get() { return ''; }, set() {}
  });`;

async function newPage(browser, { mode, theme = 'default', viewport }) {
  const ctx = await browser.newContext({ viewport: viewport || { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  if (mode === 'sdk') {
    await page.addInitScript(DISABLE_SRI);
    await page.route(SDK_HOST_GLOB, (route) =>
      route.fulfill({ status: 200, contentType: 'text/javascript', body: sdkStub(theme) }));
  } else {
    // web + nosdk: the CDN must never be reached.
    await page.route(SDK_HOST_GLOB, (route) => route.abort());
  }
  return { ctx, page, errors };
}

const cls = (page) => page.evaluate(() => document.documentElement.className);

/* --- main --------------------------------------------------------------- */
const { chromium } = await import('playwright');

/* Some environments ship a prebuilt Chromium that does not match the
   playwright package's expected build number. Prefer an explicit binary when
   one is present rather than trying to download. */
function chromiumPath() {
  if (process.env.PW_CHROMIUM) return process.env.PW_CHROMIUM;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  if (!existsSync(base)) return undefined;
  const dir = readdirSync(base)
    .filter((d) => /^chromium-\d+$/.test(d))
    .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))[0];
  if (!dir) return undefined;
  const bin = path.join(base, dir, 'chrome-linux', 'chrome');
  return existsSync(bin) ? bin : undefined;
}

const { server, base } = await startServer();
const executablePath = chromiumPath();
if (executablePath) console.log(`using chromium: ${executablePath}`);
const browser = await chromium.launch(executablePath ? { executablePath } : {});

const PAGES = ['/', '/work', '/projects', '/experience'];
for (const extra of ['/privacy', '/terms']) {
  if (existsSync(path.join(PUBLIC, `${extra.slice(1)}.html`))) PAGES.push(extra);
}

try {
  /* 1. Hosting headers ---------------------------------------------------- */
  {
    const res = await fetch(`${base}/`);
    const csp = res.headers.get('content-security-policy') || '';
    check('headers', 'CSP frame-ancestors present', csp.includes('frame-ancestors'), csp.slice(0, 60));
    for (const origin of ['teams.microsoft.com', '*.teams.microsoft.com',
      '*.microsoft365.com', 'outlook.office.com', '*.cloud.microsoft']) {
      check('headers', `allows ${origin}`, csp.includes(origin));
    }
    check('headers', 'no X-Frame-Options', !res.headers.has('x-frame-options'),
      res.headers.get('x-frame-options') || 'absent');
  }

  /* 2. teams-tab.css is inert outside Teams ------------------------------- */
  {
    const css = await readFile(path.join(PUBLIC, 'assets/teams-tab.css'), 'utf8');
    const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
    const bad = [];
    // Walk top-level blocks; descend into at-rules that wrap real rules.
    const scan = (text) => {
      const re = /([^{}]+)\{/g;
      let m;
      while ((m = re.exec(text))) {
        const sel = m[1].trim();
        if (!sel || sel.startsWith('@')) continue;
        for (const part of sel.split(',')) {
          const s = part.trim();
          if (!s || s.startsWith('@')) continue;
          if (!/\.is-teams|\.teams-theme-/.test(s)) bad.push(s);
        }
      }
    };
    scan(stripped);
    check('css-scoping', 'every selector scoped to .is-teams / .teams-theme-*',
      bad.length === 0, bad.slice(0, 5).join(' | '));
  }

  /* 3. Plain web: total no-op -------------------------------------------- */
  {
    progress('plain web');
    const { ctx, page, errors } = await newPage(browser, { mode: 'web' });
    await page.goto(`${base}/`, { waitUntil: 'networkidle' });
    const c = await cls(page);
    check('web', 'no is-teams class', !c.includes('is-teams'), c);
    check('web', 'no teams-theme class', !c.includes('teams-theme-'), c);
    const bg = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor);
    check('web', 'body keeps light ground', bg === 'rgb(244, 247, 253)', bg);
    const href = await page.evaluate(() => {
      const a = [...document.querySelectorAll('a[href]')]
        .find((x) => new URL(x.href).origin === location.origin);
      return a ? a.href : '';
    });
    check('web', 'internal links not rewritten', !href.includes('in=teams'), href);
    check('web', 'no console/page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
    await ctx.close();
  }

  /* 4. Hosted, SDK unreachable: must degrade ------------------------------ */
  {
    progress('hosted, SDK blocked');
    const { ctx, page, errors } = await newPage(browser, { mode: 'nosdk' });
    await page.goto(`${base}/?in=teams`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () => document.documentElement.classList.contains('is-teams-nosdk'),
      null, { timeout: 15000 }
    ).catch(() => {});
    const c = await cls(page);
    check('nosdk', 'is-teams applied', c.includes('is-teams'), c);
    check('nosdk', 'settles into is-teams-nosdk', c.includes('is-teams-nosdk'), c);
    check('nosdk', 'a theme class is set', /teams-theme-(default|dark|contrast)/.test(c), c);
    check('nosdk', 'page still rendered', (await page.locator('main').count()) > 0);
    check('nosdk', 'no unhandled page errors', errors.filter(e => !/res\.cdn\.office\.net|ERR_FAILED|Failed to load/i.test(e)).length === 0,
      errors.slice(0, 2).join(' | '));
    await ctx.close();
  }

  /* 5. Hosted with SDK: theme, links, notify ------------------------------ */
  {
    progress('hosted, SDK responding');
    const { ctx, page, errors } = await newPage(browser, { mode: 'sdk', theme: 'dark' });
    await page.goto(`${base}/?in=teams`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () => document.documentElement.classList.contains('is-teams-sdk'),
      null, { timeout: 15000 }
    ).catch(() => {});
    const c = await cls(page);
    check('sdk', 'is-teams-sdk applied', c.includes('is-teams-sdk'), c);
    check('sdk', 'dark theme from context', c.includes('teams-theme-dark'), c);
    check('sdk', 'host recorded', (await page.getAttribute('html', 'data-teams-host')) === 'teams');
    check('sdk', 'notifySuccess called', await page.evaluate(() => window.__teamsStub?.notified === true));
    check('sdk', 'theme handler registered',
      await page.evaluate(() => typeof window.__teamsStub?.themeHandler === 'function'));

    // Dark tokens must actually change the ground.
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    check('sdk', 'dark theme changes body ground', bg !== 'rgb(244, 247, 253)', bg);

    // Live theme switch.
    await page.evaluate(() => window.__teamsStub.themeHandler('contrast'));
    check('sdk', 'theme handler switches to contrast',
      (await cls(page)).includes('teams-theme-contrast'), await cls(page));
    await page.evaluate(() => window.__teamsStub.themeHandler('dark'));

    // Internal links carry the hosted marker.
    const internal = await page.evaluate(() =>
      [...document.querySelectorAll('a[href]')]
        .filter((a) => { try { return new URL(a.href).origin === location.origin; } catch { return false; } })
        .map((a) => a.getAttribute('href')));
    const missing = internal.filter((h) => !/^#|^mailto:|^tel:/.test(h) && !h.includes('in=teams'));
    check('sdk', 'internal links carry ?in=teams', missing.length === 0,
      `${internal.length} internal, missing on: ${missing.slice(0, 3).join(', ')}`);

    // External links go through the host opener, not the iframe.
    const opened = await page.evaluate(async () => {
      const a = [...document.querySelectorAll('a[href]')]
        .find((x) => { try { return new URL(x.href).origin !== location.origin && /^https?:/.test(x.href); } catch { return false; } });
      if (!a) return null;
      a.click();
      await new Promise((r) => setTimeout(r, 200));
      return window.__teamsStub.openedLinks;
    });
    check('sdk', 'external link routed via app.openLink',
      Array.isArray(opened) && opened.length === 1, JSON.stringify(opened));
    check('sdk', 'stayed on the tab URL', new URL(page.url()).pathname === '/', page.url());
    check('sdk', 'no console/page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
    await ctx.close();
  }

  /* 6. Every page, both themes, narrow + wide: no horizontal overflow ----- */
  const VIEWPORTS = [{ width: 360, height: 720 }, { width: 1280, height: 800 }];
  for (const theme of ['default', 'dark', 'contrast']) {
    const { ctx, page } = await newPage(browser, { mode: 'sdk', theme });
    page.setDefaultTimeout(20000);
    for (const vp of VIEWPORTS) {
      await page.setViewportSize(vp);
      for (const p of PAGES) {
        progress(`layout ${theme} @${vp.width} ${p}`);
        await page.goto(`${base}${p}?in=teams`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        const settled = await page.waitForFunction(
          () => document.documentElement.classList.contains('is-teams-sdk'),
          null, { timeout: 10000 }
        ).then(() => true).catch(() => false);
        check('layout', `${p} @${vp.width}px ${theme}: adapter active`, settled);
        const over = await page.evaluate(() =>
          Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
        check('layout', `${p} @${vp.width}px ${theme}: no h-overflow`, over <= 1, `${over}px`);
        const visible = await page.evaluate(() => {
          const m = document.querySelector('main') || document.body;
          return m.getBoundingClientRect().height > 200;
        });
        check('layout', `${p} @${vp.width}px ${theme}: content visible`, visible);
      }
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}

/* --- report ------------------------------------------------------------- */
let group = '';
for (const r of results) {
  if (r.group !== group) { group = r.group; console.log(`\n${group}`); }
  console.log(`  ${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail && !r.pass ? `  -> ${r.detail}` : ''}`);
}
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
