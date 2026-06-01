# POS-Coffee ☕

A clean, modern, web-based Point of Sale system for a small coffee shop — built as a lightweight MVP deployable on Vercel.

## Live Demo

**[https://pos-coffee-neon.vercel.app](https://pos-coffee-neon.vercel.app)**

### Demo Credentials

| Role | Username | Password | Access |
|---|---|---|---|
| Admin | `admin` | `admin123` | Full access — menu, orders, report |
| Cashier | `cashier` | `cashier123` | Orders, payment, receipt |

---

## Functionalities

### 1. Staff Login
- Two roles: **Admin** and **Cashier** with separate access levels
- Simulated local authentication — credentials validated against seeded user data
- Role-based redirect after login (Cashier → Order screen, Admin → Order screen)
- Session persists across page refreshes via localStorage
- Exact error message shown on invalid credentials: *"Invalid username or password"*
- Protected routes: unauthorized access redirects to a dedicated `/not-authorized` page

### 2. Menu Management *(Admin only)*
- **Categories** — create, rename, and delete categories; deletion blocked when products are assigned
- **Products** — card grid view with category filter; full form with name, description, price, category, and modifier assignment; availability toggle to show/hide products on the order screen; duplicate-name detection with override confirmation
- **Modifiers** — create modifier groups (e.g. Size, Milk Type) with up to 10 options and individual price deltas; inline warning when a negative price delta is entered; usage count shown per modifier
- All menu data persists in localStorage and survives page reload

### 3. Order Creation
- Grid of **available products only**, grouped by category
- Click a product to open a **Modifier Dialog** — select required modifiers before adding to cart
- Quantity controls on each cart line — decrement to 0 removes the item
- Per-line **notes** field (up to 140 characters) for special instructions
- Live **subtotal and total** update as items are added or removed
- **Clear cart** button with confirmation dialog
- **Pay** button disabled when cart is empty
- In-progress cart survives page reload

### 4. Payment
- Three payment methods: **Cash**, **Card**, and **Mobile**
- **Cash flow** — amount tendered input with real-time change calculation; Complete Payment blocked with validation message when tendered amount is less than total; change due displayed prominently
- **Card / Mobile flow** — single Complete Payment button with simulated 800ms processing delay and spinner
- Double-click protection — only one order is ever created per payment attempt
- On success: order saved to store, cart cleared, user navigated to receipt

### 5. Receipt
- Automatically shown after every successful payment
- Displays: shop name, date and time, ticket number, cashier name, all line items with modifiers and notes, subtotal, tax, and total
- **Cash receipts** include the tendered amount and change due
- **Print button** triggers `window.print()` with a print-optimized stylesheet — navigation, sidebar, and action buttons are hidden; receipt card renders clean black-on-white thermal-style output
- Receipt is accessible at a stable URL (`/receipt/[orderId]`) and can be re-opened from the Order Management screen
- **New Order** button clears the cart and returns to the order screen

### 6. Order Management
- Lists **today's orders only** — historical orders are not shown
- Each row shows: ticket number, time, item count, total, payment method, and current status badge
- **Status transitions** (staff-controlled):
  - `Preparing` → `Completed` via *Mark Complete* button
  - Terminal states (`Completed`, `Cancelled`) are locked — no further actions
- **Cancel order** available on any non-terminal order, requires a confirmation dialog
- **Expandable order detail** — click any order to see full item list with modifiers, notes, and totals
- **View Receipt** link for completed and paid orders
- Color-coded status badges: blue (Preparing), green (Completed), red (Cancelled)
- Empty state message when no orders exist for today

### 7. Daily Report *(Admin only)*
- **Summary stats** (completed orders only, cancelled excluded):
  - Total revenue
  - Order count
  - Average order value
- **Top 5 items** table — ranked by quantity sold, with item name, quantity, and revenue columns
- **Payment method breakdown** — Cash, Card, and Mobile with order count and total amount per method
- Helpful empty state when there are no completed orders for the day
- Report resets each day (data is scoped to today's orders only)

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript strict)
- **UI:** Tailwind CSS v4 + shadcn/ui (warm coffee-shop palette)
- **State:** Zustand with `persist` middleware (localStorage)
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React
- **Dates:** date-fns
- **Deployment:** Vercel

---

## Getting Started

```bash
cd nextjs
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to the login page automatically.

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
