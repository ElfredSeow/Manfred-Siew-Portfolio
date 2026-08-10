# Profile Card & Bear-Logo Palette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-tint `redesign-v2.html` toward the author's bear logo, rebuild the profile card on the four-band anatomy of an F1 broadcast card, and correct the job title everywhere it appears.

**Architecture:** One self-contained HTML file with its own `<style>` block and no build step or external dependency. All work happens in four regions of that file: the `:root` token block, the `.invert` dark-band rules, the `.hero-portrait` CSS + markup, and four copy strings. The test harness is `scripts/verify-page.mjs`, a Playwright script that loads the file over `file://` and asserts render, contrast, and accessibility properties. Each task extends that harness with a check that fails *before* the change and passes after — that is the red-green cycle here, because there is no unit-test framework for a single HTML document.

**Tech Stack:** Plain HTML/CSS. Node 18+. Playwright (already in `devDependencies`). No package installs required.

## Global Constraints

Copied verbatim from `docs/superpowers/specs/2026-08-10-profile-card-and-palette-design.md`. Every task's requirements implicitly include this section.

- **No new dependency, no new JavaScript, no build step.** This is CSS, markup and copy only.
- **No second signature.** The 3D aircraft stays the only loud object. Structure is borrowed from the F1 reference; volume is not.
- **The page stays light.** No dark card, no dark page.
- **Contrast floor is 4.5:1** for every text pairing, matching `CONTRAST_MIN` in `scripts/verify-page.mjs:42`.
- **`--signal` and `--sky` are fill-only tokens.** They must never carry text. Their only legal pairing is `--ink #0B1420` on top.
- **The binding dark ground is `#395A83`,** not `#2A4E7A` — `.invert .card` is `rgba(255,255,255,.07)` and composites to it. Check accent derivatives there.
- **P1-9 verbatim invariant:** the title of record must be byte-identical in the hero lede and the Experience heading, and must match the card's role bar after lowercasing and whitespace-collapsing.
- **Title of record:** `Forward Deployed Solution Architect (Intern)`.
- **Roundness rule (`redesign-v2.html:55-61`):** nothing may point at a 90° corner. Horizontal rules run edge-to-edge and terminate in the parent's radius; never inset with square ends.
- **The comment block at `redesign-v2.html:63-70` is a contract.** It states every contrast ratio in prose. If a ratio changes, that block changes in the same commit.
- **Line numbers in this plan drift as tasks apply.** Every location is given with an anchor string to search for. Trust the string, not the number.

---

## File Structure

| File | Responsibility | Tasks |
|---|---|---|
| `redesign-v2.html` — `:root` block | Colour tokens | 1 |
| `redesign-v2.html` — `.invert` rules | Dark-band accent derivatives | 1 |
| `redesign-v2.html` — comment block `:63-70` | The documented contrast contract | 1, 5 |
| `redesign-v2.html` — `.hero-portrait` CSS | Profile card presentation | 3 |
| `redesign-v2.html` — `<aside class="hero-portrait">` | Profile card markup | 3 |
| `redesign-v2.html` — 4 copy strings | Title of record + Experience blurb | 2, 4 |
| `scripts/verify-page.mjs` — `samples` object | Live contrast spot-checks | 1, 3 |
| `scripts/verify-page.mjs` — new checks | Token values, title invariant, stat integrity | 1, 2, 3 |
| `docs/redesign-v2-outstanding-work.md` | Author-facing status | 5 |

**Task order is load-bearing.** Task 3 consumes tokens defined in Task 1. Task 3 deletes the `<dd>` that Task 2 would otherwise have to edit, so Task 2 covers only the three non-card strings.

---

## Task 1: Palette tokens

**Files:**
- Modify: `redesign-v2.html` — `:root{` block, `.band-space`, three `.invert` rules, `.btn-signal:hover`, comment block
- Test: `scripts/verify-page.mjs` — add a `palette_tokens` check

**Interfaces:**
- Consumes: nothing.
- Produces: CSS custom properties `--deep`, `--data`, `--accent`, `--accent-strong`, `--signal`, and a **new** `--sky`. Task 3 reads `--sky`, `--data`, `--tint`, `--line`, `--ink`.

- [ ] **Step 1: Write the failing test**

In `scripts/verify-page.mjs`, insert a new check block immediately **before** the line `// ── Check 4: contrast spot-checks ──`:

