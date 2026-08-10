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
  //    y ~ 1.62. The new airframe's highest point is a RUDDERVATOR tip at
  //    y = 0.5312 — both of them, being true mirrors — with the inlet bumps
  //    next at 0.476 and the canopy at 0.436. It matters which one is tallest:
  //    the ruddervators are the only parts whose height is a design variable
  //    (span 0.55, cant 35deg), so if this check ever tightens, they are what
  //    it will bind on. Anything above 0.8 means a fin survived. ──
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

  // ── Halo VISIBILITY, not halo properties. ────────────────────────────────
  //    `halo_count` and `halo_blending` above assert that four sprites exist
  //    and that each is additive with depthWrite off. Both were green for
  //    weeks while the cockpit halo was ~90% depth-culled: the GLASS canopy is
  //    transparent and three.js defaults transparent materials to
  //    depthWrite TRUE, so the canopy laid down depth at z = 1.777 and
  //    rejected the halo sitting inside it at z = 1.30. Every property was
  //    correct and the light was not there. A property assertion cannot see
  //    that; only the framebuffer can.
  //
  //    So: render the beat twice — halo visible, halo hidden — and difference
  //    the luminance inside the halo's own projected screen box. Alpha is
  //    premultiplied in, because the canvas composites over the CSS sky and a
  //    pixel the aircraft does not cover must not be counted as light.
  //
  //    Both renders and both reads happen inside ONE page.evaluate: the
  //    page's rAF loop recomputes the pose from the real scroll offset, and
  //    the WebGL drawing buffer is not preserved across turns.
  //
  //    Each halo is measured at the beat it exists FOR, not at whichever beat
  //    flatters it. Mean luminance per pixel rather than a raw sum, so the
  //    threshold does not silently depend on viewport size. Measured values
  //    with the canopy fixed: engine 12.8, inlets 14.6 and 14.6, cockpit 3.04.
  //    With GLASS.depthWrite back to true the cockpit reads 0.288 — the
  //    threshold of 1.0 sits ~3x below the worst real halo and ~3.5x above the
  //    broken one, which is what makes this check a regression test rather
  //    than a rubber stamp.
  const HALO_BEATS = [
    // name       index  altitude  why this beat
    ['engine',      0,   36000],  // waypoint 3's astern wide: the nozzle faces the camera
    ['inlet_right', 1,   42500],  // waypoint 3's push-in, camera on the right
    ['inlet_left',  2,   28500],  // waypoint 2's push-in, mirrored to the left
    ['cockpit',     3,   42500],  // the push-in that means "this part was mine"
  ];
  const HALO_MIN_LUM = 1.0;
  const haloVis = await page.evaluate((beats) => {
    const S = window.Stage;
    const { THREE, renderer, camera, halos } = S;
    const cv = renderer.domElement;
    const read2d = document.createElement('canvas');
    const rctx = read2d.getContext('2d', { willReadFrequently: true });

    // Luminance sum inside a screen-space box, read out of a 2D copy of the
    // WebGL canvas in the same turn the render happened.
    const sumIn = (alt, box) => {
      S.apply(alt, 0);
      renderer.render(S.scene, camera);
      read2d.width = cv.width; read2d.height = cv.height;
      rctx.clearRect(0, 0, cv.width, cv.height);
      rctx.drawImage(cv, 0, 0);
      const sx = Math.max(0, Math.round(box.x0)), sy = Math.max(0, Math.round(box.y0));
      const ex = Math.min(cv.width, Math.round(box.x1)), ey = Math.min(cv.height, Math.round(box.y1));
      if (ex <= sx || ey <= sy) return { sum: 0, px: 0 };
      const d = rctx.getImageData(sx, sy, ex - sx, ey - sy).data;
      let sum = 0;
      for (let i = 0; i < d.length; i += 4) {
        const a = d[i + 3] / 255;
        sum += (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) * a;
      }
      return { sum, px: (ex - sx) * (ey - sy) };
    };

    // Where the sprite lands and how wide it is: project its world centre,
    // then a point offset along the camera's right axis by half its scale.
    const boxOf = (alt, h) => {
      S.apply(alt, 0);
      camera.updateMatrixWorld(true);
      S.jet.updateMatrixWorld(true);
      const c = h.getWorldPosition(new THREE.Vector3());
      const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
      const edge = c.clone().addScaledVector(right, h.scale.x / 2);
      const toPx = (v) => {
        const p = v.clone().project(camera);
        return [(p.x * .5 + .5) * cv.width, (-p.y * .5 + .5) * cv.height, p.z];
      };
      const [cx, cy, cz] = toPx(c);
      const [ex] = toPx(edge);
      const r = Math.max(6 * renderer.getPixelRatio(), Math.abs(ex - cx));
      // 1.5x the sprite radius: the spill past the aperture is the point of a
      // halo, so the box has to include air as well as the source.
      return { x0: cx - r * 1.5, y0: cy - r * 1.5, x1: cx + r * 1.5, y1: cy + r * 1.5, behind: cz >= 1 };
    };

    return beats.map(([name, idx, alt]) => {
      const h = halos[idx];
      const box = boxOf(alt, h);
      const on = sumIn(alt, box);
      h.visible = false;
      const off = sumIn(alt, box);
      h.visible = true;
      const contribution = on.sum - off.sum;
      return {
        halo: name, alt, px: on.px, behind: box.behind,
        contribution: Math.round(contribution),
        lumPerPx: on.px ? +(contribution / on.px).toFixed(3) : 0,
      };
    });
  }, HALO_BEATS);
  const haloDark = haloVis.filter((h) => h.lumPerPx < HALO_MIN_LUM || h.px === 0 || h.behind);
  if (haloDark.length === 0) pass('halo_visibility', { halos: haloVis, threshold: HALO_MIN_LUM });
  else fail('halo_visibility', { halos: haloVis, threshold: HALO_MIN_LUM, dark: haloDark.map((h) => h.halo),
    note: 'every halo must measurably add light to the rendered frame at the beat it exists for; a halo whose properties are all correct can still be depth-rejected by transparent geometry in front of it (see GLASS.depthWrite in redesign-v2.html)' });

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
  // The halo scale factor in redesign-v2.html is
  // `baseScale * (.55 + .45 * ignition)`, so scale goes from 0.55x base at
  // ignition=0 (altitude 0) to 1.0x base at ignition=1 (altitude 8000) — a
  // ratio of 1/.55 ≈ 1.8182, i.e. about an 82% increase. A bare
  // `at8000.scale > at0.scale` would pass on any nonzero increase,
  // including a near-flat ramp, so the actual designed ratio is asserted
  // with a real tolerance instead.
  const expectedScaleRatio = (.55 + .45 * 1) / (.55 + .45 * 0); // = 1 / .55
  const scaleRatio = ramp.at0.scale !== 0 ? ramp.at8000.scale / ramp.at0.scale : NaN;
  const scaleRampOk = near(scaleRatio, expectedScaleRatio, 0.05);
  const rampOk =
    ramp.at0.opacity < 0.25 &&
    ramp.at8000.opacity > 0.9 &&
    ramp.at4000.opacity > ramp.at0.opacity &&
    ramp.at8000.opacity > ramp.at4000.opacity &&
    Math.abs(ramp.at30000.opacity - ramp.at8000.opacity) < 0.01 &&
    scaleRampOk;
  const rampDetail = { ...ramp, scaleRatio, expectedScaleRatio, scaleTolerance: 0.05 };
  if (rampOk) pass('engine_ignition', rampDetail);
  else fail('engine_ignition', { ...rampDetail, note: 'must rise monotonically from near-dark at 0 to full by 8000ft, then hold, with halo scale ratio matching baseScale*(.55+.45*ignition)' });

  // ── Parked on the ground, not floating above it or sunk into it. The
  //    ground plane is at y = -1.45 and the designed clearance is 0.10, which
  //    is what the tolerance below is centred on. (An earlier version of this
  //    comment said 0.12, quoting the old tube airframe's clearance; the
  //    assertion has always been 0.10 +-0.03 and the delta measures 0.102.) ──
  const ground = await page.evaluate(() => {
    const S = window.Stage;
    S.apply(0, 0);
    const box = new S.THREE.Box3();
    S.jet.updateMatrixWorld(true);
    S.jet.traverse((o) => { if (o.isMesh) box.expandByObject(o); });
    return { jetY: S.jet.position.y, bellyWorldY: box.min.y, shadowY: -1.45 };
  });
  const clearance = ground.bellyWorldY - ground.shadowY;
  // Tight band around the designed 0.10 clearance, not a wide "somewhere
  // above the ramp" range — a loose band (e.g. 0 < clearance < 0.25) would
  // still pass the pre-fix floating value of 0.182 and never catch a
  // reverted parked keyframe.
  if (near(clearance, 0.10, 0.03)) pass('ground_contact', { ...ground, clearance });
  else fail('ground_contact', { ...ground, clearance, expected: 0.10, tolerance: 0.03, note: 'belly must sit ~0.10 above y=-1.45' });

  // ── Climb attitude. The nose is at +Z, and a rotation of theta about X
  //    sends (0,0,z) to (0, -z*sin(theta), z*cos(theta)) — so POSITIVE
  //    rotation.x is nose DOWN. The JET table's `r[0]` was positive at every
  //    keyframe, including the one commented "rotation", which in aviation is
  //    the word for the nose coming UP on takeoff. Measured before the fix:
  //    at 8,000ft the nose apex sat at world y -0.779 and the centre trailing
  //    point at +0.469, i.e. 12 degrees nose-down at the moment of lift-off,
  //    and tail-high for the entire climb. On a portfolio whose argument is
  //    aerospace training that is the one kind of error that costs something.
  //
  //    Asserted on WORLD positions of the planform's two centreline extremes
  //    rather than on the sign of the table's numbers, because the sign
  //    convention is exactly the thing that was misread. Both points sit on
  //    x = 0, so roll (which the table does use) barely perturbs their height
  //    and cannot flip the comparison.
  const PITCHED = [8000, 18000, 22000, 32000, 36000, 46000, 62000];  // every keyframe with non-zero pitch
  const climb = await page.evaluate((alts) => {
    const S = window.Stage;
    const { THREE, jet } = S;
    const NOSE = new THREE.Vector3(0, .08,  3.40);   // planform nose apex
    const TAIL = new THREE.Vector3(0, .08, -2.60);   // centre trailing point
    const at = (alt) => {
      S.apply(alt, 0);
      jet.updateMatrixWorld(true);
      const n = jet.localToWorld(NOSE.clone());
      const t = jet.localToWorld(TAIL.clone());
      return { alt, pitchDeg: +(jet.rotation.x * 180 / Math.PI).toFixed(2),
               noseY: +n.y.toFixed(3), tailY: +t.y.toFixed(3),
               noseAboveTail: +(n.y - t.y).toFixed(3) };
    };
    // The keyframes, and then the whole climb densely — a sign error at one
    // keyframe would be caught by the first, but a sign error only in the
    // interpolated span between two would not.
    const sweep = [];
    for (let alt = 0; alt <= 62000; alt += 250) sweep.push(at(alt));
    return { beats: alts.map(at), worstSweep: sweep.reduce((a, b) => (b.noseAboveTail < a.noseAboveTail ? b : a)) };
  }, PITCHED);
  //    0.4 units of nose-over-tail is roughly 4 degrees on a 6-unit airframe —
  //    below the shallowest keyframe (5 deg -> 0.523) and far above zero, so
  //    it cannot be satisfied by an aircraft that is merely level.
  const noseDown = climb.beats.filter((b) => b.noseAboveTail < 0.4 || b.pitchDeg >= 0);
  const climbOk = noseDown.length === 0 && climb.worstSweep.noseAboveTail >= -0.001;
  const climbDetail = { beats: climb.beats, worstSweep: climb.worstSweep, minNoseAboveTail: 0.4 };
  if (climbOk) pass('climb_attitude', climbDetail);
  else fail('climb_attitude', { ...climbDetail, noseDown: noseDown.map((b) => b.alt),
    note: 'positive rotation.x is nose DOWN on a +Z nose; every pitched keyframe must put the nose apex above the centre trailing point, and no interpolated point in the climb may be nose-down' });

  if (pageErrors.length) fail('no_page_errors', { pageErrors });
  else pass('no_page_errors', { pageErrors });

  // ── Tier 0. The lowest-capability readers see this instead of the
  //    canvas, so it has to be a silhouette of the aircraft that Tier 2
  //    actually renders. Forced on by emulating reduced motion, which the
  //    tier gate treats as Tier 0 by definition. ──
  {
    const t0 = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const p0 = await t0.newPage();
    await p0.goto(PAGE_URL);
    await p0.waitForTimeout(1500);
    const silo = await p0.evaluate(() => {
      const sym = document.querySelector('#jet path');
      const uses = document.querySelectorAll('svg.silo');
      const first = uses[0];
      const r = first ? first.getBoundingClientRect() : null;
      return {
        tier0: document.documentElement.classList.contains('tier-0'),
        d: sym ? sym.getAttribute('d') : null,
        siloCount: uses.length,
        rendered: r ? r.width > 0 && r.height > 0 : false,
        canvasHidden: getComputedStyle(document.getElementById('scene')).display === 'none',
      };
    });
    await t0.close();

    // The old symbol was a single path built from curve commands (it used
    // `c`); the new planform is a straight-edged polygon. A `d` still
    // containing curve commands means the old shape survived.
    const isPolygon = silo.d && !/[cCsSqQaA]/.test(silo.d);
    const vertexCount = silo.d ? (silo.d.match(/[ML]/g) || []).length : 0;

    // Counting twelve M/L commands proves the path has twelve corners. It does
    // NOT prove they are the RIGHT twelve — any wrong silhouette with the same
    // vertex count sails through, and this is the only thing the lowest-
    // capability readers ever see. So assert the three points that ARE the
    // sawtooth, the one feature the whole planform exists to carry:
    //   208.5 99.9  right notch   (planform  1.30, -1.00)
    //   150   134   centre trailing point (0.00, -2.60)
    //   91.5  99.9  left notch    (planform -1.30, -1.00)
    // Their relationship is the assertion, not just their presence: both
    // notches at the same height, mirrored about x=150, and the centre point
    // BELOW them — that ordering is what makes the outline a W rather than a
    // plain delta, and it is what would silently disappear if the symbol were
    // ever retraced from the wrong coordinates.
    const SAWTOOTH = ['208.5 99.9', '150 134', '91.5 99.9'];
    const sawtoothPoints = silo.d ? SAWTOOTH.filter((p) => silo.d.includes(p)) : [];
    const sawtoothOk = sawtoothPoints.length === SAWTOOTH.length;

    const ok = silo.tier0 && silo.rendered && silo.canvasHidden && isPolygon &&
               vertexCount === 12 && silo.siloCount === 4 && sawtoothOk;
    const detail = { ...silo, isPolygon, vertexCount, expectedVertices: 12, expectedSilos: 4,
                     sawtooth: SAWTOOTH, sawtoothFound: sawtoothPoints, sawtoothOk };
    if (ok) pass('tier0_silhouette', detail);
    else fail('tier0_silhouette', { ...detail, note: 'the Tier-0 path must contain the three sawtooth points; a wrong silhouette with twelve corners would otherwise pass' });
  }

  // ── HiDPI canvas fit. A <canvas> is a REPLACED element: it has an
  //    intrinsic size (its width/height ATTRIBUTES), and `position:fixed;
  //    inset:0` cannot stretch a replaced element the way it stretches a div.
  //    `renderer.setSize(W, H, false)` passes updateStyle=false, so three.js
  //    writes the backing-store size into those attributes — W x devicePixelRatio
  //    — and writes no CSS size at all. At dPR 1 the attribute size happens to
  //    equal the viewport and everything looks fine; at dPR >= 1.5 the canvas
  //    lays out at 1.5-2x the viewport, anchored top-left, and the aircraft
  //    (drawn centred, then pushed right by the lens shift) renders off-screen
  //    entirely. That is most laptops and effectively every phone.
  //
  //    Both the other harnesses run at deviceScaleFactor 1, which is exactly
  //    why neither caught it — and a `position:fixed` oversized element creates
  //    no document overflow, so verify-page.mjs's overflow checks stay green
  //    too. This check therefore has to open its own context at dPR 2. The
  //    assertion is on the LAID-OUT CSS box, not on the attributes: the
  //    attributes are supposed to be 2x (that is the whole point of the
  //    pixel-ratio clamp), the CSS box is what must match the viewport. ──
  {
    const VW = 1440, VH = 900;
    const hd = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
    const ph = await hd.newPage();
    await ph.goto(PAGE_URL);
    await ph.waitForTimeout(6000);
    const fit = await ph.evaluate(() => {
      const c = document.getElementById('scene');
      const r = c.getBoundingClientRect();
      return {
        tier2: document.documentElement.classList.contains('tier-2'),
        dpr: window.devicePixelRatio,
        attr: [c.width, c.height],
        cssBox: [+r.width.toFixed(2), +r.height.toFixed(2)],
        origin: [+r.left.toFixed(2), +r.top.toFixed(2)],
        viewport: [window.innerWidth, window.innerHeight],
      };
    });
    await hd.close();

    const dw = Math.abs(fit.cssBox[0] - fit.viewport[0]);
    const dh = Math.abs(fit.cssBox[1] - fit.viewport[1]);
    const fitOk = fit.tier2 && dw <= 1 && dh <= 1 &&
                  Math.abs(fit.origin[0]) <= 1 && Math.abs(fit.origin[1]) <= 1;
    const fitDetail = { ...fit, widthDelta: +dw.toFixed(2), heightDelta: +dh.toFixed(2), tolerance: 1 };
    if (fitOk) pass('hidpi_canvas_fit', fitDetail);
    else fail('hidpi_canvas_fit', { ...fitDetail, note: 'at deviceScaleFactor 2 the canvas must still lay out at the viewport size; a replaced element needs an explicit CSS width/height, inset:0 alone will not stretch it' });
  }

  // ── Camera framing at every CAM keyframe. Not sampled — the spec is
  //    explicit that all sixteen are checked, because the delta is
  //    proportionally wider in plan than the airframe these distances were
  //    tuned for and the rig rolls up to 15deg during push-ins.
  //
  //    Projects the airframe's eight bounding-box corners through the live
  //    camera and asks whether they land inside the viewport. The aircraft
  //    is ALLOWED to be cropped at push-in beats — that is the whole point
  //    of a push-in — so this reports coverage rather than asserting it,
  //    except for the wide shots, where nothing should be cut off. ──
  const KEYFRAMES = [0, 5000, 8000, 12000, 14500, 18000, 22000, 26000, 28500, 32000, 36000, 40000, 42500, 46000, 50000, 62000];
  const WIDE = new Set([0, 5000, 8000, 18000, 22000, 32000, 36000, 46000, 50000, 62000]);

  //    The eight corners are reported, because they are the cheap summary of
  //    where the airframe sits in frame. They are NOT what the wide-shot
  //    assertion is made against, and that distinction is load-bearing on a
  //    tailless delta: the widest points of the planform (the wingtips, at
  //    z = -1.30) are nowhere near the rearmost point (the centre trailing
  //    point, at z = -2.60, on the centreline). The bounding box's rear
  //    outboard corners — (+-3.12, y, -2.63) — are therefore empty air, and
  //    at the two 8000ft-class wide shots they project ~0.09 outside the
  //    viewport while every real vertex is comfortably inside it. Asserting
  //    on the corners would demand shrinking a wing that is demonstrably in
  //    frame, and could not be satisfied anyway: the shrink needed to clear
  //    an empty corner drives `span` and the wingtip vertex out of the
  //    tolerances `bounding_box` and `planform_outline` already enforce.
  //
  //    So the assertion projects the real vertex set. It costs ~2,300
  //    projections per keyframe, which at sixteen keyframes is nothing next
  //    to the 6s the page already spends booting. ──
  const framing = await page.evaluate((alts) => {
    const S = window.Stage;
    const { THREE, jet, camera } = S;
    return alts.map((alt) => {
      S.apply(alt, 0);
      camera.updateMatrixWorld(true);
      jet.updateMatrixWorld(true);
      const box = new THREE.Box3();
      jet.traverse((o) => { if (o.isMesh) box.expandByObject(o); });
      let inside = 0;
      const pts = [];
      for (let i = 0; i < 8; i++) {
        const v = new THREE.Vector3(
          i & 1 ? box.max.x : box.min.x,
          i & 2 ? box.max.y : box.min.y,
          i & 4 ? box.max.z : box.min.z,
        ).project(camera);
        pts.push([+v.x.toFixed(3), +v.y.toFixed(3)]);
        if (Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1 && v.z < 1) inside++;
      }

      // The silhouette itself. `vertsOutside` is the number of real vertices
      // pushed off the viewport; `margin` is how much room the worst one has
      // left, so a wide shot that is merely *about* to clip is visible in the
      // output rather than reading as a clean pass.
      const v = new THREE.Vector3();
      let vertsOutside = 0, vertsTotal = 0, worstNdc = 0;
      jet.traverse((o) => {
        if (!o.isMesh) return;                 // Sprites billboard; they are not silhouette.
        const p = o.geometry.attributes.position;
        for (let i = 0; i < p.count; i++) {
          v.fromBufferAttribute(p, i);
          o.localToWorld(v);
          v.project(camera);
          vertsTotal++;
          const d = Math.max(Math.abs(v.x), Math.abs(v.y));
          if (d > worstNdc) worstNdc = d;
          if (d > 1 || v.z >= 1) vertsOutside++;
        }
      });
      return {
        alt, cornersInside: inside, ndc: pts,
        vertsTotal, vertsOutside,
        worstNdc: +worstNdc.toFixed(3),
        margin: +(1 - worstNdc).toFixed(3),
      };
    });
  }, KEYFRAMES);

  // A wide shot with any of the airframe off-screen means it is clipped at a
  // beat where it is meant to be seen whole. Per spec 9.3, the fix for that
  // is to shrink the span — NOT to retune keyframes.
  const clippedWide = framing.filter((f) => WIDE.has(f.alt) && f.vertsOutside > 0);
  // Any beat that shows nothing at all is a hard failure regardless.
  const empty = framing.filter((f) => f.vertsOutside === f.vertsTotal);
  if (clippedWide.length || empty.length) {
    fail('camera_framing', { framing, clippedWide: clippedWide.map((f) => f.alt), empty: empty.map((f) => f.alt),
      note: 'wide shots must contain the whole airframe; per spec 9.3 shrink the span rather than retuning CAM' });
  } else {
    pass('camera_framing', { framing });
  }

  // ── Planform PRESENTATION, not planform containment. ────────────────────
  //    `camera_framing` above asks "is the airframe inside the viewport", and
  //    an edge-on aircraft is comfortably inside the viewport. It passed —
  //    with IMPROVED margins — at the exact moment waypoint 1's establishing
  //    shot was rendering the signature as a flat dark sliver 0.8 degrees off
  //    edge-on. Framing and presentation are different properties and no
  //    containment test can see the second one.
  //
  //    The measurement: the angle between the planform's world normal and the
  //    aircraft-to-camera vector, reported as 90deg minus that, i.e. how far
  //    the camera sits ABOVE the wing plane. 0 is edge-on and shows nothing;
  //    90 is straight down the planform. It is measured off the live scene
  //    graph — the jet's actual world quaternion and the camera's actual world
  //    position at that altitude — not re-derived from the CAM/JET tables,
  //    because the tables are the thing under test.
  //
  //    Why these five beats: they are the wide shots a reader actually looks
  //    AT. 18000/32000/46000 are transits (fov 46-48, ~26-30 units out, the
  //    aircraft is a receding speck by design) and 50000/62000 are document
  //    mode, where the airframe is measurably 25/25 occluded by the content
  //    bed. Asserting a presentation floor on beats nobody sees would force
  //    camera moves that buy nothing.
  //
  //    Delivered values are 13.2 / 12.1 / 12.1 / 12.2 / 36.9; the floor is set
  //    at 11.5 so the assertion carries ~0.5deg of headroom rather than
  //    sitting on the design target's exact value. It still bites hard on the
  //    regression it exists for — before the 2026-08-10 camera raise the same
  //    three beats read 10.3 / 0.8 / 8.9, all of them under this floor, with
  //    the establishing shot an order of magnitude under it.
  const PRESENTATION_BEATS = [
    // alt     why this beat is reader-facing
    0,      // parked on the ramp, the first frame of the page
    5000,   // the roll-out wide
    8000,   // waypoint 1's establishing shot — the first clear look at the signature
    22000,  // waypoint 2's establishing shot, mirrored
    36000,  // waypoint 3, astern: the only beat that shows the sawtooth
  ];
  const MIN_PRESENTATION_DEG = 11.5;
  const presentation = await page.evaluate((alts) => {
    const S = window.Stage;
    const { THREE, jet, camera } = S;
    return alts.map((alt) => {
      S.apply(alt, 0);
      jet.updateMatrixWorld(true);
      camera.updateMatrixWorld(true);
      // Planform normal: the wing plane's +Y, carried through the jet's real
      // world rotation (pitch AND roll — roll is non-zero at 22000 and 36000).
      const n = new THREE.Vector3(0, 1, 0)
        .applyQuaternion(jet.getWorldQuaternion(new THREE.Quaternion())).normalize();
      const centre = jet.getWorldPosition(new THREE.Vector3());
      const toCam = camera.getWorldPosition(new THREE.Vector3()).sub(centre).normalize();
      // asin(n . toCam) is the camera's elevation above the wing plane, signed:
      // negative means the camera is UNDER the aircraft looking at its belly,
      // which is a different failure and must not be laundered by an abs().
      const deg = Math.asin(Math.max(-1, Math.min(1, n.dot(toCam)))) * 180 / Math.PI;
      return { alt, presentationDeg: +deg.toFixed(2), camY: +camera.position.y.toFixed(2) };
    });
  }, PRESENTATION_BEATS);
  const edgeOn = presentation.filter((b) => b.presentationDeg < MIN_PRESENTATION_DEG);
  const presDetail = { beats: presentation, floorDeg: MIN_PRESENTATION_DEG };
  if (edgeOn.length === 0) pass('planform_presentation', presDetail);
  else fail('planform_presentation', { ...presDetail, edgeOn: edgeOn.map((b) => b.alt),
    note: 'the planform must present at least 11.5deg of face to the camera at every reader-facing wide beat; camera_framing cannot see this because an edge-on aircraft is still in frame. The lever is p[1] on the CAM keyframe (presentation ~= camera elevation - nose-up pitch); azimuth and extra pitch both make it worse' });

  // ── The camera must never fly through the aircraft. CAM is interpolated
  //    LINEARLY in position, so two keyframes on opposite sides of the
  //    airframe are joined by a straight line that goes through it — a
  //    keyframe at z = +38 followed by one at z = -40 puts the reader inside
  //    the engine bay for a frame. Nothing else in the rig notices: the
  //    keyframes themselves are both perfectly framed, and camera_framing
  //    only samples keyframes, never the segments between them.
  //
  //    Now that one beat (36000) sits astern while its neighbours sit ahead,
  //    two segments cross the aircraft's plane and this stops being a
  //    theoretical concern. Samples every segment densely and asserts the
  //    camera's closest approach to the origin stays outside a sphere that
  //    encloses the whole airframe. ──
  const path = await page.evaluate(() => {
    const S = window.Stage;
    // Enclosing radius, measured rather than assumed.
    S.apply(0, 0);
    const pos = S.jet.position.clone(), rot = S.jet.rotation.clone();
    S.jet.position.set(0, 0, 0); S.jet.rotation.set(0, 0, 0);
    S.jet.updateMatrixWorld(true);
    const box = new S.THREE.Box3();
    S.jet.traverse((o) => { if (o.isMesh) box.expandByObject(o); });
    const radius = box.getBoundingSphere(new S.THREE.Sphere()).radius;
    S.jet.position.copy(pos); S.jet.rotation.copy(rot); S.jet.updateMatrixWorld(true);

    // Walk the whole climb, reading the camera position the rig actually
    // produces rather than re-deriving the interpolation here.
    let minDist = Infinity, minAlt = null;
    for (let alt = 0; alt <= 62000; alt += 50) {
      S.apply(alt, 0);
      const d = S.camera.position.length();
      if (d < minDist) { minDist = d; minAlt = alt; }
    }
    return { radius: +radius.toFixed(3), minDist: +minDist.toFixed(3), minAlt };
  });
  // The closest the rig ever legitimately gets is the push-in at ~4.6 units,
  // so a margin of 1.0 over the enclosing radius is real headroom, not a
  // rubber stamp.
  if (path.minDist > path.radius + 1.0) pass('camera_path_clear', { ...path, required: +(path.radius + 1.0).toFixed(3) });
  else fail('camera_path_clear', { ...path, required: +(path.radius + 1.0).toFixed(3), note: 'CAM interpolates position linearly; the straight line between two keyframes must not enter the airframe' });

  results.measured = m;
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  process.exit(results.pass ? 0 : 1);
}

main().catch((err) => {
  console.error('verify-airframe.mjs crashed:', err);
  process.exit(2);
});
