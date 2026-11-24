# Trove Club — Screen & Component Inventory

**18 screens** (8 customer, 2 counter, 8 admin) plus shared overlays and system pages. Quality over quantity: campaigns live inside Programme settings, the audit log is a tab of Activity, the reward editor is one screen for create and edit, and the counter is one adaptive workspace (history is a sheet inside it) instead of a wizard of pages.

**All example numbers, names and dates in quotes below are illustrative.** The implementation must compute every value from data and config.

Route prefixes: customer `/`, `/club/*`; counter `/counter/*`; admin `/admin/*`. Guards are described in the Technical Architecture.

Legend for each screen: **Purpose · Route · Access · Layout · Sections · Components · Actions · Empty · Loading · Error · Responsive**.

---

## 0. Global elements

| Element | Description |
|---|---|
| **DemoBar** | 36px blush strip above every shell. Text: "Prototype · simulated sign-in · data stays in this browser". Button "Demo" opens **DemoPanel** (sheet): persona switcher grouped *Members* (with scenario tags A–I) and *Staff* (Admin, Manager, Cashier); "Presenter guide" (scenarios A–J with steps and deep links); "Reset demo data" (AlertDialog: "Restore the original demo members, rewards and settings? Everything you changed will be lost."). Switching persona signs in that persona in the relevant portal and navigates to its home. |
| **StorageBanner** | Warning banner when storage unavailable ("Changes won't survive a refresh in this browser mode") or recovered from corruption ("We restored the demo data because saved data couldn't be read. A backup was kept."). |
| **Toaster** | sonner, positioned per design system. |
| **NotificationsSheet** (customer) | Bell button in the customer header with unread count badge (`aria-label="Updates, 2 unread"`). Opens a sheet (right on desktop, bottom on mobile) listing in-app notifications newest first (points earned, reward redeemed, treat ready, points expiring, tier reached, points adjusted) with time and a link to the relevant page; "Mark all as read". Empty: "You're all caught up." |
| **ErrorBoundary** | Per shell; friendly page + Reload + Home; collapsible technical details. |
| **NotFound (404)** | "This page has drifted off" + links to portal homes. |
| **AccessDenied (403)** | "This area is for admins" + explains signed-in role + button back to the user's allowed home. Writes audit entry `ACCESS_DENIED`. |

---

## CUSTOMER PORTAL

### C1. Landing — "Join Trove Club"
- **Purpose:** explain the programme in 20 seconds and convert to join/sign in.
- **Route/Access:** `/` · public (signed-in members see "Go to my club" CTA).
- **Layout:** editorial single page. Header (wordmark, Sign in). Hero: full-bleed image (4:5 mobile, 16:9 desktop split 7/5 with text), eyebrow "TROVE CLUB", display headline "Your summer, rewarded.", one sentence, primary "Join Trove Club", secondary "Sign in".
- **Sections:** (1) Hero. (2) "How it works" — 3 steps with line icons: Shop (earn 5 pts per ₹100 — **live from config**), Collect, Treat yourself. (3) Tier ladder strip — 4 tiers with thresholds and headline benefit (**from config**). (4) Celebrations — birthday & anniversary treats (only shows benefits that are configured and active). (5) Featured rewards — 4 active rewards (from catalogue). (6) FAQ accordion (expiry policy text generated from config). (7) Footer (blush): Trove Label link, help, terms (static prototype terms), "Prototype" note.
- **Components:** `SiteHeader`, `HeroEditorial`, `HowItWorksSteps`, `TierLadder`, `OccasionTeaser`, `RewardCard`, `FaqAccordion`, `SiteFooter`.
- **Actions:** Join, Sign in, view reward → sign-in prompt (redirect back after login).
- **Empty:** featured rewards section hidden if none active; tier ladder always has ≥1 tier.
- **Loading:** skeleton for hydration only.
- **Error:** shell error boundary.
- **Responsive:** single column < 1024; hero split ≥ 1024; tier ladder horizontal scroll-snap on mobile with visible next-card peek.

