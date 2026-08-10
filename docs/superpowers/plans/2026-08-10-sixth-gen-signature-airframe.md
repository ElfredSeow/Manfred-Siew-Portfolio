# Sixth-Generation Signature Airframe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the portfolio's signature 3D aircraft with a tailless blended delta that reads as sixth-generation, lit by additive glow halos rather than a post-processing bloom pass.

**Architecture:** All 3D work lives in one function, `buildAircraft()`, inside the module script at the bottom of `redesign-v2.html`. The airframe becomes a single blended planform (one bevelled extruded plate) with a stacked deck and belly for volume, plus control surfaces, propulsion, three unlit emissive surfaces, and four additive sprite halos. A new `window.Stage` handle exposes the scene graph so a Playwright harness can assert geometry facts that pixels cannot prove.

**Tech Stack:** three.js (via unpkg import map, already present), Playwright (already a dev dependency, used by `scripts/verify-page.mjs`), plain ES modules. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-10-sixth-gen-signature-airframe-design.md`

## Global Constraints

Every task's requirements implicitly include these. They come from the spec's §2, §3 and §7.

> **The harness is the source of truth, not the code blocks below.** The `scripts/verify-airframe.mjs` snippets pasted into Tasks 1–10 are the state of that file at authoring time. Several checks have since been tightened by verification passes (`camera_framing` now projects the real vertex set rather than the bounding box's eight corners, which include empty air outboard of the sawtooth; `ground_contact` and `engine_ignition` have tighter bands; `tier0_silhouette` asserts the sawtooth coordinates and not just a command count; `hidpi_canvas_fit`, `camera_path_clear` and `halo_visibility` did not exist). **If you are replaying this plan, do not paste a task's harness block over a newer one** — take the live file and add only what is missing.

- **Bounding box stays 6.00 long × 6.20 across.** Every `CAM` standoff distance was sized against it (`redesign-v2.html:2498-2501`). Tolerance ±0.15.
- **`COCKPIT` stays at exactly `(0, 0.30, 1.25)`** (`redesign-v2.html:2503`). Three push-in beats target it.
- **No new clock.** Everything is a pure function of `Flight.state.alt`, with the existing parked idle yaw as the only exception (`redesign-v2.html:2313`).
- **No post-processing.** No `EffectComposer`, no bloom pass, no render target, no shadow maps.
- **No new dependencies.** No new import-map entries, no second unpkg module.
- **No GLB / no external model.** Procedural only (`redesign-v2.html:2289-2293`).
- **Do not touch** the sky ramp, the altitude mapping, or the tier gate. **No `a` (altitude) value in `CAM` or `JET` may change** — that half is absolute, and the seam altitudes 18000 / 22000 / 32000 / 36000 are load-bearing for the reason `redesign-v2.html:2854-2867` gives. The permitted edits outside `buildAircraft()` and the materials block are the two `JET` ground keyframes, the shadow plane size, the `#jet` SVG symbol, the `window.Stage` handle, and the two items below.
- **Two edits added and author-approved 2026-08-10**, after verification found defects that could not be fixed inside the bounds above. They are recorded here because this plan is treated as **executable, not historical** (see commit `f631ffc`) — left out, a replay of Tasks 8–10 would silently revert both. Both are now held by harness checks, so a replay that did revert them would go red rather than ship.
  - **`CAM`, waypoint 3's wide shot only.** `{ a: 36000, ... }` moved from `p:[8.6, 2.6, 11.0]` to `p:[3.0, 8.5, -12.2]` — astern and high. `a`, `fov`, `roll`, `shift`, `look` unchanged; no other keyframe moved. **Why:** the nose is at +z and all sixteen original keyframes sat forward of it, so the sawtooth trailing edge — the feature the whole planform was designed around — was never once shown to a Tier-2 reader; it read only in the flat Tier-0 silhouette, which is backwards. 36000 is the only beat that is unoccluded (50000 and 62000 are 25/25 covered by opaque content beds), large, and far enough from its neighbours to reach astern without traversing the airframe. Held by `camera_path_clear`, which exists because `CAM` interpolates position linearly and a lone astern keyframe can be perfectly framed at both ends while the straight line between them passes through the engine bay.
  - **`#scene` gains `width:100%; height:100%`** — the only CSS edit this plan permits, and a sizing fix only. A `<canvas>` is a **replaced element**: `position:fixed; inset:0` cannot stretch one. With `renderer.setSize(W, H, false)` writing only the backing-store attributes, the canvas laid out at `devicePixelRatio ×` the viewport — so at dPR ≥ 1.5 the signature rendered off-screen entirely, on most laptops and every phone. Coupled to the `setSize` call; change one, change the other. Held by `hidpi_canvas_fit`, which opens its own context at `deviceScaleFactor: 2` because both existing harnesses run at 1 and neither could see it.
