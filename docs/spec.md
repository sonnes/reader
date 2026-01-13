# Google Reader Clone - Development Prompts

Series of prompts for building a Google Reader clone using Claude Code with the Ralph Loop methodology.

---

## Prompt 1: SQLite Setup with Bun

```markdown
Set up SQLite database for a Google Reader clone using Bun's native SQLite support.

Requirements:
1. Create `src/db/index.ts` - Database connection singleton using `bun:sqlite`
2. Create `src/db/schema.ts` - Schema definitions with these tables:
   - `feeds` (id, title, url, site_url, favicon_url, created_at, updated_at)
   - `entries` (id, feed_id, guid, title, url, author, content, summary, published_at, created_at)
   - `subscriptions` (id, feed_id, folder_id, title_override, created_at)
   - `folders` (id, name, sort_order, created_at)
   - `read_status` (entry_id, read_at) - tracks which entries have been read
   - `starred` (entry_id, starred_at) - tracks starred/saved entries
3. Create `src/db/migrate.ts` - Migration runner that creates tables if they don't exist
4. Update `server.ts` to run migrations on startup
5. Add indexes for common queries (feed_id on entries, published_at for sorting)

Technical constraints:
- Use Bun's built-in `bun:sqlite` (not better-sqlite3 or other packages)
- Use INTEGER PRIMARY KEY for auto-increment IDs
- Store dates as ISO 8601 strings
- Enable WAL mode for better concurrent access

When complete:
- Database file created at `./reader.db`
- All tables exist with proper foreign keys
- Server starts without errors
- Output: <promise>SQLITE_COMPLETE</promise>
```

---

## Prompt 2: RSS Feed Abstractions

```markdown
Create data access layer and RSS parsing abstractions for the Google Reader clone.

Requirements:

### Part A: Data Access Layer
Create `src/db/repositories/` with these modules:

1. `feeds.ts` - Feed repository
   - `createFeed(feed: NewFeed): Feed`
   - `getFeedById(id: number): Feed | null`
   - `getFeedByUrl(url: string): Feed | null`
   - `getAllFeeds(): Feed[]`
   - `updateFeed(id: number, updates: Partial<Feed>): Feed`
   - `deleteFeed(id: number): void`

2. `entries.ts` - Entry repository
   - `createEntry(entry: NewEntry): Entry`
   - `getEntryById(id: number): Entry | null`
   - `getEntryByGuid(feedId: number, guid: string): Entry | null`
   - `getEntriesByFeed(feedId: number, options?: { limit?: number, offset?: number }): Entry[]`
   - `getUnreadEntries(options?: { feedId?: number, folderId?: number, limit?: number }): Entry[]`
   - `getStarredEntries(options?: { limit?: number, offset?: number }): Entry[]`
   - `markAsRead(entryId: number): void`
   - `markAsUnread(entryId: number): void`
   - `markFeedAsRead(feedId: number): void`
   - `toggleStar(entryId: number): boolean` - returns new starred state

3. `folders.ts` - Folder repository
   - `createFolder(name: string): Folder`
   - `getFolders(): Folder[]`
   - `updateFolder(id: number, name: string): Folder`
   - `deleteFolder(id: number): void`
   - `reorderFolders(folderIds: number[]): void`

4. `subscriptions.ts` - Subscription repository
   - `subscribe(feedId: number, folderId?: number): Subscription`
   - `unsubscribe(feedId: number): void`
   - `moveToFolder(feedId: number, folderId: number | null): void`
   - `getSubscriptions(): SubscriptionWithFeed[]`
   - `getSubscriptionsByFolder(folderId: number): SubscriptionWithFeed[]`

### Part B: RSS Parser Service
Create `src/services/rss.ts`:

1. `parseFeed(url: string): Promise<ParsedFeed>` - Fetch and parse RSS/Atom feed
   - Support both RSS 2.0 and Atom formats
   - Extract: title, site URL, favicon, entries
   - For entries: guid, title, url, author, content/summary, published date
   - Handle common date formats
   - Use native fetch, no external RSS libraries

2. `refreshFeed(feedId: number): Promise<{ new: number, updated: number }>`
   - Fetch latest entries for a feed
   - Insert new entries (by guid)
   - Return count of new/updated entries

3. `discoverFeedUrl(siteUrl: string): Promise<string | null>`
   - Given a website URL, discover the RSS feed URL
   - Check common paths: /feed, /rss, /atom.xml, /feed.xml
   - Parse HTML for <link rel="alternate" type="application/rss+xml">

### Part C: Type Definitions
Create `src/db/types.ts` with TypeScript interfaces for all entities.

When complete:
- All repository functions work with the SQLite database
- RSS parser can fetch and parse feeds from real URLs
- Type safety throughout
- No external dependencies for RSS parsing (use native DOMParser or regex)
- Output: <promise>ABSTRACTIONS_COMPLETE</promise>
```

