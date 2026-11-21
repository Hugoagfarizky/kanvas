/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Check,
  ImageIcon,
  Maximize2,
  Minimize2,
  Pin,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import { Handle, NodeResizer, Position, useReactFlow, type NodeProps } from "@xyflow/react"
import { useRef, useState } from "react"

import type { NodeStyle, NodeType, Size, TaskItem } from "@/types/board"
import { cn } from "@/lib/utils"
import { useHistoryPush } from "@/components/history-context"
import { useTheme } from "@/lib/theme"
import { getOptimalMutedColor, isLightColor } from "@/lib/color"

export type KanvasNodeData = {
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
  const pushHistory = useHistoryPush()

  return (
    <div
      className={cn("group/frame relative h-full w-full", className)}
      style={{
        ...style,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        transformOrigin: "center center",
      }}
    >
      <NodeResizer
        onResizeStart={() => pushHistory?.()}
        isVisible={selected}
        minWidth={90}
        minHeight={50}
        lineClassName="!border-primary/80 !border-2"
        handleClassName="!size-3 !rounded-full !border-2 !border-background !bg-primary !shadow-md transition-transform hover:!scale-150"
      />
      {/* Sleek circular connection handles matching modern canvas tools */}
      <Handle
        type="target"
        position={Position.Left}
        className="!size-3 !rounded-full !border-2 !border-background !bg-primary/70 !shadow-sm transition-all hover:!scale-150 hover:!bg-primary"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!size-3 !rounded-full !border-2 !border-background !bg-primary/70 !shadow-sm transition-all hover:!scale-150 hover:!bg-primary"
      />
      {children}
    </div>
  )
}

const NOTE_TAGS = ["Idea 💡", "Task 📋", "Note 📌", "Plan 🎯", "Urgent ⭐"]

export function NoteNode({ id, data, selected }: NodeProps) {
  const d = data as KanvasNodeData
  const update = useNodeUpdater(id)
  const { theme } = useTheme()

  const isDarkCard = !isLightColor(d.style.fill)
  const textColor = d.style.text || (isDarkCard ? "#f8fafc" : "#1e293b")
  const currentTag = d.data?.tag ?? "Note 📌"

  function cycleTag() {
    const nextIdx = (NOTE_TAGS.indexOf(currentTag) + 1) % NOTE_TAGS.length
    update({ data: { ...d.data, tag: NOTE_TAGS[nextIdx] } })
  }

  return (
    <NodeFrame
      selected={selected}
      style={{
        background: d.style.fill,
        color: textColor,
        border: `1.5px solid ${d.style.stroke}`,
        fontSize: d.style.fontSize ?? 14,
        borderRadius: 24,
        boxShadow:
          theme === "dark"
            ? "0 14px 34px -10px rgba(0,0,0,0.65), 0 3px 8px -2px rgba(0,0,0,0.4)"
            : "0 14px 30px -10px rgba(0,0,0,0.12), 0 3px 8px -2px rgba(0,0,0,0.04)",
      }}
      rotation={d.rotation}
    >
      {/* Chic bento header chip */}
      <div className="flex items-center justify-between px-3.5 pt-2.5 pb-1">
        <button
          type="button"
          onClick={cycleTag}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide transition hover:scale-105 active:scale-95"
          style={{
            backgroundColor: isDarkCard ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.06)",
            color: textColor,
          }}
          title="Click to cycle tag"
        >
          {currentTag}
        </button>
      </div>

      <textarea
        value={d.data.text ?? ""}
        onChange={(event) => update({ data: { ...d.data, text: event.target.value } })}
        className="h-[calc(100%-2.2rem)] w-full resize-none bg-transparent px-3.5 pb-3 font-sans leading-relaxed outline-none placeholder:opacity-40"
        placeholder="Jot down an idea..."
        spellCheck={false}
      />
    </NodeFrame>
  )
}

