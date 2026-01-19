import {
  Download,
  FolderPlus,
  Loader2,
  PanelLeft,
  Plus,
  Rss,
  Upload,
} from 'lucide-react'
import { FolderGroup } from './FolderGroup'
import { FeedRow } from './FeedRow'
import { AddFeedModal } from './AddFeedModal'
import { CreateFolderModal } from './CreateFolderModal'
import { FolderSidebar } from '@/components/reading/FolderSidebar'
import { useFeedActions, useFeedsContext, useFolderActions } from '@/context'

export function FeedManagement() {
  const {
    folders,
    feeds,
    setShowAddFeedModal,
    importStatus,
    importOPML,
    exportOPML,
  } = useFeedActions()
  const { setShowCreateFolderModal } = useFolderActions()
  const { sidebarCollapsed, toggleSidebar, selectedFolderId, selectedFeedId } =
    useFeedsContext()

  // Group feeds by folder
  const feedsByFolder = folders.reduce(
    (acc, folder) => {
      acc[folder.id] = feeds.filter((f) => f.folderId === folder.id)
      return acc
    },
    {} as Record<string, Array<(typeof feeds)[0]>>,
  )

  // Uncategorized feeds (no folder)
  const uncategorizedFeeds = feeds.filter((f) => f.folderId === null)

  // Total counts
  const totalFeeds = feeds.length
  const totalUnread = feeds.reduce((sum, f) => sum + f.unreadCount, 0)

  // Filter feeds/folders based on sidebar selection
  const getVisibleFolders = () => {
    if (selectedFeedId) {
      const feed = feeds.find((f) => f.id === selectedFeedId)
      if (feed?.folderId) {
        return folders.filter((f) => f.id === feed.folderId)
      }
      return []
    }
    if (selectedFolderId && selectedFolderId !== 'starred') {
      return folders.filter((f) => f.id === selectedFolderId)
    }
    return folders
  }

  const getVisibleUncategorizedFeeds = () => {
    if (selectedFeedId) {
      const feed = feeds.find((f) => f.id === selectedFeedId)
      if (feed?.folderId === null) {
        return [feed]
      }
      return []
    }
    if (selectedFolderId && selectedFolderId !== 'starred') {
      return []
    }
    return uncategorizedFeeds
  }

  const visibleFolders = getVisibleFolders()
  const visibleUncategorizedFeeds = getVisibleUncategorizedFeeds()

  // Handle OPML import
  const handleImportClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.opml,.xml'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        await importOPML(file)
      }
    }
    input.click()
  }

  return (
    <div className="flex h-full bg-white dark:bg-slate-900">
      {/* Left Sidebar */}
      {!sidebarCollapsed && (
        <div className="w-56 shrink-0">
          <FolderSidebar
            onAddFeed={() => setShowAddFeedModal(true)}
            onAddFolder={() => setShowCreateFolderModal(true)}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 border-b border-slate-200 px-6 py-5 dark:border-slate-700">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {sidebarCollapsed && (
                <button
                  onClick={toggleSidebar}
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  title="Show sidebar"
                >
                  <PanelLeft className="h-5 w-5" />
                </button>
              )}
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Manage Feeds
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {totalFeeds} {totalFeeds === 1 ? 'feed' : 'feeds'} &middot;{' '}
                  {totalUnread} unread{' '}
                  {totalUnread === 1 ? 'article' : 'articles'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {importStatus.message && (
                <span
                  className={`text-sm ${importStatus.error ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
                >
                  {importStatus.message}
                </span>
              )}
              <button
                onClick={handleImportClick}
                disabled={importStatus.loading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {importStatus.loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Import OPML</span>
                <span className="sm:hidden">Import</span>
              </button>
              <button
                onClick={() => exportOPML()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export OPML</span>
                <span className="sm:hidden">Export</span>
              </button>
              <button
                onClick={() => setShowCreateFolderModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <FolderPlus className="h-4 w-4" />
                <span className="hidden sm:inline">New Folder</span>
                <span className="sm:hidden">Folder</span>
              </button>
              <button
                onClick={() => setShowAddFeedModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-600"
              >
                <Plus className="h-4 w-4" />
                Add Feed
              </button>
            </div>
          </div>
        </div>

        {/* Feed List */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
            {/* Folders */}
            {visibleFolders.map((folder) => (
              <FolderGroup
                key={folder.id}
                folder={folder}
                feeds={
                  selectedFeedId
                    ? (feedsByFolder[folder.id] || []).filter(
                        (f) => f.id === selectedFeedId,
                      )
                    : feedsByFolder[folder.id] || []
                }
              />
            ))}

            {/* Uncategorized Feeds */}
            {visibleUncategorizedFeeds.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 px-2">
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Uncategorized
                  </span>
                  <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
                    {visibleUncategorizedFeeds.length}{' '}
                    {visibleUncategorizedFeeds.length === 1 ? 'feed' : 'feeds'}
                  </span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50">
                  {visibleUncategorizedFeeds.map((feed) => (
                    <FeedRow key={feed.id} feed={feed} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {totalFeeds === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <Rss className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-slate-900 dark:text-slate-100">
                  No feeds yet
                </h3>
                <p className="mb-6 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  Subscribe to your favorite blogs and news sites to start
                  reading. You can also import your existing subscriptions from
                  an OPML file.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleImportClick}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Upload className="h-4 w-4" />
                    Import OPML
                  </button>
                  <button
                    onClick={() => setShowAddFeedModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-600"
                  >
                    <Plus className="h-4 w-4" />
                    Add Feed
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddFeedModal />
      <CreateFolderModal />
    </div>
  )
}
