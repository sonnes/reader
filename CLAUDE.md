# Reader

Single-executable React application built with Vite and compiled to a standalone binary using Bun.

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 + shadcn/ui for styling and components
- Bun for compilation to single executable

## Project Structure

```
src/
  main.tsx          # React entry point
  App.tsx           # Root component with routes
  components/       # Shared components
    layout/         # Google Reader-style layout components
      Layout.tsx    # Main three-panel layout with state management
      Sidebar.tsx   # Left panel: feeds and folders navigation
      EntryList.tsx # Middle panel: article list
      ReadingPane.tsx # Right panel: article content viewer
    ui/             # shadcn/ui components (add via: bunx shadcn@latest add <component>)
  pages/            # Route page components
server.ts           # Production HTTP server (embedded in binary)
build-executable.ts # Build script for compilation
```

## UI Layout

Classic Google Reader three-panel design:
- **Sidebar** (256px): Collapsible folders with feeds, unread counts, blue accent (#4285f4)
- **Entry List** (320px): Article list with bold unread/muted read styling
- **Reading Pane** (flex): Article content with Tailwind Typography prose styling

Keyboard navigation: j/k or arrows to navigate entries, Escape to deselect. Responsive: sidebar collapses on screens <768px.

## Commands

```bash
bun run dev      # Development server with HMR
bun run compile  # Build and compile to ./reader executable
./reader         # Run compiled binary (PORT=8080 ./reader for custom port)
```

## Import Alias

Use `@/` for imports from src directory (e.g., `import App from "@/App"`).