### C2. Sign in / Join (mobile + OTP + registration)
- **Purpose:** one flow for both returning and new members.
- **Route/Access:** `/join` and `/login` (same component, different headline) · public; signed-in → redirect `/club`.
- **Layout:** split on desktop (brand image left 5 cols, form right 7), single column mobile. Step indicator only for new members (Step 2 of 3).
- **Steps:**
  1. **Mobile:** `PhoneInput` (+91), "Send code". Inline validation ("Enter a 10-digit mobile number starting with 6, 7, 8 or 9").
  2. **Verify:** `OtpInput` (6 boxes, paste support, auto-advance, `autocomplete="one-time-code"`), `DemoOtpNotice` (tide-100 panel: "Demo mode — no SMS sent. Your code is 482 913."), resend countdown (30s), "Change number". Errors: wrong code (attempts left), expired, too many attempts (wait 60s).
  3. **About you** (new only): Full name (required), Email (optional), Terms checkbox (required, links to a terms dialog), "Send me membership updates" (optional). Primary "Continue".
  4. **Celebrate with us** (new only, optional): Birthday (Day, Month), Marital status (radio cards: Single / Married / Prefer not to say), if Married: Spouse's first name (optional), Anniversary (Day, Month, Year optional). Copy: "We use these only to send you treats. You can update them once later in your profile." Buttons: "Finish" / "Skip for now".
  5. **Welcome:** membership card reveal, "Welcome to Trove Club, Meera", 3 short tips, "Explore rewards" / "Go to my club".
- **Demo access:** below the form, `DemoAccountsList` collapsible "Use a demo member" (name, scenario tag, masked mobile → fills number and auto-shows the code).
- **Actions:** send, verify, resend, change number, continue, skip, finish.
- **Loading:** button spinners during simulated send (700ms) and verify (500ms).
- **Error:** field-level; storage failure on create → section error with retry.
- **Responsive:** OTP boxes 44px min; sticky bottom primary button on mobile above keyboard.

### C3. Dashboard (Club home)
- **Purpose:** answer the 7 questions at a glance.
- **Route/Access:** `/club` · member.
- **Information hierarchy** (top to bottom, mobile):
  1. Greeting line ("Good evening, Tara") + small date; header bell shows unread updates.
  2. **MembershipCard** — tier, name, member no., **points balance** (largest number on the screen). Tap → Membership page.
  3. **Expiry notice** (only if points expiring in window): warning chip "180 pts expire on 31 Dec" → Activity.
  4. **Occasion card(s)** (only if within 30 days and configured): "Your birthday treat is ready — 250 bonus points added + 15% off voucher" or "Your anniversary treat unlocks on {unlock date}".
  5. **Tier progress**: "₹2,600 to Golden Hour" + progress bar (qualifying spend / next threshold) + "Unlocks +25% points and…" (first benefit). Top tier: "You're at our highest tier".
  6. **Rewards you can claim**: count + horizontal row of up to 6 eligible rewards (or "closest" if none eligible: "Next treat at 500 pts — 120 to go"). "See all rewards".
  7. **Active vouchers** (if any): compact list with code + expiry → My vouchers.
  8. **Recent activity**: last 5 transactions → Activity.
  9. **From Trove**: active campaigns with `showToMembers` (e.g., "Golden Hour Week — 1.5× points for Golden Hour members"; campaigns with `showToMembers`).
- **Desktop layout:** 12-col: left 7 (card, progress, rewards row, activity), right 5 (occasion, expiry, vouchers, announcements).
- **Components:** `MembershipCard`, `ExpiryNotice`, `OccasionCard`, `TierProgress`, `RewardRail`, `VoucherList`, `ActivityList`, `AnnouncementList`.
- **Empty (Scenario A, new member):** card shows 0 pts; replaces sections 5–8 with `OnboardingPanel`: "Start earning — Show your mobile number at the Trove store or shop with us. Every ₹100 earns 5 points." + 3-step checklist (Joined ✓, Add your birthday → profile, First purchase) + featured rewards "to look forward to".
- **Loading:** hydration skeleton of card + rows.
- **Error:** section-level fallback for any failed derivation ("We couldn't load your rewards right now. Retry").
- **Responsive:** described above; card full width (max 420) on mobile.

