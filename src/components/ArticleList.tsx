import { useLiveQuery, eq, and } from '@tanstack/react-db'
import {
  articlesCollection,
  feedsCollection,
  foldersCollection,
  type Article,
} from '~/db'
import { useArticleList } from '~/context'
import { ArticleListItem } from './ArticleListItem'

type ArticleFilter =
  | { type: 'unread' }
  | { type: 'starred' }
  | { type: 'feed'; feedId: string }
  | { type: 'folder'; folderId: string }

interface ArticleListProps {
  filter: ArticleFilter
}

function useArticleQuery(filter: ArticleFilter) {
  // Fetch all feeds for display and folder filtering
  const { data: feeds = [] } = useLiveQuery(
    (q) => q.from({ feed: feedsCollection }),
    []
  )

  // Fetch folder info when needed
  const { data: folder } = useLiveQuery(
    (q) => {
      if (filter.type !== 'folder') return undefined
      return q
        .from({ folder: foldersCollection })
        .where(({ folder }) => eq(folder.id, filter.folderId))
        .findOne()
    },
    [filter.type === 'folder' ? filter.folderId : null]
  )

  // Fetch feed info when needed
  const { data: feed } = useLiveQuery(
    (q) => {
      if (filter.type !== 'feed') return undefined
      return q
        .from({ feed: feedsCollection })
        .where(({ feed }) => eq(feed.id, filter.feedId))
        .findOne()
    },
    [filter.type === 'feed' ? filter.feedId : null]
  )

  // Get folder feed IDs for folder filtering
  const folderFeedIds =
    filter.type === 'folder'
      ? new Set(feeds.filter((f) => f.folderId === filter.folderId).map((f) => f.id))
      : null

  // Fetch articles based on filter type
  const { data: articles = [] } = useLiveQuery(
    (q) => {
      const base = q.from({ article: articlesCollection })

      switch (filter.type) {
        case 'unread':
          return base.where(({ article }) =>
            and(eq(article.isRead, false), eq(article.isDeleted, false))
          )
        case 'starred':
          return base.where(({ article }) =>
            and(eq(article.isStarred, true), eq(article.isDeleted, false))
          )
        case 'feed':
          return base.where(({ article }) =>
            and(eq(article.feedId, filter.feedId), eq(article.isDeleted, false))
          )
        case 'folder':
          // For folder, we filter by feedIds in the folder using fn.where
          return base
            .where(({ article }) => eq(article.isDeleted, false))
            .fn.where((row) => folderFeedIds?.has(row.article.feedId) ?? false)
      }
    },
    [
      filter.type,
      filter.type === 'feed' ? filter.feedId : null,
      filter.type === 'folder' ? filter.folderId : null,
      folderFeedIds ? Array.from(folderFeedIds).join(',') : null,
    ]
  )

  // Sort articles by publishedAt descending
  const sortedArticles = [...articles].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )

  // Determine title
  let title: string
  switch (filter.type) {
    case 'unread':
      title = 'Unread'
      break
    case 'starred':
      title = 'Starred'
      break
    case 'feed':
      title = feed?.title ?? 'Feed'
      break
    case 'folder':
      title = folder?.name ?? 'Folder'
      break
  }

  return { articles: sortedArticles, feeds, title }
}

export function ArticleList({ filter }: ArticleListProps) {
  const { selectedArticleId } = useArticleList()
  const { articles, feeds, title } = useArticleQuery(filter)
  const getFeed = (feedId: string) => feeds.find((f) => f.id === feedId)
  const unreadCount = articles.filter((a: Article) => !a.isRead).length

  // Context-aware empty state content
  const emptyStateContent = {
    unread: {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "All caught up!",
      description: "You've read everything. Time for a coffee break.",
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/20",
    },
    starred: {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ),
      title: "No starred articles",
      description: "Star articles you want to read later",
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/20",
    },
    feed: {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 19.5v-.75a7.5 7.5 0 00-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
      ),
      title: "No articles yet",
      description: "New articles will appear when the feed updates",
      color: "text-sky-500 dark:text-sky-400",
      bg: "bg-sky-100 dark:bg-sky-900/20",
    },
    folder: {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
      ),
      title: "Empty folder",
      description: "Add feeds to this folder to see articles",
      color: "text-slate-500 dark:text-slate-400",
      bg: "bg-slate-100 dark:bg-slate-800",
    },
  }

  const emptyState = emptyStateContent[filter.type]

  if (articles.length === 0) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-header-gradient">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {title}
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-slide-in">
          <div className={`relative w-16 h-16 mb-4 rounded-full ${emptyState.bg} flex items-center justify-center`}>
            <div className={emptyState.color}>
              {emptyState.icon}
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
            {emptyState.title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[200px]">
            {emptyState.description}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-header-gradient">
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {title}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          {unreadCount > 0 && <span className="text-sky-600 dark:text-sky-400 font-medium">{unreadCount}</span>}
          {unreadCount > 0 && <span className="text-slate-400 dark:text-slate-500 mx-0.5">/</span>}
          {articles.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {articles.map((article, index) => (
            <ArticleListItem
              key={article.id}
              article={article}
              feed={getFeed(article.feedId)}
              isSelected={article.id === selectedArticleId}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
