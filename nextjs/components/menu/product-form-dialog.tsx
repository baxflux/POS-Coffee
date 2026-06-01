"use client"

import { useEffect, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  productFormSchema,
  type ProductFormValues,
} from "@/lib/menu-validation"
import type { Category, Modifier } from "@/types"

export interface ProductFormDefaults {
  name?: string
  description?: string
  price?: string
  categoryId?: string
  active?: boolean
  modifierIds?: string[]
}

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  categories: Category[]
  modifiers: Modifier[]
  defaults?: ProductFormDefaults
  /** Submit handler — returns true on success so the dialog can close. */
  onSubmit: (values: ProductFormValues) => boolean
}

const EMPTY_DEFAULTS: Required<ProductFormDefaults> = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  active: true,
  modifierIds: [],
}

export function ProductFormDialog({
  open,
  onOpenChange,
  mode,
  categories,
  modifiers,
  defaults,
  onSubmit,
}: ProductFormDialogProps) {
  const seeded = useMemo(
    () => ({ ...EMPTY_DEFAULTS, ...(defaults ?? {}) }),
    [defaults]
  )

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: seeded,
    mode: "onSubmit",
  })

  useEffect(() => {
    if (open) {
      form.reset(seeded)
    }
  }, [open, seeded, form])

  const selectedModifierIds = form.watch("modifierIds")

  const toggleModifier = (id: string, checked: boolean) => {
    const current = form.getValues("modifierIds") ?? []
    const next = checked
      ? Array.from(new Set([...current, id]))
      : current.filter((value) => value !== id)
    form.setValue("modifierIds", next, { shouldDirty: true })
  }

  const handleSubmit = (values: ProductFormValues) => {
    const accepted = onSubmit(values)
    if (accepted) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New product" : "Edit product"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a drink or item to the menu. Cashiers can add it to orders straight away."
              : "Update the product details. Past orders keep their original snapshot."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            noValidate
            className="grid gap-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      autoFocus
                      placeholder="e.g. Latte, Cold Brew"
                      maxLength={80}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Short description shown on the order screen."
                      maxLength={200}
                      rows={2}
                      className="border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 min-h-[64px] w-full resize-y rounded-lg border bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none focus-visible:ring-3"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Up to 200 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (USD)</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="decimal"
                        placeholder="4.50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || undefined}
                        onValueChange={(value) =>
                          field.onChange(typeof value === "string" ? value : "")
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.length === 0 ? (
                            <div className="text-muted-foreground px-3 py-2 text-xs">
                              Create a category first.
                            </div>
                          ) : (
                            categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="bg-muted/40 flex flex-row items-start gap-3 rounded-lg border p-3">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={Boolean(field.value)}
                      onChange={(event) => field.onChange(event.target.checked)}
                      className="border-input bg-background focus-visible:ring-ring/50 mt-0.5 size-4 rounded border focus-visible:ring-3"
                      aria-describedby="product-active-help"
                    />
                  </FormControl>
                  <div className="grid flex-1 gap-1">
                    <FormLabel className="font-medium">
                      Available to order
                    </FormLabel>
                    <FormDescription id="product-active-help">
                      Turn this off to hide the product from cashiers without
                      deleting it. Existing orders stay intact.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="modifierIds"
              render={() => (
                <FormItem>
                  <FormLabel>Modifiers</FormLabel>
                  <FormDescription>
                    Attach reusable modifiers (e.g. Size, Milk) so the cashier
                    can customise this product at order time.
                  </FormDescription>
                  {modifiers.length === 0 ? (
                    <p className="text-muted-foreground rounded-md border border-dashed px-3 py-2 text-sm">
                      No modifiers yet. Create one on the Modifiers tab to
                      attach it here.
                    </p>
                  ) : (
                    <ul className="border-border/70 grid gap-1 rounded-lg border p-1">
                      {modifiers.map((modifier) => {
                        const checked = selectedModifierIds?.includes(
                          modifier.id
                        )
                        const optionPreview = modifier.options
                          .map((option) => option.name)
                          .slice(0, 3)
                          .join(" · ")
                        return (
                          <li key={modifier.id}>
                            <label className="hover:bg-muted/60 flex cursor-pointer items-start gap-3 rounded-md px-2 py-1.5">
                              <input
                                type="checkbox"
                                checked={Boolean(checked)}
                                onChange={(event) =>
                                  toggleModifier(
                                    modifier.id,
                                    event.target.checked
                                  )
                                }
                                className="border-input bg-background focus-visible:ring-ring/50 mt-0.5 size-4 rounded border focus-visible:ring-3"
                              />
                              <div className="grid flex-1 gap-0.5">
                                <span className="text-foreground text-sm font-medium">
                                  {modifier.name}
                                  {modifier.required ? (
                                    <span className="text-muted-foreground ml-1 text-xs font-normal">
                                      (required)
                                    </span>
                                  ) : null}
                                </span>
                                {optionPreview ? (
                                  <span className="text-muted-foreground text-xs">
                                    {optionPreview}
                                    {modifier.options.length > 3
                                      ? ` · +${modifier.options.length - 3} more`
                                      : ""}
                                  </span>
                                ) : null}
                              </div>
                            </label>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {mode === "create" ? "Create product" : "Save changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
