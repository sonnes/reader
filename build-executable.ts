import { $ } from "bun";
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";

// Collect all files from a directory
function collectFiles(dir: string, basePath: string = ""): Record<string, string> {
  const files: Record<string, string> = {};

  if (!existsSync(dir)) {
    return files;
  }

  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const relativePath = basePath ? `${basePath}/${entry}` : entry;
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      Object.assign(files, collectFiles(fullPath, relativePath));
    } else {
      files[relativePath] = readFileSync(fullPath, "base64");
    }
  }

  return files;
}

async function build() {
  console.log("Collecting dist files...");
  const distFiles = collectFiles("./dist");

  // Create the bundled server code that embeds all static files and includes full backend
  const serverCode = `
import { Database } from "bun:sqlite";
import { extname } from "path";

const PORT = parseInt(process.env.PORT || "3000", 10);

// MIME types for static files
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
};

// Embedded static files from dist
const DIST_FILES: Record<string, string> = ${JSON.stringify(distFiles, null, 2)};

function getContentType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

function decodeFile(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

// ============== DATABASE SCHEMA ==============

interface DbFolder {
  id: number;
  name: string;
  is_expanded: number;
  created_at: string;
  updated_at: string;
}

interface DbFeed {
  id: number;
  folder_id: number;
  title: string;
  url: string;
  site_url: string | null;
  created_at: string;
  updated_at: string;
}

interface DbEntry {
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

function initializeDatabase(db: Database): void {
  db.run(\`
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      is_expanded INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  \`);

  db.run(\`
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
  \`);

  db.run(\`
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
  \`);

  db.run(\`CREATE INDEX IF NOT EXISTS idx_feeds_folder_id ON feeds(folder_id)\`);
  db.run(\`CREATE INDEX IF NOT EXISTS idx_entries_feed_id ON entries(feed_id)\`);
  db.run(\`CREATE INDEX IF NOT EXISTS idx_entries_is_read ON entries(is_read)\`);
  db.run(\`CREATE INDEX IF NOT EXISTS idx_entries_is_starred ON entries(is_starred)\`);
  db.run(\`CREATE INDEX IF NOT EXISTS idx_entries_published_at ON entries(published_at)\`);
}

function seedDatabase(db: Database): void {
  const count = db.query("SELECT COUNT(*) as count FROM folders").get() as { count: number };
  if (count.count > 0) return;

  const folders = [
    { name: "News", is_expanded: 1 },
    { name: "Tech Blogs", is_expanded: 1 },
    { name: "Personal", is_expanded: 0 },
  ];

  const insertFolder = db.prepare("INSERT INTO folders (name, is_expanded) VALUES (?, ?)");
  for (const folder of folders) {
    insertFolder.run(folder.name, folder.is_expanded);
  }

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

  const entries = [
    {
      feed_id: 1,
      title: "Apple announces new MacBook Pro with M4 chip",
      author: "Nilay Patel",
      url: "https://www.theverge.com/2024/macbook-pro-m4",
      content: \`<p>Apple has announced its latest MacBook Pro lineup featuring the new M4 chip, promising significant performance improvements over the previous generation.</p>
      <p>The new M4 chip brings a 10-core CPU and up to a 16-core GPU, delivering up to 50% faster performance compared to the M3. Apple claims the new machines can handle demanding workflows like 8K video editing and complex 3D rendering with ease.</p>
      <p>"This is the most powerful MacBook Pro we've ever made," said Apple's senior vice president of Hardware Engineering. "The M4 chip represents a major leap forward in both performance and efficiency."</p>
      <p>The new MacBook Pro starts at $1,999 for the 14-inch model and $2,499 for the 16-inch model. Both are available for pre-order today and will ship next week.</p>\`,
      published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      is_read: 0,
      is_starred: 0,
    },
    {
      feed_id: 2,
      title: "Scientists discover high-temperature superconductor breakthrough",
      author: "John Timmer",
      url: "https://arstechnica.com/science/superconductor-breakthrough",
      content: \`<p>Researchers at a major university have announced a breakthrough in high-temperature superconductivity that could revolutionize energy transmission and storage.</p>
      <p>The new material, a complex oxide compound, exhibits superconducting properties at temperatures up to 250 Kelvin (-23°C), significantly higher than previous records. While still below room temperature, this represents a major step toward practical superconducting applications.</p>
      <p>The implications for power grids, magnetic levitation, and quantum computing are substantial.</p>\`,
      published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      is_read: 0,
      is_starred: 1,
    },
    {
      feed_id: 3,
      title: "Show HN: I built a privacy-focused analytics platform",
      author: "techfounder",
      url: "https://news.ycombinator.com/item?id=12345",
      content: \`<p>I've been working on this for the past year and finally ready to share it with the community.</p>
      <p>The platform provides comprehensive web analytics without using cookies or tracking personal data. All data is aggregated and anonymized by default.</p>
      <p>Key features include real-time dashboards, conversion tracking, and A/B testing - all while maintaining strict privacy standards.</p>
      <p>Would love to hear your feedback!</p>\`,
      published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      is_read: 1,
      is_starred: 0,
    },
    {
      feed_id: 4,
      title: "A Complete Guide to CSS Container Queries",
      author: "Chris Coyier",
      url: "https://css-tricks.com/container-queries-guide",
      content: \`<p>Container queries are finally here, and they're changing how we think about responsive design.</p>
      <p>Unlike media queries which respond to the viewport, container queries let you style elements based on their container's size. This makes truly reusable, context-aware components possible.</p>
      <pre><code>@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}</code></pre>
      <p>Browser support is now excellent across all major browsers.</p>\`,
      published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      is_read: 1,
      is_starred: 0,
    },
    {
      feed_id: 1,
      title: "Google announces major Android update with AI features",
      author: "David Pierce",
      url: "https://www.theverge.com/2024/android-ai-update",
      content: \`<p>Google's latest Android update brings a suite of AI-powered features designed to make everyday tasks easier.</p>
      <p>The update includes smart reply suggestions, automatic photo organization, and real-time translation in messaging apps.</p>\`,
      published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      is_read: 0,
      is_starred: 0,
    },
    {
      feed_id: 5,
      title: "Modern CSS Architecture: A Practical Guide",
      author: "Vitaly Friedman",
      url: "https://www.smashingmagazine.com/modern-css-architecture",
      content: \`<p>How do you structure CSS in large-scale projects? Here's a practical guide to modern CSS architecture patterns.</p>
      <p>We'll explore utility-first approaches, component-based styling, and the role of CSS custom properties in creating maintainable stylesheets.</p>\`,
      published_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      is_read: 1,
      is_starred: 1,
    },
  ];

  const insertEntry = db.prepare(\`
    INSERT INTO entries (feed_id, title, author, url, content, published_at, is_read, is_starred)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  \`);

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

// ============== DATA ACCESS LAYER ==============

interface Feed {
  id: string;
  title: string;
  url: string;
  siteUrl: string | null;
  unreadCount: number;
}

interface Folder {
  id: string;
  name: string;
  feeds: Feed[];
  isExpanded: boolean;
}

interface Entry {
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

class DataAccessLayer {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  getAllFoldersWithFeeds(): Folder[] {
    const folders = this.db.query(\`
      SELECT * FROM folders ORDER BY name
    \`).all() as DbFolder[];

    return folders.map((folder) => {
      const feeds = this.db.query(\`
        SELECT
          f.*,
          (SELECT COUNT(*) FROM entries e WHERE e.feed_id = f.id AND e.is_read = 0) as unread_count
        FROM feeds f
        WHERE f.folder_id = ?
        ORDER BY f.title
      \`).all(folder.id) as (DbFeed & { unread_count: number })[];

      return {
        id: \`folder-\${folder.id}\`,
        name: folder.name,
        isExpanded: folder.is_expanded === 1,
        feeds: feeds.map((feed) => ({
          id: \`feed-\${feed.id}\`,
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
      id: \`folder-\${id}\`,
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
        \`UPDATE folders SET \${updates.join(", ")} WHERE id = ?\`,
        values
      );
    }
  }

  deleteFolder(id: number): void {
    this.db.run("DELETE FROM folders WHERE id = ?", [id]);
  }

  getFeedById(id: number): Feed | null {
    const feed = this.db.query(\`
      SELECT
        f.*,
        (SELECT COUNT(*) FROM entries e WHERE e.feed_id = f.id AND e.is_read = 0) as unread_count
      FROM feeds f
      WHERE f.id = ?
    \`).get(id) as (DbFeed & { unread_count: number }) | null;

    if (!feed) return null;

    return {
      id: \`feed-\${feed.id}\`,
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
      id: \`feed-\${id}\`,
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
        \`UPDATE feeds SET \${updates.join(", ")} WHERE id = ?\`,
        values
      );
    }
  }

  deleteFeed(id: number): void {
    this.db.run("DELETE FROM feeds WHERE id = ?", [id]);
  }

  getAllEntries(options?: { feedId?: number; starred?: boolean; unread?: boolean }): Entry[] {
    let query = \`
      SELECT e.*, f.title as feed_title
      FROM entries e
      JOIN feeds f ON e.feed_id = f.id
      WHERE 1=1
    \`;
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
    const entry = this.db.query(\`
      SELECT e.*, f.title as feed_title
      FROM entries e
      JOIN feeds f ON e.feed_id = f.id
      WHERE e.id = ?
    \`).get(id) as (DbEntry & { feed_title: string }) | null;

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
      \`INSERT INTO entries (feed_id, title, author, url, content, published_at)
       VALUES (?, ?, ?, ?, ?, ?)\`,
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
        \`UPDATE entries SET \${updates.join(", ")} WHERE id = ?\`,
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

  getStats(): { totalEntries: number; unreadCount: number; starredCount: number } {
    const stats = this.db.query(\`
      SELECT
        COUNT(*) as total_entries,
        SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread_count,
        SUM(CASE WHEN is_starred = 1 THEN 1 ELSE 0 END) as starred_count
      FROM entries
    \`).get() as { total_entries: number; unread_count: number; starred_count: number };

    return {
      totalEntries: stats.total_entries,
      unreadCount: stats.unread_count || 0,
      starredCount: stats.starred_count || 0,
    };
  }

  private formatEntry(entry: DbEntry & { feed_title: string }): Entry {
    return {
      id: \`entry-\${entry.id}\`,
      feedId: \`feed-\${entry.feed_id}\`,
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
      return diffMins <= 1 ? "just now" : \`\${diffMins} minutes ago\`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? "1 hour ago" : \`\${diffHours} hours ago\`;
    } else if (diffDays < 7) {
      return diffDays === 1 ? "1 day ago" : \`\${diffDays} days ago\`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

// ============== DATABASE SINGLETON ==============

let db: Database | null = null;
let dal: DataAccessLayer | null = null;

function getDatabase(): Database {
  if (!db) {
    db = new Database("reader.db");
    db.run("PRAGMA foreign_keys = ON");
    initializeDatabase(db);
    seedDatabase(db);
  }
  return db;
}

function getDAL(): DataAccessLayer {
  if (!dal) {
    dal = new DataAccessLayer(getDatabase());
  }
  return dal;
}

function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    dal = null;
  }
}

// ============== API HELPERS ==============

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

function parseId(idStr: string): number {
  const match = idStr.match(/\\d+/);
  return match ? parseInt(match[0], 10) : NaN;
}

// ============== API ROUTE HANDLERS ==============

async function handleApiRequest(request: Request, url: URL): Promise<Response> {
  const dalInstance = getDAL();
  const method = request.method;
  const path = url.pathname;

  // GET /api/folders
  if (method === "GET" && path === "/api/folders") {
    const folders = dalInstance.getAllFoldersWithFeeds();
    return jsonResponse(folders);
  }

  // PATCH /api/folders/:id
  if (method === "PATCH" && path.startsWith("/api/folders/")) {
    const id = parseId(path.split("/").pop() || "");
    if (isNaN(id)) return errorResponse("Invalid folder ID", 400);

    const body = await request.json() as { name?: string; isExpanded?: boolean };
    dalInstance.updateFolder(id, body);
    return jsonResponse({ success: true });
  }

  // DELETE /api/folders/:id
  if (method === "DELETE" && path.startsWith("/api/folders/")) {
    const id = parseId(path.split("/").pop() || "");
    if (isNaN(id)) return errorResponse("Invalid folder ID", 400);

    dalInstance.deleteFolder(id);
    return jsonResponse({ success: true });
  }

  // POST /api/folders
  if (method === "POST" && path === "/api/folders") {
    const body = await request.json() as { name: string };
    if (!body.name) return errorResponse("Name is required", 400);

    const folder = dalInstance.createFolder(body.name);
    return jsonResponse(folder, 201);
  }

  // GET /api/entries
  if (method === "GET" && path === "/api/entries") {
    const feedIdParam = url.searchParams.get("feedId");
    const starred = url.searchParams.get("starred");
    const unread = url.searchParams.get("unread");

    const options: { feedId?: number; starred?: boolean; unread?: boolean } = {};
    if (feedIdParam) options.feedId = parseId(feedIdParam);
    if (starred !== null) options.starred = starred === "true";
    if (unread !== null) options.unread = unread === "true";

    const entries = dalInstance.getAllEntries(options);
    return jsonResponse(entries);
  }

  // GET /api/entries/:id
  if (method === "GET" && path.match(/^\\/api\\/entries\\/\\d+$/)) {
    const id = parseId(path.split("/").pop() || "");
    if (isNaN(id)) return errorResponse("Invalid entry ID", 400);

    const entry = dalInstance.getEntryById(id);
    if (!entry) return errorResponse("Entry not found", 404);

    return jsonResponse(entry);
  }

  // PATCH /api/entries/:id
  if (method === "PATCH" && path.match(/^\\/api\\/entries\\/\\d+$/)) {
    const id = parseId(path.split("/").pop() || "");
    if (isNaN(id)) return errorResponse("Invalid entry ID", 400);

    const body = await request.json() as { isRead?: boolean; isStarred?: boolean };
    dalInstance.updateEntry(id, body);
    return jsonResponse({ success: true });
  }

  // POST /api/entries/mark-all-read
  if (method === "POST" && path === "/api/entries/mark-all-read") {
    const body = await request.json() as { feedId?: string };
    const feedId = body.feedId ? parseId(body.feedId) : undefined;
    dalInstance.markAllAsRead(feedId);
    return jsonResponse({ success: true });
  }

  // GET /api/stats
  if (method === "GET" && path === "/api/stats") {
    const stats = dalInstance.getStats();
    return jsonResponse(stats);
  }

  // POST /api/feeds
  if (method === "POST" && path === "/api/feeds") {
    const body = await request.json() as { folderId: string; title: string; url: string; siteUrl?: string };
    if (!body.folderId || !body.title || !body.url) {
      return errorResponse("folderId, title, and url are required", 400);
    }

    const folderId = parseId(body.folderId);
    const feed = dalInstance.createFeed(folderId, body.title, body.url, body.siteUrl);
    return jsonResponse(feed, 201);
  }

  // DELETE /api/feeds/:id
  if (method === "DELETE" && path.startsWith("/api/feeds/")) {
    const id = parseId(path.split("/").pop() || "");
    if (isNaN(id)) return errorResponse("Invalid feed ID", 400);

    dalInstance.deleteFeed(id);
    return jsonResponse({ success: true });
  }

  return errorResponse("Not found", 404);
}

// ============== SSR HTML GENERATION ==============

function generateSSRHtml(folders: Folder[], entries: Entry[]): string {
  const initialData = { folders, entries };

  // Get the index.html template
  if (DIST_FILES["index.html"]) {
    let html = new TextDecoder().decode(decodeFile(DIST_FILES["index.html"]));

    // Inject initial data script before </head>
    const initialDataScript = \`<script>window.__INITIAL_DATA__ = \${JSON.stringify(initialData)};</script>\`;

    if (html.includes("</head>")) {
      html = html.replace("</head>", \`\${initialDataScript}</head>\`);
    } else {
      html = html.replace("</body>", \`\${initialDataScript}</body>\`);
    }

    return html;
  }

  // Fallback HTML if dist files not found
  return \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reader</title>
  <script>window.__INITIAL_DATA__ = \${JSON.stringify(initialData)};</script>
</head>
<body>
  <div id="root"></div>
</body>
</html>\`;
}

// ============== SERVER ==============

const server = Bun.serve({
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle API routes
    if (pathname.startsWith("/api/")) {
      try {
        return await handleApiRequest(request, url);
      } catch (error) {
        console.error("API error:", error);
        return errorResponse("Internal server error", 500);
      }
    }

    // Try to serve static files
    const normalizedPath = pathname === "/" ? "index.html" : pathname.slice(1);

    // For static assets (not index.html), serve directly
    if (normalizedPath !== "index.html" && DIST_FILES[normalizedPath]) {
      return new Response(decodeFile(DIST_FILES[normalizedPath]), {
        headers: { "Content-Type": getContentType(normalizedPath) },
      });
    }

    // For root path or SPA routes, generate SSR HTML
    try {
      const dalInstance = getDAL();
      const folders = dalInstance.getAllFoldersWithFeeds();
      const entries = dalInstance.getAllEntries();
      const html = generateSSRHtml(folders, entries);

      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    } catch (error) {
      console.error("SSR error:", error);

      // Fallback to static index.html
      if (DIST_FILES["index.html"]) {
        return new Response(decodeFile(DIST_FILES["index.html"]), {
          headers: { "Content-Type": "text/html" },
        });
      }

      return new Response("Internal Server Error", { status: 500 });
    }
  },
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  closeDatabase();
  process.exit(0);
});

process.on("SIGTERM", () => {
  closeDatabase();
  process.exit(0);
});

console.log("Server running at http://localhost:" + server.port);
`;

  console.log("Writing bundled server...");
  writeFileSync("./bundled-server.ts", serverCode);

  console.log("Compiling to executable...");
  await $`bun build --compile --minify ./bundled-server.ts --outfile ./reader`;

  // Clean up
  await $`rm ./bundled-server.ts`;

  console.log("Done! Executable created: ./reader");
}

build();
