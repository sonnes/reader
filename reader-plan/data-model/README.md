# Data Model

This directory contains the core data model definitions for the Reader RSS application.

## Files

| File                                 | Description                              |
| ------------------------------------ | ---------------------------------------- |
| [types.ts](types.ts)                 | TypeScript interfaces for all entities   |
| [sample-data.json](sample-data.json) | Example data for development and testing |

## Entities

### Folder

A container for organizing feeds by topic. Users create folders to group related feeds together (e.g., "Tech", "News", "Personal Blogs").

### Feed

An RSS or Atom feed source that the user subscribes to. Represents a single blog, news site, or publication that publishes articles.

### Article

An individual post or item from a feed. Contains the title, content, publication date, and read/unread status.

### StarredArticle

A reference to an article the user has saved or starred for later. Allows users to build a collection of favorite articles independent of their feed organization.

## Relationships

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│  Folder  │──────▶│   Feed   │──────▶│ Article  │
└──────────┘ 1:N   └──────────┘ 1:N   └──────────┘
                         │                  ▲
                         │                  │
                    (optional)         references
                         │                  │
                         ▼            ┌─────┴────┐
                       null           │ Starred  │
                   (uncategorized)    │ Article  │
                                      └──────────┘
```

- **Folder has many Feeds** - One folder can contain multiple feeds
- **Feed belongs to one Folder** (or no folder) - Feeds can be uncategorized
- **Feed has many Articles** - Each feed contains multiple articles
- **Article belongs to one Feed** - Every article comes from a single feed
- **StarredArticle references one Article** - Starred items point to existing articles

## Usage

Import the types in your application:

```typescript
import type { Folder, Feed, Article, StarredArticle } from './data-model/types'
```

Use sample data for development:

```typescript
import sampleData from './data-model/sample-data.json'

const { folders, feeds, articles, starredArticles } = sampleData
```