---

## Prompt 3: Google Reader Layout

```markdown
Create the UI layout mimicking classic Google Reader using React, Tailwind CSS v4, and shadcn/ui.

Requirements:

### Layout Structure
Create a three-panel layout in `src/components/layout/`:

1. `ReaderLayout.tsx` - Main layout wrapper
   - Fixed header with app title and actions
   - Collapsible left sidebar (feeds/folders)
   - Main content area (entry list + reading pane)
   - Keyboard navigation support

2. `Sidebar.tsx` - Left navigation panel (250px width, collapsible)
   - "All items" link with unread count badge
   - "Starred" link
   - Expandable folder sections
   - Feed list with favicons and unread counts
   - Add subscription button
   - Folder management (add, rename, delete)

3. `EntryList.tsx` - Middle panel showing entries
   - Compact list view (title, feed name, date)
   - Expanded list view (title, snippet, feed name, date)
   - Visual distinction for read vs unread
   - Click to select, double-click to open
   - Shift+click for multi-select
   - "Mark all as read" action

4. `ReadingPane.tsx` - Right panel showing selected entry
   - Entry title as heading
   - Feed name and publish date
   - Full content rendered as HTML (sanitized)
   - Star/unstar button
   - Mark read/unread button
   - Open original link button
   - Next/Previous navigation

### Page Components
Create in `src/pages/`:

1. `HomePage.tsx` - Main reader view with all three panels
2. `SettingsPage.tsx` - Basic settings (placeholder for now)

### Shared Components
Add/use shadcn/ui components in `src/components/ui/`:
- Use existing: Button, Input, Card, DropdownMenu, Separator
- Add if needed: ScrollArea, Collapsible, Tooltip, Dialog

### Styling Requirements
- Match Google Reader's clean, utilitarian aesthetic
- Color scheme: White background, blue accents (#4285f4), gray borders
- Unread items: Bold title
- Read items: Normal weight, slightly muted
- Hover states on interactive elements
- Responsive: Collapse sidebar on narrow screens

### Keyboard Shortcuts (wire up handlers, even if not fully functional)
- `j` / `k` - Next/previous entry
- `n` / `p` - Next/previous entry (alternative)
- `o` or `Enter` - Open/expand entry
- `s` - Star/unstar
- `m` - Mark read/unread
- `Shift+a` - Mark all as read
- `?` - Show keyboard shortcuts help

### State Management
Create `src/hooks/useReader.ts`:
- Track selected feed/folder/entry
- Track view mode (list compact/expanded)
- Handle keyboard navigation
- Provide actions for marking read, starring, etc.

When complete:
- Layout renders with all three panels
- Sidebar shows placeholder feeds and folders
- Entry list shows placeholder entries
- Reading pane shows selected entry content
- Basic keyboard navigation works
- Looks similar to classic Google Reader
- No console errors
- Output: <promise>LAYOUT_COMPLETE</promise>
```

---

## Usage

Run each prompt sequentially using Ralph Loop:

```bash
# Step 1: Database setup
/ralph-loop "<paste prompt 1>" --completion-promise "SQLITE_COMPLETE" --max-iterations 20

# Step 2: Data layer and RSS parsing
/ralph-loop "<paste prompt 2>" --completion-promise "ABSTRACTIONS_COMPLETE" --max-iterations 30

# Step 3: UI layout
/ralph-loop "<paste prompt 3>" --completion-promise "LAYOUT_COMPLETE" --max-iterations 30
```

Or run manually by pasting each prompt and iterating until the completion criteria are met.
