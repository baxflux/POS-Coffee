"use client"

import { useMemo, useState } from "react"
import { CreditCard, Receipt, ShoppingBag, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/menu/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/order-validation"
import { useCartStore } from "@/stores"
import type { OrderLineItem } from "@/types"

import { CartLineItem } from "./cart-line-item"

interface OrderSummaryProps {
  /** Compact variant is used inside the mobile drawer (no card chrome). */
  variant?: "panel" | "drawer"
}

/**
 * Right-hand side cart panel.
 *
 * Shows every line item, exposes quantity controls + notes, totals, and the
 * Clear / Pay buttons. The Pay button stays disabled until at least one line
 * is in the order.
 */
export function OrderSummary({ variant = "panel" }: OrderSummaryProps) {
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const updateNotes = useCartStore((state) => state.updateNotes)
  const removeItem = useCartStore((state) => state.removeItem)
  const clear = useCartStore((state) => state.clear)

  const [pendingRemove, setPendingRemove] = useState<OrderLineItem | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
    const tax = 0 // MVP — no tax line. Reserved for future tasks.
    const total = subtotal + tax
    return { subtotal, tax, total }
  }, [items])

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const handleIncrement = (lineId: string) => {
    const item = items.find((line) => line.id === lineId)
    if (!item) return
    updateQuantity(lineId, item.quantity + 1)
  }

  const handleDecrement = (lineId: string) => {
    const item = items.find((line) => line.id === lineId)
    if (!item) return
    // Stays >= 1 — actual removal is via the trash button.
    if (item.quantity <= 1) return
    updateQuantity(lineId, item.quantity - 1)
  }

  const confirmRemove = () => {
    if (!pendingRemove) return
    const name = pendingRemove.productName
    removeItem(pendingRemove.id)
    toast.success(`Removed ${name} from the order.`)
    setPendingRemove(null)
  }

  const confirmClearOrder = () => {
    clear()
    toast.success("Order cleared.")
    setConfirmClear(false)
  }

  const isEmpty = items.length === 0
  const wrapperClasses =
    variant === "panel"
      ? "border-border/70 bg-card/80 sticky top-4 flex h-fit min-h-[24rem] flex-col gap-3 rounded-2xl border p-4 shadow-sm"
      : "flex h-full flex-col gap-3"

  return (
    <aside
      aria-label="Current order"
      data-testid="order-summary"
      className={wrapperClasses}
    >
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="bg-secondary text-secondary-foreground inline-flex size-9 items-center justify-center rounded-xl"
          >
            <Receipt className="size-4" />
          </span>
          <div className="grid">
            <span className="text-foreground text-sm font-semibold">
              Current order
            </span>
            <span className="text-muted-foreground text-xs">
              {isEmpty
                ? "No items yet"
                : `${itemCount} item${itemCount === 1 ? "" : "s"} · ${items.length} line${items.length === 1 ? "" : "s"}`}
            </span>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setConfirmClear(true)}
          disabled={isEmpty}
          aria-label="Clear order"
          data-testid="clear-order-button"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          Clear
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto pr-1">
        {isEmpty ? (
          <div className="border-border/70 text-muted-foreground flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center">
            <span
              aria-hidden="true"
              className="bg-muted text-muted-foreground inline-flex size-9 items-center justify-center rounded-xl"
            >
              <ShoppingBag className="size-4" />
            </span>
            <p className="text-foreground text-sm font-medium">
              Order is empty
            </p>
            <p className="max-w-xs text-xs">
              Tap a product to add it. Pick options if prompted, then it lands
              here ready for checkout.
            </p>
          </div>
        ) : (
          <ul className="grid gap-2">
            {items.map((item) => (
              <CartLineItem
                key={item.id}
                item={item}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onNotesChange={updateNotes}
                onRequestRemove={setPendingRemove}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-2">
        <Separator />
        <dl className="grid gap-1 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd
              data-testid="order-subtotal"
              className="text-foreground font-medium tabular-nums"
            >
              {formatCurrency(totals.subtotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Tax</dt>
            <dd className="text-muted-foreground tabular-nums">
              {formatCurrency(totals.tax)}
            </dd>
          </div>
          <Separator className="my-1" />
          <div className="flex items-center justify-between text-base">
            <dt className="text-foreground font-semibold">Total</dt>
            <dd
              data-testid="order-total"
              className="text-foreground font-semibold tabular-nums"
            >
              {formatCurrency(totals.total)}
            </dd>
          </div>
        </dl>

        <Button
          type="button"
          className="mt-1 w-full"
          size="lg"
          disabled={isEmpty}
          data-testid="pay-button"
          onClick={() =>
            toast.info("Payment flow lands in PC-7. Your order is ready.")
          }
        >
          <CreditCard className="size-4" aria-hidden="true" />
          Pay {!isEmpty ? formatCurrency(totals.total) : null}
        </Button>
      </div>

      <ConfirmDialog
        open={pendingRemove !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRemove(null)
        }}
        title="Remove this item?"
        description={
          <span>
            <strong>{pendingRemove?.productName}</strong> will be removed from
            the order. You can add it again from the menu.
          </span>
        }
        confirmLabel="Remove"
        cancelLabel="Keep"
        variant="destructive"
        onConfirm={confirmRemove}
      />

      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="Clear the order?"
        description="Every line will be removed. This cannot be undone."
        confirmLabel="Clear order"
        cancelLabel="Keep working"
        variant="destructive"
        onConfirm={confirmClearOrder}
      />
    </aside>
  )
}
