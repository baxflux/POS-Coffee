import { AppShell } from "@/components/layout/app-shell"

/**
 * Layout for the authenticated app shell route group.
 *
 * Every page under `app/(shell)/` is wrapped in the persistent header +
 * sidebar chrome. The route group's parentheses keep the URL flat
 * (`/order`, `/orders`, `/menu`, `/report`) while letting the layout opt
 * in to shell rendering without affecting the public `/login` page.
 */
export default function ShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
