/**
 * Cart store — the in-progress order before checkout.
 *
 * Persisted to localStorage under the `pos-coffee-cart` key so a cashier
 * who reloads the tab does not lose their open ticket. Cleared explicitly
 * after checkout via `clear()` (called from the payment flow in a later task).
 *
 * Identical line items (same product, same modifier selections, same notes)
 * are merged into a single row with a combined quantity so the cart stays
 * compact when a cashier taps the same drink twice.
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
  /**
   * True once the persisted snapshot has been merged into memory. The Order
   * workspace checks this before rendering so the very first paint after a
   * page reload reflects the persisted cart and not an empty placeholder.
   */
  hasHydrated: boolean
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
  setHasHydrated: (value: boolean) => void
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
  hasHydrated: false,
}

/** Reusable refresh that recomputes the cached `lineTotal` on a line item. */
function withRefreshedTotal(line: OrderLineItem): OrderLineItem {
  return { ...line, lineTotal: computeLineTotal(line) }
}

/**
 * Stable signature of a "mergeable" line — same product, same modifier
 * selections (order-independent), and same trimmed notes. Used to merge a
 * freshly-added line into an existing identical line in `addItem`.
 */
function lineSignature(
  productId: string,
  modifiers: AppliedModifier[],
  notes: string
): string {
  const modifierKey = [...modifiers]
    .map((mod) => `${mod.modifierId}:${mod.optionId}`)
    .sort()
    .join("|")
  return `${productId}::${modifierKey}::${notes.trim()}`
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addItem: ({ product, quantity, modifiers, notes }) => {
        const safeQuantity = Math.max(1, Math.floor(quantity))
        const safeNotes = (notes ?? "").trim()
        const signature = lineSignature(product.id, modifiers, safeNotes)

        const existing = get().items.find(
          (item) =>
            lineSignature(item.productId, item.modifiers, item.notes) ===
            signature
        )

        if (existing) {
          const merged = withRefreshedTotal({
            ...existing,
            quantity: existing.quantity + safeQuantity,
          })
          set((state) => ({
            items: state.items.map((item) =>
              item.id === existing.id ? merged : item
            ),
          }))
          return merged
        }

        const draft: OrderLineItem = {
          id: createId("line"),
          productId: product.id,
          productName: product.name,
          unitBasePrice: product.basePrice,
          quantity: safeQuantity,
          modifiers,
          notes: safeNotes,
          lineTotal: 0,
        }
        const line = withRefreshedTotal(draft)
        set((state) => ({ items: [...state.items, line] }))
        return line
      },

      updateQuantity: (lineId, quantity) => {
        // Decrementing to 0 (or below) removes the line entirely so the
        // Order screen never shows a phantom "0" row.
        if (quantity <= 0) {
          set((state) => ({
            items: state.items.filter((item) => item.id !== lineId),
          }))
          return
        }
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

      clear: () =>
        // Preserve hasHydrated so the order screen does not flash a loader
        // after the cashier clicks "Clear order".
        set((state) => ({ ...initialState, hasHydrated: state.hasHydrated })),

      setHasHydrated: (value) => set({ hasHydrated: value }),

      getLineCount: () => get().items.length,

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotals: () => computeOrderTotals(get().items),
    }),
    {
      name: "pos-coffee-cart",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // Persist only the cart payload — `hasHydrated` is transient.
      partialize: (state) => ({
        items: state.items,
        orderNote: state.orderNote,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
