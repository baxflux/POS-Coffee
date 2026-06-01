"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShieldAlert, LogOut } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores"
import { ROUTES } from "@/lib/routes"

/**
 * Client component for the Not authorized screen.
 *
 * Shown when a cashier tries to reach an admin-only route directly
 * (typed URL, bookmark, deep link, etc.). Provides a clear explanation,
 * a path back to the role's home screen, and a Log out fallback in case
 * the user wants to switch to an admin account.
 */
export function NotAuthorizedPanel() {
  const router = useRouter()
  const session = useAuthStore((state) => state.session)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    router.replace(ROUTES.login)
  }

  const linkClass = cn(
    buttonVariants({ variant: "default" }),
    "min-h-11 w-full sm:w-auto"
  )

  const outlineLinkClass = cn(
    buttonVariants({ variant: "outline" }),
    "min-h-11 w-full sm:w-auto"
  )

  return (
    <Card className="border-border/70 bg-card/90 w-full max-w-md shadow-lg backdrop-blur">
      <CardHeader className="items-center text-center">
        <span
          aria-hidden="true"
          className="bg-destructive/10 text-destructive inline-flex size-12 items-center justify-center rounded-2xl shadow-sm"
        >
          <ShieldAlert className="size-6" />
        </span>
        <CardTitle className="mt-3 text-2xl">Not authorized</CardTitle>
        <CardDescription>
          Your role doesn&rsquo;t have access to this screen.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 text-sm">
        {session ? (
          <dl className="grid grid-cols-[7rem_1fr] gap-y-1">
            <dt className="text-muted-foreground">Signed in as</dt>
            <dd className="text-foreground font-medium">
              {session.displayName}
            </dd>
            <dt className="text-muted-foreground">Role</dt>
            <dd>
              <Badge variant="secondary" className="capitalize">
                {session.role}
              </Badge>
            </dd>
          </dl>
        ) : (
          <p className="text-muted-foreground">
            Sign in with an admin account to view this screen.
          </p>
        )}

        <p className="text-muted-foreground">
          If you believe this is a mistake, ask an admin to grant the right
          role or log out and switch accounts.
        </p>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <Link href={ROUTES.home} className={linkClass}>
          Go back home
        </Link>
        {session ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            className="min-h-11 w-full gap-2 sm:w-auto"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Log out
          </Button>
        ) : (
          <Link href={ROUTES.login} className={outlineLinkClass}>
            Go to login
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}
