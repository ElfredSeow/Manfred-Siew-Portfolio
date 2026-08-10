# v3 Primary Site + Firebase Hosting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the four v3 pages the site served at `https://manfred-siew.web.app`, then delete the React application and the earlier prototypes.

**Architecture:** `public/` becomes the Firebase Hosting root and is uploaded verbatim — there is no build step, so the source and the deployed artifact are the same files. The four pages move in, lose their `redesign-v3-` prefixes, and have every internal path rewritten from sibling-filename form to absolute paths. `cleanUrls` serves them at `/`, `/work`, `/projects`, `/experience`.

**Tech Stack:** Static HTML with inline `<style>` and `<script>`. Firebase Hosting (CLI 15.20.0, already authenticated). Playwright 1.61 for one image render and one verification pass — used from the existing `node_modules`, never shipped.

**Spec:** `docs/superpowers/specs/2026-08-11-v3-primary-firebase-design.md`

## Global Constraints

- Branch is `release/v3-primary`, already created from `design/dai-alignment`. Do not create another.
- Firebase project is `manfred-siew`. Hosting site `manfred-siew` already exists. Do not run `firebase init` — it rewrites config interactively and will clobber what Task 4 writes.
- Production deploy happens **only** in Task 6, after Manfred has signed off on the preview URL in Task 5. Tasks 7 and 8 delete files and must not run before that sign-off.
- The four pages must keep their single-external-request property: the Google Fonts stylesheet is the only permitted external fetch. Icons are inline SVG. No CDNs.
- Do not edit page copy. The projects page's "Twenty-seven projects" and the FUEL Up / MILES-MAVIS / Masterclass codenames stay exactly as they are.
- Do not rewrite git history. The large binaries are removed from the working tree only.
- GitHub profile URL, used verbatim everywhere: `https://github.com/ElfredSeow`. Display text is the bare handle `ElfredSeow`.
- Deployed origin, used verbatim in every absolute URL: `https://manfred-siew.web.app`
- Every task's commands assume `$SCRATCH` is set. Export it once at the start of each session, in the Bash tool (not PowerShell):

```bash
export SCRATCH="C:/Users/manfr/AppData/Local/Temp/claude/c--Users-manfr-Downloads-Project-Management-Manfred-Siew-Portfolio/eba8ff3f-ca9c-4db0-9761-c743eb1470ad/scratchpad"
```

- Shell state does not persist between Bash calls, so re-export it in any call that uses it.

## File Structure

| Path | Responsibility | Task |
| --- | --- | --- |
| `public/index.html` | Home page (was `redesign-v3.html`) | 1 |
| `public/work.html` | Case studies (was `redesign-v3-work.html`) | 1 |
| `public/projects.html` | Project log (was `redesign-v3-projects.html`) | 1 |
| `public/experience.html` | Career history (was `redesign-v3-experience.html`) | 1 |
| `public/workplace-cico.jpg` | Renamed from `WorkCICO Screenshot.jpg` | 1 |
| `public/og-card.png` | 1200×630 social preview, shared by all four pages | 3 |
| `firebase.json` | Hosting root, cleanUrls, cache headers | 4 |
| `.firebaserc` | Pins default project to `manfred-siew` | 4 |
| `package.json` | Reduced to deploy scripts, zero dependencies | 4 |
| `README.md` | One-line placeholder fix | 2 |

Scratchpad only, never committed — `$SCRATCH` below means
`C:/Users/manfr/AppData/Local/Temp/claude/c--Users-manfr-Downloads-Project-Management-Manfred-Siew-Portfolio/eba8ff3f-ca9c-4db0-9761-c743eb1470ad/scratchpad`:

| Path | Responsibility | Task |
| --- | --- | --- |
| `$SCRATCH/og-card.html` | Source for the OG image render | 3 |
| `$SCRATCH/render-og.mjs` | Playwright screenshot script | 3 |
| `$SCRATCH/verify-site.mjs` | Loads all four pages, asserts no 404s or console errors | 5 |

---

### Task 1: Move the pages into `public/` and rewrite every internal path

The pages currently reference assets as `public/…` because they were opened from the repository root. Once they live inside `public/`, that prefix is wrong. All 17 occurrences are preceded by a double quote, so a single quoted-prefix substitution is exhaustive.

**Files:**
- Move: `redesign-v3.html` → `public/index.html`
- Move: `redesign-v3-work.html` → `public/work.html`
- Move: `redesign-v3-projects.html` → `public/projects.html`
- Move: `redesign-v3-experience.html` → `public/experience.html`
- Move: `public/WorkCICO Screenshot.jpg` → `public/workplace-cico.jpg`
- Modify: all four `public/*.html` (45 cross-links, 17 asset paths)

**Interfaces:**
- Produces: the four final page paths and the `/`, `/work`, `/projects`, `/experience` URL forms that every later task references.

