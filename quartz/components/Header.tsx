import { readingTocScript } from "./readingTocScript"
import { articleChatScript } from "./articleChatScript"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { pathToRoot } from "../util/path"
import { enabledLanguages, languageLabels } from "./languages"
import { settings, siteHref } from "./siteSettings"

const dockIcon = (href: string) => {
  const path = href.replace(/^\//, "").replace(/\/$/, "")
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    {path.startsWith("resources") ? <><path d="M4 19.5V5a2 2 0 0 1 2-2h13v19H6a2.5 2.5 0 0 1 0-5h13M8 3v10l3-2 3 2V3" /></> : path === "about" ? <><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2a7 7 0 0 1 14 0v2M8 21h8" /></> : path === "contact" ? <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></> : path.startsWith("notes") ? <><rect x="4" y="3" width="16" height="18" rx="3" /><path d="M8 8h8M8 12h8M8 16h5" /></> : <><path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-7h6v7" /></>}
  </svg>
}

const Header: QuartzComponent = ({ children, fileData, tools }: QuartzComponentProps) => {
  const root = pathToRoot(fileData.slug!)
  const slug = String(fileData.slug ?? "index").replace(/\/index$/, "")
  const links = [...settings.header.links.filter(link => !link.href.startsWith("/resources")), { label: "منابع", href: "/resources/books" }]
  return (
    <header class="mj-site-header mj-header-v9" dir="rtl">
      <a class="mj-skip" href="#mj-main">رفتن به محتوای اصلی</a>
      <div class="mj-top-ribbon" aria-hidden="true"><span /></div>
      <div class="mj-heading-row">
        <a class="mj-brand-seal" href={`${root}/`} aria-label="خانه"><img src={`${root}/static/manejamei-header-logo.webp`} alt="من جمعی؛ یادداشت‌های یک طلبه و پژوهشگر علوم انسانی" width="1500" height="550" /></a>
        <div class="mj-tools" aria-label="ابزارهای سایت">{tools}<details class="mj-header-languages"><summary aria-label="انتخاب زبان"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 7h14M5 17h14"/></svg></summary><div>{enabledLanguages.map((lang: string) => <a href={lang === "fa" ? `${root}/` : `${root}/${lang}/`} lang={lang}>{languageLabels[lang] || lang}</a>)}</div></details></div>
      </div>
      {children}
      <nav class="mj-mobile-dock" aria-label="دسترسی سریع">
        {links.map((link) => {
          const target = link.href.replace(/^\//, "").replace(/\/$/, "") || "index"
          const active = slug === target || (target === "notes" && slug.startsWith("notes/")) || (target.startsWith("resources/") && slug.startsWith("resources/"))
          return <a key={link.href} href={siteHref(link.href, root)} aria-current={active ? "page" : undefined}>{dockIcon(link.href)}<small>{link.label}</small></a>
        })}
      </nav>
    </header>
  )
}

Header.css = `
/* Keep the ribbon, brand row and navigation in separate layout tracks. */
.center header.mj-header-v9 {
  display: grid !important; grid-template-columns: minmax(0, 1fr);
  align-items: stretch; gap: 0; width: 100%; min-width: 0;
  padding: 16px 0 0; margin: 0 0 24px; position: relative;
}
.center .mj-header-v9 > .mj-top-ribbon {
  position: static; width: 100%; height: 6px; margin: 0 0 22px;
  grid-column: 1; border-radius: 0 0 6px 6px;
}
.center .mj-header-v9 > .mj-heading-row {
  display: grid; grid-template-columns: minmax(0, 1fr) auto;
  direction: rtl; align-items: center; gap: 32px;
  width: 100%; margin: 0; padding: 0 0 22px;
}
.center .mj-header-v9 .mj-brand-seal {
  display: block; width: 300px; max-width: 100%; justify-self: start;
  margin: 0; padding: 0; line-height: 0;
}
.center .mj-header-v9 .mj-brand-seal img {
  display: block; width: 100%; height: auto; max-width: 100%;
  object-fit: contain; border-radius: 0; margin: 0;
}
.center .mj-header-v9 .mj-heading-row > .mj-tools {
  position: static; display: flex; flex-flow: row nowrap;
  align-items: center; justify-content: flex-end; align-self: center;
  width: auto; margin: 0; padding: 0; gap: 10px;
}
.center .mj-header-v9 .mj-tools .flex-component {
  position: static; display: flex; align-items: center;
  flex-flow: row nowrap; gap: 10px !important; margin: 0;
}
.center .mj-header-v9 .mj-tools .search { width: 180px; flex: 0 0 180px; }
.center .mj-header-v9 .search > .search-button {
  position: relative; display: flex; flex-direction: row;
  align-items: center; justify-content: flex-start; gap: 10px;
  width: 180px; height: 48px; min-height: 48px;
  padding: 0 14px; margin: 0; border: 1px solid #b5a476;
  border-radius: 14px; background: transparent;
}
.center .mj-header-v9 .search > .search-button > svg {
  position: static; inset: auto; transform: none;
  flex: 0 0 20px; width: 20px; height: 20px; margin: 0;
}
.center .mj-header-v9 .search > .search-button > p { display: none; }
.center .mj-header-v9 .search > .search-button::after {
  content: 'جست‌وجو…'; font-size: 13px; line-height: 1.5;
  font-weight: 400; color: var(--darkgray);
}
.center .mj-header-v9 .mj-tools button.darkmode {
  width: 40px; min-width: 40px; height: 40px; border: 0;
  background: transparent; margin: 0;
}
.center .mj-header-v9 .mj-header-languages summary {
  width: 48px; height: 48px; border-radius: 14px;
}
@media (max-width: 700px) {
  .center .mj-header-v9 > .mj-heading-row {
    grid-template-columns: minmax(0, 1fr); gap: 18px;
    justify-items: center; padding-bottom: 16px;
  }
  .center .mj-header-v9 .mj-brand-seal { justify-self: center; width: 280px; }
  .center .mj-header-v9 .mj-heading-row > .mj-tools { justify-self: center; margin: 0; }
  .center .mj-header-v9 > .mj-top-ribbon { margin-bottom: 18px; }
}
@media (max-width: 360px) {
  .center .mj-header-v9 .mj-tools .search { width: 150px; flex-basis: 150px; }
  .center .mj-header-v9 .search > .search-button { width: 150px; }
}

.center .mj-site-header .mj-navigation { display: flex; justify-content: center; flex-wrap: wrap; width: 100%; gap: .6rem 1.6rem; margin-inline: auto; }
.center #mj-main.mj-home .mj-home-columns { display: block; }
.center #mj-main.mj-home .mj-home-paths { display: none; }
.center #mj-main.mj-home .mj-topic-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
.center #mj-main.mj-home .mj-start-notes { margin-block: 2rem; }
.center #mj-main.mj-home .mj-home-topics > h2 { text-align: center; margin-bottom: 1.2rem; }
.center #mj-main.mj-home .mj-hero-actions { display: none; }
@media (max-width: 600px) { .center #mj-main.mj-home .mj-topic-cards { grid-template-columns: 1fr; } }

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

// Fetch local files as blobs so Android does not navigate to the original PDF URL.
Header.afterDOMLoaded += `
(() => {
 if(window.__mjDownloadHandler)return;
 window.__mjDownloadHandler=true;
 document.addEventListener('click',async event=>{
  const link=event.target instanceof Element?event.target.closest('a[data-mj-download]'):null;
  if(!link)return;
  event.preventDefault();event.stopPropagation();
  if(link.dataset.busy)return;
  link.dataset.busy='true';const label=link.textContent;link.textContent='در حال دریافت…';
  try{
   const url=new URL(link.href);if(url.origin!==location.origin)throw Error('origin');
   const response=await fetch(url.href);if(!response.ok)throw Error('HTTP '+response.status);
   const blob=await response.blob();const objectURL=URL.createObjectURL(blob);
   const a=document.createElement('a');a.href=objectURL;a.download=decodeURIComponent(url.pathname.split('/').pop());document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(objectURL),60000);
  }catch(error){alert('دریافت فایل انجام نشد. دوباره تلاش کنید یا از گزینهٔ مشاهده استفاده کنید.');}
  finally{delete link.dataset.busy;link.textContent=label;}
 },true);
})();
`
// Resource menu: delegated handlers work across initial load and SPA navigation.
Header.afterDOMLoaded += `
(() => {
  if (window.__mjLibraryMenuEvents) return;
  window.__mjLibraryMenuEvents = true;
  let timer;
  const menu = () => document.querySelector('.mj-library-menu');
  const cancel = () => { clearTimeout(timer); timer = undefined; };
  const close = () => { cancel(); const node = menu(); if (node) node.open = false; };
  const schedule = () => { if (!timer) timer = setTimeout(close, 180); };
  document.addEventListener('mousemove', (event) => {
    const node = menu();
    if (!node || !node.open) { cancel(); return; }
    if (node.contains(event.target)) cancel(); else schedule();
  }, { passive: true });
  document.addEventListener('mouseout', (event) => {
    if (!event.relatedTarget && menu()?.open) schedule();
  });
  document.addEventListener('pointerdown', (event) => {
    const node = menu();
    if (node && !node.contains(event.target)) close();
  });
  document.addEventListener('click', (event) => {
    const node = menu();
    if (node && event.target instanceof Element && node.contains(event.target) && event.target.closest('a')) close();
  });
  document.addEventListener('keydown', (event) => {
    const node = menu();
    if (event.key === 'Escape' && node?.open) { close(); node.querySelector('summary')?.focus(); }
  });
  document.addEventListener('nav', close);
})();
`

Header.afterDOMLoaded += articleChatScript
Header.afterDOMLoaded += readingTocScript
