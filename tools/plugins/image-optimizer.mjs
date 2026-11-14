import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { pathToFileURL } from 'node:url'
import sharp from 'sharp'
import { fromHtml } from 'hast-util-from-html'

// Local post-build plugin. Reads and writes only the selected output directory.
export async function optimizeImages(output = 'public') {
  const root = await fs.realpath(path.resolve(output))
  const destination = path.join(root, '_optimized-images')
  const cache = new Map()
  const stats = { pages: 0, images: 0, variants: 0, originalBytes: 0, optimizedBytes: 0, lazy: 0 }
  async function* files(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      if (entry.name === '_optimized-images') continue
      const file = path.join(dir, entry.name)
      if (entry.isDirectory()) yield* files(file)
      else if (entry.isFile() && file.endsWith('.html')) yield file
    }
  }
  async function variants(file) {
    if (cache.has(file)) return cache.get(file)
    const result = { items: [] }
    cache.set(file, result)
    const input = await fs.readFile(file)
    const meta = await sharp(input, { animated: true }).metadata()
    result.width = meta.width
    result.height = meta.height
    // Animation and orientation need special treatment; preserve them unchanged.
    if ((meta.pages ?? 1) > 1 || (meta.orientation ?? 1) !== 1 || !meta.width || input.length < 40960) return result
    const widths = [...new Set([480, 800, 1200, Math.min(meta.width, 1600)].filter((w) => w <= meta.width))].sort((a, b) => a - b)
    const hash = crypto.createHash('sha256').update(input).update('webp-q82-v1').digest('hex').slice(0, 20)
    await fs.mkdir(destination, { recursive: true })
    for (const width of widths) {
      const buffer = await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: 82, effort: 4 }).toBuffer()
      if (buffer.length >= input.length * 0.9) continue
      const name = `${hash}-${width}.webp`
      await fs.writeFile(path.join(destination, name), buffer)
      result.items.push({ width, name, bytes: buffer.length })
      stats.variants++
    }
    if (result.items.length) {
      stats.images++
      stats.originalBytes += input.length
      stats.optimizedBytes += result.items.at(-1).bytes
    }
    return result
  }
  for await (const file of files(root)) {
    const html = await fs.readFile(file, 'utf8')
    const tree = fromHtml(html)
    const targets = []
    let articleImages = 0
    function walk(node, inArticle = false, inPicture = false) {
      const article = inArticle || node.tagName === 'article'
      const picture = inPicture || node.tagName === 'picture'
      if (node.tagName === 'img') targets.push({ node, picture, lazy: article && articleImages++ > 0 })
      for (const child of node.children ?? []) walk(child, article, picture)
    }
    walk(tree)
    const changes = []
    for (const { node, picture, lazy } of targets) {
      const p = node.properties ?? {}
      if (picture || p.srcSet || p.sizes || p.dataNoOptimize !== undefined || typeof p.src !== 'string') continue
      if (/^(?:[a-z][\w+.-]*:|\/\/|#)/i.test(p.src)) continue
      let local
      try {
        const pathname = decodeURIComponent(p.src.split(/[?#]/)[0])
        local = path.resolve(pathname.startsWith('/') ? root : path.dirname(file), pathname.replace(/^\//, ''))
        if (!local.startsWith(root + path.sep) || !/\.(?:png|jpe?g|webp)$/i.test(local)) continue
        local = await fs.realpath(local)
        if (!local.startsWith(root + path.sep)) continue
      } catch { continue }
      const data = await variants(local)
      const start = node.position?.start.offset
      if (start === undefined) continue
      const tag = html.slice(start).match(/^<img\b(?:[^>"']|"[^"]*"|'[^']*')*>/i)?.[0]
      if (!tag) continue
      let additions = ''
      if (data.items.length) {
        const relative = path.relative(path.dirname(file), destination).split(path.sep).join('/')
        additions += ` srcset="${data.items.map((v) => `${relative}/${v.name} ${v.width}w`).join(', ')}" sizes="100vw"`
      }
      if (!p.width && !p.height && data.width && data.height) additions += ` width="${data.width}" height="${data.height}"`
      if (lazy && !p.loading && p.fetchPriority !== 'high') { additions += ' loading="lazy"'; stats.lazy++ }
      if (!p.decoding) additions += ' decoding="async"'
      if (additions) changes.push({ start, end: start + tag.length, value: tag.replace(/\s*\/?>(?=$)/, `${additions}>`) })
    }
    if (changes.length) {
      let updated = html
      for (const change of changes.sort((a, b) => b.start - a.start)) updated = updated.slice(0, change.start) + change.value + updated.slice(change.end)
      await fs.writeFile(file, updated)
      stats.pages++
    }
  }
  return stats
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  console.log('Local image optimizer:', JSON.stringify(await optimizeImages(process.argv[2] ?? 'public'), null, 2))
}
