/**
 * OPML Import/Export Utilities
 *
 * Handles parsing and generating OPML files for feed subscription
 * import/export functionality.
 */

import type { Feed, Folder } from '@/types'

export interface OPMLOutline {
  title: string
  xmlUrl?: string
  htmlUrl?: string
  children?: Array<OPMLOutline>
}

export interface OPMLImportResult {
  feeds: Array<{
    title: string
    url: string
    siteUrl: string
    folderName?: string
  }>
  folders: Array<string>
}

/**
 * Parse OPML content and extract feeds and folders
 */
export function parseOPML(opmlContent: string): OPMLImportResult {
  const feeds: OPMLImportResult['feeds'] = []
  const foldersSet = new Set<string>()

  // Extract body content
  const bodyMatch = opmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (!bodyMatch) {
    throw new Error('Invalid OPML: missing body element')
  }

  const body = bodyMatch[1]

  // Parse outlines recursively
  parseOutlines(body, null)

  function parseOutlines(xml: string, currentFolder: string | null) {
    // Match outline elements (both self-closing and with children)
    const outlinePattern = /<outline([^>]*?)(?:\/>|>([\s\S]*?)<\/outline>)/gi
    let match

    while ((match = outlinePattern.exec(xml)) !== null) {
      const attrs = match[1]
      const children = match[2]

      const title =
        extractAttr(attrs, 'title') || extractAttr(attrs, 'text') || ''
      const xmlUrl = extractAttr(attrs, 'xmlUrl')
      const htmlUrl = extractAttr(attrs, 'htmlUrl')
      const type = extractAttr(attrs, 'type')

      // If it has xmlUrl, it's a feed
      if (xmlUrl) {
        feeds.push({
          title: decodeHtmlEntities(title),
          url: xmlUrl,
          siteUrl: htmlUrl || '',
          folderName: currentFolder || undefined,
        })
      }
      // If it has children and no xmlUrl, it's a folder
      else if (children && children.trim()) {
        const folderName = title
        if (folderName) {
          foldersSet.add(folderName)
          // Recursively parse children with this folder context
          parseOutlines(children, folderName)
        }
      }
      // Could be a folder-type outline without explicit children in the match
      else if (type === 'folder' || (!xmlUrl && title)) {
        // This might be a folder, check for nested content
        if (children) {
          const folderName = title
          if (folderName) {
            foldersSet.add(folderName)
            parseOutlines(children, folderName)
          }
        }
      }
    }
  }

  return {
    feeds,
    folders: Array.from(foldersSet),
  }
}

/**
 * Extract attribute value from attribute string
 */
function extractAttr(attrs: string, name: string): string | null {
  const match = attrs.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'))
  return match ? match[1] : null
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
}

/**
 * Generate OPML content from feeds and folders
 */
export function generateOPML(folders: Array<Folder>, feeds: Array<Feed>): string {
  const now = new Date().toUTCString()

  let opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Reader RSS Subscriptions</title>
    <dateCreated>${now}</dateCreated>
  </head>
  <body>
`

  // Group feeds by folder
  const feedsByFolder = new Map<string | null, Array<Feed>>()

  for (const feed of feeds) {
    const key = feed.folderId
    if (!feedsByFolder.has(key)) {
      feedsByFolder.set(key, [])
    }
    feedsByFolder.get(key)!.push(feed)
  }

  // Output folders with their feeds
  for (const folder of folders) {
    const folderFeeds = feedsByFolder.get(folder.id) || []
    if (folderFeeds.length > 0) {
      opml += `    <outline text="${escapeXml(folder.name)}" title="${escapeXml(folder.name)}">\n`
      for (const feed of folderFeeds) {
        opml += `      <outline type="rss" text="${escapeXml(feed.title)}" title="${escapeXml(feed.title)}" xmlUrl="${escapeXml(feed.url)}" htmlUrl="${escapeXml(feed.siteUrl)}"/>\n`
      }
      opml += `    </outline>\n`
    }
  }

  // Output uncategorized feeds
  const uncategorizedFeeds = feedsByFolder.get(null) || []
  for (const feed of uncategorizedFeeds) {
    opml += `    <outline type="rss" text="${escapeXml(feed.title)}" title="${escapeXml(feed.title)}" xmlUrl="${escapeXml(feed.url)}" htmlUrl="${escapeXml(feed.siteUrl)}"/>\n`
  }

  opml += `  </body>
</opml>`

  return opml
}

/**
 * Escape special XML characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
