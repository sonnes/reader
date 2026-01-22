import { createIndexedDB } from '~/lib/indexeddb-collection'

// Only create the database in browser environment (SSR guard)
export const db =
  typeof window !== 'undefined'
    ? await createIndexedDB({
        name: 'reader',
        version: 1,
        stores: ['folders', 'feeds', 'articles'],
      })
    : (null as unknown as Awaited<ReturnType<typeof createIndexedDB>>)
