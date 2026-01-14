import { Database } from "bun:sqlite";

export interface DbFolder {
  id: number;
  name: string;
  is_expanded: number; // SQLite doesn't have boolean, use 0/1
  created_at: string;
  updated_at: string;
}

export interface DbFeed {
  id: number;
  folder_id: number;
  title: string;
  url: string;
  site_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbEntry {
  id: number;
  feed_id: number;
  title: string;
  author: string | null;
  url: string | null;
  content: string;
  published_at: string;
  is_read: number;
  is_starred: number;
  created_at: string;
  updated_at: string;
}

export function initializeDatabase(db: Database): void {
  // Create folders table
  db.run(`
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      is_expanded INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Create feeds table
  db.run(`
    CREATE TABLE IF NOT EXISTS feeds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      folder_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      site_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
    )
  `);

  // Create entries table
  db.run(`
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      feed_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      author TEXT,
      url TEXT,
      content TEXT NOT NULL,
      published_at TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      is_starred INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (feed_id) REFERENCES feeds(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better query performance
  db.run(`CREATE INDEX IF NOT EXISTS idx_feeds_folder_id ON feeds(folder_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_entries_feed_id ON entries(feed_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_entries_is_read ON entries(is_read)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_entries_is_starred ON entries(is_starred)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_entries_published_at ON entries(published_at)`);
}

export function seedDatabase(db: Database): void {
  // Check if we already have data
  const count = db.query("SELECT COUNT(*) as count FROM folders").get() as { count: number };
  if (count.count > 0) return;

  // Seed folders
  const folders = [
    { name: "News", is_expanded: 1 },
    { name: "Tech Blogs", is_expanded: 1 },
    { name: "Personal", is_expanded: 0 },
  ];

  const insertFolder = db.prepare("INSERT INTO folders (name, is_expanded) VALUES (?, ?)");
  for (const folder of folders) {
    insertFolder.run(folder.name, folder.is_expanded);
  }

  // Seed feeds
  const feeds = [
    { folder_id: 1, title: "The Verge", url: "https://www.theverge.com/rss/index.xml", site_url: "https://www.theverge.com" },
    { folder_id: 1, title: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", site_url: "https://arstechnica.com" },
    { folder_id: 1, title: "Hacker News", url: "https://news.ycombinator.com/rss", site_url: "https://news.ycombinator.com" },
    { folder_id: 2, title: "CSS-Tricks", url: "https://css-tricks.com/feed/", site_url: "https://css-tricks.com" },
    { folder_id: 2, title: "Smashing Magazine", url: "https://www.smashingmagazine.com/feed/", site_url: "https://www.smashingmagazine.com" },
    { folder_id: 3, title: "Wait But Why", url: "https://waitbutwhy.com/feed", site_url: "https://waitbutwhy.com" },
    { folder_id: 3, title: "Brain Pickings", url: "https://www.themarginalian.org/feed/", site_url: "https://www.themarginalian.org" },
  ];

  const insertFeed = db.prepare("INSERT INTO feeds (folder_id, title, url, site_url) VALUES (?, ?, ?, ?)");
  for (const feed of feeds) {
    insertFeed.run(feed.folder_id, feed.title, feed.url, feed.site_url);
  }

  // Seed entries
  const entries = [
    {
      feed_id: 1,
      title: "Apple announces new MacBook Pro with M4 chip",
      author: "Nilay Patel",
      url: "https://www.theverge.com/2024/macbook-pro-m4",
      content: `<p>Apple has announced its latest MacBook Pro lineup featuring the new M4 chip, promising significant performance improvements over the previous generation.</p>
      <p>The new M4 chip brings a 10-core CPU and up to a 16-core GPU, delivering up to 50% faster performance compared to the M3. Apple claims the new machines can handle demanding workflows like 8K video editing and complex 3D rendering with ease.</p>
      <p>"This is the most powerful MacBook Pro we've ever made," said Apple's senior vice president of Hardware Engineering. "The M4 chip represents a major leap forward in both performance and efficiency."</p>
      <p>The new MacBook Pro starts at $1,999 for the 14-inch model and $2,499 for the 16-inch model. Both are available for pre-order today and will ship next week.</p>`,
      published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      is_read: 0,
      is_starred: 0,
    },
    {
      feed_id: 2,
      title: "Scientists discover high-temperature superconductor breakthrough",
      author: "John Timmer",
      url: "https://arstechnica.com/science/superconductor-breakthrough",
      content: `<p>Researchers at a major university have announced a breakthrough in high-temperature superconductivity that could revolutionize energy transmission and storage.</p>
      <p>The new material, a complex oxide compound, exhibits superconducting properties at temperatures up to 250 Kelvin (-23°C), significantly higher than previous records. While still below room temperature, this represents a major step toward practical superconducting applications.</p>
      <p>The implications for power grids, magnetic levitation, and quantum computing are substantial.</p>`,
      published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      is_read: 0,
      is_starred: 1,
    },
    {
      feed_id: 3,
      title: "Show HN: I built a privacy-focused analytics platform",
      author: "techfounder",
      url: "https://news.ycombinator.com/item?id=12345",
      content: `<p>I've been working on this for the past year and finally ready to share it with the community.</p>
      <p>The platform provides comprehensive web analytics without using cookies or tracking personal data. All data is aggregated and anonymized by default.</p>
      <p>Key features include real-time dashboards, conversion tracking, and A/B testing - all while maintaining strict privacy standards.</p>
      <p>Would love to hear your feedback!</p>`,
      published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      is_read: 1,
      is_starred: 0,
    },
    {
      feed_id: 4,
      title: "A Complete Guide to CSS Container Queries",
      author: "Chris Coyier",
      url: "https://css-tricks.com/container-queries-guide",
      content: `<p>Container queries are finally here, and they're changing how we think about responsive design.</p>
      <p>Unlike media queries which respond to the viewport, container queries let you style elements based on their container's size. This makes truly reusable, context-aware components possible.</p>
      <pre><code>@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}</code></pre>
      <p>Browser support is now excellent across all major browsers.</p>`,
      published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      is_read: 1,
      is_starred: 0,
    },
    {
      feed_id: 1,
      title: "Google announces major Android update with AI features",
      author: "David Pierce",
      url: "https://www.theverge.com/2024/android-ai-update",
      content: `<p>Google's latest Android update brings a suite of AI-powered features designed to make everyday tasks easier.</p>
      <p>The update includes smart reply suggestions, automatic photo organization, and real-time translation in messaging apps.</p>`,
      published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      is_read: 0,
      is_starred: 0,
    },
    {
      feed_id: 5,
      title: "Modern CSS Architecture: A Practical Guide",
      author: "Vitaly Friedman",
      url: "https://www.smashingmagazine.com/modern-css-architecture",
      content: `<p>How do you structure CSS in large-scale projects? Here's a practical guide to modern CSS architecture patterns.</p>
      <p>We'll explore utility-first approaches, component-based styling, and the role of CSS custom properties in creating maintainable stylesheets.</p>`,
      published_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      is_read: 1,
      is_starred: 1,
    },
  ];

  const insertEntry = db.prepare(`
    INSERT INTO entries (feed_id, title, author, url, content, published_at, is_read, is_starred)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const entry of entries) {
    insertEntry.run(
      entry.feed_id,
      entry.title,
      entry.author,
      entry.url,
      entry.content,
      entry.published_at,
      entry.is_read,
      entry.is_starred
    );
  }
}