### C4. Membership & benefits
- **Purpose:** explain tiers, current benefits, how points work, expiry.
- **Route/Access:** `/club/membership` · member.
- **Sections:** Current tier hero (card + "Tier 2 of 4" + qualifying spend window copy); `TierLadder` vertical with each tier's threshold, earn bonus and benefits, current highlighted, achieved ticked, next tier with remaining amount; "How points work" (rate, minimum purchase, rounding example generated from config: "A ₹4,990 purchase earns 245 points"); "When points expire" (policy text from config + your next expiries); Occasion benefits applicable to your tier; FAQ.
- **Empty:** n/a (always has tiers). If expiry = none → "Your points never expire."
- **Responsive:** ladder vertical on mobile, horizontal 4-up on desktop.

### C5. Rewards catalogue (+ My vouchers tab)
- **Purpose:** browse and understand eligibility; access issued vouchers.
- **Route/Access:** `/club/rewards` (tab "Catalogue"), `/club/rewards/vouchers` (tab "My vouchers") · member.
- **Catalogue layout:** header with balance chip ("1,438 pts available"); filter segmented control: All · Can redeem now · Discounts · Gifts & experiences; sort: Points low–high (default) / high–low. Grid of `RewardCard`s with eligibility chips.
- **My vouchers:** segmented Active / Used / Expired & cancelled. `VoucherCard`: reward name, code (monospace-styled tabular, copy button), value summary, "Valid until 24 Dec 2026", status chip, "Show at counter" (opens full-screen `VoucherShowSheet`: large code, member name, instructions, high-contrast for scanning by eye).
- **Empty:** no rewards ("New treats are on their way"); filter empty ("Nothing you can redeem just yet — you're 120 pts from your next treat"); no vouchers (CTA Browse rewards).
- **Loading:** grid skeleton.
- **Responsive:** 2/3/4 columns.

### C6. Reward detail & redemption
- **Purpose:** make the exact value, cost, eligibility and terms crystal clear; redeem.
- **Route/Access:** `/club/rewards/:rewardId` · member. Unknown/archived id → "This reward is no longer available" with link back.
- **Layout:** desktop 2 columns (image 3:4 left, details right sticky); mobile image top then details, sticky bottom action bar.
- **Sections:** type eyebrow, title (Playfair), what you get (value line: "₹250 off your next purchase of ₹2,000 or more"), cost ("500 pts"), your balance after ("You'll have 938 pts left"), eligibility panel (ok or the blocking reason + what to do), availability (dates, stock "Only 4 left" when ≤ 5), accordions: How to use, Terms (validity, non-refundable on expiry, one per member if limited).
- **Actions:** "Redeem for 500 pts" → `RedeemConfirmDialog` (summary: reward, cost, balance before → after, validity, "Points are deducted now. Vouchers aren't refundable once expired." Buttons: Confirm redemption / Cancel) → processing (button spinner, dialog locked) → `RedemptionSuccess` view (in-dialog/sheet): voucher code, valid until, "Show at counter", "View my vouchers", balance count-down animation.
- **Error states:** eligibility changed during confirmation (re-check fails) → dialog shows reason, no deduction; duplicate submit ignored (same request id); storage write failure → "Your redemption didn't go through. No points were deducted." + Retry.
- **Responsive:** sticky action bar on mobile with cost + button (56px).

### C7. Activity (points history & expiry)
- **Purpose:** what happened to my points, and what will expire.
- **Route/Access:** `/club/activity` · member.
- **Sections:** summary strip (Available, Earned this year, Redeemed this year); `ExpirySchedule` (the **next 3 expiry dates** with amounts, regardless of window; those within the expiring-soon window are highlighted as "Expiring soon"; "Your points never expire" when policy is none; "No upcoming expiries" otherwise; policy link); filter segmented: All · Earned · Redeemed · Expired; `LedgerList` grouped by month: icon, title ("Purchase at Trove store — bill 4471"), date, ±points (coral for +, ink for −), running balance, expandable details (amount, rate snapshot: "₹100 = 5 pts · base 100 + Tide bonus 10", staff first name, voucher code).
- **Empty:** new member: "Your story starts with your first purchase."; filter-empty messages per filter.
- **Pagination:** "Show more" (20 at a time).
- **Responsive:** single column; details expand inline.

