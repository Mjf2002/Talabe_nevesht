import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { pathToRoot } from "../util/path"
import { settings, siteHref } from "./siteSettings"

const Header: QuartzComponent = ({ children, fileData, tools }: QuartzComponentProps) => {
  const root = pathToRoot(fileData.slug!)
  const slug = String(fileData.slug ?? "index").replace(/\/index$/, "")
  const links = settings.header.links
  return (
    <header class="mj-site-header" dir="rtl">
      <a class="mj-skip" href="#mj-main">رفتن به محتوای اصلی</a>
      <div class="mj-heading-row">
        <a class="mj-identity" href={`${root}/`} aria-label={`${settings.header.title}؛ خانه`}>
          <span class="mj-wordmark">{settings.header.title}</span>
          <span class="mj-subtitle">{settings.header.subtitle}</span>
        </a>
        <div class="mj-tools" aria-label="ابزارهای سایت">{tools}</div>
      </div>
      <nav class="mj-navigation" aria-label="منوی اصلی">
        {links.map((link, index) => {
          const target = link.href.replace(/^\//, "").replace(/\/$/, "") || "index"
          const active = slug === target || (target === "notes" && slug.startsWith("notes/"))
          return <a key={index} href={siteHref(link.href, root)} aria-current={active ? "page" : undefined}>{link.label}</a>
        })}
      </nav>
      {children}
    </header>
  )
}

Header.css = `
.center { --secondary: var(--mj-admin-accent, #4f6d5c); --tertiary: var(--mj-admin-accent, #4f6d5c); }
.center #mj-main, .center .page-header, .center .mj-site-footer { width: 100%; max-width: var(--mj-admin-width, 850px); margin-inline: auto; }
.center #mj-main, .center #mj-main article { font-size: var(--mj-admin-font-size, 17px); }
.center #mj-main article p { font-size: inherit; }
.center #mj-main article, .center #mj-main article p, .center #mj-main article li { line-height: var(--mj-admin-line-height, 1.95); }
.center #mj-main .mj-home-cards a { border-radius: var(--mj-admin-radius, 18px); }
.center .mj-navigation a[aria-current="page"], .center #mj-main a:not(.tag-link) { color: var(--mj-admin-accent, #4f6d5c); }
.center .mj-site-footer { display: flex; direction: rtl; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 12px 24px; }
.center .mj-site-footer > .mj-footer-name { flex: 0 0 auto; text-align: right; }
.center .mj-site-footer > .mj-footer-tagline { margin-inline-start: auto; text-align: left; min-width: 0; overflow-wrap: anywhere; }
.center .mj-site-footer > .mj-contact-links { flex: 0 0 100%; }
.center .mj-contact-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; }
.center .mj-announcement { padding: .7rem 1rem; margin-top: 1rem; border-inline-start: 3px solid var(--mj-admin-accent); background: var(--lightgray); border-radius: 6px; }
.center .mj-recent-notes { margin-top: 2.5rem; }
.center .mj-recent-notes ul { padding-inline-start: 1.4rem; }
.center .mj-recent-notes li { margin-block: .7rem; }
`

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

// Resource menu: initialize on initial load and Quartz SPA navigation.
Header.afterDOMLoaded += `
(() => {
  let cleanup = () => {};
  function setupLibraryMenu() {
    cleanup();
    const menu = document.querySelector('.mj-library-menu');
    if (!menu) return;
    let timer;
    const close = () => { menu.open = false; clearTimeout(timer); };
    const leave = (e) => { if (e.pointerType === 'mouse') timer = setTimeout(close, 180); };
    const enter = () => clearTimeout(timer);
    const outside = (e) => { if (!menu.contains(e.target)) close(); };
    const escape = (e) => { if (e.key === 'Escape' && menu.open) { close(); menu.querySelector('summary').focus(); } };
    const choose = (e) => { if (e.target.closest('a')) close(); };
    menu.addEventListener('pointerleave', leave);
    menu.addEventListener('pointerenter', enter);
    menu.addEventListener('click', choose);
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    cleanup = () => {
      clearTimeout(timer);
      menu.removeEventListener('pointerleave', leave);
      menu.removeEventListener('pointerenter', enter);
      menu.removeEventListener('click', choose);
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }
  document.addEventListener('nav', setupLibraryMenu);
  setupLibraryMenu();
})();
`
