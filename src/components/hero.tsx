import { ArrowRight, Check } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const HIGHLIGHTS = ["Local-first", "Works offline", "MIT licensed"]

export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="grid items-center gap-14 pb-16 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:pb-24 lg:pt-20">
      <div>
        <div
          className="animate-rise flex flex-wrap items-center gap-2.5"
          style={{ animationDelay: "0ms" }}
        >
          <Badge variant="outline" className="bg-card/70">
            Open source · MIT
          </Badge>
          <span className="text-xs text-muted-foreground">No account. No cloud. No catch.</span>
        </div>

        <h1
          className="animate-rise mt-5 max-w-2xl font-display text-[3.15rem] leading-[0.98] tracking-[-0.015em] sm:text-6xl lg:text-[4.35rem]"
          style={{ animationDelay: "60ms" }}
        >
          Plans, scribbles &amp;{" "}
          <span className="relative inline-block italic">
            ideas
            <svg
              className="absolute -bottom-1.5 left-0 w-full text-gold"
              viewBox="0 0 200 12"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 8c40-6 80-6 120-2s50 4 76 0"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>{" "}
          on one canvas.
        </h1>

        <p
          className="animate-rise mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          style={{ animationDelay: "120ms" }}
        >
          Kanvas is a free, open-source space to map a plan, jot rough notes, and think out loud.
          Everything is saved in your browser — no sign-up, no server, no lock-in.
        </p>

        <div
          className="animate-rise mt-8 flex flex-col gap-3 sm:flex-row"
          style={{ animationDelay: "180ms" }}
        >
          <Button size="lg" onClick={onStart}>
            Start a board
            <ArrowRight />
          </Button>
          <Button variant="outline" size="lg" onClick={scrollToTemplates}>
            Browse templates
          </Button>
        </div>

        <ul
          className="animate-rise mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground"
          style={{ animationDelay: "240ms" }}
        >
          {HIGHLIGHTS.map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <HeroCanvas />
    </section>
  )
}

function scrollToTemplates() {
  document.getElementById("templates")?.scrollIntoView({ behavior: "smooth", block: "start" })
}

function HeroCanvas() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-md select-none">
      <div className="absolute -inset-8 -z-10 rounded-full bg-[radial-gradient(closest-side,var(--color-accent),transparent)] opacity-70 blur-2xl" />

      <div className="relative aspect-[5/4] rotate-[1.5deg] overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_30px_80px_-45px_rgba(0,0,0,0.5)]">
        <div className="dot-grid absolute inset-0" />

        <svg
          className="absolute inset-0 h-full w-full text-foreground/20"
          viewBox="0 0 400 320"
          fill="none"
        >
          <path
            d="M120 98c54 10 76 26 116 52s62 42 84 58"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="5 6"
            strokeLinecap="round"
          />
          <path
            d="M320 208l-10-3m10 3l-4 9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute left-7 top-8 w-32 -rotate-[4deg] rounded-md bg-amber-200 p-3 text-amber-950 shadow-[0_12px_22px_-14px_rgba(0,0,0,0.6)]">
          <p className="font-display text-xl leading-tight">Ship v0.1</p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] opacity-60">
            by friday
          </p>
        </div>

        <div className="absolute right-7 top-16 w-28 rotate-[3deg] rounded-md bg-sky-200 p-3 text-sky-950 shadow-[0_12px_22px_-14px_rgba(0,0,0,0.6)]">
          <p className="text-xs font-medium leading-snug">Ask 5 users what&apos;s missing</p>
          <div className="mt-2 flex gap-1">
            <span className="size-1.5 rounded-full bg-sky-900/30" />
            <span className="size-1.5 rounded-full bg-sky-900/30" />
            <span className="size-1.5 rounded-full bg-sky-900/30" />
          </div>
        </div>

        <div className="absolute bottom-14 left-11 w-40 -rotate-2 rounded-md bg-emerald-200 p-3 text-emerald-950 shadow-[0_12px_22px_-14px_rgba(0,0,0,0.6)]">
          <p className="text-xs font-medium">Ideas → plan → done</p>
          <ul className="mt-2 space-y-1 text-[10px] font-medium">
            {["Sketch the flow", "Name the tasks", "Ship it"].map((item, index) => (
              <li key={item} className="flex items-center gap-1.5">
                <span
                  className={
                    index === 2
                      ? "flex size-3 items-center justify-center rounded-full border border-emerald-900/30"
                      : "flex size-3 items-center justify-center rounded-full bg-emerald-900/70 text-emerald-50"
                  }
                >
                  {index < 2 ? <Check className="size-2" strokeWidth={3} /> : null}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="absolute bottom-4 right-5 rounded-full border border-border bg-background/85 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          all local
        </div>
      </div>

      <div className="absolute -bottom-5 -right-2 rotate-3 rounded-xl border border-border bg-card px-3.5 py-2 text-xs shadow-md sm:-right-4">
        <span className="font-medium">No account.</span>{" "}
        <span className="text-muted-foreground">Just ideas.</span>
      </div>
    </div>
  )
}
