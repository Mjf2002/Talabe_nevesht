// Native disclosure: independent of the community TOC toggle script.
export const readingTocScript = `
(() => {
 const css = ".mj-toc-card{direction:rtl;text-align:right;box-sizing:border-box;border:1px solid var(--lightgray,#ddd);border-radius:20px;background:var(--light,#faf9f6);color:var(--dark,#253d36);box-shadow:0 8px 28px #00000006;overflow:hidden;width:100%;margin:20px 0;font-family:inherit}.mj-toc-card>summary{display:flex;align-items:center;gap:12px;padding:18px 20px;cursor:pointer;list-style:none;user-select:none;font-weight:700;font-size:1rem}.mj-toc-card>summary::-webkit-details-marker{display:none}.mj-toc-icon{display:grid;place-items:center;width:34px;height:34px;border-radius:11px;background:var(--highlight,#edf2ec);color:var(--secondary,#48756b);font-size:1.2rem;flex-shrink:0}.mj-toc-caption{display:block;font-size:.7rem;font-weight:400;color:var(--gray,#69756e);margin-top:3px}.mj-toc-chevron{margin-inline-start:auto;transform:rotate(180deg);transition:transform .2s;color:var(--secondary,#48756b)}.mj-toc-card[open]>summary .mj-toc-chevron{transform:rotate(0deg)}.mj-toc-card[open]>summary{border-bottom:1px solid var(--lightgray,#ddd)}.mj-toc-list{list-style:none!important;padding:12px 14px 16px!important;margin:0!important;max-height:440px;overflow:auto;overscroll-behavior:contain}.mj-toc-list>li{list-style:none!important;margin:3px 0!important;padding:0!important;padding-inline-start:calc(var(--toc-depth,0) * 14px)!important}.mj-toc-list a{display:flex!important;align-items:baseline;gap:10px;padding:10px 12px;border-radius:11px;color:var(--darkgray,#52665b)!important;text-decoration:none!important;background:transparent!important;font-size:.9rem;font-weight:500;line-height:1.9;overflow-wrap:anywhere}.mj-toc-list a::before{content:'•';color:var(--secondary,#48756b);flex-shrink:0}.mj-toc-list a:hover{background:var(--highlight,#edf2ec)!important;color:var(--secondary,#48756b)!important}.mj-toc-card summary:focus-visible,.mj-toc-list a:focus-visible{outline:2px solid var(--secondary,#48756b);outline-offset:-3px}@media(prefers-reduced-motion:reduce){.mj-toc-chevron{transition:none}}";
 const layoutCSS = '@media(min-width:1280px){#mj-main{position:relative}#mj-main>.mj-toc-card{position:absolute;top:0;left:calc(100% + 24px);right:auto;width:calc((100vw - 760px)/2 - 44px);max-width:270px;z-index:2;margin:0;max-height:calc(100dvh - 80px);overflow:auto}#mj-main>.mj-toc-card>summary{padding:14px 12px;gap:8px}#mj-main>.mj-toc-card .mj-toc-list{max-height:calc(100dvh - 285px);padding:8px!important}#mj-main>.mj-toc-card .mj-toc-list a{font-size:.8rem;padding:8px}}@media(max-width:1279px){#mj-main>.mj-toc-card{position:static;max-width:760px;margin:0 auto 28px}}';
 const setup=()=>{
  if(!document.getElementById('mj-toc-design')){const style=document.createElement('style');style.id='mj-toc-design';style.setAttribute('data-persist','');style.textContent=css+layoutCSS;document.head.append(style);}
  document.querySelectorAll('.mj-reading-tools .toc').forEach(old=>{
   const links=[...old.querySelectorAll('a[href]')].filter(a=>a.getAttribute('href').includes('#')&&a.textContent.trim());
   if(!links.length)return;
   const main=document.querySelector('#mj-main');
   if(main?.querySelector(':scope > .mj-toc-card')){old.remove();return;}
   const card=document.createElement('details');card.className='mj-toc-card';card.open=true;card.setAttribute('dir','rtl');
   const summary=document.createElement('summary');
   const icon=document.createElement('span');icon.className='mj-toc-icon';icon.textContent='☷';icon.setAttribute('aria-hidden','true');
   const title=document.createElement('span');title.textContent='فهرست مطالب';
   const caption=document.createElement('span');caption.className='mj-toc-caption';caption.textContent=links.length.toLocaleString('fa-IR')+' سرفصل در این نوشته';title.append(caption);
   const arrow=document.createElement('span');arrow.className='mj-toc-chevron';arrow.textContent='⌃';arrow.setAttribute('aria-hidden','true');
   summary.append(icon,title,arrow);
   const list=document.createElement('ul');list.className='mj-toc-list';
   links.forEach(source=>{const li=document.createElement('li');const depth=source.closest('li')?.className.match(/depth-(\\d+)/);li.style.setProperty('--toc-depth',String(Math.min(4,depth?Number(depth[1]):0)));const link=document.createElement('a');link.setAttribute('href',source.getAttribute('href'));link.textContent=source.textContent.trim();list.append(li);li.append(link);});
   card.append(summary,list);
   const article=main?.querySelector('article');
   if(article){article.before(card);old.remove();}else{old.replaceWith(card);}
  });
 };
 document.addEventListener('nav',setup);setup();
})();
`
