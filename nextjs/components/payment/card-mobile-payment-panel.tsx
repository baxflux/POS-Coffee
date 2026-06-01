"use client"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/order-validation"
import type { PaymentMethod } from "@/types"

interface CardMobilePaymentPanelProps {
  method: Extract<PaymentMethod, "card" | "mobile">
  total: number
  onComplete: () => void
  isProcessing?: boolean
}

const LABELS: Record<Extract<PaymentMethod, "card" | "mobile">, string> = {
  card: "Card",
  mobile: "Mobile Pay",
}

const INSTRUCTIONS: Record<Extract<PaymentMethod, "card" | "mobile">, string> = {
  card: "Tap or insert the customer's card to complete the payment.",
  mobile: "Ask the customer to tap their phone or device to the reader.",
}

/**
 * Shared panel for Card and Mobile payment flows.
 *
 * Both are simulated — a single "Complete Payment" button triggers an 800ms
 * delay (handled by the parent) before the order is committed. A spinner
 * replaces the button label during processing.
 */
export function CardMobilePaymentPanel({
  method,
  total,
  onComplete,
  isProcessing = false,
}: CardMobilePaymentPanelProps) {
  return (
    <div className="grid gap-4">
      <p className="text-muted-foreground text-sm leading-relaxed">
        {INSTRUCTIONS[method]}
      </p>

      <div className="bg-secondary/60 flex items-center justify-between gap-2 rounded-xl p-4">
        <span className="text-muted-foreground text-sm">
          Amount to charge
        </span>
        <span className="text-foreground text-lg font-semibold tabular-nums">
          {formatCurrency(total)}
        </span>
      </div>

      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={isProcessing}
        data-testid={`${method}-complete-button`}
        onClick={onComplete}
      >
        {isProcessing ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Processing…
          </>
        ) : (
          `Complete Payment — ${LABELS[method]} ${formatCurrency(total)}`
        )}
      </Button>
    </div>
  )
}
