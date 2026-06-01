"use client"

import { useMemo, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMenuStore } from "@/stores"
import { createId } from "@/lib/ids"
import {
  findDuplicateProduct,
  formatPrice,
  resolveProductModifiers,
} from "@/lib/menu-validation"
import type { Product } from "@/types"

import {
  ProductFormDialog,
  type ProductFormDefaults,
} from "./product-form-dialog"
import { ConfirmDialog } from "./confirm-dialog"

type DialogMode =
  | { kind: "create" }
  | { kind: "edit"; product: Product }
  | { kind: "closed" }

interface PendingProductCreate {
  values: {
    name: string
    description: string
    price: string
    categoryId: string
    active: boolean
    modifierIds: string[]
  }
  duplicateProductName: string
}

const ALL_CATEGORIES_VALUE = "__all"

export function ProductsPanel() {
  const categories = useMenuStore((state) => state.categories)
  const products = useMenuStore((state) => state.products)
  const modifiers = useMenuStore((state) => state.modifiers)
  const addProduct = useMenuStore((state) => state.addProduct)
  const updateProduct = useMenuStore((state) => state.updateProduct)
  const removeProduct = useMenuStore((state) => state.removeProduct)

  const [dialogMode, setDialogMode] = useState<DialogMode>({ kind: "closed" })
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null)
  const [duplicateConfirm, setDuplicateConfirm] =
    useState<PendingProductCreate | null>(null)
  const [filterCategoryId, setFilterCategoryId] =
    useState<string>(ALL_CATEGORIES_VALUE)

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
        return a.name.localeCompare(b.name)
      }),
    [categories]
  )

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const category of categories) {
      map.set(category.id, category.name)
    }
    return map
  }, [categories])

  const filteredProducts = useMemo(() => {
    const base =
      filterCategoryId === ALL_CATEGORIES_VALUE
        ? products
        : products.filter((product) => product.categoryId === filterCategoryId)
    return [...base].sort((a, b) => {
      const categoryA = categoryNameById.get(a.categoryId) ?? ""
      const categoryB = categoryNameById.get(b.categoryId) ?? ""
      if (categoryA !== categoryB) return categoryA.localeCompare(categoryB)
      return a.name.localeCompare(b.name)
    })
  }, [products, filterCategoryId, categoryNameById])

  const persistProduct = (
    values: PendingProductCreate["values"],
    mode: DialogMode
  ) => {
    const trimmedName = values.name.trim()
    const trimmedDescription = values.description.trim()
    const price = Number(values.price)

    if (mode.kind === "create") {
      addProduct({
        id: createId("prod"),
        createdAt: new Date().toISOString(),
        name: trimmedName,
        description: trimmedDescription,
        basePrice: price,
        categoryId: values.categoryId,
        modifierIds: values.modifierIds,
        active: values.active,
      })
      toast.success(`Product "${trimmedName}" created.`)
      return
    }

    if (mode.kind === "edit") {
      updateProduct(mode.product.id, {
        name: trimmedName,
        description: trimmedDescription,
        basePrice: price,
        categoryId: values.categoryId,
        modifierIds: values.modifierIds,
        active: values.active,
      })
      toast.success(`Product "${trimmedName}" updated.`)
    }
  }

  const handleSubmit = (
    values: PendingProductCreate["values"],
    mode: DialogMode
  ): boolean => {
    if (mode.kind === "closed") return false
    if (categories.length === 0) {
      toast.error("Create a category before adding products.")
      return false
    }

    const ignoreProductId = mode.kind === "edit" ? mode.product.id : undefined
    const duplicate = findDuplicateProduct(
      products,
      values.name,
      values.categoryId,
      ignoreProductId
    )
    if (duplicate) {
      // Stash the pending submission and let the user explicitly confirm.
      setDuplicateConfirm({
        values,
        duplicateProductName: duplicate.name,
      })
      return false
    }

    persistProduct(values, mode)
    return true
  }

  const confirmDuplicateSave = () => {
    if (!duplicateConfirm) return
    persistProduct(duplicateConfirm.values, dialogMode)
    setDuplicateConfirm(null)
    setDialogMode({ kind: "closed" })
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    const name = pendingDelete.name
    removeProduct(pendingDelete.id)
    toast.success(`Product "${name}" deleted.`)
    setPendingDelete(null)
  }

  const editDefaults: ProductFormDefaults | undefined =
    dialogMode.kind === "edit"
      ? {
          name: dialogMode.product.name,
          description: dialogMode.product.description,
          price: dialogMode.product.basePrice.toFixed(2),
          categoryId: dialogMode.product.categoryId,
          active: dialogMode.product.active,
          modifierIds: dialogMode.product.modifierIds,
        }
      : undefined

  return (
    <div className="grid gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-foreground text-lg font-semibold">Products</h2>
          <p className="text-muted-foreground text-sm">
            Manage everything cashiers can sell.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filterCategoryId}
            onValueChange={(value) =>
              setFilterCategoryId(
                typeof value === "string" ? value : ALL_CATEGORIES_VALUE
              )
            }
          >
            <SelectTrigger className="min-w-40">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CATEGORIES_VALUE}>
                All categories
              </SelectItem>
              {sortedCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            onClick={() => setDialogMode({ kind: "create" })}
            size="sm"
            disabled={categories.length === 0}
          >
            <Plus className="size-3.5" aria-hidden="true" />
            New product
          </Button>
        </div>
      </header>

      {categories.length === 0 ? (
        <div className="border-border/70 rounded-xl border border-dashed p-8 text-center">
          <p className="text-foreground text-sm font-medium">
            Categories first
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            You need at least one category before you can add products.
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="border-border/70 rounded-xl border border-dashed p-8 text-center">
          <p className="text-foreground text-sm font-medium">
            No products here yet
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {filterCategoryId === ALL_CATEGORIES_VALUE
              ? "Add your first product to start taking orders."
              : "No products in this category. Switch the filter or create one."}
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {filteredProducts.map((product) => {
            const productModifiers = resolveProductModifiers(
              modifiers,
              product.modifierIds
            )
            return (
              <li
                key={product.id}
                className="border-border/70 bg-card/60 grid gap-3 rounded-xl border p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid gap-1">
                    <span className="text-foreground text-base font-semibold">
                      {product.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {categoryNameById.get(product.categoryId) ??
                        "Uncategorised"}{" "}
                      · {formatPrice(product.basePrice)}
                    </span>
                  </div>
                  <Badge
                    variant={product.active ? "secondary" : "outline"}
                    className="font-normal"
                  >
                    {product.active ? "Available" : "Hidden"}
                  </Badge>
                </div>

                {product.description ? (
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {product.description}
                  </p>
                ) : (
                  <p className="text-muted-foreground/60 text-xs italic">
                    No description.
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {productModifiers.length === 0 ? (
                    <span className="text-muted-foreground text-xs">
                      No modifiers attached.
                    </span>
                  ) : (
                    productModifiers.map((modifier) => (
                      <Badge
                        key={modifier.id}
                        variant="outline"
                        className="font-normal"
                      >
                        {modifier.name}
                      </Badge>
                    ))
                  )}
                </div>

                <div className="mt-1 flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDialogMode({ kind: "edit", product })}
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPendingDelete(product)}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                    Delete
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <ProductFormDialog
        open={dialogMode.kind !== "closed"}
        onOpenChange={(open) => {
          if (!open) setDialogMode({ kind: "closed" })
        }}
        mode={dialogMode.kind === "edit" ? "edit" : "create"}
        categories={sortedCategories}
        modifiers={modifiers}
        defaults={editDefaults}
        onSubmit={(values) => handleSubmit(values, dialogMode)}
      />

      <ConfirmDialog
        open={duplicateConfirm !== null}
        onOpenChange={(open) => {
          if (!open) setDuplicateConfirm(null)
        }}
        title="Duplicate product name?"
        description={
          duplicateConfirm ? (
            <span>
              <strong>{duplicateConfirm.duplicateProductName}</strong> already
              exists in this category. Save anyway and create another product
              with the same name, or cancel to pick a different name.
            </span>
          ) : (
            ""
          )
        }
        confirmLabel="Save anyway"
        cancelLabel="Change name"
        variant="default"
        onConfirm={confirmDuplicateSave}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
        title="Delete product?"
        description={
          <span>
            <strong>{pendingDelete?.name}</strong> will be removed from the
            menu. Existing orders keep their original snapshot, but new orders
            will not be able to add it.
          </span>
        }
        confirmLabel="Delete product"
        cancelLabel="Keep product"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