export function TextNode({ id, data, selected }: NodeProps) {
  const d = data as KanvasNodeData
  const update = useNodeUpdater(id)
  const { theme } = useTheme()

  let effectiveTextColor = d.style.text
  if (!effectiveTextColor || effectiveTextColor === "#1f2937" || effectiveTextColor === "#000000") {
    effectiveTextColor = theme === "dark" ? "#f8fafc" : "#0f172a"
  } else if (effectiveTextColor === "var(--foreground)") {
    effectiveTextColor = theme === "dark" ? "#f8fafc" : "#0f172a"
  }

  return (
    <NodeFrame
      selected={selected}
      style={{
        color: effectiveTextColor,
        fontSize: d.style.fontSize ?? 18,
        fontWeight: 600,
        borderRadius: 14,
      }}
      className={selected ? "bg-accent/20 ring-2 ring-primary/40" : undefined}
      rotation={d.rotation}
    >
      <textarea
        value={d.data.text ?? ""}
        onChange={(event) => update({ data: { ...d.data, text: event.target.value } })}
        className="h-full w-full resize-none bg-transparent p-2 leading-snug outline-none placeholder:text-muted-foreground/45"
        placeholder="Type text..."
        spellCheck={false}
      />
    </NodeFrame>
  )
}

export function TaskNode({ id, data, selected }: NodeProps) {
  const d = data as KanvasNodeData
  const update = useNodeUpdater(id)
  const { theme } = useTheme()
  const taskData = d.data ?? { title: "", items: [] }

  const isDarkCard = !isLightColor(d.style.fill)
  const textColor = d.style.text || (isDarkCard ? "#f8fafc" : "#0f172a")
  const mutedColor = getOptimalMutedColor(d.style.fill, theme === "dark")
  const borderColor = d.style.stroke || (isDarkCard ? "#334155" : "#e2e8f0")

  const total = taskData.items.length
  const doneCount = taskData.items.filter((i: TaskItem) => i.done).length

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
        color: textColor,
        border: `1.5px solid ${borderColor}`,
        fontSize: d.style.fontSize ?? 13,
        borderRadius: 26,
        padding: "14px 16px",
        boxShadow:
          theme === "dark"
            ? "0 16px 36px -10px rgba(0,0,0,0.65)"
            : "0 16px 32px -10px rgba(0,0,0,0.12)",
      }}
      rotation={d.rotation}
    >
      {/* Bento pill header with category badge & progress pill */}
      <div className="mb-2.5 flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{
            backgroundColor: isDarkCard ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.06)",
            color: textColor,
          }}
        >
          <Pin className="size-2.5" />
          Task List
        </span>

        {total > 0 ? (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{
              backgroundColor:
                doneCount === total && total > 0
                  ? "rgba(16, 185, 129, 0.2)"
                  : isDarkCard
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)",
              color: doneCount === total && total > 0 ? "#10b981" : mutedColor,
            }}
          >
            {doneCount === total && total > 0 ? "✓ " : ""}
            {doneCount}/{total} done
          </span>
        ) : null}
      </div>

      <input
        value={taskData.title ?? ""}
        onChange={(event) => update({ data: { ...taskData, title: event.target.value } })}
        placeholder="Task list title"
        className="mb-2.5 w-full bg-transparent font-bold tracking-tight outline-none placeholder:opacity-40"
        style={{ color: textColor }}
        spellCheck={false}
      />

      <div className="space-y-1.5 overflow-y-auto max-h-[calc(100%-4.8rem)] pr-0.5">
        {taskData.items.map((item: TaskItem) => (
          <div
            key={item.id}
            className="group/item flex items-center gap-2 rounded-xl p-1 transition hover:bg-black/5 dark:hover:bg-white/5"
          >
            <button
              type="button"
              onClick={() => updateItem(item.id, { done: !item.done })}
              className={cn(
                "flex size-4.5 shrink-0 items-center justify-center rounded-full border transition",
                item.done
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/80 hover:border-primary/80",
              )}
              style={
                item.done
                  ? undefined
                  : { borderColor: isDarkCard ? "#64748b" : "#cbd5e1" }
              }
              aria-label={item.done ? "Mark as incomplete" : "Mark as completed"}
            >
              {item.done ? <Check className="size-3" strokeWidth={3} /> : null}
            </button>
            <input
              value={item.text}
              onChange={(event) => updateItem(item.id, { text: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  addItem()
                }
              }}
              placeholder="List item..."
              className={cn(
                "min-w-0 flex-1 bg-transparent text-xs outline-none transition placeholder:opacity-40",
                item.done && "line-through opacity-55",
              )}
              style={{ color: item.done ? mutedColor : textColor }}
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="opacity-0 transition group-hover/item:opacity-100 hover:text-destructive"
              style={{ color: mutedColor }}
              aria-label="Remove item"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="mt-2.5 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition hover:bg-black/5 dark:hover:bg-white/5"
        style={{ color: mutedColor }}
      >
        <Plus className="size-3.5" />
        Add task
      </button>
    </NodeFrame>
  )
}

export function ShapeNode({ id, data, selected }: NodeProps) {
  const d = data as KanvasNodeData
  const update = useNodeUpdater(id)
  const { theme } = useTheme()
  const kind = d.data?.kind ?? "rect"

  const isDark = !isLightColor(d.style.fill)
  const textColor = d.style.text || (isDark ? "#f8fafc" : "#0f172a")

  return (
    <NodeFrame
      selected={selected}
      style={{
        color: textColor,
        fontSize: d.style.fontSize ?? 14,
        boxShadow:
          theme === "dark"
            ? "0 12px 30px -10px rgba(0,0,0,0.6)"
            : "0 12px 25px -10px rgba(0,0,0,0.1)",
      }}
      rotation={d.rotation}
    >
      <div className="relative flex h-full w-full items-center justify-center">
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
              rx="48"
              ry="48"
              fill={d.style.fill}
              stroke={d.style.stroke}
              strokeWidth="2"
            />
          ) : kind === "diamond" ? (
            <polygon
              points="50,2 98,50 50,98 2,50"
              fill={d.style.fill}
              stroke={d.style.stroke}
              strokeWidth="2"
            />
          ) : kind === "round-rect" ? (
            <rect
              x="1.5"
              y="1.5"
              width="97"
              height="97"
              rx="24"
              fill={d.style.fill}
              stroke={d.style.stroke}
              strokeWidth="2"
            />
          ) : kind === "pill" ? (
            <rect
              x="1.5"
              y="1.5"
              width="97"
              height="97"
              rx="48"
              fill={d.style.fill}
              stroke={d.style.stroke}
              strokeWidth="2"
            />
          ) : (
            <rect
              x="1.5"
              y="1.5"
              width="97"
              height="97"
              rx="16"
              fill={d.style.fill}
              stroke={d.style.stroke}
              strokeWidth="2"
            />
          )}
        </svg>
        <textarea
          value={d.data?.text ?? ""}
          onChange={(event) => update({ data: { ...d.data, text: event.target.value } })}
          className="relative z-10 max-h-full w-4/5 resize-none bg-transparent p-2 text-center font-semibold leading-snug outline-none placeholder:opacity-40"
          placeholder="Shape label"
          style={{ color: textColor }}
          spellCheck={false}
        />
      </div>
    </NodeFrame>
  )
}

