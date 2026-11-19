import { CalendarDays, Lightbulb, ListChecks, Repeat2, type LucideIcon } from "lucide-react"

import type { TemplateId } from "@/types/board"

export type BoardTemplate = {
  id: Exclude<TemplateId, "blank">
  name: string
  boardTitle: string
  description: string
  icon: LucideIcon
  tint: string
  swatch: string
  bar: string
}

export const TEMPLATES: BoardTemplate[] = [
  {
    id: "brainstorm",
    name: "Brainstorm",
    boardTitle: "Brainstorm",
    description: "Dump every idea first. Sort the keepers after.",
    icon: Lightbulb,
    tint: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300",
    swatch: "bg-amber-200",
    bar: "bg-amber-400",
  },
  {
    id: "project",
    name: "Project plan",
    boardTitle: "Project plan",
    description: "Break the work down, set owners, ship it.",
    icon: ListChecks,
    tint: "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300",
    swatch: "bg-sky-200",
    bar: "bg-sky-400",
  },
  {
    id: "weekly",
    name: "Weekly plan",
    boardTitle: "Weekly plan",
    description: "Map the week before the week maps you.",
    icon: CalendarDays,
    tint: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",
    swatch: "bg-emerald-200",
    bar: "bg-emerald-400",
  },
  {
    id: "retro",
    name: "Retrospective",
    boardTitle: "Retro",
    description: "What worked, what didn't, what comes next.",
    icon: Repeat2,
    tint: "bg-rose-100 text-rose-800 dark:bg-rose-400/15 dark:text-rose-300",
    swatch: "bg-rose-200",
    bar: "bg-rose-400",
  },
]

export function getTemplate(id: TemplateId): BoardTemplate | undefined {
  return TEMPLATES.find((template) => template.id === id)
}
