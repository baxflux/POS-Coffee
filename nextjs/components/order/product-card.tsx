"use client"

import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/order-validation"
import type { Modifier, Product } from "@/types"

interface ProductCardProps {
  product: Product
  modifiers: Modifier[]
  onSelect: (product: Product) => void
}

/**
 * Tile shown in the order grid. Acts as a button so an entire card press
 * starts the add-to-cart flow — friendlier on a tablet than a small button.
 */
export function ProductCard({
  product,
  modifiers,
  onSelect,
}: ProductCardProps) {
  const attachedModifiers = useMemo(
    () =>
      product.modifierIds
        .map((id) => modifiers.find((modifier) => modifier.id === id))
        .filter((modifier): modifier is Modifier => Boolean(modifier)),
    [product.modifierIds, modifiers]
  )

  const requiredCount = attachedModifiers.filter((m) => m.required).length

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      data-testid={`product-card-${product.id}`}
      className="border-border/70 bg-card/60 hover:border-primary/40 focus-visible:ring-ring/50 active:bg-card/80 group grid h-full gap-2 rounded-xl border p-4 text-left transition-colors outline-none focus-visible:ring-3"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-foreground text-base leading-tight font-semibold">
          {product.name}
        </span>
        <span className="text-foreground text-sm font-semibold tabular-nums">
          {formatCurrency(product.basePrice)}
        </span>
      </div>

      {product.description ? (
        <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
          {product.description}
        </p>
      ) : (
        <p className="text-muted-foreground/60 text-xs italic">
          No description.
        </p>
      )}

      {attachedModifiers.length > 0 ? (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {attachedModifiers.map((modifier) => (
            <Badge
              key={modifier.id}
              variant={modifier.required ? "secondary" : "outline"}
              className="font-normal"
            >
              {modifier.name}
              {modifier.required ? " *" : ""}
            </Badge>
          ))}
        </div>
      ) : null}

      {requiredCount > 0 ? (
        <span className="text-muted-foreground/80 mt-1 text-[11px] tracking-wide uppercase">
          Tap to choose options
        </span>
      ) : (
        <span className="text-muted-foreground/80 mt-1 text-[11px] tracking-wide uppercase">
          Tap to add
        </span>
      )}
    </button>
  )
}
