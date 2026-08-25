/* ============================================================================
   teams-tab.js — Microsoft Teams personal-tab adapter for the ASCENT portfolio.

   The public site is a plain static site. This file is the only Teams-aware
   code: it is inert on the open web and only activates when the page is being
   rendered inside a Teams / Microsoft 365 / Outlook host.

   Responsibilities, in order of importance:
     1. Mark the document as hosted (`is-teams`) so teams-tab.css can adapt.
     2. Track the host theme (default / dark / contrast) and mirror it onto
        the document element.
     3. Keep the `?in=teams` marker on same-origin navigation so a click from
        the Home tab into /work stays in hosted mode.
     4. Route off-site links through the host's link opener, because an
        `target="_blank"` inside the Teams iframe is unreliable.

   The Teams JS SDK is loaded lazily and is strictly an enhancement: a static
   content tab renders without it. Every SDK-dependent feature degrades to a
   plain-web fallback if the CDN is blocked or initialisation fails.
   ========================================================================== */
(function () {
  'use strict';

  var HOSTED_PARAM = 'in';
  var HOSTED_VALUE = 'teams';
  var SDK_URL = 'https://res.cdn.office.net/teams-js/2.55.0/js/MicrosoftTeams.min.js';
  var SDK_SRI = 'sha384-qOOENVJGWr7UF7wvgyycjvq3sZen4SEYQwZMKqpquvV/PNMtSJb3VGZ/sAIKsZDw';
  var SDK_LOAD_TIMEOUT_MS = 6000;
  var SDK_INIT_TIMEOUT_MS = 8000;

  var root = document.documentElement;
  var params = new URLSearchParams(window.location.search);

  /* --- Host detection ----------------------------------------------------
     Two independent signals. The query marker is what our own manifest and
     our own in-site links carry. The frame check catches the case where a
     host deep-links straight at a bare URL without the marker. */
  var flagged = params.get(HOSTED_PARAM) === HOSTED_VALUE;
  var framed = false;
  try {
    framed = window.self !== window.top;
  } catch (e) {
    // Cross-origin parent: the throw itself proves we are framed.
    framed = true;
  }

  if (!flagged && !framed) return;

  root.classList.add('is-teams');
  if (!flagged) params.set(HOSTED_PARAM, HOSTED_VALUE);

  /* --- Theme -------------------------------------------------------------
     Teams reports 'default' | 'dark' | 'contrast'. Until the SDK answers we
     guess from the OS preference so the first paint is not a white flash in
     a dark client. */
  var THEMES = ['default', 'dark', 'contrast'];

  function applyTheme(theme) {
    if (THEMES.indexOf(theme) === -1) theme = 'default';
    THEMES.forEach(function (t) {
      root.classList.toggle('teams-theme-' + t, t === theme);
    });
    root.setAttribute('data-teams-theme', theme);
  }

  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  applyTheme(prefersDark && prefersDark.matches ? 'dark' : 'default');

  /* --- Link handling -----------------------------------------------------
     Same-origin: carry the hosted marker forward.
     Cross-origin: hand to the host so it opens in the user's real browser
     rather than trying (and usually failing) to navigate the tab iframe. */
  function isSameOrigin(url) {
    return url.origin === window.location.origin;
  }

  function withHostedMarker(url) {
    url.searchParams.set(HOSTED_PARAM, HOSTED_VALUE);
    return url;
  }

  function parseHref(anchor) {
    var raw = anchor.getAttribute('href');
    if (!raw) return null;
    // Leave in-page anchors, mailto:, tel: and javascript: entirely alone.
    if (/^(#|mailto:|tel:|javascript:)/i.test(raw)) return null;
    try {
      return new URL(anchor.href, window.location.href);
    } catch (e) {
      return null;
    }
  }

  function rewriteInternalLinks(scope) {
    var anchors = (scope || document).querySelectorAll('a[href]');
    Array.prototype.forEach.call(anchors, function (a) {
      var url = parseHref(a);
      if (!url || !isSameOrigin(url)) return;
      if (url.searchParams.get(HOSTED_PARAM) === HOSTED_VALUE) return;
      a.href = withHostedMarker(url).href;
    });
  }

  var openExternal = function (href) {
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  document.addEventListener('click', function (ev) {
    if (ev.defaultPrevented || ev.button !== 0) return;
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;

    var anchor = ev.target && ev.target.closest ? ev.target.closest('a[href]') : null;
    if (!anchor) return;

    var url = parseHref(anchor);
    if (!url) return;

    if (isSameOrigin(url)) {
      // Belt and braces for links injected after our initial rewrite pass.
      if (url.searchParams.get(HOSTED_PARAM) !== HOSTED_VALUE) {
        anchor.href = withHostedMarker(url).href;
      }
      return;
    }

    ev.preventDefault();
    openExternal(url.href);
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { rewriteInternalLinks(); });
  } else {
    rewriteInternalLinks();
  }

  /* --- SDK (progressive enhancement) ------------------------------------ */
  /* Guarantees a settled outcome. Without this, an app.initialize() that never
     resolves - the normal behaviour outside a real Teams host - would leave the
     document in neither the sdk nor the nosdk state, and the theme fallback
     would never be wired up. */
  function withTimeout(promise, ms, message) {
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () { reject(new Error(message)); }, ms);
      promise.then(
        function (value) { clearTimeout(timer); resolve(value); },
        function (err) { clearTimeout(timer); reject(err); }
      );
    });
  }

  function loadScript(src, integrity, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var el = document.createElement('script');
      var settled = false;
      var timer = setTimeout(function () {
        if (settled) return;
        settled = true;
        reject(new Error('teams-js load timed out'));
      }, timeoutMs);

      el.src = src;
      el.async = true;
      // Subresource integrity: crossOrigin must be set for the check to run.
      el.crossOrigin = 'anonymous';
      if (integrity) el.integrity = integrity;
      el.onload = function () {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve();
      };
      el.onerror = function () {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(new Error('teams-js failed to load'));
      };
      document.head.appendChild(el);
    });
  }

  loadScript(SDK_URL, SDK_SRI, SDK_LOAD_TIMEOUT_MS)
    .then(function () {
      var sdk = window.microsoftTeams;
      if (!sdk || !sdk.app || typeof sdk.app.initialize !== 'function') {
        throw new Error('teams-js loaded but exposed no app.initialize');
      }
      return withTimeout(
        sdk.app.initialize(),
        SDK_INIT_TIMEOUT_MS,
        'teams-js initialize did not settle'
      ).then(function () { return sdk; });
    })
    .then(function (sdk) {
      root.classList.add('is-teams-sdk');

      // Prefer the host's own opener from here on.
      if (sdk.app && typeof sdk.app.openLink === 'function') {
        openExternal = function (href) {
          sdk.app.openLink(href).catch(function () {
            window.open(href, '_blank', 'noopener,noreferrer');
          });
        };
      }

      if (sdk.app && typeof sdk.app.registerOnThemeChangeHandler === 'function') {
        sdk.app.registerOnThemeChangeHandler(applyTheme);
      }

      if (sdk.app && typeof sdk.app.getContext === 'function') {
        return withTimeout(
          sdk.app.getContext(),
          SDK_INIT_TIMEOUT_MS,
          'teams-js getContext did not settle'
        ).then(function (ctx) {
          if (ctx && ctx.app && ctx.app.theme) applyTheme(ctx.app.theme);
          if (ctx && ctx.app && ctx.app.host && ctx.app.host.name) {
            root.setAttribute('data-teams-host', String(ctx.app.host.name).toLowerCase());
          }
          // Tell the host we painted; without this some clients keep their
          // loading indicator up for the full timeout.
          if (sdk.app.notifySuccess) sdk.app.notifySuccess();
        });
      }

      if (sdk.app && sdk.app.notifySuccess) sdk.app.notifySuccess();
    })
    .catch(function () {
      // No SDK. The tab still renders; fall back to OS colour scheme.
      root.classList.add('is-teams-nosdk');
      if (prefersDark && prefersDark.addEventListener) {
        prefersDark.addEventListener('change', function (e) {
          applyTheme(e.matches ? 'dark' : 'default');
        });
      }
    });
})();
