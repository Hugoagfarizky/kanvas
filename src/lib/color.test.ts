import { describe, expect, it } from "vitest"
import { getOptimalMutedColor, getOptimalTextColor, isLightColor, parseColor } from "./color"

describe("color utils", () => {
  it("parses hex colors correctly", () => {
    expect(parseColor("#ffffff")).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(parseColor("#000000")).toEqual({ r: 0, g: 0, b: 0, a: 1 })
    expect(parseColor("#123456")).toEqual({ r: 18, g: 52, b: 86, a: 1 })
  })

  it("determines light vs dark colors", () => {
    expect(isLightColor("#ffffff")).toBe(true)
    expect(isLightColor("#fef08a")).toBe(true) // Yellow note
    expect(isLightColor("#0f172a")).toBe(false) // Dark slate
    expect(isLightColor("#000000")).toBe(false)
  })

  it("selects high-contrast text color", () => {
    // Light backgrounds should get dark text
    expect(getOptimalTextColor("#ffffff", false)).toBe("#0f172a")
    expect(getOptimalTextColor("#fef08a", false)).toBe("#0f172a")

    // Dark backgrounds should get light text
    expect(getOptimalTextColor("#0f172a", false)).toBe("#f8fafc")
    expect(getOptimalTextColor("#1e293b", false)).toBe("#f8fafc")

    // Transparent adapts to theme
    expect(getOptimalTextColor("transparent", false)).toBe("#0f172a")
    expect(getOptimalTextColor("transparent", true)).toBe("#f8fafc")
  })

  it("selects optimal secondary muted color", () => {
    expect(getOptimalMutedColor("#ffffff", false)).toBe("#64748b")
    expect(getOptimalMutedColor("#1e293b", false)).toBe("#94a3b8")
  })
})
