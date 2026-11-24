# Trove Club — Technical Architecture

Static single-page application. No backend. One shared, validated, persisted data document in the browser, mutated only through permission-checked service commands that write an immutable points ledger and an audit log. All three portals read the same data through pure selectors.

---

## 1. Stack (and why)

| Concern | Choice | Reason |
|---|---|---|
| UI | **React 19 + TypeScript (strict)** | Brief's preferred direction; mature ecosystem. |
| Build | **Vite** (current stable) | Fast dev server, static output. |
| Styling | **Tailwind CSS v4** (`@tailwindcss/vite`) with CSS-variable tokens via `@theme` | Tokens in one file, utility classes, no runtime CSS-in-JS. |
| Primitives | **shadcn/ui, selectively** (Radix-based: Dialog, AlertDialog, Sheet, Select, Tabs, DropdownMenu, Popover, Tooltip, Accordion, Checkbox, RadioGroup, Switch) — copied into `src/components/ui` and **restyled to the Trove tokens** | Accessible behaviour (focus traps, keyboard) without building it; we own the styling so it won't look like default shadcn. |
| Routing | **React Router v7** (library mode, `createBrowserRouter`, lazy route modules) | Nested layouts per portal, guards, code splitting. |
| State | **Zustand** (vanilla store + React hook with selectors) | Tiny, predictable, selector subscriptions; avoids context re-render storms. Persistence is custom (below), not the persist middleware, because we need re-read-before-write and cross-tab sync. |
| Validation | **Zod** | One schema validates stored data, seed, and forms. |
| Forms | **react-hook-form + @hookform/resolvers** | Many config forms with dirty tracking and field errors; less code than hand-rolled state. |
| Dates | **date-fns** | Calendar math (end of month, day/month occasions, ranges). |
| Charts | **Recharts** | Two charts only (bar, horizontal bars); accessible enough with our text summaries. |
| Icons | **lucide-react** | |
| Toasts | **sonner** | Accessible, matches shadcn. |
| Fonts | **@fontsource/playfair-display**, **@fontsource-variable/work-sans** | Self-hosted, works offline. |
| Class utils | `clsx`, `tailwind-merge`, `class-variance-authority` | Standard shadcn variant helpers. |
| Tests | **Vitest + Testing Library (`@testing-library/react`, `user-event`, `jest-dom`) + jsdom**, **Playwright** + **@axe-core/playwright** | Unit/integration/component + E2E/a11y. |
| Quality | ESLint (`typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `globals`), Prettier | |

**Implied dependencies (allowed without asking):** packages that the tools above install or require as part of their documented setup, e.g. `radix-ui`/`@radix-ui/*` and `tw-animate-css` added by `shadcn`, `@vitejs/plugin-react`, `@types/*`, Playwright browsers. Record them in the report; do not stop for them.

**Not added (on purpose):** no backend/BaaS, no Redux/TanStack Query (no server), no UI kit beyond shadcn primitives, no animation library (CSS transitions suffice), no date-picker library (day/month selects), no QR library (deferred), no `date-fns-tz` (local time assumed IST — documented; tests pin `TZ=Asia/Kolkata` for Vitest and `timezoneId: 'Asia/Kolkata'` in Playwright).

Pin versions via the lockfile. Use whatever is the current stable major for each at implementation time; if a major differs from the above (e.g., React Router API changes), follow its official docs rather than this document's API sketches.

---

## 2. Application architecture

```
┌──────────────────────────── UI (React) ─────────────────────────────┐
│  features/customer   features/counter   features/admin   features/demo│
│        │ read via selectors (hooks)        │ write via commands       │
└────────┼───────────────────────────────────┼──────────────────────────┘
         ▼                                   ▼
┌──────────────── data/selectors ──┐  ┌──────── services/commands ─────────┐
│ pure derivations (balance, lots, │  │ permission check → validate (Zod) → │
│ tier, eligibility, KPIs)         │  │ domain calc → build records →       │
└──────────────┬───────────────────┘  │ audit → store.commit (atomic)       │
               │                      └──────────────┬──────────────────────┘
               ▼                                     ▼
┌──────────────────────────── domain/ (pure TS, no React) ─────────────────┐
│ money · earning · ledger(lots, FIFO, expiry) · tiers · rewards · occasions│
│ campaigns · couple · permissions · codes · dates                          │
└───────────────────────────────────────────────────────────────────────────┘
               ▲
┌──────────────┴──────────── data/store + data/storage ─────────────────────┐
│ Zustand store holding AppData · localStorage adapter · schema/migrations  │
│ seed builder · cross-tab sync · corruption recovery                       │
└───────────────────────────────────────────────────────────────────────────┘
```

**Rules**
1. `domain/` is pure and framework-free: inputs → outputs, `now` passed in. 100% of business rules live here.
2. UI never mutates data directly; it calls a command. Commands are the only writers.
3. Derived values (balance, tier, lots, eligibility, KPIs) are **never stored**; they are computed by selectors (memoised on the data reference).
4. Every command writes at least one `AuditEntry`.
5. Time comes from `lib/clock.ts` (`clock.now()`), overridable in tests.

---

## 3. Project structure

```
/
├─ index.html
├─ package.json · tsconfig*.json · vite.config.ts · vitest.config.ts · playwright.config.ts · eslint.config.js · .prettierrc
├─ components.json                     # shadcn config
├─ public/
│  └─ images/                          # bundled imagery (see manifest)
├─ docs/                               # these planning documents
├─ src/
│  ├─ main.tsx                         # mounts <App/>, imports fonts + globals.css
│  ├─ app/
│  │  ├─ App.tsx                       # providers: Toaster, StoreBootstrap
│  │  ├─ router.tsx                    # route tree (lazy portals)
│  │  └─ guards.tsx                    # RequireMember, RequireStaff, RequirePermission
│  ├─ styles/
│  │  ├─ tokens.css                    # primitives + semantic tokens (Design System §1–3)
│  │  └─ globals.css                   # @import tailwind, @theme mapping, base styles, reduced motion
│  ├─ assets/brand/                    # wave-line.svg, imagery manifest (images.ts)
│  ├─ lib/                             # clock.ts, ids.ts, format.ts (₹, pts, dates en-IN), cn.ts, csv.ts, mobile.ts, result.ts, errors.ts
│  ├─ domain/
│  │  ├─ types.ts                      # all entity types (inferred from data/schema.ts)
│  │  ├─ money.ts                      # paise helpers, parse ₹ input → paise
│  │  ├─ earning.ts                    # calculateEarn()
│  │  ├─ ledger.ts                     # deriveLedger(): lots, balance, FIFO allocation, expiring
│  │  ├─ expiry.ts                     # expiryDateFor(), findLotsToExpire()
│  │  ├─ tiers.ts                      # qualifyingSpend(), resolveTier(), tierProgress(), tierImpact()
│  │  ├─ rewards.ts                    # rewardAvailability(), checkEligibility()
│  │  ├─ occasions.ts                  # nextOccurrence(), occasionWindow(), dueOccasionGrants()
│  │  ├─ campaigns.ts                  # applicableCampaigns(), bestCampaign()
│  │  ├─ couple.ts                     # coupleVisitEligibility()
│  │  ├─ permissions.ts                # Permission enum, ROLE_PERMISSIONS, can()
│  │  ├─ codes.ts                      # voucher code generator/normaliser
│  │  └─ dates.ts                      # endOfMonthLocal, dayMonth helpers, range presets
│  ├─ data/
│  │  ├─ schema.ts                     # Zod schemas for AppData and all entities; SCHEMA_VERSION
│  │  ├─ migrations.ts                 # versioned migrations
│  │  ├─ storage.ts                    # localStorage adapter: read/validate/write/backup, availability
│  │  ├─ store.ts                      # Zustand store, commit(), cross-tab listener
│  │  ├─ sessions.ts                   # member/staff session read/write
│  │  ├─ seed/
│  │  │  ├─ buildSeed.ts               # deterministic seed relative to now
│  │  │  ├─ prng.ts                    # mulberry32
│  │  │  ├─ config.seed.ts · tiers.seed.ts · rewards.seed.ts · campaigns.seed.ts · staff.seed.ts
│  │  │  ├─ members.scenarios.ts       # named scenario members A–I
│  │  │  └─ members.population.ts      # 18 supporting members (fixed names, PRNG histories)
│  │  └─ selectors/                    # member.ts, rewards.ts, dashboard.ts, activity.ts, counter.ts
│  ├─ services/
│  │  ├─ command.ts                    # runCommand wrapper: actor, permission, requestId idempotency, audit, commit
│  │  ├─ auth.ts                       # requestOtp, verifyOtp, staffSignIn, signOut
│  │  ├─ members.ts                    # registerMember, enrolAtCounter, updateProfile, adminUpdateMember
│  │  ├─ purchases.ts                  # recordPurchase, voidPurchase
│  │  ├─ redemptions.ts                # redeemReward, markVoucherUsed, cancelVoucher, verifyCode
│  │  ├─ points.ts                     # adjustPoints
│  │  ├─ couple.ts                     # recordCoupleVisit
│  │  ├─ config.ts                     # updateEarning/Tiers/Expiry/Occasions/Couple/Redemption, upsertCampaign
│  │  ├─ rewards.ts                    # upsertReward, setRewardStatus, archiveReward, duplicateReward
│  │  ├─ staff.ts                      # upsertStaff, resetPin, setStaffActive
│  │  ├─ sweeps.ts                     # runSweeps(now): expiry + occasion grants (idempotent)
│  │  └─ demo.ts                       # resetDemoData, switchPersona
│  ├─ hooks/                           # useAppData, useMemberSession, useStaffSession, useCan, useCommand, useUnsavedChanges, useMediaQuery, useReducedMotion
│  ├─ components/
│  │  ├─ ui/                           # shadcn primitives (restyled)
│  │  ├─ brand/ · layout/ · forms/ · data/ · domain/ · system/   # see Screen Inventory catalogue
│  └─ features/
│     ├─ customer/ (pages: Landing, Auth, Dashboard, Membership, Rewards, RewardDetail, Vouchers, Activity, Profile; + local components)
│     ├─ counter/  (pages: StaffLogin, Counter; tabs/*, HistorySheet)
│     ├─ admin/    (pages: Dashboard, Customers, CustomerDetail, Rewards, RewardEditor, Programme/*, Activity, Audit, Staff)
│     ├─ demo/     (DemoBar, DemoPanel, PresenterGuide)
│     └─ dev/      (DesignSystemPage — dev only)
└─ tests/
   ├─ unit/        (mirrors src/domain, src/services)
   ├─ component/
   └─ e2e/         (scenarios.spec.ts, consistency.spec.ts, permissions.spec.ts, responsive.spec.ts, a11y.spec.ts, fixtures.ts)
```

Path alias `@/` → `src/`.

---

## 4. Routing

| Path | Element | Guard | Notes |
|---|---|---|---|
| `/` | Landing | — | |
| `/join`, `/login` | Auth | redirect to `/club` if member session | `?redirect=` supported (same-origin paths only) |
| `/club` | Dashboard | RequireMember | |
| `/club/membership` | Membership | RequireMember | |
| `/club/rewards` | Rewards (catalogue) | RequireMember | filters in query string |
| `/club/rewards/vouchers` | Rewards (vouchers tab) | RequireMember | |
| `/club/rewards/:rewardId` | RewardDetail | RequireMember | |
| `/club/activity` | Activity | RequireMember | |
| `/club/profile` | Profile | RequireMember | |
| `/counter/login` | StaffLogin | redirect if staff session | |
| `/counter` | Counter | RequireStaff + `counter.use` | `?member=<id>` preselect; "My history" is a sheet inside the counter (`counter.ownHistory`) |
| `/admin` | AdminDashboard | RequireStaff + `dashboard.view` | |
| `/admin/customers`, `/admin/customers/:id` | Customers / Detail | `customers.view` | |
| `/admin/rewards`, `/admin/rewards/new`, `/admin/rewards/:id` | Rewards / Editor | `rewards.manage` | |
| `/admin/programme/:section?` | Programme | `programme.manage` | sections: earning, tiers, expiry, occasions, couple, campaigns, redemption |
| `/admin/activity`, `/admin/activity/audit` | Activity | `reports.view` | |
| `/admin/staff` | Staff | `staff.manage` | |
| `/dev/design-system` | DesignSystemPage | — | included in every build (so Playwright can run axe against the preview build) but not linked from any navigation |
| `*` | NotFound | — | |

Guards: no session → redirect to the portal's login with `redirect` param. Session present but permission missing → render `AccessDenied` (HTTP-like 403 page) and call `auditAccessDenied(actor, path)`. The `AccessDenied` audit entry is written **once per navigation** (effect keyed on `location.key`), never during render, to avoid a write → re-render → write loop. Static hosting: include `public/_redirects` (`/* /index.html 200`) and document `vite preview` for the presentation.

---

## 5. Data model

All entities are Zod schemas in `data/schema.ts`; TS types are inferred. IDs: `crypto.randomUUID()` for records created at runtime; **seed records use fixed, readable IDs** (`cust-tara`, `staff-pooja`, `rwd-250-off`, …) and PRNG-derived voucher codes, so a reset reproduces exactly the same data, deep links keep working and the current persona's session survives a reset. Timestamps: ISO-8601 strings (`at`). Money: integer paise. Points: integers.

```ts
type AppData = {
  schemaVersion: 1;
  seededAt: string;               // when the demo seed was generated
  seq: { txn: number; member: number; purchase: number };  // human-readable reference counters
  config: LoyaltyConfig;
  tiers: Tier[];
  customers: Customer[];
  staff: StaffMember[];
  purchases: Purchase[];
  transactions: PointsTransaction[];   // THE ledger (append-only)
  rewards: Reward[];
  vouchers: IssuedVoucher[];
  coupleVisits: CoupleVisit[];
  campaigns: Campaign[];
  occasionGrants: OccasionGrant[];     // idempotency record for birthday/anniversary
  notifications: Notification[];
  audit: AuditEntry[];
  processedRequests: Record<string, { at: string; resultRef: string }>; // idempotency (pruned > 24h)
};
```

### 5.1 Entities and responsibilities

| Entity | Key fields | Responsibility / relationships |
|---|---|---|
| **Customer** | id, memberNo (`TC104582`), name, mobile (`+91…`, unique), email?, birthday? `{day, month}`, maritalStatus? `'single'|'married'|'undisclosed'`, spouseFirstName?, anniversary? `{day, month, year?}`, occasionDates `{birthdaySetAt?, birthdayEdits, anniversarySetAt?, anniversaryEdits}`, consent `{terms: at, updates: boolean}`, enrolledAt, enrolledVia `'online'|'counter'`, enrolledByStaffId? | Identity + profile (the "customer profile" is part of this entity — no separate table needed). Owns many transactions, purchases, vouchers, couple visits. **No spouse identifiers beyond optional first name.** |
| **StaffMember** | id, name, role `'admin'|'manager'|'cashier'`, pin (demo, plain), active, createdAt, lastSignInAt? | Actor for commands/audit. Role → permissions via `ROLE_PERMISSIONS` (Role is an enum, not an entity — roles aren't editable). |
| **Tier** | id, name, rank (0..n), thresholdPaise, earnBonusPct, benefits: string[], description, accent `'shore'|'tide'|'golden'|'endless'`, active | Configuration. Customer tier is **derived**. |
| **LoyaltyConfig** | earning `{spendUnitPaise, pointsPerUnit, rounding:'down'|'nearest', minPurchasePaise, pointValuePaise}`, expiry `{mode:'none'|'fixed_months', months, expiringSoonDays}`, tierWindow `'rolling_12m'|'lifetime'`, occasions: OccasionRule[], couple `{active, bonusPoints, requireMarried, cooldownDays}`, redemption `{defaultVoucherValidityDays, allowStaffAssisted, occasionSelfEdits: 0|1}`, occasionMinDaysOnFile, updatedAt, updatedBy | Single configuration document. |
| **OccasionRule** | id, occasion `'birthday'|'anniversary'`, name, benefit `{type:'bonus_points'|'fixed_discount'|'percent_discount'|'voucher'|'gift', points?, amountPaise?, percent?, capPaise?, description}`, minPurchasePaise?, eligibleTierIds (empty = all), unlockDaysBefore, validityDays, active | Birthday reward / anniversary reward definitions. |
| **Purchase** | id, ref (`P-000123`), customerId, amountPaise (final amount paid), billNo (normalised; unique among non-voided purchases), channel `'store'` (future `'online'`), at, staffId, eligible: boolean, earnTxnId?, voided? `{at, staffId, reason, voidTxnId?, pointsReversed, shortfall}` | Source of qualifying spend; linked to its EARN transaction. |
| **PointsTransaction** | id, ref (`TX-000456`), customerId, type (see BR-12), points (signed int), at, actor `{kind:'staff'|'member'|'system', id?}`, purchaseId?, voucherId?, coupleVisitId?, occasionGrantId?, campaignId?, expiresAt? (credits only; null = never), expiresLotTxnId? (EXPIRE only), breakdown? `{basePoints, tierBonus, tierName, tierPct, campaignBonus, campaignName, ruleSnapshot:{spendUnitPaise, pointsPerUnit, rounding}}`, reason? `{category, note}`, description (human readable) | **The ledger. Single source of truth for points.** Append-only; never edited or deleted. |
| *Points balance* | — | **Derived**: `sum(points)`; lots via `deriveLedger()`. Not stored. |
| **Reward** | id, name, type, shortDescription, description, howToUse, terms, value `{amountPaise?|percent?, capPaise?, label}`, image `{src, alt}`, pointsCost, eligibleTierIds, minPurchasePaise?, startsAt?, endsAt?, stockLimit?, perMemberLimit?, voucherValidityDays, status `'draft'|'active'|'inactive'|'archived'`, createdAt, updatedAt | Catalogue item. Stock remaining derived from vouchers. |
| **IssuedVoucher** (Reward redemption) | id, code (`TC-7K3M-Q9PX`), customerId, source `'catalogue'|'occasion'`, rewardId? / occasionRuleId?, title, valueLabel, pointsSpent, channel `'portal'|'store'`, issuedAt, expiresAt, status `'issued'|'used'|'cancelled'` (expired is derived from expiresAt), usedAt?, usedByStaffId?, usedBillNo?, cancelled? `{at, staffId, reason, refundTxnId}`, redeemTxnId? | Covers catalogue redemptions and occasion vouchers in one customer wallet. |
| **OccasionGrant** | id, key (`occasion:{ruleId}:{customerId}:{year}`, unique), customerId, ruleId, occasion, occurrenceDate, grantedAt, txnId?, voucherId? | Birthday/anniversary reward issuance record + idempotency. |
| **CoupleVisit** | id, customerId, at, staffId, bonusPoints, txnId | Couple visit log (one account only). |
| **Campaign** (Promotion) | id, name, customerDescription, type `'multiplier'|'flat_bonus'`, multiplierTenths? (20 = 2×), bonusPoints?, minSpendPaise?, daysOfWeek? (0–6), startsAt, endsAt, eligibleTierIds, showToMembers, active | Earn modifiers + member announcements. |
| **Notification** | id, customerId, kind `'points_earned'|'redeemed'|'occasion_ready'|'expiring'|'tier_up'|'adjusted'`, title, body, at, readAt? | In-app only (no external delivery). Shown in the customer header bell (`NotificationsSheet`: unread count, list, mark all read). See Screen Inventory §0. |
| **AuditEntry** | id, at, actor `{kind, id?, name, role?}`, action (e.g., `PURCHASE_RECORDED`, `CONFIG_EARNING_UPDATED`, `ACCESS_DENIED`), entity `{type, id}`, summary, reason?, before?, after? | Immutable audit trail; append-only. |
| **UploadedImage** | id, dataUrl (≤ 120 KB after resize to ≤ 800 px), name, createdAt | Admin uploads, stored under a **separate** localStorage key `troveclub.images` (max 6) so the main document stays small and fast to validate. Rewards reference images by id or bundled path. |

**Sessions (not in AppData) are per browser tab, stored in `sessionStorage`:** `troveclub.session.member` = `{customerId, at}`; `troveclub.session.staff` = `{staffId, at}`. A refresh keeps the tab signed in; each tab can hold a different member or staff identity, so the presenter (and Playwright pages in one context) can run a customer tab, a cashier counter tab and an admin tab side by side. Sessions are **re-validated whenever data changes** (including changes made in another tab): a removed member or deactivated staff member is signed out with a message. Sign-out affects only the current tab. Links between portals stay in the same tab (no `target=_blank`). OTP challenges live in memory only (`{mobile, code, expiresAt, attempts, resendAvailableAt}`).

---

## 6. Points engine (domain algorithms)

### 6.1 Money input
`parseRupeesToPaise("4,990.50") → 499050`. Accept digits, one dot, max 2 decimals, strip commas; reject negatives, > ₹10,00,000 per purchase (sanity cap, configurable constant). Never `parseFloat` for storage; parse integer and fraction parts as strings.

### 6.2 `calculateEarn(input)`
```
input: amountPaise, config.earning, tier (before purchase), campaigns, at
if amountPaise < minPurchasePaise → { eligible:false, total:0, reason:'below_minimum' }
units = rounding==='down' ? floor(amountPaise / spendUnitPaise)
                          : floor((amountPaise + spendUnitPaise/2) / spendUnitPaise)   // integer half-up
base = units * pointsPerUnit
tierBonus = floor(base * tier.earnBonusPct / 100)
candidates = campaigns active at `at` (dates, daysOfWeek, tier, minSpend)
campaignBonus(c) = c.type==='multiplier' ? floor(base * (c.multiplierTenths - 10) / 10) : c.bonusPoints
best = argmax campaignBonus (tie → earliest startsAt, then name)
total = base + tierBonus + (best?.bonus ?? 0)
return { eligible:true, base, tierBonus, campaign: best, total, ruleSnapshot }
```
All integer arithmetic (`Math.floor` on integer division results; inputs are integers).

### 6.3 Ledger derivation `deriveLedger(transactions, now)`
1. Sort the customer's transactions by `(at, ref)`.
2. Walk in order, maintaining lots: each credit (`points > 0`) creates `{txnId, amount, remaining, expiresAt}`.
3. A debit (`REDEEM`, `ADJUST_DEBIT`) consumes from lots **not yet expired at the debit's `at`**, ordered by `expiresAt` ascending (null last), then `at` ascending. A `PURCHASE_VOID` consumes **only** the voided purchase's own lot; its amount is `min(earned, ownLot.remaining)` at void time (BR-47), so it never touches other lots and never double-counts expired or redeemed points.
4. An `EXPIRE` transaction zeroes exactly its `expiresLotTxnId` lot's remaining.
5. Output: `balance` (= sum of points — assert equals sum of lot remaining), `lots`, `expiring` (lots with remaining > 0 whose expiry **calendar date** ≤ today + `expiringSoonDays`, compared as local dates not instants — so "31 Dec" counts as within 30 days on 1 Dec; grouped by date; drives the dashboard notice), `schedule` (the next 3 expiry dates with remaining points regardless of window, each flagged `soon` when inside it; drives the Activity page), `runningBalance` per transaction (for history display).
Invariant tests: balance ≥ 0 always; `sum(points) === sum(lots.remaining)` after every step.

### 6.4 Expiry sweep (`services/sweeps.ts`, idempotent)
For each customer: `deriveLedger` at `now`; for each lot with `expiresAt <= now`, `remaining > 0`, and no existing `EXPIRE` referencing it → append `EXPIRE` with `points = -remaining`, `at = lot.expiresAt` (the real expiry moment, so history is accurate even if nobody opened the app that day), notification optional. Process lots in expiresAt order and re-derive after each so later debits are not double-counted. Run: on store bootstrap and inside `commit()` before each command. Expiry date for a new credit: `mode==='none' → null`; `fixed_months → endOfMonth(addMonths(at, months))` at 23:59:59.999 local.

### 6.5 Tiers
`qualifyingSpend(customer, purchases, now, window)` = sum `amountPaise` of purchases with `eligible && !voided && (window==='lifetime' || at > now − 365 days)`.
`resolveTier(spend, tiers)` = highest active tier with `thresholdPaise ≤ spend` (tiers sorted by rank).
`tierProgress` → `{current, next?, spend, remainingPaise, pct}`.
`tierImpact(customers, oldTiers, newTiers)` → counts moving up/down (for the Programme preview).

### 6.6 Reward eligibility `checkEligibility(reward, member, now)`
Order of checks (first failure returned, with machine code + human message + suggested action): `inactive`/`archived` → `not_started` → `ended` → `out_of_stock` → `tier_not_eligible` ("Available from Golden Hour") → `member_limit_reached` → `insufficient_points` ("You need 120 more points"). `ok` otherwise.

### 6.7 Occasions
`occurrencesAround(dayMonth, now)` returns the **previous and the next** occurrence (29 Feb → 28 Feb in non-leap years); for each, `window = [occurrence − unlockDaysBefore, occurrence − unlockDaysBefore + validityDays]` (so the window continues after the occasion). `dueOccasionGrants(now)`: for each active rule × eligible customer (tier at now, date on file ≥ `config.occasionMinDaysOnFile` (one global setting) before the occurrence, maritalStatus married for anniversary) × each of the two occurrences, where `now ∈ window` and no grant exists with key `occasion:{ruleId}:{customerId}:{occurrence.year}` → grant (bonus → `EARN_BONUS` txn; other → `IssuedVoucher` source `occasion`, expiresAt = window end). Upcoming (display only): occurrence within 30 days and at least one applicable active rule.

### 6.8 Couple visit eligibility
`active`, member exists, (`!requireMarried || maritalStatus==='married'`), and at least `cooldownDays` **calendar days** since the last visit's date (visit on 1 Nov with cooldown 30 → eligible from 1 Dec). Returns reason + `nextEligibleAt`.

### 6.9 Voucher codes
Alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no 0/O/1/I), `TC-XXXX-XXXX` via `crypto.getRandomValues`; regenerate on collision. Normalise input: uppercase, remove spaces/dashes, re-insert dashes.

---

## 7. Commands (transaction processing)

`runCommand({ actor, permission, requestId?, input, schema, handler })`:
1. `requireActor` — member or staff session valid (staff active).
2. `can(actor.role, permission)` else → `FORBIDDEN` + audit `ACCESS_DENIED`.
3. Validate input with Zod → `VALIDATION` with field errors.
4. If `requestId` seen in `processedRequests` → return the stored result (idempotent).
5. `store.commit(data => { runSweeps(data, now); handler(data, input, now) })` — **re-reads latest storage**, runs sweeps, applies the handler to a draft (structured clone), validates the result (dev: full Zod parse; prod: entity-level parse of changed collections), writes storage, updates the in-memory store. Any throw → nothing is written.
6. Returns `Result<T>`: `{ ok: true, value } | { ok: false, error: { code, message, fieldErrors?, details? } }`.

Error codes: `VALIDATION`, `NOT_FOUND`, `FORBIDDEN`, `CONFLICT` (duplicate bill, voucher already used, mobile taken), `INSUFFICIENT_POINTS`, `NOT_ELIGIBLE`, `STORAGE_UNAVAILABLE`, `STORAGE_QUOTA`, `UNKNOWN`.

| Command | Permission | Writes |
|---|---|---|
| `registerMember` | public (after OTP verified) | Customer, audit, session |
| `enrolAtCounter` | `counter.use` | Customer (enrolledVia counter), audit |
| `updateProfile` (self) | member self | Customer (occasion edit counters), audit |
| `adminUpdateMember` | `customers.edit` | Customer (incl. mobile change, occasion lock reset), audit with before/after |
| `recordPurchase` | `counter.use` | Purchase, EARN_PURCHASE txn (if eligible), notification, tier-up notification if crossed, audit |
| `voidPurchase` | `points.correct` | Purchase.voided (with pointsReversed and shortfall), PURCHASE_VOID txn when pointsReversed > 0, audit |
| `redeemReward` | member self **or** `counter.use` (+ `allowStaffAssisted`) | REDEEM txn, IssuedVoucher (store channel → status used immediately), notification, audit |
| `markVoucherUsed` | `counter.use` | Voucher used fields, audit |
| `cancelVoucher` | `points.correct` | Voucher cancelled, REDEEM_REFUND txn (new lot, expiry per policy), audit |
| `adjustPoints` | `points.adjust` | ADJUST_CREDIT/DEBIT txn, notification, audit |
| `recordCoupleVisit` | `counter.use` | CoupleVisit, EARN_BONUS txn, audit |
| `update*Config`, `upsertCampaign` | `programme.manage` | Config/tiers/campaigns, audit with before/after |
| `upsertReward`, `setRewardStatus`, `archiveReward`, `duplicateReward` | `rewards.manage` | Reward, audit |
| `uploadImage`, `deleteImage` | `rewards.manage` | `troveclub.images` key, audit |
| `upsertStaff`, `resetPin`, `setStaffActive` | `staff.manage` | Staff, audit (last-admin guard) |
| `resetDemoData` | demo tool (any, confirmed) | Replaces AppData with the fresh seed (fixed IDs, so the current tab's session stays valid when that persona exists in the seed), clears uploaded images, writes an audit entry into the new data |

---

## 8. Persistence

- **Keys:** localStorage `troveclub.data` (one JSON document, budget ≤ 1 MB) and `troveclub.images` (≤ 6 uploads × 120 KB, about 1 MB as base64); sessions in sessionStorage. Uploads are resized to ≤ 800 px WebP/JPEG at q≈0.8. The demo panel shows usage.
- **Bootstrap (`StoreBootstrap`):** `storage.isAvailable()` (write/read/remove probe) → read → `JSON.parse` → migrate (if `schemaVersion` lower) → Zod validate → set store → run sweeps **through `commit()`** (so occasion vouchers and expiries created at startup are persisted once and never regenerated with different codes on the next load). Missing → build seed. Newer/unknown version or invalid → copy raw value to `troveclub.data.backup` (latest only), build fresh seed, show recovered banner. Unavailable (private mode/blocked) → in-memory store + persistent warning banner.
- **Write:** only via `commit()`; catches `QuotaExceededError` → `STORAGE_QUOTA` result (nothing changed in memory either).
- **Cross-tab sync:** `window.addEventListener('storage', e => (e.key === 'troveclub.data' || e.key === 'troveclub.images') && reloadFromStorage())`, followed by session re-validation. Re-read-before-write in `commit()` prevents one tab overwriting another tab's newer ledger.
- **Schema versioning:** `SCHEMA_VERSION = 1`; `migrations[n]` upgrades `n → n+1`; each migration unit-tested.
- **Reset Demo Data:** `buildSeed(clock.now())` → write → reload. Deterministic (fixed PRNG seed, fixed IDs, seeded voucher codes), relative to the reset date.
- **Not security:** everything in localStorage is readable/editable by anyone with the browser; the UI says so.

---

## 9. Seed data specification (deterministic, relative to `now`)

`buildSeed(now)` constructs data by **applying the real domain functions in chronological order** (purchases through `calculateEarn`, expiry via the sweep, occasion grants via `dueOccasionGrants`) with explicit timestamps — so every seeded balance is consistent by construction. PRNG: mulberry32 with fixed seed `20261124`. Seed timestamps use fixed local times (purchases at 11:00 unless stated). **Rule: no scenario-member purchase may fall inside a campaign window that would apply to it**; the seed self-check asserts `campaignBonus = 0` for every scenario-member purchase.

**Default config:** ₹100 = 5 pts, round down, min ₹500, point value ₹0.50; expiry fixed 12 months end-of-month, expiring-soon 30 days; rolling 12-month tiers; couple visit 100 pts / married required / 30-day cooldown; voucher validity 30 days; occasion min 30 days on file; self-edits 1.

**Tiers:** Shore ₹0 (0%) · Tide ₹15,000 (+10%) · Golden Hour ₹40,000 (+25%) · Endless Summer ₹1,00,000 (+50%), The earn-bonus line ("+10% points on every purchase") and occasion benefits are **generated from config**, never typed as benefit text. Seeded benefit lines (no duplication of config or catalogue): Shore: "Member-only rewards catalogue". Tide: "Early access to sale previews". Golden Hour: "Priority alterations", "Invitations to new-collection previews". Endless Summer: "A private styling appointment each season", "First look at limited drops".

**Occasion rules:** Birthday bonus 250 pts (all tiers, unlock 7 days before, valid 30 days); Birthday 15% off voucher, cap ₹2,000 (Golden Hour + Endless Summer); Anniversary ₹1,000 off on ₹5,000+ (all tiers, married).

**Campaigns (dates relative to now):** "Resort Edit Bonus" flat +150 pts on ₹8,000+ (active, all tiers, now−10 d → now+21 d, shown to members); "Golden Hour Week" 1.5× (multiplierTenths 15) for Golden Hour & Endless Summer (active, now−1 d → now+6 d); "Double Points Weekend" 2× Sat–Sun (all tiers, now−30 d → now+60 d, **inactive**; admin can switch it on live); "Monsoon Escape" +200 on ₹6,000+ (now−4 mo → now−2 mo, ended).

**Rewards (10):** ₹250 off on ₹2,000+ (500 pts) · ₹600 off on ₹4,000+ (1,000) · 10% off, cap ₹1,500 (800) · Trove canvas beach tote (gift, 1,200, stock 25) · Signature printed sarong (gift, 1,500, stock 4 → "Only 4 left") · Complimentary alterations (voucher, 400) · Private styling session at the store (experience, 2,500, Tide+) · Early access to the next drop (promotional, 300) · Archived: "Summer '25 tote" (archived) · plus one **scheduled** reward starting in 10 days ("Resort weekend styling + ₹3,000 voucher", 6,000, Golden Hour+). Images from the bundled imagery manifest with alt text.

**Staff (5):** Nisha Varma (admin, PIN 1234), Arjun Shetty (manager, 2345), Pooja Nair (cashier, 3456), Imran Sheikh (cashier, 4567), Leela D'Souza (cashier, **inactive**). Names are invented; no real people. The sign-in screen shows the **selected** staff member's demo PIN.

**Scenario members** (mobile numbers in the clearly fictional `+91 90000 000xx` series; no SMS is ever sent):
| Member | Mobile | Setup (relative to now) | Expected state |
|---|---|---|---|
| Meera Iyer (A) | …00001 | enrolled today online, no birthday | 0 pts, Shore, onboarding panel |
| Tara Menon (B, C) | …00002 | single; purchases ₹6,490 (−10 mo), ₹3,990 (−8 mo), ₹9,990 (−6 mo), ₹4,500 (−4 mo), ₹5,500 (−2 mo), ₹6,930 (−3 wk); redeemed ₹250 off (500 pts, −5 mo, used) | Tide; qualifying ₹37,400; 1,438 pts; "₹2,600 to Golden Hour" |
| Kabir Malhotra (F + chain) | …00003 | single; purchases ₹4,000, ₹3,000, ₹4,000 within last 9 months (550 pts); birthday bonus 250 (−8 mo, rule-granted); goodwill credit +200 (−1 mo, by Arjun, "Service recovery — delayed alteration") | Shore; ₹11,000; **exactly 1,000 pts**; no applicable campaign for a ₹2,000 purchase |
| Zoya Siddiqui (D) | …00004 | Golden Hour (purchases totalling ₹46,000 in 12 mo); birthday = now + 5 days, set 400 days ago | Birthday window open: 250 pts granted + 15% voucher issued |
| Aditi Rao (E, G) | …00005 | married, spouse "Rohan", anniversary = now + 9 days (year 2019), set 300 days ago; Tide; last couple visit −45 days | Anniversary "unlocks on {now+2}"; couple visit eligible |
| Farhan Qureshi (I) | …00006 | purchases on the **1st of the month at 11:00**: ₹4,000 in month (now − 13 mo) → 200 pts, already expired (EXPIRE txn); ₹9,000 in month (now − 12 mo) → 450 pts expiring end of this month; ₹5,000 in month (now − 11 mo) → 250 pts expiring end of next month | Shore on every date (qualifying spend ≤ ₹14,000 whichever purchases fall inside the 365-day window); dashboard notice 450; Activity schedule shows 450 (this month, soon) and 250 (next month) |

**Supporting population (18):** fixed list of invented names; tier mix to total Shore 10 · Tide 8 · Golden Hour 4 · Endless Summer 2 (including scenario members); 2–14 purchases each across the last 15 months from a Trove-like price list (₹3,590–₹12,990); ~12 catalogue redemptions (mix used/unused/one expired/one cancelled-refunded); 6 couple visits; 4 manual adjustments; 1 voided purchase; birthdays/anniversaries spread so 3–5 fall in the next 30 days; 3 members enrolled in the last 30 days; 2 inactive (no activity in 180+ days). All staff actions attributed to seeded staff.

**Seed self-check (unit test):** asserts every scenario's expected state above at a fixed `now` and at the fixed dates listed in QA §3 (do not substitute other dates).

---

## 10. Authentication simulation

- **Member OTP:** `requestOtp(mobile)` → validates format → creates in-memory challenge with a random 6-digit code (crypto), expiry 5 min, resend after 30 s; returns `{ demoCode }` which the UI shows in the Demo notice. `verifyOtp(mobile, code)` → max 3 attempts then 60 s lock → success: existing member → member session; else returns `needsRegistration` with a short-lived verified token for `registerMember`.
- **Staff:** pick active staff → PIN compare → staff session. 3 failures → 30 s lock (in memory).
- **Session validation:** on every route guard and command, the referenced customer/staff must exist and (staff) be active; otherwise session cleared.
- **Messaging:** "Simulated sign-in for demonstration. No SMS is sent and this is not production security." on both sign-in screens and in the README.

---

## 11. Permissions

```ts
type Permission =
 | 'counter.use' | 'counter.ownHistory'
 | 'dashboard.view' | 'customers.view' | 'customers.edit' | 'customers.export'
 | 'points.adjust' | 'points.correct'            // correct = void purchase, cancel voucher
 | 'reports.view' | 'audit.view'
 | 'programme.manage' | 'rewards.manage' | 'staff.manage';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin:   [ /* all */ ],
  manager: ['counter.use','counter.ownHistory','dashboard.view','customers.view','customers.edit',
            'customers.export','points.adjust','points.correct','reports.view','audit.view'],
  cashier: ['counter.use','counter.ownHistory'],
};
```
Enforced at: route guard (`RequirePermission`), UI (`useCan` hides/disables), **command** (`runCommand`). Unit test the full matrix (every role × every permission × every command).

---

## 12. Error handling
- Commands never throw to the UI; they return `Result`. `useCommand` maps errors to field errors (VALIDATION), inline messages (domain codes) or toasts (unexpected).
- Error boundaries per shell + per lazy route; `console.error` in dev only.
- All user-facing messages come from `lib/errors.ts` (code → message), so wording is consistent.
- Defensive selectors: a missing reward/staff reference renders "Deleted reward"/"Former staff" rather than crashing.

---

## 13. Performance & build
- Lazy-load each portal (`features/customer|counter|admin`) and Recharts (admin only).
- Memoise selectors by data reference (`useMemo` on `data` + args); derive per-customer ledgers lazily and cache in a `WeakMap<AppData, Map<customerId, Ledger>>`.
- Images: bundled WebP, responsive `srcset` where multiple sizes exist.
- Production build must have zero TypeScript errors and zero ESLint errors.

## 14. Scripts (package.json)
`dev`, `build` (`tsc -b && vite build`), `preview`, `typecheck`, `lint`, `format`, `test` (`vitest run`), `test:watch`, `test:coverage`, `e2e` (`playwright test`), `e2e:ui`, `check` (`typecheck && lint && test && build`).
