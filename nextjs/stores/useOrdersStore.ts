/**
 * Orders store — every order placed today plus the running ticket counter.
 *
 * Persisted to localStorage under the `pos-coffee-orders` key. Components
 * should read derived lists (e.g. today's orders, top items) via the
 * helpers in `lib/orders.ts` rather than recomputing them inline.
 */

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import type { Order, OrderLineItem, OrderStatus, PaymentMethod } from "@/types"
import { createId, formatTicketNumber } from "@/lib/ids"
import { computeOrderTotals } from "@/lib/totals"

interface OrdersState {
  orders: Order[]
  /** Monotonically increasing ticket sequence; survives reloads. */
  ticketSequence: number
}

export interface CreateOrderInput {
  items: OrderLineItem[]
  cashierId: string
  cashierName: string
  discount?: number
}

interface OrdersActions {
  /** Creates a new order in `preparing` state and returns it. */
  createOrder: (input: CreateOrderInput) => Order
  setStatus: (orderId: string, status: OrderStatus) => void
  markPaid: (orderId: string, method: PaymentMethod) => void
  cancelOrder: (orderId: string) => void
  getOrderById: (orderId: string) => Order | undefined
  /** Wipe all orders and reset the ticket counter — used by tests / reset flows. */
  reset: () => void
}

export type OrdersStore = OrdersState & OrdersActions

const initialState: OrdersState = {
  orders: [],
  ticketSequence: 0,
}

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      createOrder: ({ items, cashierId, cashierName, discount = 0 }) => {
        const totals = computeOrderTotals(items, discount)
        const nextSequence = get().ticketSequence + 1
        const now = new Date().toISOString()
        const order: Order = {
          id: createId("order"),
          createdAt: now,
          updatedAt: now,
          ticketNumber: formatTicketNumber(nextSequence),
          items,
          subtotal: totals.subtotal,
          discount: totals.discount,
          total: totals.total,
          status: "preparing",
          paymentMethod: null,
          cashierId,
          cashierName,
          paidAt: null,
          completedAt: null,
        }
        set((state) => ({
          orders: [order, ...state.orders],
          ticketSequence: nextSequence,
        }))
        return order
      },

      setStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) return order
            const now = new Date().toISOString()
            return {
              ...order,
              status,
              updatedAt: now,
              completedAt: status === "completed" ? now : order.completedAt,
            }
          }),
        })),

      markPaid: (orderId, method) =>
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) return order
            const now = new Date().toISOString()
            return {
              ...order,
              paymentMethod: method,
              paidAt: now,
              updatedAt: now,
            }
          }),
        })),

      cancelOrder: (orderId) =>
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) return order
            const now = new Date().toISOString()
            return { ...order, status: "cancelled", updatedAt: now }
          }),
        })),

      getOrderById: (orderId) =>
        get().orders.find((order) => order.id === orderId),

      reset: () => set({ ...initialState }),
    }),
    {
      name: "pos-coffee-orders",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)
