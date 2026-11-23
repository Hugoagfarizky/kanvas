import { describe, expect, it } from "vitest"

import {
  getOptimalMutedColor,
  getOptimalTextColor,
  getRelativeLuminance,
  isLightColor,
  parseColor,
} from "@/lib/color"

describe("parseColor", () => {
  it("parses hex colors", () => {
    expect(parseColor("#fff")).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(parseColor("#000000")).toEqual({ r: 0, g: 0, b: 0, a: 1 })
    expect(parseColor("#ff000080")).toEqual({ r: 255, g: 0, b: 0, a: 128 / 255 })
  })

  it("returns null for invalid/transparent input", () => {
    expect(parseColor("")).toBeNull()
    expect(parseColor("transparent")).toBeNull()
    expect(parseColor("#12")).toBeNull()
  })
})

describe("luminance and contrast", () => {
  it("treats white as light and black as dark", () => {
    expect(isLightColor("#ffffff")).toBe(true)
    expect(isLightColor("#000000")).toBe(false)
  })

  it("relative luminance is 1 for white", () => {
    expect(getRelativeLuminance("#ffffff")).toBeCloseTo(1, 5)
    expect(getRelativeLuminance("#000000")).toBeCloseTo(0, 5)
  })

  it("picks dark text on light backgrounds", () => {
    expect(getOptimalTextColor("#ffffff")).toBe("#0f172a")
    expect(getOptimalTextColor("#000000")).toBe("#f8fafc")
  })

  it("muted color adapts to background", () => {
    expect(getOptimalMutedColor("#ffffff")).toBe("#64748b")
    expect(getOptimalMutedColor("#000000")).toBe("#94a3b8")
  })
})
