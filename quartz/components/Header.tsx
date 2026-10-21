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
