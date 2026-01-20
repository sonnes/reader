import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { Feed, Folder } from '@/types'

interface ImportStatus {
  loading: boolean
  message?: string
  error?: boolean
}

interface FeedActionsContextValue {
  folders: Array<Folder>
  feeds: Array<Feed>
  showAddFeedModal: boolean
  setShowAddFeedModal: (show: boolean) => void
  importStatus: ImportStatus
  refreshingFeeds: Set<string>
  addFeed: (
    url: string,
    folderId?: string,
  ) => Promise<{ success: boolean; error?: string }>
  removeFeed: (feedId: string) => Promise<void>
  moveFeed: (feedId: string, folderId: string | null) => Promise<void>
  refreshFeed: (feedId: string) => Promise<void>
  importOPML: (
    file: File,
  ) => Promise<{ success: boolean; imported?: number; error?: string }>
  exportOPML: () => Promise<void>
}

const FeedActionsContext = createContext<FeedActionsContextValue | null>(null)

interface FeedActionsProviderProps {
  children: ReactNode
  folders: Array<Folder>
  feeds: Array<Feed>
  onAddFeed?: (
    url: string,
    folderId?: string,
  ) => Promise<{ success: boolean; error?: string }>
  onRemoveFeed?: (feedId: string) => Promise<void>
  onMoveFeed?: (feedId: string, folderId: string | null) => Promise<void>
  onRefreshFeed?: (feedId: string) => Promise<Feed | null>
  onImportOPML?: (
    file: File,
  ) => Promise<{ success: boolean; imported?: number; error?: string }>
  onExportOPML?: () => Promise<void>
}

export function FeedActionsProvider({
  children,
  folders,
  feeds,
  onAddFeed,
  onRemoveFeed,
  onMoveFeed,
  onRefreshFeed,
  onImportOPML,
  onExportOPML,
}: FeedActionsProviderProps) {
  const [showAddFeedModal, setShowAddFeedModal] = useState(false)
  const [importStatus, setImportStatus] = useState<ImportStatus>({
    loading: false,
  })
  const [refreshingFeeds, setRefreshingFeeds] = useState<Set<string>>(
    new Set(),
  )

  const addFeed = useCallback(
    async (url: string, folderId?: string) => {
      if (!onAddFeed) return { success: false, error: 'Not implemented' }
      return onAddFeed(url, folderId)
    },
    [onAddFeed],
  )

  const removeFeed = useCallback(
    async (feedId: string) => {
      await onRemoveFeed?.(feedId)
    },
    [onRemoveFeed],
  )

  const moveFeed = useCallback(
    async (feedId: string, folderId: string | null) => {
      await onMoveFeed?.(feedId, folderId)
    },
    [onMoveFeed],
  )

  const refreshFeed = useCallback(
    async (feedId: string) => {
      if (!onRefreshFeed) return

      setRefreshingFeeds((prev) => new Set(prev).add(feedId))
      try {
        await onRefreshFeed(feedId)
      } finally {
        setRefreshingFeeds((prev) => {
          const next = new Set(prev)
          next.delete(feedId)
          return next
        })
      }
    },
    [onRefreshFeed],
  )

  const importOPML = useCallback(
    async (file: File) => {
      if (!onImportOPML) return { success: false, error: 'Not implemented' }

      setImportStatus({ loading: true })
      const result = await onImportOPML(file)

      if (result.success) {
        setImportStatus({
          loading: false,
          message: `Imported ${result.imported} feeds`,
        })
        setTimeout(() => setImportStatus({ loading: false }), 3000)
      } else {
        setImportStatus({
          loading: false,
          message: result.error || 'Import failed',
          error: true,
        })
        setTimeout(() => setImportStatus({ loading: false }), 5000)
      }

      return result
    },
    [onImportOPML],
  )

  const exportOPML = useCallback(async () => {
    await onExportOPML?.()
  }, [onExportOPML])

  return (
    <FeedActionsContext.Provider
      value={{
        folders,
        feeds,
        showAddFeedModal,
        setShowAddFeedModal,
        importStatus,
        refreshingFeeds,
        addFeed,
        removeFeed,
        moveFeed,
        refreshFeed,
        importOPML,
        exportOPML,
      }}
    >
      {children}
    </FeedActionsContext.Provider>
  )
}

export function useFeedActions() {
  const context = useContext(FeedActionsContext)
  if (!context) {
    throw new Error('useFeedActions must be used within FeedActionsProvider')
  }
  return context
}
