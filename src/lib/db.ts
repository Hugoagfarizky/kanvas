import { createStore, get, set } from "idb-keyval"

import { createId } from "@/lib/id"
import type { Board, TemplateId } from "@/types/board"

const boardsStore = createStore("kanvas", "boards")
const BOARDS_KEY = "boards"

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

export async function listBoards(): Promise<Board[]> {
  const boards = (await get<Board[]>(BOARDS_KEY, boardsStore)) ?? []
  return sortBoards(boards)
}

export async function getBoardById(id: string): Promise<Board | undefined> {
  const boards = (await get<Board[]>(BOARDS_KEY, boardsStore)) ?? []
  return boards.find((board) => board.id === id)
}

export async function saveBoard(board: Board): Promise<void> {
  const boards = (await get<Board[]>(BOARDS_KEY, boardsStore)) ?? []
  const index = boards.findIndex((item) => item.id === board.id)

  if (index === -1) {
    boards.push(board)
  } else {
    boards[index] = board
  }

  await set(BOARDS_KEY, boards, boardsStore)
}

export async function deleteBoardById(id: string): Promise<void> {
  const boards = (await get<Board[]>(BOARDS_KEY, boardsStore)) ?? []
  await set(
    BOARDS_KEY,
    boards.filter((board) => board.id !== id),
    boardsStore,
  )
}

export function createBoardRecord(input: { title: string; templateId?: TemplateId }): Board {
  const now = Date.now()

  return {
    ...emptyBoardState(),
    id: createId("board"),
    title: input.title.trim() || "Untitled board",
    templateId: input.templateId ?? "blank",
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
