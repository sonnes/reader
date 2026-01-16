# Milestone 3: Reading Experience

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, Milestone 2 (Feed Management) recommended

## Goal

Implement the Reading Experience feature — the core reading interface featuring a flexible 3-pane layout with power-user keyboard navigation.

## Overview

The Reading Experience is the heart of the RSS reader. It provides a classic 3-pane layout (folders, article list, reading pane) with keyboard navigation for efficient reading. Users can collapse the sidebar, enter focus mode for distraction-free reading, and toggle between clean reader view and original formatting.

**Key Functionality:**

- Browse articles by selecting a folder or feed in the sidebar
- Select an article to view it in the reading pane (automatically marks as read)
- Use j/k keys to navigate through articles, o to open, m to toggle read status, s to star
- Use g+f to jump to feeds view, g+a for all articles, ? to show keyboard help
- Collapse the sidebar to expand the article list and reading pane
- Enter focus mode to view only the reading pane
- Toggle between reader view and original formatting
- Refresh feeds with r keyboard shortcut

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `reader-plan/sections/reading-experience/tests.md` for detailed test-writing instructions including:

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

Copy the section components from `reader-plan/sections/reading-experience/components/`:

- `ReadingExperience.tsx` — Main 3-pane layout component
- `FolderSidebar.tsx` — Left sidebar with folder/feed navigation
- `ArticleList.tsx` — Center pane with article list
- `ArticleListItem.tsx` — Individual article row/card
- `ReadingPane.tsx` — Right pane with article content
- `KeyboardHelp.tsx` — Modal showing keyboard shortcuts

### Data Layer

The components expect these data shapes:

```typescript
interface UIState {
  sidebarCollapsed: boolean
  focusMode: boolean
  viewMode: 'list' | 'card'
  readerView: boolean
  selectedFolderId: string | null
  selectedFeedId: string | null
  selectedArticleId: string | null
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
```

You'll need to:

- Fetch articles based on selected folder/feed
- Manage UI state (sidebar, focus mode, view mode)
- Implement keyboard event handlers
- Mark articles as read when viewed
- Store and sync starred articles

### Callbacks

Wire up these user actions:

| Callback             | Description                                             |
| -------------------- | ------------------------------------------------------- |
| `onSelectFolder`     | Called when user selects a folder                       |
| `onSelectFeed`       | Called when user selects a feed                         |
| `onSelectArticle`    | Called when user selects an article                     |
| `onToggleRead`       | Called when user toggles read status (keyboard: m)      |
| `onToggleStar`       | Called when user toggles starred status (keyboard: s)   |
| `onOpenInBrowser`    | Called when user opens article in browser (keyboard: o) |
| `onToggleSidebar`    | Called when user toggles sidebar visibility             |
| `onToggleFocusMode`  | Called when user toggles focus mode                     |
| `onToggleViewMode`   | Called when user switches between list/card view        |
| `onToggleReaderView` | Called when user toggles reader view                    |
| `onRefresh`          | Called when user requests feed refresh (keyboard: r)    |

### Keyboard Shortcuts

Implement these keyboard shortcuts:

| Key   | Action                  |
| ----- | ----------------------- |
| `j`   | Next article            |
| `k`   | Previous article        |
| `o`   | Open in browser         |
| `m`   | Toggle read/unread      |
| `s`   | Toggle star             |
| `r`   | Refresh feeds           |
| `[`   | Collapse sidebar        |
| `f`   | Toggle focus mode       |
| `v`   | Toggle list/card view   |
| `g f` | Go to feeds             |
| `g a` | Go to all articles      |
| `?`   | Show keyboard shortcuts |

### Empty States

Implement empty state UI for when no records exist yet:

- **No articles yet:** Show message "Subscribe to feeds to see articles here" with refresh button
- **No article selected:** Show message "Select an article to read" with keyboard hint

## Files to Reference

- `reader-plan/sections/reading-experience/README.md` — Feature overview and design intent
- `reader-plan/sections/reading-experience/tests.md` — Test-writing instructions (use for TDD)
- `reader-plan/sections/reading-experience/components/` — React components
- `reader-plan/sections/reading-experience/types.ts` — TypeScript interfaces
- `reader-plan/sections/reading-experience/sample-data.json` — Test data
- `reader-plan/sections/reading-experience/screenshot.png` — Visual reference

## Expected User Flows

When fully implemented, users should be able to complete these flows:

### Flow 1: Read an Article

1. User selects a folder or feed in the sidebar
2. User sees article list filtered to that selection
3. User clicks an article (or presses j/k to navigate, then Enter)
4. **Outcome:** Article content appears in reading pane, marked as read

### Flow 2: Navigate with Keyboard

1. User presses `j` to move to next article
2. User presses `k` to move to previous article
3. User presses `o` to open current article in browser
4. **Outcome:** Efficient navigation without using mouse

### Flow 3: Enter Focus Mode

1. User is reading an article
2. User clicks focus mode button or presses `f`
3. **Outcome:** Sidebar and article list hide, reading pane expands

### Flow 4: Star an Article

1. User is viewing an article
2. User clicks star button or presses `s`
3. **Outcome:** Article is starred, appears in Starred filter

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] 3-pane layout renders correctly
- [ ] Folder/feed navigation filters articles
- [ ] Article selection works (click and keyboard)
- [ ] Reading pane displays article content
- [ ] All keyboard shortcuts function
- [ ] Focus mode works
- [ ] Reader view toggle works
- [ ] Empty states display properly
- [ ] Matches the visual design
- [ ] Responsive on mobile (panes collapse appropriately)
