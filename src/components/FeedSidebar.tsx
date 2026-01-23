import { useMemo } from 'react'
import { useLiveQuery, eq } from '@tanstack/react-db'
import { Link } from '@tanstack/react-router'
import {
  Folder,
  Mail,
  Rss,
  Settings,
  Star,
} from 'lucide-react'
import { foldersCollection, feedsCollection, articlesCollection } from '~/db'
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

  // Fetch unread articles for count calculation
  const { data: unreadArticles = [] } = useLiveQuery((q) =>
    q
      .from({ article: articlesCollection })
      .where(({ article }) => eq(article.isRead, false))
  )

  // Compute unread counts per feed
  const unreadCounts = useMemo(() => {
    return unreadArticles.reduce(
      (acc, article) => {
        acc[article.feedId] = (acc[article.feedId] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
  }, [unreadArticles])

  // Compute total unread count
  const totalUnreadCount = unreadArticles.length

  // Compute unread counts per folder
  const folderUnreadCounts = useMemo(() => {
    return folders.reduce(
      (acc, folder) => {
        const folderFeeds = feeds.filter((f) => f.folderId === folder.id)
        acc[folder.id] = folderFeeds.reduce(
          (sum, feed) => sum + (unreadCounts[feed.id] || 0),
          0
        )
        return acc
      },
      {} as Record<string, number>
    )
  }, [folders, feeds, unreadCounts])

  // Get feeds that don't belong to any folder
  const uncategorizedFeeds = feeds.filter((f) => f.folderId === null)

  // Get feeds for a specific folder
  const getFeedsForFolder = (folderId: string) =>
    feeds.filter((f) => f.folderId === folderId)

  const activeClass = 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 shadow-sm'
  const inactiveClass = 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:translate-x-0.5 transition-all duration-200'

  // Unread count badge component
  const UnreadBadge = ({ count, variant = 'default' }: { count: number; variant?: 'default' | 'primary' }) => {
    if (count === 0) return null
    const base = 'rounded-full px-2 py-0.5 text-xs font-medium shrink-0'
    const style = variant === 'primary'
      ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300'
      : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
    return <span className={`${base} ${style}`}>{count}</span>
  }

  return (
    <div className="h-full flex flex-col bg-sidebar-gradient border-r border-slate-200 dark:border-slate-800">

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
          <UnreadBadge count={totalUnreadCount} variant="primary" />
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
          <div className="px-4 py-8 text-center animate-fade-slide-in">
            <div className="relative mx-auto w-16 h-16 mb-4">
              {/* Decorative circles */}
              <div className="absolute inset-0 rounded-full bg-sky-100 dark:bg-sky-900/30 animate-pulse" />
              <div className="absolute inset-2 rounded-full bg-sky-50 dark:bg-sky-900/20" />
              <Rss className="absolute inset-0 m-auto w-8 h-8 text-sky-400 dark:text-sky-500" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Your reading list awaits
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Add your first feed to start reading
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
              <UnreadBadge count={folderUnreadCounts[folder.id] || 0} />
            </Link>

            {/* Feeds in folder */}
            <div className="ml-6">
              {getFeedsForFolder(folder.id).map((feed, index) => (
                <div
                  key={feed.id}
                  style={{ animationDelay: `${index * 20}ms` }}
                  className={`
                    w-full flex items-center justify-between px-4 py-1.5
                    animate-fade-slide-in transition-all duration-200
                    ${
                      props.activeFeedId === feed.id
                        ? activeClass
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:translate-x-0.5'
                    }
                  `}
                >
                  <Link
                    to="/feed/$feedId"
                    params={{ feedId: feed.id }}
                    className="flex-1 flex items-center gap-2 text-left text-sm truncate group"
                  >
                    {feed.favicon ? (
                      <img
                        src={feed.favicon}
                        alt=""
                        className="w-4 h-4 rounded-sm shrink-0 transition-transform duration-200 group-hover:scale-110"
                      />
                    ) : (
                      <Rss className="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                    )}
                    <span className="truncate">{feed.title}</span>
                  </Link>
                  <UnreadBadge count={unreadCounts[feed.id] || 0} />
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
                Other Feeds
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
                <UnreadBadge count={unreadCounts[feed.id] || 0} />
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
          Manage Feeds
         </Link>
      </div>
    </div>
  )
}
