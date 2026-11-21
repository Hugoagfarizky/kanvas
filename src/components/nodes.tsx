/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Activity,
  Check,
  Clock,
  Heart,
  Headphones,
  ImageIcon,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Pause,
  Pin,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  Video,
  Volume2,
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

function useNodeActions(id: string) {
  const { setNodes } = useReactFlow()
  const pushHistory = useHistoryPush()

  const update = (patch: Partial<KanvasNodeData>) => {
    pushHistory?.()
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...(node.data as any), ...patch } } : node,
      ),
    )
  }

  const remove = () => {
    pushHistory?.()
    setNodes((nodes) => nodes.filter((node) => node.id !== id))
  }

  return { update, remove }
}

function useNodeUpdater(id: string) {
  return useNodeActions(id).update
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
        className="!size-2.5 !rounded-full !border-2 !border-background !bg-emerald-500/80 !shadow-sm transition-all hover:!scale-150 hover:!bg-emerald-500 opacity-0 group-hover/frame:opacity-100"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!size-2.5 !rounded-full !border-2 !border-background !bg-emerald-500/80 !shadow-sm transition-all hover:!scale-150 hover:!bg-emerald-500 opacity-0 group-hover/frame:opacity-100"
      />
      {children}
    </div>
  )
}

const NOTE_TAGS = ["Idea 💡", "Task 📋", "Note 📌", "Plan 🎯", "Urgent ⭐"]
const BADGE_ICONS = ["+", "🧠", "🩺", "🔬", "⭐"]

