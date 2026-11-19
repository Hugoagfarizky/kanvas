import { Link } from "react-router-dom"

import { GithubMark } from "@/components/github-mark"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          <Logo />
          <span className="font-display text-[1.7rem] leading-none tracking-tight">kanvas</span>
        </Link>

        <div className="flex items-center gap-1">
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
