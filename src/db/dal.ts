import { Database } from "bun:sqlite";
import type { DbFolder, DbFeed, DbEntry } from "./schema";

// Types for API responses (matches frontend expectations)
export interface Feed {
  id: string;
  title: string;
  url: string;
  siteUrl: string | null;
  unreadCount: number;
}

export interface Folder {
  id: string;
  name: string;
  feeds: Feed[];
  isExpanded: boolean;
}

export interface Entry {
  id: string;
  feedId: string;
  feedTitle: string;
  title: string;
  author: string;
  url: string | null;
  publishedAt: string;
  content: string;
  isRead: boolean;
  isStarred: boolean;
}

export class DataAccessLayer {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // Folders
  getAllFoldersWithFeeds(): Folder[] {
    const folders = this.db.query(`
      SELECT * FROM folders ORDER BY name
    `).all() as DbFolder[];

    return folders.map((folder) => {
      const feeds = this.db.query(`
        SELECT
          f.*,
          (SELECT COUNT(*) FROM entries e WHERE e.feed_id = f.id AND e.is_read = 0) as unread_count
        FROM feeds f
        WHERE f.folder_id = ?
        ORDER BY f.title
      `).all(folder.id) as (DbFeed & { unread_count: number })[];

      return {
        id: `folder-${folder.id}`,
        name: folder.name,
        isExpanded: folder.is_expanded === 1,
        feeds: feeds.map((feed) => ({
          id: `feed-${feed.id}`,
          title: feed.title,
          url: feed.url,
          siteUrl: feed.site_url,
          unreadCount: feed.unread_count,
        })),
      };
    });
  }

  createFolder(name: string): Folder {
    const result = this.db.run(
      "INSERT INTO folders (name) VALUES (?)",
      [name]
    );
    const id = Number(result.lastInsertRowid);
    return {
      id: `folder-${id}`,
      name,
      isExpanded: true,
      feeds: [],
    };
  }

