import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseFeed } from 'feedsmith'
import { discoverFeedUrl, extractFavicon, stripHtml, parseDate } from './feed-worker'

// Sample feed fixtures
const RSS_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Blog</title>
    <link>https://example.com</link>
    <description>A test blog</description>
    <item>
      <title>First Post</title>
      <link>https://example.com/post-1</link>
      <guid>post-1</guid>
      <pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate>
      <description><![CDATA[<p>This is the <strong>first</strong> post content.</p>]]></description>
    </item>
    <item>
      <title>Second Post</title>
      <link>https://example.com/post-2</link>
      <guid>post-2</guid>
      <pubDate>Tue, 02 Jan 2024 12:00:00 GMT</pubDate>
      <description>Second post without CDATA</description>
    </item>
  </channel>
</rss>`

const ATOM_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Atom Blog</title>
  <link href="https://atom-example.com"/>
  <subtitle>An Atom feed</subtitle>
  <entry>
    <title>Atom Entry</title>
    <link href="https://atom-example.com/entry-1"/>
    <id>entry-1</id>
    <published>2024-01-15T10:00:00Z</published>
    <content type="html"><![CDATA[<div>Atom content here</div>]]></content>
  </entry>
</feed>`

const JSON_FEED = `{
  "version": "https://jsonfeed.org/version/1.1",
  "title": "JSON Feed Blog",
  "home_page_url": "https://json-example.com",
  "feed_url": "https://json-example.com/feed.json",
  "description": "A JSON Feed",
  "items": [
    {
      "id": "json-1",
      "url": "https://json-example.com/article-1",
      "title": "JSON Article",
      "content_html": "<p>JSON content</p>",
      "date_published": "2024-02-01T08:00:00Z"
    }
  ]
}`

const RDF_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns="http://purl.org/rss/1.0/">
  <channel>
    <title>RDF Feed</title>
    <link>https://rdf-example.com</link>
    <description>An RDF feed</description>
  </channel>
  <item>
    <title>RDF Item</title>
    <link>https://rdf-example.com/item-1</link>
    <description>RDF item content</description>
  </item>