```js
  // ── Check 8: palette tokens resolve to the values the spec fixed ──
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(PAGE_URL);
    const EXPECTED = {
      '--deep': '#1B2C42',
      '--data': '#17618F',
      '--accent': '#A8392C',
      '--accent-strong': '#B84630',
      '--signal': '#F5837A',
      '--sky': '#4B9BD4',
    };
    const actual = await page.evaluate((names) => {
      const cs = getComputedStyle(document.documentElement);
      const out = {};
      for (const n of names) out[n] = cs.getPropertyValue(n).trim().toUpperCase();
      return out;
    }, Object.keys(EXPECTED));
    const tokenDiff = {};
    for (const [name, want] of Object.entries(EXPECTED)) {
      const got = actual[name] || '(unset)';
      if (got !== want.toUpperCase()) tokenDiff[name] = { want, got };
    }
    // --signal and --sky are fill-only. Their sole legal pairing is --ink on
    // top; assert that here so a future re-tint cannot quietly break it.
    const inkOnFill = await page.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      return { signal: cs.getPropertyValue('--signal').trim(), sky: cs.getPropertyValue('--sky').trim(), ink: cs.getPropertyValue('--ink').trim() };
    });
    const toRgb = (h) => { const s = h.replace('#', ''); return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)); };
    const fillRatios = {};
    for (const k of ['signal', 'sky']) {
      if (!inkOnFill[k] || !inkOnFill.ink) { fillRatios[k] = null; continue; }
      const r = contrastRatio(toRgb(inkOnFill.ink), toRgb(inkOnFill[k]));
      fillRatios[k] = Math.round(r * 100) / 100;
    }
    const fillBad = Object.values(fillRatios).some((r) => r === null || r < CONTRAST_MIN);
    if (Object.keys(tokenDiff).length || fillBad) fail('palette_tokens', { tokenDiff, fillRatios });
    else pass('palette_tokens', { fillRatios });
    await page.close();
  }
```

- [ ] **Step 2: Run test to verify it fails**

```bash
node scripts/verify-page.mjs
```

Expected: exit code 1. In the JSON, `checks.palette_tokens.pass` is `false` and `tokenDiff` lists all six — five with the old values (`--deep: #12244A` etc.) and `--sky` as `(unset)`.

- [ ] **Step 3: Write the implementation — tokens**

In `redesign-v2.html`, find the `:root{` block. Replace these two lines:

```css
  --accent:#9A3412; --accent-strong:#C2410C; --signal:#FF6B1A; --data:#0B5FA5;
  --line:#E3EAF2; --rule:#C6D4E2; --deep:#12244A;
```

with:

```css
  --accent:#A8392C; --accent-strong:#B84630; --signal:#F5837A; --data:#17618F;
  --line:#E3EAF2; --rule:#C6D4E2; --deep:#1B2C42;
  /* Fill-only, like --signal: 2.8:1 on --bg, so it may never carry text.
     Its one appearance is the 2px rule under the profile card's role bar. */
  --sky:#4B9BD4;
```

- [ ] **Step 4: Write the implementation — dark-band derivatives**

Find `.band-space{` and change its gradient's dark stop to the new `--deep` value:

```css
.band-space{  opacity:0; background:linear-gradient(#2A4E7A, #1B2C42); }
```

The light stop `#2A4E7A` **does not change** — it is the documented worst case for the bare band.

Now replace the comment and rule at `.invert .eyebrow` (search for `#FFC9A3, not #FFB380`) with:

```css
/* #FFCFC7, not #FFC2B8. The links inside .invert .card hover to this colour,
   and that card composites to #395a83 against the band's lighter end — on
   which the closer-to-coral #FFC2B8 measures 4.61:1, which leaves no margin.
   #FFCFC7 is 5.06:1 there and 6.08:1 on the bare band, so this re-tint ends
   up SAFER than the #FFC9A3 it replaces (4.77:1). Computed, not eyeballed. */
.invert .eyebrow{ color:#FFCFC7; }
```

Then change the two remaining `#FFC9A3` occurrences — `.invert .on-accent` and the `.invert a:not(.btn):hover` rule inside the `@media (hover:hover)` block — to `#FFCFC7`.

Finally, find `.btn-signal:hover` and change its fill from `#FF8038` to the coral partner:

```css
  .btn-signal:hover{ background-color:#F79389; box-shadow:var(--sh-2); }
```

- [ ] **Step 5: Write the implementation — update the contrast contract**

The comment block at the top of the `<style>` element states every ratio in prose and is now wrong. Find the paragraph beginning `CONTRAST. Every pair below was computed` and replace the whole paragraph through `Nothing sits below 13px.` with:

