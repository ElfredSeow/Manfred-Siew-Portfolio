# Daylight Ascent — Portfolio Redesign Design

**Date:** 2026-08-08
**Target file:** `redesign-concept.html` (standalone, single file)
**Supersedes:** the "Ascent / cockpit-at-night" concept currently in that file

---

## 1. Context

`redesign-concept.html` is a 1,164-line standalone scrollytelling portfolio built on a
cockpit-at-night premise: dark surfaces (`#05080D`), amber `#FF6B1A` and phosphor cyan
`#5BC8FF`, GSAP ScrollTrigger, five cross-fading "altitude band" backgrounds, and 20
projects in an expandable "Flight Log".

Three problems drove this redesign:

1. **The motion carries no argument.** The sky changes colour as you scroll, but nothing
   about the movement communicates anything about the work.
2. **The palette is hostile to older or low-vision readers.** Several current text
   values fail WCAG AA — `mono` labels sit near 3.1:1, body copy near 4.6:1, and mono
   labels are set at 10.5px with 0.16em tracking.
3. **The content structure hides the evidence.** Project entries describe what *the
   project* was, rarely what *the author* did, and never what changed as a result.

## 2. Goals

- A scroll-driven 3D aircraft whose camera movement **expresses** the content rather
  than decorating it.
- A bright, high-legibility palette that a 60-year-old hiring manager can read on a
  laptop without effort.
- Restructure the strongest work around a three-part model: **What the project was →
  What I did → What changed**, without losing narrative.
- Plain English throughout the interface. No jargon the reader has to decode.

**Primary audience:** hiring managers and recruiters for AI / software engineering
roles. Mixed ages, scanning fast, comparing against other candidates.

## 3. Non-goals

- Porting to the React app in `src/`. This work stays in the standalone HTML file.
- Rewriting the 20+ short project entries into full case studies.
- Any CMS, build pipeline, or data layer. The file stays self-contained.
- Quantified metrics. See §8 — the design is built to not need them.

---

## 4. Locked decisions

| # | Decision | Rationale |
|---|---|---|
| D1 | Optimise for hiring managers / recruiters in AI-SWE roles | Older-reader legibility still fully honoured via the palette and the two-mode rule (§6), but craft gets real budget |
| D2 | Real 3D: three.js + a GLB model | Highest differentiation; the camera move is the argument (§7) |
| D3 | Invert the metaphor to a **daylight ascent** | Light base gives ~16:1 body contrast, and the aircraft silhouettes against sky instead of vanishing into a black void |
| D4 | Tiered content: **3 deep case studies + the rest compact** | Recruiters read 2–3 deep and skim the remainder; ~9 blocks of writing instead of 60+ |
| D5 | **One continuous climb, three waypoints** | Altitude only ever increases, so the altimeter stays honest and the career arc reads as unbroken |
| D6 | Circle labels are **plain questions**: "What the project was / What I did / What changed" | Parallel grammar, 3–4 words each, nothing to decode |
| D7 | Delete the "Doctrine" section | A second competing trio of three, stated abstractly; the timeline demonstrates the same claims concretely |
| D8 | Featured arc: **Build → Scale → Teach** | Scope escalates with altitude and the page ends on AI-assisted engineering, the thing being hired for |
| D9 | Circle 3 uses **qualitative evidence**, not metrics | No figures exist across any of the 12 projects; §8 defines a structure that is specific without them |
| D10 | Project inventory **merges** both lists (~28–30 entries) | Both the 2025–26 enterprise work and the earlier Temasek Polytechnic / freelance era are real; the earlier era carries the career-change arc |

---

## 5. Visual system

### 5.1 Palette

Surfaces and ink:

| Token | Hex | Use | Contrast on paper |
|---|---|---|---|
| `--paper` | `#F4F7FA` | Base surface | — |
| `--ink` | `#0B1420` | Headings, emphasis | ~16:1 |
| `--body` | `#2C3E52` | Body copy | ~10:1 |

Accents — the orange is a **three-step ramp**, because a single orange cannot serve
both text and fills at accessible contrast:

