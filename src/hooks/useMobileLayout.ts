import { useState, useEffect } from 'react'

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const

interface MobileLayoutState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

export function useMobileLayout(): MobileLayoutState {
  // Always start with desktop for SSR compatibility
  const [state, setState] = useState<MobileLayoutState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  })

  useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth
      setState({
        isMobile: width < BREAKPOINTS.mobile,
        isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
        isDesktop: width >= BREAKPOINTS.tablet,
      })
    }

    // Initial check
    checkViewport()

    // Listen for resize
    window.addEventListener('resize', checkViewport)
    return () => window.removeEventListener('resize', checkViewport)
  }, [])

  return state
}
