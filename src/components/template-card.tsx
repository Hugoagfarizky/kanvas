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
      className="group relative flex h-full flex-col items-start gap-3.5 rounded-3xl border border-border/80 bg-card/90 p-5.5 text-left shadow-xs transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-60"
    >
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-2xl shadow-xs transition duration-200 group-hover:scale-110",
          template.tint,
        )}
      >
        <Icon className="size-5.5" />
      </span>
      <span className="block">
        <span className="block font-semibold text-base text-foreground">{template.name}</span>
        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
          {template.description}
        </span>
      </span>
      <ArrowRight className="absolute right-5 top-5 size-4 -translate-x-1 text-muted-foreground opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-primary" />
    </button>
  )
}
