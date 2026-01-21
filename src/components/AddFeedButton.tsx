import { useState } from 'react'
import { useLiveQuery } from '@tanstack/react-db'
import { Plus } from 'lucide-react'
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
import {
  feedsCollection,
  foldersCollection,
  feedIdFromUrl,
  timestamp,
} from '~/db'

export function AddFeedButton() {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [folderId, setFolderId] = useState<string | null>(null)

  const { data: folders = [] } = useLiveQuery((q) =>
    q.from({ folder: foldersCollection })
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    try {
      const parsedUrl = new URL(url)
      feedsCollection.insert({
        id: feedIdFromUrl(url),
        title: parsedUrl.hostname,
        url,
        siteUrl: parsedUrl.origin,
        favicon: null,
        folderId,
        preferIframe: false,
        lastFetched: null,
        createdAt: timestamp(),
        updatedAt: timestamp(),
      })
      setUrl('')
      setFolderId(null)
      setOpen(false)
    } catch {
      // Invalid URL - could add error state here
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setUrl('')
      setFolderId(null)
    }
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
            <DialogTitle>Add Feed</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="feed-url"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Feed URL
              </label>
              <Input
                id="feed-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/feed.xml"
                autoFocus
              />
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
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No folder</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Feed</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
