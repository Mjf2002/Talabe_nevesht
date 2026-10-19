import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { pathToRoot } from "../util/path"

const Header: QuartzComponent = ({ children, fileData, tools }: QuartzComponentProps) => {
  const root = pathToRoot(fileData.slug!)
  const slug = String(fileData.slug ?? "index").replace(/\/index$/, "")
  const links = [
    { label: "خانه", path: "", slug: "index" },
    { label: "دربارهٔ من", path: "about", slug: "about" },
    { label: "فهرست", path: "notes", slug: "notes" },
    { label: "راه ارتباط", path: "contact", slug: "contact" },
  ]
  return (
    <header class="mj-site-header" dir="rtl">
      <a class="mj-skip" href="#mj-main">رفتن به محتوای اصلی</a>
      <div class="mj-heading-row">
        <a class="mj-identity" href={`${root}/`} aria-label="منِ جمعی؛ خانه">
          <span class="mj-wordmark">منِ جمعی<span aria-hidden="true">.</span></span>
          <span class="mj-subtitle">جایی برای نوشتن و اندیشیدن</span>
        </a>
        <div class="mj-tools" aria-label="ابزارهای سایت">{tools}</div>
      </div>
      <nav class="mj-navigation" aria-label="منوی اصلی">
        {links.map((link) => <a key={link.slug} href={`${root}/${link.path}`} aria-current={slug === link.slug ? "page" : undefined}>{link.label}</a>)}
      </nav>
      {children}
    </header>
  )
}

Header.afterDOMLoaded = `
(() => {
  const setup = () => {
    const button = document.querySelector('.mj-back-top');
    if (!button) return;
    const update = () => { button.hidden = window.scrollY < 400; };
    const click = () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    window.addEventListener('scroll', update, { passive: true });
    button.addEventListener('click', click);
    update();
    window.addCleanup(() => {
      window.removeEventListener('scroll', update);
      button.removeEventListener('click', click);
    });
  };
  document.addEventListener('nav', setup);
})();
`
export default (() => Header) satisfies QuartzComponentConstructor
