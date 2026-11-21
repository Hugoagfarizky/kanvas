import { Copy, Pencil, Trash2 } from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import { formatRelativeTime } from "@/lib/date"
import { cn } from "@/lib/utils"
import type { Board } from "@/types/board"

export function BoardCard({
  board,
  now,
  onDuplicate,
  onDelete,
  onRename,
}: {
  board: Board
  now: number
  onDuplicate: (board: Board) => void
  onDelete: (board: Board) => void
  onRename: (board: Board) => void
}) {
  const hasContent = board.nodes.length > 0 || board.strokes.length > 0

  return (
    <div className="group relative">
      <Link
        to={`/board/${board.id}`}
        className="flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-card/90 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        <div className="dot-grid relative m-2.5 h-32 overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
          {hasContent ? (
            <BoardThumbnail board={board} />
          ) : (
            <>
              {/* Pastel Bento Mini Cards inside empty thumbnail matching Ref 1 & 3 */}
              <div className="absolute -left-2 top-4 w-28 -rotate-3 rounded-2xl border border-amber-300/60 bg-amber-100/90 p-2.5 shadow-sm dark:bg-amber-950/40 dark:border-amber-700/50">
                <div className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  <span className="text-[9px] font-semibold text-amber-800 dark:text-amber-300">Idea</span>
                </div>
                <div className="mt-1.5 space-y-1">
                  <div className="h-1.5 w-14 rounded-full bg-amber-900/20 dark:bg-amber-300/20" />
                  <div className="h-1.5 w-10 rounded-full bg-amber-900/15 dark:bg-amber-300/15" />
                </div>
              </div>

              <div className="absolute -bottom-2 right-4 w-24 rotate-2 rounded-2xl border border-sky-300/60 bg-sky-100/90 p-2 shadow-sm dark:bg-sky-950/40 dark:border-sky-700/50">
                <div className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-sky-500" />
                  <span className="text-[9px] font-semibold text-sky-800 dark:text-sky-300">Plan</span>
                </div>
                <div className="mt-1 space-y-1">
                  <div className="h-1.5 w-12 rounded-full bg-sky-900/20 dark:bg-sky-300/20" />
                  <div className="h-1.5 w-7 rounded-full bg-sky-900/15 dark:bg-sky-300/15" />
                </div>
              </div>

              <svg
                className="absolute inset-0 h-full w-full text-foreground/15"
                viewBox="0 0 320 128"
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
            </>
          )}
        </div>

        <div className="flex flex-1 items-start justify-between gap-3 px-5 pb-4 pt-1">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-sm sm:text-base text-foreground">{board.title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Edited {formatRelativeTime(board.updatedAt, now)}
            </p>
          </div>
          <span className="mt-0.5 hidden shrink-0 items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 sm:inline-flex">
            <span className="size-1 rounded-full bg-emerald-500" />
            local
          </span>
        </div>
      </Link>

      <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full border border-border/80 bg-card/95 p-1 shadow-md backdrop-blur-md sm:opacity-0 sm:transition-opacity sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
        <CardAction label={`Rename ${board.title}`} onClick={() => onRename(board)}>
          <Pencil />
        </CardAction>
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

function BoardThumbnail({ board }: { board: Board }) {
  const points = board.strokes.flatMap((stroke) => stroke.points)
  const xs = [...board.nodes.map((node) => node.position.x), ...points.map((point) => point[0])]
  const ys = [...board.nodes.map((node) => node.position.y), ...points.map((point) => point[1])]
  const xe = board.nodes.map((node) => node.position.x + node.size.width)
  const ye = board.nodes.map((node) => node.position.y + node.size.height)

  if (xs.length === 0) return null

  const minX = Math.min(...xs, ...xe)
  const maxX = Math.max(...xs, ...xe)
  const minY = Math.min(...ys, ...ye)
  const maxY = Math.max(...ys, ...ye)
  const pad = 24
  const width = Math.max(1, maxX - minX + pad * 2)
  const height = Math.max(1, maxY - minY + pad * 2)
  const vx = minX - pad
  const vy = minY - pad

  return (
    <svg
      viewBox={`${vx} ${vy} ${width} ${height}`}
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {board.strokes.map((stroke) => (
        <polyline
          key={stroke.id}
          points={stroke.points.map((point) => `${point[0]},${point[1]}`).join(" ")}
          fill="none"
          stroke={stroke.color === "#1f2937" ? "var(--foreground)" : stroke.color}
          strokeWidth={Math.max(2, stroke.size)}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={stroke.tool === "highlighter" ? 0.45 : 0.85}
        />
      ))}
      {board.nodes.map((node) => (
        <rect
          key={node.id}
          x={node.position.x}
          y={node.position.y}
          width={node.size.width}
          height={node.size.height}
          rx={6}
          fill={node.style.fill === "transparent" ? "rgba(148,163,184,0.12)" : node.style.fill}
          stroke={node.style.stroke || "var(--border)"}
          strokeWidth={1.5}
        />
      ))}
    </svg>
  )
}
