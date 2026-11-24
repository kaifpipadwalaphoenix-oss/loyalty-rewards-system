# Trove Club — Brand & UX Research

**Source inspected:** https://trovelabel.com/ (live site, inspected 24 Nov 2026 in a real browser at desktop ~800px-wide pane and at a 375×812 mobile viewport).
**Method:** Visual inspection with screenshots, plus computed-style extraction (fonts, colours, button and input styles) via the browser's DevTools API. Hex values below marked **observed** were read from computed CSS, not guessed from screenshots.

> Convention in this document: **[Observed]** = seen on the live site. **[Recommendation]** = our design proposal for Trove Club.

---

## 1. Pages inspected

| Page | URL | Screenshot |
|---|---|---|
| Homepage (desktop): hero carousel | `/` | `research/screenshots/01-home-desktop-hero.jpg` |
| Homepage: "Woman" category tiles | `/` | `research/screenshots/02-home-desktop-category-tiles.jpg` |
| Homepage: "From the people" testimonial carousel | `/` | `research/screenshots/03-home-desktop-testimonial.jpg` |
| Homepage: trust strip, newsletter, footer | `/` | `research/screenshots/04-home-desktop-newsletter-footer.jpg` |
| Collection: Resort Dresses (44 products) | `/collections/resortwear` | `research/screenshots/05-collection-resort-dresses.jpg`, `12-collection-newsletter-popup.jpg` |
| Collection: Women's Swimwear | `/collections/swimwear` | `research/screenshots/11-collection-swimwear.jpg` |
| Product detail: Noir Ease Shift Dress | `/products/noir-ease-shift-dress` | `research/screenshots/06-product-detail-top.jpg`, `07-product-detail-ctas.jpg` |
| About Us | `/pages/about-us` | `research/screenshots/08-about-us.jpg` |
| Contact | `/pages/contact` | (text only) |
| Homepage (mobile 375px) | `/` | `research/screenshots/09-home-mobile-hero.jpg`, `10-home-mobile-category.jpg` |

**Limitations (honest):**
- No dedicated campaign/lookbook pages were found in navigation; campaigns appear only as homepage hero slides (Santorini/linen, Tidal Racer surfsuits, celebrity banner). "Trove x Stars" is a homepage section, not a separate page.
- The customer account area uses Shopify's hosted customer accounts (`/customer_authentication/redirect`); it was not entered (no login was attempted).
- No existing loyalty/rewards programme was found on the site.
- No physical store address is published on the site; the Contact page lists the registered office (Jogeshwari West, Mumbai). Testimonials refer to visiting "the store", so a physical store exists, but its location is not published. **The prototype must not invent a store address.**
- Several homepage images lazy-load and appeared as grey boxes in screenshots taken mid-scroll; that is a loading artefact, not the design.
- The mobile navigation drawer was opened but its animation had not rendered at screenshot time; its contents were confirmed from the accessibility tree (same menu as desktop).

---

## 2. Existing brand characteristics [Observed]

