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

- **No new clock.** `redesign-v2.html:2313` commits the stage to being a pure function of
  `Flight.state.alt`, with the parked idle yaw as the single declared exception. Pulsing
  lights, scan lines and contrails were considered and rejected on that basis. The engine
  ignition ramp at §5.1 is *not* an exception: it is driven by altitude alone and adds no
  clock.
- **No post-processing.** No bloom pass, no shadow maps, no `EffectComposer`, no render
  target. The stage's performance story is that it has none of these, and the on-demand
  redraw depends on staying cheap. §5.1 obtains the glow another way rather than relaxing
  this.
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
  still reads tailless. **Graphite `SKIN`, never an accent colour** — see §6; a saturated
  surface here reads as a fin at the low front-quarter beats however it is canted.
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

Two layers: emissive surfaces on the airframe (§5, below) and the halos that make them read
as light (§5.1). Neither works without the other.

Three emissive surfaces, all `MeshBasicMaterial`.

`MeshBasicMaterial` rather than `MeshStandardMaterial` with an `emissive` channel, for two
reasons: it is cheaper, and it is **unlit**, so it holds constant brightness while
`redesign-v2.html:2646` dims the sun from 2.1 to 1.25 across the climb. The glow therefore
gets relatively *stronger* as the sky ramps to `#1B2C42`. That is free, and it is the
right direction — the airframe should look most alive at altitude.

| Element | Where | Colour | Role |
|---|---|---|---|
| Engine slot interior | inside the nozzle | `#FFB0A5` (`GLOW_HOT`) | hottest; the anchor |
| Chine + inlet-lip strips | thin slivers proud of the surface | `#E8685C` (`GLOW_EDGE`) | the *lit from within* read |
| Instrument glow | small plane inside the canopy | `#FFB0A5` (`GLOW_HOT`) | see below |

**On the cockpit glow.** The camera's push-in lands on the cockpit at every waypoint, and
`redesign-v2.html:2490-2492` establishes that this beat means *"this part was mine."* It is
the one place on the airframe where a light has narrative work to do rather than decorative
work. It is also only visible during that beat, which is the correct amount of visibility.

**On the hue.** The glow uses the page's accent rather than the conventional sci-fi cyan. Two
reasons: the page has exactly one accent hue and a second one would cost more than the effect
is worth, and a warm glow is physically right for exhaust. Approved 2026-08-10.

**Revised 2026-08-10.** This section originally cited `#C2410C` / `#FF8038` as "the page's
existing orange accent" — that citation no longer holds. The page has since been re-tinted
toward the bear-logo palette: `--accent-strong` is now `#B84630` and `--signal` is now the
coral `#F5837A`, and the airframe's own `TRIM` was updated to match. (`TRIM` has since been
removed entirely — see §6 — so these two glow constants are now the *only* place the accent
touches the airframe.) The two reasons above are untouched by that move — one accent hue, and a warm colour is still
physically right for exhaust — so the author's decision, same day, is that the glow should
follow the palette rather than freeze at the old hue: `GLOW_HOT` moves to `#FFB0A5` and
`GLOW_EDGE` to `#E8685C`, both above in the table. These constants are not yet built in
`redesign-v2.html`; this revision exists so the values are already correct when they are.

### 5.1 Halos — how the glow actually glows

An emissive surface with nothing else done to it is a flat bright colour. It reads as
*light* only when light appears to spill off it into the surrounding air. That spill is
the entire perceptual content of a bloom pass.

It can be drawn directly instead of computed: an **additive-blended radial-gradient
billboard** at each glow source. Pre-bloom real-time rendering did it this way for a
decade, and it produces the effect rather than an approximation of it.

This is not a foreign technique in this file. `redesign-v2.html:2455-2461` already builds a
128×128 canvas radial gradient and maps it onto a plane for the contact shadow, for exactly
the same reason: obtain the optical result without paying for the machinery that would
normally produce it. Halos reuse that pattern with the gradient inverted and the blending
additive.

| Property | Value | Why |
|---|---|---|
| Geometry | `THREE.Sprite` | camera-facing and perspective-scaled for free; the halo grows correctly during the push-in |
| Blending | `THREE.AdditiveBlending` | light adds; it does not occlude |
| `depthWrite` | `false` | a halo must never carve a hole in what is behind it |
| Texture | one shared 128×128 canvas radial gradient | built once, reused by every halo |

Three halos, matching the three emissive elements: a large one at the nozzle, small ones at
each inlet lip, and a very small one at the canopy. Total ~6 triangles each, one texture.

**Engine ignition.** Halo scale and opacity ramp from near-zero on the ground to full by
the end of rotation (~8000 ft), so the engine appears to light as the aircraft rotates.
This is a **pure function of `Flight.state.alt`** and therefore introduces no second clock —
it stays inside the constraint at §3, and it is the one place the glow gets to *do*
something rather than sit there. If this reads as too much, delete the ramp and hold the
halos at full; nothing else depends on it.

### 5.2 What this technique costs, honestly

