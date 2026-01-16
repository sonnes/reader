import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  FolderOpen,
  FolderPlus,
  GripVertical,
  Loader2,
  MoreHorizontal,
  PanelLeft,
  Pencil,
  Plus,
  Rss,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import type { Feed, Folder } from '@/types'
import { FolderSidebar } from '@/components/reading/FolderSidebar'

interface FeedManagementProps {
  folders: Array<Folder>
  feeds: Array<Feed>
  onCreateFolder: (name: string) => Promise<void>
  onRenameFolder: (folderId: string, name: string) => Promise<void>
  onDeleteFolder: (folderId: string) => Promise<void>
  onAddFeed: (
    url: string,
    folderId?: string,
  ) => Promise<{ success: boolean; error?: string }>
  onRemoveFeed: (feedId: string) => Promise<void>
  onMoveFeed: (feedId: string, folderId: string | null) => Promise<void>
  onImportOPML: (
    file: File,
  ) => Promise<{ success: boolean; imported?: number; error?: string }>
  onExportOPML: () => Promise<void>
}

// Sub-component: Feed Row
interface FeedRowProps {
  feed: Feed
  onRemove?: () => void
  onMove?: (folderId: string | null) => void
  folders: Array<Folder>
}

function FeedRow({ feed, onRemove, onMove, folders }: FeedRowProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showMoveMenu, setShowMoveMenu] = useState(false)

  return (
    <div className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
      {/* Drag Handle */}
      <div className="cursor-grab text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-600">
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Favicon */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
        {feed.favicon ? (
          <img
            src={feed.favicon}
            alt=""
            className="h-5 w-5 rounded-sm"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        <Rss
          className={`h-4 w-4 text-slate-400 ${feed.favicon ? 'hidden' : ''}`}
        />
      </div>

      {/* Feed Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-slate-900 dark:text-slate-100">
            {feed.title}
          </span>
          {feed.unreadCount > 0 && (
            <span className="shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
              {feed.unreadCount}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="truncate">
            {new URL(feed.siteUrl || feed.url).hostname}
          </span>
        </div>
      </div>

      {/* External Link */}
      <a
        href={feed.siteUrl || feed.url}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded p-1.5 text-slate-400 opacity-0 transition-all hover:bg-slate-200 hover:text-slate-600 group-hover:opacity-100 dark:hover:bg-slate-700 dark:hover:text-slate-300"
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLink className="h-4 w-4" />
      </a>

      {/* Actions Menu */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="rounded p-1.5 text-slate-400 opacity-0 transition-all hover:bg-slate-200 hover:text-slate-600 group-hover:opacity-100 dark:hover:bg-slate-700 dark:hover:text-slate-300"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
              <div className="relative">
                <button
                  onClick={() => setShowMoveMenu(!showMoveMenu)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Move to folder
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </button>

                {showMoveMenu && (
                  <div className="absolute left-full top-0 ml-1 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                    <button
                      onClick={() => {
                        onMove?.(null)
                        setShowMenu(false)
                        setShowMoveMenu(false)
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 ${
                        feed.folderId === null
                          ? 'text-sky-600 dark:text-sky-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="italic">No folder</span>
                    </button>
                    {folders.map((folder) => (
                      <button
                        key={folder.id}
                        onClick={() => {
                          onMove?.(folder.id)
                          setShowMenu(false)
                          setShowMoveMenu(false)
                        }}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 ${
                          feed.folderId === folder.id
                            ? 'text-sky-600 dark:text-sky-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {folder.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  onRemove?.()
                  setShowMenu(false)
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
                Unsubscribe
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Sub-component: Folder Group
interface FolderGroupProps {
  folder: Folder
  feeds: Array<Feed>
  allFolders: Array<Folder>
  onRename?: (newName: string) => void
  onDelete?: () => void
  onRemoveFeed?: (feedId: string) => void
  onMoveFeed?: (feedId: string, folderId: string | null) => void
}

function FolderGroup({
  folder,
  feeds,
  allFolders,
  onRename,
  onDelete,
  onRemoveFeed,
  onMoveFeed,
}: FolderGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(folder.name)
  const [showMenu, setShowMenu] = useState(false)

  const handleSaveRename = () => {
    if (editName.trim() && editName !== folder.name) {
      onRename?.(editName.trim())
    }
    setIsEditing(false)
  }

  return (
    <div className="mb-2">
      {/* Folder Header */}
      <div className="group flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-slate-500 dark:text-slate-400"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename()
              if (e.key === 'Escape') {
                setEditName(folder.name)
                setIsEditing(false)
              }
            }}
            className="flex-1 rounded border border-sky-500 bg-transparent px-2 py-0.5 text-sm font-semibold text-slate-900 outline-none dark:text-slate-100"
            autoFocus
          />
        ) : (
          <span className="flex-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
            {folder.name}
          </span>
        )}

        <span className="text-xs text-slate-400 dark:text-slate-500">
          {feeds.length} {feeds.length === 1 ? 'feed' : 'feeds'}
        </span>

        {folder.unreadCount > 0 && (
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {folder.unreadCount}
          </span>
        )}

        {/* Folder Actions */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded p-1 text-slate-400 opacity-0 transition-all hover:bg-slate-200 hover:text-slate-600 group-hover:opacity-100 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <button
                  onClick={() => {
                    setIsEditing(true)
                    setShowMenu(false)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <Pencil className="h-4 w-4" />
                  Rename
                </button>
                <button
                  onClick={() => {
                    onDelete?.()
                    setShowMenu(false)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Feeds in Folder */}
      {isExpanded && (
        <div className="ml-4 border-l border-slate-200 pl-2 dark:border-slate-700">
          {feeds.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-slate-400 dark:text-slate-500">
              No feeds in this folder
            </div>
          ) : (
            feeds.map((feed) => (
              <FeedRow
                key={feed.id}
                feed={feed}
                folders={allFolders}
                onRemove={() => onRemoveFeed?.(feed.id)}
                onMove={(folderId) => onMoveFeed?.(feed.id, folderId)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// Sub-component: Add Feed Modal
interface AddFeedModalProps {
  isOpen: boolean
  folders: Array<Folder>
  onClose: () => void
  onAdd: (
    url: string,
    folderId?: string,
  ) => Promise<{ success: boolean; error?: string }>
}

function AddFeedModal({ isOpen, folders, onClose, onAdd }: AddFeedModalProps) {
  const [url, setUrl] = useState('')
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(
    undefined,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsLoading(true)
    setError(null)

    const result = await onAdd(url.trim(), selectedFolderId)

    setIsLoading(false)

    if (result.success) {
      setUrl('')
      setSelectedFolderId(undefined)
      onClose()
    } else {
      setError(result.error || 'Failed to add feed')
    }
  }

  const handleClose = () => {
    setUrl('')
    setSelectedFolderId(undefined)
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Add Feed
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Feed URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setError(null)
              }}
              placeholder="https://example.com/feed.xml"
              className={`w-full rounded-lg border px-3 py-2.5 text-slate-900 placeholder-slate-400 outline-none transition-colors focus:ring-2 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 ${
                error
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-slate-300 focus:border-sky-500 focus:ring-sky-500/20 dark:border-slate-600'
              }`}
              autoFocus
              disabled={isLoading}
            />
            {error && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Folder (optional)
            </label>
            <select
              value={selectedFolderId ?? ''}
              onChange={(e) => setSelectedFolderId(e.target.value || undefined)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition-colors focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              disabled={isLoading}
            >
              <option value="">No folder</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!url.trim() || isLoading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Subscribe
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Sub-component: Create Folder Modal
interface CreateFolderModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string) => void
}

function CreateFolderModal({
  isOpen,
  onClose,
  onCreate,
}: CreateFolderModalProps) {
  const [name, setName] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onCreate(name.trim())
      setName('')
      onClose()
    }
  }

  const handleClose = () => {
    setName('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Create Folder
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Folder Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Tech Blogs"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 rounded-lg bg-sky-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Main Component
export function FeedManagement({
  folders,
  feeds,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onAddFeed,
  onRemoveFeed,
  onMoveFeed,
  onImportOPML,
  onExportOPML,
}: FeedManagementProps) {
  const [showAddFeedModal, setShowAddFeedModal] = useState(false)
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null)
  const [importStatus, setImportStatus] = useState<{
    loading: boolean
    message?: string
    error?: boolean
  }>({ loading: false })

  // Group feeds by folder
  const feedsByFolder = folders.reduce(
    (acc, folder) => {
      acc[folder.id] = feeds.filter((f) => f.folderId === folder.id)
      return acc
    },
    {} as Record<string, Array<Feed>>,
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
        setImportStatus({ loading: true })
        const result = await onImportOPML(file)
        if (result.success) {
          setImportStatus({
            loading: false,
            message: `Imported ${result.imported} feeds`,
          })
          setTimeout(() => setImportStatus({ loading: false }), 3000)
        } else {
          setImportStatus({
            loading: false,
            message: result.error || 'Import failed',
            error: true,
          })
          setTimeout(() => setImportStatus({ loading: false }), 5000)
        }
      }
    }
    input.click()
  }

  const handleSelectFolder = (folderId: string | null) => {
    setSelectedFolderId(folderId)
    setSelectedFeedId(null)
  }

  const handleSelectFeed = (feedId: string) => {
    setSelectedFeedId(feedId)
    setSelectedFolderId(null)
  }

  return (
    <div className="flex h-full bg-white dark:bg-slate-900">
      {/* Left Sidebar */}
      {!sidebarCollapsed && (
        <div className="w-56 shrink-0">
          <FolderSidebar
            folders={folders}
            feeds={feeds}
            selectedFolderId={selectedFolderId}
            selectedFeedId={selectedFeedId}
            onSelectFolder={handleSelectFolder}
            onSelectFeed={handleSelectFeed}
            onCollapse={() => setSidebarCollapsed(true)}
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
                  onClick={() => setSidebarCollapsed(false)}
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
                onClick={() => onExportOPML()}
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
                allFolders={folders}
                onRename={(newName) => onRenameFolder(folder.id, newName)}
                onDelete={() => onDeleteFolder(folder.id)}
                onRemoveFeed={onRemoveFeed}
                onMoveFeed={onMoveFeed}
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
                    <FeedRow
                      key={feed.id}
                      feed={feed}
                      folders={folders}
                      onRemove={() => onRemoveFeed(feed.id)}
                      onMove={(folderId) => onMoveFeed(feed.id, folderId)}
                    />
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
      <AddFeedModal
        isOpen={showAddFeedModal}
        folders={folders}
        onClose={() => setShowAddFeedModal(false)}
        onAdd={onAddFeed}
      />

      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreate={onCreateFolder}
      />
    </div>
  )
}
