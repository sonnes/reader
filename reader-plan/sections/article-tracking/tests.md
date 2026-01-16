# Test Instructions: Article Tracking

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, RSpec, Minitest, PHPUnit, etc.).

## Overview

Test the article tracking views including list/card layouts, filtering, sorting, and article management actions (read/unread, star, archive, delete).

---

## User Flow Tests

### Flow 1: View All Articles

**Scenario:** User views all articles across feeds

#### Success Path

**Setup:**

- Multiple articles exist from different feeds
- Mix of read and unread articles

**Steps:**

1. User navigates to "All Articles" view
2. User scrolls through the list

**Expected Results:**

- [ ] All articles are displayed regardless of read status
- [ ] Articles show title, source/feed name, publication date
- [ ] Unread articles have visual distinction (bold title, dot indicator)
- [ ] Star indicator shows on starred articles
- [ ] Articles are sorted by date (newest first by default)

---

### Flow 2: Filter to Unread Only

**Scenario:** User filters to see only unread articles

**Setup:**

- Articles exist with mixed read/unread status

**Steps:**

1. User clicks "Unread" filter button
2. User views filtered list

**Expected Results:**

- [ ] Only unread articles are displayed
- [ ] Read articles are hidden from view
- [ ] Filter button shows active state
- [ ] Article count updates to reflect filtered count
- [ ] Clicking "All" returns to full list

---

### Flow 3: Toggle View Mode

**Scenario:** User switches between list and card views

**Setup:**

- Articles exist in list view (default)

**Steps:**

1. User clicks card view toggle
2. User clicks list view toggle

**Expected Results:**

- [ ] Card view shows article preview text
- [ ] Card view displays larger article cards with more info
- [ ] List view shows compact rows
- [ ] View preference persists across navigation
- [ ] Same articles are displayed in both views

---

### Flow 4: Mark Article as Read/Unread

**Scenario:** User toggles read status

**Setup:**

- Article "Test Article" is unread (isRead: false)

**Steps:**

1. User clicks the read status button on "Test Article"
2. User clicks the button again

**Expected Results:**

- [ ] First click: Article changes to read status
- [ ] First click: Unread indicator (dot) disappears
- [ ] First click: Title styling changes to normal weight
- [ ] Second click: Article changes back to unread
- [ ] Second click: Unread indicator reappears
- [ ] Unread count updates accordingly

---

### Flow 5: Star an Article

**Scenario:** User stars an article for later

**Setup:**

- Article "Important Post" exists, not starred

**Steps:**

1. User clicks star button on "Important Post"

**Expected Results:**

- [ ] Star icon fills with color (amber)
- [ ] Article appears when filtering to "Starred"
- [ ] Starred count increments
- [ ] Clicking star again removes the star

---

### Flow 6: Archive an Article

**Scenario:** User archives an article

**Setup:**

- Article "Old News" exists in the list

**Steps:**

1. User clicks archive button on "Old News"

**Expected Results:**

- [ ] Article is removed from current view
- [ ] Confirmation message appears (optional)
- [ ] Article is moved to archive (not deleted)
- [ ] Article can be retrieved from archive view

---

### Flow 7: Delete an Article

**Scenario:** User permanently deletes an article

**Setup:**

- Article "Spam Article" exists in the list

**Steps:**

1. User clicks delete button on "Spam Article"
2. User confirms deletion (if confirmation dialog shown)

**Expected Results:**

- [ ] Confirmation dialog appears (recommended)
- [ ] Article is permanently removed from all views
- [ ] Article cannot be retrieved
- [ ] Counts update accordingly

---

### Flow 8: Sort Articles

**Scenario:** User changes sort order

**Setup:**

- Multiple articles exist with different dates

**Steps:**

1. User clicks sort dropdown
2. User selects "Oldest first"
3. User selects "Newest first"

**Expected Results:**

- [ ] "Oldest first": Articles sorted oldest to newest
- [ ] "Newest first": Articles sorted newest to oldest
- [ ] Sort preference persists during session
- [ ] Visual indicator shows current sort order

---

### Flow 9: Open Article in Reading Pane

**Scenario:** User clicks article to read

**Setup:**

- Articles exist in list
- Reading pane is visible

**Steps:**

1. User clicks on article row/card

**Expected Results:**

- [ ] Article is highlighted/selected in list
- [ ] Reading pane displays article content
- [ ] Article is automatically marked as read
- [ ] Title, source, date shown in reading pane

---

### Flow 10: Open Article in New Tab

**Scenario:** User opens original article

**Setup:**

- Article with external URL exists

**Steps:**

1. User clicks "Open in new tab" button (or uses keyboard shortcut)

**Expected Results:**

- [ ] New browser tab opens with article URL
- [ ] Original tab remains on article list
- [ ] Article is marked as read

