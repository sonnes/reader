import { useMemo } from 'react'
import type { Article, Feed } from '@/types'

type FilterMode = 'all' | 'unread' | 'starred'
type SortOrder = 'newest' | 'oldest'

interface UseArticleFilteringParams {
  articles: Array<Article>
  feeds: Array<Feed>
  selectedFolderId: string | null
  selectedFeedId: string | null
  filterMode: FilterMode
  sortOrder: SortOrder
}

export function useArticleFiltering({
  articles,
  feeds,
  selectedFolderId,
  selectedFeedId,
  filterMode,
  sortOrder,
}: UseArticleFilteringParams): Array<Article> {
  return useMemo(() => {
    let result = articles

    // Filter by starred
    if (selectedFolderId === 'starred' || filterMode === 'starred') {
      result = result.filter((a) => a.isStarred)
    } else {
      // Filter by unread
      if (filterMode === 'unread') {
        result = result.filter((a) => !a.isRead)
      }

      // Filter by feed
      if (selectedFeedId) {
        result = result.filter((a) => a.feedId === selectedFeedId)
      } else if (selectedFolderId && selectedFolderId !== 'starred') {
        // Filter by folder
        const folderFeedIds = feeds
          .filter((f) => f.folderId === selectedFolderId)
          .map((f) => f.id)
        result = result.filter((a) => folderFeedIds.includes(a.feedId))
      }
    }

    // Sort articles
    return [...result].sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime()
      const dateB = new Date(b.publishedAt).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })
  }, [articles, feeds, selectedFolderId, selectedFeedId, filterMode, sortOrder])
}
