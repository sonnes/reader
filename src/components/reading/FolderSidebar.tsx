import { Pencil, Plus, Settings, Trash2 } from 'lucide-react'
import type { Feed, Folder } from '@/types'

interface FolderSidebarProps {
  folders: Array<Folder>
  feeds: Array<Feed>
  selectedFolderId: string | null
  selectedFeedId: string | null
  onSelectFolder?: (folderId: string | null) => void
  onSelectFeed?: (feedId: string) => void
  onCollapse?: () => void
  filterMode?: 'all' | 'unread' | 'starred'
  onFilterChange?: (filter: 'all' | 'unread' | 'starred') => void
  totalArticleCount?: number
  unreadCount?: number
  starredCount?: number
  onAddFeed?: () => void
  onAddFolder?: () => void
  onEditFeed?: (feedId: string) => void
  onDeleteFeed?: (feedId: string) => void
  onManageSubscriptions?: () => void
}

export function FolderSidebar({
  folders,
  feeds,
  selectedFolderId,
  selectedFeedId,
  onSelectFolder,
  onSelectFeed,
  onCollapse,
  filterMode = 'all',
  onFilterChange,
  totalArticleCount,
  unreadCount,
  starredCount,
  onAddFeed,
  onAddFolder,
  onEditFeed,
  onDeleteFeed,
  onManageSubscriptions,
}: FolderSidebarProps) {
  // Get feeds that don't belong to any folder
  const uncategorizedFeeds = feeds.filter((f) => f.folderId === null)

  // Get feeds for a specific folder
  const getFeedsForFolder = (folderId: string) =>
    feeds.filter((f) => f.folderId === folderId)

  // Calculate total unread from feeds if not provided via props
  const totalUnread =
    unreadCount ?? feeds.reduce((sum, f) => sum + f.unreadCount, 0)
  const totalArticles = totalArticleCount ?? 0
  const totalStarred = starredCount ?? 0

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          Feeds
        </h2>
        <button
          onClick={onCollapse}
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
        {/* All Articles */}
        <button
          onClick={() => {
            onSelectFolder?.(null)
            onFilterChange?.('all')
          }}
          className={`w-full flex items-center justify-between px-4 py-2 text-left transition-colors ${
            filterMode === 'all' &&
            selectedFolderId === null &&
            selectedFeedId === null
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
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            All Articles
          </span>
          {totalArticles > 0 && (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {totalArticles}
            </span>
          )}
        </button>

        {/* Unread */}
        <button
          onClick={() => {
            onSelectFolder?.(null)
            onFilterChange?.('unread')
          }}
          className={`w-full flex items-center justify-between px-4 py-2 text-left transition-colors ${
            filterMode === 'unread' &&
            selectedFolderId === null &&
            selectedFeedId === null
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
        </button>

        {/* Starred */}
        <button
          onClick={() => onSelectFolder?.('starred')}
          className={`w-full flex items-center justify-between px-4 py-2 text-left text-sm font-medium transition-colors ${
            selectedFolderId === 'starred'
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
        </button>

        {/* Divider */}
        <div className="my-2 mx-4 border-t border-slate-200 dark:border-slate-700" />

        {/* Folders */}
        {folders.map((folder) => (
          <div key={folder.id} className="mb-1">
            <button
              onClick={() => onSelectFolder?.(folder.id)}
              className={`w-full flex items-center justify-between px-4 py-2 text-left transition-colors ${
                selectedFolderId === folder.id
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
            </button>

            {/* Feeds in folder */}
            <div className="ml-6">
              {getFeedsForFolder(folder.id).map((feed) => (
                <div
                  key={feed.id}
                  className={`group w-full flex items-center justify-between px-4 py-1.5 transition-colors ${
                    selectedFeedId === feed.id
                      ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <button
                    onClick={() => onSelectFeed?.(feed.id)}
                    className="flex-1 text-left text-sm truncate"
                  >
                    {feed.title}
                  </button>
                  <div className="flex items-center gap-1">
                    {/* Hover actions */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditFeed?.(feed.id)
                      }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                      title="Edit feed"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteFeed?.(feed.id)
                      }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                      title="Delete feed"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    {feed.unreadCount > 0 && (
                      <span className="text-xs text-slate-500 dark:text-slate-500 ml-1">
                        {feed.unreadCount}
                      </span>
                    )}
                  </div>
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
                className={`group w-full flex items-center justify-between px-4 py-2 transition-colors ${
                  selectedFeedId === feed.id
                    ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <button
                  onClick={() => onSelectFeed?.(feed.id)}
                  className="flex-1 flex items-center gap-2 text-left text-sm"
                >
                  <svg
                    className="w-4 h-4 text-slate-400"
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
                  {feed.title}
                </button>
                <div className="flex items-center gap-1">
                  {/* Hover actions */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditFeed?.(feed.id)
                    }}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    title="Edit feed"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteFeed?.(feed.id)
                    }}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    title="Delete feed"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  {feed.unreadCount > 0 && (
                    <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 ml-1">
                      {feed.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Add Feed/Folder buttons */}
        <div className="mt-2 mx-4 border-t border-slate-200 dark:border-slate-700 pt-3 pb-1 flex flex-col gap-1">
          <button
            onClick={onAddFeed}
            className="flex items-center gap-2 px-2 py-1.5 text-sm text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Feed
          </button>
          <button
            onClick={onAddFolder}
            className="flex items-center gap-2 px-2 py-1.5 text-sm text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Folder
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <a
          href="/feeds"
          className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Manage Subscriptions
        </a>
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
