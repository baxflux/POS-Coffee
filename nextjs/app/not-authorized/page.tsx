import type { Metadata } from "next"

import { NotAuthorizedPanel } from "@/components/layout/not-authorized-panel"

export const metadata: Metadata = {
  title: "Not authorized",
  description:
    "Your current role does not have access to the requested screen.",
}

export default function NotAuthorizedPage() {
  return (
    <main className="from-coffee-cream via-background to-coffee-latte/40 flex min-h-dvh items-center justify-center bg-gradient-to-br px-4 py-12">
      <NotAuthorizedPanel />
    </main>
  )
}