export function NoteNode({ id, data, selected }: NodeProps) {
  const d = data as KanvasNodeData
  const { update, remove } = useNodeActions(id)
  const { theme } = useTheme()

  const isDarkCard = !isLightColor(d.style.fill)
  const textColor = d.style.text || (isDarkCard ? "#f8fafc" : "#1e293b")
  const currentTag = d.data?.tag ?? "Note 📌"

  function cycleTag() {
    const nextIdx = (NOTE_TAGS.indexOf(currentTag) + 1) % NOTE_TAGS.length
    update({ data: { ...d.data, tag: NOTE_TAGS[nextIdx] } })
  }

  function cycleBadgeIcon() {
    const cur = d.data?.badgeIcon || "+"
    const nextIdx = (BADGE_ICONS.indexOf(cur) + 1) % BADGE_ICONS.length
    update({ data: { ...d.data, badgeIcon: BADGE_ICONS[nextIdx] } })
  }

  function toggleStatus() {
    const nextStatus = d.data?.status === "Completed" ? "Upcoming" : "Completed"
    update({ data: { ...d.data, status: nextStatus } })
  }

  // --- 0A. CLINICAL PATIENT BANNER (Reference 1: Cardiology) ---
  if (d.data?.isClinical) {
    return (
      <NodeFrame
        selected={selected}
        style={{
          background: theme === "dark" ? "#161922" : "#ffffff",
          color: theme === "dark" ? "#f8fafc" : "#0f172a",
          border: `1.5px solid ${theme === "dark" ? "rgba(255,255,255,0.12)" : "#e2e8f0"}`,
          borderRadius: 28,
          boxShadow:
            theme === "dark"
              ? "0 18px 40px -10px rgba(0,0,0,0.7)"
              : "0 18px 36px -10px rgba(0,0,0,0.08)",
        }}
      >
        <div className="flex h-full w-full flex-col justify-between p-4.5">
          <div className="flex items-center justify-between gap-4">
            {/* Patient Photo & Info */}
            <div className="flex items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-200 to-rose-200 text-2xl shadow-xs ring-2 ring-white/50">
                👩
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {d.data.patient?.gender ?? "Female"}, {d.data.patient?.age ?? 24}
                </span>
                <h4 className="font-sans text-base font-bold tracking-tight text-foreground">
                  {d.data.patient?.name ?? "Tiffany Woodward"}
                </h4>
              </div>
            </div>

            {/* Diagnosis & Vitals */}
            <div className="flex items-center gap-6 border-l border-border/60 pl-6">
              <div>
                <span className="text-[10px] font-medium text-muted-foreground">Diagnosis</span>
                <p className="font-sans text-sm font-bold text-foreground">
                  {d.data.diagnosis ?? "Hypertension"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-secondary/50 px-2.5 py-1 text-center">
                  <span className="text-[9px] text-muted-foreground block">Heart Rate</span>
                  <span className="font-sans text-xs font-bold text-foreground">
                    {d.data.vitals?.hr ?? "89 bpm"}
                  </span>
                </div>
                <div className="rounded-xl bg-secondary/50 px-2.5 py-1 text-center">
                  <span className="text-[9px] text-muted-foreground block">Pressure</span>
                  <span className="font-sans text-xs font-bold text-foreground">
                    {d.data.vitals?.bp ?? "100/67"}
                  </span>
                </div>
                <div className="rounded-xl bg-secondary/50 px-2.5 py-1 text-center">
                  <span className="text-[9px] text-muted-foreground block">Oxygen</span>
                  <span className="font-sans text-xs font-bold text-foreground">
                    {d.data.vitals?.o2 ?? "98%"}
                  </span>
                </div>
                <div className="rounded-xl bg-secondary/50 px-2.5 py-1 text-center">
                  <span className="text-[9px] text-muted-foreground block">Temperature</span>
                  <span className="font-sans text-xs font-bold text-foreground">
                    {d.data.vitals?.temp ?? "36.8°C"}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={remove}
              className="text-muted-foreground hover:text-destructive p-1 rounded-full transition"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Sub-filter pills from Reference 1 */}
          <div className="mt-2 flex items-center gap-2 border-t border-border/50 pt-2 text-[11px]">
            {["Office Visits", "Medications", "Labs", "Procedures", "Hospitalizations", "Imaging"].map(
              (chip, idx) => (
                <span
                  key={chip}
                  className={cn(
                    "rounded-full px-2.5 py-0.5 font-medium transition cursor-pointer",
                    idx === 0
                      ? "bg-foreground text-background font-semibold"
                      : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {chip}
                </span>
              ),
            )}
          </div>
        </div>
      </NodeFrame>
    )
  }

  // --- 0B. BLOOD PRESSURE CHART CARD (Reference 1) ---
  if (d.data?.chartType === "bp") {
    const isUp = d.data.chartDelta?.startsWith("+")
    return (
      <NodeFrame
        selected={selected}
        style={{
          background: theme === "dark" ? "#1a1e29" : "#ffffff",
          color: theme === "dark" ? "#f8fafc" : "#0f172a",
          border: `1.5px solid ${theme === "dark" ? "rgba(255,255,255,0.12)" : "#e2e8f0"}`,
          borderRadius: 24,
          boxShadow:
            theme === "dark"
              ? "0 14px 34px -10px rgba(0,0,0,0.6)"
              : "0 14px 30px -10px rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex h-full w-full flex-col justify-between p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-sans text-xs font-bold text-foreground">
                {d.data.title ?? "Blood Pressure"}
              </h5>
              <span className="text-[10px] text-muted-foreground">{d.data.subtitle}</span>
            </div>
            <div className="flex size-6 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Activity className="size-3.5" />
            </div>
          </div>

          {/* Dynamic Wave Graph SVG */}
          <div className="my-1.5 h-12 w-full overflow-hidden rounded-xl bg-amber-50/60 dark:bg-amber-950/20 p-1 flex items-center justify-center">
            <svg
              className="w-full h-full text-amber-500 fill-none stroke-current"
              viewBox="0 0 100 30"
              preserveAspectRatio="none"
            >
              <path d="M 0 20 Q 25 5 50 15 T 100 10" strokeWidth="2.5" />
              <path
                d="M 0 20 Q 25 5 50 15 T 100 10 L 100 30 L 0 30 Z"
                className="fill-amber-400/20 stroke-none"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-muted-foreground text-[10px]">Average: {d.data.chartValue}</span>
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px]",
                isUp
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
              )}
            >
              {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {d.data.chartDelta}
            </span>
          </div>
        </div>
      </NodeFrame>
    )
  }

  // --- 0C. ECG CARDIAC WAVE CARD (Reference 1) ---
  if (d.data?.chartType === "ecg") {
    return (
      <NodeFrame
        selected={selected}
        style={{
          background: theme === "dark" ? "#1a1e29" : "#ffffff",
          color: theme === "dark" ? "#f8fafc" : "#0f172a",
          border: `1.5px solid ${theme === "dark" ? "rgba(255,255,255,0.12)" : "#e2e8f0"}`,
          borderRadius: 24,
          boxShadow:
            theme === "dark"
              ? "0 14px 34px -10px rgba(0,0,0,0.6)"
              : "0 14px 30px -10px rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex h-full w-full flex-col justify-between p-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Heart className="size-3.5 text-rose-500 fill-current animate-pulse" />
              <h5 className="font-sans text-xs font-bold text-foreground">ECG Rhythm</h5>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {d.data.subtitle ?? "Normal Sinus"}
            </span>
          </div>

          {/* Real ECG Sinus Wave SVG */}
          <div className="my-1 h-12 w-full overflow-hidden rounded-xl bg-slate-900 px-1 py-1 flex items-center">
            <svg
              className="w-full h-8 text-emerald-400 fill-none stroke-current"
              viewBox="0 0 160 30"
              preserveAspectRatio="none"
            >
              <path
                d="M 0 15 L 30 15 L 35 12 L 40 18 L 45 15 L 60 15 L 65 3 L 72 27 L 78 15 L 90 15 L 98 9 L 105 15 L 160 15"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Lead II • 25mm/s</span>
            <span className="text-emerald-500 font-semibold">Active</span>
          </div>
        </div>
      </NodeFrame>
    )
  }

  // --- 0D. UX FLOW FORM CARD (Reference 2: Figma / System flow) ---
  if (d.data?.isForm) {
    const fields = d.data.formFields ?? []
    return (
      <NodeFrame
        selected={selected}
        style={{
          background: theme === "dark" ? "#1a1e29" : "#ffffff",
          color: theme === "dark" ? "#f8fafc" : "#0f172a",
          border: `1.5px solid ${theme === "dark" ? "rgba(255,255,255,0.12)" : "#e2e8f0"}`,
          borderRadius: 24,
          boxShadow:
            theme === "dark"
              ? "0 14px 34px -10px rgba(0,0,0,0.6)"
              : "0 14px 30px -10px rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex h-full w-full flex-col justify-between p-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                Instructions
              </span>
              <button
                type="button"
                onClick={remove}
                className="text-muted-foreground hover:text-destructive transition"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <h4 className="font-sans text-sm font-bold text-foreground mt-0.5">{d.data.title}</h4>
            {d.data.subtitle ? (
              <p className="text-[11px] text-muted-foreground mt-0.5">{d.data.subtitle}</p>
            ) : null}
          </div>

          <div className="my-2 space-y-1.5 overflow-hidden">
            {fields.map((field: string) => {
              if (
                field.startsWith("Sign up button") ||
                field === "Sign up" ||
                field === "Join" ||
                field === "Resend the link"
              ) {
                return (
                  <button
                    key={field}
                    type="button"
                    className="w-full rounded-xl bg-blue-600 py-1.5 text-center text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition"
                  >
                    {field.replace(" button", "")}
                  </button>
                )
              }
              if (field.includes("Google") || field.includes("Facebook")) {
                return (
                  <button
                    key={field}
                    type="button"
                    className="w-full rounded-xl border border-border/80 bg-secondary/50 py-1 text-center text-[11px] font-semibold text-foreground hover:bg-secondary active:scale-95 transition"
                  >
                    {field}
                  </button>
                )
              }
              return (
                <div
                  key={field}
                  className="flex items-center justify-between rounded-lg border border-border/70 bg-secondary/30 px-2.5 py-1 text-xs text-muted-foreground"
                >
                  <span>{field}</span>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/50 pt-2">
            <span>UX Component</span>
            <span className="font-semibold text-blue-500">Active</span>
          </div>
        </div>
      </NodeFrame>
    )
  }

  // --- 0E. MEDICATION PILL (Reference 1: Cardiology) ---
  if (d.data?.isMedication) {
    return (
      <NodeFrame
        selected={selected}
        style={{
          background: theme === "dark" ? "#1e293b" : "#334155",
          color: "#f8fafc",
          border: "1.5px solid rgba(255,255,255,0.15)",
          borderRadius: 9999,
          boxShadow: "0 6px 16px -4px rgba(0,0,0,0.4)",
        }}
      >
        <div className="flex h-full w-full items-center justify-between px-3.5 py-1">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-white/20 text-xs shadow-inner">
              💊
            </span>
            <span className="font-sans text-xs font-bold tracking-tight text-white">
              {d.data.title ?? "Aspirin x2"}
            </span>
          </div>
          <button
            type="button"
            onClick={remove}
            className="text-white/60 hover:text-white transition p-0.5"
          >
            <X className="size-3" />
          </button>
        </div>
      </NodeFrame>
    )
  }

  // --- 0F. SYMPTOMS CARD (Reference 1: Cardiology) ---
  if (d.data?.isSymptoms) {
    return (
      <NodeFrame
        selected={selected}
        style={{
          background: theme === "dark" ? "#1a1e29" : "#ffffff",
          color: theme === "dark" ? "#f8fafc" : "#0f172a",
          border: `1.5px solid ${theme === "dark" ? "rgba(255,255,255,0.12)" : "#e2e8f0"}`,
          borderRadius: 24,
          boxShadow:
            theme === "dark"
              ? "0 14px 34px -10px rgba(0,0,0,0.6)"
              : "0 14px 30px -10px rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex h-full w-full flex-col justify-between p-3.5">
          <div className="flex items-center justify-between">
            <h5 className="font-sans text-xs font-bold text-foreground">Symptoms</h5>
            <span className="text-xs">⚖️</span>
          </div>

          {/* Human silhouette with pain marker */}
          <div className="relative my-1 flex h-14 w-full items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900/60 py-1">
            <svg
              className="h-12 w-8 text-slate-400 dark:text-slate-600 fill-current"
              viewBox="0 0 24 48"
            >
              <circle cx="12" cy="6" r="5" />
              <path d="M 6 14 C 6 12 18 12 18 14 L 18 28 L 15 28 L 15 44 L 9 44 L 9 28 L 6 28 Z" />
            </svg>
            <span className="absolute top-5 left-1/2 -translate-x-1/2 size-3 animate-ping rounded-full bg-rose-500 opacity-75" />
            <span className="absolute top-5 left-1/2 -translate-x-1/2 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </div>

          <div className="flex items-center justify-between">
            <span className="rounded-full bg-rose-100 dark:bg-rose-950/80 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">
              Headache reported
            </span>
            <span className="text-[10px] text-muted-foreground">Office visit</span>
          </div>
        </div>
      </NodeFrame>
    )
  }

  // --- 0G. MONTH TIMELINE SCRUBBER (Reference 1: Cardiology) ---
  if (d.data?.isScrubber) {
    return (
      <NodeFrame
        selected={selected}
        style={{
          background: theme === "dark" ? "#161922" : "#ffffff",
          color: theme === "dark" ? "#f8fafc" : "#0f172a",
          border: `1.5px solid ${theme === "dark" ? "rgba(255,255,255,0.12)" : "#e2e8f0"}`,
          borderRadius: 9999,
          boxShadow:
            theme === "dark"
              ? "0 14px 34px -10px rgba(0,0,0,0.6)"
              : "0 14px 30px -10px rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex h-full w-full items-center justify-between px-5 text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-1.5 text-foreground font-bold">
            <span>📅</span>
            <span>Jan 2022</span>
          </div>
          {["Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((m) => (
            <span key={m} className="hover:text-foreground cursor-pointer transition">
              {m}
            </span>
          ))}
          <div className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-white shadow-xs">
            <span className="text-amber-400 font-bold">Aug (3)</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">Sep (6)</span>
          </div>
        </div>
      </NodeFrame>
    )
  }

  // --- 0H. FLOW START PILL (Reference 2: Sign up example) ---
  if (d.data?.tag === "Flow Start 🚀" || d.data?.title === "Sign up example") {
    return (
      <NodeFrame
        selected={selected}
        style={{
          background: "#eff6ff",
          color: "#1e40af",
          border: "2px solid #93c5fd",
          borderRadius: 9999,
          boxShadow: "0 8px 20px -6px rgba(59,130,246,0.3)",
        }}
      >
        <div className="flex h-full w-full items-center justify-between px-5">
          <span className="font-sans text-sm font-bold text-blue-900">
            {d.data?.title ?? "Sign up example"}
          </span>
          <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
        </div>
      </NodeFrame>
    )
  }

  // --- 1. MEDIA BENTO CARD (Pharmacology Basics archetype) ---
  if (d.data?.isMedia) {
    const isPlaying = Boolean(d.data?.isPlaying)
    return (
      <NodeFrame
        selected={selected}
        style={{
          background:
            theme === "dark"
              ? "linear-gradient(135deg, #3b0764 0%, #4a044e 50%, #581c87 100%)"
              : "linear-gradient(135deg, #f3e8ff 0%, #f5d0fe 50%, #e9d5ff 100%)",
          color: theme === "dark" ? "#fdf4ff" : "#4a044e",
          border: `2px solid ${d.style.stroke || "#d8b4fe"}`,
          borderRadius: 28,
          boxShadow:
            theme === "dark"
              ? "0 18px 40px -10px rgba(0,0,0,0.7), 0 4px 12px -2px rgba(168,85,247,0.2)"
              : "0 18px 36px -10px rgba(168,85,247,0.25), 0 4px 12px -2px rgba(0,0,0,0.06)",
        }}
        rotation={d.rotation ?? -4}
      >
        <div className="flex h-full w-full flex-col justify-between p-4.5">
          {/* Header Row: Title & Music Icon */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <input
                value={d.data?.title ?? "Pharmacology Basics"}
                onChange={(e) => update({ data: { ...d.data, title: e.target.value } })}
                className="w-full bg-transparent font-sans text-base font-bold tracking-tight outline-none"
                style={{ color: theme === "dark" ? "#fdf4ff" : "#4a044e" }}
                spellCheck={false}
              />
              <textarea
                value={d.data?.subtitle ?? d.data?.text ?? ""}
                onChange={(e) =>
                  update({ data: { ...d.data, subtitle: e.target.value, text: e.target.value } })
                }
                placeholder="Learn medical language..."
                className="mt-1 h-11 w-full resize-none bg-transparent text-xs leading-relaxed opacity-85 outline-none placeholder:opacity-40"
                style={{ color: theme === "dark" ? "#e9d5ff" : "#581c87" }}
                spellCheck={false}
              />
            </div>

            {/* Circular Play / Wave Button */}
            <div className="relative shrink-0">
              {isPlaying ? (
                <span className="absolute -inset-1.5 animate-ping rounded-full border-2 border-purple-400 opacity-60" />
              ) : null}
              <button
                type="button"
                onClick={() => update({ data: { ...d.data, isPlaying: !isPlaying } })}
                className="relative flex size-12 items-center justify-center rounded-full bg-white text-purple-600 shadow-md transition hover:scale-110 active:scale-95 dark:bg-purple-950 dark:text-purple-200"
                title={isPlaying ? "Pause audio" : "Play audio course"}
              >
                {isPlaying ? (
                  <Pause className="size-5 fill-current" />
                ) : (
                  <Play className="size-5 fill-current pl-0.5" />
                )}
              </button>
            </div>
          </div>

          {/* Bottom Row: Watching Pill & Avatar Stack */}
          <div className="mt-2 flex items-center justify-between border-t border-purple-300/40 pt-2.5 dark:border-purple-800/40">
            <div className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-[11px] font-bold text-purple-900 shadow-xs backdrop-blur-xs dark:bg-purple-900/60 dark:text-purple-100">
              <Headphones className="size-3 text-purple-600 dark:text-purple-300" />
              <span>Watching {d.data?.duration ?? "00:30"}</span>
            </div>

            {/* Overlapping Avatar Stack */}
            <div className="flex items-center -space-x-2">
              <span className="flex size-6.5 items-center justify-center rounded-full border-2 border-white bg-amber-100 text-xs shadow-xs dark:border-purple-950">
                👦
              </span>
              <span className="flex size-6.5 items-center justify-center rounded-full border-2 border-white bg-pink-100 text-xs shadow-xs dark:border-purple-950">
                👧
              </span>
              <span className="flex size-6.5 items-center justify-center rounded-full border-2 border-white bg-sky-100 text-xs shadow-xs dark:border-purple-950">
                🧔
              </span>
            </div>
          </div>
        </div>
      </NodeFrame>
    )
  }

  // --- 2. ROADMAP BENTO CARD (Medical Terminology / Anatomy archetype) ---
  if (d.data?.title || d.data?.status) {
    const isCompleted = d.data?.status === "Completed"
    return (
      <NodeFrame
        selected={selected}
        style={{
          background: theme === "dark" ? "#1a1e29" : "#ffffff",
          color: theme === "dark" ? "#f8fafc" : "#0f172a",
          border: `1.5px solid ${theme === "dark" ? "rgba(255,255,255,0.12)" : "#e2e8f0"}`,
          borderRadius: 28,
          boxShadow:
            theme === "dark"
              ? "0 16px 36px -10px rgba(0,0,0,0.65), 0 3px 8px -2px rgba(0,0,0,0.4)"
              : "0 16px 32px -10px rgba(0,0,0,0.08), 0 3px 8px -2px rgba(0,0,0,0.03)",
        }}
        rotation={d.rotation}
      >
        <div className="flex h-full w-full flex-col justify-between p-4.5">
          {/* Top Row: Title & Circular Badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <input
                value={d.data?.title ?? ""}
                onChange={(e) => update({ data: { ...d.data, title: e.target.value } })}
                placeholder="Step title"
                className="w-full bg-transparent font-sans text-base font-bold tracking-tight outline-none placeholder:opacity-40"
                spellCheck={false}
              />
              <textarea
                value={d.data?.subtitle ?? d.data?.text ?? ""}
                onChange={(e) =>
                  update({ data: { ...d.data, subtitle: e.target.value, text: e.target.value } })
                }
                placeholder="Learn medical language..."
                className="mt-1.5 h-11 w-full resize-none bg-transparent text-xs leading-relaxed text-muted-foreground outline-none placeholder:opacity-40"
                spellCheck={false}
              />
            </div>

            {/* Circular Green Badge */}
            <button
              type="button"
              onClick={cycleBadgeIcon}
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-sm text-emerald-700 shadow-2xs transition hover:scale-110 active:scale-95 dark:bg-emerald-950/70 dark:text-emerald-300"
              title="Click to cycle badge icon"
            >
              {d.data?.badgeIcon || "+"}
            </button>
          </div>

          {/* Bottom Row: Status Pill & Action Buttons */}
          <div className="mt-2.5 flex items-center justify-between border-t border-border/60 pt-2.5">
            <button
              type="button"
              onClick={toggleStatus}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition hover:scale-105 active:scale-95 shadow-2xs",
                isCompleted
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 ring-1 ring-emerald-500/20"
                  : "bg-black/5 text-muted-foreground dark:bg-white/10 dark:text-muted-foreground/80",
              )}
              title="Click to toggle status"
            >
              <span>{isCompleted ? "Completed 🌿" : "Upcoming 🕒"}</span>
            </button>

            {/* Actions: ... (cycle tag), X (delete), ✓ (toggle done) */}
            <div className="flex items-center gap-1 text-muted-foreground">
              <button
                type="button"
                onClick={cycleTag}
                className="rounded-full p-1 transition hover:bg-accent hover:text-foreground active:scale-95"
                title="Cycle tag / options"
              >
                <MoreHorizontal className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={remove}
                className="rounded-full p-1 transition hover:bg-destructive/15 hover:text-destructive active:scale-95"
                title="Delete step"
              >
                <X className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={toggleStatus}
                className={cn(
                  "flex size-5 items-center justify-center rounded-full transition hover:scale-110 active:scale-95",
                  isCompleted
                    ? "bg-emerald-500 text-white shadow-xs"
                    : "border border-border text-muted-foreground hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-950",
                )}
                title="Toggle completed"
              >
                <Check className="size-3" strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </NodeFrame>
    )
  }

  // --- 3. EVENT BENTO CARD (Webinar / Lesson / Task archetype) ---
  if (d.data?.category || d.data?.date) {
    const cat = d.data?.category ?? "Task"
    const isWebinar = cat.toLowerCase().includes("webinar")
    const isLesson = cat.toLowerCase().includes("lesson")

    return (
      <NodeFrame
        selected={selected}
        style={{
          background: d.style.fill,
          color: textColor,
          border: `1.5px solid ${d.style.stroke}`,
          borderRadius: 26,
          boxShadow:
            theme === "dark"
              ? "0 14px 34px -10px rgba(0,0,0,0.6)"
              : "0 14px 30px -10px rgba(0,0,0,0.08)",
        }}
        rotation={d.rotation}
      >
        <div className="flex h-full w-full flex-col justify-between p-4">
          {/* Top Row: Category chip & Date chip */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold">
              {isWebinar ? (
                <Video className="size-3.5 opacity-80" />
              ) : isLesson ? (
                <Volume2 className="size-3.5 opacity-80" />
              ) : (
                <Pin className="size-3.5 opacity-80" />
              )}
              <span>{cat}</span>
            </div>

            <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-[11px] font-semibold opacity-85 dark:bg-white/10">
              {d.data?.date ?? "Tu, 25.03"}
            </span>
          </div>

          {/* Description Text */}
          <textarea
            value={d.data?.text ?? ""}
            onChange={(e) => update({ data: { ...d.data, text: e.target.value } })}
            placeholder="Event details..."
            className="my-2 h-[calc(100%-4rem)] w-full resize-none bg-transparent text-xs leading-relaxed outline-none placeholder:opacity-40"
            style={{ color: textColor }}
            spellCheck={false}
          />

          {/* Bottom Row: Optional Time Pill */}
          {d.data?.time ? (
            <div className="inline-flex self-start items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-0.5 text-[10px] font-bold shadow-2xs backdrop-blur-xs dark:bg-black/30">
              <Clock className="size-3 opacity-75" />
              <span>{d.data.time}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[10px] opacity-60">
              <span>{currentTag}</span>
              <button
                type="button"
                onClick={remove}
                className="hover:text-destructive transition"
                title="Delete event"
              >
                <X className="size-3" />
              </button>
            </div>
          )}
        </div>
      </NodeFrame>
    )
  }

  // --- 4. STANDARD NOTE (Fallback for simple sticky notes) ---
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

        <button
          type="button"
          onClick={remove}
          className="rounded-full p-1 opacity-60 transition hover:opacity-100 hover:text-destructive"
          title="Delete note"
        >
          <X className="size-3" />
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
