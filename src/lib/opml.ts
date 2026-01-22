/**
 * OPML Import/Export Utilities
 *
 * Uses feedsmith for parsing and generating OPML files.
 */

import { parseOpml, generateOpml } from 'feedsmith'
import type { Feed, Folder } from '~/db'

export interface OPMLImportResult {
  feeds: Array<{
    title: string
    url: string
    siteUrl: string
    folderName?: string
  }>
  folders: Array<string>
}

interface OpmlOutline {
  text?: string
  title?: string
  xmlUrl?: string
  htmlUrl?: string
  type?: string
  outlines?: OpmlOutline[]
}

/**
 * Parse OPML content and extract feeds and folders
 */
export function parseOPML(opmlContent: string): OPMLImportResult {
  const feeds: OPMLImportResult['feeds'] = []
  const foldersSet = new Set<string>()

  const opml = parseOpml(opmlContent)
  const outlines = (opml.body?.outlines ?? []) as OpmlOutline[]

  function processOutlines(items: OpmlOutline[], currentFolder: string | null) {
    for (const outline of items) {
      const title = outline.title || outline.text || ''

      // If it has xmlUrl, it's a feed
      if (outline.xmlUrl) {
        feeds.push({
          title,
          url: outline.xmlUrl,
          siteUrl: outline.htmlUrl || '',
          folderName: currentFolder || undefined,
        })
      }
      // If it has nested outlines and no xmlUrl, it's a folder
      else if (outline.outlines && outline.outlines.length > 0) {
        if (title) {
          foldersSet.add(title)
          processOutlines(outline.outlines, title)
        }
      }
    }
  }

  processOutlines(outlines, null)

  return {
    feeds,
    folders: Array.from(foldersSet),
  }
}

/**
 * Generate OPML content from feeds and folders
 */
export function generateOPML(
  folders: Array<Folder>,
  feeds: Array<Feed>
): string {
  // Group feeds by folder
  const feedsByFolder = new Map<string | null, Array<Feed>>()

  for (const feed of feeds) {
    const key = feed.folderId
    if (!feedsByFolder.has(key)) {
      feedsByFolder.set(key, [])
    }
    feedsByFolder.get(key)!.push(feed)
  }

  // Build outlines array
  const outlines = []

  // Add folders with their feeds
  for (const folder of folders) {
    const folderFeeds = feedsByFolder.get(folder.id) || []
    if (folderFeeds.length > 0) {
      outlines.push({
        text: folder.name,
        title: folder.name,
        outlines: folderFeeds.map((feed) => ({
          type: 'rss',
          text: feed.title,
          title: feed.title,
          xmlUrl: feed.url,
          htmlUrl: feed.siteUrl,
        })),
      })
    }
  }

  // Add uncategorized feeds
  const uncategorizedFeeds = feedsByFolder.get(null) || []
  for (const feed of uncategorizedFeeds) {
    outlines.push({
      type: 'rss',
      text: feed.title,
      title: feed.title,
      xmlUrl: feed.url,
      htmlUrl: feed.siteUrl,
    })
  }

  return generateOpml({
    head: {
      title: 'Reader RSS Subscriptions',
      dateCreated: new Date(),
    },
    body: {
      outlines,
    },
  })
}
