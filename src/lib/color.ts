/**
 * Color and contrast utilities adhering to WCAG 2.1 standards.
 */

export type Rgb = { r: number; g: number; b: number; a: number }

export function parseColor(color: string): Rgb | null {
  if (!color || color === "transparent") return null
  const s = color.trim()

  // Hex: #rgb, #rgba, #rrggbb, #rrggbbaa
  if (s.startsWith("#")) {
    const hex = s.slice(1)
    if (hex.length === 3 || hex.length === 4) {
      const r = parseInt(hex[0] + hex[0], 16)
      const g = parseInt(hex[1] + hex[1], 16)
      const b = parseInt(hex[2] + hex[2], 16)
      const a = hex.length === 4 ? parseInt(hex[3] + hex[3], 16) / 255 : 1
      return { r, g, b, a }
    }
    if (hex.length === 6 || hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1
      return { r, g, b, a }
    }
    return null
  }

  // rgb / rgba
  const rgbaMatch = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i)
  if (rgbaMatch) {
    const r = Math.min(255, Math.max(0, parseFloat(rgbaMatch[1])))
    const g = Math.min(255, Math.max(0, parseFloat(rgbaMatch[2])))
    const b = Math.min(255, Math.max(0, parseFloat(rgbaMatch[3])))
    const a = rgbaMatch[4] !== undefined ? Math.min(1, Math.max(0, parseFloat(rgbaMatch[4]))) : 1
    return { r, g, b, a }
  }

  // Named colors
  const named: Record<string, string> = {
    white: "#ffffff",
    black: "#000000",
    red: "#ef4444",
    blue: "#3b82f6",
    green: "#10b981",
    yellow: "#facc15",
  }
  if (named[s.toLowerCase()]) {
    return parseColor(named[s.toLowerCase()])
  }

  return null
}

/**
 * Calculates WCAG relative luminance (0 to 1).
 */
export function getRelativeLuminance(color: string): number {
  const rgb = parseColor(color)
  if (!rgb || rgb.a < 0.25) return 0.5 // Default neutral for transparent/subtle

  const srgb = [rgb.r / 255, rgb.g / 255, rgb.b / 255]
  const [r, g, b] = srgb.map((val) =>
    val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4),
  )

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Checks if a color is considered light or dark.
 */
export function isLightColor(color: string): boolean {
  const rgb = parseColor(color)
  if (!rgb || rgb.a < 0.3) return true // Treat transparent as light by default
  return getRelativeLuminance(color) >= 0.38
}

/**
 * Returns high-contrast text color against the specified background.
 */
export function getOptimalTextColor(
  bgColor: string,
  isDarkMode = false,
  darkText = "#0f172a",
  lightText = "#f8fafc",
): string {
  const rgb = parseColor(bgColor)
  if (!rgb || rgb.a < 0.25) {
    // Transparent or translucent: adapt to current theme
    return isDarkMode ? lightText : darkText
  }

  return isLightColor(bgColor) ? darkText : lightText
}

/**
 * Returns high-contrast secondary (muted) text color.
 */
export function getOptimalMutedColor(bgColor: string, isDarkMode = false): string {
  const rgb = parseColor(bgColor)
  if (!rgb || rgb.a < 0.25) {
    return isDarkMode ? "#94a3b8" : "#64748b"
  }
  return isLightColor(bgColor) ? "#64748b" : "#94a3b8"
}

// Preset color palettes
export const NOTE_PALETTES = [
  { name: "Yellow", fill: "#fef08a", stroke: "#eab308", text: "#1e293b" },
  { name: "Blue", fill: "#bae6fd", stroke: "#38bdf8", text: "#0f172a" },
  { name: "Green", fill: "#bbf7d0", stroke: "#4ade80", text: "#064e3b" },
  { name: "Rose", fill: "#fbcfe8", stroke: "#f472b6", text: "#831843" },
  { name: "Purple", fill: "#e9d5ff", stroke: "#c084fc", text: "#581c87" },
  { name: "Orange", fill: "#fed7aa", stroke: "#fb923c", text: "#7c2d12" },
  { name: "White", fill: "#ffffff", stroke: "#cbd5e1", text: "#0f172a" },
  { name: "Dark", fill: "#1e293b", stroke: "#475569", text: "#f8fafc" },
]

export const SHAPE_PALETTES = [
  { name: "Sky", fill: "#dbeafe", stroke: "#3b82f6", text: "#1e293b" },
  { name: "Emerald", fill: "#d1fae5", stroke: "#10b981", text: "#064e3b" },
  { name: "Amber", fill: "#fef3c7", stroke: "#f59e0b", text: "#78350f" },
  { name: "Purple", fill: "#f3e8ff", stroke: "#a855f7", text: "#581c87" },
  { name: "Rose", fill: "#ffe4e6", stroke: "#f43f5e", text: "#881337" },
  { name: "White", fill: "#ffffff", stroke: "#cbd5e1", text: "#0f172a" },
  { name: "Dark", fill: "#1e293b", stroke: "#475569", text: "#f8fafc" },
  { name: "Clear", fill: "transparent", stroke: "#94a3b8", text: "var(--foreground)" },
]

export const PEN_COLORS = [
  { name: "Auto", light: "#0f172a", dark: "#f8fafc" },
  { name: "Slate", color: "#475569" },
  { name: "Blue", color: "#2563eb" },
  { name: "Emerald", color: "#059669" },
  { name: "Amber", color: "#d97706" },
  { name: "Rose", color: "#e11d48" },
  { name: "Purple", color: "#7c3aed" },
]

export const HIGHLIGHTER_COLORS = [
  { name: "Yellow", color: "#facc15" },
  { name: "Green", color: "#4ade80" },
  { name: "Cyan", color: "#38bdf8" },
  { name: "Pink", color: "#f472b6" },
  { name: "Orange", color: "#fb923c" },
]
