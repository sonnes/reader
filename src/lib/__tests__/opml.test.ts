import { describe, expect, it } from 'vitest'
import { generateOPML, parseOPML } from '../opml'
import type { Feed, Folder } from '@/types'

describe('OPML utilities', () => {
  describe('parseOPML', () => {
    it('parses feeds from OPML', () => {
      const opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head><title>My Feeds</title></head>
  <body>
    <outline type="rss" text="Example Blog" title="Example Blog" xmlUrl="https://example.com/feed.xml" htmlUrl="https://example.com"/>
  </body>
</opml>`

      const result = parseOPML(opml)

      expect(result.feeds).toHaveLength(1)
      expect(result.feeds[0]).toEqual({
        title: 'Example Blog',
        url: 'https://example.com/feed.xml',
        siteUrl: 'https://example.com',
        folderName: undefined,
      })
    })

    it('parses feeds with folders', () => {
      const opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head><title>My Feeds</title></head>
  <body>
    <outline text="Tech" title="Tech">
      <outline type="rss" text="Tech Blog" title="Tech Blog" xmlUrl="https://tech.com/rss" htmlUrl="https://tech.com"/>
    </outline>
    <outline text="News" title="News">
      <outline type="rss" text="News Site" title="News Site" xmlUrl="https://news.com/rss" htmlUrl="https://news.com"/>
    </outline>
  </body>
</opml>`

      const result = parseOPML(opml)

      expect(result.folders).toEqual(['Tech', 'News'])
      expect(result.feeds).toHaveLength(2)
      expect(result.feeds[0].folderName).toBe('Tech')
      expect(result.feeds[1].folderName).toBe('News')
    })

    it('handles mixed feeds (with and without folders)', () => {
      const opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head><title>My Feeds</title></head>
  <body>
    <outline type="rss" text="Standalone" xmlUrl="https://standalone.com/rss" htmlUrl="https://standalone.com"/>
    <outline text="Folder" title="Folder">
      <outline type="rss" text="In Folder" xmlUrl="https://infolder.com/rss" htmlUrl="https://infolder.com"/>
    </outline>
  </body>
</opml>`

      const result = parseOPML(opml)

      expect(result.feeds).toHaveLength(2)
      expect(result.feeds[0].folderName).toBeUndefined()
      expect(result.feeds[1].folderName).toBe('Folder')
    })

    it('decodes HTML entities in titles', () => {
      const opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head><title>My Feeds</title></head>
  <body>
    <outline type="rss" text="Tom &amp; Jerry&apos;s Blog" title="Tom &amp; Jerry&apos;s Blog" xmlUrl="https://example.com/rss" htmlUrl="https://example.com"/>
  </body>
</opml>`

      const result = parseOPML(opml)

      expect(result.feeds[0].title).toBe("Tom & Jerry's Blog")
    })

    it('throws error for invalid OPML (missing body)', () => {
      const opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head><title>My Feeds</title></head>
</opml>`

      expect(() => parseOPML(opml)).toThrow(
        'Invalid OPML: missing body element',
      )
    })

    it('handles self-closing outline elements', () => {
      const opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head><title>My Feeds</title></head>
  <body>
    <outline type="rss" text="Feed" xmlUrl="https://example.com/rss" htmlUrl="https://example.com" />
  </body>
</opml>`

      const result = parseOPML(opml)

      expect(result.feeds).toHaveLength(1)
    })
  })

  describe('generateOPML', () => {
    const mockFolders: Array<Folder> = [
      { id: 'folder-1', name: 'Tech', feedIds: ['feed-1'], unreadCount: 5 },
      { id: 'folder-2', name: 'News', feedIds: ['feed-2'], unreadCount: 10 },
    ]

    const mockFeeds: Array<Feed> = [
      {
        id: 'feed-1',
        title: 'Tech Blog',
        url: 'https://tech.com/rss',
        siteUrl: 'https://tech.com',
        favicon: null,
        folderId: 'folder-1',
        unreadCount: 5,
        lastFetched: '2026-01-15T10:00:00Z',
      },
      {
        id: 'feed-2',
        title: 'News Site',
        url: 'https://news.com/rss',
        siteUrl: 'https://news.com',
        favicon: null,
        folderId: 'folder-2',
        unreadCount: 10,
        lastFetched: '2026-01-15T10:00:00Z',
      },
      {
        id: 'feed-3',
        title: 'Standalone',
        url: 'https://standalone.com/rss',
        siteUrl: 'https://standalone.com',
        favicon: null,
        folderId: null,
        unreadCount: 0,
        lastFetched: '2026-01-15T10:00:00Z',
      },
    ]

    it('generates valid OPML', () => {
      const opml = generateOPML(mockFolders, mockFeeds)

      expect(opml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(opml).toContain('<opml version="2.0">')
      expect(opml).toContain('<title>Reader RSS Subscriptions</title>')
      expect(opml).toContain('</opml>')
    })

    it('includes feeds grouped by folder', () => {
      const opml = generateOPML(mockFolders, mockFeeds)

      expect(opml).toContain('text="Tech"')
      expect(opml).toContain('xmlUrl="https://tech.com/rss"')
      expect(opml).toContain('text="News"')
      expect(opml).toContain('xmlUrl="https://news.com/rss"')
    })

    it('includes uncategorized feeds at root level', () => {
      const opml = generateOPML(mockFolders, mockFeeds)

      expect(opml).toContain('xmlUrl="https://standalone.com/rss"')
    })

    it('escapes XML special characters', () => {
      const foldersWithSpecialChars: Array<Folder> = [
        { id: 'f1', name: 'Tom & Jerry', feedIds: ['feed-1'], unreadCount: 0 },
      ]
      const feedsWithSpecialChars: Array<Feed> = [
        {
          id: 'feed-1',
          title: '<Script> Alert',
          url: 'https://example.com/rss',
          siteUrl: 'https://example.com',
          favicon: null,
          folderId: 'f1',
          unreadCount: 0,
          lastFetched: '2026-01-15T10:00:00Z',
        },
      ]

      const opml = generateOPML(foldersWithSpecialChars, feedsWithSpecialChars)

      expect(opml).toContain('Tom &amp; Jerry')
      expect(opml).toContain('&lt;Script&gt; Alert')
    })

    it('can be parsed back by parseOPML', () => {
      const opml = generateOPML(mockFolders, mockFeeds)
      const result = parseOPML(opml)

      expect(result.folders).toContain('Tech')
      expect(result.folders).toContain('News')
      expect(result.feeds.length).toBe(3)

      const techFeed = result.feeds.find(
        (f) => f.url === 'https://tech.com/rss',
      )
      expect(techFeed).toBeDefined()
      expect(techFeed?.folderName).toBe('Tech')
    })
  })
})
