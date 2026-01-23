import {
  foldersCollection,
  feedsCollection,
  articlesCollection,
  timestamp,
  type Feed,
} from '~/db'

const WELCOME_FEED_ID = 'feed-reader-blog'
const READER_FOLDER_ID = 'reader'

export async function seedDefaultFeed(): Promise<void> {
  // Only run in browser
  if (typeof window === 'undefined') return
  if (!feedsCollection || !foldersCollection || !articlesCollection) return

  // Only seed if no feeds exist (fresh install)
  if (feedsCollection.state.size > 0) return

  // Skip if welcome feed already exists
  if (feedsCollection.state.has(WELCOME_FEED_ID)) return

  const now = timestamp()

  // Create "Reader" folder
  if (!foldersCollection.state.has(READER_FOLDER_ID)) {
    foldersCollection.insert({
      id: READER_FOLDER_ID,
      name: 'Reader',
      createdAt: now,
      updatedAt: now,
    })
  }

  // Create the welcome feed
  const feed: Feed = {
    id: WELCOME_FEED_ID,
    title: 'Reader Blog',
    url: `${import.meta.env.VITE_APP_URL}/rss.xml`,
    siteUrl: import.meta.env.VITE_APP_URL,
    favicon: '/reader-logo.png',
    folderId: READER_FOLDER_ID,
    preferIframe: false,
    lastFetched: now,
    createdAt: now,
    updatedAt: now,
  }
  feedsCollection.insert(feed)
}