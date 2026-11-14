import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import sharp from 'sharp'
import { fromHtml } from 'hast-util-from-html'
import { optimizeImages } from './image-optimizer.mjs'

async function fixture(fn) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'quartz-images-'))
  try {
    const pixels = Buffer.alloc(1500 * 900 * 3)
    crypto.randomFillSync(pixels)
    await sharp(pixels, { raw: { width: 1500, height: 900, channels: 3 } }).png().toFile(path.join(root, 'photo.png'))
    await fn(root)
  } finally { await fs.rm(root, { recursive: true, force: true }) }
}
const images = (html) => {
  const out = []
  function walk(n) { if (n.tagName === 'img') out.push(n.properties); for (const c of n.children ?? []) walk(c) }
  walk(fromHtml(html)); return out
}

test('creates smaller variants; preserves source image and metadata; does not lazy-load first article image', () => fixture(async (root) => {
  const before = await fs.readFile(path.join(root, 'photo.png'))
  await fs.writeFile(path.join(root, 'index.html'), '<!doctype html><html><head><meta property="og:image" content="photo.png"></head><body><article><img src="photo.png" alt="فارسی"><img src="photo.png"></article></body></html>')
  const stats = await optimizeImages(root)
  const html = await fs.readFile(path.join(root, 'index.html'), 'utf8')
  const imgs = images(html)
  assert.equal(stats.images, 1)
  assert.ok(stats.variants > 0)
  assert.ok(stats.optimizedBytes < stats.originalBytes)
  assert.equal(imgs[0].src, 'photo.png')
  assert.ok(imgs[0].srcSet)
  assert.equal(imgs[0].loading, undefined)
  assert.equal(imgs[1].loading, 'lazy')
  assert.equal(imgs[0].width, 1500)
  assert.ok(html.includes('<meta property="og:image" content="photo.png">'))
  assert.deepEqual(await fs.readFile(path.join(root, 'photo.png')), before)
  const again = await optimizeImages(root)
  assert.equal(again.pages, 0)
  for (const item of imgs[0].srcSet.split(', ')) {
    const file = item.split(' ')[0]
    const m = await sharp(path.join(root, file)).metadata()
    assert.equal(m.format, 'webp')
  }
}))

test('preserves remote, custom srcset, picture, opt-out, data and missing images', () => fixture(async (root) => {
  const html = '<article><img src="https://example.com/a.png"><img src="photo.png" srcset="custom.webp 500w"><picture><img src="photo.png"></picture><img src="photo.png" data-no-optimize><img src="data:image/png;base64,abc"><img src="missing.png"><img src="../outside.png"></article>'
  await fs.writeFile(path.join(root, 'index.html'), html)
  const stats = await optimizeImages(root)
  assert.equal(stats.pages, 0)
  assert.equal(await fs.readFile(path.join(root, 'index.html'), 'utf8'), html)
}))

test('handles nested pages, root-relative paths, query strings, and high priority', () => fixture(async (root) => {
  await fs.mkdir(path.join(root, 'notes'))
  await fs.writeFile(path.join(root, 'notes', 'a.html'), '<article><img src="/photo.png?v=1"><img src="../photo.png" fetchpriority="high"></article>')
  await optimizeImages(root)
  const imgs = images(await fs.readFile(path.join(root, 'notes', 'a.html'), 'utf8'))
  assert.ok(imgs[0].srcSet.startsWith('../_optimized-images/'))
  assert.equal(imgs[1].loading, undefined)
  assert.equal(imgs[0].src, '/photo.png?v=1')
}))

test('skips animated images and escaping symlinks', () => fixture(async (root) => {
  await sharp({ create: { width: 50, height: 100, channels: 3, background: 'red', pageHeight: 50 } }).gif().toFile(path.join(root, 'animated.gif'))
  await fs.symlink('/etc/passwd', path.join(root, 'escape.png'))
  const html = '<img src="animated.gif"><img src="escape.png">'
  await fs.writeFile(path.join(root, 'index.html'), html)
  await optimizeImages(root)
  assert.equal(await fs.readFile(path.join(root, 'index.html'), 'utf8'), html)
}))
