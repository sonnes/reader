import { parseFeed } from 'feedsmith'
import type {
  WorkerRequest,
  WorkerResponse,
  ParsedFeed,
  ParsedArticle,
  FeedErrorType,
} from './types'

const CORS_PROXY =
  import.meta.env.VITE_CORS_PROXY_URL || 'https://api.allorigins.win/raw?url='
const MAX_ARTICLES_PER_FEED = 50
const FETCH_TIMEOUT_MS = 30000

const activeRequests = new Map<string, AbortController>()

// ============================================================================
// Message Handler
// ============================================================================

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data

  try {
    switch (request.type) {
      case 'PARSE_FEED':
        await handleParseFeed(request.id, request.payload)
        break
      case 'VALIDATE_FEED':
        await handleValidateFeed(request.id, request.payload)
        break
      case 'REFRESH_FEED':
        await handleRefreshFeed(request.id, request.payload)
        break
      case 'CANCEL':
        handleCancel(request.id)
        break
    }
  } catch (error) {
    console.error(`[FeedWorker] Unhandled error for ${request.id}:`, error)
    sendResponse({
      type: 'ERROR',
      id: request.id,
      payload: {
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'UNHANDLED_ERROR',
      },
    })
  }
}

function sendResponse(response: WorkerResponse): void {
  self.postMessage(response)
}

// ============================================================================
// Request Handlers
// ============================================================================

async function handleParseFeed(
  requestId: string,
  payload: { url: string }
): Promise<void> {
  const controller = new AbortController()
  activeRequests.set(requestId, controller)

  try {
    const content = await fetchWithProxy(payload.url, controller.signal)
    const result = parseFeed(content)

    const feed = extractFeedMetadata(result, payload.url)
    const articles = extractArticles(result)

    sendResponse({
      type: 'PARSE_FEED_RESULT',
      id: requestId,
      payload: { success: true, feed, articles },
    })
  } catch (error) {
    sendResponse({
      type: 'PARSE_FEED_RESULT',
      id: requestId,
      payload: {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse feed',
      },
    })
  } finally {
    activeRequests.delete(requestId)
  }
}

