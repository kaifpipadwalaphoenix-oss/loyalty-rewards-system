# Trove Club — Design System

Concept: **"The Summer Ledger"** — trovelabel.com's white, editorial, square-cornered frame + one deep ocean colour for membership and data + blush as the warm brand surface + peach/coral for celebration. Grounded in the research (see `TROVE_CLUB_BRAND_AND_UX_RESEARCH.md`). All contrast ratios below were computed (WCAG relative luminance), not estimated.

Implementation: tokens live in `src/styles/tokens.css` as CSS custom properties and are exposed to Tailwind v4 via `@theme`. **No raw hex values in components.** Light theme only for v1 (the brand is bright and sunny; the live site has no dark theme) — tokens are structured so a dark theme can be added later by redefining semantic tokens.

---

## 1. Colour

### 1.1 Brand palette (primitives)
| Token | Hex | Source | Use |
|---|---|---|---|
| `--ink-900` | `#141414` | site black, softened | Primary text, primary buttons |
| `--ink-700` | `#2B2826` | | Headings on blush |
| `--ink-500` | `#5E5A57` | site body grey `#616161`, warmed | Secondary text (6.83:1 on white, 6.35:1 on shell) |
| `--ink-400` | `#8C8178` | | Input borders (3.80:1 — meets 3:1 UI component contrast) |
| `--ink-300` | `#8C8682` | | Disabled text, large placeholder only (3.59:1 — never for body copy) |
| `--sand-200` | `#E6E0D7` | **observed** site borders | Hairline dividers, table rules (decorative) |
| `--sand-100` | `#F3EFE9` | | Subtle fills, table header |
| `--shell-50` | `#FAF6F3` | | Admin/counter canvas |
| `--white` | `#FFFFFF` | | Surfaces |
| `--blush-200` | `#F1DDD6` | **observed** announcement bar/footer | Brand bands, selected states, demo bar |
| `--blush-100` | `#F8ECE7` | | Soft highlight backgrounds |
| `--peach-300` | `#F2C0AE` | **observed** accent button | Celebration surfaces (occasion cards). Text on it: ink only (11.34:1). **Never white text.** |
| `--coral-600` | `#A8432B` | swimwear prints | Accent text/links in customer portal, points earned (+) highlight (6.00:1) |
| `--tide-900` | `#0B2E38` | | Gradient end, admin sidebar hover |
| `--tide-800` | `#0F3D4A` | ocean imagery | Membership card, admin sidebar, focus ring, chart primary (11.75:1 white-on) |
| `--tide-600` | `#2C6573` | | Chart secondary, info |
| `--tide-100` | `#E3EEF0` | | Info backgrounds |
| `--sun-400` | `#C9A24A` | sunset/golden hour | Golden Hour tier accent (ink text on it 7.68:1) |

### 1.2 Semantic tokens (components use only these)
| Semantic token | Value | Notes |
|---|---|---|
| `--color-bg` | white | Customer page background |
| `--color-bg-app` | shell-50 | Admin/counter canvas |
| `--color-surface` | white | Panels, cards |
| `--color-surface-muted` | sand-100 | Table headers, inactive tabs |
| `--color-surface-brand` | blush-200 | Bands, announcement/demo bar |
| `--color-surface-celebrate` | peach-300 | Occasion cards |
| `--color-surface-inverse` | tide-800 | Membership card, admin sidebar |
| `--color-text` | ink-900 | |
| `--color-text-muted` | ink-500 | |
| `--color-text-subtle` | ink-300 | Large/disabled only |
| `--color-text-inverse` | white | On tide |
| `--color-text-inverse-muted` | blush-200 | On tide (8.99:1) |
| `--color-text-accent` | coral-600 | |
| `--color-border` | sand-200 | Decorative separators |
| `--color-border-strong` | ink-400 | Inputs, checkboxes, outline buttons |
| `--color-focus` | tide-800 | 2px ring + 2px offset (white) |
| `--color-success-fg` / `-bg` | `#1F6B4A` / `#E8F3EC` | 5.66:1 |
| `--color-warning-fg` / `-bg` | `#8A5300` / `#FFF3DC` | 5.76:1 |
| `--color-danger-fg` / `-bg` | `#B42318` / `#FDECEA` | 5.75:1 |
| `--color-info-fg` / `-bg` | tide-800 / tide-100 | |

**Status is never colour-only:** every status chip has an icon or text label.

### 1.3 Tier accents (fixed brand set; admin picks one per tier)
| Key | Card treatment | Chip |
|---|---|---|
| `shore` | blush-200 surface, ink text | ink on blush |
| `tide` | tide-800 gradient, white text | white on tide |
| `golden` | tide-900 → sun-400 subtle gradient band, white text | ink on sun-400 |
| `endless` | ink-900 → tide-900 gradient with peach wave line, white text | white on ink |

