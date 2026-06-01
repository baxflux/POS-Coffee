/**
 * Centralised route catalogue + access rules for POS-Coffee.
 *
 * Keep every URL constant and every role-based access decision here so
 * later tasks (PC-5 menu, PC-9 order management, etc.) can reuse them
 * without sprinkling string literals through the app.
 */

import type { Role } from "@/types"

export const ROUTES = {
  login: "/login",
  /**
   * Shared landing screen after sign-in. Both Admin and Cashier can take
   * orders, so `/order` is the most useful home for either role.
   */
  home: "/order",
  order: "/order",
  orders: "/orders",
  menu: "/menu",
  report: "/report",
  receipt: "/receipt",
  notAuthorized: "/not-authorized",
} as const

/**
 * Routes that DO NOT require an authenticated session. Everything else is
 * treated as protected by `RouteGuard` and redirects to `/login`.
 */
export const PUBLIC_ROUTES: readonly string[] = [
  ROUTES.login,
  ROUTES.notAuthorized,
]

/**
 * Routes restricted to the `admin` role. Cashier sessions hitting any of
 * these paths are sent to the Not authorized screen.
 */
export const ADMIN_ONLY_ROUTES: readonly string[] = [
  ROUTES.menu,
  ROUTES.report,
]

/**
 * Navigation item shown in the app shell sidebar and header. Order in the
 * array reflects the order shown to the user.
 */
export interface NavItem {
  label: string
  href: string
  /** Roles allowed to see and use this nav entry. */
  roles: readonly Role[]
  /** Short helper text shown in tooltips / aria-descriptions. */
  description: string
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    label: "Order",
    href: ROUTES.order,
    roles: ["admin", "cashier"],
    description: "Take a new order",
  },
  {
    label: "Orders",
    href: ROUTES.orders,
    roles: ["admin", "cashier"],
    description: "Manage today's orders",
  },
  {
    label: "Menu",
    href: ROUTES.menu,
    roles: ["admin"],
    description: "Manage products, categories, and modifiers",
  },
  {
    label: "Report",
    href: ROUTES.report,
    roles: ["admin"],
    description: "View today's sales report",
  },
]

/**
 * Resolve the landing route for a given role immediately after login or
 * whenever a logged-in user lands on the login page. Both roles share the
 * `/order` home so the shell always opens on a useful screen.
 */
export function getHomeRouteForRole(_role: Role): string {
  // The role argument is kept so callers can still express intent and so
  // future requirements that diverge the home screens stay cheap to add.
  void _role
  return ROUTES.home
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

/**
 * Filter the nav items down to those the given role can use.
 */
export function getNavItemsForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role))
}

/**
 * True when `pathname` is the active match for `href`. Treats `/order` as
 * matching `/order/anything` so nested screens highlight the parent.
 */
export function isActiveNavRoute(pathname: string, href: string): boolean {
  if (pathname === href) return true
  return pathname.startsWith(`${href}/`)
}
