/* ============================================================
   testimonials.js — renders customer quotes from
   data/testimonials.json (editable in /admin/ → "Kind Words").
   (storefront-kit.)

   testimonials.json shape:
     { "items": [ { "quote": "...", "name": "Sarah M.",
         "detail": "Custom name blanket" (optional), "show": true } ] }

   Renders into: #testimonials-list; unhides #testimonials when
   there is at least one visible quote (so an emptied list never
   leaves a blank band on the page).

   Deliberately NO Review/AggregateRating JSON-LD: Google's
   guidelines require genuine third-party reviews for that markup;
   self-published quotes with review schema risk a manual action.
   Visible social proof only.
   ============================================================ */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function card(t) {
    return '<figure class="card kind-card">' +
      '<blockquote>' + esc(t.quote) + '</blockquote>' +
      '<figcaption>' + esc(t.name) +
      (t.detail ? '<span>' + esc(t.detail) + '</span>' : '') +
      '</figcaption></figure>';
  }

  var base = document.body.getAttribute('data-root') || '';
  fetch(base + 'data/testimonials.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      var list = document.getElementById('testimonials-list');
      var section = document.getElementById('testimonials');
      if (!list || !data) return;
      var items = (data.items || []).filter(function (t) { return t.show !== false && t.quote; });
      if (!items.length) return; // section stays hidden
      list.innerHTML = items.map(card).join('');
      if (section) section.hidden = false;
    })
    .catch(function () { /* section stays hidden */ });
})();
