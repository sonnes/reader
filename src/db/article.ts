import { z } from 'zod'
import { createCollection } from '@tanstack/react-db'
import { indexedDBCollectionOptions } from '@tanstack/indexeddb-db-collection'

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

export const articlesCollection = createCollection({
  id: 'articles',
  ...indexedDBCollectionOptions({
    database: 'reader',
    name: 'articles',
    getKey: (item) => item.id,
    schema: ArticleSchema,
  }),
})

export function generateArticleId(): string {
  return `article-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
