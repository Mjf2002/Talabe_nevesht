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
    <header class="collective-header" dir="rtl">
      <div class="collective-identity">
        <a class="collective-brand" href={`${root}/`} aria-label="منِ جمعی؛ صفحهٔ اصلی">
          <span class="collective-symbol" aria-hidden="true">مـ</span>
          <span>منِ جمعی<small>یادداشت‌هایی برای با هم اندیشیدن</small></span>
        </a>
        <span class="collective-topics">فلسفه <i>·</i> جامعه <i>·</i> زندگی</span>
      </div>
      <nav class="collective-nav" aria-label="منوی اصلی">
        {links.map((link) => (
          <a key={link.path} href={`${root}/${link.path}`} aria-current={link.active ? "page" : undefined}>{link.label}</a>
        ))}
      </nav>
      {children}
    </header>
  )
}

Header.css = `
.collective-header { direction: rtl; width: 100%; box-sizing: border-box; margin-bottom: 30px; }
.collective-header .collective-identity { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 30px 0 25px; }
.collective-header .collective-brand { display: inline-flex; align-items: center; gap: 17px; color: var(--dark); text-decoration: none; background: transparent; font-family: var(--headerFont); font-size: clamp(1.9rem, 4vw, 2.7rem); font-weight: 800; line-height: 1.6; }
.collective-header .collective-brand small { display: block; font-family: var(--bodyFont); font-size: .8rem; font-weight: 400; color: var(--gray); letter-spacing: 0; }
.collective-header .collective-symbol { display: grid; place-items: center; flex-shrink: 0; width: 64px; height: 64px; border: 1px solid var(--lightgray); border-radius: 20px 20px 5px 20px; color: var(--secondary); background: var(--highlight); font-size: 2rem; }
.collective-header .collective-topics { color: var(--gray); font-size: .8rem; white-space: nowrap; }
.collective-header .collective-topics i { font-style: normal; color: var(--tertiary); padding: 0 8px; }
.collective-header .collective-nav { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-top: 1px solid var(--lightgray); border-bottom: 1px solid var(--lightgray); }
.collective-header .collective-nav a { display: inline-block; padding: 7px 17px; border-radius: 8px; color: var(--darkgray); font-size: .9rem; text-decoration: none; background: transparent; transition: background .15s ease, color .15s ease; }
.collective-header .collective-nav a:hover, .collective-header .collective-nav a[aria-current="page"] { color: var(--secondary); background: var(--highlight); }
.collective-header a:focus-visible { outline: 2px solid var(--secondary); outline-offset: 4px; }
@media (max-width: 600px) {
  .collective-header .collective-identity { padding: 20px 0; gap: 12px; }
  .collective-header .collective-topics { display: none; }
  .collective-header .collective-symbol { width: 50px; height: 50px; font-size: 1.7rem; border-radius: 16px 16px 4px 16px; }
  .collective-header .collective-brand { gap: 12px; }
  .collective-header .collective-brand small { font-size: .72rem; }
  .collective-header .collective-nav { gap: 4px; }
  .collective-header .collective-nav a { padding: 7px 13px; }
}
`

export default (() => Header) satisfies QuartzComponentConstructor
