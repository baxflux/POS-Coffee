import { redirect } from "next/navigation"

import { ROUTES } from "@/lib/routes"

/**
 * Root route — the authenticated app shell lives under `/order`. Hitting
 * `/` simply forwards there. `RouteGuard` will catch unauthenticated
 * visits before this redirect runs in the browser, but we still issue
 * the server-side redirect so unauthenticated curls land on `/login`
 * after a single hop.
 */
export default function RootPage() {
  redirect(ROUTES.home)
}
