import { Suspense } from "react"

import { ReceiptPageClient } from "@/components/receipt/receipt-page-client"

interface Props {
  params: Promise<{ orderId: string }>
  searchParams: Promise<{ tendered?: string }>
}

/**
 * Receipt page — `/receipt/[orderId]`
 *
 * Server component that unwraps params/searchParams and delegates to the
 * client component that reads from the orders store.
 */
export default async function ReceiptPage({ params, searchParams }: Props) {
  const { orderId } = await params
  const { tendered } = await searchParams

  const tenderedAmount = tendered ? parseFloat(tendered) : undefined

  return (
    <Suspense fallback={null}>
      <ReceiptPageClient
        orderId={orderId}
        tenderedAmount={tenderedAmount}
      />
    </Suspense>
  )
}
