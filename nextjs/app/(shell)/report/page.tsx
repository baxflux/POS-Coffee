import type { Metadata } from "next"
import { format } from "date-fns"

import { ReportWorkspace } from "@/components/report/report-workspace"

export const metadata: Metadata = {
  title: "Daily report",
  description: "Admin-only daily sales report — revenue, order count, top items.",
}

export default function ReportPage() {
  const today = format(new Date(), "EEEE, MMMM d, yyyy")

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <header className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
          POS-Coffee &middot; Admin &middot; Report
        </span>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
          Daily report
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          {today} &mdash; Revenue, order counts, and top-selling items for
          today&rsquo;s completed orders. Cancelled orders are excluded from all
          figures.
        </p>
      </header>

      <ReportWorkspace />
    </section>
  )
}
