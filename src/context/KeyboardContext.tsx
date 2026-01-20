import { createContext, useCallback, useContext, useState } from 'react'
import { useArticleList } from './ArticleListContext'
import { useArticleActions } from './ArticleActionsContext'
import { useFeedsContext } from './FeedsContext'
import type { ReactNode } from 'react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

interface KeyboardContextValue {
  showKeyboardHelp: boolean
  toggleKeyboardHelp: () => void
}

const KeyboardContext = createContext<KeyboardContextValue | null>(null)

interface KeyboardProviderProps {
  children: ReactNode
}

export function KeyboardProvider({ children }: KeyboardProviderProps) {
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)

  const {
    selectedArticleId,
    focusMode,
    navigateArticle,
    toggleViewMode,
    toggleFocusMode,
    exitFocusMode,
    toggleIframeView,
  } = useArticleList()
  const { toggleRead, toggleStar, openInBrowser, refresh } = useArticleActions()
  const { toggleSidebar, selectFolder, setFilterMode } = useFeedsContext()

  const toggleKeyboardHelp = useCallback(() => {
    setShowKeyboardHelp((prev) => !prev)
  }, [])

  const goToAllArticles = useCallback(() => {
    selectFolder(null)
    setFilterMode('all')
  }, [selectFolder, setFilterMode])

  useKeyboardShortcuts(
    {
      navigateArticle,
      toggleRead,
      toggleStar,
      openInBrowser,
      refresh,
      toggleSidebar,
      toggleFocusMode,
      exitFocusMode,
      toggleViewMode,
      toggleKeyboardHelp,
      goToAllArticles,
      toggleIframeView,
    },
    {
      selectedArticleId,
      showKeyboardHelp,
      focusMode,
    },
  )

  return (
    <KeyboardContext.Provider value={{ showKeyboardHelp, toggleKeyboardHelp }}>
      {children}
    </KeyboardContext.Provider>
  )
}

export function useKeyboard() {
  const context = useContext(KeyboardContext)
  if (!context) {
    throw new Error('useKeyboard must be used within KeyboardProvider')
  }
  return context
}
