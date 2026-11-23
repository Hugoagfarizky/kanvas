import { createStore, del, get, set } from "idb-keyval"

import { createId } from "@/lib/id"
import {
  seedCardiologyDynamics,
  seedDeiLearningPlan,
  seedEdgesForTemplate,
  seedNodesForTemplate,
  seedUXFlowArchitecture,
} from "@/lib/templates"
import type { Board, KanvasEdge, KanvasNode, TemplateId } from "@/types/board"

const boardsStore = createStore("kanvas", "boards")
const BOARDS_KEY = "boards"
const INDEX_KEY = "index"

const syncChannel =
  typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("kanvas-sync") : null

function broadcastChange(message: { type: string; id?: string }) {
  syncChannel?.postMessage(message)
}

export function subscribeToBoardChanges(listener: (message: { type: string; id?: string }) => void): () => void {
  if (!syncChannel) return () => {}
  const handler = (event: MessageEvent) => listener(event.data)
  syncChannel.addEventListener("message", handler)
  return () => syncChannel.removeEventListener("message", handler)
}

function boardKey(id: string): string {
  return `board:${id}`
}

function emptyBoardState() {
  return {
    schemaVersion: 1 as const,
    viewport: { x: 0, y: 0, zoom: 1 },
    nodes: [],
    edges: [],
    strokes: [],
  }
}

export function sortBoards(boards: Board[]): Board[] {
  return [...boards].sort((a, b) => b.updatedAt - a.updatedAt)
}

async function migrateLegacyBoards(): Promise<void> {
  const legacy = await get<Board[]>(BOARDS_KEY, boardsStore)
  if (!legacy || legacy.length === 0) return

  const existingIndex = await get<string[]>(INDEX_KEY, boardsStore)
  if (existingIndex && existingIndex.length > 0) {
    // Already migrated; drop the legacy array to free space.
    await del(BOARDS_KEY, boardsStore)
    return
  }

  const ids: string[] = []
  for (const board of legacy) {
    await set(boardKey(board.id), board, boardsStore)
    ids.push(board.id)
  }
  await set(INDEX_KEY, ids, boardsStore)
  await del(BOARDS_KEY, boardsStore)
}

export async function listBoards(): Promise<Board[]> {
  await migrateLegacyBoards()
  const ids = (await get<string[]>(INDEX_KEY, boardsStore)) ?? []
  const boards = await Promise.all(
    ids.map(async (id) => (await get<Board>(boardKey(id), boardsStore)) ?? undefined),
  )
  return sortBoards(boards.filter((board): board is Board => Boolean(board)))
}

export async function getBoardById(id: string): Promise<Board | undefined> {
  await migrateLegacyBoards()
  const board = await get<Board>(boardKey(id), boardsStore)
  if (board) return board

  // Fallback for any board that exists in the legacy array but not yet migrated.
  const legacy = await get<Board[]>(BOARDS_KEY, boardsStore)
  return legacy?.find((item) => item.id === id)
}

export async function saveBoard(board: Board): Promise<void> {
  await migrateLegacyBoards()
  await set(boardKey(board.id), board, boardsStore)

  const ids = (await get<string[]>(INDEX_KEY, boardsStore)) ?? []
  if (!ids.includes(board.id)) {
    ids.push(board.id)
    await set(INDEX_KEY, ids, boardsStore)
  }
  broadcastChange({ type: "board-saved", id: board.id })
}

export async function deleteBoardById(id: string): Promise<void> {
  await migrateLegacyBoards()
  await del(boardKey(id), boardsStore)
  const ids = ((await get<string[]>(INDEX_KEY, boardsStore)) ?? []).filter(
    (item) => item !== id,
  )
  await set(INDEX_KEY, ids, boardsStore)
  broadcastChange({ type: "board-deleted", id })
}

export function createBoardRecord(input: { title: string; templateId?: TemplateId }): Board {
  const now = Date.now()
  const templateId = input.templateId ?? "blank"
  let initialNodes: KanvasNode[] = []
  let initialEdges: KanvasEdge[] = []

  if (templateId === "dei") {
    const dei = seedDeiLearningPlan()
    initialNodes = dei.nodes
    initialEdges = dei.edges
  } else if (templateId === "cardiology") {
    const cardio = seedCardiologyDynamics()
    initialNodes = cardio.nodes
    initialEdges = cardio.edges
  } else if (templateId === "uxflow") {
    const ux = seedUXFlowArchitecture()
    initialNodes = ux.nodes
    initialEdges = ux.edges
  } else if (templateId !== "blank") {
    initialNodes = seedNodesForTemplate(templateId)
    initialEdges = seedEdgesForTemplate(templateId)
  }

  return {
    ...emptyBoardState(),
    id: createId("board"),
    title: input.title.trim() || (templateId === "blank" ? "Untitled board" : `${templateId} board`),
    templateId,
    nodes: initialNodes,
    edges: initialEdges,
    createdAt: now,
    updatedAt: now,
  }
}

export async function createBoard(input: {
  title: string
  templateId?: TemplateId
}): Promise<Board> {
  const board = createBoardRecord(input)
  await saveBoard(board)
  return board
}

export async function duplicateBoard(board: Board): Promise<Board> {
  const now = Date.now()
  const title = `${board.title} (copy)`

  const copy: Board = {
    ...structuredClone(board),
    id: createId("board"),
    title: title.slice(0, 120),
    createdAt: now,
    updatedAt: now,
  }

  await saveBoard(copy)
  return copy
}