```
   CONTRAST. Every pair below was computed, not eyeballed. On --bg:
   ink 17.4 · body 10.3 · muted 5.3 · accent 6.0 · accent-strong 5.0 ·
   data 6.3 · deep 13.3. The tightest light pairing in the file is
   accent-strong on --tint at 4.76.

   The dark band has TWO grounds and the second is the binding one. On the
   bare band's worst-case #2A4E7A: paper 8.5 · body-inv 6.8 · num 5.6 ·
   accent-inv 6.1 · data-inv 5.4. But .invert .card is rgba(255,255,255,.07),
   which composites to #395a83 — and there accent-inv is 5.06 and num is 4.65.
   Check accent derivatives against #395a83, not against the bare band.

   --signal (#F5837A) and --sky (#4B9BD4) are 2.4:1 and 2.8:1 and are
   therefore FILL tokens only; ink-on-signal is 7.4:1 and ink-on-sky is 6.1:1,
   which are the pairings used.

   KNOWN LATENT TRAP, not a live failure: .invert .on-data #9FD4FF is 5.40 on
   the bare band but 4.4966 on #395a83. No .on-data currently sits inside an
   .invert .card. If you ever put one there, it ships a contrast failure and
   the harness will not catch it — the spot-checks do not sample that pair.

   Body copy is 18px (--fs-body). The secondary text scale — .context, .note,
   .feat li and #catClaim — is 16px, so 16px is the floor for reading copy.
   Nothing sits below 13px.
```

- [ ] **Step 6: Run test to verify it passes**

```bash
node scripts/verify-page.mjs
```

Expected: exit code 0. `checks.palette_tokens.pass` is `true`, and `fillRatios` reads approximately `{ signal: 7.41, sky: 6.11 }`. The pre-existing `contrast` check must also still pass.

- [ ] **Step 7: Commit**

```bash
git add redesign-v2.html scripts/verify-page.mjs
git commit -m "Re-tint the palette toward the bear logo, and fix the ground the accent was measured against

--signal goes coral and a new fill-only --sky arrives; those two carry
essentially all of the logo's identity, because --data and --deep were
already within 7 degrees of its hues.

The accent derivative on the dark band was the interesting part. The file
already recorded that .invert .card composites to #395a83 and that this,
not the bare band, is where the pairing is tightest. The obvious coral
(#FFC2B8) measures 4.61 there. #FFCFC7 measures 5.06, which is better than
the 4.77 the page shipped. A new palette_tokens check pins all six tokens
and asserts ink-on-fill for the two fill-only ones."
```

---

## Task 2: The title of record

**Files:**
- Modify: `redesign-v2.html` — meta description, hero lede `<strong>`, RAiD timeline `<h3>`
- Test: `scripts/verify-page.mjs` — add a `title_of_record` check

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: the exact string `Forward Deployed Solution Architect (Intern)` in the DOM at `.hero-lede strong` and at the first `.tl-item h3`. Task 3 relies on that string to build the card's role bar.

- [ ] **Step 1: Write the failing test**

In `scripts/verify-page.mjs`, insert immediately **before** `// ── Check 4: contrast spot-checks ──`:

```js
  // ── Check 9: the title of record, stated identically wherever it appears ──
  //
  // P1-9 (docs/superpowers/plans/2026-08-09-dai-design-alignment.md:73) found
  // the hero and the Experience section disagreeing about the author's title.
  // The fix was to make them verbatim identical, so that is asserted, not
  // assumed. The card's role bar is a stylised two-line rendering of the same
  // string; it is compared after lowercasing and collapsing whitespace.
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(PAGE_URL);
    const TITLE = 'Forward Deployed Solution Architect (Intern)';
    const STALE = 'Power Platform Developer, Student Intern';
    const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
    const found = await page.evaluate(({ stale }) => {
      const heroEl = document.querySelector('.hero-lede strong');
      const expEl = document.querySelector('#timeline .tl-item h3');
      const barEl = document.querySelector('.id-role');
      return {
        hero: heroEl ? heroEl.textContent : null,
        experience: expEl ? expEl.textContent : null,
        roleBar: barEl ? barEl.textContent : null,
        staleCount: (document.documentElement.innerHTML.match(new RegExp(stale, 'g')) || []).length,
        // Sampled separately: the meta description says "Power Platform
        // Developer at RAiD" WITHOUT the ", Student Intern" suffix, so it does
        // not match STALE and staleCount cannot see it. Without this field the
        // <head> could keep the wrong title while every check went green.
        metaDesc: (document.querySelector('meta[name="description"]') || {}).content || null,
      };
    }, { stale: STALE });
    const hero = norm(found.hero);
    const experience = norm(found.experience);
    // The role bar is absent until Task 3; treat null as "not yet built"
    // rather than as a mismatch, so this check can go green on Task 2 alone.
    const roleBar = found.roleBar === null ? null : norm(found.roleBar).toLowerCase();
    const problems = [];
    if (hero !== TITLE) problems.push(`hero lede is "${hero}", want "${TITLE}"`);
    if (experience !== TITLE) problems.push(`experience h3 is "${experience}", want "${TITLE}"`);
    if (hero !== experience) problems.push('P1-9: hero and experience are not byte-identical');
    if (roleBar !== null && roleBar !== TITLE.toLowerCase()) problems.push(`role bar normalises to "${roleBar}", want "${TITLE.toLowerCase()}"`);
    if (found.staleCount > 0) problems.push(`stale title still present ${found.staleCount}x`);
    if (!found.metaDesc || !found.metaDesc.includes(TITLE)) problems.push('meta description does not carry the title of record');
    if (found.metaDesc && /Power Platform Developer/.test(found.metaDesc)) problems.push('meta description still carries the old title');
    if (problems.length) fail('title_of_record', { problems, hero, experience, roleBar, staleCount: found.staleCount, metaDesc: found.metaDesc });
    else pass('title_of_record', { hero, experience, roleBar, staleCount: found.staleCount });
    await page.close();
  }
```

