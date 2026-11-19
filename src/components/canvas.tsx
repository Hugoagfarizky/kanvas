import { useCallback, useEffect, useMemo, useRef } from "react"
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Viewport,
} from "@xyflow/react"

import "@xyflow/react/dist/style.css"
import type { Board } from "@/types/board"

type BoardCanvasProps = {
  board: Board
  onViewportChange: (viewport: Viewport) => void
}

function BoardCanvasInner({ board, onViewportChange }: BoardCanvasProps) {
  const reactFlow = useReactFlow()
  const containerRef = useRef<HTMLDivElement>(null)
  const isEmpty = board.nodes.length === 0 && board.edges.length === 0 && board.strokes.length === 0

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
        if (board.nodes.length > 0) {
          void reactFlow.fitView({ duration: 200, padding: 0.2 })
        } else {
          reactFlow.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 200 })
        }
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [reactFlow, board.nodes.length])

  const nodeTypes = useMemo(() => ({}), [])
  const edgeTypes = useMemo(() => ({}), [])

  return (
    <div ref={containerRef} className="absolute inset-0">
      <ReactFlow
        defaultViewport={board.viewport}
        nodes={[]}
        edges={[]}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onMoveEnd={handleMoveEnd}
        minZoom={0.1}
        maxZoom={4}
        panOnScroll
        zoomOnScroll
        zoomOnPinch
        panOnDrag
        selectionOnDrag={false}
        proOptions={{ hideAttribution: true }}
        className="bg-background"
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

      {isEmpty ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="max-w-sm rounded-3xl border border-border bg-card/85 p-6 text-center shadow-[0_24px_70px_-45px_rgba(0,0,0,0.45)] backdrop-blur-sm">
            <p className="font-display text-2xl tracking-tight">A blank canvas.</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Drag to pan, scroll to zoom. Nodes, ink and connectors arrive in the next milestones.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <Kbd>drag</Kbd>
              <span>pan</span>
              <Kbd>scroll</Kbd>
              <span>zoom</span>
              <Kbd>0</Kbd>
              <span>reset</span>
              <Kbd>+</Kbd>
              <Kbd>-</Kbd>
              <span>zoom</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function BoardCanvas(props: BoardCanvasProps) {
  return (
    <ReactFlowProvider>
      <BoardCanvasInner {...props} />
    </ReactFlowProvider>
  )
}

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex min-w-5 items-center justify-center rounded border border-border bg-background px-1.5 py-0.5 font-sans text-[10px] font-medium text-foreground shadow-sm">
      {children}
    </kbd>
  )
}
