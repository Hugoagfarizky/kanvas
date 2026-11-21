import { Activity, Compass, GraduationCap, Users } from "lucide-react"
import { Link } from "react-router-dom"

import { GithubMark } from "@/components/github-mark"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
        {/* Left: Brand logo & name matching Dei rounded styling */}
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          <Logo />
          <span className="font-display text-[1.75rem] font-bold leading-none tracking-tight">
            kanvas
          </span>
        </Link>

        {/* Center: Quick reference nav tabs matching Dei top bar */}
        <nav className="hidden items-center gap-1 rounded-full border border-border/80 bg-card/80 p-1 shadow-xs backdrop-blur-sm md:flex">
          <a
            href="#templates"
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <GraduationCap className="size-3.5 text-emerald-500" />
            Learning Plan
          </a>
          <a
            href="#templates"
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <Activity className="size-3.5 text-rose-500" />
            Cardiology
          </a>
          <a
            href="#templates"
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <Compass className="size-3.5 text-sky-500" />
            UX Flow
          </a>
          <a
            href="#boards"
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <Users className="size-3.5 text-amber-500" />
            Workspace
          </a>
        </nav>

        {/* Right: User Profile Capsule matching Ellington Thom in Ref 3 + GitHub & Theme */}
        <div className="flex items-center gap-2">
          {/* User profile capsule */}
          <div className="hidden items-center gap-2 rounded-full border border-border/80 bg-card/80 py-1 pl-1 pr-3 shadow-xs sm:flex">
            <div className="flex size-7 items-center justify-center rounded-full bg-linear-to-tr from-purple-600 to-indigo-500 font-bold text-xs text-white shadow-xs">
              ET
            </div>
            <div className="flex flex-col text-left leading-none">
              <span className="text-xs font-semibold text-foreground">Ellington Thom</span>
              <span className="text-[10px] text-muted-foreground">annette@gmail.com</span>
            </div>
          </div>

          <a
            href={site.repoUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="View Kanvas on GitHub"
            title="View on GitHub"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <GithubMark className="size-[18px]" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
