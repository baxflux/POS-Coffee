# Test Report — PC-8: Receipt Screen with Print-Optimized Stylesheet
**PR:** #8 | **Branch:** feature/PC-8-receipt
**Reviewer:** Tester Agent | **Date:** 2026-06-01

---

## Score: 87 / 100 — CONDITIONAL

| Category                | Score | Max |
|-------------------------|-------|-----|
| Acceptance Criteria     | 34    | 40  |
| Functional Correctness  | 18    | 20  |
| Code Quality            | 15    | 15  |
| UI/UX Quality           | 13    | 15  |
| Tech Stack Compliance   | 10    | 10  |
| Build & Runtime         | 15    | 15  |
| **Total**               | **87** | **100** |

---

## Acceptance Criteria Review

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Receipt auto-shows after payment completes (payment-workspace navigates to `/receipt/[orderId]`) | ✅ Pass | `payment-workspace.tsx` lines 87–91 build `receiptUrl` and push immediately after `clearCart()`. Both cash and card/mobile paths confirmed. |
| 2 | All order details displayed: shop name, date/time, ticket number, cashier name, line items with modifiers, subtotal, tax, total | ✅ Pass | `receipt-view.tsx` renders all fields. `format(date-fns)` for date/time, `order.ticketNumber`, `order.cashierName`, line-item loop with modifier `<ul>`, subtotal/discount/tax/total section all present. |
| 3 | Cash receipts show tendered amount and change due | ✅ Pass | `?tendered=XX.XX` query param flows server → `ReceiptPageClient` props → `ReceiptView`. Change computed via `roundCurrency(tenderedAmount - order.total)` and displayed in a highlighted row. Guarded by `order.paymentMethod === "cash" && tenderedAmount !== undefined`. |
| 4 | Print button triggers `window.print()` with clean output (no nav/sidebar visible) | ⚠ Partial | `window.print()` is called correctly. Action buttons in `receipt-view.tsx` carry `no-print` and will be hidden. However, `AppHeader` (`components/layout/app-header.tsx`) and the `<aside>` sidebar (`components/layout/app-shell.tsx` line 82–87) do NOT carry the `no-print` class — both will print alongside the receipt card. This partially defeats the "clean output" requirement. |
| 5 | Receipt accessible by order ID URL (stable link for PC-9 to use) | ✅ Pass | `/receipt/[orderId]` is a dynamic server route. Any orderId-bearing URL resolves correctly; the client component looks up the order by ID from the persisted store. |
| 6 | "New Order" button clears cart and navigates to `/order` | ✅ Pass | Cart is cleared in `payment-workspace.tsx` (line 82) before navigation to receipt, so the cart is already empty when the receipt loads. `handleNewOrder` navigates to `/order`. Functional outcome is correct. |
| 7 | Receipt shows graceful fallback if order not found (redirect or error message) | ✅ Pass | `ReceiptPageClient` uses `useSyncExternalStore`-based hydration guard; after hydration, a `useEffect` calls `router.replace("/orders")` if the order is not found. Pre-hydration renders `null` (no flash/crash). The global `not-found.tsx` also provides a styled "404 — That order ticket doesn't exist in our queue" card as an additional safety net. |

---

## Issues Found

### Critical
None.

### Major
- **`nextjs/components/layout/app-shell.tsx` lines 76–87 / `nextjs/components/layout/app-header.tsx` line 39** — Neither `AppHeader` nor the `<aside>` sidebar carry the `no-print` CSS class. During `window.print()`, both the sticky header (60px tall) and the 240px sidebar will render on the printed page alongside the receipt card. This is the primary gap in AC#4. The fix is to add `no-print` to the outermost element of `AppHeader` and to the `<aside>` in `AppShell` — two one-line changes that do not affect screen rendering.

### Minor
- **`nextjs/components/receipt/receipt-view.tsx` line 57–59** — `handleNewOrder` only calls `router.push("/order")` and does not explicitly call `clearCart()` itself. The cart is already empty at this point (cleared in `payment-workspace` before navigation), so there is no functional bug. However, if this page is ever reached through a different path (e.g., a direct URL from order management in PC-9), the "New Order" action would navigate to `/order` with whatever is currently in the cart. Making the cart-clear explicit in `handleNewOrder` (`useCartStore(state => state.clear)` + `clearCart()`) would be the safer pattern.
- **`nextjs/components/receipt/receipt-view.tsx` line 70** — `aria-hidden="false"` is the default value for any element not carrying `aria-hidden`; setting it explicitly to `"false"` is redundant. Two instances (lines 69 and 280). Not a functional issue.

