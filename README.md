# loyalty-rewards-system

# Trove Label — Custom Omnichannel Loyalty & Rewards Platform

A custom, omnichannel loyalty and rewards management platform prototype built for **Trove Label**. The system demonstrates how a retail brand can independently manage its own customer rewards program across physical brick-and-mortar stores and online e-commerce channels (Shopify + Razorpay) without paying ongoing third-party SaaS subscription fees.

---

## 🌟 Key Architecture & Principles

- **One Customer · One Points Balance · Multiple Channels:** Unified wallet balance regardless of whether purchases happen in-store or online.
- **Dynamic Rules Engine:** Loyalty earning ratios (e.g. ₹100 = 10 pts), point cash value (1 pt = ₹1.00), minimum redemption barriers (50 pts), bill redemption caps (30%), and rolling expiration (12 months) are fully configurable by business administrators without code changes.
- **Shopify & Razorpay Webhook Integration:** Server-to-server webhook ingestion for `orders/paid` with HMAC signature verification, idempotency protection against duplicate event delivery, and automatic refund reversals.
- **Physical Store Cashier Terminal (POS):** Fast mobile lookup (`+91`), live points calculation on gross bill, dynamic redemption with policy caps, multi-tender payment simulation (UPI QR, Card Terminal, Cash), and thermal receipt printing (`@media print`).
- **Customer Rewards Wallet:** Digital membership pass showing live points balance, ₹ discount equivalent, tier progression (Classic → Silver → Gold → Platinum), and simulated member QR pass for in-store scanning.

---

## 🚀 Portals Overview

| Portal | Shortcut | Description |
|---|:---:|---|
| **Administration Portal** | Press `1` | Real-time KPI metrics, points liability, dynamic rules engine, member directory, immutable audit ledger, CSV export, and interactive system architecture hub. |
| **Store POS Cashier** | Press `2` | 5-step cashier workflow: customer lookup by mobile, bill entry, point redemption with policy validation, payment collection, and thermal receipt print. |
| **Online Simulator** | Press `3` | Shopify & Razorpay webhook dispatcher with idempotency duplicate tests and online refund reversals. |
| **Customer Wallet** | Press `4` | Digital membership card, cash equivalent in Rupees, tier progress tracker, and in-store QR code pass. |

---

## 🛠️ Technology Stack

- **Framework:** React 19 + TypeScript
- **Bundler & Dev Server:** Vite 8.3
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Linter:** Oxlint
- **Test Runner:** Node.js Native Test Runner (`node --test`)
- **State Management:** React Context API with LocalStorage persistence

---

## 💻 Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm (v10+)

### Installation

```bash
# Clone the repository
git clone git@github.com:kaifpipadwalaphoenix-oss/loyalty-rewards-system.git

# Navigate to the project directory
cd loyalty-rewards-system

# Install dependencies
npm install
```

### Running Locally

```bash
# Start Vite development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Running Automated Business Logic Tests

```bash
# Run the 12 automated rule engine tests
npm test
```

### Production Build

```bash
# Type-check and compile bundle
npm run build
```

### Linting

```bash
# Run oxlint
npm run lint
```

---

## 🧪 Automated Test Coverage (12/12 Passing)

1. Default earning calculation (₹2,000 with ₹100 threshold & 10 pts/threshold gives 200 pts)
2. Floor calculation with remainder (₹2,550 gives 250 pts)
3. Dynamic configuration change (₹100 = 20 pts produces 400 pts on ₹2,000)
4. Configurable point monetary value (1 pt = ₹0.50 conversion rate)
5. Minimum qualifying purchase criteria
6. Valid point redemption with bill reduction
7. Insufficient balance rejection
8. Minimum redemption threshold rejection (< 50 pts)
9. Maximum bill percentage cap enforcement (30% cap)
10. Disabled redemption and earning toggles
11. Online earning and refund reversal verification
12. Webhook idempotency duplicate order rejection

---

## 📄 License

Proprietary — Trove Label Loyalty Management Platform Prototype.
