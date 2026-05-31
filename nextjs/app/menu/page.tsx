import type { Metadata } from "next"

import { SessionPanel } from "@/components/auth/session-panel"

export const metadata: Metadata = {
  title: "Menu management",
  description: "Admin-only menu management workspace (placeholder for PC-5).",
}

export default function MenuPage() {
  return (
    <main className="from-coffee-cream via-background to-coffee-latte/40 min-h-dvh bg-gradient-to-br">
      <section className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12 md:py-16">
        <header className="flex flex-col gap-3">
          <span className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
            POS-Coffee · Admin
          </span>
          <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
            Menu management
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
            Admin-only placeholder. The full menu management workspace
            (categories, products, modifiers) lands in PC-5. Cashiers who
            try to reach this URL are bounced back to the order screen by
            the route guard.
          </p>
        </header>

        <SessionPanel />
      </section>
    </main>
  )
}
