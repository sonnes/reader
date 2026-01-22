# Reader

RSS feed reader SPA inspired by Google Reader. 3-pane interface with keyboard navigation. All data stored client-side in IndexedDB.

## Tech Stack

- **Framework**: TanStack Start (React 19 + Vite 7)
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui (Radix primitives)
- **Database**: TanStack DB with IndexedDB persistence (`src/db/`)
- **Routing**: TanStack Router (file-based routes in `src/routes/`)
- **Feed Parsing**: Web Worker (`src/workers/`) using feedsmith

## Commands

```bash
pnpm dev      # Start dev server
pnpm build    # Production build
pnpm test     # Run tests
```

## Project Structure

```
src/
├── components/       # React components (flat structure + ui/ for shadcn)
├── context/          # React contexts (AppState, ArticleList)
├── db/               # TanStack DB collections (folders, feeds, articles)
├── hooks/            # Custom hooks (useArticleActions, useFeedWorker)
├── routes/           # File-based routes
└── workers/          # Web worker for feed fetching/parsing
```

## TanStack DB

Data lives in three collections: `foldersCollection`, `feedsCollection`, `articlesCollection`.

**Colocate data fetching**: Use `useLiveQuery` in the component that needs the data, not at the top.

```typescript
import { useLiveQuery, eq } from '@tanstack/react-db'
import { feedsCollection } from '~/db'

const { data: feeds } = useLiveQuery((q) =>
  q.from({ feed: feedsCollection })
    .where(({ feed }) => eq(feed.folderId, folderId))
)
```

**Mutations** persist to IndexedDB automatically:

```typescript
import { foldersCollection, folderIdFromName, timestamp } from '~/db'

foldersCollection.insert({ id: folderIdFromName('Tech'), name: 'Tech', createdAt: timestamp(), updatedAt: timestamp() })
foldersCollection.update(folderId, (draft) => { draft.name = 'New Name' })
foldersCollection.delete(folderId)
```

## Feed Worker

Feed fetching runs in a web worker to avoid blocking the UI. Use `useFeedWorker` hook or import `feedWorkerClient` directly:

```typescript
import { feedWorkerClient } from '~/workers/feed-worker-client'

const result = await feedWorkerClient.validateFeed(url)
const parsed = await feedWorkerClient.parseFeed(url)
```