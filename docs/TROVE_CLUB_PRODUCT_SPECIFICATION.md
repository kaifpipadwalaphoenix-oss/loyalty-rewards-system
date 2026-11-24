# Trove Club — Product Specification

Version 1.0 · Prototype scope · Companion documents: Brand & UX Research, Screen & Component Inventory, Technical Architecture, Design System, Implementation Plan, QA & Acceptance.

---

## 1. Product summary

**Trove Club** is the membership and loyalty programme of **Trove Label** (Indian resortwear and swimwear, "365 days of summer"). Members earn **Trove Points** on purchases, climb membership tiers, redeem rewards themselves, and receive birthday and anniversary treats. The physical store records purchases, redemptions and couple visits through a fast counter interface. The owner configures every rule from an admin portal.

This build is a **static, browser-only, commercially presentable prototype**: every workflow works end to end against a shared, persisted, local data layer. Nothing is sent to a server; OTP and staff sign-in are simulated and labelled as such.

### 1.1 Business objectives
| # | Objective | How the prototype demonstrates it |
|---|---|---|
| O1 | Increase repeat purchases | Points on every purchase, visible progress to next tier and next reward |
| O2 | Create a sense of membership | Branded membership card, tiers with named benefits, member-only rewards |
| O3 | Celebrate customers' occasions | Configurable birthday and anniversary treats, couple visit bonus |
| O4 | Connect the physical store to the programme | Cashier counter: purchase entry, redemption, couple visits, quick enrolment |
| O5 | Let the owner run the programme without a developer | Plain-language configuration with live previews and impact estimates |
| O6 | Give management a clear picture of programme health | Dashboard metrics computed from the same data, date-range filtered |

### 1.2 Success criteria for the prototype
- A business owner can sit through scenarios A–J (§9) in under 15 minutes without a single dead end, fake number or broken screen.
- Every number on every screen can be traced to ledger transactions.
- A cashier can record a purchase for an existing member in **≤ 4 interactions after sign-in** (search → amount → bill no. → confirm).

---

## 2. Personas

| Persona | Context | Needs | Pain to avoid |
|---|---|---|---|
| **Priya, the member** (28, Mumbai, buys 3–5 pieces a year, holidays twice a year) | Opens the portal on her phone, sometimes standing in the store | "How many points do I have, what can I get, when does my birthday treat arrive" in one glance | Long forms, jargon, unclear expiry, rewards she can't actually use |
| **Rahul & Anjali, married couple** | Shop together for holidays and anniversaries | Feel recognised as regulars; anniversary treat | Being asked for spouse's details or a second account |
| **Pooja, cashier** | Busy counter, tablet or phone, queue waiting, not tech-savvy | Find member by mobile, enter amount, confirm, done | Multi-screen wizards, ambiguous totals, double entries |
| **Arjun, store manager** | Runs the floor, handles exceptions | Fix mistakes (void, adjust, cancel voucher) with a reason; see the day's activity | Silent edits, no audit trail |
| **Nisha, owner/admin** | Laptop, occasionally phone | Configure earning, tiers, rewards, occasions; understand programme health and liability | Settings she can't understand; charts that don't add up |

---

## 3. Scope

### 3.1 In scope (prototype v1)
Customer portal (landing, sign-in/registration with simulated OTP, dashboard, membership & tiers, rewards catalogue, reward detail & redemption, my vouchers, activity & expiry, profile); staff counter (sign-in, member search, quick enrolment, purchase entry, voucher verification & in-store redemption, couple visit, my history); admin portal (dashboard, customers, customer detail with adjustments/voids/cancellations, programme configuration incl. campaigns, reward management, staff management, activity & audit log with CSV export); demo tooling (persona switcher, presenter guide, reset demo data).

