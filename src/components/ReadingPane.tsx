import { useState } from 'react'
import { useArticleList } from '~/context'
import { articlesCollection } from '~/db'

export function ReadingPane() {
  const {
    selectedArticle: article,
    selectedFeed: feed,
    iframeView,
    toggleIframeView,
  } = useArticleList()

  // Track animation states for micro-interactions
  const [starAnimating, setStarAnimating] = useState(false)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const toggleRead = () => {
    if (!article) return
    articlesCollection.update(article.id, (draft) => {
      draft.isRead = !draft.isRead
      draft.updatedAt = new Date().toISOString()
    })
  }

  const toggleStar = () => {
    if (!article) return
    // Trigger star animation
    if (!article.isStarred) {
      setStarAnimating(true)
      setTimeout(() => setStarAnimating(false), 400)
    }
    articlesCollection.update(article.id, (draft) => {
      draft.isStarred = !draft.isStarred
      draft.updatedAt = new Date().toISOString()
    })
  }

  const openInBrowser = () => {
    if (!article) return
    window.open(article.url, '_blank')
  }

  const deleteArticle = () => {
    if (!article) return
    articlesCollection.update(article.id, (draft) => {
      draft.isDeleted = true
      draft.updatedAt = new Date().toISOString()
    })
  }

  // Empty state with more character
  if (!article) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8 text-center animate-fade-slide-in">
        <div className="relative w-20 h-20 mb-6">
          {/* Decorative background circles */}
          <div className="absolute inset-0 rounded-full bg-sky-100 dark:bg-sky-900/20 animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-sky-50 dark:bg-sky-900/30" />
          <div className="absolute inset-4 rounded-full bg-white dark:bg-slate-800 shadow-inner flex items-center justify-center">
            <svg
              className="w-8 h-8 text-sky-400 dark:text-sky-500"
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
        </div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
          Ready to read
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-4">
          Select an article from the list to start reading
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <kbd className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono shadow-sm">
            j
          </kbd>
          <span>/</span>
          <kbd className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono shadow-sm">
            k
          </kbd>
          <span className="ml-1">to navigate</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950">
      {/* Toolbar with gradient background */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-header-gradient">
        <div className="flex items-center gap-1">
          {/* Toggle read - with scale interaction */}
          <button
            onClick={toggleRead}
            className={`
              p-2 rounded-md transition-all duration-200
              hover:scale-110 active:scale-95
              ${
                article.isRead
                  ? 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                  : 'text-sky-500 hover:text-sky-600'
              }
              hover:bg-slate-200/80 dark:hover:bg-slate-800/80
            `}
            title={article.isRead ? 'Mark as unread' : 'Mark as read'}
          >
            <svg
              className="w-4 h-4 transition-transform duration-200"
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

          {/* Star - with shimmer animation */}
          <button
            onClick={toggleStar}
            className={`
              p-2 rounded-md transition-all duration-200
              hover:scale-110 active:scale-95
              ${
                article.isStarred
                  ? 'text-amber-500'
                  : 'text-slate-400 hover:text-amber-500 dark:text-slate-500'
              }
              hover:bg-slate-200/80 dark:hover:bg-slate-800/80
              ${starAnimating ? 'animate-star-shimmer' : ''}
            `}
            title={article.isStarred ? 'Remove star' : 'Star article'}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${starAnimating ? 'scale-125' : ''}`}
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
            onClick={openInBrowser}
            className="p-2 rounded-md text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 transition-all duration-200 hover:scale-110 active:scale-95"
            title="Open in browser"
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

          {/* Delete */}
          <button
            onClick={deleteArticle}
            className="p-2 rounded-md text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-110 active:scale-95"
            title="Delete article"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>

        {/* View toggle with improved styling */}
        <button
          onClick={toggleIframeView}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
            transition-all duration-200 hover:scale-105 active:scale-95
            ${
              iframeView
                ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }
          `}
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
              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
          {iframeView ?'RSS content' : 'Original site'}
        </button>
      </div>

      {/* Article content */}
      {iframeView ? (
        <iframe
          src={article.url}
          className="flex-1 w-full border-0"
          title={article.title}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      ) : (
        <div className="flex-1 overflow-y-auto">
          <article className="mx-auto px-6 py-8 max-w-3xl animate-fade-slide-in">
            {/* Header */}
            <header className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-4">
                {article.title}
              </h1>

              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <a
                  href={feed?.siteUrl}
                  className="font-medium text-sky-600 dark:text-sky-400 hover:underline transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {feed?.title}
                </a>
                <span className="text-slate-300 dark:text-slate-600">
                  &middot;
                </span>
                <time dateTime={article.publishedAt}>
                  {formatDate(article.publishedAt)}
                </time>
              </div>
            </header>

            {/* Content - renders full HTML from RSS */}
            <div
              className="
                prose dark:prose-invert max-w-none prose-slate prose-lg
                prose-p:leading-relaxed prose-headings:font-semibold
                prose-a:text-sky-600 dark:prose-a:text-sky-400 prose-a:wrap-break-word
                prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800 prose-pre:overflow-x-auto
                prose-code:text-sky-600 dark:prose-code:text-sky-400
                prose-code:before:content-none prose-code:after:content-none
                prose-img:rounded-lg prose-img:shadow-md prose-img:max-w-full prose-img:h-auto
                prose-video:max-w-full prose-video:h-auto
                prose-figure:my-6 prose-figcaption:text-center prose-figcaption:text-sm
                prose-table:overflow-x-auto prose-table:block
                prose-blockquote:border-l-sky-500 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-800/50 prose-blockquote:py-1
                [&_iframe]:max-w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg
                [&_embed]:max-w-full [&_object]:max-w-full
                [&_audio]:w-full
              "
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Footer */}
            <footer className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
              >
                Read on {feed?.title}
                <svg
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
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
      )}
    </div>
  )
}
