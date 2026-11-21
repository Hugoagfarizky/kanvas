import { ArrowRight, Check } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const HIGHLIGHTS = ["Local-first", "Works offline", "MIT licensed"]

export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="grid items-center gap-14 pb-16 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:pb-24 lg:pt-20">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="outline" className="bg-card/70">
            Open source · MIT
          </Badge>
          <span className="text-xs text-muted-foreground">No account. No cloud. No catch.</span>
        </div>

        <h1 className="mt-5 max-w-2xl font-display text-[3.15rem] leading-[0.98] tracking-[-0.015em] sm:text-6xl lg:text-[4.35rem]">
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

        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Kanvas is a free, open-source space to map a plan, jot rough notes, and think out loud.
          Everything is saved in your browser — no sign-up, no server, no lock-in.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={onStart} className="rounded-full shadow-md hover:scale-105 active:scale-95 transition-all">
            Start a board
            <ArrowRight />
          </Button>
          <Button variant="outline" size="lg" onClick={scrollToTemplates} className="rounded-full shadow-xs hover:bg-accent transition-all">
            Browse templates
          </Button>
        </div>

        <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
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

        {/* Lilac Tilted Card (Matching Ref 3 Pharmacology Card) */}
        <div className="absolute left-6 top-8 w-44 -rotate-3 rounded-3xl border border-purple-300/80 bg-purple-100/95 p-3.5 text-purple-950 shadow-xl backdrop-blur-xs dark:border-purple-600/40 dark:bg-purple-950/60 dark:text-purple-100">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-200/80 px-2 py-0.5 text-[9px] font-semibold text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
              Watching 00:30
            </span>
            <div className="flex size-5 items-center justify-center rounded-full bg-purple-900 text-purple-100 dark:bg-purple-200 dark:text-purple-900">
              <span className="text-[9px] leading-none">▶</span>
            </div>
          </div>
          <p className="mt-2 text-xs font-semibold leading-snug">Pharmacology Basics</p>
          <p className="mt-0.5 text-[10px] text-purple-900/70 dark:text-purple-300/70">
            Interactive visual notes
          </p>
        </div>

        {/* Butter Card (Matching Ref 3 Task Card) */}
        <div className="absolute right-6 top-14 w-38 rotate-2 rounded-3xl border border-amber-300/80 bg-amber-100/95 p-3.5 text-amber-950 shadow-xl backdrop-blur-xs dark:border-amber-600/40 dark:bg-amber-950/60 dark:text-amber-100">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-200/80 px-2 py-0.5 text-[9px] font-semibold text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
              Task
            </span>
            <span className="text-[10px] text-amber-800/60 dark:text-amber-300/60">Th, 27.03</span>
          </div>
          <p className="mt-2 text-xs font-semibold">Learning sprint plan</p>
          <div className="mt-2 flex items-center gap-1">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-medium text-emerald-800 dark:text-emerald-400">2/3 completed</span>
          </div>
        </div>

        {/* Mint Card (Matching Ref 3 Medical Terminology Card) */}
        <div className="absolute bottom-10 left-12 w-48 -rotate-1 rounded-3xl border border-emerald-300/80 bg-emerald-100/95 p-3.5 text-emerald-950 shadow-xl backdrop-blur-xs dark:border-emerald-600/40 dark:bg-emerald-950/60 dark:text-emerald-100">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-200/80 px-2 py-0.5 text-[9px] font-semibold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
              Completed
            </span>
          </div>
          <p className="mt-2 text-xs font-semibold">Medical Terminology</p>
          <p className="mt-0.5 text-[10px] text-emerald-900/70 dark:text-emerald-300/70">
            Effective healthcare communication
          </p>
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
