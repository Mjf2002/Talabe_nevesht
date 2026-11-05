import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

const root = process.argv[2] ?? "public"
let count = 0
const failures = []
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) await walk(file)
    else if (entry.name.endsWith(".html")) {
      count++
      const html = await readFile(file, "utf8")
      for (const tag of html.matchAll(/<(?:link|script)\b[^>]*>/gi)) {
        if (/\b(?:href|src)\s*=\s*["'](?:https?:)?\/\/(?:fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net\/npm\/katex@)/i.test(tag[0])) {
          failures.push(`${file}: ${tag[0]}`)
        }
      }
    }
  }
}
await walk(root)
if (!count) throw new Error(`No HTML files found in ${root}`)
const home = await readFile(path.join(root, "index.html"), "utf8")
if (!home.includes('content="local-head-v2"')) failures.push("Homepage is missing the local-head-v2 build marker")
if (failures.length) {
  console.error("Publication stopped: unexpected font/math CDN resources or outdated Head component.\n" + failures.join("\n"))
  process.exitCode = 1
} else console.log(`PASS: checked ${count} HTML files; local-head-v2 homepage confirmed; no Google Fonts or KaTeX CDN tags.`)
