import type { Metadata } from "next"
import Link from "next/link"
import { Coffee, Compass } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/routes"

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you're looking for doesn't exist.",
}

export default function NotFound() {
  return (
    <main className="from-coffee-cream via-background to-coffee-latte/40 flex min-h-dvh items-center justify-center bg-gradient-to-br px-4 py-12">
      <Card className="border-border/70 bg-card/90 w-full max-w-md shadow-lg backdrop-blur">
        <CardHeader className="items-center text-center">
          <span
            aria-hidden="true"
            className="bg-primary text-primary-foreground inline-flex size-12 items-center justify-center rounded-2xl shadow-sm"
          >
            <Coffee className="size-6" />
          </span>
          <CardTitle className="mt-3 text-2xl">404 — page not found</CardTitle>
          <CardDescription>
            That order ticket doesn&rsquo;t exist in our queue.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground text-center text-sm">
            The link you followed may be broken or the page may have been
            moved. Head back to the home screen and try again.
          </p>

          <Link
            href={ROUTES.home}
            className={cn(
              buttonVariants({ variant: "default" }),
              "min-h-11 w-full gap-2"
            )}
          >
            <Compass className="size-4" aria-hidden="true" />
            Go back home
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}
