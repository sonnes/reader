# Feed Management

## Overview

A full-page feed management interface where users can view, add, and organize their RSS subscriptions. Users can create folders to group related feeds and bulk import/export their subscriptions via OPML.

## User Flows

- Add a new feed via modal dialog (enter URL, select folder, confirm)
- Remove a feed from subscriptions
- Create, rename, and delete folders
- Drag feeds into folders to organize them
- Import feeds from an OPML file
- Export all subscriptions to OPML

## Design Decisions

- Full-page layout with collapsible sidebar for folder navigation
- Each feed displays favicon, name, unread count, and folder location
- Folder groups are collapsible with expand/collapse toggles
- Action menus appear on hover for clean default appearance
- OPML import/export buttons in the header for easy access

## Data Used

**Entities:**

- `Folder` — Container for organizing feeds
- `Feed` — RSS/Atom feed source

**From global model:**

- Folder has many Feeds
- Feed belongs to one Folder (or none)

## Visual Reference

See `screenshot.png` for the target UI design.

## Components Provided

- `FeedManagement` — Main component with full page layout

## Callback Props

| Callback         | Description                                         |
| ---------------- | --------------------------------------------------- |
| `onCreateFolder` | Called when user creates a new folder               |
| `onRenameFolder` | Called when user renames a folder                   |
| `onDeleteFolder` | Called when user deletes a folder                   |
| `onAddFeed`      | Called when user subscribes to a new feed           |
| `onRemoveFeed`   | Called when user unsubscribes from a feed           |
| `onMoveFeed`     | Called when user moves a feed to a different folder |
| `onImportOPML`   | Called when user imports feeds from OPML file       |
| `onExportOPML`   | Called when user exports feeds to OPML file         |
