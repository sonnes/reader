import { useMemo } from 'react'
import { useLiveQuery, eq } from '@tanstack/react-db'
import {
  foldersCollection,
  feedsCollection,
  articlesCollection,
  type Folder,
  type Feed,
  type Article,
} from '~/db'

export function useFeedsWithCounts() {
  const { data: folders = [] } = useLiveQuery((q) =>
    q.from({ folder: foldersCollection })
  )

  const { data: feeds = [] } = useLiveQuery((q) =>
    q.from({ feed: feedsCollection })
  )

  const { data: unreadArticles = [] } = useLiveQuery((q) =>
    q
      .from({ article: articlesCollection })
      .where(({ article }) => eq(article.isRead, false))
  )

  // Compute unread counts per feed
  const unreadCounts = useMemo(() => {
    return unreadArticles.reduce(
      (acc, article) => {
        acc[article.feedId] = (acc[article.feedId] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
  }, [unreadArticles])

  // Compute unread counts per folder
  const folderUnreadCounts = useMemo(() => {
    return folders.reduce(
      (acc, folder) => {
        const folderFeeds = feeds.filter((f) => f.folderId === folder.id)
        acc[folder.id] = folderFeeds.reduce(
          (sum, feed) => sum + (unreadCounts[feed.id] || 0),
          0
        )
        return acc
      },
      {} as Record<string, number>
    )
  }, [folders, feeds, unreadCounts])

  return {
    folders,
    feeds,
    unreadArticles,
    unreadCounts,
    folderUnreadCounts,
  }
}