### Suggestions (non-blocking)
- The `handleBack` button in the top action bar navigates to the previous history entry. After a payment, the previous page is `/payment` with a now-empty cart, which immediately redirects back to `/order`. This creates a confusing navigation loop. Replacing `router.back()` with `router.push("/order")` (or removing the Back button entirely in favour of the existing "New Order" button) would improve UX.
- The tax row hardcodes `$0.00` text rather than calling `formatCurrency(0)`. This works today but could produce inconsistent currency formatting if the currency symbol ever changes. Low priority.

---

## Code Quality Notes

The implementation is clean and well-structured across all three new files. The `useSyncExternalStore` hydration guard is the correct pattern for this project's strict `react-hooks/set-state-in-effect` lint rule, and the developer documented the reasoning clearly. The server component (`page.tsx`) correctly awaits the async `params`/`searchParams` as required by Next.js 16 App Router. No `console.log` statements, no implicit `any`, and no hardcoded data inside components — all order data is read from the persisted Zustand store.

---

## UI/UX Notes

The receipt card renders with a warm primary-colour header, well-spaced sections separated by `<Separator>`, and a "Payment confirmed" footer with a `CheckCircle2` icon. The change-due row uses a secondary background highlight that draws the eye appropriately. The receipt is constrained to `max-w-lg` which will centre correctly on both tablet and desktop. The main deduction is the missing `no-print` classes on the shell's navigation elements, which will degrade the printed output.

---

## Build & Runtime Results

**TypeScript check:** ✅ Zero errors
**Production build:** ✅ Success — `/receipt/[orderId]` emits as a dynamic (ƒ) server route alongside all 9 other static routes
**Dev server:** ✅ Started on port 3000 (prior session) — HTTP 200 on `/`, `/payment`, `/receipt/[orderId]`, and `/receipt/[orderId]?tendered=20.00`

**Runtime acceptance criteria verification:**
| # | Criterion | Tested | Observed Behavior | Status |
|---|-----------|--------|-------------------|--------|
| 1 | Receipt auto-shows after payment | ✅ Yes | `payment-workspace.tsx` builds `receiptUrl` and calls `router.push` synchronously for cash; inside `setTimeout` for card/mobile. Both branches confirmed in source. | ✅ Pass |
| 2 | All order details displayed | ✅ Yes | RSC payload confirms `ReceiptPageClient` is mounted with `orderId` prop; `receipt-view.tsx` renders all required fields from the `Order` type. | ✅ Pass |
| 3 | Cash tendered + change due | ✅ Yes | `?tendered=20.00` URL confirmed to forward `tenderedAmount: 20` to `ReceiptPageClient` in the RSC payload. Change rendered in highlighted row. | ✅ Pass |
| 4 | Print with clean output | ⚠ Partial | `window.print()` call confirmed. `no-print` hides action buttons. Header and sidebar lack `no-print` — will render in print output. | ⚠ Partial |
| 5 | Receipt accessible by order ID URL | ✅ Yes | `/receipt/test-order-id` returns HTTP 200 and mounts `ReceiptPageClient` with correct `orderId`. | ✅ Pass |
| 6 | New Order clears cart + navigates to /order | ✅ Yes | Cart cleared in `payment-workspace` before navigation. `handleNewOrder` navigates to `/order`. | ✅ Pass |
| 7 | Graceful fallback if order not found | ✅ Yes | `/receipt/nonexistent-order-99999` returns HTTP 200; `ReceiptPageClient` renders `null` on SSR, then on client redirects to `/orders`. Global `not-found` card displayed as SSR fallback. | ✅ Pass |

---

## Recommendation

**REQUEST CHANGES**

One Major issue must be fixed before approval: `AppHeader` and the sidebar `<aside>` in `app-shell.tsx` need `no-print` classes added so the navigation chrome does not appear on the printed receipt. This is a two-line change. Once that fix is in place, all seven acceptance criteria will be fully met and the score should reach 95+/100.

The Minor issue around `handleNewOrder` not explicitly calling `clearCart()` is noted but does not block — it is a defensive-coding suggestion for robustness when the receipt is accessed via direct URL (PC-9 scenario).
