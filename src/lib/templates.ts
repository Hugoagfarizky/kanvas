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

const NOTE_STYLE_BUTTER: NodeStyle = { fill: "#fef9c3", stroke: "#fde047", text: "#713f12", fontSize: 14 }
const NOTE_STYLE_LILAC: NodeStyle = { fill: "#f3e8ff", stroke: "#d8b4fe", text: "#581c87", fontSize: 14 }
const NOTE_STYLE_MINT: NodeStyle = { fill: "#ecfdf5", stroke: "#a7f3d0", text: "#065f46", fontSize: 14 }
const NOTE_STYLE_SKY: NodeStyle = { fill: "#f0f9ff", stroke: "#bae6fd", text: "#0369a1", fontSize: 14 }

const FRAME_STYLE: NodeStyle = {
  fill: "rgba(148,163,184,0.06)",
  stroke: "#94a3b8",
  text: "var(--foreground)",
  fontSize: 12,
}
const TASK_STYLE: NodeStyle = { fill: "#ffffff", stroke: "#e2e8f0", text: "#0f172a", fontSize: 13 }

function note(
  id: string,
  text: string,
  x: number,
  y: number,
  w = 220,
  h = 140,
  style = NOTE_STYLE_BUTTER,
  tag = "Note 📌",
): KanvasNode {
  return {
    id,
    type: "note",
    position: { x, y },
    size: { width: w, height: h },
    style,
    data: { text, tag },
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
  w = 260,
  h = 190,
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
        frame(nid(), "Ideas", -280, -200, 580, 380),
        note(nid(), "Interactive visual learning cards", -240, -140, 220, 140, NOTE_STYLE_LILAC, "Idea 💡"),
        note(nid(), "Instant contrast & pastel palettes", -240, 40, 220, 140, NOTE_STYLE_MINT, "Plan 🎯"),
        note(nid(), "Offline-first IndexedDB persistence", 20, -140, 220, 140, NOTE_STYLE_BUTTER, "Note 📌"),
        note(nid(), "Bento style dashboard & floating dock", 20, 40, 220, 140, NOTE_STYLE_SKY, "Urgent ⭐"),
      ]
    case "project":
      return [
        frame(nid(), "Now", -320, -200, 300, 340),
        frame(nid(), "Next", 20, -200, 300, 340),
        frame(nid(), "Later", 360, -200, 300, 340),
        task(
          nid(),
          "Sprint Goals",
          [
            { id: createId("task_item"), text: "Design Bento Dock", done: true },
            { id: createId("task_item"), text: "Viewport & Zoom controls", done: true },
            { id: createId("task_item"), text: "WCAG contrast verification", done: false },
          ],
          -300,
          -140,
          260,
          190,
        ),
      ]
    case "weekly":
      return [
        frame(nid(), "Monday", -320, -180, 250, 240),
        frame(nid(), "Wednesday", -50, -180, 250, 240),
        frame(nid(), "Friday", 220, -180, 250, 240),
        note(nid(), "Weekly kick-off & goals", -300, -120, 210, 130, NOTE_STYLE_BUTTER, "Plan 🎯"),
        note(nid(), "Mid-week prototype review", -30, -120, 210, 130, NOTE_STYLE_LILAC, "Task 📋"),
        note(nid(), "Ship release & demo", 240, -120, 210, 130, NOTE_STYLE_MINT, "Urgent ⭐"),
      ]
    case "retro":
      return [
        frame(nid(), "Went well 🌿", -320, -180, 280, 280),
        frame(nid(), "To improve ⚠️", -20, -180, 280, 280),
        frame(nid(), "Action items 🎯", 280, -180, 280, 280),
        note(nid(), "Fast releases & bento docks", -290, -120, 220, 120, NOTE_STYLE_MINT, "Idea 💡"),
        note(nid(), "Ensure all contrast is AA compliant", 10, -120, 220, 120, NOTE_STYLE_BUTTER, "Task 📋"),
        note(nid(), "Write docs with visual guide", 310, -120, 220, 120, NOTE_STYLE_SKY, "Plan 🎯"),
      ]
    default:
      return []
  }
}
