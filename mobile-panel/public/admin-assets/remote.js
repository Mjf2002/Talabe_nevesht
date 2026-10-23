const normalizePath=p=>globalThis.AdminCore.path(p||'content').replace(/^content$/,p?'content':'');
export async function api(path,opts={}){const r=await fetch(path,{...opts,headers:{...(opts.body?{'Content-Type':'application/json','X-CSRF-Token':window.panelUser?.csrf||''}:{}),...opts.headers}});const d=await r.json();if(!r.ok)throw Error(d.error||'خطای ارتباط');return d}
export class RemoteStore{
constructor(){this.mode='remote';this.name='GitHub';this.entries=new Map();this.cache=new Map();this.base=null}
async init(){window.panelUser=await api('/api/me');this.name=`${window.panelUser.repo} · ${window.panelUser.branch}`;return this}
async refresh(){const t=await api('/api/tree');this.base=t.base;this.entries=new Map(t.files.map(x=>[x.path,x]));this.cache.clear()}
async list(prefix=''){prefix=normalizePath(prefix);return [...this.entries.values()].filter(x=>!prefix||x.path===prefix||x.path.startsWith(prefix+'/'))}
async exists(p){return this.entries.has(normalizePath(p))}
async raw(p){p=normalizePath(p);if(!this.entries.has(p))return null;if(!this.cache.has(p))this.cache.set(p,api('/api/file?path='+encodeURIComponent(p)+'&ref='+this.base));return this.cache.get(p)}
async readText(p){const d=await this.raw(p);if(!d)return null;return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(d.content),c=>c.charCodeAt(0)))}
async readBlob(p){const d=await this.raw(p);return d?new Blob([Uint8Array.from(atob(d.content),c=>c.charCodeAt(0))]):null}
async read(p){return this.readText(p)}
async bytes(p){const b=await this.readBlob(p);return b?new Uint8Array(await b.arrayBuffer()):new Uint8Array()}
async transaction(label,changes){return this.transact(label,changes)}
async transact(label,changes){if(!this.base)throw Error('ابتدا مخزن را بازخوانی کنید.');const lines=changes.map(c=>`${c.after===null?'حذف':this.entries.has(c.path)?'ویرایش':'ایجاد'}: ${c.path}`);if(!confirm('این تغییرات در مخزن عمومی ثبت می‌شوند:\n\n'+lines.join('\n')+'\n\nثبت و آغاز انتشار؟'))throw Error('ثبت لغو شد؛ هیچ تغییری ذخیره نشد.');const payload=[];for(const c of changes){let after=c.after,encoding=c.encoding;if(after instanceof Blob){if(after.size>10*1024*1024)throw Error('حداکثر حجم فایل در این نسخه ۱۰ مگابایت است.');const bytes=new Uint8Array(await after.arrayBuffer());let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));after=btoa(s);encoding='base64'}payload.push({path:normalizePath(c.path),after,encoding})}const result=await api('/api/commit',{method:'POST',body:JSON.stringify({base:this.base,label,changes:payload})});this.base=result.sha;for(const c of changes){if(c.after===null)this.entries.delete(c.path);else this.entries.set(c.path,{path:c.path,kind:'file'});}this.cache.clear();return result.sha}
}
