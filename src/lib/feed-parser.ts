/**
 * RSS/Atom Feed Parser
 *
 * Parses RSS 2.0 and Atom feed formats using simple string/regex parsing.
 * Works with Bun's built-in fetch for fetching feeds.
 */

export interface ParsedFeed {
  title: string
  siteUrl: string
  feedUrl: string
  description?: string
  favicon?: string
  items: Array<ParsedFeedItem>
}

export interface ParsedFeedItem {
  id: string
  title: string
  url: string
  publishedAt: string
  content: string
  preview: string
}

/**
 * Fetch and parse a feed from a URL
 */
export async function fetchAndParseFeed(url: string): Promise<ParsedFeed> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Reader RSS/1.0',
      Accept:
        'application/rss+xml, application/atom+xml, application/xml, text/xml',
    },
  })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch feed: ${response.status} ${response.statusText}`,
    )
  }

  const xml = await response.text()
  return parseFeed(xml, url)
}

/**
 * Parse feed XML content
 */
export function parseFeed(xml: string, feedUrl: string): ParsedFeed {
  // Detect feed type
  const isAtom =
    xml.includes('<feed') && xml.includes('xmlns="http://www.w3.org/2005/Atom"')
  const isRss = xml.includes('<rss') || xml.includes('<channel>')

  if (isAtom) {
    return parseAtomFeed(xml, feedUrl)
  } else if (isRss) {
    return parseRssFeed(xml, feedUrl)
  } else {
    throw new Error('Unknown feed format')
  }
}

/**
 * Parse RSS 2.0 feed
 */
function parseRssFeed(xml: string, feedUrl: string): ParsedFeed {
  const title = extractTag(xml, 'title') || 'Untitled Feed'
  const link = extractTag(xml, 'link') || ''
  const description = extractTag(xml, 'description') || ''

  // Parse items
  const items: Array<ParsedFeedItem> = []
  const itemMatches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi)

  for (const match of itemMatches) {
    const itemXml = match[1]
    const itemTitle = extractTag(itemXml, 'title') || 'Untitled'
    const itemLink =
      extractTag(itemXml, 'link') || extractTag(itemXml, 'guid') || ''
    const itemGuid = extractTag(itemXml, 'guid') || itemLink
    const pubDate = extractTag(itemXml, 'pubDate') || ''
    const content =
      extractCDATA(itemXml, 'content:encoded') ||
      extractCDATA(itemXml, 'description') ||
      extractTag(itemXml, 'description') ||
      ''

    items.push({
      id: itemGuid,
      title: decodeHtmlEntities(itemTitle),
      url: itemLink,
      publishedAt: pubDate
        ? new Date(pubDate).toISOString()
        : new Date().toISOString(),
      content: content,
      preview: stripHtml(content).slice(0, 200),
    })
  }

  const siteUrl = link || new URL(feedUrl).origin

  return {
    title: decodeHtmlEntities(title),
    siteUrl,
    feedUrl,
    description: decodeHtmlEntities(description),
    favicon: getFaviconUrl(siteUrl),
    items,
  }
}

/**
 * Parse Atom feed
 */
function parseAtomFeed(xml: string, feedUrl: string): ParsedFeed {
  const title = extractTag(xml, 'title') || 'Untitled Feed'
  const link = extractAtomLink(xml, 'alternate') || extractAtomLink(xml) || ''
  const subtitle = extractTag(xml, 'subtitle') || ''

  // Parse entries
  const items: Array<ParsedFeedItem> = []
  const entryMatches = xml.matchAll(/<entry[^>]*>([\s\S]*?)<\/entry>/gi)

  for (const match of entryMatches) {
    const entryXml = match[1]
    const entryTitle = extractTag(entryXml, 'title') || 'Untitled'
    const entryLink =
      extractAtomLink(entryXml, 'alternate') || extractAtomLink(entryXml) || ''
    const entryId = extractTag(entryXml, 'id') || entryLink
    const published =
      extractTag(entryXml, 'published') || extractTag(entryXml, 'updated') || ''
    const content =
      extractCDATA(entryXml, 'content') ||
      extractTag(entryXml, 'content') ||
      extractCDATA(entryXml, 'summary') ||
      extractTag(entryXml, 'summary') ||
      ''

    items.push({
      id: entryId,
      title: decodeHtmlEntities(entryTitle),
      url: entryLink,
      publishedAt: published
        ? new Date(published).toISOString()
        : new Date().toISOString(),
      content: content,
      preview: stripHtml(content).slice(0, 200),
    })
  }

  const siteUrl = link || new URL(feedUrl).origin

  return {
    title: decodeHtmlEntities(title),
    siteUrl,
    feedUrl,
    description: decodeHtmlEntities(subtitle),
    favicon: getFaviconUrl(siteUrl),
    items,
  }
}

/**
 * Extract content from a tag
 */
function extractTag(xml: string, tagName: string): string | null {
  // Try CDATA first
  const cdataMatch = xml.match(
    new RegExp(
      `<${tagName}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tagName}>`,
      'i',
    ),
  )
  if (cdataMatch) return cdataMatch[1].trim()

  // Try regular content
  const match = xml.match(
    new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'),
  )
  return match ? match[1].trim() : null
}

/**
 * Extract CDATA content from a tag
 */
function extractCDATA(xml: string, tagName: string): string | null {
  const match = xml.match(
    new RegExp(
      `<${tagName}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tagName}>`,
      'i',
    ),
  )
  return match ? match[1].trim() : null
}

/**
 * Extract href from Atom link element
 */
function extractAtomLink(xml: string, rel?: string): string | null {
  const pattern = rel
    ? new RegExp(`<link[^>]*rel=["']${rel}["'][^>]*href=["']([^"']+)["']`, 'i')
    : /<link[^>]*href=["']([^"']+)["']/i

  const match = xml.match(pattern)
  if (match) return match[1]

  // Try alternate attribute order
  const altPattern = rel
    ? new RegExp(`<link[^>]*href=["']([^"']+)["'][^>]*rel=["']${rel}["']`, 'i')
    : null

  if (altPattern) {
    const altMatch = xml.match(altPattern)
    if (altMatch) return altMatch[1]
  }

  return null
}

/**
 * Strip HTML tags from content
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCharCode(parseInt(code, 16)),
    )
}

/**
 * Get favicon URL for a site
 */
function getFaviconUrl(siteUrl: string): string {
  try {
    const url = new URL(siteUrl)
    // Use Google's favicon service as a reliable fallback
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`
  } catch {
    return ''
  }
}

/**
 * Discover feed URLs from a webpage
 */
export async function discoverFeedUrl(pageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Reader RSS/1.0',
        Accept: 'text/html',
      },
    })

    if (!response.ok) return null

    const html = await response.text()

    // Look for RSS/Atom link tags
    const rssMatch = html.match(
      /<link[^>]*type=["']application\/rss\+xml["'][^>]*href=["']([^"']+)["']/i,
    )
    if (rssMatch) {
      return resolveUrl(rssMatch[1], pageUrl)
    }

    const atomMatch = html.match(
      /<link[^>]*type=["']application\/atom\+xml["'][^>]*href=["']([^"']+)["']/i,
    )
    if (atomMatch) {
      return resolveUrl(atomMatch[1], pageUrl)
    }

    // Try alternate attribute order
    const altRssMatch = html.match(
      /<link[^>]*href=["']([^"']+)["'][^>]*type=["']application\/rss\+xml["']/i,
    )
    if (altRssMatch) {
      return resolveUrl(altRssMatch[1], pageUrl)
    }

    const altAtomMatch = html.match(
      /<link[^>]*href=["']([^"']+)["'][^>]*type=["']application\/atom\+xml["']/i,
    )
    if (altAtomMatch) {
      return resolveUrl(altAtomMatch[1], pageUrl)
    }

    // Try common feed paths
    const commonPaths = [
      '/feed',
      '/rss',
      '/feed.xml',
      '/rss.xml',
      '/atom.xml',
      '/index.xml',
    ]
    const baseUrl = new URL(pageUrl).origin

    for (const path of commonPaths) {
      try {
        const feedUrl = baseUrl + path
        const feedResponse = await fetch(feedUrl, { method: 'HEAD' })
        if (feedResponse.ok) {
          const contentType = feedResponse.headers.get('content-type') || ''
          if (
            contentType.includes('xml') ||
            contentType.includes('rss') ||
            contentType.includes('atom')
          ) {
            return feedUrl
          }
        }
      } catch {
        // Continue to next path
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Resolve a potentially relative URL
 */
function resolveUrl(url: string, baseUrl: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return new URL(url, baseUrl).href
}

/**
 * Validate if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