- [ ] **Step 2: Run test to verify it fails**

```bash
node scripts/verify-page.mjs
```

Expected: exit code 1. `checks.title_of_record.problems` lists the hero mismatch, the experience mismatch, `stale title still present 3x`, and both meta-description problems.

Two things worth understanding about that `3x` before you trust it:

- `hero` and `experience` currently **agree with each other** — P1-9 is satisfied, on the wrong string — so the `not byte-identical` line will *not* appear. The invariant this check exists to protect is already held; the job is to keep holding it while the string changes.
- The count is 3, not 4, because the meta description reads `Power Platform Developer at RAiD` with no `, Student Intern` suffix and therefore does not match `STALE`. That is exactly why `metaDesc` is asserted separately — `staleCount` alone is blind to the `<head>`.

- [ ] **Step 3: Write the implementation**

Three edits in `redesign-v2.html`.

**(a) Meta description.** Find `<meta name="description"` and replace the whole tag with:

```html
<meta name="description" content="Manfred Siew — trained in Aerospace Engineering, self-taught in software development. Forward Deployed Solution Architect (Intern) at RAiD (RSAF Agile innovation Digital). 23 projects.">
```

**(b) Hero lede.** Find `<strong>Power Platform Developer, Student Intern</strong> at` and replace the opening of that paragraph so the whole `<p class="lede hero-lede">` body reads:

```html
          <strong>Forward Deployed Solution Architect (Intern)</strong> at
          <span class="on-accent">RAiD</span> (RSAF Agile innovation Digital) —
          I sit inside the unit that has the problem rather than taking tickets
          from it. Trained in Aerospace Engineering, self-taught in software
          development, LLM tuning and UI/UX design, and using both sides to
          deliver rapid, agile innovation.
```

Note the second em-dash of the original became a comma before "and using both sides", so the sentence pair carries one dash rather than two.

**(c) Experience heading.** Find the `<h3 class="h3">Power Platform Developer, Student Intern</h3>` that sits under the `Oct 2025 — Present` date and above `RAiD (RSAF Agile innovation Digital)`, and replace it with:

```html
        <h3 class="h3">Forward Deployed Solution Architect (Intern)</h3>
```

Do **not** touch the other three `.tl-item` headings — `Software Engineer (Power Platform)` (Freelance), `PowerApp / Power Platform Developer` (Temasek Polytechnic), and `Freelance / Mini Start-Up`. They are different, earlier jobs.

The fourth occurrence, the `<dd>` inside `.portrait-meta`, is deliberately left alone here; Task 3 deletes that whole `<dl>`.

- [ ] **Step 4: Run test to verify it partially passes**

```bash
node scripts/verify-page.mjs
```

Expected: still exit code 1, with exactly **one** remaining problem: `stale title still present 1x` — the `<dd>` in the card. `hero` and `experience` now both read `Forward Deployed Solution Architect (Intern)` and `roleBar` is `null`. This is the expected intermediate state; Task 3 closes it.

- [ ] **Step 5: Commit**

```bash
git add redesign-v2.html scripts/verify-page.mjs
git commit -m "Correct the job title: Forward Deployed Solution Architect (Intern)

The page stated 'Power Platform Developer, Student Intern' in four places.
That is not the author's title of record. Three are fixed here; the fourth
is a <dd> that the profile card rebuild deletes outright.

'Forward deployed' is Palantir-derived and reads as insider vocabulary, so
the lede now decodes it once — and only once, since the card sits beside it.

The new title_of_record check asserts the P1-9 invariant rather than
trusting it: hero and Experience must be byte-identical, and the stale
string must appear zero times. It reports 1 remaining, which is the <dd>."
```

