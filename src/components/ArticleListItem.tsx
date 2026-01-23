import { useArticleList, useAppState } from '~/context'
import { useMobileLayout } from '~/hooks/useMobileLayout'
import type { Article, Feed } from '~/db'

interface ArticleListItemProps {
  article: Article
  feed?: Feed
  isSelected: boolean
  index?: number
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
  index = 0,
}: ArticleListItemProps) {
  const { selectArticle } = useArticleList()
  const { setMobileReadingPaneOpen } = useAppState()
  const { isMobile } = useMobileLayout()

  // Calculate stagger class (cap at 10 for performance)
  const staggerClass = index < 10 ? `stagger-${index + 1}` : ''

  const handleClick = () => {
    selectArticle(article.id)
    if (isMobile) {
      setMobileReadingPaneOpen(true)
    }
  }

  return (
    <article
      onClick={handleClick}
      style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
      className={`
        group relative flex items-start gap-3 px-4 py-3 cursor-pointer
        transition-all duration-200 ease-out
        animate-fade-slide-in ${staggerClass}
        ${
          isSelected
            ? 'bg-sky-50 dark:bg-sky-900/20 shadow-sm'
            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:translate-x-0.5'
        }
      `}
    >
      {/* Unread indicator */}
      {!article.isRead && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r
            bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.3)]
            transition-all duration-300"
        />
      )}

      {/* Starred indicator */}
      {article.isStarred && (
        <div className="absolute right-3 top-3">
          <svg
            className="w-3.5 h-3.5 text-amber-500 fill-amber-500 drop-shadow-sm"
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
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <h3
            className={`
              text-sm leading-snug transition-colors duration-200
              ${
                article.isRead
                  ? 'text-slate-500 dark:text-slate-400 font-normal'
                  : 'text-slate-900 dark:text-slate-100 font-medium'
              }
              ${!isSelected && 'group-hover:text-slate-700 dark:group-hover:text-slate-200'}
            `}
          >
            {article.title}
          </h3>
        </div>

        {article.preview && (
          <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 mt-1 transition-colors duration-200">
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
