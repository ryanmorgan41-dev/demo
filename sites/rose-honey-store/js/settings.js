/* ============================================================
   settings.js — renders owner-editable site settings from
   data/site.json (editable in /admin/ → "My Site Settings").
   (storefront-kit; pairs with config.js/main.js, touches neither.)

   site.json shape:
     { "announcement": { "show": true, "text": "...", "link": "" },
       "phone": "", "hours": "", "email": "",
       "formKey":       "..." | "REPLACE_WITH_...",   // Web3Forms
       "bookingUrl":    "..." | "REPLACE_WITH_...",   // Cal.com link part
       "analyticsCode": "..." | "REPLACE_WITH_..." }  // GoatCounter code

   What it does, all optional / graceful when unset:
   - announcement.show + text  -> banner injected above the header
   - hours / phone             -> line appended to the footer bottom
   - [data-requires="key"]     -> element hidden until that key is set
     (e.g. the Book nav link hides until bookingUrl is real)
   - #order-form               -> submits to Web3Forms with formKey;
     placeholder key -> friendly "not connected yet" note instead
   - #newsletter-form          -> same Web3Forms rail (subject:
     newsletter signup); addresses land in the owner's inbox
   - #cal-embed                -> Cal.com inline booking embed
   - analyticsCode             -> GoatCounter script injected
   ============================================================ */
(function () {
  'use strict';
  var doc = document;

  function unset(v) {
    return !v || String(v).indexOf('REPLACE_WITH_') === 0;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function announce(a) {
    if (!a || !a.show || !a.text) return;
    var style = doc.createElement('style');
    style.textContent =
      '.site-announce{background:var(--ink,#3a3330);color:var(--surface,#fff);' +
      'text-align:center;padding:0.55rem 0.9rem;font-size:0.9rem;letter-spacing:0.01em}' +
      '.site-announce a{color:inherit;font-weight:600;text-decoration:underline}';
    doc.head.appendChild(style);
    var bar = doc.createElement('div');
    bar.className = 'site-announce';
    bar.setAttribute('role', 'status');
    bar.innerHTML = unset(a.link)
      ? esc(a.text)
      : '<a href="' + esc(a.link) + '">' + esc(a.text) + '</a>';
    doc.body.insertBefore(bar, doc.body.firstChild);
  }

  function footerInfo(data) {
    if (!data.hours && !data.phone) return;
    var foot = doc.querySelector('.footer-bottom');
    if (!foot) return;
    var bits = [];
    if (data.hours) bits.push(esc(data.hours));
    if (data.phone) {
      bits.push('<a href="tel:' + esc(String(data.phone).replace(/[^\d+]/g, '')) + '">' +
        esc(data.phone) + '</a>');
    }
    var p = doc.createElement('p');
    p.className = 'site-hours';
    p.innerHTML = bits.join(' · ');
    foot.insertBefore(p, foot.firstChild);
  }

  function gateRequires(data) {
    doc.querySelectorAll('[data-requires]').forEach(function (el) {
      if (unset(data[el.getAttribute('data-requires')])) el.style.display = 'none';
    });
  }

  function note(el, msg) {
    var n = el.querySelector('.form-note') || el.appendChild(doc.createElement('p'));
    n.className = 'form-note';
    n.setAttribute('role', 'alert');
    n.textContent = msg;
  }

  function orderForm(data) {
    var form = doc.getElementById('order-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.querySelector('[name="_gotcha"]') &&
          form.querySelector('[name="_gotcha"]').value) return; // honeypot
      var fallback = data.email
        ? 'The order form isn’t connected yet — email us at ' + data.email + ' instead.'
        : 'The order form isn’t connected yet — please reach us through the links below.';
      if (unset(data.formKey)) { note(form, fallback); return; }
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      var fd = new FormData(form);
      fd.append('access_key', data.formKey);
      fd.append('subject', 'New custom order request from the website');
      fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res.success) {
            form.querySelectorAll('.form-fields, button[type="submit"]').forEach(function (el) {
              el.style.display = 'none';
            });
            note(form, 'Thank you! Your request is in — we’ll get back to you within a day or two.');
          } else { throw new Error(res.message || 'submit failed'); }
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.textContent = 'Send my request'; }
          note(form, 'Something went wrong sending the form. ' + fallback);
        });
    });
  }

  function newsletterForm(data) {
    var form = doc.getElementById('newsletter-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.querySelector('[name="_gotcha"]') &&
          form.querySelector('[name="_gotcha"]').value) return; // honeypot
      if (unset(data.formKey)) {
        note(form, data.email
          ? 'Email signups aren’t set up yet — email us at ' + data.email + ' and we’ll add you.'
          : 'Email signups aren’t set up yet — check back soon.');
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Signing up…'; }
      var fd = new FormData(form);
      fd.append('access_key', data.formKey);
      fd.append('subject', 'Newsletter signup from the website');
      fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res.success) {
            form.querySelectorAll('.form-fields').forEach(function (el) { el.style.display = 'none'; });
            note(form, 'You’re on the list — thank you!');
          } else { throw new Error(res.message || 'submit failed'); }
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.textContent = 'Sign me up'; }
          note(form, 'Something went wrong — please try again in a minute.');
        });
    });
  }

  function booking(data) {
    var mount = doc.getElementById('cal-embed');
    if (!mount) return;
    if (unset(data.bookingUrl)) {
      var p = doc.createElement('p');
      p.className = 'lead center';
      p.textContent = 'Online booking isn’t set up yet — reach us through the links below and we’ll find a time.';
      mount.appendChild(p);
      return;
    }
    /* Cal.com official inline embed loader */
    (function (C, A, L) {
      var p = function (a, ar) { a.q.push(ar); };
      var d = C.document;
      C.Cal = C.Cal || function () {
        var cal = C.Cal, ar = arguments;
        if (!cal.loaded) {
          cal.ns = {}; cal.q = cal.q || [];
          d.head.appendChild(d.createElement('script')).src = A;
          cal.loaded = true;
        }
        if (ar[0] === L) {
          var api = function () { p(api, arguments); };
          var namespace = ar[1];
          api.q = api.q || [];
          if (typeof namespace === 'string') { cal.ns[namespace] = api; p(api, ar); }
          else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
    })(window, 'https://app.cal.com/embed/embed.js', 'init');
    window.Cal('init', { origin: 'https://cal.com' });
    window.Cal('inline', { elementOrSelector: '#cal-embed', calLink: data.bookingUrl });
  }

  function analytics(data) {
    if (unset(data.analyticsCode)) return;
    var s = doc.createElement('script');
    s.async = true;
    s.src = 'https://gc.zgo.at/count.js';
    s.setAttribute('data-goatcounter',
      'https://' + encodeURIComponent(data.analyticsCode) + '.goatcounter.com/count');
    doc.head.appendChild(s);
  }

  var base = doc.body.getAttribute('data-root') || '';
  fetch(base + 'data/site.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      if (!data) return;
      window.SITE_SETTINGS = data;
      announce(data.announcement);
      footerInfo(data);
      gateRequires(data);
      orderForm(data);
      newsletterForm(data);
      booking(data);
      analytics(data);
    })
    .catch(function () { /* settings are progressive enhancement — page works without them */ });
})();
