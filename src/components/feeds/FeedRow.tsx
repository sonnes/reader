import { useState } from 'react'
import { useLiveQuery } from '@tanstack/react-db'
import {
  ExternalLink,
  FolderOpen,
  GripVertical,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Rss,
  Trash2,
} from 'lucide-react'
import { foldersCollection, type Feed } from '~/db'
import { useFeedManagement } from '~/hooks/useFeedManagement'
import { useFeedWorker } from '~/hooks/useFeedWorker'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

interface FeedRowProps {
  feed: Feed
  unreadCount: number
}

export function FeedRow({ feed, unreadCount }: FeedRowProps) {
  const { data: folders = [] } = useLiveQuery((q) =>
    q.from({ folder: foldersCollection })
  )
  const { unsubscribeFeed, moveFeed } = useFeedManagement()
  const { refreshFeed } = useFeedWorker()

  const [refreshingThis, setRefreshingThis] = useState(false)

  const handleRefresh = async () => {
    setRefreshingThis(true)
    await refreshFeed(feed)
    setRefreshingThis(false)
  }

  const isCurrentlyRefreshing = refreshingThis

  return (
    <div className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
      {/* Drag Handle */}
      <div className="cursor-grab text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-600">
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Favicon */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
        {isCurrentlyRefreshing ? (
          <Loader2 className="h-5 w-5 animate-spin text-sky-500" />
        ) : feed.favicon ? (
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
        {!isCurrentlyRefreshing && (
          <Rss
            className={`h-4 w-4 text-slate-400 ${feed.favicon ? 'hidden' : ''}`}
          />
        )}
      </div>

      {/* Feed Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-slate-900 dark:text-slate-100">
            {feed.title}
          </span>
          {unreadCount > 0 && (
            <span className="shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="truncate">
            {(() => {
              try {
                return new URL(feed.siteUrl || feed.url).hostname
              } catch {
                return feed.url
              }
            })()}
          </span>
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={handleRefresh}
        disabled={isCurrentlyRefreshing}
        className="rounded p-1.5 text-slate-400 opacity-0 transition-all hover:bg-slate-200 hover:text-slate-600 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-700 dark:hover:text-slate-300"
        title="Refresh feed"
      >
        <RefreshCw
          className={`h-4 w-4 ${isCurrentlyRefreshing ? 'animate-spin' : ''}`}
        />
      </button>

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded p-1.5 text-slate-400 opacity-0 transition-all hover:bg-slate-200 hover:text-slate-600 group-hover:opacity-100 dark:hover:bg-slate-700 dark:hover:text-slate-300">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <FolderOpen className="h-4 w-4" />
              Move to folder
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => moveFeed(feed.id, null)}
                className={feed.folderId === null ? 'text-sky-600 dark:text-sky-400' : ''}
              >
                <span className="italic">No folder</span>
              </DropdownMenuItem>
              {folders.map((folder) => (
                <DropdownMenuItem
                  key={folder.id}
                  onClick={() => moveFeed(feed.id, folder.id)}
                  className={feed.folderId === folder.id ? 'text-sky-600 dark:text-sky-400' : ''}
                >
                  {folder.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => unsubscribeFeed(feed.id)}
          >
            <Trash2 className="h-4 w-4" />
            Unsubscribe
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
