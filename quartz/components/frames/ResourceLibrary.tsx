import downloadSettings from "../../download-settings.json"
import resourceData from "../../resources.json"
const data = resourceData as { boxes: { id: string; title: string; parent: string; topic: string }[]; items: { id: string; title: string; author: string; description: string; box: string; kind: string; url: string }[] }

export const libraryKinds = [
  { id: "book", path: "books", title: "کتاب‌ها", icon: "📚", description: "کتاب‌هایی برای عمیق‌تر خواندن و دقیق‌تر اندیشیدن." },
  { id: "article", path: "articles", title: "مقالات", icon: "📄", description: "مقاله‌ها و پژوهش‌هایی برای دنبال‌کردن پرسش‌ها." },
  { id: "media", path: "media", title: "چندرسانه‌ای", icon: "🎬", description: "دیدن، شنیدن و آموختن از زاویه‌ای دیگر." },
]
const css = `
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
`
export function NoteResources({ root, references }: { root: string; references: unknown }) {
  if (!Array.isArray(references) || !references.length) return null
  const sections = [{id: "further-reading", title: "برای مطالعه بیشتر"}, {id: "resources", title: "منابع"}, {id: "citations", title: "ارجاعات"}]
  const valid = references.filter(ref => ref && typeof ref === "object" && typeof ref.id === "string")
  const group = (ref: any) => sections.some(section => section.id === ref.section) ? ref.section : "resources"
  return <>{sections.map(section => {
    const entries = valid.filter(ref => group(ref) === section.id)
    if (!entries.length) return null
    return <section class="mj-note-resources" dir="rtl"><h2>{section.title}</h2><ol>{entries.map(ref => {
    if (!ref || typeof ref !== "object" || typeof ref.id !== "string") return null
    const item = data.items.find(i => i.id === ref.id)
    const kind = item && libraryKinds.find(k => k.id === item.kind)
    return <li>{item && kind ? <a href={`${root}/resources/${kind.path}#resource-${encodeURIComponent(item.id)}`}>{item.title}{item.author ? ` — ${item.author}` : ""}</a> : <span>منبع در دسترس نیست</span>}{typeof ref.pages === "string" && ref.pages && <span>، ص. {ref.pages}</span>}{typeof ref.note === "string" && ref.note && <p>{ref.note}</p>}</li>
  })}</ol></section>
  })}</>
}
export function LibraryStyles() { return <style>{css}</style> }
export function LibraryMenu({ root }: { root: string }) {
  return <details class="mj-library-menu"><summary>منابع پیشنهادی <span aria-hidden="true">⌃</span></summary><nav aria-label="منابع پیشنهادی"><div>{libraryKinds.map(k => <a href={`${root}/resources/${k.path}`}><span aria-hidden="true">{k.icon}</span>{k.title}</a>)}</div></nav></details>
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
  return <section class="mj-library" aria-label={kind.title}>
    <header class="mj-library-hero"><a class="mj-library-kicker" href={`${root}/`}>منِ جمعی / منابع پیشنهادی</a><h1>{kind.title}</h1><p>{kind.description}</p><p>{items.length.toLocaleString("fa-IR")} منبع برای مطالعه و تأمل</p></header>
    <nav class="mj-library-tabs" aria-label="نوع منابع">{libraryKinds.map(k => <a href={`${root}/resources/${k.path}`} aria-current={k.id === kind.id ? "page" : undefined}><span aria-hidden="true">{k.icon}</span> {k.title}</a>)}</nav>
    {groups.length ? groups.map(id => <section class="mj-library-group"><h2>{ancestry(id)}</h2><div class="mj-library-grid">{items.filter(i => i.box === id).map(item => <article id={`resource-${encodeURIComponent(item.id)}`} style="scroll-margin-top:100px" class="mj-library-card"><span class="mj-library-author">{item.author || "منبع پیشنهادی"}</span><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}<div class="mj-library-actions">{item.url.startsWith("/resources/files/") ? <>{/\.(pdf|png|jpe?g|gif|webp|svg|avif|mp3|wav|ogg|m4a|mp4|webm|mov)$/i.test(item.url) && <a class="mj-library-action" href={href(item.url)} target="_blank" rel="noopener noreferrer">مشاهده ↗</a>}<a class="mj-library-action" href={downloadSettings.endpoint ? `${downloadSettings.endpoint}?file=${encodeURIComponent(item.url.split('/').pop()!)}` : href(item.url)} data-mj-download={downloadSettings.endpoint ? undefined : "true"} download>دانلود ↓</a></> : <a class="mj-library-action" href={href(item.url)} target="_blank" rel="noopener noreferrer">مشاهدهٔ منبع ↗</a>}</div></article>)}</div></section>) : <p class="mj-library-empty">هنوز منبعی در این بخش ثبت نشده است.</p>}
  </section>
}
