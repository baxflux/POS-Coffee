import type { Metadata } from "next"
import { CupSoda } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Take orders",
  description: "Start a new ticket or jump to an open order.",
}

export default function OrderPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
      <header className="flex flex-col gap-3">
        <span className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
          POS-Coffee · Order
        </span>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
          Take an order
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
          This is the shared landing screen for taking new orders. The full
          order-entry flow ships in PC-6, so for now this page confirms the
          app shell, header, and role-based navigation are wired correctly.
        </p>
      </header>

      <Card className="border-border/70 bg-card/80 max-w-2xl">
        <CardHeader>
          <span
            aria-hidden="true"
            className="bg-secondary text-secondary-foreground inline-flex size-10 items-center justify-center rounded-xl"
          >
            <CupSoda className="size-5" />
          </span>
          <CardTitle className="mt-3 text-base">New ticket</CardTitle>
          <CardDescription>
            Both Admin and Cashier sessions land here so the team can
            jump straight into service.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Order entry, modifiers, and checkout arrive in subsequent tasks.
        </CardContent>
      </Card>
    </section>
  )
}
