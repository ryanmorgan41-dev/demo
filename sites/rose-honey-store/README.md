# Rose & Honey Stitch Co. — website

A zero-build static marketing site (hand-authored HTML + CSS + vanilla JS). No framework,
no toolchain. It drops straight onto GitHub Pages and is wired to live links from one file.

## Pages
- `index.html` — home / sales page
- `gallery.html` — portfolio with a category filter (Apparel · Monograms & Home · Baby & Gifts)
- `services.html` — what we make, how custom orders work, pricing, bulk/team
- `about.html` — the maker's story
- `faq.html` — FAQs (+ FAQPage structured data)
- `legal/terms.html`, `legal/privacy.html` — **drafts, see "Legal" below**

## Going live — the short list

1. **Wire the buttons.** Edit `js/config.js` and replace every `REPLACE_WITH_*` value with a
   real URL. That's the *only* file you touch to make CTAs live. Until a value is replaced,
   that button shows **"Coming soon"** instead of a dead link. The keys:
   - `customOrder` — your custom-order form (Tally / Google Form / Typeform) **[primary CTA]**
   - `shop` — Stripe Payment Link or your store page for ready-made pieces
   - `etsy` — your Etsy shop URL
   - `instagram` — your Instagram profile
   - `email` — your contact email (auto-converted to a `mailto:` link)
   Also update the two `REPLACE_WITH_*` values in the `Organization` JSON-LD in `index.html`
   (`sameAs`).

2. **Add photos.** Drop real images into `images/` using the exact filenames in
   `images/README.md`. They replace the labeled placeholder boxes with no code change.
   Don't forget `og-image.jpg` (1200×630) and `favicon.png`.

3. **Write the About story.** Replace the `[FILL: ...]` highlighted blocks in `about.html`.

4. **Finalize the legal pages** (see below), then remove `<meta name="robots" content="noindex">`
   from `legal/terms.html` and `legal/privacy.html` and remove `Disallow: /legal/` in
   `robots.txt` if you want them indexed.

## Deploy to GitHub Pages
1. Create a repo and push the contents of this `site/` folder to it (the `site/` contents
   should be at the repo root, or set Pages to serve from `/site`).
2. Repo → **Settings → Pages** → Source: `main` branch. Save.
3. Your site appears at `https://<username>.github.io/<repo>/`.
4. **Custom domain (optional):** put your domain in the `CNAME` file (replace its comment
   contents with just the domain), add the DNS records at your registrar, then set the
   domain under Settings → Pages and enable "Enforce HTTPS". When you do, update the
   `https://roseandhoneystitch.co/` placeholders in the page `<head>` tags, `robots.txt`,
   and `sitemap.xml` to your real domain.

## Preview locally
From this folder:
```
python -m http.server 8000
```
Then open http://localhost:8000.

## Legal — read this
`legal/terms.html` and `legal/privacy.html` are **substantive drafts, not legal advice, and
have not been reviewed by an attorney.** They are tailored for a custom/personalized-goods
business (sales-are-final on custom items, a customer-artwork IP warranty + indemnity, and
customer-supplied-garment terms). Before launch:
- Fill every highlighted `[FILL: ...]` item (legal entity, state, contact email, deposit %,
  effective date).
- Have an attorney licensed in your state review both pages.
- They are set to `noindex` until you finalize them.

## Notes
- Edit text directly in the HTML — it's plain and legible.
- Design tokens (colors, fonts, spacing) live at the top of `css/styles.css`.
- The category filter and FAQ accordions are pure CSS/HTML (no JS needed).
