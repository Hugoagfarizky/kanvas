import { describe, expect, it } from "vitest"

import { createId } from "@/lib/id"

describe("createId", () => {
  it("keeps the provided prefix", () => {
    expect(createId("board")).toMatch(/^board_/)
  })

  it("generates unique values", () => {
    const ids = new Set(Array.from({ length: 500 }, () => createId("node")))
    expect(ids.size).toBe(500)
  })
})
