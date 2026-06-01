"use client"

import { useEffect } from "react"
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  categoryFormSchema,
  type CategoryFormValues,
} from "@/lib/menu-validation"

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  defaultName?: string
  /** Submit handler — returns true on success so the dialog can close. */
  onSubmit: (values: CategoryFormValues) => boolean
}

/**
 * Form dialog for creating or renaming a category. Validation lives in
 * `lib/menu-validation.ts`; on submit the parent decides whether to keep
 * the dialog open (e.g. to surface a duplicate warning) by returning false.
 */
export function CategoryFormDialog({
  open,
  onOpenChange,
  mode,
  defaultName = "",
  onSubmit,
}: CategoryFormDialogProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: defaultName },
    mode: "onSubmit",
  })

  // Reset the form whenever the dialog opens so create/edit reflects the
  // latest defaults rather than leftover state from a previous session.
  useEffect(() => {
    if (open) {
      form.reset({ name: defaultName })
    }
  }, [open, defaultName, form])

  const handleSubmit = (values: CategoryFormValues) => {
    const accepted = onSubmit(values)
    if (accepted) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New category" : "Rename category"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Categories group similar products together on the order screen."
              : "Renaming a category does not move its products."}
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
                  <FormLabel>Category name</FormLabel>
                  <FormControl>
                    <Input
                      autoFocus
                      placeholder="e.g. Espresso, Brewed, Pastries"
                      maxLength={60}
                      {...field}
                    />
                  </FormControl>
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
                {mode === "create" ? "Create category" : "Save changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
