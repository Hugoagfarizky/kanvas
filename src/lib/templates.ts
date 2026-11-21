import { CalendarDays, Lightbulb, ListChecks, Repeat2, type LucideIcon } from "lucide-react"

import { createId } from "@/lib/id"
import type { KanvasNode, NodeStyle, TemplateId } from "@/types/board"

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

const NOTE_STYLE: NodeStyle = { fill: "#fef08a", stroke: "#eab308", text: "#1e293b", fontSize: 14 }
const FRAME_STYLE: NodeStyle = {
  fill: "rgba(148,163,184,0.08)",
  stroke: "#94a3b8",
  text: "var(--foreground)",
  fontSize: 12,
}
const TASK_STYLE: NodeStyle = { fill: "#ffffff", stroke: "#cbd5e1", text: "#0f172a", fontSize: 13 }

function note(id: string, text: string, x: number, y: number, w = 200, h = 120): KanvasNode {
  return {
    id,
    type: "note",
    position: { x, y },
    size: { width: w, height: h },
    style: NOTE_STYLE,
    data: { text },
  }
}

function frame(id: string, title: string, x: number, y: number, w = 360, h = 260): KanvasNode {
  return {
    id,
    type: "frame",
    position: { x, y },
    size: { width: w, height: h },
    style: FRAME_STYLE,
    data: { title },
  }
}

function task(
  id: string,
  title: string,
  items: { id: string; text: string; done: boolean }[],
  x: number,
  y: number,
  w = 240,
  h = 180,
): KanvasNode {
  return {
    id,
    type: "task",
    position: { x, y },
    size: { width: w, height: h },
    style: TASK_STYLE,
    data: { title, items },
  }
}

export function seedNodesForTemplate(templateId: TemplateId): KanvasNode[] {
  const nid = () => createId("node")

  switch (templateId) {
    case "brainstorm":
      return [
        frame(nid(), "Ideas", -260, -180, 560, 360),
        note(nid(), "What if users could...", -220, -120),
        note(nid(), "We should try...", -20, -120),
        note(nid(), "Crazy idea:", -220, 40),
        note(nid(), "Keep this one?", 180, -40, 180, 100),
      ]
    case "project":
      return [
        frame(nid(), "Now", -300, -200, 280, 320),
        frame(nid(), "Next", 20, -200, 280, 320),
        frame(nid(), "Later", 340, -200, 280, 320),
        task(
          nid(),
          "Now",
          [
            { id: createId("task_item"), text: "Define scope", done: false },
            { id: createId("task_item"), text: "First prototype", done: false },
          ],
          -280,
          -150,
          240,
          140,
        ),
      ]
    case "weekly":
      return [
        frame(nid(), "Monday", -300, -180, 220, 200),
        frame(nid(), "Wednesday", -60, -180, 220, 200),
        frame(nid(), "Friday", 180, -180, 220, 200),
        task(
          nid(),
          "This week",
          [
            { id: createId("task_item"), text: "Top priority", done: false },
            { id: createId("task_item"), text: "Secondary", done: false },
          ],
          -280,
          40,
          220,
          120,
        ),
      ]
    case "retro":
      return [
        frame(nid(), "Went well", -300, -180, 260, 260),
        frame(nid(), "To improve", 0, -180, 260, 260),
        frame(nid(), "Action items", 300, -180, 260, 260),
        note(nid(), "Fast releases", -270, -120, 200, 80),
        note(nid(), "Flaky tests", 30, -120, 200, 80),
      ]
    default:
      return []
  }
}
