import { useContext } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { Plus, Settings } from 'lucide-react'
import type { Feed, Folder } from '@/types'
import { FeedsContext, useFeedActions, useFolderActions } from '@/context'

interface FolderSidebarProps {
  // Props for standalone usage (FeedManagement)
  folders?: Array<Folder>
  feeds?: Array<Feed>
  selectedFolderId?: string | null
  selectedFeedId?: string | null
  filterMode?: 'all' | 'unread' | 'starred'
  onSelectFolder?: (folderId: string | null) => void
  onSelectFeed?: (feedId: string) => void
  onFilterChange?: (filter: 'all' | 'unread' | 'starred') => void
  onCollapse?: () => void
  onAddFeed?: () => void
  onAddFolder?: () => void
  // Props for context usage
  stats?: {
    totalArticles: number
    unreadCount: number
    starredCount: number
  }
}

export function FolderSidebar(props: FolderSidebarProps) {
  // Try to use context if available
  const contextValue = useContext(FeedsContext)
  const location = useLocation()

  // Get modal setters from contexts (with safe fallback)
  let setShowAddFeedModal: ((show: boolean) => void) | undefined
  let setShowCreateFolderModal: ((show: boolean) => void) | undefined
  try {
    const feedActions = useFeedActions()
    setShowAddFeedModal = feedActions.setShowAddFeedModal
  } catch {
    // Context not available, will use props
  }
  try {
    const folderActions = useFolderActions()
    setShowCreateFolderModal = folderActions.setShowCreateFolderModal
  } catch {
    // Context not available, will use props
  }

  // Determine values - prefer context, fall back to props
  const folders = contextValue?.folders ?? props.folders ?? []
  const feeds = contextValue?.feeds ?? props.feeds ?? []

  // Derive active state from URL
  const pathname = location.pathname
  const isRootActive = pathname === '/'
  const isStarredActive = pathname === '/starred'
  const activeFolderId = pathname.startsWith('/f/')
    ? pathname.slice(3)
    : null
  const activeFeedId = pathname.startsWith('/s/')
    ? pathname.slice(3)
    : null

  const toggleSidebar =
    contextValue?.toggleSidebar ?? props.onCollapse ?? (() => {})

  // Get feeds that don't belong to any folder
  const uncategorizedFeeds = feeds.filter((f) => f.folderId === null)

  // Get feeds for a specific folder
  const getFeedsForFolder = (folderId: string) =>
    feeds.filter((f) => f.folderId === folderId)

  // Calculate totals
  const totalUnread =
    props.stats?.unreadCount ?? feeds.reduce((sum, f) => sum + f.unreadCount, 0)
  const totalArticles = props.stats?.totalArticles ?? 0
  const totalStarred = props.stats?.starredCount ?? 0

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          Feeds
        </h2>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          title="Collapse sidebar"
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
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* Feed List */}
      <nav className="flex-1 overflow-y-auto py-2">
        {/* Unread (Home) */}
        <Link
          to="/"
          className={`w-full flex items-center justify-between px-4 py-2 text-left transition-colors ${
            isRootActive
              ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-medium">
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Unread
          </span>
          {totalUnread > 0 && (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-sky-500 text-white">
              {totalUnread}
            </span>
          )}
        </Link>

        {/* Starred */}
        <Link
          to="/starred"
          className={`w-full flex items-center justify-between px-4 py-2 text-left text-sm font-medium transition-colors ${
            isStarredActive
              ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-amber-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Starred
          </span>
          {totalStarred > 0 && (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {totalStarred}
            </span>
          )}
        </Link>

        {/* Divider */}
        <div className="my-2 mx-4 border-t border-slate-200 dark:border-slate-700" />

        {/* Folders */}
        {folders.map((folder) => (
          <div key={folder.id} className="mb-1">
            <Link
              to="/f/$folderId"
              params={{ folderId: folder.id }}
              className={`w-full flex items-center justify-between px-4 py-2 text-left transition-colors ${
                activeFolderId === folder.id
                  ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
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
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                {folder.name}
              </span>
              {folder.unreadCount > 0 && (
                <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {folder.unreadCount}
                </span>
              )}
            </Link>

            {/* Feeds in folder */}
            <div className="ml-6">
              {getFeedsForFolder(folder.id).map((feed) => (
                <div
                  key={feed.id}
                  className={`w-full flex items-center justify-between px-4 py-1.5 transition-colors ${
                    activeFeedId === feed.id
                      ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Link
                    to="/s/$feedId"
                    params={{ feedId: feed.id }}
                    className="flex-1 flex items-center gap-2 text-left text-sm truncate"
                  >
                    {feed.favicon ? (
                      <img
                        src={feed.favicon}
                        alt=""
                        className="w-4 h-4 rounded-sm shrink-0"
                      />
                    ) : (
                      <svg
                        className="w-4 h-4 text-slate-400 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z"
                        />
                      </svg>
                    )}
                    <span className="truncate">{feed.title}</span>
                  </Link>
                  {feed.unreadCount > 0 && (
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      {feed.unreadCount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Uncategorized Feeds */}
        {uncategorizedFeeds.length > 0 && (
          <>
            <div className="my-2 mx-4 border-t border-slate-200 dark:border-slate-700" />
            <div className="px-4 py-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                Uncategorized
              </span>
            </div>
            {uncategorizedFeeds.map((feed) => (
              <div
                key={feed.id}
                className={`w-full flex items-center justify-between px-4 py-2 transition-colors ${
                  activeFeedId === feed.id
                    ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Link
                  to="/s/$feedId"
                  params={{ feedId: feed.id }}
                  className="flex-1 flex items-center gap-2 text-left text-sm"
                >
                  {feed.favicon ? (
                    <img
                      src={feed.favicon}
                      alt=""
                      className="w-4 h-4 rounded-sm shrink-0"
                    />
                  ) : (
                    <svg
                      className="w-4 h-4 text-slate-400 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z"
                      />
                    </svg>
                  )}
                  <span className="truncate">{feed.title}</span>
                </Link>
                {feed.unreadCount > 0 && (
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {feed.unreadCount}
                  </span>
                )}
              </div>
            ))}
          </>
        )}

        {/* Add Feed/Folder buttons */}
        <div className="mt-2 mx-4 border-t border-slate-200 dark:border-slate-700 pt-3 pb-1 flex flex-col gap-1">
          <button
            onClick={() => {
              if (setShowAddFeedModal) {
                setShowAddFeedModal(true)
              } else {
                props.onAddFeed?.()
              }
            }}
            className="flex items-center gap-2 px-2 py-1.5 text-sm text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Feed
          </button>
          <button
            onClick={() => {
              if (setShowCreateFolderModal) {
                setShowCreateFolderModal(true)
              } else {
                props.onAddFolder?.()
              }
            }}
            className="flex items-center gap-2 px-2 py-1.5 text-sm text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Folder
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <Link
          to="/manage"
          className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Manage Subscriptions
        </Link>
        <p className="text-xs text-slate-500 dark:text-slate-500">
          Press{' '}
          <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">
            ?
          </kbd>{' '}
          for shortcuts
        </p>
      </div>
    </div>
  )
}
