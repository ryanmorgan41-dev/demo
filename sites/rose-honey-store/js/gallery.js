/* ============================================================
   gallery.js — renders the gallery from data/gallery.json.

   The owner console app appends new pieces to gallery.json and
   pushes; this file turns that data into the same markup the
   hand-authored gallery used, so the CSS-only category filter
   (#f-* radios) and :target lightboxes keep working untouched.

   gallery.json shape:
     { "items": [ { "id": "slug", "src": "images/gallery/x.webp",
         "fallback": "images/gallery/x.jpg" | null,
         "alt": "...", "caption": "...", "cat": "apparel"|"mono"|"baby" } ] }
   Items are in display order (newest first).

   Renders into: #grid (gallery page), #lightboxes (gallery page),
   [data-gallery-teaser] (home page, first 3 items).
   On fetch failure the static fallback content is left alone.
   ============================================================ */
(function () {
  'use strict';
  var CAT_LABEL = { apparel: 'Apparel', mono: 'Monograms & Home', baby: 'Baby & Gifts' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function pic(item, extraAlt) {
    var img = '<img src="' + esc(item.src) + '" alt="' + esc(item.alt) + (extraAlt || '') + '" loading="lazy">';
    if (!item.fallback) return img;
    return '<picture><source srcset="' + esc(item.src) + '" type="image/webp">' +
      '<img src="' + esc(item.fallback) + '" alt="' + esc(item.alt) + (extraAlt || '') + '" loading="lazy"></picture>';
  }

  function render(items) {
    var grid = document.getElementById('grid');
    var lbs = document.getElementById('lightboxes');
    if (grid && lbs) {
      var figs = [], boxes = [];
      items.forEach(function (it) {
        var lbId = 'lb-' + it.id;
        figs.push(
          '<figure class="item cat-' + esc(it.cat) + '">' +
          '<a class="rh-piece" href="#' + lbId + '">' + pic(it) +
          '<figcaption>' + esc(it.caption) +
          '<span class="rh-piece__cat">' + esc(CAT_LABEL[it.cat] || it.cat) + '</span></figcaption></a></figure>'
        );
        boxes.push(
          '<div class="rh-lb" id="' + lbId + '" role="dialog" aria-label="' + esc(it.caption) + '">' +
          '<a class="rh-lb__backdrop" href="#wall" aria-label="Close"></a>' +
          '<div class="rh-lb__panel">' + pic(it, ', enlarged') +
          '<p class="rh-lb__cap">' + esc(it.caption) +
          ' — <a data-cta="customOrder" href="#">commission something similar</a></p>' +
          '<a class="rh-lb__close" href="#wall" aria-label="Close">&times;</a></div></div>'
        );
      });
      grid.innerHTML = figs.join('');
      lbs.innerHTML = boxes.join('');
    }

    var teaser = document.querySelector('[data-gallery-teaser]');
    if (teaser && items.length) {
      teaser.innerHTML = items.slice(0, 3).map(function (it) {
        return '<a href="gallery.html"><img class="shot ph--square" src="' + esc(it.src) +
          '" alt="' + esc(it.alt) + '" loading="lazy"></a>';
      }).join('');
    }

    // new [data-cta] links exist now — re-wire them the same way main.js does
    if (window.SITE_LINKS) {
      document.querySelectorAll('#lightboxes [data-cta]').forEach(function (el) {
        var url = window.SITE_LINKS[el.getAttribute('data-cta')];
        if (!url || url.indexOf('REPLACE_WITH_') === 0) {
          el.classList.add('is-pending');
          el.setAttribute('aria-disabled', 'true');
          el.removeAttribute('href');
        } else {
          el.setAttribute('href', el.getAttribute('data-cta') === 'email' ? 'mailto:' + url : url);
        }
      });
    }
  }

  var base = document.body.getAttribute('data-root') || '';
  fetch(base + 'data/gallery.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) { render((data && data.items) || []); })
    .catch(function () { /* keep static fallback content */ });
})();
