import type { Metadata } from "next"

import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the POS-Coffee point-of-sale workspace.",
}

export default function LoginPage() {
  return (
    <main className="from-coffee-cream via-background to-coffee-latte/40 flex min-h-dvh items-center justify-center bg-gradient-to-br px-4 py-12">
      <LoginForm />
    </main>
  )
}