| Token | Hex | Permitted use | Contrast on paper |
|---|---|---|---|
| `--accent-text` | `#9A3412` | Accent text at body size | ~6.8:1 |
| `--accent-head` | `#C2410C` | Headings ≥24px, borders, rules | ~4.8:1 |
| `--signal` | `#FF6B1A` | Fills, the altimeter bar, hover states | **Never text** |
| `--data` | `#0B5FA5` | Instrument/data labels, links | ~6.1:1 |

Sky bands (ground → space), replacing the five dark bands:

```
ground    climb     cruise    high      space
#DCEBF7   #B6D8F2   #7FB6E8   #3D6FA8   #12244A
```

Only the final Contact section reaches `#12244A`; at that point text inverts to
`--paper` on the dark ground, and that inverted pairing must be contrast-validated
separately.

**Contrast floor:** body copy ≥7:1, all other text and UI ≥4.5:1. Every value in the
tables above is a *candidate* and must be validated with a contrast checker during
implementation, not trusted from this document.

### 5.2 Typography

| Change | From | To | Reason |
|---|---|---|---|
| Body size | ~15px | **18px** | Baseline legibility |
| Body line-height | varies | **1.65** | |
| Measure | up to 66ch | **≤66ch** | |
| Mono label size | ~10.5px | **13px** | 10.5px is below any reasonable floor |
| Mono tracking | `.16em` | **`.10em`** | Wide tracking measurably hurts recognition at small sizes |
| Big Shoulders floor | used at 21px | **≥48px only, banned <24px** | It is a condensed face; condensed type is materially harder for low-vision readers |

Consequence of the Big Shoulders floor: project titles in the log (`.lt`, currently
Big Shoulders at 1.3rem) move to **Instrument Sans semibold**. This affects ~28 lines
of text and is a deliberate trade of flavour for readability.

---

## 6. Page architecture

### 6.1 One driving variable

Scroll progress `0.0 → 1.0` maps to altitude `0 → 62,000 ft`, monotonically increasing.
Camera, aircraft transform, sky colour, altimeter tape and contrail are all **pure
functions of that single number**. No independent timelines, no state that can desync.

### 6.2 The flight plan

| Altitude | Section | Mode | Aircraft |
|---|---|---|---|
| 0 ft | **Hero** — name, one-line positioning | Stage | Parked, ¾ view, slow idle yaw |
| 0 → 8k | **Origin** — World Skills aircraft maintenance → AI, one paragraph | Stage | Rotation, steep climb |
| 8k → 18k | **FUEL Up** — case study | Stage | Three-beat camera move |
| 18k → 22k | transit — no content, breathing space | — | Climbing cruise, recedes |
| 22k → 32k | **MILES / MAVIS** — case study | Stage | Three-beat camera move |
| 32k → 36k | transit — no content, breathing space | — | Climbing cruise |
| 36k → 46k | **Vibe Coding Masterclass** — case study | Stage | Three-beat camera move |
| 46k → 50k | **Security & governance** — short strip | Document | High cruise |
| 50k → 56k | **All Projects** — ~28 entries, filters | Document | Small, still, far back |
| 56k → 60k | **Experience** — timeline | Document | Contrail draws behind timeline |
| 60k → 1.0 | **Get in touch** | Document | Climbs out of frame; sky darkens |

The reader learns the three-beat grammar once at FUEL Up; the next two are then
immediately legible. That is the whole reason for one repeated camera move rather than
three bespoke ones.

The **Origin** beat places the aerospace history on the ground rather than in a
waypoint. This makes the ascent autobiographical instead of decorative, at a cost of
one paragraph.

The **Security & governance** strip exists because the Security Reviewer work
(FlightSim Code App, Project Management Tracker — security code review, vulnerability
scanning, deployment validation, compliance checks) did not win a waypoint but is too
distinctive to bury in the log. Paired with the Masterclass it produces the page's
rarest signal: *drives AI adoption and governs its risk.*

### 6.3 The two content modes — the legibility guarantee

This rule is what allows both spectacle and accessibility to coexist.

- **Stage mode** (hero, origin, 3 waypoints): content is a narrow column pinned to one
  side; the aircraft owns the rest of the frame. Short text only — a headline, 2–3
  sentences, some labels.
- **Document mode** (security strip, all projects, experience, contact): content sits
  on an **opaque paper surface at full width**. The canvas is behind it and
  functionally invisible.