The one uncertain interaction is compositing. The renderer runs `alpha: true` with
`setClearAlpha(0)` (`redesign-v2.html:2582-2583`) so the canvas composites over the CSS
sky, and three.js uses premultiplied alpha by default. Additive blending over transparent
regions of the framebuffer is well-trodden and expected to composite correctly — a halo
over open sky should tint the CSS background beneath it, which is the desired result — but
this is a genuine interaction between three settings and **must be looked at rather than
assumed**. See §10, check 8. If it composites wrongly, the fallback is
`THREE.NormalBlending` with a hotter centre colour, which is weaker but has no
alpha interaction at all.

## 6. Materials

| Material | Was | Becomes | Note |
|---|---|---|---|
| `SKIN` | `#DCE2E9` | `#5C6675` | graphite, roughness .52, metalness .24 |
| `DECK` | — | `#474F5C` | new; separates the deck from the planform |
| `TRIM` | `#C2410C` | **removed** | see below — the ruddervators were its only user and are now `SKIN` |
| `GLASS` | `#33547D` | unchanged | the low-metalness reasoning at `:2369-2372` still holds — there is still no environment map |
| `DARK` | `#5A6675` | `#2E3540` | darkened; it is now the surround that makes the glow read |

**Graphite, not the mid-tone this spec originally called for.** An earlier revision hedged
to `#9AA3AE` because the emissive elements were expected to be weak, which meant the
airframe's own value had to carry legibility against the `#1B2C42` sky at altitude. The
halos at §5.1 remove that dependency: light spilling off the airframe reads against a dark
sky far better than a pale surface does, and it reads *as an aircraft with its lights on*
rather than as a bright cut-out.

The two are the same decision. A dark airframe is what makes glow read as glow, and real
glow is what lets the airframe be dark. Hedging either one weakens both. Revised and
approved 2026-08-10.

**`TRIM` removed, 2026-08-10.** `TRIM` (`#B84630`, tracking `--accent-strong`) existed for
one reason: to keep the page's accent somewhere on the airframe once the cone nose was
deleted. Its only user was the canted ruddervators of §4.5. Verification found that this cost
more than it bought — as the only saturated mass on a graphite airframe the ruddervators drew
the eye first, and at the low front-quarter camera beats, where they project near-vertical,
they read as **a vertical fin**. §4.4 calls a tailless airframe "the single most legible
'this is not a current-generation fighter' statement", so the accent was undercutting the
strongest cue in the design in order to appear in it. The geometry was never wrong: the cant
is 35° and `tailless` passes at maxY 0.53. The colour was doing the damage.

The ruddervators are now `SKIN`, which left `TRIM` with no users, so the material is gone
rather than left dead. **The accent now reaches the airframe only as emitted light** —
`GLOW_HOT` `#FFB0A5` and `GLOW_EDGE` `#E8685C`, §5. That is the intended end state and not an
oversight: §5's own argument is that on a dark airframe the accent should read as the
aircraft's lights being on rather than as paint, and removing the paint is that argument
carried to its conclusion. The airframe now carries no painted accent at all.

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

~2k additional triangles for the airframe, plus ~24 for the four halo sprites and one
shared 128×128 canvas texture built once at startup. The canvas redraws only when altitude
changes (`redesign-v2.html:2662-2671`), so this is paid during scroll and not at all when
idle. No new dependencies; the page's two remote dependencies, named at `:2295-2311`, are
unchanged, and no post-processing pass is added.

## 9. Risks

### 9.1 The airframe goes too dark at altitude
Reduced, not eliminated. The halos at §5.1 are what carry legibility against `#1B2C42`, so
this risk now depends on the halos landing rather than on the skin value. If the aircraft
still loses legibility at altitude, raise halo opacity and the rim light's contribution
first; lighten `SKIN` only after those are exhausted, and **never** raise sun intensity,
which `:2644-2646` deliberately lowers.

### 9.2 Halo compositing against the transparent canvas
**This replaces an earlier risk about emissive reading as flat paint, which §5.1 resolves.**

Additive blending interacts with `alpha: true`, `setClearAlpha(0)` and three.js's default
premultiplied alpha. The expected behaviour — halos tinting the CSS sky beneath the canvas —
is standard and well-trodden, but it is an interaction between three settings and is the
one thing in this design that must be seen rather than reasoned about. Fallback if it
composites wrongly: `THREE.NormalBlending` with a hotter centre, which is weaker but
removes the alpha interaction entirely.

**Adding a post-processing bloom pass remains out of scope**, and §5.1 exists precisely so
that it is not needed. Reaching for `EffectComposer` would pull a second unpkg module, force
a render target, complicate the transparent-canvas compositing this risk is already about,
and undo the stage's performance story — a worse trade than any of the fallbacks above.

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
8. **Halo compositing (§9.2).** Halos are inspected over three backdrops — the pale sky at
   altitude 0, the mid sky at 30000, and the navy at 58000 — and over an opaque content
   card. No dark box, no rectangular seam, no halo occluding the airframe in front of it.
9. The engine halo ramps up across rotation and is at full by 8000 ft, with no visible step.
10. Glow reads as light, not as paint: the halo must be visible spilling *past* the
    airframe's silhouette edge, not merely filling the nozzle aperture.
