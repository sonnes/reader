import { createContext, useCallback, useContext } from 'react'
import type { ReactNode } from 'react'
import type { Article } from '@/types'

interface ArticleActionsContextValue {
  toggleRead: (articleId: string) => void
  toggleStar: (articleId: string) => void
  deleteArticle: (articleId: string) => void
  openInBrowser: (articleId: string) => void
  refresh: () => void
}

const ArticleActionsContext = createContext<ArticleActionsContextValue | null>(
  null,
)

interface ArticleActionsProviderProps {
  children: ReactNode
  articles: Array<Article>
  onToggleRead?: (articleId: string, isRead: boolean) => void
  onToggleStar?: (articleId: string, isStarred: boolean) => void
  onDelete?: (articleId: string) => void
  onRefresh?: () => void
}

export function ArticleActionsProvider({
  children,
  articles,
  onToggleRead,
  onToggleStar,
  onDelete,
  onRefresh,
}: ArticleActionsProviderProps) {
  const toggleRead = useCallback(
    (articleId: string) => {
      const article = articles.find((a) => a.id === articleId)
      if (article) {
        onToggleRead?.(articleId, !article.isRead)
      }
    },
    [articles, onToggleRead],
  )

  const toggleStar = useCallback(
    (articleId: string) => {
      const article = articles.find((a) => a.id === articleId)
      if (article) {
        onToggleStar?.(articleId, !article.isStarred)
      }
    },
    [articles, onToggleStar],
  )

  const deleteArticle = useCallback(
    (articleId: string) => {
      onDelete?.(articleId)
    },
    [onDelete],
  )

  const openInBrowser = useCallback(
    (articleId: string) => {
      const article = articles.find((a) => a.id === articleId)
      if (article) {
        window.open(article.url, '_blank', 'noopener,noreferrer')
      }
    },
    [articles],
  )

  const refresh = useCallback(() => {
    onRefresh?.()
  }, [onRefresh])

  return (
    <ArticleActionsContext.Provider
      value={{ toggleRead, toggleStar, deleteArticle, openInBrowser, refresh }}
    >
      {children}
    </ArticleActionsContext.Provider>
  )
}

export function useArticleActions() {
  const context = useContext(ArticleActionsContext)
  if (!context) {
    throw new Error(
      'useArticleActions must be used within ArticleActionsProvider',
    )
  }
  return context
}
