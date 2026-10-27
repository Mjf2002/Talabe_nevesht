import { noteDate } from "../noteDate"

// Visual layout comes from man-jamei-full-preview.html; content comes from Quartz.
type Note = { slug?: unknown; frontmatter?: Record<string, unknown> }
type Category = { slug: string; title: string; description: string }
type Start = { title: string; slug: string }
type Props = {
  root: string
  title: string
  recent: Note[]
  featured: Note[]
  categories: Category[]
  startNotes: Start[]
  home: {
    recentEnabled: boolean; recentTitle: string; topicsTitle: string
    startEnabled?: boolean; startTitle?: string
    featuredEnabled?: boolean; featuredTitle?: string
    pathsEnabled?: boolean; pathsTitleEnabled?: boolean
  }
}

function NoteCards({ notes, root, categories }: { notes: Note[]; root: string; categories: Category[] }) {
  return <div class="mjp-grid">{notes.map(file => {
    const slug = String(file.slug ?? "")
    const date = noteDate(file.frontmatter)
    const description = String(file.frontmatter?.description ?? "").trim()
    const category = categories.find(item => slug.startsWith(`${item.slug}/`))
    const title = String(file.frontmatter?.title ?? slug)
    return <article class="mjp-card" key={slug}>
      <div class="mjp-card-top"><span class="mjp-tag">{category?.title ?? "یادداشت"}</span><a class="mjp-arrow internal" href={`${root}/${slug}`} aria-label={`خواندن ${title}`}>↗</a></div>
      <h3><a class="internal" href={`${root}/${slug}`}>{title}</a></h3>
      {description && <p>{description.length > 170 ? `${description.slice(0, 170)}…` : description}</p>}
      <div class="mjp-card-foot">{date ? <time dateTime={date.iso}>{date.label}</time> : <span />}<a class="internal" href={`${root}/${slug}`}>خواندن نوشته ←</a></div>
    </article>
  })}</div>
}

export function PreviewHome({ root, title, recent, featured, categories, startNotes, home }: Props) {
  const hasStart = home.startEnabled !== false && startNotes.length > 0
  return <>
    <section class="mjp-hero"><div class="mjp-wrap mjp-hero-inner"><div>
      <span class="mjp-eyebrow">یادداشت‌ها و تأملات</span>
      <h1>اندیشیدن،<br />از من تا ما</h1>
      <p>جایی برای مکث در پرسش‌های فلسفه، جامعه و زندگی؛ و فرصتی برای دوباره دیدن آنچه بدیهی می‌پنداریم.</p>
      <div class="mjp-actions"><a class="mjp-btn mjp-gold internal" href={hasStart ? "#mj-preview-start" : `${root}/notes`}>برای شروع <span aria-hidden="true">←</span></a><a class="mjp-btn internal" href={`${root}/notes`}>همه یادداشت‌ها</a></div>
    </div><div class="mjp-seal" aria-hidden="true"><strong>{title}</strong><span>اندیشه · جامعه · زندگی</span></div></div></section>
    <div class="mjp-wrap">
      <nav class="mjp-shortcuts" aria-label="دسترسی سریع">
        <a class="mjp-shortcut internal" href={`${root}/notes`}><b aria-hidden="true">▤</b>نوشته‌ها</a>
        <a class="mjp-shortcut internal" href={hasStart ? "#mj-preview-start" : `${root}/notes`}><b aria-hidden="true">⌘</b>برای شروع</a>
        <a class="mjp-shortcut internal" href={categories.length ? "#mj-preview-topics" : `${root}/notes`}><b aria-hidden="true">◈</b>موضوعات</a>
        <a class="mjp-shortcut internal" href={`${root}/about`}><b aria-hidden="true">◎</b>درباره من</a>
      </nav>
      {home.recentEnabled && recent.length > 0 && <section class="mjp-section"><div class="mjp-section-head"><div><h2>{home.recentTitle}</h2><p>هر نوشته، فرصتی برای آغاز یک پرسش</p></div><a class="mjp-text-link internal" href={`${root}/notes`}>مشاهده همه نوشته‌ها ←</a></div><NoteCards root={root} notes={recent} categories={categories} /></section>}
      {home.featuredEnabled !== false && featured.length > 0 && <section class="mjp-section"><div class="mjp-section-head"><h2>{home.featuredTitle || "نوشته‌های منتخب"}</h2></div><NoteCards root={root} notes={featured} categories={categories} /></section>}
      {hasStart && <section class="mjp-section" id="mj-preview-start"><div class="mjp-section-head"><div><h2>{home.startTitle || "از کجا شروع کنیم؟"}</h2><p>چند نوشتهٔ پیشنهادی برای آغاز مطالعه</p></div></div><div class="mjp-paths">{startNotes.map((entry, index) => entry.slug ? <a key={index} class="mjp-path internal" href={`${root}/${entry.slug}`}><i aria-hidden="true">{["◈", "⌘", "▤"][index % 3]}</i><div><strong>{entry.title}</strong><small>شروع خواندن ←</small></div></a> : <div key={index} class="mjp-path"><i aria-hidden="true">◈</i><div><strong>{entry.title}</strong></div></div>)}</div></section>}
      {categories.length > 0 && <section class="mjp-section" id="mj-preview-topics"><div class="mjp-section-head"><h2>{home.topicsTitle}</h2></div><nav class="mjp-paths" aria-label="فهرست موضوعی">{categories.map((category, index) => <a class="mjp-path internal" key={category.slug} href={`${root}/${category.slug}/`}><i aria-hidden="true">{["◈", "⌘", "▤"][index % 3]}</i><div><strong>{category.title}</strong>{category.description && <small>{category.description}</small>}</div></a>)}</nav></section>}
      {(home.pathsEnabled !== false || home.pathsTitleEnabled !== false) && <section class="mjp-section">{home.pathsTitleEnabled !== false && <div class="mjp-section-head"><h2>مسیرهای مطالعه</h2></div>}{home.pathsEnabled !== false && <nav class="mjp-paths" aria-label="مسیرهای مطالعه"><a class="mjp-path internal" href={`${root}/notes`}><i aria-hidden="true">▤</i><div><strong>فهرست نوشته‌ها</strong><small>همهٔ یادداشت‌ها در یک نگاه ←</small></div></a><a class="mjp-path internal" href={`${root}/about`}><i aria-hidden="true">◎</i><div><strong>دربارهٔ من</strong><small>نویسنده و این فضای نوشتن ←</small></div></a><a class="mjp-path internal" href={`${root}/contact`}><i aria-hidden="true">⌘</i><div><strong>راه ارتباط</strong><small>برای ادامهٔ گفت‌وگو ←</small></div></a></nav>}</section>}
      <section class="mjp-about-strip"><div><h2>چرا «من جمعی»؟</h2><p>میان تجربهٔ فردی و جهان مشترک، پرسش‌های بسیاری هست. اینجا قرار است جایی برای دنبال کردن همین پرسش‌ها باشد.</p></div><a class="mjp-btn internal" href={`${root}/about`}>بیشتر درباره اینجا ←</a></section>
    </div>
  </>
}
