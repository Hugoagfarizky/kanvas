import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useReactFlow,
  ViewportPortal,
  type Edge,
  type Node,
  type Viewport,
} from "@xyflow/react"
import { applyEdgeChanges, applyNodeChanges } from "@xyflow/system"
import { getStroke } from "perfect-freehand"
import { useCallback, useEffect, useRef, useState } from "react"

import "@xyflow/react/dist/style.css"

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { HistoryContext } from "@/components/history-context"
import { nodeTypes } from "@/components/nodes"
import type { KanvasNode, NodeStyle, NodeType, Size } from "@/types/board"
import { createId } from "@/lib/id"

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

const DEFAULT_STYLES: Record<NodeType, NodeStyle> = {
  note: { fill: "#fef3c7", stroke: "#f59e0b", text: "#1f2937", fontSize: 14 },
  text: { fill: "transparent", stroke: "transparent", text: "#1f2937", fontSize: 18 },
  task: { fill: "#ffffff", stroke: "#94a3b8", text: "#1f2937", fontSize: 13 },
  shape: { fill: "#dbeafe", stroke: "#3b82f6", text: "#1f2937", fontSize: 14 },
  frame: { fill: "rgba(148,163,184,0.08)", stroke: "#94a3b8", text: "#475569", fontSize: 12 },
  image: { fill: "#f1f5f9", stroke: "#cbd5e1", text: "#475569", fontSize: 12 },
}

const DEFAULT_SIZES: Record<NodeType, Size> = {
  note: { width: 220, height: 160 },
  text: { width: 220, height: 60 },
  task: { width: 260, height: 200 },
  shape: { width: 160, height: 160 },
  frame: { width: 320, height: 240 },
  image: { width: 240, height: 180 },
}