- **No negatively-scaled clones for mirroring** — a negative scale inverts winding and lights wrong (`redesign-v2.html:2411-2412`). Mirror by generating coordinates.
- **Materials, exact values:** `SKIN` `#5C6675` (roughness .52, metalness .24), `DECK` `#474F5C` (roughness .55, metalness .22), **no `TRIM`** (removed 2026-08-10 — the ruddervators were its only user and are graphite `SKIN` now; see the spec's §6), `GLASS` `#33547D` unchanged, `DARK` `#2E3540` (roughness .68, metalness .3), `GLOW_HOT` `#FFB0A5`, `GLOW_EDGE` `#E8685C`.

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `redesign-v2.html` | Modify | The whole page. Two regions change: the `#jet` SVG symbol (~line 861) and the module script's materials + `buildAircraft()` + `apply()` (~lines 2367-2678). |
| `scripts/verify-airframe.mjs` | Create | Playwright harness asserting scene-graph geometry facts. Reports JSON and exits non-zero on failure, matching `verify-page.mjs`'s contract. |
| `scripts/verify-page.mjs` | Unchanged | Existing page-level harness. Must continue to pass. |

The page is deliberately a single self-contained file; do not extract the stage into a module.

---

### Task 1: Scene handle and verification harness

The airframe is built inside a module closure, so nothing outside it can see the scene graph. This task opens a read handle and writes the first failing test: that the aircraft has no vertical fin. The current airframe's fin reaches y ≈ 1.62, so this fails today and is the cleanest possible proof of "tailless."

**Files:**
- Modify: `redesign-v2.html` (add `window.Stage` near the end of `start()`, after `apply` is defined)
- Create: `scripts/verify-airframe.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: `window.Stage = { THREE, scene, jet, halos, camera, renderer, apply, COCKPIT }`. Every later task's test reads this. `halos` is an array — it is empty until Task 7, and must exist as `[]` from this task onward so the harness can read `.length` without a guard. `renderer` is needed by Task 10's screenshot tool, which must force a repaint because `apply()` alone does not set the `dirty` flag the render loop waits on.

- [ ] **Step 1: Write the failing test harness**

Create `scripts/verify-airframe.mjs`:

```js
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
```

- [ ] **Step 2: Run it to confirm it fails for the right reason**

Run: `node scripts/verify-airframe.mjs`

Expected: exit 2, with `tier0_fallback` reporting `hasStage: false` — `window.Stage` does not exist yet. If it instead reports `tier2: false`, headless chromium has no WebGL or unpkg is unreachable; resolve that before continuing, because nothing downstream can be verified without it.

- [ ] **Step 3: Expose the scene handle**

In `redesign-v2.html`, find this block near the end of `start()`:

```js
    root.classList.add('tier-2');
    canvas.style.transition = 'opacity 900ms cubic-bezier(.23,1,.32,1)';
```

Insert immediately **before** `root.classList.add('tier-2')`:

```js
    /* Verification handle. `window.Flight` already establishes that this
       stage publishes its state for other code to read; this publishes the
       scene graph itself, so scripts/verify-airframe.mjs can assert facts a
       screenshot cannot prove — that the bounding box still matches what the
       camera distances were sized against, that the canopy still sits on the
       COCKPIT constant three beats target, that no halo writes depth. It is
       read-only by convention and nothing on the page consumes it. */
    window.Stage = { THREE, scene, jet, halos, camera, renderer, apply, COCKPIT };
```

- [ ] **Step 4: Declare the halos array**

`window.Stage` references `halos`, which does not exist until Task 7. Declare it now so the handle is valid from this task onward. Immediately **after** the line `const jet = buildAircraft();`, add:

```js
    /* Populated in full further down; declared here so the verification
       handle can read .length from the first task onward. */
    const halos = [];
```

- [ ] **Step 5: Run the harness and confirm the new failure**

Run: `node scripts/verify-airframe.mjs`

Expected: exit 1. `tailless` FAILS with `maxY` around 1.6 — the old vertical fin. `bounding_box` PASSES (the old airframe is already ~6 × 6.2). `no_page_errors` PASSES.

This is the correct red state: the harness works, and it is failing on the thing this project exists to change.

- [ ] **Step 6: Commit**

```bash
git add scripts/verify-airframe.mjs redesign-v2.html
git commit -m "Add a geometry harness that can see the scene graph

A screenshot cannot prove that the bounding box still matches what every
camera standoff distance was sized against, or that the canopy still sits
on the COCKPIT constant three push-in beats target. Those are exactly the
things that break the rig silently, so they need a handle rather than an
eye. window.Flight already established that this stage publishes state;
window.Stage publishes the scene graph on the same principle.

Currently red on tailless: the existing fin reaches y=1.62."
```

---

### Task 2: The blended planform

The single decision that does the work. The old airframe is *assembled* — a tube with a wing bolted to it. This replaces the fuselage, nose cone and wing with one continuous outline, and gives it the sawtooth trailing edge that carries the whole futuristic read at silhouette size.

**Files:**
- Modify: `redesign-v2.html`, inside `buildAircraft()`
- Modify: `scripts/verify-airframe.mjs` (add the planform checks)

**Interfaces:**
- Consumes: `plate(pts, thickness, mat)` from `redesign-v2.html:2381`, unchanged. It already bevels every edge, which is what stops flat plates reading as folded cardboard.
- Produces: module-scope constants `HALF`, `PLANFORM`, and the function `mirrorOutline(half)`. Tasks 3 and 9 reuse `mirrorOutline`; Task 9 reuses `HALF`.

- [ ] **Step 1: Add the planform checks to the harness**

In `scripts/verify-airframe.mjs`, inside `measure()`, add this immediately before the `const out = {` line:

```js
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
```

Then add these fields inside the `out` object, after `meshCount`:

```js
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
```

Now add the assertions in `main()`, after the `bounding_box` check:

```js
  // ── Sawtooth trailing edge. The one feature that reads as
  //    "next generation" instantly and survives being shrunk to a
  //    silhouette. Every defining point of the outline is checked. ──
  const st = m.sawtooth;
  const stOk = st.notchR && st.notchL && st.centreTE && st.tipR && st.tipL && st.noseApex;
  if (stOk) pass('planform_outline', st); else fail('planform_outline', st);

  const symOk = m.symmetryError !== null && m.symmetryError <= 0.02;
  if (symOk) pass('symmetry', { symmetryError: m.symmetryError, tolerance: 0.02 });
  else fail('symmetry', { symmetryError: m.symmetryError, tolerance: 0.02 });
```

- [ ] **Step 2: Run it to verify the new checks fail**

Run: `node scripts/verify-airframe.mjs`

Expected: exit 1. `planform_outline` FAILS with every field `false` — the old wing has none of these points. `symmetry` passes (the old wing is symmetric too). `tailless` still fails.

- [ ] **Step 3: Add the outline constants**

In `redesign-v2.html`, immediately **after** the `plate()` function's closing brace (`redesign-v2.html:2391`) and **before** `function buildAircraft()`, insert:

```js
    /* ── PLANFORM ──────────────────────────────────────────────────────
       The airframe is one continuous outline: nose, chine and wing with no
       seam anywhere. That single property is most of what separates a
       modern low-observable airframe from a 1970s fighter, and it costs
       less geometry than the tube-plus-bolted-wing it replaces.

       [x, z] pairs in plan view. plate() consumes them as a 2D shape and
       rotateX(PI/2) turns +Y into +Z, so the second number is fore/aft.

       Points 5-7 are the sawtooth trailing edge. It is the highest-value
       feature here: the W-notch reads as "next generation" instantly and
       is the one cue that survives being shrunk to the Tier-0 silhouette.

       Leading-edge sweep from the chine flare to the tip is ~48deg and is
       held identical on both sides. Parallel edge alignment is the rule
       real low-observable planforms obey, and the eye registers it even
       when the viewer cannot name it. */
    const HALF = [
      [0.00,  3.40],   // nose apex
      [0.34,  2.55],   // chine origin
      [0.68,  1.60],   // chine flare
      [3.10, -1.30],   // wingtip, leading edge
      [2.92, -1.72],   // wingtip, trailing edge
      [1.30, -1.00],   // sawtooth notch
      [0.00, -2.60],   // centre trailing point
    ];

    /* Mirror in coordinates, never with a negative scale. A negatively
       scaled clone inverts its winding and lights wrong — the same reason
       the previous wing was built as one symmetric planform rather than a
       mirrored pair. First and last points sit on the centreline and are
       not duplicated. */
    function mirrorOutline(half) {
      return half.concat(half.slice(1, -1).reverse().map(([x, z]) => [-x, z]));
    }

    const PLANFORM = mirrorOutline(HALF);
```

- [ ] **Step 4: Replace the fuselage, cone and wing with the planform**

Inside `buildAircraft()`, delete these three blocks entirely — the lathe fuselage, the nose cone, and the wing (`redesign-v2.html:2396-2416`):

```js
      // Fuselage: a lathe profile spun about Y, then tipped to lie along Z.
      // ... through ...
      jet.add(wing);
```

Replace them with:

```js
      /* One plate, and it is the whole aeroplane in plan. Thickness 0.16,
         centred on y=0, so the planform occupies y in [-0.08, +0.08].
         plate() bevels every edge, which is what gives each one a highlight
         to catch and stops the airframe reading as folded cardboard. */
      const planform = plate(PLANFORM, .16, SKIN);
      planform.geometry.rotateX(Math.PI / 2);
      planform.geometry.translate(0, .08, 0);
      jet.add(planform);
```

- [ ] **Step 5: Run the harness**

Run: `node scripts/verify-airframe.mjs`

Expected: `planform_outline` PASSES (all six points found). `symmetry` PASSES. `bounding_box` PASSES — length 6.00, span 6.20. `tailless` still FAILS: the fin is removed in Task 4.

- [ ] **Step 6: Commit**

```bash
git add redesign-v2.html scripts/verify-airframe.mjs
git commit -m "Replace tube, cone and wing with one blended planform

The old airframe was assembled - a lathe-spun fuselage with a wing bolted
to the side of it. Blending nose, chine and wing into a single continuous
outline is most of what separates a modern airframe from a 1970s one, and
it costs less geometry than the three parts it replaces.

The sawtooth trailing edge is the point of the exercise: it is the cue
that reads as next-generation instantly, and the only one that survives
being shrunk to the Tier-0 silhouette.

Mirrored in coordinates rather than by negative scale, for the winding
reason the previous wing comment already gave."
```

---

### Task 3: Volume — deck and belly

A single plate is a flat sheet. At the wide shot it reads as paper, and the contact shadow has nothing to sit under. Two more stacked bevelled plates give the airframe a body without introducing a fuselage.

**Files:**
- Modify: `redesign-v2.html`, inside `buildAircraft()`
- Modify: `scripts/verify-airframe.mjs`

**Interfaces:**
- Consumes: `mirrorOutline(half)` and `plate()` from Task 2. `DECK` material from the Global Constraints — it does not exist yet and is created in Task 5; **until then use `SKIN` and switch it in Task 5.**
- Produces: nothing later tasks read by name.

- [ ] **Step 1: Add the volume check**

In `scripts/verify-airframe.mjs`, add to the `out` object after `symmetryError`:

```js
    bellyY: box.min.y,
```

And in `main()`, after the `symmetry` check:

```js
  // ── Volume. A lifting body has an underside; without one the airframe is
  //    a flat sheet at the wide shot and the contact shadow sits under
  //    nothing. Belly target -0.30; bevel carries it a further ~0.018, and
  //    Task 8's parked keyframe is derived from this number. ──
  const bellyOk = near(m.bellyY, -0.30, 0.04);
  if (bellyOk) pass('belly_depth', { bellyY: m.bellyY, expected: -0.30, tolerance: 0.04 });
  else fail('belly_depth', { bellyY: m.bellyY, expected: -0.30, tolerance: 0.04 });
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node scripts/verify-airframe.mjs`

Expected: `belly_depth` FAILS with `bellyY` around −0.08 — the bare planform's underside, nowhere near −0.30.

- [ ] **Step 3: Add the deck and belly outlines**

In `redesign-v2.html`, immediately after `const PLANFORM = mirrorOutline(HALF);`, add:

```js
    /* Volume, in two stacked plates rather than a modelled fuselage. Two
       bevelled plates read as faceted-but-blended for a few hundred
       triangles, which is the whole reason this airframe can be procedural
       and still not look procedural.

       Named _OUTLINE because Task 5 introduces a MATERIAL called DECK and
       these are coordinate arrays. Do not shorten the names. */
    const DECK_OUTLINE = mirrorOutline([
      [0.00,  2.30],
      [0.42,  1.30],
      [0.66,  0.20],
      [0.58, -1.20],
      [0.00, -2.15],
    ]);

    const BELLY_OUTLINE = mirrorOutline([
      [0.00,  2.60],
      [0.40,  1.60],
      [0.72,  0.10],
      [0.66, -1.30],
      [0.00, -2.30],
    ]);
```

- [ ] **Step 4: Build the deck and belly**

Inside `buildAircraft()`, immediately after the `jet.add(planform);` line, add:

```js
      /* Dorsal deck: volume behind the cockpit, blending into the buried
         engine. Occupies y in [0.06, 0.36] — a deliberate 0.02 overlap into
         the planform, so no seam can open between them.
         SKIN for now; Task 5 gives the deck its own darker material. */
      const deck = plate(DECK_OUTLINE, .30, SKIN);
      deck.geometry.rotateX(Math.PI / 2);
      deck.geometry.translate(0, .36, 0);
      jet.add(deck);

      /* Belly: y in [-0.30, -0.08]. Without it the airframe is a flat sheet
         at the wide shot, and the contact shadow has nothing to sit under.
         The parked keyframe in the JET table is derived from this number. */
      const belly = plate(BELLY_OUTLINE, .22, SKIN);
      belly.geometry.rotateX(Math.PI / 2);
      belly.geometry.translate(0, -.08, 0);
      jet.add(belly);
```

- [ ] **Step 5: Run the harness**

Run: `node scripts/verify-airframe.mjs`

Expected: `belly_depth` PASSES with `bellyY` ≈ −0.318 (the extra 0.018 is the bevel, which the ±0.04 tolerance covers). `bounding_box`, `planform_outline`, `symmetry` all still PASS. `tailless` still FAILS.

- [ ] **Step 6: Commit**

```bash
git add redesign-v2.html scripts/verify-airframe.mjs
git commit -m "Give the airframe a body: dorsal deck and belly

One plate is a flat sheet - it reads as paper at the wide shot, and the
contact shadow sits under nothing. Two more stacked bevelled plates give
it volume without reintroducing a fuselage, which is the thing the
blended planform exists to avoid.

The belly's -0.30 is load-bearing: the parked keyframe is derived from
it in a later task."
```

---

### Task 4: Strip the old empennage, add control surfaces and propulsion

This is the task that makes `tailless` go green. Everything identifiably twentieth-century comes off — fin, tailplane, underslung intakes — and is replaced with canted ruddervators, top-mounted inlets, and a flat slot nozzle.

**Files:**
- Modify: `redesign-v2.html`, inside `buildAircraft()`
- Modify: `scripts/verify-airframe.mjs`

**Interfaces:**
- Consumes: `plate()`, `DARK`, `SKIN`.
- Produces: nothing later tasks read by name. Task 7 places its halos NEAR — deliberately not ON — the geometry fixed here. Do not confuse the two sets of numbers: the **inlet mouths** sit at `(±0.52, 0.32, 1.43)` and the **slot nozzle** at `(0, 0.10, −2.45)` with depth 0.35 (aft face −2.625); the **halos** sit slightly proud of those, at `(±0.52, 0.32, 1.46)` and `(0, 0.10, −2.66)`, so the light appears to spill out of the aperture rather than being co-planar with it.

- [ ] **Step 1: Add the propulsion and control-surface checks**

In `scripts/verify-airframe.mjs`, add to the `out` object after `bellyY`:

```js
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
```

And in `main()`, after `belly_depth`:

```js
  // ── Propulsion and control surfaces. ──
  if (m.inletsAboveDeck === 2) pass('top_mounted_inlets', { count: m.inletsAboveDeck });
  else fail('top_mounted_inlets', { count: m.inletsAboveDeck, expected: 2, note: 'two inlet bumps above the deck line, outboard of centre, forward of midpoint' });

  if (m.ruddervators === 2) pass('canted_ruddervators', { count: m.ruddervators });
  else fail('canted_ruddervators', { count: m.ruddervators, expected: 2 });
```

- [ ] **Step 2: Run it to verify the new checks fail**

Run: `node scripts/verify-airframe.mjs`

Expected: `top_mounted_inlets` FAILS with count 0 — the old intakes are at y = −0.08, below the threshold. `canted_ruddervators` FAILS with count 0. `tailless` still FAILS.

- [ ] **Step 3: Delete the old empennage and intakes**

Inside `buildAircraft()`, delete these four blocks entirely — the tailplane, the vertical fin, the old cylindrical nozzle, and both underslung intakes (`redesign-v2.html:2418-2443`, as they stand after Task 2's edits):

```js
      const tail = plate([[-1.35,-2.7], ... ]);
      // ... through ...
      [-1, 1].forEach(side => {
        const intake = ...
        jet.add(intake);
      });
```

Keep the canopy block — Task 5 reshapes it.

- [ ] **Step 4: Add the canted ruddervators**

In the space the deleted blocks left, add:

```js
      /* Canted ruddervators. No vertical fin at all is the single most
         legible "this is not a current-generation fighter" statement
         available, so these have to do the fin's job while staying small
         enough that the silhouette still reads tailless.

         Built per side rather than mirrored, for the winding reason. The
         shape's [z, y] pairs become fore/aft and height after rotateY, the
         same construction the old vertical fin used.

         SKIN, not an accent colour. A saturated surface here projects
         near-vertical at the low front-quarter beats and reads as a FIN
         however it is canted, which destroys the tailless statement this
         airframe exists to make. See the spec's §6. */
      [-1, 1].forEach(side => {
        const rv = plate([[-0.95, 0], [-1.60, .55], [-1.85, .55], [-1.65, 0]], .08, SKIN);
        rv.geometry.rotateY(-Math.PI / 2);
        // Cant 35deg outward from vertical: the tip leans away from centre.
        rv.geometry.rotateZ(side * -35 * Math.PI / 180);
        rv.position.set(side * 2.35, .04, 0);
        jet.add(rv);
      });
```

- [ ] **Step 5: Add the top-mounted inlets**

```js
      /* Inlets on TOP of the shoulders, hidden from below. Inlets slung
         underneath — which is what this airframe had — is the exact
         opposite of the grammar being invoked. A smooth bump rather than a
         cylinder: there is no separate duct, it is a swelling of the deck. */
      [-1, 1].forEach(side => {
        const bump = new THREE.Mesh(new THREE.SphereGeometry(.30, 18, 12), SKIN);
        bump.scale.set(.85, .52, 1.75);
        bump.position.set(side * .52, .32, .95);
        jet.add(bump);

        const mouth = new THREE.Mesh(new THREE.CircleGeometry(.17, 16), DARK);
        mouth.scale.set(1, .62, 1);
        mouth.position.set(side * .52, .32, 1.44);
        jet.add(mouth);
      });
```

- [ ] **Step 6: Add the slot nozzle**

```js
      /* A flat, wide exhaust slot rather than a round cylinder. The
         contrast with the old nozzle is deliberate and is doing as much
         work as the sawtooth: round exhausts belong to the airframe this
         one replaces. */
      const nozzle = new THREE.Mesh(new THREE.BoxGeometry(1.05, .16, .35), DARK);
      nozzle.position.set(0, .10, -2.45);
      jet.add(nozzle);
```

- [ ] **Step 7: Run the harness**

Run: `node scripts/verify-airframe.mjs`

Expected: **`tailless` now PASSES**, with `maxY` ≈ 0.48 (the inlet bumps). `top_mounted_inlets` PASSES with 2. `canted_ruddervators` PASSES with 2. `bounding_box`, `planform_outline`, `symmetry`, `belly_depth` all still PASS.

If `bounding_box` now fails on span, the ruddervators are pushing past 3.10 — reduce their x offset rather than changing the planform, which the camera distances depend on.

- [ ] **Step 8: Commit**

```bash
git add redesign-v2.html scripts/verify-airframe.mjs
git commit -m "Remove the fin, tailplane and slung intakes; go tailless

No vertical fin at all is the single most legible statement available
that this is not a current-generation aircraft, so the fin goes and small
canted ruddervators take over its job while staying under the silhouette
threshold.

Intakes move from slung underneath to buried on top of the shoulders -
inlets visible from below is the exact opposite of the grammar this
airframe is invoking. The round exhaust becomes a flat slot for the same
reason.

The tailless check goes green: max height drops from 1.62 to 0.48."
```

---

### Task 5: Materials — graphite, and a canopy that is not a fighter bubble

**Files:**
- Modify: `redesign-v2.html`, the materials block (`redesign-v2.html:2367-2375`) and the canopy in `buildAircraft()`
- Modify: `scripts/verify-airframe.mjs`

**Interfaces:**
- Consumes: nothing new.
- Produces: materials `SKIN`, `DECK`, `GLASS`, `DARK`, and (created here, used in Task 6) `GLOW_HOT`, `GLOW_EDGE`. There is deliberately no `TRIM`.

- [ ] **Step 1: Add the material and canopy checks**

In `scripts/verify-airframe.mjs`, add to the `out` object after `ruddervators`:

```js
    // Read the skin colour off the planform itself — the mesh already
    // identified above by bounding-box area — rather than guessing at it
    // with a vertex-count threshold that would silently pick a different
    // mesh if the geometry were ever retuned.
    skinHex: planform ? planform.material.color.getHexString() : null,
```

And in `main()`, after `canted_ruddervators`:

```js
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
```

- [ ] **Step 2: Run it to verify these fail**

Run: `node scripts/verify-airframe.mjs`

Expected: `skin_graphite` FAILS with `dce2e9`. `canopy_profile` FAILS with scale `[0.85, 0.72, 2.1]`. `canopy_on_cockpit` PASSES already — the canopy has always been at `(0, .3, 1.25)`, and this check exists to make sure it *stays* there.

**Do not expect `tailless`'s maxY to drop when you reshape the canopy.** Measurement during Task 4's review established that the tallest point on the airframe is the *ruddervator* at y ≈ 0.554, not the canopy at 0.545. Flattening the canopy moves it to ~0.436 and changes maxY by nothing. The 0.8 threshold has ample margin either way; this note exists only so the number not moving does not read as a failed edit.

- [ ] **Step 3: Replace the materials block**

In `redesign-v2.html`, replace the whole materials block at `redesign-v2.html:2367-2375` with:

```js
    /* Model space: nose points +Z, up is +Y, length ~6 units, origin at the
       wing root so the aircraft rotates about something plausible.

       GRAPHITE, not the pale skin this airframe used to wear. Two reasons,
       and they are the same reason: a dark surface is what lets an emissive
       surface read as glow rather than as paint, and real glow is what lets
       the airframe be dark without vanishing against the near-navy sky at
       altitude. Hedging either one weakens both. The halos further down are
       what make this safe. */
    const SKIN  = new THREE.MeshStandardMaterial({ color: 0x5C6675, roughness: .52, metalness: .24 });
    const DECK  = new THREE.MeshStandardMaterial({ color: 0x474F5C, roughness: .55, metalness: .22 });
    /* There is deliberately NO painted accent material here. TRIM (#B84630)
       used to live at this line and the ruddervators were its only user; that
       made them read as a vertical fin at the low front-quarter beats. The
       accent now reaches the airframe only as emitted light, GLOW_HOT and
       GLOW_EDGE below. See the spec's §6. */
    /* Low metalness on the canopy, deliberately. Without an environment map a
       metallic surface has nothing to reflect and renders as a black blob. A
       tinted dielectric picks up the hemisphere light instead and reads as
       glass without needing anything to reflect. */
    const GLASS = new THREE.MeshStandardMaterial({ color: 0x33547D, roughness: .2, metalness: .08,
                                                   transparent: true, opacity: .82 });
    /* Darkened from its old value. It is no longer just a shading colour —
       it is the surround that makes the glow read as light. */
    const DARK  = new THREE.MeshStandardMaterial({ color: 0x2E3540, roughness: .68, metalness: .3  });

    /* Unlit, deliberately. MeshBasicMaterial ignores scene lights, so these
       hold constant brightness while the sun dims from 2.1 to 1.25 across
       the climb — the glow gets relatively STRONGER as the sky ramps to
       navy. That is free, and it is the right direction: the airframe
       should look most alive at altitude. */
    const GLOW_HOT  = new THREE.MeshBasicMaterial({ color: 0xFFB0A5 });
    const GLOW_EDGE = new THREE.MeshBasicMaterial({ color: 0xE8685C });
```

- [ ] **Step 4: Switch the deck to its own material**

In `buildAircraft()`, change the deck plate from `SKIN` to `DECK`:

```js
      const deck = plate(DECK_OUTLINE, .30, DECK);
```

Leave the belly on `SKIN`.

- [ ] **Step 5: Reshape the canopy**

Replace the canopy block in `buildAircraft()` with:

```js
      /* Low and faired, not a 1970s fighter bubble — flatter and longer.
         Its centre must stay at exactly (0, .30, 1.25), because that is the
         COCKPIT constant every waypoint's push-in beat targets. Move it and
         three camera beats land on empty air with nothing complaining. */
      const canopy = new THREE.Mesh(new THREE.SphereGeometry(.34, 24, 16), GLASS);
      canopy.scale.set(.62, .40, 1.55);
      canopy.position.set(0, .30, 1.25);
      jet.add(canopy);
```

- [ ] **Step 6: Run the harness**

Run: `node scripts/verify-airframe.mjs`

Expected: all checks PASS — `skin_graphite`, `canopy_profile`, `canopy_on_cockpit`, `tailless`, `bounding_box`, `planform_outline`, `symmetry`, `belly_depth`, `top_mounted_inlets`, `canted_ruddervators`.

- [ ] **Step 7: Commit**

```bash
git add redesign-v2.html scripts/verify-airframe.mjs
git commit -m "Graphite skin, low-profile canopy, and the glow materials

The pale skin was chosen for an airframe that had no light of its own. A
dark surface is what lets emissive read as glow rather than paint, and
the halos in the next task are what let the airframe be dark without
vanishing against the navy sky. Those are one decision, not two.

The canopy flattens and lengthens out of its fighter-bubble proportions
but its centre does not move by a thousandth - it is the COCKPIT constant
three push-in beats target, and the harness now asserts that."
```

---

### Task 6: Emissive surfaces

Three unlit surfaces on the airframe. On their own they will look like orange paint — that is expected, and Task 7 is what turns them into light. Do not adjust anything here to compensate for it.

**Files:**
- Modify: `redesign-v2.html`, inside `buildAircraft()`
- Modify: `scripts/verify-airframe.mjs`

**Interfaces:**
- Consumes: `GLOW_HOT`, `GLOW_EDGE` from Task 5; `HALF` from Task 2.
- Produces: nothing later tasks read by name.

- [ ] **Step 1: Add the emissive check**

In `scripts/verify-airframe.mjs`, add to the `out` object:

```js
    // Unlit surfaces. MeshBasicMaterial has no `lights` uniform at all,
    // which is the property being relied on: these must not dim when the
    // sun does.
    emissiveCount: solids.filter((mesh) => mesh.material && mesh.material.isMeshBasicMaterial).length,
```

And in `main()`:

```js
  // ── Three emissive surfaces: engine slot, two chine strips, cockpit HUD.
  //    (Four meshes: the chine strip is built per side.) ──
  if (m.emissiveCount === 4) pass('emissive_surfaces', { count: m.emissiveCount });
  else fail('emissive_surfaces', { count: m.emissiveCount, expected: 4, note: 'engine slot + 2 chine strips + cockpit HUD' });
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node scripts/verify-airframe.mjs`

Expected: `emissive_surfaces` FAILS with count 0.

- [ ] **Step 3: Add the engine slot glow**

In `buildAircraft()`, immediately after the `jet.add(nozzle);` line:

```js
      /* The hot core of the slot, sitting just aft of the nozzle's mouth so
         the DARK box surrounds it on every side. That surround is not
         decoration — without a bloom pass, an emissive surface reads as
         light only by contrast with what is next to it. */
      const slot = new THREE.Mesh(new THREE.PlaneGeometry(.92, .11), GLOW_HOT);
      slot.rotation.y = Math.PI;
      slot.position.set(0, .10, -2.63);
      jet.add(slot);
```

- [ ] **Step 4: Add the chine light strips**

```js
      /* Light strips along the chine edges. These are what make the
         airframe read as lit from within rather than merely angular.

         Endpoints are derived from HALF[2] and HALF[3] rather than typed
         again, so the strip cannot drift off the edge it is tracing if the
         planform is ever retuned. */
      [-1, 1].forEach(side => {
        const a = new THREE.Vector3(side * HALF[2][0], .085, HALF[2][1]);
        const b = new THREE.Vector3(side * HALF[3][0], .085, HALF[3][1]);
        const strip = new THREE.Mesh(new THREE.BoxGeometry(.05, .022, a.distanceTo(b)), GLOW_EDGE);
        strip.position.copy(a).lerp(b, .5);
        strip.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
        jet.add(strip);
      });
```

- [ ] **Step 5: Add the cockpit instrument glow**

```js
      /* The one light on this airframe with narrative work to do. The
         camera's push-in lands on the cockpit at every waypoint, and that
         beat is the page's way of saying "this part was mine" — so the
         cockpit is lit, and it is only legible during that beat, which is
         the correct amount of visibility for it. */
      const hud = new THREE.Mesh(new THREE.PlaneGeometry(.26, .12), GLOW_HOT);
      hud.rotation.x = -Math.PI / 2.4;
      hud.position.set(0, .30, 1.30);
      jet.add(hud);
```

- [ ] **Step 6: Run the harness**

Run: `node scripts/verify-airframe.mjs`

Expected: `emissive_surfaces` PASSES with 4. Everything else still PASSES.

- [ ] **Step 7: Look at it, and expect to be underwhelmed**

Open `redesign-v2.html` in a browser. The orange areas will read as **flat paint**, not as light. This is the expected intermediate state and is the entire reason Task 7 exists. Do not brighten the colours, enlarge the strips, or add a light to compensate — every one of those makes Task 7 worse.

- [ ] **Step 8: Commit**

```bash
git add redesign-v2.html scripts/verify-airframe.mjs
git commit -m "Add the three emissive surfaces

Engine slot, chine strips, cockpit HUD - all MeshBasicMaterial, so they
ignore scene lights and hold constant brightness while the sun dims
across the climb. The glow therefore gets relatively stronger as the sky
ramps to navy, which is the right direction.

The cockpit glow is the only one with narrative work to do: the push-in
beat means 'this part was mine', so that is the part that is lit.

These read as flat paint at this commit. That is expected - the halos in
the next commit are what turn them into light."
```

---

### Task 7: Halos — the fix that makes glow glow

Bloom only ever simulates light spilling into the air around a bright source. This draws that spill directly, with additive radial-gradient billboards. The page already builds a canvas radial gradient for the contact shadow (`redesign-v2.html:2455-2461`) for the same reason: get the optical result without the machinery.

**Files:**
- Modify: `redesign-v2.html`, inside `start()` and inside `apply()`
- Modify: `scripts/verify-airframe.mjs`

**Interfaces:**
- Consumes: the `halos` array declared in Task 1; the inlet and nozzle positions fixed in Task 4; `smooth(t)` at `redesign-v2.html:2554`.
- Produces: each halo carries `userData.baseScale`, which `apply()` reads to scale it. Task 10 checks the ignition ramp through `Stage.apply(alt, 0)`.

- [ ] **Step 1: Add the halo checks**

In `scripts/verify-airframe.mjs`, add to the `out` object:

```js
    halos: S.halos.map((h) => ({
      isSprite: !!h.isSprite,
      additive: h.material.blending === THREE.AdditiveBlending,
      depthWrite: h.material.depthWrite,
      baseScale: h.userData.baseScale ?? null,
    })),
```

And in `main()`:

```js
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
```

- [ ] **Step 2: Run it to verify these fail**

Run: `node scripts/verify-airframe.mjs`

Expected: `halo_count` FAILS with 0. `halo_blending` FAILS. `engine_ignition` FAILS (reading `S.halos[0]` of an empty array throws, which the harness reports as a crash — that is an acceptable red state for this step; it resolves at Step 5).

- [ ] **Step 3: Build the halo texture and the sprites**

In `redesign-v2.html`, immediately after the `const halos = [];` line added in Task 1, replace that line with the full block:

```js
    /* ── HALOS ─────────────────────────────────────────────────────────
       An emissive surface with nothing else done to it is a flat bright
       colour. It reads as LIGHT only when light appears to spill off it
       into the surrounding air, and that spill is the entire perceptual
       content of a bloom pass.

       So draw it directly. Additive radial-gradient billboards at each
       glow source is how real-time rendering did this for a decade before
       post-processing was affordable, and it produces the effect rather
       than an approximation of it.

       This is not a foreign technique in this file: the contact shadow
       below builds a 128x128 canvas radial gradient and maps it onto a
       plane for exactly the same reason — obtain the optical result
       without paying for the machinery that would normally produce it.
       Same pattern, gradient inverted, blending additive.

       The alternative was EffectComposer + UnrealBloomPass, which would
       pull a second unpkg module, force a render target, complicate the
       transparent-canvas compositing this page depends on, and undo the
       stage's whole performance story. Four sprites cost 24 triangles. */
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowCanvas.height = 128;
    const gctx = glowCanvas.getContext('2d');
    const glowGrad = gctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    /* These three stops ARE GLOW_HOT and GLOW_EDGE, written as rgba because
       a canvas gradient cannot take a hex constant. Centre #FFB0A5, falloff
       #E8685C to transparent. If the palette moves again, these move with
       it — they are the easiest values in the file to miss, because a grep
       for the hex will not find them. */
    glowGrad.addColorStop(0,   'rgba(255,176,165,1)');    // #FFB0A5 — GLOW_HOT
    glowGrad.addColorStop(.35, 'rgba(232,104,92,.55)');   // #E8685C — GLOW_EDGE
    glowGrad.addColorStop(1,   'rgba(232,104,92,0)');     // #E8685C, faded out
    gctx.fillStyle = glowGrad;
    gctx.fillRect(0, 0, 128, 128);
    const GLOW_TEX = new THREE.CanvasTexture(glowCanvas);

    function halo(size, x, y, z) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: GLOW_TEX,
        blending: THREE.AdditiveBlending,
        depthWrite: false,      // a halo must never carve a hole in what is behind it
        transparent: true,
        opacity: 1,
      }));
      sprite.scale.set(size, size, 1);
      sprite.position.set(x, y, z);
      sprite.userData.baseScale = size;
      return sprite;
    }

    /* Positions match the emissive surfaces they belong to: the nozzle at
       the centre trailing point, the inlet mouths on the shoulders, and the
       cockpit. Sprites are camera-facing, so these scale correctly through
       the push-in without any per-beat handling. */
    const halos = [
      halo(1.75,    0, .10, -2.66),   // engine slot
      halo( .42,  .52, .32,  1.46),   // inlet, right
      halo( .42, -.52, .32,  1.46),   // inlet, left
      halo( .30,    0, .32,  1.30),   // cockpit
    ];
    halos.forEach(h => jet.add(h));
