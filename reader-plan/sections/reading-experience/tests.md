# Test Instructions: Reading Experience

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, RSpec, Minitest, PHPUnit, etc.).

## Overview

Test the 3-pane reading interface including folder/feed navigation, article selection, keyboard shortcuts, and focus mode.

---

## User Flow Tests

### Flow 1: Browse and Read an Article

**Scenario:** User browses articles and reads one

#### Success Path

**Setup:**

- Folders and feeds exist with articles
- Article "Test Article" is unread

**Steps:**

1. User clicks "Tech Blogs" folder in sidebar
2. User sees filtered article list
3. User clicks "Test Article" in the list
4. Article content appears in reading pane

**Expected Results:**

- [ ] Article list filters to show only articles from "Tech Blogs" feeds
- [ ] Clicked article is highlighted in list
- [ ] Reading pane shows article title, source, date
- [ ] Reading pane shows article content
- [ ] Article is automatically marked as read
- [ ] Unread count decrements

---

### Flow 2: Keyboard Navigation

**Scenario:** User navigates articles using keyboard

**Setup:**

- Multiple articles exist in list
- First article is selected

**Steps:**

1. User presses `j` key
2. User presses `j` again
3. User presses `k` key
4. User presses `o` key

**Expected Results:**

- [ ] After first `j`: Selection moves to second article
- [ ] After second `j`: Selection moves to third article
- [ ] After `k`: Selection moves back to second article
- [ ] After `o`: Article opens in new browser tab

---

### Flow 3: Toggle Read/Unread Status

**Scenario:** User marks an article as unread

**Setup:**

- Article "Read Article" is currently read (isRead: true)

**Steps:**

1. User selects "Read Article"
2. User presses `m` key (or clicks the read toggle button)

**Expected Results:**

- [ ] Article changes to unread status
- [ ] Unread indicator (blue dot) appears on article row
- [ ] Title styling changes to bold/prominent
- [ ] Unread count in sidebar increments

---

### Flow 4: Star an Article

**Scenario:** User stars an article for later

**Setup:**

- Article "Important Post" exists, not starred

**Steps:**

1. User selects "Important Post"
2. User presses `s` key (or clicks star button in reading pane)

**Expected Results:**

- [ ] Star icon fills with amber color
- [ ] Article appears in "Starred" filter
- [ ] Starred count increments

---

### Flow 5: Enter Focus Mode

**Scenario:** User wants distraction-free reading

**Setup:**

- Article is selected and displayed in reading pane

**Steps:**

1. User presses `f` key (or clicks focus mode button)

**Expected Results:**

- [ ] Sidebar hides
- [ ] Article list hides
- [ ] Reading pane expands to full width
- [ ] Exit button appears in reading pane toolbar
- [ ] Pressing `f` again or clicking exit returns to 3-pane layout

---

### Flow 6: Toggle View Mode

**Scenario:** User switches between list and card views

**Setup:**

- Article list is in list view

**Steps:**

1. User presses `v` key (or clicks view toggle button)

**Expected Results:**

- [ ] Articles display as cards with previews
- [ ] Pressing `v` again returns to list view

---

### Flow 7: Show Keyboard Shortcuts

**Scenario:** User wants to see available shortcuts

**Steps:**

1. User presses `?` key

**Expected Results:**

