import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface FolderActionsContextValue {
  showCreateFolderModal: boolean
  setShowCreateFolderModal: (show: boolean) => void
  createFolder: (name: string) => Promise<void>
  renameFolder: (folderId: string, name: string) => Promise<void>
  deleteFolder: (folderId: string) => Promise<void>
}

const FolderActionsContext = createContext<FolderActionsContextValue | null>(
  null,
)

interface FolderActionsProviderProps {
  children: ReactNode
  onCreateFolder?: (name: string) => Promise<void>
  onRenameFolder?: (folderId: string, name: string) => Promise<void>
  onDeleteFolder?: (folderId: string) => Promise<void>
}

export function FolderActionsProvider({
  children,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: FolderActionsProviderProps) {
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)

  const createFolder = useCallback(
    async (name: string) => {
      await onCreateFolder?.(name)
    },
    [onCreateFolder],
  )

  const renameFolder = useCallback(
    async (folderId: string, name: string) => {
      await onRenameFolder?.(folderId, name)
    },
    [onRenameFolder],
  )

  const deleteFolder = useCallback(
    async (folderId: string) => {
      await onDeleteFolder?.(folderId)
    },
    [onDeleteFolder],
  )

  return (
    <FolderActionsContext.Provider
      value={{
        showCreateFolderModal,
        setShowCreateFolderModal,
        createFolder,
        renameFolder,
        deleteFolder,
      }}
    >
      {children}
    </FolderActionsContext.Provider>
  )
}

export function useFolderActions() {
  const context = useContext(FolderActionsContext)
  if (!context) {
    throw new Error(
      'useFolderActions must be used within FolderActionsProvider',
    )
  }
  return context
}
