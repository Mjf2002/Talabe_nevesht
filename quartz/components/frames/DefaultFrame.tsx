import { PageFrame, PageFrameProps } from "./types"
import HeaderConstructor from "../Header"
import { pathToRoot } from "../../util/path"
import { settings, siteHref } from "../siteSettings"
const Header = HeaderConstructor()

type ReadingNode = { type: string; value?: string; tagName?: string; children?: ReadingNode[] }
function readingText(node: ReadingNode): string {
  if (node.tagName === "script" || node.tagName === "style") return ""
  if (node.type === "text") return node.value ?? ""
  const text = (node.children ?? []).map(readingText).join("")
  return ["p", "div", "li", "br", "h1", "h2", "h3", "blockquote", "pre", "tr"].includes(node.tagName ?? "") ? `${text} ` : text
}

export const DefaultFrame: PageFrame = {
  name: "default",
  render({ componentData, header, beforeBody, pageBody: Content, afterBody, left, right, footer }: PageFrameProps) {
    const slug = String(componentData.fileData.slug ?? "index")
    const normalizedSlug = slug.replace(/\/index$/, "")
    const root = pathToRoot(componentData.fileData.slug!)
    // Reserved for introductory notes, never a topic card (including generated folder pages).
    const isStartFolder = (value: unknown) => /^notes\/start(?:\/index)?\/?$/.test(String(value ?? ""))
    const allCategories = componentData.allFiles.filter((file) => !isStartFolder(file.slug) && /^notes\/[^/]+\/index$/.test(String(file.slug ?? "")) && !file.frontmatter?.draft && !file.frontmatter?.unlisted && !file.frontmatter?.password).map((file) => ({
      slug: String(file.slug).replace(/\/index$/, ""),
      title: String(file.frontmatter?.title ?? String(file.slug).split("/")[1]),
      description: String(file.frontmatter?.description ?? ""),
      parent: String(file.frontmatter?.parentTopic ?? ""),
      order: Number(file.frontmatter?.order) || 0,
    })).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "fa"))
    const categories = allCategories.filter((category) => {
      const seen = new Set([category.slug]); let parent = category.parent;
      while (parent) {
        const ancestor = allCategories.find((c) => c.slug === `notes/${parent}`);
        if (!ancestor || seen.has(ancestor.slug)) return false;
        seen.add(ancestor.slug); parent = ancestor.parent;
      }
      return true;
    })
    const rootCategories = categories.filter((category) => !category.parent)
    const currentCategory = categories.find((category) => category.slug === normalizedSlug)
    const children = categories.filter((category) => currentCategory && `notes/${category.parent}` === currentCategory.slug)
    const parentCategory = categories.find((category) => currentCategory?.parent && category.slug === `notes/${currentCategory.parent}`)
    const publicNotes = componentData.allFiles.filter((file) => {
      const s = String(file.slug ?? "")
      return s.startsWith("notes/") && !isStartFolder(s) && !s.endsWith("/index") && !categories.some((c) => c.slug === s) && !file.frontmatter?.draft && !file.frontmatter?.unlisted && !file.frontmatter?.password
    })
    const homeSelection = settings.home as typeof settings.home & { featuredNotes?: unknown; featuredEnabled?: boolean; featuredTitle?: string }
    const selectedNotes = (value: unknown) => {
      const slugs = Array.isArray(value) ? [...new Set(value.filter((s): s is string => typeof s === "string"))] : []
      return slugs.filter((s) => s !== normalizedSlug).flatMap((s) => {
        const file = publicNotes.find((file) => String(file.slug) === s)
        return file ? [file] : []
      })
    }
    const startSettings = settings.home as typeof settings.home & { startTitle?: string; startEnabled?: boolean; startNotes?: { title: string; slug: string }[] }
    const startDefaults = [{ title: "چرا من جمعی؟", slug: "" }, { title: "چیستی فلسفه علوم اجتماعی", slug: "" }, { title: "عنوان سوم", slug: "" }]
    const normalizeTitle = (s: string) => s.replace(/[\s‌َُِّْ؟?]/gu, "").replace(/ي/g, "ی").replace(/ك/g, "ک")
    const startNotes = (Array.isArray(startSettings.startNotes) ? startSettings.startNotes : startDefaults).flatMap((entry) => {
      if (!entry || typeof entry.title !== "string" || typeof entry.slug !== "string") return []
      const file = entry.slug ? publicNotes.find((f) => String(f.slug) === entry.slug) : publicNotes.find((f) => normalizeTitle(String(f.frontmatter?.title ?? "")) === normalizeTitle(entry.title))
      if (entry.slug && !file) return []
      return [{ title: entry.title || String(file?.frontmatter?.title ?? ""), slug: file ? String(file.slug) : "" }]
    })
    const featured = selectedNotes(homeSelection.featuredNotes)
    const recommended = selectedNotes(componentData.fileData.frontmatter?.recommendedNotes)
    const isNote = publicNotes.some((file) => String(file.slug) === slug)
    const wordCount = (readingText(componentData.tree as ReadingNode).match(/\S+/gu) ?? []).length
    const readingMinutes = Math.max(1, Math.ceil(wordCount / settings.reading.wordsPerMinute))
    const pages = publicNotes.filter((file) => currentCategory && String(file.slug).startsWith(`${currentCategory.slug}/`)).sort((a, b) => String(a.frontmatter?.title ?? a.slug).localeCompare(String(b.frontmatter?.title ?? b.slug), "fa"))
    const timestamp = (file: typeof publicNotes[number]) => {
      const fm = file.frontmatter
      const date = Date.parse(String(fm?.date ?? fm?.created ?? ""))
      return Number.isNaN(date) ? 0 : date
    }
    const recent = [...publicNotes].sort((a, b) => timestamp(b) - timestamp(a) || String(a.frontmatter?.title ?? a.slug).localeCompare(String(b.frontmatter?.title ?? b.slug), "fa")).slice(0, settings.home.recentCount)
    const appearance = settings.appearance
    const style = `--mj-admin-accent:${appearance.accent};--mj-admin-width:850px;--mj-admin-font-size:${appearance.fontSize}px;--mj-admin-line-height:1.95;--mj-admin-radius:${appearance.cardRadius}px;`
    return (
      <>
        <div class="center" style={style}>
          <div class="page-header">
            <Header {...componentData} tools={left.map((Component) => <Component {...componentData} />)}>
              {header.map((Component) => <Component {...componentData} />)}
            </Header>
            <div class="popover-hint">{beforeBody.map((Component) => <Component {...componentData} />)}
              {isNote && settings.reading.enabled && <p class="mj-reading-time">⏱ حدود {readingMinutes.toLocaleString("fa-IR")} دقیقه مطالعه</p>}
            </div>
          </div>
          <main id="mj-main" class={slug === "index" ? "mj-home" : "mj-article"} tabIndex={-1}>
            {currentCategory ? <article><h1>{currentCategory.title}</h1>{currentCategory.description && <p>{currentCategory.description}</p>}</article> : <Content {...componentData} />}
            {slug === "index" && startSettings.startEnabled !== false && <section class="mj-recent-notes mj-start-notes" aria-label={startSettings.startTitle || "برای شروع"}>
              <h2>{startSettings.startTitle || "برای شروع"}</h2>
              <ol>{startNotes.map((entry, index) => <li key={index}>{entry.slug ? <a class="internal" href={`${root}/${entry.slug}`}>{entry.title}</a> : <span>{entry.title}</span>}</li>)}</ol>
            </section>}
            {slug === "index" && <section class="mj-home-topics"><h2>{settings.home.topicsTitle}</h2><nav class="mj-home-cards mj-topic-cards" aria-label="دسته‌های اصلی">{rootCategories.map((category) => <a key={category.slug} href={`${root}/${category.slug}/`}><strong>{category.title}</strong><span>{category.description}</span></a>)}</nav></section>}
            {slug === "index" && <nav class="mj-home-cards" aria-label="مسیرهای مطالعه">
              <a href={`${root}/notes`}><span class="mj-card-label">خواندن</span><strong>فهرست نوشته‌ها</strong><span>همهٔ یادداشت‌ها در یک نگاه ←</span></a>
              <a href={`${root}/about`}><span class="mj-card-label">آشنایی</span><strong>دربارهٔ من</strong><span>نویسنده و این فضای نوشتن ←</span></a>
              <a href={`${root}/contact`}><span class="mj-card-label">گفت‌وگو</span><strong>راه ارتباط</strong><span>برای ادامهٔ گفت‌وگو ←</span></a>
            </nav>}
            {slug === "index" && homeSelection.featuredEnabled !== false && featured.length > 0 && <section class="mj-recent-notes" aria-label={homeSelection.featuredTitle || "نوشته‌های منتخب"}>
              <h2>{homeSelection.featuredTitle || "نوشته‌های منتخب"}</h2>
              <ul>{featured.map((file) => <li key={String(file.slug)}><a class="internal" href={`${root}/${file.slug}`}>{String(file.frontmatter?.title ?? file.slug)}</a></li>)}</ul>
            </section>}
            {slug === "index" && settings.home.recentEnabled && recent.length > 0 && <section class="mj-recent-notes" aria-label={settings.home.recentTitle}>
              <h2>{settings.home.recentTitle}</h2>
              <ul>{recent.map((file) => <li key={String(file.slug)}><a class="internal" href={`${root}/${file.slug}`}>{String(file.frontmatter?.title ?? file.slug)}</a></li>)}</ul>
            </section>}
            {(slug === "notes" || slug === "notes/index") && <nav class="mj-home-cards mj-topic-cards" aria-label="موضوع‌های یادداشت‌ها">
              {rootCategories.map((category) => <a key={category.slug} href={`${root}/${category.slug}/`}><strong>{category.title}</strong><span>{category.description}</span></a>)}
            </nav>}
            {currentCategory && <section class="mj-directory" aria-label={`فهرست ${currentCategory.title}`}>
              <a class="internal mj-category-back" href={`${root}/notes`}>بازگشت به موضوع‌ها</a>
              {parentCategory && <p><a class="internal" href={`${root}/${parentCategory.slug}/`}>بازگشت به {parentCategory.title}</a></p>}
              {children.length > 0 && <section><h2>زیرموضوع‌ها</h2><nav class="mj-home-cards mj-topic-cards" aria-label="زیرموضوع‌ها">{children.map((category) => <a key={category.slug} class="internal" href={`${root}/${category.slug}/`}><strong>{category.title}</strong><span>{category.description}</span></a>)}</nav></section>}
              <p class="mj-count">{pages.length.toLocaleString("fa-IR")} یادداشت</p>
              {pages.length ? <ul>{pages.map((file) => <li key={String(file.slug)}><a class="internal" href={`${root}/${file.slug}`}>{String(file.frontmatter?.title ?? file.slug)}</a></li>)}</ul> : <p>هنوز یادداشتی منتشر نشده است.</p>}
            </section>}
            {isNote && recommended.length > 0 && <section class="mj-recent-notes" aria-label="در ادامه بخوانید">
              <h2>در ادامه بخوانید</h2>
              <ul>{recommended.map((file) => <li key={String(file.slug)}><a class="internal" href={`${root}/${file.slug}`}>{String(file.frontmatter?.title ?? file.slug)}</a></li>)}</ul>
            </section>}
          </main>
          <div class="page-footer">{afterBody.map((Component) => <Component {...componentData} />)}</div>
          <aside class="mj-reading-tools" aria-label="ابزارهای مطالعه">{right.map((Component) => <Component {...componentData} />)}</aside>
          <footer class="mj-site-footer">
            <a class="mj-footer-name" href={`${root}/`}>{settings.header.title}</a><span class="mj-footer-tagline">{settings.footer.text}</span>
            {settings.footer.links.length > 0 && <div class="mj-contact-links">
              {settings.footer.links.map((link, index) => <a key={index} href={siteHref(link.href, root)}>{link.label}</a>)}
            </div>}
          </footer>
        </div>
        {footer.map((Component) => <Component {...componentData} />)}
        {settings.backToTop && <button class="mj-back-top" type="button" hidden aria-label="بازگشت به بالای صفحه" title="بازگشت به بالا">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 12 6-6 6 6M12 6v13" /></svg>
        </button>}
      </>
    )
  },
}