- [ ] **Step 1: Write the failing check**

Create `$SCRATCH/check-paths.sh`:

```bash
#!/usr/bin/env bash
# Exits 0 only when every internal path has been rewritten.
cd "c:/Users/manfr/Downloads/Project Management/Manfred-Siew-Portfolio" || exit 2
fail=0
for f in public/index.html public/work.html public/projects.html public/experience.html; do
  [ -f "$f" ] || { echo "MISSING: $f"; fail=1; continue; }
  n=$(grep -c 'redesign-v3' "$f"); [ "$n" -gt 0 ] && { echo "FAIL $f: $n redesign-v3 refs"; fail=1; }
  n=$(grep -c '"public/' "$f"); [ "$n" -gt 0 ] && { echo "FAIL $f: $n public/ refs"; fail=1; }
  n=$(grep -c '%20' "$f");      [ "$n" -gt 0 ] && { echo "FAIL $f: $n %20 refs"; fail=1; }
done
[ -f "public/workplace-cico.jpg" ] || { echo "MISSING: public/workplace-cico.jpg"; fail=1; }
[ "$fail" -eq 0 ] && echo "PASS: all internal paths rewritten"
exit $fail
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `bash "$SCRATCH/check-paths.sh"`
Expected: FAIL — `MISSING: public/index.html` four times, plus the missing renamed image.

- [ ] **Step 3: Move the files with git mv**

Moving before editing keeps the rename visible in git history rather than recording a delete plus an add.

```bash
cd "c:/Users/manfr/Downloads/Project Management/Manfred-Siew-Portfolio"
git mv redesign-v3.html            public/index.html
git mv redesign-v3-work.html       public/work.html
git mv redesign-v3-projects.html   public/projects.html
git mv redesign-v3-experience.html public/experience.html
git mv "public/WorkCICO Screenshot.jpg" public/workplace-cico.jpg
```

- [ ] **Step 4: Rewrite cross-page links**

The fragment-bearing patterns are listed before the bare ones for readability, but order does not matter here: `redesign-v3\.html` cannot match inside `redesign-v3-work.html`, because the pattern requires a literal `.` where that string has a `-`.

```bash
cd "c:/Users/manfr/Downloads/Project Management/Manfred-Siew-Portfolio"
for f in public/index.html public/work.html public/projects.html public/experience.html; do
  sed -i \
    -e 's|href="redesign-v3\.html#|href="/#|g' \
    -e 's|href="redesign-v3\.html"|href="/"|g' \
    -e 's|href="redesign-v3-work\.html#|href="/work#|g' \
    -e 's|href="redesign-v3-work\.html"|href="/work"|g' \
    -e 's|href="redesign-v3-projects\.html#|href="/projects#|g' \
    -e 's|href="redesign-v3-projects\.html"|href="/projects"|g' \
    -e 's|href="redesign-v3-experience\.html#|href="/experience#|g' \
    -e 's|href="redesign-v3-experience\.html"|href="/experience"|g' \
    "$f"
done
```

- [ ] **Step 5: Rewrite asset paths**

The renamed image is handled first, because the general rule below would otherwise leave the `%20` in place.

```bash
cd "c:/Users/manfr/Downloads/Project Management/Manfred-Siew-Portfolio"
for f in public/index.html public/projects.html; do
  sed -i \
    -e 's|"public/WorkCICO%20Screenshot\.jpg|"workplace-cico.jpg|g' \
    -e 's|"public/|"|g' \
    "$f"
done
```

- [ ] **Step 6: Fix the two stale comments by hand**

Two source comments name `redesign-v3` files. Step 4's sed does **not** reach them, because it only matches strings prefixed with `href="` and these are prose inside comments. The Step 1 check greps for `redesign-v3` anywhere in the file, so it cannot pass until these are edited.

In `public/work.html`, find:

```
/* Aurora Deck — shared core (see redesign-v3.html for the design-rationale
```

Replace `redesign-v3.html` with `index.html`.

In `public/projects.html`, find:

```
  // A link from another page (redesign-v3-projects.html#grid) should land on an
```

Replace `redesign-v3-projects.html#grid` with `/projects#grid`.

- [ ] **Step 7: Run the check to verify it passes**

Run: `bash "$SCRATCH/check-paths.sh"`
Expected: `PASS: all internal paths rewritten`

- [ ] **Step 8: Commit**

```bash
cd "c:/Users/manfr/Downloads/Project Management/Manfred-Siew-Portfolio"
git add -A public
git commit -m "Move the v3 pages into public/ and rewrite their internal paths

The pages referenced assets as public/... because they were opened from
the repository root. Inside public/ that prefix is wrong. Cross-page
links become absolute paths so cleanUrls can serve them without
extensions."
```

---

### Task 2: Add the GitHub profile link