### 3.2 Out of scope (explicitly)
Real OTP/SMS/WhatsApp delivery; any backend or database server; Shopify/online-store integration (data model leaves room for it: `channel`); payment processing; multi-store; spouse accounts, spouse mobile numbers, account linking/merging, combined balances, relationship verification; referral programme; points-as-payment at checkout; push/email notifications; native apps; production-grade security.

### 3.3 Out of scope but designed for later
`channel: 'online'` purchases from Shopify; real OTP provider; server-side ledger with the same domain functions; QR member card scanning; inactivity-based expiry; welcome bonus; tier retention grace period.

---

## 4. Core concepts and business rules

All rules below are defaults; every value marked ⚙ is admin-configurable.

### 4.1 Money and points
- **BR-1** Amounts are INR, stored as **integer paise** (₹1 = 100 paise). No floating-point arithmetic on money or points anywhere.
- **BR-2** Points are integers. Never fractional.
- **BR-3** Displayed format: `₹4,990` (Indian digit grouping, `en-IN`), points `1,240 pts`.

### 4.2 Earning (purchase → points)
- **BR-4** Base points = `floor(eligibleAmount / spendUnit) × pointsPerUnit` ⚙ (default **₹100 = 5 points**).
- **BR-5** Rounding mode ⚙: **round down** (default; never over-award) or round to nearest unit. Points are never computed per rupee and then rounded; they are computed per completed spend unit.
- **BR-6** Minimum eligible purchase ⚙ (default **₹500**). Below it: 0 points, cashier sees "Below the ₹500 minimum — no points for this purchase", purchase is still recorded (counts toward tier spend? **No** — only eligible purchases count toward tier spend, to keep one definition of "qualifying").
- **BR-7** Tier earn bonus ⚙: a percentage of base points by tier (defaults: Shore 0%, Tide +10%, Golden Hour +25%, Endless Summer +50%). `tierBonus = floor(base × pct / 100)`. The tier used is the member's tier **before** this purchase is added (a purchase that crosses a threshold earns at the old tier; the new tier applies from the next purchase).
- **BR-8** Campaign bonus ⚙: at most **one** campaign applies per purchase — the one giving the most points (no stacking of campaigns). Types: *multiplier* (e.g., 2× → `campaignBonus = base × (multiplier − 1)`, multiplier stored as integer tenths to avoid decimals: 20 = 2.0×) and *flat bonus* (e.g., +200 points on purchases ≥ ₹6,000).
- **BR-9** Total earned = base + tierBonus + campaignBonus. Each component is stored on the transaction (with the rule snapshot used), so history explains itself even after configuration changes.
- **BR-10** Configuration changes apply to purchases recorded **after** saving. Past transactions are never recalculated.
- **BR-11** Each purchase requires a **bill/invoice number**; the same bill number cannot be recorded twice while an earlier, non-voided purchase holds it (blocks accidental duplicates; a voided bill can be re-entered with the corrected amount).
- **BR-11a** The amount entered is the **final amount paid** for eligible merchandise after all discounts (including Trove Club vouchers). Partial returns are handled by voiding and re-entering the corrected amount; line-level returns are deferred.

**Worked example (defaults):** ₹2,000 purchase by a Shore member → base `floor(200000/10000) × 5 = 100`, tier bonus 0, no campaign → **100 points**. Same purchase by a Tide member during Double Points Weekend → base 100, tier +10, campaign +100 → **210 points**.

