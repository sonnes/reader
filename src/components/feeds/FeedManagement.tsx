import { useMemo, useState } from 'react'
import { useLiveQuery } from '@tanstack/react-db'
import { eq } from '@tanstack/react-db'
import {
  Download,
  FolderPlus,
  Loader2,
  Plus,
  Rss,
  Upload,
} from 'lucide-react'
import { FolderGroup } from './FolderGroup'
import { FeedRow } from './FeedRow'
import {
  foldersCollection,
  feedsCollection,
  articlesCollection,
  folderIdFromName,
  timestamp,
} from '~/db'
import { parseOPML, generateOPML } from '~/lib/opml'
import { useFeedWorker } from '~/hooks/useFeedWorker'
import { AddFeedButton } from '~/components/AddFeedButton'

export function FeedManagement() {
  const { data: folders = [] } = useLiveQuery((q) =>
    q.from({ folder: foldersCollection })
  )
  const { data: feeds = [] } = useLiveQuery((q) =>
    q.from({ feed: feedsCollection })
  )
  const { data: unreadArticles = [] } = useLiveQuery((q) =>
    q
      .from({ article: articlesCollection })
      .where(({ article }) => eq(article.isRead, false))
  )

  const { validateFeed, subscribeFeed } = useFeedWorker()

  const [importStatus, setImportStatus] = useState<{
    loading: boolean
    message: string
    error: boolean
  }>({ loading: false, message: '', error: false })

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

  // Group feeds by folder
  const feedsByFolder = useMemo(() => {
    return folders.reduce(
      (acc, folder) => {
        acc[folder.id] = feeds.filter((f) => f.folderId === folder.id)
        return acc
      },
      {} as Record<string, typeof feeds>
    )
  }, [folders, feeds])

  // Uncategorized feeds (no folder)
  const uncategorizedFeeds = useMemo(() => {
    return feeds.filter((f) => f.folderId === null)
  }, [feeds])

  // Total counts
  const totalFeeds = feeds.length
  const totalUnread = unreadArticles.length

  // Handle OPML import
  const handleImportClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.opml,.xml'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        await handleImportOPML(file)
      }
    }
    input.click()
  }

  const handleImportOPML = async (file: File) => {
    setImportStatus({ loading: true, message: 'Importing...', error: false })

    try {
      const content = await file.text()
      const result = parseOPML(content)

      // Create a map of folder names to IDs
      const folderNameToId = new Map<string, string>()

      // Create folders first
      for (const folderName of result.folders) {
        const folderId = folderIdFromName(folderName)
        folderNameToId.set(folderName, folderId)

        // Check if folder already exists
        const existingFolder = folders.find((f) => f.id === folderId)
        if (!existingFolder && foldersCollection) {
          foldersCollection.insert({
            id: folderId,
            name: folderName,
            createdAt: timestamp(),
            updatedAt: timestamp(),
          })
        }
      }

      // Subscribe to feeds
      let imported = 0
      let skipped = 0
      const errors: string[] = []

      for (const feedData of result.feeds) {
        // Check if feed already exists
        const existingFeed = feeds.find((f) => f.url === feedData.url)
        if (existingFeed) {
          skipped++
          continue
        }

        try {
          const validated = await validateFeed(feedData.url)
          if (validated) {
            const folderId = feedData.folderName
              ? folderNameToId.get(feedData.folderName) || null
              : null
            await subscribeFeed(validated, folderId)
            imported++
          } else {
            errors.push(feedData.title || feedData.url)
          }
        } catch {
          errors.push(feedData.title || feedData.url)
        }
      }

      const message =
        `Imported ${imported} feed${imported !== 1 ? 's' : ''}` +
        (skipped > 0 ? `, skipped ${skipped} existing` : '') +
        (errors.length > 0 ? `, ${errors.length} failed` : '')

      setImportStatus({ loading: false, message, error: errors.length > 0 })

      // Clear message after 5 seconds
      setTimeout(() => {
        setImportStatus({ loading: false, message: '', error: false })
      }, 5000)
    } catch (err) {
      setImportStatus({
        loading: false,
        message: err instanceof Error ? err.message : 'Import failed',
        error: true,
      })
    }
  }

  const handleExportOPML = () => {
    const opml = generateOPML(folders, feeds)

    // Create and download the file
    const blob = new Blob([opml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'reader-subscriptions.opml'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="shrink-0 border-b border-slate-200 px-6 py-5 dark:border-slate-700">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Manage Feeds
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {totalFeeds} {totalFeeds === 1 ? 'feed' : 'feeds'} &middot;{' '}
              {totalUnread} unread {totalUnread === 1 ? 'article' : 'articles'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {importStatus.message && (
              <span
                className={`text-sm ${importStatus.error ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
              >
                {importStatus.message}
              </span>
            )}
            <button
              onClick={handleImportClick}
              disabled={importStatus.loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {importStatus.loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Import Subscriptions</span>
              <span className="sm:hidden">Import</span>
            </button>
            <button
              onClick={handleExportOPML}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export Subscriptions</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          {/* Folders */}
          {folders.map((folder) => (
            <FolderGroup
              key={folder.id}
              folder={folder}
              feeds={feedsByFolder[folder.id] || []}
              unreadCounts={unreadCounts}
            />
          ))}

          {/* Uncategorized Feeds */}
          {uncategorizedFeeds.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 px-2">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Other Feeds
                </span>
                <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
                  {uncategorizedFeeds.length}{' '}
                  {uncategorizedFeeds.length === 1 ? 'feed' : 'feeds'}
                </span>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50">
                {uncategorizedFeeds.map((feed) => (
                  <FeedRow
                    key={feed.id}
                    feed={feed}
                    unreadCount={unreadCounts[feed.id] || 0}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {totalFeeds === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Rss className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-slate-900 dark:text-slate-100">
                No feeds yet
              </h3>
              <p className="mb-6 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                Subscribe to your favorite blogs and news sites to start
                reading. You can also import your subscriptions from another
                reader app.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleImportClick}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Upload className="h-4 w-4" />
                  Import Subscriptions
                </button>
                <AddFeedButton />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
