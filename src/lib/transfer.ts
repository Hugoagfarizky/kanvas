import { createId } from "@/lib/id"
import type {
  EdgeType,
  KanvasEdge,
  KanvasNode,
  Stroke,
  StrokeTool,
  TemplateId,
  Viewport,
} from "@/types/board"
import type { Board } from "@/types/board"

const FILE_APP = "kanvas"
const FILE_VERSION = 1
const MAX_FILE_BYTES = 10 * 1024 * 1024

const TEMPLATE_IDS: TemplateId[] = ["blank", "brainstorm", "project", "weekly", "retro"]
const NODE_TYPES = new Set(["note", "text", "task", "shape", "frame", "image"])
const EDGE_TYPES = new Set<EdgeType>(["bezier", "straight", "step"])
const STROKE_TOOLS = new Set<StrokeTool>(["pen", "highlighter", "eraser"])

export class BoardImportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "BoardImportError"
  }
}

export function boardFileName(board: Board): string {
  const slug = board.title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)

  return `${slug || "board"}.kanvas.json`
}

export function serializeBoard(board: Board): string {
  return JSON.stringify(
    {
      app: FILE_APP,
      fileVersion: FILE_VERSION,
      exportedAt: new Date().toISOString(),
      board,
    },
    null,
    2,
  )
}

export function downloadBoard(board: Board): void {
  const blob = new Blob([serializeBoard(board)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = boardFileName(board)
  link.rel = "noopener"
  document.body.append(link)
  link.click()
  link.remove()

  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function readBoardFile(file: File): Promise<Board> {
  if (file.size > MAX_FILE_BYTES) {
    throw new BoardImportError("That file is larger than 10 MB.")
  }

  return parseBoardFile(await file.text())
}

/**
 * Accepts either a Kanvas export envelope or a raw board object, validates it and
 * returns a fresh board with a new id so importing never overwrites local data.
 */
export function parseBoardFile(text: string): Board {
  let payload: unknown

  try {
    payload = JSON.parse(text)
  } catch {
    throw new BoardImportError("That file is not valid JSON.")
  }

  if (!isRecord(payload)) {
    throw new BoardImportError("That file does not contain a board.")
  }

  const candidate = isRecord(payload.board) ? payload.board : payload

  if (candidate.schemaVersion !== undefined && candidate.schemaVersion !== 1) {
    throw new BoardImportError("That board was made with an unsupported version of Kanvas.")
  }

  if (
    candidate.title === undefined &&
    candidate.nodes === undefined &&
    candidate.strokes === undefined
  ) {
    throw new BoardImportError("That file does not look like a Kanvas board.")
  }

  const now = Date.now()
  const title =
    typeof candidate.title === "string" && candidate.title.trim()
      ? candidate.title.trim().slice(0, 120)
      : "Imported board"

  return {
    schemaVersion: 1,
    id: createId("board"),
    title,
    templateId: normalizeTemplate(candidate.templateId),
    createdAt: asTimestamp(candidate.createdAt, now),
    updatedAt: now,
    viewport: normalizeViewport(candidate.viewport),
    nodes: Array.isArray(candidate.nodes) ? candidate.nodes.filter(isKanvasNode) : [],
    edges: Array.isArray(candidate.edges) ? candidate.edges.filter(isKanvasEdge) : [],
    strokes: Array.isArray(candidate.strokes) ? candidate.strokes.filter(isStroke) : [],
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function isPoint(value: unknown): value is { x: number; y: number } {
  return isRecord(value) && isFiniteNumber(value.x) && isFiniteNumber(value.y)
}

function isSize(value: unknown): value is { width: number; height: number } {
  return isRecord(value) && isFiniteNumber(value.width) && isFiniteNumber(value.height)
}

function isNodeStyle(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.fill === "string" &&
    typeof value.stroke === "string" &&
    typeof value.text === "string"
  )
}

function isKanvasNode(value: unknown): value is KanvasNode {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.type === "string" &&
    NODE_TYPES.has(value.type) &&
    isPoint(value.position) &&
    isSize(value.size) &&
    isRecord(value.data) &&
    isNodeStyle(value.style)
  )
}

function isKanvasEdge(value: unknown): value is KanvasEdge {
  if (!isRecord(value)) return false
  if (typeof value.id !== "string") return false
  if (typeof value.source !== "string") return false
  if (typeof value.target !== "string") return false
  if (value.type !== undefined && !EDGE_TYPES.has(value.type as EdgeType)) return false
  return true
}

function isStroke(value: unknown): value is Stroke {
  if (!isRecord(value)) return false
  if (typeof value.id !== "string") return false
  if (!STROKE_TOOLS.has(value.tool as StrokeTool)) return false
  if (typeof value.color !== "string") return false
  if (!isFiniteNumber(value.size)) return false
  if (!Array.isArray(value.points) || value.points.length === 0) return false

  return value.points.every(
    (point) => Array.isArray(point) && isFiniteNumber(point[0]) && isFiniteNumber(point[1]),
  )
}

function normalizeTemplate(value: unknown): TemplateId {
  return TEMPLATE_IDS.includes(value as TemplateId) ? (value as TemplateId) : "blank"
}

function normalizeViewport(value: unknown): Viewport {
  if (!isRecord(value)) return { x: 0, y: 0, zoom: 1 }

  return {
    x: isFiniteNumber(value.x) ? value.x : 0,
    y: isFiniteNumber(value.y) ? value.y : 0,
    zoom: isFiniteNumber(value.zoom) ? Math.min(4, Math.max(0.1, value.zoom)) : 1,
  }
}

function asTimestamp(value: unknown, fallback: number): number {
  return isFiniteNumber(value) && value > 0 ? value : fallback
}
