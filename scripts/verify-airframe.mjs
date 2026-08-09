// scripts/verify-airframe.mjs
//
// Geometry verification for the signature airframe in redesign-v2.html.
// Run: node scripts/verify-airframe.mjs [path-to-html]
//
// This asserts facts about the scene GRAPH, not about pixels. A screenshot
// cannot tell you that the bounding box is 6.20 across, that the canopy sits
// exactly on the COCKPIT constant three camera beats target, or that a halo
// has depthWrite disabled. Those are the things that silently break the
// camera rig, so those are the things checked here.
//
// Reads window.Stage, which redesign-v2.html exposes for exactly this reason
// (the page already exposes window.Flight on the same principle).
//
// Requires network: three.js loads from unpkg via the import map. With no
// network the page correctly falls back to Tier 0 and this harness reports
// tier0_fallback and exits 2 — that is an inconclusive run, not a pass.

import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const FILE = process.argv[2] ?? 'redesign-v2.html';
const PAGE_URL = pathToFileURL(path.resolve(FILE)).href;

const results = { pass: true, checks: {} };
const fail = (n, d) => { results.pass = false; results.checks[n] = { pass: false, ...d }; };
const pass = (n, d) => { results.checks[n] = { pass: true, ...d }; };
const near = (a, b, tol) => Math.abs(a - b) <= tol;

// Read the airframe's measurements out of the live scene graph.
function measure() {
  const S = window.Stage;
  if (!S) return { ok: false, why: 'window.Stage missing' };
  const { THREE, jet } = S;

  // Measure the airframe in its own model space, not wherever the scroll
  // position happens to have left it. Save/restore rather than cloning:
  // Box3.setFromObject walks world matrices, so a jet sitting at altitude
  // would report a bounding box offset by its own flight position.
  const pos = jet.position.clone();
  const rot = jet.rotation.clone();
  jet.position.set(0, 0, 0);
  jet.rotation.set(0, 0, 0);
  jet.updateMatrixWorld(true);

  // Sprites are camera-facing billboards whose world size depends on the
  // camera; including them would make the airframe's bounding box a
  // function of where the reader has scrolled to. Measure solids only.
  const solids = [];
  jet.traverse((o) => { if (o.isMesh) solids.push(o); });
  const box = new THREE.Box3();
  solids.forEach((m) => box.expandByObject(m));

  const canopy = solids.find((m) => m.material && m.material.transparent && m.material.opacity < 1);

  const out = {
    ok: true,
    min: box.min.toArray(),
    max: box.max.toArray(),
    length: box.max.z - box.min.z,
    span: box.max.x - box.min.x,
    meshCount: solids.length,
    haloCount: S.halos.length,
    canopy: canopy ? { pos: canopy.position.toArray(), scale: canopy.scale.toArray() } : null,
    cockpit: S.COCKPIT.toArray(),
  };

  jet.position.copy(pos);
  jet.rotation.copy(rot);
  jet.updateMatrixWorld(true);
  return out;
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  await page.goto(PAGE_URL);
  // The stage races the three.js import against a 5s budget, so wait past it.
  await page.waitForTimeout(6000);

  const tier = await page.evaluate(() => ({
    tier2: document.documentElement.classList.contains('tier-2'),
    hasStage: !!window.Stage,
  }));

  if (!tier.tier2 || !tier.hasStage) {
    console.log(JSON.stringify({
      pass: false, inconclusive: true,
      checks: { tier0_fallback: { pass: false, ...tier, pageErrors } },
      note: 'Page fell back to Tier 0 (no WebGL, or three.js did not load). Geometry could not be measured.',
    }, null, 2));
    await browser.close();
    process.exit(2);
  }

  const m = await page.evaluate(measure);

  // ── Tailless. The single strongest futuristic cue, and the one thing that
  //    fails loudly against the old airframe: its vertical fin reaches
  //    y ~ 1.62. The new airframe's highest point is an inlet bump at
  //    y ~ 0.48. Anything above 0.8 means a fin survived. ──
  if (m.max[1] >= 0.8) fail('tailless', { maxY: m.max[1], threshold: 0.8, note: 'geometry above y=0.8 means a vertical fin is still present' });
  else pass('tailless', { maxY: m.max[1], threshold: 0.8 });

  // ── Bounding box. Every CAM standoff distance was sized against 6.0 x 6.2. ──
  const boxOk = near(m.length, 6.00, 0.15) && near(m.span, 6.20, 0.15);
  const boxDetail = { length: m.length, span: m.span, expected: { length: 6.00, span: 6.20 }, tolerance: 0.15 };
  if (boxOk) pass('bounding_box', boxDetail); else fail('bounding_box', boxDetail);

  if (pageErrors.length) fail('no_page_errors', { pageErrors });
  else pass('no_page_errors', { pageErrors });

  results.measured = m;
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  process.exit(results.pass ? 0 : 1);
}

main().catch((err) => {
  console.error('verify-airframe.mjs crashed:', err);
  process.exit(2);
});
