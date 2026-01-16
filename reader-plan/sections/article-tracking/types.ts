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

// =============================================================================
// Component Props
// =============================================================================

export interface ArticleTrackingProps {
  /** The list of articles to display */
  articles: Article[]
  /** Folders for organizing feeds */
  folders: Folder[]
  /** All subscribed feeds */
  feeds: Feed[]
  /** Currently selected folder ID (null = All Articles, 'starred' = Starred) */
  selectedFolderId: string | null
  /** Currently selected feed ID (when drilling into a specific feed) */
  selectedFeedId: string | null
  /** Currently selected article ID for the reading pane */
  selectedArticleId?: string | null
  /** Called when user selects a folder */
  onSelectFolder?: (folderId: string | null) => void
  /** Called when user selects a feed */
  onSelectFeed?: (feedId: string) => void
  /** Called when user selects an article to view in the reading pane */
  onSelectArticle?: (id: string) => void
  /** Called when user wants to open an article in a new tab */
  onOpenInNewTab?: (id: string) => void
  /** Called when user toggles the read/unread status */
  onToggleRead?: (id: string) => void
  /** Called when user toggles the starred status */
  onToggleStar?: (id: string) => void
  /** Called when user deletes an article */
  onDelete?: (id: string) => void
}
