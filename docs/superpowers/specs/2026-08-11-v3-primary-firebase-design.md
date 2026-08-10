# Promote v3 to the primary site, deploy on Firebase Hosting

**Date:** 2026-08-11
**Branch:** `release/v3-primary` (cut from `design/dai-alignment`)
**Status:** approved design, not yet implemented

## Problem

The repository holds three portfolios. A React + Vite application under `src/` is the
nominal product. `redesign-concept.html` and `redesign-v2.html` are earlier prototypes.
`redesign-v3*.html` — four self-contained pages built most recently — is the one worth
shipping, and it is the only one not wired up to anything.

Nothing is deployed. The `manfred-siew` Firebase project exists and already has a Hosting
site provisioned at `https://manfred-siew.web.app`, but no content has ever been pushed to
it.

## Goal

Make v3 the site that `https://manfred-siew.web.app` serves, then delete the prototypes and
the superseded React application so the repository describes one portfolio instead of three.

## What v3 already is

Four static HTML pages. Every page carries its own `<style>` and `<script>` inline. The
only external request is the Google Fonts stylesheet for Instrument Sans and IBM Plex Mono.
Each page already has a correct `<title>`, a written `<meta name="description">`, and an
inline SVG favicon as a data URI.

There is no build step, and this design does not introduce one. The deployed artifact is the
source.

## Design

### Directory layout

`public/` becomes the Firebase Hosting root. This is Firebase's own default, and the name is
free once the Vite application — the only thing that gave `public/` its former meaning as a
Vite static directory — is deleted.

```
public/                        hosting root, uploaded verbatim
  index.html                   <- redesign-v3.html
  work.html                    <- redesign-v3-work.html
  projects.html                <- redesign-v3-projects.html
  experience.html              <- redesign-v3-experience.html
  og-card.png                  new, 1200x630
  profile_picture.png
  workplace-cico.jpg           <- "WorkCICO Screenshot.jpg"
  huawei-track-cert.jpg
  vibe-coding-masterclass-podium.jpg
  vibe-coding-masterclass-qna.jpg
  facility-booking/{availability,book,dashboard,management}.png
  fuelup/{admin-panel,audit-log,dashboard,history,login,upload-ocr}.png
firebase.json
.firebaserc
package.json                   reduced to deploy scripts, no dependencies
README.md
docs/  scripts/  app/  .impeccable/     retained unchanged
```

### URLs

`cleanUrls` is enabled, so Firebase serves `work.html` at `/work` and rejects `/work.html`
with a redirect. `trailingSlash` is false.

| Page | URL |
| --- | --- |
| Home | `https://manfred-siew.web.app` |
| Work | `https://manfred-siew.web.app/work` |
| Projects | `https://manfred-siew.web.app/projects` |
| Experience | `https://manfred-siew.web.app/experience` |

### Link rewrites

Cross-page links inside the four files change from sibling filenames to absolute paths.
Fragments are preserved.

| From | To |
| --- | --- |
| `redesign-v3.html` | `/` |
| `redesign-v3.html#contact` | `/#contact` |
| `redesign-v3-work.html` | `/work` |
| `redesign-v3-work.html#wp1` `#wp2` `#wp3` | `/work#wp1` `#wp2` `#wp3` |
| `redesign-v3-projects.html` | `/projects` |
| `redesign-v3-projects.html#facility-booking` | `/projects#facility-booking` |
| `redesign-v3-projects.html#workplace-cico` | `/projects#workplace-cico` |
| `redesign-v3-experience.html` | `/experience` |

### Asset rewrites

Pages currently reference assets as `public/…` because they were opened from the repository
root as files. Once the pages live inside `public/`, the prefix is wrong. All 17 occurrences
of the literal `public/` — 3 in `redesign-v3.html`, 14 in `redesign-v3-projects.html`, none
in the other two — are stripped.

`WorkCICO Screenshot.jpg` is renamed to `workplace-cico.jpg` at the same time; its space is
currently `%20`-encoded at every reference site, and the file has no reason to keep it.

Verification is a grep: zero occurrences of `public/` and zero of `%20` may remain in the
four pages.

### Firebase configuration

`.firebaserc` pins the default project so `firebase deploy` needs no `--project` flag.

```json
{ "projects": { "default": "manfred-siew" } }
```

`firebase.json` declares the hosting root and caching. Images are content-addressed by name
and change rarely, so they are cached for a year. HTML must never be cached, or an edit will
not reach a returning visitor.

```json
{
  "hosting": {
    "public": "public",
    "cleanUrls": true,
    "trailingSlash": false,
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|png|svg|webp|gif)",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
      },
      {
        "source": "**/*.html",
        "headers": [{ "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }]
      }
    ]
  }
}
```

No custom 404 page. Firebase's default is adequate for a four-page site and inventing a
styled one is scope this design does not need.

### Open Graph

Pasted into LinkedIn, WhatsApp, Slack or an email client, the site currently renders as a
bare URL. Recruiters are the audience and a pasted link is how the site travels, so each
page gains Open Graph and Twitter Card tags. `og:title` and `og:description` reuse the
existing `<title>` and `<meta name="description">` verbatim — they are already written and
already correct. `og:url` is the page's own absolute URL.

