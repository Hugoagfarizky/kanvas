import { Copy, Trash2 } from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import { formatRelativeTime } from "@/lib/date"
import { getTemplate } from "@/lib/templates"
import { cn } from "@/lib/utils"
import type { Board } from "@/types/board"

export function BoardCard({
  board,
  now,
  onDuplicate,
  onDelete,
}: {
  board: Board
  now: number
  onDuplicate: (board: Board) => void
  onDelete: (board: Board) => void
}) {
  const template = getTemplate(board.templateId)

  return (
    <div className="group relative">
      <Link
        to={`/board/${board.id}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_20px_45px_-30px_rgba(0,0,0,0.45)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        <div className="dot-grid relative h-28 overflow-hidden border-b border-border/80 bg-muted/25">
          <div className="absolute -left-3 top-5 h-16 w-24 -rotate-[4deg] rounded-lg border border-border/80 bg-card shadow-sm">
            <div className={cn("h-1.5 rounded-t-lg", template?.bar ?? "bg-foreground/20")} />
            <div className="space-y-1.5 p-2.5">
              <div className="h-1.5 w-12 rounded-full bg-foreground/15" />
              <div className="h-1.5 w-8 rounded-full bg-foreground/10" />
            </div>
          </div>

          <div className="absolute -bottom-2 right-5 h-14 w-20 rotate-[3deg] rounded-lg border border-border/80 bg-card shadow-sm">
            <div
              className={cn("h-1.5 rounded-t-lg opacity-70", template?.bar ?? "bg-foreground/20")}
            />
            <div className="space-y-1.5 p-2.5">
              <div className="h-1.5 w-9 rounded-full bg-foreground/15" />
              <div className="h-1.5 w-5 rounded-full bg-foreground/10" />
            </div>
          </div>

          <svg
            className="absolute inset-0 h-full w-full text-foreground/15"
            viewBox="0 0 320 112"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M96 52c40 12 60 20 92 34"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="flex flex-1 items-start justify-between gap-3 p-4">
          <div className="min-w-0">
            <h3 className="truncate font-medium">{board.title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Edited {formatRelativeTime(board.updatedAt, now)}
            </p>
          </div>
          <span className="mt-0.5 hidden shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:inline">
            local
          </span>
        </div>
      </Link>

      <div className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1 sm:opacity-0 sm:transition-opacity sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
        <CardAction label={`Duplicate ${board.title}`} onClick={() => onDuplicate(board)}>
          <Copy />
        </CardAction>
        <CardAction label={`Delete ${board.title}`} onClick={() => onDelete(board)} danger>
          <Trash2 />
        </CardAction>
      </div>
    </div>
  )
}

function CardAction({
  label,
  onClick,
  danger,
  children,
}: {
  label: string
  onClick: () => void
  danger?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-full border border-border bg-background/90 text-muted-foreground shadow-sm backdrop-blur transition hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 [&_svg]:size-3.5",
        danger && "hover:border-destructive/40 hover:bg-destructive hover:text-white",
      )}
    >
      {children}
    </button>
  )
}
