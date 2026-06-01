"use client"

import { useRef, useState } from "react"
import { ArrowLeft, Loader2, Receipt } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/order-validation"
import { useAuthStore, useCartStore, useOrdersStore } from "@/stores"
import type { PaymentMethod } from "@/types"

import { CardMobilePaymentPanel } from "./card-mobile-payment-panel"
import { CashPaymentPanel } from "./cash-payment-panel"
import { OrderSummaryPanel } from "./order-summary-panel"
import { PaymentMethodSelector } from "./payment-method-selector"

/** Simulated processing delay for Card / Mobile flows (ms). */
const PROCESSING_DELAY_MS = 800

/**
 * Top-level orchestrator for the /payment screen.
 *
 * Layout:
 *   - >= 1024px: two-column — order summary on the left, payment controls
 *     on the right.
 *   - < 1024px: single column, summary first then controls.
 *
 * Double-click protection: `isProcessing` is a React state that disables all
 * controls while a payment is in flight. An additional `orderCreatedRef` ref
 * ensures `createOrder` is called at most once even if React batches or
 * re-renders unexpectedly.
 */
export function PaymentWorkspace() {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clear)
  const createOrder = useOrdersStore((state) => state.createOrder)
  const session = useAuthStore((state) => state.session)

  const [method, setMethod] = useState<PaymentMethod>("cash")
  const [isProcessing, setIsProcessing] = useState(false)

  // Guards against creating a second order if the cashier double-clicks.
  const orderCreatedRef = useRef(false)

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
  const tax = 0 // MVP — no tax
  const total = subtotal + tax

  const commitOrder = () => {
    if (orderCreatedRef.current) return
    if (!session) {
      toast.error("You must be logged in to process a payment.")
      return
    }
    orderCreatedRef.current = true
    setIsProcessing(true)

    const order = createOrder({
      items,
      cashierId: session.userId,
      cashierName: session.displayName,
    })

    clearCart()
    toast.success(
      `Order ${order.ticketNumber} placed — ${formatCurrency(order.total)}.`
    )
    router.push("/orders")
  }

  const handleCashComplete = () => {
    if (orderCreatedRef.current || isProcessing) return
    commitOrder()
  }

  const handleCardMobileComplete = () => {
    if (orderCreatedRef.current || isProcessing) return
    if (!session) {
      toast.error("You must be logged in to process a payment.")
      return
    }
    orderCreatedRef.current = true
    setIsProcessing(true)

    setTimeout(() => {
      const order = createOrder({
        items,
        cashierId: session.userId,
        cashierName: session.displayName,
      })
      clearCart()
      toast.success(
        `Order ${order.ticketNumber} placed — ${formatCurrency(order.total)}.`
      )
      router.push("/orders")
    }, PROCESSING_DELAY_MS)
  }

  const handleMethodChange = (next: PaymentMethod) => {
    if (isProcessing) return
    setMethod(next)
  }

  const handleCancel = () => {
    if (isProcessing) return
    router.push("/order")
  }

  if (items.length === 0 && !isProcessing) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="border-border/70 bg-card/60 text-muted-foreground flex min-h-48 items-center justify-center gap-2 rounded-2xl border p-8 text-sm"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        <span>Loading payment screen…</span>
      </div>
    )
  }

  return (
    <div
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"
      data-testid="payment-workspace"
    >
      {/* Left column — order summary */}
      <section
        aria-label="Order summary"
        className="border-border/70 bg-card/80 flex flex-col gap-4 rounded-2xl border p-5 shadow-sm"
      >
        <header className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="bg-secondary text-secondary-foreground inline-flex size-9 items-center justify-center rounded-xl"
          >
            <Receipt className="size-4" />
          </span>
          <div className="grid">
            <span className="text-foreground text-sm font-semibold">
              Order summary
            </span>
            <span className="text-muted-foreground text-xs">
              {items.reduce((n, item) => n + item.quantity, 0)} item
              {items.reduce((n, item) => n + item.quantity, 0) === 1 ? "" : "s"}
            </span>
          </div>
        </header>

        <Separator />

        <OrderSummaryPanel
          items={items}
          subtotal={subtotal}
          tax={tax}
          total={total}
        />
      </section>

      {/* Right column — payment controls */}
      <aside
        aria-label="Payment"
        className="border-border/70 bg-card/80 sticky top-4 flex h-fit flex-col gap-5 rounded-2xl border p-5 shadow-sm"
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-foreground text-base font-semibold">Payment</h2>
          <p className="text-muted-foreground text-xs">
            Select a payment method and complete the transaction.
          </p>
        </div>

        <PaymentMethodSelector
          value={method}
          onChange={handleMethodChange}
          disabled={isProcessing}
        />

        <Separator />

        {method === "cash" ? (
          <CashPaymentPanel
            total={total}
            onComplete={handleCashComplete}
            disabled={isProcessing}
          />
        ) : (
          <CardMobilePaymentPanel
            method={method}
            total={total}
            onComplete={handleCardMobileComplete}
            isProcessing={isProcessing}
          />
        )}

        <Separator />

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isProcessing}
          data-testid="cancel-payment-button"
          onClick={handleCancel}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to order
        </Button>
      </aside>
    </div>
  )
}
