"use client"

import { useCallback, useEffect, useState } from "react"

import { AppHeader } from "@/components/layout/app-header"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { useAuthStore } from "@/stores"

interface AppShellProps {
  children: React.ReactNode
}

/**
 * Authenticated app shell — header + sidebar + main content area.
 *
 * The shell:
 *   - Renders a sticky header with brand, identity, and Log out.
 *   - Shows a permanent sidebar on >=768px viewports and collapses it
 *     into a drawer panel toggled from the header below 768px.
 *   - Renders nothing privileged until the auth store has rehydrated, so
 *     a refresh on `/menu` never flashes admin links to a cashier.
 *
 * The drawer closes through three paths: tapping a nav link
 * (via the `onNavigate` callback), tapping the backdrop, or pressing
 * Escape. Each path is an explicit user action — no pathname watcher is
 * needed.
 *
 * If the auth state is hydrated but somehow empty (e.g. logout race), the
 * shell renders the children without the chrome — `RouteGuard` will be
 * mid-redirect to `/login`.
 */
export function AppShell({ children }: AppShellProps) {
  const session = useAuthStore((state) => state.session)
  const hasHydrated = useAuthStore((state) => state.hasHydrated)

  const [mobileOpen, setMobileOpen] = useState(false)

  // Lock body scroll while the mobile drawer overlay is open.
  useEffect(() => {
    if (typeof document === "undefined") return
    const originalOverflow = document.body.style.overflow
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [mobileOpen])

  // Close the drawer when the user presses Escape.
  useEffect(() => {
    if (!mobileOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [mobileOpen])

  const closeMobileNav = useCallback(() => setMobileOpen(false), [])
  const toggleMobileNav = useCallback(
    () => setMobileOpen((value) => !value),
    []
  )

  if (!hasHydrated || !session) {
    return <>{children}</>
  }

  return (
    <div className="bg-background text-foreground flex min-h-dvh flex-col">
      <AppHeader
        mobileNavOpen={mobileOpen}
        onToggleMobileNav={toggleMobileNav}
      />

      <div className="flex flex-1">
        <aside
          aria-label="Primary navigation"
          className="no-print border-border/70 bg-sidebar text-sidebar-foreground hidden w-60 shrink-0 border-r md:flex md:flex-col"
        >
          <SidebarNav role={session.role} />
        </aside>

        <main
          id="main-content"
          className="flex min-w-0 flex-1 flex-col"
        >
          {children}
        </main>
      </div>

      {/* Mobile drawer — rendered as an overlay below 768px only. */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 flex md:hidden"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={closeMobileNav}
            className="bg-foreground/40 absolute inset-0 backdrop-blur-sm"
          />
          <div
            id="app-mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Primary navigation"
            className="bg-sidebar text-sidebar-foreground border-border/70 relative z-10 mt-16 flex w-72 max-w-[85vw] flex-col border-r shadow-xl"
          >
            <SidebarNav
              role={session.role}
              variant="mobile"
              onNavigate={closeMobileNav}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
