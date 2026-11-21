import { describe, expect, it } from "vitest"
import { createBoardRecord } from "@/lib/db"
import { seedEdgesForTemplate, seedNodesForTemplate } from "@/lib/templates"

describe("Template & Blank Board Creation", () => {
  it("creates a truly empty canvas when templateId is blank", () => {
    const board = createBoardRecord({ title: "Blank Canvas", templateId: "blank" })
    expect(board.nodes).toEqual([])
    expect(board.edges).toEqual([])
    expect(board.templateId).toBe("blank")
  })

  it("defaults to a blank canvas with 0 nodes and 0 edges when templateId is omitted", () => {
    const board = createBoardRecord({ title: "Untitled board" })
    expect(board.nodes).toEqual([])
    expect(board.edges).toEqual([])
    expect(board.templateId).toBe("blank")
  })

  it("seeds Dei learning plan when templateId is dei", () => {
    const board = createBoardRecord({ title: "Dei Plan", templateId: "dei" })
    expect(board.nodes.length).toBeGreaterThan(0)
    expect(board.edges.length).toBeGreaterThan(0)
  })

  it("seeds Cardiology dynamics when templateId is cardiology", () => {
    const board = createBoardRecord({ title: "Cardiology", templateId: "cardiology" })
    expect(board.nodes.length).toBeGreaterThan(0)
    expect(board.edges.length).toBeGreaterThan(0)
  })

  it("seeds UX Flow architecture when templateId is uxflow", () => {
    const board = createBoardRecord({ title: "UX Flow", templateId: "uxflow" })
    expect(board.nodes.length).toBeGreaterThan(0)
    expect(board.edges.length).toBeGreaterThan(0)
  })

  it("returns empty arrays for seedNodesForTemplate and seedEdgesForTemplate with blank", () => {
    expect(seedNodesForTemplate("blank")).toEqual([])
    expect(seedEdgesForTemplate("blank")).toEqual([])
  })
})
