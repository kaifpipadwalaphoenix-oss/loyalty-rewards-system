# Trove Club — Implementation Plan (for Google Antigravity · Gemini 3.8 Flash, High thinking)

This is the execution blueprint. Read the other documents first, in this order:
1. `TROVE_CLUB_PRODUCT_SPECIFICATION.md`: what and why (business rules BR-1…BR-53, FR ids, scenarios A–J).
2. `TROVE_CLUB_TECHNICAL_ARCHITECTURE.md`: how (stack, structure, data model, algorithms, commands, persistence, seed).
3. `TROVE_CLUB_DESIGN_SYSTEM.md`: tokens and component rules.
4. `TROVE_CLUB_SCREEN_AND_COMPONENT_INVENTORY.md`: every screen and component.
5. `TROVE_CLUB_QA_AND_ACCEPTANCE.md`: test cases and final acceptance.
6. `TROVE_CLUB_BRAND_AND_UX_RESEARCH.md`: the brand grounding (read it for design intent).

**If documents conflict:** the Product Specification wins on behaviour, the Technical Architecture on structure, and the Design System on visuals. Record each conflict and how you resolved it in `docs/IMPLEMENTATION_REPORT.md`.

---

## 0. Ground rules for the implementing agent

### 0.1 Safety (non-negotiable)
- **DO NOT COMMIT. DO NOT PUSH.** Do not run `git commit`, `push`, `merge`, `rebase`, `reset`, `stash`, `checkout -- <path>` or `clean`, and do not create branches or tags. Read-only git (`status`, `diff`, `log`, `rev-parse`) is fine. The working tree already shows deletions of files from an older prototype: leave them as they are.
- **Protect `docs/`.** It is untracked, so git cannot restore it. Never run a scaffolder in the repo root that can delete existing files: no `--overwrite`, and never choose "Remove existing files and continue". Scaffold into a temporary subfolder and move the files up (Phase 0). Never delete or rewrite files under `docs/` except your own report and QA screenshots.
- Do not connect to the live Shopify store or to trovelabel.com APIs. Do not hotlink, scrape or download images from trovelabel.com.
- Do not access or modify production systems. Do not use real customer data: demo names are invented and demo mobile numbers use the `+91 90000 000xx` series.
- No paid services, no API keys, no backend, no database server, no real OTP or SMS, and no payments.
- Never describe a simulated feature as a real integration, whether in UI copy, the README or the report.

### 0.2 Dependencies
- Install the packages listed in Technical Architecture §1.
- You may also install **implied dependencies**, meaning packages those tools add or require in their documented setup (for example `radix-ui`/`@radix-ui/*` and `tw-animate-css` from shadcn, `@types/*`, and Playwright browsers). Record them in the report without stopping.
- Any **other** new runtime library needs the user's approval. Stop and ask (see 0.3).

### 0.3 Autonomy
- Work through the phases in order. After each phase:
  1. Run the phase's tests and `npm run check`, then fix any failures.
  2. Re-run the full test suite.
  3. Continue to the next phase **without waiting for approval**.
- You may create, edit, move and delete files in the workspace (apart from the `docs/` restriction in 0.1).
- **Stop and ask the user only when:**
  - a business rule in the Product Specification would have to change;
  - you need a runtime library that is neither listed nor implied;
  - the work would need network services, credentials or real data;
  - the same failure persists after 3 genuine fix attempts.
- Do not make product or architecture decisions without recording them. Small implementation choices (naming, internal helpers) are yours to make. Record anything a reviewer would want to know under "Decisions" in the report.
- **A phase tests only what exists by that phase.** Every test that crosses portals (customer ↔ counter ↔ admin) belongs to Phase 15. Do not write a test in one phase that needs a screen from a later phase.

### 0.4 Definition of "phase done"
A phase is done when all of the following hold:
1. All of the phase's files exist and are wired in (routes, exports).
2. `npm run check` passes: typecheck, lint, unit/integration/component tests and build.
3. Each acceptance criterion has been checked, with evidence: a test name, command output or browser check.
4. Earlier phases' tests still pass.
5. For UI phases, the browser check is done:
   - checked at 375 px and 1280 px, using `?e2e=1` to switch off simulated delays;
   - screenshots saved to `docs/qa/screenshots/phase-XX-*.png`;
   - no console errors.
6. A short entry is appended to `docs/IMPLEMENTATION_REPORT.md`: what was built, evidence, decisions and known gaps.

### 0.5 Orphaned-file cleanup rule (Phase 17, and whenever you replace a file)
- Find the candidate orphans: files that nothing imports or references.
- Before deleting a candidate, check every place it could be referenced:
  - imports (grep for the path and the file stem);
  - router entries;
  - `index.html`;
  - CSS `@import` and `url()`;
  - `public/` references in code and CSS;
  - config files (vite, tsconfig paths, eslint, playwright);
  - tests;
  - links in the docs.
- Delete **only** files proven to be unused. Never delete a file because it "looks old" or is unfamiliar, and never delete anything in `docs/`.
- List every removed file, with the evidence, in the report.

---

## 1. Skill and sub-agent orchestration in Antigravity

Use what the workspace actually provides. Do not invent tools.

1. **Record your capabilities first.** At the start, list what Antigravity gives you in the report:
   - workspace rules and workflows (`.agent/`, `GEMINI.md`) if they exist;
   - installed **Skills** (`SKILL.md` packages);
   - the **browser sub-agent**;
   - the Agent Manager (parallel agents).
2. **Map responsibilities.** Assign each responsibility to whatever exists. Where no matching skill exists, use the checklist given here:

| Responsibility | Use | Checklist if no skill exists |
|---|---|---|
| Product architecture | Main agent (planning mode) | Tech Architecture §2–7 |
| Frontend implementation | Main agent | Design System + Screen Inventory |
| Domain logic | Main agent, test-first | Tech Architecture §6, QA §2 |
| UX/UI review | Browser sub-agent, after each UI phase | QA §6 Visual QA checklist |
| Functional testing | Main agent (Vitest/Playwright) | QA §1–4 |
| Accessibility review | Browser sub-agent + axe (Playwright) | QA §5 |
| Security/honesty review | Main agent, Phase 17 | QA §7 |
| Browser visual testing | Browser sub-agent | QA §6 matrix |

