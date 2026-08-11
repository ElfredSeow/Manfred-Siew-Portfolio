# Profile Card & Bear-Logo Palette — Design

**Date:** 2026-08-10
**Target file:** `redesign-v2.html` (four regions: the `:root` token block, the
`.hero-portrait` CSS and markup, the four role-title strings, and `.band-space`)
**Relates to:** `2026-08-08-daylight-ascent-portfolio-design.md`, which set the
"one signature, everything else quiet" rule. This document does not challenge
that rule — see §3.

---

## 1. Context

Two requests, from two references.

**The profile card.** The author supplied an F1 broadcast graphic ("Driver of the
Day": dark ground, portrait bleeding to the card edge, a two-tier name, and a
stat strip reading `STARTED 3RD / FINISHED 10TH`). The current profile card is a
padded frame around a 4:5 crop with a three-row `<dl>` beneath it. It carries
facts but has no structure and no numbers.

**The palette.** The author supplied a personal logo — a white bear's head on
near-black, inside a sky-blue rule, with navy shading and a coral tongue.

A third thing surfaced during the design conversation and is folded in here
because it cannot be separated from the card: **the page states the wrong job
title in four places.** See §5.

## 2. Goals

- The profile card adopts the reference's four-band anatomy — title bar,
  edge-bleeding portrait, identity tier, stat strip — in the page's existing
  light register.
- The stat strip carries only figures a reader can verify by scrolling this same
  page. No unsourced numbers.
- The palette shifts toward the logo without any pairing dropping below the
  contrast floors the file already documents at `redesign-v2.html:63-70`.
- The title of record appears verbatim-identically everywhere it appears.

## 3. Non-goals

- **No second signature.** The reference is a loud, dark broadcast graphic. The
  author explicitly chose *structure, not volume*: the anatomy is borrowed, the
  volume is not. The 3D aircraft remains the only loud object on the page.
- **No dark card, no dark page.** The author explicitly chose *re-tint tokens
  only* over three darker options.
- **No name on the card.** The reference's dominant tier is the driver's name,
  but `<h1>Manfred Siew.</h1>` sits directly beside this card. Two display-size
  names side by side is worse than none.
- **No mobile card.** The card stays `display:none` below 1024px, as today.
  Surfacing the stat strip on mobile is a reasonable follow-up, not this change.
- **No new dependency, no new JavaScript.** This is CSS, markup and copy.

---

## 4. The palette

### 4.1 The honest finding

Measured against the logo, the page is already in its hue family. The logo's sky
blue is 205°, its navy 214°, its coral 4°. The page's `--data` is 207°, `--deep`
221°, `--accent` 15°. Three of the five changes below are therefore cosmetically
marginal, and this spec does not pretend otherwise. **`--signal` and the new
`--sky` carry essentially all of the logo's identity.**

### 4.2 Token changes

| Token | From | To | Hue | On `--bg` | Note |
|---|---|---|---|---|---|
| `--deep` | `#12244A` | `#1B2C42` | 221° → 214° | 14.33 → **13.29** | Logo navy |
| `--data` | `#0B5FA5` | `#17618F` | 207° → 203° | 6.18 → **6.28** | Logo sky at text weight; *gains* contrast |
| `--accent` | `#9A3412` | `#A8392C` | 15° → 6° | 6.87 → **6.01** | Logo coral at text weight |
| `--accent-strong` | `#C2410C` | `#B84630` | 17° → 10° | → **4.99** | Coral partner |
| `--signal` | `#FF6B1A` | `#F5837A` | 21° → 4° | **fill only** | Most visible change |
| `--sky` | — | `#4B9BD4` | 205° | **fill/border only** | New; the logo blue, verbatim |

Every text token clears the 4.5:1 AA floor on all three light grounds. The worst
pairing in the whole set is `--accent-strong` on `--tint`, at **4.76**.

| Token | on `--bg` | on `--surface` | on `--tint` |
|---|---|---|---|
| `--accent #A8392C` | 6.01 | 6.39 | 5.73 |
| `--accent-strong #B84630` | 4.99 | 5.31 | **4.76** |
| `--data #17618F` | 6.28 | 6.68 | 5.99 |
| `--deep #1B2C42` | 13.29 | 14.14 | 12.68 |