---

## Task 3: The profile card

**Files:**
- Modify: `redesign-v2.html` — `.hero-portrait` CSS block and the `<aside class="hero-portrait">` markup
- Test: `scripts/verify-page.mjs` — extend `samples`, add a `stat_strip_integrity` check

**Interfaces:**
- Consumes: `--sky`, `--data`, `--tint`, `--line`, `--ink`, `--r-xl`, `--fs-label` from Task 1. The title string from Task 2.
- Produces: DOM classes `.id-card`, `.id-role`, `.id-team`, `.id-edu`, `.id-stats`, `.id-stat-label`, `.id-stat-value`, and `data-stat` attributes consumed by the integrity check below.

- [ ] **Step 1: Write the failing tests**

Two edits to `scripts/verify-page.mjs`.

**(a)** Extend the `samples` object inside Check 4 so the new text lands in the live contrast sweep:

```js
    const samples = {
      body_on_light: '.origin-note',
      invert_contact_body: '.contact-lede',
      disabled_pill_label: '.pill[data-cat="simulation"]',
      disabled_pill_claim: '.pill[data-cat="simulation"] .pill-claim',
      id_role_bar: '.id-role',
      id_stat_label: '.id-stats .id-stat-label',
      id_team: '.id-team',
    };
```

A selector that matches nothing reports `{ found:false }`, which has no `meetsAA` key, so `!c.meetsAA` is true and the check fails. Missing elements fail rather than silently pass.

**(b)** Insert a new check immediately **before** `// ── Check 4: contrast spot-checks ──`:

```js
  // ── Check 10: the stat strip cannot state a number the page cannot back ──
  //
  // Section 4 of docs/redesign-v2-outstanding-work.md lists six figures a
  // panel cannot check. The card must never become a seventh. Each stat
  // carries data-stat naming what it counts; this recounts it from the live
  // DOM and compares. If the author adds a project, this check fails until
  // the card is updated — which is the intended behaviour.
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(PAGE_URL);
    const stats = await page.evaluate(() => {
      const counted = {
        projects: document.querySelectorAll('.log-row').length,
        organisations: new Set(
          [...document.querySelectorAll('.log-row[data-org]')].map((el) => el.dataset.org)
        ).size,
      };
      const stated = {};
      for (const el of document.querySelectorAll('.id-stats [data-stat]')) {
        const v = el.querySelector('.id-stat-value');
        stated[el.dataset.stat] = v ? Number(v.textContent.trim()) : null;
      }
      return { counted, stated };
    });
    const mismatches = {};
    for (const [key, want] of Object.entries(stats.counted)) {
      if (stats.stated[key] === undefined) { mismatches[key] = { stated: '(no such data-stat)', counted: want }; continue; }
      if (stats.stated[key] !== want) mismatches[key] = { stated: stats.stated[key], counted: want };
    }
    if (Object.keys(mismatches).length) fail('stat_strip_integrity', { mismatches, ...stats });
    else pass('stat_strip_integrity', stats);
    await page.close();
  }
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
node scripts/verify-page.mjs
```

Expected: exit code 1, with three failing checks:
- `stat_strip_integrity` — both keys report `(no such data-stat)`, with `counted` reading `{ projects: 23, organisations: 4 }`. **Confirm those two numbers before continuing** — if the log has changed, the card's values change with it.
- `contrast` — the three new selectors report `found:false`.
- `title_of_record` — still `stale title still present 1x` from Task 2.

- [ ] **Step 3: Write the implementation — CSS**

In `redesign-v2.html`, find the block starting `.hero-portrait{ display:none;` and replace everything from that line through the `.portrait-meta dt{ ... }` line with:

```css
/* ── PROFILE CARD ─────────────────────────────────────────────────────
   Four bands, after an F1 "Driver of the Day" broadcast graphic: role bar,
   full-bleed portrait, identity, stat strip. The anatomy is borrowed; the
   volume is not. That card is dark, loud and competes for attention, which
   is exactly what line 38 of this file forbids anything but the aircraft
   from doing. So: same skeleton, page's own light register.

   The name is deliberately NOT on this card. The reference's dominant tier
   is the driver's name, but <h1>Manfred Siew.</h1> sits directly beside
   this aside. Two display-size names side by side is worse than none, so
   the middle tier carries WHAT instead of WHO.

   Every horizontal rule here runs edge to edge and dies in the card's own
   radius. An inset rule with square ends would point at a 90° corner,
   which line 55 forbids. */
.hero-portrait{ display:none; margin-inline:auto; width:100%; max-width:330px; }
@media (min-width:1024px){ .hero-portrait{ display:block; } }

/* padding:0 is the whole point — the portrait bleeds to the card's edges.
   overflow:hidden is what clips it into the --r-xl corners, and is also
   what lets the role bar and stat strip sit flush against them. */
.id-card{ overflow:hidden; padding:0; }

.id-role{
  padding:.875rem 1.25rem;
  background:var(--tint);
  /* The only place --sky appears on this page. One hairline of the logo's
     blue reads as a deliberate mark; the same blue on four edges reads as
     a border treatment. */
  border-bottom:2px solid var(--sky);
  font-size:var(--fs-label); font-weight:500; line-height:1.5;
  letter-spacing:.08em; text-transform:uppercase; color:var(--data);
}
.id-role span{ display:block; }

/* No border-radius here any more; .id-card's overflow:hidden does the
   clipping, so the crop must stay square or it would round twice. */
.portrait-crop{ aspect-ratio:4/5; overflow:hidden; background:var(--tint); }
.portrait-crop img{ width:100%; height:100%; object-fit:cover; }

.id-meta{ padding:1.125rem 1.25rem; border-top:1px solid var(--line); }
.id-team{ font-size:1.0625rem; font-weight:600; line-height:1.4; color:var(--ink); }
.id-edu{ margin-top:.375rem; font-size:.9375rem; color:var(--body); }

.id-stats{ display:grid; grid-template-columns:1fr 1fr; border-top:1px solid var(--line); }
.id-stats > div{ padding:1rem 1.25rem; }
.id-stats > div + div{ border-left:1px solid var(--line); }
.id-stat-label{
  font-size:var(--fs-label); font-weight:500;
  letter-spacing:.08em; text-transform:uppercase; color:var(--data);
}
.id-stat-value{
  margin-top:.25rem; font-size:2.5rem; font-weight:600; line-height:1;
  color:var(--ink); font-variant-numeric:tabular-nums;
}
```

- [ ] **Step 4: Write the implementation — markup**

Replace the entire `<aside class="hero-portrait" ...>` element — from `<aside` through its closing `</aside>` — with:

```html
      <!-- Profile card. Four bands after an F1 driver card; see the PROFILE
           CARD block in the stylesheet for why the name is not on it.
           The two figures are recounted from the live DOM by the
           stat_strip_integrity check in scripts/verify-page.mjs — this card
           cannot state a number the project log does not back. -->
      <aside class="hero-portrait" data-reveal aria-label="Profile">
        <div class="card card-lg id-card">

          <p class="id-role">
            <span>Forward Deployed</span><span>Solution Architect (Intern)</span>
          </p>

          <div class="portrait-crop">
            <img src="public/profile_picture.png" alt="Portrait of Manfred Siew"
                 onerror="this.hidden=true">
          </div>

          <div class="id-meta">
            <p class="id-team">RAiD · Power Platform Centre of Excellence</p>
            <p class="id-edu">Aerospace Engineering, TP (graduated)</p>
          </div>

          <div class="id-stats">
            <div data-stat="projects">
              <div class="id-stat-label">Projects</div>
              <div class="id-stat-value">23</div>
            </div>
            <div data-stat="organisations">
              <div class="id-stat-label">Organisations</div>
              <div class="id-stat-value">4</div>
            </div>
          </div>

        </div>
      </aside>
```

Three things to preserve exactly:
1. `onerror="this.hidden=true"` on the `<img>`. The `[hidden]{display:none}` rule at the end of the reset block is load-bearing for it — without the handler a broken portrait renders a broken-image box filling the 4:5 crop.
2. `data-reveal` on the `<aside>`, or the card never fades in.
3. `aria-label="Profile"` on the `<aside>`, since it is a landmark with no heading.

- [ ] **Step 5: Run tests to verify they pass**

```bash
node scripts/verify-page.mjs
```

Expected: exit code 0. Specifically:
- `stat_strip_integrity.pass` is `true`, `stated` equals `counted` equals `{ projects: 23, organisations: 4 }`.
- `contrast.pass` is `true`; `id_role_bar` reports ≈5.99, `id_stat_label` ≈6.68, `id_team` ≈18.5.
- `title_of_record.pass` is `true`, `staleCount` is `0`, and `roleBar` normalises to `forward deployed solution architect (intern)`.
- `document_height_1440` and both overflow checks still pass — the card grew taller, so confirm no new horizontal overflow at 390px (the card is `display:none` there, but confirm rather than assume).

- [ ] **Step 6: Commit**