### C8. Profile
- **Purpose:** view/edit permitted info; membership info.
- **Route/Access:** `/club/profile` · member.
- **Sections:** Membership summary (member no., member since, tier, mobile read-only with "To change your mobile number, please ask at the store."); **Personal details** form: name, email, updates consent; **Celebrations**: birthday, marital status, spouse first name, anniversary — each occasion date shows "You can change this once" or "Locked — ask at the store to change" (BR-40); Sign out; "How we use your data" short note.
- **Actions:** Save (per section), Cancel; unsaved-changes guard on navigation (dialog).
- **Validation:** name 2–60 letters/spaces/.'-; email format; day valid for month; anniversary year 1950–current year.
- **Feedback:** toast "Profile updated" + inline "Saved" stamp; errors inline.
- **Responsive:** single column forms (max 560px).

---

## COUNTER (STAFF)

### S1. Staff sign-in
- **Purpose:** simulated staff authentication for all staff roles.
- **Route/Access:** `/counter/login` (also reached from `/admin/*` when signed out) · public.
- **Layout:** centred panel on shell canvas, wordmark + "Staff sign in". Step 1: choose staff (list of active staff with initials + role chip; inactive staff not listed). Step 2: 4-digit PIN pad (large keys, also keyboard input), with a note showing the **selected** staff member's demo PIN ("Demo PIN for Pooja: 3456"). 3 wrong attempts → 30s lock (simulated).
- **After sign-in:** cashier → `/counter`; manager/admin → `/admin` (if they came from admin) else `/counter`.
- **Error:** wrong PIN (attempts remaining), locked, staff deactivated mid-session (signed out with message).

### S2. Counter workspace
- **Purpose:** do every in-store loyalty task fast.
- **Route/Access:** `/counter` · cashier, manager, admin.
- **Layout:** top bar (wordmark, staff name + role, Verify code, My history (opens `HistorySheet`), Admin (if permitted), Sign out). Body:
  - **Search state:** large `PhoneInput` with numeric keypad focus, "Find member". After 4+ digits, suggestions list (max 5, masked numbers + names). Recent members (last 5 served this session) chips.
  - **Not found:** "No member with 98765 43210" + "Enrol as new member" (inline form: name required, email optional, "Customer agrees to join Trove Club" checkbox required) → creates member → member state.
  - **Member state:** `MemberPanel` (name, masked mobile, member no., tier chip, **available points** big, expiring soon note, active vouchers count, couple-visit eligibility, occasion today/this week badge) + **Action tabs**: *Purchase* (default) · *Rewards* · *Couple visit*. "Change member" clears state.
  - **Purchase tab:** Amount (₹, numeric keypad, large), Bill number (required), live `EarnBreakdown` (`aria-live`): rate, eligible?, base, tier bonus, campaign (name), total, new balance. "Record purchase · +210 pts" (xl). **Decision: no extra confirmation modal.** The live breakdown *is* the review step and the button label repeats the points, so review → confirm takes one tap, as the brief asks. No "undo" toast: the ledger is immutable, and mistakes are corrected by a manager void. Per the form rules, the button is not disabled for validation: pressing it with a missing amount or bill number shows inline errors and focuses the first one. Success → `ReceiptPanel` (points added, new balance, bill no., time) with "Next customer" (primary) and "Another action for Tara".
  - **Rewards tab:** Active vouchers list (code, reward, expiry, "Mark as used" → confirm dialog with bill number optional) and "Redeem a reward now" list (eligible rewards sorted by cost; ineligible shown collapsed with reasons) → confirm dialog (cost, balance after, "Customer has asked to redeem") → voucher created and marked used → receipt.
  - **Couple visit tab:** eligibility (married on profile? last visit date? cooldown) → checkbox "Member and spouse are both present" → "Record couple visit · +100 pts" → receipt. Ineligible: reason + no button.
