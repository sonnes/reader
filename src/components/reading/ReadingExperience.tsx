import { FolderSidebar } from './FolderSidebar'
import { ArticleList } from './ArticleList'
import { ReadingPane } from './ReadingPane'
import { KeyboardHelp } from './KeyboardHelp'
import { AddFeedModal } from '@/components/feeds/AddFeedModal'
import { CreateFolderModal } from '@/components/feeds/CreateFolderModal'
import { useArticleList, useFeedsContext, useKeyboard } from '@/context'

interface ReadingExperienceProps {
  stats?: {
    totalArticles: number
    unreadCount: number
    starredCount: number
  }
}

export function ReadingExperience({ stats }: ReadingExperienceProps) {
  const { focusMode } = useArticleList()
  const { sidebarCollapsed, toggleSidebar } = useFeedsContext()
  const { showKeyboardHelp, toggleKeyboardHelp } = useKeyboard()

  if (focusMode) {
    return (
      <div className="h-full">
        <ReadingPane />
        {showKeyboardHelp && <KeyboardHelp onClose={toggleKeyboardHelp} />}
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {!sidebarCollapsed && (
        <div className="w-56 flex-shrink-0">
          <FolderSidebar stats={stats} />
        </div>
      )}

      {sidebarCollapsed && (
        <button
          onClick={toggleSidebar}
          className="w-10 flex-shrink-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Expand sidebar"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      <div className="w-80 flex-shrink-0">
        <ArticleList />
      </div>

      <div className="flex-1 min-w-0">
        <ReadingPane />
      </div>

      {showKeyboardHelp && <KeyboardHelp onClose={toggleKeyboardHelp} />}
      <AddFeedModal />
      <CreateFolderModal />
    </div>
  )
}
