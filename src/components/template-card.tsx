import { ArrowRight } from "lucide-react"

import type { BoardTemplate } from "@/lib/templates"
import { cn } from "@/lib/utils"

export function TemplateCard({
  template,
  onCreate,
  disabled,
}: {
  template: BoardTemplate
  onCreate: () => void
  disabled?: boolean
}) {
  const Icon = template.icon

  return (
    <button
      type="button"
      onClick={onCreate}
      disabled={disabled}
      className="group relative flex h-full flex-col items-start gap-3 rounded-2xl border border-border bg-card p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_18px_40px_-30px_rgba(0,0,0,0.4)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-60"
    >
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-xl transition group-hover:scale-105",
          template.tint,
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="block">
        <span className="block font-medium">{template.name}</span>
        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
          {template.description}
        </span>
      </span>
      <ArrowRight className="absolute right-4 top-4 size-4 -translate-x-1 text-muted-foreground opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
    </button>
  )
}
