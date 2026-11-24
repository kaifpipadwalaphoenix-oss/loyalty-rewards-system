# Trove Club — QA & Acceptance

Test layers: **unit** (Vitest, `tests/unit`), **integration** (service commands against an in-memory storage adapter), **component** (Testing Library, `tests/component`), **E2E** (Playwright, `tests/e2e`: full suite on **chromium desktop 1280×800 and chromium mobile 375×812**; **webkit** runs the scenario smoke subset A–J only), **a11y** (axe via Playwright), **visual** (browser sub-agent screenshots + checklist).

**Environment for every test run:** time zone pinned (`TZ=Asia/Kolkata` for Vitest, `timezoneId: 'Asia/Kolkata'` in Playwright); simulated delays switched off by opening the app with `?e2e=1` (the flag is stored in sessionStorage and sets all simulated delays to 0 — it works in the production preview build). Cross-portal E2E uses **several pages in one browser context** (shared localStorage, per-tab sessionStorage sessions).

**Highest-risk workflows (test first and hardest):** points calculation & ledger (BL), redemption & duplicate prevention, expiry, cross-interface consistency, permissions, storage recovery.

All date-dependent tests pin time (`vi.setSystemTime` / Playwright `page.clock`), default `2026-11-24T10:00:00+05:30`, plus boundary dates listed per case.

---

## 1. Functional test cases

