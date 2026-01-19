import { ArticleListItem } from './ArticleListItem'
import type { Article, Feed } from '@/types'

type ViewMode = 'list' | 'card'
type SortOrder = 'newest' | 'oldest'

interface ArticleListProps {
  articles: Array<Article>
  feeds: Array<Feed>
  selectedArticleId: string | null
  viewMode: ViewMode
  sortOrder: SortOrder
  onSelectArticle?: (articleId: string) => void
  onToggleViewMode?: () => void
  onSortChange?: (order: SortOrder) => void
  onRefresh?: () => void
}

export function ArticleList({
  articles,
  feeds,
  selectedArticleId,
  viewMode,
  sortOrder,
  onSelectArticle,
  onToggleViewMode,
  onSortChange,
  onRefresh,
}: ArticleListProps) {
  // Get feed by ID
  const getFeed = (feedId: string) => feeds.find((f) => f.id === feedId)

  // Count unread
  const unreadCount = articles.filter((a) => !a.isRead).length

  // Empty state
  if (articles.length === 0) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
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
            No articles yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Subscribe to feeds to see articles here
          </p>
          <button
            onClick={onRefresh}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors"
          >
            Refresh feeds
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {articles.length} articles
          </span>
          {unreadCount > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({unreadCount} unread)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Sort dropdown */}
          <select
            value={sortOrder}
            onChange={(e) => onSortChange?.(e.target.value as SortOrder)}
            className="text-xs bg-transparent border-none text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none focus:ring-0"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh (r)"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          {/* View toggle */}
          <button
            onClick={onToggleViewMode}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={
              viewMode === 'list'
                ? 'Switch to card view'
                : 'Switch to list view'
            }
          >
            {viewMode === 'list' ? (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Article list */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'card' ? (
          <div className="grid grid-cols-1 gap-3 p-4">
            {articles.map((article) => (
              <ArticleListItem
                key={article.id}
                article={article}
                feed={getFeed(article.feedId)}
                isSelected={article.id === selectedArticleId}
                viewMode={viewMode}
                onSelect={() => onSelectArticle?.(article.id)}
              />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {articles.map((article) => (
              <ArticleListItem
                key={article.id}
                article={article}
                feed={getFeed(article.feedId)}
                isSelected={article.id === selectedArticleId}
                viewMode={viewMode}
                onSelect={() => onSelectArticle?.(article.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