---

## Empty State Tests

### No Articles

**Scenario:** User has no articles (new account or all deleted)

**Setup:**

- `articles` array is empty (`[]`)

**Expected Results:**

- [ ] Empty state illustration/icon shown
- [ ] Message: "No articles yet"
- [ ] Helpful text: "Subscribe to feeds to see articles here"
- [ ] Link/button to add feeds

### No Unread Articles

**Scenario:** User has filtered to unread but all are read

**Setup:**

- All articles have `isRead: true`
- Filter set to "unread"

**Expected Results:**

- [ ] Empty state shown
- [ ] Message: "All caught up!"
- [ ] Helpful text: "You've read all your articles"
- [ ] Option to view all articles

### No Starred Articles

**Scenario:** User views starred but hasn't starred any

**Setup:**

- No articles have `isStarred: true`
- Filter set to "starred"

**Expected Results:**

- [ ] Empty state shown
- [ ] Message: "No starred articles"
- [ ] Helpful text: "Star articles to save them for later"

---

## Component Tests

### ArticleListPanel Component

**Renders correctly:**

- [ ] Shows view title ("All Articles" or "Unread")
- [ ] Shows article count
- [ ] Shows filter buttons (All, Unread, Starred)
- [ ] Shows view mode toggle (list/card)
- [ ] Shows sort dropdown

**User interactions:**

- [ ] Clicking filter changes active filter
- [ ] Clicking view toggle changes view mode
- [ ] Clicking sort option changes sort order
- [ ] Callbacks fire with correct parameters

### ArticleRow Component

**Renders correctly:**

- [ ] Shows article title (truncated if long)
- [ ] Shows feed/source name
- [ ] Shows publication date (relative or absolute)
- [ ] Shows unread indicator when `isRead: false`
- [ ] Shows star icon (filled if starred)
- [ ] Shows action buttons on hover

**User interactions:**

- [ ] Clicking row selects article
- [ ] Clicking star toggles star status
- [ ] Clicking read toggle changes read status
- [ ] Clicking archive archives article
- [ ] Clicking delete triggers delete flow

### ArticleCard Component

**Renders correctly:**

- [ ] Shows article title
- [ ] Shows preview text (first ~100 characters)
- [ ] Shows feed/source name
- [ ] Shows publication date
- [ ] Shows unread indicator
- [ ] Shows star icon
- [ ] Shows action buttons

**User interactions:**

- [ ] Same as ArticleRow component

### ArticleDetailPane Component

**Renders correctly:**

- [ ] Shows article title as heading
- [ ] Shows source name (linked to site)
- [ ] Shows publication date
- [ ] Shows full article content (HTML rendered)
- [ ] Shows toolbar with actions
- [ ] Shows "Open original" link

**User interactions:**

- [ ] Clicking read toggle changes status
- [ ] Clicking star toggles star
- [ ] Clicking "Open original" opens URL
- [ ] Scrolling content works properly

---

## Edge Cases

- [ ] Very long article titles truncate properly in list view
- [ ] Very long article titles wrap in card view
- [ ] Articles with no preview text show graceful fallback
- [ ] Articles with no content show message
- [ ] Rapidly clicking action buttons doesn't cause issues
- [ ] Deleting selected article clears selection
- [ ] Archiving last article in filter shows empty state
- [ ] HTML content in articles renders safely (no XSS)
- [ ] Images in article content load properly
- [ ] Code blocks in articles render with syntax highlighting

---

## Accessibility Checks

- [ ] All buttons have accessible labels
- [ ] Filter buttons announce state changes
- [ ] List items have proper ARIA roles
- [ ] Selected article is announced to screen readers
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Focus management when article is deleted
- [ ] Color contrast meets WCAG requirements
- [ ] Read/unread status conveyed beyond color alone

---

## Sample Test Data

```typescript
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
  {
    id: 'article-3',
    feedId: 'feed-2',
    title: 'Third Article from Different Feed',
    url: 'https://example.com/article-3',
    publishedAt: '2026-01-13T08:00:00Z',
    preview: 'Yet another preview...',
    content: '<p>Even more content</p>',
    isRead: false,
    isStarred: false,
  },
]

// Empty states
const mockEmptyArticles = []
const mockAllRead = mockArticles.map((a) => ({ ...a, isRead: true }))
const mockNoStarred = mockArticles.map((a) => ({ ...a, isStarred: false }))
```

---

## Notes for Test Implementation

- Mock callback functions to verify they're called correctly
- Test state changes reflect in UI immediately
- Verify filter logic excludes/includes correct articles
- Test sort order is maintained after actions
- **Always test empty states** — verify helpful messages appear
- Test that archived/deleted articles don't reappear
- Verify article counts update correctly after actions
