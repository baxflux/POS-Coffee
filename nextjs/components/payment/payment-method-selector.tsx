"use client"

import { CreditCard, Smartphone, Wallet } from "lucide-react"

import { cn } from "@/lib/utils"
import type { PaymentMethod } from "@/types"

interface PaymentMethodSelectorProps {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
  disabled?: boolean
}

const METHODS: Array<{ id: PaymentMethod; label: string; icon: React.ReactNode }> = [
  { id: "cash", label: "Cash", icon: <Wallet className="size-4" aria-hidden="true" /> },
  { id: "card", label: "Card", icon: <CreditCard className="size-4" aria-hidden="true" /> },
  { id: "mobile", label: "Mobile", icon: <Smartphone className="size-4" aria-hidden="true" /> },
]

/**
 * Three-button payment method selector. Uses native buttons styled as a
 * segmented control so we avoid importing the Tabs primitive (which adds extra
 * markup) and can keep the component fully self-contained.
 */
export function PaymentMethodSelector({
  value,
  onChange,
  disabled = false,
}: PaymentMethodSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Payment method"
      data-testid="payment-method-selector"
      className="border-border/70 grid grid-cols-3 gap-2 rounded-xl border p-2"
    >
      {METHODS.map((method) => {
        const isActive = value === method.id
        return (
          <button
            key={method.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={method.label}
            data-testid={`payment-method-${method.id}`}
            disabled={disabled}
            onClick={() => onChange(method.id)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium transition-all",
              "disabled:pointer-events-none disabled:opacity-50",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {method.icon}
            {method.label}
          </button>
        )
      })}
    </div>
  )
}
