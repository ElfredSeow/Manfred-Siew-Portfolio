# Sixth-Generation Signature Airframe — Design

**Date:** 2026-08-10
**Target files:** `redesign-v2.html` (two regions only — the `#jet` SVG symbol and the
`buildAircraft()` function plus its materials)
**Relates to:** `2026-08-08-daylight-ascent-portfolio-design.md`. This document changes
nothing that spec decided about the *stage* — the camera grammar, the altitude plumbing,
the waypoint beats and the tier gate all stand. It replaces only the object the camera is
pointed at.

---

## 1. Context

`redesign-v2.html:38` states the position plainly: *"The 3D aircraft is now THE signature
element."* Everything else on the page was deliberately quietened so this one object could
be loud. But the object itself was never designed to carry that weight — it was assembled
from the cheapest primitives that would read as an aeroplane:

- a lathe-spun tube fuselage
- a cone nose
- a flat swept wing plate bolted to the side of it
- a round tailplane, a vertical fin, a sphere canopy
- two cylindrical intakes hung underneath

The result reads as *a generic aeroplane*. It does not read as anything. A portfolio whose
argument is "trained in Aerospace Engineering, self-taught in software" is spending its
single loudest element on a shape that communicates neither ambition nor technical taste.

The fix is a shape that is unmistakably next-generation at a glance, and that carries the
"high tech" read in its own surface rather than in a caption.

## 2. Goals

- The silhouette should be identifiable as sixth-generation within about a second, at
  wide-shot size, without any label.
- The "high tech" quality should live in the geometry and in light emitted by the
  airframe — not in added motion, and not in a new dependency.
- Every camera keyframe, altitude mapping and waypoint beat in the existing rig must
  continue to frame correctly with no retuning.
- Tier 0 must degrade to a silhouette of *this* aircraft, not the old one.

## 3. Non-goals

- **No new motion.** `redesign-v2.html:2313` commits the stage to being a pure function of
  `Flight.state.alt`, with the parked idle yaw as the single declared exception. Pulsing
  lights, scan lines and contrails were considered and rejected on that basis.
- **No post-processing.** No bloom pass, no shadow maps. The stage's performance story is
  that it has neither, and the on-demand redraw depends on staying cheap.
- **No GLB.** `redesign-v2.html:2289-2293` rejects third-party models on licence and
  availability grounds. That reasoning is unchanged and this design stays procedural.
- **No camera or altitude changes.** `CAM`, the sky ramp, and the tier gate are untouched.
  The two exceptions in the `JET` table are named in §7.

## 4. Airframe

### 4.1 The single decision that does the work

The old airframe is *assembled* — a fuselage with things attached to it. The new one is
**blended**: nose, chine and wing are one continuous outline with no seam anywhere. That
single property is most of what separates a modern low-observable airframe from a
1970s fighter, and it costs less geometry than the thing it replaces.

### 4.2 Planform

One `plate()` call. `plate()` already bevels every edge (`redesign-v2.html:2377-2391`),
which is what stops flat plates reading as folded cardboard — that helper is correct as-is
and is reused unchanged.

Outline, in the `[x, z]` convention the existing plates use (mirrored across x=0):

| Point | x | z | What it is |
|---|---|---|---|
| 1 | 0 | 3.40 | nose apex |
| 2 | ±0.34 | 2.55 | chine origin |
| 3 | ±0.68 | 1.60 | chine flare |
| 4 | ±3.10 | −1.30 | wingtip, leading edge |
| 5 | ±2.92 | −1.72 | wingtip, trailing edge |
| 6 | ±1.30 | −1.00 | **sawtooth notch** |
| 7 | 0 | −2.60 | centre trailing point |

Thickness 0.16, centred on y = 0, so the planform occupies y ∈ [−0.08, +0.08].

Length 6.00, span 6.20 — deliberately within a rounding error of the old airframe's
"~6 units long and ~6.2 across," which `redesign-v2.html:2498-2501` states every camera
standoff distance was sized against.

Points 5→6→7 are the **sawtooth trailing edge**. This is the highest-value single feature
in the design: the W-notch is the cue that reads as "next generation" instantly and
survives being shrunk to a silhouette.