- **Verify code (top bar):** `VerifyCodeDialog`: code input (auto-uppercase, dash-insensitive) → result card (valid → member, reward, value, expiry, "Mark as used"; used → who/when; expired; cancelled; not found).
- **Empty:** search state is the empty state, with a one-line hint.
- **Errors:** duplicate bill ("Bill 4471 was already recorded for Tara at 3:12 pm"), below minimum (informational, still records with 0 pts), permission (n/a for counter actions), storage write failure (retry, nothing recorded).
- **Responsive:** single column ≤ 1023 (member panel collapses to a compact header with expandable details); two columns ≥ 1024.

### S3. My history (sheet inside the counter, not a separate screen)
- **Purpose:** cashier sees what they recorded.
- **Access:** "My history" in the counter top bar opens `HistorySheet` · any staff (shows **only own** transactions; managers/admins see their own here, the full ledger in admin).
- **Sections:** range segmented (Today / 7 days); totals (purchases count, amount, points issued, vouchers used, couple visits); list of entries (time, member, type, amount, points).
- **Empty:** "Nothing recorded yet today."
- **Responsive:** list cards on mobile, table ≥ 768.

---

## ADMIN PORTAL

Shell: sidebar (Dashboard, Customers, Rewards, Programme, Activity, Staff; footer: Open counter, staff identity, Sign out). Items not permitted for the role are **not rendered**; direct URL access hits AccessDenied.

### A1. Dashboard
- **Purpose:** programme health at a glance.
- **Route/Access:** `/admin` · admin, manager.
- **Layout:** page title "Good morning, Nisha" + range presets (Today, 7d, 30d, 90d, 12m). **KPI band** (6): Members (total, +new in range), Active members, Points issued, Points redeemed, Outstanding points (≈ ₹ liability), Redemptions (used/unused). Row 2: **Issued vs redeemed** bar chart (8 cols) + **Tier distribution** horizontal bars with counts and % (4 cols). Row 3: **Upcoming occasions** (next 30 days: member, occasion, date, benefit) (6 cols) + **Popular rewards** (top 5 with counts) (6 cols). Row 4: **Recent activity** (last 10 ledger rows, link to Activity).
- **Interactions:** range changes recompute everything; KPI numerals link to filtered Activity/Customers views; chart bars have tooltips and keyboard focus; "Expiring in 30 days" figure under Outstanding.
- **Empty:** zero data range → each widget shows its own empty message ("No redemptions in the last 7 days"); charts render an empty frame, not a blank.
- **Loading:** skeletons on hydration.
- **Responsive:** KPI band 2×3 grid on mobile, 3×2 on tablet, 6×1 on desktop; charts stack.

### A2. Customers list
- **Route/Access:** `/admin/customers` · admin, manager.
- **Sections:** search (name, mobile, member no., debounced 200ms); filters: Tier (multi), Engagement (Active/Inactive), Upcoming occasion (30 days), Points expiring (30 days); sort (Name, Points, Qualifying spend, Joined, Last activity); table columns: Member (name + member no.), Mobile (masked except last 4… admins see full on detail), Tier, Points, Qualifying spend (12m), Last activity, Upcoming occasion icon. Pagination 20. URL query string holds filters (shareable/back-button safe). "Export CSV" (filtered set).
- **Empty:** no members ("No members yet — enrol members at the counter"); no matches ("No members match 'zo' with these filters" + Clear filters).
- **Responsive:** row cards < 768; filters in sheet.

