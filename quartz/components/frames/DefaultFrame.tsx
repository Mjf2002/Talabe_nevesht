import resourceData from "../../resources.json"
type ResourceBox = { id: string; title: string; parent: string; topic: string }
type ResourceItem = { id: string; title: string; author: string; description: string; box: string; kind: string; url: string }
const resources = resourceData as { version: number; boxes: ResourceBox[]; items: ResourceItem[] }
import { PageFrame, PageFrameProps } from "./types"
import HeaderConstructor from "../Header"
import { pathToRoot, slugifyFilePath, FilePath } from "../../util/path"
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
    const homeSelection = settings.home as typeof settings.home & { featuredNotes?: unknown; featuredEnabled?: boolean; featuredTitle?: string; pathsEnabled?: boolean; pathsTitleEnabled?: boolean }
    // The panel stores source paths; Quartz links use canonical output slugs.
    const sourceNoteKey = (value: string) => value.replace(/\\/g, "/").replace(/^content\//, "").replace(/\.md$/i, "").normalize("NFC")
    const findSelectedNote = (value: string) => {
      const key = sourceNoteKey(value)
      const exact = publicNotes.find((file) => String(file.slug).normalize("NFC") === key || sourceNoteKey(String(file.relativePath ?? "")) === key)
      if (exact) return exact
      const canonical = String(slugifyFilePath(`${key}.md` as FilePath))
      return publicNotes.find((file) => String(file.slug) === canonical)
    }
    const selectedNotes = (value: unknown) => {
      const slugs = Array.isArray(value) ? [...new Set(value.filter((s): s is string => typeof s === "string"))] : []
      return slugs.filter((s) => s !== normalizedSlug).flatMap((s) => {
        const file = findSelectedNote(s)
        return file ? [file] : []
      })
    }
    const startSettings = settings.home as typeof settings.home & { startTitle?: string; startEnabled?: boolean; startNotes?: { title: string; slug: string }[] }
    const startDefaults = [{ title: "چرا من جمعی؟", slug: "" }, { title: "چیستی فلسفه علوم اجتماعی", slug: "" }, { title: "عنوان سوم", slug: "" }]
    const normalizeTitle = (s: string) => s.replace(/[\s‌َُِّْ؟?]/gu, "").replace(/ي/g, "ی").replace(/ك/g, "ک")
    const startNotes = (Array.isArray(startSettings.startNotes) ? startSettings.startNotes : startDefaults).flatMap((entry) => {
      if (!entry || typeof entry.title !== "string" || typeof entry.slug !== "string") return []
      const file = entry.slug ? findSelectedNote(entry.slug) : publicNotes.find((f) => normalizeTitle(String(f.frontmatter?.title ?? "")) === normalizeTitle(entry.title))
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
    const resourceBox = (id: string, seen = new Set<string>()): typeof resources.boxes => {
      if (seen.has(id)) return []
      seen.add(id)
      return resources.boxes.filter((box) => box.parent === id).flatMap((box) => [box, ...resourceBox(box.id, seen)])
    }
    const resourceRoots = resources.boxes.filter((box) => !box.parent && (!box.topic || normalizedSlug === `notes/${box.topic}` || normalizedSlug.startsWith(`notes/${box.topic}/`)))
    const resourceHref = (url: string) => /^https:\/\/[^\s]+$/i.test(url) ? url : /^\/resources\/files\/[a-z0-9.-]+$/i.test(url) ? `${root}${url}` : ""
    const appearance = settings.appearance
    const style = `--mj-admin-accent:${appearance.accent};--mj-admin-width:850px;--mj-admin-font-size:${appearance.fontSize}px;--mj-admin-line-height:1.95;--mj-admin-radius:${appearance.cardRadius}px;`
    return (
      <>
        <div class="center" style={style}>
          <div class="page-header">
            <Header {...componentData} tools={left.map((Component) => <Component {...componentData} />)}>
              {header.map((Component) => <Component {...componentData} />)}
            </Header>
            <div class="popover-hint">{!currentCategory && beforeBody.map((Component) => <Component {...componentData} />)}
              {isNote && settings.reading.enabled && <p class="mj-reading-time">⏱ حدود {readingMinutes.toLocaleString("fa-IR")} دقیقه مطالعه</p>}
            </div>
          </div>
          {resourceRoots.length > 0 && <aside class="mj-resource-tool" aria-label="منابع پیشنهادی">
            <input class="mj-resource-toggle" id="mj-resource-toggle" type="checkbox" aria-label="باز و بسته کردن منابع پیشنهادی" />
            <label class="mj-resource-trigger" for="mj-resource-toggle">منابع پیشنهادی</label>
            <section class="mj-resource-panel" aria-label="فهرست منابع پیشنهادی">
              <h2>منابع پیشنهادی</h2>
              {resourceRoots.map((box) => <section class="mj-resource-box">
                <h3>{box.title}</h3>
                {[box, ...resourceBox(box.id)].map((group) => <div>
                  {group.id !== box.id && <h4>{group.title}</h4>}
                  {([ ["book", "کتاب‌ها"], ["article", "مقالات"], ["media", "چندرسانه‌ای"] ] as const).map(([kind, label]) => {
                    const items = resources.items.filter((item) => item.box === group.id && item.kind === kind && resourceHref(item.url))
                    return items.length > 0 && <div>{new Set(resources.items.filter((item) => item.box === group.id && resourceHref(item.url)).map((item) => item.kind)).size > 1 && <h4>{label}</h4>}<ul>{items.map((item) => <li>
                      <a href={resourceHref(item.url)}>{item.title}</a>
                      {item.author && <span> — {item.author}</span>}
                      {item.description && <p>{item.description}</p>}
                    </li>)}</ul></div>
                  })}
                </div>)}
              </section>)}
            </section>
          </aside>}
          <style>{`
            .mj-resource-tool{direction:rtl;text-align:right;position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom, 0px));z-index:80;font-size:13px;line-height:1.6}
            .mj-resource-toggle{position:absolute;inline-size:1px;block-size:1px;opacity:0}
            .mj-resource-trigger{display:block;cursor:pointer;border:1px solid var(--lightgray);border-radius:22px;padding:10px 12px;min-height:44px;box-sizing:border-box;background:var(--light);color:var(--dark);box-shadow:0 4px 20px #0002}
            .mj-resource-toggle:focus-visible + .mj-resource-trigger{outline:2px solid var(--secondary);outline-offset:4px}
            .mj-resource-panel{display:none;position:absolute;bottom:56px;left:0;width:min(320px,calc(100vw - 24px));max-height:min(65dvh,480px);overflow-y:auto;overscroll-behavior:contain;box-sizing:border-box;padding:18px;background:var(--light);color:var(--dark);border:1px solid var(--lightgray);border-radius:14px;box-shadow:0 8px 32px #0003}
            .mj-resource-toggle:checked ~ .mj-resource-panel{display:block}
            .mj-resource-panel h2{font-size:1.1rem;margin:0 0 16px}
            .mj-resource-panel h3,.mj-resource-panel h4{font-size:1rem;margin:14px 0 8px}
            .mj-resource-panel ul{padding-inline-start:20px;margin:6px 0}
            .mj-resource-panel p{font-size:.9em;margin:4px 0 12px}
            .mj-resource-panel a{overflow-wrap:anywhere}
            @media(min-width:1480px){
              .mj-resource-tool{top:205px;left:20px;bottom:auto;width:250px}
              .mj-resource-trigger,.mj-resource-toggle{display:none}
              .mj-resource-panel{display:block;position:static;width:250px;max-height:calc(100dvh - 230px);box-shadow:none}
            }
            @media print{.mj-resource-tool{display:none}}
          `}</style>
          <main id="mj-main" class={slug === "index" ? "mj-home" : "mj-article"} tabIndex={-1}>
            {currentCategory ? <article><h1>{currentCategory.title}</h1>{currentCategory.description && <p>{currentCategory.description}</p>}</article> : <Content {...componentData} />}
            {slug === "index" && startSettings.startEnabled !== false && <section class="mj-recent-notes mj-start-notes" aria-label={startSettings.startTitle || "برای شروع"}>
              <h2>{startSettings.startTitle || "برای شروع"}</h2>
              <ol>{startNotes.map((entry, index) => <li key={index}>{entry.slug ? <a class="internal" href={`${root}/${entry.slug}`}>{entry.title}</a> : <span>{entry.title}</span>}</li>)}</ol>
            </section>}
            {slug === "index" && <div class={`mj-home-columns${homeSelection.pathsEnabled === false && homeSelection.pathsTitleEnabled === false ? ' mj-home-columns-single' : ''}`}><section class="mj-home-topics"><h2>{settings.home.topicsTitle}</h2><nav class="mj-home-cards mj-topic-cards" aria-label="فهرست موضوعی">{rootCategories.map((category) => <a key={category.slug} href={`${root}/${category.slug}/`}><strong>{category.title}</strong><span>{category.description}</span></a>)}</nav></section>
            {(homeSelection.pathsEnabled !== false || homeSelection.pathsTitleEnabled !== false) && <section class="mj-home-paths">{homeSelection.pathsTitleEnabled !== false && <h2>مسیرهای مطالعه</h2>}{homeSelection.pathsEnabled !== false && <nav class="mj-home-cards" aria-label="مسیرهای مطالعه">
              <a href={`${root}/notes`}><span class="mj-card-label">خواندن</span><strong>فهرست نوشته‌ها</strong><span>همهٔ یادداشت‌ها در یک نگاه ←</span></a>
              <a href={`${root}/about`}><span class="mj-card-label">آشنایی</span><strong>دربارهٔ من</strong><span>نویسنده و این فضای نوشتن ←</span></a>
              <a href={`${root}/contact`}><span class="mj-card-label">گفت‌وگو</span><strong>راه ارتباط</strong><span>برای ادامهٔ گفت‌وگو ←</span></a>
            </nav>}</section>}</div>}
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
