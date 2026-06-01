"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, ShoppingBag, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useCartStore, useMenuStore } from "@/stores"
import { formatCurrency } from "@/lib/order-validation"
import type { AppliedModifier, Product } from "@/types"

import { ALL_CATEGORIES_VALUE, CategoryFilter } from "./category-filter"
import { ModifierDialog } from "./modifier-dialog"
import { OrderSummary } from "./order-summary"
import { ProductGrid } from "./product-grid"

/**
 * Top-level container for the /order screen.
 *
 * Layout:
 *   - >= 1024px (lg): two-column grid (menu + sticky cart panel).
 *   - 768-1023px (md): two-column grid with a narrower cart.
 *   - < 768px: menu fills the screen; the cart opens in a slide-up drawer
 *     triggered by a sticky floating button that shows the running total.
 *
 * Hydration:
 *   The menu store and cart store both expose `hasHydrated`. The page shows
 *   a loader until BOTH have completed rehydration so the first paint never
 *   shows an empty (unseeded) menu or an empty cart for a returning cashier.
 */
export function OrderWorkspace() {
  const menuHydrated = useMenuStore((state) => state.hasHydrated)
  const cartHydrated = useCartStore((state) => state.hasHydrated)
  const categories = useMenuStore((state) => state.categories)
  const products = useMenuStore((state) => state.products)
  const modifiers = useMenuStore((state) => state.modifiers)

  const items = useCartStore((state) => state.items)
  const addItem = useCartStore((state) => state.addItem)

  const [activeCategoryId, setActiveCategoryId] =
    useState<string>(ALL_CATEGORIES_VALUE)
  const [dialogProduct, setDialogProduct] = useState<Product | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const ready = menuHydrated && cartHydrated

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
        return a.name.localeCompare(b.name)
      }),
    [categories]
  )

  const availableProducts = useMemo(
    () => products.filter((product) => product.active),
    [products]
  )

  const productCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const product of availableProducts) {
      counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1
    }
    return counts
  }, [availableProducts])

  // If a previously selected category disappears (admin deletion in another
  // tab, etc.), fall back to "All" at render time so the grid is never
  // stranded — and so we don't have to setState inside an effect.
  const effectiveCategoryId = useMemo(() => {
    if (activeCategoryId === ALL_CATEGORIES_VALUE) return ALL_CATEGORIES_VALUE
    const exists = categories.some(
      (category) => category.id === activeCategoryId
    )
    return exists ? activeCategoryId : ALL_CATEGORIES_VALUE
  }, [activeCategoryId, categories])

  const visibleProducts = useMemo(() => {
    const base =
      effectiveCategoryId === ALL_CATEGORIES_VALUE
        ? availableProducts
        : availableProducts.filter(
            (product) => product.categoryId === effectiveCategoryId
          )
    return [...base].sort((a, b) => a.name.localeCompare(b.name))
  }, [availableProducts, effectiveCategoryId])

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (typeof document === "undefined") return
    const previous = document.body.style.overflow
    if (drawerOpen) {
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.body.style.overflow = previous
    }
  }, [drawerOpen])

  useEffect(() => {
    if (!drawerOpen) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false)
    }
    window.addEventListener("keydown", handleKey)
    return () => {
      window.removeEventListener("keydown", handleKey)
    }
  }, [drawerOpen])

  const handleProductSelect = useCallback(
    (product: Product) => {
      const attachedModifiers = product.modifierIds
        .map((id) => modifiers.find((modifier) => modifier.id === id))
        .filter((modifier): modifier is (typeof modifiers)[number] =>
          Boolean(modifier)
        )

      if (attachedModifiers.length === 0) {
        const line = addItem({
          product: {
            id: product.id,
            name: product.name,
            basePrice: product.basePrice,
          },
          quantity: 1,
          modifiers: [],
          notes: "",
        })
        toast.success(
          line.quantity > 1
            ? `Added another ${product.name} (×${line.quantity}).`
            : `Added ${product.name} to the order.`
        )
        return
      }

      setDialogProduct(product)
    },
    [addItem, modifiers]
  )

  const handleDialogConfirm = useCallback(
    (input: {
      product: Product
      modifiers: AppliedModifier[]
      notes: string
    }) => {
      const line = addItem({
        product: {
          id: input.product.id,
          name: input.product.name,
          basePrice: input.product.basePrice,
        },
        quantity: 1,
        modifiers: input.modifiers,
        notes: input.notes,
      })
      toast.success(
        line.quantity > 1
          ? `Updated ${input.product.name} (×${line.quantity}) in the order.`
          : `Added ${input.product.name} to the order.`
      )
    },
    [addItem]
  )

  if (!ready) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="border-border/70 bg-card/60 text-muted-foreground flex min-h-48 items-center justify-center gap-2 rounded-2xl border p-8 text-sm"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        <span>Loading order workspace…</span>
      </div>
    )
  }

  const cartTotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="grid gap-6 pb-24 lg:pb-0">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-label="Menu" className="flex flex-col gap-4">
          <CategoryFilter
            categories={sortedCategories}
            activeId={effectiveCategoryId}
            productCountByCategory={productCountByCategory}
            totalProductCount={availableProducts.length}
            onChange={setActiveCategoryId}
          />
          <ProductGrid
            products={visibleProducts}
            modifiers={modifiers}
            onSelect={handleProductSelect}
          />
        </section>

        <div className="hidden lg:block">
          <OrderSummary variant="panel" />
        </div>
      </div>

      <ModifierDialog
        open={dialogProduct !== null}
        product={dialogProduct}
        modifiers={
          dialogProduct
            ? dialogProduct.modifierIds
                .map((id) => modifiers.find((modifier) => modifier.id === id))
                .filter((modifier): modifier is (typeof modifiers)[number] =>
                  Boolean(modifier)
                )
            : []
        }
        onOpenChange={(open) => {
          if (!open) setDialogProduct(null)
        }}
        onConfirm={handleDialogConfirm}
      />

      {/* Mobile floating cart trigger + drawer overlay. */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        data-testid="mobile-cart-trigger"
        className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/50 fixed inset-x-4 bottom-4 z-30 flex items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg transition-colors focus-visible:ring-3 lg:hidden"
      >
        <span className="flex items-center gap-2">
          <ShoppingBag className="size-4" aria-hidden="true" />
          View order
          <span className="bg-primary-foreground/20 inline-flex min-w-6 items-center justify-center rounded-full px-1.5 text-xs tabular-nums">
            {cartCount}
          </span>
        </span>
        <span className="tabular-nums">{formatCurrency(cartTotal)}</span>
      </button>

      {drawerOpen ? (
        <div className="fixed inset-0 z-40 flex lg:hidden" role="presentation">
          <button
            type="button"
            aria-label="Close order panel"
            onClick={() => setDrawerOpen(false)}
            className="bg-foreground/40 absolute inset-0 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Current order"
            className="bg-background relative z-10 mt-auto flex max-h-[85vh] w-full flex-col gap-3 rounded-t-2xl border-t p-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-foreground text-sm font-semibold">
                Current order
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close order panel"
                onClick={() => setDrawerOpen(false)}
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <OrderSummary variant="drawer" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
