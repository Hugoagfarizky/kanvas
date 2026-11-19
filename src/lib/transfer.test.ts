import { describe, expect, it } from "vitest"

import { BoardImportError, boardFileName, parseBoardFile, serializeBoard } from "@/lib/transfer"
import type { Board } from "@/types/board"

const BOARD: Board = {
  schemaVersion: 1,
  id: "board_original",
  title: "Q4 Launch / Plan",
  templateId: "project",
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_100_000,
  viewport: { x: 12, y: -8, zoom: 1.5 },
  nodes: [],
  edges: [],
  strokes: [],
}

describe("board export", () => {
  it("wraps the board in a versioned envelope", () => {
    const parsed = JSON.parse(serializeBoard(BOARD))

    expect(parsed.app).toBe("kanvas")
    expect(parsed.fileVersion).toBe(1)
    expect(parsed.board.id).toBe(BOARD.id)
    expect(typeof parsed.exportedAt).toBe("string")
  })

  it("builds a readable file name", () => {
    expect(boardFileName(BOARD)).toBe("q4-launch-plan.kanvas.json")
    expect(boardFileName({ ...BOARD, title: "  " })).toBe("board.kanvas.json")
  })
})

describe("board import", () => {
  it("round-trips an exported board with a fresh id", () => {
    const imported = parseBoardFile(serializeBoard(BOARD))

    expect(imported.id).not.toBe(BOARD.id)
    expect(imported.id).toMatch(/^board_/)
    expect(imported.title).toBe(BOARD.title)
    expect(imported.templateId).toBe("project")
    expect(imported.viewport).toEqual(BOARD.viewport)
    expect(imported.createdAt).toBe(BOARD.createdAt)
    expect(imported.nodes).toEqual([])
  })

  it("accepts a raw board object", () => {
    const imported = parseBoardFile(JSON.stringify(BOARD))
    expect(imported.title).toBe(BOARD.title)
  })

  it("rejects invalid JSON", () => {
    expect(() => parseBoardFile("{nope")).toThrow(BoardImportError)
  })

  it("rejects unrelated JSON", () => {
    expect(() => parseBoardFile(JSON.stringify({ hello: "world" }))).toThrow(BoardImportError)
  })

  it("rejects unsupported schema versions", () => {
    expect(() => parseBoardFile(JSON.stringify({ ...BOARD, schemaVersion: 2 }))).toThrow(
      /unsupported version/i,
    )
  })

  it("falls back to safe defaults for odd values", () => {
    const imported = parseBoardFile(
      JSON.stringify({
        nodes: [],
        title: "   ",
        viewport: { x: "nope", y: 4, zoom: 99 },
        templateId: "unknown",
      }),
    )

    expect(imported.title).toBe("Imported board")
    expect(imported.templateId).toBe("blank")
    expect(imported.viewport).toEqual({ x: 0, y: 4, zoom: 4 })
  })

  it("drops invalid nodes, edges and strokes instead of crashing", () => {
    const imported = parseBoardFile(
      JSON.stringify({
        ...BOARD,
        nodes: [
          {
            id: "node_1",
            type: "note",
            position: { x: 0, y: 0 },
            size: { width: 120, height: 120 },
            data: { text: "Hello" },
            style: { fill: "#fff", stroke: "#000", text: "#000" },
          },
          { id: "node_bad", type: "spaceship" },
          "not a node",
        ],
        edges: [{ id: "edge_1", source: "node_1", target: "node_1" }, { id: "edge_bad" }],
        strokes: [
          {
            id: "stroke_1",
            tool: "pen",
            points: [
              [0, 0, 0.5],
              [4, 4, 0.6],
            ],
            color: "#111",
            size: 3,
          },
          { id: "stroke_bad", tool: "laser", points: [] },
        ],
      }),
    )

    expect(imported.nodes).toHaveLength(1)
    expect(imported.edges).toHaveLength(1)
    expect(imported.strokes).toHaveLength(1)
  })
})
