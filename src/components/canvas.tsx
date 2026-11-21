import {
  Background,
  BackgroundVariant,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useReactFlow,
  useViewport,
  ViewportPortal,
  type Edge,
  type Node,
  type Viewport,
} from "@xyflow/react"
import { applyEdgeChanges, applyNodeChanges } from "@xyflow/system"
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndVertical,
  AlignHorizontalDistributeCenter,
  AlignLeft,
  AlignRight,
  AlignStartVertical,
  AlignVerticalDistributeCenter,
  Check,
  ChevronDown,
  Circle,
  Copy,
  Diamond,
  Eraser,
  Frame,
  Hand,
  Highlighter,
  Layers,
  ListTodo,
  MapPin,
  Maximize2,
  Minimize2,
  MousePointer2,
  Pencil,
  Redo2,
  RotateCcw,
  Shapes,
  Sparkles,
  Square,
  StickyNote,
  Trash2,
  Type,
  Undo2,
  Upload,
  Waypoints,
  X,
} from "lucide-react"
import { getStroke } from "perfect-freehand"
import { useCallback, useEffect, useRef, useState } from "react"

import "@xyflow/react/dist/style.css"

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { HistoryContext } from "@/components/history-context"
import { nodeTypes } from "@/components/nodes"
import type { KanvasNode, NodeStyle, NodeType, Size } from "@/types/board"
import { createId } from "@/lib/id"
import { useTheme } from "@/lib/theme"
import {
  HIGHLIGHTER_COLORS,
  NOTE_PALETTES,
  PEN_COLORS,
  SHAPE_PALETTES,
  getOptimalTextColor,
} from "@/lib/color"
import { cn } from "@/lib/utils"

type CanvasProps = {
  board: {
    id: string
    viewport: Viewport
    nodes: KanvasNode[]
    edges: {
      id: string
      source: string
      target: string
      label?: string
      type?: string
      color?: string
    }[]
    strokes: any[]
  }
  onViewportChange: (viewport: Viewport) => void
  onPersist: (patch: { nodes: KanvasNode[]; edges: any[]; strokes: any[] }) => void
}

const DEFAULT_SIZES: Record<NodeType, Size> = {
  note: { width: 220, height: 160 },
  text: { width: 220, height: 60 },
  task: { width: 260, height: 200 },
  shape: { width: 160, height: 160 },
  frame: { width: 340, height: 240 },
  image: { width: 280, height: 200 },
}

function getDefaultStyles(theme: "light" | "dark"): Record<NodeType, NodeStyle> {
  const isDark = theme === "dark"
  return {
    note: { fill: "#fef9c3", stroke: "#fde047", text: "#713f12", fontSize: 14 },
    text: {
      fill: "transparent",
      stroke: "transparent",
      text: isDark ? "#f8fafc" : "#0f172a",
      fontSize: 18,
    },
    task: {
      fill: isDark ? "#1e222d" : "#ffffff",
      stroke: isDark ? "#333d4f" : "#e2e8f0",
      text: isDark ? "#f8fafc" : "#0f172a",
      fontSize: 13,
    },
    shape: { fill: "#f0f9ff", stroke: "#38bdf8", text: "#0369a1", fontSize: 14 },
    frame: {
      fill: "rgba(148,163,184,0.08)",
      stroke: isDark ? "#475569" : "#94a3b8",
      text: isDark ? "#e2e8f0" : "#334155",
      fontSize: 12,
    },
    image: {
      fill: isDark ? "#1e222d" : "#ffffff",
      stroke: isDark ? "#334155" : "#e2e8f0",
      text: isDark ? "#94a3b8" : "#64748b",
      fontSize: 12,
    },
  }
}

function defaultNodeData(kind: NodeType): any {
  switch (kind) {
    case "note":
      return { text: "" }
    case "text":
      return { text: "" }
    case "task":
      return { title: "Tasks", items: [] }
    case "shape":
      return { kind: "rect", text: "" }
    case "frame":
      return { title: "Frame" }
    case "image":
      return { src: "", alt: "", fit: "contain" }
  }
}

function toFlowNode(kn: KanvasNode): Node {
  return {
    id: kn.id,
    type: `kanvas-${kn.type}`,
    position: kn.position,
    width: kn.size.width,
    height: kn.size.height,
    style: { width: kn.size.width, height: kn.size.height },
    data: {
      kind: kn.type,
      data: kn.data,
      style: kn.style,
      size: kn.size,
      rotation: kn.rotation,
    },
    selected: false,
  }
}

function toFlowEdge(e: CanvasProps["board"]["edges"][number]): Edge {
  return {
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    type: e.type === "straight" ? "straight" : e.type === "step" ? "step" : "default",
    style: e.color ? { stroke: e.color, strokeWidth: 2 } : { strokeWidth: 2 },
  }
}

function toKanvasNode(fn: Node): KanvasNode {
  const d = (fn.data ?? {}) as any
  return {
    id: fn.id,
    type: d.kind,
    position: { x: fn.position.x, y: fn.position.y },
    size: {
      width: fn.width ?? d.size?.width ?? DEFAULT_SIZES[d.kind as NodeType].width,
      height: fn.height ?? d.size?.height ?? DEFAULT_SIZES[d.kind as NodeType].height,
    },
    rotation: d.rotation,
    style: d.style,
    data: d.data,
  }
}

function toKanvasEdge(fe: Edge): any {
  return {
    id: fe.id,
    source: fe.source,
    target: fe.target,
    label: typeof fe.label === "string" ? fe.label : undefined,
    type: fe.type === "straight" ? "straight" : fe.type === "step" ? "step" : "bezier",
    color: (fe.style as any)?.stroke,
  }
}

function cloneNode(node: Node): Node {
  return {
    ...node,
    data: node.data ? { ...(node.data as any) } : node.data,
    position: { ...node.position },
  }
}

function cloneEdge(edge: Edge): Edge {
  return { ...edge, style: edge.style ? { ...edge.style } : edge.style }
}

function isDrawingTool(tool: string): boolean {
  return tool === "pen" || tool === "highlighter" || tool === "eraser"
}

function distance(a: any, b: any): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1])
}

function splitStroke(stroke: any, point: any, radius: number): any[] {
  const points = stroke.points as any[]
  const keep = points.map((p: any) => distance(p, point) > radius)
  const runs: any[] = []
  let current: any[] = []
  for (let i = 0; i < points.length; i++) {
    if (keep[i]) current.push(points[i])
    else {
      if (current.length >= 2) runs.push({ ...stroke, id: createId("stroke"), points: current })
      current = []
    }
  }
  if (current.length >= 2) runs.push({ ...stroke, id: createId("stroke"), points: current })
  if (runs.length === 0) return [stroke]
  if (runs.length === 1 && runs[0].points.length === points.length) return [stroke]
  return runs
}