```bash
git add redesign-v2.html scripts/verify-page.mjs
git commit -m "Rebuild the profile card on the F1 driver-card anatomy

Role bar, full-bleed portrait, identity tier, stat strip. Structure taken
from the reference, volume left behind — the aircraft is still the only
loud object. The name is not on the card, because the h1 next to it already
says it and two display-size names side by side is worse than none.

Every fact from the old <dl> survives the restructure: Role became the role
bar, Team and Education the identity tier. Two verifiable figures are new.

The stat strip cannot lie. stat_strip_integrity recounts .log-row and the
distinct data-org values from the live DOM and fails if the card disagrees,
so adding a project breaks the build until the card is updated. That is
deliberate: section 4 of the outstanding-work doc lists six figures a panel
cannot check, and this card must not become a seventh.

The role bar also closes the last stale job title, so title_of_record goes
green at staleCount 0."
```

---

## Task 4: The Experience blurb

**Files:**
- Modify: `redesign-v2.html` — the `<p class="tl-desc">` under the RAiD timeline entry
- Test: `scripts/verify-page.mjs` — extend the `title_of_record` check

**Interfaces:**
- Consumes: the corrected `<h3>` from Task 2.
- Produces: nothing consumed downstream.

- [ ] **Step 1: Write the failing test**

The heading now says architect while the paragraph beneath it describes a developer. Add that assertion to the existing `title_of_record` check. Inside its `page.evaluate` return object, add one field:

```js
        raidBlurb: (document.querySelector('#timeline .tl-item .tl-desc') || {}).textContent || null,
```

and after the existing `if (found.staleCount > 0)` line, add:

```js
    // The heading says architect. A blurb that only describes building
    // contradicts it. Assert the developer-era wording is gone and that the
    // deciding language the spec requires is present.
    const blurb = norm(found.raidBlurb);
    if (/Specialising in Power Apps/i.test(blurb)) problems.push('RAiD blurb still uses the developer-era wording');
    if (!/choosing the platform/i.test(blurb)) problems.push('RAiD blurb does not describe deciding, only building');
```

and add `blurb` to both the `fail` and `pass` detail objects.

- [ ] **Step 2: Run test to verify it fails**

```bash
node scripts/verify-page.mjs
```

Expected: exit code 1, `title_of_record.problems` contains both new messages.

- [ ] **Step 3: Write the implementation**

Find the `<p class="tl-desc">` immediately below the `Forward Deployed Solution Architect (Intern)` heading and replace its contents with:

```html
        <p class="tl-desc">
          Embedded with the units that own the problem — scoping what's actually
          needed, then choosing the platform to match. Power Platform where
          licensing and governance fit; React on Dataverse, or a full-stack
          rebuild, where they don't. Plus AI agent work and the tooling the rest
          of the team builds on.
        </p>
```

Every clause is backed by a row already in the project log, so this adds no claim the page cannot support:

| Clause | Backing row |
|---|---|
| choosing the platform to match | MILES / MAVIS — "proved in Power Apps first, then rebuilt as a full-stack application with Lovable once per-user licensing stopped being viable" |
| React on Dataverse | RAiD Facility Booking System — Dataverse + React + PowerApps Code Apps |
| a full-stack rebuild | MILES / MAVIS; the 815 SQN bootcamp |
| AI agent work | SAGE Copilot AI; R&D for Vibe-Coding Code Apps |
| the tooling the rest of the team builds on | PowerDocu; Comprehensive Guide for New Interns; Code Apps Policy Approval (M365 Tenant) |

Do **not** add a `needs-copy` chip. The author asked for this rewritten rather than chipped, and the wording is his to adjust later.

- [ ] **Step 4: Run test to verify it passes**

```bash
node scripts/verify-page.mjs
```

Expected: exit code 0, `title_of_record.pass` is `true`.

- [ ] **Step 5: Commit**

```bash
git add redesign-v2.html scripts/verify-page.mjs
git commit -m "Rewrite the RAiD blurb so it describes deciding, not just building

The heading now says architect; the paragraph under it still said
'Specialising in Power Apps and Power Platform', which is both a
contradiction and an understatement of what the log already shows —
React on Dataverse, a full-stack Lovable rebuild, AI agent work, and
tooling the team depends on.

Every clause traces to a row in the project log, so nothing here is a
new claim. The title_of_record check now guards the contradiction: it
fails if the blurb reverts to the developer-era wording, or if it stops
describing platform choice."
```

---

## Task 5: Close the loop for the author

**Files:**
- Modify: `docs/redesign-v2-outstanding-work.md`

