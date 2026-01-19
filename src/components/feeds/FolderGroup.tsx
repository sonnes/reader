import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import { FeedRow } from './FeedRow'
import type { Feed, Folder } from '@/types'
import { useFeedActions, useFolderActions } from '@/context'

interface FolderGroupProps {
  folder: Folder
  feeds: Array<Feed>
}

export function FolderGroup({ folder, feeds }: FolderGroupProps) {
  const { renameFolder, deleteFolder } = useFolderActions()
  const { folders } = useFeedActions()
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(folder.name)
  const [showMenu, setShowMenu] = useState(false)

  const handleSaveRename = () => {
    if (editName.trim() && editName !== folder.name) {
      renameFolder(folder.id, editName.trim())
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
                    deleteFolder(folder.id)
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
            feeds.map((feed) => <FeedRow key={feed.id} feed={feed} />)
          )}
        </div>
      )}
    </div>
  )
}
