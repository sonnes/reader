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

// =============================================================================
// Component Props
// =============================================================================

export interface FeedManagementProps {
  /** Folders for organizing feeds */
  folders: Folder[]
  /** All subscribed feeds (some may have folderId: null) */
  feeds: Feed[]

  // Folder actions
  /** Called when user creates a new folder */
  onCreateFolder?: (name: string) => void
  /** Called when user renames a folder */
  onRenameFolder?: (folderId: string, newName: string) => void
  /** Called when user deletes a folder */
  onDeleteFolder?: (folderId: string) => void

  // Feed actions
  /** Called when user adds a new feed subscription */
  onAddFeed?: (url: string, folderId?: string) => void
  /** Called when user removes a feed subscription */
  onRemoveFeed?: (feedId: string) => void
  /** Called when user moves a feed to a different folder */
  onMoveFeed?: (feedId: string, folderId: string | null) => void

  // Import/Export actions
  /** Called when user imports feeds from OPML file */
  onImportOPML?: (file: File) => void
  /** Called when user exports feeds to OPML file */
  onExportOPML?: () => void
}
