import { z } from 'zod'
import { createCollection, type Collection } from '@tanstack/react-db'
import { indexedDBCollectionOptions } from '~/lib/indexeddb-collection'
import { db } from './db'

export const FolderSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Folder = z.infer<typeof FolderSchema>

// SSR guard - only create collection in browser
export const foldersCollection = db
  ? createCollection(
      indexedDBCollectionOptions({
        db,
        name: 'folders',
        getKey: (item) => item.id,
        schema: FolderSchema,
      })
    )
  : (null as unknown as Collection<Folder>)

export function folderIdFromName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
