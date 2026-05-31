/**
 * Pure money/totals helpers.
 *
 * Kept framework-free so they can be unit-tested and reused from any
 * store, component, or report. Numbers are rounded to two decimals at the
 * helper boundary to avoid floating-point drift accumulating across many
 * line items.
 */

import type { AppliedModifier, Order, OrderLineItem } from "@/types"

/** Round to 2 decimals using "round half away from zero" (currency rule). */
export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/**
 * Unit price for one line including selected modifiers.
 *
 * @returns base + sum(modifier price deltas), rounded.
 */
export function computeUnitPrice(
  unitBasePrice: number,
  modifiers: AppliedModifier[]
): number {
  const modifierSum = modifiers.reduce(
    (sum, modifier) => sum + modifier.priceDelta,
    0
  )
  return roundCurrency(unitBasePrice + modifierSum)
}

/**
 * Total cost for a line item (unit price * quantity).
 */
export function computeLineTotal(
  line: Pick<OrderLineItem, "unitBasePrice" | "quantity" | "modifiers">
): number {
  const unit = computeUnitPrice(line.unitBasePrice, line.modifiers)
  return roundCurrency(unit * line.quantity)
}

export interface OrderTotals {
  subtotal: number
  discount: number
  total: number
}

/**
 * Aggregate totals for an in-progress or completed order. `discount` is
 * passed in because cart and order screens treat it differently; today it
 * is always 0 in the MVP but the shape is preserved for future tasks.
 */
export function computeOrderTotals(
  items: Pick<OrderLineItem, "unitBasePrice" | "quantity" | "modifiers">[],
  discount = 0
): OrderTotals {
  const subtotal = roundCurrency(
    items.reduce((sum, item) => sum + computeLineTotal(item), 0)
  )
  const safeDiscount = roundCurrency(Math.max(0, Math.min(discount, subtotal)))
  const total = roundCurrency(subtotal - safeDiscount)
  return { subtotal, discount: safeDiscount, total }
}

/**
 * Total revenue across a list of orders. Cancelled orders are skipped.
 */
export function sumOrderRevenue(orders: Order[]): number {
  return roundCurrency(
    orders
      .filter((order) => order.status !== "cancelled")
      .reduce((sum, order) => sum + order.total, 0)
  )
}
