import type { Article, Feed } from '../types'

interface ArticleListItemProps {
  article: Article
  feed?: Feed
  isSelected: boolean
  viewMode: 'list' | 'card'
  onSelect?: () => void
  onToggleStar?: () => void
}

export function ArticleListItem({
  article,
  feed,
  isSelected,
  viewMode,
  onSelect,
  onToggleStar,
}: ArticleListItemProps) {
  // Format relative date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60))
        return `${diffMins}m ago`
      }
      return `${diffHours}h ago`
    }
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (viewMode === 'card') {
    return (
      <article
        onClick={onSelect}
        className={`group p-4 rounded-lg border cursor-pointer transition-all ${
          isSelected
            ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 ring-1 ring-sky-500'
            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
        }`}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3
            className={`text-sm font-medium leading-snug ${
              article.isRead
                ? 'text-slate-500 dark:text-slate-400'
                : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {article.title}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleStar?.()
            }}
            className={`flex-shrink-0 p-1 rounded transition-colors ${
              article.isStarred
                ? 'text-amber-500'
                : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100'
            }`}
          >
            <svg
              className="w-4 h-4"
              fill={article.isStarred ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              />
            </svg>
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
          {article.preview}
        </p>

        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span className="truncate">{feed?.title}</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>

        {/* Unread indicator */}
        {!article.isRead && (
          <div className="absolute top-4 left-0 w-1 h-6 bg-sky-500 rounded-r" />
        )}
      </article>
    )
  }

  // List view
  return (
    <article
      onClick={onSelect}
      className={`group relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-800 ${
        isSelected
          ? 'bg-sky-50 dark:bg-sky-900/20'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
      }`}
    >
      {/* Unread indicator */}
      {!article.isRead && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sky-500 rounded-r" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <h3
            className={`text-sm leading-snug ${
              article.isRead
                ? 'text-slate-500 dark:text-slate-400 font-normal'
                : 'text-slate-900 dark:text-slate-100 font-medium'
            }`}
          >
            {article.title}
          </h3>
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 mt-1">
          {article.preview}
        </p>

        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400 dark:text-slate-500">
          <span className="truncate max-w-[120px]">{feed?.title}</span>
          <span className="text-slate-300 dark:text-slate-600">&middot;</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>
      </div>

      {/* Star button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleStar?.()
        }}
        className={`flex-shrink-0 p-1.5 rounded transition-all ${
          article.isStarred
            ? 'text-amber-500'
            : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 hover:text-amber-500'
        }`}
      >
        <svg
          className="w-4 h-4"
          fill={article.isStarred ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
      </button>
    </article>
  )
}
