/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ArrowLeft,
  ChevronDown,
  Clock,
  Compass,
  Download,
  GraduationCap,
  Image as ImageIcon,
  Keyboard,
  Mail,
  RefreshCw,
  Sliders,
  Users,
  X,
} from "lucide-react"
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
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [activeNavTab, setActiveNavTab] = useState<"plan" | "team" | "timeline" | "messages" | "settings">("plan")
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
      {/* Sleek Dei Dark Header with Center Scallop Cutout */}
      <header className="relative flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#0f1115] px-4 text-white sm:px-6 z-40 select-none shadow-md">
        {/* Left: Brand & Board Title */}
        <div className="flex min-w-0 items-center gap-2.5">
          <Link
            to="/"
            aria-label="Back to boards"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "rounded-full text-white/80 hover:bg-white/10 hover:text-white transition",
            )}
          >
            <ArrowLeft className="size-4" />
          </Link>
          <span className="hidden h-5 w-px shrink-0 bg-white/20 sm:block" />

          <span className="font-sans text-xl font-black tracking-tight text-white">Dei</span>

          {loadState === "ready" && board ? (
            <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 shadow-xs backdrop-blur-xs transition focus-within:border-white/40 focus-within:bg-white/10">
              <span className="hidden text-xs text-white/50 sm:inline">/</span>
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
                className="w-[min(38vw,16rem)] truncate bg-transparent font-sans text-xs sm:text-sm font-semibold text-white outline-none placeholder:text-white/40"
              />
            </div>
          ) : (
            <span className="px-2 font-display text-lg text-white/60">Board</span>
          )}
        </div>

        {/* Center: Dei Navigation Tabs */}
        <div className="hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 shadow-inner backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveNavTab("plan")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition",
              activeNavTab === "plan"
                ? "bg-white/15 text-white ring-1 ring-white/20 shadow-xs"
                : "text-white/60 hover:text-white hover:bg-white/10",
            )}
          >
            <GraduationCap className="size-3.5" />
            <span>Learning Plan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveNavTab("team")}
            className={cn(
              "flex size-7.5 items-center justify-center rounded-full transition",
              activeNavTab === "team"
                ? "bg-white/15 text-white shadow-xs"
                : "text-white/60 hover:text-white hover:bg-white/10",
            )}
            title="Team & Collaborators"
          >
            <Users className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setActiveNavTab("timeline")}
            className={cn(
              "flex size-7.5 items-center justify-center rounded-full transition",
              activeNavTab === "timeline"
                ? "bg-white/15 text-white shadow-xs"
                : "text-white/60 hover:text-white hover:bg-white/10",
            )}
            title="Timeline & Schedule"
          >
            <Clock className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setActiveNavTab("messages")}
            className={cn(
              "flex size-7.5 items-center justify-center rounded-full transition",
              activeNavTab === "messages"
                ? "bg-white/15 text-white shadow-xs"
                : "text-white/60 hover:text-white hover:bg-white/10",
            )}
            title="Messages"
          >
            <Mail className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setActiveNavTab("settings")}
            className={cn(
              "flex size-7.5 items-center justify-center rounded-full transition",
              activeNavTab === "settings"
                ? "bg-white/15 text-white shadow-xs"
                : "text-white/60 hover:text-white hover:bg-white/10",
            )}
            title="Settings & Config"
          >
            <Sliders className="size-3.5" />
          </button>
        </div>

        {/* Right: Save Status & Ellington Thom Profile Pill */}
        <div className="flex shrink-0 items-center gap-2">
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
                "hidden items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80 shadow-xs sm:inline-flex",
                saveState === "error" && "border-destructive/40 text-rose-300",
              )}
            >
              <span
                className={cn(
                  "size-2 rounded-full",
                  saveState === "saved"
                    ? "bg-emerald-400 ring-2 ring-emerald-400/20"
                    : saveState === "saving"
                      ? "animate-pulse bg-amber-400 ring-2 ring-amber-400/20"
                      : "bg-rose-500 ring-2 ring-rose-500/20",
                )}
              />
              {saveLabel}
            </span>
          ) : null}

          {/* User Profile Pill matching Dei reference */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2 py-1 transition hover:bg-white/15 active:scale-95 shadow-xs"
              title="User profile & board settings"
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 font-bold text-xs text-white ring-2 ring-white/20">
                ET
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight pr-1">
                <span className="text-xs font-bold text-white">Ellington Thom</span>
                <span className="text-[10px] text-white/60">annette@gmail.com</span>
              </div>
              <ChevronDown className="size-3.5 text-white/60" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu ? (
              <div className="absolute right-0 top-12 z-50 min-w-56 rounded-2xl border border-white/15 bg-[#161922] p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 text-white">
                <div className="border-b border-white/10 px-3 py-2 sm:hidden">
                  <p className="text-xs font-bold text-white">Ellington Thom</p>
                  <p className="text-[10px] text-white/60">annette@gmail.com</p>
                </div>
                <div className="p-1 space-y-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setShowShortcuts(true)
                      setShowProfileMenu(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-white/80 hover:bg-white/10 hover:text-white transition"
                  >
                    <Keyboard className="size-3.5" />
                    <span>Keyboard shortcuts</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleExport()
                      setShowProfileMenu(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-white/80 hover:bg-white/10 hover:text-white transition"
                  >
                    <Download className="size-3.5" />
                    <span>Export board as JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleExportPng()
                      setShowProfileMenu(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-white/80 hover:bg-white/10 hover:text-white transition"
                  >
                    <ImageIcon className="size-3.5" />
                    <span>Export board as PNG</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Quick utility action buttons preserving exact test accessibility */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowShortcuts(true)}
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts"
              className="rounded-full text-white/80 hover:bg-white/10 hover:text-white transition size-8"
            >
              <Keyboard className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExport}
              aria-label="Export board as JSON"
              title="Export board as JSON"
              className="rounded-full text-white/80 hover:bg-white/10 hover:text-white transition size-8"
            >
              <Download className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => void handleExportPng()}
              aria-label="Export board as PNG"
              title="Export board as PNG"
              className="rounded-full text-white/80 hover:bg-white/10 hover:text-white transition size-8"
            >
              <ImageIcon className="size-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Center Organic Scallop Cutout Curve into Canvas */}
        <div className="pointer-events-none absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-28 h-2.5 overflow-hidden flex justify-center">
          <svg className="w-28 h-2.5 text-[#0f1115] fill-current" viewBox="0 0 112 10">
            <path d="M0 0 C28 0 38 10 56 10 C74 10 84 0 112 0 Z" />
          </svg>
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
