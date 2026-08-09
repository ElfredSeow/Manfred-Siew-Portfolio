# DAI Design Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the design of `redesign-v2.html` so the page demonstrates the three things SUTD DAI states it values — "designing with AI to serve human needs", a "user-centred innovation process", and hands-on prototyping — instead of reading as a job-hunt page for a low-code developer.

**Architecture:** Single self-contained HTML file. All changes are surgical edits to `redesign-v2.html`: a narrative reframe of the hero, an evidence/imagery layer using assets already in `public/`, a design-process spine inside each featured case study, a plain-language decoding pattern for acronyms, and repair of the fallback/mobile/contrast failures found in the 2026-08-09 critique (snapshot: `.impeccable/critique/2026-08-09T07-09-29Z__redesign-v2-html.md`).

**Tech Stack:** Vanilla HTML/CSS/JS, three.js (existing jet scene), Playwright (verification only, via `npx`), the impeccable detector (verification only).

## Global Constraints

- **Design language is locked:** minimal, smooth, round. The radius scale (`--r-xs:8px … --r-pill:999px`), the token palette at lines 101–123, the single ease-out curve `--e-out`, and the jet as the one signature element all stay. No new decorative elements.
- **The reveal discipline stays:** default state of any content is VISIBLE; `html.js` is the only thing allowed to hide-then-reveal; every new animated element keeps the `prefers-reduced-motion` fallback pattern already at lines 478–487.
- **No new CDNs.** Task 10 removes `cdn.tailwindcss.com`. Google Fonts and unpkg/three.js stay for now (removing them is out of scope).
- **Author-copy chips are a submission blocker, not a design task.** The 11 `.needs-copy` chips mark content only Manfred can write. This plan restructures the slots they sit in (Task 4) but does NOT invent copy for them. The page must not be submitted anywhere until every chip is replaced — the chips themselves were rejection ground P0-1.
- **DAI evidence targets** (from https://www.sutd.edu.sg/dai/, fetched 2026-08-09): every featured case study must answer, visibly on the page: *whose need* ("designing with AI to serve human needs"), *what process* ("user-centred innovation process"), *what prototype/artifact* ("working prototype in just 12 weeks"), and *what the AI actually does* ("AI is a mindset, not just a tool").
- Spelling: use "learned" everywhere (page already uses it in headers); sentence-case headings; maximum 2 em-dashes in body copy per section (detector flagged 22 total).
- Verification commands used throughout:
  - Detector: `node "C:\Users\manfr\.claude\skills\impeccable\scripts\detect.mjs" --json redesign-v2.html`
  - Render check: the Playwright script written in Task 12.

---

### Task 1: Reframe the hero from job hunt to design+AI narrative

**Files:**
- Modify: `redesign-v2.html:540-583` (hero badge, h1 block, stat tiles)

**Interfaces:**
- Consumes: existing tokens `--accent`, `--data`, `--r-pill`, existing `.chip` styles.
- Produces: a `#hero-thesis` paragraph and three `.proof` anchor chips other tasks link to (`#featured`, `#log`, `#path` — verify the actual section `id`s at lines 652, 928, 1263 and use those).

- [ ] **Step 1: Read the current hero** — Read `redesign-v2.html:505-610` so edits anchor on real markup, not this plan's paraphrase.

- [ ] **Step 2: Replace the "Open to work" badge copy.** The badge at ~line 543 currently reads "Open to work — AI & software engineering, Singapore". Replace the text content with:

```html
Aerospace → AI · building with people in the loop
```

Keep the existing badge element, classes, and dot styling — copy change only.

- [ ] **Step 3: Replace the 4-up stat-tile grid (lines ~566–583) with a thesis + proof row.** The stat tiles ("20 Projects / 2 Day build / 35 People trained / 3 Organisations") are the hero-metric template and house the page's least defensible numbers (critique P1-6, P1-10, R4). Replace the entire grid with:

```html
<p id="hero-thesis" class="hero-thesis">
  I train people and build tools where software meets a human being under
  pressure — a technician signing off a jet, a clerk chasing a receipt,
  a cohort learning to build with AI. The interesting problem is never
  the automation; it is the person the automation has to serve.
</p>
<nav class="proof-row" aria-label="Jump to evidence">
  <a class="chip proof" href="#featured">Three case studies, with process</a>
  <a class="chip proof" href="#log">The full build log</a>
  <a class="chip proof" href="#path">Aerospace → software path</a>
</nav>
```

(Adjust the three `href`s to the real section ids found in Step 1. The thesis paragraph is draft voice — flag it to the author for rewrite in their own words, but it is structurally final.)

- [ ] **Step 4: Add the supporting CSS** in the main `<style>` block, near the existing hero rules:

```css
.hero-thesis{max-width:56ch;font-size:1.25rem;line-height:1.6;color:var(--body)}
.proof-row{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1.25rem}
.chip.proof{border:1px solid var(--rule);border-radius:var(--r-pill);
  padding:.45rem .9rem;font-size:var(--fs-label);color:var(--body);
  text-decoration:none;transition:border-color var(--d-hover) ease}
.chip.proof:hover{border-color:var(--accent)}
```

- [ ] **Step 5: Honest titles.** The hero/profile call the author "AI & software engineer (trainee)" / "Aspiring AI & software engineer" (~546–559, 597) while the actual role is "Power Platform Developer, Student Intern" (~1275) — critique P1-9. Replace both hero/profile title strings with the real role plus trajectory, e.g. `Power Platform developer (intern) — moving into AI engineering`. The credential must match the Experience section verbatim on role, with trajectory expressed as trajectory.

- [ ] **Step 6: Verify** — open the file in a browser (or run the Task 12 script): hero shows badge → name → thesis → three chips; no stat tiles remain. `grep -n "Day build" redesign-v2.html` returns nothing; `grep -n "AI & software engineer" redesign-v2.html` returns nothing.

- [ ] **Step 6: Commit** — `git add redesign-v2.html && git commit -m "Reframe hero: thesis + proof chips replace stat-tile template"`

---

### Task 2: Ship the evidence layer (imagery from public/)

**Files:**
- Modify: `redesign-v2.html` (featured cards at ~661–880; Transition path at ~1263)
- Uses (already on disk, verify names with `ls public/`): `public/WorkCICO Screenshot.jpg`, `public/facility-infographic.jpg`, `public/huawei-track-cert.jpg`

**Interfaces:**
- Produces: a `.shot` figure component reused by any future case study.

- [ ] **Step 1: Add the figure component CSS** next to the existing `.card` rules:

```css
.shot{margin:1.25rem 0 0;border:1px solid var(--line);border-radius:var(--r-md);
  overflow:hidden;background:var(--surface);box-shadow:var(--sh-1)}
.shot img{display:block;width:100%;height:auto}
.shot figcaption{padding:.6rem .9rem;font-size:var(--fs-label);
  color:var(--muted);border-top:1px solid var(--line)}
```

- [ ] **Step 2: Place the WorkCICO screenshot** inside the featured card whose log entry it belongs to (identify which featured/log project WorkCICO is — if it maps to none of the three featured cards, place it in that project's log row instead and note the mismatch to the author). Markup:

```html
<figure class="shot">
  <img src="public/WorkCICO Screenshot.jpg" loading="lazy"
       alt="WorkCICO check-in screen: the attendance flow as a user sees it"
       onerror="this.closest('figure').hidden=true">
  <figcaption>The shipped interface — what a user actually sees. (Author: confirm which project this belongs to.)</figcaption>
</figure>
```

- [ ] **Step 3: Place `facility-infographic.jpg`** the same way in its matching project (likely the Facility Booking entry, ~line 996 area — verify). Same `.shot` pattern, alt text describing what the infographic shows.

- [ ] **Step 4: Place `huawei-track-cert.jpg`** in the Transition path / Experience section (~1263+) as third-party validation — the critique's P1-7 found zero external assessment anywhere:

```html
<figure class="shot shot--cert">
  <img src="public/huawei-track-cert.jpg" loading="lazy"
       alt="Huawei track certificate — external assessment of completed training"
       onerror="this.closest('figure').hidden=true">
  <figcaption>Externally assessed — one of the few claims on this page somebody else graded.</figcaption>
</figure>
```

Add `.shot--cert{max-width:28rem}` to CSS so the certificate doesn't render full-bleed.

- [ ] **Step 5: Fix the destructive portrait handler.** At line ~591–593, replace `onerror="this.closest('aside').remove()"` with `onerror="this.hidden=true"` so a failed image load no longer deletes the Role/Team/Education card (critique P1-17).

- [ ] **Step 6: Verify** — Task 12 script (or manual browser open): all three images render; break one filename temporarily and confirm only the figure hides, then restore it. `grep -c "closest('aside').remove" redesign-v2.html` returns 0.

- [ ] **Step 7: Commit** — `git commit -am "Ship evidence layer: project screenshots, certificate, non-destructive image fallback"`

---

### Task 3: Design-process spine in each featured case study

This is the single highest-leverage DAI change: their page showcases "user-centred innovation process"; ours currently shows outcome-blurbs.

**Files:**
- Modify: `redesign-v2.html:661-880` (all three featured cards)

**Interfaces:**
- Produces: a `.process` ordered-list component; replaces the "Featured 1 of 3 / 2 of 3 / 3 of 3" scaffold labels.

- [ ] **Step 1: Read all three featured cards** (`redesign-v2.html:652-890`) to map the existing prose and chip slots to the new spine.

- [ ] **Step 2: Add the component CSS:**

```css
.process{list-style:none;counter-reset:step;margin:1.25rem 0 0;padding:0;
  display:grid;gap:.75rem}
.process li{counter-increment:step;display:grid;
  grid-template-columns:auto 1fr;gap:.75rem;align-items:baseline}
.process li::before{content:counter(step);font-family:"IBM Plex Mono",monospace;
  font-size:var(--fs-label);color:var(--accent);border:1px solid var(--rule);
  border-radius:var(--r-pill);width:1.6rem;height:1.6rem;display:grid;
  place-items:center}
.process b{color:var(--ink);font-weight:600}
```

This numbered sequence is legitimate (it IS a real ordered process — the ban is on decorative numbering), and it **replaces** the "1 of 3" waypoint labels: delete those three labels (~lines 655/742-ish/819-ish, verify exact) in this step.

- [ ] **Step 3: Restructure each featured card body** into this six-beat spine, redistributing the existing prose sentences into the beats they already answer and moving each `.needs-copy` chip into the beat it belongs to (chips for role → beat 3, obstacle → beat 4, verification → beat 5, honest line → beat 6). Template (repeat per card, with that card's real prose):

```html
<ol class="process">
  <li><b>The person.</b> Who hit the problem and what it cost them. [existing problem prose]</li>
  <li><b>Framing.</b> What I decided the problem actually was, and what I ruled out. [existing/author]</li>
  <li><b>My role.</b> [author chip: role, team size, timeline, hard constraint]</li>
  <li><b>Iteration.</b> What the first version got wrong and what changed. [author chip: one obstacle handled alone]</li>
  <li><b>Validation.</b> [author chip: who used it, signed it off, or tested it]</li>
  <li><b>What I'd do differently.</b> [author chip: one honest line]</li>
</ol>
```

No card may lose a sentence of existing real prose — only relocation.

- [ ] **Step 4: Add a one-line orientation sentence at the top of each featured card**, directly under the h2, for the three unclear names (critique R1/R5). These need author confirmation but ship with best-available plain wording flagged for review:

```html
<p class="context">[FUEL Up: one plain sentence — what the tool is, for whom. AUTHOR MUST CONFIRM]</p>
```

```css
.context{font-size:1rem;color:var(--muted);max-width:60ch;margin:.25rem 0 0}
```

Do NOT guess what MILES/MAVIS stands for — insert the slot with the chip pattern and flag it. An unexplained flagship name was standalone rejection ground R1.

- [ ] **Step 5: Verify** — each featured card renders: h2 → context line → process spine (6 numbered beats) → `.shot` figure (from Task 2). "1 of 3" appears nowhere: `grep -n "of 3" redesign-v2.html` → 0 hits.

- [ ] **Step 6: Commit** — `git commit -am "Featured cards: six-beat design-process spine replaces waypoint scaffold"`

---

### Task 4: "What the AI actually does" block

**Files:**
- Modify: `redesign-v2.html` — the three featured cards (Task 3 structure) and AI-claiming log rows (~997, 1037, 1129–1163, 1192–1200)

**Interfaces:**
- Produces: an `.ai-role` component; a rule other tasks obey: coding assistants never appear in "Built with" chips again.

- [ ] **Step 1: Add the component:**

```css
.ai-role{margin:1rem 0 0;padding:.9rem 1rem;border:1px solid var(--line);
  border-radius:var(--r-sm);background:var(--tint);display:grid;gap:.35rem}
.ai-role dt{font-size:var(--fs-label);color:var(--muted)}
.ai-role dd{margin:0;color:var(--body)}
```

```html
<dl class="ai-role">
  <dt>Human need</dt><dd>[one line: whose problem]</dd>
  <dt>What the AI does in the product</dt><dd>[one line, or "Nothing — AI assisted the build, not the product"]</dd>
  <dt>What I did</dt><dd>[one line: the judgment the human applied]</dd>
</dl>
```

- [ ] **Step 2: Insert one `.ai-role` block per featured card** (after the process spine), and in the two log rows where AI is in the product (the Colab flowchart bot ~1192–1200; the SAGE/Copilot entry ~1155–1163 — that one's dd values are author-input, flag them).

- [ ] **Step 3: Purge coding assistants from "Built with" chips.** In log rows ~997, ~1037, ~1129–1137: remove "Gemini 3.1", "Claude Opus 4.6", "GitHub Copilot", "Google AI Studio", "Lovable" from tech-stack chip lists. Where relevant, the row's `.ai-role` dd says "AI-assisted build" instead. Also remove the non-technology chips flagged in critique P2-27 ("Digitalisation", "Agile App Dev", "Documentation", "Mentoring", "Stress Management", "Cloud Tech") — chips list technologies only.

- [ ] **Step 4: Define "vibe-coding" at first use** (~line 1129/1134): follow the term with a plain-language clause in the same sentence, e.g. `vibe-coding (directing AI coding agents from spec to working app, reviewing everything they produce)`. Author may reword; the definition must exist.

- [ ] **Step 5: Verify** — `grep -in "copilot\|gemini\|claude\|lovable" redesign-v2.html` matches only inside `.ai-role` dds or prose explanations, never inside chip lists.

- [ ] **Step 6: Commit** — `git commit -am "AI-role blocks: separate AI-in-product from AI-assisted-build"`

---

### Task 5: Plain-language decoding pass (acronyms)

**Files:**
- Modify: `redesign-v2.html` — first use of each acronym (~599, 1048, 1147, 1160, 1168)

- [ ] **Step 1: Expand at first use, `<abbr>` thereafter.** For each of: RAiD, PPCoE, SSB, Cydef, 815 SQN, SAGE / ME5 / Delta Agent — write the expansion into the first occurrence in the pattern `Power Platform Centre of Excellence (PPCoE)` style. **Where the true expansion is not certain, do not guess** — insert `<mark class="needs-copy">expand: [ACRONYM]</mark>` using the page's existing chip class so it joins the author's to-do list visibly. Any expansion that is service-internal and shouldn't be published: author replaces the acronym with a generic descriptor ("a maintenance squadron") instead.

- [ ] **Step 2: Add a context line to the two unintelligible log rows** (critique R2, R3): the SAGE/Copilot row (~1155–1163) and the GPT-4.1-replication row (~1161) each get a `.context` line slot (component from Task 3) with a `needs-copy` chip — these were flagged "cannot be understood as written"; only the author can fix the substance, but the design must give the fix a visible home.

- [ ] **Step 3: Verify** — every acronym from the list either has a first-use expansion or a visible chip: `grep -n "PPCoE\|SSB\|Cydef\|815 SQN\|ME5" redesign-v2.html` and inspect each hit.

- [ ] **Step 4: Commit** — `git commit -am "Decode acronyms at first use; chip the ones only the author can expand"`

---

### Task 6: Fix the fallback failures (no-JS contact, print, disabled pills)

**Files:**
- Modify: `redesign-v2.html:148-152` (.band), `~260-262` (.pill), `~1326` (.invert), end of style block (print)

- [ ] **Step 1: Make the band reveal JS-gated, not JS-dependent.** Change `.band{opacity:0 …}` (line ~149) to the same discipline as `[data-reveal]`:

```css
.band{opacity:1}
html.js .band{opacity:0;transition:opacity .5s var(--e-out)}
```

(Keep the existing JS that sets opacity — it now only ever runs when `html.js` exists.)

- [ ] **Step 2: Give `.invert` its own ground.** At ~line 1326 the contact section paints light text with no background. Add to its CSS: `.invert{background:var(--deep)}` so white/`#DCE8F4` text always sits on `#12244A` regardless of band state. Check the section's border-radius matches the radius system (`--r-lg` or `--r-xl` to fit neighbors).

- [ ] **Step 3: Print stylesheet.** Append:

```css
@media print{
  .sky,#scene,canvas{display:none!important}
  .band,[data-reveal]{opacity:1!important;transform:none!important}
  .transit{display:none}
}
```

- [ ] **Step 4: Fix disabled-pill contrast** (~260–262, computed 3.3:1 and 2.1:1 in the critique). Remove the opacity dimming; signal "disabled" with a dashed border instead:

```css
.pill[disabled]{opacity:1;color:var(--muted);border-style:dashed;cursor:not-allowed}
.pill[disabled] .pill-count{opacity:1;color:var(--muted)}
```

`--muted #55697E` on white is 5.3:1 — passes. Verify the actual selector names at lines 260–262 before editing.

- [ ] **Step 5: Verify no-JS** — run the Task 12 script's no-JS pass (or temporarily rename the `js` class-adding line): Contact section must be fully readable. Print preview (Ctrl+P): every section legible, no white-on-white.

- [ ] **Step 6: Commit** — `git commit -am "Fallback repair: contact readable without JS, print styles, pill contrast to 5.3:1"`

---

### Task 7: Wayfinding — mobile nav, skip link, occlusion

**Files:**
- Modify: `redesign-v2.html:514-525` (nav), `<body>` open tag area (skip link), style block

- [ ] **Step 1: Skip link** as first child of `<body>`:

```html
<a class="skip" href="#featured">Skip to case studies</a>
```

```css
.skip{position:absolute;left:-9999px;top:0;z-index:3;background:var(--surface);
  border:1px solid var(--rule);border-radius:var(--r-pill);padding:.5rem 1rem}
.skip:focus-visible{left:1rem;top:1rem}
```

(z-index 3 = one above `#scene`'s 2, consistent with the documented scale at line 154.)

- [ ] **Step 2: Mobile nav.** The links at ~517 are `hidden … md:flex` with no mobile alternative. Replace the Tailwind visibility classes with a horizontally scrollable pill row on small screens (no hamburger — fits "minimal, smooth, round"):

```css
.nav-links{display:flex;gap:.25rem;overflow-x:auto;scrollbar-width:none;
  -webkit-overflow-scrolling:touch}
.nav-links::-webkit-scrollbar{display:none}
```

Give the link container `class="nav-links"`, remove `hidden`/`md:flex` from it. Check the pill nav's max-width still fits at 390px; if the name + links overflow, let the name shrink (`.nav h?{flex-shrink:1;min-width:0;text-overflow:ellipsis;overflow:hidden;white-space:nowrap}` on the real element).

- [ ] **Step 3: Anchor occlusion.** Content scrolls under the floating nav pill. Add: `section[id],h2[id]{scroll-margin-top:5.5rem}` (tune to the pill's real height + gap).

- [ ] **Step 4: Verify** at 390px (Task 12 script): all section links reachable and tappable on mobile; Tab from page-load reveals the skip link; anchor jumps land headings fully below the nav pill.

- [ ] **Step 5: Commit** — `git commit -am "Wayfinding: skip link, scrollable mobile nav, scroll-margin under floating nav"`

---

### Task 8: Layout rhythm — reclaim the empty sky, teach the metaphor

**Files:**
- Modify: `redesign-v2.html:413-414` (.transit), `~735, ~809` (transit divs), flight JS (~1536-1623)

- [ ] **Step 1: Cut transits from 40vh to 14vh.** Change the `.transit` height at ~413–414. ~80vh of blank scroll was critique P1-21; 2×14vh keeps a breath between case studies without an empty screenful.

- [ ] **Step 2: Re-tune the camera timeline.** Read the Flight/scroll-mapping JS (~1536–1623): the camera keyframes are driven by scroll position, so shortening transits compresses two flight segments. Adjust the affected segment breakpoints so the jet's turn still completes within the shorter band (exact values depend on the timeline structure found — the acceptance test is Step 4, not a magic number).

- [ ] **Step 3: Teach the conceit in one line.** The flight metaphor lives only in code comments (heuristic #1 finding). Add a single muted line under the intro section's heading (~627 area):

```html
<p class="context">The jet outside the cards flies the same route this page tells — training, then climb, then handover.</p>
```

(Author may reword; one sentence maximum; delete rather than expand if it fights the layout.)

- [ ] **Step 4: Verify** — scroll the full page at 1440px: no viewport-height stretch of contentless sky; the jet transition still resolves before the next section arrives; total `scrollHeight` drops meaningfully from the measured 11,882px baseline.

- [ ] **Step 5: Commit** — `git commit -am "Layout rhythm: 14vh transits, retuned camera segments, one-line metaphor key"`

---

### Task 9: Project log usability + data integrity

**Files:**
- Modify: `redesign-v2.html:928-1255` (log section, pills ~939-963), `~344` (.lorg), `~908-917` (Security bullets), `~1274` (tenure), `~1286-1300` (experience order)

- [ ] **Step 1: Resolve the category contradictions (critique P0-5).** Add the three featured projects as log rows with real category tags: MILES/MAVIS → "Full-stack platforms" (enable that pill, remove `disabled` and "— in preparation"), Flight Simulator Scheduling System is already at ~1030 → tag it "Simulation & decision support" and enable that pill too. Update the section heading "Twenty, filterable two ways." (~930) to the true count after adding rows ("Twenty-three, filterable two ways.").

- [ ] **Step 2: Fix the phantom reference.** "Project Management Tracker" (~909) appears in no log row: either it is a real project → add a log row for it (author supplies the two-line description via a `needs-copy` chip), or it is a misnaming of an existing row → rename the bullet to the row's name. Do not leave a named artifact that exists nowhere.

- [ ] **Step 3: Unify names and de-duplicate.** "FlightSim Code App" (~908) → "Flight Simulator Scheduling System" (match ~1030). Remove the duplicate PowerDocu claim from the Security bullets (~916–917) — it keeps its own log row (~1141) only; and reconcile "for personal use" vs "for citizen developers" (~1147–1148) by deleting whichever the author says is wrong (chip it if unknown).

- [ ] **Step 4: Kill the stale tenure math.** ~1274: replace "Oct 2025 — Present · 7 months" with "Oct 2025 — Present" (no computed duration anywhere on a static page). Fix experience order (~1286 vs ~1296): strictly reverse-chronological by start date.

- [ ] **Step 5: Mobile log legibility.** Remove `.lorg{display:none}` (~344); render the org as a small chip under the row title on narrow screens instead:

```css
@media (max-width:640px){.lorg{display:inline-block;font-size:var(--fs-label);
  color:var(--muted);margin-top:.15rem}}
```

(Adapt to the real row markup — the requirement is: org visible at 390px without opening the row.)

- [ ] **Step 6: Add an "All" reset affordance** to the filter pills: a first pill "All 23" that clears both axes (wire into the existing filter JS at ~1399–1437, reusing its deselect path).

- [ ] **Step 7: Source or soften every bare number.** Critique P1-12 and P1-7: "manage attendance of 500 students" (~1105), "reduced development time from months to days" (~1135), the impact claim filed under "What I learned" (~1069), and every Competitions row lacking an outcome (~1204–1253). For each: if the author can source it, append the source in-line (`— per [who measured it]` as a `needs-copy` chip); if not, soften to what is verifiable ("attendance for a ~500-student cohort" → chip; "months to days" → "cut a multi-week manual process to days" → chip). Move the ~1069 impact claim out of "What I learned" into the row's outcome line, and give each competition row an outcome slot chip ("placed / not placed / what was assessed"). No number ships without either a source or a hedge the author signed off.

- [ ] **Step 8: Verify** — no `disabled` pills remain unless genuinely empty; clicking All shows 23 rows; at 390px each row shows its org; `grep -n "7 months" redesign-v2.html` → 0; every bare metric now carries a source, a hedge, or a visible chip.

- [ ] **Step 9: Commit** — `git commit -am "Log integrity: featured projects join the log, filters truthful, orgs visible on mobile"`

---

### Task 10: Remove the Tailwind Play CDN

**Files:**
- Modify: `redesign-v2.html:22` (script tag) and every element carrying Tailwind utility classes

- [ ] **Step 1: Inventory the utilities actually used.** Run:

```bash
node -e "const s=require('fs').readFileSync('redesign-v2.html','utf8');const m=[...s.matchAll(/class=\"([^\"]+)\"/g)].flatMap(x=>x[1].split(/\s+/));console.log([...new Set(m)].sort().join('\n'))"
```

Separate the list into (a) the page's own classes and (b) Tailwind utilities (`hidden`, `md:flex`, `grid`, `gap-*`, `px-*`, etc.).

- [ ] **Step 2: Write static equivalents.** For each Tailwind utility in use, add a real rule to the page's own stylesheet (most were already replaced by Tasks 1–9's components; expect the remainder to be a handful of layout utilities on the nav and hero grid). Name them semantically (`.nav-bar`, `.hero-grid`), not utility-style.

- [ ] **Step 3: Delete line 22** (`<script src="https://cdn.tailwindcss.com">`).

- [ ] **Step 4: Verify** — hard-refresh with DevTools network tab: zero requests to cdn.tailwindcss.com; layout identical at 1440px and 390px (Task 12 screenshots before/after diff). Also fix the self-containment comment at ~1628–1634 to stop claiming a principle the file breaks — reword to name the two remaining external deps (fonts, three.js) honestly.

- [ ] **Step 5: Commit** — `git commit -am "Remove Tailwind Play CDN; page owns its stylesheet"`

---

### Task 11: Shareability + copy hygiene

**Files:**
- Modify: `redesign-v2.html` `<head>` (~1-22), body copy (em-dashes), eyebrows (~180-186 and section labels)

- [ ] **Step 1: Favicon + social meta** in `<head>`:

```html
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✈️</text></svg>">
<meta property="og:title" content="Manfred Siew — Aerospace to AI Engineering">
<meta property="og:description" content="Case studies in building human-centred tools with AI: process, prototypes, and what the AI actually does.">
<meta property="og:type" content="website">
<meta property="og:image" content="public/WorkCICO Screenshot.jpg">
<meta name="twitter:card" content="summary_large_image">
```

(`og:image` must become an absolute URL at deploy time — leave a one-line HTML comment saying so.)

- [ ] **Step 2: Em-dash pass.** Detector counted 22 in body copy (AI-cadence tell, compounding the ghost-written P0). Rewrite body-copy em-dashes down to ≤6 page-wide: replace with periods, commas, or parentheses. Do not touch em-dashes inside date ranges.

- [ ] **Step 3: Eyebrow reduction.** An `.eyebrow` sits above every section (~626, 655, 671, 902, 929, 1264, 1330). Keep at most two as deliberate voice (suggest: the featured-section opener and Contact); delete the rest — the h2s carry the structure now that Task 3's process spine exists.

- [ ] **Step 4: Spelling sweep.** `Learnt` → `Learned` at ~1023, 1148, 1250 (match headers at 629).

- [ ] **Step 5: Verify** — detector re-run: `em-dash-overuse` no longer fires; link pasted into a Slack/WhatsApp preview shows title+image (or verify tags with a metadata checker); `grep -c "Learnt" redesign-v2.html` → 0.

- [ ] **Step 6: Commit** — `git commit -am "Shareability meta, em-dash and eyebrow reduction, spelling sweep"`

---

### Task 12: Full verification pass

**Files:**
- Create: `scripts/verify-page.mjs` (throwaway-quality is fine; it stays for reuse)

- [ ] **Step 1: Write the check script:**

```js
// scripts/verify-page.mjs — render checks for redesign-v2.html
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
const url = pathToFileURL('redesign-v2.html').href;
const checks = [];
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto(url); await p.waitForTimeout(2500);
  const m = await p.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    height: document.documentElement.scrollHeight,
    imgsBroken: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src),
  }));
  checks.push({ width: w, ...m, errors });
  await p.screenshot({ path: `scratch-${w}.png`, fullPage: false });
  await b.close();
}
// no-JS pass: contact must be readable
const b = await chromium.launch();
const p = await b.newPage({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
await p.goto(url);
const contact = await p.evaluate(() => {
  const el = document.querySelector('.invert');
  if (!el) return { found: false };
  const cs = getComputedStyle(el);
  return { found: true, bg: cs.backgroundColor, color: cs.color, opacity: getComputedStyle(el.closest('.band') ?? el).opacity };
});
checks.push({ nojs: contact });
await b.close();
console.log(JSON.stringify(checks, null, 2));
```

- [ ] **Step 2: Run it** — `npx playwright install chromium` if needed, then `node scripts/verify-page.mjs`. Pass criteria: `overflow:false` at both widths, `imgsBroken` empty, `errors` empty, no-JS `.invert` has a non-transparent dark `bg` and band `opacity` "1".

- [ ] **Step 3: Detector re-run** — `node "C:\Users\manfr\.claude\skills\impeccable\scripts\detect.mjs" --json redesign-v2.html`. Acceptable remaining findings: `overused-font` only (fonts are a deliberate identity keep). `em-dash-overuse` must be gone.

- [ ] **Step 4: Re-critique** — run `/impeccable critique redesign-v2.html` and compare against the 2026-08-09 snapshot (20/40, 5×P0, 17×P1). Target: zero P0s attributable to design (the author-copy chips remain the only open P0 until Manfred writes the copy), heuristics #2, #9, #10 each up by ≥1.

- [ ] **Step 5: Commit** — `git add scripts/verify-page.mjs && git commit -am "Verification pass: render checks, detector, re-critique"`

---

## Out of scope (recorded so nobody "helpfully" does them)

- Writing the 11 author-copy chips, the MILES/MAVIS and FUEL Up definitions, or the SAGE row substance — author-only; the page is unsubmittable until done.
- Replacing Instrument Sans / IBM Plex Mono — identity is committed; revisit only if the author asks.
- Removing Google Fonts or the three.js/unpkg dependency, or deleting the jet — the jet is the page's one signature element and stays.
- Any "why SUTD / why DAI" personal-statement section — worth discussing with the author, but it is content strategy, not this design plan.
- Varying the entrance animation per section (critique P1-20, the uniform fade-up): consciously deferred. The reveal is correctly built (visible default, reduced-motion handled); differentiating it is polish that should wait until the content above is real, then run through `/impeccable animate`.
