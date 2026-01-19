import { createFileRoute, useRouter } from '@tanstack/react-router'
import { FeedManagement } from '@/components/feeds'
import {
  FeedActionsProvider,
  FeedsProvider,
  FolderActionsProvider,
} from '@/context'
import {
  createFolderFn,
  deleteFolderFn,
  exportOPMLFn,
  fetchFeedManagementData,
  importOPMLFn,
  moveFeedFn,
  renameFolderFn,
  subscribeFeedFn,
  unsubscribeFeedFn,
} from '@/server/feeds'

export const Route = createFileRoute('/manage')({
  loader: async () => await fetchFeedManagementData(),
  component: ManagePage,
})

function ManagePage() {
  const { folders, feeds } = Route.useLoaderData()
  const router = useRouter()

  const handleCreateFolder = async (name: string) => {
    await createFolderFn({ data: { name } })
    router.invalidate()
  }

  const handleRenameFolder = async (folderId: string, name: string) => {
    await renameFolderFn({ data: { folderId, name } })
    router.invalidate()
  }

  const handleDeleteFolder = async (folderId: string) => {
    await deleteFolderFn({ data: { folderId } })
    router.invalidate()
  }

  const handleAddFeed = async (url: string, folderId?: string) => {
    const result = await subscribeFeedFn({ data: { url, folderId } })
    if (result.success) {
      router.invalidate()
    }
    return result
  }

  const handleRemoveFeed = async (feedId: string) => {
    await unsubscribeFeedFn({ data: { feedId } })
    router.invalidate()
  }

  const handleMoveFeed = async (feedId: string, folderId: string | null) => {
    await moveFeedFn({ data: { feedId, folderId } })
    router.invalidate()
  }

  const handleImportOPML = async (file: File) => {
    const content = await file.text()
    const result = await importOPMLFn({ data: { content } })
    if (result.success) {
      router.invalidate()
    }
    return result
  }

  const handleExportOPML = async () => {
    const result = await exportOPMLFn()
    if (result.success) {
      // Create and download the file
      const blob = new Blob([result.opml], { type: 'application/xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'reader-subscriptions.opml'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <FolderActionsProvider
      onCreateFolder={handleCreateFolder}
      onRenameFolder={handleRenameFolder}
      onDeleteFolder={handleDeleteFolder}
    >
      <FeedActionsProvider
        folders={folders}
        feeds={feeds}
        onAddFeed={handleAddFeed}
        onRemoveFeed={handleRemoveFeed}
        onMoveFeed={handleMoveFeed}
        onImportOPML={handleImportOPML}
        onExportOPML={handleExportOPML}
      >
        <FeedsProvider folders={folders} feeds={feeds}>
          <FeedManagement />
        </FeedsProvider>
      </FeedActionsProvider>
    </FolderActionsProvider>
  )
}
