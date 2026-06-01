import type { Metadata } from "next"
import { BarChart3 } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Daily report",
  description: "Admin-only daily report (placeholder for PC-10).",
}

export default function ReportPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
      <header className="flex flex-col gap-3">
        <span className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
          POS-Coffee · Admin
        </span>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
          Daily report
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
          Admin-only placeholder. The full daily report (revenue, order
          count, top items) lands in PC-10. Cashiers who try to reach this
          URL are redirected to the Not authorized screen by the route
          guard.
        </p>
      </header>

      <Card className="border-border/70 bg-card/80 max-w-2xl">
        <CardHeader>
          <span
            aria-hidden="true"
            className="bg-secondary text-secondary-foreground inline-flex size-10 items-center justify-center rounded-xl"
          >
            <BarChart3 className="size-5" />
          </span>
          <CardTitle className="mt-3 text-base">Report summary</CardTitle>
          <CardDescription>
            Revenue, order count, and top-selling items arrive in a later task.
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