The site links two individual repositories but has no route to the profile. The nav placement is an icon button rather than a fifth `.nav-link`, because that group carries `aria-current="page"` highlighting — which an outbound link can never truthfully receive — and already overflows to a horizontal scroll on narrow screens.

**Files:**
- Modify: all four `public/*.html` (one CSS rule, one nav button, one contact row each)
- Modify: `README.md:46`

**Interfaces:**
- Consumes: the `public/*.html` paths from Task 1.
- Produces: `.nav-icon` CSS class, available to any later nav work.

- [ ] **Step 1: Write the failing check**

Create `$SCRATCH/check-github.sh`:

```bash
#!/usr/bin/env bash
cd "c:/Users/manfr/Downloads/Project Management/Manfred-Siew-Portfolio" || exit 2
fail=0
for f in public/index.html public/work.html public/projects.html public/experience.html; do
  grep -q 'class="nav-icon"' "$f"            || { echo "FAIL $f: no nav icon button"; fail=1; }
  grep -q '\.nav-icon{'      "$f"            || { echo "FAIL $f: no .nav-icon CSS rule"; fail=1; }
  grep -q 'aria-label="GitHub profile"' "$f" || { echo "FAIL $f: nav button unlabelled"; fail=1; }
  grep -q '<dt>GitHub</dt>'  "$f"            || { echo "FAIL $f: no contact row"; fail=1; }
  n=$(grep -c 'github\.com/ElfredSeow"' "$f")
  [ "$n" -ge 2 ] || { echo "FAIL $f: expected >=2 profile links, found $n"; fail=1; }
done
grep -q 'YOUR_GITHUB_LINK_HERE' README.md && { echo "FAIL README.md: placeholder remains"; fail=1; }
[ "$fail" -eq 0 ] && echo "PASS: GitHub link present in nav, contact and README"
exit $fail
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `bash "$SCRATCH/check-github.sh"`
Expected: FAIL — four failures per page plus the README placeholder.

- [ ] **Step 3: Add the `.nav-icon` CSS rule to all four pages**

In each of the four files, find this exact existing line:

```css
.nav-link:active{ transform:scale(.96); }
```

Insert immediately after it:

```css
.nav-icon{
  flex:none; display:grid; place-items:center;
  width:2.25rem; height:2.25rem; border-radius:var(--r-pill);
  color:var(--body);
  transition:background-color var(--d-hover) ease, color var(--d-hover) ease;
}
@media (hover:hover) and (pointer:fine){ .nav-icon:hover{ background-color:var(--tint); color:var(--ink); } }
.nav-icon:active{ transform:scale(.96); }
```

`flex:none` is what stops the button compressing when `.nav-links` overflows and scrolls. The hover state deliberately mirrors `.nav-link:hover` — same tokens, same guard — so the button reads as part of the dock rather than an ornament.

- [ ] **Step 4: Add the nav icon button to all four pages**

The button goes immediately **before** the Contact CTA, so it sits outside `.nav-links` and cannot inherit `aria-current` styling.

In `public/index.html`, find:

```html
    <a href="#contact" class="btn nav-cta">Contact</a>
```

In `public/work.html`, `public/projects.html` and `public/experience.html`, find:

```html
    <a href="/#contact" class="btn nav-cta">Contact</a>
```

In every case insert this block on the line **before** the one you found:

```html
    <a class="nav-icon" href="https://github.com/ElfredSeow" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile">
      <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>
    </a>
```

Note the Contact CTA on `work`, `projects` and `experience` reads `/#contact` and not `redesign-v3.html#contact` — Task 1 already rewrote it. If you still see the old form, Task 1 is incomplete; stop and fix it there.

- [ ] **Step 5: Add the contact card row to all four pages**

This line is byte-identical in all four files and occurs exactly once in each:

```html
          <div><dt>LinkedIn</dt><dd><a href="https://linkedin.com/in/manfred-siew-25b4762aa" target="_blank" rel="noopener noreferrer" class="link-inline">manfred-siew</a></dd></div>
```

Insert immediately after it, so the order becomes Email, LinkedIn, GitHub, Location:

```html
          <div><dt>GitHub</dt><dd><a href="https://github.com/ElfredSeow" target="_blank" rel="noopener noreferrer" class="link-inline">ElfredSeow</a></dd></div>
```

- [ ] **Step 6: Fix the README placeholder**

In `README.md` line 46, replace `YOUR_GITHUB_LINK_HERE` with `https://github.com/ElfredSeow`. The line becomes:

```markdown
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?style=for-the-badge&logo=github)](https://github.com/ElfredSeow)
```

Change nothing else in the file.

- [ ] **Step 7: Run the check to verify it passes**

Run: `bash "$SCRATCH/check-github.sh"`
Expected: `PASS: GitHub link present in nav, contact and README`

- [ ] **Step 8: Commit**

