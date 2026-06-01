"use client"

import { useRouter } from "next/navigation"
import { Coffee, LogOut, Menu as MenuIcon, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores"
import { ROUTES } from "@/lib/routes"

interface AppHeaderProps {
  /** True when the mobile sidebar drawer is currently open. */
  mobileNavOpen: boolean
  /** Toggle handler for the mobile sidebar drawer. */
  onToggleMobileNav: () => void
}

/**
 * Top bar of the authenticated app shell.
 *
 * Renders the shop brand, current user identity + role, a Log out action,
 * and a mobile-only nav toggle. The "Log out" control and the mobile
 * toggle both meet the 44x44px tap target requirement called out in the
 * PC-4 acceptance criteria.
 */
export function AppHeader({ mobileNavOpen, onToggleMobileNav }: AppHeaderProps) {
  const router = useRouter()
  const session = useAuthStore((state) => state.session)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    router.replace(ROUTES.login)
  }

  return (
    <header
      data-slot="app-header"
      className="no-print border-border/70 bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 backdrop-blur md:px-6"
    >
      <Button
        type="button"
        variant="ghost"
        onClick={onToggleMobileNav}
        aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileNavOpen}
        aria-controls="app-mobile-nav"
        className="size-11 min-h-11 min-w-11 shrink-0 p-0 md:hidden"
      >
        {mobileNavOpen ? (
          <X className="size-5" aria-hidden="true" />
        ) : (
          <MenuIcon className="size-5" aria-hidden="true" />
        )}
      </Button>

      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="bg-primary text-primary-foreground inline-flex size-9 items-center justify-center rounded-xl shadow-sm"
        >
          <Coffee className="size-5" />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-muted-foreground text-[0.65rem] font-semibold tracking-[0.18em] uppercase">
            POS Coffee
          </span>
          <span className="text-foreground text-sm font-semibold">
            Point of sale
          </span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {session ? (
          <>
            <div className="hidden flex-col items-end leading-tight sm:flex">
              <span
                data-testid="header-user-name"
                className="text-foreground text-sm font-semibold"
              >
                {session.displayName}
              </span>
              <span className="text-muted-foreground text-xs">
                @{session.username}
              </span>
            </div>
            <Badge
              data-testid="header-role-badge"
              variant={session.role === "admin" ? "default" : "secondary"}
              className="hidden capitalize sm:inline-flex"
            >
              {session.role}
            </Badge>
            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              data-testid="header-logout"
              className="min-h-11 min-w-11 gap-2 px-3 sm:px-4"
            >
              <LogOut className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Log out</span>
              <span className="sr-only sm:hidden">Log out</span>
            </Button>
          </>
        ) : null}
      </div>
    </header>
  )
}
