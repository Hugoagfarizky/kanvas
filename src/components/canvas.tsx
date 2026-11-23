import {
  Background,
  BackgroundVariant,
  MarkerType,
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
  Activity,
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndVertical,
  AlignHorizontalDistributeCenter,
  AlignLeft,
  AlignRight,
  AlignStartVertical,
  AlignVerticalDistributeCenter,
  Bell,
  Circle,
  Compass,
  Copy,
  Diamond,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  Grid,
  Heart,
  Highlighter,
  Image as ImageIcon,
  Layers,
  Link2,
  ListTodo,
  Lock,
  Maximize2,
  Menu,
  Minimize2,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  Undo2,
  Redo2,
  Search,
  Sparkles,
  Square,
  StickyNote,
  Target,
  Trash2,
  Unlock,
  Upload,
  X,
} from "lucide-react"
import { getStroke } from "perfect-freehand"
import { useCallback, useEffect, useRef, useState } from "react"

import "@xyflow/react/dist/style.css"

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { HistoryContext } from "@/components/history-context"
import { nodeTypes } from "@/components/nodes"
import type { EdgeType, KanvasNode, NodeStyle, NodeType, Size, TemplateId } from "@/types/board"
import { createId } from "@/lib/id"
import { useTheme } from "@/lib/theme"
import { seedDeiLearningPlan, seedCardiologyDynamics, seedUXFlowArchitecture } from "@/lib/templates"
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
    title?: string
    templateId?: TemplateId
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
  onPersist: (patch: { nodes: KanvasNode[]; edges: any[]; strokes: any[]; templateId?: TemplateId }) => void
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
  const isBlue = e.color === "#3b82f6" || e.color?.includes("blue")
  return {
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    type: e.type ?? (isBlue ? "bezier" : "smoothstep"),
    style: {
      stroke: e.color || "#10b981",
      strokeWidth: 2.5,
      strokeDasharray: isBlue ? undefined : "6 6",
    },
    markerEnd: isBlue
      ? { type: MarkerType.ArrowClosed, color: "#3b82f6", width: 14, height: 14 }
      : undefined,
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
    type: (fe.type as EdgeType | undefined) ?? "smoothstep",
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
  const [showLayers, setShowLayers] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [activityTab, setActivityTab] = useState<"activities" | "shortcuts">("activities")
  const [isCanvasLocked, setIsCanvasLocked] = useState(false)
  const [gridVariant, setGridVariant] = useState<BackgroundVariant | "none">(BackgroundVariant.Dots)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"Completed" | "Upcoming" | null>(null)
  const [hiddenNodeIds, setHiddenNodeIds] = useState<Set<string>>(new Set())
  const [lockedNodeIds, setLockedNodeIds] = useState<Set<string>>(new Set())

  const [nodes, setNodes] = useState<Node[]>(() =>
    (board.nodes ?? []).map(toFlowNode),
  )
  const [edges, setEdges] = useState<Edge[]>(() =>
    (board.edges ?? []).map(toFlowEdge),
  )
  const [strokes, setStrokes] = useState<any[]>(() => board.strokes ?? [])
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [commandQuery, setCommandQuery] = useState("")
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [pendingTemplate, setPendingTemplate] = useState<"dei" | "cardiology" | "uxflow" | "blank" | null>(null)
  const [connectorLabel, setConnectorLabel] = useState<{ edgeId: string; value: string } | null>(null)
const [templateId, setTemplateId] = useState<TemplateId>(board.templateId ?? "blank")
  const [tool, setTool] = useState<string>("select")
  const [currentStroke, setCurrentStroke] = useState<any | null>(null)
  const [connectSource, setConnectSource] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(
    null,
  )

  // Dynamic Dei reactive stat counts
  const totalCards = nodes.length
  const completedCards = nodes.filter(
    (n) => (n.data as any)?.data?.status === "Completed",
  ).length
  const upcomingCards = nodes.filter(
    (n) => (n.data as any)?.data?.status === "Upcoming",
  ).length

  function toggleHideNode(id: string) {
    setHiddenNodeIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleLockNode(id: string) {
    setLockedNodeIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Filter & highlight matching nodes based on search query and status filter
  const displayedNodes = nodes
    .filter((n) => !hiddenNodeIds.has(n.id))
    .map((n) => {
      const d = (n.data as any)?.data
      const isLocked = lockedNodeIds.has(n.id) || isCanvasLocked
      const nodeStatus = d?.status

      let matchSearch = true
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        matchSearch =
          Boolean(d?.title?.toLowerCase().includes(q)) ||
          Boolean(d?.subtitle?.toLowerCase().includes(q)) ||
          Boolean(d?.text?.toLowerCase().includes(q)) ||
          Boolean(d?.category?.toLowerCase().includes(q)) ||
          Boolean(d?.tag?.toLowerCase().includes(q))
      }

      let matchFilter = true
      if (filterStatus) {
        matchFilter = nodeStatus === filterStatus
      }

      const active = matchSearch && matchFilter

      if (searchQuery.trim() && !matchSearch) return null

      return {
        ...n,
        draggable: !isLocked,
        style: {
          ...n.style,
          opacity: active ? 1 : 0.22,
          filter:
            active && (searchQuery.trim() || filterStatus)
              ? "drop-shadow(0 0 16px rgba(16,185,129,0.5))"
              : undefined,
          transition: "opacity 0.2s ease, filter 0.2s ease",
        },
      }
    })
    .filter((n): n is NonNullable<typeof n> => n !== null)

  const displayedNodeIds = new Set(displayedNodes.map((n) => n.id))
  const displayedEdges = edges.filter(
    (e) => displayedNodeIds.has(e.source) && displayedNodeIds.has(e.target),
  )

  // (removed unused isCardio/isUX flags)

  // Switch between templates (Dei, Cardiology, UX Flow, Blank)
  function requestTemplate(kind: "dei" | "cardiology" | "uxflow" | "blank") {
    if (nodes.length > 0 || edges.length > 0 || strokes.length > 0) {
      setPendingTemplate(kind)
      return
    }
    applyTemplate(kind)
  }

  function applyTemplate(kind: "dei" | "cardiology" | "uxflow" | "blank") {
    pushHistory()
    if (kind === "dei") {
      const dei = seedDeiLearningPlan()
      setNodes(dei.nodes.map(toFlowNode))
      setEdges(dei.edges.map(toFlowEdge))
    } else if (kind === "cardiology") {
      const cardio = seedCardiologyDynamics()
      setNodes(cardio.nodes.map(toFlowNode))
      setEdges(cardio.edges.map(toFlowEdge))
    } else if (kind === "uxflow") {
      const ux = seedUXFlowArchitecture()
      setNodes(ux.nodes.map(toFlowNode))
      setEdges(ux.edges.map(toFlowEdge))
    } else {
      setNodes([])
      setEdges([])
    }
    setStrokes([])
    setFilterStatus(null)
    setHiddenNodeIds(new Set())
    setLockedNodeIds(new Set())
    setTemplateId(kind)
    setShowTemplateModal(false)
    setShowQuickAdd(false)
    setTimeout(() => {
      void reactFlow.fitView({ duration: 300, padding: 0.18 })
    }, 60)
  }

  // Quick reset to Dei Learning Plan board demo
  function resetToDeiTemplate() {
    requestTemplate("dei")
  }

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
  const pendingPersist = useRef<{
    nodes: KanvasNode[]
    edges: any[]
    strokes: any[]
    templateId?: TemplateId
  } | null>(null)
  const hasPendingPersist = useRef(false)
  const eraserHistoryPushed = useRef(false)
  const history = useRef<{
    past: { nodes: Node[]; edges: Edge[]; strokes: any[] }[]
    future: { nodes: Node[]; edges: Edge[]; strokes: any[] }[]
  }>({ past: [], future: [] })
  const clipboard = useRef<{ nodes: Node[]; edges: Edge[] } | null>(null)

  const selectedNodes = nodes.filter((node) => node.selected)
  const selectedEdges = edges.filter((edge) => edge.selected)
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && (event.key === "k" || event.key === "K")) {
        event.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
        setCommandQuery("")
      }
      if (event.key === "Escape" && commandPaletteOpen) {
        setCommandPaletteOpen(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [commandPaletteOpen])

  const isEmpty = nodes.length === 0 && edges.length === 0 && strokes.length === 0

  function cloneStrokes(items: any[]) {
    return items.map((stroke) => ({
      ...stroke,
      points: stroke.points.map((point: number[]) => [...point]),
    }))
  }

  function pushHistory() {
    history.current.past.push({
      nodes: nodes.map(cloneNode),
      edges: edges.map(cloneEdge),
      strokes: cloneStrokes(strokes),
    })
    if (history.current.past.length > 50) history.current.past.shift()
    history.current.future = []
    setCanUndo(true)
    setCanRedo(false)
  }

  function undo() {
    if (!history.current.past.length) return
    history.current.future.push({
      nodes: nodes.map(cloneNode),
      edges: edges.map(cloneEdge),
      strokes: cloneStrokes(strokes),
    })
    const prev = history.current.past.pop()!
    setNodes(prev.nodes.map(cloneNode))
    setEdges(prev.edges.map(cloneEdge))
    setStrokes(cloneStrokes(prev.strokes))
    setCanUndo(history.current.past.length > 0)
    setCanRedo(history.current.future.length > 0)
  }

  function redo() {
    if (!history.current.future.length) return
    history.current.past.push({
      nodes: nodes.map(cloneNode),
      edges: edges.map(cloneEdge),
      strokes: cloneStrokes(strokes),
    })
    const next = history.current.future.pop()!
    setNodes(next.nodes.map(cloneNode))
    setEdges(next.edges.map(cloneEdge))
    setStrokes(cloneStrokes(next.strokes))
    setCanUndo(history.current.past.length > 0)
    setCanRedo(history.current.future.length > 0)
  }

  useEffect(() => {
    if (board.viewport.x === 0 && board.viewport.y === 0 && board.viewport.zoom === 1) {
      const timer = window.setTimeout(() => {
        void reactFlow.fitView({ padding: 0.18, duration: 350 })
      }, 120)
      return () => window.clearTimeout(timer)
    }
  }, [reactFlow, board.viewport])

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }

    hasPendingPersist.current = true
    pendingPersist.current = {
      nodes: nodes.map(toKanvasNode),
      edges: edges.map(toKanvasEdge),
      strokes,
      templateId,
    }

    if (persistTimer.current) window.clearTimeout(persistTimer.current)
    persistTimer.current = window.setTimeout(() => {
      persistTimer.current = null
      hasPendingPersist.current = false
      if (pendingPersist.current) onPersist(pendingPersist.current)
    }, 400)

    return () => {
      if (persistTimer.current) window.clearTimeout(persistTimer.current)
    }
  }, [nodes, edges, strokes, onPersist])

  // Flush the debounced autosave when the canvas unmounts so the last edit is not lost.
  useEffect(() => {
    return () => {
      if (persistTimer.current) {
        window.clearTimeout(persistTimer.current)
        persistTimer.current = null
      }
      if (hasPendingPersist.current && pendingPersist.current) {
        hasPendingPersist.current = false
        onPersist(pendingPersist.current)
      }
    }
  }, [onPersist])

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

        // Downscale the source image before storing it as base64.
        const canvasEl = document.createElement("canvas")
        canvasEl.width = width
        canvasEl.height = height
        const ctx = canvasEl.getContext("2d")
        ctx?.drawImage(img, 0, 0, width, height)
        const storedSrc = canvasEl.toDataURL("image/png")

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
            data: { src: storedSrc, alt: file.name, fit: "contain" },
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

  function addNode(
    kind: NodeType,
    presetData?: Record<string, any>,
    presetStyle?: Partial<NodeStyle>,
    presetSize?: Size,
  ) {
    pushHistory()
    const center = reactFlow.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    })

    const id = createId("node")
    const size = presetSize ?? DEFAULT_SIZES[kind]
    const defaultStyles = getDefaultStyles(theme)
    const offset = nodes.length > 0 ? (nodes.length % 6) * 36 : 0
    const finalData = presetData
      ? { ...defaultNodeData(kind), ...presetData, userColor: Boolean(presetStyle?.fill) }
      : defaultNodeData(kind)
    const finalStyle = presetStyle
      ? { ...defaultStyles[kind], ...presetStyle }
      : defaultStyles[kind]

    const newNode: Node = {
      id,
      type: `kanvas-${kind}`,
      position: { x: center.x - size.width / 2 + offset, y: center.y - size.height / 2 + offset },
      width: size.width,
      height: size.height,
      style: { width: size.width, height: size.height },
      data: {
        kind,
        data: finalData,
        style: finalStyle,
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
        if (patch.style) {
          nextData.style = { ...(nextData.style as any), ...patch.style }
          nextData.data = { ...(nextData.data as any), userColor: true }
        }
        if (patch.rotation !== undefined) nextData.rotation = patch.rotation
        if (patch.data) nextData.data = { ...(nextData.data as any), ...patch.data }
        return { ...node, data: nextData }
      }),
    )
  }

  function updateSelectedEdge(patch: { color?: string; dash?: string; type?: string }) {
    if (!selectedEdges.length) return
    pushHistory()
    setEdges((current) =>
      current.map((e) => {
        if (!e.selected) return e
        const currentStroke = (e.style as any)?.stroke
        const nextColor = patch.color ?? currentStroke ?? "#10b981"
        const nextDash = patch.dash !== undefined ? patch.dash : (e.style as any)?.strokeDasharray
        const nextType = patch.type ?? e.type ?? "smoothstep"
        const isBlue = nextColor === "#3b82f6" || nextColor.includes("blue")
        return {
          ...e,
          type: nextType,
          style: {
            ...e.style,
            stroke: nextColor,
            strokeDasharray: nextDash || undefined,
          },
          markerEnd: isBlue
            ? { type: MarkerType.ArrowClosed, color: nextColor, width: 14, height: 14 }
            : undefined,
        }
      }),
    )
  }

  function deleteSelectedEdge(edgeId: string) {
    pushHistory()
    setEdges((current) => current.filter((e) => e.id !== edgeId))
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
      if (!eraserHistoryPushed.current) {
        pushHistory()
        eraserHistoryPushed.current = true
      }
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
    if (tool === "eraser") {
      eraserHistoryPushed.current = false
      return
    }
    if (currentStroke) {
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

  const lastHistoryPushRef = useRef(0)
  const coalescedHistoryPush = useCallback(() => {
    const now = Date.now()
    if (now - lastHistoryPushRef.current < 400) return
    lastHistoryPushRef.current = now
    pushHistory()
  }, [pushHistory])

  return (
    <HistoryContext.Provider value={{ push: coalescedHistoryPush }}>
      <div
        className="absolute inset-0 select-none overflow-hidden flex flex-col"
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

        {/* Top Header Section matching Dei reference seamlessly */}
        <div className="hidden md:flex h-16 shrink-0 items-center justify-between px-8 z-30 select-none bg-background">
          {/* Left Title */}
          <div className="flex items-center gap-2">
            <h2 className="font-sans text-2xl font-black tracking-tight text-foreground">
              {board.title || "Workspace"}
            </h2>
          </div>

          {/* Center: Search & Dynamic Bento Stat Cards */}
          <div className="flex items-center gap-2 rounded-full border border-border/80 bg-card/95 p-1.5 shadow-xl backdrop-blur-xl ring-1 ring-black/5">
            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 size-3.5 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    const q = searchQuery.toLowerCase()
                    const target = nodes.find((n) => {
                      const d = (n.data as any)?.data
                      return (
                        d?.title?.toLowerCase().includes(q) ||
                        d?.subtitle?.toLowerCase().includes(q) ||
                        d?.text?.toLowerCase().includes(q)
                      )
                    })
                    if (target) {
                      reactFlow.setCenter(target.position.x + 140, target.position.y + 80, {
                        duration: 300,
                        zoom: 1,
                      })
                    }
                  }
                }}
                placeholder="Search..."
                className="h-8 w-32 rounded-full bg-secondary/60 pl-8 pr-7 text-xs font-semibold text-foreground transition-all focus:w-48 focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              ) : null}
            </div>

            {/* Stat 1: Total */}
            <button
              type="button"
              onClick={() => setFilterStatus(null)}
              className={cn(
                "flex min-w-14 flex-col items-center justify-center rounded-2xl border px-3 py-1 text-center transition hover:scale-105 active:scale-95 shadow-2xs",
                filterStatus === null
                  ? "border-sky-300 bg-sky-100 text-sky-950 dark:border-sky-700 dark:bg-sky-950/70 dark:text-sky-100 ring-2 ring-sky-400/30"
                  : "border-border/60 bg-secondary/40 text-muted-foreground hover:bg-sky-50 dark:hover:bg-sky-950/30",
              )}
              title="Show all cards"
            >
              <span className="font-sans text-sm font-black leading-none">{totalCards}</span>
              <span className="text-[10px] font-semibold opacity-75">Total</span>
            </button>

            {/* Stat 2: Completed */}
            <button
              type="button"
              onClick={() => setFilterStatus(filterStatus === "Completed" ? null : "Completed")}
              className={cn(
                "flex min-w-16 flex-col items-center justify-center rounded-2xl border px-3 py-1 text-center transition hover:scale-105 active:scale-95 shadow-2xs",
                filterStatus === "Completed"
                  ? "border-emerald-300 bg-emerald-100 text-emerald-950 dark:border-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-100 ring-2 ring-emerald-400/30"
                  : "border-border/60 bg-secondary/40 text-muted-foreground hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
              )}
              title="Filter by Completed cards"
            >
              <div className="flex items-center gap-0.5 leading-none">
                <span className="font-sans text-sm font-black">{completedCards}</span>
              </div>
              <span className="text-[10px] font-semibold opacity-75">Completed</span>
            </button>

            {/* Stat 3: Upcoming */}
            <button
              type="button"
              onClick={() => setFilterStatus(filterStatus === "Upcoming" ? null : "Upcoming")}
              className={cn(
                "flex min-w-14 flex-col items-center justify-center rounded-2xl border px-3 py-1 text-center transition hover:scale-105 active:scale-95 shadow-2xs",
                filterStatus === "Upcoming"
                  ? "border-slate-300 bg-slate-200 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 ring-2 ring-slate-400/30"
                  : "border-border/60 bg-secondary/40 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800/30",
              )}
              title="Filter by Upcoming cards"
            >
              <span className="font-sans text-sm font-black leading-none">{upcomingCards}</span>
              <span className="text-[10px] font-semibold opacity-75">Upcoming</span>
            </button>
          </div>

          </div>

        {/* Canvas Workspace containing ReactFlow and floating controls */}
        <div className="relative flex-1 min-h-0 overflow-hidden">
          <ReactFlow
            nodes={displayedNodes}
            edges={displayedEdges}
            nodeTypes={nodeTypes}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onEdgeDoubleClick={(_event, edge) => {
              setConnectorLabel({
                edgeId: edge.id,
                value: typeof edge.label === "string" ? edge.label : "",
              })
            }}
            onConnect={(connection) => {
              pushHistory()
              setEdges((eds) =>
                addEdge(
                  {
                    ...connection,
                    type: "smoothstep",
                    style: { stroke: "#10b981", strokeWidth: 2.5, strokeDasharray: "6 6" },
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
                  type: "smoothstep",
                  style: { stroke: "#10b981", strokeWidth: 2.5, strokeDasharray: "6 6" },
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
              setShowQuickAdd(false)
            }}
            nodesDraggable={!isCanvasLocked && tool === "select"}
            panOnDrag={!isCanvasLocked && (tool === "hand" || tool === "select")}
            selectionOnDrag={false}
            selectionKeyCode="Shift"
            deleteKeyCode={["Delete", "Backspace"]}
            multiSelectionKeyCode="Shift"
            proOptions={{ hideAttribution: true }}
            className="bg-background"
            defaultViewport={board.viewport}
          >
            <Background
              variant={gridVariant === "none" ? undefined : gridVariant}
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

          {/* Left Floating Dock: Vertical Black Pill matching Dei reference */}
          <div className="hidden md:flex fixed left-5 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-2.5 rounded-full border border-white/10 bg-[#0f1115] p-2 text-white shadow-2xl backdrop-blur-xl ring-1 ring-black/40 select-none">
            {/* Top Badge: Total items counter */}
            <div
              className="flex size-8 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white shadow-xs"
              title="Total Canvas Items"
            >
              {totalCards}
            </div>

            {/* Layers Toggle */}
            <button
              type="button"
              onClick={() => setShowLayers((v) => !v)}
              className={cn(
                "flex size-8 items-center justify-center rounded-full transition hover:bg-white/15 hover:scale-105 active:scale-95",
                showLayers ? "bg-white/20 text-white shadow-xs" : "text-white/70",
              )}
              title="Toggle Layers"
              aria-label="Toggle layers panel"
            >
              <Menu className="size-4.5" />
            </button>

            {/* Board View & Template Switcher */}
            <button
              type="button"
              onClick={() => setShowTemplateModal(true)}
              className={cn(
                "flex size-8 items-center justify-center rounded-full transition hover:bg-white/15 hover:scale-105 active:scale-95",
                showTemplateModal ? "bg-white/20 text-white shadow-xs" : "text-white/70",
              )}
              title="Template & View Switcher"
              aria-label="Template and view switcher"
            >
              <Grid className="size-4.5" />
            </button>

            <span className="my-0.5 h-px w-5 bg-white/20" />

            {/* Shortcuts & Activity */}
            <button
              type="button"
              onClick={() => {
                setActivityTab("activities")
                setShowShortcutsModal(true)
              }}
              className="flex flex-col items-center gap-0.5 py-1 text-white transition hover:scale-110 active:scale-95"
              title="Activity & Notifications"
              aria-label="Activity and notifications"
            >
              <Bell className="size-4 text-amber-300" />
            </button>

            {/* Zoom In (+) */}
            <button
              type="button"
              onClick={() => reactFlow.zoomIn({ duration: 150 })}
              className="flex size-8 items-center justify-center rounded-full text-white/70 transition hover:bg-white/15 hover:text-white hover:scale-105 active:scale-95"
              title="Zoom In (+)"
              aria-label="Zoom in"
            >
              <Plus className="size-4.5" />
            </button>

            {/* Zoom Out (-) */}
            <button
              type="button"
              onClick={() => reactFlow.zoomOut({ duration: 150 })}
              className="flex size-8 items-center justify-center rounded-full text-white/70 transition hover:bg-white/15 hover:text-white hover:scale-105 active:scale-95"
              title="Zoom Out (-)"
              aria-label="Zoom out"
            >
              <Minus className="size-4.5" />
            </button>
          </div>

          {/* Floating Layers Panel matching Reference 2 */}
          {showLayers ? (
            <div className="hidden md:block fixed left-20 top-1/2 -translate-y-1/2 z-50 w-80 rounded-3xl border border-white/15 bg-[#161922] p-4 text-white shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-left-3 duration-150">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Layers className="size-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Layers</span>
                  <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] text-white/70">
                    Page 1 ▾
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => addNode("note", { title: "New Layer Card" })}
                    className="rounded-full bg-white/10 p-1 text-white/80 hover:bg-white/20 transition"
                    title="Add Layer"
                  >
                    <Plus className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLayers(false)}
                    className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white transition"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-2.5 max-h-80 space-y-1 overflow-y-auto pr-1">
                {nodes.length === 0 ? (
                  <p className="py-4 text-center text-xs text-white/50">No layers yet</p>
                ) : (
                  nodes.map((n) => {
                    const kind = (n.data as any)?.kind ?? n.type?.replace("kanvas-", "")
                    const label =
                      (n.data as any)?.data?.title ||
                      (n.data as any)?.data?.text ||
                      (n.data as any)?.data?.alt ||
                      `${kind} node`
                    const isHidden = hiddenNodeIds.has(n.id)
                    const isLocked = lockedNodeIds.has(n.id)

                    return (
                      <div
                        key={n.id}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-xs transition",
                          n.selected
                            ? "bg-emerald-500/25 text-emerald-300 font-semibold ring-1 ring-emerald-500/40"
                            : "text-white/85 hover:bg-white/10",
                        )}
                      >
                        <button
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
                          className="flex flex-1 items-center gap-2 truncate text-left"
                        >
                          <span className="rounded bg-white/10 px-1 py-0.5 text-[9px] font-mono uppercase text-white/60">
                            {kind === "note" ? "Card" : kind === "text" ? "Aa" : kind === "task" ? "Task" : "Box"}
                          </span>
                          <span className="truncate font-medium">{label}</span>
                        </button>

                        {/* Layer Action Controls: Hide & Lock */}
                        <div className="flex items-center gap-1 shrink-0 text-white/50">
                          <button
                            type="button"
                            onClick={() => toggleHideNode(n.id)}
                            className="p-1 hover:text-white transition"
                            title={isHidden ? "Show node" : "Hide node"}
                          >
                            {isHidden ? (
                              <EyeOff className="size-3 text-rose-400" />
                            ) : (
                              <Eye className="size-3" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleLockNode(n.id)}
                            className="p-1 hover:text-white transition"
                            title={isLocked ? "Unlock node" : "Lock node"}
                          >
                            {isLocked ? (
                              <Lock className="size-3 text-amber-400" />
                            ) : (
                              <Unlock className="size-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          ) : null}

          {/* Bottom Sculpted Dark Dock matching Dei reference */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex max-w-[calc(100vw-1.5rem)] items-center gap-2 overflow-x-auto rounded-full border border-white/10 bg-[#0f1115] px-4 py-2.5 text-white shadow-2xl backdrop-blur-xl ring-1 ring-black/40 select-none">
            {/* Undo */}
            <button
              type="button"
              onClick={() => undo()}
              disabled={!canUndo}
              className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:scale-110 active:scale-95 disabled:opacity-40"
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
            >
              <Undo2 className="size-4" />
            </button>
            {/* Redo */}
            <button
              type="button"
              onClick={() => redo()}
              disabled={!canRedo}
              className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:scale-110 active:scale-95 disabled:opacity-40"
              title="Redo (Ctrl+Y)"
              aria-label="Redo"
            >
              <Redo2 className="size-4" />
            </button>
            <span className="h-6 w-px bg-white/15" />
            <button
              type="button"
              onClick={() => addNode("text")}
              className="flex size-9 items-center justify-center rounded-full bg-[#d8b4fe] font-bold text-sm text-[#4a044e] shadow-md transition hover:scale-110 active:scale-95"
              title="Add Text Block (T)"
              aria-label="Add text block"
            >
              T
            </button>

            {/* Button 2: A (Sky Circle - Roadmap Bento Card) */}
            <button
              type="button"
              onClick={() =>
                addNode(
                  "note",
                  {
                    title: "New Roadmap Objective",
                    subtitle: "Define core principles and key medical competencies.",
                    status: "Upcoming",
                    badgeIcon: "+",
                  },
                  { fill: "#ffffff", stroke: "#e2e8f0", text: "#0f172a" },
                  { width: 290, height: 165 },
                )
              }
              className="flex size-9 items-center justify-center rounded-full bg-[#7dd3fc] font-bold text-sm text-[#0c4a6e] shadow-md transition hover:scale-110 active:scale-95"
              title="Add Roadmap Step (A)"
              aria-label="Add roadmap step"
            >
              A
            </button>

            {/* Button 3: Pink Circle (Media / Audio Course) */}
            <button
              type="button"
              onClick={() =>
                addNode(
                  "note",
                  {
                    title: "Audio Lecture Course",
                    subtitle: "Learn basic clinical language for effective communication.",
                    isMedia: true,
                    duration: "00:45",
                    avatars: ["ET", "AS", "MR"],
                  },
                  { fill: "#f3e8ff", stroke: "#d8b4fe", text: "#581c87" },
                  { width: 325, height: 195 },
                )
              }
              className="flex size-9 items-center justify-center rounded-full bg-[#f472b6] font-bold text-sm text-[#831843] shadow-md transition hover:scale-110 active:scale-95"
              title="Add Media / Audio Course"
              aria-label="Add media card"
            >
              <ImageIcon className="size-4" />
            </button>

            {/* Button 4: Peach Circle (Event / Schedule Card) */}
            <button
              type="button"
              onClick={() =>
                addNode(
                  "note",
                  {
                    category: "Webinar",
                    date: "Mo, 30.03",
                    time: "Start at 14:00",
                    text: "Interactive discussion on clinical diagnoses, guidelines, and patient safety.",
                  },
                  { fill: "#e0f2fe", stroke: "#7dd3fc", text: "#0369a1" },
                  { width: 260, height: 155 },
                )
              }
              className="flex size-9 items-center justify-center rounded-full bg-[#fcd34d] font-bold text-sm text-[#78350f] shadow-md transition hover:scale-110 active:scale-95"
              title="Add Event / Schedule Card"
              aria-label="Add event card"
            >
              <FileText className="size-4" />
            </button>

            {/* Button 5: Magenta Circle (Connector Tool) */}
            <button
              type="button"
              onClick={() => setTool((cur) => (cur === "connect" ? "select" : "connect"))}
              className={cn(
                "flex size-9 items-center justify-center rounded-full bg-[#e879f9] font-bold text-sm text-[#701a75] shadow-md transition hover:scale-110 active:scale-95",
                tool === "connect" && "ring-2 ring-white scale-110 shadow-lg",
              )}
              title="Green Dotted Connector Tool"
              aria-label="Connector tool"
            >
              <Link2 className="size-4" />
            </button>

            {/* Button 6: Mint Circle (Shape / Milestone) */}
            <button
              type="button"
              onClick={() =>
                addNode(
                  "shape",
                  { kind: "round-rect", text: "Milestone" },
                  { fill: "#ecfdf5", stroke: "#6ee7b7", text: "#065f46" },
                )
              }
              className="flex size-9 items-center justify-center rounded-full bg-[#6ee7b7] font-bold text-sm text-[#064e3b] shadow-md transition hover:scale-110 active:scale-95"
              title="Add Milestone / Shape"
              aria-label="Add shape"
            >
              <Target className="size-4" />
            </button>

            {/* Button 7: Dark Circle (+) - Quick Add Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowQuickAdd((v) => !v)}
                className={cn(
                  "flex size-9 items-center justify-center rounded-full bg-white/15 font-bold text-base text-white transition hover:scale-110 active:scale-95",
                  showQuickAdd && "bg-white/25 ring-1 ring-white/30",
                )}
                title="Quick Add Menu"
              aria-label="Quick add menu"
              >
                <Plus className="size-5" />
              </button>

              {/* Quick Add Popover */}
              {showQuickAdd ? (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 min-w-52 rounded-3xl border border-white/15 bg-[#161922] p-2.5 text-white shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
                  <span className="block px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/50">
                    Quick Primitives
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      addNode("note")
                      setShowQuickAdd(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-semibold hover:bg-white/10 transition"
                  >
                    <StickyNote className="size-3.5 text-amber-400" />
                    <span>Sticky Note</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      addNode("task")
                      setShowQuickAdd(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-semibold hover:bg-white/10 transition"
                  >
                    <ListTodo className="size-3.5 text-sky-400" />
                    <span>Task Checklist</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      globalFileInputRef.current?.click()
                      setShowQuickAdd(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-semibold hover:bg-white/10 transition"
                  >
                    <Upload className="size-3.5 text-indigo-400" />
                    <span>Upload Device Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTool("pen")
                      setShowQuickAdd(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-semibold hover:bg-white/10 transition"
                  >
                    <Pencil className="size-3.5 text-emerald-400" />
                    <span>Drawing Pen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTool("highlighter")
                      setShowQuickAdd(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-semibold hover:bg-white/10 transition"
                  >
                    <Highlighter className="size-3.5 text-yellow-400" />
                    <span>Highlighter</span>
                  </button>
                  <span className="my-1 block h-px bg-white/10" />
                  <button
                    type="button"
                    onClick={() => {
                      requestTemplate("cardiology")
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-semibold text-rose-300 hover:bg-white/10 transition"
                  >
                    <Heart className="size-3.5 text-rose-400" />
                    <span>Cardiology Dynamics</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      requestTemplate("uxflow")
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-semibold text-sky-300 hover:bg-white/10 transition"
                  >
                    <Compass className="size-3.5 text-sky-400" />
                    <span>UX Signup Flow</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetToDeiTemplate}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-semibold text-emerald-300 hover:bg-white/10 transition"
                  >
                    <Sparkles className="size-3.5 text-emerald-400" />
                    <span>Reset to Dei Demo</span>
                  </button>
                </div>
              ) : null}
            </div>

            <span className="mx-0.5 h-5 w-px bg-white/20" />

            {/* Adjacent Lock Canvas Toggle */}
            <button
              type="button"
              onClick={() => setIsCanvasLocked((v) => !v)}
              className={cn(
                "flex size-9 items-center justify-center rounded-full transition hover:scale-110 active:scale-95",
                isCanvasLocked
                  ? "bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
              title={
                isCanvasLocked
                  ? "Canvas Locked (Click to unlock pan & drag)"
                  : "Canvas Unlocked (Click to lock)"
              }
            >
              {isCanvasLocked ? <Lock className="size-4" /> : <Unlock className="size-4" />}
            </button>
          </div>

          {/* Bottom-Right Fit to Screen Button (Maximize2) matching Dei reference */}
          <button
            type="button"
            onClick={() => {
              if (nodes.length > 0) void reactFlow.fitView({ duration: 250, padding: 0.2 })
              else reactFlow.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 200 })
            }}
            className="fixed bottom-6 right-6 z-40 flex size-11 items-center justify-center rounded-full border border-white/10 bg-[#0f1115] text-white shadow-2xl backdrop-blur-xl transition hover:scale-110 hover:bg-[#1a1e29] active:scale-95"
            title="Fit View / Maximize (0)"
          >
            <Maximize2 className="size-5" />
          </button>

          {/* Board View & Template Switcher Modal (Reference 1, 2 & 3) */}
          {showTemplateModal ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
              <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-[#161922] p-6 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Grid className="size-5 text-emerald-400" />
                    <h3 className="font-bold text-base">Templates &amp; Canvas Views</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(false)}
                    className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 1. Dei Learning Plan (Ref 3) */}
                  <button
                    type="button"
                    onClick={() => requestTemplate("dei")}
                    className="flex flex-col items-start gap-1 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-left transition hover:border-emerald-400 hover:bg-emerald-950/40 active:scale-95"
                  >
                    <GraduationCap className="size-5 text-emerald-400" />
                    <span className="font-bold text-sm text-emerald-300">Dei Learning Plan</span>
                    <span className="text-[11px] text-white/70">
                      Roadmap Bento cards, Pharmacology audio card, and scheduled events stack.
                    </span>
                  </button>

                  {/* 2. Cardiology Dynamics (Ref 1) */}
                  <button
                    type="button"
                    onClick={() => requestTemplate("cardiology")}
                    className="flex flex-col items-start gap-1 rounded-2xl border border-rose-500/30 bg-rose-950/20 p-3.5 text-left transition hover:border-rose-400 hover:bg-rose-950/40 active:scale-95"
                  >
                    <Activity className="size-5 text-rose-400" />
                    <span className="font-bold text-sm text-rose-300">Cardiology Vitals</span>
                    <span className="text-[11px] text-white/70">
                      Patient banner, Aug/Sep medication timeline, dynamic BP curves &amp; ECG wave.
                    </span>
                  </button>

                  {/* 3. UX Architecture Flow (Ref 2) */}
                  <button
                    type="button"
                    onClick={() => requestTemplate("uxflow")}
                    className="flex flex-col items-start gap-1 rounded-2xl border border-sky-500/30 bg-sky-950/20 p-3.5 text-left transition hover:border-sky-400 hover:bg-sky-950/40 active:scale-95"
                  >
                    <Compass className="size-5 text-sky-400" />
                    <span className="font-bold text-sm text-sky-300">UX Signup Flow</span>
                    <span className="text-[11px] text-white/70">
                      Signup decision branches, workspace forms, and connected dialog architecture.
                    </span>
                  </button>

                  {/* 4. Blank Canvas */}
                  <button
                    type="button"
                    onClick={() => requestTemplate("blank")}
                    className="flex flex-col items-start gap-1 rounded-2xl border border-white/10 bg-white/5 p-3.5 text-left transition hover:border-white/20 hover:bg-white/10 active:scale-95"
                  >
                    <Square className="size-5 text-white/80" />
                    <span className="font-bold text-sm text-white">Clean Canvas</span>
                    <span className="text-[11px] text-white/70">
                      Start fresh with an empty infinite board and freeform tools.
                    </span>
                  </button>
                </div>

                {/* Grid background switcher */}
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                  <span className="text-white/70">Canvas Grid Pattern:</span>
                  <div className="flex items-center gap-1.5">
                    {(
                      [
                        { id: BackgroundVariant.Dots, label: "Dots" },
                        { id: BackgroundVariant.Lines, label: "Lines" },
                        { id: "none", label: "Clean" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setGridVariant(opt.id)}
                        className={cn(
                          "rounded-lg px-2.5 py-1 font-semibold transition",
                          gridVariant === opt.id
                            ? "bg-white/20 text-white ring-1 ring-white/30"
                            : "text-white/60 hover:text-white hover:bg-white/10",
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Shortcuts & Activity Modal (Ref 3: Bell 29) */}
          {showShortcutsModal ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
              <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-[#161922] p-6 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="size-5 text-amber-300" />
                    <h3 className="font-bold text-base">Activity, Reminders &amp; Shortcuts</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowShortcutsModal(false)}
                    className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* Tabs: Activities (29) vs Shortcuts */}
                <div className="mt-3 flex items-center gap-2 border-b border-white/10 pb-2">
                  <button
                    type="button"
                    onClick={() => setActivityTab("activities")}
                    className={cn(
                      "rounded-xl px-3 py-1 text-xs font-semibold transition",
                      activityTab === "activities"
                        ? "bg-white/20 text-white ring-1 ring-white/30"
                        : "text-white/60 hover:text-white hover:bg-white/10",
                    )}
                  >
                    Upcoming Activity (29)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivityTab("shortcuts")}
                    className={cn(
                      "rounded-xl px-3 py-1 text-xs font-semibold transition",
                      activityTab === "shortcuts"
                        ? "bg-white/20 text-white ring-1 ring-white/30"
                        : "text-white/60 hover:text-white hover:bg-white/10",
                    )}
                  >
                    Keyboard Shortcuts
                  </button>
                </div>

                {activityTab === "activities" ? (
                  <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1 text-xs">
                    {[
                      {
                        title: "Webinar: Clinical Research & Evidence Guidelines",
                        time: "Tu, 25.03 • 12:30",
                        badge: "Live Session",
                        nodeId: "dei_event_webinar",
                      },
                      {
                        title: "Audio Course: Pharmacology Basics",
                        time: "00:30 remaining",
                        badge: "Lecture",
                        nodeId: "dei_media_pharma",
                      },
                      {
                        title: "Lesson: Healthcare Delivery Systems & Policy",
                        time: "We, 26.03",
                        badge: "Curriculum",
                        nodeId: "dei_event_lesson",
                      },
                      {
                        title: "Assignment: Global Health Disparities",
                        time: "Th, 27.03",
                        badge: "Task",
                        nodeId: "dei_event_task1",
                      },
                      {
                        title: "Assignment: Healthcare Teamwork & Comms",
                        time: "Fr, 28.03",
                        badge: "Task",
                        nodeId: "dei_event_task2",
                      },
                      {
                        title: "Roadmap: Medical Terminology Exam",
                        time: "Completed",
                        badge: "Completed",
                        nodeId: "dei_roadmap_1",
                      },
                      {
                        title: "Roadmap: Anatomy and Physiology Milestone",
                        time: "Completed",
                        badge: "Completed",
                        nodeId: "dei_roadmap_2",
                      },
                    ].map((act, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition"
                      >
                        <div>
                          <p className="font-semibold text-white">{act.title}</p>
                          <p className="text-[11px] text-white/60 mt-0.5">{act.time}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                            {act.badge}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setShowShortcutsModal(false)
                              const target = nodes.find((n) => n.id === act.nodeId)
                              if (target) {
                                reactFlow.setCenter(target.position.x + 140, target.position.y + 80, {
                                  duration: 300,
                                  zoom: 1,
                                })
                              }
                            }}
                            className="rounded-lg bg-white/10 px-2 py-1 text-[11px] font-semibold text-white hover:bg-white/20 transition"
                          >
                            Focus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 space-y-2 text-xs">
                    {[
                      { key: "T", desc: "Add Text block" },
                      { key: "A", desc: "Add Roadmap Step" },
                      { key: "N", desc: "Add Sticky note" },
                      { key: "V", desc: "Select & drag tool" },
                      { key: "H", desc: "Pan canvas" },
                      { key: "P", desc: "Pen ink drawing" },
                      { key: "E", desc: "Eraser" },
                      { key: "Ctrl + D", desc: "Duplicate selected card" },
                      { key: "Ctrl + Z / Y", desc: "Undo / Redo action" },
                      { key: "0", desc: "Fit entire learning plan" },
                    ].map((s) => (
                      <div key={s.key} className="flex items-center justify-between py-1">
                        <span className="text-white/70">{s.desc}</span>
                        <kbd className="rounded-md border border-white/15 bg-white/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-white">
                          {s.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}

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
            <div className="fixed right-4 top-16 z-40 w-[calc(100vw-2rem)] max-w-76 rounded-3xl border border-border/80 bg-card/95 p-4.5 shadow-2xl backdrop-blur-xl ring-1 ring-border/20 animate-in fade-in slide-in-from-right-3 duration-150 sm:right-6 sm:top-20">
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

          {/* Connector / Edge Inspector - Positioned top-20 right-6 */}
          {selectedEdges.length === 1 && selectedNodes.length === 0 ? (
            <div className="fixed right-4 top-16 z-40 w-[calc(100vw-2rem)] max-w-76 rounded-3xl border border-border/80 bg-card/95 p-4.5 shadow-2xl backdrop-blur-xl ring-1 ring-border/20 animate-in fade-in slide-in-from-right-3 duration-150 sm:right-6 sm:top-20">
              {/* Inspector Header */}
              <div className="mb-3.5 flex items-center justify-between border-b border-border/60 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
                    Connector Line Style
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEdges((current) => current.map((e) => ({ ...e, selected: false })))
                  }
                  className="rounded-full p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                  title="Deselect"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Presets for Connector Color */}
                <div>
                  <span className="mb-1.5 block text-[11px] font-semibold text-muted-foreground">
                    Line Color
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { name: "Emerald", color: "#10b981" },
                      { name: "Sky", color: "#3b82f6" },
                      { name: "Rose", color: "#f43f5e" },
                      { name: "Amber", color: "#f59e0b" },
                      { name: "Purple", color: "#a855f7" },
                      { name: "Slate", color: "#64748b" },
                      { name: "White", color: "#f8fafc" },
                      { name: "Dark", color: "#1e293b" },
                    ].map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => updateSelectedEdge({ color: c.color })}
                        className={cn(
                          "flex items-center justify-center gap-1 rounded-xl border py-1.5 text-[10px] font-semibold transition hover:scale-105 active:scale-95 shadow-2xs",
                          ((selectedEdges[0].style as any)?.stroke ?? "#10b981") === c.color &&
                            "ring-2 ring-primary ring-offset-1 ring-offset-card",
                        )}
                        style={{ borderColor: c.color, color: c.color }}
                      >
                        <span className="size-2 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom ColorRow */}
                <ColorRow
                  label="Custom Color"
                  value={(selectedEdges[0].style as any)?.stroke ?? "#10b981"}
                  onChange={(val) => updateSelectedEdge({ color: val })}
                />

                {/* Line Dash / Stroke Pattern */}
                <div>
                  <span className="mb-1.5 block text-[11px] font-semibold text-muted-foreground">
                    Dash Pattern
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: "Dashed", dash: "6 6" },
                      { label: "Dotted", dash: "2 4" },
                      { label: "Solid", dash: "" },
                    ].map((st) => (
                      <button
                        key={st.label}
                        type="button"
                        onClick={() => updateSelectedEdge({ dash: st.dash })}
                        className={cn(
                          "rounded-xl border border-border py-1 text-center text-xs font-semibold hover:bg-accent transition",
                          ((selectedEdges[0].style as any)?.strokeDasharray ?? "") === st.dash &&
                            "bg-primary/10 text-primary border-primary",
                        )}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Curve Type */}
                <div>
                  <span className="mb-1.5 block text-[11px] font-semibold text-muted-foreground">
                    Curve Type
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: "Smooth", type: "smoothstep" },
                      { label: "Bezier", type: "bezier" },
                      { label: "Straight", type: "straight" },
                    ].map((ct) => (
                      <button
                        key={ct.label}
                        type="button"
                        onClick={() => updateSelectedEdge({ type: ct.type })}
                        className={cn(
                          "rounded-xl border border-border py-1 text-center text-xs font-semibold hover:bg-accent transition",
                          (selectedEdges[0].type ?? "smoothstep") === ct.type &&
                            "bg-primary/10 text-primary border-primary",
                        )}
                      >
                        {ct.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delete Connector Action */}
                <div className="pt-2 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => deleteSelectedEdge(selectedEdges[0].id)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 py-1.5 text-xs font-semibold text-destructive transition hover:bg-destructive hover:text-white active:scale-95"
                  >
                    <Trash2 className="size-3.5" />
                    Delete Connector
                  </button>
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
                  <button
                    type="button"
                    onClick={resetToDeiTemplate}
                    className="col-span-2 flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition hover:bg-emerald-500/20 hover:scale-[1.01] active:scale-98 shadow-xs"
                  >
                    <Sparkles className="size-4" />
                    <span>Load Dei Learning Plan Demo</span>
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          {connectorLabel ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-xs p-4">
              <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl">
                <h3 className="font-semibold text-sm">Connector label</h3>
                <input
                  autoFocus
                  value={connectorLabel.value}
                  onChange={(event) =>
                    setConnectorLabel({ ...connectorLabel, value: event.target.value })
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      pushHistory()
                      setEdges((current) =>
                        current.map((item) =>
                          item.id === connectorLabel.edgeId ? { ...item, label: connectorLabel.value } : item,
                        ),
                      )
                      setConnectorLabel(null)
                    }
                    if (event.key === "Escape") setConnectorLabel(null)
                  }}
                  className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                />
                <div className="mt-4 flex justify-end gap-2">
                  <button type="button" onClick={() => setConnectorLabel(null)} className="rounded-xl px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent">Cancel</button>
                  <button type="button" onClick={() => { pushHistory(); setEdges((current) => current.map((item) => item.id === connectorLabel.edgeId ? { ...item, label: connectorLabel.value } : item)); setConnectorLabel(null) }} className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Save</button>
                </div>
              </div>
            </div>
          ) : null}
          {pendingTemplate ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-xs p-4" onKeyDown={(e) => { if (e.key === "Escape") setPendingTemplate(null) }}>
              <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl">
                <h3 className="font-semibold text-sm">Replace canvas content?</h3>
                <p className="mt-2 text-xs text-muted-foreground">This will replace all nodes, edges, and strokes on the canvas.</p>
                <div className="mt-4 flex justify-end gap-2">
                  <button type="button" onClick={() => setPendingTemplate(null)} className="rounded-xl px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent">Cancel</button>
                  <button type="button" onClick={() => { const kind = pendingTemplate; setPendingTemplate(null); if (kind) applyTemplate(kind) }} className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Replace</button>
                </div>
              </div>
            </div>
          ) : null}
          {commandPaletteOpen ? (
            <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/60 backdrop-blur-xs p-4 pt-24" onKeyDown={(e) => { if (e.key === "Escape") setCommandPaletteOpen(false) }}>
              <div className="w-full max-w-md rounded-3xl border border-border bg-card p-4 shadow-2xl">
                <input
                  autoFocus
                  value={commandQuery}
                  onChange={(e) => setCommandQuery(e.target.value)}
                  placeholder="Type a command..."
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                />
                <ul className="mt-3 max-h-64 overflow-y-auto">
                  {[ 
                    { id: "add-note", label: "Add sticky note", run: () => addNode("note") },
                    { id: "add-text", label: "Add text block", run: () => addNode("text") },
                    { id: "add-task", label: "Add task checklist", run: () => addNode("task") },
                    { id: "tool-pen", label: "Switch to pen tool", run: () => setTool("pen") },
                    { id: "tool-select", label: "Switch to select tool", run: () => setTool("select") },
                    { id: "undo", label: "Undo", run: () => undo() },
                    { id: "redo", label: "Redo", run: () => redo() },
                    { id: "toggle-layers", label: "Toggle layers panel", run: () => setShowLayers((v) => !v) },
                    { id: "shortcuts", label: "Show keyboard shortcuts", run: () => setShowShortcutsModal(true) },
                    { id: "template-dei", label: "Load Dei Learning Plan template", run: () => requestTemplate("dei") },
                    { id: "template-blank", label: "Reset to blank canvas", run: () => requestTemplate("blank") },
                  ].filter((c) => c.label.toLowerCase().includes(commandQuery.toLowerCase())).map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => { c.run(); setCommandPaletteOpen(false); setCommandQuery("") }}
                        className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-accent"
                      >
                        {c.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </HistoryContext.Provider>
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