export function FrameNode({ id, data, selected }: NodeProps) {
  const d = data as KanvasNodeData
  const update = useNodeUpdater(id)
  const { theme } = useTheme()

  const titleColor =
    d.style.text && d.style.text !== "#475569"
      ? d.style.text
      : theme === "dark"
        ? "#e2e8f0"
        : "#334155"

  return (
    <NodeFrame
      selected={selected}
      style={{
        border: `2px dashed ${d.style.stroke || (theme === "dark" ? "#475569" : "#94a3b8")}`,
        background: d.style.fill,
        color: titleColor,
        fontSize: d.style.fontSize ?? 12,
        borderRadius: 28,
      }}
      rotation={d.rotation}
    >
      <div className="flex h-full w-full flex-col p-4">
        {/* Scooped / pill frame header tab */}
        <div className="inline-flex self-start items-center gap-2 rounded-full border border-border/80 bg-card/85 px-3 py-1 shadow-xs backdrop-blur-xs">
          <Sparkles className="size-3 text-primary" />
          <input
            value={d.data?.title ?? ""}
            onChange={(event) => update({ data: { ...d.data, title: event.target.value } })}
            placeholder="FRAME ZONE"
            className="bg-transparent font-bold uppercase tracking-[0.14em] outline-none placeholder:opacity-40 text-xs"
            style={{ color: titleColor }}
            spellCheck={false}
          />
        </div>
        <div className="flex-1" />
      </div>
    </NodeFrame>
  )
}

