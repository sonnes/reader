// Schema definitions for the Google Reader clone database

export const SCHEMA = {
  feeds: `
    CREATE TABLE IF NOT EXISTS feeds (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      site_url TEXT,
      favicon_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `,

  entries: `
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY,
      feed_id INTEGER NOT NULL,
      guid TEXT NOT NULL,
      title TEXT,
      url TEXT,
      author TEXT,
      content TEXT,
      summary TEXT,
      published_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (feed_id) REFERENCES feeds(id) ON DELETE CASCADE,
      UNIQUE (feed_id, guid)
    )
  `,

  subscriptions: `
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY,
      feed_id INTEGER NOT NULL,
      folder_id INTEGER,
      title_override TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (feed_id) REFERENCES feeds(id) ON DELETE CASCADE,
      FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
    )
  `,

  folders: `
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `,

  read_status: `
    CREATE TABLE IF NOT EXISTS read_status (
      entry_id INTEGER PRIMARY KEY,
      read_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
    )
  `,

  starred: `
    CREATE TABLE IF NOT EXISTS starred (
      entry_id INTEGER PRIMARY KEY,
      starred_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
    )
  `,
};

// Indexes for common queries
export const INDEXES = [
  "CREATE INDEX IF NOT EXISTS idx_entries_feed_id ON entries(feed_id)",
  "CREATE INDEX IF NOT EXISTS idx_entries_published_at ON entries(published_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_entries_feed_published ON entries(feed_id, published_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_subscriptions_feed_id ON subscriptions(feed_id)",
  "CREATE INDEX IF NOT EXISTS idx_subscriptions_folder_id ON subscriptions(folder_id)",
  "CREATE INDEX IF NOT EXISTS idx_folders_sort_order ON folders(sort_order)",
];
