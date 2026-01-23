import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from 'react'
import type { ReactNode } from 'react'
import { useLiveQuery, eq } from '@tanstack/react-db'
import {
  articlesCollection,
  feedsCollection,
  timestamp,
  type Article,
  type Feed,
} from '~/db'

interface ArticleListContextValue {
  selectedArticle: Article | undefined
  selectedFeed: Feed | undefined
  selectedArticleId: string | null
  iframeView: boolean
  selectArticle: (articleId: string) => void
  clearSelection: () => void
  toggleIframeView: () => void
}

const ArticleListContext = createContext<ArticleListContextValue | null>(null)

interface ArticleListProviderProps {
  children: ReactNode
}

// Inner provider that uses hooks - only rendered on client
function ArticleListProviderInner({ children }: ArticleListProviderProps) {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)
  const [iframeView, setIframeView] = useState(false)

  // Fetch selected article
  const { data: selectedArticle } = useLiveQuery(
    (q) => {
      if (!selectedArticleId) return undefined
      return q
        .from({ article: articlesCollection })
        .where(({ article }) => eq(article.id, selectedArticleId))
        .findOne()
    },
    [selectedArticleId]
  )

  // Fetch feed for selected article
  const { data: selectedFeed } = useLiveQuery(
    (q) => {
      if (!selectedArticle?.feedId) return undefined
      return q
        .from({ feed: feedsCollection })
        .where(({ feed }) => eq(feed.id, selectedArticle.feedId))
        .findOne()
    },
    [selectedArticle?.feedId]
  )

  const selectArticle = useCallback(
    (articleId: string) => {
      setSelectedArticleId(articleId)

      // Mark as read if unread
      const article = articlesCollection.state.get(articleId)
      if (article && !article.isRead) {
        articlesCollection.update(articleId, (draft) => {
          draft.isRead = true
          draft.updatedAt = timestamp()
        })
      }

      // Set iframe view based on feed preference
      if (article) {
        const feed = feedsCollection.state.get(article.feedId)
        setIframeView(feed?.preferIframe ?? false)
      }
    },
    []
  )

  const clearSelection = useCallback(() => {
    setSelectedArticleId(null)
  }, [])

  const toggleIframeView = useCallback(() => {
    setIframeView((prev) => {
      const newValue = !prev
      // Persist to feed's preference
      if (selectedArticle) {
        feedsCollection.update(selectedArticle.feedId, (draft) => {
          draft.preferIframe = newValue
          draft.updatedAt = timestamp()
        })
      }
      return newValue
    })
  }, [selectedArticle])

  return (
    <ArticleListContext.Provider
      value={{
        selectedArticle,
        selectedFeed,
        selectedArticleId,
        iframeView,
        selectArticle,
        clearSelection,
        toggleIframeView,
      }}
    >
      {children}
    </ArticleListContext.Provider>
  )
}

// SSR-safe wrapper - only renders provider on client
export function ArticleListProvider({ children }: ArticleListProviderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // On server or before hydration, render children without context
  if (!mounted) {
    return <>{children}</>
  }

  return <ArticleListProviderInner>{children}</ArticleListProviderInner>
}

// Default value for SSR/pre-hydration
const defaultContextValue: ArticleListContextValue = {
  selectedArticle: undefined,
  selectedFeed: undefined,
  selectedArticleId: null,
  iframeView: false,
  selectArticle: () => {},
  clearSelection: () => {},
  toggleIframeView: () => {},
}

export function useArticleList() {
  const context = useContext(ArticleListContext)
  // Return default value during SSR/pre-hydration
  if (!context) {
    return defaultContextValue
  }
  return context
}
