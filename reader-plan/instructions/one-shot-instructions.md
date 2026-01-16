# Reader — Complete Implementation Instructions

---

## About These Instructions

**What you're receiving:**

- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**

- Backend API endpoints and database schema
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**

- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---

## Test-Driven Development

Each section includes a `tests.md` file with detailed test-writing instructions. These are **framework-agnostic** — adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, RSpec, Minitest, PHPUnit, etc.).

**For each section:**

1. Read `reader-plan/sections/[section-id]/tests.md`
2. Write failing tests for key user flows (success and failure paths)
3. Implement the feature to make tests pass
4. Refactor while keeping tests green

The test instructions include:

- Specific UI elements, button labels, and interactions to verify
- Expected success and failure behaviors
- Empty state handling (when no records exist yet)
- Data assertions and state validations

---

# Product Overview

## Summary

A minimal, personal RSS reader for following blogs and news sources. Features a classic 3-pane layout with keyboard navigation for distraction-free reading.

## Problems Solved

1. **Too many sites to check manually** — Subscribe to RSS feeds and see all new articles in one place.
2. **Losing track of what you've read** — Mark articles as read/unread and filter by status.
3. **Feeds become overwhelming** — Organize feeds into folders by topic.
4. **Slow navigation through articles** — Use j/k keyboard shortcuts to quickly scan through items.

## Key Features

- 3-pane layout (folders | article list | reading pane)
- Subscribe to RSS/Atom feeds
- Read/unread article tracking
- Folder organization for feeds
- Keyboard navigation (j/k/o shortcuts)
- List and card view toggle for article list

## Data Model

**Entities:**

- **Folder** — A container for organizing feeds by topic
- **Feed** — An RSS or Atom feed source that the user subscribes to
- **Article** — An individual post or item from a feed
- **StarredArticle** — A reference to an article the user has saved for later

**Relationships:**

- Folder has many Feeds
- Feed belongs to one Folder (or no folder)
- Feed has many Articles
- Article belongs to one Feed
- StarredArticle references one Article

---

# Milestone 1: Foundation

## Goal

Set up the foundational elements: design tokens, data model types, routing structure, and application shell.

## What to Implement

### 1. Design Tokens

Configure your styling system with these tokens:

**Color Palette:**

- Primary: `sky` — Used for buttons, links, key accents
- Secondary: `amber` — Used for stars, highlights, secondary elements
- Neutral: `slate` — Used for backgrounds, text, borders

**Typography:**

- Heading: Noto Sans
- Body: Noto Sans
- Mono: JetBrains Mono

See `reader-plan/design-system/` for CSS custom properties and font configuration.

### 2. Data Model Types

Create TypeScript interfaces for your core entities:

```typescript
interface Folder {
  id: string
  name: string
  feedIds: string[]
  unreadCount: number
}

interface Feed {
  id: string
  title: string
  url: string
  siteUrl: string
  favicon: string
  folderId: string | null
  unreadCount: number
  lastFetched: string
}

interface Article {
  id: string
  feedId: string
  title: string
  url: string
  publishedAt: string
  preview: string
  content: string
  isRead: boolean
  isStarred: boolean
}

interface StarredArticle {
  id: string
  articleId: string
}
```

### 3. Routing Structure

Create placeholder routes:

- `/` or `/feeds` — Feed management page
- `/read` — Reading experience (3-pane layout)
- `/articles` — Article tracking views

### 4. Application Shell

Copy the shell components from `reader-plan/shell/components/`:

- `AppShell.tsx` — Main layout wrapper with minimal header
- `MainNav.tsx` — Navigation component
- `UserMenu.tsx` — User menu with dropdown

**Shell Layout:**

- Fixed header at top (56px height)
- Logo/wordmark on the left
- User menu on the right
- Content area fills remaining viewport height

## Done When

- [ ] Design tokens are configured
- [ ] Data model types are defined
- [ ] Routes exist for all sections
- [ ] Shell renders with header and user menu
- [ ] Responsive on mobile

---

# Milestone 2: Feed Management

## Goal

Implement feed subscription management — add feeds, organize into folders, import/export OPML.

## Overview

A full-page interface where users can view, add, and organize their RSS subscriptions.

**Key Functionality:**

- View all subscribed feeds grouped by folder
- Add a new feed via modal dialog
- Remove a feed from subscriptions
- Create, rename, and delete folders
- Move feeds between folders
- Import/export feeds via OPML

## Components

Copy from `reader-plan/sections/feed-management/components/`:

- `FeedManagement.tsx` — Main component with full page layout

## Callbacks

| Callback         | Description                       |
| ---------------- | --------------------------------- |
| `onCreateFolder` | Create a new folder               |
| `onRenameFolder` | Rename a folder                   |
| `onDeleteFolder` | Delete a folder                   |
| `onAddFeed`      | Subscribe to a new feed           |
| `onRemoveFeed`   | Unsubscribe from a feed           |
| `onMoveFeed`     | Move a feed to a different folder |
| `onImportOPML`   | Import feeds from OPML file       |
| `onExportOPML`   | Export feeds to OPML file         |

## User Flows

1. **Add a New Feed:** Click "Add Feed" → Enter URL → Select folder → Click "Subscribe"
2. **Create a Folder:** Click "New Folder" → Enter name → Click "Create"
3. **Move a Feed:** Click menu → "Move to folder" → Select folder
4. **Import OPML:** Click "Import OPML" → Select file