async function handleValidateFeed(
  requestId: string,
  payload: { url: string }
): Promise<void> {
  const controller = new AbortController()
  activeRequests.set(requestId, controller)

  try {
    let feedUrl = payload.url
    let content: string
    let result: ReturnType<typeof parseFeed>

    // First, try fetching as a feed directly
    try {
      content = await fetchWithProxy(feedUrl, controller.signal)
      result = parseFeed(content)
    } catch {
      // If direct fetch fails, try discovering feed from HTML page
      const html = await fetchWithProxy(feedUrl, controller.signal)
      const discoveredUrl = discoverFeedUrl(html, feedUrl)

      if (!discoveredUrl) {
        throw new Error('No feed found at this URL')
      }

      feedUrl = discoveredUrl
      content = await fetchWithProxy(feedUrl, controller.signal)
      result = parseFeed(content)
    }

    const siteUrl = getFeedLink(result) || new URL(feedUrl).origin
    const favicon = extractFavicon(siteUrl)
    const articleCount = getFeedItems(result)?.length || 0

    sendResponse({
      type: 'VALIDATE_FEED_RESULT',
      id: requestId,
      payload: {
        success: true,
        feedUrl,
        feed: {
          title: getFeedTitle(result) || 'Untitled Feed',
          siteUrl,
          favicon,
          description: getFeedDescription(result),
        },
        articleCount,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Validation failed'
    const errorType = classifyError(message)

    sendResponse({
      type: 'VALIDATE_FEED_RESULT',
      id: requestId,
      payload: { success: false, error: message, errorType },
    })
  } finally {
    activeRequests.delete(requestId)
  }
}

async function handleRefreshFeed(
  requestId: string,
  payload: { feedId: string; feedUrl: string }
): Promise<void> {
  const controller = new AbortController()
  activeRequests.set(requestId, controller)

  try {
    const content = await fetchWithProxy(payload.feedUrl, controller.signal)
    const result = parseFeed(content)

    const feed = extractFeedMetadata(result, payload.feedUrl)
    const articles = extractArticles(result)

    sendResponse({
      type: 'REFRESH_FEED_RESULT',
      id: requestId,
      payload: { success: true, feed, articles },
    })
  } catch (error) {
    sendResponse({
      type: 'REFRESH_FEED_RESULT',
      id: requestId,
      payload: {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refresh feed',
      },
    })
  } finally {
    activeRequests.delete(requestId)
  }
}

function handleCancel(requestId: string): void {
  const controller = activeRequests.get(requestId)
  if (controller) {
    controller.abort()
    activeRequests.delete(requestId)
  }
}

// ============================================================================
// Feed Parsing Utilities
// ============================================================================

function extractFeedMetadata(
  result: ReturnType<typeof parseFeed>,
  feedUrl: string
): ParsedFeed {
  const siteUrl = getFeedLink(result) || new URL(feedUrl).origin

  return {
    title: getFeedTitle(result) || 'Untitled Feed',
    url: feedUrl,
    siteUrl,
    favicon: extractFavicon(siteUrl),
    description: getFeedDescription(result),
    format: result.format as ParsedFeed['format'],
  }
}

function extractArticles(result: ReturnType<typeof parseFeed>): ParsedArticle[] {
  const items = getFeedItems(result) || []

  return items.slice(0, MAX_ARTICLES_PER_FEED).map((item) => {
    const content = getItemContent(item)
    return {
      id: getItemId(item) || articleIdFromUrl(getItemLink(item) || ''),
      title: getItemTitle(item) || 'Untitled',
      url: getItemLink(item) || '',
      publishedAt: parseDate(getItemPublished(item)),
      content,
      preview: stripHtml(content).slice(0, 200),
    }
  })
}

// Type-safe accessors for feedsmith's polymorphic result
function getFeedTitle(result: ReturnType<typeof parseFeed>): string | undefined {
  const feed = result.feed as Record<string, unknown>
  return feed.title as string | undefined
}

function getFeedLink(result: ReturnType<typeof parseFeed>): string | undefined {
  const feed = result.feed as Record<string, unknown>
  return (feed.link as string) || (feed.home_page_url as string) || undefined
}

function getFeedDescription(result: ReturnType<typeof parseFeed>): string | undefined {
  const feed = result.feed as Record<string, unknown>
  return (feed.description as string) || (feed.subtitle as string) || undefined
}

function getFeedItems(result: ReturnType<typeof parseFeed>): unknown[] | undefined {
  const feed = result.feed as Record<string, unknown>
  return (feed.items as unknown[]) || (feed.entries as unknown[]) || undefined
}

function getItemTitle(item: unknown): string | undefined {
  const i = item as Record<string, unknown>
  return i.title as string | undefined
}

function getItemLink(item: unknown): string | undefined {
  const i = item as Record<string, unknown>
  return (i.link as string) || (i.url as string) || undefined
}

function getItemId(item: unknown): string | undefined {
  const i = item as Record<string, unknown>
  return (i.id as string) || (i.guid as string) || undefined
}

function getItemPublished(item: unknown): string | undefined {
  const i = item as Record<string, unknown>
  return (
    (i.pubDate as string) ||
    (i.published as string) ||
    (i.date_published as string) ||
    (i.updated as string) ||
    undefined
  )
}

function getItemContent(item: unknown): string {
  const i = item as Record<string, unknown>

  // Try various content fields
  if (i.content) {
    const content = i.content as Record<string, unknown>
    if (typeof content === 'string') return content
   if (content.encoded) return content.encoded as string
    if (content.text) return content.text as string
    if (content.html) return content.html as string
  }

  if (i.summary) {
    const summary = i.summary as Record<string, unknown>
    if (typeof summary === 'string') return summary
    if (summary.text) return summary.text as string
  }

  if (i.description) {
    return i.description as string
  }

  if (i.content_html) {
    return i.content_html as string
  }

  if (i.content_text) {
    return i.content_text as string
  }

  return ''
}

// ============================================================================
// Fetch Utilities
// ============================================================================

async function fetchWithProxy(url: string, signal: AbortSignal): Promise<string> {
  // Try direct fetch first
  try {
    const response = await fetchWithTimeout(url, signal)
    if (response.ok) {
      return await response.text()
    }
  } catch {
    // Fall through to proxy
  }

  // Use CORS proxy as fallback
  const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`
  const response = await fetchWithTimeout(proxyUrl, signal)

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`)
  }

  return await response.text()
}

async function fetchWithTimeout(
  url: string,
  signal: AbortSignal
): Promise<Response> {
  const timeoutId = setTimeout(() => {
    // Signal will be aborted by the caller if needed
  }, FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      signal,
      headers: {
        Accept:
          'application/rss+xml, application/atom+xml, application/xml, text/xml, application/json, */*',
      },
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

// ============================================================================
// Discovery Utilities
// ============================================================================

export function discoverFeedUrl(html: string, baseUrl: string): string | null {
  // Look for RSS link
  const rssMatch =
    html.match(
      /<link[^>]*type=["']application\/rss\+xml["'][^>]*href=["']([^"']+)["']/i
    ) ||
    html.match(
      /<link[^>]*href=["']([^"']+)["'][^>]*type=["']application\/rss\+xml["']/i
    )
  if (rssMatch) return resolveUrl(rssMatch[1], baseUrl)

  // Look for Atom link
  const atomMatch =
    html.match(
      /<link[^>]*type=["']application\/atom\+xml["'][^>]*href=["']([^"']+)["']/i
    ) ||
    html.match(
      /<link[^>]*href=["']([^"']+)["'][^>]*type=["']application\/atom\+xml["']/i
    )
  if (atomMatch) return resolveUrl(atomMatch[1], baseUrl)

  // Look for JSON Feed link
  const jsonMatch =
    html.match(
      /<link[^>]*type=["']application\/feed\+json["'][^>]*href=["']([^"']+)["']/i
    ) ||
    html.match(
      /<link[^>]*href=["']([^"']+)["'][^>]*type=["']application\/feed\+json["']/i
    )
  if (jsonMatch) return resolveUrl(jsonMatch[1], baseUrl)

  return null
}

function resolveUrl(url: string, baseUrl: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return new URL(url, baseUrl).href
}

export function extractFavicon(siteUrl: string): string | null {
  try {
    const url = new URL(siteUrl)
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`
  } catch {
    return null
  }
}

// ============================================================================
// String Utilities
// ============================================================================

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export function parseDate(dateStr?: string): string {
  if (!dateStr) return new Date().toISOString()
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      return new Date().toISOString()
    }
    return date.toISOString()
  } catch {
    return new Date().toISOString()
  }
}

function articleIdFromUrl(url: string): string {
  const urlObj = new URL(url)
  const slug = (urlObj.hostname + urlObj.pathname)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `article-${slug}`
}

function classifyError(message: string): FeedErrorType {
  if (message.includes('Invalid URL') || message.includes('URL')) {
    return 'INVALID_URL'
  }
  if (message.includes('timeout') || message.includes('Timeout')) {
    return 'TIMEOUT'
  }
  if (message.includes('CORS') || message.includes('blocked')) {
    return 'CORS_BLOCKED'
  }
  if (message.includes('No feed found') || message.includes('format')) {
    return 'NOT_A_FEED'
  }
  return 'FETCH_FAILED'
}

export {}