```bash
cd "c:/Users/manfr/Downloads/Project Management/Manfred-Siew-Portfolio"
git add -A public README.md
git commit -m "Add the GitHub profile link to the nav and the contact card

The site linked two individual repositories but offered no route to the
profile. The nav placement is an icon button seated outside .nav-links,
so an outbound link never becomes eligible for aria-current styling and
never competes for width with the four page links."
```

---

### Task 3: Build the OG card and add Open Graph tags

Pasted into LinkedIn or WhatsApp the site currently renders as a bare URL. Nothing in `public/` has the 1.91:1 aspect ratio those cards want, so the image is built for the purpose.

**Playwright is required here and its dependency entry is removed in Task 4. This task must run first.** `node_modules` survives Task 4 regardless — it is gitignored and untouched — but the ordering is kept so the dependency is still declared while it is in use.

**Files:**
- Create: `public/og-card.png` (1200×630)
- Create (scratchpad, not committed): `$SCRATCH/og-card.html`, `$SCRATCH/render-og.mjs`
- Modify: all four `public/*.html` head blocks

**Interfaces:**
- Consumes: `public/profile_picture.png` (800×800), the `:root` tokens in `public/index.html`.
- Produces: `https://manfred-siew.web.app/og-card.png`, referenced by all four pages.

- [ ] **Step 1: Write the failing check**

Create `$SCRATCH/check-og.sh`:

```bash
#!/usr/bin/env bash
cd "c:/Users/manfr/Downloads/Project Management/Manfred-Siew-Portfolio" || exit 2
fail=0
[ -f public/og-card.png ] || { echo "FAIL: og-card.png missing"; fail=1; }
if [ -f public/og-card.png ]; then
  dims=$(node -e "const b=require('fs').readFileSync('public/og-card.png');console.log(b.readUInt32BE(16)+'x'+b.readUInt32BE(20))")
  [ "$dims" = "1200x630" ] || { echo "FAIL: og-card.png is $dims, want 1200x630"; fail=1; }
fi
for f in public/index.html public/work.html public/projects.html public/experience.html; do
  for tag in 'og:type' 'og:site_name' 'og:title' 'og:description' 'og:url' 'og:image' 'og:image:width' 'og:image:height' 'og:image:alt' 'twitter:card'; do
    grep -q "\"$tag\"" "$f" || { echo "FAIL $f: missing $tag"; fail=1; }
  done
  grep -q 'content="https://manfred-siew.web.app/og-card.png"' "$f" \
    || { echo "FAIL $f: og:image is not an absolute URL"; fail=1; }
done
[ "$fail" -eq 0 ] && echo "PASS: OG card rendered and tagged on all four pages"
exit $fail
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `bash "$SCRATCH/check-og.sh"`
Expected: FAIL — `og-card.png missing`, then ten missing tags per page.

- [ ] **Step 3: Write the card source**

Copy the profile photo next to the card so it resolves by relative path — Windows `file://` absolute paths are fragile in Chromium:

```bash
cp "c:/Users/manfr/Downloads/Project Management/Manfred-Siew-Portfolio/public/profile_picture.png" "$SCRATCH/profile_picture.png"
```

