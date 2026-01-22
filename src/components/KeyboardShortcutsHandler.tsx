import { useCallback, useEffect, useState } from 'react'
import { useLiveQuery, eq, and } from '@tanstack/react-db'
import { useKeyboard, useAppState, useArticleList } from '~/context'
import { useKeyboardShortcuts } from '~/hooks/useKeyboardShortcuts'
import { useArticleActions } from '~/hooks/useArticleActions'
import { articlesCollection } from '~/db'

// Inner component that uses client-only hooks
function KeyboardShortcutsHandlerInner() {
  const { showKeyboardHelp, toggleKeyboardHelp } = useKeyboard()
  const {
    focusMode,
    toggleFocusMode,
    exitFocusMode,
    toggleViewMode,
    toggleSidebar,
  } = useAppState()
  const { selectedArticleId, selectArticle, clearSelection, toggleIframeView } =
    useArticleList()
  const { toggleRead, toggleStar, openInBrowser, refresh } = useArticleActions()

  // Get all unread articles for navigation
  const { data: articles = [] } = useLiveQuery(
    (q) =>
      q
        .from({ article: articlesCollection })
        .where(({ article }) =>
          and(eq(article.isRead, false), eq(article.isDeleted, false))
        ),
    []
  )

  // Sort articles by publishedAt descending
  const sortedArticles = [...articles].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )

  const navigateArticle = useCallback(
    (direction: 'next' | 'prev') => {
      if (sortedArticles.length === 0) return

      const currentIndex = sortedArticles.findIndex(
        (a) => a.id === selectedArticleId
      )
      let newIndex: number

      if (direction === 'next') {
        newIndex =
          currentIndex < sortedArticles.length - 1
            ? currentIndex + 1
            : currentIndex
      } else {
        newIndex = currentIndex > 0 ? currentIndex - 1 : 0
      }

      if (newIndex !== currentIndex || currentIndex === -1) {
        const newArticle = sortedArticles[newIndex === -1 ? 0 : newIndex]
        selectArticle(newArticle.id)
      }
    },
    [sortedArticles, selectedArticleId, selectArticle]
  )

  const goToAllArticles = useCallback(() => {
    clearSelection()
  }, [clearSelection])

  useKeyboardShortcuts(
    {
      navigateArticle,
      toggleRead,
      toggleStar,
      openInBrowser,
      refresh,
      toggleSidebar,
      toggleFocusMode,
      exitFocusMode,
      toggleViewMode,
      toggleKeyboardHelp,
      goToAllArticles,
      toggleIframeView,
    },
    {
      selectedArticleId,
      showKeyboardHelp,
      focusMode,
    }
  )

  return null
}

// SSR-safe wrapper - only renders on client
export function KeyboardShortcutsHandler() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <KeyboardShortcutsHandlerInner />
}