3. **Parallelism.** The default is **one implementing agent working through the phases in order**, because the phases share `src/components`, `src/data` and `src/services`.
   - An optional parallel window opens once Phase 4 passes. Three agents may then build three tracks at the same time:
     - customer: Phases 5–8, files under `src/features/customer/**`;
     - counter: Phase 9, files under `src/features/counter/**`;
     - admin: Phases 10–14, files under `src/features/admin/**`.
   - **Conditions for the parallel window:**
     - The shared folders are frozen and owned by one integration agent: `components/*`, `data/`, `services/`, `domain/`, `styles/`, `app/`, `hooks/`.
     - A feature agent that needs a change in a shared folder writes a request in the report instead of editing the file.
     - The integration agent runs the full suite after each feature phase.
     - Two agents never edit the same file.
4. **Handoffs.** Every handoff, between agents or between phases, must include:
   - the report entry: files changed, commands run, results and open issues;
   - a passing `npm run check`;
   - the list of requested changes to shared components.

---

## 2. Phase overview

| # | Phase | Depends on | Track |
|---|---|---|---|
| 0 | Reconnaissance and scaffold | — | core |
| 1 | Design system foundation and imagery | 0 | core |
| 2 | Domain engine (pure, test-first) | 0 | core (can run alongside 1; separate folders) |
| 3 | Data layer: schema, store, persistence, seed, commands | 2 | core |
| 4 | Shells, routing, guards, sessions, demo tooling | 1, 3 | core |
| 5 | Customer auth and registration | 4 | customer |
| 6 | Customer dashboard, membership, notifications | 5 | customer |
| 7 | Rewards, redemption, vouchers | 6 | customer |
| 8 | Activity and profile | 6 | customer |
| 9 | Counter: staff sign-in, purchase, rewards, couple visit, history | 4 | counter |
| 10 | Admin dashboard | 4 | admin |
| 11 | Customer management and points corrections | 10 | admin |
| 12 | Programme configuration (including campaigns and occasions) | 10 | admin |
| 13 | Reward management | 10 | admin |
| 14 | Staff management, activity and audit, CSV | 10 | admin |
| 15 | Cross-interface integration and scenario E2E | 5–14 | core |
| 16 | Visual QA, responsive and accessibility refinement | 15 | core |
| 17 | Final acceptance, security pass, cleanup, report | 16 | core |

Where the brief's suggested phases went:
- birthday and anniversary programme → Phases 2 and 3 (engine), 6 (customer view) and 12 (configuration);
- tiers → Phases 2, 6 and 12;
- points engine → Phases 2 and 3;
- staff roles → Phases 3 (commands), 4 (guards) and 14 (management);
- reports → Phase 14.

Each phase below uses the same template.

---