Create `$SCRATCH/og-card.html`. Colours are the v3 aurora-ground and brand tokens copied verbatim; the card is deliberately full-bleed with **no border radius**, because social platforms composite it into a rectangular slot and a rounded card would show four dark corners.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *{ margin:0; padding:0; box-sizing:border-box; }
  body{
    width:1200px; height:630px; overflow:hidden;
    font-family:'Instrument Sans',system-ui,sans-serif;
    background:radial-gradient(120% 130% at 22% 18%, #1B2450 0%, #3A2E6E 52%, #12172F 100%);
    color:#fff; display:flex; align-items:center; gap:72px; padding:0 88px;
  }
  .glow{
    position:absolute; width:520px; height:520px; border-radius:50%;
    background:radial-gradient(circle, rgba(143,168,255,.30) 0%, rgba(143,168,255,0) 70%);
    top:-140px; right:-90px;
  }
  .copy{ position:relative; flex:1; min-width:0; }
  .eyebrow{
    font-family:'IBM Plex Mono',monospace; font-weight:500; font-size:20px;
    letter-spacing:.14em; text-transform:uppercase; color:#8FA8FF; margin-bottom:26px;
  }
  h1{ font-size:88px; font-weight:700; letter-spacing:-.035em; line-height:1; margin-bottom:26px; }
  .role{ font-size:29px; font-weight:400; line-height:1.4; color:rgba(255,255,255,.80); }
  .url{
    font-family:'IBM Plex Mono',monospace; font-size:21px;
    color:rgba(255,255,255,.55); margin-top:44px;
  }
  .avatar{
    position:relative; flex:none; width:290px; height:290px; border-radius:50%;
    object-fit:cover; box-shadow:inset 0 0 0 3px rgba(255,255,255,.4), 0 30px 64px -24px rgba(0,0,0,.6);
    outline:3px solid rgba(255,255,255,.35); outline-offset:-3px;
  }
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="copy">
    <p class="eyebrow">Aerospace Engineering · Software Development</p>
    <h1>Manfred Siew</h1>
    <p class="role">Forward Deployed Solution Architect (Intern)<br>at RAiD — RSAF Agile innovation Digital</p>
    <p class="url">manfred-siew.web.app</p>
  </div>
  <img class="avatar" src="profile_picture.png" alt="">
</body>
</html>
```

- [ ] **Step 4: Write the render script**

Create `$SCRATCH/render-og.mjs`. It waits on `document.fonts.ready`, without which the screenshot can capture a fallback-font frame:

```js
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = 'c:/Users/manfr/Downloads/Project Management/Manfred-Siew-Portfolio/public/og-card.png';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto('file:///' + path.join(here, 'og-card.html').replace(/\\/g, '/'));
await page.waitForFunction(() => document.fonts.status === 'loaded');
await page.waitForLoadState('networkidle');
await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
console.log('wrote', out);
```

- [ ] **Step 5: Render the card**

```bash
cd "c:/Users/manfr/Downloads/Project Management/Manfred-Siew-Portfolio"
node "$SCRATCH/render-og.mjs"
```

Expected: `wrote …/public/og-card.png`

- [ ] **Step 6: Look at the rendered card**

Open `public/og-card.png` with the Read tool and confirm: both fonts rendered (the eyebrow is monospace, the name is not), the photo is circular and not stretched, no text is clipped at any edge, and the file is 1200×630. If the eyebrow is in a fallback font, the font wait failed — re-run Step 5. Do not proceed on a card you have not looked at.

- [ ] **Step 7: Add the OG tags to all four pages**

In each file, insert the page's block immediately after its favicon `<link rel="icon" …>` line and before the blank line preceding `<link rel="preconnect" …>`. `og:title` and `og:description` reuse each page's existing `<title>` and `<meta name="description">` verbatim.

`public/index.html`:

```html
<meta property="og:type" content="website">
<meta property="og:site_name" content="Manfred Siew">
<meta property="og:title" content="Manfred Siew · Aerospace Engineering &amp; Software Development">
<meta property="og:description" content="Manfred Siew — trained in Aerospace Engineering, self-taught in software development. Forward Deployed Solution Architect (Intern) at RAiD (RSAF Agile innovation Digital).">
<meta property="og:url" content="https://manfred-siew.web.app/">
<meta property="og:image" content="https://manfred-siew.web.app/og-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Manfred Siew — Aerospace Engineering and software development">
<meta name="twitter:card" content="summary_large_image">
```

`public/work.html`:

```html
<meta property="og:type" content="website">
<meta property="og:site_name" content="Manfred Siew">
<meta property="og:title" content="Work · Manfred Siew">
<meta property="og:description" content="Three case studies — GRID, MILES / MAVIS, and the Vibe Coding Masterclass — with process, and what the AI actually does in each.">
<meta property="og:url" content="https://manfred-siew.web.app/work">
<meta property="og:image" content="https://manfred-siew.web.app/og-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Manfred Siew — Aerospace Engineering and software development">
<meta name="twitter:card" content="summary_large_image">
```

`public/projects.html`:

```html
<meta property="og:type" content="website">
<meta property="og:site_name" content="Manfred Siew">
<meta property="og:title" content="Projects · Manfred Siew">
<meta property="og:description" content="Twenty-seven projects, filterable by category and organisation — Aerospace, Power Platform, LLM tuning, UI/UX and process automation work across RSAF, Temasek Polytechnic and freelance.">
<meta property="og:url" content="https://manfred-siew.web.app/projects">
<meta property="og:image" content="https://manfred-siew.web.app/og-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Manfred Siew — Aerospace Engineering and software development">
<meta name="twitter:card" content="summary_large_image">
```

`public/experience.html`:

```html
<meta property="og:type" content="website">
<meta property="og:site_name" content="Manfred Siew">
<meta property="og:title" content="Experience · Manfred Siew">
<meta property="og:description" content="Trained in Aerospace Engineering, self-taught in software. The path from a Live2D animation start-up through Temasek Polytechnic and freelance Power Platform work to RAiD.">
<meta property="og:url" content="https://manfred-siew.web.app/experience">
<meta property="og:image" content="https://manfred-siew.web.app/og-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Manfred Siew — Aerospace Engineering and software development">
<meta name="twitter:card" content="summary_large_image">
```

- [ ] **Step 8: Run the check to verify it passes**

Run: `bash "$SCRATCH/check-og.sh"`
Expected: `PASS: OG card rendered and tagged on all four pages`

- [ ] **Step 9: Commit**

```bash
cd "c:/Users/manfr/Downloads/Project Management/Manfred-Siew-Portfolio"
git add -A public
git commit -m "Add a purpose-built Open Graph card and tag all four pages

Pasted into LinkedIn the site rendered as a bare URL. Nothing in public/
had the 1.91:1 ratio those cards want, so the image is drawn at 1200x630
from the v3 aurora tokens. og:image must be absolute or crawlers skip it."
```

---

### Task 4: Add Firebase configuration and strip the project to a static site

**Files:**
- Create: `firebase.json`, `.firebaserc`
- Modify: `package.json`
- Delete: `src/`, `index.html`, `vite.config.ts`, `tsconfig.json`, `metadata.json`, `package-lock.json`, `dist/`

**Interfaces:**
- Consumes: `public/` as produced by Tasks 1–3.
- Produces: a deployable tree; `npm run deploy` and `npm run serve`.

- [ ] **Step 1: Write the failing check**

Create `$SCRATCH/check-config.sh`:

```bash
#!/usr/bin/env bash
cd "c:/Users/manfr/Downloads/Project Management/Manfred-Siew-Portfolio" || exit 2
fail=0
[ -f firebase.json ] || { echo "FAIL: no firebase.json"; fail=1; }
[ -f .firebaserc ]   || { echo "FAIL: no .firebaserc"; fail=1; }
for gone in src index.html vite.config.ts tsconfig.json metadata.json package-lock.json dist; do
  [ -e "$gone" ] && { echo "FAIL: $gone still present"; fail=1; }
done
if [ -f firebase.json ]; then
  node -e "
    const c=require('./firebase.json').hosting;
    const bad=[];
    if(c.public!=='public') bad.push('public is '+c.public);
    if(c.cleanUrls!==true) bad.push('cleanUrls not true');
    if(c.trailingSlash!==false) bad.push('trailingSlash not false');
    if(bad.length){console.error('FAIL: '+bad.join(', '));process.exit(1)}
  " || fail=1
fi
if [ -f package.json ]; then
  node -e "
    const p=require('./package.json');
    if(p.dependencies||p.devDependencies){console.error('FAIL: package.json still declares dependencies');process.exit(1)}
    if(!p.scripts||!p.scripts.deploy){console.error('FAIL: no deploy script');process.exit(1)}
  " || fail=1
fi
[ "$fail" -eq 0 ] && echo "PASS: firebase configured, Vite app removed"
exit $fail
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `bash "$SCRATCH/check-config.sh"`
Expected: FAIL — no `firebase.json`, no `.firebaserc`, and every Vite file still present.

- [ ] **Step 3: Write `.firebaserc`**

```json
{
  "projects": {
    "default": "manfred-siew"
  }
}
```

- [ ] **Step 4: Write `firebase.json`**

Images are cached for a year because they change only under a new filename. HTML must never be cached, or an edit will not reach a returning visitor.

```json
{
  "hosting": {
    "public": "public",
    "cleanUrls": true,
    "trailingSlash": false,
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|png|svg|webp|gif)",
        "headers": [
          { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
        ]
      },
      {
        "source": "**/*.html",
        "headers": [
          { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }
        ]
      }
    ]
  }
}
```

- [ ] **Step 5: Replace `package.json` in full**

```json
{
  "name": "manfred-siew-portfolio",
  "private": true,
  "version": "1.0.0",
  "description": "Personal portfolio — static site deployed on Firebase Hosting",
  "scripts": {
    "serve": "firebase emulators:start --only hosting",
    "deploy": "firebase deploy --only hosting",
    "preview": "firebase hosting:channel:deploy preview --expires 7d"
  }
}
```

- [ ] **Step 6: Delete the Vite application**

`index.html` here is the Vite entry point at the repository root — **not** `public/index.html`, which is the home page you just built. Deleting the wrong one destroys Task 1's work.

```bash
cd "c:/Users/manfr/Downloads/Project Management/Manfred-Siew-Portfolio"
git rm -r --quiet src
git rm --quiet index.html vite.config.ts tsconfig.json metadata.json package-lock.json
rm -rf dist
```

- [ ] **Step 7: Run the check to verify it passes**

Run: `bash "$SCRATCH/check-config.sh"`
Expected: `PASS: firebase configured, Vite app removed`

- [ ] **Step 8: Confirm the home page still exists**

Run: `ls public/index.html && grep -c 'nav-icon' public/index.html`
Expected: the path prints, and the count is at least 1. If this fails you deleted the wrong `index.html` — recover with `git checkout HEAD -- public/index.html` and redo Step 6.

- [ ] **Step 9: Commit**

```bash
cd "c:/Users/manfr/Downloads/Project Management/Manfred-Siew-Portfolio"
git add -A
git commit -m "Configure Firebase Hosting and remove the superseded Vite app

The site is four static pages with no build step, so public/ is uploaded
verbatim. Images get a year of immutable caching; HTML gets none, or an
edit never reaches a returning visitor."
```

---

### Task 5: Deploy to a preview channel and verify

A preview channel catches a broken asset path on a throwaway URL rather than on the real one.

**Files:**
- Create (scratchpad, not committed): `$SCRATCH/verify-site.mjs`

**Interfaces:**
- Consumes: the deployable tree from Task 4.
- Produces: a preview URL for Manfred to sign off on.

- [ ] **Step 1: Deploy to the preview channel**

```bash
cd "c:/Users/manfr/Downloads/Project Management/Manfred-Siew-Portfolio"
firebase hosting:channel:deploy preview --project manfred-siew --expires 7d
```

Expected: a channel URL of the form `https://manfred-siew--preview-<hash>.web.app`. Copy it — the next step needs it.

- [ ] **Step 2: Write the verification script**

Create `$SCRATCH/verify-site.mjs`. It fails on any non-200 response or console error, which is the check that catches a missed `public/` prefix:

```js
import { chromium } from 'playwright';

const base = process.argv[2];
if (!base) { console.error('usage: node verify-site.mjs <base-url>'); process.exit(2); }

const pages = ['/', '/work', '/projects', '/experience'];
const browser = await chromium.launch();
let failed = 0;

for (const p of pages) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const bad = [];
  page.on('console', m => { if (m.type() === 'error') bad.push('console: ' + m.text()); });
  page.on('requestfailed', r => bad.push('failed: ' + r.url()));
  page.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ': ' + r.url()); });

  const res = await page.goto(base + p, { waitUntil: 'networkidle' });
  if (!res || res.status() !== 200) bad.push('page status ' + (res && res.status()));

  const og = await page.getAttribute('meta[property="og:image"]', 'content');
  if (og !== 'https://manfred-siew.web.app/og-card.png') bad.push('og:image is ' + og);

  const navIcon = await page.locator('a.nav-icon').count();
  if (navIcon !== 1) bad.push('nav-icon count ' + navIcon);

  const ghRows = await page.locator('a[href="https://github.com/ElfredSeow"]').count();
  if (ghRows < 2) bad.push('profile links ' + ghRows);

  await page.setViewportSize({ width: 360, height: 780 });
  if (!(await page.locator('a.nav-icon').isVisible())) bad.push('nav-icon hidden at 360px');

  console.log((bad.length ? 'FAIL ' : 'PASS ') + p + (bad.length ? '\n  ' + bad.join('\n  ') : ''));
  failed += bad.length ? 1 : 0;
  await page.close();
}

// Deep links must land on their target, not at the top of the page.
const anchors = [
  ['/work', 'wp1'], ['/work', 'wp2'], ['/work', 'wp3'],
  ['/projects', 'facility-booking'], ['/projects', 'workplace-cico'],
];
for (const [path, id] of anchors) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${base}${path}#${id}`, { waitUntil: 'networkidle' });
  const exists = await page.locator(`#${id}`).count();
  const scrolled = await page.evaluate(() => window.scrollY);
  if (!exists) { console.log(`FAIL ${path}#${id}: no element with that id`); failed++; }
  else if (scrolled === 0) { console.log(`FAIL ${path}#${id}: element exists but page did not scroll`); failed++; }
  else console.log(`PASS ${path}#${id} (scrolled ${Math.round(scrolled)}px)`);
  await page.close();
}