Leading edge sweep from point 3 to point 4 is ~48°, held constant on both sides — parallel
edge alignment is the actual design rule low-observable planforms obey, and the eye
registers it even when the viewer cannot name it.

### 4.3 Volume

- **Dorsal deck** — a second, smaller `plate()` stacked on top, thickness 0.30, spanning
  y ∈ [0.06, 0.36]. Gives volume behind the cockpit and blends into the buried engine.
  Two stacked bevelled plates produce a faceted-but-blended read for very few triangles.
- **Belly** — a shallow lower plate, thickness 0.22, taking the underside to y = −0.30.
  A lifting body has an underside; without it the aircraft is a flat sheet at the
  wide shot, and the contact shadow has nothing to sit under.

### 4.4 What is deleted

| Removed | Why |
|---|---|
| Vertical fin | **No fins at all is the strongest available futuristic signal.** A tailless airframe is the single most legible "this is not a current-generation fighter" statement. |
| Round tailplane | Subsumed into the blended planform. |
| Both underslung cylindrical intakes | Inlets visible from below is the opposite of the grammar being invoked. |
| Cone nose | The nose is now the planform apex; there is no separate nose. |

### 4.5 What replaces them

- **Canted ruddervators** — two small surfaces at x = ±2.35, z ≈ −1.25, canted 35°
  outward from vertical, span 0.55 and root chord 0.70. Small enough that the silhouette
  still reads tailless.
- **Top-mounted DSI inlet bumps** — smooth shoulder bumps at (±0.52, 0.32, 0.95), each
  with a dark forward-facing inlet mouth. Inlets on top, hidden from below.
- **Slot nozzle** — a flat rectangular exhaust at (0, 0.10, −2.45), 1.05 wide × 0.16 tall.
  Flat-and-wide rather than round is a deliberate contrast with the old cylinder.
- **Canopy** — retained as a low, faired bubble: the same sphere, rescaled from the old
  fighter-bubble proportions of (0.85, 0.72, 2.10) to (0.62, 0.40, 1.55) — flatter and
  longer. **Its centre stays at exactly (0, 0.30, 1.25)**, because
  that is the `COCKPIT` constant at `redesign-v2.html:2503` that every waypoint's push-in
  beat targets. Moving it silently breaks three camera beats.

## 5. Light

Three emissive elements, all `MeshBasicMaterial`.

`MeshBasicMaterial` rather than `MeshStandardMaterial` with an `emissive` channel, for two
reasons: it is cheaper, and it is **unlit**, so it holds constant brightness while
`redesign-v2.html:2646` dims the sun from 2.1 to 1.25 across the climb. The glow therefore
gets relatively *stronger* as the sky ramps to `#12244A`. That is free, and it is the
right direction — the airframe should look most alive at altitude.

| Element | Where | Colour | Role |
|---|---|---|---|
| Engine slot interior | inside the nozzle | `#FF8038` | hottest; the anchor |
| Chine + inlet-lip strips | thin slivers proud of the surface | `#E86A2A` | the *lit from within* read |
| Instrument glow | small plane inside the canopy | `#FF8038` | see below |

**On the cockpit glow.** The camera's push-in lands on the cockpit at every waypoint, and
`redesign-v2.html:2490-2492` establishes that this beat means *"this part was mine."* It is
the one place on the airframe where a light has narrative work to do rather than decorative
work. It is also only visible during that beat, which is the correct amount of visibility.

**On the hue.** The glow uses the page's existing orange accent (`#C2410C` / `#FF8038`)
rather than the conventional sci-fi cyan. Two reasons: the page currently has exactly one
accent hue and a second one would cost more than the effect is worth, and orange is
physically right for exhaust. Approved 2026-08-10.

## 6. Materials

| Material | Was | Becomes | Note |
|---|---|---|---|
| `SKIN` | `#DCE2E9` | `#9AA3AE` | mid-graphite, roughness .50, metalness .22 |
| `DECK` | — | `#7C8794` | new; separates the deck from the planform |
| `TRIM` | `#C2410C` | unchanged | |
| `GLASS` | `#33547D` | unchanged | the low-metalness reasoning at `:2369-2372` still holds — there is still no environment map |
| `DARK` | `#5A6675` | unchanged | surrounds the glow |

