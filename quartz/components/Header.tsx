import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { pathToRoot } from "../util/path"

const Header: QuartzComponent = ({ children, fileData }: QuartzComponentProps) => {
  const root = pathToRoot(fileData.slug!)
  return (
    <header style={{ flexWrap: "wrap" }}>
      <nav
        aria-label="منوی اصلی"
        dir="rtl"
        style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", alignItems: "center", width: "100%", padding: "1rem", border: "1px solid var(--lightgray)", borderRadius: "10px", boxSizing: "border-box" }}
      >
        <a class="internal" href={`${root}/`}>خانه</a>
        <a class="internal" href={`${root}/notes`}>یادداشت‌ها</a>
        <a class="internal" href={`${root}/about`}>دربارهٔ من</a>
      </nav>
      {children}
    </header>
  )
}

Header.css = `
header {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 2rem 0;
  gap: 1.5rem;
}
header h1 {
  margin: 0;
  flex: auto;
}
`

export default (() => Header) satisfies QuartzComponentConstructor
