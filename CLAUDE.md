# Reader

RSS feed reader inspired by Google Reader. 3-pane interface with keyboard navigation.

## Tech Stack

- **Framework**: TanStack Start (React 19 + Vite 7)
- **Styling**: Tailwind CSS v4 with `@tailwindcss/typography`
- **Components**: shadcn/ui
- **Database**: TanStack DB `src/db/`
- **Routing**: TanStack Router (file-based routes in `src/routes/`)
- **Testing**: Vitest + React Testing Library

## TanStack DB Usage

Use `useLiveQuery` to fetch data from collections. Live queries automatically update when data changes.

**Colocate data fetching**: Fetch data in the component where it's used, not at the top and passed down via props. Each component should own its data requirements.

```typescript
import { useLiveQuery, eq } from '@tanstack/react-db'
import { foldersCollection, feedsCollection, articlesCollection } from '~/db'

// Fetch all folders
const { data: folders } = useLiveQuery((q) =>
  q.from({ folder: foldersCollection })
)

// Fetch feeds in a folder
const { data: feeds } = useLiveQuery((q) =>
  q.from({ feed: feedsCollection })
    .where(({ feed }) => eq(feed.folderId, folderId))
)

// Fetch unread articles
const { data: articles } = useLiveQuery((q) =>
  q.from({ article: articlesCollection })
    .where(({ article }) => eq(article.isRead, false))
)
```

### Mutations

Mutate collections directly - changes persist to localStorage automatically:

```typescript
import { foldersCollection, folderIdFromName, timestamp } from '~/db'

// Insert
foldersCollection.insert({
  id: folderIdFromName('Tech'),
  name: 'Tech',
  createdAt: timestamp(),
  updatedAt: timestamp(),
})

// Update
foldersCollection.update(folderId, (draft) => {
  draft.name = 'New Name'
  draft.updatedAt = timestamp()
})

// Delete
foldersCollection.delete(folderId)
```