import type { Metadata } from "next"

import { OrdersWorkspace } from "@/components/orders/orders-workspace"

export const metadata: Metadata = {
  title: "Today's orders",
  description: "Manage today's orders and their status transitions.",
}

export default function OrdersPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <header className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
          POS-Coffee &middot; Orders
        </span>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
          Today&rsquo;s orders
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Live queue for today&rsquo;s tickets. Move orders through the
          workflow, cancel non-terminal tickets, and view full order details
          inline.
        </p>
      </header>

      <OrdersWorkspace />
    </section>
  )
}
