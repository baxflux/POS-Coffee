"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { useOrdersStore } from "@/stores"
import type { Order } from "@/types"

import { ReceiptView } from "./receipt-view"

interface Props {
  orderId: string
  tenderedAmount?: number
}

/**
 * Client wrapper — reads the order from the Zustand store (localStorage-
 * persisted) and renders `ReceiptView`. Redirects to /orders if the order
 * is not found after hydration.
 */
export function ReceiptPageClient({ orderId, tenderedAmount }: Props) {
  const router = useRouter()
  const getOrderById = useOrdersStore((state) => state.getOrderById)

  // Delay read until after hydration so SSR and client agree.
  const [order, setOrder] = useState<Order | undefined>(undefined)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const found = getOrderById(orderId)
    setOrder(found)
    setHydrated(true)
  }, [orderId, getOrderById])

  useEffect(() => {
    if (hydrated && !order) {
      router.replace("/orders")
    }
  }, [hydrated, order, router])

  if (!hydrated || !order) {
    return null
  }

  return <ReceiptView order={order} tenderedAmount={tenderedAmount} />
}
