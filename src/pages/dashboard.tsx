import { LayoutGrid, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { BoardCard } from "@/components/board-card"
import { Hero } from "@/components/hero"
import { Logo } from "@/components/logo"
import { SiteHeader } from "@/components/site-header"
import { TemplateCard } from "@/components/template-card"
import { Button } from "@/components/ui/button"
import { createBoard, deleteBoardById, listBoards } from "@/lib/db"
import { site } from "@/lib/site"
import { TEMPLATES } from "@/lib/templates"
import type { Board, TemplateId } from "@/types/board"

export function DashboardPage() {
  const navigate = useNavigate()
  const [boards, setBoards] = useState<Board[] | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    let active = true

    listBoards()
      .then((result) => {
        if (active) setBoards(result)
      })
      .catch(() => {
        if (active) setBoards([])
      })

    return () => {
      active = false
    }
  }, [])

  async function handleCreate(templateId: TemplateId = "blank") {
    if (creating) return
    setCreating(true)

    try {
      const template = TEMPLATES.find((item) => item.id === templateId)
      const board = await createBoard({
        title: template?.boardTitle ?? "Untitled board",
        templateId,
      })
      navigate(`/board/${board.id}`)
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string) {
    setBoards((current) => current?.filter((board) => board.id !== id) ?? current)
    await deleteBoardById(id)
  }

  const boardCount = boards?.length ?? 0

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 sm:px-6">
        <Hero onStart={() => void handleCreate("blank")} />

        <section id="boards" className="scroll-mt-24 border-t border-border/70 py-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Your boards</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {boards === null
                  ? "Opening your local workspace…"
                  : boardCount === 0
                    ? "Nothing here yet — the page is blank on purpose."
                    : `${boardCount} board${boardCount === 1 ? "" : "s"} saved on this device.`}
              </p>
            </div>

            {boardCount > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleCreate("blank")}
                disabled={creating}
              >
                <Plus />
                New board
              </Button>
            ) : null}
          </div>

          {boards === null ? (
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
                  <Plus />
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
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {boards.map((board) => (
                <BoardCard key={board.id} board={board} onDelete={handleDelete} />
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