export function ImageNode({ id, data, selected }: NodeProps) {
  const d = data as KanvasNodeData
  const update = useNodeUpdater(id)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fitMode = d.data?.fit ?? "contain"

  function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const src = e.target?.result as string
      if (!src) return

      const img = new Image()
      img.onload = () => {
        const maxWidth = 380
        const scale = Math.min(1, maxWidth / img.naturalWidth)
        const width = Math.max(140, Math.round(img.naturalWidth * scale))
        const height = Math.max(100, Math.round(img.naturalHeight * scale))

        update({
          size: { width, height },
          data: { ...d.data, src, alt: file.name, fit: "contain" },
        })
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  return (
    <NodeFrame
      selected={selected}
      style={{
        border: `1.5px solid ${d.style.stroke || "var(--border)"}`,
        borderRadius: 24,
        overflow: "hidden",
        background: d.style.fill || "var(--card)",
      }}
      rotation={d.rotation}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileSelect(file)
          e.target.value = ""
        }}
      />

      {d.data?.src ? (
        <div
          className="group/img relative h-full w-full"
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <img
            src={d.data.src}
            alt={d.data.alt ?? "Canvas image"}
            className={cn(
              "h-full w-full select-none",
              fitMode === "cover" ? "object-cover" : "object-contain",
            )}
            draggable={false}
          />

          {/* Quick action floating pill overlay */}
          <div className="absolute right-2.5 top-2.5 z-20 flex items-center gap-1 rounded-full border border-border/80 bg-card/90 p-1 opacity-0 shadow-md backdrop-blur-md transition group-hover/img:opacity-100 group-hover/frame:opacity-100">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex size-6.5 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
              title="Replace image from device"
            >
              <RefreshCw className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() =>
                update({
                  data: { ...d.data, fit: fitMode === "contain" ? "cover" : "contain" },
                })
              }
              className="flex size-6.5 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
              title={fitMode === "contain" ? "Switch to cover" : "Switch to contain"}
            >
              {fitMode === "contain" ? (
                <Maximize2 className="size-3.5" />
              ) : (
                <Minimize2 className="size-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => update({ data: { ...d.data, src: "" } })}
              className="flex size-6.5 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
              title="Remove image"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {isDragOver ? (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-primary/20 backdrop-blur-xs">
              <p className="rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                Drop to replace image
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "flex h-full w-full flex-col items-center justify-center gap-2.5 p-5 text-center transition",
            isDragOver ? "bg-primary/10 border-2 border-dashed border-primary" : "bg-card",
          )}
        >
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
            <ImageIcon className="size-5.5" />
          </div>

          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-foreground">Add an image</p>
            <p className="text-[11px] text-muted-foreground">Drop file here or choose from device</p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-xs transition hover:scale-105 active:scale-95"
          >
            <Upload className="size-3.5" />
            Choose file
          </button>

          <div className="flex w-full items-center gap-2 pt-1 text-[10px] text-muted-foreground">
            <span className="h-px flex-1 bg-border/80" />
            <span>or URL</span>
            <span className="h-px flex-1 bg-border/80" />
          </div>

          <input
            placeholder="Paste image URL + Enter"
            className="w-full rounded-full border border-border bg-background px-3 py-1 text-center text-[11px] outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                const target = event.target as HTMLInputElement
                if (target.value.trim()) {
                  update({ data: { ...d.data, src: target.value.trim(), fit: "contain" } })
                }
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
