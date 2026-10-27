import { noteDate } from "../noteDate"
import { articleChatEndpoint } from "../articleChatConfig"
import { PreviewHome } from "./PreviewHome"
import { previewDesignCSS } from "./previewDesignCSS"
import { NoteResources, LibraryMenu, LibraryPage, LibraryStyles, libraryKinds } from "./ResourceLibrary"
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
    const registeredDate = noteDate(componentData.fileData.frontmatter)
    const wordCount = (readingText(componentData.tree as ReadingNode).match(/\S+/gu) ?? []).length
    const readingMinutes = Math.max(1, Math.ceil(wordCount / settings.reading.wordsPerMinute))
    const pages = publicNotes.filter((file) => currentCategory && String(file.slug).startsWith(`${currentCategory.slug}/`)).sort((a, b) => String(a.frontmatter?.title ?? a.slug).localeCompare(String(b.frontmatter?.title ?? b.slug), "fa"))
    const timestamp = (file: typeof publicNotes[number]) => noteDate(file.frontmatter)?.timestamp ?? 0
    const recent = [...publicNotes].sort((a, b) => timestamp(b) - timestamp(a) || String(a.frontmatter?.title ?? a.slug).localeCompare(String(b.frontmatter?.title ?? b.slug), "fa")).slice(0, settings.home.recentCount)
    const isLibrary = libraryKinds.some(k => normalizedSlug === `resources/${k.path}`)
    const appearance = settings.appearance
    const style = `--mj-admin-accent:${appearance.accent};--mj-admin-width:850px;--mj-admin-font-size:${appearance.fontSize}px;--mj-admin-line-height:1.95;--mj-admin-radius:${appearance.cardRadius}px;`
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: previewDesignCSS }} />
        <div class="center" style={style}>
          <div class="page-header">
            <Header {...componentData} tools={left.map((Component) => <Component {...componentData} />)}>
              {header.map((Component) => <Component {...componentData} />)}
            </Header>
            <div class="popover-hint">{!currentCategory && !isLibrary && beforeBody.map((Component) => <Component {...componentData} />)}
              {isNote && registeredDate && <p class="mj-note-date" style="display:flex;align-items:center;gap:8px;font-size:.8rem;color:var(--gray);margin-block:8px;line-height:1.8"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="4" /><path d="M7 3v4m10-4v4M3 11h18m-12 5h6" /></svg><span>تاریخ ثبت: <time dateTime={registeredDate.iso}>{registeredDate.label}</time></span></p>}
              {isNote && settings.reading.enabled && <p class="mj-reading-time">⏱ حدود {readingMinutes.toLocaleString("fa-IR")} دقیقه مطالعه</p>}
            </div>
          </div>
          <LibraryStyles />
          <LibraryMenu root={root} />
          <main id="mj-main" class={slug === "index" ? "mj-home" : "mj-article"} tabIndex={-1}>
            {isLibrary ? <LibraryPage root={root} path={normalizedSlug} /> : currentCategory ? <article><h1>{currentCategory.title}</h1>{currentCategory.description && <p>{currentCategory.description}</p>}</article> : slug === "index" ? <PreviewHome root={root} title={settings.header.title} recent={recent} featured={featured} categories={rootCategories} startNotes={startNotes} home={settings.home} /> : <Content {...componentData} />}
            {isNote && <section data-article-chat data-endpoint={articleChatEndpoint} dir="rtl">
 <button type="button" class="mj-chat-launch" aria-expanded="false">✦ گفت‌وگو با نوشته <span>پرسش، کشف، فهم بهتر</span></button>
 <aside class="mj-chat-panel" hidden aria-label="دستیار مطالعه">
 <header class="mj-chat-header"><div><strong>✦ دستیار مطالعه</strong><small>همراه شما برای فهم این نوشته</small></div><button type="button" data-close aria-label="بستن گفت‌وگو">✕</button></header>
 <div class="mj-chat-scroll"><div class="mj-chat-welcome"><span class="mj-chat-orb">✦</span><h2>از دل نوشته، بیشتر کشف کن.</h2><p>ایده‌ها را روشن‌تر ببین، استدلال‌ها را بررسی کن و به متن برگرد.</p></div>
 <div class="mj-chat-suggestions">{["ایدهٔ اصلی این نوشته چیست؟", "این نوشته را ساده‌تر توضیح بده", "کدام پرسش‌ها در متن بی‌پاسخ مانده‌اند؟"].map(q => <button type="button" data-question>{q}<span>↗</span></button>)}</div>
 <div role="log" aria-live="polite" aria-label="پرسش و پاسخ" /></div>
 <form class="mj-chat-form">
 <div class="mj-chat-compose"><label class="mj-chat-sr" for="mj-chat-input">پرسش دربارهٔ نوشته</label><textarea id="mj-chat-input" required maxLength={2000} rows={2} placeholder="دربارهٔ این نوشته بپرس…" /><button type="submit" aria-label="ارسال پرسش">↑</button></div>
 <div class="mj-chat-footer"><button type="button" data-reset>گفت‌وگوی تازه</button><span>هر پرسش مستقل است · پاسخ ممکن است خطا داشته باشد</span></div></form>
 </aside></section>}
             {isNote && <NoteResources root={root} references={componentData.fileData.frontmatter?.resourceReferences} />}
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
          <div class="page-footer">{!isLibrary && afterBody.map((Component) => <Component {...componentData} />)}</div>
          <aside class="mj-reading-tools" aria-label="ابزارهای مطالعه">{right.map((Component) => <Component {...componentData} />)}</aside>
          <footer class="mj-site-footer">
            <a class="mj-footer-name" href={`${root}/`}>{settings.header.title}</a><span class="mj-footer-tagline">{settings.footer.text}</span>
            {settings.footer.links.length > 0 && <div class="mj-contact-links">
              {(settings.footer.links as { label: string; href: string }[]).map((link, index) => <a key={index} href={siteHref(link.href, root)}>{link.label}</a>)}
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
