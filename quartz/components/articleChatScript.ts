export const articleChatScript = `
(() => {
 const setup = () => {
  const box = document.querySelector('[data-article-chat]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  const article = document.querySelector('#mj-main article');
  const form = box.querySelector('form'), input = box.querySelector('textarea'), log = box.querySelector('[role="log"]'), send = box.querySelector('button[type="submit"]');
  const blocks = article ? [...article.querySelectorAll('p,li,blockquote,pre,h2,h3')].filter(el => !el.closest('li,blockquote,pre') || el.matches('li,blockquote,pre')).filter(el => el.textContent.trim()) : [];
  blocks.forEach((el,i) => { el.dataset.chatBlock = String(i+1); if(!el.id) el.id = 'mj-source-'+(i+1); });
  function message(text) { const el = document.createElement('p'); el.style.whiteSpace='pre-wrap'; el.textContent=text; log.append(el); return el; }
  box.querySelectorAll('[data-question]').forEach(b => b.addEventListener('click', () => { input.value=b.textContent; input.focus(); }));
  let busy=false;
  form.addEventListener('submit', async event => {
   event.preventDefault();
   const question=input.value.trim(); if(busy || !question) return;
   const endpoint=box.dataset.endpoint;
   if(!endpoint) { message('سرویس گفت‌وگو هنوز توسط مدیر سایت تنظیم نشده است.'); return; }
   if(!blocks.length) { message('متن نوشته برای پردازش در دسترس نیست.'); return; }
   if(!box.querySelector('input[type="checkbox"]').checked) { message('برای ارسال، رضایت انتقال متن به سرویس مدل را تأیید کنید.'); return; }
   busy=true; send.disabled=true; message('شما: '+question); input.value='';
   const output=message('در حال بررسی نوشته…'); const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),65000);
   try {
    const response=await fetch((endpoint.endsWith('/') ? endpoint.slice(0,-1) : endpoint)+'/chat', {method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({question,blocks:blocks.map(el=>el.textContent.trim())})});
    const data=await response.json(); if(!response.ok) throw new Error(data.error || 'خطای سرویس');
    output.textContent=data.answer;
    const refs=[...new Set([...data.answer.matchAll(/\\[بند\\s+(\\d+)\\]/g)].map(m=>Number(m[1])))];
    for(const n of refs) { if(!blocks[n-1]) continue; const link=document.createElement('a'); link.href='#'+blocks[n-1].id; link.textContent='بند '+n+' ↗'; link.style.marginInline='0.5em'; output.append(link); }
   } catch(error) { output.textContent=error.name==='AbortError'?'زمان پاسخ‌گویی تمام شد؛ دوباره امتحان کنید.': 'ارسال ناموفق: '+error.message; }
   finally {clearTimeout(timer); busy=false;send.disabled=false;}
  });
 };
 document.addEventListener('nav',setup); setup();
})();
`
