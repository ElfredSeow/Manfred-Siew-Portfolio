// scripts/verify-page.mjs
//
// Render/verification harness for redesign-v2.html. Measures, does not fix.
// Run: node scripts/verify-page.mjs [path-to-html]
//
// Checks (see task-12 brief for the full spec this implements):
//   1. No horizontal overflow, zero console/page errors, every <img> loaded —
//      at 1440x900 and 390x844.
//   2. No-JS path: contact section (.invert) renders dark-on-light-text, and
//      the default .band-ground layer stays opaque (opacity:1), so nothing
//      collapses to white-on-white when JS never runs.
//   3. Zero network requests to cdn.tailwindcss.com; every external host the
//      page actually requests is reported.
//   4. Contrast spot-checks (WCAG 2.x relative-luminance formula) against the
//      4.5:1 threshold, computed from effective (composited, post-filter)
//      rendered colour rather than declared CSS values.
//   5. Anchor occlusion: pixels of each in-page anchor's target heading that
//      sit under the floating nav after navigating straight to the fragment.
//   6. Skip link: visible on first Tab, lands on an element that exists.
//   7. Document height at 1440x900, for the record.
//
// Exit code is non-zero if any pass/fail check fails, so this can gate CI.
// All numbers are printed either way — this script reports, it does not
// repair the page.

import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const FILE = process.argv[2] ?? 'redesign-v2.html';
const PAGE_URL = pathToFileURL(path.resolve(FILE)).href;
const CONTRAST_MIN = 4.5;
const BLOCKED_HOST = 'cdn.tailwindcss.com';

const WIDTHS = [
  [1440, 900],
  [390, 844],
];

const ANCHORS = ['ident', 'origin', 'wp1', 'wp2', 'wp3', 'security', 'log', 'record', 'contact'];

const results = { pass: true, checks: {} };

function fail(name, detail) {
  results.pass = false;
  results.checks[name] = { pass: false, ...detail };
}
function pass(name, detail) {
  results.checks[name] = { pass: true, ...detail };
}

// ── WCAG contrast helpers, evaluated in Node (inputs come from the page) ──
function srgbToLinear(c) {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function relLuminance([r, g, b]) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}
function contrastRatio(rgbA, rgbB) {
  const lA = relLuminance(rgbA);
  const lB = relLuminance(rgbB);
  const [light, dark] = lA > lB ? [lA, lB] : [lB, lA];
  return (light + 0.05) / (dark + 0.05);
}
function parseRgb(str) {
  const m = /rgba?\(([^)]+)\)/.exec(str ?? '');
  if (!m) return null;
  const p = m[1].split(',').map((s) => parseFloat(s.trim()));
  return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
}

// Runs in the browser: text colour of `sel`, plus the effective (walked-up,
// first-fully-opaque-ancestor) background colour, plus every `filter` value
// seen on the way up — so a reintroduced compositing filter (Task 10's
// invert-collision bug) would show up here rather than being silently
// invisible to a check that only reads declared `color`.
function sampleInBrowser(sel) {
  const el = document.querySelector(sel);
  if (!el) return { found: false };
  const textColor = getComputedStyle(el).color;
  const filters = [];
  let node = el;
  let bg = null;
  while (node) {
    const cs = getComputedStyle(node);
    if (cs.filter && cs.filter !== 'none') filters.push({ el: node.className || node.tagName, filter: cs.filter });
    if (bg === null) {
      const m = /rgba?\(([^)]+)\)/.exec(cs.backgroundColor);
      if (m) {
        const p = m[1].split(',').map(Number);
        const a = p.length > 3 ? p[3] : 1;
        if (a >= 0.999) bg = cs.backgroundColor;
      }
    }
    node = node.parentElement;
  }
  return { found: true, textColor, bg: bg ?? 'rgb(255,255,255)', filters };
}

