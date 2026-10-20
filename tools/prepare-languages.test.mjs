import {test} from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {spawnSync} from 'node:child_process'
import {parseMD,localizeBody} from './prepare-languages.mjs'
const script=path.resolve('tools/prepare-languages.mjs')
async function fixture(fn){const p=await fs.mkdtemp(path.join(os.tmpdir(),'mj-i18n-'));try{for(const d of ['content','quartz','i18n/translations/en'])await fs.mkdir(path.join(p,d),{recursive:true});await fs.writeFile(path.join(p,'content/index.md'),'---\ntitle: خانه\n---\nاصلی');await fs.writeFile(path.join(p,'i18n/config.json'),JSON.stringify({version:1,enabled:['fa','en'],automatic:false,model:'test',maxNewFiles:1}));await fn(p)}finally{await fs.rm(p,{recursive:true,force:true})}}
const run=p=>spawnSync(process.execPath,[script],{env:{...process.env,I18N_PROJECT:p,TRANSLATION_API_KEY:''},encoding:'utf8'})
test('frontmatter and code-safe links',()=>{assert.equal(parseMD('---\ntitle: Hello\n---\nText').meta.title,'Hello');const body='[Home](/index) `[/index](/index)`\n```md\n[Home](/index)\n```';const s=localizeBody(body,'en',new Map([['index.md','']]),[]);assert.match(s,/\[Home\]\(\/en\/index\)/);assert.match(s,/`\[\/index\]\(\/index\)`/);assert.match(s,/```md\n\[Home\]\(\/index\)\n```/)})
test('manual home activates language, originals unchanged, repeat build safe',()=>fixture(async p=>{await fs.writeFile(path.join(p,'i18n/translations/en/index.md'),'---\ntitle: Home\n---\nHello');const original=await fs.readFile(path.join(p,'content/index.md'),'utf8');for(let i=0;i<2;i++){const r=run(p);assert.equal(r.status,0,r.stderr);assert.match(await fs.readFile(path.join(p,'.i18n-build/content/en/index.md'),'utf8'),/Hello/)}assert.equal(await fs.readFile(path.join(p,'content/index.md'),'utf8'),original);assert.deepEqual(JSON.parse(await fs.readFile(path.join(p,'quartz/i18n.generated.json'))).enabled,['fa','en'])}))
test('missing home hides language',()=>fixture(async p=>{assert.equal(run(p).status,0);assert.deepEqual(JSON.parse(await fs.readFile(path.join(p,'quartz/i18n.generated.json'))).enabled,['fa'])}))
test('missing API key fails clearly',()=>fixture(async p=>{const file=path.join(p,'i18n/config.json');const c=JSON.parse(await fs.readFile(file));c.automatic=true;await fs.writeFile(file,JSON.stringify(c));const r=run(p);assert.equal(r.status,1);assert.match(r.stderr,/TRANSLATION_API_KEY/)}))
test('draft source and manual draft are not translated',()=>fixture(async p=>{await fs.writeFile(path.join(p,'content/secret.md'),'---\ndraft: true\n---\nSecret');await fs.writeFile(path.join(p,'i18n/translations/en/index.md'),'Home');await fs.writeFile(path.join(p,'i18n/translations/en/secret.md'),'Secret translation');assert.equal(run(p).status,0);await assert.rejects(fs.access(path.join(p,'.i18n-build/content/en/secret.md')))}))
test('unmarked build folder is never removed',()=>fixture(async p=>{await fs.mkdir(path.join(p,'.i18n-build'));await fs.writeFile(path.join(p,'.i18n-build/keep'),'safe');assert.equal(run(p).status,1);assert.equal(await fs.readFile(path.join(p,'.i18n-build/keep'),'utf8'),'safe')}))
