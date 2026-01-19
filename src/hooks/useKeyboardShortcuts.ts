import { useEffect, useRef } from 'react'

interface KeyboardActions {
  navigateArticle: (direction: 'next' | 'prev') => void
  toggleRead: (articleId: string) => void
  toggleStar: (articleId: string) => void
  openInBrowser: (articleId: string) => void
  refresh: () => void
  toggleSidebar: () => void
  toggleFocusMode: () => void
  exitFocusMode: () => void
  toggleViewMode: () => void
  toggleKeyboardHelp: () => void
  goToAllArticles: () => void
}

interface KeyboardState {
  selectedArticleId: string | null
  showKeyboardHelp: boolean
  focusMode: boolean
}

export function useKeyboardShortcuts(
  actions: KeyboardActions,
  state: KeyboardState,
) {
  const pendingKeyRef = useRef<string | null>(null)

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
        if (state.showKeyboardHelp) {
          actions.toggleKeyboardHelp()
          e.preventDefault()
          return
        }
        if (state.focusMode) {
          actions.exitFocusMode()
          e.preventDefault()
          return
        }
      }

      // Handle g+key combinations
      if (pendingKeyRef.current === 'g') {
        pendingKeyRef.current = null
        if (key === 'f' || key === 'a') {
          actions.goToAllArticles()
          e.preventDefault()
          return
        }
        return
      }

      // Set pending key for g
      if (key === 'g') {
        pendingKeyRef.current = 'g'
        setTimeout(() => {
          pendingKeyRef.current = null
        }, 500)
        e.preventDefault()
        return
      }

      // Single key shortcuts
      switch (key) {
        case 'j':
          actions.navigateArticle('next')
          e.preventDefault()
          break
        case 'k':
          actions.navigateArticle('prev')
          e.preventDefault()
          break
        case 'o':
          if (state.selectedArticleId) {
            actions.openInBrowser(state.selectedArticleId)
            e.preventDefault()
          }
          break
        case 'm':
          if (state.selectedArticleId) {
            actions.toggleRead(state.selectedArticleId)
            e.preventDefault()
          }
          break
        case 's':
          if (state.selectedArticleId) {
            actions.toggleStar(state.selectedArticleId)
            e.preventDefault()
          }
          break
        case 'r':
          actions.refresh()
          e.preventDefault()
          break
        case '[':
          actions.toggleSidebar()
          e.preventDefault()
          break
        case 'f':
          actions.toggleFocusMode()
          e.preventDefault()
          break
        case 'v':
          actions.toggleViewMode()
          e.preventDefault()
          break
        case '?':
          actions.toggleKeyboardHelp()
          e.preventDefault()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [actions, state])
}
