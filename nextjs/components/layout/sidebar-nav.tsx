"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  ClipboardList,
  CupSoda,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  type NavItem,
  ROUTES,
  getNavItemsForRole,
  isActiveNavRoute,
} from "@/lib/routes"
import type { Role } from "@/types"

interface SidebarNavProps {
  role: Role
  /** Called whenever a nav link is activated — used by the mobile drawer to close itself. */
  onNavigate?: () => void
  /** Visual variant — vertical column on desktop, stacked panel on mobile. */
  variant?: "desktop" | "mobile"
  /** Optional id used by the header's aria-controls for the mobile panel. */
  id?: string
}

const NAV_ICONS: Record<string, LucideIcon> = {
  [ROUTES.order]: CupSoda,
  [ROUTES.orders]: ClipboardList,
  [ROUTES.menu]: LayoutGrid,
  [ROUTES.report]: BarChart3,
}

/**
 * Role-aware navigation list used by both the desktop sidebar and the
 * mobile drop-down panel. Filtering happens in `getNavItemsForRole`, so a
 * Cashier never even renders the admin-only links.
 */
export function SidebarNav({
  role,
  onNavigate,
  variant = "desktop",
  id,
}: SidebarNavProps) {
  const pathname = usePathname() ?? "/"
  const items = getNavItemsForRole(role)

  return (
    <nav
      id={id}
      data-slot="sidebar-nav"
      data-variant={variant}
      aria-label="Primary"
      className={cn(
        "flex flex-col gap-1",
        variant === "desktop" ? "p-4" : "px-4 pt-2 pb-4"
      )}
    >
      {variant === "desktop" ? (
        <span className="text-muted-foreground mb-2 px-3 text-[0.65rem] font-semibold tracking-[0.18em] uppercase">
          Workspace
        </span>
      ) : null}
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isActiveNavRoute(pathname, item.href)}
            onClick={onNavigate}
          />
        ))}
      </ul>
    </nav>
  )
}

interface NavLinkProps {
  item: NavItem
  active: boolean
  onClick?: () => void
}

function NavLink({ item, active, onClick }: NavLinkProps) {
  const Icon = NAV_ICONS[item.href] ?? ClipboardList
  return (
    <li>
      <Link
        href={item.href}
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        aria-label={`${item.label} — ${item.description}`}
        data-active={active ? "true" : "false"}
        className={cn(
          "group flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          "focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2",
          active
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-md",
            active ? "bg-primary-foreground/10" : "bg-muted/60"
          )}
        >
          <Icon className="size-4" />
        </span>
        <span className="flex flex-col leading-tight">
          <span>{item.label}</span>
          <span
            className={cn(
              "text-xs font-normal",
              active ? "text-primary-foreground/80" : "text-muted-foreground"
            )}
          >
            {item.description}
          </span>
        </span>
      </Link>
    </li>
  )
}
