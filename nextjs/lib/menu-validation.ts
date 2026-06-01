/**
 * Shared Zod schemas and helpers for the Menu management workspace (PC-5).
 *
 * Keeping the schemas in one module makes them testable and ensures every
 * form on `/menu` validates against the same rules.
 */

import { z } from "zod"

import type { Modifier, Product } from "@/types"

// ---------- Category ----------

export const categoryNameSchema = z
  .string()
  .trim()
  .min(1, { message: "Name is required." })
  .max(40, { message: "Name must be 40 characters or fewer." })

export const categoryFormSchema = z.object({
  name: categoryNameSchema,
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>

// ---------- Product ----------

/**
 * Price is captured as a string so React Hook Form sees a controlled `<Input>`,
 * then validated and coerced to a finite number with at most 2 decimal places.
 */
const priceSchema = z
  .string()
  .trim()
  .min(1, { message: "Price is required." })
  .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), {
    message: "Use a positive number with up to 2 decimals (e.g. 4.50).",
  })
  .refine((value) => Number(value) > 0, {
    message: "Price must be greater than 0.",
  })

export const productFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Name is required." })
    .max(80, { message: "Name must be 80 characters or fewer." }),
  description: z
    .string()
    .trim()
    .max(200, { message: "Description must be 200 characters or fewer." }),
  price: priceSchema,
  categoryId: z.string().min(1, { message: "Choose a category." }),
  active: z.boolean(),
  modifierIds: z.array(z.string()),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

// ---------- Modifier ----------

const modifierOptionSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .trim()
    .min(1, { message: "Option name is required." })
    .max(40, { message: "Option name must be 40 characters or fewer." }),
  /**
   * Captured as string for the same reason as product price. Negative values
   * are allowed (e.g. discounts) and surfaced to the user with a warning.
   */
  priceDelta: z
    .string()
    .trim()
    .refine((value) => /^-?\d+(\.\d{1,2})?$/.test(value), {
      message: "Use a number with up to 2 decimals (e.g. 0.50 or -0.25).",
    }),
})

export const modifierFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Name is required." })
    .max(40, { message: "Name must be 40 characters or fewer." }),
  required: z.boolean(),
  options: z
    .array(modifierOptionSchema)
    .min(1, { message: "Add at least one option." })
    .max(10, { message: "A modifier supports up to 10 options." }),
})

export type ModifierFormValues = z.infer<typeof modifierFormSchema>

// ---------- Duplicate-name detection ----------

/**
 * Case-insensitive comparison after trimming so `" Latte "` and `"latte"`
 * are treated as duplicates.
 */
export function isSameName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

/**
 * Find an existing product with the same name within the same category,
 * excluding the optional `ignoreProductId` (used while editing).
 */
export function findDuplicateProduct(
  products: Product[],
  name: string,
  categoryId: string,
  ignoreProductId?: string
): Product | null {
  const match = products.find(
    (product) =>
      product.id !== ignoreProductId &&
      product.categoryId === categoryId &&
      isSameName(product.name, name)
  )
  return match ?? null
}

/**
 * True when at least one option has a negative price delta — the form shows
 * an inline warning when so.
 */
export function modifierHasNegativeDelta(
  options: ReadonlyArray<{ priceDelta: number }>
): boolean {
  return options.some((option) => option.priceDelta < 0)
}

export function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`
}

export function formatPriceDelta(value: number): string {
  if (value === 0) return "—"
  const formatted = value.toFixed(2)
  return value > 0 ? `+$${formatted}` : `-$${Math.abs(value).toFixed(2)}`
}

/**
 * Find the modifier records referenced by a product, in stable order.
 */
export function resolveProductModifiers(
  modifiers: Modifier[],
  modifierIds: ReadonlyArray<string>
): Modifier[] {
  return modifierIds
    .map((id) => modifiers.find((modifier) => modifier.id === id))
    .filter((modifier): modifier is Modifier => Boolean(modifier))
}