| ID | Area | Steps | Expected |
|---|---|---|---|
| F-01 | Sign in existing | `/login` → 90000 00002 → Send code → enter shown code | Lands on `/club`, greeting "Tara" |
| F-02 | Mobile validation | Enter `12345`, `5876543210`, letters | Inline errors; Send code not processed |
| F-03 | OTP wrong ×3 | Enter wrong code 3 times | Attempts countdown, then 60 s lock message |
| F-04 | OTP expiry | Advance clock 5 min 1 s → verify | "Code expired" + Resend |
| F-05 | Resend cooldown | Click Resend before 30 s | Disabled with countdown; after 30 s new code |
| F-06 | Register minimal | New number → name only → terms → Skip celebrate | Member created, 0 pts, onboarding dashboard |
| F-07 | Register full | Fill birthday, Married, spouse first name, anniversary | Saved; profile shows them; no spouse mobile field exists |
| F-08 | Conditional fields | Married → fields shown; switch to Single | Fields hidden and values cleared (note shown) |
| F-09 | Terms required | Continue without terms | Error on terms checkbox |
| F-10 | Sign out | Header menu → Sign out | Session cleared; `/club` redirects to `/login` |
| F-11 | Redirect after login | Open `/club/rewards/:id` signed out → sign in | Returns to that reward |
| F-12 | Profile edit | Change name & email → Save | Toast; greeting updates; audit entry |
| F-13 | Occasion edit once | Edit birthday → save → try again | Second edit locked with "ask at the store" |
| F-14 | Unsaved guard | Edit profile → navigate away | Confirm dialog |
| F-15 | Catalogue filters | "Can redeem now" for Tara | Only rewards with cost ≤ 1,438 and eligible tier |
| F-16 | Redeem success (C) | Tara → ₹250 off → Redeem → Confirm | Voucher code shown; balance 938; vouchers tab lists it; activity −500 |
| F-17 | Redeem insufficient | Meera opens ₹250 off | "You need 500 more points"; no redemption possible |
| F-18 | Tier-restricted | Kabir opens Private styling (Tide+) | "Available from Tide" |
| F-19 | Out of stock | Set sarong stock to issued count → open | "Fully redeemed" |
| F-20 | Duplicate redemption | Double-click Confirm / replay requestId | Exactly one REDEEM txn and one voucher |
| F-21 | Staff sign-in | Choose Pooja → PIN 3456 | `/counter` |
| F-22 | Wrong PIN ×3 | | Lock 30 s |
| F-23 | Inactive staff | Leela not listed; forced session for Leela | Signed out with message |
| F-23b | Per-tab sessions | Tab 1 signed in as Nisha (admin), tab 2 as Pooja (cashier) | Each tab keeps its own identity after refresh; signing out in one leaves the other signed in |
| F-24 | Purchase (F) | Pooja → 90000 00003 → ₹2,000 → bill 5001 → Record | Breakdown base 100, total 100; receipt new balance 1,100 |
| F-25 | Duplicate bill | Record bill 5001 again (any member) | CONFLICT message naming original |
| F-25b | Re-enter voided bill | Void bill 5001 → record bill 5001 with corrected amount | Allowed; new purchase earns at current rules |
| F-26 | Below minimum | ₹499 | "Below the ₹500 minimum — no points"; purchase recorded, 0 pts, not qualifying |
| F-27 | Enrol at counter | Unknown number → Enrol (name + consent) | Member created (via counter), purchase continues |
| F-28 | Verify voucher | Verify code of Tara's new voucher → Mark as used | Status used; verify again → "Used on … by Pooja N." |
| F-29 | Staff-assisted redeem | Rewards tab → Redeem ₹600 off for member with ≥1,000 | Voucher created used; balance −1,000 |
| F-30 | Couple visit (G) | Aditi → Couple visit → tick presence → Record | +100; new balance; next eligible date shown |
| F-31 | Couple ineligible | Record again for Aditi | Blocked: "next eligible on {+30 d}" |
| F-32 | Couple requires married | Tara (single) | "Marital status Married needed on profile" |
| F-33 | Counter history | Pooja → My history (sheet) | Only Pooja's entries, totals correct |
| F-34 | Adjust points | Arjun → Tara → Credit 200, Goodwill, note | Balance +200; ADJUST_CREDIT; audit actor Arjun |
| F-35 | Adjust debit > balance | Debit 99,999 | Rejected: cannot exceed available |
| F-36 | Void purchase | Arjun voids Kabir's ₹2,000 (unspent) | −100 pts; qualifying spend −₹2,000; audit with reason |
| F-37 | Void, points already used | Void Tara's oldest purchase (₹6,490, its 320-pt lot fully consumed by her redemption) | Void succeeds; 0 points reversed; shortfall 320 shown on purchase and audit; qualifying spend −₹6,490 (Tara drops to ₹30,910, still Tide) |
| F-37b | Void, own lot partly used | Seeded population case with a partly consumed lot | Reverses only the lot's remaining points; shortfall recorded |
| F-38 | Cancel voucher | Cancel Tara's unused voucher | REDEEM_REFUND +500; voucher cancelled |
| F-39 | Earning config (H) | Nisha → ₹100 = 8 → Save | Review dialog shows 5 → 8; audit before/after |
| F-40 | Tier config | Golden Hour threshold 40,000 → 35,000 | Impact shows Tara moving up; after save Tara is Golden Hour |
| F-41 | Tier validation | Thresholds not increasing / first ≠ 0 | Inline errors, save blocked |
| F-42 | Expiry config | Switch to No expiry | Copy: applies to new points only; new purchase lot has no expiry; old lots unchanged |
| F-43 | Occasion rule | Deactivate birthday bonus rule | Zoya's card no longer lists the bonus as an upcoming/available benefit; points already granted remain in her history |
| F-44 | Campaign | Activate Double Points Weekend; record Sat purchase | Campaign bonus applied; only the best campaign |
| F-45 | Reward create | New reward → Save & activate | Appears in catalogue with correct preview |
| F-46 | Reward deactivate | Deactivate ₹250 off | Hidden from catalogue; existing vouchers valid |
| F-47 | Image upload | Upload 2 MB PNG / 500 KB JPG | Reject with size message / accept, resized, alt required |
| F-48 | Staff add | Add cashier → sign in as them | Works with new PIN |
| F-49 | Last admin | Deactivate only admin | Blocked with explanation |
| F-50 | CSV export | Activity filtered to Purchases, 30 d | File rows = table rows; headers; formula cells escaped |
| F-51 | Persistence | Make changes → reload | Changes persist |
| F-52 | Reset demo | Reset → confirm | All seed values restored (Tara 1,438, Kabir 1,000) |
| F-53 | Corrupt storage | Write `{bad json` to key → reload | Recovered banner; backup key present; seed loaded |
| F-54 | Storage unavailable | Stub `localStorage.setItem` to throw | Memory-only banner; app usable |
| F-55 | 404 / 403 | Unknown route; cashier → `/admin/staff` | NotFound; AccessDenied + audit |

---

## 2. Business-logic (unit) cases

