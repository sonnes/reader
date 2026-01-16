# Reader — Product Overview

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

## Planned Sections

1. **Feed Management** — Subscribe to feeds, organize them into folders, and manage your sources.
2. **Reading Experience** — The 3-pane layout with article list, reading pane, and keyboard navigation.
3. **Article Tracking** — Read/unread status, filtering, and marking articles.

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

## Design System

**Colors:**

- Primary: `sky`
- Secondary: `amber`
- Neutral: `slate`

**Typography:**

- Heading: Noto Sans
- Body: Noto Sans
- Mono: JetBrains Mono

## Implementation Sequence

Build this product in milestones:

1. **Foundation** — Set up design tokens, data model types, routing, and application shell
2. **Feed Management** — Subscribe to feeds, organize into folders, import/export OPML
3. **Reading Experience** — 3-pane layout with keyboard navigation and focus mode
4. **Article Tracking** — Read/unread status, filtering, list/card views

Each milestone has a dedicated instruction document in `reader-plan/instructions/`.
