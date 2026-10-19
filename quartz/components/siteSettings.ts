import settings from "../site-settings.json"

export { settings }

export function siteHref(href: string, root: string): string {
  if (/^(https?:\/\/|mailto:|tel:)/i.test(href)) return href
  if (href.startsWith("#")) return href
  if (!href.startsWith("/") || href.startsWith("//") || /[\\\u0000-\u0020]/u.test(href)) return "#"
  return `${root}${href}`
}
