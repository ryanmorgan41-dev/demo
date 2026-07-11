/* ============================================================
   SITE CONFIG  —  the single place to wire up live links.

   This is the ONE file you edit to take the site live.
   Replace every REPLACE_WITH_* value with a real URL.
   Until a value is replaced, the buttons that point at it
   render as "Coming soon" instead of dead links (see main.js).

   In markup, a button names its target:
     <a class="btn" data-cta="customOrder">Request a custom order</a>
   and main.js sets its href from SITE_LINKS.customOrder below.
   ============================================================ */

window.SITE_LINKS = {
  // PRIMARY: where someone requests a bespoke / personalized order.
  // A form works best (Tally, Google Form, Typeform) so you capture
  // the details + their artwork. A mailto: also works — see "email".
  customOrder: "REPLACE_WITH_CUSTOM_ORDER_FORM_URL",

  // Buy ready-made pieces directly (Stripe Payment Link or store page).
  shop:        "REPLACE_WITH_STRIPE_OR_SHOP_URL",

  // The Etsy storefront.
  etsy:        "REPLACE_WITH_ETSY_SHOP_URL",

  // Social + contact. "email" is turned into a mailto: link automatically.
  instagram:   "REPLACE_WITH_INSTAGRAM_URL",
  facebook:    "REPLACE_WITH_FACEBOOK_URL",
  email:       "REPLACE_WITH_CONTACT_EMAIL"
};
