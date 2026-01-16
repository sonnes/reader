# Milestone 2: Feed Management

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete

## Goal

Implement the Feed Management feature — subscribe to feeds, organize them into folders, and manage your sources.

## Overview

Feed Management is a full-page interface where users can view, add, and organize their RSS subscriptions. Users can create folders to group related feeds and bulk import/export their subscriptions via OPML.

**Key Functionality:**
- View all subscribed feeds grouped by folder
- Add a new feed via modal dialog (enter URL, select folder)
- Remove a feed from subscriptions
- Create, rename, and delete folders
- Move feeds between folders via drag or menu
- Import feeds from an OPML file
- Export all subscriptions to OPML

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `reader-plan/sections/feed-management/tests.md` for detailed test-writing instructions including:
- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

The test instructions are framework-agnostic — adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, RSpec, Minitest, PHPUnit, etc.).

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy the section components from `reader-plan/sections/feed-management/components/`:

- `FeedManagement.tsx` — Main component with full page layout

**Note:** This component also uses `FolderSidebar` from the reading-experience section for the left navigation pane.

### Data Layer

The components expect these data shapes:

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
```

You'll need to:
- Create API endpoints for CRUD operations on folders and feeds
- Implement RSS/Atom feed discovery and parsing
- Store favicon URLs (or proxy them)
- Track unread counts per feed

### Callbacks

Wire up these user actions:

| Callback | Description |
|----------|-------------|
| `onCreateFolder` | Called when user creates a new folder |
| `onRenameFolder` | Called when user renames a folder |
| `onDeleteFolder` | Called when user deletes a folder |
| `onAddFeed` | Called when user subscribes to a new feed |
| `onRemoveFeed` | Called when user unsubscribes from a feed |
| `onMoveFeed` | Called when user moves a feed to a different folder |
| `onImportOPML` | Called when user imports feeds from OPML file |
| `onExportOPML` | Called when user exports feeds to OPML file |

### Empty States

Implement empty state UI for when no records exist yet:

- **No feeds yet:** Show a helpful message with "Add Feed" and "Import OPML" buttons
- **No feeds in folder:** Show "No feeds in this folder" message within collapsed folder

The provided component includes empty state designs — make sure to render them when data is empty rather than showing blank screens.

## Files to Reference

- `reader-plan/sections/feed-management/README.md` — Feature overview and design intent
- `reader-plan/sections/feed-management/tests.md` — Test-writing instructions (use for TDD)
- `reader-plan/sections/feed-management/components/` — React components
- `reader-plan/sections/feed-management/types.ts` — TypeScript interfaces
- `reader-plan/sections/feed-management/sample-data.json` — Test data
- `reader-plan/sections/feed-management/screenshot.png` — Visual reference

## Expected User Flows

When fully implemented, users should be able to complete these flows:

### Flow 1: Add a New Feed

1. User clicks "Add Feed" button
2. User enters feed URL in the modal
3. User optionally selects a folder
4. User clicks "Subscribe"
5. **Outcome:** Feed appears in the list, success message shown

### Flow 2: Create a Folder

1. User clicks "New Folder" button
2. User enters folder name in the modal
3. User clicks "Create"
4. **Outcome:** Folder appears in the sidebar and main list

### Flow 3: Move a Feed to a Folder

1. User clicks the menu button (three dots) on a feed row
2. User hovers over "Move to folder"
3. User selects a folder from the submenu
4. **Outcome:** Feed moves to the selected folder

### Flow 4: Import from OPML

1. User clicks "Import OPML" button
2. User selects an OPML file from their computer
3. **Outcome:** Feeds from the OPML are added to subscriptions

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Empty states display properly when no feeds exist
- [ ] User can add/remove feeds
- [ ] User can create/rename/delete folders
- [ ] User can move feeds between folders
- [ ] OPML import/export works
- [ ] Matches the visual design
- [ ] Responsive on mobile
