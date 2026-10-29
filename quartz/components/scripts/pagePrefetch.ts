// Short-lived, bounded cache shared by intent prefetch and SPA navigation.
export function createPageLoader(fetchPage: (url: URL) => Promise<Response>) {
  const entries = new Map<string, { expires: number; promise: Promise<Response> }>()
  let pendingPrefetches = 0
  const ttl = 30_000
  const maxEntries = 6

  function keyFor(url: URL) {
    const key = new URL(url)
    key.hash = ""
    return key.href
  }

  function lookup(key: string) {
    const entry = entries.get(key)
    if (entry && entry.expires > Date.now()) return entry
    entries.delete(key)
  }

  async function load(url: URL): Promise<Response> {
    const entry = lookup(keyFor(url))
    if (entry) {
      try {
        return (await entry.promise).clone()
      } catch {
        // A speculative failure must not prevent normal navigation.
      }
    }
    return fetchPage(url)
  }

  function prefetch(url: URL) {
    const key = keyFor(url)
    if (lookup(key) || pendingPrefetches >= 2) return
    while (entries.size >= maxEntries) entries.delete(entries.keys().next().value!)
    pendingPrefetches++
    const entry = {
      expires: Date.now() + ttl,
      promise: Promise.resolve().then(() => fetchPage(url)),
    }
    entries.set(key, entry)
    entry.promise = entry.promise.then(async (response) => {
      if (!response.ok || !response.headers.get("content-type")?.startsWith("text/html") ||
          /no-store|private/i.test(response.headers.get("cache-control") ?? "")) {
        throw new Error("Not a cacheable page")
      }
      const text = await response.text()
      if (text.length > 512_000) throw new Error("Page exceeds prefetch limit")
      return new Response(text, { status: response.status, headers: response.headers })
    }).catch((error) => {
      if (entries.get(key) === entry) entries.delete(key)
      throw error
    }).finally(() => { pendingPrefetches-- })
    // Hover/touch requests are speculative: never surface unhandled rejections.
    void entry.promise.catch(() => {})
  }

  return { load, prefetch }
}