```

- [ ] **Step 4: Add the ignition ramp**

In `apply()`, immediately after the `jet.rotation.set(...)` call and before `shadow.position.set(...)`, add:

```js
      /* Engine ignition. The engine lights as the aircraft rotates: near
         dark on the ramp, full by the end of rotation at 8,000ft.

         This is a pure function of altitude and introduces NO second clock,
         which is the constraint everything on this stage obeys. It is also
         the one place the glow gets to do something rather than sit there.
         To remove it, hold `ignition` at 1 — nothing else depends on it. */
      const ignition = smooth(Math.min(1, Math.max(0, alt / 8000)));
      const lit = .12 + .88 * ignition;
      for (const h of halos) {
        h.material.opacity = lit;
        const s = h.userData.baseScale * (.55 + .45 * ignition);
        h.scale.set(s, s, 1);
      }
```

- [ ] **Step 5: Run the harness**

Run: `node scripts/verify-airframe.mjs`

Expected: `halo_count` PASSES with 4. `halo_blending` PASSES. `engine_ignition` PASSES — opacity 0.12 at altitude 0, 1.0 at 8000, unchanged at 30000. Every earlier check still PASSES.

- [ ] **Step 6: Look at it, and compare against Task 6**

Open the page. The orange should now read as **light spilling past the airframe's silhouette edge**, not as paint filling an aperture. Scroll from the top: the engine should visibly light as the aircraft rotates.

If the halos appear as dark or grey rectangles, additive blending is compositing wrongly against the transparent canvas — this is spec §9.2, the design's one real unknown. The fallback is `THREE.NormalBlending` with a hotter centre stop. Record which was used.

- [ ] **Step 7: Commit**

```bash
git add redesign-v2.html scripts/verify-airframe.mjs
git commit -m "Draw the glow instead of post-processing it

