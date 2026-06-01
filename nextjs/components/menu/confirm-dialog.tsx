"use client"

import { TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: "default" | "destructive"
  onConfirm: () => void
}

/**
 * Lightweight confirm dialog built on the existing shadcn `Dialog` so we
 * don't have to install `AlertDialog`. Used for destructive actions
 * (delete category / delete product / delete modifier) and for the
 * duplicate-product-name warning step.
 *
 * Description is rendered as a sibling `<div>` rather than a Base UI
 * `<DialogDescription>` because the latter renders a `<p>` and we sometimes
 * pass block content (lists, multi-paragraph warnings).
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
}: ConfirmDialogProps) {
  const iconStyles =
    variant === "destructive"
      ? "bg-destructive/10 text-destructive"
      : "bg-secondary text-secondary-foreground"

  return (
    <Dialog open={open} onOpenChange={(value) => onOpenChange(value)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <span
            aria-hidden="true"
            className={`inline-flex size-10 items-center justify-center rounded-xl ${iconStyles}`}
          >
            <TriangleAlert className="size-5" />
          </span>
          <DialogTitle className="mt-3 text-base">{title}</DialogTitle>
          <div className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </div>
        </DialogHeader>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
