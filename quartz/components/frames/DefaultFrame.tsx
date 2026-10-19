import { PageFrame, PageFrameProps } from "./types"
import HeaderConstructor from "../Header"
import { pathToRoot } from "../../util/path"
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
    const root = pathToRoot(componentData.fileData.slug!)
    const categories = [
      { slug: "notes/philosophy", title: "یادداشت‌های فلسفی", description: "درنگ‌هایی در فلسفه، حکمت و فلسفهٔ علوم اجتماعی" },
      { slug: "notes/howzeh", title: "یادداشت‌های حوزوی", description: "یادداشت‌هایی از درس، بحث و پژوهش‌های حوزوی" },
      { slug: "notes/free", title: "یادداشت‌های آزاد", description: "تأملات و نوشته‌هایی بیرون از مرزبندی‌های موضوعی" },
    ]
    const currentCategory = categories.find((category) => category.slug === slug.replace(/\/index$/, ""))
    const isNote = !currentCategory && categories.some((category) => slug.startsWith(`${category.slug}/`)) && !slug.endsWith("/index")
    const wordCount = (readingText(componentData.tree as ReadingNode).match(/\S+/gu) ?? []).length
    const readingMinutes = Math.max(1, Math.ceil(wordCount / 200))
    const pages = componentData.allFiles.filter((file) => {
      const s = String(file.slug ?? "")
      return Boolean(currentCategory) && s.startsWith(`${currentCategory!.slug}/`) && !s.endsWith("/index") && !file.frontmatter?.draft
    }).sort((a, b) => String(a.frontmatter?.title ?? a.slug).localeCompare(String(b.frontmatter?.title ?? b.slug), "fa"))
    return (
      <>
        <div class="center">
          <div class="page-header">
            <Header {...componentData} tools={left.map((Component) => <Component {...componentData} />)}>
              {header.map((Component) => <Component {...componentData} />)}
            </Header>
            <div class="popover-hint">{beforeBody.map((Component) => <Component {...componentData} />)}
              {isNote && <p class="mj-reading-time">⏱ حدود {readingMinutes.toLocaleString("fa-IR")} دقیقه مطالعه</p>}
            </div>
          </div>
          <main id="mj-main" class={slug === "index" ? "mj-home" : "mj-article"} tabIndex={-1}>
            {slug === "index" && <div class="mj-eyebrow">یادداشت‌ها و جستارها</div>}
            {currentCategory ? <article><h1>{currentCategory.title}</h1></article> : <Content {...componentData} />}
            {slug === "index" && <nav class="mj-home-cards" aria-label="مسیرهای مطالعه">
              <a href={`${root}/notes`}><span class="mj-card-label">خواندن</span><strong>فهرست نوشته‌ها</strong><span>همهٔ یادداشت‌ها در یک نگاه ←</span></a>
              <a href={`${root}/about`}><span class="mj-card-label">آشنایی</span><strong>دربارهٔ من</strong><span>نویسنده و این فضای نوشتن ←</span></a>
              <a href={`${root}/contact`}><span class="mj-card-label">گفت‌وگو</span><strong>راه ارتباط</strong><span>برای ادامهٔ گفت‌وگو ←</span></a>
            </nav>}
            {slug === "notes" && <nav class="mj-home-cards mj-topic-cards" aria-label="موضوع‌های یادداشت‌ها">
              {categories.map((category) => <a key={category.slug} href={`${root}/${category.slug}/`}>
                <strong>{category.title}</strong>
                <span>{category.description}</span>
              </a>)}
            </nav>}
            {currentCategory && <section class="mj-directory" aria-label={`فهرست ${currentCategory.title}`}>
              <a class="internal mj-category-back" href={`${root}/notes`}>بازگشت به موضوع‌ها</a>
              <p class="mj-count">{pages.length.toLocaleString("fa-IR")} یادداشت</p>
              {pages.length ? <ul>{pages.map((file) => <li key={String(file.slug)}>
                <a class="internal" href={`${root}/${file.slug}`}>{String(file.frontmatter?.title ?? file.slug)}</a>

              </li>)}</ul> : <p>هنوز یادداشتی منتشر نشده است.</p>}
            </section>}
          </main>
          <div class="page-footer">{afterBody.map((Component) => <Component {...componentData} />)}</div>
          <aside class="mj-reading-tools" aria-label="ابزارهای مطالعه">{right.map((Component) => <Component {...componentData} />)}</aside>
          <footer class="mj-site-footer"><a href={`${root}/`}>منِ جمعی</a><span>یادداشت‌هایی برای با هم اندیشیدن</span></footer>
        </div>
        {footer.map((Component) => <Component {...componentData} />)}
        <button class="mj-back-top" type="button" hidden aria-label="بازگشت به بالای صفحه" title="بازگشت به بالا">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 12 6-6 6 6M12 6v13" /></svg>
        </button>
      </>
    )
  },
}