Bloom only ever simulates light spilling into the air around a source.
Additive radial-gradient billboards draw that spill directly - which is
how real-time rendering did it for a decade before post-processing was
affordable, and it produces the effect rather than approximating it.

Not a foreign technique here: the contact shadow already builds a canvas
radial gradient onto a plane for the same reason. Same pattern, gradient
inverted, blending additive. EffectComposer would have cost a second
unpkg module, a render target, and the transparent-canvas compositing
this page depends on. Four sprites cost 24 triangles.

The engine lights as the aircraft rotates - driven by altitude alone, so
no second clock appears."
```

---

### Task 8: Ground contact — parked keyframes and the shadow plane

The airframe is thinner and wider than the tube it replaced, so it now floats above the ground at altitude 0 and its shadow is the wrong shape. These are the only two edits permitted outside `buildAircraft()` and the materials block.

**Files:**
- Modify: `redesign-v2.html` — `JET` table (`redesign-v2.html:2543-2544`), shadow plane (`redesign-v2.html:2463`)
- Modify: `scripts/verify-airframe.mjs`

**Interfaces:**
- Consumes: `bellyY` from Task 3.
- Produces: nothing.

- [ ] **Step 1: Add the ground-contact check**

In `scripts/verify-airframe.mjs`, add to `main()` after `engine_ignition`:

```js
  // ── Parked on the ground, not floating above it or sunk into it. The
  //    ground plane is at y = -1.45; the old airframe's belly sat 0.12
  //    above it, which is the clearance being reproduced. ──
  const ground = await page.evaluate(() => {
    const S = window.Stage;
    S.apply(0, 0);
    const box = new S.THREE.Box3();
    S.jet.updateMatrixWorld(true);
    S.jet.traverse((o) => { if (o.isMesh) box.expandByObject(o); });
    return { jetY: S.jet.position.y, bellyWorldY: box.min.y, shadowY: -1.45 };
  });
  const clearance = ground.bellyWorldY - ground.shadowY;
  if (clearance > 0 && clearance < 0.25) pass('ground_contact', { ...ground, clearance });
  else fail('ground_contact', { ...ground, clearance, note: 'belly must sit just above y=-1.45: >0 (not sunk) and <0.25 (not floating)' });
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node scripts/verify-airframe.mjs`

Expected: `ground_contact` FAILS with `clearance` ≈ 0.63 — the aircraft is floating more than half a unit above the ramp, because the parked keyframe still assumes a tube fuselage whose belly reached −0.38.

- [ ] **Step 3: Move the parked keyframes**

In the `JET` table, change the two ground keyframes only:

```js
    const JET = [
      { a:     0, p:[0, -1.03, 0], r:[  0, 0,  0] },   // on the ground
      { a:  2000, p:[0, -1.03, 0], r:[  0, 0,  0] },
```

The old tube's belly reached y = −0.38; the new belly reaches −0.318 with its bevel, so the parked height drops from −0.95 to −1.03 to keep the same ~0.1 clearance over the ramp. **Change nothing else in either table.**

- [ ] **Step 4: Reshape the contact shadow**

Change the shadow plane at `redesign-v2.html:2463`:

```js
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(7.5, 7),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(blobCanvas), transparent: true, depthWrite: false })
    );