| ID | Case | Expected |
|---|---|---|
| BL-01 | ₹2,000, ₹100=5, down, Shore | 100 |
| BL-02 | ₹2,099.99 | 100 (floor units) |
| BL-03 | ₹2,050, rounding nearest | 105 (units 20.5 → 21) |
| BL-04 | ₹499.99, min ₹500 | 0, not eligible |
| BL-05 | ₹500.00 exactly | 25, eligible |
| BL-06 | Tide +10% on base 345 | tier bonus 34 |
| BL-07 | 2× multiplier on base 100 | campaign bonus 100 |
| BL-08 | 1.5× on base 245 | floor(245×5/10)=122 |
| BL-09 | Two campaigns (2× → +100 and flat +150) on base 100 | best = flat (+150); total 250 |
| BL-09b | Two campaigns tie | earliest `startsAt`, then name |
| BL-10 | Campaign outside dates / wrong weekday / wrong tier / below min | not applied |
| BL-11 | Purchase crossing threshold | earns at previous tier |
| BL-12 | Config change after purchase | historical txn unchanged; snapshot preserved |
| BL-13 | Balance = sum of points | holds after every command |
| BL-14 | Debit FIFO by earliest expiry | earliest lot consumed first |
| BL-15 | Non-expiring lots consumed last | |
| BL-16 | Debit after a lot's expiry | expired lot not consumed |
| BL-17 | Expiry sweep idempotent | 2 runs → 1 EXPIRE per lot |
| BL-18 | EXPIRE `at` = lot expiry instant | not sweep time |
| BL-19 | Expiry date earned 14 Mar 2026, 12 m | 31 Mar 2027 23:59:59.999 local |
| BL-20 | Earned 31 Jan, 1 month | 28/29 Feb end of month |
| BL-21 | Expiring soon on 1 Dec for 31 Dec | included (calendar compare) |
| BL-22 | Policy none | credits have null expiry |
| BL-23 | Debit making balance negative | rejected |
| BL-23a | Void with own lot fully consumed | pointsReversed 0, shortfall = earned, spend excluded |
| BL-23b | Void after own lot expired | pointsReversed 0 (no double removal), shortfall = earned |
| BL-23c | Void never consumes other lots | other lots' remaining unchanged |
| BL-24 | Qualifying spend rolling 12 m | excludes > 365 d, voided, ineligible |
| BL-25 | Spend exactly = threshold | new tier |
| BL-26 | Inactive tier skipped | next lower active tier |
| BL-27 | Tier impact counts | correct up/down counts |
| BL-28 | Eligibility order | first failing reason per §6.6 |
| BL-29 | Stock remaining | limit − issued (cancelled not counted) |
| BL-30 | Per-member limit | blocks at limit |
| BL-31 | Birthday 29 Feb, non-leap year | occurrence 28 Feb |
| BL-32 | Occasion window | unlock 7 d before, valid 30 d |
| BL-33 | Date on file < 30 d | no grant |
| BL-34 | Grant idempotency key uses the occurrence year | one grant per rule/member/occurrence |
| BL-34a | Birthday 2 Jan, swept 31 Dec and again 1 Jan | exactly one grant (key year = 2027 both times) |
| BL-34b | First sweep 3 days **after** the birthday, inside validity | grant still issued (previous occurrence evaluated) |
| BL-35 | Anniversary requires Married | |
| BL-36 | Tier-restricted occasion rule | only eligible tiers |
| BL-37 | Couple cooldown 30 calendar days | visit 1 Nov: blocked 30 Nov, allowed 1 Dec |
| BL-38 | Voucher code alphabet/format | `^TC-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$` |
| BL-39 | Code normalisation | `tc 7k3m q9px` → `TC-7K3M-Q9PX` |
| BL-40 | Permission matrix | every role × permission per Spec §4.13 |
| BL-41 | `parseRupeesToPaise` | "4,990.5" → 499050; "-1", "1.234", "abc" rejected |
| BL-42 | Ledger property test | 200 random command sequences (fixed PRNG seed): invariants hold |
| BL-43 | Expiry schedule vs notice | notice only within window; schedule lists next 3 dates incl. beyond window |
| BL-44 | Stock derived | limit − non-cancelled vouchers; no stored counter |

---

## 3. Seed self-check
At fixed dates `2026-11-24`, `2026-12-01`, `2026-12-31`, `2027-02-28`, `2028-02-29`: scenario members match Tech Architecture §9 (Meera 0 / Shore; Tara Tide, single, ₹37,400, 1,438; Kabir Shore, ₹11,000, 1,000; Zoya grants present; Aditi anniversary unlocks in 2 days; Farhan Shore, 450 expiring this month (notice + schedule), 250 end of next month (schedule), 200 expired). Every scenario-member purchase has `campaignBonus = 0`. Tier mix 10/8/4/2. Seed IDs and voucher codes are identical across two `buildSeed` calls with the same `now`. Data passes schema validation.

---

## 4. Cross-interface consistency tests (E2E, two pages in one context)

| ID | Action (page 1) | Verify (page 2 and others) |
|---|---|---|
| X-01 | Counter records ₹2,000 for Kabir | Customer dashboard 1,100 without reload; activity shows purchase; admin customer detail 1,100; dashboard Points issued +100 |
| X-02 | Kabir redeems 500-pt reward | Balance 600 everywhere; admin redemptions +1; popular rewards updated; counter member panel shows voucher |
| X-03 | Admin changes ₹100 = 5 → 8 | Counter breakdown for ₹2,000 shows 160 before recording; membership page copy says 8 pts per ₹100 |
| X-04 | Admin deactivates reward | Customer catalogue hides it; open detail shows unavailable; counter redeem list hides it |
| X-05 | Manager adjusts +200 | Customer dashboard + activity update; bell unread count +1 with "Points adjusted" |
| X-06 | Admin lowers Golden Hour threshold | Tara's card/tier progress recalculates; admin tier distribution changes |
| X-07 | Counter couple visit for Aditi | Customer activity shows bonus; admin audit entry |
| X-08 | Manager cancels a voucher | Customer voucher status cancelled; points refunded |
| X-09 | Admin (tab 1) deactivates Imran (cashier, signed in on tab 2) | Tab 2 is signed out with a message as soon as the data change arrives |
| X-10 | Reset demo in one tab | Other tabs reload to seed state; tabs signed in as seeded personas stay signed in |

