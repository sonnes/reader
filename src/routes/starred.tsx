import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import type { Article } from '@/types'
import { ReadingExperience } from '@/components/reading'
import {
  ArticleActionsProvider,
  ArticleListProvider,
  FeedActionsProvider,
  FeedsProvider,
  FolderActionsProvider,
  KeyboardProvider,
} from '@/context'
import {
  deleteArticleFn,
  fetchReadingData,
  toggleArticleRead,
  toggleArticleStar,
} from '@/server/reading'
import { createFolderFn, refreshFeedFn, subscribeFeedFn } from '@/server/feeds'

export const Route = createFileRoute('/starred')({
  loader: async () => {
    return await fetchReadingData()
  },
  component: StarredPage,
})

function StarredPage() {
  const initialData = Route.useLoaderData()
  const router = useRouter()

  // Local state for optimistic updates
  const [articles, setArticles] = useState<Array<Article>>(initialData.articles)

  // Folder actions
  const handleCreateFolder = async (name: string) => {
    await createFolderFn({ data: { name } })
    router.invalidate()
  }

  // Feed actions
  const handleAddFeed = async (url: string, folderId?: string) => {
    const result = await subscribeFeedFn({ data: { url, folderId } })
    if (result.success) {
      router.invalidate()
    }
    return result
  }

  const handleRefreshFeed = async (feedId: string) => {
    const result = await refreshFeedFn({ data: { feedId } })
    if (result.success) {
      router.invalidate()
    }
    return result.feed || null
  }

  // Calculate stats from current articles
  const stats = {
    totalArticles: articles.length,
    unreadCount: articles.filter((a) => !a.isRead).length,
    starredCount: articles.filter((a) => a.isStarred).length,
  }

  // Handle toggling read status
  const handleToggleRead = useCallback(
    async (articleId: string, isRead: boolean) => {
      // Optimistic update
      setArticles((prev) =>
        prev.map((a) => (a.id === articleId ? { ...a, isRead } : a)),
      )

      // Server update
      try {
        await toggleArticleRead({ data: { articleId, isRead } })
      } catch (error) {
        // Revert on error
        console.error('Failed to update read status:', error)
        setArticles((prev) =>
          prev.map((a) => (a.id === articleId ? { ...a, isRead: !isRead } : a)),
        )
      }
    },
    [],
  )

  // Handle toggling star status
  const handleToggleStar = useCallback(
    async (articleId: string, isStarred: boolean) => {
      // Optimistic update
      setArticles((prev) =>
        prev.map((a) => (a.id === articleId ? { ...a, isStarred } : a)),
      )

      // Server update
      try {
        await toggleArticleStar({ data: { articleId, isStarred } })
      } catch (error) {
        // Revert on error
        console.error('Failed to update star status:', error)
        setArticles((prev) =>
          prev.map((a) =>
            a.id === articleId ? { ...a, isStarred: !isStarred } : a,
          ),
        )
      }
    },
    [],
  )

  // Handle delete
  const handleDelete = useCallback(
    async (articleId: string) => {
      // Store the article for potential rollback
      const articleToDelete = articles.find((a) => a.id === articleId)

      // Optimistic update - remove from list
      setArticles((prev) => prev.filter((a) => a.id !== articleId))

      // Server update
      try {
        await deleteArticleFn({ data: { articleId } })
      } catch (error) {
        // Revert on error
        console.error('Failed to delete article:', error)
        if (articleToDelete) {
          setArticles((prev) => [...prev, articleToDelete])
        }
      }
    },
    [articles],
  )

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    try {
      const data = await fetchReadingData()
      setArticles(data.articles)
    } catch (error) {
      console.error('Failed to refresh:', error)
    }
  }, [])

  return (
    <ArticleActionsProvider
      articles={articles}
      onToggleRead={handleToggleRead}
      onToggleStar={handleToggleStar}
      onDelete={handleDelete}
      onRefresh={handleRefresh}
    >
      <FolderActionsProvider onCreateFolder={handleCreateFolder}>
        <FeedActionsProvider
          folders={initialData.folders}
          feeds={initialData.feeds}
          onAddFeed={handleAddFeed}
          onRefreshFeed={handleRefreshFeed}
        >
          <FeedsProvider
            folders={initialData.folders}
            feeds={initialData.feeds}
            initialFolderId="starred"
          >
            <ArticleListProvider articles={articles} feeds={initialData.feeds}>
              <KeyboardProvider>
                <ReadingExperience stats={stats} />
              </KeyboardProvider>
            </ArticleListProvider>
          </FeedsProvider>
        </FeedActionsProvider>
      </FolderActionsProvider>
    </ArticleActionsProvider>
  )
}
