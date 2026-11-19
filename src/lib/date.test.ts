import { describe, expect, it } from "vitest"

import { formatRelativeTime } from "@/lib/date"

const NOW = new Date("2026-11-20T12:00:00.000Z").getTime()

describe("formatRelativeTime", () => {
  it("collapses very recent timestamps to 'just now'", () => {
    expect(formatRelativeTime(NOW - 30_000, NOW)).toBe("just now")
    expect(formatRelativeTime(NOW + 10_000, NOW)).toBe("just now")
  })

  it("formats past timestamps in the largest sensible unit", () => {
    expect(formatRelativeTime(NOW - 5 * 60_000, NOW)).toBe("5 minutes ago")
    expect(formatRelativeTime(NOW - 3 * 3_600_000, NOW)).toBe("3 hours ago")
    expect(formatRelativeTime(NOW - 3 * 86_400_000, NOW)).toBe("3 days ago")
    expect(formatRelativeTime(NOW - 2 * 604_800_000, NOW)).toBe("2 weeks ago")
  })

  it("formats future timestamps with 'in ...'", () => {
    expect(formatRelativeTime(NOW + 2 * 3_600_000, NOW)).toBe("in 2 hours")
    expect(formatRelativeTime(NOW + 9 * 86_400_000, NOW)).toBe("next week")
  })
})