### 1.4 Data visualisation
Sequential: tide-800, tide-600, `#7FA7B0`, `#BFD4D8`. Categorical (max 4 series): tide-800, coral-600, sun-400, ink-500. "Issued vs redeemed": issued = tide-800, redeemed = coral-600. Always a legend + direct labels where possible; tooltips show exact values; charts have a text summary for screen readers ("Points issued 18,450 vs redeemed 6,200 in the last 30 days").

---

## 2. Typography

Fonts (self-hosted via `@fontsource/playfair-display` and `@fontsource-variable/work-sans`; fallbacks `Georgia, serif` and `system-ui, sans-serif`).

| Token | Font | Size / line-height | Tracking | Use |
|---|---|---|---|---|
| `display-xl` | Playfair 400 | 56/60 (desktop), 40/44 (mobile) | 0.01em | Landing hero |
| `display-lg` | Playfair 400 | 40/48, mobile 32/38 | 0.01em | Points balance numeral, page hero titles |
| `h1` | Playfair 400 | 32/40, mobile 28/34 | 0.02em | Page titles |
| `h2` | Playfair 400 | 24/32 | 0.02em | Section titles |
| `h3` | Work Sans 600 | 18/26 | 0 | Card titles, panel headers |
| `body-lg` | Work Sans 400 | 18/28 | 0 | Customer intro text |
| `body` | Work Sans 400 | 16/24 | 0 | Default |
| `body-sm` | Work Sans 400 | 14/20 | 0 | Table cells, helper text (min size for content) |
| `eyebrow` | Work Sans 500 | 12/16 | 0.12em, UPPERCASE | Section labels, tier label |
| `numeric` | Work Sans 500 tabular-nums lining-nums | inherits | 0 | ₹ amounts, points in tables |
| `kpi` | Playfair 400 lining-nums | 36/40 | 0 | Admin KPI numerals |

Rules: Playfair never bold. Max line length 68ch. Body copy left-aligned; centring only for ≤ 2-line display text. Minimum 14px for any readable text; 12px only for uppercase eyebrows. Use `en-IN` formatting for numbers and dates (`24 Nov 2026`).

---

## 3. Spacing, layout, grid