### 4.3 The two fill-only tokens

`--signal` at `#F5837A` is 2.4:1 on `--bg` and `--sky` at `#4B9BD4` is 2.8:1.
Both are **fill tokens only** and must never carry text, exactly as `--signal`
is constrained today at `redesign-v2.html:66`. The legal pairing for each is
`--ink #0B1420` on top:

- ink on `--signal #F5837A` = **7.41** (up from 6.49 on `#FF6B1A`)
- ink on `--sky #4B9BD4` = **6.11**

### 4.4 The dark band

`.band-space` at `redesign-v2.html:171` is `linear-gradient(#2A4E7A, #12244A)`.
Only the dark stop is `--deep`, so the gradient becomes `#2A4E7A → #1B2C42`.
**The light end `#2A4E7A` does not change**, and it is the documented worst case
for every `.invert` pairing — so all of them survive untouched:

| Pairing | On `#2A4E7A` | Floor |
|---|---|---|
| `paper` `#FFFFFF` | 8.50 | 4.5 |
| `.invert .lede` `#DCE8F4` | 6.84 | 4.5 |
| `.invert .num` `#BFD4E8` | 5.59 | 4.5 |
| `.invert .on-data` `#9FD4FF` | 5.40 | 4.5 |

#### The bare band is not the binding ground

`redesign-v2.html:605-608` records the trap: `.invert .card` is
`rgba(255,255,255,.07)`, which composites over the band's light end to
**`#395A83`**, and *that* is where the accent derivative is tightest — the file
measures `#FFC9A3` at 4.77 there versus 5.72 on the bare band. Any replacement
must be checked against `#395A83`, not `#2A4E7A`.

Two accent derivatives change:

| Rule | From | To | on `#2A4E7A` | on `#395A83` |
|---|---|---|---|---|
| `.invert .on-accent`, `.invert .eyebrow`, `.invert a:hover` (`:609`, `:618`, `:621`) | `#FFC9A3` | **`#FFCFC7`** | 6.08 | **5.06** |
| `.btn-signal:hover` fill (`:628`) | `#FF8038` | **`#F79389`** | — | ink-on-fill **8.36** |

`#FFCFC7` was chosen over the closer-to-coral `#FFC2B8` (4.61 on `#395A83`)
because 4.61 leaves no margin. At 5.06 the new value is *better* than the 4.77
the page ships today.

#### One latent trap, noted and deliberately not fixed

`.invert .on-data #9FD4FF` measures **4.4966** on `#395A83` — below the floor.
It is not a live failure: no `.on-data` element currently sits inside an
`.invert .card`, and the pairing is fine at 5.40 on the bare band. It is
pre-existing, unrelated to this change, and out of scope. It is recorded here
because the next person to put an `.on-data` span inside a card on the dark band
will ship a contrast failure and the harness will not catch it — the spot-checks
at `scripts/verify-page.mjs:374` do not sample that combination.

### 4.5 The comment block must be rewritten

`redesign-v2.html:63-70` records every ratio above as prose. It is currently
accurate and must stay accurate. Updating those numbers is part of this change,
not an afterthought.

---

## 5. The four coupled title strings

The page states the author's role as **"Power Platform Developer, Student
Intern"**. Confirmed on 2026-08-10: his title of record at RAiD is **Forward
Deployed Solution Architect (Intern)**.

A prior critique finding (P1-9, recorded in
`docs/superpowers/plans/2026-08-09-dai-design-alignment.md:73`) requires the hero
and the Experience section to state the title *verbatim identically*. These four
must therefore change together:

| Line | Current | Becomes |
|---|---|---|
| `:7` | meta description | `Manfred Siew — trained in Aerospace Engineering, self-taught in software development. Forward Deployed Solution Architect (Intern) at RAiD (RSAF Agile innovation Digital). 23 projects.` |
| `:911` | `<strong>` in the hero lede | see §5.1 |
| `:955` | `<dd>` in the profile card | absorbed into the card's role bar, §6 |
| `:1922` | `<h3>` in the RAiD timeline entry | `Forward Deployed Solution Architect (Intern)` |

