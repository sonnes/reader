# One-Shot Implementation Prompt

Copy and paste this prompt to an AI coding assistant to implement the full Reader application.

---

## Prompt

I want you to implement a complete RSS reader application called **Reader**. This is a web-based feed reader that lets users subscribe to RSS/Atom feeds, organize them into folders, and read articles in a clean 3-pane interface.

### Before We Start

Please ask me about:
1. **Tech stack** - What React framework should we use? (Next.js, Vite, Create React App, etc.)
2. **Authentication** - Do we need user accounts? If so, what auth provider?
3. **Data persistence** - Where should we store data? (Local storage, database, etc.)
4. **RSS fetching** - Should we fetch feeds client-side or use a backend proxy?

### Implementation Package

I have a complete implementation package that includes:
- **Product overview** - What the app does and key features
- **Implementation instructions** - Step-by-step guide for each milestone
- **React components** - Reference implementations for all screens
- **TypeScript types** - Interfaces for all data models
- **Sample data** - JSON data for development and testing
- **Design system** - Colors (sky/amber/slate), fonts (Noto Sans, JetBrains Mono)
- **Test instructions** - TDD specs for each section

### Key Features to Implement

1. **Feed Management** - Subscribe to feeds, organize into folders, OPML import/export
2. **Reading Experience** - 3-pane layout, keyboard shortcuts (j/k/o/m/s), focus mode
3. **Article Tracking** - Mark read/unread, star articles, filter and sort

### How to Use This Package

1. Read `product-overview.md` for the full picture
2. Follow `instructions/one-shot-instructions.md` for implementation steps
3. Reference components in `sections/*/components/` for UI patterns
4. Use `data-model/types.ts` for TypeScript interfaces
5. Apply design tokens from `design-system/`
6. Write tests based on `sections/*/tests.md`

Please start by asking your clarifying questions, then we'll begin implementation.
