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

  // The planform is the largest solid by bounding-box area. Pull its vertex
  // set so the outline's defining points can be checked for real, rather
  // than trusting that the constants at the top of buildAircraft() were
  // actually the ones fed to plate().
  let planform = null, area = -1;
  solids.forEach((mesh) => {
    const b = new THREE.Box3().setFromObject(mesh);
    const a = (b.max.x - b.min.x) * (b.max.z - b.min.z);
    if (a > area) { area = a; planform = mesh; }
  });
  const verts = [];
  if (planform) {
    const p = planform.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) verts.push([p.getX(i), p.getY(i), p.getZ(i)]);
  }
  // Does any vertex land within `tol` of this [x, z]? Bevelling moves every
  // outline point slightly, so an exact match would never hit.
  const hasVertexAt = (x, z, tol) => verts.some((v) => Math.abs(v[0] - x) <= tol && Math.abs(v[2] - z) <= tol);

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
    sawtooth: {
      notchR:   hasVertexAt( 1.30, -1.00, 0.08),
      notchL:   hasVertexAt(-1.30, -1.00, 0.08),
      centreTE: hasVertexAt( 0.00, -2.60, 0.08),
      tipR:     hasVertexAt( 3.10, -1.30, 0.08),
      tipL:     hasVertexAt(-3.10, -1.30, 0.08),
      noseApex: hasVertexAt( 0.00,  3.40, 0.08),
    },
    // Symmetry, measured rather than assumed. Mirroring by negative scale
    // would invert winding and light wrong, so the outline is mirrored in
    // coordinates instead — this is what proves that happened.
    symmetryError: verts.length
      ? Math.abs(Math.abs(box.min.x) - Math.abs(box.max.x))
      : null,
    bellyY: box.min.y,
    // Inlets on TOP. Inlets visible from below is the exact opposite of
    // the grammar being invoked here, so their height is checked, not just
    // their presence. Counts the BUMPS only — each inlet is a bump plus a
    // dark mouth sitting at the same y and x, so a position-only filter
    // would count four and never match.
    inletsAboveDeck: solids.filter((mesh) =>
      mesh.geometry.type === 'SphereGeometry' &&
      mesh.position.y > 0.2 &&
      Math.abs(mesh.position.x) > 0.3 &&
      mesh.position.z > 0.5).length,
    // Ruddervators carry their fore/aft offset inside the extruded shape,
    // so mesh.position.z is 0 for both — outboard x is the only reliable
    // discriminator, and nothing else on the airframe sits past x = 2.0.
    ruddervators: solids.filter((mesh) => Math.abs(mesh.position.x) > 2.0).length,
    // Read the skin colour off the planform itself — the mesh already
    // identified above by bounding-box area — rather than guessing at it
    // with a vertex-count threshold that would silently pick a different
    // mesh if the geometry were ever retuned.
    skinHex: planform ? planform.material.color.getHexString() : null,
    // Unlit surfaces. MeshBasicMaterial has no `lights` uniform at all,
    // which is the property being relied on: these must not dim when the
    // sun does.
    emissiveCount: solids.filter((mesh) => mesh.material && mesh.material.isMeshBasicMaterial).length,
    halos: S.halos.map((h) => ({
      isSprite: !!h.isSprite,
      additive: h.material.blending === THREE.AdditiveBlending,
      depthWrite: h.material.depthWrite,
      baseScale: h.userData.baseScale ?? null,
    })),
  };

  // Ruddervator mirror check. The two sides are built independently (never
  // by negative scale), so nothing guarantees they land as true mirror
  // images short of measuring both and comparing. Sorted by min.x so [0] is
  // the left (negative x) side and [1] is the right.
  const rvMeshes = solids.filter((mesh) => Math.abs(mesh.position.x) > 2.0);
  if (rvMeshes.length === 2) {
    const boxes = rvMeshes
      .map((mesh) => new THREE.Box3().setFromObject(mesh))
      .sort((a, b) => a.min.x - b.min.x);
    const [L, R] = boxes;
    out.ruddervatorSymmetry = {
      yMinDelta: Math.abs(L.min.y - R.min.y),
      yMaxDelta: Math.abs(L.max.y - R.max.y),
      // Mirrored x-extents: left's min should equal minus right's max, and
      // vice versa.
      xMirrorMinDelta: Math.abs(L.min.x + R.max.x),
      xMirrorMaxDelta: Math.abs(L.max.x + R.min.x),
    };
  } else {
    out.ruddervatorSymmetry = null;
  }

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

  // ── Sawtooth trailing edge. The one feature that reads as
  //    "next generation" instantly and survives being shrunk to a
  //    silhouette. Every defining point of the outline is checked. ──
  const st = m.sawtooth;
  const stOk = st.notchR && st.notchL && st.centreTE && st.tipR && st.tipL && st.noseApex;
  if (stOk) pass('planform_outline', st); else fail('planform_outline', st);

  const symOk = m.symmetryError !== null && m.symmetryError <= 0.02;
  if (symOk) pass('symmetry', { symmetryError: m.symmetryError, tolerance: 0.02 });
  else fail('symmetry', { symmetryError: m.symmetryError, tolerance: 0.02 });

  // ── Volume. A lifting body has an underside; without one the airframe is
  //    a flat sheet at the wide shot and the contact shadow sits under
  //    nothing. Belly target -0.30; bevel carries it a further ~0.018, and
  //    Task 8's parked keyframe is derived from this number. ──
  const bellyOk = near(m.bellyY, -0.30, 0.04);
  if (bellyOk) pass('belly_depth', { bellyY: m.bellyY, expected: -0.30, tolerance: 0.04 });
  else fail('belly_depth', { bellyY: m.bellyY, expected: -0.30, tolerance: 0.04 });

  // ── Propulsion and control surfaces. ──
  if (m.inletsAboveDeck === 2) pass('top_mounted_inlets', { count: m.inletsAboveDeck });
  else fail('top_mounted_inlets', { count: m.inletsAboveDeck, expected: 2, note: 'two inlet bumps above the deck line, outboard of centre, forward of midpoint' });

  if (m.ruddervators === 2) pass('canted_ruddervators', { count: m.ruddervators });
  else fail('canted_ruddervators', { count: m.ruddervators, expected: 2 });

  // ── The canopy anchors three camera beats. If it drifts off COCKPIT, the
  //    push-in at 14500 / 28500 / 42500 lands on empty air and nothing in
  //    the rig complains. ──
  const c = m.canopy;
  const cockpitOk = c && near(c.pos[0], m.cockpit[0], 0.001) && near(c.pos[1], m.cockpit[1], 0.001) && near(c.pos[2], m.cockpit[2], 0.001);
  if (cockpitOk) pass('canopy_on_cockpit', { canopy: c.pos, cockpit: m.cockpit });
  else fail('canopy_on_cockpit', { canopy: c ? c.pos : null, cockpit: m.cockpit, note: 'canopy centre must equal the COCKPIT constant exactly' });

  // Low and long, not a 1970s bubble.
  const shapeOk = c && near(c.scale[0], 0.62, 0.02) && near(c.scale[1], 0.40, 0.02) && near(c.scale[2], 1.55, 0.02);
  if (shapeOk) pass('canopy_profile', { scale: c.scale, expected: [0.62, 0.40, 1.55] });
  else fail('canopy_profile', { scale: c ? c.scale : null, expected: [0.62, 0.40, 1.55] });

  // ── Graphite, not the pale skin the old airframe used. A dark surface is
  //    what lets emissive read as glow rather than as paint. ──
  if (m.skinHex === '5c6675') pass('skin_graphite', { skinHex: m.skinHex });
  else fail('skin_graphite', { skinHex: m.skinHex, expected: '5c6675' });

  // ── Ruddervator mirror symmetry. Built per side (never negative-scale
  //    mirrored), so a fixed local-space offset combined with opposite-sign
  //    cant rotation can silently pivot each side about a different
  //    effective axis. Catches that: both y-extents and mirrored x-extents
  //    must match closely. ──
  const rvSym = m.ruddervatorSymmetry;
  const rvSymOk = !!rvSym &&
    rvSym.yMinDelta <= 0.005 && rvSym.yMaxDelta <= 0.005 &&
    rvSym.xMirrorMinDelta <= 0.005 && rvSym.xMirrorMaxDelta <= 0.005;
  if (rvSymOk) pass('ruddervator_symmetry', { ...rvSym, tolerance: 0.005 });
  else fail('ruddervator_symmetry', { ...rvSym, tolerance: 0.005 });

  // ── Three emissive surfaces: engine slot, two chine strips, cockpit HUD.
  //    (Four meshes: the chine strip is built per side.) ──
  if (m.emissiveCount === 4) pass('emissive_surfaces', { count: m.emissiveCount });
  else fail('emissive_surfaces', { count: m.emissiveCount, expected: 4, note: 'engine slot + 2 chine strips + cockpit HUD' });

  // ── Halos. Four: engine, two inlets, cockpit. ──
  if (m.haloCount === 4) pass('halo_count', { count: m.haloCount });
  else fail('halo_count', { count: m.haloCount, expected: 4 });

  // Additive because light ADDS; depthWrite off because a halo must never
  // carve a hole in whatever is behind it.
  const blendOk = m.halos.length > 0 && m.halos.every((h) => h.isSprite && h.additive && h.depthWrite === false);
  if (blendOk) pass('halo_blending', { halos: m.halos });
  else fail('halo_blending', { halos: m.halos, note: 'every halo must be a Sprite with AdditiveBlending and depthWrite:false' });

  // ── Engine ignition: a pure function of altitude, so it adds no clock.
  //    Near-dark on the ramp, full by the end of rotation at 8000ft. ──
  const ramp = await page.evaluate(() => {
    const S = window.Stage;
    const read = (alt) => {
      S.apply(alt, 0);
      return { opacity: S.halos[0].material.opacity, scale: S.halos[0].scale.x };
    };
    return { at0: read(0), at4000: read(4000), at8000: read(8000), at30000: read(30000) };
  });
  const rampOk =
    ramp.at0.opacity < 0.25 &&
    ramp.at8000.opacity > 0.9 &&
    ramp.at4000.opacity > ramp.at0.opacity &&
    ramp.at8000.opacity > ramp.at4000.opacity &&
    Math.abs(ramp.at30000.opacity - ramp.at8000.opacity) < 0.01 &&
    ramp.at8000.scale > ramp.at0.scale;
  if (rampOk) pass('engine_ignition', ramp);
  else fail('engine_ignition', { ...ramp, note: 'must rise monotonically from near-dark at 0 to full by 8000ft, then hold' });

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
