# Reader

RSS feed reader inspired by Google Reader. 3-pane interface with keyboard navigation.

## Tech Stack

- **Framework**: TanStack Start (React 19 + Vite 7)
- **Styling**: Tailwind CSS v4 with `@tailwindcss/typography`
- **Database**: SQLite via `bun:sqlite` (file: `reader.db`)
- **Routing**: TanStack Router (file-based routes in `src/routes/`)
- **Testing**: Vitest + React Testing Library

## Development Guidelines

- **Prefer Bun built-in APIs** over external libraries (e.g., `bun:sqlite` instead of better-sqlite3, `Bun.file()` for file I/O). See https://bun.sh/docs for available APIs.

## Commands

```bash
bun dev          # Start dev server on port 3000
bun test         # Run tests
bun run build    # Production build
bun run check    # Format + lint fix
```

## Project Structure

```
src/
├── components/       # React components
│   ├── reading/      # 3-pane reading experience
│   └── shell/        # App shell (nav, layout)
├── db/
│   ├── schema.sql    # SQLite schema
│   ├── queries.ts    # Database query functions
│   └── seed.ts       # Sample data seeding
├── routes/           # TanStack file-based routes
├── server/           # Server functions (createServerFn)
└── types/            # TypeScript interfaces
```

## Server Functions (TanStack Start)

Server functions use `createServerFn` from `@tanstack/react-start`. They run on the server but can be called from client code.

### Pattern

```typescript
// src/server/example.ts
import { createServerFn } from '@tanstack/react-start'
import { someQuery } from '@/db/queries'

// GET for data fetching
export const fetchData = createServerFn({ method: 'GET' }).handler(async () => {
  return someQuery()
})

// POST for mutations
export const updateData = createServerFn({ method: 'POST' }).handler(async (ctx) => {
  const { id, value } = ctx.data as { id: string; value: string }
  // perform mutation
  return { success: true }
})
```

### Usage in Routes

```typescript
// src/routes/example.tsx
import { createFileRoute } from '@tanstack/react-router'
import { fetchData, updateData } from '@/server/example'

export const Route = createFileRoute('/example')({
  loader: async () => await fetchData(),
  component: ExamplePage,
})

function ExamplePage() {
  const data = Route.useLoaderData()
  // Call mutations directly: await updateData({ data: { id, value } })
}
```

### Key Points

- Server functions can access database, env vars, file system
- GET functions called in `loader` run server-side on navigation
- POST functions for mutations, call with `{ data: payload }`
- Build process replaces server code with RPC stubs in client bundles

## Data Model

Three core entities in SQLite:

- **folders**: Organize feeds by topic
- **feeds**: RSS/Atom sources with `folder_id` FK
- **articles**: Individual posts with `feed_id` FK, `is_read`, `is_starred`

Types defined in `src/types/index.ts`. Database queries in `src/db/queries.ts`.

### Database Access (bun:sqlite)

```typescript
import { Database } from 'bun:sqlite'

const db = new Database('reader.db', { create: true })

// Queries use db.query() with positional ? parameters
const rows = db.query('SELECT * FROM articles WHERE feed_id = ?').all(feedId)
const row = db.query('SELECT * FROM articles WHERE id = ?').get(id)
db.query('UPDATE articles SET is_read = ? WHERE id = ?').run(1, id)
```

Key differences from better-sqlite3:
- Use `db.query()` instead of `db.prepare()` (statements are cached)
- Use `db.run()` for PRAGMAs and schema execution
- 3-6x faster than better-sqlite3

## Design System

- **Colors**: Sky (primary), Amber (secondary), Slate (neutral) - Tailwind palette
- **Fonts**: Noto Sans (UI), JetBrains Mono (code)
- **Tokens**: See `reader-plan/design-system/tokens.css`

## Testing

Tests use Vitest with jsdom. Setup in `src/test/setup.ts`.

```bash
bun test                    # Run all tests
bun test src/components     # Run component tests
```

Path alias `@/` maps to `src/` in both app and tests.

## Implementation Plan

Detailed specs in `reader-plan/`:
- `product-overview.md` - Features and product description
- `instructions/` - Step-by-step implementation guides
- `sections/` - Feature-specific specs with test cases
