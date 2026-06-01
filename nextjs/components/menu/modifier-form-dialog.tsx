"use client"

import { useEffect, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { Plus, Trash2, TriangleAlert } from "lucide-react"

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
import { createId } from "@/lib/ids"
import {
  modifierFormSchema,
  type ModifierFormValues,
} from "@/lib/menu-validation"

export interface ModifierFormDefaults {
  name?: string
  required?: boolean
  options?: ReadonlyArray<{
    id: string
    name: string
    priceDelta: string
  }>
}

interface ModifierFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  defaults?: ModifierFormDefaults
  onSubmit: (values: ModifierFormValues) => boolean
}

const EMPTY_DEFAULTS: Required<Omit<ModifierFormDefaults, "options">> & {
  options: { id: string; name: string; priceDelta: string }[]
} = {
  name: "",
  required: false,
  options: [],
}

function makeFreshOption() {
  return { id: createId("mod-option"), name: "", priceDelta: "0" }
}

export function ModifierFormDialog({
  open,
  onOpenChange,
  mode,
  defaults,
  onSubmit,
}: ModifierFormDialogProps) {
  const seeded = useMemo<ModifierFormValues>(() => {
    const merged = {
      ...EMPTY_DEFAULTS,
      ...(defaults ?? {}),
      options:
        defaults?.options && defaults.options.length > 0
          ? defaults.options.map((option) => ({ ...option }))
          : [makeFreshOption(), makeFreshOption()],
    }
    return merged
  }, [defaults])

  const form = useForm<ModifierFormValues>({
    resolver: zodResolver(modifierFormSchema),
    defaultValues: seeded,
    mode: "onSubmit",
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
    keyName: "fieldKey",
  })

  useEffect(() => {
    if (open) {
      form.reset(seeded)
    }
  }, [open, seeded, form])

  const watchedOptions = form.watch("options") ?? []

  const hasNegativeDelta = watchedOptions.some((option) => {
    const value = Number(option?.priceDelta)
    return Number.isFinite(value) && value < 0
  })

  const handleSubmit = (values: ModifierFormValues) => {
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
            {mode === "create" ? "New modifier" : "Edit modifier"}
          </DialogTitle>
          <DialogDescription>
            Modifiers (like Size or Milk) attach to products and let cashiers
            customise orders at the till.
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
                      placeholder="e.g. Size, Milk, Extras"
                      maxLength={40}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="required"
              render={({ field }) => (
                <FormItem className="bg-muted/40 flex flex-row items-start gap-3 rounded-lg border p-3">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={Boolean(field.value)}
                      onChange={(event) => field.onChange(event.target.checked)}
                      className="border-input bg-background focus-visible:ring-ring/50 mt-0.5 size-4 rounded border focus-visible:ring-3"
                    />
                  </FormControl>
                  <div className="grid flex-1 gap-1">
                    <FormLabel className="font-medium">
                      Selection is required
                    </FormLabel>
                    <FormDescription>
                      Force the cashier to pick one of the options before adding
                      the item to the order.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <FormLabel className="text-sm font-medium">Options</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append(makeFreshOption())}
                  disabled={fields.length >= 10}
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                  Add option
                </Button>
              </div>

              <ul className="grid gap-2">
                {fields.map((fieldItem, index) => (
                  <li
                    key={fieldItem.fieldKey}
                    className="border-border/70 grid gap-2 rounded-lg border p-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end"
                  >
                    <FormField
                      control={form.control}
                      name={`options.${index}.name` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Option name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={`Option ${index + 1}`}
                              maxLength={40}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`options.${index}.priceDelta` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Price delta (USD)
                          </FormLabel>
                          <FormControl>
                            <Input
                              inputMode="decimal"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove option ${index + 1}`}
                      onClick={() => remove(index)}
                      disabled={fields.length <= 1}
                      className="self-end justify-self-end"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>

              {form.formState.errors.options?.message ? (
                <p className="text-destructive text-sm">
                  {String(form.formState.errors.options.message)}
                </p>
              ) : null}

              {hasNegativeDelta ? (
                <p
                  role="alert"
                  className="flex items-start gap-2 rounded-md border border-amber-400/60 bg-amber-100/70 px-3 py-2 text-sm text-amber-900"
                >
                  <TriangleAlert
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>
                    One or more options have a negative price delta. The
                    modifier will subtract from the product price at order time
                    — double-check this is intentional.
                  </span>
                </p>
              ) : null}
            </div>

            <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {mode === "create" ? "Create modifier" : "Save changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
