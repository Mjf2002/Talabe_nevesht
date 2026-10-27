import downloadSettings from "../../download-settings.json"
import resourceData from "../../resources.json"
const data = resourceData as { boxes: { id: string; title: string; parent: string; topic: string }[]; items: { id: string; title: string; author: string; year?: string | number; journal?: string; description: string; box: string; kind: string; url: string }[] }

export const libraryKinds = [
  { id: "book", path: "books", title: "کتاب‌ها", icon: "📚", description: "کتاب‌هایی برای عمیق‌تر خواندن و دقیق‌تر اندیشیدن." },
  { id: "article", path: "articles", title: "مقالات", icon: "📄", description: "مقاله‌ها و پژوهش‌هایی برای دنبال‌کردن پرسش‌ها." },
  { id: "media", path: "media", title: "چندرسانه‌ای", icon: "🎬", description: "دیدن، شنیدن و آموختن از زاویه‌ای دیگر." },
]
const css = `
.mj-note-resources{direction:rtl;text-align:right;margin-block:28px;padding:22px;border:1px solid var(--lightgray);border-inline-start:4px solid var(--secondary);border-radius:16px;background:var(--light);overflow-wrap:anywhere}
.mj-note-resources h2{font-size:1.15rem;margin:0 0 16px}.mj-note-resources ol{padding-inline-start:24px;margin:0}.mj-note-resources li{padding:8px 4px;line-height:1.9}.mj-note-resources li+li{border-top:1px solid var(--lightgray)}.mj-note-resources li p{margin:4px 0;font-size:.9rem;color:var(--gray);white-space:pre-line}
.mj-note-resources--further-reading{background:var(--highlight);border-radius:22px}.mj-note-resources--further-reading ol{list-style-type:disc}.mj-note-resources--citations{border-inline-start-width:1px;border-top:3px solid var(--secondary);border-radius:4px}.mj-note-resources--citations ol{list-style-type:decimal}
@media(max-width:600px){.mj-note-resources{padding:16px}}

.mj-library-menu{position:fixed;right:16px;left:auto;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:80;direction:rtl;font-size:14px}
.mj-library-menu summary{cursor:pointer;list-style:none;border:1px solid var(--lightgray);border-radius:24px;background:var(--light);color:var(--dark);padding:11px 17px;min-height:44px;box-sizing:border-box;box-shadow:0 5px 22px #0002}
.mj-library-menu summary::-webkit-details-marker{display:none}
.mj-library-menu summary:focus-visible,.mj-library a:focus-visible{outline:2px solid var(--secondary);outline-offset:4px}
.mj-library-menu nav{position:absolute;bottom:100%;right:0;left:auto;padding-bottom:10px;width:220px;max-width:calc(100vw - 32px)}
.mj-library-menu nav>div{padding:8px;border:1px solid var(--lightgray);border-radius:18px;background:var(--light);box-shadow:0 10px 35px #0003}
.mj-library-menu nav a{display:flex;gap:12px;align-items:center;padding:12px;border-radius:10px;text-decoration:none;color:var(--dark)}
.mj-library-menu nav a>span{font-size:24px;line-height:1.2;flex:0 0 32px;text-align:center}
.mj-library-menu nav a:hover{background:var(--highlight);color:var(--secondary)}
.mj-library{direction:rtl;text-align:right;padding:12px 0 48px;color:var(--dark)}
.mj-library-hero{position:relative;overflow:hidden;padding:35px 28px;border:1px solid var(--lightgray);border-radius:24px;background:linear-gradient(135deg,var(--highlight),var(--light));margin-bottom:24px}
.mj-library-kicker{font-size:13px;letter-spacing:.04em;color:var(--secondary)}
.mj-library .mj-library-hero h1{font-size:2.4rem;margin:12px 0;line-height:1.4}
.mj-library-hero p{color:var(--gray);margin:0;max-width:40em}
.mj-library-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0 30px}
.mj-library-tabs a{border:1px solid var(--lightgray);border-radius:24px;padding:8px 18px;text-decoration:none;color:var(--dark)}
.mj-library-tabs a[aria-current=page]{background:var(--secondary);color:var(--light);border-color:var(--secondary)}
.mj-library-group{margin:32px 0}
.mj-library-group>h2{font-size:1.2rem;border-bottom:1px solid var(--lightgray);padding-bottom:12px}
.mj-library-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.mj-library-card{display:flex;flex-direction:column;align-items:stretch;border:1px solid var(--lightgray);border-radius:18px;padding:24px;background:var(--light);transition:border-color .2s,box-shadow .2s;min-width:0}
.mj-library-card:hover{border-color:var(--secondary);box-shadow:0 8px 25px #0001}
.mj-library .mj-library-card h3{font-size:1.2rem;margin:12px 0;line-height:1.7;overflow-wrap:anywhere}
.mj-library-card p{font-size:.95rem;color:var(--gray);white-space:pre-line;overflow-wrap:anywhere}
.mj-library-author{font-size:.85rem;color:var(--secondary)}
.mj-library-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:auto;padding-top:16px}
.mj-library-card .mj-library-action{align-self:flex-start;margin-top:0;padding:8px 16px;border:1px solid var(--lightgray);border-radius:10px;text-decoration:none;font-size:.9rem}
.mj-library-empty{border:1px dashed var(--lightgray);border-radius:18px;padding:30px;text-align:center;color:var(--gray)}
@media(max-width:600px){.mj-library-grid{grid-template-columns:1fr}.mj-library-hero{padding:26px 20px}.mj-library .mj-library-hero h1{font-size:2rem}.mj-library-card{padding:20px}}
@media print{.mj-library-menu{display:none}}
/* Reading-first resource layout; scoped to avoid changing the site theme. */
.mj-library .mj-library-grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))}
.mj-library--article .mj-library-grid{grid-template-columns:minmax(0,1fr)}
.mj-library .mj-library-card{text-align:right;gap:4px}
.mj-library .mj-library-card h3{margin:0 0 8px;line-height:1.9}
.mj-library .mj-library-card p{color:var(--dark);text-align:right;line-height:1.95;margin:8px 0;word-spacing:normal}
.mj-library .mj-library-author{color:var(--dark);font-size:.9rem;line-height:1.9;margin-bottom:8px}
.mj-library .mj-library-action{color:var(--dark);background:var(--highlight);border-color:var(--secondary);min-height:44px;display:inline-flex;align-items:center;box-sizing:border-box}
.mj-library .mj-library-action:hover{outline:1px solid var(--secondary)}
.mj-library-description-preview{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.mj-library-description summary{cursor:pointer;color:var(--dark);text-decoration:underline;text-underline-offset:4px;padding:8px 0;min-height:44px;box-sizing:border-box}
.mj-library-description summary:focus-visible{outline:2px solid var(--secondary);outline-offset:3px}
.mj-library-description .mj-library-description-full{display:none}
.mj-library-description:has(details[open]) .mj-library-description-preview{display:none}
.mj-library-description details[open] .mj-library-description-full{display:block}
.mj-note-resources li{text-align:right;word-spacing:normal}
.mj-note-resources li p{color:var(--dark)}
.mj-note-resources--further-reading ol{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:12px;padding:0;list-style:none}
.mj-note-resources--further-reading li{padding:14px;border:1px solid var(--lightgray);border-radius:12px;background:var(--light)}
.mj-note-resources--further-reading li+li{border-top:1px solid var(--lightgray)}
.mj-note-resources--resources{border-inline-start-width:1px;border-radius:8px;background:transparent}
.mj-note-resources--resources ol{list-style:none;padding:0}
.mj-note-resources--citations{font-size:.95rem}
@media(max-width:600px){.mj-library .mj-library-card{padding:18px}.mj-library .mj-library-card h3{font-size:1.1rem}}
/* Compact cards and distinct actions */
.mj-library .mj-library-grid{gap:10px}
.mj-library .mj-library-card{padding:14px 16px;border-radius:14px;gap:2px}
.mj-library .mj-library-card h3{font-size:1rem;line-height:1.65;margin:0 0 4px}
.mj-library .mj-library-author{font-size:.8rem;line-height:1.6;margin:0 0 4px}
.mj-library .mj-library-card p{font-size:.85rem;line-height:1.7;margin:4px 0}
.mj-library .mj-library-description-preview{-webkit-line-clamp:1;white-space:normal}
.mj-library-description summary{font-size:.78rem;min-height:0;padding:4px 0;line-height:1.6;text-decoration:none;color:var(--secondary)}
.mj-library .mj-library-actions{margin-top:4px;padding-top:4px;gap:8px}
.mj-library .mj-library-card .mj-library-action{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:6px 13px;min-height:44px;border-radius:11px;font-size:.82rem;font-weight:700;line-height:1.4;transition:transform .15s,box-shadow .15s,background .15s}
.mj-library .mj-library-card .mj-library-action--view{background:var(--highlight);color:var(--dark);border:1px solid var(--secondary)}
.mj-library .mj-library-card .mj-library-action--download{background:linear-gradient(135deg,#087f83,#08666c);color:#fff;border:1px solid #178e94;box-shadow:0 3px 8px #0002}
.mj-library .mj-library-card .mj-library-action:hover{transform:translateY(-1px);box-shadow:0 4px 10px #0003;outline:none}
.mj-library .mj-library-card .mj-library-action:focus-visible{outline:2px solid var(--secondary);outline-offset:3px}
.mj-library .mj-library-action span[aria-hidden]{font-size:1rem;line-height:1}
@media(prefers-reduced-motion:reduce){.mj-library .mj-library-card .mj-library-action{transition:none}.mj-library .mj-library-card .mj-library-action:hover{transform:none}}
@media(max-width:600px){.mj-library .mj-library-card{padding:12px}.mj-library .mj-library-card h3{font-size:.95rem}}
@media print{.mj-library-description .mj-library-description-preview,.mj-library-description summary{display:none}.mj-library-description .mj-library-description-full{display:block}}
/* Gentle entrance; native details semantics and keyboard controls stay intact. */
.mj-library-menu .mj-library-chevron{display:inline-block;transition:transform .28s ease}
.mj-library-menu[open] .mj-library-chevron{transform:rotate(180deg)}
.mj-library-menu[open] nav{animation:mj-library-reveal .3s cubic-bezier(.2,.7,.3,1) both;transform-origin:bottom right}
@keyframes mj-library-reveal{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@supports (transition-behavior:allow-discrete){
 .mj-library-menu::details-content{content-visibility:hidden;opacity:0;transform:translateY(10px);transition:opacity .28s ease,transform .28s ease,content-visibility .28s allow-discrete}
 .mj-library-menu[open]::details-content{content-visibility:visible;opacity:1;transform:translateY(0)}
 @starting-style{.mj-library-menu[open]::details-content{opacity:0;transform:translateY(10px)}}
 .mj-library-menu[open] nav{animation:none}
}
@media(prefers-reduced-motion:reduce){.mj-library-menu[open] nav{animation:none}.mj-library-menu::details-content,.mj-library-menu .mj-library-chevron{transition:none}}

`
export function NoteResources({ root, references }: { root: string; references: unknown }) {
  if (!Array.isArray(references) || !references.length) return null
  const sections = [{id: "further-reading", title: "برای مطالعه بیشتر"}, {id: "resources", title: "منابع"}, {id: "citations", title: "ارجاعات"}]
  const valid = references.filter(ref => ref && typeof ref === "object" && typeof ref.id === "string")
  const group = (ref: any) => sections.some(section => section.id === ref.section) ? ref.section : "resources"
  return <>{sections.map(section => {
    const entries = valid.filter(ref => group(ref) === section.id)
    if (!entries.length) return null
    return <section class={`mj-note-resources mj-note-resources--${section.id}`} dir="rtl"><h2>{section.title}</h2><ol>{entries.map(ref => {
    if (!ref || typeof ref !== "object" || typeof ref.id !== "string") return null
    const item = data.items.find(i => i.id === ref.id)
    const kind = item && libraryKinds.find(k => k.id === item.kind)
    return <li>{item && kind ? <a href={`${root}/resources/${kind.path}#resource-${encodeURIComponent(item.id)}`}>{item.title}{[item.author, item.year, item.journal].filter(value => value !== undefined && value !== null && String(value).trim() !== "").length > 0 ? ` — ${[item.author, item.year, item.journal].filter(value => value !== undefined && value !== null && String(value).trim() !== "").join("، ")}` : ""}</a> : <span>منبع در دسترس نیست</span>}{typeof ref.pages === "string" && ref.pages && <span>، ص. {ref.pages}</span>}{typeof ref.note === "string" && ref.note && <p>{ref.note}</p>}</li>
  })}</ol></section>
  })}</>
}
export function ResourceDescription({ text }: { text: string }) {
  return <div class="mj-library-description"><p class="mj-library-description-preview" aria-hidden="true">{text}</p><details><summary>توضیحات بیشتر</summary><p class="mj-library-description-full">{text}</p></details></div>
}
export function LibraryStyles() { return <style>{css}</style> }
export function LibraryMenu({ root }: { root: string }) {
  return <details class="mj-library-menu"><summary><span aria-hidden="true">📚</span> منابع پیشنهادی <span class="mj-library-chevron" aria-hidden="true">⌃</span></summary><nav aria-label="منابع پیشنهادی"><div>{libraryKinds.map(k => <a href={`${root}/resources/${k.path}`}><span aria-hidden="true">{k.icon}</span>{k.title}</a>)}</div></nav></details>
}
export function LibraryPage({ root, path }: { root: string; path: string }) {
  const kind = libraryKinds.find(k => path === `resources/${k.path}`)!
  const href = (url: string) => /^https:\/\/[^\s]+$/i.test(url) ? url : /^\/resources\/files\/[a-z0-9.-]+$/i.test(url) ? `${root}${url}` : ""
  const items = data.items.filter(i => i.kind === kind.id && href(i.url))
  const ancestry = (id: string, seen = new Set<string>()): string => {
    if (seen.has(id)) return ""
    seen.add(id)
    const box = data.boxes.find(b => b.id === id)
    if (!box) return "بدون دسته‌بندی"
    return [box.parent ? ancestry(box.parent, seen) : "", box.title].filter(Boolean).join(" / ")
  }
  const groups = [...new Set(items.map(i => i.box))]
  return <section class={`mj-library mj-library--${kind.id}`} aria-label={kind.title}>
    <header class="mj-library-hero"><a class="mj-library-kicker" href={`${root}/`}>منِ جمعی / منابع پیشنهادی</a><h1>{kind.title}</h1><p>{kind.description}</p><p>{items.length.toLocaleString("fa-IR")} منبع برای مطالعه و تأمل</p></header>
    <nav class="mj-library-tabs" aria-label="نوع منابع">{libraryKinds.map(k => <a href={`${root}/resources/${k.path}`} aria-current={k.id === kind.id ? "page" : undefined}><span aria-hidden="true">{k.icon}</span> {k.title}</a>)}</nav>
    {groups.length ? groups.map(id => <section class="mj-library-group"><h2>{ancestry(id)}</h2><div class="mj-library-grid">{items.filter(i => i.box === id).map(item => <article id={`resource-${encodeURIComponent(item.id)}`} style="scroll-margin-top:100px" class="mj-library-card"><h3>{item.title}</h3><div class="mj-library-author">{item.author && <><span aria-hidden="true">✍️</span> </>}{[item.author, item.year, item.journal].filter(value => value !== undefined && value !== null && String(value).trim() !== "").join(" · ") || "منبع پیشنهادی"}</div>{item.description && <ResourceDescription text={item.description} />}<div class="mj-library-actions">{item.url.startsWith("/resources/files/") ? <>{/\.(pdf|png|jpe?g|gif|webp|svg|avif|mp3|wav|ogg|m4a|mp4|webm|mov)$/i.test(item.url) && <a class="mj-library-action mj-library-action--view" href={href(item.url)} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">👁️</span> مشاهده</a>}<a class="mj-library-action mj-library-action--download" href={downloadSettings.endpoint ? `${downloadSettings.endpoint}?file=${encodeURIComponent(item.url.split('/').pop()!)}` : href(item.url)} data-mj-download={downloadSettings.endpoint ? undefined : "true"} download><span aria-hidden="true">📥</span> دانلود</a></> : <a class="mj-library-action mj-library-action--view" href={href(item.url)} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">👁️</span> مشاهده</a>}</div></article>)}</div></section>) : <p class="mj-library-empty">هنوز منبعی در این بخش ثبت نشده است.</p>}
  </section>
}
