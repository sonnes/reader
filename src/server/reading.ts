import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  deleteArticle,
  getAllArticles,
  getAllFeeds,
  getAllFolders,
  getStats,
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

const ToggleReadSchema = z.object({
  articleId: z.string(),
  isRead: z.boolean(),
})

export const toggleArticleRead = createServerFn({ method: 'POST' })
  .inputValidator(ToggleReadSchema)
  .handler(async ({ data }) => {
    updateArticleReadStatus(data.articleId, data.isRead)
    return { success: true }
  })

const ToggleStarSchema = z.object({
  articleId: z.string(),
  isStarred: z.boolean(),
})

export const toggleArticleStar = createServerFn({ method: 'POST' })
  .inputValidator(ToggleStarSchema)
  .handler(async ({ data }) => {
    updateArticleStarStatus(data.articleId, data.isStarred)
    return { success: true }
  })

const DeleteArticleSchema = z.object({
  articleId: z.string(),
})

export const deleteArticleFn = createServerFn({ method: 'POST' })
  .inputValidator(DeleteArticleSchema)
  .handler(async ({ data }) => {
    deleteArticle(data.articleId)
    return { success: true }
  })
