import { createContext, useContext } from "react"

export type ToastTone = "default" | "success" | "error"

export type ToastAction = {
  label: string
  onClick: () => void
}

export type ToastOptions = {
  title: string
  description?: string
  tone?: ToastTone
  /** Milliseconds before auto-dismiss. Use 0 to keep it until dismissed. */
  duration?: number
  action?: ToastAction
}

export type ToastItem = ToastOptions & { id: string }

export type ToastContextValue = {
  toast: (options: ToastOptions) => string
  dismiss: (id: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used inside <ToastProvider>")
  }

  return context
}
