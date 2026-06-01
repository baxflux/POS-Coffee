"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { useAuthStore } from "@/stores"
import {
  getHomeRouteForRole,
  isAdminOnlyRoute,
  isPublicRoute,
  ROUTES,
} from "@/lib/routes"

interface RouteGuardProps {
  children: React.ReactNode
}

/**
 * Client-side route guard for POS-Coffee's localStorage-only auth.
 *
 * Because the session lives in the browser, the server cannot make the
 * redirect decision in `proxy.ts`. Instead, this guard runs in the root
 * layout on every navigation and:
 *
 *  1. Waits for the Zustand persist middleware to rehydrate so the first
 *     render does not flash login.
 *  2. Redirects unauthenticated visits to `/login`.
 *  3. Sends already-logged-in users away from `/login` to their role's
 *     landing page.
 *  4. Blocks cashier sessions from admin-only routes (e.g. /menu, /report).
 */
export function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter()
  const pathname = usePathname() ?? "/"

  const session = useAuthStore((state) => state.session)
  const hasHydrated = useAuthStore((state) => state.hasHydrated)

  const onPublicRoute = isPublicRoute(pathname)

  useEffect(() => {
    if (!hasHydrated) return

    // Visitor without a session trying to reach a protected page → /login.
    if (!session && !onPublicRoute) {
      router.replace(ROUTES.login)
      return
    }

    // Logged-in user hitting /login → route to their home screen.
    if (session && onPublicRoute) {
      router.replace(getHomeRouteForRole(session.role))
      return
    }

    // Cashier trying to reach an admin-only route → bounce home.
    if (session && session.role !== "admin" && isAdminOnlyRoute(pathname)) {
      router.replace(getHomeRouteForRole(session.role))
    }
  }, [hasHydrated, session, onPublicRoute, pathname, router])

  // While Zustand is rehydrating from localStorage, render a neutral
  // splash so guarded pages never flash before the redirect fires.
  if (!hasHydrated) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="bg-background text-muted-foreground flex min-h-dvh items-center justify-center"
      >
        <Loader2 className="size-6 animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading session…</span>
      </div>
    )
  }

  const sessionBlocked = !session && !onPublicRoute
  const cashierBlocked =
    session !== null &&
    session.role !== "admin" &&
    isAdminOnlyRoute(pathname)
  const loggedInOnLogin = session !== null && onPublicRoute

  if (sessionBlocked || cashierBlocked || loggedInOnLogin) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="bg-background text-muted-foreground flex min-h-dvh items-center justify-center"
      >
        <Loader2 className="size-6 animate-spin" aria-hidden="true" />
        <span className="sr-only">Redirecting…</span>
      </div>
    )
  }

  return <>{children}</>
}
