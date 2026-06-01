import type { Metadata } from "next"

import { MenuWorkspace } from "@/components/menu/menu-workspace"

export const metadata: Metadata = {
  title: "Menu management",
  description:
    "Admin-only workspace to manage categories, products, and modifiers.",
}

export default function MenuPage() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
      <header className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
          POS-Coffee · Admin
        </span>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
          Menu management
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
          Add, edit, and organise the products cashiers can sell. Changes are
          saved to this browser and reflected immediately on the Order screen.
        </p>
      </header>

      <MenuWorkspace />
    </section>
  )
}
