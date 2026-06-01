/**
 * Shared helpers for the Order Creation workspace (PC-6).
 *
 * Validation is intentionally lightweight (no Zod resolver) because the
 * modifier dialog's required-field set is dynamic per product; a static
 * Zod schema would not type-check against react-hook-form's resolver
 * generic. The modifier dialog enforces required selections through its
 * disabled-submit logic instead. Notes have a single string ceiling that
 * we expose as a constant so the line-notes input and dialog notes share
 * the same maximum.
 */

import type { Modifier, ModifierOption } from "@/types"

/** Maximum length for per-line and per-order notes. */
export const ORDER_NOTE_MAX_LENGTH = 140

/**
 * Find the chosen `ModifierOption` for each `Modifier` based on the form
 * `selections` map. Modifiers without a selection (optional + skipped) are
 * filtered out so they never appear on the line item.
 */
export function resolveAppliedSelections(
  modifiers: Modifier[],
  selections: Record<string, string>
): Array<{
  modifier: Modifier
  option: ModifierOption
}> {
  const result: Array<{ modifier: Modifier; option: ModifierOption }> = []
  for (const modifier of modifiers) {
    const optionId = selections[modifier.id]
    if (!optionId) continue
    const option = modifier.options.find((opt) => opt.id === optionId)
    if (!option) continue
    result.push({ modifier, option })
  }
  return result
}

/**
 * Sum of selected modifier price deltas; used to preview unit price inside
 * the modifier dialog before the cashier confirms the add.
 */
export function sumModifierDeltas(
  modifiers: Modifier[],
  selections: Record<string, string>
): number {
  return resolveAppliedSelections(modifiers, selections).reduce(
    (sum, { option }) => sum + option.priceDelta,
    0
  )
}

/** Format currency consistently with the menu workspace. */
export function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`
}

/** Format a price delta with a leading sign (`+$0.50`, `-$0.25`, or `Free`). */
export function formatDelta(value: number): string {
  if (value === 0) return "Free"
  const formatted = Math.abs(value).toFixed(2)
  return value > 0 ? `+$${formatted}` : `-$${formatted}`
}
