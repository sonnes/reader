import { createServerFn } from '@tanstack/react-start'
import {
  getAllArticles,
  getAllFeeds,
  getAllFolders,
  getArticlesByFeed,
  getArticlesByFolder,
  getStarredArticles,
  getStats,
  getUnreadArticles,
  updateArticleReadStatus,
  updateArticleStarStatus,
} from '@/db/queries'
import { seedDatabase } from '@/db/seed'

// Initialize and seed database on first load
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

export const fetchReadingData = createServerFn({ method: 'GET' }).handler(
  async () => {
    ensureInitialized()

    const folders = getAllFolders()
    const feeds = getAllFeeds()
    const articles = getAllArticles()
    const stats = getStats()

    return {
      folders,
      feeds,
      articles,
      stats,
    }
  },
)

export const fetchArticlesFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    ensureInitialized()
    return getAllArticles()
  },
)

// ============================================================================
// Mutations
// ============================================================================

export const toggleArticleRead = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    const { articleId, isRead } = ctx.data as {
      articleId: string
      isRead: boolean
    }
    updateArticleReadStatus(articleId, isRead)
    return { success: true }
  },
)

export const toggleArticleStar = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    const { articleId, isStarred } = ctx.data as {
      articleId: string
      isStarred: boolean
    }
    updateArticleStarStatus(articleId, isStarred)
    return { success: true }
  },
)
