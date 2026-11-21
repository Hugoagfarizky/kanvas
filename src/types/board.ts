export type TemplateId = "blank" | "brainstorm" | "project" | "weekly" | "retro"

export type Tool =
  | "select"
  | "hand"
  | "note"
  | "text"
  | "task"
  | "shape"
  | "pen"
  | "highlighter"
  | "eraser"
  | "image"
  | "frame"
  | "connect"

export type Point = { x: number; y: number }
export type Size = { width: number; height: number }
export type Viewport = Point & { zoom: number }

export type NodeType = "note" | "text" | "task" | "shape" | "frame" | "image"

export type NodeStyle = {
  fill: string
  stroke: string
  text: string
  fontSize?: number
}

export type NoteData = { text: string; tag?: string }
export type TextData = { text: string }
export type TaskItem = { id: string; text: string; done: boolean }
export type TaskData = { title: string; items: TaskItem[] }
export type ShapeData = { kind: "rect" | "round-rect" | "pill" | "ellipse" | "diamond"; text?: string }
export type FrameData = { title: string }
export type ImageData = { src: string; alt?: string; fit?: "contain" | "cover" }

type NodeBase<TType extends NodeType, TData> = {
  id: string
  type: TType
  position: Point
  size: Size
  rotation?: number
  style: NodeStyle
  parentId?: string
  data: TData
}

export type KanvasNode =
  | NodeBase<"note", NoteData>
  | NodeBase<"text", TextData>
  | NodeBase<"task", TaskData>
  | NodeBase<"shape", ShapeData>
  | NodeBase<"frame", FrameData>
  | NodeBase<"image", ImageData>

export type EdgeType = "bezier" | "straight" | "step"

export type KanvasEdge = {
  id: string
  source: string
  target: string
  label?: string
  type?: EdgeType
  color?: string
}

export type StrokeTool = "pen" | "highlighter" | "eraser"

export type Stroke = {
  id: string
  tool: StrokeTool
  /** [x, y, pressure] in canvas (flow) coordinates. */
  points: [number, number, number][]
  color: string
  size: number
}

export type Board = {
  schemaVersion: 1
  id: string
  title: string
  templateId: TemplateId
  createdAt: number
  updatedAt: number
  viewport: Viewport
  nodes: KanvasNode[]
  edges: KanvasEdge[]
  strokes: Stroke[]
}
