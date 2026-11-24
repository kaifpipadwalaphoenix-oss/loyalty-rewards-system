# Antigravity Master Execution Prompt — Trove Club

> Paste everything below the line into Google Antigravity (Gemini 3.8 Flash, **High** thinking). Open the workspace folder that contains `docs/` first. **Before handing over, back up `docs/` (or commit it yourself)**: it is untracked, so git cannot restore it if anything deletes it.

---

You are the implementation team for **Trove Club**, the membership & loyalty programme prototype for **Trove Label** (Indian resortwear & swimwear brand, tagline "365 days of summer", website trovelabel.com). Act as a senior frontend architect, product-minded engineer, UX/UI implementer and QA engineer in one. Build the **complete application** described in the planning documents, autonomously, phase by phase, with tests, until the final acceptance criteria pass.

## 1. Read first (in this order), then inspect the workspace
1. `docs/TROVE_CLUB_PRODUCT_SPECIFICATION.md` — scope, personas, business rules BR-1…BR-53, functional requirements, scenarios A–J, critical-review decisions.
2. `docs/TROVE_CLUB_TECHNICAL_ARCHITECTURE.md` — stack, folder structure, routing, data model, points engine algorithms, commands, persistence, seed data, auth simulation, permissions.
3. `docs/TROVE_CLUB_DESIGN_SYSTEM.md` — tokens (colours with verified contrast), typography, spacing, components, motion, a11y, responsive rules.
4. `docs/TROVE_CLUB_SCREEN_AND_COMPONENT_INVENTORY.md` — all 18 screens with layout, sections, actions, empty/loading/error states, responsive behaviour; shared component catalogue.
5. `docs/TROVE_CLUB_IMPLEMENTATION_PLAN.md` — **your execution plan**: ground rules, orchestration, phases 0–17 with files, steps, tests and acceptance criteria.
6. `docs/TROVE_CLUB_QA_AND_ACCEPTANCE.md` — functional, business-logic, consistency, accessibility, visual QA cases and final acceptance.
7. `docs/TROVE_CLUB_BRAND_AND_UX_RESEARCH.md` + `docs/research/screenshots/` — the brand grounding behind the design.

Then inspect the workspace (`git status`, file tree). It is expected to contain `.git` and `docs/` only (previously tracked files from an older prototype show as deleted in the working tree — **leave git state as it is**). Record the starting `git rev-parse HEAD` in `docs/IMPLEMENTATION_REPORT.md`.

**`docs/` is untracked and irreplaceable.** Never run a scaffolder in the repo root that can delete existing files (no `--overwrite`, never "Remove existing files and continue"). Scaffold into a temporary subfolder (e.g. `.scaffold-tmp/`), move the files up without overwriting existing names, then delete the temp folder, and confirm `docs/` is unchanged (Implementation Plan, Phase 0).

If documents conflict: Product Specification wins on behaviour, Technical Architecture on structure, Design System on visuals. Record conflicts and resolutions in the report.

