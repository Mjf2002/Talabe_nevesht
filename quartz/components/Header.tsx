import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { pathToRoot } from "../util/path"

const Header: QuartzComponent = ({ children, fileData }: QuartzComponentProps) => {
  const root = pathToRoot(fileData.slug!)
  const slug = String(fileData.slug ?? "index")
  const links = [
    { label: "خانه", path: "", active: slug === "index" },
    { label: "جستارها", path: "notes", active: slug === "notes" },
    { label: "دربارهٔ من", path: "about", active: slug === "about" },
  ]
  return (
    <header class="mj-header mj-header-refined" dir="rtl">
      <div class="mj-masthead">
        <a class="mj-brand" href={`${root}/`} aria-label="منِ جمعی؛ صفحهٔ اصلی">منِ جمعی</a>
        <p class="mj-tagline">یادداشت‌هایی برای با هم اندیشیدن</p>
      </div>
      <nav class="mj-nav" aria-label="منوی اصلی">
        {links.map((link) => (
          <a key={link.path} href={`${root}/${link.path}`} aria-current={link.active ? "page" : undefined}>{link.label}</a>
        ))}
        <span class="mj-nav-caption" aria-hidden="true">فلسفه · جامعه · زندگی</span>
      </nav>
      {children}
    </header>
  )
}
export default (() => Header) satisfies QuartzComponentConstructor
