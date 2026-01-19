import type { Article, Feed } from '@/types'

interface ArticleListItemProps {
  article: Article
  feed?: Feed
  isSelected: boolean
  viewMode: 'list' | 'card'
  onSelect?: () => void
}

export function ArticleListItem({
  article,
  feed,
  isSelected,
  viewMode,
  onSelect,
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
        className={`group relative p-4 rounded-lg border cursor-pointer transition-all ${
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
          <div
            className={`absolute top-4 left-0 w-1 h-6 rounded-r ${
              article.isStarred ? 'bg-amber-500' : 'bg-sky-500'
            }`}
          />
        )}
      </article>
    )
  }

  // List view
  return (
    <article
      onClick={onSelect}
      className={`group relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-sky-50 dark:bg-sky-900/20'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
      }`}
    >
      {/* Unread indicator */}
      {!article.isRead && (
        <div
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r ${
            article.isStarred ? 'bg-amber-500' : 'bg-sky-500'
          }`}
        />
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
    </article>
  )
}
