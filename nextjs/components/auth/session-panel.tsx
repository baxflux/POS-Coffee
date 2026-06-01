"use client"

import { useRouter } from "next/navigation"
import { LogOut, UserRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuthStore } from "@/stores"
import { ROUTES } from "@/lib/routes"

/**
 * Small reusable card that displays the current session and a sign-out
 * button. PC-4 will fold this into the global header — for now it gives
 * every placeholder page an easy way to verify auth state and switch
 * accounts during manual testing.
 */
export function SessionPanel() {
  const router = useRouter()
  const session = useAuthStore((state) => state.session)
  const logout = useAuthStore((state) => state.logout)

  if (!session) return null

  const handleSignOut = () => {
    logout()
    router.replace(ROUTES.login)
  }

  return (
    <Card className="border-border/70 bg-card/80 max-w-md">
      <CardHeader>
        <span className="bg-secondary text-secondary-foreground inline-flex size-10 items-center justify-center rounded-xl">
          <UserRound className="size-5" aria-hidden="true" />
        </span>
        <CardTitle className="mt-3 text-base">Signed in</CardTitle>
        <CardDescription>
          You are currently authenticated with this account.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid grid-cols-[7rem_1fr] gap-y-1 text-sm">
          <dt className="text-muted-foreground">Name</dt>
          <dd className="text-foreground font-medium">{session.displayName}</dd>
          <dt className="text-muted-foreground">Username</dt>
          <dd className="text-foreground font-mono">{session.username}</dd>
          <dt className="text-muted-foreground">Role</dt>
          <dd>
            <Badge
              variant={session.role === "admin" ? "default" : "secondary"}
              className="capitalize"
            >
              {session.role}
            </Badge>
          </dd>
        </dl>

        <Button
          type="button"
          variant="outline"
          onClick={handleSignOut}
          className="self-start"
        >
          <LogOut className="mr-2 size-4" aria-hidden="true" />
          Sign out
        </Button>
      </CardContent>
    </Card>
  )
}