```

9 × 5.5 was sized for a long narrow tube. A delta's footprint is shorter and wider. The blob texture and the fade-out on climb are unchanged.

- [ ] **Step 5: Run the harness**

Run: `node scripts/verify-airframe.mjs`

Expected: `ground_contact` PASSES with `clearance` ≈ 0.10. All other checks still PASS.

- [ ] **Step 6: Commit**

```bash
git add redesign-v2.html scripts/verify-airframe.mjs
git commit -m "Sit the delta on the ground and reshape its shadow

The parked keyframe assumed a tube fuselage whose belly reached -0.38.
The blended planform's belly reaches -0.318, so the aircraft was floating
0.63 units above the ramp. Two keyframes move; nothing else in either
table does.

The 9x5.5 shadow was sized for something long and narrow. A delta's
footprint is shorter and wider."
```

---

### Task 9: The Tier-0 silhouette

Tier 0 is the path for no-WebGL, reduced-motion, Save-Data and low-memory devices, and it shows a flat SVG in place of the canvas. It currently shows the *old* aeroplane, which means the lowest-capability readers would see a shape that no longer exists.

**Files:**
- Modify: `redesign-v2.html`, the `#jet` symbol (`redesign-v2.html:861-863`)
- Modify: `scripts/verify-airframe.mjs`

