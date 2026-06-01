"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Category } from "@/types"

export const ALL_CATEGORIES_VALUE = "__all"

interface CategoryFilterProps {
  categories: Category[]
  activeId: string
  productCountByCategory: Record<string, number>
  totalProductCount: number
  onChange: (id: string) => void
}

/**
 * Pill-row filter that drives the product grid. Renders an "All" pill plus
 * one pill per category, each annotated with the count of available
 * products so the cashier can spot empty categories at a glance.
 */
export function CategoryFilter({
  categories,
  activeId,
  productCountByCategory,
  totalProductCount,
  onChange,
}: CategoryFilterProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter by category"
      className="flex flex-wrap gap-2"
    >
      <CategoryPill
        label="All"
        count={totalProductCount}
        active={activeId === ALL_CATEGORIES_VALUE}
        onClick={() => onChange(ALL_CATEGORIES_VALUE)}
      />
      {categories.map((category) => (
        <CategoryPill
          key={category.id}
          label={category.name}
          count={productCountByCategory[category.id] ?? 0}
          active={activeId === category.id}
          onClick={() => onChange(category.id)}
        />
      ))}
    </div>
  )
}

interface CategoryPillProps {
  label: string
  count: number
  active: boolean
  onClick: () => void
}

function CategoryPill({ label, count, active, onClick }: CategoryPillProps) {
  return (
    <Button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      variant={active ? "default" : "outline"}
      size="sm"
      className={cn("rounded-full")}
    >
      <span>{label}</span>
      <span
        className={cn(
          "ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] tabular-nums",
          active
            ? "bg-primary-foreground/20 text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {count}
      </span>
    </Button>
  )
}
