import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import type { Article, Feed } from '@/types'
import {
  createArticle,
  createFeed,
  createFolder,
  deleteFeed,
  deleteFolder,
  getAllFeeds,
  getAllFolders,
  getFeedByUrl,
  getStats,
  renameFolder,
  updateFeedFolder,
  updateFeedLastFetched,
} from '@/db/queries'
import {
  discoverFeedUrl,
  fetchAndParseFeed,
  isValidUrl,
} from '@/lib/feed-parser'
import { generateOPML, parseOPML } from '@/lib/opml'
import { seedDatabase } from '@/db/seed'

// Initialize database on first load
let initialized = false
function ensureInitialized() {
  if (!initialized) {
    seedDatabase()
    initialized = true
  }
}

// ============================================================================
// Data fetching
// ============================================================================

export const fetchFeedManagementData = createServerFn({
  method: 'GET',
}).handler(async () => {
  ensureInitialized()

  const folders = getAllFolders()
  const feeds = getAllFeeds()
  const stats = getStats()

  return {
    folders,
    feeds,
    stats,
  }
})

// ============================================================================
// Folder mutations
// ============================================================================

const CreateFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required'),
})

export const createFolderFn = createServerFn({ method: 'POST' })
  .inputValidator(CreateFolderSchema)
  .handler(async ({ data }) => {
    const id = `folder-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const folder = createFolder(id, data.name.trim())
    return { success: true, folder }
  })

const RenameFolderSchema = z.object({
  folderId: z.string(),
  name: z.string().min(1, 'Folder name is required'),
})

export const renameFolderFn = createServerFn({ method: 'POST' })
  .inputValidator(RenameFolderSchema)
  .handler(async ({ data }) => {
    renameFolder(data.folderId, data.name.trim())
    return { success: true }
  })

const DeleteFolderSchema = z.object({
  folderId: z.string(),
})

export const deleteFolderFn = createServerFn({ method: 'POST' })
  .inputValidator(DeleteFolderSchema)
  .handler(async ({ data }) => {
    deleteFolder(data.folderId)
    return { success: true }
  })

// ============================================================================
// Feed mutations
// ============================================================================

const SubscribeFeedSchema = z.object({
  url: z.string().min(1, 'Feed URL is required'),
  folderId: z.string().optional(),
})

export const subscribeFeedFn = createServerFn({ method: 'POST' })
  .inputValidator(SubscribeFeedSchema)
  .handler(async ({ data }) => {
    let feedUrl = data.url.trim()

    if (!isValidUrl(feedUrl)) {
      return { success: false, error: 'Please enter a valid URL' }
    }

    // Check if already subscribed
    const existing = getFeedByUrl(feedUrl)
    if (existing) {
      return {
        success: false,
        error: 'You are already subscribed to this feed',
      }
    }

    try {
      // Try to fetch the feed directly first
      let parsedFeed
      try {
        parsedFeed = await fetchAndParseFeed(feedUrl)
      } catch {
        // If direct fetch fails, try to discover feed URL from the page
        const discoveredUrl = await discoverFeedUrl(feedUrl)
        if (discoveredUrl) {
          feedUrl = discoveredUrl
          // Check if already subscribed to discovered URL
          const existingDiscovered = getFeedByUrl(feedUrl)
          if (existingDiscovered) {
            return {
              success: false,
              error: 'You are already subscribed to this feed',
            }
          }
          parsedFeed = await fetchAndParseFeed(feedUrl)
        } else {
          return {
            success: false,
            error: 'Could not find a valid feed at this URL',
          }
        }
      }

      // Create the feed
      const id = `feed-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const feed = createFeed({
        id,
        title: parsedFeed.title,
        url: feedUrl,
        siteUrl: parsedFeed.siteUrl,
        favicon: parsedFeed.favicon || null,
        folderId: data.folderId || null,
        lastFetched: new Date().toISOString(),
      })

      // Import articles from the feed
      const articles: Array<Article> = []
      for (const item of parsedFeed.items.slice(0, 50)) {
        // Limit to 50 items
        const articleId = `article-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
        const article = createArticle({
          id: articleId,
          feedId: id,
          title: item.title,
          url: item.url,
          publishedAt: item.publishedAt,
          preview: item.preview,
          content: item.content,
          isRead: false,
          isStarred: false,
        })
        articles.push(article)
      }

      return { success: true, feed, articlesImported: articles.length }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to subscribe to feed'
      return { success: false, error: message }
    }
  },
)

const UnsubscribeFeedSchema = z.object({
  feedId: z.string(),
})

export const unsubscribeFeedFn = createServerFn({ method: 'POST' })
  .inputValidator(UnsubscribeFeedSchema)
  .handler(async ({ data }) => {
    deleteFeed(data.feedId)
    return { success: true }
  })

const MoveFeedSchema = z.object({
  feedId: z.string(),
  folderId: z.string().nullable(),
})

export const moveFeedFn = createServerFn({ method: 'POST' })
  .inputValidator(MoveFeedSchema)
  .handler(async ({ data }) => {
    updateFeedFolder(data.feedId, data.folderId)
    return { success: true }
  })

// ============================================================================
// OPML import/export
// ============================================================================

const ImportOPMLSchema = z.object({
  content: z.string(),
})

export const importOPMLFn = createServerFn({ method: 'POST' })
  .inputValidator(ImportOPMLSchema)
  .handler(async ({ data }) => {
    try {
      const result = parseOPML(data.content)

      // Create folders first
      const folderMap = new Map<string, string>() // name -> id

      for (const folderName of result.folders) {
        const id = `folder-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
        createFolder(id, folderName)
        folderMap.set(folderName, id)
      }

      // Subscribe to feeds
      let importedCount = 0
      let skippedCount = 0
      const errors: Array<string> = []

      for (const feedData of result.feeds) {
        // Check if already subscribed
        const existing = getFeedByUrl(feedData.url)
        if (existing) {
          skippedCount++
          continue
        }

        try {
          // Try to fetch and parse the feed
          const parsedFeed = await fetchAndParseFeed(feedData.url)

          const id = `feed-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
          const folderId = feedData.folderName
            ? folderMap.get(feedData.folderName)
            : null

          createFeed({
            id,
            title: parsedFeed.title || feedData.title,
            url: feedData.url,
            siteUrl: parsedFeed.siteUrl || feedData.siteUrl,
            favicon: parsedFeed.favicon || null,
            folderId: folderId || null,
            lastFetched: new Date().toISOString(),
          })

          // Import articles
          for (const item of parsedFeed.items.slice(0, 20)) {
            // Limit to 20 items per feed during import
            const articleId = `article-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
            createArticle({
              id: articleId,
              feedId: id,
              title: item.title,
              url: item.url,
              publishedAt: item.publishedAt,
              preview: item.preview,
              content: item.content,
              isRead: false,
              isStarred: false,
            })
          }

          importedCount++
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Unknown error'
          errors.push(`${feedData.title || feedData.url}: ${message}`)
        }
      }

      return {
        success: true,
        imported: importedCount,
        skipped: skippedCount,
        errors: errors.length > 0 ? errors : undefined,
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to parse OPML file'
      return { success: false, error: message }
    }
  },
)

export const exportOPMLFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    ensureInitialized()

    const folders = getAllFolders()
    const feeds = getAllFeeds()

    const opml = generateOPML(folders, feeds)

    return { success: true, opml }
  },
)
