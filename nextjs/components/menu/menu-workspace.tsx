"use client"

import { Loader2 } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMenuStore } from "@/stores"

import { CategoriesPanel } from "./categories-panel"
import { ProductsPanel } from "./products-panel"
import { ModifiersPanel } from "./modifiers-panel"

/**
 * Admin menu workspace — tab-based shell that hosts the three panels.
 *
 * Waits for the persisted Zustand snapshot to hydrate before rendering so
 * the first paint never shows an empty (unseeded) state. The store's
 * `onRehydrateStorage` callback runs `seedIfEmpty()` immediately after
 * rehydration on fresh devices.
 */
export function MenuWorkspace() {
  const hasHydrated = useMenuStore((state) => state.hasHydrated)
  const categoryCount = useMenuStore((state) => state.categories.length)
  const productCount = useMenuStore((state) => state.products.length)
  const modifierCount = useMenuStore((state) => state.modifiers.length)

  if (!hasHydrated) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="border-border/70 bg-card/60 text-muted-foreground flex min-h-48 items-center justify-center gap-2 rounded-2xl border p-8 text-sm"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        <span>Loading menu data…</span>
      </div>
    )
  }

  return (
    <Tabs defaultValue="categories" className="gap-6">
      <TabsList className="self-start">
        <TabsTrigger value="categories">
          Categories
          <span className="text-muted-foreground ml-1.5 text-xs">
            ({categoryCount})
          </span>
        </TabsTrigger>
        <TabsTrigger value="products">
          Products
          <span className="text-muted-foreground ml-1.5 text-xs">
            ({productCount})
          </span>
        </TabsTrigger>
        <TabsTrigger value="modifiers">
          Modifiers
          <span className="text-muted-foreground ml-1.5 text-xs">
            ({modifierCount})
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="categories">
        <CategoriesPanel />
      </TabsContent>
      <TabsContent value="products">
        <ProductsPanel />
      </TabsContent>
      <TabsContent value="modifiers">
        <ModifiersPanel />
      </TabsContent>
    </Tabs>
  )
}
