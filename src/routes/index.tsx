import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import type { Article } from '@/types'
import { ReadingExperience } from '@/components/reading'
import {
  fetchReadingData,
  toggleArticleRead,
  toggleArticleStar,
} from '@/server/reading'

export const Route = createFileRoute('/')({
  loader: async () => {
    return await fetchReadingData()
  },
  component: ReadPage,
})

function ReadPage() {
  const initialData = Route.useLoaderData()

  // Local state for optimistic updates
  const [articles, setArticles] = useState<Array<Article>>(initialData.articles)

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
        await toggleArticleRead({ articleId, isRead })
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
        await toggleArticleStar({ articleId, isStarred })
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
    <ReadingExperience
      folders={initialData.folders}
      feeds={initialData.feeds}
      articles={articles}
      stats={stats}
      onToggleRead={handleToggleRead}
      onToggleStar={handleToggleStar}
      onRefresh={handleRefresh}
    />
  )
}
