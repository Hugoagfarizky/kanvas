import { ArrowLeft, Compass, Download, PenLine, RefreshCw } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { getBoardById, saveBoard } from "@/lib/db"
import { useToast } from "@/lib/toast"
import { boardFileName, downloadBoard } from "@/lib/transfer"
import { cn } from "@/lib/utils"
import type { Board } from "@/types/board"

type LoadState = "loading" | "ready" | "missing" | "error"
type SaveState = "saved" | "saving" | "error"

export function BoardPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()

  const [board, setBoard] = useState<Board | null>(null)
  const [loadState, setLoadState] = useState<LoadState>(id ? "loading" : "missing")
  const [saveState, setSaveState] = useState<SaveState>("saved")
  const [reloadToken, setReloadToken] = useState(0)

  const saveTimer = useRef<number | null>(null)
  const boardRef = useRef<Board | null>(null)
  const saveSeq = useRef(0)

  useEffect(() => {
    boardRef.current = board
  }, [board])

  useEffect(() => {
    if (!board) return
    document.title = `${board.title.trim() || "Untitled board"} · Kanvas`
  }, [board])

  useEffect(() => {
    let active = true

    if (!id) return

    getBoardById(id)
      .then((found) => {
        if (!active) return
        if (!found) {
          setLoadState("missing")
          return
        }
        setBoard(found)
        setLoadState("ready")
      })
      .catch(() => {
        if (active) setLoadState("error")
      })

    return () => {
      active = false
    }
  }, [id, reloadToken])

  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current)
        if (boardRef.current) {
          void saveBoard({ ...boardRef.current, updatedAt: Date.now() }).catch(() => {
            // The page is unmounting, so there is nowhere to show the error.
          })
        }
      }
    }
  }, [])

  function persist(next: Board) {
    const seq = saveSeq.current + 1
    saveSeq.current = seq
    setSaveState("saving")

    void saveBoard({ ...next, updatedAt: Date.now() })
      .then(() => {
        if (seq === saveSeq.current) setSaveState("saved")
      })
      .catch(() => {
        if (seq === saveSeq.current) setSaveState("error")
      })
  }

  function handleTitleChange(value: string) {
    if (!board) return

    const next = { ...board, title: value }
    setBoard(next)

    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      saveTimer.current = null
      persist(next)
    }, 500)
  }

  function flushTitle() {
    if (!board) return

    const hadPendingSave = saveTimer.current !== null
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current)
      saveTimer.current = null
    }

    const next = { ...board, title: board.title.trim() || "Untitled board" }
    if (!hadPendingSave && next.title === board.title) return

    setBoard(next)
    persist(next)
  }

  function handleExport() {
    if (!board) return

    try {
      downloadBoard(board)
      toast({
        title: "Board exported",
        description: boardFileName(board),
        tone: "success",
      })
    } catch {
      toast({
        title: "Export failed",
        description: "The file could not be created.",
        tone: "error",
      })
    }
  }

  function retryLoad() {
    setLoadState("loading")
    setReloadToken((token) => token + 1)
  }

  const saveLabel =
    saveState === "saved" ? "Saved locally" : saveState === "saving" ? "Saving…" : "Not saved"

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border/70 bg-background/80 px-4 backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-1.5">
          <Link
            to="/"
            aria-label="Back to boards"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <ArrowLeft />
          </Link>
          <span className="hidden h-6 w-px shrink-0 bg-border sm:block" />

          {loadState === "ready" && board ? (
            <input
              value={board.title}
              onChange={(event) => handleTitleChange(event.target.value)}
              onBlur={flushTitle}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === "Escape") {
                  event.currentTarget.blur()
                }
              }}
              aria-label="Board title"
              spellCheck={false}
              className="w-[min(52vw,26rem)] truncate rounded-md border border-transparent bg-transparent px-2 py-1 font-display text-xl leading-none outline-none transition hover:border-border/80 focus:border-border focus:bg-card focus:ring-[3px] focus:ring-ring/25 sm:text-2xl"
            />
          ) : (
            <span className="px-2 font-display text-xl text-muted-foreground sm:text-2xl">
              Board
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {loadState === "ready" ? (
            <span
              role="status"
              aria-live="polite"
              title={
                saveState === "error"
                  ? "Local storage may be unavailable or full. Your latest change is not saved."
                  : undefined
              }
              className={cn(
                "hidden items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground sm:inline-flex",
                saveState === "error" && "border-destructive/30 text-destructive",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  saveState === "saved"
                    ? "bg-emerald-500"
                    : saveState === "saving"
                      ? "animate-pulse bg-amber-500"
                      : "bg-destructive",
                )}
              />
              {saveLabel}
            </span>
          ) : null}

          {loadState === "ready" ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExport}
              aria-label="Export board"
              title="Export board as JSON"
            >
              <Download />
            </Button>
          ) : null}

          <ThemeToggle />
        </div>
      </header>

      <main className="dot-grid relative flex flex-1 items-center justify-center p-6">
        {loadState === "loading" ? (
          <p className="text-sm text-muted-foreground">Opening board…</p>
        ) : null}

        {loadState === "missing" ? <MissingBoard /> : null}
        {loadState === "error" ? <LoadError onRetry={retryLoad} /> : null}
        {loadState === "ready" ? <EmptyCanvas /> : null}
      </main>
    </div>
  )
}

function EmptyCanvas() {
  return (
    <div className="w-full max-w-md rounded-3xl border border-border bg-card/85 p-8 text-center shadow-[0_24px_70px_-45px_rgba(0,0,0,0.45)] backdrop-blur-sm">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <PenLine className="size-5" />
      </div>
      <h1 className="mt-4 font-display text-3xl tracking-tight">A blank page, on purpose.</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Sticky notes, task cards, connectors and freehand ink are being wired up next. This board is
        saved in your browser, and you can export a backup from the header at any time.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-1.5">
        {["Notes", "Tasks", "Ink", "Connectors"].map((feature) => (
          <Badge key={feature} variant="outline">
            {feature} · soon
          </Badge>
        ))}
      </div>
      <Link
        to="/"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-6 inline-flex")}
      >
        Back to boards
      </Link>
    </div>
  )
}

function MissingBoard() {
  return (
    <div className="w-full max-w-sm rounded-3xl border border-border bg-card/85 p-8 text-center shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Compass className="size-5" />
      </div>
      <h1 className="mt-4 font-display text-2xl">Board not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        It may have been deleted, or it lives in a different browser.
      </p>
      <Link to="/" className={cn(buttonVariants({ size: "sm" }), "mt-6 inline-flex")}>
        Back to boards
      </Link>
    </div>
  )
}

function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="w-full max-w-sm rounded-3xl border border-border bg-card/85 p-8 text-center shadow-sm backdrop-blur-sm"
    >
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <RefreshCw className="size-5" />
      </div>
      <h1 className="mt-4 font-display text-2xl">Could not open this board</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Local storage may be unavailable. Try again, or open a normal browser window.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <Button size="sm" onClick={onRetry}>
          Try again
        </Button>
        <Link to="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          Back to boards
        </Link>
      </div>
    </div>
  )
}
