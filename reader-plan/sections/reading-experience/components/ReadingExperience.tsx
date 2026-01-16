import { useState } from 'react'
import { FolderSidebar } from './FolderSidebar'
import { ArticleList } from './ArticleList'
import { ReadingPane } from './ReadingPane'
import { KeyboardHelp } from './KeyboardHelp'
import type { ReadingExperienceProps } from '../types'

export function ReadingExperience({
  folders,
  feeds,
  articles,
  uiState,
  onSelectFolder,
  onSelectFeed,
  onSelectArticle,
  onToggleRead,
  onToggleStar,
  onOpenInBrowser,
  onToggleSidebar,
  onToggleFocusMode,
  onToggleViewMode,
  onToggleReaderView,
  onRefresh,
}: ReadingExperienceProps) {
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)

  // Get the selected article
  const selectedArticle =
    articles.find((a) => a.id === uiState.selectedArticleId) || null
  const selectedFeed = selectedArticle
    ? feeds.find((f) => f.id === selectedArticle.feedId)
    : undefined

  // Filter articles based on selection
  const filteredArticles = uiState.selectedFeedId
    ? articles.filter((a) => a.feedId === uiState.selectedFeedId)
    : uiState.selectedFolderId
      ? articles.filter((a) => {
          const feed = feeds.find((f) => f.id === a.feedId)
          return feed?.folderId === uiState.selectedFolderId
        })
      : articles

  // Focus mode - only show reading pane
  if (uiState.focusMode) {
    return (
      <div className="h-full">
        <ReadingPane
          article={selectedArticle}
          feed={selectedFeed}
          readerView={uiState.readerView}
          focusMode={true}
          onToggleReaderView={onToggleReaderView}
          onToggleRead={() =>
            selectedArticle && onToggleRead?.(selectedArticle.id)
          }
          onToggleStar={() =>
            selectedArticle && onToggleStar?.(selectedArticle.id)
          }
          onOpenInBrowser={() =>
            selectedArticle && onOpenInBrowser?.(selectedArticle.id)
          }
          onExitFocusMode={onToggleFocusMode}
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
      {!uiState.sidebarCollapsed && (
        <div className="w-56 flex-shrink-0">
          <FolderSidebar
            folders={folders}
            feeds={feeds}
            selectedFolderId={uiState.selectedFolderId}
            selectedFeedId={uiState.selectedFeedId}
            onSelectFolder={onSelectFolder}
            onSelectFeed={onSelectFeed}
            onCollapse={onToggleSidebar}
          />
        </div>
      )}

      {/* Collapsed sidebar toggle */}
      {uiState.sidebarCollapsed && (
        <button
          onClick={onToggleSidebar}
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
          selectedArticleId={uiState.selectedArticleId}
          viewMode={uiState.viewMode}
          onSelectArticle={onSelectArticle}
          onToggleStar={onToggleStar}
          onToggleViewMode={onToggleViewMode}
          onRefresh={onRefresh}
        />
      </div>

      {/* Reading Pane */}
      <div className="flex-1 min-w-0">
        <ReadingPane
          article={selectedArticle}
          feed={selectedFeed}
          readerView={uiState.readerView}
          onToggleReaderView={onToggleReaderView}
          onToggleRead={() =>
            selectedArticle && onToggleRead?.(selectedArticle.id)
          }
          onToggleStar={() =>
            selectedArticle && onToggleStar?.(selectedArticle.id)
          }
          onOpenInBrowser={() =>
            selectedArticle && onOpenInBrowser?.(selectedArticle.id)
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
