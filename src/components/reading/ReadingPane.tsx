import type { Article, Feed } from '@/types'

interface ReadingPaneProps {
  article: Article | null
  feed?: Feed
  readerView: boolean
  onToggleReaderView?: () => void
  onToggleRead?: () => void
  onToggleStar?: () => void
  onOpenInBrowser?: () => void
  onExitFocusMode?: () => void
  focusMode?: boolean
}

export function ReadingPane({
  article,
  feed,
  readerView,
  onToggleReaderView,
  onToggleRead,
  onToggleStar,
  onOpenInBrowser,
  onExitFocusMode,
  focusMode,
}: ReadingPaneProps) {
  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Empty state
  if (!article) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
          Select an article to read
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
          Choose an article from the list or use <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">j</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">k</kbd> to navigate
        </p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center gap-1">
          {/* Focus mode exit */}
          {focusMode && (
            <button
              onClick={onExitFocusMode}
              className="p-2 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors mr-2"
              title="Exit focus mode"
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
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* Toggle read */}
          <button
            onClick={onToggleRead}
            className={`p-2 rounded-md transition-colors ${
              article.isRead
                ? 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                : 'text-sky-500 hover:text-sky-600'
            } hover:bg-slate-200 dark:hover:bg-slate-800`}
            title={article.isRead ? 'Mark as unread (m)' : 'Mark as read (m)'}
          >
            <svg
              className="w-4 h-4"
              fill={article.isRead ? 'none' : 'currentColor'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          {/* Star */}
          <button
            onClick={onToggleStar}
            className={`p-2 rounded-md transition-colors ${
              article.isStarred
                ? 'text-amber-500'
                : 'text-slate-400 hover:text-amber-500 dark:text-slate-500'
            } hover:bg-slate-200 dark:hover:bg-slate-800`}
            title={article.isStarred ? 'Remove star (s)' : 'Star article (s)'}
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

          {/* Open in browser */}
          <button
            onClick={onOpenInBrowser}
            className="p-2 rounded-md text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Open in browser (o)"
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
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </button>
        </div>

        {/* View toggle */}
        <button
          onClick={onToggleReaderView}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            readerView
              ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
          {readerView ? 'Reader view' : 'Original'}
        </button>
      </div>

      {/* Article content */}
      <div className="flex-1 overflow-y-auto">
        <article className={`mx-auto px-6 py-8 ${readerView ? 'max-w-2xl' : 'max-w-4xl'}`}>
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-4">
              {article.title}
            </h1>

            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <a
                href={feed?.siteUrl}
                className="font-medium text-sky-600 dark:text-sky-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {feed?.title}
              </a>
              <span className="text-slate-300 dark:text-slate-600">&middot;</span>
              <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            </div>
          </header>

          {/* Content */}
          <div
            className={`prose dark:prose-invert max-w-none ${
              readerView
                ? 'prose-slate prose-lg prose-p:leading-relaxed prose-headings:font-semibold prose-a:text-sky-600 dark:prose-a:text-sky-400 prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800 prose-code:text-sky-600 dark:prose-code:text-sky-400 prose-code:before:content-none prose-code:after:content-none'
                : 'prose-sm'
            }`}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
            >
              Read on {feed?.title}
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
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </footer>
        </article>
      </div>
    </div>
  )
}
