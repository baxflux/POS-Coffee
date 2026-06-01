"use client"

import { useSyncExternalStore } from "react"
import {
  BarChart3,
  CreditCard,
  ShoppingBag,
  Smartphone,
  TrendingUp,
  Trophy,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { computeTopItems, filterTodaysOrders } from "@/lib/orders"
import { roundCurrency } from "@/lib/totals"
import { formatCurrency } from "@/lib/order-validation"
import { useOrdersStore } from "@/stores/useOrdersStore"
import type { PaymentMethod } from "@/types"

// ---------------------------------------------------------------------------
// Hydration guard (same pattern as receipt-page-client)
// ---------------------------------------------------------------------------

function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string
  value: string
  icon: React.ReactNode
  description?: string
}

function StatCard({ label, value, icon, description }: StatCardProps) {
  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription className="text-xs font-medium uppercase tracking-widest">
          {label}
        </CardDescription>
        <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 inline-flex size-8 items-center justify-center rounded-lg">
          {icon}
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-foreground text-2xl font-bold tracking-tight">
          {value}
        </p>
        {description && (
          <p className="text-muted-foreground mt-1 text-xs">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  mobile: "Mobile",
}

const PAYMENT_ICON: Record<PaymentMethod, React.ReactNode> = {
  cash: <ShoppingBag className="size-4" />,
  card: <CreditCard className="size-4" />,
  mobile: <Smartphone className="size-4" />,
}

// ---------------------------------------------------------------------------
// Main workspace
// ---------------------------------------------------------------------------

export function ReportWorkspace() {
  const isClient = useIsClient()

  const allOrders = useOrdersStore((s) => s.orders)

  if (!isClient) {
    return (
      <div className="bg-muted/40 h-64 w-full animate-pulse rounded-xl" />
    )
  }

  // Filter to today's completed orders only — cancelled excluded.
  const todaysOrders = filterTodaysOrders(allOrders)
  const completedOrders = todaysOrders.filter((o) => o.status === "completed")

  const orderCount = completedOrders.length
  const revenue = roundCurrency(
    completedOrders.reduce((sum, o) => sum + o.total, 0)
  )
  const avgOrderValue =
    orderCount > 0 ? roundCurrency(revenue / orderCount) : 0

  // Top 5 items (computeTopItems already skips cancelled, pass today's orders)
  const topItems = computeTopItems(todaysOrders, 5)

  // Payment method breakdown across completed orders
  const paymentBreakdown = completedOrders.reduce<
    Record<PaymentMethod, { count: number; amount: number }>
  >(
    (acc, order) => {
      const method = order.paymentMethod
      if (!method) return acc
      acc[method].count += 1
      acc[method].amount = roundCurrency(acc[method].amount + order.total)
      return acc
    },
    {
      cash: { count: 0, amount: 0 },
      card: { count: 0, amount: 0 },
      mobile: { count: 0, amount: 0 },
    }
  )

  // Empty state — no completed orders today
  if (orderCount === 0) {
    return (
      <div className="border-border/60 bg-card/60 flex flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-16 text-center">
        <span className="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 inline-flex size-14 items-center justify-center rounded-2xl">
          <BarChart3 className="size-7" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-foreground text-base font-semibold">
            No completed orders today
          </p>
          <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
            Revenue and item stats will appear here once orders are marked as
            completed. Cancelled orders are excluded from all figures.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ------------------------------------------------------------------ */}
      {/* Summary stats */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Summary statistics
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total revenue"
            value={formatCurrency(revenue)}
            icon={<TrendingUp className="size-4" />}
            description="Completed orders only"
          />
          <StatCard
            label="Orders completed"
            value={orderCount.toString()}
            icon={<BarChart3 className="size-4" />}
            description="Cancelled orders excluded"
          />
          <StatCard
            label="Avg. order value"
            value={formatCurrency(avgOrderValue)}
            icon={<Trophy className="size-4" />}
            description={`Across ${orderCount} order${orderCount !== 1 ? "s" : ""}`}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* ---------------------------------------------------------------- */}
        {/* Top 5 items */}
        {/* ---------------------------------------------------------------- */}
        <section aria-labelledby="top-items-heading">
          <Card className="border-border/70 bg-card/80 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="size-4 text-amber-600" />
                Top items today
              </CardTitle>
              <CardDescription className="text-xs">
                Ranked by quantity sold (cancelled orders excluded)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {topItems.length === 0 ? (
                <p className="text-muted-foreground px-6 pb-6 text-sm">
                  No item data available.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">#</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="pr-6 text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topItems.map((item, index) => (
                      <TableRow key={item.productId}>
                        <TableCell className="pl-6">
                          <Badge
                            variant="secondary"
                            className="size-6 justify-center rounded-full p-0 text-xs font-semibold"
                          >
                            {index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.productName}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="pr-6 text-right text-amber-700 dark:text-amber-400">
                          {formatCurrency(item.revenue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Payment method breakdown */}
        {/* ---------------------------------------------------------------- */}
        <section aria-labelledby="payment-heading">
          <Card className="border-border/70 bg-card/80 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="size-4 text-amber-600" />
                Payment breakdown
              </CardTitle>
              <CardDescription className="text-xs">
                Completed orders grouped by payment method
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-2">
              {(["cash", "card", "mobile"] as PaymentMethod[]).map((method) => {
                const { count, amount } = paymentBreakdown[method]
                return (
                  <div key={method}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground inline-flex">
                          {PAYMENT_ICON[method]}
                        </span>
                        <span className="text-sm font-medium">
                          {PAYMENT_LABEL[method]}
                        </span>
                        {count > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {count} order{count !== 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                      <span
                        className={`text-sm font-semibold tabular-nums ${
                          count > 0
                            ? "text-amber-700 dark:text-amber-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {count > 0 ? formatCurrency(amount) : "—"}
                      </span>
                    </div>
                    <Separator className="mt-3" />
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
