"use client"

import { CupSoda } from "lucide-react"

import { ProductCard } from "./product-card"
import type { Modifier, Product } from "@/types"

interface ProductGridProps {
  products: Product[]
  modifiers: Modifier[]
  onSelect: (product: Product) => void
}

export function ProductGrid({
  products,
  modifiers,
  onSelect,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="border-border/70 text-muted-foreground flex flex-col items-center gap-2 rounded-xl border border-dashed p-10 text-center">
        <span
          aria-hidden="true"
          className="bg-secondary text-secondary-foreground inline-flex size-10 items-center justify-center rounded-xl"
        >
          <CupSoda className="size-5" />
        </span>
        <p className="text-foreground text-sm font-medium">
          Nothing on offer here
        </p>
        <p className="max-w-sm text-sm">
          No available products in this category. Pick another category, or ask
          your admin to make products visible on the Menu screen.
        </p>
      </div>
    )
  }

  return (
    <ul
      data-testid="product-grid"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard
            product={product}
            modifiers={modifiers}
            onSelect={onSelect}
          />
        </li>
      ))}
    </ul>
  )
}
