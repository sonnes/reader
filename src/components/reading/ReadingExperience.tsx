import { useCallback, useEffect, useRef, useState } from 'react'
import { FolderSidebar } from './FolderSidebar'
import { ArticleList } from './ArticleList'
import { ReadingPane } from './ReadingPane'
import { KeyboardHelp } from './KeyboardHelp'
import type { Article, Feed, Folder, UIState } from '@/types'

type ViewMode = 'list' | 'card'
type FilterMode = 'all' | 'unread' | 'starred'

interface ReadingExperienceProps {
  folders: Array<Folder>
  feeds: Array<Feed>
  articles: Array<Article>
  initialUIState?: Partial<UIState>
  stats?: {
    totalArticles: number
    unreadCount: number
    starredCount: number
  }
  onToggleRead?: (articleId: string, isRead: boolean) => void
  onToggleStar?: (articleId: string, isStarred: boolean) => void
  onRefresh?: () => void
}

export function ReadingExperience({
  folders,
  feeds,
  articles,
  initialUIState,
  stats,
  onToggleRead,
  onToggleStar,
  onRefresh,
}: ReadingExperienceProps) {
  // UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    initialUIState?.sidebarCollapsed ?? false,
  )
  const [focusMode, setFocusMode] = useState(initialUIState?.focusMode ?? false)
  const [viewMode, setViewMode] = useState<ViewMode>(
    initialUIState?.viewMode ?? 'list',
  )
  const [readerView, setReaderView] = useState(
    initialUIState?.readerView ?? true,
  )
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    initialUIState?.selectedFolderId ?? null,
  )
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(
    initialUIState?.selectedFeedId ?? null,
  )
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    initialUIState?.selectedArticleId ?? null,
  )
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)

  // For g+key shortcuts
  const pendingKeyRef = useRef<string | null>(null)

  // Filter articles based on selection
  const filteredArticles = (() => {
    let result = articles

    // Filter by starred
    if (selectedFolderId === 'starred' || filterMode === 'starred') {
      return result.filter((a) => a.isStarred)
    }

    // Filter by unread
    if (filterMode === 'unread') {
      result = result.filter((a) => !a.isRead)
    }

    // Filter by feed
    if (selectedFeedId) {
      return result.filter((a) => a.feedId === selectedFeedId)
    }

    // Filter by folder
    if (selectedFolderId && selectedFolderId !== 'starred') {
      const folderFeedIds = feeds
        .filter((f) => f.folderId === selectedFolderId)
        .map((f) => f.id)
      return result.filter((a) => folderFeedIds.includes(a.feedId))
    }

    return result
  })()

  // Get the selected article
  const selectedArticle =
    articles.find((a) => a.id === selectedArticleId) || null
  const selectedFeed = selectedArticle
    ? feeds.find((f) => f.id === selectedArticle.feedId)
    : undefined

  // Find article index
  const getArticleIndex = useCallback(() => {
    return filteredArticles.findIndex((a) => a.id === selectedArticleId)
  }, [filteredArticles, selectedArticleId])

  // Select article and mark as read
  const handleSelectArticle = useCallback(
    (articleId: string) => {
      setSelectedArticleId(articleId)
      const article = articles.find((a) => a.id === articleId)
      if (article && !article.isRead) {
        onToggleRead?.(articleId, true)
      }
    },
    [articles, onToggleRead],
  )

  // Navigate to next/previous article
  const navigateArticle = useCallback(
    (direction: 'next' | 'prev') => {
      if (filteredArticles.length === 0) return

      const currentIndex = getArticleIndex()
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
        handleSelectArticle(newArticle.id)
      }
    },
    [filteredArticles, getArticleIndex, handleSelectArticle],
  )

  // Toggle read status
  const handleToggleRead = useCallback(
    (articleId: string) => {
      const article = articles.find((a) => a.id === articleId)
      if (article) {
        onToggleRead?.(articleId, !article.isRead)
      }
    },
    [articles, onToggleRead],
  )

  // Toggle star status
  const handleToggleStar = useCallback(
    (articleId: string) => {
      const article = articles.find((a) => a.id === articleId)
      if (article) {
        onToggleStar?.(articleId, !article.isStarred)
      }
    },
    [articles, onToggleStar],
  )

  // Open in browser
  const handleOpenInBrowser = useCallback(
    (articleId: string) => {
      const article = articles.find((a) => a.id === articleId)
      if (article) {
        window.open(article.url, '_blank', 'noopener,noreferrer')
      }
    },
    [articles],
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      const key = e.key.toLowerCase()

      // Handle escape
      if (key === 'escape') {
        if (showKeyboardHelp) {
          setShowKeyboardHelp(false)
          e.preventDefault()
          return
        }
        if (focusMode) {
          setFocusMode(false)
          e.preventDefault()
          return
        }
      }

      // Handle g+key combinations
      if (pendingKeyRef.current === 'g') {
        pendingKeyRef.current = null
        if (key === 'f') {
          // Go to feeds view - clear selection
          setSelectedFolderId(null)
          setSelectedFeedId(null)
          setFilterMode('all')
          e.preventDefault()
          return
        }
        if (key === 'a') {
          // Go to all articles
          setSelectedFolderId(null)
          setSelectedFeedId(null)
          setFilterMode('all')
          e.preventDefault()
          return
        }
        return
      }

      // Set pending key for g
      if (key === 'g') {
        pendingKeyRef.current = 'g'
        // Clear after a short timeout
        setTimeout(() => {
          pendingKeyRef.current = null
        }, 500)
        e.preventDefault()
        return
      }

      // Single key shortcuts
      switch (key) {
        case 'j':
          navigateArticle('next')
          e.preventDefault()
          break
        case 'k':
          navigateArticle('prev')
          e.preventDefault()
          break
        case 'o':
          if (selectedArticleId) {
            handleOpenInBrowser(selectedArticleId)
            e.preventDefault()
          }
          break
        case 'm':
          if (selectedArticleId) {
            handleToggleRead(selectedArticleId)
            e.preventDefault()
          }
          break
        case 's':
          if (selectedArticleId) {
            handleToggleStar(selectedArticleId)
            e.preventDefault()
          }
          break
        case 'r':
          onRefresh?.()
          e.preventDefault()
          break
        case '[':
          setSidebarCollapsed((prev) => !prev)
          e.preventDefault()
          break
        case 'f':
          setFocusMode((prev) => !prev)
          e.preventDefault()
          break
        case 'v':
          setViewMode((prev) => (prev === 'list' ? 'card' : 'list'))
          e.preventDefault()
          break
        case '?':
          setShowKeyboardHelp((prev) => !prev)
          e.preventDefault()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    selectedArticleId,
    showKeyboardHelp,
    focusMode,
    navigateArticle,
    handleToggleRead,
    handleToggleStar,
    handleOpenInBrowser,
    onRefresh,
  ])

  // Handle folder selection
  const handleSelectFolder = useCallback(
    (folderId: string | null) => {
      if (folderId === 'starred') {
        setFilterMode('starred')
        setSelectedFolderId('starred')
        setSelectedFeedId(null)
      } else {
        setSelectedFolderId(folderId)
        setSelectedFeedId(null)
        if (filterMode === 'starred') {
          setFilterMode('all')
        }
      }
    },
    [filterMode],
  )

  // Handle feed selection
  const handleSelectFeed = useCallback(
    (feedId: string) => {
      setSelectedFeedId(feedId)
      setSelectedFolderId(null)
      if (filterMode === 'starred') {
        setFilterMode('all')
      }
    },
    [filterMode],
  )

  // Focus mode - only show reading pane
  if (focusMode) {
    return (
      <div className="h-full">
        <ReadingPane
          article={selectedArticle}
          feed={selectedFeed}
          readerView={readerView}
          focusMode={true}
          onToggleReaderView={() => setReaderView((prev) => !prev)}
          onToggleRead={() =>
            selectedArticle && handleToggleRead(selectedArticle.id)
          }
          onToggleStar={() =>
            selectedArticle && handleToggleStar(selectedArticle.id)
          }
          onOpenInBrowser={() =>
            selectedArticle && handleOpenInBrowser(selectedArticle.id)
          }
          onExitFocusMode={() => setFocusMode(false)}
        />
        {showKeyboardHelp && (
          <KeyboardHelp onClose={() => setShowKeyboardHelp(false)} />
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* Folder Sidebar */}
      {!sidebarCollapsed && (
        <div className="w-56 flex-shrink-0">
          <FolderSidebar
            folders={folders}
            feeds={feeds}
            selectedFolderId={selectedFolderId}
            selectedFeedId={selectedFeedId}
            filterMode={filterMode}
            totalArticleCount={stats?.totalArticles}
            unreadCount={stats?.unreadCount}
            starredCount={stats?.starredCount}
            onSelectFolder={handleSelectFolder}
            onSelectFeed={handleSelectFeed}
            onFilterChange={setFilterMode}
            onCollapse={() => setSidebarCollapsed(true)}
          />
        </div>
      )}

      {/* Collapsed sidebar toggle */}
      {sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="w-10 flex-shrink-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Expand sidebar"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Article List */}
      <div className="w-80 flex-shrink-0">
        <ArticleList
          articles={filteredArticles}
          feeds={feeds}
          selectedArticleId={selectedArticleId}
          viewMode={viewMode}
          onSelectArticle={handleSelectArticle}
          onToggleStar={handleToggleStar}
          onToggleViewMode={() =>
            setViewMode((prev) => (prev === 'list' ? 'card' : 'list'))
          }
          onRefresh={onRefresh}
        />
      </div>

      {/* Reading Pane */}
      <div className="flex-1 min-w-0">
        <ReadingPane
          article={selectedArticle}
          feed={selectedFeed}
          readerView={readerView}
          onToggleReaderView={() => setReaderView((prev) => !prev)}
          onToggleRead={() =>
            selectedArticle && handleToggleRead(selectedArticle.id)
          }
          onToggleStar={() =>
            selectedArticle && handleToggleStar(selectedArticle.id)
          }
          onOpenInBrowser={() =>
            selectedArticle && handleOpenInBrowser(selectedArticle.id)
          }
        />
      </div>

      {/* Keyboard Help Modal */}
      {showKeyboardHelp && (
        <KeyboardHelp onClose={() => setShowKeyboardHelp(false)} />
      )}
    </div>
  )
}