```html
<meta property="og:type" content="website">
<meta property="og:site_name" content="Manfred Siew">
<meta property="og:title" content="…page title…">
<meta property="og:description" content="…page description…">
<meta property="og:url" content="https://manfred-siew.web.app/…">
<meta property="og:image" content="https://manfred-siew.web.app/og-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Manfred Siew — Aerospace Engineering and software development">
<meta name="twitter:card" content="summary_large_image">
```

`og:image` must be an absolute URL; relative paths are ignored by most crawlers.

All four pages share one image. Nothing in `public/` has the right aspect ratio — the
profile photo is 800x800, the product screenshots are 1280x800, the masterclass photo is
1800x1200 — so `og-card.png` is built for the purpose at 1200x630: an HTML card drawn with
v3's own palette, type scale and radius tokens, rendered to PNG with Playwright.

**Ordering constraint.** Playwright is a current devDependency and is present in
`node_modules`. The card must be rendered *before* `package.json` is stripped of its
dependencies, or the tool will not be there. The card source and its render script are
temporary and live in the scratchpad, not the repository — only the PNG output is committed.

### package.json

Reduced to a name and two scripts. The site has no dependencies.

```json
{
  "name": "manfred-siew-portfolio",
  "private": true,
  "scripts": {
    "deploy": "firebase deploy --only hosting",
    "serve": "firebase emulators:start --only hosting"
  }
}
```

`package-lock.json` is deleted with it.

## Deletions

Step 1 removes what v3 replaces:

- `src/` in full — ten React components, `portfolio.ts`, `portfolio.check.ts`, `utils.ts`, `App.tsx`, `main.tsx`, `index.css`
- root `index.html` (the Vite entry point; unrelated to `public/index.html`)
- `vite.config.ts`, `tsconfig.json`, `metadata.json`
- `package-lock.json`
- `dist/` — stale Vite output, gitignored, working-tree only

Step 3 removes the prototypes and strays:

- `redesign-concept.html`, `redesign-v2.html`
- `f-35a_lightning_ii.glb` (127 MB), `_RAI0747.ARW` (49 MB), `19fe78cb5186f.png` (6.8 MB), `19fe79ae8532e.png` (4.5 MB), `photo_2026-03-05_15-41-15.jpg`
- `public/Black_RAiD__Reg_.png`, `public/facility-infographic.jpg` — unreferenced by any v3 page

Retained by explicit decision: `docs/` in full, `scripts/`, `replace_color.cjs`,
`app/applet/`, `.impeccable/`.

## Sequence

Two implementation commits on `release/v3-primary` — this design document is a third,
committed first — with a verification gate between them.

1. **Restructure, configure, deploy.** Move and rewrite the pages, render the OG card, write
   the Firebase config, strip `package.json`, delete the Vite application. Deploy to a
   preview channel and verify there. Then deploy to production.
2. **Gate.** Manfred confirms `https://manfred-siew.web.app` is correct before anything is
   deleted. Nothing in step 3 happens until this passes.
3. **Cleanup.** Delete the prototypes, the stray binaries and the unreferenced images.
4. **Merge to `main`** and push.

A preview channel (`firebase hosting:channel:deploy preview`) is used before production so a
broken asset path is caught on a throwaway URL rather than the real one.

## Verification

Against the preview URL, not the local filesystem:

- All four pages return 200 and render.
- Zero 404s in the network log. This is the check that catches a missed `public/` prefix.
- Zero console errors.
- Every cross-page link resolves; `/work#wp1`, `/projects#facility-booking` and
  `/projects#workplace-cico` land on the right element rather than the top of the page.
- `/work.html` redirects to `/work`, confirming `cleanUrls` is active.
- The projects page's category and organisation filters still work — it carries the most
  inline JavaScript and the most rewritten paths.
- `og-card.png` returns 200 at its absolute URL.
- Response headers show the split cache policy: `immutable` on a PNG, `no-cache` on an HTML
  document.

After the merge, `git log --oneline main -1` shows the cleanup commit.

## Known consequences

**Deleting 188 MB does not shrink the repository.** Those blobs remain in git history. Only
a history rewrite would reclaim the space, and that would invalidate every existing clone and
require a force-push to `main`. This design does not do that. The working tree gets clean;
`.git` stays large.

**The retained scripts become inert.** `scripts/verify-airframe.mjs`,
`scripts/verify-page.mjs` and `scripts/shoot-halos.mjs` all target `redesign-v2.html` and the
React application, both deleted here. They are kept as a record, not as working tools, and
they will fail if run. They also depend on Playwright, which leaves `package.json` in step 1.

**The merge carries 88 commits.** `main` has not moved since before v2 was built. Merging
`release/v3-primary` fast-forwards it across the whole of the v2 and v3 development history,
not just this change.

**README.md is stale.** It describes a GitHub profile, not this site, and still contains a
`YOUR_GITHUB_LINK_HERE` placeholder. Out of scope here; noted for a later pass.

## Out of scope

Page content and copy. The projects page still says twenty-seven projects and the outstanding
questions about FUEL Up, MILES/MAVIS and the Masterclass codenames are unchanged. This
change moves and deploys v3; it does not edit what v3 says.

Custom domain. `manfred-siew.web.app` already contains `manfred-siew`, which was the stated
requirement. Attaching a purchased domain would need DNS records and is not part of this
work.
