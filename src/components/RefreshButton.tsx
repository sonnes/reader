import { useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { refreshScheduler } from '~/lib/refresh-scheduler'

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = useCallback(async () => {
    if (isRefreshing || refreshScheduler.isRefreshInProgress()) return

    setIsRefreshing(true)
    try {
      await refreshScheduler.refreshAll()
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing])

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors disabled:opacity-50"
      title="Refresh all feeds"
    >
      <RefreshCw
        className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
      />
      <span className="hidden sm:inline">
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </span>
    </button>
  )
}
