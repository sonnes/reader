import { useState } from 'react'
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
import { foldersCollection, folderIdFromName, timestamp } from '~/db'

export function CreateFolderButton() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    foldersCollection.insert({
      id: folderIdFromName(name),
      name: name.trim(),
      createdAt: timestamp(),
      updatedAt: timestamp(),
    })
    setName('')
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setName('')
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-2 py-1.5 text-sm text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-md transition-colors"
      >
        <Plus className="w-4 h-4" />
        New Folder
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="folder-name"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Folder Name
              </label>
              <Input
                id="folder-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter folder name"
                autoFocus
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