**Interfaces:**
- Consumes: the `HALF` coordinates from Task 2 (transcribed by hand into SVG units — the symbol is static markup and cannot read JS constants).
- Produces: nothing.

- [ ] **Step 1: Add the silhouette check**

In `scripts/verify-airframe.mjs`, add a new block in `main()` before `await browser.close()`:

```js
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
    const ok = silo.tier0 && silo.rendered && silo.canvasHidden && isPolygon && vertexCount === 12 && silo.siloCount === 4;
    const detail = { ...silo, isPolygon, vertexCount, expectedVertices: 12, expectedSilos: 4 };
    if (ok) pass('tier0_silhouette', detail); else fail('tier0_silhouette', detail);
  }
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node scripts/verify-airframe.mjs`

Expected: `tier0_silhouette` FAILS — `isPolygon: false` (the old path uses `c` curve commands) and `vertexCount` well short of 12.

- [ ] **Step 3: Redraw the symbol**

Replace `redesign-v2.html:861-863` with:

```html
  <symbol id="jet" viewBox="0 0 300 140">
    <!-- The Tier-0 stand-in, and it must be a silhouette of the aircraft
         Tier 2 renders — the readers who see this are the ones who see
         nothing else. Traced from the same twelve planform points, mapped
         with x = 150 + 45.0*x and y = 6 + 21.333*(3.40 - z).

         The mapping is deliberately NON-proportional, as the previous
         symbol's was: the airframe is 6.2 across by 6.0 long and this box
         is 300 by 140, so span and length are scaled independently. At
         silhouette fidelity that is the right trade — what has to survive
         is the sawtooth trailing edge and the absence of a fin, and both do.

         Deck, ruddervators and inlet bumps are omitted: they are invisible
         in a flat plan-view fill. -->
    <path fill="currentColor" d="M150 6 L165.3 24.1 L180.6 44.4 L289.5 106.3 L281.4 115.2 L208.5 99.9 L150 134 L91.5 99.9 L18.6 115.2 L10.5 106.3 L119.4 44.4 L134.7 24.1 Z"/>
  </symbol>
```

