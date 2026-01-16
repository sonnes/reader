import { describe, expect, it } from 'vitest'
import { isValidUrl, parseFeed } from '../feed-parser'

describe('feed-parser', () => {
  describe('parseFeed', () => {
    describe('RSS 2.0', () => {
      it('parses basic RSS feed', () => {
        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Example Blog</title>
    <link>https://example.com</link>
    <description>A great blog</description>
    <item>
      <title>First Post</title>
      <link>https://example.com/first-post</link>
      <guid>https://example.com/first-post</guid>
      <pubDate>Mon, 15 Jan 2026 10:00:00 GMT</pubDate>
      <description>This is the first post content.</description>
    </item>
  </channel>
</rss>`

        const result = parseFeed(rss, 'https://example.com/feed.xml')

        expect(result.title).toBe('Example Blog')
        expect(result.siteUrl).toBe('https://example.com')
        expect(result.feedUrl).toBe('https://example.com/feed.xml')
        expect(result.items).toHaveLength(1)
        expect(result.items[0].title).toBe('First Post')
        expect(result.items[0].url).toBe('https://example.com/first-post')
      })

      it('parses RSS with CDATA content', () => {
        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title><![CDATA[Blog Title]]></title>
    <link>https://example.com</link>
    <item>
      <title><![CDATA[Post with <HTML>]]></title>
      <link>https://example.com/post</link>
      <description><![CDATA[<p>Rich content here</p>]]></description>
    </item>
  </channel>
</rss>`

        const result = parseFeed(rss, 'https://example.com/feed.xml')

        expect(result.title).toBe('Blog Title')
        expect(result.items[0].title).toBe('Post with <HTML>')
        expect(result.items[0].content).toContain('<p>Rich content here</p>')
      })

      it('handles HTML entities in RSS', () => {
        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Tom &amp; Jerry&apos;s Blog</title>
    <link>https://example.com</link>
    <item>
      <title>A &quot;Great&quot; Post</title>
      <link>https://example.com/post</link>
    </item>
  </channel>
</rss>`

        const result = parseFeed(rss, 'https://example.com/feed.xml')

        expect(result.title).toBe("Tom & Jerry's Blog")
        expect(result.items[0].title).toBe('A "Great" Post')
      })

      it('parses RSS with content:encoded', () => {
        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Blog</title>
    <link>https://example.com</link>
    <item>
      <title>Post</title>
      <link>https://example.com/post</link>
      <description>Short preview</description>
      <content:encoded><![CDATA[<p>Full article content here</p>]]></content:encoded>
    </item>
  </channel>
</rss>`

        const result = parseFeed(rss, 'https://example.com/feed.xml')

        expect(result.items[0].content).toContain('Full article content')
      })
    })

    describe('Atom', () => {
      it('parses basic Atom feed', () => {
        const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Example Blog</title>
  <link href="https://example.com" rel="alternate"/>
  <subtitle>A great blog</subtitle>
  <entry>
    <title>First Entry</title>
    <link href="https://example.com/first-entry" rel="alternate"/>
    <id>urn:uuid:1234</id>
    <published>2026-01-15T10:00:00Z</published>
    <content type="html">&lt;p&gt;Entry content&lt;/p&gt;</content>
  </entry>
</feed>`

        const result = parseFeed(atom, 'https://example.com/atom.xml')

        expect(result.title).toBe('Example Blog')
        expect(result.siteUrl).toBe('https://example.com')
        expect(result.feedUrl).toBe('https://example.com/atom.xml')
        expect(result.items).toHaveLength(1)
        expect(result.items[0].title).toBe('First Entry')
        expect(result.items[0].url).toBe('https://example.com/first-entry')
      })

      it('parses Atom with summary instead of content', () => {
        const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Blog</title>
  <link href="https://example.com" rel="alternate"/>
  <entry>
    <title>Entry</title>
    <link href="https://example.com/entry"/>
    <id>1</id>
    <summary>This is the summary</summary>
  </entry>
</feed>`

        const result = parseFeed(atom, 'https://example.com/atom.xml')

        expect(result.items[0].content).toBe('This is the summary')
      })
    })

    it('generates favicon URL from site URL', () => {
      const rss = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Blog</title>
    <link>https://example.com</link>
    <item><title>Post</title><link>https://example.com/post</link></item>
  </channel>
</rss>`

      const result = parseFeed(rss, 'https://example.com/feed.xml')

      expect(result.favicon).toContain('example.com')
    })

    it('generates preview from content', () => {
      const rss = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Blog</title>
    <link>https://example.com</link>
    <item>
      <title>Post</title>
      <link>https://example.com/post</link>
      <description><![CDATA[<p>This is a longer piece of content that should be truncated for the preview.</p>]]></description>
    </item>
  </channel>
</rss>`

      const result = parseFeed(rss, 'https://example.com/feed.xml')

      expect(result.items[0].preview).toBe(
        'This is a longer piece of content that should be truncated for the preview.',
      )
      expect(result.items[0].preview.length).toBeLessThanOrEqual(200)
    })

    it('throws error for unknown feed format', () => {
      const invalid = `<html><body>Not a feed</body></html>`

      expect(() => parseFeed(invalid, 'https://example.com')).toThrow(
        'Unknown feed format',
      )
    })
  })

  describe('isValidUrl', () => {
    it('returns true for valid HTTP URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true)
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('https://example.com/feed.xml')).toBe(true)
    })

    it('returns false for invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('ftp://example.com')).toBe(false)
      expect(isValidUrl('')).toBe(false)
    })
  })
})
