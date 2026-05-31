# POS-Coffee — Project Plan

Version: 1.0
Date: 2026-06-01
Status: Approved
Source Requirements: `POS-Coffee-Requirement.md` (Google Drive)

---

## 1. Project Summary

POS-Coffee is a lightweight, modern, web-based Point of Sale (POS) MVP for a small coffee shop. It supports two roles (Admin and Cashier) and covers the full order-to-receipt flow: staff login, menu management, order creation with modifiers and notes, simulated payment (Cash / Card / Mobile), receipt display & print, today's order management, and a basic daily report. All data is stored client-side (Zustand + localStorage). The app is deployed to Vercel.

## 2. Tech Stack

- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- Zustand (state management + persist middleware)
- React Hook Form + Zod (forms & validation)
- Lucide React (icons)
- date-fns (date handling)
- Deployment: Vercel

## 3. Task Breakdown (10 Tasks)

The 10 tasks are sequenced so each builds on the previous. Each task corresponds to one PR.

| # | Jira ID | Title | Effort |
|---|---------|-------|--------|
| 1 | PC-1 | Project Scaffold & Design System Setup | M |
| 2 | PC-2 | Domain Types, Seed Data, and Zustand Stores | M |
| 3 | PC-3 | Auth Store, Login Page, and Route Protection | M |
| 4 | PC-4 | App Shell, Layout, Header, and Role-Based Navigation | S |
| 5 | PC-5 | Menu Management (Categories, Products, Modifiers) | L |
| 6 | PC-6 | Order Creation Screen with Modifier Dialog | L |
| 7 | PC-7 | Payment Screen with Cash / Card / Mobile Flow | M |
| 8 | PC-8 | Receipt Screen with Print-Optimized Stylesheet | S |
| 9 | PC-9 | Order Management Screen with Status Transitions | M |
| 10 | PC-10 | Daily Report Screen & Final Polish | M |

Legend: S = small (~half day), M = medium (~1 day), L = large (~1.5 days)

---

### Task 1 — Project Scaffold & Design System Setup (PC-1)

**Description:** Bootstrap the Next.js 15 App Router project with TypeScript (strict), Tailwind CSS, ESLint, Prettier, and shadcn/ui. Establish the warm coffee-shop visual theme (earthy palette: cream, brown, muted green/terracotta) via Tailwind config and global CSS tokens. Add core shadcn/ui components needed across the app (Button, Input, Label, Dialog, Toast/Sonner, Card, Badge, Select, Tabs, Table, Form). Install the required runtime dependencies (zustand, react-hook-form, @hookform/resolvers, zod, lucide-react, date-fns). Wire up the root layout with the Toaster and a global font.

**Acceptance Criteria:**
- `next build` succeeds with TypeScript strict mode enabled.
- Tailwind config defines a coffee-shop palette (cream/brown/accent tokens).
- shadcn/ui is initialized and at least Button, Input, Dialog, Toast, Card components are added.
- All runtime deps (`zustand`, `react-hook-form`, `@hookform/resolvers`, `zod`, `lucide-react`, `date-fns`) are in `package.json`.
- Root layout renders the global font and the Toaster.
- ESLint and Prettier configs are present and pass on a clean tree.

---

### Task 2 — Domain Types, Seed Data, and Zustand Stores (PC-2)

