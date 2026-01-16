# Article Tracking Section

## Overview

Article Tracking provides views for browsing all articles and all unread articles, with the ability to toggle between list and card layouts. Users can manage individual articles by marking them read/unread, starring them, or archiving/deleting them.

## User Flows

- View all articles across all subscribed feeds
- View all unread articles filtered from the full list
- Toggle between list view (compact rows) and card view (with previews)
- Filter articles by read/unread status
- Sort articles by date (newest/oldest)
- Mark an article as read or unread
- Star/favorite an article for later
- Archive or delete an article
- Click an article to open in reading pane (default) or open in a new tab/page

## Components

| Component | Description |
|-----------|-------------|
| `ArticleList` | Main container for the article tracking view |
| `ArticleListPanel` | Panel wrapper with header, filters, and view toggles |
| `ArticleRow` | Compact list row for an article (list view) |
| `ArticleCard` | Card with preview for an article (card view) |
| `ArticleDetailPane` | Detail pane showing full article content |

## Props Interface

```typescript
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

interface ArticleTrackingProps {
  articles: Article[]
  selectedArticleId: string | null
  viewMode: 'list' | 'card'
  filterStatus: 'all' | 'unread' | 'starred'
  sortOrder: 'newest' | 'oldest'
  onArticleSelect: (id: string) => void
  onToggleRead: (id: string) => void
  onToggleStar: (id: string) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  onViewModeChange: (mode: 'list' | 'card') => void
  onFilterChange: (filter: 'all' | 'unread' | 'starred') => void
  onSortChange: (sort: 'newest' | 'oldest') => void
  onOpenInNewTab: (url: string) => void
}
```

## UI Requirements

- Two primary views: "All Articles" and "All Unread"
- View toggle control to switch between list and card layouts
- Basic filter bar with read/unread filter and date sort
- Each article row/card shows: title, source, date, read status indicator, star icon
- Inline action buttons for read status, star, archive, delete
- Visual distinction for unread articles (e.g., bold title, dot indicator)
- Click behavior opens reading pane; secondary action (right-click or icon) to open in new tab

## Configuration

- Includes application shell: Yes
