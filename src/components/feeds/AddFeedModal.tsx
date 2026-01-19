import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { useFeedActions } from '@/context'

export function AddFeedModal() {
  const { folders, showAddFeedModal, setShowAddFeedModal, addFeed } =
    useFeedActions()
  const [url, setUrl] = useState('')
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(
    undefined,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!showAddFeedModal) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsLoading(true)
    setError(null)

    const result = await addFeed(url.trim(), selectedFolderId)

    setIsLoading(false)

    if (result.success) {
      setUrl('')
      setSelectedFolderId(undefined)
      setShowAddFeedModal(false)
    } else {
      setError(result.error || 'Failed to add feed')
    }
  }

  const handleClose = () => {
    setUrl('')
    setSelectedFolderId(undefined)
    setError(null)
    setShowAddFeedModal(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Add Feed
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Feed URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setError(null)
              }}
              placeholder="https://example.com/feed.xml"
              className={`w-full rounded-lg border px-3 py-2.5 text-slate-900 placeholder-slate-400 outline-none transition-colors focus:ring-2 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 ${
                error
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-slate-300 focus:border-sky-500 focus:ring-sky-500/20 dark:border-slate-600'
              }`}
              autoFocus
              disabled={isLoading}
            />
            {error && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Folder (optional)
            </label>
            <select
              value={selectedFolderId ?? ''}
              onChange={(e) => setSelectedFolderId(e.target.value || undefined)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition-colors focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              disabled={isLoading}
            >
              <option value="">No folder</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!url.trim() || isLoading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Subscribe
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
