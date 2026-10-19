/* Local-only administration core. No network, credentials, or telemetry. */
(function (g) {
  'use strict';
  const Y = g.jsyaml;
  const BLOCKED = new Set(['.git', 'node_modules', '.quartz', '.admin-backups']);
  function path(s) {
    s = String(s).replace(/\\/g, '/').normalize('NFC');
    const parts = s.split('/');
    if (!s || s.startsWith('/') || parts.some(p => !p || p === '.' || p === '..' || BLOCKED.has(p) || /[\x00-\x1f<>:"|?*]/u.test(p) || /[. ]$/u.test(p) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/iu.test(p))) throw Error('مسیر نامعتبر یا محافظت‌شده است. از نام سادهٔ فارسی یا لاتین استفاده کنید.');
    return parts.join('/');
  }
  function slug(s) { return String(s).normalize('NFC').trim().replace(/[\s\u200c]+/gu, '-').replace(/[^\p{L}\p{N}_-]/gu, '').replace(/-+/g, '-').replace(/^-|-$/g, ''); }
  function parseMD(text) {
    const normalized = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
    const m = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
    if (normalized.startsWith('---\n') && !m) throw Error('بخش مشخصات YAML یادداشت بسته نشده است.');
    const meta = m ? Y.load(m[1], {schema:Y.JSON_SCHEMA}) ?? {} : {};
    if (!meta || typeof meta !== 'object' || Array.isArray(meta)) throw Error('مشخصات یادداشت باید یک نگاشت YAML باشد.');
    return {meta, body:m ? normalized.slice(m[0].length) : normalized};
  }
  function markdown(meta, body) { return '---\n' + Y.dump(meta, {schema:Y.JSON_SCHEMA, lineWidth:-1, noRefs:true}) + '---\n\n' + body.replace(/^\n+/, '') + (body.endsWith('\n') ? '' : '\n'); }
  function yaml(text) {
    const obj = Y.load(text, {schema:Y.JSON_SCHEMA});
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw Error('ساختار تنظیمات YAML باید یک نگاشت باشد.');
    return obj;
  }
  function configPath(files) { return ['quartz.config.yaml','quartz.config.default.yaml','quartz.plugins.json','quartz.plugins.default.json'].find(x => files.has(x)) || null; }
  function configParse(p, text) { return p.endsWith('.json') ? JSON.parse(text) : yaml(text); }
  function configDump(p, obj) { return p.endsWith('.json') ? JSON.stringify(obj,null,2)+'\n' : Y.dump(obj,{schema:Y.JSON_SCHEMA,lineWidth:-1,noRefs:true}); }
  function validHref(h) { return typeof h === 'string' && h.trim() === h && !/[\x00-\x20<>"\\]/u.test(h) && !h.startsWith('//') && (/^(https?:\/\/|mailto:|tel:)/i.test(h) || /^(\/[^/]|\/$|#)/.test(h)); }
  function validateSettings(s) {
    if (s?.version !== 1 || !s.header || !s.home || !s.footer || !s.appearance || !s.reading) throw Error('ساختار تنظیمات اختصاصی سایت معتبر نیست.');
    for (const sec of [s.header,s.footer]) {
      if (!Array.isArray(sec.links) || sec.links.length > 30) throw Error('فهرست پیوندها معتبر نیست.');
      for (const l of sec.links) if (!l || typeof l.label !== 'string' || !l.label.trim() || !validHref(l.href)) throw Error('عنوان یا نشانی یکی از پیوندها نامعتبر است؛ نمونه: /about یا https://example.com');
    }
    if (typeof s.header.title !== 'string' || !s.header.title.trim()) throw Error('عنوان سایت خالی است.');
    if (!Number.isInteger(s.home.recentCount) || s.home.recentCount < 1 || s.home.recentCount > 50) throw Error('تعداد نوشته‌های اخیر باید ۱ تا ۵۰ باشد.');
    if (!/^#[0-9a-f]{6}$/i.test(s.appearance.accent) || !(s.appearance.cardRadius >= 0 && s.appearance.cardRadius <= 40) || !(s.appearance.fontSize >= 14 && s.appearance.fontSize <= 24)) throw Error('رنگ، اندازهٔ متن یا گردی باکس‌ها معتبر نیست.');
    for (const [obj, keys] of [[s.header,['title','subtitle']],[s.footer,['text']],[s.home,['recentTitle','topicsTitle']]]) for (const key of keys) if (typeof obj[key] !== 'string') throw Error('متن یکی از تنظیمات سایت معتبر نیست.');
    for (const flag of [s.home.recentEnabled,s.reading.enabled,s.backToTop]) if (typeof flag !== 'boolean') throw Error('وضعیت فعال یا غیرفعال یکی از امکانات معتبر نیست.');
    if (!Number.isInteger(s.reading.wordsPerMinute) || !(s.reading.wordsPerMinute >= 50 && s.reading.wordsPerMinute <= 1000)) throw Error('سرعت مطالعه باید عدد صحیح ۵۰ تا ۱۰۰۰ باشد.');
    if (s.home.startTitle !== undefined && typeof s.home.startTitle !== 'string') throw Error('عنوان بخش برای شروع معتبر نیست.');
    if (s.home.startEnabled !== undefined && typeof s.home.startEnabled !== 'boolean') throw Error('وضعیت بخش برای شروع معتبر نیست.');
    if (s.home.startNotes !== undefined && (!Array.isArray(s.home.startNotes) || s.home.startNotes.some(e => !e || typeof e.title !== 'string' || typeof e.slug !== 'string' || (!e.title.trim() && !e.slug)))) throw Error('عنوان یا مقصد یکی از یادداشت‌های آغازین معتبر نیست.');
    return s;
  }
  function toBase64(bytes) {let s='';for(let i=0;i<bytes.length;i+=32768)s+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(s);}
  function fromBase64(s) {return Uint8Array.from(atob(s),c=>c.charCodeAt(0));}
  class Store {
    constructor(root) { this.root = root; this.busy = false; }
    async parent(p, create=false, backup=false) {
      const parts = (backup ? p : path(p)).split('/'); const name=parts.pop(); let dir=this.root;
      for(const part of parts) dir=await dir.getDirectoryHandle(part,{create});
      return {dir,name};
    }
    async read(p) { try {const {dir,name}=await this.parent(p); return await (await (await dir.getFileHandle(name)).getFile()).text();} catch(e) {if(e.name==='NotFoundError') return null; throw e;} }
    async bytes(p, backup=false) {const {dir,name}=await this.parent(p,false,backup);return new Uint8Array(await (await (await dir.getFileHandle(name)).getFile()).arrayBuffer());}
    async rawWrite(p, value, backup=false) { const {dir,name}=await this.parent(p,true,backup);const h=await dir.getFileHandle(name,{create:true});const w=await h.createWritable();try{await w.write(value);await w.close();}catch(e){try{await w.abort();}catch{}throw e;} }
    async mkdir(p) { path(p); let dir=this.root; for(const part of p.split('/')) dir=await dir.getDirectoryHandle(part,{create:true}); }
    async exists(p) {try{const {dir,name}=await this.parent(p);try{await dir.getFileHandle(name);return true;}catch(e){if(e.name==='TypeMismatchError'){await dir.getDirectoryHandle(name);return true;}throw e;}}catch(e){if(e.name==='NotFoundError')return false;throw e;}}
    async list(prefix='', includeBackups=false) {
      let base=this.root;if(prefix)for(const part of prefix.split('/'))base=await base.getDirectoryHandle(part);
      const out=[];
      async function walk(dir, pre){for await(const [name,h] of dir.entries()) {if((BLOCKED.has(name) && !(includeBackups && name==='.admin-backups')) || ['public','dist','build'].includes(name))continue; const p=pre ? pre+'/'+name:name;out.push({path:p,kind:h.kind});if(h.kind==='directory')await walk(h,p);}}
      await walk(base,prefix);return out.sort((a,b)=>a.path.localeCompare(b.path,'fa'));
    }
    async value(c) {if(c.encoding!=='base64')return this.read(c.path);try{return toBase64(await this.bytes(c.path));}catch(e){if(e.name==='NotFoundError')return null;throw e;}}
    async transaction(label, changes) {
      if(this.busy)throw Error('عملیات دیگری در حال انجام است.');
      if(!changes.length)throw Error('تغییری برای ذخیره وجود ندارد.');
      this.busy=true; let backupId=null; let modified=false;
      try {
        const seen=new Set();
        for(const c of changes){path(c.path);if(seen.has(c.path))throw Error('مسیر تکراری در عملیات.');seen.add(c.path);const now=await this.value(c);if(now!==c.before)throw Error('فایل بیرون از پنل تغییر کرده است: '+c.path+'؛ بازخوانی کنید.');}
        backupId=new Date().toISOString().replace(/[:.]/g,'-')+'-'+Math.random().toString(36).slice(2,8);
        const base='tools/.admin-backups/';
        await this.rawWrite(base+'.gitignore','*\n!.gitignore\n',true);
        const manifest={version:1,id:backupId,label,date:new Date().toISOString(),changes};
        await this.rawWrite(base+backupId+'.json',JSON.stringify(manifest,null,2),true);
        // A second conflict check prevents silently replacing files edited during backup.
        for(const c of changes)if(await this.value(c)!==c.before)throw Error('تعارض هم‌زمان؛ فایل تغییر کرده است: '+c.path);
        for(const c of changes){modified=true;if(c.after===null){const {dir,name}=await this.parent(c.path);await dir.removeEntry(name);}else{await this.rawWrite(c.path,c.encoding==='base64'?fromBase64(c.after):c.after);if(await this.value(c)!==c.after)throw Error('بررسی ذخیره ناموفق: '+c.path);}}
        return backupId;
      }catch(e){throw Error(e.message+(backupId?'\nپشتیبان: '+backupId:'')+(modified?'\nممکن است بخشی از تغییرات انجام شده باشد؛ از بخش پشتیبان بررسی و بازیابی کنید.':''));}finally{this.busy=false;}
    }
    async backups(){try{const d=await this.root.getDirectoryHandle('tools');const b=await d.getDirectoryHandle('.admin-backups');const a=[];for await(const [n,h]of b.entries())if(h.kind==='file'&&n.endsWith('.json')){try{a.push(JSON.parse(await(await h.getFile()).text()));}catch{}}return a.sort((a,b)=>b.date.localeCompare(a.date));}catch(e){if(e.name==='NotFoundError')return [];throw e;}}
    async restore(id){const all=await this.backups();const b=all.find(x=>x.id===id);if(!b||b.version!==1||!Array.isArray(b.changes))throw Error('پشتیبان معتبر پیدا نشد.');const changes=[];for(const c of b.changes){path(c.path);if(c.before!==null&&typeof c.before!=='string')throw Error('محتوای پشتیبان معتبر نیست.');const now=await this.value(c);if(now!==c.before)changes.push({path:c.path,before:now,after:c.before,...(c.encoding?{encoding:c.encoding}:{})});}return await this.transaction('بازیابی '+id,changes);}
  }
  g.AdminCore={toBase64,fromBase64,path,slug,parseMD,markdown,yaml,configPath,configParse,configDump,validHref,validateSettings,Store};
})(globalThis);
