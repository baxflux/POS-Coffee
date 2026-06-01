"use client"

import { useState } from "react"
import { Minus, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ORDER_NOTE_MAX_LENGTH, formatCurrency } from "@/lib/order-validation"
import { computeUnitPrice } from "@/lib/totals"
import type { OrderLineItem } from "@/types"

interface CartLineItemProps {
  item: OrderLineItem
  onIncrement: (lineId: string) => void
  onDecrement: (lineId: string) => void
  onNotesChange: (lineId: string, notes: string) => void
  onRequestRemove: (item: OrderLineItem) => void
}

/**
 * Single row in the cart. Quantity controls update the store directly;
 * decrementing past 1 stays at 1 to avoid an accidental remove (use the
 * trash button for that — it triggers the confirm dialog).
 *
 * Notes have a local buffer so typing doesn't push every keystroke through
 * the store; the buffer commits onBlur (and on Enter for keyboards).
 */
export function CartLineItem({
  item,
  onIncrement,
  onDecrement,
  onNotesChange,
  onRequestRemove,
}: CartLineItemProps) {
  // Local buffer so typing doesn't push every keystroke through the store.
  // The parent uses `key={item.id}` on each row so this state is naturally
  // discarded when the line is replaced (e.g. after a merge), which avoids
  // an in-effect setState to re-sync.
  const [notesDraft, setNotesDraft] = useState(item.notes)

  const unitPrice = computeUnitPrice(item.unitBasePrice, item.modifiers)
  const decrementDisabled = item.quantity <= 1

  const commitNotes = () => {
    if (notesDraft.trim() === item.notes.trim()) return
    onNotesChange(item.id, notesDraft.trim())
  }

  return (
    <li
      data-testid={`cart-line-${item.id}`}
      className="border-border/70 bg-card/60 grid gap-3 rounded-xl border p-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-1">
          <span className="text-foreground text-sm leading-tight font-semibold">
            {item.productName}
          </span>
          <span className="text-muted-foreground text-xs tabular-nums">
            {formatCurrency(unitPrice)} each
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove ${item.productName} from order`}
          onClick={() => onRequestRemove(item)}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </Button>
      </div>

      {item.modifiers.length > 0 ? (
        <ul className="text-muted-foreground grid gap-0.5 text-xs">
          {item.modifiers.map((modifier) => (
            <li key={`${item.id}-${modifier.modifierId}`}>
              <span className="text-foreground/80">
                {modifier.modifierName}:
              </span>{" "}
              {modifier.optionName}
              {modifier.priceDelta !== 0 ? (
                <span className="ml-1 tabular-nums">
                  ({modifier.priceDelta > 0 ? "+" : ""}
                  {formatCurrency(modifier.priceDelta)})
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="grid gap-1">
        <Label
          htmlFor={`notes-${item.id}`}
          className="text-muted-foreground text-xs"
        >
          Line notes
        </Label>
        <Input
          id={`notes-${item.id}`}
          value={notesDraft}
          onChange={(event) => setNotesDraft(event.target.value)}
          onBlur={commitNotes}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              commitNotes()
              event.currentTarget.blur()
            }
          }}
          placeholder="e.g. extra hot, light foam"
          maxLength={ORDER_NOTE_MAX_LENGTH}
          className="h-8 text-sm"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div
          role="group"
          aria-label={`Quantity for ${item.productName}`}
          className="border-border/70 inline-flex items-center gap-1 rounded-lg border p-0.5"
        >
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Decrease quantity"
            onClick={() => onDecrement(item.id)}
            disabled={decrementDisabled}
          >
            <Minus className="size-4" aria-hidden="true" />
          </Button>
          <span
            data-testid={`cart-line-qty-${item.id}`}
            aria-live="polite"
            className="text-foreground inline-flex w-8 justify-center text-sm tabular-nums"
          >
            {item.quantity}
          </span>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Increase quantity"
            onClick={() => onIncrement(item.id)}
          >
            <Plus className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <span
          className="text-foreground text-sm font-semibold tabular-nums"
          data-testid={`cart-line-total-${item.id}`}
        >
          {formatCurrency(item.lineTotal)}
        </span>
      </div>
    </li>
  )
}
