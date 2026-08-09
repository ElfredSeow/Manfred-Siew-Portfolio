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

One `.invert` value changes, because it is an accent derivative:
`.invert .on-accent` and `.invert .eyebrow` shift `#FFC9A3` → **`#FFC2B8`**,
which measures **5.53** on `#2A4E7A` — above the 4.9 the file records today.
`.invert a:hover` at `redesign-v2.html:621` uses the same `#FFC9A3` and moves
with it.

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
Platform within the PPCoE team"* — that describes a developer, under a heading
that will say architect. It needs to describe scoping and designing instead.
Those are the author's words to write, so implementation adds a `needs-copy`
chip rather than inventing them.

### 5.3 Open question left to the author

The author states his end goal is AI engineering. But the working tree has just
finished removing "moving into AI engineering" in favour of the `+` framing —
the hero pill now reads *"Aerospace Engineering + software & AI"*, and the memory
note is explicit that this must never read as a pivot away from aerospace.

**Decision: the destination statement is left off the card.** The card carries
only verifiable present-tense facts. If the author wants the goal stated, the
hero thesis is where it belongs, not a facts panel.

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
│  (studying)                        │
├─────────────────┬──────────────────┤  1px solid var(--line)
│ PROJECTS        │ ORGANISATIONS    │  ④ stat strip
│ 23              │ 4                │
└─────────────────┴──────────────────┘
```

**① Role bar.** `--tint` bed, full card width, top corners `--r-xl`. Two lines,
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