### 4.3 Balance and ledger
- **BR-12** The **points ledger is the single source of truth.** Every change is an immutable transaction: `EARN_PURCHASE`, `EARN_BONUS` (occasion/couple visit; campaign bonuses are part of the purchase's `EARN_PURCHASE` breakdown, never separate), `ADJUST_CREDIT`, `ADJUST_DEBIT`, `REDEEM`, `REDEEM_REFUND`, `PURCHASE_VOID`, `EXPIRE`.
- **BR-13** Available balance = sum of all transaction points for the customer. Balances are never stored or edited directly.
- **BR-14** Balance can never go below zero. Any debit (redemption, adjustment, void, expiry) that would make it negative is rejected with a clear message.

### 4.4 Expiry
- **BR-15** Expiry policy ⚙: **No expiry** or **Fixed validity: points expire N months after the month they were earned** (default **12 months, end of month** — e.g., earned 14 Mar 2026 → expire 31 Mar 2027). End-of-month makes dates easy to communicate.
- **BR-16** Each credit (earn, bonus, adjustment credit, refund) creates a **points lot** with its own expiry date stamped at creation using the policy at that moment. Changing the policy affects new lots only; the admin UI says so.
- **BR-17** Debits consume lots **earliest-expiry first** (non-expiring lots last). This protects the customer.
- **BR-18** When a lot passes its expiry date with points remaining, an `EXPIRE` transaction removes exactly the remaining amount. Expiry processing runs on app start and before every write (idempotent; one EXPIRE per lot).
- **BR-19** "Expiring soon" window ⚙ (default **30 days**): the dashboard notice shows only points whose expiry date falls within the window ("180 points expire on 31 Dec 2026"). The Activity page's expiry schedule shows the **next 3 expiry dates** regardless of window, highlighting those inside it.
- **BR-20** Manual adjustment credits expire like purchase points (same policy). Redemption refunds create a new lot dated from the refund.

### 4.5 Tiers
- **BR-21** Tier qualification uses **qualifying spend**, not points ⚙. Rationale: points change when customers redeem and when the earn rate changes; spend is stable and easy to understand ("Spend ₹2,600 more to reach Golden Hour").
- **BR-22** Qualifying spend = sum of eligible, non-voided purchase amounts in the qualification window ⚙: **rolling 12 months** (default) or **lifetime**.
- **BR-23** Tier = highest **active** tier whose threshold ≤ qualifying spend. Defaults: **Shore ₹0 · Tide ₹15,000 · Golden Hour ₹40,000 · Endless Summer ₹1,00,000**. The lowest tier must have threshold ₹0 and cannot be deactivated.
- **BR-24** Tier is **derived** at read time, never stored — so threshold changes immediately recalculate everyone's tier and progress (required by Scenario H/10.2).
- **BR-25** Tier configuration: name, threshold, earn bonus %, benefits (list of short lines), description, accent colour (from a fixed brand set), active.
- **BR-26** Known simplification: with a rolling window, a tier can drop when old purchases age out. The customer membership page states "Your tier is based on your spending over the last 12 months". A grace period is a deferred enhancement.

### 4.6 Rewards and redemption
- **BR-27** Reward types: **fixed discount** (₹ off), **percentage discount** (% off with optional max ₹ cap), **exclusive voucher**, **gift**, **experience**, **promotional**.
- **BR-28** Reward fields ⚙: name, short description, full description/how to use, image + alt text, category (type), points cost, eligible tiers (all by default), start date, end date, minimum purchase to use (for discounts), stock limit (optional), per-member limit (optional), voucher validity days (default 30), terms, status (draft/active/inactive/archived).
- **BR-29** A reward is **redeemable** only if: status active; today within start/end; stock remaining > 0 (if limited); member's tier eligible; member's per-member limit not reached; member's available points ≥ cost. Eligibility is computed by one function that returns the first blocking reason in plain language.
- **BR-30** Redemption (customer or staff-assisted) atomically: re-checks eligibility → writes `REDEEM` transaction (−cost) → creates an **Issued Voucher** with unique code `TC-XXXX-XXXX` (unambiguous alphabet, no 0/O/1/I) and expiry = now + validity days → notification + audit. Stock remaining is **derived** (limit − non-cancelled vouchers issued), never stored as a counter.
- **BR-31** **Duplicate protection:** each confirmation carries a one-time request ID; a second submit with the same ID returns the original result without charging again. The confirm button is disabled while processing.
- **BR-32** Voucher states: `issued → used` (marked at the counter, once), `issued → expired` (validity passed; **points are not refunded** — standard practice, stated in terms), `issued → cancelled` (manager/admin only, with reason; points refunded via `REDEEM_REFUND`).
- **BR-33** A used voucher cannot be used again; verifying a used/expired/cancelled code shows exactly why ("Used on 12 Nov 2026 at 4:32 pm by Pooja N.").
- **BR-34** Deactivating or archiving a reward removes it from the catalogue immediately; already-issued vouchers remain valid until their expiry (fair to members; stated in the admin confirmation dialog).
- **BR-35** Staff-assisted in-store redemption creates the voucher and marks it used in the same step (`channel: store`).

### 4.7 Birthday & anniversary
- **BR-36** Birthday is collected as **day and month only** (no year) — enough for the benefit, less personal data. 29 Feb birthdays are celebrated on 28 Feb in non-leap years.
- **BR-37** Anniversary is collected as day and month (year optional, used only to say "Happy 5th anniversary"). Shown only when marital status = Married.
- **BR-38** Occasion rules ⚙ (multiple allowed per occasion): occasion (birthday/anniversary), benefit type (bonus points, fixed discount, percentage discount, exclusive voucher, gift), value, minimum purchase (for discounts), eligible tiers, unlock window (default **7 days before** the date), validity (default **30 days** from unlock), active.
- **BR-39** While an occurrence's window is open (from unlock until the end of validity — this includes days *after* the occasion), each active, applicable rule is granted **once per member per occurrence**: bonus points → `EARN_BONUS` transaction; anything else → Issued Voucher (0 points, source `occasion`). Both the previous and the next occurrence are evaluated, so a member whose first visit after unlock is after the date still receives it. Idempotency key uses the **occurrence's** year: `occasion:{ruleId}:{customerId}:{occurrenceYear}`.
- **BR-40** Anti-abuse ⚙ (one global setting, not per rule): the occasion date must have been on file at least **30 days** before the occasion. Members can edit birthday/anniversary themselves **once**; later changes go through staff. The profile explains this.
- **BR-41** Customer sees an upcoming occasion card from **30 days** before, only if at least one active rule applies to them — never a promise that isn't configured.

### 4.8 Couple visit
- **BR-42** Staff (cashier/manager/admin) record a couple visit for a member present with their spouse. Only the member's own account is credited. No spouse data is captured.
- **BR-43** Config ⚙: bonus points (default **100**), require marital status "Married" on profile (default **on**), cooldown (default **30 days**: eligible again when at least 30 calendar days have passed since the last visit), active.
- **BR-44** Cashier must tick "Member and spouse are both present" before confirming. Blocked states are explained ("Last couple visit recorded 12 days ago — next eligible on 12 Dec").

### 4.9 Campaigns
- **BR-45** Campaign ⚙: name, customer-facing description, type (multiplier / flat bonus), value, minimum spend, days of week (optional, e.g., Sat–Sun), start/end date, eligible tiers, show on customer dashboard (yes/no), active.
- **BR-46** Birthday and anniversary benefits are **not** campaigns (they are occasion rules) — one place to configure each concept.

### 4.10 Purchases: voids
- **BR-47** Manager/admin can **void** a purchase (wrong amount, return) with a mandatory reason. A void always succeeds and: (1) excludes the amount from qualifying spend (tier recalculates); (2) writes `PURCHASE_VOID` for `min(points earned, remaining points of that purchase's own lot)` — it never takes points from other lots, so it can't double-count points that already expired or were redeemed; (3) records any shortfall on the purchase ("40 of 100 points were already used or expired") and in the audit entry, so a manager can decide on a manual adjustment; (4) frees the bill number so the corrected purchase can be re-entered.

### 4.11 Manual adjustments
- **BR-48** Manager/admin only. Credit or debit, points 1–100,000, reason category (Goodwill, Correction, Service recovery, Other) + note (required, 5–200 chars). Recorded with staff identity. Debits cannot exceed available balance.

### 4.12 Members
- **BR-49** Mobile number (Indian, 10 digits starting 6–9, stored as `+91XXXXXXXXXX`) is the unique member identity. Members cannot change it themselves; admin/manager can, with uniqueness check and audit.
- **BR-50** Member number format `TC` + 6 digits, assigned at enrolment.
- **BR-51** Member status: active / inactive (engagement label, derived: no purchase/redemption in 180 days). No suspension workflow in v1.

### 4.13 Staff and roles
| Capability | Admin | Manager | Cashier |
|---|:-:|:-:|:-:|
| Counter: search, enrol, record purchase, redeem/verify voucher, couple visit | ✓ | ✓ | ✓ |
| View own counter history | ✓ | ✓ | ✓ |
| Admin dashboard, reports, activity log | ✓ | ✓ | ✗ |
| Customer list & detail, edit member contact details | ✓ | ✓ | ✗ |
| Manual points adjustment, void purchase, cancel voucher | ✓ | ✓ | ✗ |
| Export CSV | ✓ | ✓ | ✗ |
| Programme configuration (earning, expiry, tiers, occasions, couple, campaigns, redemption) | ✓ | ✗ | ✗ |
| Reward management | ✓ | ✗ | ✗ |
| Staff management | ✓ | ✗ | ✗ |

- **BR-52** Permissions are enforced in three places: route guards, UI (controls hidden or disabled with explanation), and **every service command** (rejects with `FORBIDDEN` and writes an audit entry). Client-side enforcement is demo-grade and documented as such.
- **BR-53** At least one active admin must always exist (cannot deactivate/demote the last admin).

---

## 5. Workflows

### 5.1 Customer: join / sign in (one flow)
1. Landing → "Join Trove Club" or "Sign in" (both go to the same screen).
2. Enter mobile number (+91 prefix fixed, numeric keypad). Validate format.
3. "Send code" → simulated OTP: a clearly labelled **Demo mode** panel shows the 6-digit code (generated per request). Code valid 5 minutes, 3 attempts, resend after 30 s.
4. Verify. Existing member → dashboard. New number → step 5.
5. **About you** (required): full name. Optional: email. Required: accept Trove Club terms (a consent tick is the minimum needed to lawfully hold a member's data — the only addition to "name + mobile"). Optional: membership updates consent.
6. **Celebrate with us** (optional, skippable): birthday (day/month), marital status (Single / Married / Prefer not to say); if Married → spouse's first name (optional), anniversary (optional).
7. Welcome screen → dashboard (Scenario A).

### 5.2 Customer: redeem a reward
Rewards → filter (All / Can redeem now / Discounts / Gifts & experiences) → reward detail (image, cost, what you get, how to use, terms, eligibility state) → "Redeem for 500 pts" → confirmation sheet (cost, balance before/after, voucher validity, non-refundable on expiry) → Confirm → success with voucher code, "Show at counter" view, added to My Vouchers, activity shows −500.

### 5.3 Cashier: purchase
Sign in (choose staff + PIN, simulated) → Counter → mobile number → member card (name, masked mobile, tier, balance, active vouchers, couple-visit eligibility) → "Record purchase" → amount (₹) + bill number → live calculation panel (rate, base, tier bonus, campaign, total, new balance) → Confirm → success receipt (points added, new balance) → "Next customer".
If no member found → "Enrol this number" (name + customer consent tick) → continues to purchase.

### 5.4 Cashier: voucher / in-store redemption
Member found → "Rewards" tab: list of issued vouchers (Mark as used) and redeemable rewards (Redeem now). Or "Verify code" from the counter home: enter code → shows voucher, member, status → Mark as used (confirm). Already-used codes show who/when.

### 5.5 Cashier: couple visit
Member found → "Couple visit" → eligibility shown → tick "Member and spouse both present" → Record → +100 pts, new balance.

### 5.6 Manager: corrections
Customer detail → Points history → row menu → Void purchase (reason) / Customer detail → Adjust points (credit/debit, reason) / Vouchers → Cancel & refund (reason). All appear in the audit log.

### 5.7 Admin: change programme rules
Programme → Earning → edit "₹100 = 5 points" → live preview ("A ₹4,000 purchase earns 320 points (was 200)") → Save → confirmation dialog summarising changes → saved, audit entry; next counter purchase uses the new rule (Scenario H). Tier threshold edits show impact ("3 members will move up to Golden Hour; 1 will move down").

---

## 6. Functional requirements (traceable)

| ID | Requirement |
|---|---|
| FR-C1 | Mobile + simulated OTP sign-in and registration as §5.1, with validation, attempt limits, resend cooldown, clear errors. |
| FR-C2 | Demo customer quick access from the sign-in screen (demo panel) and the global demo bar. |
| FR-C3 | Sign out from header/profile; session persists across refresh until sign-out. |
| FR-C4 | Profile: view/edit name, email, consent; birthday/anniversary editable once (BR-40); marital status with conditional spouse/anniversary fields; mobile read-only with help text; success toast; unsaved-changes guard. |
| FR-C5 | Dashboard answers the seven questions (balance, claimable rewards, tier, progress, benefits, upcoming occasions, recent activity) with the hierarchy defined in the Screen Inventory. |
| FR-C6 | Membership page: tier ladder, current benefits, progress, how points work (with current rate), expiry policy explained. |
| FR-C7 | Rewards catalogue with filters, eligibility state per reward, detail page, confirmation, voucher code, My Vouchers (active/used/expired). |
| FR-C8 | Activity: chronological ledger with filters (All/Earned/Redeemed/Expired), running balance, expiry schedule (next 3 expiry dates, soon ones highlighted). |
| FR-C9 | In-app notifications: header bell with unread count, list, mark all read (no SMS/email). |
| FR-S1 | Staff sign-in with demo staff picker + PIN; inactive staff blocked. |
| FR-S2 | Member search by mobile (exact, last-4 suggestions after 4 digits) and quick enrolment. |
| FR-S3 | Purchase entry with live calculation, bill-number duplicate check, confirmation, receipt. |
| FR-S4 | Voucher verification by code; mark used once; staff-assisted redemption. |
| FR-S5 | Couple visit recording with eligibility and confirmation. |
| FR-S6 | My counter history (today / last 7 days) for the signed-in staff member, as a sheet inside the counter. |
| FR-A1 | Dashboard KPIs, charts and lists per §7, date-range presets, all derived from data. |
| FR-A2 | Customer list: search (name, mobile, member no.), filters (tier, engagement, upcoming occasion, points expiring), sort, pagination; mobile card layout. |
| FR-A3 | Customer detail: overview, points history, vouchers, profile & occasions, audit; actions per role. |
| FR-A4 | Programme configuration sections with explanations, examples, previews, impact estimates, validation, save confirmation, audit. |
| FR-A5 | Reward management: list (status filter), create/edit (all BR-28 fields), image select from library or upload (stored locally, size-limited), duplicate, activate/deactivate, archive (confirm), live card preview. |
| FR-A6 | Staff management: list, add, edit role, reset PIN, deactivate (BR-53). |
| FR-A7 | Activity: transaction ledger (filters: type, staff, date range, member) and audit log; CSV export. |
| FR-D1 | Demo bar: prototype label, persona switcher, presenter guide with scenarios A–J, Reset demo data (confirm). |
| FR-D2 | Persistence across refresh; cross-tab sync (customer and counter open side by side update live); corrupted/unavailable storage handling. |

---

## 7. Admin dashboard metric definitions
Range presets: Today, Last 7 days, Last 30 days (default), Last 90 days, Last 12 months.

| Metric | Definition |
|---|---|
| Total members | All enrolled members (point-in-time). |
| Active members | Members with ≥ 1 purchase, redemption or couple visit in the selected range. |
| New members | Enrolled within the range. |
| Points issued | Sum of positive transactions (all credit types except `REDEEM_REFUND`) in range. |
| Points redeemed | Sum of `REDEEM` minus `REDEEM_REFUND` in range (absolute). |
| Points expired | Sum of `EXPIRE` in range (absolute). |
| Outstanding points | Sum of all balances now (point-in-time) + estimated liability = outstanding × point value ⚙ (default ₹0.50/point, shown as "≈ ₹X"). |
| Redemptions | Vouchers issued from the catalogue in range; used vs unused. |
| Tier distribution | Current members per tier. |
| Upcoming birthdays / anniversaries | Next 30 days, with eligible benefit. |
| Recent activity | Latest 10 ledger transactions. |
| Popular rewards | Top 5 rewards by redemptions in range. |
| Chart | Points issued vs redeemed per week (≤ 90 days) or per month (12 months). |

---

## 8. Non-functional requirements
- **Performance:** first load < 2 s on a mid-range laptop (production build); interactions respond < 100 ms with ~30 members and ~1,000 transactions.
- **Responsive:** 320 px → 1920 px, deliberate layouts per breakpoint (see Design System).
- **Accessibility:** WCAG 2.1 AA: contrast, keyboard, focus visible, labels, 44 px min targets (48–56 px at counter), reduced motion, error messages linked to fields.
- **Reliability:** no uncaught errors; error boundary per portal; storage failures degrade gracefully.
- **Honesty:** simulated features labelled (OTP, staff PIN, "Prototype — data stored in this browser only").
- **Privacy:** minimum personal data (no gender, no birth year, no spouse contact). Consent captured at registration (aligned with the spirit of India's DPDP Act 2023; legal review needed before production).
- **Offline-capable:** fonts and images bundled; no runtime network calls.

---

## 9. Presentation scenarios (acceptance-tested)
| ID | Scenario | Seeded subject |
|---|---|---|
| A | New customer joins and sees welcome/onboarding with 0 points | Live registration with a new number; also seeded new member *Meera Iyer* (0 pts) |
| B | Active member approaching next tier | *Tara Menon* — Tide, ₹37,400 of ₹40,000 qualifying spend, 1,438 pts (computed by the seed run) |
| C | Reward redemption | *Tara Menon* redeems "₹250 off" (500 pts) |
| D | Birthday approaching, benefit visible | *Zoya Siddiqui* — birthday in 5 days (unlocked), 250-pt treat + Golden Hour 15% voucher |
| E | Anniversary approaching | *Aditi Rao* — married, anniversary in 9 days, ₹1,000-off voucher upcoming |
| F | Store purchase updates balance | Cashier *Pooja Nair* records ₹2,000 for *Kabir Malhotra* (Shore tier, ₹11,000 qualifying spend, no applicable campaign): 1,000 → 1,100 at the default rate. Kabir then redeems a 500-pt reward → 600 (the canonical consistency chain from the brief). |
| G | Couple visit | Cashier records couple visit for *Aditi Rao* (+100) |
| H | Admin changes earning rate; next purchase uses new rule | Admin *Nisha Varma* changes ₹100 = 5 → ₹100 = 8 |
| I | Points approaching expiry understandable | *Farhan Qureshi* — 450 pts expiring end of this month, 250 more end of next month, 200 already expired |
| J | Cashier blocked from admin features | *Pooja Nair* opens `/admin/programme` → access denied, audit entry |

(Exact seed values are defined relative to the current date — see Technical Architecture §9.)

---

## 10. Critical review — improvements adopted or deferred

| # | Problem | Why it matters | Proposed solution | Business value | Impact | Prototype? |
|---|---|---|---|---|---|---|
| 1 | No way to correct a mistaken purchase | Cashiers mistype amounts; returns happen | Manager/admin **void** with reason (BR-47) | Trustworthy ledger | Small | **Essential** |
| 2 | Same bill entered twice | Double points, common at busy counters | Mandatory **bill number**, duplicate blocked (BR-11) | Prevents leakage | Small | **Essential** |
| 3 | Store customers aren't members yet | Most first-time store buyers are not enrolled; losing them loses the programme | **Quick enrolment** at counter (name + mobile + consent) | Grows membership where sales happen | Small | **Essential** |
| 4 | Birthday-date gaming | Members set birthday to "next week" for a treat | 30-days-on-file rule + one self-edit (BR-40) | Protects margin | Small | **Essential** |
| 5 | Registration asking too much | Friction kills sign-ups | Only name + mobile required; occasions in a skippable step; **gender removed** (no genuine requirement); birthday without year | Higher conversion, less PII | None | **Essential** |
| 6 | Tier on points is confusing | Redeeming would lower tier; rate changes distort tiers | Tier on **qualifying spend** (BR-21) | Clear, fair messaging | None | **Essential** |
| 7 | Owner can't see liability | Points are a financial liability | Outstanding points × point value on dashboard | Better decisions | Small | **Essential** |
| 8 | Config changes are scary | Owner fears breaking things | Live previews + impact estimates + confirmation + audit | Confidence, fewer support calls | Medium | **Essential** |
| 9 | Customer and counter demo in separate tabs drift | Presenter shows cashier and customer side by side | Cross-tab live sync | Credible demo | Small | **Essential** |
| 10 | Voucher cancelled by mistake/at request | Need a fair reversal | Cancel & refund (BR-32) | Service recovery | Small | **Essential** |
| 11 | Rolling-window tier drop surprises | Members lose status silently | Clear copy now; grace period later | Retention | Medium | Deferred |
| 12 | Inactivity expiry | Common alternative policy | Add third expiry mode later | Flexibility | Medium | Deferred |
| 13 | Welcome bonus | Common join incentive | `welcomeBonusPoints` config | Conversion | Small | Deferred (optional) |
| 14 | QR member card | Faster counter lookup | QR on card + scanner | Speed | Medium | Deferred |
| 15 | Online (Shopify) purchases | Most revenue may be online | `channel` field ready; integration later | Full picture | Large | Deferred |
| 16 | Customer notifications (SMS/WhatsApp) | Reminders drive redemption | Provider integration later; in-app updates now | Engagement | Large | Deferred |
| 17 | Separate "campaign" for birthdays | Duplicate concepts confuse | Occasions configured only in Occasions (BR-46) | Simplicity | None | **Essential** (simplification) |

**Rejected:** gamification badges/streaks (complexity without business value for a boutique label), spouse linking (explicitly excluded), multi-store (excluded).

---

## 11. Assumptions (documented defaults)
1. One physical store, INR only, Indian mobile numbers only.
2. Points have no cash value; point value is an internal reporting estimate.
3. Tier names, rates, thresholds and rewards in the seed are recommendations for the demo; Trove will tune them.
4. Purchases are entered after the sale is completed in Trove's existing POS/Shopify POS; Trove Club does not compute prices or discounts — discount vouchers are applied by the cashier in the existing POS and marked used in Trove Club.
5. The presentation runs in one browser; data lives in that browser's local storage.
6. Store name/address not shown (not published on trovelabel.com).
7. Managers do not manage rewards (the brief's manager list omits it; reward changes alter the programme offer, so they stay with the admin). Easy to grant later via the permission matrix.
8. Staff and member sign-ins are per browser tab, so the presenter can keep a customer tab, a counter tab and an admin tab open side by side.

## 12. Open questions (non-blocking; defaults chosen)
1. Permission to use Trove's own photography and logo in the prototype (default: licence-cleared interim imagery + typeset wordmark, swappable).
2. Final earning rate / tier thresholds / point value (default as above).
3. Whether voucher expiry should refund points (default: no).
4. Whether cashiers may enrol members without the customer verifying OTP on their own phone (default: yes, with consent tick; production should send a verification SMS).
