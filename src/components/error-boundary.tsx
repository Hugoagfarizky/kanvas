import { Component, type ErrorInfo, type ReactNode } from "react"

import { Button } from "@/components/ui/button"

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled Kanvas error", error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="font-display text-5xl leading-none text-muted-foreground/30">Oops</p>
          <h1 className="mt-3 font-display text-2xl tracking-tight">
            Something broke on the canvas.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your boards are still stored in this browser. Reload the page to try again.
          </p>
          <Button className="mt-6" onClick={() => window.location.reload()}>
            Reload Kanvas
          </Button>
        </div>
      </div>
    )
  }
}