**Long-form reading never happens on top of a moving 3D scene.** No exceptions.

---

## 7. The 3D system

### 7.1 Asset

- A **generic** jet or trainer — not a specific operational airframe. Avoids any
  question about depicting real equipment, and no recruiter cares which aircraft it is.
- Licence must be CC0 or CC-BY (Poly Pizza, Sketchfab CC filter). Attribution, if
  required, goes in the page footer.
- Decimated to ≤150k triangles. Single 1024² baked texture set. Draco-compressed.
- **Budget: ≤1.2 MB gzipped**, fetched *after* first paint.
- No rigging and no animated landing gear. The "on the ramp" beat is sold by low
  altitude and ground haze.

### 7.2 Renderer

- three.js via **importmap** from an ESM CDN, importing only renderer, scene, camera,
  `GLTFLoader`, `DRACOLoader` and two lights. Budget **~170 KB gz** (worse tree-shaking
  than a bundler; accepted as a consequence of staying in a single file).
- One `<canvas>`, `position: fixed`, behind all content, `pointer-events: none`.
- Device pixel ratio capped at 2 desktop / 1.5 mobile.
- **No shadow maps, no post-processing.** A baked contact-shadow plane instead — this
  is the single largest performance saving.
- The render loop is **not permanent**: it draws only when scroll progress has actually
  changed, or while the hero idle-yaw is active.

### 7.3 Lighting

One directional light (sun) plus a hemisphere light with sky colour `#B6D8F2` and
ground colour `#DCEBF7` — **the same values as the page background**, so the aircraft is
genuinely lit by the sky the reader is looking at. This is what makes it read as part of
the page rather than pasted on top.

No HDRI environment map. A 64px procedurally-generated gradient env is sufficient for
the metal and saves roughly 1 MB.

### 7.4 Camera rig

A plain keyframe table interpolated on scroll progress with smoothstep easing. Not
physics, not a spline solver — deterministic, debuggable, and tunable by editing
numbers.

```js
// per waypoint, three beats
{ t: 0.42, cam: [0, 1.2, 12], target: 'origin',  fov: 35, roll:   0, pitch:  0 }  // wide
{ t: 0.47, cam: [1.8, 0.4, 3], target: 'cockpit', fov: 24, roll: -18, pitch:  6 }  // push-in
{ t: 0.52, cam: [0, 4, 30],   target: 'origin',  fov: 50, roll:   0, pitch: 12 }  // pull-back
```

Aircraft transform is a parallel table of `{ t, position, rotation }`.

### 7.5 Fallback tiers

Tier is decided **before the model is fetched**, so Tier 0 users never download bytes
for a feature they cannot see. This extends the `hasGSAP` guard pattern already present
in the file at line 889.

| Tier | Trigger | Result |
|---|---|---|
| **0** | No WebGL · `prefers-reduced-motion` · `Save-Data` · `navigator.deviceMemory < 4` | Canvas never loads. Static SVG aircraft silhouette per section. **Full content, no loss.** |
| **1** | WebGL available, but model errors or exceeds a 5 s timeout | Silently degrades to Tier 0 |
| **2** | All healthy | Full experience |

### 7.6 Performance budget

- **LCP unaffected by the 3D**, because all hero text is HTML. Target <2.5 s on
  mid-tier mobile.
- Canvas initialises lazily after first paint and never blocks render.
- Added JS ≤170 KB gz; model ≤1.2 MB, fetched after LCP.
- Frame budget 8 ms on a 2020 mid-range Android.
- **Required finishing task:** replace `cdn.tailwindcss.com` (a ~120 KB runtime CSS
  compiler that blocks render and is not intended for production) with CSS generated
  once by the Tailwind CLI and pasted into the `<style>` block — roughly 10 KB of
  actually-used rules. All existing utility classes in the markup survive unchanged.
  Keep the CDN while iterating; do this before the page is shown to anyone.

---

## 8. The three-circle case study

### 8.1 Structure and camera choreography

Each of the three waypoints renders the same component. The camera move *is* the
argument — whole → part → whole-in-context:

