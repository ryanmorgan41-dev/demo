/* ============================================================
   main.js  —  site behavior. Pairs with config.js.

   - wires every [data-cta] from SITE_LINKS (placeholder ->
     "Coming soon" instead of a dead link)
   - mobile nav toggle (aria-expanded) + sticky-nav state
   - scroll reveals that DEFAULT TO VISIBLE, with a load-time
     safety net so nothing ever ships blank
   - founding/scarcity counter, footer year

   Reveal CSS lives in styles.css. The key rule it must contain:
     .js .reveal-init { opacity:0; transform:translateY(18px); }
     .is-revealed     { opacity:1; transform:none;
                        transition:opacity .6s ease, transform .6s ease; }
     @media (prefers-reduced-motion: reduce) {
       .js .reveal-init { opacity:1; transform:none; }
     }
   The hidden state is gated on the .js class this file adds, so
   no-JS and headless renders always show content.
   ============================================================ */
(function () {
  'use strict';
  var doc = document;

  // JS is running: now reveal-hidden styles may apply.
  doc.documentElement.classList.add('js');

  function ready(fn) {
    if (doc.readyState !== 'loading') fn();
    else doc.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    wireCtas();
    foundingCount();
    mobileNav();
    stickyNav();
    reveals();
    footerYear();
  });

  // --- CTAs --------------------------------------------------
  function wireCtas() {
    var links = window.SITE_LINKS || {};
    doc.querySelectorAll('[data-cta]').forEach(function (el) {
      var key = el.getAttribute('data-cta');
      var url = links[key];
      var unset = !url || url.indexOf('REPLACE_WITH_') === 0;

      if (unset) {
        el.classList.add('is-pending');          // style this as a muted "Coming soon"
        el.setAttribute('aria-disabled', 'true');
        el.removeAttribute('href');
        el.addEventListener('click', function (e) { e.preventDefault(); });
        return;
      }

      if (key === 'email') url = 'mailto:' + url;
      el.setAttribute('href', url);
      if (/^https?:/.test(url)) el.setAttribute('rel', 'noopener');
      // To open external checkout in a new tab, also: el.setAttribute('target','_blank');
    });
  }

  // --- Founding / scarcity counter ---------------------------
  function foundingCount() {
    var data = window.SITE_FOUNDING;
    if (!data) return;
    doc.querySelectorAll('[data-founding-remaining]').forEach(function (el) {
      el.textContent = data.remaining;
    });
    doc.querySelectorAll('[data-founding-total]').forEach(function (el) {
      el.textContent = data.total;
    });
  }

  // --- Mobile nav --------------------------------------------
  function mobileNav() {
    var toggle = doc.querySelector('[data-nav-toggle]');
    var nav = doc.querySelector('[data-nav]');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });

    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      });
    });
  }

  // --- Sticky-nav scrolled state -----------------------------
  function stickyNav() {
    var header = doc.querySelector('[data-header]');
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // --- Scroll reveals (default-visible, with safety net) -----
  function reveals() {
    var nodes = doc.querySelectorAll('[data-reveal]');
    if (!nodes.length) return;

    nodes.forEach(function (el) { el.classList.add('reveal-init'); });

    var reduce = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce || !('IntersectionObserver' in window)) {
      revealAll();
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    nodes.forEach(function (el) { io.observe(el); });

    // The safety net: after load, force-reveal anything still hidden.
    // Transitions pause in background tabs and headless renders, so without
    // this a reveal-gated section can ship blank. This guarantees it can't.
    window.addEventListener('load', function () {
      setTimeout(revealAll, 1400);
    });
  }

  function revealAll() {
    doc.querySelectorAll('.reveal-init:not(.is-revealed)').forEach(function (el) {
      el.classList.add('is-revealed');
    });
  }

  // --- Footer year -------------------------------------------
  function footerYear() {
    doc.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }
})();
