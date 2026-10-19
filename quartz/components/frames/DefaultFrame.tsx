import { PageFrame, PageFrameProps } from "./types"
import HeaderConstructor from "../Header"
import { pathToRoot } from "../../util/path"
const Header = HeaderConstructor()

export const DefaultFrame: PageFrame = {
  name: "default",
  render({ componentData, header, beforeBody, pageBody: Content, afterBody, left, right, footer }: PageFrameProps) {
    const slug = String(componentData.fileData.slug ?? "index")
    const root = pathToRoot(componentData.fileData.slug!)
    const pages = componentData.allFiles.filter((file) => {
      const s = String(file.slug ?? "")
      return s && !["index", "about", "contact", "notes"].includes(s) && !s.startsWith("tags/") && !s.endsWith("/index") && !file.frontmatter?.draft
    }).sort((a, b) => String(a.frontmatter?.title ?? a.slug).localeCompare(String(b.frontmatter?.title ?? b.slug), "fa"))
    return (
      <>
        <div class="center">
          <div class="page-header">
            <Header {...componentData} tools={left.map((Component) => <Component {...componentData} />)}>
              {header.map((Component) => <Component {...componentData} />)}
            </Header>
            <div class="popover-hint">{beforeBody.map((Component) => <Component {...componentData} />)}</div>
          </div>
          <div id="mj-main" tabIndex={-1}>
            <Content {...componentData} />
            {slug === "notes" && <section class="mj-directory" aria-label="فهرست یادداشت‌ها">
              <p class="mj-count">{pages.length.toLocaleString("fa-IR")} یادداشت</p>
              {pages.length ? <ul>{pages.map((file) => <li key={String(file.slug)}>
                <a class="internal" href={`${root}/${file.slug}`}>{String(file.frontmatter?.title ?? file.slug)}</a>
                {file.description && <p>{file.description}</p>}
              </li>)}</ul> : <p>هنوز یادداشتی منتشر نشده است.</p>}
            </section>}
          </div>
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
