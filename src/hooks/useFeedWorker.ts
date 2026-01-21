import { useState, useCallback } from 'react'
import { feedWorker, type ValidateFeedResult } from '~/workers/feed-worker-client'
import {
  feedsCollection,
  articlesCollection,
  feedIdFromUrl,
  articleIdFromUrl,
  articleExists,
  timestamp,
  type Feed,
  type Article,
} from '~/db'

export interface UseFeedWorkerReturn {
  isValidating: boolean
  isParsing: boolean
  isRefreshing: boolean
  error: string | null
  validateFeed: (url: string) => Promise<ValidateFeedResult | null>
  subscribeFeed: (
    validatedFeed: ValidateFeedResult,
    folderId: string | null
  ) => Promise<Feed | null>
  refreshFeed: (feed: Feed) => Promise<number>
}

export function useFeedWorker(): UseFeedWorkerReturn {
  const [isValidating, setIsValidating] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFeed = useCallback(
    async (url: string): Promise<ValidateFeedResult | null> => {
      setIsValidating(true)
      setError(null)

      try {
        const result = await feedWorker.validateFeed(url)

        if (!result.success) {
          setError(result.error)
          return null
        }

        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Validation failed'
        setError(message)
        return null
      } finally {
        setIsValidating(false)
      }
    },
    []
  )

  const subscribeFeed = useCallback(
    async (
      validatedFeed: ValidateFeedResult,
      folderId: string | null
    ): Promise<Feed | null> => {
      setIsParsing(true)
      setError(null)

      try {
        // Parse the feed to get articles
        const result = await feedWorker.parseFeed(validatedFeed.feedUrl)

        if (!result.success) {
          setError(result.error)
          return null
        }

        const now = timestamp()
        const id = feedIdFromUrl(validatedFeed.feedUrl)

        // Create the feed
        const feed: Feed = {
          id,
          title: validatedFeed.feed.title,
          url: validatedFeed.feedUrl,
          siteUrl: validatedFeed.feed.siteUrl,
          favicon: validatedFeed.feed.favicon,
          folderId,
          preferIframe: false,
          lastFetched: now,
          createdAt: now,
          updatedAt: now,
        }

        feedsCollection.insert(feed)

        // Insert articles (skip if already exists)
        for (const parsedArticle of result.articles) {
          const articleId = articleIdFromUrl(parsedArticle.url)
          if (articleExists(articleId)) continue

          const article: Article = {
            id: articleId,
            feedId: id,
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
        }

        return feed
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to subscribe'
        setError(message)
        return null
      } finally {
        setIsParsing(false)
      }
    },
    []
  )

  const refreshFeed = useCallback(async (feed: Feed): Promise<number> => {
    setIsRefreshing(true)
    setError(null)

    try {
      const result = await feedWorker.refreshFeed(feed.id, feed.url)

      if (!result.success) {
        setError(result.error)
        return 0
      }

      const now = timestamp()

      // Update feed lastFetched
      feedsCollection.update(feed.id, (draft) => {
        draft.lastFetched = now
        draft.updatedAt = now
      })

      // Insert only new articles (skip if already exists)
      let newCount = 0
      for (const parsedArticle of result.articles) {
        const articleId = articleIdFromUrl(parsedArticle.url)
        if (articleExists(articleId)) continue

        const article: Article = {
          id: articleId,
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
      }

      return newCount
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh'
      setError(message)
      return 0
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  return {
    isValidating,
    isParsing,
    isRefreshing,
    error,
    validateFeed,
    subscribeFeed,
    refreshFeed,
  }
}
