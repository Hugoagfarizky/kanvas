/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
  type Viewport,
} from "@xyflow/react"
import { applyEdgeChanges, applyNodeChanges } from "@xyflow/system"
import { useCallback, useEffect, useRef, useState } from "react"

import "@xyflow/react/dist/style.css"

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
    strokes: unknown[]
  }
  onViewportChange: (viewport: Viewport) => void
  onNodesPersist: (nodes: KanvasNode[], edges: any[]) => void
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
  const d = (fn.data ?? {}) as {
    kind: NodeType
    data: any
    style: NodeStyle
    size: Size
    rotation?: number
  }

  return {
    id: fn.id,
    type: d.kind,
    position: { x: fn.position.x, y: fn.position.y },
    size: {
      width: fn.width ?? d.size?.width ?? DEFAULT_SIZES[d.kind].width,
      height: fn.height ?? d.size?.height ?? DEFAULT_SIZES[d.kind].height,
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
    color: (fe.style as { stroke?: string } | undefined)?.stroke,
  }
}

export function BoardCanvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <BoardCanvasInner {...props} />
    </ReactFlowProvider>
  )
}

function BoardCanvasInner({ board, onViewportChange, onNodesPersist }: CanvasProps) {
  const reactFlow = useReactFlow()
  const [nodes, setNodes] = useState<Node[]>(() => board.nodes.map(toFlowNode))
  const [edges, setEdges] = useState<Edge[]>(() => board.edges.map(toFlowEdge))
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(
    null,
  )
  const mounted = useRef(false)
  const persistTimer = useRef<number | null>(null)

  const selectedNode = nodes.find((node) => node.selected) ?? null

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }

    if (persistTimer.current) window.clearTimeout(persistTimer.current)
    persistTimer.current = window.setTimeout(() => {
      onNodesPersist(nodes.map(toKanvasNode), edges.map(toKanvasEdge))
    }, 400)

    return () => {
      if (persistTimer.current) window.clearTimeout(persistTimer.current)
    }
  }, [nodes, edges, onNodesPersist])

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
      if (event.metaKey || event.ctrlKey || event.altKey) return

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
  }, [reactFlow, nodes.length])

  function addNode(kind: NodeType) {
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

    const clone: Node = {
      ...source,
      id: createId("node"),
      position: { x: source.position.x + 24, y: source.position.y + 24 },
      selected: true,
      data: source.data ? { ...(source.data as any) } : source.data,
    }

    setNodes((current) => [...current.map((node) => ({ ...node, selected: false })), clone])
  }

  function deleteNode(nodeId: string) {
    setNodes((current) => current.filter((node) => node.id !== nodeId))
  }

  function updateSelected(
    patch: Partial<{ style: Partial<NodeStyle>; rotation: number; data: any }>,
  ) {
    if (!selectedNode) return

    setNodes((current) =>
      current.map((node) => {
        if (node.id !== selectedNode.id) return node
        const nextData = { ...(node.data as any) }
        if (patch.style) nextData.style = { ...(nextData.style as any), ...patch.style }
        if (patch.rotation !== undefined) nextData.rotation = patch.rotation
        if (patch.data) nextData.data = { ...(nextData.data as any), ...patch.data }
        return { ...node, data: nextData }
      }),
    )
  }

  const isEmpty = nodes.length === 0 && edges.length === 0

  return (
    <div className="absolute inset-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onMoveEnd={handleMoveEnd}
        onNodeContextMenu={(event, node) => {
          event.preventDefault()
          setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id })
        }}
        onPaneClick={() => setContextMenu(null)}
        minZoom={0.1}
        maxZoom={4}
        panOnScroll
        zoomOnScroll
        zoomOnPinch
        panOnDrag
        selectionOnDrag={false}
        deleteKeyCode={["Delete", "Backspace"]}
        multiSelectionKeyCode="Shift"
        proOptions={{ hideAttribution: true }}
        className="bg-background"
        fitView={false}
        defaultViewport={board.viewport}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.25} color="var(--grid-dot)" />
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
      </ReactFlow>

      {/* Toolbar */}
      <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5 rounded-2xl border border-border bg-card/90 p-1.5 shadow-sm backdrop-blur">
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
      </div>

      {/* Style panel */}
      {selectedNode ? (
        <div className="absolute bottom-3 right-3 z-10 w-64 rounded-2xl border border-border bg-card/95 p-3 shadow-sm backdrop-blur">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Style
          </p>
          <div className="space-y-2.5">
            <ColorRow
              label="Fill"
              value={(selectedNode.data as any).style?.fill ?? "#ffffff"}
              onChange={(value) => updateSelected({ style: { fill: value } })}
            />
            <ColorRow
              label="Stroke"
              value={(selectedNode.data as any).style?.stroke ?? "#000000"}
              onChange={(value) => updateSelected({ style: { stroke: value } })}
            />
            <ColorRow
              label="Text"
              value={(selectedNode.data as any).style?.text ?? "#000000"}
              onChange={(value) => updateSelected({ style: { text: value } })}
            />
            <NumberRow
              label="Font size"
              value={(selectedNode.data as any).style?.fontSize ?? 14}
              onChange={(value) => updateSelected({ style: { fontSize: value } })}
            />
            <NumberRow
              label="Rotation"
              value={(selectedNode.data as any).rotation ?? 0}
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

      {/* Empty hint */}
      {isEmpty ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="max-w-sm rounded-3xl border border-border bg-card/85 p-6 text-center shadow-[0_24px_70px_-45px_rgba(0,0,0,0.45)] backdrop-blur-sm">
            <p className="font-display text-2xl tracking-tight">A blank canvas.</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Use the toolbar to add notes, text, tasks, shapes, frames and images. Drag to pan,
              scroll to zoom.
            </p>
          </div>
        </div>
      ) : null}
    </div>
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
