import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { RouteGuard } from "@/components/auth/route-guard"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "POS-Coffee",
    template: "%s | POS-Coffee",
  },
  description: "A warm, modern point-of-sale system for small coffee shops.",
  applicationName: "POS-Coffee",
  authors: [{ name: "POS-Coffee Team" }],
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f1e8" },
    { media: "(prefers-color-scheme: dark)", color: "#2a1f17" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground min-h-full font-sans">
        <RouteGuard>{children}</RouteGuard>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  )
}