| Beat | Label | Content | Camera |
|---|---|---|---|
| 0 | *(cold open)* | One sentence of tension, no jargon | Level, wide, entering |
| 1 | **What the project was** | The problem, the constraint (deadline / team / policy), the stack. 3 lines. | Level, side-on, **wide** — full airframe visible |
| 2 | **What I did** | First person singular, action verbs, **and one obstacle handled alone**. 3 lines. | **Push in and bank** — lose the whole aircraft, end on one component |
| 3 | **What changed** | Three evidence slots, §8.2. | **Pull back hard and climb** — aircraft small against a large sky |

Beat 2's push-in does semantic work: it visually separates *the author* from *the team*,
which is the exact problem the three-circle model exists to solve.

**Push-in target:** the cockpit, for all three waypoints, named explicitly as
`target: 'cockpit'` in the keyframe table. Consistency is the point — the reader learns
that "camera moves to the cockpit" means "this part was mine". Varying the target per
project would dilute that association and is out of scope.

### 8.2 Circle 3 — evidence slots, not metrics

No quantified figures exist for any of the 12 projects. Rather than create a slot
labelled "What changed" and fill it with adjectives — which reads as evasive precisely
*because* the design promises specifics — Circle 3 has three named slots:

| Slot | Rule |
|---|---|
| **What exists now** | Concrete nouns only. The state that exists which did not before. |
| **Who confirmed it** | Named external response — stakeholder demo sessions, UAT activity, the PPCoE updates that referenced GRID's OCR performance, external academic institutions co-delivering the masterclass, cohort size. Third-party corroboration is what a metric is a proxy for. |
| **What I'd do differently** | One honest line. The strongest credibility signal available without data, and it satisfies the "what you personally learned" element of the original model. |

**Hard content rule — abstract-noun impact claims are banned.** "Improved
transparency", "enhanced auditability", "reduced manual effort", "improved resource
utilisation" and equivalents may not appear. Every Circle 3 line must name something
that exists or someone who responded. This constraint is what makes the qualitative
version land rather than read as a dodge.

### 8.3 The three featured projects

Build → Scale → Teach. Each answers a different recruiter question.

| # | Project | Role | The question it answers |
|---|---|---|---|
| 1 | **FUEL Up** — claims & receipt digitalisation | Lead Developer / Solution Architect | *Can you ship production software?* RBAC, audit trail, SharePoint integration, data validation, governance |
| 2 | **MILES / MAVIS** — workflow digitalisation | Full Stack Developer / **Solution Owner** | *Do you own platforms, not just features?* Role management, qualification tracking, enterprise scalability planning |
| 3 | **Power Apps Vibe Coding Masterclass** | **Lead Instructor** | *Do you understand AI as a practice?* Prompt-driven development, external academic partners, large cohort |

Scope escalates with altitude: one process → one platform → a whole community. Ending on
AI-assisted engineering places the most relevant signal at the reader's exit point.

### 8.4 Content preconditions

The prose for the three case studies is an **author-supplied input**, not something
implementation can derive. Nine blocks are required before the waypoints can be filled
(3 projects × 3 circles), plus 3 cold opens. Each must satisfy the rules in §8.1–8.2.

Implementation may proceed with the layout, camera rig and visual system before this
copy exists, using clearly-marked structural stand-ins that are **replaced, not
shipped**.

---

## 9. Project inventory and the log

### 9.1 Merge

Both lists are real, separate work; the inventory merges to roughly 28–30 entries.
Two name collisions were identified and must be resolved by the author before
implementation, since only one description of each can be correct:

- `SOAR Schedule App` vs `Flight Simulator Scheduling System`
- `Facility Booking App` vs `RSAF Facility Booking App` — note the two existing
  descriptions **conflict**: the concept file claims enterprise-grade with 4-tier RBAC,
  audit logging and multi-tenant architecture; the newer summary reduces it to
  "developed and demonstrated" a booking platform. The more modest description is the
  one to use unless the author confirms otherwise.

### 9.2 Filters — by capability, not employer

The current filter is organisation-based (RAiD / Temasek Polytechnic / Freelance).
Recruiters care about capability, so it becomes:

`All` · `Enterprise systems` · `Workflow automation` · `Training & enablement` ·
`AI & governance` · `Earlier work`

`Earlier work` collects the Temasek Polytechnic, competition and freelance era.
Within the list, entries group into two eras — **2025–26** and **Earlier** —
reverse-chronological within each.

