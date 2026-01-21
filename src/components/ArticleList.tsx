import { useLiveQuery, eq, and } from '@tanstack/react-db'
import {
  articlesCollection,
  feedsCollection,
  foldersCollection,
  type Article,
} from '~/db'
import { ArticleListItem } from './ArticleListItem'

type ArticleFilter =
  | { type: 'unread' }
  | { type: 'starred' }
  | { type: 'feed'; feedId: string }
  | { type: 'folder'; folderId: string }

interface ArticleListProps {
  filter: ArticleFilter
  selectedArticleId?: string
  onSelectArticle?: (id: string) => void
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

export function ArticleList({
  filter,
  selectedArticleId,
  onSelectArticle,
}: ArticleListProps) {
  const { articles, feeds, title } = useArticleQuery(filter)
  const getFeed = (feedId: string) => feeds.find((f) => f.id === feedId)
  const unreadCount = articles.filter((a: Article) => !a.isRead).length

  if (articles.length === 0) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {title}
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
            No articles
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Articles will appear here once available
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {title}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {unreadCount}/{articles.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {articles.map((article) => (
            <ArticleListItem
              key={article.id}
              article={article}
              feed={getFeed(article.feedId)}
              isSelected={article.id === selectedArticleId}
              onSelect={() => onSelectArticle?.(article.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