**Mid-graphite, not near-black, and this is the design's main risk.** Stealth wants dark,
and dark surfaces are what let unlit emissive read as glow rather than as paint. But the
sky ramps to `#12244A`, and a near-black airframe against near-navy would vanish at
exactly the "small against a large sky" beat that carries the argument. Mid-graphite plus
the existing rim light plus the emissive edges is the compromise. Approved 2026-08-10.
See §9.1 for what to do if it still reads too dark.

## 7. Consequential changes

These are the only edits outside `buildAircraft()` and the materials block:

1. **`JET` table, ground keyframes only** (`redesign-v2.html:2543-2544`). The old tube
   fuselage had its belly at y = −0.38; the new belly sits at −0.30. The two parked
   keyframes at altitude 0 and 2000 move from y = −0.95 to y = −1.03 so the aircraft still
   sits on the ground rather than floating above it. **No other keyframe in either table
   changes.**
2. **Contact shadow plane** (`redesign-v2.html:2463`). 9 × 5.5 was sized for a long narrow
   tube. A delta's footprint is shorter and wider, so it becomes ~7.5 × 7.0. The blob
   texture and the fade-out on climb are unchanged.
3. **`#jet` SVG symbol** (`redesign-v2.html:861-863`). Redrawn from the §4.2 planform
   coordinates, so Tier 0 shows a silhouette of the aircraft that Tier 2 renders. Only the
   planform outline carries — deck, ruddervators and inlet bumps are omitted, as they are
   invisible in a flat plan-view fill. Like the current symbol, the mapping into the
   300×140 viewBox is **deliberately non-proportional**: the aircraft is 6.2 × 6.0 and the
   box is not, so span and length are scaled independently. This matches the existing
   treatment and is acceptable for a silhouette standing in at low fidelity.

## 8. Cost

~2k additional triangles. The canvas redraws only when altitude changes
(`redesign-v2.html:2662-2671`), so this is paid during scroll and not at all when idle.
No new dependencies; the page's two remote dependencies, named at `:2295-2311`, are
unchanged.

## 9. Risks

### 9.1 The airframe goes too dark at altitude
Covered in §6. If verification shows the aircraft losing legibility against `#12244A`,
the fix is to lighten `SKIN` toward `#A8B0BA` — **not** to raise the sun intensity, which
`:2644-2646` deliberately lowers, and not to add a light.

### 9.2 Unlit emissive may read as orange paint, not as light
Without a bloom pass, an emissive surface is just a bright flat colour. It reads as light
only by contrast with what surrounds it. Mitigation: keep every glow element thin and give
each one a `DARK` surround. If it still reads as paint, widen the dark surround —
**adding post-processing is out of scope** and would undo the stage's performance story.

### 9.3 The delta may clip at wide shots
The new planform is proportionally wider in plan view than the old airframe, and the rig
applies up to 15° of roll during push-in beats. Every `CAM` keyframe must be checked
visually, not assumed. This is the one item that could force a camera change, which would
contradict §3 — if it does, the correct response is to shrink the span slightly rather
than to retune keyframes that `:2505-2518` documents as expensively arrived at.

### 9.4 Angular geometry versus the page's round-over-square language
The page commits to round over square, and a faceted delta is angular by nature. The
tension is accepted: the rule governs *UI chrome*, and the signature is the one element
the page has already exempted from the quiet treatment. The bevel on every plate edge is
what keeps the airframe from reading as hard-edged in the way the rule is guarding against.

## 10. Verification

1. `node scripts/verify-page.mjs` passes.
2. The aircraft is visible and correctly framed at every `CAM` keyframe altitude — checked
   at each of the 16 entries, not sampled.
3. The push-in beat still lands on the canopy at altitudes 14500, 28500 and 42500.
4. The aircraft sits on the ground at altitude 0 with no visible gap or intersection.
5. Tier 0 forced on: the SVG silhouette shows the new planform, sawtooth visible.
6. The airframe is legible against the sky at altitude 58000+.
7. Silhouette test: at wide-shot size, the sawtooth trailing edge and the absence of a
   vertical fin are both readable.
