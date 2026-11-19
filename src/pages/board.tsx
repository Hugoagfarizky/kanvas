import { ArrowLeft, Compass, PenLine } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { getBoardById, saveBoard } from "@/lib/db"
import { cn } from "@/lib/utils"
import type { Board } from "@/types/board"

type LoadState = "loading" | "ready" | "missing"
type SaveState = "saved" | "saving"

export function BoardPage() {
  const { id } = useParams<{ id: string }>()
  const [board, setBoard] = useState<Board | null>(null)
  const [loadState, setLoadState] = useState<LoadState>(id ? "loading" : "missing")
  const [saveState, setSaveState] = useState<SaveState>("saved")

  const saveTimer = useRef<number | null>(null)
  const boardRef = useRef<Board | null>(null)

  useEffect(() => {
    boardRef.current = board
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
        if (active) setLoadState("missing")
      })

    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current)
        if (boardRef.current) {
          void saveBoard({ ...boardRef.current, updatedAt: Date.now() })
        }
      }
    }
  }, [])

  function persist(next: Board) {
    void saveBoard({ ...next, updatedAt: Date.now() })
  }

  function handleTitleChange(value: string) {
    if (!board) return

    const next = { ...board, title: value }
    setBoard(next)
    setSaveState("saving")

    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      saveTimer.current = null
      persist(next)
      setSaveState("saved")
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
    setSaveState("saved")
  }

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
                if (event.key === "Enter") event.currentTarget.blur()
              }}
              aria-label="Board title"
              spellCheck={false}
              className="w-[min(58vw,26rem)] truncate rounded-md border border-transparent bg-transparent px-2 py-1 font-display text-xl leading-none outline-none transition hover:border-border/80 focus:border-border focus:bg-card focus:ring-[3px] focus:ring-ring/25 sm:text-2xl"
            />
          ) : (
            <span className="px-2 font-display text-xl text-muted-foreground sm:text-2xl">
              Board
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {loadState === "ready" ? (
            <span className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground sm:inline-flex">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  saveState === "saved" ? "bg-emerald-500" : "animate-pulse bg-amber-500",
                )}
              />
              {saveState === "saved" ? "Saved locally" : "Saving…"}
            </span>
          ) : null}
          <ThemeToggle />
        </div>
      </header>

      <main className="dot-grid relative flex flex-1 items-center justify-center p-6">
        {loadState === "loading" ? (
          <p className="text-sm text-muted-foreground">Opening board…</p>
        ) : null}

        {loadState === "missing" ? <MissingBoard /> : null}
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
        already saved in your browser.
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
