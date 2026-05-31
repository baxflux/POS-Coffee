/**
 * Cart store — the in-progress order before checkout.
 *
 * Persisted to localStorage under the `pos-coffee-cart` key so a cashier
 * who reloads the tab does not lose their open ticket. Cleared explicitly
 * after checkout via `clear()` (called from the payment flow in a later task).
 */

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import type { AppliedModifier, OrderLineItem, Product } from "@/types"
import { createId } from "@/lib/ids"
import { computeLineTotal, computeOrderTotals } from "@/lib/totals"

interface CartState {
  items: OrderLineItem[]
  /** Optional free-text note attached to the whole order. */
  orderNote: string
}

export interface AddToCartInput {
  product: Pick<Product, "id" | "name" | "basePrice">
  quantity: number
  modifiers: AppliedModifier[]
  notes?: string
}

interface CartActions {
  addItem: (input: AddToCartInput) => OrderLineItem
  updateQuantity: (lineId: string, quantity: number) => void
  updateNotes: (lineId: string, notes: string) => void
  removeItem: (lineId: string) => void
  setOrderNote: (note: string) => void
  clear: () => void
  /** Number of distinct line items currently in the cart. */
  getLineCount: () => number
  /** Sum of quantities across all lines. */
  getItemCount: () => number
  getTotals: () => ReturnType<typeof computeOrderTotals>
}

export type CartStore = CartState & CartActions

const initialState: CartState = {
  items: [],
  orderNote: "",
}

/** Reusable refresh that recomputes the cached `lineTotal` on a line item. */
function withRefreshedTotal(line: OrderLineItem): OrderLineItem {
  return { ...line, lineTotal: computeLineTotal(line) }
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addItem: ({ product, quantity, modifiers, notes }) => {
        const safeQuantity = Math.max(1, Math.floor(quantity))
        const draft: OrderLineItem = {
          id: createId("line"),
          productId: product.id,
          productName: product.name,
          unitBasePrice: product.basePrice,
          quantity: safeQuantity,
          modifiers,
          notes: notes ?? "",
          lineTotal: 0,
        }
        const line = withRefreshedTotal(draft)
        set((state) => ({ items: [...state.items, line] }))
        return line
      },

      updateQuantity: (lineId, quantity) => {
        const safeQuantity = Math.max(1, Math.floor(quantity))
        set((state) => ({
          items: state.items.map((item) =>
            item.id === lineId
              ? withRefreshedTotal({ ...item, quantity: safeQuantity })
              : item
          ),
        }))
      },

      updateNotes: (lineId, notes) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === lineId ? { ...item, notes } : item
          ),
        })),

      removeItem: (lineId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== lineId),
        })),

      setOrderNote: (note) => set({ orderNote: note }),

      clear: () => set({ ...initialState }),

      getLineCount: () => get().items.length,

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotals: () => computeOrderTotals(get().items),
    }),
    {
      name: "pos-coffee-cart",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)
