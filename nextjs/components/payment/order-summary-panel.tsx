import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/order-validation"
import { computeUnitPrice } from "@/lib/totals"
import type { OrderLineItem } from "@/types"

interface OrderSummaryPanelProps {
  items: OrderLineItem[]
  subtotal: number
  tax: number
  total: number
}

/**
 * Read-only order summary for the payment screen.
 *
 * Shows every line item with its quantity, unit price, modifiers, and line
 * total, followed by the subtotal / tax / total footer. No interactive
 * controls — those live on the /order screen.
 */
export function OrderSummaryPanel({
  items,
  subtotal,
  tax,
  total,
}: OrderSummaryPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <ul className="grid gap-2" aria-label="Order items">
        {items.map((item) => {
          const unitPrice = computeUnitPrice(item.unitBasePrice, item.modifiers)
          return (
            <li
              key={item.id}
              data-testid={`summary-line-${item.id}`}
              className="border-border/70 bg-card/60 grid gap-2 rounded-xl border p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="grid gap-0.5">
                  <span className="text-foreground text-sm font-semibold leading-tight">
                    {item.productName}
                  </span>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {item.quantity} &times; {formatCurrency(unitPrice)}
                  </span>
                </div>
                <span
                  className="text-foreground text-sm font-semibold tabular-nums"
                  data-testid={`summary-line-total-${item.id}`}
                >
                  {formatCurrency(item.lineTotal)}
                </span>
              </div>

              {item.modifiers.length > 0 ? (
                <ul className="text-muted-foreground grid gap-0.5 text-xs">
                  {item.modifiers.map((modifier) => (
                    <li key={`${item.id}-${modifier.modifierId}`}>
                      <span className="text-foreground/80">
                        {modifier.modifierName}:
                      </span>{" "}
                      {modifier.optionName}
                      {modifier.priceDelta !== 0 ? (
                        <span className="ml-1 tabular-nums">
                          ({modifier.priceDelta > 0 ? "+" : ""}
                          {formatCurrency(modifier.priceDelta)})
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}

              {item.notes ? (
                <p className="text-muted-foreground text-xs italic">
                  &ldquo;{item.notes}&rdquo;
                </p>
              ) : null}
            </li>
          )
        })}
      </ul>

      <Separator />

      <dl className="grid gap-1 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd
            className="text-foreground font-medium tabular-nums"
            data-testid="payment-subtotal"
          >
            {formatCurrency(subtotal)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Tax</dt>
          <dd className="text-muted-foreground tabular-nums">
            {formatCurrency(tax)}
          </dd>
        </div>
        <Separator className="my-1" />
        <div className="flex items-center justify-between text-base">
          <dt className="text-foreground font-semibold">Total</dt>
          <dd
            className="text-foreground text-lg font-semibold tabular-nums"
            data-testid="payment-total"
          >
            {formatCurrency(total)}
          </dd>
        </div>
      </dl>
    </div>
  )
}
