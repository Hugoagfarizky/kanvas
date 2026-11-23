import { describe, expect, it } from "vitest"

import { createBoardRecord, sortBoards } from "@/lib/db"
import type { Board } from "@/types/board"

describe("sortBoards", () => {
  it("sorts by updatedAt descending", () => {
    const boards: Board[] = [
      { id: "a", title: "A", templateId: "blank", createdAt: 1, updatedAt: 10, viewport: { x: 0, y: 0, zoom: 1 }, nodes: [], edges: [], strokes: [] },
      { id: "b", title: "B", templateId: "blank", createdAt: 2, updatedAt: 20, viewport: { x: 0, y: 0, zoom: 1 }, nodes: [], edges: [], strokes: [] },
    ]
    expect(sortBoards(boards).map((b) => b.id)).toEqual(["b", "a"])
  })
})

describe("createBoardRecord", () => {
  it("creates a blank board with defaults", () => {
    const board = createBoardRecord({ title: "  My board  " })
    expect(board.title).toBe("My board")
    expect(board.templateId).toBe("blank")
    expect(board.nodes).toEqual([])
    expect(board.id).toMatch(/^board_/)
  })

  it("seeds nodes for the dei template", () => {
    const board = createBoardRecord({ title: "Plan", templateId: "dei" })
    expect(board.templateId).toBe("dei")
    expect(board.nodes.length).toBeGreaterThan(0)
  })
})
