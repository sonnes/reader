import { useArticleList } from '~/context'
import type { Article, Feed } from '~/db'

interface ArticleListItemProps {
  article: Article
  feed?: Feed
  isSelected: boolean
}

function formatDate(dateStr: string) {
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

export function ArticleListItem({
  article,
  feed,
  isSelected,
}: ArticleListItemProps) {
  const { selectArticle } = useArticleList()

  return (
    <article
      onClick={() => selectArticle(article.id)}
      className={`group relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-sky-50 dark:bg-sky-900/20'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
      }`}
    >
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

        {article.preview && (
          <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 mt-1">
            {article.preview}
          </p>
        )}

        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400 dark:text-slate-500">
          <span className="truncate max-w-[120px]">{feed?.title}</span>
          <span className="text-slate-300 dark:text-slate-600">&middot;</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>
      </div>
    </article>
  )
}
