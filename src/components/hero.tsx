import {
  Activity,
  ArrowRight,
  Check,
  Compass,
  GraduationCap,
  Play,
  Search,
} from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { TemplateId } from "@/types/board"

const HIGHLIGHTS = ["Local-first", "Works offline", "MIT licensed", "Zero cloud lock-in"]

export function Hero({
  onStart,
  onCreateTemplate,
}: {
  onStart: () => void
  onCreateTemplate?: (templateId: TemplateId) => void
}) {
  const [activeTab, setActiveTab] = useState<"dei" | "cardiology" | "uxflow">("dei")

  return (
    <section className="flex flex-col items-center pb-16 pt-8 text-center sm:pt-14">
      {/* Top Tag Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <Badge
          variant="outline"
          className="border-primary/30 bg-primary/10 px-3 py-1 font-semibold text-xs text-primary shadow-xs"
        >
          Dei &amp; Clinical Bento Architecture
        </Badge>
        <span className="text-xs text-muted-foreground">Local-first · Offline · Open source</span>
      </div>

      {/* Main Headline */}
      <h1 className="mt-6 max-w-4xl font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.25rem]">
        Visual thinking on a{" "}
        <span className="relative inline-block italic text-primary">
          living canvas.
          <svg
            className="absolute -bottom-2 left-0 w-full text-gold"
            viewBox="0 0 200 12"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 8c40-6 80-6 120-2s50 4 76 0"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </h1>

      {/* Subtitle */}
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        Inspired by Dei learning roadmaps, clinical patient dynamics, and UX architecture. Map
        sprints, explore ideas, and connect workflows with zero cloud latency.
      </p>

      {/* Primary Action Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          size="lg"
          onClick={onStart}
          className="rounded-full px-6 shadow-md transition-all hover:scale-105 active:scale-95"
        >
          Start a blank board
          <ArrowRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            if (onCreateTemplate) onCreateTemplate(activeTab)
            else onStart()
          }}
          className="rounded-full border-border/80 px-6 shadow-xs backdrop-blur-xs transition-all hover:bg-accent"
        >
          Launch {activeTab === "dei" ? "Dei Plan" : activeTab === "cardiology" ? "Cardiology" : "UX Flow"}
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={scrollToTemplates}
          className="rounded-full text-muted-foreground hover:text-foreground"
        >
          Browse all templates
        </Button>
      </div>

      {/* Feature Checkpoints */}
      <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        {HIGHLIGHTS.map((item) => (
          <li key={item} className="flex items-center gap-1.5 font-medium">
            <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            {item}
          </li>
        ))}
      </ul>

      {/* Grand Bento Tablet Showcase matching Reference 1, 2, and 3 */}
      <div className="mt-12 w-full max-w-5xl text-left select-none">
        <div className="overflow-hidden rounded-[2.5rem] border border-border/90 bg-[#12151d] p-3 sm:p-5 shadow-2xl ring-1 ring-black/10 dark:ring-white/10">
          {/* Tablet Frame Top Navigation & Reference Switcher */}
          <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 px-2 pt-1">
            {/* Window Dots & Tab Switcher */}
            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-1.5 sm:flex">
                <span className="size-3 rounded-full bg-rose-500/80" />
                <span className="size-3 rounded-full bg-amber-500/80" />
                <span className="size-3 rounded-full bg-emerald-500/80" />
              </div>

              {/* Reference Tabs */}
              <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setActiveTab("dei")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition",
                    activeTab === "dei"
                      ? "bg-white/20 text-white shadow-xs"
                      : "text-white/60 hover:text-white hover:bg-white/10",
                  )}
                >
                  <GraduationCap className="size-3.5 text-emerald-400" />
                  Dei Learning Plan
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("cardiology")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition",
                    activeTab === "cardiology"
                      ? "bg-white/20 text-white shadow-xs"
                      : "text-white/60 hover:text-white hover:bg-white/10",
                  )}
                >
                  <Activity className="size-3.5 text-rose-400" />
                  Cardiology Dynamics
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("uxflow")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition",
                    activeTab === "uxflow"
                      ? "bg-white/20 text-white shadow-xs"
                      : "text-white/60 hover:text-white hover:bg-white/10",
                  )}
                >
                  <Compass className="size-3.5 text-sky-400" />
                  UX Flow Architecture
                </button>
              </div>
            </div>

            {/* Quick Launch CTA Button */}
            <Button
              size="sm"
              onClick={() => {
                if (onCreateTemplate) onCreateTemplate(activeTab)
                else onStart()
              }}
              className="rounded-full bg-white text-slate-900 shadow-md transition hover:bg-white/90 hover:scale-105 active:scale-95"
            >
              Open Interactive Board
              <ArrowRight className="size-3.5" />
            </Button>
          </div>

          {/* Tablet Screen Content Area */}
          <div className="relative mt-3 min-h-[460px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#f8fafc] text-slate-900 dark:bg-[#0f1118] dark:text-slate-100">
            {activeTab === "dei" && <DeiShowcaseView />}
            {activeTab === "cardiology" && <CardiologyShowcaseView />}
            {activeTab === "uxflow" && <UXFlowShowcaseView />}
          </div>
        </div>
      </div>
    </section>
  )
}

