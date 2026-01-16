import { getDb } from './index'
import type { Folder, Feed, Article } from '@/types'

// Row types from database
interface FolderRow {
  id: string
  name: string
}

interface FeedRow {
  id: string
  title: string
  url: string
  site_url: string
  favicon: string | null
  folder_id: string | null
  last_fetched: string | null
}

interface ArticleRow {
  id: string
  feed_id: string
  title: string
  url: string
  published_at: string
  preview: string
  content: string
  is_read: number
  is_starred: number
}

// ============================================================================
// Folders
// ============================================================================

export function getAllFolders(): Folder[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT f.id, f.name
    FROM folders f
    ORDER BY f.name
  `).all() as FolderRow[]

  return rows.map((row) => {
    // Get feed IDs for this folder
    const feedIds = db.prepare(`
      SELECT id FROM feeds WHERE folder_id = ?
    `).all(row.id) as { id: string }[]

    // Calculate unread count
    const unreadResult = db.prepare(`
      SELECT COUNT(*) as count
      FROM articles a
      JOIN feeds f ON a.feed_id = f.id
      WHERE f.folder_id = ? AND a.is_read = 0
    `).get(row.id) as { count: number }

    return {
      id: row.id,
      name: row.name,
      feedIds: feedIds.map((f) => f.id),
      unreadCount: unreadResult.count,
    }
  })
}

export function createFolder(id: string, name: string): Folder {
  const db = getDb()
  db.prepare(`
    INSERT INTO folders (id, name) VALUES (?, ?)
  `).run(id, name)

  return { id, name, feedIds: [], unreadCount: 0 }
}

// ============================================================================
// Feeds
// ============================================================================

export function getAllFeeds(): Feed[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT id, title, url, site_url, favicon, folder_id, last_fetched
    FROM feeds
    ORDER BY title
  `).all() as FeedRow[]

  return rows.map((row) => {
    // Calculate unread count for this feed
    const unreadResult = db.prepare(`
      SELECT COUNT(*) as count FROM articles WHERE feed_id = ? AND is_read = 0
    `).get(row.id) as { count: number }

    return {
      id: row.id,
      title: row.title,
      url: row.url,
      siteUrl: row.site_url,
      favicon: row.favicon || '',
      folderId: row.folder_id,
      unreadCount: unreadResult.count,
      lastFetched: row.last_fetched || '',
    }
  })
}

export function createFeed(feed: Omit<Feed, 'unreadCount'>): Feed {
  const db = getDb()
  db.prepare(`
    INSERT INTO feeds (id, title, url, site_url, favicon, folder_id, last_fetched)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    feed.id,
    feed.title,
    feed.url,
    feed.siteUrl,
    feed.favicon || null,
    feed.folderId || null,
    feed.lastFetched || null
  )

  return { ...feed, unreadCount: 0, favicon: feed.favicon || '' }
}

// ============================================================================
// Articles
// ============================================================================

export function getAllArticles(): Article[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT id, feed_id, title, url, published_at, preview, content, is_read, is_starred
    FROM articles
    ORDER BY published_at DESC
  `).all() as ArticleRow[]

  return rows.map(rowToArticle)
}

export function getArticlesByFeed(feedId: string): Article[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT id, feed_id, title, url, published_at, preview, content, is_read, is_starred
    FROM articles
    WHERE feed_id = ?
    ORDER BY published_at DESC
  `).all(feedId) as ArticleRow[]

  return rows.map(rowToArticle)
}

export function getArticlesByFolder(folderId: string): Article[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT a.id, a.feed_id, a.title, a.url, a.published_at, a.preview, a.content, a.is_read, a.is_starred
    FROM articles a
    JOIN feeds f ON a.feed_id = f.id
    WHERE f.folder_id = ?
    ORDER BY a.published_at DESC
  `).all(folderId) as ArticleRow[]

  return rows.map(rowToArticle)
}

export function getUnreadArticles(): Article[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT id, feed_id, title, url, published_at, preview, content, is_read, is_starred
    FROM articles
    WHERE is_read = 0
    ORDER BY published_at DESC
  `).all() as ArticleRow[]

  return rows.map(rowToArticle)
}

export function getStarredArticles(): Article[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT id, feed_id, title, url, published_at, preview, content, is_read, is_starred
    FROM articles
    WHERE is_starred = 1
    ORDER BY published_at DESC
  `).all() as ArticleRow[]

  return rows.map(rowToArticle)
}

export function getArticleById(id: string): Article | null {
  const db = getDb()
  const row = db.prepare(`
    SELECT id, feed_id, title, url, published_at, preview, content, is_read, is_starred
    FROM articles
    WHERE id = ?
  `).get(id) as ArticleRow | undefined

  return row ? rowToArticle(row) : null
}

export function createArticle(article: Article): Article {
  const db = getDb()
  db.prepare(`
    INSERT INTO articles (id, feed_id, title, url, published_at, preview, content, is_read, is_starred)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(feed_id, url) DO UPDATE SET
      title = excluded.title,
      preview = excluded.preview,
      content = excluded.content,
      updated_at = datetime('now')
  `).run(
    article.id,
    article.feedId,
    article.title,
    article.url,
    article.publishedAt,
    article.preview,
    article.content,
    article.isRead ? 1 : 0,
    article.isStarred ? 1 : 0
  )

  return article
}

export function updateArticleReadStatus(id: string, isRead: boolean): void {
  const db = getDb()
  db.prepare(`
    UPDATE articles SET is_read = ?, updated_at = datetime('now') WHERE id = ?
  `).run(isRead ? 1 : 0, id)
}

export function updateArticleStarStatus(id: string, isStarred: boolean): void {
  const db = getDb()
  db.prepare(`
    UPDATE articles SET is_starred = ?, updated_at = datetime('now') WHERE id = ?
  `).run(isStarred ? 1 : 0, id)
}

export function markAllAsRead(feedId?: string, folderId?: string): void {
  const db = getDb()

  if (feedId) {
    db.prepare(`
      UPDATE articles SET is_read = 1, updated_at = datetime('now')
      WHERE feed_id = ?
    `).run(feedId)
  } else if (folderId) {
    db.prepare(`
      UPDATE articles SET is_read = 1, updated_at = datetime('now')
      WHERE feed_id IN (SELECT id FROM feeds WHERE folder_id = ?)
    `).run(folderId)
  } else {
    db.prepare(`
      UPDATE articles SET is_read = 1, updated_at = datetime('now')
    `).run()
  }
}

// ============================================================================
// Stats
// ============================================================================

export function getStats() {
  const db = getDb()

  const totalResult = db.prepare(`SELECT COUNT(*) as count FROM articles`).get() as { count: number }
  const unreadResult = db.prepare(`SELECT COUNT(*) as count FROM articles WHERE is_read = 0`).get() as { count: number }
  const starredResult = db.prepare(`SELECT COUNT(*) as count FROM articles WHERE is_starred = 1`).get() as { count: number }

  return {
    totalArticles: totalResult.count,
    unreadCount: unreadResult.count,
    starredCount: starredResult.count,
  }
}

// ============================================================================
// Helpers
// ============================================================================

function rowToArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    feedId: row.feed_id,
    title: row.title,
    url: row.url,
    publishedAt: row.published_at,
    preview: row.preview,
    content: row.content,
    isRead: row.is_read === 1,
    isStarred: row.is_starred === 1,
  }
}
