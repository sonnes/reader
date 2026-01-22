import { useCallback } from 'react'
import { foldersCollection, feedsCollection, timestamp } from '~/db'

export function useFolderManagement() {
  const renameFolder = useCallback((folderId: string, name: string) => {
    if (!foldersCollection) return

    foldersCollection.update(folderId, (draft) => {
      draft.name = name
      draft.updatedAt = timestamp()
    })
  }, [])

  const deleteFolder = useCallback((folderId: string) => {
    if (!foldersCollection || !feedsCollection) return

    // Move feeds to uncategorized
    const feeds = Array.from(feedsCollection.state.values())
    for (const feed of feeds) {
      if (feed.folderId === folderId) {
        feedsCollection.update(feed.id, (draft) => {
          draft.folderId = null
          draft.updatedAt = timestamp()
        })
      }
    }

    // Delete the folder
    foldersCollection.delete(folderId)
  }, [])

  return { renameFolder, deleteFolder }
}
