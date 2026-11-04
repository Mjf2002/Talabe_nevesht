import { articleChatEndpoint } from "../articleChatConfig"

/** Presentation only; the client script binds to the data-* hooks. */
export function ArticleChat() {
  return <section data-article-chat data-endpoint={articleChatEndpoint} dir="rtl">
    <button type="button" class="mj-chat-launch" aria-expanded="false">✦ گفت‌وگو با نوشته <span>پرسش، کشف، فهم بهتر</span></button>
    <aside class="mj-chat-panel" hidden aria-label="دستیار مطالعه">
      <header class="mj-chat-header"><div><strong>✦ دستیار مطالعه</strong><small>همراه شما برای فهم این نوشته</small></div><button type="button" data-close aria-label="بستن گفت‌وگو">✕</button></header>
      <div class="mj-chat-scroll"><div class="mj-chat-welcome"><span class="mj-chat-orb">✦</span><h2>از دل نوشته، بیشتر کشف کن.</h2><p>ایده‌ها را روشن‌تر ببین، استدلال‌ها را بررسی کن و به متن برگرد.</p></div>
        <div class="mj-chat-suggestions">{["ایدهٔ اصلی این نوشته چیست؟", "این نوشته را ساده‌تر توضیح بده", "کدام پرسش‌ها در متن بی‌پاسخ مانده‌اند؟"].map(q => <button type="button" data-question>{q}<span>↗</span></button>)}</div>
        <div role="log" aria-live="polite" aria-label="پرسش و پاسخ" />
      </div>
      <form class="mj-chat-form">
        <div class="mj-chat-compose"><label class="mj-chat-sr" for="mj-chat-input">پرسش دربارهٔ نوشته</label><textarea id="mj-chat-input" required maxLength={2000} rows={2} placeholder="دربارهٔ این نوشته بپرس…" /><button type="submit" aria-label="ارسال پرسش">↑</button></div>
        <div class="mj-chat-footer"><button type="button" data-reset>گفت‌وگوی تازه</button><span>هر پرسش مستقل است · پاسخ ممکن است خطا داشته باشد</span></div>
      </form>
    </aside>
  </section>
}
