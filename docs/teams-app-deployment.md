# Shipping the portfolio as a Microsoft Teams personal tab

The portfolio is a static site on Firebase Hosting. This document covers the
extra layer that lets the same site be installed into Microsoft Teams as a
**personal tab app**, and how to build, sideload and update it.

Nothing here changes how the site behaves on the open web. The Teams layer is
additive and inert unless the page is actually being hosted by Teams.

---

## How it works

Teams personal tabs are just an `<iframe>` pointing at a URL you host. There is
no upload of site content to Microsoft — Teams renders the live Firebase site.
That means:

- Deploying to Firebase updates the Teams app immediately. No re-upload.
- Only changes to `teams/manifest.json` (tab list, name, icons, URLs) require
  rebuilding and re-uploading the app package.

Three pieces make it work:

| Piece | File | Job |
| --- | --- | --- |
| App package | `teams/` → `dist/teams/*.zip` | Manifest + icons that Teams installs |
| Framing permission | `firebase.json` | CSP `frame-ancestors` allowing Microsoft hosts |
| Host adapter | `public/assets/teams-tab.{js,css}` | Theme, link routing, Teams-aware styling |

---

## Repository layout

```
teams/
  manifest.json                 # Teams app manifest (schema v1.20)
  color.png                     # 192x192 app icon
  outline.png                   # 32x32 monochrome app-bar icon
scripts/
  build-teams-icons.mjs         # Regenerates both PNGs from vector geometry
  build-teams-package.mjs       # Validates the manifest, writes the .zip
public/assets/
  teams-tab.js                  # Host detection, theme, link handling
  teams-tab.css                 # Teams light/dark/high-contrast styling
dist/teams/
  manfred-siew-teams-app.zip    # Build output (git-ignored)
```

---

## Build the app package

```bash
npm run build:teams          # regenerate icons, validate manifest, write the zip
npm run check:teams          # validate the manifest only (no zip) — use in CI
```

The build fails loudly if the manifest breaks any Teams constraint: field
length limits, a malformed GUID or accent colour, a non-HTTPS tab URL, a
`validDomains` entry that wrongly includes a scheme or path, or icons whose
real pixel dimensions are not 192x192 / 32x32.

Output: `dist/teams/manfred-siew-teams-app.zip` — a flat zip containing
`manifest.json`, `color.png`, `outline.png` at the root. That flat structure is
required; Teams rejects packages that bury the manifest in a folder.

---

## Deploy the site

The Teams tab renders whatever is live at the manifest's URLs, so the site has
to be deployed **before** sideloading or the tab loads nothing.

### Try it without touching the live site

Use a preview channel. It publishes to a throwaway subdomain and leaves the
production version completely alone.

```bash
npm run preview              # prints a URL like
                             # https://manfred-siew--preview-ab12cd.web.app
```

Then build a package pointed at that channel:

```bash
npm run build:teams
node scripts/build-teams-package.mjs --host manfred-siew--preview-ab12cd.web.app
```

`--host` rewrites every `contentUrl` / `websiteUrl` and adds the host to
`validDomains` **in the packaged copy only** — `teams/manifest.json` on disk is
not modified, and the repointed manifest is re-validated before it is zipped.
Sideload that zip and the whole app runs against the preview channel.

Preview channels expire (7 days with the `preview` script). When one expires
the tab stops loading, which is the intended failure mode for a test build.

Bump `version` in the manifest, or use a separate `id`, if you want the preview
build installed alongside the production one rather than replacing it.

### Publish for real

```bash
npm run deploy               # firebase deploy --only hosting
```

This overwrites the live site. Note that it also ships the changes this work
introduced to every ordinary visitor, not just Teams users: the CSP header, and
the `teams-tab.css` / `teams-tab.js` files each page now references. Both are
designed to be inert outside Teams — the verification suite asserts exactly
that — but it is still a production change, so prefer the preview channel until
you are happy with it.

---

## Verifying before you ship

```bash
npm install --no-save playwright     # one-off, node_modules is git-ignored
npm run verify:teams
```

`scripts/verify-teams-tab.mjs` serves `public/` through a server that mirrors
the Firebase config — same `cleanUrls` behaviour, and the real headers block
read straight out of `firebase.json` — then drives Chromium through the three
states the tab layer can be in:

| State | Simulates | Must hold |
| --- | --- | --- |
| `web` | An ordinary visitor | The Teams layer is a complete no-op: no classes added, links untouched, light ground intact |
| `nosdk` | Hosted, CDN blocked | Degrades rather than breaking: still themed, still rendered, settles into `is-teams-nosdk` |
| `sdk` | Hosted, SDK responding | Theme applied from context, live theme switching works, internal links carry the marker, external links go through `app.openLink` |

It also asserts the CSP allows every required Microsoft origin, that no
`X-Frame-Options` header is present, that every selector in `teams-tab.css` is
scoped so the file cannot leak onto the public site, and that no page overflows
horizontally at 360px or 1280px in any of the three themes.

The `sdk` state is exercised against a stub served in place of the CDN bundle,
with Subresource Integrity neutralised **in the harness only** — production
keeps the real pinned hash.

---

## Sideload into Teams

**Prerequisite — tenant setting.** Custom app upload is off by default. A Teams
administrator must enable it in the Teams admin center:

> Teams apps → Setup policies → Global (Org-wide default) → **Upload custom
> apps** → On → Save

Propagation can take up to 24 hours. Also check Teams apps → Manage apps →
Org-wide app settings → Custom apps. Custom app upload is not available in GCC
High, DoD, or Teams operated by 21Vianet.