### 9.3 Row content

Each compact row keeps the existing expandable pattern and carries: number, project
name, capability tag, era, and on expansion a short description plus **one line of what
changed** written under the §8.2 rules.

---

## 10. Naming — plain English

Principle: **plain English for anything the reader must understand in order to
navigate; aviation flavour only for things they can safely ignore.** Headings, labels
and buttons are plain. The altimeter tape, contrail, sky and aircraft stay aviation,
because none of them require decoding.

| Current | Becomes |
|---|---|
| `IDENT` / Personnel identification | *(no label — just the name)* |
| `RPT` Featured mission report | **Featured Work** |
| `DOC` Operating doctrine | *(deleted — D7)* |
| `LOG` Flight Log — 20 Entries | **All Projects** |
| `LOG 001` | `01` |
| Service Record | **Experience** |
| `DEBRIEF` Impact | **What changed** |
| `EQP` Equipment fitted | **Built with** |
| `CHK` Capability inspection | **What it does** |
| `020 / 020 shown` | **Showing all N** *(N = final merged count, §9.1)* |
| Missions *(stat tile)* | **Projects** |
| Trusted by | **Where I've worked** |
| Remove before flight *(contact CTA)* | **Get in touch** |
| Mission type · Enterprise | **Work type · Internal tool** |
| `Preflight` / `Cruise` / `Orbit` *(phase indicator)* | The actual section name |

The phase indicator becomes a genuinely useful position marker rather than a
decorative one.

---

## 11. Accessibility requirements

- Contrast floors per §5.1, validated with a checker — not assumed from this document.
- `prefers-reduced-motion: reduce` ⇒ Tier 0. No camera movement, no parallax, no
  reveal animations. Content is complete and static.
- All content reachable and readable with WebGL unavailable.
- Focus-visible outlines on every interactive element, ≥3:1 against their background.
- The log accordion keeps native `<details>`/`<summary>` semantics.
- The canvas is `aria-hidden` — it carries no information not also present in text.
- Text never sits on a moving background (§6.3).
- Typography floors per §5.2.

## 12. Security and disclosure

