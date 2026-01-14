import { getDatabase } from "../index";
import type { Subscription, SubscriptionWithFeed, Feed } from "../types";

export function subscribe(feedId: number, folderId?: number): Subscription {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO subscriptions (feed_id, folder_id)
    VALUES (?, ?)
  `);

  const result = stmt.run(feedId, folderId ?? null);
  return getSubscriptionById(Number(result.lastInsertRowid))!;
}

function getSubscriptionById(id: number): Subscription | null {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM subscriptions WHERE id = ?");
  return stmt.get(id) as Subscription | null;
}

export function unsubscribe(feedId: number): void {
  const db = getDatabase();
  const stmt = db.prepare("DELETE FROM subscriptions WHERE feed_id = ?");
  stmt.run(feedId);
}

export function moveToFolder(feedId: number, folderId: number | null): void {
  const db = getDatabase();
  const stmt = db.prepare("UPDATE subscriptions SET folder_id = ? WHERE feed_id = ?");
  stmt.run(folderId, feedId);
}

export function getSubscriptions(): SubscriptionWithFeed[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT
      s.*,
      f.id as feed_id,
      f.title as feed_title,
      f.url as feed_url,
      f.site_url as feed_site_url,
      f.favicon_url as feed_favicon_url,
      f.created_at as feed_created_at,
      f.updated_at as feed_updated_at,
      (
        SELECT COUNT(*)
        FROM entries e
        LEFT JOIN read_status rs ON e.id = rs.entry_id
        WHERE e.feed_id = f.id AND rs.entry_id IS NULL
      ) as unread_count
    FROM subscriptions s
    INNER JOIN feeds f ON s.feed_id = f.id
    ORDER BY f.title
  `);

  const rows = stmt.all() as SubscriptionRow[];
  return rows.map(mapSubscriptionRow);
}

export function getSubscriptionsByFolder(folderId: number): SubscriptionWithFeed[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT
      s.*,
      f.id as feed_id,
      f.title as feed_title,
      f.url as feed_url,
      f.site_url as feed_site_url,
      f.favicon_url as feed_favicon_url,
      f.created_at as feed_created_at,
      f.updated_at as feed_updated_at,
      (
        SELECT COUNT(*)
        FROM entries e
        LEFT JOIN read_status rs ON e.id = rs.entry_id
        WHERE e.feed_id = f.id AND rs.entry_id IS NULL
      ) as unread_count
    FROM subscriptions s
    INNER JOIN feeds f ON s.feed_id = f.id
    WHERE s.folder_id = ?
    ORDER BY f.title
  `);

  const rows = stmt.all(folderId) as SubscriptionRow[];
  return rows.map(mapSubscriptionRow);
}

// Helper type for raw query results
interface SubscriptionRow {
  id: number;
  feed_id: number;
  folder_id: number | null;
  title_override: string | null;
  created_at: string;
  feed_title: string;
  feed_url: string;
  feed_site_url: string | null;
  feed_favicon_url: string | null;
  feed_created_at: string;
  feed_updated_at: string;
  unread_count: number;
}

function mapSubscriptionRow(row: SubscriptionRow): SubscriptionWithFeed {
  const feed: Feed = {
    id: row.feed_id,
    title: row.feed_title,
    url: row.feed_url,
    site_url: row.feed_site_url,
    favicon_url: row.feed_favicon_url,
    created_at: row.feed_created_at,
    updated_at: row.feed_updated_at,
  };

  return {
    id: row.id,
    feed_id: row.feed_id,
    folder_id: row.folder_id,
    title_override: row.title_override,
    created_at: row.created_at,
    feed,
    unread_count: row.unread_count,
  };
}
