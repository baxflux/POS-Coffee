"use client"

import { useSyncExternalStore, useState } from "react"
import { format } from "date-fns"
import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  CreditCard,
  Receipt,
  Smartphone,
  ShoppingBag,
  XCircle,
} from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ConfirmDialog } from "@/components/menu/confirm-dialog"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { formatCurrency } from "@/lib/order-validation"
import { filterTodaysOrders } from "@/lib/orders"
import { useOrdersStore } from "@/stores/useOrdersStore"
import type { Order, OrderLineItem, OrderStatus, PaymentMethod } from "@/types"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TransitionConfig {
  label: string
  nextStatus: OrderStatus
  variant: "default" | "outline" | "secondary"
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TRANSITION_MAP: Partial<Record<OrderStatus, TransitionConfig>> = {
  preparing: {
    label: "Mark Complete",
    nextStatus: "completed",
    variant: "default",
  },
}

function isTerminal(status: OrderStatus): boolean {
  return status === "completed" || status === "cancelled"
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  mobile: "Mobile",
}

function PaymentIcon({ method }: { method: PaymentMethod | null }) {
  if (method === "card") return <CreditCard className="size-3.5" aria-hidden />
  if (method === "mobile")
    return <Smartphone className="size-3.5" aria-hidden />
  return <ShoppingBag className="size-3.5" aria-hidden />
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface LineItemRowProps {
  item: OrderLineItem
}

function LineItemRow({ item }: LineItemRowProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-start justify-between gap-2">
        <span className="text-foreground text-sm font-medium">
          {item.quantity > 1 ? (
            <span className="text-muted-foreground mr-1 text-xs tabular-nums">
              {item.quantity}&times;
            </span>
          ) : null}
          {item.productName}
        </span>
        <span className="text-foreground shrink-0 text-sm tabular-nums">
          {formatCurrency(item.lineTotal)}
        </span>
      </div>

      {item.modifiers.length > 0 ? (
        <ul className="ml-2 flex flex-col gap-0.5" aria-label="Modifiers">
          {item.modifiers.map((mod) => (
            <li
              key={mod.optionId}
              className="text-muted-foreground flex items-center gap-1 text-xs"
            >
              <span className="opacity-50">&middot;</span>
              {mod.modifierName}: {mod.optionName}
              {mod.priceDelta !== 0 ? (
                <span className="tabular-nums opacity-70">
                  ({mod.priceDelta > 0 ? "+" : ""}
                  {formatCurrency(mod.priceDelta)})
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {item.notes ? (
        <p className="text-muted-foreground ml-2 text-xs italic">
          Note: {item.notes}
        </p>
      ) : null}
    </div>
  )
}

interface OrderDetailProps {
  order: Order
}

function OrderDetail({ order }: OrderDetailProps) {
  return (
    <div
      className="border-border/50 bg-muted/30 flex flex-col gap-4 rounded-b-xl border-x border-b px-4 py-4"
      data-testid={`order-detail-${order.id}`}
    >
      {/* Line items */}
      <div className="flex flex-col gap-3">
        {order.items.map((item) => (
          <LineItemRow key={item.id} item={item} />
        ))}
      </div>

      <Separator />

      {/* Totals */}
      <div className="flex flex-col gap-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="tabular-nums">{formatCurrency(order.subtotal)}</span>
        </div>
        {order.discount > 0 ? (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Discount</span>
            <span className="text-primary tabular-nums">
              -{formatCurrency(order.discount)}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatCurrency(order.total)}</span>
        </div>
      </div>

      {/* Payment / receipt link */}
      {order.paymentMethod ? (
        <div className="flex items-center justify-between gap-2">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <PaymentIcon method={order.paymentMethod} />
            {PAYMENT_LABELS[order.paymentMethod]}
          </div>
          {order.status === "completed" ? (
            <Link
              href={`/receipt/${order.id}`}
              className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs font-medium underline-offset-2 hover:underline"
              data-testid={`receipt-link-${order.id}`}
            >
              <Receipt className="size-3.5" aria-hidden />
              View Receipt
            </Link>
          ) : null}
        </div>
      ) : null}

      {/* Cashier */}
      <p className="text-muted-foreground text-xs">
        Cashier: {order.cashierName}
      </p>
    </div>
  )
}

interface OrderRowProps {
  order: Order
  expanded: boolean
  onToggle: () => void
  onTransition: (orderId: string, status: OrderStatus) => void
  onCancelRequest: (orderId: string) => void
}

function OrderRow({
  order,
  expanded,
  onToggle,
  onTransition,
  onCancelRequest,
}: OrderRowProps) {
  const transition = TRANSITION_MAP[order.status]
  const terminal = isTerminal(order.status)
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <div
      className="border-border/70 overflow-hidden rounded-xl border"
      data-testid={`order-row-${order.id}`}
    >
      {/* Header row */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
      >
        {/* Ticket number */}
        <span
          className="text-foreground w-20 shrink-0 font-mono text-sm font-semibold tabular-nums"
          data-testid={`ticket-number-${order.id}`}
        >
          {order.ticketNumber}
        </span>

        {/* Time */}
        <span className="text-muted-foreground hidden w-14 shrink-0 text-xs tabular-nums sm:block">
          {format(new Date(order.createdAt), "HH:mm")}
        </span>

        {/* Item count */}
        <span className="text-muted-foreground hidden w-16 shrink-0 text-xs sm:block">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>

        {/* Total */}
        <span className="w-20 shrink-0 text-sm font-medium tabular-nums">
          {formatCurrency(order.total)}
        </span>

        {/* Status badge */}
        <span className="flex-1">
          <OrderStatusBadge status={order.status} />
        </span>

        {/* Payment method */}
        {order.paymentMethod ? (
          <span className="text-muted-foreground hidden items-center gap-1 text-xs md:flex">
            <PaymentIcon method={order.paymentMethod} />
            {PAYMENT_LABELS[order.paymentMethod]}
          </span>
        ) : (
          <span className="text-muted-foreground hidden text-xs md:block">
            &mdash;
          </span>
        )}

        {/* Chevron */}
        <span aria-hidden="true" className="text-muted-foreground ml-auto shrink-0">
          {expanded ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </span>
      </button>

      {/* Action bar — always visible (below header row) */}
      <div className="border-border/40 flex items-center gap-2 border-t bg-muted/20 px-4 py-2">
        {transition && !terminal ? (
          <Button
            type="button"
            size="sm"
            variant={transition.variant}
            onClick={() => onTransition(order.id, transition.nextStatus)}
            data-testid={`transition-btn-${order.id}`}
          >
            {transition.label}
          </Button>
        ) : null}

        {!terminal ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onCancelRequest(order.id)}
            data-testid={`cancel-btn-${order.id}`}
          >
            <XCircle className="size-4" aria-hidden />
            Cancel
          </Button>
        ) : null}

        {terminal ? (
          <span className="text-muted-foreground text-xs">
            {order.status === "completed" ? "Order completed." : "Order cancelled."}
          </span>
        ) : null}
      </div>

      {/* Expandable detail */}
      {expanded ? <OrderDetail order={order} /> : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center gap-4 rounded-2xl border border-dashed py-16 text-center"
      data-testid="orders-empty-state"
    >
      <span
        aria-hidden="true"
        className="bg-secondary text-secondary-foreground inline-flex size-12 items-center justify-center rounded-2xl"
      >
        <ClipboardList className="size-6" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-foreground text-sm font-medium">
          No orders today — yet.
        </p>
        <p className="text-muted-foreground text-sm">
          Orders placed on this screen will appear here once a cashier
          starts a ticket.
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Root workspace
// ---------------------------------------------------------------------------

export function OrdersWorkspace() {
  const orders = useOrdersStore((state) => state.orders)
  const setStatus = useOrdersStore((state) => state.setStatus)
  const cancelOrder = useOrdersStore((state) => state.cancelOrder)

  // Hydration guard — render nothing until the store has rehydrated from
  // localStorage, so the server snapshot and client snapshot match.
  const isClient = useSyncExternalStore(
    (cb) => {
      cb()
      return () => undefined
    },
    () => true,
    () => false
  )

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null)

  if (!isClient) return null

  const todayOrders = filterTodaysOrders(orders)

  const handleToggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id))

  const handleTransition = (orderId: string, status: OrderStatus) => {
    setStatus(orderId, status)
  }

  const handleCancelRequest = (orderId: string) => {
    setCancelTargetId(orderId)
  }

  const handleCancelConfirm = () => {
    if (cancelTargetId) {
      cancelOrder(cancelTargetId)
      // Collapse the row if it was expanded
      if (expandedId === cancelTargetId) setExpandedId(null)
    }
    setCancelTargetId(null)
  }

  const cancelTarget = todayOrders.find((o) => o.id === cancelTargetId)

  return (
    <>
      {/* Summary pill */}
      {todayOrders.length > 0 ? (
        <div className="flex flex-wrap gap-2" data-testid="orders-summary-pills">
          {([
            ["preparing", "Preparing"],
            ["completed", "Completed"],
            ["cancelled", "Cancelled"],
          ] as [OrderStatus, string][]).map(([status, label]) => {
            const count = todayOrders.filter((o) => o.status === status).length
            if (count === 0) return null
            return (
              <Badge
                key={status}
                variant="secondary"
                className="rounded-full px-3 py-1 text-xs"
              >
                {label}: {count}
              </Badge>
            )
          })}
        </div>
      ) : null}

      {/* Order list */}
      {todayOrders.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          className="flex flex-col gap-3"
          data-testid="orders-list"
        >
          {todayOrders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              expanded={expandedId === order.id}
              onToggle={() => handleToggle(order.id)}
              onTransition={handleTransition}
              onCancelRequest={handleCancelRequest}
            />
          ))}
        </div>
      )}

      {/* Cancel confirmation dialog */}
      <ConfirmDialog
        open={cancelTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setCancelTargetId(null)
        }}
        title="Cancel this order?"
        description={
          cancelTarget ? (
            <span>
              Ticket <strong>{cancelTarget.ticketNumber}</strong> will be marked
              as cancelled. This action cannot be undone.
            </span>
          ) : (
            "This order will be cancelled."
          )
        }
        confirmLabel="Yes, cancel order"
        cancelLabel="Keep order"
        variant="destructive"
        onConfirm={handleCancelConfirm}
      />
    </>
  )
}
