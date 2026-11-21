/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowLeft, Compass, Download, Image as ImageIcon, Keyboard, RefreshCw, X } from "lucide-react"
import { lazy, Suspense, useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button, buttonVariants } from "@/components/ui/button"
import { getBoardById, saveBoard } from "@/lib/db"
import { useTheme } from "@/lib/theme"
import { useToast } from "@/lib/toast"
import { boardFileName, downloadBoard } from "@/lib/transfer"
import { toPng } from "html-to-image"
import { cn } from "@/lib/utils"
import type { Board, Viewport } from "@/types/board"

const BoardCanvas = lazy(() =>
  import("@/components/canvas").then((module) => ({ default: module.BoardCanvas })),
)

type LoadState = "loading" | "ready" | "missing" | "error"
type SaveState = "saved" | "saving" | "error"

export function BoardPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const { theme } = useTheme()
  const [board, setBoard] = useState<Board | null>(null)
  const [showShortcuts, setShowShortcuts] = useState(false)
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

  function persist(next: Board, touchUpdatedAt = true) {
    const seq = saveSeq.current + 1
    saveSeq.current = seq
    setSaveState("saving")

    const toSave = touchUpdatedAt ? { ...next, updatedAt: Date.now() } : next
    if (touchUpdatedAt) setBoard(toSave)

    void saveBoard(toSave)
      .then(() => {
        if (seq === saveSeq.current) setSaveState("saved")
      })
      .catch(() => {
        if (seq === saveSeq.current) setSaveState("error")
      })
  }

  function handleViewportChange(viewport: Viewport) {
    if (!board) return

    const next = { ...board, viewport }
    setBoard(next)
    persist(next, false)
  }

  function handlePersist(patch: { nodes: any[]; edges: any[]; strokes: any[] }) {
    if (!board) return

    const next = { ...board, nodes: patch.nodes, edges: patch.edges, strokes: patch.strokes }
    setBoard(next)
    persist(next, true)
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

  async function handleExportPng() {
    if (!board) return

    const node = document.querySelector(".react-flow") as HTMLElement | null
    if (!node) return

    try {
      const bgColor = theme === "dark" ? "#1a1e29" : "#f7f5ef"
      const dataUrl = await toPng(node, {
        backgroundColor: bgColor,
        pixelRatio: 2,
      })
      const link = document.createElement("a")
      link.download = `${
        board.title
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "board"
      }.png`
      link.href = dataUrl
      link.click()
      toast({ title: "PNG exported", tone: "success" })
    } catch {
      toast({
        title: "PNG export failed",
        description: "The image could not be created.",
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
        <div className="flex min-w-0 items-center gap-2">
          <Link
            to="/"
            aria-label="Back to boards"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full hover:bg-card/90 hover:shadow-xs transition")}
          >
            <ArrowLeft className="size-4" />
          </Link>
          <span className="hidden h-5 w-px shrink-0 bg-border/80 sm:block" />

          {loadState === "ready" && board ? (
            <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1 shadow-xs backdrop-blur-xs transition focus-within:border-primary/50 focus-within:bg-card">
              <span className="hidden text-xs font-semibold text-muted-foreground sm:inline">Kanvas</span>
              <span className="hidden text-xs text-muted-foreground/50 sm:inline">/</span>
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
                className="w-[min(48vw,22rem)] truncate bg-transparent font-sans text-sm font-semibold leading-none outline-none sm:text-base text-foreground"
              />
            </div>
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
                "hidden items-center gap-1.5 rounded-full border border-border/80 bg-card/90 px-3 py-1 text-[11px] font-semibold text-muted-foreground shadow-xs sm:inline-flex",
                saveState === "error" && "border-destructive/30 text-destructive",
              )}
            >
              <span
                className={cn(
                  "size-2 rounded-full",
                  saveState === "saved"
                    ? "bg-emerald-500 ring-2 ring-emerald-500/20"
                    : saveState === "saving"
                      ? "animate-pulse bg-amber-500 ring-2 ring-amber-500/20"
                      : "bg-destructive ring-2 ring-destructive/20",
                )}
              />
              {saveLabel}
            </span>
          ) : null}

          {loadState === "ready" ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowShortcuts(true)}
                aria-label="Keyboard shortcuts"
                title="Keyboard shortcuts"
                className="rounded-full hover:bg-card/90 hover:shadow-xs transition"
              >
                <Keyboard className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExport}
                aria-label="Export board as JSON"
                title="Export board as JSON"
                className="rounded-full hover:bg-card/90 hover:shadow-xs transition"
              >
                <Download className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => void handleExportPng()}
                aria-label="Export board as PNG"
                title="Export board as PNG"
                className="rounded-full hover:bg-card/90 hover:shadow-xs transition"
              >
                <ImageIcon className="size-4" />
              </Button>
            </>
          ) : null}

          <ThemeToggle />
        </div>
      </header>

      <main className="relative min-h-0 flex-1 overflow-hidden">
        {loadState === "loading" ? (
          <p className="text-sm text-muted-foreground">Opening board…</p>
        ) : null}

        {loadState === "missing" ? <MissingBoard /> : null}
        {loadState === "error" ? <LoadError onRetry={retryLoad} /> : null}
        {loadState === "ready" && board ? (
          <Suspense fallback={<p className="text-sm text-muted-foreground">Opening canvas...</p>}>
            <BoardCanvas
              board={board}
              onViewportChange={handleViewportChange}
              onPersist={handlePersist}
            />
          </Suspense>
        ) : null}
      </main>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div className="flex items-center gap-2">
                <Keyboard className="size-4 text-primary" />
                <h3 className="font-semibold text-sm">Keyboard Shortcuts</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShortcuts(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              {[
                { key: "V", desc: "Select tool" },
                { key: "H", desc: "Hand / Pan tool" },
                { key: "P", desc: "Pen drawing tool" },
                { key: "E", desc: "Eraser tool" },
                { key: "N", desc: "Add Sticky Note" },
                { key: "T", desc: "Add Text block" },
                { key: "Ctrl + V", desc: "Paste copied nodes or clipboard screenshot" },
                { key: "Ctrl + D", desc: "Duplicate selected nodes" },
                { key: "Ctrl + A", desc: "Select all nodes" },
                { key: "Ctrl + Z / Y", desc: "Undo / Redo" },
                { key: "Del / Backspace", desc: "Delete selected nodes" },
                { key: "+ / - / 0", desc: "Zoom in / Zoom out / Reset fit" },
                { key: "Shift + Drag", desc: "Marquee multi-select" },
                { key: "Drag from OS", desc: "Drop image files directly onto canvas" },
              ].map((s) => (
                <div key={s.key} className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground">{s.desc}</span>
                  <kbd className="rounded-md border border-border bg-muted/60 px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
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