**Interfaces:**
- Consumes: the finished state of Tasks 1-4.
- Produces: nothing.

- [ ] **Step 1: Run the full harness one more time and capture the output**

```bash
node scripts/verify-page.mjs > /tmp/verify.json; echo "exit=$?"
```

Expected: `exit=0`. If not, stop and fix before writing anything into the author-facing doc.

- [ ] **Step 2: Confirm the invariants by hand**

```bash
grep -c 'Power Platform Developer, Student Intern' redesign-v2.html   # expect 0
grep -c '#FFC9A3' redesign-v2.html                                    # expect 0
grep -c '#FF6B1A\|#FF8038\|#9A3412\|#C2410C\|#0B5FA5\|#12244A' redesign-v2.html  # expect 0
```

Any non-zero result means a replacement was missed. Note that `#2A4E7A` **should** still be present exactly once, in `.band-space` — it is the unchanged light stop.

- [ ] **Step 3: Add a status note to the outstanding-work doc**

Insert immediately after the existing `> **Status, 2026-08-10.**` block:

```markdown
> **Palette and profile card, 2026-08-10.** The page is re-tinted toward the
> personal bear logo and the profile card is rebuilt on the anatomy of an F1
> driver card — role bar, full-bleed portrait, identity tier, stat strip.
>
> **Your job title was wrong in four places** and is now
> `Forward Deployed Solution Architect (Intern)` everywhere. The hero lede
> decodes "forward deployed" once, because it is insider vocabulary and a
> reviewer already flagged five other terms as undecodable.
>
> **Two things are now machine-enforced.** The hero and the Experience heading
> must state your title byte-identically, and the card's two figures are
> recounted from the live page — so if you add a project, `verify-page.mjs`
> fails until the card is updated. That is intentional: section 4 below lists
> six figures a panel cannot check, and the card must not become a seventh.
>
> **The RAiD blurb was rewritten** to describe choosing platforms rather than
> only building on one, since the heading now says architect. Every clause is
> backed by a row in the log, but the words are yours to adjust.
>
> **Still open, and yours:** you said your end goal is AI engineering, and the
> page does not say so anywhere. It was deliberately kept off the card, which
> carries only present-tense verifiable facts, and off the pill, which now
> reads "Aerospace Engineering + software & AI" and must not go back to
> reading as a pivot away from aerospace. The hero thesis is the one place it
> could go. See section 5.3 of the design spec.
```

- [ ] **Step 4: Commit**

```bash
git add docs/redesign-v2-outstanding-work.md
git commit -m "Tell the author what changed, and what is still his call

Records the title correction, the two new machine-enforced invariants, and
the one thing left open: the page still does not say AI engineering is the
destination, and the hero thesis is the only place that can go without
re-reading as a pivot away from aerospace."
```

---

## Self-Review

**1. Spec coverage.**

| Spec section | Task |
|---|---|
| §4.2 token changes | 1 |
| §4.3 fill-only tokens | 1 (asserted in `palette_tokens`) |
| §4.4 dark band, `#395A83` binding ground, latent `.on-data` trap | 1 |
| §4.5 comment block rewritten | 1, Step 5 |
| §5 four coupled strings | 2 (three) + 3 (the `<dd>`) |
| §5.1 decoding clause, once | 2 |
| §5.2 Experience blurb | 4 |
| §5.3 end-goal stays off | Honoured by omission; surfaced to the author in 5 |
| §6.1 four-band anatomy | 3 |
| §6.2 the two numbers | 3 (`stat_strip_integrity`) |
| §6.3 `--sky` appears once | 1 (token) + 3 (single use) |
| §6.4 roundness | 3 (edge-to-edge rules, commented) |
| §7 verification | Every task; 5 for the full pass |

No gaps.

**2. Placeholder scan.** No TBD/TODO. Every code step carries the literal code. No step says "similar to Task N".

**3. Type/name consistency.** `.id-role`, `.id-stats`, `.id-stat-label`, `.id-stat-value`, `.id-team`, `.id-edu`, `.id-card` are defined in Task 3 Step 3 and used identically in Task 3 Steps 1 and 4 and in Task 2's check. `data-stat` values `projects` and `organisations` match the keys of `counted` in the integrity check. `--sky` is defined in Task 1 and consumed in Task 3. `contrastRatio` and `CONTRAST_MIN` used by the Task 1 check are module-scope in `scripts/verify-page.mjs:70` and `:42`.

**One ordering note for the executor:** Task 2's check goes yellow, not green — it ends with exactly one remaining problem, closed by Task 3. That is expected and documented in Task 2 Step 4. Do not "fix" it by editing the `<dd>`; Task 3 deletes it.
