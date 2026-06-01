"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ORDER_NOTE_MAX_LENGTH,
  formatCurrency,
  formatDelta,
  sumModifierDeltas,
} from "@/lib/order-validation"
import { cn } from "@/lib/utils"
import type { AppliedModifier, Modifier, Product } from "@/types"

interface ModifierDialogProps {
  open: boolean
  product: Product | null
  modifiers: Modifier[]
  onOpenChange: (open: boolean) => void
  onConfirm: (input: {
    product: Product
    modifiers: AppliedModifier[]
    notes: string
  }) => void
}

interface FormState {
  selections: Record<string, string>
  notes: string
}

const buildInitialState = (modifiers: Modifier[]): FormState => {
  const selections: Record<string, string> = {}
  for (const modifier of modifiers) {
    selections[modifier.id] = ""
  }
  return { selections, notes: "" }
}

/**
 * Pop-up that captures modifier choices + an optional line note before a
 * product joins the cart.
 *
 * Validation is intentionally hand-rolled rather than via Zod + RHF because
 * the schema shape depends on the runtime set of required modifiers — a
 * static Zod resolver would not type-check against `react-hook-form`'s
 * generic resolver constraints. The submit button stays disabled until
 * every required modifier is chosen, which is what the acceptance criteria
 * require.
 *
 * The body is split into `ModifierDialogBody` so the parent can mount a
 * fresh instance per-product (via `key={product.id}`) instead of resetting
 * state in an effect. This satisfies the React Compiler `react-hooks/
 * set-state-in-effect` lint rule.
 */
export function ModifierDialog(props: ModifierDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {props.open && props.product ? (
          <ModifierDialogBody key={props.product.id} {...props} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function ModifierDialogBody({
  product,
  modifiers,
  onOpenChange,
  onConfirm,
}: ModifierDialogProps) {
  const initialState = useMemo(() => buildInitialState(modifiers), [modifiers])

  const [form, setForm] = useState<FormState>(initialState)
  const [showRequiredErrors, setShowRequiredErrors] = useState(false)

  const requiredModifierIds = useMemo(
    () => modifiers.filter((m) => m.required).map((m) => m.id),
    [modifiers]
  )

  const missingRequiredIds = requiredModifierIds.filter(
    (id) => !form.selections[id]
  )
  const allRequiredChosen = missingRequiredIds.length === 0

  const deltaSum = sumModifierDeltas(modifiers, form.selections)
  const previewUnitPrice = product ? product.basePrice + deltaSum : 0

  const notesOverflow = form.notes.length > ORDER_NOTE_MAX_LENGTH

  const handleSelect = (modifierId: string, optionId: string) => {
    setForm((prev) => ({
      ...prev,
      selections: { ...prev.selections, [modifierId]: optionId },
    }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!product) return
    if (!allRequiredChosen || notesOverflow) {
      setShowRequiredErrors(true)
      return
    }

    const applied: AppliedModifier[] = []
    for (const modifier of modifiers) {
      const optionId = form.selections[modifier.id]
      if (!optionId) continue
      const option = modifier.options.find((opt) => opt.id === optionId)
      if (!option) continue
      applied.push({
        modifierId: modifier.id,
        modifierName: modifier.name,
        optionId: option.id,
        optionName: option.name,
        priceDelta: option.priceDelta,
      })
    }

    onConfirm({
      product,
      modifiers: applied,
      notes: form.notes.trim(),
    })
    onOpenChange(false)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{product ? product.name : "Customise"}</DialogTitle>
        <DialogDescription>
          {product
            ? "Pick the options the customer wants, then add it to the order."
            : "Pick the options, then add it to the order."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} noValidate className="grid gap-4">
        {modifiers.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No options to choose — this drink is added as-is.
          </p>
        ) : (
          <div className="grid gap-4">
            {modifiers.map((modifier) => {
              const value = form.selections[modifier.id] ?? ""
              const showError =
                showRequiredErrors && modifier.required && !value
              return (
                <fieldset
                  key={modifier.id}
                  className="grid gap-2"
                  aria-invalid={showError}
                >
                  <legend className="text-foreground flex w-full items-center justify-between text-sm font-medium">
                    <span>
                      {modifier.name}
                      {modifier.required ? (
                        <span
                          aria-label="required"
                          className="text-destructive ml-1"
                        >
                          *
                        </span>
                      ) : (
                        <span className="text-muted-foreground ml-1 text-xs font-normal">
                          (optional)
                        </span>
                      )}
                    </span>
                  </legend>

                  <div
                    role="radiogroup"
                    aria-label={modifier.name}
                    className="grid gap-2 sm:grid-cols-2"
                  >
                    {modifier.options.map((option) => {
                      const checked = value === option.id
                      return (
                        <label
                          key={option.id}
                          className={cn(
                            "border-border/70 hover:border-primary/40 flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
                            checked &&
                              "border-primary bg-primary/5 ring-primary/20 ring-2"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`modifier-${modifier.id}`}
                              value={option.id}
                              checked={checked}
                              onChange={() =>
                                handleSelect(modifier.id, option.id)
                              }
                              className="border-input focus-visible:ring-ring/50 size-4 focus-visible:ring-3"
                            />
                            <span className="text-foreground font-medium">
                              {option.name}
                            </span>
                          </span>
                          <span className="text-muted-foreground text-xs tabular-nums">
                            {formatDelta(option.priceDelta)}
                          </span>
                        </label>
                      )
                    })}
                  </div>

                  {showError ? (
                    <p role="alert" className="text-destructive text-sm">
                      Choose a {modifier.name.toLowerCase()}.
                    </p>
                  ) : null}
                </fieldset>
              )
            })}
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="modifier-dialog-notes" className="text-sm">
            Notes
            <span className="text-muted-foreground ml-1 text-xs font-normal">
              (optional)
            </span>
          </Label>
          <Input
            id="modifier-dialog-notes"
            inputMode="text"
            maxLength={ORDER_NOTE_MAX_LENGTH}
            placeholder="e.g. extra hot, no foam"
            value={form.notes}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, notes: event.target.value }))
            }
          />
          <div className="text-muted-foreground flex justify-between text-xs">
            <span>
              Identical lines (same drink + options + notes) merge in the cart.
            </span>
            <span aria-live="polite" className="tabular-nums">
              {form.notes.length} / {ORDER_NOTE_MAX_LENGTH}
            </span>
          </div>
          {notesOverflow ? (
            <p className="text-destructive text-sm">
              Notes must be {ORDER_NOTE_MAX_LENGTH} characters or fewer.
            </p>
          ) : null}
        </div>

        <div className="bg-muted/40 flex items-center justify-between rounded-lg px-3 py-2 text-sm">
          <span className="text-muted-foreground">Unit price</span>
          <span className="text-foreground font-semibold tabular-nums">
            {formatCurrency(Math.max(0, previewUnitPrice))}
          </span>
        </div>

        <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!product || !allRequiredChosen || notesOverflow}
            data-testid="modifier-dialog-add"
          >
            Add to order
          </Button>
        </div>
      </form>
    </>
  )
}
