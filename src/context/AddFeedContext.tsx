import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface AddFeedContextValue {
  isOpen: boolean
  initialUrl: string
  openAddFeed: (url?: string) => void
  closeAddFeed: () => void
}

const AddFeedContext = createContext<AddFeedContextValue | null>(null)

export function AddFeedProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [initialUrl, setInitialUrl] = useState('')

  const openAddFeed = useCallback((url?: string) => {
    setInitialUrl(url ?? '')
    setIsOpen(true)
  }, [])

  const closeAddFeed = useCallback(() => {
    setIsOpen(false)
    setInitialUrl('')
  }, [])

  return (
    <AddFeedContext.Provider value={{ isOpen, initialUrl, openAddFeed, closeAddFeed }}>
      {children}
    </AddFeedContext.Provider>
  )
}

export function useAddFeed() {
  const context = useContext(AddFeedContext)
  if (!context) {
    throw new Error('useAddFeed must be used within AddFeedProvider')
  }
  return context
}