The three other timeline entries (`:1938` Freelance, `:1949` Temasek Polytechnic,
`:1959` own company) are different, earlier jobs and **do not change**.

### 5.1 The lede, and the decoding clause

"Forward deployed" is Palantir-derived vocabulary. The outstanding-work doc
already lists five acronyms a reviewer said they "cannot be understood as
written"; this is the same category and needs decoding on first use. It is also
the strongest thing on the page for a design-and-AI programme — embedded with the
users rather than behind a backlog is the argument the whole portfolio makes.

The clause appears **once**, in the lede. The card sits beside it and does not
repeat it. The existing aerospace sentence is the author's own voice and is
preserved verbatim; only the title and the new clause are added, and the second
em-dash becomes a comma so the sentence pair carries one dash, not two.

> **Forward Deployed Solution Architect (Intern)** at **RAiD** (RSAF Agile
> innovation Digital) — I sit inside the unit that has the problem rather than
> taking tickets from it. Trained in Aerospace Engineering, self-taught in
> software development, LLM tuning and UI/UX design, and using both sides to
> deliver rapid, agile innovation.

### 5.2 Two consequences, named

**The meta description grows to ~186 characters**, past the ~160 Google
truncates at. What gets cut is the trailing "23 projects", which is the right
thing to lose.

**The Experience blurb no longer matches its own heading.**
`redesign-v2.html:1924-1927` reads *"Specialising in Power Apps and Power
Platform within the PPCoE team. Focus on designing digital solutions that
streamline processes, improve data quality, and support data-driven
decision-making."* — that describes a developer, under a heading that will say
architect. It also understates the work: the author confirmed on 2026-08-10 that
his RAiD projects run well past Power Platform.

It is rewritten, not chipped. Every clause below traces to a row already in the
project log, so nothing here is a new claim:

> Embedded with the units that own the problem — scoping what's actually needed,
> then choosing the platform to match. Power Platform where licensing and
> governance fit; React on Dataverse, or a full-stack rebuild, where they don't.
> Plus AI agent work and the tooling the rest of the team builds on.

| Clause | Evidence in the log |
|---|---|
| *choosing the platform to match* | MILES / MAVIS, `:1518` — "proved in Power Apps first, then rebuilt as a full-stack application with Lovable once per-user licensing stopped being viable". This is the single best evidence for the architect title: a platform decision, re-made under a licensing constraint. |
| *React on Dataverse* | RSAF Facility Booking App, `:1550` / `:1562` — Dataverse + React + PowerApps Code Apps |
| *full-stack rebuild* | MILES / MAVIS, `:1518`; 815 SQN bootcamp, `:1773` |
| *AI agent work* | SAGE Copilot AI, `:1740`; R&D for Vibe-Coding Code Apps, `:1713` |
| *tooling the rest of the team builds on* | PowerDocu, `:1727`; Comprehensive Guide for New Interns, `:1780`; Code Apps Policy Approval (M365 Tenant), `:1686` |

The words are a draft in the author's voice and he may adjust them; the
constraint that survives any rewrite is that the blurb must describe **deciding**,
not only building, or it contradicts the heading above it.

### 5.3 The end-goal statement — resolved, keep the current framing

The author states his end goal is AI engineering. But the working tree has just
finished removing "moving into AI engineering" in favour of the `+` framing —
the hero pill now reads *"Aerospace Engineering + software & AI"*, and the memory
note is explicit that this must never read as a pivot away from aerospace.

**Decision, confirmed by the author on 2026-08-10: keep the current framing.**
The destination statement stays off the card and off the hero. The `+` framing
stands as the working tree has it. The card carries only verifiable
present-tense facts.

Note for a later revision: "moving into AI engineering" is a real thing the
author wants said, and the hero *thesis* — not a facts panel, and not the pill —
is the only place it can go without re-reading as a pivot away from aerospace.
That is out of scope here.

---

## 6. The card

### 6.1 Anatomy

Four bands, matching the reference top to bottom. Card keeps `--r-xl` (30px) and
`--surface`; the existing `.card card-lg` classes stay.

