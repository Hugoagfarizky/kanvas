import { Link } from "react-router-dom"

import { SiteHeader } from "@/components/site-header"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-md text-center">
          <p className="font-display text-7xl leading-none text-muted-foreground/30">404</p>
          <h1 className="mt-3 font-display text-3xl tracking-tight">
            This page wandered off the canvas.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The link is broken, or the board has been moved.
          </p>
          <Link to="/" className={cn(buttonVariants(), "mt-6")}>
            Back to boards
          </Link>
        </div>
      </main>
    </div>
  )
}
