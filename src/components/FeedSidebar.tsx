import { useLiveQuery } from '@tanstack/react-db'
import { Link } from '@tanstack/react-router'
import {
  Folder,
  Mail,
  Rss,
  Settings,
  Star,
} from 'lucide-react'
import { foldersCollection, feedsCollection } from '~/db'
import { AddFeedButton } from './AddFeedButton'
import { CreateFolderButton } from './CreateFolderButton'

interface FeedSidebarProps {
  activeFeedId?: string
  activeFolderId?: string
  view?: 'home' | 'starred' | 'manage'
  onCollapse?: () => void
}

export function FeedSidebar(props: FeedSidebarProps) {
  // Fetch data from TanStack DB
  const { data: folders = [] } = useLiveQuery((q) =>
    q.from({ folder: foldersCollection })
  )
  const { data: feeds = [] } = useLiveQuery((q) =>
    q.from({ feed: feedsCollection })
  )

  // Get feeds that don't belong to any folder
  const uncategorizedFeeds = feeds.filter((f) => f.folderId === null)

  // Get feeds for a specific folder
  const getFeedsForFolder = (folderId: string) =>
    feeds.filter((f) => f.folderId === folderId)

  const activeClass = 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
  const inactiveClass = 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">

      {/* Feed List */}
      <nav className="flex-1 overflow-y-auto py-2">
        {/* Unread (Home) */}
        <Link
          to="/"
          className={`w-full flex items-center justify-between px-4 py-2 text-left transition-colors ${
            props.view === 'home' ? activeClass : inactiveClass
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Mail className="w-4 h-4" />
            Unread
          </span>
        </Link>

        {/* Starred */}
        <Link
          to="/starred"
          className={`w-full flex items-center justify-between px-4 py-2 text-left text-sm font-medium transition-colors ${
            props.view === 'starred' ? activeClass : inactiveClass
          }`}
        >
          <span className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Starred
          </span>
        </Link>

        {/* Divider */}
        <div className="my-2 mx-4 border-t border-slate-200 dark:border-slate-700" />

        {/* Empty State */}
        {feeds.length === 0 && folders.length === 0 && (
          <div className="px-4 py-6 text-center">
            <Rss className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              No feeds yet
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Add a feed to get started
            </p>
          </div>
        )}

        {/* Folders */}
        {folders.map((folder) => (
          <div key={folder.id} className="mb-1">
            <Link
              to="/folder/$folderId"
              params={{ folderId: folder.id }}
              className={`w-full flex items-center justify-between px-4 py-2 text-left transition-colors ${
                props.activeFolderId === folder.id ? activeClass : inactiveClass
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Folder className="w-4 h-4" />
                {folder.name}
              </span>
            </Link>

            {/* Feeds in folder */}
            <div className="ml-6">
              {getFeedsForFolder(folder.id).map((feed) => (
                <div
                  key={feed.id}
                  className={`w-full flex items-center justify-between px-4 py-1.5 transition-colors ${
                    props.activeFeedId === feed.id
                      ? activeClass
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Link
                    to="/feed/$feedId"
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
                      <Rss className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate">{feed.title}</span>
                  </Link>
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
                  props.activeFeedId === feed.id ? activeClass : inactiveClass
                }`}
              >
                <Link
                  to="/feed/$feedId"
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
                    <Rss className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="truncate">{feed.title}</span>
                </Link>
              </div>
            ))}
          </>
        )}

        {/* Add Feed/Folder buttons */}
        <div className="mt-2 mx-4 border-t border-slate-200 dark:border-slate-700 pt-3 pb-1 flex flex-col gap-1">
          <AddFeedButton />
          <CreateFolderButton />
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <Link
          to="/manage"
          className={`flex items-center gap-2 text-sm transition-colors ${
            props.view === 'manage'
              ? 'text-sky-600 dark:text-sky-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400'
          }`}
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
