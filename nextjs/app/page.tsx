import { Coffee, CupSoda, ListOrdered, Receipt } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SessionPanel } from "@/components/auth/session-panel"

const featureHighlights = [
  {
    icon: Coffee,
    title: "Menu management",
    description:
      "Curate products, categories, and modifiers from a single dashboard.",
  },
  {
    icon: CupSoda,
    title: "Quick order entry",
    description:
      "Tap-to-add tiles with modifiers and notes — built for tablet baristas.",
  },
  {
    icon: ListOrdered,
    title: "Live order queue",
    description:
      "Track every ticket through preparing, ready, and completed states.",
  },
  {
    icon: Receipt,
    title: "Print-ready receipts",
    description:
      "Generate clean receipts customers love — and reports owners need.",
  },
]

export default function HomePage() {
  return (
    <main className="from-coffee-cream via-background to-coffee-latte/40 min-h-dvh bg-gradient-to-br">
      <section className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 md:px-12 lg:py-24">
        <header className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="bg-primary text-primary-foreground inline-flex size-11 items-center justify-center rounded-2xl shadow-sm">
              <Coffee className="size-6" />
            </span>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
                POS-Coffee
              </span>
              <span className="text-foreground text-lg font-semibold">
                A warm point of sale for small coffee shops
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:max-w-3xl">
            <Badge variant="secondary" className="w-fit">
              MVP scaffold ready
            </Badge>
            <h1 className="text-foreground text-4xl leading-tight font-semibold tracking-tight md:text-5xl">
              Brew faster service with a focused, modern POS.
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              POS-Coffee bundles staff login, menu management, order capture,
              simulated payments, receipts, and daily reporting — all in one
              clean, responsive web app crafted for tablet and desktop.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg">Get started</Button>
            <Button size="lg" variant="outline">
              View the plan
            </Button>
            <span className="text-muted-foreground text-sm">
              Next.js 16 · Tailwind v4 · shadcn/ui · Zustand
            </span>
          </div>
        </header>

        <section
          aria-label="Feature highlights"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {featureHighlights.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="border-border/70 bg-card/70">
              <CardHeader>
                <span className="bg-secondary text-secondary-foreground inline-flex size-10 items-center justify-center rounded-xl">
                  <Icon className="size-5" />
                </span>
                <CardTitle className="mt-3 text-base">{title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {description}
                </CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </section>

        <SessionPanel />

        <footer className="text-muted-foreground border-border/60 mt-8 flex flex-col gap-2 border-t pt-6 text-sm md:flex-row md:items-center md:justify-between">
          <span>
            Scaffolded by{" "}
            <span className="text-foreground font-medium">PC-1</span> · Project
            scaffold and design system setup
          </span>
          <span>
            Built with care for cozy coffee shops · {new Date().getFullYear()}
          </span>
        </footer>
      </section>
    </main>
  )
}
