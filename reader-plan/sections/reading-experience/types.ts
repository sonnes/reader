// =============================================================================
// Data Types
// =============================================================================

export interface Folder {
  id: string
  name: string
  feedIds: string[]
  unreadCount: number
}

export interface Feed {
  id: string
  title: string
  url: string
  siteUrl: string
  favicon: string
  folderId: string | null
  unreadCount: number
  lastFetched: string
}

export interface Article {
  id: string
  feedId: string
  title: string
  url: string
  publishedAt: string
  preview: string
  content: string
  isRead: boolean
  isStarred: boolean
}

export interface StarredArticle {
  id: string
  articleId: string
}

export type ViewMode = 'list' | 'card'

export interface UIState {
  sidebarCollapsed: boolean
  focusMode: boolean
  viewMode: ViewMode
  readerView: boolean
  selectedFolderId: string | null
  selectedFeedId: string | null
  selectedArticleId: string | null
}

// =============================================================================
// Component Props
// =============================================================================

export interface ReadingExperienceProps {
  /** Folders for organizing feeds */
  folders: Folder[]
  /** All subscribed feeds (some may have folderId: null) */
  feeds: Feed[]
  /** Articles from the currently selected feed/folder */
  articles: Article[]
  /** List of starred article references */
  starredArticles: StarredArticle[]
  /** Current UI state */
  uiState: UIState

  // Navigation callbacks
  /** Called when user selects a folder */
  onSelectFolder?: (folderId: string | null) => void
  /** Called when user selects a feed */
  onSelectFeed?: (feedId: string) => void
  /** Called when user selects an article */
  onSelectArticle?: (articleId: string) => void

  // Article actions
  /** Called when user toggles read status (keyboard: m) */
  onToggleRead?: (articleId: string) => void
  /** Called when user toggles starred status (keyboard: s) */
  onToggleStar?: (articleId: string) => void
  /** Called when user opens article in browser (keyboard: o) */
  onOpenInBrowser?: (articleId: string) => void

  // UI actions
  /** Called when user toggles sidebar visibility */
  onToggleSidebar?: () => void
  /** Called when user toggles focus mode */
  onToggleFocusMode?: () => void
  /** Called when user switches between list/card view */
  onToggleViewMode?: () => void
  /** Called when user toggles reader view vs original formatting */
  onToggleReaderView?: () => void
  /** Called when user requests feed refresh (keyboard: r) */
  onRefresh?: () => void
}
