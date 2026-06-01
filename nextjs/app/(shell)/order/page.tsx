import type { Metadata } from "next"

import { OrderWorkspace } from "@/components/order/order-workspace"

export const metadata: Metadata = {
  title: "Take orders",
  description: "Start a new ticket or jump to an open order.",
}

export default function OrderPage() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <header className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
          POS-Coffee · Order
        </span>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
          Take an order
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Tap a product to add it. Pick the options when prompted, then send it
          to checkout — your in-progress ticket sticks around if you reload.
        </p>
      </header>

      <OrderWorkspace />
    </section>
  )
}
