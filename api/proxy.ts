export const config = { runtime: 'edge' }

// In-memory rate limiting (resets on cold start)
// Rate limit aligned with refresh-scheduler.ts:
// - Feeds refresh every 60 min automatically
// - Manual refresh allowed every 15 min minimum
// - Allow 200 feeds per window to support users with large feed lists
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 200
const RATE_WINDOW_MS = 15 * 60 * 1000 // 15 minutes (matches MIN_REFRESH_INTERVAL_MS)

export default async function handler(request: Request) {
  // Get client IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'

  // Check rate limit
  const now = Date.now()
  const rateData = rateLimitMap.get(ip)
  if (rateData && now < rateData.resetTime) {
    if (rateData.count >= RATE_LIMIT) {
      return new Response('Rate limit exceeded', { status: 429 })
    }
    rateData.count++
  } else {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS })
  }

  // Get and validate URL
  const { searchParams } = new URL(request.url)
  const targetUrl = searchParams.get('url')

  if (!targetUrl) {
    return new Response('Missing url parameter', { status: 400 })
  }

  // Validate URL format and block internal addresses
  try {
    const parsed = new URL(targetUrl)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return new Response('Invalid protocol', { status: 400 })
    }
    if (['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname)) {
      return new Response('Invalid host', { status: 400 })
    }
  } catch {
    return new Response('Invalid URL', { status: 400 })
  }

  // Fetch the feed
  try {
    const response = await fetch(targetUrl, {
      headers: {
        Accept:
          'application/rss+xml, application/atom+xml, application/xml, text/xml, application/feed+json',
        'User-Agent': 'ReaderApp/1.0 RSS Fetcher',
      },
    })

    // Validate content type - only allow feed formats
    const contentType = response.headers.get('content-type') || ''
    const allowedTypes = [
      'application/rss+xml',
      'application/atom+xml',
      'application/xml',
      'text/xml',
      'application/feed+json',
      'application/json', // Some JSON feeds use this
    ]
    const isAllowed = allowedTypes.some((type) => contentType.includes(type))

    if (!isAllowed) {
      return new Response('Invalid content type - not a feed', { status: 415 })
    }

    const text = await response.text()

    return new Response(text, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': 'https://readerapp.in',
        'Access-Control-Allow-Methods': 'GET',
      },
    })
  } catch {
    return new Response('Fetch failed', { status: 502 })
  }
}
