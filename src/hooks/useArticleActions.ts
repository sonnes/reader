import { useCallback } from 'react'
import { toast } from 'sonner'
import { articlesCollection, timestamp } from '~/db'
import { refreshScheduler } from '~/lib/refresh-scheduler'

export function useArticleActions() {
  const toggleRead = useCallback((articleId: string) => {
    articlesCollection.update(articleId, (draft) => {
      draft.isRead = !draft.isRead
      draft.updatedAt = timestamp()
    })
  }, [])

  const toggleStar = useCallback((articleId: string) => {
    articlesCollection.update(articleId, (draft) => {
      draft.isStarred = !draft.isStarred
      draft.updatedAt = timestamp()
    })
  }, [])

  const openInBrowser = useCallback((articleId: string) => {
    // Need to get the article URL to open
    const article = articlesCollection.state.get(articleId)
    if (article?.url) {
      window.open(article.url, '_blank', 'noopener,noreferrer')
    }
  }, [])

  const copyArticleUrl = useCallback(async (articleId: string) => {
    const article = articlesCollection.state.get(articleId)
    if (article?.url) {
      await navigator.clipboard.writeText(article.url)
      toast.success('Link copied')
    }
  }, [])

  const refresh = useCallback(() => {
    refreshScheduler.refreshAll()
  }, [])

  const deleteArticle = useCallback((articleId: string) => {
    articlesCollection.update(articleId, (draft) => {
      draft.isDeleted = true
      draft.updatedAt = timestamp()
    })
  }, [])

  return {
    toggleRead,
    toggleStar,
    openInBrowser,
    copyArticleUrl,
    refresh,
    deleteArticle,
  }
}