- **Spacing scale (4px base):** 0, 1 (4), 2 (8), 3 (12), 4 (16), 5 (20), 6 (24), 8 (32), 10 (40), 12 (48), 16 (64), 20 (80), 24 (96). Use only these.
- **Breakpoints:** `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536.
- **Customer portal:** max content width 1120px; gutters 16 (mobile) / 24 (md) / 40 (lg). 4-col grid mobile, 8 md, 12 lg. Section vertical rhythm 48 (mobile) / 80 (desktop).
- **Admin:** sidebar 248px (lg+), content max 1440px, gutters 16/24/32. 12-col grid on lg.
- **Counter:** single column max 640px centred on tablet/desktop; two columns (member panel 360px | action panel) at ≥ 1024px.
- **Radii:** `--radius-none` 0 (buttons, inputs, tiles — brand signature), `--radius-sm` 4px (admin panels, menus, dialogs), `--radius-card` 12px (membership card only), `--radius-pill` 999px (chips, badges, toggles).
- **Elevation:** prefer hairline borders. Shadows only for floating layers: `--shadow-overlay: 0 12px 32px rgb(11 46 56 / 0.14)` (dialogs, popovers, sheets) and `--shadow-card: 0 8px 24px rgb(11 46 56 / 0.18)` (membership card).
- **Z-index:** base 0, sticky header 20, bottom nav 30, demo bar 40, overlay/dialog 50, toast 60.

---

## 4. Components

All interactive components: min target **44×44px** (customer/admin), **48px** height inputs/buttons at the counter (primary counter actions 56px). Focus ring: `outline: 2px solid var(--color-focus); outline-offset: 2px`, visible on keyboard focus (`:focus-visible`), never removed.

### 4.1 Buttons
| Variant | Style | Use |
|---|---|---|
| `primary` | ink-900 bg, white text, square, 600 weight | One per view — main action |
| `secondary` | white bg, ink-900 text, 1px ink-900 border | Alternative actions |
| `brand` | tide-800 bg, white text | Admin save, counter confirm |
| `celebrate` | peach-300 bg, ink-900 text | Occasion CTAs only |
| `ghost` | transparent, ink text, underline on hover | Tertiary, table row actions |
| `danger` | danger-fg bg, white text | Destructive confirm only (inside dialogs) |
| Sizes | sm 36px (admin tables only, with 44px hit area via padding), md 44px, lg 52px, xl 56px (counter) |
| States | hover (bg darken 6% / underline), active (translateY 1px), focus-visible ring, disabled (40% opacity + `aria-disabled` + tooltip reason where meaningful), loading (spinner replaces icon, label persists, `aria-busy`, click ignored) |

Labels are verbs: "Redeem for 500 pts", "Record purchase", "Save changes". Never "Submit"/"OK".

### 4.2 Form controls
- **Input:** 48px height, square, 1px ink-400 border, 16px text (prevents iOS zoom), label above (always visible, never placeholder-as-label), helper text below, error replaces helper with icon + message in danger-fg, `aria-invalid`, `aria-describedby`.
- **Prefixed inputs:** mobile (`+91` fixed prefix, `inputmode="numeric"`, formatted `98765 43210`), currency (`₹` prefix, `inputmode="decimal"`, max 2 decimals, formatted on blur).
- **Select / Dropdown:** shadcn `Select` restyled square; native `<select>` acceptable on mobile for day/month.
- **Day–month picker** (birthday/anniversary): two selects (Day, Month) — not a calendar (no year needed; faster on mobile).
- **Date range:** preset segmented control; custom range deferred.
- **Checkbox / Radio / Switch:** 20px control within 44px label hit area; switch for on/off config; radio cards for marital status.
- **Segmented control:** for filters with ≤ 4 options (e.g., Earned / Redeemed / Expired).
- **Validation timing:** on blur and on submit; re-validate on change after first error. Submit button never disabled for validation — show errors instead (disabled only while submitting).
- **Error summary:** for forms with > 4 fields, a summary at top on submit, links focus the field.

### 4.3 Cards & surfaces
- **Membership card** (signature): 1.586:1 ratio (credit card), radius 12, tier gradient, subtle wave line SVG, "trove CLUB" lock-up top-left, tier eyebrow top-right, member name, member number `TC 104 582` (tabular), points balance in Playfair. Entrance: 400ms fade + 8px rise (disabled under reduced motion). Must render at 288px width without truncating names (ellipsis + `title` after 24 chars).
- **Reward card:** image 3:4 (customer), title below image in Playfair 20px, points cost in `numeric`, eligibility chip ("You can redeem", "250 pts to go", "Golden Hour and above"). Whole card is one link; no nested buttons.
- **Occasion card:** peach surface, small envelope/cake line icon, Playfair headline "Your birthday treat is ready", body with exact benefit and validity, CTA.
- **Panel (admin):** white, 1px sand-200 border, radius 4, header row (h3 + actions right), 24px padding (16 mobile). Avoid nesting panels.
- **KPI band (admin):** one horizontal band with dividers, not separate floating cards: eyebrow label, Playfair numeral, delta/context line ("vs previous 30 days" — only if the previous period has data; otherwise omit).

### 4.4 Tables (admin)
- Header: sand-100, eyebrow style, sticky within scroll container. Rows 56px, hairline separators, hover shell-50, numeric columns right-aligned tabular.
- Row click opens detail (whole row is a link, with a visible chevron); actions in a trailing "⋯" menu.
- Sorting via header buttons with `aria-sort`. Pagination: "1–20 of 26" + prev/next, 20 rows default.
- **< 768px:** table becomes a stacked list of row cards (primary field bold, 2–3 secondary fields, chevron). Never horizontal-scroll a primary table on mobile; secondary wide tables (CSV-like ledger) may scroll horizontally inside a bordered container with a visible scroll hint.
- Empty state inside the table frame (not a blank page).

### 4.5 Navigation
- **Customer:** top header (wordmark, nav: Home, Rewards, Activity, Membership; account menu) ≥ 1024px. < 1024px: compact header (wordmark centred, notifications bell + avatar right) + **bottom tab bar** (Home, Rewards, Activity, Profile; icons + labels, 64px tall incl. safe-area inset). Active state: ink text + 2px tide indicator.
- **Admin:** left sidebar (tide-800; white labels; active item blush-200 bg with ink text) ≥ 1024px. < 1024px: top bar with menu button → drawer (focus trapped, Esc closes). Sidebar footer: signed-in staff + role + sign out + "Open counter".
- **Counter:** minimal top bar (wordmark, staff name, "Verify code", "My history", sign out). No sidebar.
- **Demo bar:** 36px blush strip at the very top of every portal: "Prototype · simulated sign-in · data stored in this browser" + "Demo" button (opens persona switcher / presenter guide / reset). On mobile collapses to a 32px strip with a "Demo" button.
- **Breadcrumbs:** admin detail pages only ("Customers / Tara Menon").

### 4.6 Overlays
- **Dialog** (shadcn Dialog/AlertDialog): radius 4, max-width 480 (confirmations) / 640 (forms), title Playfair 24, body, actions right-aligned (primary right) on desktop, stacked full-width on mobile (primary top). Focus trap, Esc closes (except while submitting), return focus to trigger.
- **Sheet:** mobile alternative for filters and confirmations (bottom sheet, max 90vh).
- **Confirmation for destructive actions:** names the object and consequence ("Void purchase P-000123? ₹2,000 leaves Kabir's qualifying spend and 100 points are reversed. This can't be undone.") + required reason field where policy requires.
- **Toast** (sonner): bottom-centre mobile, bottom-right desktop, 4s (errors persist until dismissed), icon + message + optional action ("View voucher"). `role="status"` / errors `role="alert"`. Never the only feedback for a completed critical action — success screens/inline states carry the result.
- **Popover/Dropdown menu:** square-ish radius 4, 8px item padding, keyboard navigable (Radix).

### 4.7 Feedback states
- **Loading:** skeletons matching final layout (blush-100 shimmer, disabled under reduced motion) for first render; inline spinners for actions. The local data layer is synchronous, so loading states appear only for: app hydration, simulated OTP send/verify (600–900ms deliberate delay, labelled), command submission (150–300ms to show feedback), image upload processing.
- **Empty:** wave-line illustration (one SVG), Playfair one-line headline, one sentence, one action. E.g., Vouchers: "No vouchers yet — Your redeemed rewards will appear here. [Browse rewards]".
- **Error:** inline (field), section-level (panel with retry), page-level (error boundary: "Something went wrong on this page" + Reload + Go home; error details in a collapsible for the presenter).
- **Success:** inline confirmation screen for major actions (redemption, purchase) with the result values; toast for minor saves.
- **Storage warning banner:** persistent warning-bg banner under the demo bar if storage is unavailable or data was recovered.

### 4.8 Chips & badges
Pill radius, 24px height, 12px uppercase or 14px sentence case. Variants: tier (tier accent), status (success/warning/danger/info/neutral with icon), eligibility.

### 4.9 Iconography
Lucide icons, 1.5px stroke, 20px default (24 at counter). Always paired with text except universally understood icons (close, search) which get `aria-label`.

### 4.10 Imagery
Aspect ratios: hero 16:9 desktop / 4:5 mobile, reward 3:4 (catalogue) and 4:3 (admin thumbnail 64px), avatar initials circle (no photos of members). Placeholder: blush-100 with wave-line mark. All images: `alt` required, `loading="lazy"` below the fold, explicit width/height.

---

## 5. Motion
- Durations: 120ms (hover/press), 200ms (menus, toasts), 300ms (sheets/dialogs), 400–600ms (membership card entrance, points count-up).
- Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)` (enter), `cubic-bezier(0.4, 0, 1, 1)` (exit).
- Purposeful only: points count-up after earning/redeeming (max 800ms), voucher reveal on success, progress bar fill.
- `prefers-reduced-motion: reduce` → no transforms/count-ups; instant values; fades ≤ 100ms.

