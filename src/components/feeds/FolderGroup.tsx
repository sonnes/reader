import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import { FeedRow } from './FeedRow'
import { type Feed, type Folder } from '~/db'
import { useFolderManagement } from '~/hooks/useFolderManagement'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

interface FolderGroupProps {
  folder: Folder
  feeds: Array<Feed>
  unreadCounts: Record<string, number>
}

export function FolderGroup({ folder, feeds, unreadCounts }: FolderGroupProps) {
  const { renameFolder, deleteFolder } = useFolderManagement()
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(folder.name)

  const folderUnreadCount = feeds.reduce(
    (sum, feed) => sum + (unreadCounts[feed.id] || 0),
    0
  )

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

        {folderUnreadCount > 0 && (
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {folderUnreadCount}
          </span>
        )}

        {/* Folder Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded p-1 text-slate-400 opacity-0 transition-all hover:bg-slate-200 hover:text-slate-600 group-hover:opacity-100 dark:hover:bg-slate-700 dark:hover:text-slate-300">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => deleteFolder(folder.id)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
                unreadCount={unreadCounts[feed.id] || 0}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
