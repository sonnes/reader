import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'

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

  const toggleKeyboardHelp = useCallback(() => {
    setShowKeyboardHelp((prev) => !prev)
  }, [])

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
