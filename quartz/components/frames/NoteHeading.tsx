type NoteHeadingProps = {
  title: string
  registeredDate: { iso: string; label: string } | undefined
  readingMinutes: number
}

export function NoteHeading({ title, registeredDate, readingMinutes }: NoteHeadingProps) {
  return <header class="mj-note-heading">
    <h1 id="mj-note-title" class="mj-editorial-title">{title}</h1>
    {registeredDate && <p class="mj-note-date"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="4" /><path d="M7 3v4m10-4v4M3 11h18m-12 5h6" /></svg><span>تاریخ ثبت: <time dateTime={registeredDate.iso}>{registeredDate.label}</time></span></p>}
    <p class="mj-reading-time"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="display:inline-block;vertical-align:-0.15em;margin-inline-end:6px"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg><span>حدود {readingMinutes.toLocaleString("fa-IR")} دقیقه مطالعه</span></p>
  </header>
}