**Optional — validate first.** Upload the zip to the Developer Portal's
validation tool at <https://dev.teams.microsoft.com/tools/store-validation> to
catch manifest problems before installing.

**Install.**

1. Teams → **Apps** → **Manage your apps** → **Upload an app**
2. **Upload a custom app** → select `dist/teams/manfred-siew-teams-app.zip`
3. **Add** — the app installs in personal scope and appears in the left app bar

The app opens with four tabs across the top: Home, Work, Projects, Experience.

---

## What the host adapter does

`public/assets/teams-tab.js` is loaded by all portfolio pages. On the open web
it exits within a few statements and does nothing else.

It activates when either signal is present: the `?in=teams` marker (which every
`contentUrl` in the manifest carries) or the page being framed at all. It then:

1. Adds `is-teams` to `<html>` so `teams-tab.css` can take effect.
2. Tracks the host theme and mirrors it as `teams-theme-default` /
   `teams-theme-dark` / `teams-theme-contrast`, seeding from the OS colour
   scheme first so a dark client does not flash white on load.
3. Keeps `?in=teams` on same-origin links, so navigating Home → Work inside the
   tab stays in hosted mode.
4. Routes off-site links (GitHub, LinkedIn) through the host's link opener, so
   they open in a real browser instead of failing inside the iframe.

The Teams JS SDK is loaded from `res.cdn.office.net`, pinned to **2.55.0** and
guarded by a Subresource Integrity hash. It is treated as progressive
enhancement: if the CDN is blocked or initialisation fails, the adapter marks
the document `is-teams-nosdk` and falls back to `prefers-color-scheme`, and the
tab still renders.

> Microsoft's documentation states that a tab page must call `app.initialize()`
> or it "isn't displayed". In practice a static content tab does render without
> it, but do not rely on that — keep the SDK path working, and treat the
> no-SDK path as a degraded fallback rather than a supported mode.

### Updating the pinned SDK

```bash
V=2.55.0
curl -sO https://res.cdn.office.net/teams-js/$V/js/MicrosoftTeams.min.js
echo "sha384-$(openssl dgst -sha384 -binary MicrosoftTeams.min.js | openssl base64 -A)"
```

Put the new version and hash into `SDK_URL` / `SDK_SRI` in `teams-tab.js`. If
the hash is wrong the browser refuses the script and the adapter silently takes
the no-SDK path — so verify a theme switch still works after bumping.

---

## Framing headers

`firebase.json` sets, on every response:

```
Content-Security-Policy: frame-ancestors 'self' teams.microsoft.com
  *.teams.microsoft.com *.office.com *.microsoft365.com outlook.office.com
  outlook.office365.com outlook-sdf.office.com outlook-sdf.office365.com
  *.cloud.microsoft;
```

`*.cloud.microsoft` is the host Teams, Outlook and the Microsoft 365 app are
migrating to. The legacy origins are kept alongside it deliberately — both are
needed during the migration.

**Do not add `X-Frame-Options`.** `DENY` or `SAMEORIGIN` overrides the CSP in
some browsers and blocks Teams from framing the site at all. The hosting config
sets no such header, and it should stay that way.

---

## Regenerating the icons

```bash
npm run build:teams-icons
```

`scripts/build-teams-icons.mjs` rasterises both PNGs from normalised polygon
geometry with a hand-written, dependency-free PNG encoder, supersampled for
smooth edges and deterministic across runs. Teams icon rules it respects:

- **color.png** — exactly 192x192, full-bleed square with **no rounded
  corners** (Teams masks the corners itself; pre-rounding renders wrong), and
  all branding inside the centred 120x120 safe area.
- **outline.png** — exactly 32x32, pure white on a fully transparent
  background. Teams renders it monochrome, so gradients and fills are pointless
  here.

---

## Updating the app

| Change | What to do |
| --- | --- |
| Page content, styling, images | `npm run deploy` (or `npm run preview` to stage it first). Teams picks it up live. |
| Tab list, app name, description, icons, URLs | Bump `version` in `teams/manifest.json`, `npm run build:teams`, re-upload the zip. |

Bump `version` (semver) on every manifest change — Teams uses it to detect an
update, and re-uploading the same version can silently keep the old manifest.

Cached content inside an already-installed tab can lag a deploy by up to 24-48
hours in some clients. If a change is not showing, that is usually why; a hard
refresh of the Teams client normally clears it.

---

## Troubleshooting

**Tab is blank or shows a framing error.** Check the response headers actually
carry the CSP and no `X-Frame-Options`:

```bash
curl -sI https://manfred-siew.web.app/ | grep -i 'frame\|content-security'
```

**Tab spins forever.** `showLoadingIndicator` is `false` in the manifest, so
Teams should not wait on `notifySuccess()`. If it was turned on, the SDK must
initialise successfully or the tab hangs.

**Links do nothing.** External links go through the host's opener. If the SDK
failed to load, they fall back to `window.open`, which some clients suppress —
check the browser console for an SRI or CSP failure on the SDK request.

**Upload button missing.** The tenant setting above is not enabled yet, or has
not propagated.

**Styling looks wrong in dark mode.** Confirm `<html>` carries
`teams-theme-dark`. If it carries `is-teams-nosdk` instead, the SDK never
initialised and the theme is coming from the OS, not from Teams.

---

## Privacy and terms

`developer.privacyUrl` and `developer.termsOfUseUrl` are required manifest
fields and must resolve — Teams validation flags them if they 404. They point
at `/privacy` and `/terms`, served from `public/privacy.html` and
`public/terms.html`. Keep those pages in sync with what the site and the Teams
adapter actually do.