function defaultNodeData(kind: NodeType): any {
  switch (kind) {
    case "note":
      return { text: "" }
    case "text":
      return { text: "" }
    case "task":
      return { title: "", items: [] }
    case "shape":
      return { kind: "rect", text: "" }
    case "frame":
      return { title: "Frame" }
    case "image":
      return { src: "", alt: "" }
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
    style: e.color ? { stroke: e.color } : undefined,
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
        event.preventDefault()
        if (!clipboard.current) return
        pushHistory()
        const idMap = new Map<string, string>()
        const newNodes = clipboard.current.nodes.map((node) => {
          const newId = createId("node")
          idMap.set(node.id, newId)
          return {
            ...cloneNode(node),
            id: newId,
            position: { x: node.position.x + 40, y: node.position.y + 40 },
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
  }, [reactFlow, nodes, edges, undo, redo])

  function addNode(kind: NodeType) {
    pushHistory()
    const center = reactFlow.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    })

    const id = createId("node")
    const size = DEFAULT_SIZES[kind]
    const newNode: Node = {
      id,
      type: `kanvas-${kind}`,
      position: { x: center.x - size.width / 2, y: center.y - size.height / 2 },
      width: size.width,
      height: size.height,
      style: { width: size.width, height: size.height },
      data: {
        kind,
        data: defaultNodeData(kind),
        style: DEFAULT_STYLES[kind],
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
    setStrokes((prev) => prev.flatMap((stroke: any) => splitStroke(stroke, point, 12)))
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
    setCurrentStroke({
      id: createId("stroke"),
      tool,
      points: [[pos.x, pos.y, 0.5]],
      color: tool === "highlighter" ? "#facc15" : "#1f2937",
      size: tool === "highlighter" ? 14 : 3,
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

  const isEmpty = nodes.length === 0 && edges.length === 0

  return (
    <HistoryContext.Provider value={{ push: pushHistory }}>
      <div className="absolute inset-0">
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
            setEdges((eds) => addEdge(connection, eds))
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
              { id: createId("edge"), source: connectSource, target: node.id, type: "default" },
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
          nodesDraggable={tool === "select" || tool === "hand"}
          panOnDrag={tool === "select" || tool === "hand"}
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
            gap={22}
            size={1.25}
            color="var(--grid-dot)"
          />
          <Controls
            showZoom
            showFitView
            showInteractive={false}
            className="!border-border !bg-card/90 !shadow-sm [&_button]:!border-border [&_button]:!bg-card [&_button]:!text-foreground"
          />
          <MiniMap
            className="!border-border !bg-card/80"
            nodeColor="var(--color-muted-foreground)"
            maskColor="color-mix(in srgb, var(--background) 65%, transparent)"
            pannable
            zoomable
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
                  fillOpacity={stroke.tool === "highlighter" ? 0.35 : 1}
                  stroke="none"
                />
              ))}
              {currentStroke ? (
                <path
                  d={strokeToPath(currentStroke)}
                  fill={currentStroke.color}
                  fillOpacity={currentStroke.tool === "highlighter" ? 0.35 : 1}
                  stroke="none"
                />
              ) : null}
            </svg>
          </ViewportPortal>
        </ReactFlow>

        {/* Tool selector */}
        <div className="absolute right-3 top-3 z-40 flex flex-wrap gap-1.5 rounded-2xl border border-border bg-card/90 p-1.5 shadow-sm backdrop-blur">
          {(["select", "pen", "highlighter", "eraser", "connect"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTool(t)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition hover:bg-accent ${tool === t ? "bg-accent text-accent-foreground" : ""}`}
              title={t}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Node creation toolbar */}
        <div className="absolute left-3 top-3 z-40 flex flex-wrap gap-1.5 rounded-2xl border border-border bg-card/90 p-1.5 shadow-sm backdrop-blur">
          {(
            [
              ["note", "Note"],
              ["text", "Text"],
              ["task", "Task"],
              ["shape", "Shape"],
              ["frame", "Frame"],
              ["image", "Image"],
            ] as [NodeType, string][]
          ).map(([kind, label]) => (
            <button
              key={kind}
              type="button"
              onClick={() => addNode(kind)}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium transition hover:bg-accent"
              title={`Add ${label}`}
            >
              {label}
            </button>
          ))}
          <span className="mx-1 w-px bg-border" />
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium transition hover:bg-accent disabled:opacity-40"
            title="Undo (Ctrl+Z)"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium transition hover:bg-accent disabled:opacity-40"
            title="Redo (Ctrl+Shift+Z)"
          >
            Redo
          </button>
        </div>

        {/* Arrange panel */}
        {selectedNodes.length >= 2 ? (
          <div className="absolute left-3 top-16 z-40 flex flex-wrap gap-1.5 rounded-2xl border border-border bg-card/90 p-1.5 shadow-sm backdrop-blur">
            <button
              type="button"
              onClick={() => alignNodes("left")}
              className="rounded-lg px-2 py-1 text-xs font-medium transition hover:bg-accent"
              title="Align left"
            >
              L
            </button>
            <button
              type="button"
              onClick={() => alignNodes("centerX")}
              className="rounded-lg px-2 py-1 text-xs font-medium transition hover:bg-accent"
              title="Align center"
            >
              C
            </button>
            <button
              type="button"
              onClick={() => alignNodes("right")}
              className="rounded-lg px-2 py-1 text-xs font-medium transition hover:bg-accent"
              title="Align right"
            >
              R
            </button>
            <button
              type="button"
              onClick={() => alignNodes("top")}
              className="rounded-lg px-2 py-1 text-xs font-medium transition hover:bg-accent"
              title="Align top"
            >
              T
            </button>
            <button
              type="button"
              onClick={() => alignNodes("centerY")}
              className="rounded-lg px-2 py-1 text-xs font-medium transition hover:bg-accent"
              title="Align middle"
            >
              M
            </button>
            <button
              type="button"
              onClick={() => alignNodes("bottom")}
              className="rounded-lg px-2 py-1 text-xs font-medium transition hover:bg-accent"
              title="Align bottom"
            >
              B
            </button>
            {selectedNodes.length >= 3 ? (
              <>
                <span className="mx-1 w-px bg-border" />
                <button
                  type="button"
                  onClick={() => distributeNodes("horizontal")}
                  className="rounded-lg px-2 py-1 text-xs font-medium transition hover:bg-accent"
                  title="Distribute horizontally"
                >
                  DH
                </button>
                <button
                  type="button"
                  onClick={() => distributeNodes("vertical")}
                  className="rounded-lg px-2 py-1 text-xs font-medium transition hover:bg-accent"
                  title="Distribute vertically"
                >
                  DV
                </button>
              </>
            ) : null}
          </div>
        ) : null}

        {/* Style panel */}
        {selectedNodes.length === 1 ? (
          <div className="absolute bottom-3 right-3 z-40 w-64 rounded-2xl border border-border bg-card/95 p-3 shadow-sm backdrop-blur">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Style
            </p>
            <div className="space-y-2.5">
              <ColorRow
                label="Fill"
                value={(selectedNodes[0].data as any).style?.fill ?? "#ffffff"}
                onChange={(value) => updateSelected({ style: { fill: value } })}
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
              <NumberRow
                label="Font size"
                value={(selectedNodes[0].data as any).style?.fontSize ?? 14}
                onChange={(value) => updateSelected({ style: { fontSize: value } })}
              />
              <NumberRow
                label="Rotation"
                value={(selectedNodes[0].data as any).rotation ?? 0}
                onChange={(value) => updateSelected({ rotation: value })}
              />
            </div>
          </div>
        ) : null}

        {/* Context menu */}
        {contextMenu ? (
          <div
            className="fixed z-50 min-w-36 rounded-xl border border-border bg-card p-1 shadow-lg"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              type="button"
              onClick={() => {
                duplicateNode(contextMenu.nodeId)
                setContextMenu(null)
              }}
              className="block w-full rounded-lg px-3 py-1.5 text-left text-sm transition hover:bg-accent"
            >
              Duplicate
            </button>
            <button
              type="button"
              onClick={() => {
                deleteNode(contextMenu.nodeId)
                setContextMenu(null)
              }}
              className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-destructive transition hover:bg-destructive/10"
            >
              Delete
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

        {/* Empty hint */}
        {isEmpty ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="max-w-sm rounded-3xl border border-border bg-card/85 p-6 text-center shadow-[0_24px_70px_-45px_rgba(0,0,0,0.45)] backdrop-blur-sm">
              <p className="font-display text-2xl tracking-tight">A blank canvas.</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Use the toolbar to add nodes or draw. Shift+drag to select.
              </p>
            </div>
          </div>
        ) : null}
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
  return (
    <label className="flex items-center justify-between gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <input
        type="color"
        value={value && value.startsWith("#") ? value : "#000000"}
        onChange={(event) => onChange(event.target.value)}
        className="size-7 cursor-pointer rounded border border-border bg-transparent"
      />
    </label>
  )
}

function NumberRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-20 rounded border border-border bg-background px-2 py-1 text-right text-xs"
      />
    </label>
  )
}