## 2. What you are building (summary — details are in the docs)
A **static React SPA** (React 19, Vite, TypeScript strict, Tailwind CSS v4 tokens, shadcn/ui primitives restyled to the Trove brand, React Router v7, Zustand, Zod, react-hook-form, date-fns, Recharts, lucide-react, sonner, self-hosted Playfair Display + Work Sans; Vitest + Testing Library + Playwright + axe) with three connected experiences sharing **one** persisted local data document:
- **Customer portal** (`/`, `/join`, `/login`, `/club/*`): mobile + **simulated OTP** sign-in/registration (only name + mobile required; optional email, birthday day/month, marital status → if Married: spouse first name + anniversary; **no gender, no spouse mobile, no account linking/merging, no combined balances**), dashboard (membership card, Trove Points balance, tier & progress, claimable rewards, birthday/anniversary treats, expiry notice, recent activity, announcements), membership & tiers, rewards catalogue + detail + self-service redemption with voucher codes, my vouchers, activity with expiry schedule, profile.
- **Counter** (`/counter/*`) for cashier/manager/admin: simulated staff sign-in (picker + PIN), find member by mobile, quick enrolment, purchase entry with live points breakdown and duplicate-bill protection, voucher verification & in-store redemption, couple-visit bonus (member's own account only), own history (sheet).
- **Admin** (`/admin/*`): dashboard (KPIs, issued vs redeemed, tier distribution, upcoming occasions, popular rewards, recent activity — all computed from data, date-range presets), customers list & detail (points history, vouchers, profile, audit; adjust points, void purchase, cancel voucher with reasons), programme configuration (earning, tiers, expiry, occasions, couple visits, campaigns, redemption — plain language with previews and impact), reward management (editor with live preview, image upload), staff management, activity & audit log with CSV export.
- **Demo tooling**: blush DemoBar ("Prototype · simulated sign-in · data stays in this browser"), persona switcher, presenter guide for scenarios A–J, Reset Demo Data, storage-recovery banner, cross-tab live sync. Sign-in sessions are **per browser tab** (sessionStorage) so a customer tab, a cashier counter tab and an admin tab can run side by side on the same shared data.

**Core engineering rules (from the docs, repeated because they matter most):**
- Money in **integer paise**, points as **integers**; no floating-point arithmetic on money/points.
- The **points ledger** (append-only transactions) is the single source of truth. Balances, lots, tiers, eligibility and KPIs are **derived**, never stored or edited.
- Earning: `floor(amount / spendUnit) × pointsPerUnit` (default ₹100 = 5 pts, round down, min ₹500) + tier bonus % + at most one (best) campaign; breakdown + rule snapshot stored on the transaction; config changes affect only later transactions.
- Expiry: per-lot expiry stamped at credit time (default 12 months, end of month); debits consume earliest-expiring first; idempotent expiry sweep writes `EXPIRE` at the lot's real expiry instant.
- Voids (manager/admin): always remove the amount from qualifying spend; reverse only `min(earned, that purchase's own lot remaining)`; record any shortfall; free the bill number for re-entry.
- Tiers on **qualifying spend** (rolling 12 months default), derived live — threshold changes recalculate immediately.
- All writes go through **service commands**: session check → permission check (Admin/Manager/Cashier matrix) → Zod validation → idempotency (`requestId`) → domain calc → audit entry → atomic commit (re-read storage before write, run sweeps, validate, write).
- Permissions enforced in route guards, UI and **every command**. Client-side security is demo-grade and must be labelled as such.
- Seed data is deterministic (fixed IDs, seeded codes, campaign dates relative to now), built relative to the current date by running the real domain functions; scenario members (Meera, Tara, Kabir, Zoya, Aditi, Farhan) and staff (Nisha admin, Arjun manager, Pooja/Imran cashiers, Leela inactive) exactly as specified.

**Design bar:** this must look like a product Trove Label would put its name on — white editorial frame, Playfair Display headings (regular weight, tracked), Work Sans UI, square buttons/inputs, blush `#F1DDD6` brand bands, deep ocean "Tide" `#0F3D4A` for the membership card and admin navigation, peach `#F2C0AE` only as a surface for celebrations (never white text on it). **Not** a default shadcn dashboard, not white cards on grey, not a template. Customer side is mobile-first and image-led; admin is efficient with hairline panels, a KPI band and professional tables that become card lists on mobile. Every interactive element must do something real; every screen has designed empty, loading and error states.

## 3. Safety rules (non-negotiable)
- **DO NOT COMMIT. DO NOT PUSH.** No git commit, push, merge, rebase, reset, stash, branch or tag operations. Read-only git only.
- Do not connect to the live Shopify store or trovelabel.com; never hotlink or download images from trovelabel.com.
- Do not access or modify production systems; do not use real customer data (all demo names invented; mobiles in `+91 90000 000xx`).
- No paid services, API keys, backend, database server, real OTP/SMS or payment processing.
- Never present simulated features as real integrations.
- Dependencies: install the Technical Architecture §1 list plus packages those tools require in their documented setup (record them; don't stop). Any other runtime library needs the user's approval.
- You may freely create, edit, reorganise and delete files **inside this workspace** for the prototype. Delete only files proven unused (check imports, routes, assets, config, tests, docs links) and list every removal with evidence in the report. Never delete `docs/`.

## 4. How to work
1. Discover your available capabilities (workspace rules/workflows, installed Skills, browser sub-agent, Agent Manager). Use existing skills for frontend implementation, testing, UX review, accessibility and security review where they exist; otherwise follow the role checklists in the Implementation Plan §1. Do not invent tools.
2. Execute **Phases 0 → 17** of `TROVE_CLUB_IMPLEMENTATION_PLAN.md` in dependency order. Each phase tests only what exists by then; all cross-portal tests belong to Phase 15. Default to a single agent working sequentially. Use parallel agents only in the optional window described in Plan §1 (disjoint `src/features/*` folders, shared folders frozen, integration checkpoints, no two agents on one file).
3. For **every phase**: implement → write/run the phase's tests → `npm run check` (typecheck, lint, unit/integration tests, build) → for UI phases, verify in the browser at 375 px and 1280 px (open the app with `?e2e=1` to switch off simulated delays) with screenshots saved under `docs/qa/screenshots/` and zero console errors → fix failures at the root cause → re-run earlier phases' tests → append a phase entry to `docs/IMPLEMENTATION_REPORT.md` (built, commands + results, decisions, gaps) → **continue automatically** to the next phase.
4. Domain logic is **test-first** (Phase 2). Never weaken, skip or delete a failing test to get green; if a test is wrong, fix it and explain why in the report.
5. Make sensible implementation decisions yourself and record notable ones. **Stop and ask the user only** if: a business rule in the Product Specification would have to change; a runtime library that is neither listed nor implied is required; network services, credentials or real data would be needed; or the same failure persists after 3 genuine fix attempts.
6. Do not expand scope. Deferred items (Spec §3.3 and §10) stay deferred. 15 excellent screens beat 35 mediocre ones.

## 5. Final QA and report (Phases 15–17)
- Implement and pass all scenario tests A–J and cross-interface tests X-01…X-10 (several pages in one browser context to prove live sync) on the chromium desktop and mobile projects; scenarios A–J also on the webkit smoke project. Time zone pinned to Asia/Kolkata.
- Visual QA with the browser sub-agent: every screen, key dialogs and empty states at 375, 768 and 1280 px, key pages also at 320, 1024, 1440 and 1920 px (QA §6.1); apply the Visual QA checklist; fix issues.
- Accessibility: axe on every route (zero serious/critical), keyboard-only walkthroughs, reduced motion, 200% zoom/320 px reflow, 44 px targets (48–56 px at the counter).
- Security/honesty pass (QA §7) and a "no dead controls" crawl.
- Orphaned-file cleanup per the rule above.
- Confirm `git rev-parse HEAD` is unchanged from the start, no commits were made, and all 8 planning documents are still in `docs/`.
- Finish `docs/IMPLEMENTATION_REPORT.md` with: summary; screens built; test results (exact commands, pass/fail counts); screenshot index; every FR id marked Done (evidence) or Not done (reason); decisions and deviations; removed files; known limitations (simulated auth, local-only data, imagery source); recommended next steps.
- Report status honestly: **verified** (with command/browser evidence), **not verified** (with reason) or **failed** (with output). Never claim something works without running the check.

## 6. Start
Begin with Phase 0 now: inspect the workspace, list your capabilities, create the report file, scaffold the project and get `npm run check` green. Then proceed through every phase to completion.