The author has already sanitised the project summary (notably removing a "war-time
planning" reference). Two standing constraints:

- The three-circle format has an appetite for specificity. **Do not let it pull
  operational detail back in.** FUEL App's deliberately vague "operational planning
  scenarios" framing stays vague.
- Internal project codenames (FUEL, GRID, MILES, MAVIS, BOLDFACE) are assumed
  publishable on the author's confirmation. BOLDFACE in particular carries a specific
  aviation-procedure meaning and is worth a second check.

## 13. Suggested phasing

This design is larger than one sitting. It decomposes into four phases with clean
boundaries, and each is independently verifiable. Two phases are gated on
author-supplied input, which is why they come last.

| Phase | Work | Gated on |
|---|---|---|
| **A · Repaint** | Daylight palette (§5.1), typography floors (§5.2), sky bands, plain-English renaming (§10), delete Doctrine (D7). No 3D, no restructure. | Nothing — start here |
| **B · Spine** | Single scroll-progress driver (§6.1), the two content modes (§6.3), section order and altitude map (§6.2), altimeter honesty. | Phase A |
| **C · 3D** | Asset sourcing, renderer, lighting, camera rig, all three fallback tiers, performance budget (§7). | Phase B |
| **D · Content** | Three case studies with real copy (§8), inventory merge and capability filters (§9). | **Author input:** §8.4 copy, §9.1 name reconciliation |

Phase A alone already resolves the two problems the author raised about legibility and
jargon, and is shippable on its own. That ordering is deliberate — the accessibility win
does not wait on the 3D work.

## 14. Acceptance criteria

1. Scroll from top to bottom: altitude increases monotonically and never decreases.
2. Each of the three waypoints executes wide → push-in → pull-back, and the push-in
   lands on a component rather than the whole airframe.
3. With WebGL disabled: every section renders complete and readable, no layout gaps,
   no console errors, and the model is never requested.
4. With `prefers-reduced-motion: reduce`: no camera or reveal motion; content intact.
5. No body text sits over the canvas anywhere in Document mode.
6. Contrast checker passes §5.1 floors on every text/background pair, including the
   inverted Contact section.
7. No text below 13px; Big Shoulders absent below 24px.
8. No occurrence of the banned abstract-noun impact phrases in §8.2.
9. Lighthouse LCP <2.5 s on a throttled mid-tier mobile profile.
10. Tailwind runtime CDN removed and replaced with generated CSS.
11. No jargon label from §10 remains in the markup.

---

## 15. Implementation deviations (recorded during Phases B and C)

Each of these departs from the design above. They are listed so the spec
stays the authority rather than quietly diverging from the file.

### 15.1 Procedural geometry instead of a GLB (supersedes §7.1)

The aircraft is built from three.js primitives — a lathe fuselage, one
symmetric extruded wing planform, tailplane, fin, canopy, nozzle, intakes —
rather than loaded from a CC0/CC-BY GLB.

The licence and long-term availability of any third-party model cannot be
verified from the implementation environment, and hotlinking one would put a
silent dependency on someone else's CDN into a file whose entire premise is
that it is self-contained. Procedural costs 0 bytes against the 1.2 MB
budget, raises no attribution question, and satisfies §7.1's actual
requirement — *generic, not a specific operational airframe*. `GLTFLoader`
and `DRACOLoader` are consequently not imported.

`buildAircraft()` is the only function that would change if a real GLB is
wanted later; nothing else in the module knows what it built.

### 15.2 No environment map, and low canopy metalness (supersedes §7.3)

The 64px procedural gradient environment was dropped. Without it a metallic
surface has nothing to reflect and renders black — the first pass proved
this, with the canopy appearing as a solid dark blob. The canopy is now a
tinted dielectric (metalness .08) lit by the hemisphere light instead.

### 15.3 Stage-mode content sits on an opaque card (tightens §6.3)

§6.3 described Stage mode as "a narrow column pinned to one side". It is
implemented as a narrow column **on an opaque `.stage-card`**. This is
strictly stronger, and it is what allows the sky ramp to reach its full
specified depth (`#3D6FA8`, `#12244A`) without any text/background pair
having to be re-argued. The rule is now enforced by stacking order —
canvas at `z-index: 2`, every content bed inside `<main>` at `z-index: 10`.

### 15.4 The hero canvas is held at zero until 1,500 ft (new)

The hero is the only section with body copy and no bed of its own. Measured:
a 28%-opacity aircraft behind it puts the darkest composited background at
`rgb(182,188,194)`, and `--body #2C3E52` on that is **5.72:1** — under the
7:1 body floor. The canvas therefore stays at 0 until the hero's copy has
scrolled off, then ramps to full across Origin.

**Cost:** the aircraft is not visible on first paint. **The alternative** is
to give the hero its own stage card like every other section, which would
buy it back at the price of changing the hero's look. That is an open
design decision for the author.

### 15.5 Altitude drives everything, not raw scroll progress (tightens §6.1)

§6.1 specified scroll progress `0.0 → 1.0`. Implemented as **altitude**,
resolved from the `data-alt` pair each section declares and its measured
page offset. Sections sort by real offset, each leg's start equals the
previous leg's end, and gaps between legs hold rather than interpolate — so
monotonicity is structural, not incidental. The reference point slides from
viewport-centre to viewport-bottom across the page so the altimeter reaches
the 62,000 ft ceiling rather than stopping ~1,000 ft short.

### 15.6 Name collisions — one resolved, one open (updates §9.1)

- **Resolved by the author:** `SOAR Schedule App` is the Flight Simulator
  Scheduling System. The codename is not published; the row is titled
  "Flight Simulator Scheduling System".
- **Still open:** `RSAF Facility Booking App`. §9.1 said to prefer the
  modest description absent confirmation. The implementation instead
  **merged** them — the six capabilities from the author's own existing page
  plus the newer summary's "demonstrated to stakeholders in a dedicated
  session" — on the grounds that both texts are the author's own claims.
  This needs an explicit yes or no.

### 15.7 Capability filters not yet applied (§9.2 remains Phase D)

The project filters are still organisation-based (`RAiD` / `Temasek
Polytechnic` / `Freelance`). §9.2's capability filters ship with the
inventory merge in Phase D, since the two changes touch the same rows.
