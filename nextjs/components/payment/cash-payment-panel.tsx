"use client"

import { useEffect, useId, useRef, useState } from "react"
import { AlertCircle, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/order-validation"
import { roundCurrency } from "@/lib/totals"

interface CashPaymentPanelProps {
  total: number
  onComplete: () => void
  disabled?: boolean
}

/**
 * Cash flow panel.
 *
 * Renders a "Amount tendered" input. The "Complete Payment" button is enabled
 * only when the parsed tendered amount >= total. Shows calculated change when
 * valid; shows a blocking validation message when tendered < total.
 *
 * Numbers > 2 decimal places are displayed rounded to 2 dp but the change is
 * computed from the full floating-point value and then rounded, so e.g.
 * $10.999 tendered against a $10.00 total yields $1.00 change (not $0.99).
 */
export function CashPaymentPanel({
  total,
  onComplete,
  disabled = false,
}: CashPaymentPanelProps) {
  const inputId = useId()
  const [raw, setRaw] = useState<string>("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus on mount so the cashier can start typing immediately.
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Parse the raw string to a number; NaN means empty / invalid.
  const tendered = raw === "" ? NaN : parseFloat(raw)
  const isValidNumber = !isNaN(tendered) && isFinite(tendered) && tendered >= 0
  const isSufficient = isValidNumber && tendered >= total
  const change = isSufficient
    ? roundCurrency(tendered - total)
    : null

  const showShortfall = isValidNumber && !isSufficient

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Allow empty string, digits, a single dot, and up to any decimal places.
    const value = event.target.value
    // Strip anything that isn't a digit or a dot.
    const cleaned = value.replace(/[^0-9.]/g, "")
    // Prevent multiple dots.
    const parts = cleaned.split(".")
    const normalised =
      parts.length > 2
        ? `${parts[0]}.${parts.slice(1).join("")}`
        : cleaned
    setRaw(normalised)
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label
          htmlFor={inputId}
          className="text-foreground text-sm font-medium"
        >
          Amount tendered
        </Label>
        <div className="relative">
          <span className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 text-sm select-none">
            $
          </span>
          <Input
            ref={inputRef}
            id={inputId}
            type="text"
            inputMode="decimal"
            value={raw}
            onChange={handleChange}
            placeholder={total.toFixed(2)}
            aria-label="Amount tendered"
            aria-invalid={showShortfall}
            aria-describedby={showShortfall ? `${inputId}-error` : undefined}
            data-testid="cash-tendered-input"
            disabled={disabled}
            className="pl-7 tabular-nums"
          />
        </div>

        {showShortfall ? (
          <p
            id={`${inputId}-error`}
            role="alert"
            data-testid="cash-shortfall-message"
            className="text-destructive flex items-center gap-1.5 text-xs"
          >
            <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
            Amount is{" "}
            <span className="font-semibold tabular-nums">
              {formatCurrency(roundCurrency(total - tendered))}
            </span>{" "}
            short. Please enter at least{" "}
            <span className="font-semibold tabular-nums">
              {formatCurrency(total)}
            </span>.
          </p>
        ) : null}
      </div>

      {isSufficient && change !== null ? (
        <div
          data-testid="cash-change-display"
          className="bg-secondary/60 flex items-center justify-between gap-2 rounded-xl p-4"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2
              className="text-primary size-4 shrink-0"
              aria-hidden="true"
            />
            <span className="text-foreground text-sm font-medium">
              Change due
            </span>
          </div>
          <span
            className="text-foreground text-lg font-semibold tabular-nums"
            data-testid="cash-change-amount"
          >
            {formatCurrency(change)}
          </span>
        </div>
      ) : null}

      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={!isSufficient || disabled}
        data-testid="cash-complete-button"
        onClick={onComplete}
      >
        Complete Payment
      </Button>
    </div>
  )
}
