# Milestone 4: Article Tracking

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, Milestones 2-3 recommended

## Goal

Implement the Article Tracking feature — views for browsing all articles and managing read/unread status with list and card layouts.

## Overview

Article Tracking provides dedicated views for browsing all articles and all unread articles, with the ability to toggle between list and card layouts. Users can manage individual articles by marking them read/unread, starring them, or deleting them.

**Key Functionality:**
- View all articles across all subscribed feeds
- View all unread articles filtered from the full list
- Toggle between list view (compact rows) and card view (with previews)
- Filter articles by read/unread status
- Sort articles by date (newest/oldest)
- Mark an article as read or unread
- Star/favorite an article for later
- Delete an article
- Click an article to open in reading pane or new tab

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `reader-plan/sections/article-tracking/tests.md` for detailed test-writing instructions including:
- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

The test instructions are framework-agnostic — adapt them to your testing setup.

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy the section components from `reader-plan/sections/article-tracking/components/`:

- `ArticleList.tsx` — Main 3-pane layout for article tracking
- `ArticleListPanel.tsx` — Center pane with article list and controls
- `ArticleRow.tsx` — Compact list view item
- `ArticleCard.tsx` — Card view item with preview
- `ArticleDetailPane.tsx` — Reading pane for selected article

**Note:** This section also uses `FolderSidebar` from reading-experience for navigation.

### Data Layer

The components expect these data shapes:

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
  folders: Folder[]
  feeds: Feed[]
  selectedFolderId: string | null
  selectedFeedId: string | null
  selectedArticleId?: string | null
}
```

You'll need to:
- Fetch and filter articles based on selection
- Sort articles by date
- Track read/unread status
- Implement optimistic updates for quick feedback
- Persist starred articles

### Callbacks

Wire up these user actions:

| Callback | Description |
|----------|-------------|
| `onSelectFolder` | Called when user selects a folder |
| `onSelectFeed` | Called when user selects a feed |
| `onSelectArticle` | Called when user selects an article to view |
| `onOpenInNewTab` | Called when user wants to open in new tab |
| `onToggleRead` | Called when user toggles read/unread status |
| `onToggleStar` | Called when user toggles starred status |
| `onDelete` | Called when user deletes an article |

### Empty States

Implement empty state UI for when no records exist yet:

- **No articles:** Show message "No articles" with "Subscribe to feeds to see articles here"
- **No article selected:** Show message "Select an article to read" with keyboard navigation hint
- **Starred empty:** Show appropriate message when no starred articles exist

## Files to Reference

- `reader-plan/sections/article-tracking/README.md` — Feature overview and design intent
- `reader-plan/sections/article-tracking/tests.md` — Test-writing instructions (use for TDD)
- `reader-plan/sections/article-tracking/components/` — React components
- `reader-plan/sections/article-tracking/types.ts` — TypeScript interfaces
- `reader-plan/sections/article-tracking/sample-data.json` — Test data
- `reader-plan/sections/article-tracking/screenshot.png` — Visual reference

## Expected User Flows

When fully implemented, users should be able to complete these flows:

### Flow 1: Browse Unread Articles

1. User clicks "Unread" in the sidebar
2. User sees only unread articles in the list
3. User clicks an article to read it
4. **Outcome:** Article opens in reading pane, becomes marked as read

### Flow 2: Toggle View Mode

1. User is viewing article list in list mode
2. User clicks the view toggle button (grid icon)
3. **Outcome:** Articles display as cards with previews

### Flow 3: Mark as Unread

1. User has read an article (it's marked as read)
2. User clicks the envelope icon or uses keyboard shortcut
3. **Outcome:** Article returns to unread state, appears in Unread filter

### Flow 4: Delete an Article

1. User hovers over an article row
2. User clicks the delete (trash) icon
3. **Outcome:** Article is removed from the list

### Flow 5: Star an Article

1. User sees an interesting article
2. User clicks the star icon (on row or in reading pane)
3. **Outcome:** Article is starred, appears in Starred filter

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] All Articles view shows all articles
- [ ] Unread filter works correctly
- [ ] Starred filter shows starred articles
- [ ] List/card view toggle works
- [ ] Sort by date works (newest/oldest)
- [ ] Mark read/unread works
- [ ] Star/unstar works
- [ ] Delete works
- [ ] Empty states display properly
- [ ] Matches the visual design
- [ ] Responsive on mobile
