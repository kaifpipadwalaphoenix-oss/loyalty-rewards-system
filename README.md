# Trove Club — Loyalty & Membership Programme Prototype

> **Prototype Note:** This application is a client-presentable, browser-persisted commercial prototype for Trove Label. All authentication (member OTP and staff PINs) is simulated. All loyalty data lives in the browser's local storage and does not connect to live production backends or third-party SMS providers.

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- npm (v10+ recommended)

### Installation & Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run quality checks (typecheck, lint, test, build)
npm run check

# Run end-to-end tests
npm run e2e
```

## Demo Personas

### Member Personas
- **Tara Menon** (+91 90000 00002) — Tide tier, active shopper nearing Golden Hour
- **Kabir Malhotra** (+91 90000 00003) — Shore tier, canonical purchase & redemption consistency flow
- **Zoya Siddiqui** (+91 90000 00004) — Golden Hour tier, birthday treat unlocked
- **Aditi Rao** (+91 90000 00005) — Tide tier, married, anniversary reward upcoming, couple-visit eligible
- **Farhan Qureshi** (+91 90000 00006) — Shore tier, points expiring soon
- **Meera Iyer** (+91 90000 00001) — New member onboarding (0 points)

### Staff Personas
- **Nisha Varma** (Admin, Demo PIN: `1234`)
- **Arjun Shetty** (Store Manager, Demo PIN: `2345`)
- **Pooja Nair** (Cashier, Demo PIN: `3456`)
- **Imran Sheikh** (Cashier, Demo PIN: `4567`)
- **Leela D'Souza** (Cashier, Inactive)

## Portals
- **Customer Portal**: `/` (Landing), `/login` & `/join` (Auth), `/club` (Dashboard & Member Area)
- **Store Counter**: `/counter` (Cashier/Store terminal)
- **Admin Portal**: `/admin` (Management & Configuration)
