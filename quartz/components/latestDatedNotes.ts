import { noteDate } from "./noteDate"

// No folder order, filesystem timestamps, or inferred publication dates.
export function latestDatedNotes<T extends { slug?: unknown; frontmatter?: Record<string, unknown> }>(files: T[], count: number): T[] {
  return files
    .map(file => ({ file, date: noteDate(file.frontmatter) }))
    .filter((entry): entry is { file: T; date: NonNullable<ReturnType<typeof noteDate>> } => entry.date !== undefined)
    .sort((a, b) => b.date.timestamp - a.date.timestamp || String(a.file.slug ?? "").localeCompare(String(b.file.slug ?? ""), "fa"))
    .slice(0, Math.max(0, Math.floor(count)))
    .map(entry => entry.file)
}
