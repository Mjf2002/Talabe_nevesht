// Only author-supplied metadata: never use build/filesystem timestamps.
export function noteDate(frontmatter: Record<string, unknown> | undefined) {
  for (const raw of [frontmatter?.date, frontmatter?.created]) {
    if (!(typeof raw === "string" || raw instanceof Date)) continue
    const value = raw instanceof Date ? new Date(raw.getTime()) : new Date(raw.trim())
    if (Number.isNaN(value.getTime())) continue
    // Reject silently normalized dates such as 2026-02-30.
    if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.trim()) && value.toISOString().slice(0, 10) !== raw.trim()) continue
    return {
      iso: value.toISOString(),
      label: new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Tehran",
      }).format(value),
      timestamp: value.getTime(),
    }
  }
  return undefined
}