- [ ] **Step 4: Run the harness**

Run: `node scripts/verify-airframe.mjs`

Expected: `tier0_silhouette` PASSES — `isPolygon: true`, `vertexCount: 12`, `siloCount: 4`, `canvasHidden: true`. All Tier-2 checks still PASS.

- [ ] **Step 5: Look at Tier 0 directly**

In a browser with reduced motion enabled (macOS: System Settings → Accessibility → Display → Reduce motion; or DevTools → Rendering → Emulate `prefers-reduced-motion`), load the page and scroll to the three stage sections. Confirm the sawtooth trailing edge and the absence of a vertical fin are both readable at the rendered size.

Note that `html.tier-0 .stage-right .silo` applies `scaleX(-1)`. The new planform is symmetric, so this is now a visual no-op. It is harmless and stays — removing it would be an unrelated change.

- [ ] **Step 6: Commit**

```bash
git add redesign-v2.html scripts/verify-airframe.mjs
git commit -m "Redraw the Tier-0 silhouette as the aircraft that now exists

Tier 0 is what no-WebGL, reduced-motion, Save-Data and low-memory readers
see instead of the canvas - and it was still showing the old aeroplane.
Traced from the same twelve planform points.

The mapping into the 300x140 box stays deliberately non-proportional, as
the previous symbol's was. What has to survive at this fidelity is the
sawtooth and the missing fin, and both do."
```

---

### Task 10: Full verification against the spec

Every preceding task proved a geometry fact. This one covers what geometry cannot prove: that the camera still frames the aircraft at all sixteen keyframes, that the halos composite correctly against three different skies, and that the page as a whole still passes.

**Files:**
- Modify: `scripts/verify-airframe.mjs` (add the camera sweep)
- Create: screenshots under the scratchpad directory (not committed)

**Interfaces:**
- Consumes: everything.
- Produces: a pass/fail record against spec §10.

- [ ] **Step 1: Add the camera framing sweep**

In `scripts/verify-airframe.mjs`, add before `await browser.close()`:

```js
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
      return { alt, cornersInside: inside, ndc: pts };
    });
  }, KEYFRAMES);

  // A wide shot with any corner off-screen means the airframe is clipped at
  // a beat where it is meant to be seen whole. Per spec 9.3, the fix is to
  // shrink the span — NOT to retune keyframes.
  const clippedWide = framing.filter((f) => WIDE.has(f.alt) && f.cornersInside < 8);
  // Any beat that shows nothing at all is a hard failure regardless.
  const empty = framing.filter((f) => f.cornersInside === 0);
  if (clippedWide.length || empty.length) {
    fail('camera_framing', { framing, clippedWide: clippedWide.map((f) => f.alt), empty: empty.map((f) => f.alt),
      note: 'wide shots must contain the whole airframe; per spec 9.3 shrink the span rather than retuning CAM' });
  } else {
    pass('camera_framing', { framing });
  }
```

