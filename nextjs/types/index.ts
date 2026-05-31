/**
 * Shared domain types for POS-Coffee.
 *
 * All cross-cutting types live here. Components, stores, and lib helpers
 * must import from `@/types` rather than re-declaring shapes locally.
 */

// ---------- Identity & users ----------

export type Role = "admin" | "cashier"

export interface BaseEntity {
  id: string
  createdAt: string
}

export interface User extends BaseEntity {
  username: string
  displayName: string
  role: Role
  /** Plain-text only because this MVP has no backend. Do not use in prod. */
  password: string
}

// ---------- Menu domain ----------

export interface Category extends BaseEntity {
  name: string
  /** Optional sort order for stable display. Lower comes first. */
  sortOrder: number
}

export interface ModifierOption {
  id: string
  name: string
  /** Extra cost added to the line item price when selected. May be 0. */
  priceDelta: number
}

/**
 * A reusable modifier (e.g. "Size", "Milk"). Currently every modifier is
 * single-select (`"single"`); kept as a union so future tasks can add
 * `"multiple"` without breaking the shape.
 */
export interface Modifier extends BaseEntity {
  name: string
  selectionType: "single"
  required: boolean
  options: ModifierOption[]
}

export interface Product extends BaseEntity {
  name: string
  description: string
  basePrice: number
  categoryId: string
  /** IDs of modifiers from the menu store that apply to this product. */
  modifierIds: string[]
  /** Soft-delete flag — keeps historical orders valid. */
  active: boolean
}

// ---------- Orders & cart ----------

export type OrderStatus = "preparing" | "ready" | "completed" | "cancelled"

export type PaymentMethod = "cash" | "card" | "mobile"

/**
 * A single selection on a line item, captured at order time so historical
 * orders survive future menu edits.
 */
export interface AppliedModifier {
  modifierId: string
  modifierName: string
  optionId: string
  optionName: string
  priceDelta: number
}

export interface OrderLineItem {
  id: string
  productId: string
  productName: string
  unitBasePrice: number
  quantity: number
  modifiers: AppliedModifier[]
  notes: string
  /** Cached total for the line — `(unitBasePrice + sum(modifiers)) * quantity`. */
  lineTotal: number
}

export interface Order extends BaseEntity {
  /** Short, human-friendly ticket label (e.g. "T-0042"). */
  ticketNumber: string
  items: OrderLineItem[]
  subtotal: number
  /** Reserved for future tax/discount logic; zero in the MVP. */
  discount: number
  total: number
  status: OrderStatus
  paymentMethod: PaymentMethod | null
  cashierId: string
  cashierName: string
  /** ISO timestamps for status transitions, used by the orders screen. */
  updatedAt: string
  paidAt: string | null
  completedAt: string | null
}

// ---------- Aggregations & reports ----------

export interface TopItem {
  productId: string
  productName: string
  quantity: number
  revenue: number
}

export interface DailyReportSummary {
  date: string
  orderCount: number
  revenue: number
  averageOrderValue: number
  topItems: TopItem[]
}
