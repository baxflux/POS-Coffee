"use client"

import { format } from "date-fns"
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Printer,
  ShoppingBag,
  Smartphone,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/order-validation"
import { roundCurrency } from "@/lib/totals"
import { useCartStore } from "@/stores"
import type { Order } from "@/types"

interface ReceiptViewProps {
  order: Order
  /** Pre-filled only when navigating directly from a cash payment. */
  tenderedAmount?: number
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  mobile: "Mobile Pay",
}

function PaymentMethodIcon({ method }: { method: string }) {
  if (method === "card") return <CreditCard className="size-4" aria-hidden />
  if (method === "mobile") return <Smartphone className="size-4" aria-hidden />
  return <ShoppingBag className="size-4" aria-hidden />
}

/**
 * ReceiptView — renders a thermal-style receipt card.
 *
 * The wrapping `<div>` uses the `receipt-print-area` class so the
 * `@media print` rules in globals.css can isolate it and hide everything
 * else (nav, sidebar, action buttons).
 */
export function ReceiptView({ order, tenderedAmount }: ReceiptViewProps) {
  const router = useRouter()
  const clearCart = useCartStore((state) => state.clear)

  const change =
    order.paymentMethod === "cash" && tenderedAmount !== undefined
      ? roundCurrency(tenderedAmount - order.total)
      : null

  const handlePrint = () => {
    window.print()
  }

  const handleNewOrder = () => {
    clearCart()
    router.push("/order")
  }

  const handleBack = () => {
    router.push("/order")
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      {/* Action bar — hidden during print */}
      <div className="no-print flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBack}
          data-testid="receipt-back-button"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </Button>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            data-testid="receipt-print-button"
          >
            <Printer className="size-4" aria-hidden />
            Print
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleNewOrder}
            data-testid="receipt-new-order-button"
          >
            New Order
          </Button>
        </div>
      </div>

      {/* Receipt card */}
      <div
        className="receipt-print-area border-border/70 bg-card flex flex-col gap-0 overflow-hidden rounded-2xl border shadow-sm"
        data-testid="receipt-card"
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-1 bg-primary px-6 py-5 text-primary-foreground">
          <span className="text-xl font-bold tracking-wide">Brew & Bite</span>
          <span className="text-xs opacity-80">Your neighbourhood coffee</span>
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-6 py-4 text-xs">
          <span className="text-muted-foreground">Date</span>
          <span className="text-right font-medium tabular-nums">
            {format(new Date(order.createdAt), "dd MMM yyyy")}
          </span>

          <span className="text-muted-foreground">Time</span>
          <span className="text-right font-medium tabular-nums">
            {format(new Date(order.createdAt), "HH:mm")}
          </span>

          <span className="text-muted-foreground">Ticket</span>
          <span className="text-right font-bold tabular-nums">
            {order.ticketNumber}
          </span>

          <span className="text-muted-foreground">Cashier</span>
          <span className="text-right font-medium">{order.cashierName}</span>
        </div>

        <Separator />

        {/* Line items */}
        <div className="flex flex-col gap-3 px-6 py-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex flex-col gap-0.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-foreground text-sm font-medium">
                  {item.quantity > 1 ? (
                    <span className="text-muted-foreground mr-1 text-xs tabular-nums">
                      {item.quantity}×
                    </span>
                  ) : null}
                  {item.productName}
                </span>
                <span className="text-foreground shrink-0 text-sm tabular-nums">
                  {formatCurrency(item.lineTotal)}
                </span>
              </div>

              {item.modifiers.length > 0 ? (
                <ul className="ml-2 flex flex-col gap-0.5" aria-label="Modifiers">
                  {item.modifiers.map((mod) => (
                    <li
                      key={mod.optionId}
                      className="text-muted-foreground flex items-center gap-1 text-xs"
                    >
                      <span className="opacity-50">·</span>
                      {mod.modifierName}: {mod.optionName}
                      {mod.priceDelta !== 0 ? (
                        <span className="tabular-nums opacity-70">
                          ({mod.priceDelta > 0 ? "+" : ""}
                          {formatCurrency(mod.priceDelta)})
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}

              {item.notes ? (
                <p className="text-muted-foreground ml-2 text-xs italic">
                  Note: {item.notes}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <Separator />

        {/* Totals */}
        <div className="flex flex-col gap-2 px-6 py-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatCurrency(order.subtotal)}</span>
          </div>

          {order.discount > 0 ? (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-primary tabular-nums">
                -{formatCurrency(order.discount)}
              </span>
            </div>
          ) : null}

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span className="text-muted-foreground tabular-nums">$0.00</span>
          </div>

          <Separator className="my-1" />

          <div className="flex justify-between">
            <span className="text-foreground font-semibold">Total</span>
            <span className="text-foreground text-lg font-bold tabular-nums">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>

        <Separator />

        {/* Payment method */}
        <div className="flex flex-col gap-2 px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
              {order.paymentMethod ? (
                <PaymentMethodIcon method={order.paymentMethod} />
              ) : null}
              Payment
            </span>
            <span className="text-foreground text-sm font-medium">
              {order.paymentMethod
                ? PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod
                : "—"}
            </span>
          </div>

          {order.paymentMethod === "cash" && tenderedAmount !== undefined ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tendered</span>
                <span className="tabular-nums">
                  {formatCurrency(tenderedAmount)}
                </span>
              </div>
              {change !== null && change >= 0 ? (
                <div className="bg-secondary/60 flex items-center justify-between rounded-xl px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2
                      className="text-primary size-4 shrink-0"
                      aria-hidden
                    />
                    Change due
                  </span>
                  <span className="text-foreground text-base font-bold tabular-nums">
                    {formatCurrency(change)}
                  </span>
                </div>
              ) : null}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-1 px-6 py-5 text-center">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="text-primary size-4" aria-hidden />
            <span className="text-foreground text-sm font-semibold">
              Payment confirmed
            </span>
          </div>
          <span className="text-muted-foreground text-xs">
            Thank you for your order!
          </span>
        </div>
      </div>

      {/* Bottom action bar — hidden during print */}
      <div className="no-print flex justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrint}
          data-testid="receipt-print-button-bottom"
        >
          <Printer className="size-4" aria-hidden />
          Print Receipt
        </Button>
        <Button
          type="button"
          onClick={handleNewOrder}
          data-testid="receipt-new-order-button-bottom"
        >
          New Order
        </Button>
      </div>
    </div>
  )
}
