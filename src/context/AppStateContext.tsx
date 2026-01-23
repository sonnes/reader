import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'

type ViewMode = 'list' | 'card'

interface AppStateContextValue {
  focusMode: boolean
  viewMode: ViewMode
  sidebarCollapsed: boolean
  mobileReadingPaneOpen: boolean
  toggleFocusMode: () => void
  exitFocusMode: () => void
  toggleViewMode: () => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setMobileReadingPaneOpen: (open: boolean) => void
}

const AppStateContext = createContext<AppStateContextValue | null>(null)

interface AppStateProviderProps {
  children: ReactNode
}

export function AppStateProvider({ children }: AppStateProviderProps) {
  const [focusMode, setFocusMode] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileReadingPaneOpen, setMobileReadingPaneOpen] = useState(false)

  const toggleFocusMode = useCallback(() => {
    setFocusMode((prev) => !prev)
  }, [])

  const exitFocusMode = useCallback(() => {
    setFocusMode(false)
  }, [])

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === 'list' ? 'card' : 'list'))
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])

  const handleSetSidebarCollapsed = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed)
  }, [])

  const handleSetMobileReadingPaneOpen = useCallback((open: boolean) => {
    setMobileReadingPaneOpen(open)
  }, [])

  return (
    <AppStateContext.Provider
      value={{
        focusMode,
        viewMode,
        sidebarCollapsed,
        mobileReadingPaneOpen,
        toggleFocusMode,
        exitFocusMode,
        toggleViewMode,
        toggleSidebar,
        setSidebarCollapsed: handleSetSidebarCollapsed,
        setMobileReadingPaneOpen: handleSetMobileReadingPaneOpen,
      }}
    >
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider')
  }
  return context
}
