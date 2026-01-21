import { z } from 'zod'
import { createCollection, type Collection } from '@tanstack/react-db'
import { indexedDBCollectionOptions } from '@tanstack/indexeddb-db-collection'
import { db } from './db'

export const FeedSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  siteUrl: z.string(),
  favicon: z.string().nullable(),
  folderId: z.string().nullable(),
  preferIframe: z.boolean().default(false),
  lastFetched: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Feed = z.infer<typeof FeedSchema>

// SSR guard - only create collection in browser
export const feedsCollection = db
  ? createCollection(
      indexedDBCollectionOptions({
        db,
        name: 'feeds',
        getKey: (item) => item.id,
        schema: FeedSchema,
      })
    )
  : (null as unknown as Collection<Feed>)

export function feedIdFromUrl(url: string): string {
  const urlObj = new URL(url)
  const slug = (urlObj.hostname + urlObj.pathname)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `feed-${slug}`
}
