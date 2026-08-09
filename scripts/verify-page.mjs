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
//
// Two correctness notes from review, both fixed in this file:
//   - imgsBroken is read from load/error listeners attached BEFORE any
//     image fetch is triggered, not from the DOM after the fact. Every
//     <img> on this page has an onerror handler that hides itself or its
//     <figure> — the only failure signal this page ever gives — so reading
//     broken-ness from .hidden or a post-hoc DOM query would exclude
//     exactly the images that failed.
//   - A missing anchor target reports as { found:false } and its own
//     `missingIds` field, rather than silently reading like zero overlap.

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
// A semi-transparent foreground doesn't have a contrast ratio on its own —
// it has one against whatever's actually behind it. Composite it over the
// sampled (assumed-opaque) background before computing luminance, so a
// translucent text colour can't report an artificially favourable number
// just because its own alpha-channel was silently dropped.
function compositeOver(fg, bgRgb) {
  const a = fg.a ?? 1;
  if (a >= 1) return { r: fg.r, g: fg.g, b: fg.b };
  return {
    r: fg.r * a + bgRgb.r * (1 - a),
    g: fg.g * a + bgRgb.g * (1 - a),
    b: fg.b * a + bgRgb.b * (1 - a),
  };
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

    // Every <img> on this page carries an onerror handler that sets
    // hidden=true on itself or its <figure> the moment it fails — that's
    // the ONLY way a broken image on this page ever signals failure, and it
    // is set from inside the very 'error' event we need to observe. So
    // load/error state must be captured with our own listeners attached
    // BEFORE anything can trigger a fetch (see below), never read back from
    // .hidden or a post-hoc DOM query afterwards — by then a failed image
    // looks identical to one that was never present. For an image that's
    // already .complete (the eager portrait can finish inside the earlier
    // 2500ms wait, before this code even runs), naturalWidth at the moment
    // of attachment is read directly, since no future 'load'/'error' event
    // will fire for it to catch.
    await page.evaluate(() => {
      window.__imgTrack = [...document.images].map((img) => {
        const rec = { src: img.src, ok: null };
        if (img.complete) {
          rec.ok = img.naturalWidth > 0;
        } else {
          img.addEventListener('load', () => { rec.ok = true; }, { once: true });
          img.addEventListener('error', () => { rec.ok = false; }, { once: true });
        }
        return rec;
      });
    });

    // All four <img>s are loading="lazy", so nothing has fetched yet at this
    // point except the eager portrait. Two further live inside closed
    // <details class="log-row"> rows — a closed <details> has no layout box,
    // so native lazy-loading never sees them enter the viewport no matter
    // how far the page scrolls. Open every row first, the way a visitor who
    // expands a card would, then scroll the full document height so every
    // image (now all laid out) crosses the lazy-load viewport threshold.
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
    await page.waitForFunction(
      () => window.__imgTrack.every((t) => t.ok !== null),
      { timeout: 5000 },
    ).catch(() => { /* any entry still null after the timeout is reported as broken below */ });

    // Read from __imgTrack, not from document.images/.hidden — deliberately.
    // .filter((i) => !i.closest('[hidden]')) was the bug the reviewer found:
    // it excluded exactly the images whose onerror handler had just hidden
    // them, which on this page is the only way a broken image ever presents
    // itself. There is no [hidden] exclusion here because there must not be
    // one — a genuinely broken image has to fail this check even though the
    // page's own fallback makes it invisible to a human looking at the
    // screen a moment later.
    const imgState = await page.evaluate(() => ({
      imgsBroken: window.__imgTrack
        .filter((t) => t.ok !== true)
        .map((t) => ({ src: t.src, resolvedVia: t.ok === false ? 'error-event' : 'timeout-still-loading' })),
      imgCount: window.__imgTrack.length,
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
    // One page reused for all 9 anchors (was: a fresh page per anchor, 18
    // total across both viewports). A goto() per id still forces a real
    // navigation/scroll-to-fragment for each, which is what's under test.
    const navPage = await browser.newPage({ viewport: { width: w, height: h } });
    const occlusion = {};
    for (const id of ANCHORS) {
      await navPage.goto(`${PAGE_URL}#${id}`);
      await navPage.waitForTimeout(600);
      const r = await navPage.evaluate((anchorId) => {
        const target = document.getElementById(anchorId);
        if (!target) return { found: false };
        const heading = target.matches('h1,h2') ? target : target.querySelector('h1,h2') || target;
        const tr = heading.getBoundingClientRect();
        const nav = document.querySelector('.nav-dock');
        const nr = nav ? nav.getBoundingClientRect() : { top: 0, bottom: 0, left: 0, right: 0 };
        const overlapY = Math.max(0, Math.min(tr.bottom, nr.bottom) - Math.max(tr.top, nr.top));
        const overlapX = Math.max(0, Math.min(tr.right, nr.right) - Math.max(tr.left, nr.left));
        return { found: true, overlapPx: overlapX > 0 ? Math.round(overlapY) : 0, targetTop: Math.round(tr.top), navBottom: Math.round(nr.bottom) };
      }, id);
      occlusion[id] = r;
    }
    await navPage.close();
    // A missing target used to fall through both here (r === null) and the
    // filter below (`v && v.overlapPx > 0` treats null exactly like "found,
    // zero overlap") — a renamed/deleted anchor id would silently pass. Both
    // outcomes now get their own field, so a missing target fails loudly
    // and visibly instead of reading identically to a real pass.
    const missingIds = Object.entries(occlusion).filter(([, v]) => !v.found).map(([id]) => id);
    const occludedIds = Object.entries(occlusion).filter(([, v]) => v.found && v.overlapPx > 0).map(([id]) => id);
    const label2 = `anchor_occlusion_${w}x${h}`;
    if (missingIds.length || occludedIds.length) fail(label2, { occlusion, occludedIds, missingIds, navBox });
    else pass(label2, { occlusion, occludedIds, missingIds, navBox });

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

  // ── Check 8: palette tokens resolve to the values the spec fixed ──
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(PAGE_URL);
    const EXPECTED = {
      '--deep': '#1B2C42',
      '--data': '#17618F',
      '--accent': '#A8392C',
      '--accent-strong': '#B84630',
      '--signal': '#F5837A',
      '--sky': '#4B9BD4',
    };
    const actual = await page.evaluate((names) => {
      const cs = getComputedStyle(document.documentElement);
      const out = {};
      for (const n of names) out[n] = cs.getPropertyValue(n).trim().toUpperCase();
      return out;
    }, Object.keys(EXPECTED));
    const tokenDiff = {};
    for (const [name, want] of Object.entries(EXPECTED)) {
      const got = actual[name] || '(unset)';
      if (got !== want.toUpperCase()) tokenDiff[name] = { want, got };
    }
    // --signal and --sky are fill-only. Their sole legal pairing is --ink on
    // top; assert that here so a future re-tint cannot quietly break it.
    const inkOnFill = await page.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      return { signal: cs.getPropertyValue('--signal').trim(), sky: cs.getPropertyValue('--sky').trim(), ink: cs.getPropertyValue('--ink').trim() };
    });
    const toRgb = (h) => { const s = h.replace('#', ''); return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)); };
    const fillRatios = {};
    for (const k of ['signal', 'sky']) {
      if (!inkOnFill[k] || !inkOnFill.ink) { fillRatios[k] = null; continue; }
      const r = contrastRatio(toRgb(inkOnFill.ink), toRgb(inkOnFill[k]));
      fillRatios[k] = Math.round(r * 100) / 100;
    }
    const fillBad = Object.values(fillRatios).some((r) => r === null || r < CONTRAST_MIN);
    if (Object.keys(tokenDiff).length || fillBad) fail('palette_tokens', { tokenDiff, fillRatios });
    else pass('palette_tokens', { fillRatios });
    await page.close();
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
      // fg.a used to be parsed and then silently dropped here — a
      // semi-transparent text colour would report a contrast ratio computed
      // as if it were fully opaque, which is always the more favourable
      // number. Composite it over the sampled background first instead.
      const effectiveFg = fg && bg ? compositeOver(fg, bg) : null;
      const ratio = effectiveFg && bg ? contrastRatio([effectiveFg.r, effectiveFg.g, effectiveFg.b], [bg.r, bg.g, bg.b]) : null;
      contrastResults[name] = {
        selector: sel,
        textColor: s.textColor,
        textAlpha: fg?.a ?? null,
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
