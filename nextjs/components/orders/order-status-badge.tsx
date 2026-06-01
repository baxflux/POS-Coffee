import { Badge } from "@/components/ui/badge"
import type { OrderStatus } from "@/types"

interface OrderStatusBadgeProps {
  status: OrderStatus
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  preparing: {
    label: "Preparing",
    className:
      "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  },
  ready: {
    label: "Ready",
    className:
      "bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800",
  },
  completed: {
    label: "Completed",
    className:
      "bg-green-100 text-green-800 border-green-200 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "bg-muted text-muted-foreground border-border hover:bg-muted",
  },
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.preparing
  return (
    <Badge
      variant="outline"
      className={config.className}
      data-testid={`status-badge-${status}`}
    >
      {config.label}
    </Badge>
  )
}
