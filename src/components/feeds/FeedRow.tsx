import { useState } from 'react'
import {
  ChevronRight,
  ExternalLink,
  FolderOpen,
  GripVertical,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Rss,
  Trash2,
} from 'lucide-react'
import type { Feed } from '@/types'
import { useFeedActions } from '@/context'

interface FeedRowProps {
  feed: Feed
}

export function FeedRow({ feed }: FeedRowProps) {
  const { folders, removeFeed, moveFeed, refreshFeed, refreshingFeeds } =
    useFeedActions()
  const [showMenu, setShowMenu] = useState(false)
  const [showMoveMenu, setShowMoveMenu] = useState(false)
  const isRefreshing = refreshingFeeds.has(feed.id)

  return (
    <div className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
      {/* Drag Handle */}
      <div className="cursor-grab text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-600">
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Favicon */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
        {isRefreshing ? (
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
        {!isRefreshing && (
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

      {/* Refresh Button */}
      <button
        onClick={() => refreshFeed(feed.id)}
        disabled={isRefreshing}
        className="rounded p-1.5 text-slate-400 opacity-0 transition-all hover:bg-slate-200 hover:text-slate-600 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-700 dark:hover:text-slate-300"
        title="Refresh feed"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
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
                        moveFeed(feed.id, null)
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
                          moveFeed(feed.id, folder.id)
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
                  removeFeed(feed.id)
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
