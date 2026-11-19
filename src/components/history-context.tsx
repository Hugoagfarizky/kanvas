import { createContext, useContext } from "react"

export type HistoryContextValue = { push: () => void }

export const HistoryContext = createContext<HistoryContextValue | null>(null)

export function useHistoryPush(): (() => void) | undefined {
  return useContext(HistoryContext)?.push
}
