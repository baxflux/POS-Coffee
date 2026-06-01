import type { Metadata } from "next"
import { ClipboardList } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Today's orders",
  description: "Manage today's orders and their status transitions.",
}

export default function OrdersPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
      <header className="flex flex-col gap-3">
        <span className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
          POS-Coffee · Orders
        </span>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
          Today&rsquo;s orders
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
          Live queue of today&rsquo;s tickets. Both Admin and Cashier roles
          can review the queue and transition orders. The full order
          management screen with status filters ships in PC-9.
        </p>
      </header>

      <Card className="border-border/70 bg-card/80 max-w-2xl">
        <CardHeader>
          <span
            aria-hidden="true"
            className="bg-secondary text-secondary-foreground inline-flex size-10 items-center justify-center rounded-xl"
          >
            <ClipboardList className="size-5" />
          </span>
          <CardTitle className="mt-3 text-base">Order queue</CardTitle>
          <CardDescription>
            Status filters, ticket details, and status transitions land in
            a later task.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          For now this placeholder confirms `/orders` is reachable to both
          roles via the sidebar.
        </CardContent>
      </Card>
    </section>
  )
}