```
┌────────────────────────────────────┐  --surface, --r-xl, --sh-1
│  FORWARD DEPLOYED                  │  ① role bar
│  SOLUTION ARCHITECT · INTERN       │
├════════════════════════════════════┤  2px solid var(--sky)
│                                    │
│      portrait, 4:5, full-bleed     │  ②
│                                    │
├────────────────────────────────────┤  1px solid var(--line)
│  RAiD · Power Platform Centre      │  ③ identity
│  of Excellence                     │
│  Aerospace Engineering, TP         │
│  (graduated)                       │
├─────────────────┬──────────────────┤  1px solid var(--line)
│ PROJECTS        │ ORGANISATIONS    │  ④ stat strip
│ 23              │ 4                │
└─────────────────┴──────────────────┘
```

**① Role bar.** Two lines, reading `FORWARD DEPLOYED` / `SOLUTION ARCHITECT
(INTERN)`. The parenthesised form is deliberate and replaces the `·` separator
first sketched: it makes the bar's text, lowercased and whitespace-collapsed,
*byte-identical* to the title of record, so the P1-9 verbatim invariant can be
machine-checked across all three places rather than eyeballed on two.

`--tint` bed, full card width, top corners `--r-xl`. Two lines,
13px (`--fs-label`), weight 500, `letter-spacing:.08em`, uppercase,
`color:var(--data)` — **5.99:1** on the `--tint` bed it sits on. Two lines is not
a compromise; the reference's own title bar wraps to two.

**② Portrait.** The `.portrait-frame`'s `.625rem` padding is **removed** so the
crop reaches the card edges. Aspect ratio stays 4:5, ground stays `--tint`, and
the `onerror="this.hidden=true"` fallback at `redesign-v2.html:948` is preserved
— `[hidden]{display:none}` at `:126` is load-bearing for it.

**③ Identity.** Left-aligned, `1.25rem` padding. Two lines: the team at
`--ink`/600/17px, the education at `--body`/15px. Both strings are taken verbatim
from the current `<dl>`, so no fact is lost in the restructure. The `Role` row is
absorbed by band ①.

**④ Stat strip.** Two cells, 1px `--line` divider, bottom corners `--r-xl`.
Labels 13px uppercase `.08em` in `--data`; values `2.5rem`, weight 600, `--ink`,
`font-variant-numeric:tabular-nums`.

### 6.2 The numbers, and why these two

Counted from the page on 2026-08-10, not from the docs:

- **PROJECTS 23** — `grep -c 'class="[^"]*log-row'` returns 23. Matches the
  outstanding-work doc's correction that MILES / MAVIS absorbed a duplicate row.
- **ORGANISATIONS 4** — RAiD 11 · Temasek Polytechnic 8 · RSAF (other units) 3 ·
  Freelance 1 = 23. Four `data-org` filter values excluding `all`.

Both are countable by a reader scrolling to the project log. This directly
answers §4 of the outstanding-work doc, which lists six figures on the page that
a panel currently cannot check.

`FEATURED 3` was considered and dropped: the `.proof-row` chips already point at
the case studies, and a third cell at ~110px cannot hold a 13px tracked label.

### 6.3 Where the logo actually shows

`--sky #4B9BD4` appears in exactly **one** place on this card: the 2px rule under
the role bar. That restraint is the point — one hairline of the logo's blue reads
as a deliberate mark; the same blue on four edges reads as a border treatment.

### 6.4 Roundness

The card gains three internal horizontal rules, which is three new opportunities
to violate the file's own rule at `redesign-v2.html:55-61`: *nothing may point at
a 90° corner*. The rules therefore run **full-bleed edge to edge** and terminate
in the card's own radius, rather than being inset with square ends.

---

## 7. Verification

`node scripts/verify-page.mjs` — checks horizontal overflow, console errors,
broken images, the no-JavaScript path, contrast, anchor occlusion, the skip link,
and that no external dependency has reappeared. Exit 0 required.

Additionally, by hand:

1. Every ratio in §4 re-measured against the edited file, and the comment block
   at `:63-70` updated to match.
2. `grep -c 'Power Platform Developer, Student Intern'` returns **0**.
3. The title string at `:911` and at `:1922` is byte-identical (P1-9).
4. Portrait `onerror` still collapses the crop rather than rendering a broken
   image box.
5. Print stylesheet at `:840` still forces `--ink` on unpainted paper.
