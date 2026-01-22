import { feedWorker } from '~/workers/feed-worker-client'
import {
  feedsCollection,
  articlesCollection,
  timestamp,
  articleIdFromUrl,
  type Feed,
  type Article,
} from '~/db'

const REFRESH_INTERVAL_MS = 60 * 60 * 1000 // 1 hour
const MIN_REFRESH_INTERVAL_MS = 15 * 60 * 1000 // 15 minutes minimum between refreshes
const INITIAL_DELAY_MS = 5000 // 5 seconds after start

export interface RefreshResult {
  feedId: string
  feedTitle: string
  newArticles: number
  error?: string
}

export type RefreshCallback = (results: RefreshResult[]) => void

class RefreshScheduler {
  private intervalId: ReturnType<typeof setInterval> | null = null
  private timeoutId: ReturnType<typeof setTimeout> | null = null
  private isRefreshing = false
  private lastRefreshTime = 0
  private onRefreshComplete: RefreshCallback | null = null

  /**
   * Start the refresh scheduler
   */
  start(onComplete?: RefreshCallback): void {
    if (this.intervalId !== null) return

    this.onRefreshComplete = onComplete || null

    // Initial refresh after a short delay
    this.timeoutId = setTimeout(() => {
      this.refreshAll()
    }, INITIAL_DELAY_MS)

    // Schedule periodic refreshes
    this.intervalId = setInterval(() => {
      this.refreshAll()
    }, REFRESH_INTERVAL_MS)
  }

  /**
   * Stop the refresh scheduler
   */
  stop(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }

    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    this.onRefreshComplete = null
  }

  /**
   * Check if scheduler is running
   */
  isRunning(): boolean {
    return this.intervalId !== null
  }

  /**
   * Check if refresh is in progress
   */
  isRefreshInProgress(): boolean {
    return this.isRefreshing
  }

  /**
   * Get time since last refresh in ms
   */
  getTimeSinceLastRefresh(): number {
    return Date.now() - this.lastRefreshTime
  }

  /**
   * Manually trigger a refresh of all feeds
   */
  async refreshAll(): Promise<RefreshResult[]> {
    if (this.isRefreshing) {
      return []
    }

    const now = Date.now()
    if (now - this.lastRefreshTime < MIN_REFRESH_INTERVAL_MS) {
      return []
    }

    this.isRefreshing = true
    this.lastRefreshTime = now
    const results: RefreshResult[] = []

    try {
      const feeds = await this.getAllFeeds()

      for (const feed of feeds) {
        const result = await this.refreshSingleFeed(feed)
        results.push(result)
      }

      if (this.onRefreshComplete) {
        this.onRefreshComplete(results)
      }

      return results
    } catch {
      return results
    } finally {
      this.isRefreshing = false
    }
  }

  /**
   * Refresh a single feed
   */
  async refreshSingleFeed(feed: Feed): Promise<RefreshResult> {
    try {
      const result = await feedWorker.refreshFeed(feed.id, feed.url)

      if (!result.success) {
        return {
          feedId: feed.id,
          feedTitle: feed.title,
          newArticles: 0,
          error: result.error,
        }
      }

      const now = timestamp()

      // Update feed lastFetched
      feedsCollection.update(feed.id, (draft) => {
        draft.lastFetched = now
        draft.updatedAt = now
      })

      // Insert new articles
      let newCount = 0
      for (const parsedArticle of result.articles) {
        try {
          const article: Article = {
            id: articleIdFromUrl(parsedArticle.url),
            feedId: feed.id,
            title: parsedArticle.title,
            url: parsedArticle.url,
            publishedAt: parsedArticle.publishedAt,
            preview: parsedArticle.preview,
            content: parsedArticle.content,
            isRead: false,
            isStarred: false,
            isDeleted: false,
            createdAt: now,
            updatedAt: now,
          }
          articlesCollection.insert(article)
          newCount++
        } catch {
          // Skip duplicates
        }
      }

      return {
        feedId: feed.id,
        feedTitle: feed.title,
        newArticles: newCount,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      return {
        feedId: feed.id,
        feedTitle: feed.title,
        newArticles: 0,
        error: errorMessage,
      }
    }
  }

  /**
   * Get all feeds from IndexedDB
   */
  private async getAllFeeds(): Promise<Feed[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('reader')

      request.onsuccess = () => {
        const db = request.result
        try {
          const tx = db.transaction('feeds', 'readonly')
          const store = tx.objectStore('feeds')
          const getAllRequest = store.getAll()

          getAllRequest.onsuccess = () => {
            resolve((getAllRequest.result as Feed[]) || [])
          }

          getAllRequest.onerror = () => {
            reject(getAllRequest.error)
          }
        } catch (error) {
          // Store might not exist yet
          resolve([])
        }
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }
}

// Singleton instance
export const refreshScheduler = new RefreshScheduler()

// Export class for testing
export { RefreshScheduler }
