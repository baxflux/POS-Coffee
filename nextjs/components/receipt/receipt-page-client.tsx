"use client"

import { useEffect, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"

import { useOrdersStore } from "@/stores"

import { ReceiptView } from "./receipt-view"

interface Props {
  orderId: string
  tenderedAmount?: number
}

/**
 * Returns `true` only on the client after the first render.
 *
 * Uses `useSyncExternalStore` with a no-op subscribe so React can safely
 * diff the server snapshot (`false`) against the client snapshot (`true`).
 * This is the React-recommended pattern for hydration guards that avoids
 * `setState` inside an effect.
 */
function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

/**
 * Client wrapper — reads the order from the Zustand store (localStorage-
 * persisted) and renders `ReceiptView`. Redirects to /orders if the order
 * is not found after hydration.
 */
export function ReceiptPageClient({ orderId, tenderedAmount }: Props) {
  const router = useRouter()
  const isClient = useIsClient()

  // Subscribe to the store directly via selector — no setState-in-effect needed.
  const order = useOrdersStore((state) =>
    state.orders.find((o) => o.id === orderId)
  )

  // Once hydrated on the client, redirect to /orders if the order doesn't exist.
  useEffect(() => {
    if (isClient && !order) {
      router.replace("/orders")
    }
  }, [isClient, order, router])

  if (!isClient || !order) {
    return null
  }

  return <ReceiptView order={order} tenderedAmount={tenderedAmount} />
}
