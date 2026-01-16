# Reading Experience

## Overview

The core reading interface featuring a flexible 3-pane layout (folders, article list, reading pane) with power-user keyboard navigation. Users can collapse the sidebar or enter focus mode for distraction-free reading, and toggle between clean reader view and original formatting.

## User Flows

- Browse articles by selecting a folder or feed in the sidebar, then scanning the article list
- Select an article to view it in the reading pane (automatically marks as read)
- Use j/k keys to navigate through articles, o to open, m to toggle read status, s to star
- Use g+f to jump to feeds view, g+a for all articles, ? to show keyboard help
- Collapse the sidebar to expand the article list and reading pane
- Enter focus mode to view only the reading pane
- Toggle between reader view and original formatting in the reading pane
- Refresh feeds with r keyboard shortcut

## Design Decisions

- Classic 3-pane RSS reader layout for familiarity
- Keyboard shortcuts inspired by Vim and popular readers (Gmail, Feedly)
- Sidebar shows All Articles, Unread, Starred, then folders with nested feeds
- List/card view toggle in the article list header
- Reader view provides clean typography for comfortable reading
- Focus mode hides everything except the article content

## Data Used

**Entities:**

- `Folder` — Container for organizing feeds
- `Feed` — RSS/Atom feed source
- `Article` — Individual post with content
- `StarredArticle` — Reference to saved articles

**UI State:**

- `sidebarCollapsed` — Whether sidebar is visible
- `focusMode` — Whether only reading pane is shown
- `viewMode` — 'list' or 'card'
- `readerView` — Clean formatting vs original
- `selectedFolderId/selectedFeedId/selectedArticleId` — Current selections

## Visual Reference

See `screenshot.png` for the target UI design.

## Components Provided

- `ReadingExperience` — Main 3-pane layout component
- `FolderSidebar` — Left sidebar with folder/feed navigation
- `ArticleList` — Center pane with article list
- `ArticleListItem` — Individual article row/card
- `ReadingPane` — Right pane with article content
- `KeyboardHelp` — Modal showing keyboard shortcuts

## Callback Props

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
