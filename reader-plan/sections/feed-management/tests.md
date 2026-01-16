# Test Instructions: Feed Management

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, RSpec, Minitest, PHPUnit, etc.).

## Overview

Test the feed management interface for subscribing to feeds, organizing them into folders, and bulk import/export via OPML.

---

## User Flow Tests

### Flow 1: Add a New Feed

**Scenario:** User subscribes to a new RSS feed

#### Success Path

**Setup:**
- User is on the feed management page
- At least one folder exists ("Tech Blogs")

**Steps:**
1. User clicks "Add Feed" button
2. User sees modal with "Add Feed" title
3. User enters "https://example.com/feed.xml" in the Feed URL field
4. User selects "Tech Blogs" from the Folder dropdown (optional)
5. User clicks "Subscribe" button

**Expected Results:**
- [ ] Modal closes
- [ ] New feed appears in the feed list under "Tech Blogs" folder
- [ ] Feed shows title, favicon placeholder, and 0 unread count initially
- [ ] Success indication (toast or feed appearing)

#### Failure Path: Invalid URL

**Setup:**
- User is on the feed management page

**Steps:**
1. User clicks "Add Feed" button
2. User enters "not-a-valid-url" in the Feed URL field
3. User clicks "Subscribe" button

**Expected Results:**
- [ ] Error message appears: "Please enter a valid URL"
- [ ] Modal remains open
- [ ] URL field shows validation error styling

#### Failure Path: Feed Not Found

**Setup:**
- Server returns 404 for the feed URL

**Steps:**
1. User enters "https://example.com/nonexistent.xml"
2. User clicks "Subscribe"

**Expected Results:**
- [ ] Error message appears: "Could not find a valid feed at this URL"
- [ ] Modal remains open
- [ ] User can correct the URL and retry

---

### Flow 2: Create a Folder

**Scenario:** User creates a new folder to organize feeds

#### Success Path

**Setup:**
- User is on the feed management page

**Steps:**
1. User clicks "New Folder" button
2. User sees modal with "Create Folder" title
3. User enters "News Sites" in the Folder Name field
4. User clicks "Create" button

**Expected Results:**
- [ ] Modal closes
- [ ] New folder "News Sites" appears in the sidebar and main list
- [ ] Folder shows "0 feeds" count

#### Failure Path: Empty Name

**Steps:**
1. User clicks "New Folder"
2. User leaves name field empty
3. User clicks "Create"

**Expected Results:**
- [ ] "Create" button is disabled when name is empty
- [ ] Or error message: "Folder name is required"

---

### Flow 3: Move a Feed to a Folder

**Scenario:** User reorganizes feeds by moving them between folders

**Setup:**
- Feed "Example Blog" exists in "Uncategorized"
- Folder "Tech Blogs" exists

**Steps:**
1. User hovers over "Example Blog" feed row
2. User clicks the menu button (three dots icon)
3. User hovers over "Move to folder"
4. User clicks "Tech Blogs" from the submenu

**Expected Results:**
- [ ] Menu closes
- [ ] Feed disappears from Uncategorized
- [ ] Feed appears under "Tech Blogs" folder
- [ ] Folder counts update correctly

---

### Flow 4: Delete a Feed

**Scenario:** User unsubscribes from a feed

**Setup:**
- Feed "Old Blog" exists

**Steps:**
1. User hovers over "Old Blog" feed row
2. User clicks the menu button (three dots icon)
3. User clicks "Unsubscribe"

**Expected Results:**
- [ ] Feed is removed from the list
- [ ] Folder unread counts update
- [ ] (Optional) Confirmation dialog appears first

---

### Flow 5: Rename a Folder

**Scenario:** User renames an existing folder

**Setup:**
- Folder "Old Name" exists

**Steps:**
1. User hovers over folder header
2. User clicks the menu button (three dots icon)
3. User clicks "Rename"
4. User changes name to "New Name"
5. User presses Enter or clicks outside

**Expected Results:**
- [ ] Folder name updates to "New Name"
- [ ] Feeds inside remain unchanged

---

### Flow 6: Import from OPML

**Scenario:** User imports subscriptions from an OPML file

**Setup:**
- User has an OPML file with 5 feeds

**Steps:**
1. User clicks "Import OPML" button
2. User selects the OPML file from file picker
3. System parses and imports feeds

**Expected Results:**
- [ ] File picker opens
- [ ] After selection, feeds are added to the list
- [ ] Folders from OPML are created if they don't exist
- [ ] Success message: "Imported 5 feeds"