  updateFolder(id: number, data: { name?: string; isExpanded?: boolean }): void {
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name);
    }
    if (data.isExpanded !== undefined) {
      updates.push("is_expanded = ?");
      values.push(data.isExpanded ? 1 : 0);
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')");
      values.push(id);
      this.db.run(
        `UPDATE folders SET ${updates.join(", ")} WHERE id = ?`,
        values
      );
    }
  }

  deleteFolder(id: number): void {
    this.db.run("DELETE FROM folders WHERE id = ?", [id]);
  }

  // Feeds
  getFeedById(id: number): Feed | null {
    const feed = this.db.query(`
      SELECT
        f.*,
        (SELECT COUNT(*) FROM entries e WHERE e.feed_id = f.id AND e.is_read = 0) as unread_count
      FROM feeds f
      WHERE f.id = ?
    `).get(id) as (DbFeed & { unread_count: number }) | null;

    if (!feed) return null;

    return {
      id: `feed-${feed.id}`,
      title: feed.title,
      url: feed.url,
      siteUrl: feed.site_url,
      unreadCount: feed.unread_count,
    };
  }

  createFeed(folderId: number, title: string, url: string, siteUrl?: string): Feed {
    const result = this.db.run(
      "INSERT INTO feeds (folder_id, title, url, site_url) VALUES (?, ?, ?, ?)",
      [folderId, title, url, siteUrl || null]
    );
    const id = Number(result.lastInsertRowid);
    return {
      id: `feed-${id}`,
      title,
      url,
      siteUrl: siteUrl || null,
      unreadCount: 0,
    };
  }

  updateFeed(id: number, data: { title?: string; folderId?: number }): void {
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (data.title !== undefined) {
      updates.push("title = ?");
      values.push(data.title);
    }
    if (data.folderId !== undefined) {
      updates.push("folder_id = ?");
      values.push(data.folderId);
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')");
      values.push(id);
      this.db.run(
        `UPDATE feeds SET ${updates.join(", ")} WHERE id = ?`,
        values
      );
    }
  }

  deleteFeed(id: number): void {
    this.db.run("DELETE FROM feeds WHERE id = ?", [id]);
  }

  // Entries
  getAllEntries(options?: { feedId?: number; starred?: boolean; unread?: boolean }): Entry[] {
    let query = `
      SELECT e.*, f.title as feed_title
      FROM entries e
      JOIN feeds f ON e.feed_id = f.id
      WHERE 1=1
    `;
    const params: (number | string)[] = [];

    if (options?.feedId !== undefined) {
      query += " AND e.feed_id = ?";
      params.push(options.feedId);
    }
    if (options?.starred !== undefined) {
      query += " AND e.is_starred = ?";
      params.push(options.starred ? 1 : 0);
    }
    if (options?.unread !== undefined) {
      query += " AND e.is_read = ?";
      params.push(options.unread ? 0 : 1);
    }

    query += " ORDER BY e.published_at DESC";

    const entries = this.db.query(query).all(...params) as (DbEntry & { feed_title: string })[];

    return entries.map((entry) => this.formatEntry(entry));
  }

  getEntryById(id: number): Entry | null {
    const entry = this.db.query(`
      SELECT e.*, f.title as feed_title
      FROM entries e
      JOIN feeds f ON e.feed_id = f.id
      WHERE e.id = ?
    `).get(id) as (DbEntry & { feed_title: string }) | null;

    if (!entry) return null;
    return this.formatEntry(entry);
  }

  createEntry(data: {
    feedId: number;
    title: string;
    author?: string;
    url?: string;
    content: string;
    publishedAt: string;
  }): Entry {
    const result = this.db.run(
      `INSERT INTO entries (feed_id, title, author, url, content, published_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.feedId, data.title, data.author || null, data.url || null, data.content, data.publishedAt]
    );
    const id = Number(result.lastInsertRowid);
    const entry = this.getEntryById(id);
    if (!entry) throw new Error("Failed to create entry");
    return entry;
  }

  updateEntry(id: number, data: { isRead?: boolean; isStarred?: boolean }): void {
    const updates: string[] = [];
    const values: (number)[] = [];

    if (data.isRead !== undefined) {
      updates.push("is_read = ?");
      values.push(data.isRead ? 1 : 0);
    }
    if (data.isStarred !== undefined) {
      updates.push("is_starred = ?");
      values.push(data.isStarred ? 1 : 0);
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')");
      values.push(id);
      this.db.run(
        `UPDATE entries SET ${updates.join(", ")} WHERE id = ?`,
        values
      );
    }
  }

  markAllAsRead(feedId?: number): void {
    if (feedId !== undefined) {
      this.db.run(
        "UPDATE entries SET is_read = 1, updated_at = datetime('now') WHERE feed_id = ?",
        [feedId]
      );
    } else {
      this.db.run("UPDATE entries SET is_read = 1, updated_at = datetime('now')");
    }
  }

  deleteEntry(id: number): void {
    this.db.run("DELETE FROM entries WHERE id = ?", [id]);
  }

  // Stats
  getStats(): { totalEntries: number; unreadCount: number; starredCount: number } {
    const stats = this.db.query(`
      SELECT
        COUNT(*) as total_entries,
        SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread_count,
        SUM(CASE WHEN is_starred = 1 THEN 1 ELSE 0 END) as starred_count
      FROM entries
    `).get() as { total_entries: number; unread_count: number; starred_count: number };

    return {
      totalEntries: stats.total_entries,
      unreadCount: stats.unread_count || 0,
      starredCount: stats.starred_count || 0,
    };
  }

  private formatEntry(entry: DbEntry & { feed_title: string }): Entry {
    return {
      id: `entry-${entry.id}`,
      feedId: `feed-${entry.feed_id}`,
      feedTitle: entry.feed_title,
      title: entry.title,
      author: entry.author || "Unknown",
      url: entry.url,
      publishedAt: this.formatRelativeTime(entry.published_at),
      content: entry.content,
      isRead: entry.is_read === 1,
      isStarred: entry.is_starred === 1,
    };
  }

  private formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return diffMins <= 1 ? "just now" : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}
