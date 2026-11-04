import test from 'node:test'
import assert from 'node:assert/strict'
import {createChatServer} from './server.mjs'

async function fixture(t, extra = {}) {
  let calls = 0, sent
  const server = createChatServer({API_KEY:'test', SITE_ORIGIN:'https://example.com', ...extra}, async (_url, options) => {
    calls++; sent = JSON.parse(options.body)
    return Response.json({choices:[{message:{content:'پاسخ [بند 1]'}}]})
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  t.after(() => new Promise(resolve => server.close(resolve)))
  const url = `http://127.0.0.1:${server.address().port}/chat`
  const post = (body = {question:'پرسش', blocks:['متن']}, origin = 'https://example.com') => fetch(url, {method:'POST', headers:{Origin:origin, 'Content-Type':'application/json'}, body:JSON.stringify(body)})
  return {post, calls:()=>calls, sent:()=>sent}
}
test('reject unapproved origins before upstream', async t => {
  const f = await fixture(t)
  assert.equal((await f.post(undefined, 'https://evil.example')).status, 403)
  assert.equal(f.calls(), 0)
})
test('validate input without consuming upstream quota', async t => {
  const f = await fixture(t)
  assert.equal((await f.post({question:'', blocks:[]})).status, 400)
  assert.equal(f.calls(), 0)
})
test('cap output and daily upstream requests', async t => {
  const f = await fixture(t, {CHAT_DAILY_REQUEST_LIMIT:'1', CHAT_MAX_OUTPUT_TOKENS:'250'})
  assert.equal((await f.post()).status, 200)
  assert.equal(f.sent().max_tokens, 250)
  assert.equal((await f.post()).status, 429)
  assert.equal(f.calls(), 1)
})
test('enforce per-address limit', async t => {
  const f = await fixture(t, {CHAT_REQUESTS_PER_MINUTE:'1'})
  assert.equal((await f.post()).status, 200)
  assert.equal((await f.post()).status, 429)
})
test('invalid configuration fails closed', () => {
  assert.throws(() => createChatServer({API_KEY:'test', SITE_ORIGIN:'https://example.com', CHAT_DAILY_REQUEST_LIMIT:'0'}))
})
