import { z } from 'zod'
import { createCollection, localStorageCollectionOptions } from '@tanstack/react-db'

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

export const feedsCollection = createCollection(
  localStorageCollectionOptions({
    id: 'feeds',
    storageKey: 'reader-feeds',
    getKey: (item) => item.id,
    schema: FeedSchema,
  })
)

export function feedIdFromUrl(url: string): string {
  const urlObj = new URL(url)
  const slug = (urlObj.hostname + urlObj.pathname)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `feed-${slug}`
}
