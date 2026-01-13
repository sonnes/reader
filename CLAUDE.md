# Reader

Single-executable React application built with Vite and compiled to a standalone binary using Bun.

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 + shadcn/ui for styling and components
- react-router-dom for client-side routing
- Bun for compilation to single executable

## Project Structure

```
src/
  main.tsx          # React entry point
  App.tsx           # Root component with routes
  components/       # Shared components
    ui/             # shadcn/ui components (add via: bunx shadcn@latest add <component>)
  pages/            # Route page components
server.ts           # Production HTTP server (embedded in binary)
build-executable.ts # Build script for compilation
```

## Commands

```bash
bun run dev      # Development server with HMR
bun run compile  # Build and compile to ./reader executable
./reader         # Run compiled binary (PORT=8080 ./reader for custom port)
```

## Import Alias

Use `@/` for imports from src directory (e.g., `import App from "@/App"`).