## Phase 0: Reconnaissance and scaffold
- **Objective:** a clean project skeleton that builds and runs tests, with no risk to `docs/`.
- **Features:** Vite + React + TS app; Tailwind v4; shadcn initialised; ESLint and Prettier; Vitest; Playwright; folder structure; npm scripts; README; report file.
- **Screens:** a placeholder page titled "Trove Club".
- **Components:** none yet (shadcn primitives added in step 5).
- **Files/modules:**
  - root config: `package.json`, `tsconfig*.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `eslint.config.js`, `.prettierrc`, `components.json`, `index.html`;
  - source: `src/main.tsx`, `src/app/App.tsx`, `src/styles/{globals,tokens}.css`, the empty folder tree from Tech Arch §3;
  - tests: `tests/{unit,component,e2e}/smoke.*`;
  - docs and other: `README.md`, `public/_redirects`, `docs/IMPLEMENTATION_REPORT.md`.
- **Data entities:** none.
- **Dependencies:** none.
- **Steps:**
  1. **Inspect:**
     - Run `git status`, `git rev-parse HEAD` and list the files.
     - Record the starting HEAD in the report.
     - Expect only `.git` and `docs/`.
  2. **Scaffold safely:**
     - Run `npm create vite@latest .scaffold-tmp -- --template react-ts`.
     - Move its contents (including dotfiles) into the repo root, **skipping any name that already exists**.
     - Delete `.scaffold-tmp`.
     - Confirm that `docs/` is untouched: compare its file list before and after.
  3. **Configure TypeScript:** `strict`, `noUncheckedIndexedAccess`, and the `@/*` path alias in both tsconfig and vite.
  4. **Install dependencies:** the runtime and dev dependencies from Tech Arch §1, plus the implied ones.
  5. **Tailwind and shadcn:**
     - Set up Tailwind v4 via `@tailwindcss/vite`.
     - Run `shadcn init` non-interactively, with CSS variables and the `@/components` alias.
     - Add these primitives: button, input, label, textarea, select, checkbox, radio-group, switch, tabs, dialog, alert-dialog, sheet, dropdown-menu, popover, tooltip, accordion, badge, skeleton, separator, sonner.
  6. **Testing and lint:**
     - Vitest: jsdom, setup file with jest-dom, `TZ=Asia/Kolkata` set in the test script/env.
     - Playwright projects: `chromium-desktop` (1280×800), `chromium-mobile` (375×812) and a `webkit-smoke` project (`grep: @smoke`). Use `timezoneId: 'Asia/Kolkata'`, and set `webServer` to `npm run build && npm run preview`.
     - ESLint flat config.
  7. **Scripts:** add the scripts from Tech Arch §14 and create the folder tree.
  8. **README:** how to run the app, the demo accounts, and a clear statement that this is a prototype with simulated sign-in and local data.
  9. **Report:** create `docs/IMPLEMENTATION_REPORT.md` with these sections: Environment, Capabilities found, Phase log, Decisions, Deviations, Dependencies added, Removed files, Known limitations.
- **Expected result:** `npm run check` passes, `npm run dev` shows the placeholder, and `docs/` is intact.
- **Testing:** a smoke unit test, a smoke component test, and a Playwright smoke test that checks the title is "Trove Club" and is tagged `@smoke`.
- **Acceptance criteria:**
  - All scripts exist and pass.
  - The `docs/` file list is unchanged.
  - The folder tree matches Tech Arch §3.
  - HEAD is recorded in the report.
- **Risks:**
  - An interactive CLI hangs → use flags or env for non-interactive mode.
  - The shadcn version doesn't match Tailwind v4 → follow the current shadcn Tailwind v4 docs.
  - Overwriting files in the root → use the temporary-folder method above.

## Phase 1: Design system foundation and imagery
- **Objective:** tokens, fonts, restyled primitives and imagery, so that every later screen looks like Trove by default.
- **Features:**
  - tokens (Design System §1–3) and the `@theme` mapping;
  - self-hosted fonts;
  - base styles: focus ring, reduced motion, selection;
  - restyled shadcn primitives;
  - brand, form, data and feedback components;
  - the imagery manifest;
  - the style-guide page.
- **Screens:** `/dev/design-system`. It ships in every build but is not linked from any navigation.
- **Components:**
  - **Brand:** `Wordmark`, `WaveLine`, `TierChip`, `PointsValue`, `Money`, `MembershipCard` (props only), `RewardCard` (props only), `RewardImage` (with fallback).
  - **Buttons:** `Button` in variants primary, secondary, brand, celebrate, ghost and danger; sizes sm–xl; a loading state.
  - **Forms:** `Field`, `PhoneInput`, `CurrencyInput`, `OtpInput`, `DayMonthPicker`, `PinPad`.
  - **Feedback and layout:** `Chip`, `EmptyState`, `ErrorState`, `Skeleton`, `Panel`, `PageHeader`, `Section`, `KpiBand`, `KpiItem`, `DataTable` (structure, sorting, pagination and mobile card mode, using props only).
- **Files/modules:**
  - `src/styles/{tokens,globals}.css`;
  - `src/components/{ui,brand,forms,data}/*`;
  - `src/assets/brand/{images.ts,wave-line.svg}`;
  - `public/images/{brand,interim}/`;
  - `src/features/dev/DesignSystemPage.tsx`;
  - `src/lib/{format,cn}.ts`;
  - tests under `tests/unit/lib/format.test.ts` and `tests/component/forms/*`.
- **Data entities:** none; components take props.
- **Dependencies:** Phase 0.
- **Steps:**
  1. Write the tokens exactly as specified and map them into the Tailwind theme.
  2. Import the fonts with `font-display: swap`.
  3. Restyle every primitive to the tokens: square radius, removing the default zinc/rounded look.
  4. Build the brand, form and data components.
  5. **Imagery manifest.** In `images.ts`, define named slots: `landingHero`, `authSide`, `dashboardBand`, `reward.*` (one per seed reward) and `emptyState`. Give each slot `src`, `alt`, an optional `credit`, and a designed fallback (tide/blush gradient + wave line). Fill `src` from the first available source:
     1. images the user has placed in `public/images/brand/` (supplied by Trove);
     2. licence-cleared photography (for example under the Unsplash Licence) of resort, beach, linen and swimwear themes with no visible third-party brands. Download each image once into `public/images/interim/`, convert it to WebP at ≤ 200 KB, and credit it in `public/images/interim/ATTRIBUTION.md`;
     3. the designed fallback.

     **Never use trovelabel.com.** Record the source you used in the report.
  6. Build the style-guide page showing:
     - every token;
     - the type scale;
     - every button variant in each state (default, hover, focus, disabled, loading);
     - inputs in default, focus, error and disabled states;
     - chips;
     - the four membership-card tier accents;
     - empty, error and skeleton states;
     - `DataTable` in both table and card mode.
- **Expected result:** the style guide renders every state and looks unmistakably Trove: Playfair headings, square controls, blush and tide palette.
- **Testing:**
  - **Formatter unit tests:** `₹1,00,000`, `1,240 pts`, `24 Nov 2026`.
  - **Component tests:**
    - `PhoneInput` formatting and numeric filtering;
    - `CurrencyInput` converting to paise;
    - `OtpInput` paste and auto-advance;
    - `DayMonthPicker` blocking 31 Apr;
    - `DataTable` sort and card mode.
  - **Playwright axe check** on `/dev/design-system`: zero serious or critical violations.
- **Acceptance criteria:**
  - `grep -rE "#[0-9a-fA-F]{3,8}\b" src/components src/features` finds nothing except SVG assets.
  - Every interactive primitive has a visible focus ring.
  - Targets are ≥ 44 px.
  - Every image slot renders, either an image or the fallback.
- **Risks:**
  - The UI drifts into the default shadcn look → check each component against Design System §4.
  - Fonts flash on load → preload the two main weights.
  - Interim photos are off-brand → pick warm, sunlit, resort scenes and avoid generic office stock.

## Phase 2: Domain engine (pure, test-first)
- **Objective:** every business rule implemented and proven as a pure function.
- **Features:**
  - money parsing and formatting;
  - earning, with rounding, minimum purchase, tier bonus and best campaign;
  - ledger lots, FIFO consumption and expiry;
  - expiry schedule;
  - tiers, progress and impact;
  - reward eligibility and derived stock;
  - occasions, evaluating both the previous and the next occurrence;
  - couple-visit eligibility;
  - voucher codes;
  - the permission matrix;
  - date helpers.
- **Screens:** none.
- **Components:** none.
- **Files/modules:**
  - `src/domain/{types,money,earning,ledger,expiry,tiers,rewards,occasions,campaigns,couple,permissions,codes,dates}.ts`;
  - `src/lib/{clock,ids,result,errors}.ts`;
  - `src/data/schema.ts` (schemas first; domain types use `z.infer`);
  - tests under `tests/unit/domain/*`.
- **Data entities:** type definitions for all of them.
- **Dependencies:** Phase 0. It can run alongside Phase 1.
- **Steps:**
  1. Write `schema.ts`.
  2. For each module in this order, **write the tests first** (QA §2, BL-01…BL-44), then implement: money → earning → expiry + ledger (including the void rules, BR-47) → tiers → rewards → occasions → campaigns → couple → codes → permissions → dates.
- **Expected result:** domain coverage ≥ 90% of lines and branches.
- **Testing:**
  - QA §2: every BL case.
  - Property tests for the ledger invariants, using a fixed PRNG seed and 200 sequences.
  - Date tests pinned with `vi.setSystemTime`, covering month ends, 29 Feb and year boundaries.
- **Acceptance criteria:**
  - **Worked examples match exactly:** ₹2,000 → 100; Tide with a 2× campaign → 210; ₹499.99 → 0.
  - BL-09 picks the flat +150 campaign.
  - Voiding never consumes other lots.
  - A birthday on 2 Jan is granted exactly once across the year boundary.
- **Risks:**
  - Timezone off-by-one errors → use date-fns in local time, with TZ pinned.
  - Floating-point creep → grep for `parseFloat` and for `/ 100` on money outside `money.ts`.

## Phase 3: Data layer: schema, store, persistence, seed, commands
- **Objective:** one shared, validated, persisted data document, with atomic, permission-checked commands and a deterministic seed.
- **Features:**
  - localStorage adapter for the `troveclub.data` and `troveclub.images` keys;
  - per-tab sessions in sessionStorage;
  - migrations;
  - corruption backup and memory-only fallback;
  - Zustand store with `commit()`: re-read before write, sweeps, validation;
  - cross-tab reload and session re-validation;
  - command runner with idempotency;
  - every service command from Tech Arch §7;
  - sweeps;
  - seed builder;
  - selectors.
- **Screens:** none (headless).
- **Components:** none (hooks only).
- **Files/modules:**
  - `src/data/{schema,migrations,storage,store,sessions}.ts`;
  - `src/data/seed/*`;
  - `src/data/selectors/{member,rewards,counter,dashboard,activity,customers}.ts`;
  - `src/services/*`;
  - `src/hooks/{useAppData,useCommand,useCan,useMemberSession,useStaffSession}.ts`;
  - tests under `tests/unit/{data,services}/*`.
- **Data entities:** all of them (Tech Arch §5).
- **Dependencies:** Phase 2.
- **Steps:**
  1. Storage adapter: availability probe, read → parse → migrate → validate, quota handling, backup.
  2. Store with status values `loading`, `ready`, `memory-only` and `recovered`; run the bootstrap sweeps via `commit()`.
  3. Sessions.
  4. The `runCommand` wrapper.
  5. Every command, each writing audit entries and notifications.
  6. Sweeps.
  7. `buildSeed(now)` per Tech Arch §9:
     - fixed IDs;
     - seeded voucher codes;
     - campaign dates relative to `now`;
     - Farhan's purchases dated the 1st of the month.
  8. Memoised selectors.
- **Expected result:** the whole programme works headlessly through commands.
- **Testing** (integration tests on an in-memory adapter):
  - the happy path of every command;
  - the permission matrix, denying each command to each disallowed role;
  - validation errors;
  - idempotent replay: one transaction per `requestId`;
  - duplicate bill, and re-entering a voided bill;
  - insufficient points;
  - each void variant;
  - cancel with refund;
  - the last-admin guard;
  - corrupted storage recovery;
  - memory-only mode;
  - migration from a fake v0 fixture;
  - a simulated `storage` event reloading the store and re-validating sessions;
  - seed self-check at the five fixed dates (QA §3), including determinism: two builds produce identical data.
- **Acceptance criteria:**
  - The canonical chain works: Kabir 1,000 → purchase ₹2,000 → 1,100 → redeem 500 → 600. The dashboard selector shows +100 issued and 500 redeemed.
  - Every scenario state matches Tech Arch §9.
  - Every scenario-member purchase has `campaignBonus = 0`.
- **Risks:**
  - Stale writes across tabs → `commit()` always re-reads before writing.
  - Slow derivation → memoise per data reference.
  - The idempotency map grows → prune entries older than 24 h on commit.

## Phase 4: Shells, routing, guards, sessions, demo tooling
- **Objective:** a navigable frame for all three portals, with real protection and presentation tools.
- **Features:**
  - router with lazy portals;
  - guards that redirect or return 403, auditing once per navigation;
  - responsive shells with a skip link;
  - DemoBar, DemoPanel (persona switcher, presenter guide, reset) and StorageBanner;
  - error boundaries;
  - NotFound and AccessDenied pages;
  - the `?e2e=1` flag, which switches simulated delays to 0.
- **Screens:** `CustomerShell`, `CounterShell` and `AdminShell` (each with placeholder content), NotFound, AccessDenied, DemoPanel.
- **Components:** `SiteHeader`, `BottomTabBar`, `SiteFooter`, `AdminSidebar`, `AdminTopBar`, `CounterTopBar`, `DemoBar`, `DemoPanel`, `PresenterGuide`, `StorageBanner`, `ErrorBoundary`, `NotFound`, `AccessDenied`, `RequireMember`, `RequireStaff`, `RequirePermission`.
- **Files/modules:**
  - `src/app/{App,router,guards}.tsx`;
  - `src/components/{layout,system}/*`;
  - `src/features/demo/*`;
  - `src/services/demo.ts`;
  - `src/lib/e2e.ts`;
  - `src/hooks/{useMediaQuery,useReducedMotion}.ts`;
  - tests under `tests/component/app/*` and `tests/e2e/shell.spec.ts`.
- **Data entities:** sessions, AuditEntry (ACCESS_DENIED), and all data for reset.
- **Dependencies:** Phases 1 and 3.
- **Steps:**
  1. Build the router following Tech Arch §4.
  2. Add the guards.
  3. Build the shells, using the CSS variables for bar heights.
  4. Add the DemoBar and DemoPanel:
     - Persona switching writes this tab's session and navigates to the persona's home portal.
     - The presenter guide lists scenarios A–J with "Start" deep links.
     - Reset sits behind an AlertDialog.
  5. Add the storage banner, error boundaries and the e2e flag.
- **Expected result:**
  - Every route resolves.
  - Protected routes redirect.
  - A cashier who opens `/admin/programme` sees AccessDenied, and exactly one audit entry is written.
- **Testing:**
  - **Component tests for the guards:** no session; wrong role; allowed role; the audit entry written only once.
  - **E2E shell checks:** navigation for each role; Scenario J; reset restoring the seed (change a value, reset, then check the original value is back); per-tab sessions (F-23b).
- **Acceptance criteria:**
  - Each shell can be navigated by keyboard alone.
  - The bottom tab bar and the admin drawer work at 375 px.
  - Sticky bars never hide content.
- **Risks:**
  - The sticky bars overlap one another → use height variables and `scroll-padding-top`.

## Phase 5: Customer auth and registration
- **Objective:** a realistic, honest sign-in with mobile number and simulated OTP, plus a minimal registration.
- **Features:**
  - OTP challenge with attempts, expiry, resend cooldown and lockout;
  - step machine: mobile → verify → about → celebrate → welcome;
  - returning members skip to `/club` or to the `redirect` target;
  - conditional spouse and anniversary fields;
  - registration;
  - demo accounts list;
  - sign-out;
  - a basic landing page (C1, polished in Phase 6).
- **Screens:** C2 Auth; basic C1.
- **Components:** `AuthLayout`, `StepIndicator`, `DemoOtpNotice`, `DemoAccountsList`, `AboutYouForm`, `CelebrateForm`, `WelcomeReveal`, `TermsDialog`, `AccountMenu`.
- **Files/modules:**
  - `src/features/customer/auth/*`;
  - `src/features/customer/landing/Landing.tsx` (basic);
  - `src/services/auth.ts` (OTP pieces);
  - tests under `tests/component/customer/auth/*` and `tests/e2e/customer-auth.spec.ts`.
- **Data entities:** Customer, AuditEntry, member session.
- **Dependencies:** Phase 4.
- **Steps:**
  1. Build the auth service.
  2. Build the step machine.
  3. Build the forms with RHF and Zod, using the spec's validation rules. When the status changes away from Married, clear the spouse and anniversary values and show a note.
  4. Wire up `registerMember`, the welcome screen and sign-out.
- **Expected result:** Scenario A works live with a new number.
- **Testing:**
  - **Component tests:** conditional fields; validation messages; OTP wrong, expired and locked; resend cooldown (with fake timers).
  - **E2E:** register a new member (A); sign in as Tara; sign out; redirect back to `/club/activity` after login (a page owned by this track, using a placeholder until Phase 8).
- **Acceptance criteria:**
  - The only required fields are name and mobile, plus the terms tick.
  - There is no gender field.
  - `grep -ri "spouseMobile\|linkSpouse\|mergeAccount" src` finds nothing.
  - The demo OTP is clearly labelled.
- **Risks:**
  - The mobile keyboard covers the CTA → use a sticky footer with a safe-area inset.
  - OTP autofill → use `autocomplete="one-time-code"`.

## Phase 6: Customer dashboard, membership, notifications
- **Objective:** the main customer experience, which answers the seven questions, plus a tier explanation page and a finished landing page.
- **Features:**
  - dashboard hierarchy (Screen Inventory C3), including the new-member variant, occasion cards, expiry notice and announcements;
  - membership page with copy generated from the config;
  - landing page wired to the config and the catalogue;
  - notifications bell and sheet.
- **Screens:** C3 Dashboard, C4 Membership, C1 Landing (polished), NotificationsSheet.
- **Components:** `MembershipCard` (live, with count-up), `ExpiryNotice`, `OccasionCard`, `TierProgress`, `RewardRail`, `VoucherList` (compact), `ActivityList` (compact), `AnnouncementList`, `OnboardingPanel`, `TierLadder`, `HowItWorksSteps`, `FaqAccordion`, `HeroEditorial`, `NotificationBell`, `NotificationsSheet`.
- **Files/modules:**
  - `src/features/customer/{dashboard,membership,landing,notifications}/*`;
  - `src/components/domain/{MembershipCard,TierProgress,OccasionCard,...}.tsx`;
  - tests under `tests/component/customer/dashboard/*` and `tests/e2e/customer-dashboard.spec.ts`.
- **Data entities:** read Customer, transactions, Purchase, Tier, config, Reward, IssuedVoucher, Campaign and Notification; write Notification (`readAt`).
- **Dependencies:** Phase 5.
- **Steps:**
  1. Lay out the sections in the inventory's order, with the 7/5 desktop split.
  2. Add the variants: new member, occasion ready, occasion upcoming, expiry, top tier.
  3. Build the membership page.
  4. Build the landing sections.
  5. Add the bell and sheet, with mark-as-read.
- **Expected result:** each seeded persona sees its scenario state:
  - Tara: "₹2,600 to Golden Hour";
  - Zoya: her treat is ready;
  - Aditi: the anniversary unlock date;
  - Farhan: an expiry notice for 450;
  - Meera: onboarding.
- **Testing:**
  - Component tests for each variant using seed fixtures.
  - E2E checks for the B, D, E and I dashboards, and the bell's unread count.
  - Browser check at 375, 768 and 1280 px.
- **Acceptance criteria:**
  - The points balance is the largest number on the screen.
  - Sections that don't apply are hidden rather than shown empty.
  - With the birthday rules deactivated (seeded in the test), the card makes no promise.
- **Risks:**
  - Information overload → cap the reward rail at 6 items and recent activity at 5.

## Phase 7: Rewards, redemption, vouchers
- **Objective:** self-service redemption that is clear, safe and immune to duplicates.
- **Features:**
  - catalogue with filters and sort stored in the query string;
  - eligibility chips;
  - detail page with a sticky mobile action bar;
  - confirmation using a per-open `requestId`, locked while processing;
  - success view with a code and a count-down;
  - vouchers tab;
  - "show at counter" sheet;
  - handling of stale eligibility.
- **Screens:** C5 Catalogue and My vouchers; C6 Detail, confirmation and success; VoucherShowSheet.
- **Components:** `RewardGrid`, `RewardFilters`, `EligibilityChip`, `RewardDetail`, `RedeemConfirmDialog`, `RedemptionSuccess`, `VoucherCard`, `VoucherShowSheet`, `CopyCodeButton`.
- **Files/modules:**
  - `src/features/customer/rewards/*`;
  - `src/components/domain/{RewardCard,VoucherCard,...}.tsx`;
  - tests under `tests/component/customer/rewards/*` and `tests/e2e/customer-rewards.spec.ts`.
- **Data entities:** Reward, IssuedVoucher, PointsTransaction (REDEEM), Notification, AuditEntry.
- **Dependencies:** Phase 6.
- **Steps:**
  1. Build the catalogue.
  2. Build the detail page.
  3. Build the dialog with `useCommand`. Disable Esc and overlay close while it is processing.
  4. Build the success view.
  5. Build the vouchers tab and the sheet.
  6. Handle unknown or archived reward ids.
- **Expected result:** Scenario C works end to end inside the customer portal.
- **Testing:**
  - **Component tests:** each eligibility reason; double-clicking Confirm produces one voucher.
  - **E2E for C (Tara):**
    - balance falls from 1,438 to 938 on the dashboard and in activity;
    - the voucher appears in My vouchers;
    - a reward that is unavailable through a seeded state (the scheduled reward) is not shown in the catalogue.
- **Acceptance criteria:**
  - Insufficient points shows "You need N more points", and redeeming is impossible.
  - "Only N left" is accurate.
  - Codes are unique and can be copied.
- **Risks:**
  - The dialog closes mid-commit → lock the dialog while processing.

## Phase 8: Activity and profile
- **Objective:** full points transparency (history and expiry), plus self-service profile editing.
- **Features:**
  - ledger grouped by month, with a running balance and an expandable breakdown;
  - filters;
  - expiry schedule showing the next 3 dates;
  - personal-details and celebrations forms;
  - occasion dates editable only once, then locked;
  - unsaved-changes guard;
  - mobile number shown read-only.
- **Screens:** C7 Activity, C8 Profile.
- **Components:** `LedgerList`, `LedgerRow`, `LedgerFilters`, `ExpirySchedule`, `SummaryStrip`, `PersonalDetailsForm`, `CelebrationsForm`, `UnsavedChangesGuard`.
- **Files/modules:**
  - `src/features/customer/{activity,profile}/*`;
  - `src/hooks/useUnsavedChanges.ts`;
  - tests under `tests/component/customer/{activity,profile}/*` and `tests/e2e/customer-activity-profile.spec.ts`.
- **Data entities:** read PointsTransaction and Purchase; write Customer and AuditEntry.
- **Dependencies:** Phase 6.
- **Steps:**
  1. Build the ledger list using the derived running balances.
  2. Add the filters and "Show more".
  3. Add the schedule.
  4. Build the forms with the lock logic.
  5. Add the guard.
- **Expected result:** for Farhan, the notice and schedule show 450 (soon) and 250, and the Expired filter shows 200.
- **Testing:**
  - E2E for Scenario I.
  - Editing the name updates the greeting.
  - The birthday can be edited once, then locks.
  - Married shows the spouse and anniversary fields; Single hides and clears them.
  - The newest running balance equals the dashboard balance.
- **Acceptance criteria:** every transaction type has an icon, a human-readable title and correctly signed points.
- **Risks:**
  - Long histories → paginate in 20s.

## Phase 9: Counter (staff)
- **Objective:** a cashier records a purchase for an existing member in ≤ 4 interactions after sign-in.
- **Features:**
  - staff sign-in (picker and PIN, showing the selected staff member's demo PIN, with lockout);
  - exact-mobile search with suggestions from the last 4 digits;
  - enrolment;
  - member panel;
  - tabs for purchase (live breakdown, duplicate-bill check), rewards (mark as used, staff-assisted redemption) and couple visit;
  - verify-code dialog;
  - history sheet showing only the staff member's own entries;
  - receipt and "Next customer".
- **Screens:** S1 Staff sign-in, S2 Counter (with HistorySheet and VoucherVerifyDialog).
- **Components:** `StaffPicker`, `PinPad`, `MemberSearch`, `EnrolForm`, `MemberPanel`, `PurchaseForm`, `EarnBreakdown` (`aria-live`), `ReceiptPanel`, `CounterRewardsTab`, `CoupleVisitPanel`, `VoucherVerifyDialog`, `HistorySheet`.
- **Files/modules:**
  - `src/features/counter/*`;
  - `src/services/auth.ts` (staff pieces);
  - tests under `tests/component/counter/*` and `tests/e2e/counter.spec.ts`.
- **Data entities:** StaffMember, Customer, Purchase, PointsTransaction, IssuedVoucher, CoupleVisit, AuditEntry.
- **Dependencies:** Phase 4. It does not depend on the customer track.
- **Steps:**
  1. Build sign-in.
  2. Build search, then not-found, then enrolment.
  3. Build the member panel.
  4. Build the purchase tab with live calculation. When a purchase succeeds, focus returns to search.
  5. Build the rewards tab.
  6. Build the couple-visit tab.
  7. Build the verify dialog.
  8. Build the history sheet.
- **Expected result:** Scenarios F and G complete inside the counter. Verifying a used code shows who used it and when.
- **Testing:**
  - **E2E inside the counter (no customer pages):**
    - F (Kabir's balance 1,000 → 1,100 shown on the receipt and member panel);
    - G;
    - duplicate bill;
    - re-entering a voided bill (void seeded through the service in the test);
    - below-minimum purchase;
    - marking the same voucher as used twice;
    - history shows only own entries.
  - **Keyboard flow:** mobile → Enter → amount → Tab → bill → Enter records.
  - **Interaction count:** ≤ 4.
- **Acceptance criteria:**
  - Targets are ≥ 48 px, and the primary target is 56 px.
  - The breakdown matches the stored transaction's breakdown.
- **Risks:**
  - Double recording → `requestId` plus a loading lock.
  - Wrong keypad on mobile → set `inputmode`.

## Phase 10: Admin dashboard
- **Objective:** programme health at a glance, computed exactly from the data.
- **Features:**
  - range presets;
  - KPI band linking to filtered views;
  - issued-vs-redeemed chart with a text summary;
  - tier distribution;
  - upcoming occasions;
  - popular rewards;
  - recent activity;
  - empty states for each widget;
  - the polished admin shell.
- **Screens:** A1 Dashboard.
- **Components:** `RangePresets`, `KpiBand`, `BarChartIssuedRedeemed` (Recharts, lazy-loaded), `TierDistribution`, `UpcomingOccasionsList`, `PopularRewardsList`, `RecentActivityTable`.
- **Files/modules:**
  - `src/features/admin/dashboard/*`;
  - `src/data/selectors/dashboard.ts` (extended);
  - tests under `tests/unit/data/dashboard.test.ts` and `tests/e2e/admin-dashboard.spec.ts`.
- **Data entities:** read Customer, PointsTransaction, Purchase, IssuedVoucher, Tier, config and occasions.
- **Dependencies:** Phase 4.
- **Steps:**
  1. Write the selector using the metric definitions in Spec §7.
  2. Build the KPI band.
  3. Build the charts, with focusable bars, tooltips and summaries.
  4. Build the lists.
  5. Add an empty state for each widget.
- **Expected result:** the dashboard values match independent recomputation for the seed at a fixed date.
- **Testing:**
  - **Selector unit tests:** exact expected values at the fixed date.
  - **E2E:**
    - range switching;
    - KPI links;
    - recording a purchase through the **service in the test setup** raises "Points issued" by exactly that purchase's points.
- **Acceptance criteria:**
  - There are no random or animated fake numbers.
  - Every chart has a text equivalent.
- **Risks:**
  - Chart accessibility → hide decorative SVG from assistive technology, and provide summaries plus a "view as table" toggle.

## Phase 11: Customer management and points corrections
- **Objective:** managers and admins can find any member and correct points transparently.
- **Features:**
  - customer list with URL-synced search, filters, sort and pagination, plus CSV export;
  - mobile card mode;
  - detail header and tabs;
  - adjust, void (BR-47) and cancel voucher;
  - edit details, including changing the mobile number with a uniqueness check and resetting the occasion lock;
  - audit tab.
- **Screens:** A2 Customers, A3 Customer detail.
- **Components:** `CustomerFilters`, `CustomerTable`, `CustomerHeader`, `CustomerTabs`, `AdjustPointsDialog`, `VoidPurchaseDialog`, `CancelVoucherDialog`, `EditCustomerDialog`, `AuditList`.
- **Files/modules:**
  - `src/features/admin/customers/*`;
  - `src/data/selectors/customers.ts`;
  - `src/lib/csv.ts` (text-column formula guard);
  - tests under `tests/component/admin/customers/*` and `tests/e2e/admin-customers.spec.ts`.
- **Data entities:** Customer, PointsTransaction (ADJUST_*, PURCHASE_VOID, REDEEM_REFUND), Purchase, IssuedVoucher, AuditEntry.
- **Dependencies:** Phase 10.
- **Steps:**
  1. Build the list and filters, keeping state in the query string.
  2. Build the detail page.
  3. Build the dialogs, each with a preview and a required reason.
  4. Build the edit dialog.
  5. Build the audit tab.
- **Expected result:** every correction requires a reason and is visible in the audit log. No balance can be edited directly.
- **Testing** (E2E inside admin):
  - Arjun adjusts Tara by +200: the detail page shows 1,638, and the audit entry names Arjun.
  - F-36, F-37 and F-37b, as void cases.
  - F-38: cancel with refund.
  - Filters persist through back navigation.
  - The manager can view customers; the cashier gets a 403.
- **Acceptance criteria:**
  - No editable balance field exists anywhere.
  - The CSV row count equals the number of filtered rows.
- **Risks:**
  - Confusing void outcomes → the dialog shows points reversed and any shortfall before the user confirms.

## Phase 12: Programme configuration
- **Objective:** a non-technical owner can configure the whole programme with confidence.
- **Features:**
  - section routing and sub-nav;
  - forms for Earning, Tiers, Expiry, Occasions (including the global days-on-file setting), Couple visits, Campaigns (list and editor, with computed status) and Redemption;
  - plain-language help and examples;
  - previews: earning calculator (saved vs draft), tier impact, expiry impact, occasion preview for a chosen member;
  - sticky save bar;
  - ReviewChangesDialog;
  - audit entries recording before and after values.
- **Screens:** A6, all 7 sections.
- **Components:** `ProgrammeNav`, `EarningForm`, `EarningPreview`, `TiersEditor`, `TierImpact`, `ExpiryForm`, `OccasionRulesEditor`, `CoupleVisitForm`, `CampaignsList`, `CampaignEditorDialog`, `RedemptionForm`, `StickySaveBar`, `ReviewChangesDialog`.
- **Files/modules:**
  - `src/features/admin/programme/*`;
  - `src/services/config.ts` (UI wiring);
  - tests under `tests/component/admin/programme/*` and `tests/e2e/admin-programme.spec.ts`.
- **Data entities:** LoyaltyConfig, Tier, OccasionRule, Campaign, AuditEntry.
- **Dependencies:** Phase 10.
- **Steps:**
  1. Build each section's form with RHF and Zod.
  2. Add the previews, calling the domain functions with the draft values.
  3. Add the save flow: dirty state → review → command → toast.
  4. Add the campaigns list and status computation.
- **Expected result:** each section saves correctly, with previews and audit. Cross-portal effects are proven in Phase 15.
- **Testing** (inside admin):
  - Changing the rate from 5 to 8 shows "A ₹4,000 purchase earns 320 points (was 200)", and after saving, the audit entry holds before and after values.
  - Setting the Golden Hour threshold to ₹35,000 shows Tara moving up in the impact preview.
  - Validation rejects thresholds that don't increase and a first tier above ₹0.
  - Changing the expiry mode shows the "new points only" copy.
  - A manager gets a 403.
- **Acceptance criteria:**
  - Each section's copy matches Design System §6 and needs no developer to explain it.
  - Switching sections with unsaved changes asks for confirmation.
- **Risks:**
  - Too many settings → keep the advanced fields (rounding, point value) in a collapsed "More options" area.

## Phase 13: Reward management
- **Objective:** an admin can manage the catalogue completely, with a faithful preview.
- **Features:**
  - list with status tabs (Active, Scheduled, Drafts, Inactive, Archived), search and a status switch;
  - editor with a live preview using the shared `RewardCard`;
  - image library picker and upload (type and size checks; canvas resize to ≤ 800 px and ≤ 120 KB; max 6; required alt text; stored under `troveclub.images`);
  - validation;
  - save draft, or save and activate;
  - duplicate;
  - archive.
- **Screens:** A4 Rewards, A5 Reward editor.
- **Components:** `RewardsTable`, `RewardStatusTabs`, `RewardEditorForm`, `RewardPreview`, `ImagePicker`, `ImageUpload`.
- **Files/modules:**
  - `src/features/admin/rewards/*`;
  - `src/lib/image.ts` (canvas resize);
  - tests under `tests/component/admin/rewards/*` and `tests/e2e/admin-rewards.spec.ts`.
- **Data entities:** Reward, UploadedImage, AuditEntry.
- **Dependencies:** Phase 10.
- **Steps:**
  1. Build the list.
  2. Build the editor sections.
  3. Add the preview.
  4. Add image handling.
  5. Add the status actions, confirming deactivation and archiving.
- **Expected result:** the reward lifecycle is complete inside admin.
- **Testing** (inside admin):
  - A new reward appears in the Active tab.
  - Saving a draft puts it in the Drafts tab.
  - Deactivating asks for confirmation and states how many issued vouchers stay valid.
  - An upload over 1.5 MB is rejected.
  - A seventh upload is blocked with a message.
- **Acceptance criteria:**
  - The preview uses the same component as the customer catalogue.
  - Alt text is required.
- **Risks:**
  - Storage quota → enforce the limits, and handle `STORAGE_QUOTA` with a clear message.

## Phase 14: Staff management, activity and audit, CSV
- **Objective:** an admin controls staff access, and admins and managers can review every transaction and action.
- **Features:**
  - staff table: add, edit role, reset PIN, deactivate or reactivate, last-admin guard;
  - activity ledger with filters, totals and CSV;
  - audit log with filters and a before/after diff.
- **Screens:** A8 Staff, A7 Activity (Transactions and Audit tabs).
- **Components:** `StaffTable`, `StaffDialog`, `ActivityFilters`, `TransactionsTable`, `ActivityTotals`, `AuditTable`, `AuditDiff`, `CsvExportButton`.
- **Files/modules:**
  - `src/features/admin/{staff,activity}/*`;
  - `src/lib/csv.ts` (shared);
  - tests under `tests/component/admin/{staff,activity}/*` and `tests/e2e/admin-staff-activity.spec.ts`.
- **Data entities:** StaffMember, PointsTransaction, AuditEntry.
- **Dependencies:** Phase 10.
- **Steps:**
  1. Build the staff page with its guards.
  2. Build the transactions tab and CSV export (RFC 4180 quoting; formula guard on text columns only).
  3. Build the audit tab and diff.
- **Expected result:** staff and audit management is complete.
- **Testing** (inside admin):
  - Adding a cashier lets them sign in at `/counter/login` in the same test.
  - The last-admin guard works.
  - The CSV has the right row count and headers, and negative points stay numeric.
  - After a cashier attempt seeded in the test, the audit log shows ACCESS_DENIED.
  - A manager can see Activity but gets a 403 on Staff.
- **Acceptance criteria:**
  - Every command type produces a readable audit entry.
  - Configuration entries show before and after values.
- **Risks:**
  - Large audit lists → paginate and filter.

## Phase 15: Cross-interface integration and scenario E2E
- **Objective:** prove the "one product, one data" promise across portals.
- **Features:** scenario tests A–J and cross-interface tests X-01…X-10 (QA §4), using several pages in one browser context, plus every cross-portal check deferred from earlier phases:
  - redirect after login to a reward detail;
  - a reward deactivated in admin disappearing from the customer catalogue;
  - a counter purchase showing up in the customer tab;
  - an admin rate change affecting the counter;
  - a tier-threshold change updating the customer;
  - deactivating a staff member signing out their tab.
- **Screens:** all.
- **Components:** none new. Fix any defects you find.
- **Files/modules:**
  - `tests/e2e/{scenarios,consistency}.spec.ts`;
  - `tests/e2e/fixtures.ts` (helpers: `signInMember(page, id)`, `signInStaff(page, id)`, `resetDemo(page)`);
  - fixes in `src/**` as needed.
- **Data entities:** all.
- **Dependencies:** Phases 5–14.
- **Steps:**
  1. Write the fixtures.
  2. Write the scenarios, tagging A–J `@smoke` for webkit.
  3. Write the consistency tests.
  4. Fix each inconsistency **at its root** (selector or command), never by patching a screen.
- **Expected result:** everything passes on the chromium desktop and mobile projects, and the webkit smoke set passes.
- **Testing:** this phase is the testing.
- **Acceptance criteria:**
  - Every X case passes.
  - The steps in the presenter guide match the scenario tests.
- **Risks:**
  - Flaky timing → use the `?e2e=1` flag and web-first assertions (`expect(...).toHaveText`), never fixed sleeps.

## Phase 16: Visual QA, responsive and accessibility refinement
- **Objective:** a presentation-quality, accessible product at every width.
- **Features:**
  - screenshot matrix (QA §6.1);
  - checklist review;
  - axe on every route;
  - keyboard walkthroughs;
  - reduced motion;
  - 200% zoom and reflow at 320 px.
- **Screens:** all.
- **Components:** refine whatever the review finds.
- **Files/modules:**
  - `tests/e2e/{a11y,responsive}.spec.ts`;
  - `docs/qa/screenshots/**`;
  - `docs/qa/VISUAL_QA.md` (checklist results per page);
  - style fixes in `src/**`.
- **Data entities:** none.
- **Dependencies:** Phase 15.
- **Steps:**
  1. The browser sub-agent captures the matrix.
  2. Review each page against the checklist.
  3. Fix the issues.
  4. Re-capture the affected pages.
  5. Run axe and the target-size check on every route.
- **Expected result:** a consistent, polished UI at every width.
- **Testing:**
  - `a11y.spec.ts` over all routes on both chromium projects.
  - `responsive.spec.ts` asserts that no page scrolls horizontally at 320 px (`scrollWidth <= clientWidth`), except designated table scrollers.
- **Acceptance criteria:**
  - Zero serious or critical axe violations.
  - Every checklist item passes, or the exception is documented in `VISUAL_QA.md`.
- **Risks:**
  - The polish loop never ends → fix Critical and High visual issues first, and record the Low ones.

## Phase 17: Final acceptance, security pass, cleanup, report
- **Objective:** a verified, honest handover.
- **Features:**
  - full test run;
  - final acceptance walk (QA §8);
  - security and honesty review (QA §7);
  - "no dead controls" crawl;
  - orphan cleanup (§0.5);
  - production build size check;
  - final report.
- **Screens:** all.
- **Components:** none new.
- **Files/modules:**
  - `tests/e2e/dead-controls.spec.ts`;
  - `docs/IMPLEMENTATION_REPORT.md` (final);
  - `README.md` (final).
- **Data entities:** none.
- **Dependencies:** Phase 16.
- **Steps:**
  1. Run `npm run check` and `npm run e2e`.
  2. Walk QA §8.
  3. Do the security pass.
  4. Run the crawl.
  5. Do the cleanup, with evidence.
  6. Check the bundle size.
  7. Write the report:
     - summary;
     - screens built;
     - test commands with pass/fail counts;
     - screenshot index;
     - every FR marked Done (with evidence) or Not done (with the reason);
     - decisions and deviations;
     - dependencies added;
     - removed files;
     - known limitations: simulated auth, local-only data, imagery source;
     - next steps (deferred items from Spec §10).
- **Expected result:** an application that is ready to present.
- **Testing:** the full suite.
- **Acceptance criteria:**
  - Every item in QA §8 passes.
  - No TODO or FIXME remains in `src/` without a matching report entry.
  - `git rev-parse HEAD` equals the starting HEAD, and no commits were made.
  - `docs/` still holds all 8 planning documents.
- **Risks:**
  - Overstating completeness → mark each item verified, not verified or failed, with evidence.

---

## 3. Global risks

| Risk | Severity | Mitigation |
|---|---|---|
| Docs deleted while scaffolding | High | Scaffold in a temp folder; compare `docs/` before and after (Phase 0) |
| UI looks like a generic dashboard | High | Phase 1 style guide first; Visual QA checklist; tide sidebar, Playfair titles, hairline panels |
| Numbers differ across portals | High | Ledger-only writes, derived selectors, Phase 15 consistency tests |
| Date/time bugs (month ends, leap years, year boundaries, expiry) | High | Pinned TZ and clock, calendar-date comparisons, seed checks at boundary dates |
| Agent commits to git | High | §0.1; check HEAD is unchanged at the end |
| Double submissions | Medium | `requestId` idempotency + loading locks + unique bill numbers |
| localStorage quota | Medium | Separate image key, size and count caps, quota error handling |
| Scope drift | Medium | Spec §3 and §10 deferred list; record deviations |
| Flaky E2E | Medium | `?e2e=1` zero delays, web-first assertions, no sleeps |