</rdf:RDF>`

describe('Feed Parsing', () => {
  describe('RSS 2.0 parsing', () => {
    it('returns correct article list from RSS feed', () => {
      const result = parseFeed(RSS_FEED)

      expect(result.format).toBe('rss')
      expect(result.feed.title).toBe('Test Blog')
      expect(result.feed.items).toHaveLength(2)
    })

    it('extracts article fields correctly', () => {
      const result = parseFeed(RSS_FEED)
      const items = result.feed.items as Array<{
        title: string
        link: string
        guid: { value: string } | string
        pubDate: string
        description: string
      }>

      expect(items[0].title).toBe('First Post')
      expect(items[0].link).toBe('https://example.com/post-1')
      // guid can be an object with value property in feedsmith
      const guid = items[0].guid
      expect(typeof guid === 'string' ? guid : guid.value).toBe('post-1')
      expect(items[0].pubDate).toBe('Mon, 01 Jan 2024 12:00:00 GMT')
    })
  })

  describe('Atom feed parsing', () => {
    it('returns correct article list from Atom feed', () => {
      const result = parseFeed(ATOM_FEED)

      expect(result.format).toBe('atom')
      expect(result.feed.title).toBe('Atom Blog')
      expect(result.feed.entries).toHaveLength(1)
    })

    it('extracts Atom entry fields correctly', () => {
      const result = parseFeed(ATOM_FEED)
      const entries = result.feed.entries as Array<{
        title: string
        link: { href: string }
        id: string
        published: string
      }>

      expect(entries[0].title).toBe('Atom Entry')
      expect(entries[0].id).toBe('entry-1')
    })
  })

  describe('JSON Feed parsing', () => {
    it('returns correct article list from JSON feed', () => {
      const result = parseFeed(JSON_FEED)

      expect(result.format).toBe('json')
      expect(result.feed.title).toBe('JSON Feed Blog')
      expect(result.feed.items).toHaveLength(1)
    })

    it('extracts JSON Feed item fields correctly', () => {
      const result = parseFeed(JSON_FEED)
      const items = result.feed.items as Array<{
        id: string
        url: string
        title: string
        content_html: string
        date_published: string
      }>

      expect(items[0].id).toBe('json-1')
      expect(items[0].title).toBe('JSON Article')
      expect(items[0].url).toBe('https://json-example.com/article-1')
    })
  })

  describe('RDF feed parsing', () => {
    it('returns correct article list from RDF feed', () => {
      const result = parseFeed(RDF_FEED)

      expect(result.format).toBe('rdf')
      expect(result.feed.title).toBe('RDF Feed')
    })
  })

  describe('error handling', () => {
    it('throws error for malformed XML', () => {
      const malformedXml = '<rss><channel><title>Broken'

      expect(() => parseFeed(malformedXml)).toThrow()
    })

    it('throws error for non-feed content', () => {
      const htmlContent = '<html><body>Not a feed</body></html>'

      expect(() => parseFeed(htmlContent)).toThrow()
    })

    it('throws error for empty content', () => {
      expect(() => parseFeed('')).toThrow()
    })
  })

  describe('handling feeds with missing optional fields', () => {
    it('handles feed without description', () => {
      const feedWithoutDesc = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <title>No Description Feed</title>
            <link>https://example.com</link>
            <item>
              <title>Post</title>
              <link>https://example.com/post</link>
            </item>
          </channel>
        </rss>`

      const result = parseFeed(feedWithoutDesc)
      expect(result.feed.title).toBe('No Description Feed')
      expect(result.feed.description).toBeUndefined()
    })

    it('handles item without pubDate', () => {
      const feedWithoutDate = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <title>Feed</title>
            <link>https://example.com</link>
            <item>
              <title>Post Without Date</title>
              <link>https://example.com/post</link>
            </item>
          </channel>
        </rss>`

      const result = parseFeed(feedWithoutDate)
      const items = result.feed.items as Array<{ pubDate?: string }>
      expect(items[0].pubDate).toBeUndefined()
    })
  })
})

describe('HTML stripping', () => {
  it('removes HTML tags', () => {
    expect(stripHtml('<p>Hello <strong>world</strong></p>')).toBe('Hello world')
  })

  it('decodes HTML entities', () => {
    expect(stripHtml('&amp; &lt; &gt; &quot; &#39;')).toBe("& < > \" '")
  })

  it('normalizes whitespace', () => {
    expect(stripHtml('<p>Hello</p>   <p>World</p>')).toBe('Hello World')
  })

  it('handles empty string', () => {
    expect(stripHtml('')).toBe('')
  })

  it('handles nested tags', () => {
    expect(stripHtml('<div><p>Nested <b>content</b></p></div>')).toBe('Nested content')
  })
})

describe('Date parsing', () => {
  it('parses ISO date format', () => {
    const result = parseDate('2024-01-15T10:00:00Z')
    expect(result).toBe('2024-01-15T10:00:00.000Z')
  })

  it('parses RFC 2822 date format', () => {
    const result = parseDate('Mon, 01 Jan 2024 12:00:00 GMT')
    expect(new Date(result).getFullYear()).toBe(2024)
  })

  it('returns current date for undefined input', () => {
    const result = parseDate(undefined)
    const now = new Date()
    const parsed = new Date(result)

    expect(parsed.getFullYear()).toBe(now.getFullYear())
  })

  it('returns current date for invalid date string', () => {
    const before = new Date()
    const result = parseDate('not-a-date')
    const after = new Date()

    const parsed = new Date(result)
    expect(parsed.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(parsed.getTime()).toBeLessThanOrEqual(after.getTime())
  })
})

describe('Feed URL discovery', () => {
  it('discovers RSS link from HTML', () => {
    const html = `
      <html>
        <head>
          <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
        </head>
      </html>`

    const result = discoverFeedUrl(html, 'https://example.com')
    expect(result).toBe('https://example.com/feed.xml')
  })

  it('discovers Atom link from HTML', () => {
    const html = `
      <html>
        <head>
          <link rel="alternate" type="application/atom+xml" href="/atom.xml" />
        </head>
      </html>`

    const result = discoverFeedUrl(html, 'https://example.com')
    expect(result).toBe('https://example.com/atom.xml')
  })

  it('discovers JSON Feed link from HTML', () => {
    const html = `
      <html>
        <head>
          <link rel="alternate" type="application/feed+json" href="/feed.json" />
        </head>
      </html>`

    const result = discoverFeedUrl(html, 'https://example.com')
    expect(result).toBe('https://example.com/feed.json')
  })

  it('handles absolute URLs in link tags', () => {
    const html = `
      <html>
        <head>
          <link rel="alternate" type="application/rss+xml" href="https://cdn.example.com/feed.xml" />
        </head>
      </html>`

    const result = discoverFeedUrl(html, 'https://example.com')
    expect(result).toBe('https://cdn.example.com/feed.xml')
  })

  it('returns null when no feed link found', () => {
    const html = '<html><head><title>No Feed</title></head></html>'

    const result = discoverFeedUrl(html, 'https://example.com')
    expect(result).toBeNull()
  })

  it('prefers RSS over Atom when both present', () => {
    const html = `
      <html>
        <head>
          <link rel="alternate" type="application/rss+xml" href="/rss.xml" />
          <link rel="alternate" type="application/atom+xml" href="/atom.xml" />
        </head>
      </html>`

    const result = discoverFeedUrl(html, 'https://example.com')
    expect(result).toBe('https://example.com/rss.xml')
  })
})

describe('Favicon extraction', () => {
  it('returns Google favicon URL for valid site URL', () => {
    const result = extractFavicon('https://example.com')
    expect(result).toBe('https://www.google.com/s2/favicons?domain=example.com&sz=32')
  })

  it('extracts hostname correctly from URL with path', () => {
    const result = extractFavicon('https://example.com/blog/post')
    expect(result).toBe('https://www.google.com/s2/favicons?domain=example.com&sz=32')
  })

  it('returns null for invalid URL', () => {
    const result = extractFavicon('not-a-url')
    expect(result).toBeNull()
  })
})
