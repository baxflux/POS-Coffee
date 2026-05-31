/**
 * Order-list helpers — filtering and aggregation used by the orders and
 * report screens. All helpers are pure so they can be called from stores,
 * components, or unit tests without React in scope.
 */

import {
  endOfDay,
  isAfter,
  isBefore,
  isEqual,
  parseISO,
  startOfDay,
} from "date-fns"

import type { Order, TopItem } from "@/types"
import { roundCurrency } from "@/lib/totals"

/**
 * Filter orders to those created on the same calendar day as `reference`.
 * Uses the host's local timezone, which matches how a single coffee shop
 * runs its day-end report.
 */
export function filterOrdersForDay(orders: Order[], reference: Date): Order[] {
  const dayStart = startOfDay(reference)
  const dayEnd = endOfDay(reference)
  return orders.filter((order) => {
    const created = parseISO(order.createdAt)
    if (Number.isNaN(created.getTime())) return false
    const afterStart = isAfter(created, dayStart) || isEqual(created, dayStart)
    const beforeEnd = isBefore(created, dayEnd) || isEqual(created, dayEnd)
    return afterStart && beforeEnd
  })
}

/** Convenience wrapper around `filterOrdersForDay` for "today". */
export function filterTodaysOrders(orders: Order[]): Order[] {
  return filterOrdersForDay(orders, new Date())
}

/**
 * Aggregate the top-selling items across a list of orders.
 *
 * Cancelled orders are skipped; quantities and revenue are summed by
 * product id. Results are sorted by quantity desc, then by product name
 * asc for a stable secondary sort.
 */
export function computeTopItems(orders: Order[], limit = 5): TopItem[] {
  const tally = new Map<string, TopItem>()

  for (const order of orders) {
    if (order.status === "cancelled") continue
    for (const line of order.items) {
      const existing = tally.get(line.productId)
      if (existing) {
        existing.quantity += line.quantity
        existing.revenue = roundCurrency(existing.revenue + line.lineTotal)
      } else {
        tally.set(line.productId, {
          productId: line.productId,
          productName: line.productName,
          quantity: line.quantity,
          revenue: roundCurrency(line.lineTotal),
        })
      }
    }
  }

  return Array.from(tally.values())
    .sort((a, b) => {
      if (b.quantity !== a.quantity) return b.quantity - a.quantity
      return a.productName.localeCompare(b.productName)
    })
    .slice(0, limit)
}