// cleanUrls: the .html form must redirect, and og-card.png must exist.
const page = await browser.newPage();
const r1 = await page.goto(base + '/work.html');
if (!r1.url().endsWith('/work')) { console.log('FAIL /work.html did not redirect, landed ' + r1.url()); failed++; }
else console.log('PASS /work.html redirects to /work');
const r2 = await page.goto(base + '/og-card.png');
if (r2.status() !== 200) { console.log('FAIL og-card.png status ' + r2.status()); failed++; }
else console.log('PASS og-card.png 200');

await browser.close();
console.log(failed ? `\n${failed} check group(s) failed` : '\nAll checks passed');
process.exit(failed ? 1 : 0);
```

- [ ] **Step 3: Run it against the preview URL**

```bash
cd "c:/Users/manfr/Downloads/Project Management/Manfred-Siew-Portfolio"
node "$SCRATCH/verify-site.mjs" "https://manfred-siew--preview-<hash>.web.app"
```

Expected: `All checks passed`. A `404: …/fuelup/login.png` here means Task 1's asset rewrite missed a file — fix it there, re-deploy the channel, re-run.

- [ ] **Step 4: Check the cache headers**

```bash
curl -sI "https://manfred-siew--preview-<hash>.web.app/og-card.png" | grep -i cache-control
curl -sI "https://manfred-siew--preview-<hash>.web.app/" | grep -i cache-control
```

Expected: `immutable` on the first, `no-cache` on the second.

- [ ] **Step 5: Check the projects page filters by hand**

The projects page carries the most inline JavaScript and had the most paths rewritten. Open the preview `/projects`, click through the category and organisation filters, and open one screenshot lightbox. Confirm the counts change and no image slot is empty.

- [ ] **Step 6: Hand the preview URL to Manfred**

Report the URL and the verification output. **Stop here.** Task 6 does not begin until he confirms.

---

### Task 6: Deploy to production

**Files:** none changed.

- [ ] **Step 1: Confirm sign-off**

Do not run Step 2 without Manfred's explicit approval of the Task 5 preview.

- [ ] **Step 2: Deploy**

```bash
cd "c:/Users/manfr/Downloads/Project Management/Manfred-Siew-Portfolio"
firebase deploy --only hosting --project manfred-siew
```

- [ ] **Step 3: Verify production with the same script**

```bash
node "$SCRATCH/verify-site.mjs" "https://manfred-siew.web.app"
```

Expected: `All checks passed`. The `og:image` assertion is now checking a same-origin URL, so a failure here means the tags are wrong rather than merely pointing elsewhere.

---

### Task 7: Remove the prototypes and stray binaries

Only after production is verified.

**Files:**
- Delete: `redesign-concept.html`, `redesign-v2.html`
- Delete: `f-35a_lightning_ii.glb`, `_RAI0747.ARW`, `19fe78cb5186f.png`, `19fe79ae8532e.png`, `photo_2026-03-05_15-41-15.jpg`
- Delete: `public/Black_RAiD__Reg_.png`, `public/facility-infographic.jpg`

**Retained by explicit decision — do not touch:** `docs/`, `scripts/`, `replace_color.cjs`, `app/applet/`, `.impeccable/`.

- [ ] **Step 1: Confirm the images really are unreferenced**

```bash
cd "c:/Users/manfr/Downloads/Project Management/Manfred-Siew-Portfolio"
grep -rn 'Black_RAiD\|facility-infographic' public/*.html
```

Expected: no output. If either name appears, do not delete that file — report it instead.

- [ ] **Step 2: Delete**

```bash
cd "c:/Users/manfr/Downloads/Project Management/Manfred-Siew-Portfolio"
git rm --quiet redesign-concept.html redesign-v2.html
git rm --quiet f-35a_lightning_ii.glb _RAI0747.ARW 19fe78cb5186f.png 19fe79ae8532e.png photo_2026-03-05_15-41-15.jpg
git rm --quiet public/Black_RAiD__Reg_.png public/facility-infographic.jpg
```

- [ ] **Step 3: Verify the live site is unaffected**

```bash
node "$SCRATCH/verify-site.mjs" "https://manfred-siew.web.app"
```

Expected: `All checks passed` — deleting local files cannot change what is already deployed, so this is a guard against having deleted something `public/` needed.

- [ ] **Step 4: Commit**

```bash
cd "c:/Users/manfr/Downloads/Project Management/Manfred-Siew-Portfolio"
git commit -m "Remove the superseded prototypes and stray binaries

redesign-concept and redesign-v2 are replaced by the deployed v3 pages.
The .glb, .ARW and loose screenshots at the repository root were never
referenced by any page. This clears the working tree only — the blobs
remain in history, which no rewrite is proposed to reclaim."
```

---

### Task 8: Merge to main

- [ ] **Step 1: Review what the merge carries**

```bash
cd "c:/Users/manfr/Downloads/Project Management/Manfred-Siew-Portfolio"
git log --oneline main..release/v3-primary | wc -l
git diff --stat main..release/v3-primary | tail -5
```

Expected: roughly 95 commits. `main` has not moved since before v2, so the merge fast-forwards across the whole of v2 and v3 development, not just this change. Confirm that is intended before continuing.

- [ ] **Step 2: Merge**

```bash
cd "c:/Users/manfr/Downloads/Project Management/Manfred-Siew-Portfolio"
git checkout main
git merge --no-ff release/v3-primary -m "Make v3 the primary site, deployed on Firebase Hosting"
```

- [ ] **Step 3: Push**

```bash
git push origin main
```

- [ ] **Step 4: Confirm the deployed site still matches main**

```bash
node "$SCRATCH/verify-site.mjs" "https://manfred-siew.web.app"
git log --oneline -1
```

Expected: `All checks passed`, and the merge commit at the tip of `main`.

---

## Rollback

Hosting keeps previous releases. If production is wrong after Task 6, roll back from the Firebase console's Hosting → Release history, or redeploy the previous commit:

```bash
git stash && git checkout <previous-sha> && firebase deploy --only hosting --project manfred-siew
```

Nothing in Tasks 7–8 is destructive beyond the working tree; every deleted file remains in git history and can be restored with `git checkout <sha> -- <path>`.