## Done When

- [ ] Tests pass for key user flows
- [ ] Add/remove feeds works
- [ ] Create/rename/delete folders works
- [ ] Move feeds between folders works
- [ ] OPML import/export works
- [ ] Empty states display properly

---

# Milestone 3: Reading Experience

## Goal

Implement the core reading interface — 3-pane layout with keyboard navigation.

## Overview

The heart of the RSS reader with folder sidebar, article list, and reading pane.

**Key Functionality:**

- Browse articles by selecting folder/feed
- Select article to view in reading pane
- Keyboard navigation (j/k/o/m/s/r)
- Collapse sidebar, focus mode
- Toggle reader view vs original formatting

## Components

Copy from `reader-plan/sections/reading-experience/components/`:

- `ReadingExperience.tsx` — Main 3-pane layout
- `FolderSidebar.tsx` — Left sidebar navigation
- `ArticleList.tsx` — Center pane article list
- `ArticleListItem.tsx` — Individual article row/card
- `ReadingPane.tsx` — Right pane article content
- `KeyboardHelp.tsx` — Keyboard shortcuts modal

## Keyboard Shortcuts

| Key | Action                  |
| --- | ----------------------- |
| `j` | Next article            |
| `k` | Previous article        |
| `o` | Open in browser         |
| `m` | Toggle read/unread      |
| `s` | Toggle star             |
| `r` | Refresh feeds           |
| `[` | Collapse sidebar        |
| `f` | Toggle focus mode       |
| `v` | Toggle list/card view   |
| `?` | Show keyboard shortcuts |

## Callbacks

| Callback             | Description           |
| -------------------- | --------------------- |
| `onSelectFolder`     | Select a folder       |
| `onSelectFeed`       | Select a feed         |
| `onSelectArticle`    | Select an article     |
| `onToggleRead`       | Toggle read status    |
| `onToggleStar`       | Toggle starred status |
| `onOpenInBrowser`    | Open in browser       |
| `onToggleSidebar`    | Toggle sidebar        |
| `onToggleFocusMode`  | Toggle focus mode     |
| `onToggleViewMode`   | Toggle list/card      |
| `onToggleReaderView` | Toggle reader view    |
| `onRefresh`          | Refresh feeds         |

## User Flows

1. **Read an Article:** Select folder → Click article → View in reading pane
2. **Keyboard Navigation:** Press j/k to navigate → o to open → m to toggle read
3. **Focus Mode:** Press f → Sidebar and list hide → Reading pane expands
4. **Star Article:** Press s or click star icon

## Done When

- [ ] Tests pass for key user flows
- [ ] 3-pane layout renders correctly
- [ ] Keyboard shortcuts all function
- [ ] Focus mode works
- [ ] Reader view toggle works
- [ ] Empty states display properly

---

# Milestone 4: Article Tracking

## Goal

Implement article browsing views with read/unread management.

## Overview

Dedicated views for browsing all articles and unread articles with list/card layouts.

**Key Functionality:**

- View all articles or filter to unread
- Toggle between list and card views
- Sort by date (newest/oldest)
- Mark read/unread, star, delete
- Open in reading pane or new tab

## Components

Copy from `reader-plan/sections/article-tracking/components/`:

- `ArticleList.tsx` — Main 3-pane layout
- `ArticleListPanel.tsx` — Article list with controls
- `ArticleRow.tsx` — Compact list view item
- `ArticleCard.tsx` — Card view item
- `ArticleDetailPane.tsx` — Reading pane

## Callbacks

| Callback          | Description        |
| ----------------- | ------------------ |
| `onSelectFolder`  | Select a folder    |
| `onSelectFeed`    | Select a feed      |
| `onSelectArticle` | Select an article  |
| `onOpenInNewTab`  | Open in new tab    |
| `onToggleRead`    | Toggle read/unread |
| `onToggleStar`    | Toggle starred     |
| `onDelete`        | Delete article     |

## User Flows

1. **Browse Unread:** Click "Unread" → See only unread articles
2. **Toggle View:** Click view toggle → Switch list/card
3. **Mark Unread:** Click envelope icon → Article returns to unread
4. **Delete:** Click trash icon → Article removed
5. **Star:** Click star icon → Article appears in Starred

## Done When

- [ ] Tests pass for key user flows
- [ ] All Articles and Unread views work
- [ ] Starred filter works
- [ ] List/card view toggle works
- [ ] Sort works
- [ ] Read/unread toggle works
- [ ] Star/delete work
- [ ] Empty states display properly

---

# Files Reference

**Design System:**

- `reader-plan/design-system/tokens.css`
- `reader-plan/design-system/tailwind-colors.md`
- `reader-plan/design-system/fonts.md`

**Data Model:**

- `reader-plan/data-model/types.ts`
- `reader-plan/data-model/sample-data.json`

**Shell:**

- `reader-plan/shell/components/`
- `reader-plan/shell/README.md`

**Sections:**

- `reader-plan/sections/feed-management/`
- `reader-plan/sections/reading-experience/`
- `reader-plan/sections/article-tracking/`

Each section contains:

- `README.md` — Feature overview
- `tests.md` — Test-writing instructions
- `components/` — React components
- `types.ts` — TypeScript interfaces
- `sample-data.json` — Test data
- `screenshot.png` — Visual reference
