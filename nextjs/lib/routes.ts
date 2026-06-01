/**
 * Centralised route catalogue + access rules for POS-Coffee.
 *
 * Keep every URL constant and every role-based access decision here so
 * later tasks (PC-4 navigation, PC-5 menu, etc.) can reuse them without
 * sprinkling string literals through the app.
 */

import type { Role } from "@/types"

export const ROUTES = {
  login: "/login",
  // Admin landing screen — for now this is the marketing/home page; PC-4
  // will replace it with the admin dashboard. Using a constant keeps the
  // route guard stable across that refactor.
  adminHome: "/",
  cashierHome: "/order",
  menu: "/menu",
  orders: "/orders",
  report: "/report",
  receipt: "/receipt",
} as const

/**
 * Routes that DO NOT require an authenticated session. Everything else is
 * treated as protected by `RouteGuard` and redirects to `/login`.
 */
export const PUBLIC_ROUTES: readonly string[] = [ROUTES.login]

/**
 * Routes restricted to the `admin` role. Cashier sessions hitting any of
 * these paths are bounced to their landing screen.
 */
export const ADMIN_ONLY_ROUTES: readonly string[] = [
  ROUTES.menu,
  ROUTES.report,
]

/**
 * Resolve the landing route for a given role immediately after login or
 * whenever a logged-in user lands on the login page.
 */
export function getHomeRouteForRole(role: Role): string {
  return role === "admin" ? ROUTES.adminHome : ROUTES.cashierHome
}

/**
 * True if the given pathname does not require a session.
 *
 * A request matches a public route when it equals the route exactly or
 * starts with `route + "/"` so nested segments (e.g. `/login/forgot`) stay
 * accessible without auth.
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

/**
 * True if the given pathname is restricted to admins.
 */
export function isAdminOnlyRoute(pathname: string): boolean {
  return ADMIN_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}
