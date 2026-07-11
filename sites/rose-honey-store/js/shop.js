/* ============================================================
   shop.js — renders the shop from data/products.json.
   (storefront-kit; follows the gallery.js conventions.)

   products.json shape:
     { "currency": "USD",
       "snipcartKey": "..." | "REPLACE_WITH_...",
       "products": [ { "id": "slug" (optional — derived from title),
           "title": "...", "description": "...",
           "price": 42.0, "image": "images/x.webp",
           "category": "apparel"|"mono"|"baby",
           "tags": ["baby gift", "monogram"],
           "fileGuid": "..." (optional — Snipcart digital download),
           "options": [ { "name": "Size", "values": ["S","M","L[+2.00]"] } ],
           "active": true } ] }

   Renders into: #shop-grid. Buttons carry Snipcart v3 attributes;
   on-page <select>s sync data-item-customN-value so the buyer's
   choice travels into the cart. Also emits JSON-LD Product
   structured data for search engines. Snipcart JS/CSS load only
   when a real key is present — until then buttons render as a
   disabled "Checkout coming soon".
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

  function slug(s) {
    return String(s == null ? '' : s).toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function money(n, currency) {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(n);
    } catch (e) { return '$' + Number(n).toFixed(2); }
  }

  function optionValues(values) { // "L[+2.00]" -> label "L", keeps raw for Snipcart
    return values.map(function (v) {
      var m = /^(.*?)\s*\[([+-][0-9.]+)\]$/.exec(v);
      return { raw: v, label: m ? m[1] : v, delta: m ? Number(m[2]) : 0 };
    });
  }

  function card(p, currency, live) {
    var id = p.id || slug(p.title);
    var attrs = [
      'data-item-id="' + esc(id) + '"',
      'data-item-name="' + esc(p.title) + '"',
      'data-item-price="' + Number(p.price).toFixed(2) + '"',
      'data-item-image="' + esc(p.image) + '"',
      'data-item-url="shop.html"',
      'data-item-description="' + esc(p.description) + '"'
    ];
    if (p.fileGuid) attrs.push('data-item-file-guid="' + esc(p.fileGuid) + '"');
    var selects = '';
    (p.options || []).forEach(function (opt, i) {
      var n = i + 1;
      var vals = optionValues(opt.values || []);
      attrs.push('data-item-custom' + n + '-name="' + esc(opt.name) + '"');
      attrs.push('data-item-custom' + n + '-options="' + esc((opt.values || []).join('|')) + '"');
      attrs.push('data-item-custom' + n + '-value="' + esc(vals.length ? vals[0].raw : '') + '"');
      selects +=
        '<label class="shop-opt">' + esc(opt.name) +
        '<select data-custom="' + n + '">' +
        vals.map(function (v) {
          var extra = v.delta ? ' (+' + money(v.delta, currency) + ')' : '';
          return '<option value="' + esc(v.raw) + '">' + esc(v.label) + extra + '</option>';
        }).join('') +
        '</select></label>';
    });
    var chips = (p.tags || []).map(function (t) {
      return '<span class="shop-tag">' + esc(t) + '</span>';
    }).join('');
    var btn = live
      ? '<button class="btn btn--primary snipcart-add-item" ' + attrs.join(' ') + '>Add to cart</button>'
      : '<button class="btn btn--primary" disabled aria-disabled="true" ' + attrs.join(' ') + '>Checkout coming soon</button>';
    return '<article class="card shop-card" data-product="' + esc(id) + '">' +
      '<img class="shot ph--square" src="' + esc(p.image) + '" alt="' + esc(p.title) + '" loading="lazy">' +
      '<span class="card__tag">' + esc(CAT_LABEL[p.category] || p.category) + '</span>' +
      '<h3>' + esc(p.title) + '</h3>' +
      '<p>' + esc(p.description) + '</p>' +
      (chips ? '<div class="shop-tags">' + chips + '</div>' : '') +
      '<p class="shop-price">' + money(p.price, currency) + '</p>' +
      selects + btn + '</article>';
  }

  function wireSelects(grid) {
    grid.addEventListener('change', function (e) {
      var sel = e.target.closest('select[data-custom]');
      if (!sel) return;
      var btn = sel.closest('.shop-card').querySelector('[data-item-id]');
      if (btn) btn.setAttribute('data-item-custom' + sel.getAttribute('data-custom') + '-value', sel.value);
    });
  }

  function emitJsonLd(items, currency) {
    var pageUrl = location.origin + location.pathname;
    var data = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'itemListElement': items.map(function (p, i) {
        return {
          '@type': 'ListItem',
          'position': i + 1,
          'item': {
            '@type': 'Product',
            'name': p.title,
            'description': p.description,
            'image': new URL(p.image, pageUrl).href,
            'sku': p.id || slug(p.title),
            'keywords': (p.tags || []).join(', '),
            'offers': {
              '@type': 'Offer',
              'priceCurrency': currency || 'USD',
              'price': Number(p.price).toFixed(2),
              'availability': 'https://schema.org/InStock',
              'url': pageUrl
            }
          }
        };
      })
    };
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  function loadSnipcart(key) {
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://cdn.snipcart.com/themes/v3.7.1/default/snipcart.css';
    document.head.appendChild(css);
    var mount = document.createElement('div');
    mount.hidden = true;
    mount.id = 'snipcart';
    mount.setAttribute('data-api-key', key);
    mount.setAttribute('data-config-modal-style', 'side');
    document.body.appendChild(mount);
    var js = document.createElement('script');
    js.async = true;
    js.src = 'https://cdn.snipcart.com/themes/v3.7.1/default/snipcart.js';
    document.body.appendChild(js);
  }

  var base = document.body.getAttribute('data-root') || '';
  fetch(base + 'data/products.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      var grid = document.getElementById('shop-grid');
      if (!grid || !data) return;
      var live = data.snipcartKey && data.snipcartKey.indexOf('REPLACE_WITH_') !== 0;
      var items = (data.products || []).filter(function (p) { return p.active !== false; });
      grid.innerHTML = items.length
        ? items.map(function (p) { return card(p, data.currency, live); }).join('')
        : '<p class="lead center">New pieces are on the way — check back soon.</p>';
      wireSelects(grid);
      emitJsonLd(items, data.currency);
      if (live) loadSnipcart(data.snipcartKey);
    })
    .catch(function () { /* keep static fallback content */ });
})();
