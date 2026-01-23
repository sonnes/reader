import { useEffect } from 'react'

interface UsePasteUrlDetectionOptions {
  onUrlPasted: (url: string) => void
}

function isValidUrl(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false
  }
  try {
    new URL(trimmed)
    return true
  } catch {
    return false
  }
}

function isInputElement(element: EventTarget | null): boolean {
  if (!element || !(element instanceof HTMLElement)) return false

  const tagName = element.tagName
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    element.isContentEditable
  )
}

export function usePasteUrlDetection({ onUrlPasted }: UsePasteUrlDetectionOptions) {
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      console.log('[paste] event fired')

      // Don't intercept pastes in input fields
      if (isInputElement(e.target)) {
        console.log('[paste] ignoring - input element')
        return
      }

      const text = e.clipboardData?.getData('text')
      console.log('[paste] clipboard text:', text)
      if (!text) return

      if (isValidUrl(text)) {
        console.log('[paste] valid URL, calling onUrlPasted')
        e.preventDefault()
        onUrlPasted(text.trim())
      }
    }

    // Use capture phase to catch the event early
    document.addEventListener('paste', handlePaste, true)
    return () => document.removeEventListener('paste', handlePaste, true)
  }, [onUrlPasted])
}
