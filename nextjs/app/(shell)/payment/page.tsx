import type { Metadata } from "next"

import { PaymentWorkspace } from "@/components/payment/payment-workspace"

export const metadata: Metadata = {
  title: "Payment",
  description: "Complete the current order with Cash, Card, or Mobile Pay.",
}

/**
 * Payment page — reached via the Pay button on the /order screen.
 *
 * The PaymentWorkspace reads the cart from the Zustand store directly;
 * if the cart is empty when the workspace renders (e.g. navigating here
 * directly with no items) it shows a loading spinner briefly, then the
 * workspace redirect logic sends the user back to /order.
 */
export default function PaymentPage() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <header className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
          POS-Coffee &middot; Payment
        </span>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
          Checkout
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Review the order, choose a payment method, and complete the
          transaction. The order is sent to the kitchen queue on success.
        </p>
      </header>

      <PaymentWorkspace />
    </section>
  )
}
