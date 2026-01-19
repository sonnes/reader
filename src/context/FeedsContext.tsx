import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { Feed, Folder } from '@/types'

type FilterMode = 'all' | 'unread' | 'starred'

interface FeedsContextValue {
  folders: Array<Folder>
  feeds: Array<Feed>
  selectedFolderId: string | null
  selectedFeedId: string | null
  filterMode: FilterMode
  sidebarCollapsed: boolean
  selectFolder: (folderId: string | null) => void
  selectFeed: (feedId: string) => void
  setFilterMode: (mode: FilterMode) => void
  toggleSidebar: () => void
}

export const FeedsContext = createContext<FeedsContextValue | null>(null)

interface FeedsProviderProps {
  children: ReactNode
  folders: Array<Folder>
  feeds: Array<Feed>
  initialFolderId?: string | null
  initialFeedId?: string | null
  initialSidebarCollapsed?: boolean
}

export function FeedsProvider({
  children,
  folders,
  feeds,
  initialFolderId = null,
  initialFeedId = null,
  initialSidebarCollapsed = false,
}: FeedsProviderProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    initialFolderId,
  )
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(
    initialFeedId,
  )
  const [filterMode, setFilterModeState] = useState<FilterMode>('all')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    initialSidebarCollapsed,
  )

  const selectFolder = useCallback(
    (folderId: string | null) => {
      if (folderId === 'starred') {
        setFilterModeState('starred')
        setSelectedFolderId('starred')
        setSelectedFeedId(null)
      } else {
        setSelectedFolderId(folderId)
        setSelectedFeedId(null)
        if (filterMode === 'starred') {
          setFilterModeState('all')
        }
      }
    },
    [filterMode],
  )

  const selectFeed = useCallback(
    (feedId: string) => {
      setSelectedFeedId(feedId)
      setSelectedFolderId(null)
      if (filterMode === 'starred') {
        setFilterModeState('all')
      }
    },
    [filterMode],
  )

  const setFilterMode = useCallback((mode: FilterMode) => {
    setFilterModeState(mode)
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])

  return (
    <FeedsContext.Provider
      value={{
        folders,
        feeds,
        selectedFolderId,
        selectedFeedId,
        filterMode,
        sidebarCollapsed,
        selectFolder,
        selectFeed,
        setFilterMode,
        toggleSidebar,
      }}
    >
      {children}
    </FeedsContext.Provider>
  )
}

export function useFeedsContext() {
  const context = useContext(FeedsContext)
  if (!context) {
    throw new Error('useFeedsContext must be used within FeedsProvider')
  }
  return context
}
