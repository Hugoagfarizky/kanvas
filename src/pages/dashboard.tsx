import { LayoutGrid, Loader2, Plus, Search, Upload, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { BoardCard } from "@/components/board-card"
import { Hero } from "@/components/hero"
import { Logo } from "@/components/logo"
import { SiteHeader } from "@/components/site-header"
import { TemplateCard } from "@/components/template-card"
import { Button } from "@/components/ui/button"
import {
  createBoard,
  deleteBoardById,
  duplicateBoard,
  listBoards,
  saveBoard,
  sortBoards,
} from "@/lib/db"
import { site } from "@/lib/site"
import { TEMPLATES } from "@/lib/templates"
import { useToast } from "@/lib/toast"
import { readBoardFile } from "@/lib/transfer"
import type { Board, TemplateId } from "@/types/board"

export function DashboardPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [boards, setBoards] = useState<Board[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [creating, setCreating] = useState(false)
  const [query, setQuery] = useState("")
  const [reloadToken, setReloadToken] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  const searchRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasBoards = (boards?.length ?? 0) > 0
  const normalizedQuery = query.trim().toLowerCase()
  const visibleBoards =
    boards?.filter((board) => board.title.toLowerCase().includes(normalizedQuery)) ?? []

  useEffect(() => {
    document.title = "Kanvas — plans, scribbles & ideas"
  }, [])

  useEffect(() => {
    let active = true

    listBoards()
      .then((result) => {
        if (!active) return
        setBoards(result)
        setLoadError(false)
      })
      .catch(() => {
        if (!active) return
        setBoards([])
        setLoadError(true)
      })

    return () => {
      active = false
    }
  }, [reloadToken])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const handleCreate = useCallback(
    async (templateId: TemplateId = "blank") => {
      if (creating) return
      setCreating(true)

      try {
        const template = TEMPLATES.find((item) => item.id === templateId)
        const board = await createBoard({
          title: template?.boardTitle ?? "Untitled board",
          templateId,
        })
        navigate(`/board/${board.id}`)
      } catch {
        toast({
          title: "Could not create the board",
          description: "Local storage may be unavailable or full.",
          tone: "error",
        })
      } finally {
        setCreating(false)
      }
    },
    [creating, navigate, toast],
  )

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return

      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return

      if (event.key === "/" && searchRef.current) {
        event.preventDefault()
        searchRef.current.focus()
        return
      }

      if (event.key.toLowerCase() === "n") {
        event.preventDefault()
        void handleCreate("blank")
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [handleCreate])

  async function handleDuplicate(board: Board) {
    try {
      const copy = await duplicateBoard(board)
      setBoards((current) => sortBoards([copy, ...(current ?? [])]))
      toast({
        title: "Board duplicated",
        description: copy.title,
        tone: "success",
        action: { label: "Open", onClick: () => navigate(`/board/${copy.id}`) },
      })
    } catch {
      toast({
        title: "Could not duplicate the board",
        description: "Local storage may be unavailable or full.",
        tone: "error",
      })
    }
  }

  async function handleRename(board: Board) {
    const nextTitle = window.prompt("Rename board", board.title)
    if (nextTitle === null) return

    const trimmed = nextTitle.trim()
    if (!trimmed || trimmed === board.title) return

    const updated = { ...board, title: trimmed.slice(0, 120), updatedAt: Date.now() }

    try {
      await saveBoard(updated)
      setBoards((current) =>
        sortBoards((current ?? []).map((item) => (item.id === board.id ? updated : item))),
      )
      toast({ title: "Board renamed", description: updated.title, tone: "success" })
    } catch {
      toast({
        title: "Could not rename the board",
        description: "Local storage may be unavailable.",
        tone: "error",
      })
    }
  }

  async function handleDelete(board: Board) {
    setBoards((current) => current?.filter((item) => item.id !== board.id) ?? current)

    try {
      await deleteBoardById(board.id)
      toast({
        title: "Board deleted",
        description: board.title,
        duration: 7000,
        action: {
          label: "Undo",
          onClick: () => {
            void saveBoard(board)
              .then(() =>
                setBoards((current) =>
                  sortBoards([board, ...(current ?? []).filter((item) => item.id !== board.id)]),
                ),
              )
              .catch(() => {
                toast({
                  title: "Could not restore the board",
                  tone: "error",
                })
              })
          },
        },
      })
    } catch {
      setBoards((current) => sortBoards([board, ...(current ?? [])]))
      toast({
        title: "Could not delete the board",
        description: "Local storage may be unavailable.",
        tone: "error",
      })
    }
  }

  async function handleImportFile(file: File) {
    try {
      const board = await readBoardFile(file)
      await saveBoard(board)
      setBoards((current) => sortBoards([board, ...(current ?? [])]))
      toast({
        title: "Board imported",
        description: board.title,
        tone: "success",
        action: { label: "Open", onClick: () => navigate(`/board/${board.id}`) },
      })
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "That file could not be imported.",
        tone: "error",
        duration: 8000,
      })
    }
  }

  function retryLoad() {
    setBoards(null)
    setLoadError(false)
    setReloadToken((token) => token + 1)
  }

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 sm:px-6">
        <Hero onStart={() => void handleCreate("blank")} />

        {loadError ? (
          <div
            role="alert"
            className="mb-12 flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-destructive">Local storage is unavailable</p>
              <p className="mt-1 text-muted-foreground">
                Kanvas cannot read or save boards in this browser. If you are in private mode, try a
                normal window.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={retryLoad}>
              Retry
            </Button>
          </div>
        ) : null}

        <section
          id="boards"
          aria-busy={boards === null}
          className="scroll-mt-24 border-t border-border/70 py-12"
        >
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/90 px-3 py-0.5 text-xs font-semibold text-muted-foreground shadow-xs">
                  <span>Workspace 📂</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Local-First 🌿
                </span>
              </div>
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Your boards</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {boards === null
                  ? "Opening your local workspace…"
                  : boardCountLabel(boards.length, loadError)}
              </p>
            </div>

            <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center">
              {hasBoards ? (
                <div className="relative w-full sm:w-60">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    ref={searchRef}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search boards…"
                    aria-label="Search boards"
                    className="h-9 w-full rounded-full border border-border/80 bg-card/80 pl-8.5 pr-8 text-xs outline-none shadow-xs transition placeholder:text-muted-foreground/70 focus:border-ring focus:ring-[3px] focus:ring-ring/25 [&::-webkit-search-cancel-button]:hidden"
                  />
                  {query ? (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="Clear search"
                      className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  ) : null}
                </div>
              ) : null}

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="sr-only"
                aria-label="Import a board file"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ""
                  if (file) void handleImportFile(file)
                }}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={boards === null}
                className="rounded-full shadow-xs"
              >
                <Upload className="size-3.5" />
                Import
              </Button>

              {hasBoards ? (
                <Button
                  size="sm"
                  onClick={() => void handleCreate("blank")}
                  disabled={creating}
                  className="rounded-full shadow-xs"
                >
                  {creating ? <Loader2 className="animate-spin size-3.5" /> : <Plus className="size-3.5" />}
                  New board
                </Button>
              ) : null}
            </div>
          </div>

          {loadError ? null : boards === null ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-52 animate-pulse rounded-2xl border border-border bg-card/60"
                />
              ))}
            </div>
          ) : boards.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/40 px-6 py-14 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <LayoutGrid className="size-5" />
              </div>
              <h3 className="mt-4 font-display text-2xl">No boards yet</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Start with a blank canvas, or borrow a template to get the first sticky note down.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                <Button onClick={() => void handleCreate("blank")} disabled={creating}>
                  {creating ? <Loader2 className="animate-spin" /> : <Plus />}
                  Blank board
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    document
                      .getElementById("templates")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                >
                  Browse templates
                </Button>
              </div>
              <p className="mt-6 text-xs text-muted-foreground">
                Tip: press <Kbd>N</Kbd> for a new board or <Kbd>/</Kbd> to search.
              </p>
            </div>
          ) : visibleBoards.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
              <p className="font-display text-2xl">No boards match “{query.trim()}”</p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Try a shorter search, or clear the filter.
              </p>
              <Button variant="outline" size="sm" className="mt-5" onClick={() => setQuery("")}>
                Clear search
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleBoards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  now={now}
                  onDuplicate={handleDuplicate}
                  onRename={handleRename}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>

        <section id="templates" className="scroll-mt-24 border-t border-border/70 py-14">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
                Start from a shape
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Four starting points. Rearrange everything later.
              </p>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Templates
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onCreate={() => void handleCreate(template.id)}
                disabled={creating}
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2.5">
            <Logo className="size-7 rounded-lg" />
            <span>
              <span className="font-display text-lg text-foreground">kanvas</span>
              <span className="ml-2">Free and open source, MIT.</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              className="transition hover:text-foreground"
              href={site.repoUrl}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              className="transition hover:text-foreground"
              href={site.roadmapUrl}
              target="_blank"
              rel="noreferrer"
            >
              Roadmap
            </a>
            <span className="text-xs">Made for messy thinking.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function boardCountLabel(count: number, loadError: boolean): string {
  if (loadError) return "Local boards could not be loaded."
  if (count === 0) return "Nothing here yet — the page is blank on purpose."
  return `${count} board${count === 1 ? "" : "s"} saved on this device.`
}

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="mx-0.5 inline-flex min-w-5 items-center justify-center rounded border border-border bg-background px-1.5 py-0.5 font-sans text-[10px] font-medium text-foreground shadow-sm">
      {children}
    </kbd>
  )
}