### A3. Customer detail
- **Route/Access:** `/admin/customers/:customerId` · admin, manager. Unknown id → not-found panel.
- **Header:** name (Playfair), member no., tier chip, mobile, member since; KPI mini-band: Available points, Expiring soon, Qualifying spend (12m) with progress to next tier, Lifetime spend, Vouchers active. Actions: **Adjust points**, **Edit details** (manager/admin), "Open at counter" (deep link with member preselected).
- **Tabs:** *Overview* (recent activity, occasions summary, couple visits count/last) · *Points history* (full ledger with running balance, filters, row menu: Void purchase) · *Vouchers* (all, with Cancel & refund for issued) · *Profile & occasions* (all fields; edit dialog incl. mobile change with uniqueness; occasion lock override) · *Audit* (entries for this member).
- **Dialogs:** `AdjustPointsDialog` (Credit/Debit toggle, points, reason category, note, preview "Balance 1,438 → 1,638"), `VoidPurchaseDialog` (reason required; shows the amount removed from qualifying spend, the points that will be reversed = what remains of that purchase's points, and any shortfall already used/expired with a hint to use Adjust points if appropriate), `CancelVoucherDialog` (reason, refund amount), `EditCustomerDialog`.
- **Responsive:** tabs become a select on < 640; ledger as cards.

### A4. Rewards list
- **Route/Access:** `/admin/rewards` · admin (manager: AccessDenied).
- **Sections:** status tabs (Active, Scheduled, Drafts, Inactive, Archived) with counts; search; grid/list toggle (list default on desktop: thumbnail, name, type, points, eligible tiers, availability dates, stock left, redemptions count, status switch); "New reward".
- **Row actions:** Edit, Duplicate, Activate/Deactivate (switch; confirm on deactivate: "Members can't redeem it anymore. 3 issued vouchers stay valid."), Archive (confirm).
- **Empty:** "Create your first reward" with templates (₹ off, % off, Gift, Experience).

### A5. Reward editor
- **Route/Access:** `/admin/rewards/new`, `/admin/rewards/:rewardId` · admin.
- **Layout:** form (8 cols) + sticky **live preview** (4 cols) showing customer `RewardCard` and detail summary exactly as members will see it.
- **Sections:** Basics (name, type, short description, how to use), Value (fixed ₹ / % + cap / free text for gift/experience), Image (pick from bundled library or upload JPG/PNG/WebP ≤ 1.5 MB → resized client-side to ≤ 800 px and ≤ 120 KB, stored in the separate image store (max 6 uploads); alt text required), Cost & eligibility (points, eligible tiers, min purchase to use), Availability (start/end dates, stock limit, per-member limit, voucher validity days), Terms, Status.
- **Validation:** required fields, points 1–1,000,000, % 1–90, end ≥ start, cap ≥ 0, image size/type.
- **Actions:** Save draft, Save & activate, Cancel (unsaved guard), Archive (existing).
- **Responsive:** preview moves below form (collapsible) < 1024.

### A6. Programme settings (loyalty configuration)
- **Route/Access:** `/admin/programme/:section` · admin only.
- **Layout:** left sub-nav of sections (tabs on mobile) + content; each section is a form with plain-language explanation, examples and a **"What members will see"** / **impact** preview; sticky save bar appears when dirty ("Unsaved changes · Discard · Review & save"); save opens `ReviewChangesDialog` listing before → after per field.
- **Sections:**
  1. **Earning** — spend unit ₹, points per unit, rounding (round down recommended / nearest), minimum purchase, point value for reporting. Preview calculator: amount input → points under saved vs draft rules.
  2. **Tiers** — editable table of tiers (name, threshold, earn bonus %, accent, benefits list, description, active); qualification window (rolling 12m / lifetime). Impact: "With these thresholds: 3 members move up, 1 moves down" (computed). Validation: first tier ₹0 and active; thresholds strictly increasing; names unique.
  3. **Expiry** — No expiry / Fixed validity (months, expires at end of month); expiring-soon window days. Explanation: "Applies to points earned after you save. Points already earned keep their current expiry date." Impact: "Currently 2,340 points expire in the next 30 days."
  4. **Occasions** — birthday rules and anniversary rules lists (add/edit/disable): benefit type, value, min purchase, eligible tiers, unlock days before, validity days. One global setting below the lists: "Occasion date must be on file at least N days before". Preview: "Zoya (Golden Hour) would receive: 250 bonus points + 15% off voucher".
  5. **Couple visits** — active, bonus points, require Married on profile, cooldown days.
  6. **Campaigns** — list (status: Live / Scheduled / Ended / Off) + editor dialog (name, description for members, type, value, min spend, days of week, dates, eligible tiers, show to members, active). Note on stacking rule.
  7. **Redemption** — default voucher validity, allow staff-assisted redemption, member self-edit of occasion dates (once/never).
- **Empty:** campaigns/occasion rules empty states with "Add".
- **Error:** validation inline + summary; save failure keeps draft.
- **Responsive:** sub-nav → select on mobile; tier table → stacked tier cards.

### A7. Activity & reports
- **Route/Access:** `/admin/activity` (tab Transactions), `/admin/activity/audit` (tab Audit log) · admin, manager.
- **Transactions:** filters (range presets, type multi, staff, member search, channel); summary totals for the filtered set; table (time, member, type, amount ₹, points ±, staff, reference/bill/voucher); row → member detail. Export CSV (filtered).
- **Audit log:** filters (range, actor, action type); entries (time, actor + role, action, target, summary, reason; expandable before/after diff for config changes); includes ACCESS_DENIED attempts.
- **Empty/Loading/Responsive:** as for tables.

### A8. Staff management
- **Route/Access:** `/admin/staff` · admin only.
- **Sections:** table (name, role, status, last sign-in, transactions recorded); "Add staff" dialog (name, role, PIN (4 digits, demo), active); row actions: Edit role, Reset PIN, Deactivate/Reactivate (confirm). Guard: last active admin cannot be demoted/deactivated (inline explanation).
- **Note banner:** "Demo sign-in: PINs are stored in this browser and are not secure."

---

## Shared component catalogue

| Group | Components (in `src/components/…`) |
|---|---|
| Brand | `Wordmark`, `WaveLine`, `MembershipCard`, `TierChip`, `TierLadder`, `PointsValue` (formats + optional count-up), `Money` |
| Layout | `DemoBar`, `DemoPanel`, `StorageBanner`, `CustomerShell` (`SiteHeader`, `BottomTabBar`, `SiteFooter`), `CounterShell`, `AdminShell` (`AdminSidebar`, `AdminTopBar`), `PageHeader`, `Section`, `Panel` |
| UI primitives (shadcn, restyled) | `Button`, `Input`, `Label`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Tabs`, `Dialog`, `AlertDialog`, `Sheet`, `DropdownMenu`, `Popover`, `Tooltip`, `Accordion`, `Badge/Chip`, `Skeleton`, `Separator`, `Toaster` |
| Forms | `Field` (label+control+helper+error), `PhoneInput`, `CurrencyInput`, `OtpInput`, `DayMonthPicker`, `PinPad`, `FormErrorSummary`, `UnsavedChangesGuard`, `StickySaveBar` |
| Data | `DataTable` (sortable header, row link, row menu, responsive card mode, pagination), `FilterBar`, `RangePresets`, `KpiBand`, `KpiItem`, `BarChartIssuedRedeemed`, `TierDistribution`, `EmptyState`, `ErrorState`, `CsvExportButton` |
| Domain UI | `RewardCard`, `RewardImage`, `EligibilityChip`, `VoucherCard`, `VoucherShowSheet`, `RedeemConfirmDialog`, `LedgerList`, `LedgerRow`, `ExpirySchedule`, `OccasionCard`, `TierProgress`, `EarnBreakdown`, `MemberPanel`, `ReceiptPanel`, `AdjustPointsDialog`, `VoidPurchaseDialog`, `CancelVoucherDialog`, `ReviewChangesDialog` |
| Customer extras | `NotificationsSheet`, `NotificationBell` |
| Counter extras | `HistorySheet`, `VoucherVerifyDialog` |
| System | `ErrorBoundary`, `NotFound`, `AccessDenied`, `RequireMember`, `RequireStaff`, `RequirePermission` |

Dev-only: `/dev/design-system` route rendering every token and component state (excluded from production build navigation; used for visual QA).
