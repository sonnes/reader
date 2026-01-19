/**
 * Data Model Types for Reader RSS Application
 *
 * These interfaces define the core data structures used throughout the application.
 */

/**
 * A container for organizing feeds by topic.
 * Users create folders to group related feeds together.
 */
export interface Folder {
  /** Unique identifier */
  id: string
  /** Display name (e.g., "Tech Blogs", "News") */
  name: string
  /** IDs of feeds in this folder */
  feedIds: Array<string>
  /** Count of unread articles across all feeds in folder */
  unreadCount: number
}

/**
 * An RSS or Atom feed source that the user subscribes to.
 * Represents a single blog, news site, or publication.
 */
export interface Feed {
  /** Unique identifier */
  id: string
  /** Feed title (from RSS/Atom) */
  title: string
  /** URL of the RSS/Atom feed */
  url: string
  /** URL of the website (for linking) */
  siteUrl: string
  /** URL of the site's favicon */
  favicon: string | null
  /** ID of parent folder (null if uncategorized) */
  folderId: string | null
  /** Whether to show articles from this feed in iframe by default */
  preferIframe: boolean
  /** Count of unread articles in this feed */
  unreadCount: number
  /** ISO timestamp of last fetch */
  lastFetched: string
}

/**
 * An individual post or item from a feed.
 * Contains the article content and read status.
 */
export interface Article {
  /** Unique identifier */
  id: string
  /** ID of the source feed */
  feedId: string
  /** Article title */
  title: string
  /** URL to the original article */
  url: string
  /** ISO timestamp of publication */
  publishedAt: string
  /** Short preview text (first ~200 chars) */
  preview: string
  /** Full article content (HTML) */
  content: string
  /** Whether the user has read this article */
  isRead: boolean
  /** Whether the user has starred this article */
  isStarred: boolean
}

/**
 * A reference to an article the user has saved.
 * Enables a "favorites" collection independent of feed organization.
 */
export interface StarredArticle {
  /** Unique identifier */
  id: string
  /** ID of the starred article */
  articleId: string
}

/**
 * UI state for the application.
 * Tracks view preferences and current selection.
 */
export interface UIState {
  /** Whether the sidebar is collapsed */
  sidebarCollapsed: boolean
  /** Whether focus mode is active (hides sidebar and list) */
  focusMode: boolean
  /** Article list view mode */
  viewMode: 'list' | 'card'
  /** Currently selected folder ID (null = all) */
  selectedFolderId: string | null
  /** Currently selected feed ID (null = all in folder) */
  selectedFeedId: string | null
  /** Currently selected article ID */
  selectedArticleId: string | null
}

/**
 * Complete application data structure.
 * Use this for loading/saving state or initializing with sample data.
 */
export interface AppData {
  folders: Array<Folder>
  feeds: Array<Feed>
  articles: Array<Article>
  starredArticles: Array<StarredArticle>
  uiState: UIState
}