function strokeToPath(stroke: any): string {
  const outline = getStroke(stroke.points, {
    size: stroke.size,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  })
  if (!outline.length) return ""
  return `M ${outline.map((p: number[]) => p.join(" ")).join(" L ")} Z`
}

export function BoardCanvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <BoardCanvasInner {...props} />
    </ReactFlowProvider>
  )
}

function BoardCanvasInner({ board, onViewportChange, onPersist }: CanvasProps) {
  const reactFlow = useReactFlow()
  const { theme } = useTheme()
  const { zoom } = useViewport()
  const [showMiniMap, setShowMiniMap] = useState(false)
  const [showZoomMenu, setShowZoomMenu] = useState(false)
  const [showLayers, setShowLayers] = useState(false)

  const [nodes, setNodes] = useState<Node[]>(() => board.nodes.map(toFlowNode))
  const [edges, setEdges] = useState<Edge[]>(() => board.edges.map(toFlowEdge))
  const [strokes, setStrokes] = useState<any[]>(() => board.strokes ?? [])
  const [tool, setTool] = useState<string>("select")
  const [currentStroke, setCurrentStroke] = useState<any | null>(null)
  const [connectSource, setConnectSource] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(
    null,
  )

  // Drawing tool customization
  const [penColor, setPenColor] = useState<string>("auto")
  const [penSize, setPenSize] = useState<number>(3)
  const [highlighterColor, setHighlighterColor] = useState<string>("#facc15")
  const [highlighterSize, setHighlighterSize] = useState<number>(14)
  const [eraserRadius, setEraserRadius] = useState<number>(14)

  // Drag over state for canvas file drops
  const [isCanvasDragOver, setIsCanvasDragOver] = useState(false)
  const globalFileInputRef = useRef<HTMLInputElement>(null)

  const mounted = useRef(false)
  const persistTimer = useRef<number | null>(null)
  const history = useRef<{
    past: { nodes: Node[]; edges: Edge[] }[]
    future: { nodes: Node[]; edges: Edge[] }[]
  }>({ past: [], future: [] })
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const clipboard = useRef<{ nodes: Node[]; edges: Edge[] } | null>(null)

  const selectedNodes = nodes.filter((node) => node.selected)

  function pushHistory() {
    history.current.past.push({ nodes: nodes.map(cloneNode), edges: edges.map(cloneEdge) })
    if (history.current.past.length > 50) history.current.past.shift()
    history.current.future = []
    setCanUndo(true)
    setCanRedo(false)
  }

  function undo() {
    if (!history.current.past.length) return
    history.current.future.push({ nodes: nodes.map(cloneNode), edges: edges.map(cloneEdge) })
    const prev = history.current.past.pop()!
    setNodes(prev.nodes.map(cloneNode))
    setEdges(prev.edges.map(cloneEdge))
    setCanUndo(history.current.past.length > 0)
    setCanRedo(true)
  }

  function redo() {
    if (!history.current.future.length) return
    history.current.past.push({ nodes: nodes.map(cloneNode), edges: edges.map(cloneEdge) })
    const next = history.current.future.pop()!
    setNodes(next.nodes.map(cloneNode))
    setEdges(next.edges.map(cloneEdge))
    setCanUndo(true)
    setCanRedo(history.current.future.length > 0)
  }

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }

    if (persistTimer.current) window.clearTimeout(persistTimer.current)
    persistTimer.current = window.setTimeout(() => {
      onPersist({ nodes: nodes.map(toKanvasNode), edges: edges.map(toKanvasEdge), strokes })
    }, 400)

    return () => {
      if (persistTimer.current) window.clearTimeout(persistTimer.current)
    }
  }, [nodes, edges, strokes, onPersist])

  const handleNodesChange = useCallback((changes: any) => {
    setNodes((current) => applyNodeChanges(current, changes))
  }, [])

  const handleEdgesChange = useCallback((changes: any) => {
    setEdges((current) => applyEdgeChanges(current, changes))
  }, [])

  const handleMoveEnd = useCallback(
    (_event: unknown, viewport: Viewport) => {
      onViewportChange(viewport)
    },
    [onViewportChange],
  )

  // Direct Device Image Upload
  function handleImageFile(file: File, flowPos?: { x: number; y: number }) {
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const src = e.target?.result as string
      if (!src) return

      const img = new Image()
      img.onload = () => {
        pushHistory()
        const maxWidth = 360
        const scale = Math.min(1, maxWidth / img.naturalWidth)
        const width = Math.max(140, Math.round(img.naturalWidth * scale))
        const height = Math.max(100, Math.round(img.naturalHeight * scale))

        const targetPos =
          flowPos ??
          reactFlow.screenToFlowPosition({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
          })

        const id = createId("node")
        const defaultStyles = getDefaultStyles(theme)
        const newNode: Node = {
          id,
          type: "kanvas-image",
          position: { x: targetPos.x - width / 2, y: targetPos.y - height / 2 },
          width,
          height,
          style: { width, height },
          data: {
            kind: "image",
            data: { src, alt: file.name, fit: "contain" },
            style: defaultStyles.image,
            size: { width, height },
            rotation: 0,
          },
          selected: true,
        }

        setNodes((current) => [
          ...current.map((node) => ({ ...node, selected: false })),
          newNode,
        ])
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  // Handle Clipboard Paste (Ctrl+V with image support)
  useEffect(() => {
    function onPaste(event: ClipboardEvent) {
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return

      const items = event.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile()
          if (file) {
            event.preventDefault()
            const center = reactFlow.screenToFlowPosition({
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
            })
            handleImageFile(file, center)
            return
          }
        }
      }
    }

    window.addEventListener("paste", onPaste)
    return () => window.removeEventListener("paste", onPaste)
  }, [reactFlow, theme])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return

      const mod = event.metaKey || event.ctrlKey

      if (mod && event.key.toLowerCase() === "a") {
        event.preventDefault()
        setNodes((current) => current.map((node) => ({ ...node, selected: true })))
        return
      }

      if (mod && event.key.toLowerCase() === "c") {
        event.preventDefault()
        const selected = nodes.filter((node) => node.selected)
        const ids = new Set(selected.map((node) => node.id))
        clipboard.current = {
          nodes: selected.map(cloneNode),
          edges: edges
            .filter((edge) => ids.has(edge.source) && ids.has(edge.target))
            .map(cloneEdge),
        }
        return
      }

      if (mod && event.key.toLowerCase() === "v") {
        if (!clipboard.current) return
        event.preventDefault()
        pushHistory()
        const idMap = new Map<string, string>()
        const newNodes = clipboard.current.nodes.map((node) => {
          const newId = createId("node")
          idMap.set(node.id, newId)
          return {
            ...cloneNode(node),
            id: newId,
            position: { x: node.position.x + 36, y: node.position.y + 36 },
            selected: true,
          }
        })
        const newEdges = clipboard.current.edges.map((edge) => ({
          ...cloneEdge(edge),
          id: createId("edge"),
          source: idMap.get(edge.source) ?? edge.source,
          target: idMap.get(edge.target) ?? edge.target,
        }))
        setNodes((current) => [
          ...current.map((node) => ({ ...node, selected: false })),
          ...newNodes,
        ])
        setEdges((current) => [...current, ...newEdges])
        return
      }

      if (mod && event.key.toLowerCase() === "d") {
        event.preventDefault()
        const selected = nodes.filter((node) => node.selected)
        if (selected.length === 0) return
        pushHistory()
        const clones = selected.map((node) => ({
          ...cloneNode(node),
          id: createId("node"),
          position: { x: node.position.x + 24, y: node.position.y + 24 },
          selected: true,
        }))
        setNodes((current) => [...current.map((node) => ({ ...node, selected: false })), ...clones])
        return
      }

      if (mod && event.key.toLowerCase() === "z") {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
        return
      }

      if (mod && event.key.toLowerCase() === "y") {
        event.preventDefault()
        redo()
        return
      }

      // Quick tool shortcuts
      if (!mod && !event.altKey) {
        if (event.key.toLowerCase() === "v") setTool("select")
        else if (event.key.toLowerCase() === "h") setTool("hand")
        else if (event.key.toLowerCase() === "p") setTool("pen")
        else if (event.key.toLowerCase() === "e") setTool("eraser")
        else if (event.key.toLowerCase() === "n") addNode("note")
        else if (event.key.toLowerCase() === "t") addNode("text")
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault()
        reactFlow.zoomIn({ duration: 150 })
      } else if (event.key === "-" || event.key === "_") {
        event.preventDefault()
        reactFlow.zoomOut({ duration: 150 })
      } else if (event.key === "0") {
        event.preventDefault()
        if (nodes.length > 0) {
          void reactFlow.fitView({ duration: 200, padding: 0.2 })
        } else {
          reactFlow.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 200 })
        }
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [reactFlow, nodes, edges, undo, redo, theme])

  function addNode(kind: NodeType) {
    pushHistory()
    const center = reactFlow.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    })

    const id = createId("node")
    const size = DEFAULT_SIZES[kind]
    const defaultStyles = getDefaultStyles(theme)
    const offset = nodes.length > 0 ? (nodes.length % 6) * 36 : 0
    const newNode: Node = {
      id,
      type: `kanvas-${kind}`,
      position: { x: center.x - size.width / 2 + offset, y: center.y - size.height / 2 + offset },
      width: size.width,
      height: size.height,
      style: { width: size.width, height: size.height },
      data: {
        kind,
        data: defaultNodeData(kind),
        style: defaultStyles[kind],
        size,
        rotation: 0,
      },
      selected: true,
    }

    setNodes((current) => [...current.map((node) => ({ ...node, selected: false })), newNode])
  }

  function duplicateNode(nodeId: string) {
    const source = nodes.find((node) => node.id === nodeId)
    if (!source) return
    pushHistory()
    const clone: Node = {
      ...cloneNode(source),
      id: createId("node"),
      position: { x: source.position.x + 24, y: source.position.y + 24 },
      selected: true,
    }
    setNodes((current) => [...current.map((node) => ({ ...node, selected: false })), clone])
  }

  function deleteNode(nodeId: string) {
    pushHistory()
    setNodes((current) => current.filter((node) => node.id !== nodeId))
  }

  function updateSelected(
    patch: Partial<{ style: Partial<NodeStyle>; rotation: number; data: any }>,
  ) {
    if (!selectedNodes.length) return
    pushHistory()
    setNodes((current) =>
      current.map((node) => {
        if (!node.selected) return node
        const nextData = { ...(node.data as any) }
        if (patch.style) nextData.style = { ...(nextData.style as any), ...patch.style }
        if (patch.rotation !== undefined) nextData.rotation = patch.rotation
        if (patch.data) nextData.data = { ...(nextData.data as any), ...patch.data }
        return { ...node, data: nextData }
      }),
    )
  }

  function alignNodes(mode: "left" | "right" | "centerX" | "top" | "bottom" | "centerY") {
    if (selectedNodes.length < 2) return
    pushHistory()
    const xs = selectedNodes.map((node) => node.position.x)
    const ys = selectedNodes.map((node) => node.position.y)
    const widths = selectedNodes.map(
      (node) => (node.width ?? (node.data as any).size?.width ?? 100) as number,
    )
    const heights = selectedNodes.map(
      (node) => (node.height ?? (node.data as any).size?.height ?? 100) as number,
    )
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs.map((x, i) => x + widths[i]))
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys.map((y, i) => y + heights[i]))
    const avgCenterX = xs.reduce((sum, x, i) => sum + x + widths[i] / 2, 0) / selectedNodes.length
    const avgCenterY = ys.reduce((sum, y, i) => sum + y + heights[i] / 2, 0) / selectedNodes.length

    setNodes((current) =>
      current.map((node) => {
        if (!node.selected) return node
        const width = (node.width ?? (node.data as any).size?.width ?? 100) as number
        const height = (node.height ?? (node.data as any).size?.height ?? 100) as number
        let x = node.position.x
        let y = node.position.y
        if (mode === "left") x = minX
        if (mode === "right") x = maxX - width
        if (mode === "centerX") x = avgCenterX - width / 2
        if (mode === "top") y = minY
        if (mode === "bottom") y = maxY - height
        if (mode === "centerY") y = avgCenterY - height / 2
        return { ...node, position: { x, y } }
      }),
    )
  }

  function distributeNodes(axis: "horizontal" | "vertical") {
    if (selectedNodes.length < 3) return
    pushHistory()
    const sorted = [...selectedNodes].sort((a, b) =>
      axis === "horizontal" ? a.position.x - b.position.x : a.position.y - b.position.y,
    )
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    const firstPos = axis === "horizontal" ? first.position.x : first.position.y
    const lastPos =
      axis === "horizontal"
        ? last.position.x + (last.width ?? 100)
        : last.position.y + (last.height ?? 100)
    const totalSize = sorted.reduce(
      (sum, node) => sum + (axis === "horizontal" ? (node.width ?? 100) : (node.height ?? 100)),
      0,
    )
    const gap = (lastPos - firstPos - totalSize) / (sorted.length - 1)

    let cursor =
      firstPos + (axis === "horizontal" ? (first.width ?? 100) : (first.height ?? 100)) + gap
    const positions = new Map<string, number>()
    positions.set(sorted[0].id, firstPos)
    for (let i = 1; i < sorted.length - 1; i++) {
      positions.set(sorted[i].id, cursor)
      cursor += (axis === "horizontal" ? (sorted[i].width ?? 100) : (sorted[i].height ?? 100)) + gap
    }
    positions.set(
      sorted[sorted.length - 1].id,
      lastPos - (axis === "horizontal" ? (last.width ?? 100) : (last.height ?? 100)),
    )

    setNodes((current) =>
      current.map((node) => {
        if (!node.selected) return node
        const pos = positions.get(node.id)
        if (pos === undefined) return node
        return {
          ...node,
          position:
            axis === "horizontal" ? { ...node.position, x: pos } : { ...node.position, y: pos },
        }
      }),
    )
  }

  function eraseAt(point: any) {
    setStrokes((prev) => prev.flatMap((stroke: any) => splitStroke(stroke, point, eraserRadius)))
  }

  function handlePointerDown(event: any) {
    if (!isDrawingTool(tool)) return
    const pos = reactFlow.screenToFlowPosition({ x: event.clientX, y: event.clientY })
    if (tool === "eraser") {
      eraseAt([pos.x, pos.y, 0.5])
      setIsDrawing(true)
      return
    }
    setIsDrawing(true)

    // Contrast-aware pen color
    let strokeColor = penColor
    if (tool === "pen") {
      if (penColor === "auto") {
        strokeColor = theme === "dark" ? "#f8fafc" : "#0f172a"
      }
    } else if (tool === "highlighter") {
      strokeColor = highlighterColor
    }

    setCurrentStroke({
      id: createId("stroke"),
      tool,
      points: [[pos.x, pos.y, 0.5]],
      color: strokeColor,
      size: tool === "highlighter" ? highlighterSize : penSize,
    })
  }

  function handlePointerMove(event: any) {
    if (!isDrawing) return
    const pos = reactFlow.screenToFlowPosition({ x: event.clientX, y: event.clientY })
    if (tool === "eraser") {
      eraseAt([pos.x, pos.y, 0.5])
      return
    }
    setCurrentStroke((stroke: any) =>
      stroke ? { ...stroke, points: [...stroke.points, [pos.x, pos.y, 0.5]] } : stroke,
    )
  }

  function handlePointerUp() {
    if (!isDrawing) return
    setIsDrawing(false)
    if (tool !== "eraser" && currentStroke) {
      pushHistory()
      setStrokes((prev) => [...prev, currentStroke])
      setCurrentStroke(null)
    }
  }

  // Canvas-level Drag & Drop file handler
  function handleCanvasDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes("Files")) {
      setIsCanvasDragOver(true)
    }
  }

  function handleCanvasDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsCanvasDragOver(false)
  }

  function handleCanvasDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsCanvasDragOver(false)

    const files = e.dataTransfer.files
    if (!files || files.length === 0) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.startsWith("image/")) {
        const dropPos = reactFlow.screenToFlowPosition({
          x: e.clientX + i * 20,
          y: e.clientY + i * 20,
        })
        handleImageFile(file, dropPos)
      }
    }
  }

  const isEmpty = nodes.length === 0 && edges.length === 0 && strokes.length === 0

  return (
    <HistoryContext.Provider value={{ push: pushHistory }}>
      <div
        className="absolute inset-0 select-none overflow-hidden"
        onDragOver={handleCanvasDragOver}
        onDragLeave={handleCanvasDragLeave}
        onDrop={handleCanvasDrop}
      >
        {/* Hidden global file input for direct device upload */}
        <input
          ref={globalFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImageFile(file)
            e.target.value = ""
          }}
        />

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onEdgeDoubleClick={(_event, edge) => {
            const label = window.prompt(
              "Connector label",
              typeof edge.label === "string" ? edge.label : "",
            )
            if (label === null) return
            pushHistory()
            setEdges((current) =>
              current.map((item) => (item.id === edge.id ? { ...item, label } : item)),
            )
          }}
          onConnect={(connection) => {
            pushHistory()
            setEdges((eds) =>
              addEdge(
                {
                  ...connection,
                  style: { strokeWidth: 2 },
                },
                eds,
              ),
            )
          }}
          onMoveEnd={handleMoveEnd}
          onNodeDragStart={() => pushHistory()}
          onNodeClick={(_event, node) => {
            if (tool !== "connect") return
            if (!connectSource) {
              setConnectSource(node.id)
              return
            }
            if (connectSource === node.id) {
              setConnectSource(null)
              return
            }
            pushHistory()
            setEdges((current) => [
              ...current,
              {
                id: createId("edge"),
                source: connectSource,
                target: node.id,
                type: "default",
                style: { strokeWidth: 2 },
              },
            ])
            setConnectSource(null)
          }}
          onNodeContextMenu={(event, node) => {
            event.preventDefault()
            setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id })
          }}
          onNodesDelete={() => pushHistory()}
          onEdgesDelete={() => pushHistory()}
          onPaneClick={() => {
            setContextMenu(null)
            setConnectSource(null)
          }}
          nodesDraggable={tool === "select"}
          panOnDrag={tool === "hand" || tool === "select"}
          selectionOnDrag={false}
          selectionKeyCode="Shift"
          deleteKeyCode={["Delete", "Backspace"]}
          multiSelectionKeyCode="Shift"
          proOptions={{ hideAttribution: true }}
          className="bg-background"
          defaultViewport={board.viewport}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1.2}
            color="var(--grid-dot)"
          />
          <ViewportPortal>
            <svg
              className="pointer-events-none absolute left-0 top-0 overflow-visible"
              style={{ width: 1, height: 1 }}
            >
              {strokes.map((stroke: any) => (
                <path
                  key={stroke.id}
                  d={strokeToPath(stroke)}
                  fill={stroke.color}
                  fillOpacity={stroke.tool === "highlighter" ? 0.4 : 1}
                  stroke="none"
                />
              ))}
              {currentStroke ? (
                <path
                  d={strokeToPath(currentStroke)}
                  fill={currentStroke.color}
                  fillOpacity={currentStroke.tool === "highlighter" ? 0.4 : 1}
                  stroke="none"
                />
              ) : null}
            </svg>
          </ViewportPortal>
        </ReactFlow>

        {/* Canvas Drag-and-Drop Overlay */}
        {isCanvasDragOver ? (
          <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-primary/10 backdrop-blur-xs">
            <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-primary bg-card/95 p-8 text-center shadow-2xl">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Upload className="size-7" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">Drop image anywhere on canvas</p>
                <p className="text-xs text-muted-foreground mt-0.5">It will be placed right at your drop position</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Toggleable MiniMap Floating Overview */}
        {showMiniMap ? (
          <div className="fixed bottom-20 right-6 z-40 overflow-hidden rounded-2xl border border-border/80 bg-card/95 p-1 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 ring-1 ring-border/20">
            <div className="flex items-center justify-between border-b border-border/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Overview</span>
              <button
                type="button"
                onClick={() => setShowMiniMap(false)}
                className="rounded p-0.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                title="Close MiniMap"
              >
                <X className="size-3" />
              </button>
            </div>
            <MiniMap
              className="!m-0 !h-28 !w-44 !border-0 !bg-transparent"
              nodeColor={() => (theme === "dark" ? "#64748b" : "#94a3b8")}
              maskColor={
                theme === "dark"
                  ? "rgba(15, 23, 42, 0.65)"
                  : "rgba(247, 245, 239, 0.65)"
              }
              pannable
              zoomable
            />
          </div>
        ) : null}

        {/* Bottom-Right Viewport & Zoom Dock (Ref 2 inspired) */}
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-1 rounded-full border border-border/80 bg-card/90 p-1.5 shadow-2xl backdrop-blur-xl ring-1 ring-border/20">
          {/* Zoom Percentage Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowZoomMenu((prev) => !prev)}
              className="flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-semibold text-foreground transition hover:bg-accent active:scale-95"
              title="Zoom Level (Click for presets)"
            >
              <span>{Math.round(zoom * 100)}%</span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </button>

            {showZoomMenu ? (
              <div className="absolute bottom-11 right-0 min-w-36 rounded-2xl border border-border/80 bg-card/95 p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    reactFlow.zoomIn({ duration: 150 })
                    setShowZoomMenu(false)
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-foreground transition hover:bg-accent"
                >
                  <span>Zoom In</span>
                  <span className="text-[10px] text-muted-foreground">+</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    reactFlow.zoomOut({ duration: 150 })
                    setShowZoomMenu(false)
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-foreground transition hover:bg-accent"
                >
                  <span>Zoom Out</span>
                  <span className="text-[10px] text-muted-foreground">-</span>
                </button>
                <span className="my-1 block h-px bg-border/60" />
                {[50, 100, 150, 200].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      reactFlow.zoomTo(pct / 100, { duration: 150 })
                      setShowZoomMenu(false)
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-1 text-xs text-foreground transition hover:bg-accent"
                  >
                    <span>{pct}%</span>
                    {Math.round(zoom * 100) === pct ? (
                      <Check className="size-3 text-primary" />
                    ) : null}
                  </button>
                ))}
                <span className="my-1 block h-px bg-border/60" />
                <button
                  type="button"
                  onClick={() => {
                    if (nodes.length > 0) void reactFlow.fitView({ duration: 200, padding: 0.2 })
                    else reactFlow.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 200 })
                    setShowZoomMenu(false)
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-foreground transition hover:bg-accent"
                >
                  <span>Fit to Screen</span>
                  <span className="text-[10px] text-muted-foreground">0</span>
                </button>
              </div>
            ) : null}
          </div>

          <span className="h-4 w-px bg-border/70" />

          {/* Pan Tool */}
          <button
            type="button"
            onClick={() => setTool("hand")}
            className={cn(
              "flex size-8 items-center justify-center rounded-full transition",
              tool === "hand"
                ? "bg-primary text-primary-foreground shadow-xs scale-105"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
            title="Pan canvas (H)"
          >
            <Hand className="size-4" />
          </button>

          {/* Pointer Tool */}
          <button
            type="button"
            onClick={() => setTool("select")}
            className={cn(
              "flex size-8 items-center justify-center rounded-full transition",
              tool === "select"
                ? "bg-primary text-primary-foreground shadow-xs scale-105"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
            title="Select (V)"
          >
            <MousePointer2 className="size-4" />
          </button>

          {/* Fit View */}
          <button
            type="button"
            onClick={() => {
              if (nodes.length > 0) void reactFlow.fitView({ duration: 200, padding: 0.2 })
              else reactFlow.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 200 })
            }}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
            title="Fit to view (0)"
          >
            <Maximize2 className="size-4" />
          </button>

          {/* MiniMap Toggle */}
          <button
            type="button"
            onClick={() => setShowMiniMap((v) => !v)}
            className={cn(
              "flex size-8 items-center justify-center rounded-full transition",
              showMiniMap
                ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
            title={showMiniMap ? "Hide MiniMap" : "Show MiniMap"}
          >
            <MapPin className="size-4" />
          </button>

          {/* Layers Toggle (Ref 2 inspired) */}
          <button
            type="button"
            onClick={() => setShowLayers((v) => !v)}
            className={cn(
              "flex size-8 items-center justify-center rounded-full transition",
              showLayers
                ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
            title={showLayers ? "Hide Layers" : "Show Layers"}
          >
            <Layers className="size-4" />
          </button>
        </div>

        {/* Floating Layers Button & Inspector (Ref 2 inspired) */}
        <button
          type="button"
          onClick={() => setShowLayers((v) => !v)}
          className={cn(
            "fixed top-20 left-6 z-40 flex items-center gap-1.5 rounded-full border border-border/80 bg-card/90 px-3 py-1.5 text-xs font-semibold shadow-xl backdrop-blur-xl ring-1 ring-border/20 transition hover:bg-accent active:scale-95",
            showLayers ? "bg-primary text-primary-foreground hover:bg-primary/95" : "text-foreground",
          )}
          title="Toggle Layers"
        >
          <Layers className="size-3.5" />
          <span>Layers</span>
          <span className="rounded-full bg-foreground/10 px-1.5 py-0.2 text-[10px]">
            {nodes.length}
          </span>
        </button>

        {showLayers ? (
          <div className="fixed top-29 left-6 z-40 w-68 rounded-3xl border border-border/80 bg-card/95 p-3.5 shadow-2xl backdrop-blur-xl ring-1 ring-border/20 animate-in fade-in slide-in-from-left-2 duration-150">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div className="flex items-center gap-1.5">
                <Layers className="size-3.5 text-primary" />
                <span className="text-xs font-bold text-foreground">Canvas Layers</span>
              </div>
              <button
                type="button"
                onClick={() => setShowLayers(false)}
                className="rounded-full p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>

            <div className="mt-2 max-h-64 space-y-1 overflow-y-auto pr-1">
              {nodes.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">No layers yet</p>
              ) : (
                nodes.map((n) => {
                  const kind = (n.data as any)?.kind ?? n.type?.replace("kanvas-", "")
                  const label =
                    (n.data as any)?.data?.title ||
                    (n.data as any)?.data?.text ||
                    (n.data as any)?.data?.alt ||
                    `${kind} node`

                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        setNodes((current) =>
                          current.map((item) => ({ ...item, selected: item.id === n.id })),
                        )
                        const w = (n.width ?? (n.data as any)?.size?.width ?? 120) as number
                        const h = (n.height ?? (n.data as any)?.size?.height ?? 100) as number
                        reactFlow.setCenter(n.position.x + w / 2, n.position.y + h / 2, {
                          duration: 250,
                          zoom: Math.max(0.8, zoom),
                        })
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs transition",
                        n.selected
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-foreground hover:bg-accent",
                      )}
                    >
                      <span className="truncate flex-1 font-medium">{label}</span>
                      <span className="text-[9px] uppercase font-bold opacity-60">{kind}</span>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        ) : null}

        {/* Primary Sculpted Pill Dock (Bottom-Center, inspired by Ref 3 & Ref 1) */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 rounded-full border border-border/80 bg-card/90 px-3 py-1.5 shadow-2xl backdrop-blur-xl ring-1 ring-border/20 transition-all">
          {/* Navigation & Selection */}
          <ToolbarButton
            active={tool === "select"}
            onClick={() => setTool("select")}
            icon={<MousePointer2 className="size-4" />}
            title="Select (V)"
          />
          <ToolbarButton
            active={tool === "hand"}
            onClick={() => setTool("hand")}
            icon={<Hand className="size-4" />}
            title="Pan canvas (H)"
          />

          <span className="mx-1 h-5 w-px bg-border/70" />

          {/* Creation Primitives with Pastel Accents */}
          <ToolbarButton
            onClick={() => {
              setTool("select")
              addNode("note")
            }}
            icon={<StickyNote className="size-4 text-amber-500" />}
            title="Sticky Note (N)"
          />
          <ToolbarButton
            onClick={() => {
              setTool("select")
              addNode("text")
            }}
            icon={<Type className="size-4" />}
            title="Text (T)"
          />
          <ToolbarButton
            onClick={() => {
              setTool("select")
              addNode("task")
            }}
            icon={<ListTodo className="size-4 text-sky-500" />}
            title="Task Checklist"
          />
          <ToolbarButton
            onClick={() => {
              setTool("select")
              addNode("shape")
            }}
            icon={<Shapes className="size-4 text-emerald-500" />}
            title="Shape"
          />
          <ToolbarButton
            onClick={() => {
              setTool("select")
              addNode("frame")
            }}
            icon={<Frame className="size-4 text-purple-500" />}
            title="Frame"
          />
          <ToolbarButton
            onClick={() => globalFileInputRef.current?.click()}
            icon={<Upload className="size-4 text-indigo-500" />}
            title="Upload Image from Device"
          />

          <span className="mx-1 h-5 w-px bg-border/70" />

          {/* Drawing & Connectors */}
          <ToolbarButton
            active={tool === "pen"}
            onClick={() => setTool("pen")}
            icon={<Pencil className="size-4" />}
            title="Pen (P)"
          />
          <ToolbarButton
            active={tool === "highlighter"}
            onClick={() => setTool("highlighter")}
            icon={<Highlighter className="size-4 text-amber-400" />}
            title="Highlighter"
          />
          <ToolbarButton
            active={tool === "eraser"}
            onClick={() => setTool("eraser")}
            icon={<Eraser className="size-4" />}
            title="Eraser (E)"
          />
          <ToolbarButton
            active={tool === "connect"}
            onClick={() => setTool("connect")}
            icon={<Waypoints className="size-4" />}
            title="Connector (drag between handles or click nodes)"
          />

          <span className="mx-1 h-5 w-px bg-border/70" />

          {/* History Actions */}
          <ToolbarButton
            disabled={!canUndo}
            onClick={undo}
            icon={<Undo2 className="size-4" />}
            title="Undo (Ctrl+Z)"
          />
          <ToolbarButton
            disabled={!canRedo}
            onClick={redo}
            icon={<Redo2 className="size-4" />}
            title="Redo (Ctrl+Shift+Z)"
          />
        </div>

        {/* Secondary Toolbar: Drawing Tools Customizer (Floating above bottom dock) */}
        {isDrawingTool(tool) ? (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 rounded-full border border-border/80 bg-card/95 px-4 py-2 shadow-2xl backdrop-blur-xl ring-1 ring-border/20 animate-in fade-in slide-in-from-bottom-2 duration-150">
            {tool === "pen" ? (
              <>
                <span className="text-[11px] font-semibold text-muted-foreground">Ink:</span>
                <div className="flex items-center gap-1.5">
                  {PEN_COLORS.map((p) => {
                    const active = penColor === (p.color ?? "auto")
                    const displayColor =
                      p.color ?? (theme === "dark" ? p.dark : p.light)
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setPenColor(p.color ?? "auto")}
                        title={p.name}
                        className={cn(
                          "size-6 rounded-full border border-border/80 transition hover:scale-110 active:scale-95",
                          active && "ring-2 ring-primary ring-offset-2 ring-offset-card scale-110",
                        )}
                        style={{ backgroundColor: displayColor }}
                      />
                    )
                  })}
                </div>

                <span className="mx-1 h-4 w-px bg-border/70" />

                <span className="text-[11px] font-semibold text-muted-foreground">Size:</span>
                {[
                  { label: "S", size: 2 },
                  { label: "M", size: 4 },
                  { label: "L", size: 8 },
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setPenSize(s.size)}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold transition",
                      penSize === s.size
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </>
            ) : null}

            {tool === "highlighter" ? (
              <>
                <span className="text-[11px] font-semibold text-muted-foreground">Color:</span>
                <div className="flex items-center gap-1.5">
                  {HIGHLIGHTER_COLORS.map((h) => {
                    const active = highlighterColor === h.color
                    return (
                      <button
                        key={h.name}
                        type="button"
                        onClick={() => setHighlighterColor(h.color)}
                        title={h.name}
                        className={cn(
                          "size-6 rounded-full border border-border/80 transition hover:scale-110 active:scale-95",
                          active && "ring-2 ring-primary ring-offset-2 ring-offset-card scale-110",
                        )}
                        style={{ backgroundColor: h.color }}
                      />
                    )
                  })}
                </div>

                <span className="mx-1 h-4 w-px bg-border/70" />

                <span className="text-[11px] font-semibold text-muted-foreground">Width:</span>
                {[
                  { label: "M", size: 12 },
                  { label: "L", size: 20 },
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setHighlighterSize(s.size)}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold transition",
                      highlighterSize === s.size
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </>
            ) : null}

            {tool === "eraser" ? (
              <>
                <span className="text-[11px] font-semibold text-muted-foreground">Eraser:</span>
                {[
                  { label: "Fine", radius: 8 },
                  { label: "Normal", radius: 14 },
                  { label: "Broad", radius: 24 },
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setEraserRadius(s.radius)}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold transition",
                      eraserRadius === s.radius
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </>
            ) : null}

            <span className="mx-1 h-4 w-px bg-border/70" />
            <button
              type="button"
              onClick={() => setTool("select")}
              className="flex size-6 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
              title="Done drawing (Esc / V)"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : null}

        {/* Multi-Selection Arrange Toolbar */}
        {selectedNodes.length >= 2 ? (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 rounded-full border border-border/80 bg-card/95 px-3 py-1.5 shadow-2xl backdrop-blur-xl ring-1 ring-border/20 animate-in fade-in slide-in-from-top-2 duration-150">
            <button
              type="button"
              onClick={() => alignNodes("left")}
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground hover:scale-105"
              title="Align Left"
            >
              <AlignLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => alignNodes("centerX")}
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground hover:scale-105"
              title="Align Center Horizontally"
            >
              <AlignCenterHorizontal className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => alignNodes("right")}
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground hover:scale-105"
              title="Align Right"
            >
              <AlignRight className="size-4" />
            </button>

            <span className="mx-1 h-4 w-px bg-border/70" />

            <button
              type="button"
              onClick={() => alignNodes("top")}
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground hover:scale-105"
              title="Align Top"
            >
              <AlignStartVertical className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => alignNodes("centerY")}
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground hover:scale-105"
              title="Align Middle Vertically"
            >
              <AlignCenterVertical className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => alignNodes("bottom")}
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground hover:scale-105"
              title="Align Bottom"
            >
              <AlignEndVertical className="size-4" />
            </button>

            {selectedNodes.length >= 3 ? (
              <>
                <span className="mx-1 h-4 w-px bg-border/70" />
                <button
                  type="button"
                  onClick={() => distributeNodes("horizontal")}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground hover:scale-105"
                  title="Distribute Horizontally"
                >
                  <AlignHorizontalDistributeCenter className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => distributeNodes("vertical")}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground hover:scale-105"
                  title="Distribute Vertically"
                >
                  <AlignVerticalDistributeCenter className="size-4" />
                </button>
              </>
            ) : null}
          </div>
        ) : null}

        {/* Style Panel (Node Inspector) - Positioned top-20 right-6 */}
        {selectedNodes.length === 1 ? (
          <div className="fixed right-6 top-20 z-40 w-76 rounded-3xl border border-border/80 bg-card/95 p-4.5 shadow-2xl backdrop-blur-xl ring-1 ring-border/20 animate-in fade-in slide-in-from-right-3 duration-150">
            {/* Inspector Header */}
            <div className="mb-3.5 flex items-center justify-between border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary capitalize">
                  {(selectedNodes[0].data as any).kind ?? "Node"} Style
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setNodes((current) =>
                    current.map((n) => ({ ...n, selected: false })),
                  )
                }
                className="rounded-full p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                title="Deselect"
              >
                <X className="size-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Presets for notes & shapes */}
              {(selectedNodes[0].data as any).kind === "note" ? (
                <div>
                  <span className="mb-1.5 block text-[11px] font-semibold text-muted-foreground">
                    Color Presets
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {NOTE_PALETTES.map((pal) => (
                      <button
                        key={pal.name}
                        type="button"
                        onClick={() =>
                          updateSelected({
                            style: {
                              fill: pal.fill,
                              stroke: pal.stroke,
                              text: pal.text,
                            },
                          })
                        }
                        className={cn(
                          "h-6.5 rounded-lg border text-[10px] font-semibold transition hover:scale-105 active:scale-95",
                          (selectedNodes[0].data as any).style?.fill === pal.fill &&
                            "ring-2 ring-primary ring-offset-1 ring-offset-card shadow-xs",
                        )}
                        style={{
                          backgroundColor: pal.fill,
                          borderColor: pal.stroke,
                          color: pal.text,
                        }}
                      >
                        {pal.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {(selectedNodes[0].data as any).kind === "shape" ? (
                <div>
                  <span className="mb-1.5 block text-[11px] font-semibold text-muted-foreground">
                    Shape Geometry
                  </span>
                  <div className="grid grid-cols-5 gap-1">
                    {[
                      { kind: "rect", label: "Rect", icon: <Square className="size-3.5" /> },
                      { kind: "round-rect", label: "Round", icon: <Square className="size-3.5 rounded-sm" /> },
                      { kind: "pill", label: "Pill", icon: <span className="inline-block h-2 w-3.5 rounded-full border border-current" /> },
                      { kind: "ellipse", label: "Circle", icon: <Circle className="size-3.5" /> },
                      { kind: "diamond", label: "Diamond", icon: <Diamond className="size-3.5" /> },
                    ].map((s) => (
                      <button
                        key={s.kind}
                        type="button"
                        onClick={() =>
                          updateSelected({
                            data: {
                              ...(selectedNodes[0].data as any).data,
                              kind: s.kind,
                            },
                          })
                        }
                        className={cn(
                          "flex items-center justify-center rounded-xl border border-border py-1.5 text-xs transition hover:scale-105",
                          (selectedNodes[0].data as any).data?.kind === s.kind
                            ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                            : "hover:bg-accent text-foreground",
                        )}
                        title={s.label}
                      >
                        {s.icon}
                      </button>
                    ))}
                  </div>

                  <span className="mb-1.5 mt-2.5 block text-[11px] font-semibold text-muted-foreground">
                    Pastel Palette
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {SHAPE_PALETTES.map((pal) => (
                      <button
                        key={pal.name}
                        type="button"
                        onClick={() =>
                          updateSelected({
                            style: {
                              fill: pal.fill,
                              stroke: pal.stroke,
                              text: pal.text,
                            },
                          })
                        }
                        className="h-6.5 rounded-lg border text-[10px] font-semibold transition hover:scale-105 active:scale-95"
                        style={{
                          backgroundColor: pal.fill,
                          borderColor: pal.stroke,
                          color: pal.text === "var(--foreground)" ? undefined : pal.text,
                        }}
                      >
                        {pal.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Image specific controls */}
              {(selectedNodes[0].data as any).kind === "image" ? (
                <div className="space-y-2 border-b border-border/60 pb-3">
                  <button
                    type="button"
                    onClick={() => globalFileInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-background py-1.5 text-xs font-semibold text-foreground transition hover:bg-accent active:scale-95"
                  >
                    <Upload className="size-3.5" />
                    Replace image from device
                  </button>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground">Fit mode:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = (selectedNodes[0].data as any).data?.fit ?? "contain"
                        updateSelected({
                          data: {
                            ...(selectedNodes[0].data as any).data,
                            fit: cur === "contain" ? "cover" : "contain",
                          },
                        })
                      }}
                      className="flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold hover:bg-accent transition"
                    >
                      {(selectedNodes[0].data as any).data?.fit === "cover" ? (
                        <>
                          <Maximize2 className="size-3" /> Cover
                        </>
                      ) : (
                        <>
                          <Minimize2 className="size-3" /> Contain
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Color rows */}
              <ColorRow
                label="Fill"
                value={(selectedNodes[0].data as any).style?.fill ?? "#ffffff"}
                onChange={(value) => {
                  const optimalText = getOptimalTextColor(value, theme === "dark")
                  updateSelected({ style: { fill: value, text: optimalText } })
                }}
              />
              <ColorRow
                label="Stroke"
                value={(selectedNodes[0].data as any).style?.stroke ?? "#000000"}
                onChange={(value) => updateSelected({ style: { stroke: value } })}
              />
              <ColorRow
                label="Text"
                value={(selectedNodes[0].data as any).style?.text ?? "#000000"}
                onChange={(value) => updateSelected({ style: { text: value } })}
              />

              {/* Font size */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-medium text-muted-foreground">Font size</span>
                <div className="flex items-center gap-1">
                  {[12, 14, 18, 24].map((fs) => (
                    <button
                      key={fs}
                      type="button"
                      onClick={() => updateSelected({ style: { fontSize: fs } })}
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold transition",
                        (selectedNodes[0].data as any).style?.fontSize === fs
                          ? "bg-primary text-primary-foreground font-bold shadow-xs"
                          : "hover:bg-accent text-foreground",
                      )}
                    >
                      {fs}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rotation */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-medium text-muted-foreground">Rotation</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={(selectedNodes[0].data as any).rotation ?? 0}
                    onChange={(event) =>
                      updateSelected({ rotation: Number(event.target.value) })
                    }
                    className="w-16 rounded-lg border border-border bg-background px-2 py-0.5 text-right text-xs"
                  />
                  {(selectedNodes[0].data as any).rotation ? (
                    <button
                      type="button"
                      onClick={() => updateSelected({ rotation: 0 })}
                      className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                      title="Reset rotation"
                    >
                      <RotateCcw className="size-3" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Context menu */}
        {contextMenu ? (
          <div
            className="fixed z-50 min-w-40 rounded-2xl border border-border/80 bg-card p-1 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 ring-1 ring-border/20"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              type="button"
              onClick={() => {
                duplicateNode(contextMenu.nodeId)
                setContextMenu(null)
              }}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium transition hover:bg-accent"
            >
              <Copy className="size-3.5 text-muted-foreground" />
              Duplicate
              <span className="ml-auto text-[10px] text-muted-foreground">Ctrl+D</span>
            </button>
            <button
              type="button"
              onClick={() => {
                deleteNode(contextMenu.nodeId)
                setContextMenu(null)
              }}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-destructive transition hover:bg-destructive/10"
            >
              <Trash2 className="size-3.5" />
              Delete
              <span className="ml-auto text-[10px] opacity-70">Del</span>
            </button>
          </div>
        ) : null}

        {/* Drawing overlay */}
        <div
          className="absolute inset-0 z-30"
          style={{
            pointerEvents: isDrawingTool(tool) ? "auto" : "none",
            cursor: isDrawingTool(tool) ? "crosshair" : "default",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />

        {/* Welcoming Interactive Empty State */}
        {isEmpty ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
            <div className="pointer-events-auto max-w-md rounded-3xl border border-border/80 bg-card/90 p-8 text-center shadow-2xl backdrop-blur-xl ring-1 ring-border/20 animate-in fade-in zoom-in-95 duration-200">
              <div className="mx-auto flex size-13 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                <Sparkles className="size-6.5" />
              </div>
              <h2 className="mt-4 font-display text-2xl tracking-tight sm:text-3xl">Your Canvas is Ready</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Drop images anywhere from your device, jot notes, map a plan, or sketch freely.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-2.5 text-left">
                <button
                  type="button"
                  onClick={() => addNode("note")}
                  className="flex items-center gap-2.5 rounded-2xl border border-border/80 bg-background/80 p-3 text-xs font-semibold text-foreground transition hover:border-primary/50 hover:bg-accent hover:scale-[1.02] active:scale-98 shadow-xs"
                >
                  <div className="flex size-7 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                    <StickyNote className="size-4" />
                  </div>
                  <span>Add Note</span>
                </button>
                <button
                  type="button"
                  onClick={() => globalFileInputRef.current?.click()}
                  className="flex items-center gap-2.5 rounded-2xl border border-border/80 bg-background/80 p-3 text-xs font-semibold text-foreground transition hover:border-primary/50 hover:bg-accent hover:scale-[1.02] active:scale-98 shadow-xs"
                >
                  <div className="flex size-7 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                    <Upload className="size-4" />
                  </div>
                  <span>Upload Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTool("pen")}
                  className="flex items-center gap-2.5 rounded-2xl border border-border/80 bg-background/80 p-3 text-xs font-semibold text-foreground transition hover:border-primary/50 hover:bg-accent hover:scale-[1.02] active:scale-98 shadow-xs"
                >
                  <div className="flex size-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Pencil className="size-4" />
                  </div>
                  <span>Start Drawing</span>
                </button>
                <button
                  type="button"
                  onClick={() => addNode("task")}
                  className="flex items-center gap-2.5 rounded-2xl border border-border/80 bg-background/80 p-3 text-xs font-semibold text-foreground transition hover:border-primary/50 hover:bg-accent hover:scale-[1.02] active:scale-98 shadow-xs"
                >
                  <div className="flex size-7 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                    <ListTodo className="size-4" />
                  </div>
                  <span>Task Checklist</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </HistoryContext.Provider>
  )
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  icon,
  title,
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-9 items-center justify-center rounded-full transition-all duration-150",
        active
          ? "bg-primary text-primary-foreground shadow-md scale-105 ring-2 ring-primary/25"
          : "text-muted-foreground hover:bg-accent hover:text-foreground hover:scale-110 active:scale-95",
        disabled && "opacity-30 pointer-events-none",
      )}
      title={title}
      aria-label={title}
    >
      {icon}
    </button>
  )
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const isHex = value && value.startsWith("#")

  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <label className="relative flex size-6 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border/80 shadow-xs transition hover:scale-110">
          <input
            type="color"
            value={isHex ? value : "#ffffff"}
            onChange={(event) => onChange(event.target.value)}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
          <span
            className="size-full"
            style={{
              backgroundColor: value === "transparent" ? "transparent" : value,
              backgroundImage:
                value === "transparent"
                  ? "repeating-linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), repeating-linear-gradient(45deg, #ccc 25%, #fff 25%, #fff 75%, #ccc 75%, #ccc)"
                  : undefined,
              backgroundSize: "6px 6px",
            }}
          />
        </label>
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-20 rounded border border-border bg-background px-1.5 py-0.5 text-center font-mono text-[11px]"
          placeholder="#hex or color"
        />
      </div>
    </div>
  )
}
