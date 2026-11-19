import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"

import { THEME_STORAGE_KEY, ThemeContext, type Theme } from "@/lib/theme"

const THEME_COLORS: Record<Theme, string> = {
  light: "#f7f5ef",
  dark: "#22242e",
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light"

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === "light" || stored === "dark") return stored
  } catch {
    // Storage can be unavailable in private mode; fall through to the OS preference.
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", theme === "dark")
    root.style.colorScheme = theme

    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme])

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // The theme still works for this session without persistence.
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"))
  }, [])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