- [ ] Keyboard shortcuts modal appears
- [ ] Shows Navigation shortcuts (j, k, g f, g a)
- [ ] Shows Article Actions (o, m, s, r)
- [ ] Shows View shortcuts ([, f, v, ?)
- [ ] Pressing `?` or `Esc` closes modal

---

## Empty State Tests

### No Articles

**Scenario:** Selected folder/feed has no articles

**Setup:**

- `articles` array is empty (`[]`)

**Expected Results:**

- [ ] Article list shows empty state icon (newspaper/document)
- [ ] Shows heading "No articles yet"
- [ ] Shows message "Subscribe to feeds to see articles here"
- [ ] Shows "Refresh feeds" button

### No Article Selected

**Scenario:** User hasn't selected an article yet

**Setup:**

- Articles exist but `selectedArticleId` is null

**Expected Results:**

- [ ] Reading pane shows empty state with book icon
- [ ] Shows "Select an article to read"
- [ ] Shows keyboard hint "Choose an article from the list or use j / k to navigate"

---

## Component Interaction Tests

### ReadingExperience Component

**Renders correctly:**

- [ ] Shows 3-pane layout (sidebar, article list, reading pane)
- [ ] Sidebar shows All Articles, Unread, Starred options
- [ ] Sidebar shows folders with nested feeds

**State management:**

- [ ] Selecting folder filters article list
- [ ] Selecting feed filters to that feed only
- [ ] Selecting article displays in reading pane

### FolderSidebar Component

**Renders correctly:**

- [ ] Shows "Feeds" header with collapse button
- [ ] Shows All Articles with total count
- [ ] Shows Unread with unread count badge (sky blue)
- [ ] Shows Starred with star icon (amber)
- [ ] Shows folders with folder icon and feed count

**User interactions:**

- [ ] Clicking All Articles shows all articles
- [ ] Clicking Unread filters to unread only
- [ ] Clicking Starred shows starred articles
- [ ] Clicking folder expands to show feeds
- [ ] Clicking feed filters to that feed

### ArticleList Component

**Renders correctly:**

- [ ] Shows article count (e.g., "15 articles")
- [ ] Shows unread count (e.g., "(5 unread)")
- [ ] Shows refresh button
- [ ] Shows view toggle button

**User interactions:**

- [ ] Clicking article selects it
- [ ] Clicking star button toggles star
- [ ] Clicking refresh calls `onRefresh`
- [ ] Clicking view toggle changes view mode

### ReadingPane Component

**Renders correctly:**

- [ ] Shows toolbar with read, star, open buttons
- [ ] Shows reader view toggle
- [ ] Shows article title
- [ ] Shows source name (linked)
- [ ] Shows publication date
- [ ] Shows article content

**User interactions:**

- [ ] Clicking read button toggles read status
- [ ] Clicking star button toggles star
- [ ] Clicking open button opens in browser
- [ ] Clicking reader view toggles formatting

---

## Keyboard Shortcut Tests

| Key   | Expected Behavior                        |
| ----- | ---------------------------------------- |
| `j`   | Selects next article in list             |
| `k`   | Selects previous article in list         |
| `o`   | Opens current article in new browser tab |
| `m`   | Toggles read/unread status               |
| `s`   | Toggles starred status                   |
| `r`   | Refreshes feeds                          |
| `[`   | Collapses/expands sidebar                |
| `f`   | Toggles focus mode                       |
| `v`   | Toggles list/card view                   |
| `g f` | Navigates to feeds/all articles          |
| `g a` | Navigates to all articles                |
| `?`   | Shows keyboard shortcuts help            |
| `Esc` | Closes keyboard help modal               |

---

## Edge Cases

- [ ] Handles article with very long title (truncates in list, wraps in pane)
- [ ] Handles article with no content (shows preview or message)
- [ ] Handles article with HTML formatting (code blocks, images, links)
- [ ] j/k at list boundaries don't crash (first/last article)
- [ ] Keyboard shortcuts don't fire when typing in input fields
- [ ] Focus mode exit button works
- [ ] Handles rapid keyboard presses

---

## Accessibility Checks

- [ ] All toolbar buttons have accessible labels
- [ ] Keyboard navigation works throughout
- [ ] Screen reader announces article selection changes
- [ ] Focus management when entering/exiting focus mode
- [ ] Keyboard shortcuts modal is accessible
- [ ] Article content is properly structured (headings, lists)

---

## Sample Test Data

```typescript
// UI State
const mockUIState = {
  sidebarCollapsed: false,
  focusMode: false,
  viewMode: 'list' as const,
  readerView: true,
  selectedFolderId: null,
  selectedFeedId: 'feed-1',
  selectedArticleId: 'article-1',
}

// Articles
const mockArticles = [
  {
    id: 'article-1',
    feedId: 'feed-1',
    title: 'Test Article',
    url: 'https://example.com/article-1',
    publishedAt: '2026-01-15T10:00:00Z',
    preview: 'This is a preview of the article content...',
    content: '<p>Full article content here</p>',
    isRead: false,
    isStarred: false,
  },
  {
    id: 'article-2',
    feedId: 'feed-1',
    title: 'Another Article',
    url: 'https://example.com/article-2',
    publishedAt: '2026-01-14T09:00:00Z',
    preview: 'Another preview...',
    content: '<p>More content</p>',
    isRead: true,
    isStarred: true,
  },
]

// Empty states
const mockEmptyArticles = []
const mockNoSelection = { ...mockUIState, selectedArticleId: null }
```

---

## Notes for Test Implementation

- Mock keyboard events for shortcut testing
- Test that callbacks are called with correct article IDs
- Verify UI state changes (collapsed, focus mode, view mode)
- Test filter logic for folder/feed selection
- **Always test empty states** — Verify helpful messages appear
- Test transitions between states (normal → focus → normal)
