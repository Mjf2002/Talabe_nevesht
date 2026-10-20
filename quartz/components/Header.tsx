import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { pathToRoot } from "../util/path"
import { siteHref } from "./siteSettings"
import { language, languageSettings, enabledLanguages, languageLabels } from "./languages"

const Header: QuartzComponent = ({ children, fileData, tools, allFiles }: QuartzComponentProps) => {
  const root = pathToRoot(fileData.slug!)
  const lang = language(String(fileData.slug))
  const settings = languageSettings(String(fileData.slug))
  const localRoot = root + (lang === 'fa' ? '' : '/' + lang)
  const slug = String(fileData.slug ?? "index").replace(/\/index$/, "")
  const available = new Set(allFiles.map(f => String(f.slug).replace(/\/index$/, '')))
  const links = settings.header.links.filter(link => lang === 'fa' || !link.href.startsWith('/') || available.has((lang + link.href).replace(/\/$/, '').replace(/\/index$/, '')))
  return (
    <header class="mj-site-header" dir={lang === 'en' ? 'ltr' : 'rtl'}>
      <a class="mj-skip" href="#mj-main">رفتن به محتوای اصلی</a>
      <div class="mj-heading-row">
        <a class="mj-identity" href={`${localRoot}/`} aria-label={`${settings.header.title}؛ خانه`}>
          <span class="mj-wordmark">{settings.header.title}</span>
          <span class="mj-subtitle">{settings.header.subtitle}</span>
        </a>
        <div class="mj-tools" aria-label="ابزارهای سایت">{tools}</div>
      </div>
      <nav class="mj-navigation" aria-label="منوی اصلی">
        {links.map((link, index) => {
          const target = link.href.replace(/^\//, "").replace(/\/$/, "") || "index"
          const active = slug === target || (target === "notes" && slug.startsWith("notes/"))
          return <a key={index} href={siteHref(link.href, localRoot)} aria-current={active ? "page" : undefined}>{link.label}</a>
        })}
      </nav>
      <nav aria-label="Language" style="display:flex;gap:1rem;flex-wrap:wrap">
        {enabledLanguages.map(l => <a href={`${root}/${l === 'fa' ? '' : l + '/'}`} lang={l} aria-current={l === lang ? 'true' : undefined}>{languageLabels[l]}</a>)}
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
    const l = /\/(ar|en)(\/|$)/.exec(location.pathname)?.[1] || 'fa';
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'en' ? 'ltr' : 'rtl';
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
