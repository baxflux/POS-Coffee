"use client"

import { useMemo, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useMenuStore } from "@/stores"
import { createId } from "@/lib/ids"
import { CategoryFormDialog } from "./category-form-dialog"
import { ConfirmDialog } from "./confirm-dialog"
import { isSameName } from "@/lib/menu-validation"
import type { Category } from "@/types"

type DialogMode =
  | { kind: "create" }
  | { kind: "edit"; category: Category }
  | { kind: "closed" }

export function CategoriesPanel() {
  const categories = useMenuStore((state) => state.categories)
  const products = useMenuStore((state) => state.products)
  const addCategory = useMenuStore((state) => state.addCategory)
  const updateCategory = useMenuStore((state) => state.updateCategory)
  const removeCategory = useMenuStore((state) => state.removeCategory)

  const [dialogMode, setDialogMode] = useState<DialogMode>({ kind: "closed" })
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null)

  const productCountByCategory = useMemo(() => {
    const counts = new Map<string, number>()
    for (const product of products) {
      counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1)
    }
    return counts
  }, [products])

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
        return a.name.localeCompare(b.name)
      }),
    [categories]
  )

  const handleSubmit = (
    values: { name: string },
    mode: DialogMode
  ): boolean => {
    if (mode.kind === "closed") return false
    const trimmed = values.name.trim()

    // Duplicate name check (case-insensitive) within the category list.
    const duplicate = categories.find(
      (category) =>
        isSameName(category.name, trimmed) &&
        (mode.kind === "create" ? true : category.id !== mode.category.id)
    )
    if (duplicate) {
      toast.error("A category with that name already exists.")
      return false
    }

    if (mode.kind === "create") {
      const nextSortOrder =
        categories.reduce(
          (max, category) => Math.max(max, category.sortOrder),
          0
        ) + 1
      addCategory({
        id: createId("cat"),
        createdAt: new Date().toISOString(),
        name: trimmed,
        sortOrder: nextSortOrder,
      })
      toast.success(`Category "${trimmed}" created.`)
      return true
    }

    updateCategory(mode.category.id, { name: trimmed })
    toast.success(`Category renamed to "${trimmed}".`)
    return true
  }

  const handleDelete = (category: Category) => {
    const inUseCount = productCountByCategory.get(category.id) ?? 0
    if (inUseCount > 0) {
      toast.error(
        `Cannot delete "${category.name}" — ${inUseCount} product${
          inUseCount === 1 ? "" : "s"
        } still use this category. Move or delete them first.`
      )
      return
    }
    setPendingDelete(category)
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    const name = pendingDelete.name
    removeCategory(pendingDelete.id)
    toast.success(`Category "${name}" deleted.`)
    setPendingDelete(null)
  }

  return (
    <div className="grid gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-foreground text-lg font-semibold">Categories</h2>
          <p className="text-muted-foreground text-sm">
            Group products so the order screen stays scannable.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setDialogMode({ kind: "create" })}
          size="sm"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          New category
        </Button>
      </header>

      {sortedCategories.length === 0 ? (
        <div className="border-border/70 rounded-xl border border-dashed p-8 text-center">
          <p className="text-foreground text-sm font-medium">
            No categories yet
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            Create your first category to start adding products.
          </p>
        </div>
      ) : (
        <ul className="grid gap-2">
          {sortedCategories.map((category) => {
            const productCount = productCountByCategory.get(category.id) ?? 0
            return (
              <li
                key={category.id}
                className="border-border/70 bg-card/60 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3"
              >
                <div className="flex flex-1 items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="bg-secondary text-secondary-foreground inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium"
                  >
                    {category.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="grid gap-0.5">
                    <span className="text-foreground text-sm font-medium">
                      {category.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {productCount} product{productCount === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-normal">
                    Order #{category.sortOrder}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Rename ${category.name}`}
                    onClick={() => setDialogMode({ kind: "edit", category })}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${category.name}`}
                    onClick={() => handleDelete(category)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <CategoryFormDialog
        open={dialogMode.kind !== "closed"}
        onOpenChange={(open) => {
          if (!open) setDialogMode({ kind: "closed" })
        }}
        mode={dialogMode.kind === "edit" ? "edit" : "create"}
        defaultName={dialogMode.kind === "edit" ? dialogMode.category.name : ""}
        onSubmit={(values) => handleSubmit(values, dialogMode)}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
        title="Delete category?"
        description={
          <span>
            <strong>{pendingDelete?.name}</strong> will be removed permanently.
            This action cannot be undone.
          </span>
        }
        confirmLabel="Delete category"
        cancelLabel="Keep category"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
