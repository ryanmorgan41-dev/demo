/* ============================================================
   blog.js — renders news posts from data/posts.json.
   (storefront-kit; editable in /admin/ → "My News & Updates".)

   posts.json shape:
     { "posts": [ { "title": "...", "date": "YYYY-MM-DD",
         "image": "images/x.jpg" (optional), "body": "...\n\n...",
         "show": true } ] }

   Renders into: #news-list, newest first. Body paragraphs are
   split on blank lines. Also emits Blog/BlogPosting JSON-LD.
   On fetch failure the static fallback content is left alone.
   ============================================================ */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function prettyDate(iso) {
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return esc(iso);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function paragraphs(body) {
    return String(body || '').split(/\n\s*\n/).map(function (p) {
      return '<p>' + esc(p.trim()) + '</p>';
    }).join('');
  }

  function card(p) {
    return '<article class="card news-card" data-reveal>' +
      (p.image ? '<img class="shot" src="' + esc(p.image) + '" alt="" loading="lazy">' : '') +
      '<p class="news-date">' + prettyDate(p.date) + '</p>' +
      '<h2>' + esc(p.title) + '</h2>' +
      paragraphs(p.body) +
      '</article>';
  }

  function emitJsonLd(items) {
    var pageUrl = location.origin + location.pathname;
    var data = {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      'blogPost': items.map(function (p) {
        var post = {
          '@type': 'BlogPosting',
          'headline': p.title,
          'datePublished': p.date,
          'articleBody': p.body,
          'url': pageUrl
        };
        if (p.image) post.image = new URL(p.image, pageUrl).href;
        return post;
      })
    };
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  var base = document.body.getAttribute('data-root') || '';
  fetch(base + 'data/posts.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      var list = document.getElementById('news-list');
      if (!list || !data) return;
      var items = (data.posts || []).filter(function (p) { return p.show !== false; });
      items.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
      list.innerHTML = items.length
        ? items.map(card).join('')
        : '<p class="lead center">No news yet — check back soon.</p>';
      emitJsonLd(items);
    })
    .catch(function () { /* keep static fallback content */ });
})();
