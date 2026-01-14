import { getDatabase } from "../index";
import type { Entry, NewEntry, EntryWithStatus, PaginationOptions, GetEntriesOptions } from "../types";

export function createEntry(entry: NewEntry): Entry {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO entries (feed_id, guid, title, url, author, content, summary, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    entry.feed_id,
    entry.guid,
    entry.title ?? null,
    entry.url ?? null,
    entry.author ?? null,
    entry.content ?? null,
    entry.summary ?? null,
    entry.published_at ?? null
  );

  return getEntryById(Number(result.lastInsertRowid))!;
}

export function getEntryById(id: number): Entry | null {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM entries WHERE id = ?");
  return stmt.get(id) as Entry | null;
}

export function getEntryByGuid(feedId: number, guid: string): Entry | null {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM entries WHERE feed_id = ? AND guid = ?");
  return stmt.get(feedId, guid) as Entry | null;
}

export function getEntriesByFeed(
  feedId: number,
  options: PaginationOptions = {}
): EntryWithStatus[] {
  const db = getDatabase();
  const { limit = 50, offset = 0 } = options;

  const stmt = db.prepare(`
    SELECT
      e.*,
      CASE WHEN rs.entry_id IS NOT NULL THEN 1 ELSE 0 END as is_read,
      CASE WHEN s.entry_id IS NOT NULL THEN 1 ELSE 0 END as is_starred
    FROM entries e
    LEFT JOIN read_status rs ON e.id = rs.entry_id
    LEFT JOIN starred s ON e.id = s.entry_id
    WHERE e.feed_id = ?
    ORDER BY e.published_at DESC, e.created_at DESC
    LIMIT ? OFFSET ?
  `);

  const rows = stmt.all(feedId, limit, offset) as (Entry & { is_read: number; is_starred: number })[];
  return rows.map((row) => ({
    ...row,
    is_read: row.is_read === 1,
    is_starred: row.is_starred === 1,
  }));
}

export function getUnreadEntries(options: GetEntriesOptions = {}): EntryWithStatus[] {
  const db = getDatabase();
  const { feedId, folderId, limit = 50, offset = 0 } = options;

  let query = `
    SELECT
      e.*,
      0 as is_read,
      CASE WHEN s.entry_id IS NOT NULL THEN 1 ELSE 0 END as is_starred
    FROM entries e
    LEFT JOIN read_status rs ON e.id = rs.entry_id
    LEFT JOIN starred s ON e.id = s.entry_id
    WHERE rs.entry_id IS NULL
  `;

  const params: (number | string)[] = [];

  if (feedId !== undefined) {
    query += " AND e.feed_id = ?";
    params.push(feedId);
  }

  if (folderId !== undefined) {
    query += `
      AND e.feed_id IN (
        SELECT feed_id FROM subscriptions WHERE folder_id = ?
      )
    `;
    params.push(folderId);
  }

  query += " ORDER BY e.published_at DESC, e.created_at DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const stmt = db.prepare(query);
  const rows = stmt.all(...params) as (Entry & { is_read: number; is_starred: number })[];
  return rows.map((row) => ({
    ...row,
    is_read: false,
    is_starred: row.is_starred === 1,
  }));
}

export function getStarredEntries(options: PaginationOptions = {}): EntryWithStatus[] {
  const db = getDatabase();
  const { limit = 50, offset = 0 } = options;

  const stmt = db.prepare(`
    SELECT
      e.*,
      CASE WHEN rs.entry_id IS NOT NULL THEN 1 ELSE 0 END as is_read,
      1 as is_starred
    FROM entries e
    INNER JOIN starred s ON e.id = s.entry_id
    LEFT JOIN read_status rs ON e.id = rs.entry_id
    ORDER BY s.starred_at DESC
    LIMIT ? OFFSET ?
  `);

  const rows = stmt.all(limit, offset) as (Entry & { is_read: number; is_starred: number })[];
  return rows.map((row) => ({
    ...row,
    is_read: row.is_read === 1,
    is_starred: true,
  }));
}

export function markAsRead(entryId: number): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO read_status (entry_id)
    VALUES (?)
  `);
  stmt.run(entryId);
}

export function markAsUnread(entryId: number): void {
  const db = getDatabase();
  const stmt = db.prepare("DELETE FROM read_status WHERE entry_id = ?");
  stmt.run(entryId);
}

export function markFeedAsRead(feedId: number): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO read_status (entry_id)
    SELECT id FROM entries WHERE feed_id = ?
  `);
  stmt.run(feedId);
}

export function toggleStar(entryId: number): boolean {
  const db = getDatabase();

  // Check if already starred
  const checkStmt = db.prepare("SELECT entry_id FROM starred WHERE entry_id = ?");
  const existing = checkStmt.get(entryId);

  if (existing) {
    // Unstar
    const deleteStmt = db.prepare("DELETE FROM starred WHERE entry_id = ?");
    deleteStmt.run(entryId);
    return false;
  } else {
    // Star
    const insertStmt = db.prepare("INSERT INTO starred (entry_id) VALUES (?)");
    insertStmt.run(entryId);
    return true;
  }
}