**Description:** Define the core TypeScript domain types (`User`, `Role`, `Category`, `Modifier`, `ModifierOption`, `Product`, `OrderLineItem`, `Order`, `OrderStatus`, `PaymentMethod`). Implement Zustand stores with the `persist` middleware for: `menuStore` (categories, products, modifiers), `ordersStore` (today's orders with status & timestamps), and `cartStore` (in-progress order). Provide pure utility functions for totals (`computeLineTotal`, `computeOrderTotals`), top-items aggregation, and today-filter. Provide a seed module that pre-loads at least 2 categories, 6 products, and one shared "Size" modifier on first run.

**Acceptance Criteria:**
- All domain types are defined in `types/` and exported.
- `menuStore`, `ordersStore`, `cartStore` exist under `stores/`, use Zustand persist (localStorage), and survive reloads.
- Pure helpers in `lib/` compute line totals, order totals, and top items correctly (basic unit-testable functions).
- Seed runs only when storage is empty and creates the demo menu (categories, products, modifier).
- No store directly imports React UI components (clean separation).

---

### Task 3 — Auth Store, Login Page, and Route Protection (PC-3)

**Description:** Implement a demo-grade `authStore` (Zustand + persist) holding `userId`, `role`, and `displayName`. Seed two accounts: `admin / admin123` (Admin) and `cashier / cashier123` (Cashier). Build the `/login` page with React Hook Form + Zod validation, inline empty-field errors, and the exact error message "Invalid username or password." on failure. Implement a route guard (middleware or layout-level redirect) that: (a) redirects unauthenticated users to `/login`, (b) routes Admin to `/menu` (or `/dashboard`) and Cashier to `/order` on successful login, and (c) blocks Cashier access to Admin-only routes with a "Not authorized" message or redirect.

**Acceptance Criteria:**
- Visiting any protected URL while unauthenticated redirects to `/login`.
- Submitting valid Admin credentials lands on the Admin landing screen.
- Submitting valid Cashier credentials lands on the Order Creation screen (`/order`).
- Invalid credentials show the exact text "Invalid username or password." and stay on `/login`.
- Empty field submission shows inline validation messages and does not submit.
- Reloading the browser while logged in preserves the session.
- Username whitespace is trimmed before validation.
- A Cashier session trying to reach `/menu` or `/report` is blocked.

---

### Task 4 — App Shell, Layout, Header, and Role-Based Navigation (PC-4)

**Description:** Build the authenticated app shell: a top header showing shop name "POS Coffee", current user display name and role badge, and a visible "Log out" control that clears the session and returns to `/login`. Build a sidebar (or top nav) that shows only the routes the current role can access (Cashier: Order, Orders; Admin: Order, Orders, Menu, Report). Ensure the layout is responsive (sidebar collapses below 768px). Provide a 404 and "Not authorized" page.

**Acceptance Criteria:**
- Header shows shop name, user display name, role badge, and Log out button.
- Clicking Log out clears the session and navigates to `/login`.
- Cashier sees nav links only for Order and Orders; Admin sees all four links.
- Layout is usable on viewports from 768px to 1920px and remains functional below 768px in a stacked layout.
- A "Not authorized" page is shown when a Cashier visits an Admin-only route directly.
- All primary action controls meet 44x44px minimum tap target on tablet.

---

### Task 5 — Menu Management (Categories, Products, Modifiers) (PC-5)

**Description:** Implement the Admin-only `/menu` screen. Provide a Categories panel (list + create/rename/delete; deletion blocked when products exist with a clear explanation). Provide a Products panel (grid or table) supporting create / edit / delete with React Hook Form + Zod (name 1–80, description ≤200, price >0 with 2 decimals, category select, availability toggle, optional emoji/icon). Implement a Modifiers section: define a modifier with name and options (each with optional price delta), and attach zero or more modifiers to a product. All changes persist via `menuStore`. Show toasts for create/update/delete, confirmation dialogs for destructive actions, and a warning when creating a duplicate-named product in the same category.

**Acceptance Criteria:**
- Admin can create, rename, and delete categories; delete is blocked when products exist with a clear message.
- Admin can create / edit / delete products with full validation per the requirements doc.
- Marking a product unavailable hides it from the Cashier menu (verified after Task 6 lands, but the toggle works and persists now).
- Admin can create a "Size" modifier with three options (e.g., Small / Medium +0.50 / Large +1.00) and attach it to a product.
- Negative price delta on a modifier option is allowed but shows a warning.
- Two products with the same name in the same category show a warning before saving the second.
- All menu data survives a page reload.
- Cashier accessing `/menu` is blocked.

---

### Task 6 — Order Creation Screen with Modifier Dialog (PC-6)

**Description:** Build the `/order` screen. Show available products grouped by category with a tab/filter at the top. Tapping a product opens a modifier dialog if the product has modifiers (one option per modifier required); otherwise it is added directly with quantity 1. Show the current order in a side panel on tablets/desktop and a collapsible drawer below 768px. Each line item shows name, modifiers, quantity controls, unit price, line total, a remove button (with confirm), and a notes field (≤140 chars). Merge identical line items (same product + modifiers + identical notes) into a single line with combined quantity. Continuously show subtotal, tax (0% for MVP), and total. Provide "Clear Order" (with confirm) and "Pay" (disabled when empty) buttons. The in-progress order persists via `cartStore`.

**Acceptance Criteria:**
- Menu shows only `available === true` products.
- Tapping a product with modifiers opens the dialog and blocks add until all modifiers are chosen.
- Adding 3 different products and changing quantities updates the running total correctly.
- Decrementing quantity to 0 removes the line item.
- Notes on a line item persist until payment.
- Identical line items (same product, same modifiers, same notes) merge into one line with combined quantity; different notes keep them separate.
- "Clear Order" empties the order after confirmation.
- "Pay" is disabled when the order has no items.
- Reloading the browser mid-order preserves the cart.

---

### Task 7 — Payment Screen with Cash / Card / Mobile Flow (PC-7)

**Description:** Build the `/payment` screen reachable from the order via Pay. Show the order summary (line items, subtotal, tax, total) and three payment method buttons (Cash, Card, Mobile). Cash mode shows an `amountTendered` numeric input; the Complete Payment button is disabled unless `amountTendered >= total`; show calculated change. Card and Mobile show a brief (≤1s) visual confirmation and then enable completion immediately. On Complete Payment, persist the order via `ordersStore` (sequential per-day order number, status `Pending`, payment method, timestamp), clear the cart, and navigate to `/receipt/:orderId`. Provide a Cancel button that returns to `/order` with the cart intact. Disable the Complete button while processing (prevent double-click duplicates).

**Acceptance Criteria:**
- Selecting Cash and entering an amount equal to the total enables Complete Payment.
- Selecting Cash and entering less than the total keeps Complete Payment disabled and shows a validation message.
- Selecting Card and clicking Complete Payment finalizes the order within 1 second.
- Completing payment creates a new order visible on the Orders screen with status `Pending` and a unique per-day order number.
- Cancelling out returns to `/order` with the cart unchanged.
- Double-clicking Complete Payment results in only one order created.
- Cash amounts with more than 2 decimal places display rounded but compute change exactly.

---

### Task 8 — Receipt Screen with Print-Optimized Stylesheet (PC-8)

**Description:** Build `/receipt/:orderId`. The receipt shows shop name ("POS Coffee"), order number, date & time, all line items (name, modifiers, quantity, unit price, line total), subtotal, tax, total, payment method, amount tendered & change due (Cash only), and a "Thank you" footer. Provide a "Print" button that calls `window.print()` and a print-only CSS stylesheet that hides navigation, header, sidebar, and buttons; the receipt prints cleanly on standard letter paper. Provide a "New Order" button that returns to `/order` with a cleared cart. Re-opening a past receipt from Order Management detail (Task 9) must show identical content.

**Acceptance Criteria:**
- After completing payment, the Receipt screen displays all required fields correctly.
- Clicking Print opens the browser print dialog; print preview excludes navigation and buttons and the receipt fits on one page for typical orders.
- Cash receipts show tendered amount and change due; Card and Mobile receipts do not.
- Notes appear under the relevant line item on the receipt.
- "New Order" returns to `/order` with an empty cart.
- A 20+ line-item order scrolls on screen and paginates correctly on print.

---

### Task 9 — Order Management Screen with Status Transitions (PC-9)

**Description:** Build `/orders` showing all orders created today (local time). Each row shows order number, creation time, item count, total, payment method, and status (Pending / Preparing / Completed / Cancelled). Provide sort (newest first by default) and a status filter. Clicking a row opens a detail view with line items, modifiers, notes, payment method, all status-change timestamps, and a "View Receipt" link (non-cancelled orders only). Allow valid status transitions: Pending → Preparing → Completed; any non-Completed order may be transitioned to Cancelled. Completed and Cancelled are terminal. Cancelling requires confirmation. Cancelled orders are visually distinct (greyed out / strikethrough) and excluded from revenue/top-items calculations elsewhere. Empty state shows "No orders today yet".

**Acceptance Criteria:**
- After completing a payment, the new order appears at the top of `/orders` with status `Pending`.
- Changing status from Pending → Preparing updates the row immediately.
- A Completed order shows no further status-change controls.
- Cancelled orders are visually distinct.
- The Orders list shows only orders from today (local 00:00–23:59) and uses the order creation timestamp.
- Detail view shows all status-change timestamps.
- "View Receipt" link works for non-cancelled orders and reopens the same receipt content.
- Empty day shows the empty-state message.

---

### Task 10 — Daily Report Screen & Final Polish (PC-10)

**Description:** Build the Admin-only `/report` screen showing the current date prominently and the day's metrics: total revenue (sum of totals of non-cancelled orders), order count, average order value, top 5 products by quantity (ties broken by revenue), and a payment-method breakdown (count and revenue per Cash / Card / Mobile). Exclude Cancelled orders from all calculations. Empty day shows "$0.00", "0 orders", and an empty-state message. Add final polish: ensure all destructive actions confirm, all state-changing actions show a toast, role-based route guards are airtight, loading/empty states are consistent, the warm coffee-shop aesthetic is applied everywhere, and `next build` is clean with no TS errors. Update `package.json` scripts as needed.

**Acceptance Criteria:**
- Total revenue equals the sum of totals of all non-cancelled orders shown on `/orders` for today.
- Top-items list shows the five products with the highest sold quantities for today (ties broken by revenue).
- Cancelling an order on `/orders` removes its contribution from `/report` on next view.
- Empty day shows "$0.00", "0 orders", and the empty-state message.
- Payment-method breakdown sums match the total revenue.
- Cashier accessing `/report` is blocked.
- `next build` and `next lint` complete with no errors.
- All screens are responsive from 768px to 1920px with graceful degradation below 768px.

---

## 4. Development Order & Dependencies

```
PC-1 (Scaffold)
  └─► PC-2 (Types + Stores + Seed)
        └─► PC-3 (Auth + Login + Guards)
              └─► PC-4 (App Shell + Nav)
                    ├─► PC-5 (Menu Management)
                    │     └─► PC-6 (Order Creation, needs menu data)
                    │           └─► PC-7 (Payment)
                    │                 └─► PC-8 (Receipt)
                    │                       └─► PC-9 (Order Management)
                    │                             └─► PC-10 (Daily Report + Polish)
```

Tasks must be implemented in numeric order. Each PR is reviewed by the Tester Agent and approved by the user before merge.

## 5. Definition of Done (Per Task)

A task is Done when:
1. All acceptance criteria are met.
2. Code follows the project's tech stack and folder conventions.
3. `next build` succeeds with no TypeScript errors on the feature branch.
4. The PR has been reviewed by the Tester Agent with a score >= 7/10.
5. The user has approved the PR for merge.
6. The PR is merged into `main` and the corresponding Jira issue is moved to Done.
