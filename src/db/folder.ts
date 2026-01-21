import { z } from 'zod'
import { createCollection } from '@tanstack/react-db'
import { indexedDBCollectionOptions } from '@tanstack/indexeddb-db-collection'

export const FolderSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Folder = z.infer<typeof FolderSchema>

export const foldersCollection = createCollection({
  id: 'folders',
  ...indexedDBCollectionOptions({
    database: 'reader',
    name: 'folders',
    getKey: (item) => item.id,
    schema: FolderSchema,
  }),
})

export function folderIdFromName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
