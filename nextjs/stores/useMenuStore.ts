/**
 * Menu store — categories, products, and modifiers.
 *
 * Persisted to localStorage under the `pos-coffee-menu` key so admin edits
 * survive page reloads. On first run (no persisted state) the store seeds
 * itself from `lib/mock-data` so the app is usable immediately.
 */

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import type { Category, Modifier, Product } from "@/types"
import { SEED_CATEGORIES, SEED_MODIFIERS, SEED_PRODUCTS } from "@/lib/mock-data"

interface MenuState {
  categories: Category[]
  products: Product[]
  modifiers: Modifier[]
  /** True once the seed run has executed (or persisted state was hydrated). */
  isSeeded: boolean
}

interface MenuActions {
  /** Idempotent seed — only writes when storage is empty. */
  seedIfEmpty: () => void
  /** Wipe and re-seed. Useful for tests and Admin "reset demo data". */
  resetToSeed: () => void
  addCategory: (category: Category) => void
  updateCategory: (id: string, patch: Partial<Omit<Category, "id">>) => void
  removeCategory: (id: string) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, patch: Partial<Omit<Product, "id">>) => void
  removeProduct: (id: string) => void
  addModifier: (modifier: Modifier) => void
  updateModifier: (id: string, patch: Partial<Omit<Modifier, "id">>) => void
  removeModifier: (id: string) => void
}

export type MenuStore = MenuState & MenuActions

const initialState: MenuState = {
  categories: [],
  products: [],
  modifiers: [],
  isSeeded: false,
}

export const useMenuStore = create<MenuStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      seedIfEmpty: () => {
        const { isSeeded, categories, products, modifiers } = get()
        if (isSeeded) return
        if (
          categories.length > 0 ||
          products.length > 0 ||
          modifiers.length > 0
        ) {
          set({ isSeeded: true })
          return
        }
        set({
          categories: SEED_CATEGORIES,
          products: SEED_PRODUCTS,
          modifiers: SEED_MODIFIERS,
          isSeeded: true,
        })
      },

      resetToSeed: () =>
        set({
          categories: SEED_CATEGORIES,
          products: SEED_PRODUCTS,
          modifiers: SEED_MODIFIERS,
          isSeeded: true,
        }),

      addCategory: (category) =>
        set((state) => ({ categories: [...state.categories, category] })),

      updateCategory: (id, patch) =>
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id ? { ...category, ...patch } : category
          ),
        })),

      removeCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
          // Cascade: deactivate products whose category was removed.
          products: state.products.map((product) =>
            product.categoryId === id ? { ...product, active: false } : product
          ),
        })),

      addProduct: (product) =>
        set((state) => ({ products: [...state.products, product] })),

      updateProduct: (id, patch) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id ? { ...product, ...patch } : product
          ),
        })),

      removeProduct: (id) =>
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
        })),

      addModifier: (modifier) =>
        set((state) => ({ modifiers: [...state.modifiers, modifier] })),

      updateModifier: (id, patch) =>
        set((state) => ({
          modifiers: state.modifiers.map((modifier) =>
            modifier.id === id ? { ...modifier, ...patch } : modifier
          ),
        })),

      removeModifier: (id) =>
        set((state) => ({
          modifiers: state.modifiers.filter((modifier) => modifier.id !== id),
          // Cascade: detach this modifier from any product that referenced it.
          products: state.products.map((product) =>
            product.modifierIds.includes(id)
              ? {
                  ...product,
                  modifierIds: product.modifierIds.filter(
                    (modifierId) => modifierId !== id
                  ),
                }
              : product
          ),
        })),
    }),
    {
      name: "pos-coffee-menu",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // Run the seed automatically once the persisted snapshot has loaded.
      onRehydrateStorage: () => (state) => {
        state?.seedIfEmpty()
      },
    }
  )
)