---

## 6. Voice & microcopy
- Warm, short, specific. "You have 1,438 points." not "Your current loyalty points balance is…".
- Numbers explain themselves: "250 pts to go" not "Insufficient points".
- Errors say what happened and what to do: "That code has expired. Codes last 5 minutes — tap Resend for a new one."
- Simulations are honest: "Demo mode — no SMS is sent. Your code is 482 913."
- Customer uses "points"/"treats"/"vouchers"; admin uses precise terms ("Outstanding points", "Qualifying spend").

---

## 7. Accessibility requirements (design-level)
- Text contrast ≥ 4.5:1 (≥ 3:1 for ≥ 24px or 18.66px bold); UI component borders/focus ≥ 3:1 — all semantic token pairs above comply.
- Every control reachable and operable by keyboard in logical order; skip-link "Skip to content" on every shell.
- Landmarks: `header`, `nav` (labelled), `main`, `footer`; one `h1` per page.
- Live regions for: OTP sent, calculation results at counter (`aria-live="polite"`), toasts.
- Forms: visible labels, required marked with text "(required)" or optional fields marked "(optional)" — **we mark optional** because most fields are optional.
- Touch targets ≥ 44px; 8px min spacing between adjacent targets.
- Zoom to 200% without loss; reflow at 320px without horizontal scroll (except designated data-table scrollers).
- Charts have text equivalents; tables have captions (visually hidden if redundant).

---

## 8. Responsive rules summary
| Pattern | < 640 | 640–1023 | ≥ 1024 |
|---|---|---|---|
| Customer nav | Bottom tabs | Bottom tabs | Top nav |
| Reward grid | 2 columns (cards 3:4) | 3 columns | 4 columns |
| Dashboard | Single column, card first | Single column, wider | 12-col: card + summary left (7), side column (5) |
| Admin nav | Drawer | Drawer | Sidebar |
| Admin tables | Row cards | Table (fewer columns) | Full table |
| Admin filters | Bottom sheet | Inline wrap | Inline row |
| Counter | Single column | Single column (max 640) | Two-column |
| Dialogs | Bottom sheet style, full width | Centred | Centred |
