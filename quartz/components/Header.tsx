import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { pathToRoot } from "../util/path"

const Header: QuartzComponent = ({ children, fileData }: QuartzComponentProps) => {
  const root = pathToRoot(fileData.slug!)
  const slug = String(fileData.slug ?? "index")
  const home = slug === "index"
  const links = [
    { label: "خانه", path: "", active: home },
    { label: "جستارها", path: "notes", active: slug === "notes" },
    { label: "درباره من", path: "about", active: slug === "about" },
  ]
  return (
    <header class="mj-header" dir="rtl">
      <div class="mj-masthead">
      <a class="mj-brand" href={`${root}/`} aria-label="منِ جمعی ـ خانه">منِ جمعی</a>
        <p class="mj-tagline">جستارهایی در فلسفه و زندگی اجتماعی</p>
      </div>
      <nav class="mj-nav" aria-label="منوی اصلی">
        {links.map((link) => (
          <a key={link.path} href={`${root}/${link.path}`} aria-current={link.active ? "page" : undefined}>{link.label}</a>
        ))}
        <span class="mj-nav-caption" aria-hidden="true">دین · فلسفه · جامعه</span>
      </nav>
      {home && (
        <section class="mj-intro" aria-label="معرفی سایت">
          <span class="mj-eyebrow">تاملاتی در باب دین، حکمت واجتماع</span>
          <p>اینجا از نسبت اندیشه و زندگی می‌نویسم؛ از پرسش‌های فلسفی تا امتدادات اجتماعی.</p>
          <a class="mj-read" href={`${root}/notes`}>خواندن جستارها <span aria-hidden="true">←</span></a>
        </section>
      )}
      {children}
    </header>
  )
}
export default (() => Header) satisfies QuartzComponentConstructor