---

## 5. Accessibility checks
- axe (wcag2a, wcag2aa, wcag21aa) on every route, both viewports: zero serious/critical.
- Keyboard: complete scenarios A, C, F, H with keyboard only; visible focus everywhere; no traps except intended dialog traps; Esc closes dialogs (except while processing); focus returns to trigger.
- Screen-reader semantics: one h1 per page; landmarks; labelled nav; form errors announced (`aria-describedby`, `aria-invalid`); live regions for OTP sent, earn breakdown, toasts.
- Contrast: tokens verified (Design System §1); spot-check text over images (hero text on a scrim or beside images, not over busy areas).
- Targets: ≥ 44 px (≥ 48/56 at counter) — measured in a Playwright check over all buttons/links on key pages.
- Reduced motion: no count-up/transform animations under `prefers-reduced-motion`.
- Zoom 200% and 320 px reflow: no lost content.

---

## 6. Visual QA

### 6.1 Responsive matrix (screenshot every cell)
**All pages at 375, 768 and 1280.** Key pages (C1 Landing, C3 Dashboard, C6 Reward detail, S2 Counter, A1 Dashboard, A2 Customers, A6 Programme) additionally at **320, 1024, 1440 and 1920**. Pages: C1–C8, S1–S2 (+ history sheet), A1–A8, AccessDenied, NotFound, DemoPanel open, NotificationsSheet, key dialogs (Redeem confirm, Adjust points, Void purchase, Review changes), empty states (Meera dashboard, no vouchers, no search results).

### 6.2 Checklist (each page)
- [ ] Looks like Trove: Playfair headings, Work Sans UI, square controls, blush/tide palette — not a default shadcn/grey-card dashboard.
- [ ] Clear single primary action; hierarchy obvious within 3 seconds.
- [ ] Spacing uses the scale; consistent section rhythm; no cramped or awkward empty areas.
- [ ] Alignment: left edges align on the grid; numeric columns right-aligned.
- [ ] No text overflow/truncation without ellipsis+title; long names (30 chars) tested.
- [ ] No horizontal page scroll; tables use card mode on mobile.
- [ ] Images load with correct aspect ratio; fallbacks styled; alt present.
- [ ] Navigation works at every width (bottom tabs, drawer, sidebar); active state visible.
- [ ] Interaction states visible: hover, focus, active, disabled, loading.
- [ ] Empty, loading and error states designed (not blank).
- [ ] Copy is warm, specific, consistent (₹ and pts formatting; en-IN dates).
- [ ] DemoBar present but unobtrusive; no element hidden behind sticky bars.
- [ ] Charts readable, labelled, with summaries.
- [ ] Customer and admin feel like one product.

---

## 7. Security & honesty review (demo-grade)
- Sign-in screens, README and DemoBar state that authentication is simulated and data is local.
- Permission matrix enforced in commands (unit tests BL-40 + command denial tests), not only hidden UI.
- No `dangerouslySetInnerHTML`; user text rendered as text. `redirect` param only accepts same-origin relative paths.
- CSV export guards formula injection on **text** columns only (prefix `'` to text cells starting with `=`, `+`, `-`, `@`); numeric columns (points, ₹) are written as plain numbers so negatives stay intact.
- Uploaded images: type + size validated, re-encoded through canvas (strips metadata/scripts).
- No secrets, API keys, analytics or network calls (verify Network tab is quiet after load except local assets).
- Demo PINs and mobile numbers are fictional; no real customer data.

---

## 8. Final acceptance criteria
1. Scenarios A–J pass in E2E on chromium desktop and mobile; the webkit smoke subset passes.
2. Cross-interface tests X-01…X-10 pass.
3. Unit + integration suites pass; domain coverage ≥ 90%.
4. `npm run check` green; production build has no warnings that indicate errors.
5. axe: zero serious/critical; keyboard walkthroughs completed.
6. Visual QA matrix captured; checklist passes (exceptions documented).
7. Every FR in the Product Specification is Done with evidence or explicitly listed as Not done with reason.
8. Every visible control does something meaningful (crawl test: each button/link on every page either navigates, opens UI, or performs a command; none are no-ops).
9. Reset Demo Data restores the exact seed.
10. No git commits/pushes made; no network calls to external services at runtime.
11. `docs/IMPLEMENTATION_REPORT.md` complete (built, verified, not verified, deviations, removed files, limitations).
