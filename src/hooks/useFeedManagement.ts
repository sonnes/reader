import { useCallback } from 'react'
import { feedsCollection, articlesCollection, timestamp } from '~/db'

export function useFeedManagement() {
  const unsubscribeFeed = useCallback((feedId: string) => {
    if (!articlesCollection || !feedsCollection) return

    // Delete all articles for this feed
    const articles = Array.from(articlesCollection.state.values())
    for (const article of articles) {
      if (article.feedId === feedId) {
        articlesCollection.delete(article.id)
      }
    }

    // Delete the feed
    feedsCollection.delete(feedId)
  }, [])

  const moveFeed = useCallback((feedId: string, folderId: string | null) => {
    if (!feedsCollection) return

    feedsCollection.update(feedId, (draft) => {
      draft.folderId = folderId
      draft.updatedAt = timestamp()
    })
  }, [])

  return { unsubscribeFeed, moveFeed }
}
