import type { Metadata } from "next"

import { SessionPanel } from "@/components/auth/session-panel"

export const metadata: Metadata = {
  title: "Take orders",
  description: "Cashier home — start a new ticket or jump to an open order.",
}

export default function OrderPage() {
  return (
    <main className="from-coffee-cream via-background to-coffee-latte/40 min-h-dvh bg-gradient-to-br">
      <section className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12 md:py-16">
        <header className="flex flex-col gap-3">
          <span className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
            POS-Coffee · Cashier
          </span>
          <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
            Ready to take an order?
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
            This is the cashier landing screen. The full order-entry flow
            ships in PC-6, so for now this page is a placeholder that
            confirms role-based routing works as expected.
          </p>
        </header>

        <SessionPanel />
      </section>
    </main>
  )
}
