import { useState } from 'react'
import { useLiveQuery } from '@tanstack/react-db'
import { Plus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { foldersCollection } from '~/db'
import { useFeedWorker } from '~/hooks/useFeedWorker'
import type { ValidateFeedResult } from '~/workers/feed-worker-client'

type Step = 'input' | 'validating' | 'preview' | 'subscribing'

export function AddFeedButton() {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [folderId, setFolderId] = useState<string | null>(null)
  const [step, setStep] = useState<Step>('input')
  const [validatedFeed, setValidatedFeed] = useState<ValidateFeedResult | null>(null)

  const { data: folders = [] } = useLiveQuery((q) =>
    q.from({ folder: foldersCollection })
  )

  const { isValidating, isParsing, error, validateFeed, subscribeFeed } =
    useFeedWorker()

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setStep('validating')
    const result = await validateFeed(url)

    if (result) {
      setValidatedFeed(result)
      setStep('preview')
    } else {
      setStep('input')
    }
  }

  const handleSubscribe = async () => {
    if (!validatedFeed) return

    setStep('subscribing')
    const feed = await subscribeFeed(validatedFeed, folderId)

    if (feed) {
      handleClose()
    } else {
      setStep('preview')
    }
  }

  const handleClose = () => {
    setOpen(false)
    setUrl('')
    setFolderId(null)
    setStep('input')
    setValidatedFeed(null)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleClose()
    } else {
      setOpen(true)
    }
  }

  const handleBack = () => {
    setStep('input')
    setValidatedFeed(null)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-2 py-1.5 text-sm text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-md transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Feed
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {step === 'preview' ? 'Confirm Feed' : 'Add Feed'}
            </DialogTitle>
          </DialogHeader>

          {(step === 'input' || step === 'validating') && (
            <form onSubmit={handleValidate} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="feed-url"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Website Address
                </label>
                <Input
                  id="feed-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  disabled={isValidating}
                  autoFocus
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Paste a website address. We'll find the content automatically.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isValidating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isValidating || !url.trim()}>
                  {isValidating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}

          {(step === 'preview' || step === 'subscribing') && validatedFeed && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                {validatedFeed.feed.favicon ? (
                  <img
                    src={validatedFeed.feed.favicon}
                    alt=""
                    className="w-8 h-8 rounded"
                  />
                ) : (
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                    {validatedFeed.feed.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    {validatedFeed.feed.siteUrl}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {validatedFeed.articleCount} articles found
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Folder (optional)
                </label>
                <Select
                  value={folderId ?? 'none'}
                  onValueChange={(value) =>
                    setFolderId(value === 'none' ? null : value)
                  }
                  disabled={isParsing}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isParsing}
                >
                  Back
                </Button>
                <Button onClick={handleSubscribe} disabled={isParsing}>
                  {isParsing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    'Subscribe'
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
