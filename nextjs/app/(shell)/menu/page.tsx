import type { Metadata } from "next"
import { LayoutGrid } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Menu management",
  description: "Admin-only menu management workspace (placeholder for PC-5).",
}

export default function MenuPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
      <header className="flex flex-col gap-3">
        <span className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
          POS-Coffee · Admin
        </span>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
          Menu management
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
          Admin-only placeholder. The full menu management workspace
          (categories, products, modifiers) lands in PC-5. Cashiers who try
          to reach this URL are redirected to the Not authorized screen by
          the route guard.
        </p>
      </header>

      <Card className="border-border/70 bg-card/80 max-w-2xl">
        <CardHeader>
          <span
            aria-hidden="true"
            className="bg-secondary text-secondary-foreground inline-flex size-10 items-center justify-center rounded-xl"
          >
            <LayoutGrid className="size-5" />
          </span>
          <CardTitle className="mt-3 text-base">Menu workspace</CardTitle>
          <CardDescription>
            Categories, products, and modifiers will be editable here.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          For PC-4 this page confirms the admin-only nav link routes here
          and that cashier sessions cannot reach it.
        </CardContent>
      </Card>
    </section>
  )
}
