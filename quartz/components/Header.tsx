import { readingTocScript } from "./readingTocScript"
import { articleChatScript } from "./articleChatScript"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { pathToRoot } from "../util/path"
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
    <header class="mj-site-header" dir="rtl">
      <a class="mj-skip" href="#mj-main">رفتن به محتوای اصلی</a>
      <div class="mj-top-ribbon" aria-hidden="true"><span /></div>
      <div class="mj-heading-row">
        <a class="mj-brand-seal" href={`${root}/`} aria-label="خانه"><img src={`${root}/static/manejamei-header-logo.webp`} alt="من جمعی؛ یادداشت‌های یک طلبه و پژوهشگر علوم انسانی" width="1500" height="550" /></a>
        <a class="mj-mobile-brand" href={`${root}/`} aria-label="من جمعی؛ خانه"><img src={`${root}/static/man-jamei-logo.webp`} alt="من جمعی" width="364" height="366" /></a>
        <a class="mj-mobile-headline" href={`${root}/`} aria-label="یادداشت‌های یک طلبه و پژوهشگر علوم انسانی"><img src={`${root}/static/manejamei-headline.webp`} alt="یادداشت‌های یک طلبه و پژوهشگر علوم انسانی" width="1087" height="300" /></a>
        <nav class="mj-mobile-dock mj-primary-nav" aria-label="ناوبری اصلی">
          {links.map((link) => {
            const target = link.href.replace(/^\//, "").replace(/\/$/, "") || "index"
            const active = slug === target || (target === "notes" && slug.startsWith("notes/")) || (target.startsWith("resources/") && slug.startsWith("resources/"))
            return <a key={link.href} href={siteHref(link.href, root)} aria-current={active ? "page" : undefined}>{dockIcon(link.href)}<small>{link.label}</small></a>
          })}
        </nav>
        <div class="mj-tools" aria-label="ابزارهای سایت">{tools}</div>
      </div>
      {children}
    </header>
  )
}

Header.css = ``

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
