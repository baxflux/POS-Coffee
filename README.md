# POS-Coffee ☕

A clean, modern, web-based Point of Sale system for a small coffee shop — built as a lightweight MVP deployable on Vercel.

## Live Demo

> Deploy your own in one click using the button below, or visit the live instance once deployed.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/baxflux/POS-Coffee&root-directory=nextjs)

## Features

| Feature | Description |
|---|---|
| **Staff Login** | Admin and Cashier roles with simulated local auth |
| **Menu Management** | Categories, products with availability toggle, modifiers with price deltas |
| **Order Creation** | Product grid, modifier selection dialog, per-line notes, live cart totals |
| **Payment** | Cash (with change calculation), Card, and Mobile simulated flows |
| **Receipt** | Auto-shown after payment, print-optimized stylesheet, re-openable by order ID |
| **Order Management** | Today's orders, status transitions (Preparing → Completed), cancel with confirmation |
| **Daily Report** | Revenue, order count, avg order value, top 5 items, payment method breakdown |

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript strict)
- **UI:** Tailwind CSS v4 + shadcn/ui (warm coffee-shop palette)
- **State:** Zustand with `persist` middleware (localStorage)
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React
- **Dates:** date-fns
- **Deployment:** Vercel

## Getting Started

```bash
cd nextjs
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to the login page.

### Demo Credentials

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Cashier | `cashier` | `cashier123` |

## Project Structure

```
POS-Coffee/
├── nextjs/                  # Next.js application
│   ├── app/                 # App Router pages
│   │   ├── (shell)/         # Authenticated shell layout
│   │   │   ├── order/       # Order creation
│   │   │   ├── orders/      # Order management
│   │   │   ├── payment/     # Payment screen
│   │   │   ├── receipt/     # Receipt display
│   │   │   ├── menu/        # Menu management (Admin)
│   │   │   └── report/      # Daily report (Admin)
│   │   └── login/           # Login page
│   ├── components/          # UI components
│   ├── stores/              # Zustand stores
│   ├── lib/                 # Pure helpers (totals, orders, ids)
│   └── types/               # TypeScript domain types
└── logs/                    # Tester reports (PC-1 → PC-10)
```

## Deployment to Vercel

1. Import the GitHub repository in Vercel
2. Set **Root Directory** to `nextjs`
3. Leave all other settings as default
4. Deploy

> All data is stored in the browser's `localStorage` — no database or backend required.

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm run format       # Prettier format
```

## Notes

- Data persists in `localStorage` — clearing browser storage resets all orders and menu changes
- Seed data (demo menu + users) is loaded automatically on first visit
- No real payments, no real authentication — this is a demo MVP
