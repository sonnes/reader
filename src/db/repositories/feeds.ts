import { getDatabase } from "../index";
import type { Feed, NewFeed } from "../types";

export function createFeed(feed: NewFeed): Feed {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO feeds (title, url, site_url, favicon_url)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(
    feed.title,
    feed.url,
    feed.site_url ?? null,
    feed.favicon_url ?? null
  );

  return getFeedById(Number(result.lastInsertRowid))!;
}

export function getFeedById(id: number): Feed | null {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM feeds WHERE id = ?");
  return stmt.get(id) as Feed | null;
}

export function getFeedByUrl(url: string): Feed | null {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM feeds WHERE url = ?");
  return stmt.get(url) as Feed | null;
}

export function getAllFeeds(): Feed[] {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM feeds ORDER BY title");
  return stmt.all() as Feed[];
}

export function updateFeed(id: number, updates: Partial<NewFeed>): Feed {
  const db = getDatabase();

  const setClauses: string[] = [];
  const values: (string | null)[] = [];

  if (updates.title !== undefined) {
    setClauses.push("title = ?");
    values.push(updates.title);
  }
  if (updates.url !== undefined) {
    setClauses.push("url = ?");
    values.push(updates.url);
  }
  if (updates.site_url !== undefined) {
    setClauses.push("site_url = ?");
    values.push(updates.site_url ?? null);
  }
  if (updates.favicon_url !== undefined) {
    setClauses.push("favicon_url = ?");
    values.push(updates.favicon_url ?? null);
  }

  if (setClauses.length > 0) {
    setClauses.push("updated_at = datetime('now')");
    const stmt = db.prepare(
      `UPDATE feeds SET ${setClauses.join(", ")} WHERE id = ?`
    );
    stmt.run(...values, id);
  }

  return getFeedById(id)!;
}

export function deleteFeed(id: number): void {
  const db = getDatabase();
  const stmt = db.prepare("DELETE FROM feeds WHERE id = ?");
  stmt.run(id);
}
