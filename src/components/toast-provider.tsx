import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"

import { createId } from "@/lib/id"
import { ToastContext, type ToastItem, type ToastOptions, type ToastTone } from "@/lib/toast"
import { cn } from "@/lib/utils"

const DEFAULT_DURATION = 5000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef(new Map<string, number>())

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }
    setToasts((current) => current.filter((item) => item.id !== id))
  }, [])

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = createId("toast")
      setToasts((current) => [...current.slice(-2), { ...options, id }])

      const duration = options.duration ?? DEFAULT_DURATION
      if (duration > 0) {
        const timer = window.setTimeout(() => dismiss(id), duration)
        timers.current.set(id, timer)
      }

      return id
    },
    [dismiss],
  )

  useEffect(() => {
    const activeTimers = timers.current
    return () => {
      activeTimers.forEach((timer) => window.clearTimeout(timer))
      activeTimers.clear()
    }
  }, [])

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6">
        <div aria-live="polite" aria-atomic="false" className="contents">
          {toasts.map((item) => (
            <ToastCard key={item.id} item={item} onDismiss={dismiss} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const tone = item.tone ?? "default"

  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-bottom-2 pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border bg-card/95 p-3.5 shadow-[0_18px_45px_-25px_rgba(0,0,0,0.45)] backdrop-blur-md duration-200",
        tone === "error" && "border-destructive/30",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
          tone === "success"
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
            : tone === "error"
              ? "bg-destructive/10 text-destructive"
              : "bg-accent text-accent-foreground",
        )}
      >
        <ToastIcon tone={tone} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug">{item.title}</p>
        {item.description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
        ) : null}
      </div>

      {item.action ? (
        <button
          type="button"
          onClick={() => {
            item.action?.onClick()
            onDismiss(item.id)
          }}
          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium underline-offset-4 transition hover:bg-accent hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          {item.action.label}
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-md p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

function ToastIcon({ tone }: { tone: ToastTone }) {
  if (tone === "success") return <CheckCircle2 className="size-4" />
  if (tone === "error") return <AlertTriangle className="size-4" />
  return <Info className="size-4" />
}
