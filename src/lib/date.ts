const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

const DIVISIONS: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
  { unit: "year", seconds: 31_536_000 },
  { unit: "month", seconds: 2_592_000 },
  { unit: "week", seconds: 604_800 },
  { unit: "day", seconds: 86_400 },
  { unit: "hour", seconds: 3_600 },
  { unit: "minute", seconds: 60 },
]

/** Human friendly "5 minutes ago" / "in 2 days" label for a timestamp. */
export function formatRelativeTime(timestamp: number, now = Date.now()): string {
  const diffSeconds = Math.round((timestamp - now) / 1000)

  if (Math.abs(diffSeconds) < 45) return "just now"

  for (const { unit, seconds } of DIVISIONS) {
    if (Math.abs(diffSeconds) >= seconds) {
      return formatter.format(Math.round(diffSeconds / seconds), unit)
    }
  }

  return "just now"
}
