"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Coffee, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/stores"
import { AUTH_ERROR_MESSAGE } from "@/stores/useAuthStore"
import { getHomeRouteForRole } from "@/lib/routes"

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { message: "Username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const session = useAuthStore((state) => state.session)
  const hasHydrated = useAuthStore((state) => state.hasHydrated)

  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
    mode: "onSubmit",
  })

  // If the user reaches /login while already authenticated (e.g. via a
  // direct link), bounce them to their role's landing screen.
  useEffect(() => {
    if (hasHydrated && session) {
      router.replace(getHomeRouteForRole(session.role))
    }
  }, [hasHydrated, session, router])

  const onSubmit = (values: LoginFormValues) => {
    setSubmitError(null)
    const result = login(values.username, values.password)
    if (!result.ok) {
      setSubmitError(result.error)
      // Clear the password but keep the username so the cashier can retry
      // without retyping their handle.
      form.setValue("password", "")
      form.setFocus("password")
      return
    }
    router.replace(getHomeRouteForRole(result.session.role))
  }

  return (
    <Card className="border-border/70 bg-card/90 w-full max-w-md shadow-lg backdrop-blur">
      <CardHeader className="items-center text-center">
        <span className="bg-primary text-primary-foreground inline-flex size-12 items-center justify-center rounded-2xl shadow-sm">
          <Coffee className="size-6" aria-hidden="true" />
        </span>
        <CardTitle className="mt-3 text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to start serving — Admin manages the menu, Cashier takes
          orders.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="grid gap-4"
            aria-describedby={submitError ? "login-error" : undefined}
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="username"
                      autoFocus
                      placeholder="admin or cashier"
                      {...field}
                      onChange={(event) => {
                        if (submitError) setSubmitError(null)
                        field.onChange(event)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      placeholder="Your password"
                      {...field}
                      onChange={(event) => {
                        if (submitError) setSubmitError(null)
                        field.onChange(event)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError ? (
              <p
                id="login-error"
                role="alert"
                aria-live="polite"
                className="text-destructive bg-destructive/10 border-destructive/30 rounded-md border px-3 py-2 text-sm"
              >
                {submitError}
              </p>
            ) : null}

            <Button
              type="submit"
              className="mt-1 w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="text-muted-foreground flex flex-col items-start gap-1 text-xs">
        <span className="text-foreground text-sm font-medium">
          Demo accounts
        </span>
        <span>
          Admin · <code className="font-mono">admin</code> /{" "}
          <code className="font-mono">admin123</code>
        </span>
        <span>
          Cashier · <code className="font-mono">cashier</code> /{" "}
          <code className="font-mono">cashier123</code>
        </span>
        <span className="text-muted-foreground/70 mt-2">
          {AUTH_ERROR_MESSAGE.replace(".", "")} appears for any mismatch.
        </span>
      </CardFooter>
    </Card>
  )
}