function scrollToTemplates() {
  document.getElementById("templates")?.scrollIntoView({ behavior: "smooth", block: "start" })
}

/* =========================================================================
   1. DEI LEARNING PLAN SHOWCASE VIEW (Matching Reference 3)
   ========================================================================= */
function DeiShowcaseView() {
  return (
    <div className="p-4 sm:p-6 text-xs select-none">
      {/* Top Header matching Ref 3 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
        <h3 className="font-sans text-xl font-black tracking-tight text-foreground">
          My Learning Plan
        </h3>

        {/* Center: Search & 3 Bento Stat Badges (26 Total, 2 Completed, 23 Upcoming) */}
        <div className="flex items-center gap-2 rounded-full border border-border/80 bg-card/90 p-1.5 shadow-sm">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 size-3.5 text-muted-foreground" />
            <input
              readOnly
              placeholder="Search..."
              className="h-8 w-28 sm:w-36 rounded-full bg-secondary/50 pl-8 pr-3 text-xs outline-none"
            />
          </div>
          <div className="flex min-w-12 flex-col items-center justify-center rounded-2xl border border-border/60 bg-secondary/40 px-2 py-0.5">
            <span className="font-bold text-sm">26</span>
            <span className="text-[9px] text-muted-foreground">Total</span>
          </div>
          <div className="flex min-w-14 flex-col items-center justify-center rounded-2xl border border-emerald-300 bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-100 px-2.5 py-0.5 shadow-2xs">
            <span className="font-bold text-sm text-emerald-950 dark:text-emerald-100">2</span>
            <span className="text-[9px] font-semibold text-emerald-800 dark:text-emerald-300">
              Completed
            </span>
          </div>
          <div className="flex min-w-12 flex-col items-center justify-center rounded-2xl border border-border/60 bg-secondary/40 px-2 py-0.5">
            <span className="font-bold text-sm">23</span>
            <span className="text-[9px] text-muted-foreground">Upcoming</span>
          </div>
        </div>

        <h3 className="font-sans text-xl font-black tracking-tight text-foreground">My Events</h3>
      </div>

      {/* 3-Column Bento Layout */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Column: Roadmap & Tilted Lilac Pharmacology Card (5 cols) */}
        <div className="md:col-span-4 space-y-4">
          {/* Medical Terminology Bento Card */}
          <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-foreground">Medical Terminology</span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                Completed
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Learn basic medical language for effective communication.
            </p>
          </div>

          {/* Tilted Lilac Card: Pharmacology Basics */}
          <div className="-rotate-2 rounded-3xl border border-purple-300 bg-[#f3e8ff] p-4 text-[#581c87] shadow-xl dark:border-purple-600/40 dark:bg-purple-950/70 dark:text-purple-100 transition hover:rotate-0 duration-200">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-purple-200/90 px-2.5 py-0.5 text-[10px] font-bold text-purple-900 dark:bg-purple-900 dark:text-purple-200">
                Watching 00:30
              </span>
              <div className="flex size-7 items-center justify-center rounded-full bg-purple-900 text-white shadow-xs">
                <Play className="size-3 fill-current ml-0.5" />
              </div>
            </div>
            <h4 className="mt-2.5 font-bold text-sm leading-tight">Pharmacology Basics</h4>
            <p className="mt-1 text-[11px] opacity-80">
              Interactive audio course on clinical mechanisms.
            </p>
            <div className="mt-3 flex items-center gap-1.5">
              <div className="flex -space-x-1.5">
                {["ET", "AS", "MR"].map((initials) => (
                  <div
                    key={initials}
                    className="flex size-5 items-center justify-center rounded-full bg-purple-300 font-bold text-[9px] text-purple-900 ring-1 ring-white"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-medium opacity-75">3 students listening</span>
            </div>
          </div>
        </div>

        {/* Center Column: Anatomy & Physiology + Ethics (4 cols) */}
        <div className="md:col-span-4 space-y-4">
          <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-foreground">Anatomy and Physiology</span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                Completed
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Understand the structure and function of the human body.
            </p>
          </div>

          <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-foreground">
                Medical Ethics &amp; Professionalism
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Upcoming
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Understand ethical principles and professionalism in healthcare.
            </p>
          </div>
        </div>

        {/* Right Column: Scheduled Events Stack (4 cols) */}
        <div className="md:col-span-4 space-y-2.5">
          {/* Cyan Webinar Card */}
          <div className="rounded-2xl border border-sky-300 bg-[#e0f2fe] p-3 text-[#0369a1] shadow-xs dark:border-sky-700/50 dark:bg-sky-950/60 dark:text-sky-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">Webinar</span>
              <span className="text-[10px] font-semibold opacity-75">Tu, 25.03</span>
            </div>
            <p className="mt-1 text-[11px] leading-tight opacity-90">
              Clinical Research &amp; Evidence Guidelines
            </p>
            <span className="mt-2 inline-block rounded-full bg-sky-200/80 px-2 py-0.5 text-[9px] font-semibold text-sky-900">
              Start at 12:30
            </span>
          </div>

          {/* Lilac Lesson Card */}
          <div className="rounded-2xl border border-purple-300 bg-[#f3e8ff] p-3 text-[#581c87] shadow-xs dark:border-purple-700/50 dark:bg-purple-950/60 dark:text-purple-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">Lesson</span>
              <span className="text-[10px] font-semibold opacity-75">We, 26.03</span>
            </div>
            <p className="mt-1 text-[11px] leading-tight opacity-90">
              Overview of healthcare delivery systems &amp; policy.
            </p>
          </div>

          {/* Butter Task Card */}
          <div className="rounded-2xl border border-amber-300 bg-[#fef3c7] p-3 text-[#78350f] shadow-xs dark:border-amber-700/50 dark:bg-amber-950/60 dark:text-amber-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">Task</span>
              <span className="text-[10px] font-semibold opacity-75">Th, 27.03</span>
            </div>
            <p className="mt-1 text-[11px] leading-tight opacity-90">
              Global health issues &amp; disease disparities review.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Bottom Dock Preview */}
      <div className="mt-6 flex justify-center">
        <div className="flex items-center gap-1.5 rounded-full border border-black/10 bg-[#161821] p-1.5 shadow-xl">
          <div className="flex size-7 items-center justify-center rounded-full bg-white/20 font-bold text-xs text-white">
            T
          </div>
          <div className="flex size-7 items-center justify-center rounded-full bg-[#f472b6] font-bold text-xs text-[#831843]">
            M
          </div>
          <div className="flex size-7 items-center justify-center rounded-full bg-[#fcd34d] font-bold text-xs text-[#78350f]">
            E
          </div>
          <div className="flex size-7 items-center justify-center rounded-full bg-[#e879f9] font-bold text-xs text-[#701a75]">
            C
          </div>
          <div className="flex size-7 items-center justify-center rounded-full bg-[#6ee7b7] font-bold text-xs text-[#064e3b]">
            S
          </div>
          <div className="flex size-7 items-center justify-center rounded-full bg-white/25 font-bold text-sm text-white">
            +
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   2. CARDIOLOGY DYNAMICS SHOWCASE VIEW (Matching Reference 1)
   ========================================================================= */
function CardiologyShowcaseView() {
  return (
    <div className="p-4 sm:p-6 text-xs select-none">
      {/* Top Clinical Navigation Bar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-3">
        <h3 className="font-sans text-xl font-black tracking-tight text-foreground">
          Cardiology Dynamics
        </h3>
        <div className="flex flex-wrap items-center gap-1 rounded-full border border-border/80 bg-card p-1 shadow-xs">
          {["Treatment Dynamics", "Visits", "Medications", "Labs", "Allergies"].map(
            (tab, idx) => (
              <span
                key={tab}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition",
                  idx === 0
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-muted-foreground",
                )}
              >
                {tab}
              </span>
            ),
          )}
        </div>
      </div>

      {/* Patient Vitals Banner matching Reference 1 */}
      <div className="mt-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 rounded-3xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-linear-to-tr from-rose-500 to-amber-500 font-bold text-base text-white shadow-xs">
            TW
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-foreground">Tiffany Woodward</h4>
              <span className="rounded-full bg-secondary px-2 py-0.2 text-[9px] text-muted-foreground">
                Female · 24
              </span>
            </div>
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              Diagnosis: Hypertension
            </p>
          </div>
        </div>

        {/* Vitals Bento Counters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-border/60 bg-secondary/30 px-3 py-1 text-center">
            <span className="block font-bold text-sm text-foreground">89 bpm</span>
            <span className="text-[9px] text-muted-foreground">Heart Rate</span>
          </div>
          <div className="rounded-2xl border border-border/60 bg-secondary/30 px-3 py-1 text-center">
            <span className="block font-bold text-sm text-foreground">100/67</span>
            <span className="text-[9px] text-muted-foreground">Pressure</span>
          </div>
          <div className="rounded-2xl border border-border/60 bg-secondary/30 px-3 py-1 text-center">
            <span className="block font-bold text-sm text-foreground">98%</span>
            <span className="text-[9px] text-muted-foreground">Oxygen</span>
          </div>
          <div className="rounded-2xl border border-border/60 bg-secondary/30 px-3 py-1 text-center">
            <span className="block font-bold text-sm text-foreground">36.8°C</span>
            <span className="text-[9px] text-muted-foreground">Temperature</span>
          </div>
        </div>
      </div>

      {/* August vs September Timeline Cards */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* August Block */}
        <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="font-bold text-xs text-foreground">August · Week I</span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-semibold text-white">
              Aspirin x2
            </span>
          </div>
          {/* BP Wave Curve */}
          <div className="rounded-2xl bg-secondary/40 p-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs">Blood Pressure</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                +10
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Friday — Average: 160 / 80</p>
            {/* SVG Wave */}
            <svg className="mt-2 h-10 w-full text-amber-500" viewBox="0 0 200 40" fill="none">
              <path
                d="M0 20 Q 25 5, 50 20 T 100 20 T 150 20 T 200 20"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* September Block */}
        <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="font-bold text-xs text-foreground">September · Week I</span>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-semibold text-white">
                Bisoprolol x3
              </span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-semibold text-white">
                Aspirin x2
              </span>
            </div>
          </div>
          {/* ECG Rhythm Wave */}
          <div className="rounded-2xl bg-secondary/40 p-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs">ECG Wave</span>
              <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                Normal Sinus
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Continuous monitoring</p>
            {/* Heartbeat Wave */}
            <svg className="mt-2 h-10 w-full text-rose-500" viewBox="0 0 200 40" fill="none">
              <path
                d="M0 20 L40 20 L48 10 L56 32 L64 4 L72 25 L80 20 L120 20 L128 10 L136 32 L144 4 L152 25 L160 20 L200 20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   3. UX FLOW ARCHITECTURE SHOWCASE VIEW (Matching Reference 2)
   ========================================================================= */
function UXFlowShowcaseView() {
  return (
    <div className="p-4 sm:p-6 text-xs select-none">
      {/* Top Bar matching Ref 2 */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-muted-foreground">Drafts /</span>
          <span className="font-bold text-foreground">Untitled Project</span>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            + Create
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-secondary px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
            81% Zoom
          </span>
        </div>
      </div>

      {/* Main Flow Layout with Floating Layers Drawer */}
      <div className="mt-4 flex flex-col md:flex-row items-start gap-4">
        {/* Floating Layers Panel (Left) */}
        <div className="w-full md:w-52 shrink-0 rounded-2xl border border-border/80 bg-card p-3 shadow-md">
          <span className="font-bold text-xs text-foreground">Layers · Page 1</span>
          <div className="mt-2 space-y-1 font-mono text-[11px] text-muted-foreground">
            <div className="rounded-lg bg-secondary/60 px-2 py-1 text-foreground font-semibold">
              # Canvas
            </div>
            <div className="pl-3 py-0.5">• Display Title 3</div>
            <div className="pl-3 py-0.5">• Image Layer</div>
            <div className="pl-3 py-0.5">• Vector Path</div>
            <div className="py-0.5"># Frame 2</div>
            <div className="py-0.5"># Dialog</div>
          </div>
        </div>

        {/* Center / Right Decision Architecture */}
        <div className="flex-1 w-full space-y-3">
          {/* Root Card: Sign up example */}
          <div className="mx-auto w-48 rounded-2xl border border-blue-300 bg-blue-50/90 p-2 text-center font-bold text-xs text-blue-900 dark:border-blue-700 dark:bg-blue-950/70 dark:text-blue-100 shadow-sm">
            Sign up example
          </div>

          {/* Connected Child Branches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Branch 1: Company Workspace Form */}
            <div className="rounded-2xl border border-border/80 bg-card p-3.5 shadow-sm space-y-2">
              <span className="font-bold text-xs text-foreground">
                Create a company workspace
              </span>
              <div className="space-y-1.5">
                {["Name", "Surname", "Email", "Password"].map((field) => (
                  <div
                    key={field}
                    className="h-6 rounded-lg border border-border/60 bg-secondary/30 px-2 text-[10px] flex items-center text-muted-foreground"
                  >
                    {field}
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-blue-600 py-1 text-center font-semibold text-[10px] text-white">
                Sign up
              </div>
            </div>

            {/* Branch 2: Join Workspace Form */}
            <div className="rounded-2xl border border-border/80 bg-card p-3.5 shadow-sm space-y-2">
              <span className="font-bold text-xs text-foreground">
                Join your company workspace
              </span>
              <div className="h-6 rounded-lg border border-border/60 bg-secondary/30 px-2 text-[10px] flex items-center text-muted-foreground">
                E-mail
              </div>
              <div className="rounded-lg bg-blue-600 py-1 text-center font-semibold text-[10px] text-white">
                Join
              </div>

              {/* Follow-up Dialog */}
              <div className="mt-3 rounded-xl border border-border/60 bg-secondary/40 p-2 text-[10px]">
                <span className="font-bold block">Email is found</span>
                <span className="text-muted-foreground">Resend the confirmation link</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
