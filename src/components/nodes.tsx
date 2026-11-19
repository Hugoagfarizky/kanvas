/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NodeResizer, useReactFlow, type NodeProps } from "@xyflow/react"

import type { NodeStyle, NodeType, Size, TaskItem } from "@/types/board"
import { cn } from "@/lib/utils"
import { useHistoryPush } from "@/components/history-context"

type KanvasNodeData = {
  kind: NodeType
  data: any
  style: NodeStyle
  size: Size
  rotation?: number
}

function useNodeUpdater(id: string) {
  const { setNodes } = useReactFlow()
  const pushHistory = useHistoryPush()

  return (patch: Partial<KanvasNodeData>) => {
    pushHistory?.()
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...(node.data as any), ...patch } } : node,
      ),
    )
  }
}

function NodeFrame({
  selected,
  children,
  className,
  style,
  rotation,
}: {
  selected?: boolean
  children: React.ReactNode
  className?: string
  style: React.CSSProperties
  rotation?: number
}) {
  return (
    <div
      className={cn("h-full w-full", className)}
      style={{
        ...style,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        transformOrigin: "center center",
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={80}
        minHeight={40}
        lineClassName="!border-primary"
        handleClassName="!size-2.5 !rounded-sm !border !border-border !bg-card"
      />
      {children}
    </div>
  )
}

export function NoteNode({ id, data, selected }: NodeProps) {
  const d = data as KanvasNodeData
  const update = useNodeUpdater(id)

  return (
    <NodeFrame
      selected={selected}
      style={{
        background: d.style.fill,
        color: d.style.text,
        border: `1px solid ${d.style.stroke}`,
        fontSize: d.style.fontSize ?? 14,
        borderRadius: 10,
        boxShadow: "0 8px 24px -16px rgba(0,0,0,0.45)",
      }}
      rotation={d.rotation}
    >
      <textarea
        value={d.data.text ?? ""}
        onChange={(event) => update({ data: { ...d.data, text: event.target.value } })}
        className="h-full w-full resize-none bg-transparent p-3 outline-none placeholder:text-current/50"
        placeholder="Write a note..."
        spellCheck={false}
      />
    </NodeFrame>
  )
}

export function TextNode({ id, data, selected }: NodeProps) {
  const d = data as KanvasNodeData
  const update = useNodeUpdater(id)

  return (
    <NodeFrame
      selected={selected}
      style={{
        color: d.style.text,
        fontSize: d.style.fontSize ?? 18,
        fontWeight: 500,
      }}
      rotation={d.rotation}
    >
      <textarea
        value={d.data.text ?? ""}
        onChange={(event) => update({ data: { ...d.data, text: event.target.value } })}
        className="h-full w-full resize-none bg-transparent p-1 outline-none"
        placeholder="Text"
        spellCheck={false}
      />
    </NodeFrame>
  )
}

export function TaskNode({ id, data, selected }: NodeProps) {
  const d = data as KanvasNodeData
  const update = useNodeUpdater(id)
  const taskData = d.data ?? { title: "", items: [] }

  function updateItem(itemId: string, patch: Partial<TaskItem>) {
    update({
      data: {
        ...taskData,
        items: taskData.items.map((item: TaskItem) =>
          item.id === itemId ? { ...item, ...patch } : item,
        ),
      },
    })
  }

  function addItem() {
    const newItem: TaskItem = { id: `task_item_${Date.now()}`, text: "", done: false }
    update({ data: { ...taskData, items: [...taskData.items, newItem] } })
  }

  function removeItem(itemId: string) {
    update({
      data: { ...taskData, items: taskData.items.filter((item: TaskItem) => item.id !== itemId) },
    })
  }

  return (
    <NodeFrame
      selected={selected}
      style={{
        background: d.style.fill,
        color: d.style.text,
        border: `1px solid ${d.style.stroke}`,
        fontSize: d.style.fontSize ?? 13,
        borderRadius: 10,
        padding: 10,
      }}
      rotation={d.rotation}
    >
      <input
        value={taskData.title ?? ""}
        onChange={(event) => update({ data: { ...taskData, title: event.target.value } })}
        placeholder="Task list"
        className="mb-2 w-full bg-transparent font-medium outline-none"
        spellCheck={false}
      />
      <div className="space-y-1">
        {taskData.items.map((item: TaskItem) => (
          <div key={item.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={item.done}
              onChange={(event) => updateItem(item.id, { done: event.target.checked })}
              className="size-3.5 shrink-0"
            />
            <input
              value={item.text}
              onChange={(event) => updateItem(item.id, { text: event.target.value })}
              placeholder="Item"
              className={cn(
                "min-w-0 flex-1 bg-transparent outline-none",
                item.done && "text-muted-foreground line-through",
              )}
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="shrink-0 text-muted-foreground transition hover:text-destructive"
              aria-label="Remove item"
            >
              x
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
      >
        + Add item
      </button>
    </NodeFrame>
  )
}

export function ShapeNode({ id, data, selected }: NodeProps) {
  const d = data as KanvasNodeData
  const update = useNodeUpdater(id)
  const kind = d.data?.kind ?? "rect"

  return (
    <NodeFrame
      selected={selected}
      style={{
        color: d.style.text,
        fontSize: d.style.fontSize ?? 14,
      }}
      rotation={d.rotation}
    >
      <div className="relative h-full w-full">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {kind === "ellipse" ? (
            <ellipse
              cx="50"
              cy="50"
              rx="49"
              ry="49"
              fill={d.style.fill}
              stroke={d.style.stroke}
              strokeWidth="1.5"
            />
          ) : kind === "diamond" ? (
            <polygon
              points="50,1 99,50 50,99 1,50"
              fill={d.style.fill}
              stroke={d.style.stroke}
              strokeWidth="1.5"
            />
          ) : (
            <rect
              x="0.75"
              y="0.75"
              width="98.5"
              height="98.5"
              rx="6"
              fill={d.style.fill}
              stroke={d.style.stroke}
              strokeWidth="1.5"
            />
          )}
        </svg>
        <textarea
          value={d.data?.text ?? ""}
          onChange={(event) => update({ data: { ...d.data, text: event.target.value } })}
          className="absolute inset-0 h-full w-full resize-none bg-transparent p-3 text-center outline-none"
          placeholder="Label"
          spellCheck={false}
        />
      </div>
    </NodeFrame>
  )
}

export function FrameNode({ id, data, selected }: NodeProps) {
  const d = data as KanvasNodeData
  const update = useNodeUpdater(id)

  return (
    <NodeFrame
      selected={selected}
      style={{
        border: `2px dashed ${d.style.stroke}`,
        background: d.style.fill,
        color: d.style.text,
        fontSize: d.style.fontSize ?? 12,
        borderRadius: 12,
      }}
      rotation={d.rotation}
    >
      <div className="flex h-full w-full flex-col p-3">
        <input
          value={d.data?.title ?? ""}
          onChange={(event) => update({ data: { ...d.data, title: event.target.value } })}
          placeholder="Frame"
          className="mb-2 bg-transparent font-medium uppercase tracking-[0.12em] outline-none"
          spellCheck={false}
        />
        <div className="flex-1" />
      </div>
    </NodeFrame>
  )
}

export function ImageNode({ id, data, selected }: NodeProps) {
  const d = data as KanvasNodeData
  const update = useNodeUpdater(id)

  return (
    <NodeFrame
      selected={selected}
      style={{
        border: `1px solid ${d.style.stroke}`,
        borderRadius: 10,
        overflow: "hidden",
        background: d.style.fill,
      }}
      rotation={d.rotation}
    >
      {d.data?.src ? (
        <img
          src={d.data.src}
          alt={d.data.alt ?? ""}
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>No image</span>
          <input
            placeholder="Paste image URL"
            className="w-4/5 rounded border border-border bg-card px-2 py-1 text-xs"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                update({ data: { ...d.data, src: (event.target as HTMLInputElement).value } })
              }
            }}
          />
        </div>
      )}
    </NodeFrame>
  )
}

export const nodeTypes = {
  "kanvas-note": NoteNode,
  "kanvas-text": TextNode,
  "kanvas-task": TaskNode,
  "kanvas-shape": ShapeNode,
  "kanvas-frame": FrameNode,
  "kanvas-image": ImageNode,
}
