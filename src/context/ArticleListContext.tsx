import { createContext, useCallback, useContext, useState } from 'react'
import { useFeedsContext } from './FeedsContext'
import { useArticleActions } from './ArticleActionsContext'
import type { ReactNode } from 'react'
import type { Article, Feed } from '@/types'
import { useArticleFiltering } from '@/hooks/useArticleFiltering'
import { updateFeedIframeFn } from '@/server/feeds'

type ViewMode = 'list' | 'card'
type SortOrder = 'newest' | 'oldest'

interface ArticleListContextValue {
  articles: Array<Article>
  filteredArticles: Array<Article>
  selectedArticle: Article | null
  selectedFeed: Feed | undefined
  selectedArticleId: string | null
  sortOrder: SortOrder
  viewMode: ViewMode
  focusMode: boolean
  iframeView: boolean
  selectArticle: (articleId: string) => void
  navigateArticle: (direction: 'next' | 'prev') => void
  setSortOrder: (order: SortOrder) => void
  toggleViewMode: () => void
  toggleFocusMode: () => void
  exitFocusMode: () => void
  toggleIframeView: () => void
}

const ArticleListContext = createContext<ArticleListContextValue | null>(null)

interface ArticleListProviderProps {
  children: ReactNode
  articles: Array<Article>
  feeds: Array<Feed>
  initialArticleId?: string | null
  initialViewMode?: ViewMode
  initialFocusMode?: boolean
}

export function ArticleListProvider({
  children,
  articles,
  feeds,
  initialArticleId = null,
  initialViewMode = 'list',
  initialFocusMode = false,
}: ArticleListProviderProps) {
  const { selectedFolderId, selectedFeedId, filterMode } = useFeedsContext()
  const { toggleRead } = useArticleActions()

  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    initialArticleId,
  )
  const [sortOrder, setSortOrderState] = useState<SortOrder>('newest')
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)
  const [focusMode, setFocusMode] = useState(initialFocusMode)
  const [iframeView, setIframeView] = useState(false)

  const filteredArticles = useArticleFiltering({
    articles,
    feeds,
    selectedFolderId,
    selectedFeedId,
    filterMode,
    sortOrder,
  })

  const selectedArticle =
    articles.find((a) => a.id === selectedArticleId) || null
  const selectedFeed = selectedArticle
    ? feeds.find((f) => f.id === selectedArticle.feedId)
    : undefined

  const selectArticle = useCallback(
    (articleId: string) => {
      setSelectedArticleId(articleId)
      const article = articles.find((a) => a.id === articleId)
      if (article) {
        // Set iframe view based on feed's preference
        const feed = feeds.find((f) => f.id === article.feedId)
        setIframeView(feed?.preferIframe ?? false)
        // Mark as read if unread
        if (!article.isRead) {
          toggleRead(articleId)
        }
      }
    },
    [articles, feeds, toggleRead],
  )

  const navigateArticle = useCallback(
    (direction: 'next' | 'prev') => {
      if (filteredArticles.length === 0) return

      const currentIndex = filteredArticles.findIndex(
        (a) => a.id === selectedArticleId,
      )
      let newIndex: number

      if (direction === 'next') {
        newIndex =
          currentIndex < filteredArticles.length - 1
            ? currentIndex + 1
            : currentIndex
      } else {
        newIndex = currentIndex > 0 ? currentIndex - 1 : 0
      }

      if (newIndex !== currentIndex || currentIndex === -1) {
        const newArticle = filteredArticles[newIndex === -1 ? 0 : newIndex]
        selectArticle(newArticle.id)
      }
    },
    [filteredArticles, selectedArticleId, selectArticle],
  )

  const setSortOrder = useCallback((order: SortOrder) => {
    setSortOrderState(order)
  }, [])

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === 'list' ? 'card' : 'list'))
  }, [])

  const toggleFocusMode = useCallback(() => {
    setFocusMode((prev) => !prev)
  }, [])

  const exitFocusMode = useCallback(() => {
    setFocusMode(false)
  }, [])

  const toggleIframeView = useCallback(() => {
    setIframeView((prev) => {
      const newValue = !prev
      // Persist to feed's preference
      if (selectedArticle) {
        updateFeedIframeFn({
          data: { feedId: selectedArticle.feedId, preferIframe: newValue },
        })
      }
      return newValue
    })
  }, [selectedArticle])

  return (
    <ArticleListContext.Provider
      value={{
        articles,
        filteredArticles,
        selectedArticle,
        selectedFeed,
        selectedArticleId,
        sortOrder,
        viewMode,
        focusMode,
        iframeView,
        selectArticle,
        navigateArticle,
        setSortOrder,
        toggleViewMode,
        toggleFocusMode,
        exitFocusMode,
        toggleIframeView,
      }}
    >
      {children}
    </ArticleListContext.Provider>
  )
}

export function useArticleList() {
  const context = useContext(ArticleListContext)
  if (!context) {
    throw new Error('useArticleList must be used within ArticleListProvider')
  }
  return context
}
