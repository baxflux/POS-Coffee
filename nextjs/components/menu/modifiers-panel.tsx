"use client"

import { useMemo, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useMenuStore } from "@/stores"
import { createId } from "@/lib/ids"
import {
  formatPriceDelta,
  isSameName,
  type ModifierFormValues,
} from "@/lib/menu-validation"
import type { Modifier } from "@/types"

import {
  ModifierFormDialog,
  type ModifierFormDefaults,
} from "./modifier-form-dialog"
import { ConfirmDialog } from "./confirm-dialog"

type DialogMode =
  | { kind: "create" }
  | { kind: "edit"; modifier: Modifier }
  | { kind: "closed" }

export function ModifiersPanel() {
  const products = useMenuStore((state) => state.products)
  const modifiers = useMenuStore((state) => state.modifiers)
  const addModifier = useMenuStore((state) => state.addModifier)
  const updateModifier = useMenuStore((state) => state.updateModifier)
  const removeModifier = useMenuStore((state) => state.removeModifier)

  const [dialogMode, setDialogMode] = useState<DialogMode>({ kind: "closed" })
  const [pendingDelete, setPendingDelete] = useState<Modifier | null>(null)

  const usageCountByModifier = useMemo(() => {
    const counts = new Map<string, number>()
    for (const product of products) {
      for (const modifierId of product.modifierIds) {
        counts.set(modifierId, (counts.get(modifierId) ?? 0) + 1)
      }
    }
    return counts
  }, [products])

  const sortedModifiers = useMemo(
    () => [...modifiers].sort((a, b) => a.name.localeCompare(b.name)),
    [modifiers]
  )

  const handleSubmit = (
    values: ModifierFormValues,
    mode: DialogMode
  ): boolean => {
    if (mode.kind === "closed") return false
    const trimmedName = values.name.trim()

    const duplicate = modifiers.find(
      (modifier) =>
        isSameName(modifier.name, trimmedName) &&
        (mode.kind === "create" ? true : modifier.id !== mode.modifier.id)
    )
    if (duplicate) {
      toast.error("A modifier with that name already exists.")
      return false
    }

    const normalisedOptions = values.options.map((option) => ({
      id: option.id || createId("mod-option"),
      name: option.name.trim(),
      priceDelta: Number(option.priceDelta),
    }))

    if (mode.kind === "create") {
      addModifier({
        id: createId("mod"),
        createdAt: new Date().toISOString(),
        name: trimmedName,
        selectionType: "single",
        required: values.required,
        options: normalisedOptions,
      })
      toast.success(`Modifier "${trimmedName}" created.`)
      return true
    }

    updateModifier(mode.modifier.id, {
      name: trimmedName,
      required: values.required,
      options: normalisedOptions,
    })
    toast.success(`Modifier "${trimmedName}" updated.`)
    return true
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    const name = pendingDelete.name
    removeModifier(pendingDelete.id)
    toast.success(
      `Modifier "${name}" deleted. It has been detached from any products that used it.`
    )
    setPendingDelete(null)
  }

  const editDefaults: ModifierFormDefaults | undefined =
    dialogMode.kind === "edit"
      ? {
          name: dialogMode.modifier.name,
          required: dialogMode.modifier.required,
          options: dialogMode.modifier.options.map((option) => ({
            id: option.id,
            name: option.name,
            priceDelta: option.priceDelta.toFixed(2),
          })),
        }
      : undefined

  return (
    <div className="grid gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-foreground text-lg font-semibold">Modifiers</h2>
          <p className="text-muted-foreground text-sm">
            Reusable options (Size, Milk, Extras) attached to one or more
            products.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setDialogMode({ kind: "create" })}
          size="sm"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          New modifier
        </Button>
      </header>

      {sortedModifiers.length === 0 ? (
        <div className="border-border/70 rounded-xl border border-dashed p-8 text-center">
          <p className="text-foreground text-sm font-medium">
            No modifiers yet
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            Create a modifier (like Size) and attach it to products on the
            Products tab.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {sortedModifiers.map((modifier) => {
            const attachedCount = usageCountByModifier.get(modifier.id) ?? 0
            return (
              <li
                key={modifier.id}
                className="border-border/70 bg-card/60 grid gap-3 rounded-xl border p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="grid gap-1">
                    <span className="text-foreground text-base font-semibold">
                      {modifier.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      Attached to {attachedCount} product
                      {attachedCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={modifier.required ? "secondary" : "outline"}
                      className="font-normal"
                    >
                      {modifier.required ? "Required" : "Optional"}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${modifier.name}`}
                      onClick={() => setDialogMode({ kind: "edit", modifier })}
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${modifier.name}`}
                      onClick={() => setPendingDelete(modifier)}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>

                <ul className="border-border/70 grid gap-1 rounded-lg border p-2">
                  {modifier.options.map((option) => (
                    <li
                      key={option.id}
                      className="flex items-center justify-between gap-3 px-2 py-1 text-sm"
                    >
                      <span className="text-foreground">{option.name}</span>
                      <span
                        className={
                          option.priceDelta < 0
                            ? "text-amber-700 dark:text-amber-300"
                            : "text-muted-foreground"
                        }
                      >
                        {formatPriceDelta(option.priceDelta)}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
      )}

      <ModifierFormDialog
        open={dialogMode.kind !== "closed"}
        onOpenChange={(open) => {
          if (!open) setDialogMode({ kind: "closed" })
        }}
        mode={dialogMode.kind === "edit" ? "edit" : "create"}
        defaults={editDefaults}
        onSubmit={(values) => handleSubmit(values, dialogMode)}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
        title="Delete modifier?"
        description={
          <span>
            <strong>{pendingDelete?.name}</strong> will be removed and detached
            from every product that referenced it. Existing orders keep their
            captured options.
          </span>
        }
        confirmLabel="Delete modifier"
        cancelLabel="Keep modifier"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