---

## Empty State Tests

### No Feeds Yet

**Scenario:** First-time user with no subscriptions

**Setup:**
- `feeds` array is empty (`[]`)
- `folders` array may be empty or have empty folders

**Expected Results:**
- [ ] Shows empty state with RSS icon
- [ ] Shows heading "No feeds yet"
- [ ] Shows message "Subscribe to your favorite blogs and news sites to start reading. You can also import your existing subscriptions from an OPML file."
- [ ] Shows "Import OPML" button
- [ ] Shows "Add Feed" button
- [ ] Both buttons are functional

### Empty Folder

**Scenario:** Folder exists but has no feeds

**Setup:**
- Folder "Empty Folder" exists with `feedIds: []`

**Expected Results:**
- [ ] Folder is visible and expandable
- [ ] Shows "No feeds in this folder" message inside
- [ ] Folder shows "0 feeds" count

---

## Component Interaction Tests

### FeedManagement Component

**Renders correctly:**
- [ ] Shows header with "Manage Feeds" title
- [ ] Shows total feed count (e.g., "10 feeds")
- [ ] Shows total unread count (e.g., "25 unread articles")
- [ ] Shows action buttons: Import OPML, Export OPML, New Folder, Add Feed

**User interactions:**
- [ ] Clicking "Add Feed" opens the add feed modal
- [ ] Clicking "New Folder" opens the create folder modal
- [ ] Clicking "Import OPML" opens file picker
- [ ] Clicking "Export OPML" calls `onExportOPML`

### FeedRow Component

**Renders correctly:**
- [ ] Shows feed favicon (or placeholder icon)
- [ ] Shows feed title
- [ ] Shows unread count badge when > 0
- [ ] Shows site hostname

**User interactions:**
- [ ] Hovering shows drag handle and action menu button
- [ ] Clicking external link icon opens site in new tab
- [ ] Menu button opens dropdown with "Move to folder" and "Unsubscribe"

### FolderGroup Component

**Renders correctly:**
- [ ] Shows expand/collapse chevron
- [ ] Shows folder name
- [ ] Shows feed count
- [ ] Shows unread count when > 0

**User interactions:**
- [ ] Clicking chevron toggles expand/collapse
- [ ] Double-clicking name enters edit mode (or via menu)
- [ ] Menu shows "Rename" and "Delete" options

---

## Edge Cases

- [ ] Handles feed title with very long text (truncates with ellipsis)
- [ ] Works correctly with 0 feeds and 0 folders
- [ ] Works correctly with 100+ feeds across multiple folders
- [ ] Handles special characters in folder names
- [ ] Handles drag-and-drop between folders (if implemented)
- [ ] Preserves state when navigating away and back

---

## Accessibility Checks

- [ ] All buttons have accessible labels
- [ ] Modals trap focus when open
- [ ] Modals close on Escape key
- [ ] Menu items are keyboard navigable
- [ ] Form fields have associated labels
- [ ] Error messages are announced to screen readers

---

## Sample Test Data

```typescript
// Populated state
const mockFolders = [
  { id: "folder-1", name: "Tech Blogs", feedIds: ["feed-1"], unreadCount: 8 },
  { id: "folder-2", name: "News", feedIds: ["feed-2"], unreadCount: 12 },
];

const mockFeeds = [
  {
    id: "feed-1",
    title: "Example Blog",
    url: "https://example.com/feed.xml",
    siteUrl: "https://example.com",
    favicon: "https://example.com/favicon.ico",
    folderId: "folder-1",
    unreadCount: 8,
    lastFetched: "2026-01-15T08:00:00Z",
  },
  {
    id: "feed-2",
    title: "News Site",
    url: "https://news.example.com/rss",
    siteUrl: "https://news.example.com",
    favicon: "",
    folderId: "folder-2",
    unreadCount: 12,
    lastFetched: "2026-01-15T09:00:00Z",
  },
];

// Empty state
const mockEmptyFeeds = [];
const mockEmptyFolders = [];

// Folder with no feeds
const mockFolderNoFeeds = [
  { id: "folder-1", name: "Empty Folder", feedIds: [], unreadCount: 0 },
];
```

---

## Notes for Test Implementation

- Mock API calls for add/remove/move operations
- Test both optimistic updates and server confirmation
- Verify callback props are called with correct arguments
- Test modal open/close states
- Test file input for OPML import (mock FileReader if needed)
- **Always test empty states** — Pass empty arrays to verify helpful UI appears