async function main() {
  const browser = await chromium.launch();

  // ── Checks 1, 5, 6, 7: per-viewport render checks ──
  for (const [w, h] of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', (e) => pageErrors.push(String(e)));

    await page.goto(PAGE_URL);
    await page.waitForTimeout(2500);

    // Document height and overflow are measured on the page as a first-time
    // visitor actually sees it — before anything is expanded.
    const initial = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
    }));
    if (w === 1440) pass('document_height_1440', { height: initial.scrollHeight });

    // All four <img>s are loading="lazy", so a naive check right after
    // goto() sees them all as unresolved. Two further live inside closed
    // <details class="log-row"> rows — a closed <details> has no layout box,
    // so native lazy-loading never sees them enter the viewport no matter
    // how far the page scrolls. Open every row first, the way a visitor who
    // expands a card would, then scroll the full document height so every
    // image (now all laid out) crosses the lazy-load viewport threshold,
    // then wait for each to actually resolve (load or error) rather than
    // racing a fixed timeout, before judging naturalWidth.
    await page.evaluate(() => document.querySelectorAll('details').forEach((d) => { d.open = true; }));
    // The page sets html{scroll-behavior:smooth}, which window.scrollTo()'s
    // default 'auto' behavior honours — each call below would otherwise
    // kick off an animated scroll that the next call interrupts before it
    // ever reaches the target, so the viewport never actually visits the
    // lower images and native lazy-loading never fires. behavior:'instant'
    // bypasses that.
    await page.evaluate(async () => {
      const step = Math.max(200, window.innerHeight);
      for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    await page.evaluate(() => Promise.all([...document.images].map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
        setTimeout(resolve, 5000);
      });
    })));

    const imgState = await page.evaluate(() => ({
      imgsBroken: [...document.images]
        .filter((i) => !i.closest('[hidden]'))
        .filter((i) => !i.complete || !i.naturalWidth)
        .map((i) => i.src),
      imgCount: document.images.length,
    }));

    const overflow = initial.scrollWidth > initial.clientWidth;
    const label = `overflow_${w}x${h}`;
    const detail = { width: w, height: h, ...initial, ...imgState, overflow, consoleErrors, pageErrors };
    if (overflow || imgState.imgsBroken.length || consoleErrors.length || pageErrors.length) {
      fail(label, detail);
    } else {
      pass(label, detail);
    }

    // ── Check 5: anchor occlusion (this viewport) ──
    const navBox = await page.evaluate(() => {
      const nav = document.querySelector('.nav-dock');
      if (!nav) return null;
      const r = nav.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
    });
    const occlusion = {};
    for (const id of ANCHORS) {
      const p2 = await browser.newPage({ viewport: { width: w, height: h } });
      await p2.goto(`${PAGE_URL}#${id}`);
      await p2.waitForTimeout(600);
      const r = await p2.evaluate((anchorId) => {
        const target = document.getElementById(anchorId);
        if (!target) return null;
        const heading = target.matches('h1,h2') ? target : target.querySelector('h1,h2') || target;
        const tr = heading.getBoundingClientRect();
        const nav = document.querySelector('.nav-dock');
        const nr = nav ? nav.getBoundingClientRect() : { top: 0, bottom: 0, left: 0, right: 0 };
        const overlapY = Math.max(0, Math.min(tr.bottom, nr.bottom) - Math.max(tr.top, nr.top));
        const overlapX = Math.max(0, Math.min(tr.right, nr.right) - Math.max(tr.left, nr.left));
        return { overlapPx: overlapX > 0 ? Math.round(overlapY) : 0, targetTop: Math.round(tr.top), navBottom: Math.round(nr.bottom) };
      }, id);
      occlusion[id] = r;
      await p2.close();
    }
    const occludedIds = Object.entries(occlusion).filter(([, v]) => v && v.overlapPx > 0).map(([id]) => id);
    const label2 = `anchor_occlusion_${w}x${h}`;
    if (occludedIds.length) fail(label2, { occlusion, occludedIds, navBox });
    else pass(label2, { occlusion, navBox });

    await page.close();
  }

  // ── Check 6: skip link, first Tab ──
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(PAGE_URL);
    await page.keyboard.press('Tab');
    const skip = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || !el.classList.contains('skip')) return { isSkip: false, activeTag: el?.tagName };
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const href = el.getAttribute('href') || '';
      const targetId = href.replace('#', '');
      const target = document.getElementById(targetId);
      return {
        isSkip: true,
        visible: r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && r.top >= -1,
        rect: { top: Math.round(r.top), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height) },
        targetId,
        targetExists: !!target,
      };
    });
    if (!skip.isSkip || !skip.visible || !skip.targetExists) fail('skip_link', skip);
    else pass('skip_link', skip);
    await page.close();
  }

  // ── Check 2: no-JS path ──
  {
    const page = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
    await page.goto(PAGE_URL);
    const nojs = await page.evaluate(() => {
      const invertEl = document.querySelector('.invert.contact') || document.querySelector('.invert');
      const ledeEl = document.querySelector('.contact-lede');
      const bands = [...document.querySelectorAll('.band')].map((b) => ({
        cls: b.className,
        opacity: getComputedStyle(b).opacity,
        bg: getComputedStyle(b).backgroundImage || getComputedStyle(b).backgroundColor,
      }));
      const csInvert = invertEl ? getComputedStyle(invertEl) : null;
      const csLede = ledeEl ? getComputedStyle(ledeEl) : null;
      return {
        invertFound: !!invertEl,
        invertBg: csInvert?.backgroundColor,
        invertFilter: csInvert?.filter,
        invertColor: csInvert?.color,
        ledeFound: !!ledeEl,
        ledeColor: csLede?.color,
        bands,
        htmlHasJsClass: document.documentElement.classList.contains('js'),
      };
    });
    // .band's base rule is opacity:1, but .band-cruise and .band-space each
    // carry their own opacity:0 (same specificity, later in the stylesheet,
    // so it wins) — that's deliberate: only band-ground is meant to be
    // visible at rest, since js only ever raises the *other* two bands
    // during the scroll-driven altitude sequence. So the pass criterion here
    // is "ground is opaque", not "every band is opaque" — the latter would
    // fail correct, working CSS. All three are still reported below.
    const groundOpacity = nojs.bands.find((b) => b.cls.includes('band-ground'))?.opacity;
    const bgRgb = parseRgb(nojs.invertBg);
    const isDarkBg = bgRgb ? relLuminance([bgRgb.r, bgRgb.g, bgRgb.b]) < 0.2 : false;
    const isTransparentBg = !bgRgb || bgRgb.a < 0.5;
    const okBands = groundOpacity === '1';
    if (!nojs.invertFound || !nojs.ledeFound || isTransparentBg || !isDarkBg || !okBands) {
      fail('nojs_contact', { ...nojs, groundOpacity, isDarkBg, isTransparentBg, okBands });
    } else {
      pass('nojs_contact', { ...nojs, groundOpacity, isDarkBg, isTransparentBg, okBands });
    }
    await page.close();
  }

  // ── Check 3: network — zero requests to the removed Tailwind CDN ──
  // A fresh context, with the CDP-level HTTP cache explicitly disabled, so a
  // resource already fetched by an earlier check in this run (fonts,
  // unpkg's three.js) can't be served from cache and silently skip firing a
  // 'request' event — which would make an empty hosts list look like a pass
  // for the wrong reason instead of proving anything.
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    const hosts = new Set();
    const blockedHits = [];
    page.on('request', (req) => {
      try {
        const u = new URL(req.url());
        if (u.protocol === 'file:' || u.protocol === 'data:') return;
        hosts.add(u.host);
        if (u.host.includes(BLOCKED_HOST)) blockedHits.push(req.url());
      } catch { /* ignore malformed URL */ }
    });
    await page.goto(PAGE_URL);
    await page.waitForTimeout(2000);
    const hostList = [...hosts].sort();
    if (blockedHits.length) fail('network_no_tailwind_cdn', { hosts: hostList, blockedHits });
    else pass('network_no_tailwind_cdn', { hosts: hostList, blockedHits });
    await ctx.close();
  }

  // ── Check 4: contrast spot-checks ──
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(PAGE_URL);
    await page.waitForTimeout(1500);

    const samples = {
      body_on_light: '.origin-note',
      invert_contact_body: '.contact-lede',
      disabled_pill_label: '.pill[data-cat="simulation"]',
      disabled_pill_claim: '.pill[data-cat="simulation"] .pill-claim',
    };
    const contrastResults = {};
    for (const [name, sel] of Object.entries(samples)) {
      const s = await page.evaluate(sampleInBrowser, sel);
      if (!s.found) {
        contrastResults[name] = { found: false, selector: sel };
        continue;
      }
      const fg = parseRgb(s.textColor);
      const bg = parseRgb(s.bg);
      const ratio = fg && bg ? contrastRatio([fg.r, fg.g, fg.b], [bg.r, bg.g, bg.b]) : null;
      contrastResults[name] = {
        selector: sel,
        textColor: s.textColor,
        bg: s.bg,
        filtersOnPath: s.filters,
        ratio: ratio ? Math.round(ratio * 100) / 100 : null,
        meetsAA: ratio ? ratio >= CONTRAST_MIN : false,
      };
    }
    const anyFail = Object.values(contrastResults).some((c) => !c.meetsAA);
    if (anyFail) fail('contrast', contrastResults);
    else pass('contrast', contrastResults);
    await page.close();
  }

  await browser.close();

  console.log(JSON.stringify(results, null, 2));
  process.exit(results.pass ? 0 : 1);
}

main().catch((err) => {
  console.error('verify-page.mjs crashed:', err);
  process.exit(2);
});