**Platform.** Shopify, theme "Testament" v8.8.0 (Shopify theme store #623). Many visual patterns come from this theme rather than bespoke brand design — worth knowing, because "what the theme does" is not necessarily "what the brand is".

**Positioning.** "trove — 365 days of summer" (wordmark tagline). Indian resortwear and swimwear label. About page: a brand that "lives by the ocean", founded by a fashion photographer, built around "euphoric prints and juicy bright colours", "rooted in inclusivity and body positivity", with sustainability claims (cotton, linen, cupro, Ecovero viscose; recycled polyester/nylon for swim).

**Categories.** Tidal Racer surfsuits (one-piece/two-piece/men), swimwear (one-pieces, bikini sets, coverups, kaftans), resort dresses, men's swimwear, men's wear, plus size, beach tees, bestsellers. Unisex and size-inclusive.

**Price band.** Observed products ₹3,590 – ₹9,990 (e.g., Noir Ease Shift Dress ₹3,990; Noir Riptide Poplin Dress from ₹6,490; Golden Hour Whirl Dress ₹9,990; swimwear ₹4,500–₹6,500). **This matters for the loyalty maths**: a typical basket is ₹4,000–₹10,000, so earning rates and tier thresholds must be designed around that, not around ₹500 grocery baskets.

**Social proof.** "Trove x Stars" (celebrity placements), "As seen in" press logos (Vogue India and others), "From the people" customer testimonials with customer photos — including one that mentions wearing a Trove outfit for a birthday. Birthdays and celebrations are already part of how customers talk about the brand.

**Tone of voice.** Two registers:
1. Warm, holiday, social: "Santorini Calling.", "Built for every wave you chase, designed to chill on them all!", "#instaworthy", "Trove belongs in your suitcase!"
2. Newer, more editorial product copy: "Uncomplicated. Unbothered. Undeniably present." Short declarative sentences, sensory language.

Product names are evocative places/moods: Santorini Siren, Limoncello Crush Co-ord, Rose Mirage, Blue Reverie, Golden Hour Whirl, Barbados, Mykonos, Tokyo.

---

## 3. Colour palette

### 3.1 Observed (computed CSS)

| Role on site | Hex | Notes |
|---|---|---|
| Primary text / nav / primary button | `#000000` | "Add to Cart" is solid black, square. |
| Body text | `#616161` | 6.19:1 on white — passes AA. |
| Page background | `#FFFFFF` | Dominant. Very white, airy. |
| Announcement bar & footer background ("blush") | `#F1DDD6` | The most recognisable brand tint. |
| Accent button ("Buy it now", "Join") | `#F2C0AE` | Soft peach/coral. Used with **white** text — **1.62:1, fails WCAG AA**. |
| Hairline borders / input borders ("sand") | `#E6E0D7` | |
| Dark grey | `#222222` | Secondary dark. |
| Neutral fills | `#F1F1F1`, `#F5F5F5`, `#F7F7F7` | Image placeholders, newsletter band. |
| "New Launch" badge | `#FF0000` with white text | 4.0:1, fails AA for small text; visually harsh against the soft palette. |

### 3.2 Colour that lives in the photography (not in the CSS)
The UI is deliberately neutral; the colour comes from the product and setting: ocean teal and cobalt (Tidal Racer hero, Blue Reverie, Santorini blue), coral and watermelon pinks (one-pieces, Rose Mirage), lemon yellow (Limoncello, Tidal Racer suit), sunset gold/sand (beach backdrops, "Golden Hour"), white linen. **Trove's identity is "neutral frame + vibrant content".**

---

## 4. Typography

### 4.1 Observed
| Use | Font | Observed size / tracking |
|---|---|---|
| Body, navigation, buttons, inputs | **Work Sans** 400/700 | 16px body. Nav uppercase. |
| Section headings ("Woman", "Trove x Stars"), product title | **Playfair Display** 400 | h3 35px, letter-spacing 1.75px; product h1 30px, 1.5px, grey `#616161`. Collection title uppercase in Playfair. |
| Also loaded | GT Standard (450–600) | Appears loaded by an app/widget; not visibly used in core UI. |

Headings are **regular weight, generously tracked serif** — the editorial signature. Nothing is bold-serif.

### 4.2 Recommendation
- Keep **Playfair Display** (display/headings, points balance numerals) and **Work Sans** (UI, body, data). This is the strongest, cheapest way to make Trove Club feel like Trove.
- Use Playfair at **regular (400) and italic** only; never bold. Larger sizes than the site (Club hero 40–56px) to feel more editorial.
- Work Sans 400/500/600 for UI. Uppercase + 0.08em tracking for small labels/eyebrows (echoes the site's uppercase nav).
- Data (tables, points, ₹) in Work Sans with `font-variant-numeric: tabular-nums lining-nums`.
- Self-host fonts (bundled), do not rely on Google Fonts CDN at runtime, so the prototype works offline during a presentation.

---

## 5. Photography & image direction

### 5.1 Observed
- Full-bleed hero carousel, often composites (model photography + texture panels + headline), ~16:9 desktop, near-portrait crop on mobile.
- Category tiles: **3:4 portrait**, single model, plain studio or warm sunlit wall, title in Playfair below the image (not overlaid).
- Product grids: 4 columns desktop, model on light studio background, thumbnails below main image on PDP.
- Lifestyle: ocean, surf, pool, beach clubs, linen/sun.
- Diverse models (skin tones, body types, men, plus size). Inclusivity is visible, not just stated.
- Testimonial photos are customer-taken (UGC), informal.

### 5.2 Recommendation for Trove Club
- **Customer portal:** one editorial hero image on landing and dashboard (sunlit, resort, warm), portrait 3:4 reward imagery, generous whitespace around imagery, titles below images like the site.
- **Admin portal:** imagery only where it carries information (reward thumbnails, a small brand image on login). No decorative stock in admin.
- **Asset source (open decision, see §10):** do **not** hotlink trovelabel.com CDN images. Either Trove supplies licensed brand images (preferred) or the prototype uses a small, locally stored, licence-cleared interim set with an attribution file, swapped later through one image manifest.
- Every image gets meaningful `alt` text (the live site's images all have empty `alt` — an accessibility gap we should not copy).
- Always reserve aspect-ratio boxes with a warm blush placeholder so loading never shows grey holes.

---

## 6. Existing UX patterns worth retaining [Observed → Recommendation]

1. **Blush announcement bar** at the very top. → Reuse as the Trove Club demo/prototype bar and for member announcements (e.g., "Double Points Weekend is on"). Instant brand recognition.
2. **Centred wordmark header, uppercase nav, generous whitespace.** → Customer portal header follows the same structure (wordmark centred on mobile, left on desktop with nav).
3. **Square corners everywhere** (buttons, inputs, tiles: `border-radius: 0`). → Keep square buttons/inputs as a signature. Only the membership card gets rounded corners (because it is a "card" object).
4. **Black primary CTA.** → Primary button stays near-black.
5. **Title-below-image tiles** with Playfair titles. → Reward cards use the same composition.
6. **Accordion details** on PDP (Details / Shipping / Returns). → Reward detail uses accordions for "How to use", "Terms".
7. **Blush footer with clear columns** → Customer portal footer (light), with help/contact.
8. **Testimonial/"from the people" warmth** → Customer copy should sound personal, not corporate.

## 7. Patterns that should NOT be copied

| Observed issue | Why | Trove Club approach |
|---|---|---|
| White text on peach `#F2C0AE` buttons (1.62:1) | Fails WCAG AA badly | Peach becomes a **surface**, never a text-on colour; peach buttons use near-black text (11.3:1) or we use black/tide buttons. |
| Pure red `#FF0000` "New Launch" badge | Harsh, off-palette, 4.0:1 | Badges use ink-on-blush or tide-on-white chips. |
| All images `alt=""` | Screen readers get nothing | Required alt text in reward editor. |
| Grey placeholder boxes during lazy load | Looks broken mid-scroll | Blush placeholders with fixed aspect ratios. |
| Newsletter popup interrupting browsing | Interrupts the primary task | No interstitial popups in Trove Club. |
| Two-row desktop nav wrapping at ~800px | Wraps awkwardly at tablet widths | Deliberate breakpoint switch to compact nav. |
| Floating chat bubble overlapping content bottom-right | Covers content on mobile | Reserve the bottom area for bottom navigation; no floating widgets over content. |
| Body copy centred in long paragraphs (About page) | Harder to read | Left-aligned body text; centring only for short display lines. |
| Product titles inconsistent case (some ALL CAPS, some Title Case) | Feels unpolished | One rule: Title Case for names, uppercase only for small eyebrows. |

---

## 8. Opportunities to elevate the identity

1. **Introduce one deep colour.** The site has no deep brand colour — everything is white/black/blush. A membership product needs a "card colour" that signals status. We recommend a deep ocean teal ("Tide", `#0F3D4A`) drawn from the Tidal Racer and Santorini ocean imagery. It works with blush (8.99:1) and peach (7.23:1) as text-on colours, so it can carry the membership card, the admin navigation and data visualisation.
2. **A signature motif.** A thin hand-drawn wave line (from the ocean theme, and echoing the curl in the "trove" wordmark) used sparingly: on the membership card, section dividers, empty states. One SVG, not a pattern library.
3. **Tier names that sound like Trove.** "365 days of summer" suggests a journey through a summer's day. Recommended seed tier names: **Shore → Tide → Golden Hour → Endless Summer** (fully renameable by admin). "Golden Hour" already exists as a Trove product name — it is on-brand. Risk: themed names are less self-explanatory than Silver/Gold; mitigated by always showing "Tier 2 of 4" and a visual ladder.
4. **Editorial microcopy.** Short, warm, declarative: "Your summer, rewarded." "Treat yourself — it's on us." Avoid gamified language ("Level up!", "XP").
5. **Celebration moments.** Birthday and anniversary benefits presented as a personal note card, not a promo banner — the testimonials show customers already buy Trove for celebrations.

---

## 9. Recommended Trove Club visual identity [Recommendation]

**Concept: "The Summer Ledger."** A white, airy, editorial frame (faithful to trovelabel.com) with one deep ocean colour for membership and data, blush as the warm brand surface, and peach/coral reserved for celebration.

| Element | Customer portal | Admin & counter |
|---|---|---|
| Canvas | White with blush bands | Warm off-white `#FAF6F3` canvas with white work surfaces |
| Deep colour | Membership card (tide gradient + wave line) | Sidebar/navigation in tide; charts in tide/blush scale |
| Headings | Playfair, large, editorial | Playfair only for page titles and KPI numerals; everything else Work Sans |
| Imagery | Prominent, portrait, warm | Functional thumbnails only |
| Corners | Square controls; 12px radius on membership card only | Square controls; 4px radius on panels |
| Density | Spacious, one idea per section | Compact but breathable; hairline dividers instead of shadowed cards |
| Motion | Gentle (card tilt-in, points count-up) | Minimal (state transitions only) |

Both share tokens, fonts, buttons, inputs and the wordmark lock-up "trove **club**", so they read as one product.

**Wordmark:** the official "trove" logo is a custom script mark (served as an image from Shopify). Do not redraw or trace it. The prototype uses a typeset lock-up — "trove" in Playfair Display italic + "CLUB" in tracked Work Sans — until Trove supplies the official SVG logo, at which point it is swapped in one component (`<Wordmark />`).

---

## 10. Mobile vs desktop considerations

**Observed mobile site:** hamburger left, wordmark centred, search + cart right; full-bleed portrait hero; single-column category tiles at full width; floating chat button.

**Recommendations:**
- **Customer portal is mobile-first.** Most members will open it on a phone, often in the store. Bottom tab bar (Home, Rewards, Activity, Profile) below 1024 px; top nav from 1024 px (see Design System §8). Membership card is the first thing on the dashboard at every size.
- **Counter (cashier) is tablet/phone-first.** Large 48–56px targets, numeric keypad input for mobile number and amount, one primary action per step.
- **Admin is desktop-first but fully usable on mobile:** sidebar collapses to a top bar + drawer; tables become stacked row-cards below 768px; filters move into a sheet.
- Test at 320, 375, 414, 768, 1024, 1280, 1440, 1920px.

---

## 11. Open brand decisions (need Trove's input, not blocking the build)

1. **Imagery rights.** Can the prototype use Trove's own campaign/product photography? Default: no hotlinking; use the image manifest with a licence-cleared interim set; swap when Trove provides assets.
2. **Official logo SVG.** Default: typeset lock-up.
3. **Tier names.** Default: Shore / Tide / Golden Hour / Endless Summer (configurable).
4. **Physical store details** (name/address shown on vouchers). Default: "Trove Label store" with no address.