- [ ] **Step 2: Run the airframe harness in full**

Run: `node scripts/verify-airframe.mjs`

Expected: exit 0, every check passing. If `camera_framing` reports clipped wide shots, reduce the wingtip x in `HALF` from 3.10 toward 2.95 and re-run every earlier check — **do not touch the `CAM` table**, which `redesign-v2.html:2505-2518` documents as expensively arrived at.

- [ ] **Step 3: Run the page harness**

Run: `node scripts/verify-page.mjs`

Expected: exit 0. This covers overflow, console errors, images, the no-JS path, the network allowlist, contrast, anchor occlusion and the skip link. None of those should be affected by this work — if any regressed, this change caused it.

- [ ] **Step 4: Capture halo compositing over three skies**

This is spec §9.2, the design's one genuine unknown, and it must be looked at rather than reasoned about.

Create `scripts/shoot-halos.mjs` (a scratch tool — do not commit it):

```js
// Scratch: capture the airframe over four skies to inspect halo compositing.
// Run: node scripts/shoot-halos.mjs <output-dir>
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const OUT = process.argv[2];
if (!OUT) { console.error('usage: node scripts/shoot-halos.mjs <output-dir>'); process.exit(1); }
const url = pathToFileURL(path.resolve('redesign-v2.html')).href;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url);
await page.waitForTimeout(6000);

// SCROLL to each altitude rather than forcing it. Task 7 established that
// calling Stage.apply() directly does not survive: altitude is derived from
// scroll position, so the page's own rAF loop recomputes the pose from the
// real scroll offset and overwrites the forced one before the screenshot
// lands. Scrolling is also closer to what a reader actually sees.
const shots = [
  ['ground',  0.00],
  ['wp1',     0.22],
  ['cruise',  0.55],
  ['space',   0.92],
];

for (const [name, frac] of shots) {
  await page.evaluate((f) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max * f, behavior: 'instant' });
  }, frac);
  // Let the scroll settle, the altitude subscription fire, and the render
  // loop draw the new pose.
  await page.waitForTimeout(900);
  const alt = await page.evaluate(() => Math.round(window.Flight.state.alt));
  await page.screenshot({ path: path.join(OUT, `halo-${name}-alt${alt}.png`) });
  console.log(`${name}: alt ${alt}`);
}

await browser.close();
console.log('wrote 4 screenshots to', OUT);
```

Run it against the scratchpad directory. The filenames record the altitude each
shot actually landed at, so you can confirm the four cover the ground, a
waypoint, mid-climb and the near-navy sky rather than assuming they did:

```bash
node scripts/shoot-halos.mjs "$SCRATCH"
```

Inspect each image for: no dark or grey box behind any halo, no rectangular seam at the sprite's edge, no halo occluding airframe geometry in front of it, and the halo visibly spilling **past** the silhouette edge rather than merely filling the nozzle aperture.

If additive compositing is wrong, switch the halo material to `THREE.NormalBlending` and lift the gradient's centre stop to `rgba(255,214,208,1)` — a paler coral, still on the `--accent-strong` family, never back toward orange. Record which path was taken in the commit message.

- [ ] **Step 5: Check the silhouette read at wide-shot size**

From the screenshots at altitudes 0 and 8000, confirm at 100% zoom that the sawtooth trailing edge and the absence of a vertical fin are both readable without zooming in. This is spec §10 check 7, and it is the check that decides whether the whole exercise landed.

- [ ] **Step 6: Check legibility against the navy sky**

From the altitude-58000 screenshot, confirm the airframe is still legible against `#1B2C42`. Per spec §9.1, if it is not: raise halo opacity and the rim light's contribution first, lighten `SKIN` only after those are exhausted, and **never** raise `sun.intensity`, which `redesign-v2.html:2644-2646` deliberately lowers.

- [ ] **Step 7: Commit the verification result**

```bash
git add scripts/verify-airframe.mjs
git commit -m "Verify the airframe against all sixteen camera keyframes

Adds the framing sweep: projects the airframe's bounding-box corners
through the live camera at every CAM keyframe rather than sampling, since
the delta is proportionally wider in plan than the distances were tuned
for and the rig rolls up to 15 degrees during push-ins. Wide shots must
contain the whole airframe; push-ins are allowed to crop, which is what
a push-in is.

verify-page.mjs still passes: no overflow, no console errors, no-JS path
intact, network allowlist unchanged, contrast unaffected."
```

- [ ] **Step 8: Update the outstanding-work doc**

`docs/redesign-v2-outstanding-work.md` is already modified in the working tree. Add a line recording that the signature airframe was replaced, so the author handoff stays accurate. Do not restructure the document.

---

## Self-Review

**Spec coverage:**

| Spec section | Task |
|---|---|
| §4.1 blended, not assembled | 2 |
| §4.2 planform outline, sawtooth, sweep | 2 |
| §4.3 deck and belly | 3 |
| §4.4 fin / tailplane / intakes / cone deleted | 4 |
| §4.5 ruddervators, inlets, slot nozzle, canopy | 4, 5 |
| §5 three emissive surfaces | 6 |
| §5.1 halos, sprite properties, ignition ramp | 7 |
| §5.2 compositing uncertainty | 10, step 4 |
| §6 materials | 5 |
| §7.1 JET ground keyframes | 8 |
| §7.2 shadow plane | 8 |
| §7.3 SVG symbol | 9 |
| §9.1 dark-at-altitude | 10, step 6 |
| §9.2 halo compositing | 10, step 4 |
| §9.3 wide-shot clipping | 10, steps 1–2 |
| §9.4 angular vs round | Accepted in the spec; no task |
| §10.1 verify-page.mjs | 10, step 3 |
| §10.2 all 16 keyframes | 10, steps 1–2 |
| §10.3 push-in lands on canopy | 5 (`canopy_on_cockpit`) |
| §10.4 sits on the ground | 8 |
| §10.5 Tier-0 silhouette | 9 |
| §10.6 legible at 58000 | 10, step 6 |
| §10.7 silhouette test | 9 step 5, 10 step 5 |
| §10.8 halo compositing over 3 backdrops | 10, step 4 |
| §10.9 ignition ramp | 7 (`engine_ignition`) |
| §10.10 glow spills past the edge | 10, step 4 |

No gaps.

**Type consistency:** `mirrorOutline(half)` is defined in Task 2 and reused in Task 3. `HALF` is defined in Task 2 and reused in Tasks 6 and 9. The outline arrays are named `DECK_OUTLINE` / `BELLY_OUTLINE` to avoid colliding with the `DECK` *material* introduced in Task 5 — Task 3 Step 3 calls this out explicitly. `halos` is declared in Task 1 (as `[]`, so `window.Stage` is valid from that task) and replaced with the populated array in Task 7. `userData.baseScale` is set in Task 7 and read by both `apply()` and the harness. `window.Stage` exposes `apply` and `COCKPIT`, which Tasks 7, 8 and 10 all call.

**Known intermediate red states**, so an executor does not mistake them for breakage:
- Tasks 1–4: `tailless` fails until Task 4 Step 7.
- Task 3: the deck is built with `SKIN` and switched to `DECK` in Task 5 Step 4.
- Task 6: the glow reads as flat paint. Task 7 is the fix. Step 7 of Task 6 says so explicitly.
- Task 7 Step 2: the `engine_ignition` check crashes on an empty `halos` array before Step 3.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-08-10-sixth-gen-signature-airframe.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
