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

// Preset color palettes inspired by modern bento/pill canvas UI (Lilac, Mint, Butter, Sky, Peach)
export const NOTE_PALETTES = [
  { name: "Butter", fill: "#fef9c3", stroke: "#fde047", text: "#713f12", tag: "Task 📋" },
  { name: "Lilac", fill: "#f3e8ff", stroke: "#d8b4fe", text: "#581c87", tag: "Idea 💡" },
  { name: "Mint", fill: "#ecfdf5", stroke: "#a7f3d0", text: "#065f46", tag: "Done 🌿" },
  { name: "Sky", fill: "#f0f9ff", stroke: "#bae6fd", text: "#0369a1", tag: "Plan 🎯" },
  { name: "Peach", fill: "#fff1f2", stroke: "#fecdd3", text: "#9f1239", tag: "Note 📌" },
  { name: "Coral", fill: "#ffedd5", stroke: "#fed7aa", text: "#9a3412", tag: "Notice ⚠️" },
  { name: "White", fill: "#ffffff", stroke: "#e2e8f0", text: "#0f172a", tag: "Card 📄" },
  { name: "Dark", fill: "#1e222d", stroke: "#333d4f", text: "#f8fafc", tag: "Dark 🌙" },
]

export const SHAPE_PALETTES = [
  { name: "Sky", fill: "#f0f9ff", stroke: "#38bdf8", text: "#0369a1" },
  { name: "Lilac", fill: "#f3e8ff", stroke: "#c084fc", text: "#581c87" },
  { name: "Mint", fill: "#ecfdf5", stroke: "#34d399", text: "#065f46" },
  { name: "Butter", fill: "#fef9c3", stroke: "#facc15", text: "#713f12" },
  { name: "Peach", fill: "#fff1f2", stroke: "#fb7185", text: "#9f1239" },
  { name: "White", fill: "#ffffff", stroke: "#cbd5e1", text: "#0f172a" },
  { name: "Dark", fill: "#1e222d", stroke: "#475569", text: "#f8fafc" },
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
