import { useAppState } from '~/context'
import { useMobileLayout } from '~/hooks/useMobileLayout'

interface ThreePanelLayoutProps {
  left?: React.ReactNode
  middle?: React.ReactNode
  right?: React.ReactNode
}

export function ThreePanelLayout({
  left,
  middle,
  right,
}: ThreePanelLayoutProps) {
  const { sidebarCollapsed, setSidebarCollapsed, mobileReadingPaneOpen } = useAppState()
  const { isMobile, isTablet } = useMobileLayout()

  const showSidebarOverlay = (isMobile || isTablet) && !sidebarCollapsed

  return (
    <div className="h-full flex relative">
      {/* Backdrop for mobile sidebar */}
      {showSidebarOverlay && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Left panel - Sidebar */}
      <div
        className={`
          shrink-0 z-40 bg-white dark:bg-slate-900
          transition-transform duration-300 ease-in-out
          ${isMobile || isTablet
            ? `fixed inset-y-0 left-0 w-72 ${sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'}`
            : 'w-56 relative translate-x-0'
          }
        `}
      >
        {left}
      </div>

      {/* Middle panel - Article list */}
      <div
        className={`
          shrink-0 border-r border-slate-200 dark:border-slate-700
          ${isMobile ? 'flex-1 w-full' : 'w-80'}
        `}
      >
        {middle}
      </div>

      {/* Right panel - Reading pane */}
      <div
        className={`
          flex-1 min-w-0
          ${isMobile
            ? `fixed inset-0 z-50 bg-white dark:bg-slate-900 transition-transform duration-300 ease-in-out ${mobileReadingPaneOpen ? 'translate-x-0' : 'translate-x-full'}`
            : ''
          }
        `}
      >
        {right}
      </div>
    </div>
  )
}
