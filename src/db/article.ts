import { z } from 'zod'
import { createCollection, type Collection } from '@tanstack/react-db'
import { indexedDBCollectionOptions } from '~/lib/indexeddb-collection'
import { db } from './db'

export const ArticleSchema = z.object({
  id: z.string(),
  feedId: z.string(),
  title: z.string(),
  url: z.string(),
  publishedAt: z.string(),
  preview: z.string().default(''),
  content: z.string().default(''),
  isRead: z.boolean().default(false),
  isStarred: z.boolean().default(false),
  isDeleted: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Article = z.infer<typeof ArticleSchema>

// SSR guard - only create collection in browser
export const articlesCollection = db
  ? createCollection(
      indexedDBCollectionOptions({
        db,
        name: 'articles',
        getKey: (item) => item.id,
        schema: ArticleSchema,
      })
    )
  : (null as unknown as Collection<Article>)

export function articleIdFromUrl(url: string): string {
  const urlObj = new URL(url)
  const slug = (urlObj.hostname + urlObj.pathname)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return slug
}

export function articleExists(id: string): boolean {
  if (!articlesCollection) return false
  return articlesCollection.state.has(id)
}
