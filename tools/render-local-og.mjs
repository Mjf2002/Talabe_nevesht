import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (raw, key) => {
  if (key.startsWith('#')) {
    const n = key[1].toLowerCase() === 'x' ? parseInt(key.slice(2), 16) : Number(key.slice(1))
    return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : raw
  }
  return ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' })[key.toLowerCase()] ?? raw
})

const root = path.resolve(process.argv[2] ?? 'public')
const fontfile = path.resolve('quartz/static/fonts/Vazirmatn-OG.ttf')
await fs.access(fontfile)
const escape = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')
const clean = (s) => decode(s).replace(/\s+/g, ' ').trim()
async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(p)
    else if (p.endsWith('.html')) yield p
  }
}
let count = 0
for await (const file of walk(root)) {
  const html = await fs.readFile(file, 'utf8')
  const tags = [...html.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map((m) => [m[1], m[2]])))
  const meta = (key) => tags.find((t) => t.property === key || t.name === key)?.content
  const relative = path.relative(root, file).replace(/\.html$/, '')
  const output = path.join(root, `${relative}-og-image.webp`)
  const image = meta('og:image')
  // Only replace the auto-generated image for this exact page, not custom covers.
  if (!image || decodeURIComponent(new URL(decode(image), 'https://local.invalid').pathname) !== '/' + relative.split(path.sep).join('/') + '-og-image.webp') continue
  const title = clean(meta('og:title') ?? html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? 'من جمعی').slice(0, 180)
  const description = clean(meta('og:description') ?? meta('description') ?? '').slice(0, 280)
  async function text(value, size, width, height, color) {
    return sharp({ text: { text: `<span foreground="${color}">${escape(value)}</span>`, font: `Vazirmatn ${size}`, fontfile, width, height, align: 'right', rgba: true, wrap: 'word-char' } }).png().toBuffer()
  }
  const layers = [
    { input: await text(title, 64, 1040, 210, '#173b3a'), top: 90, left: 80 },
    { input: await text('من جمعی | manejamei.ir', 28, 1040, 55, '#42726b'), top: 510, left: 80 },
  ]
  if (description) layers.push({ input: await text(description, 32, 1040, 160, '#405654'), top: 320, left: 80 })
  await fs.mkdir(path.dirname(output), { recursive: true })
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: '#f4f2eb' } }).composite(layers).webp({ quality: 90 }).toFile(output)
  count++
}
if (!count) throw new Error('No auto-generated OG image references found; check output and metadata.')
console.log(`Rebuilt ${count} OG images using local Vazirmatn and Pango/HarfBuzz.`)
