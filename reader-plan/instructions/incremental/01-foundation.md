# Milestone 1: Foundation

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** None

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**
- Backend API endpoints and database schema
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---

## Goal

Set up the foundational elements: design tokens, data model types, routing structure, and application shell.

## What to Implement

### 1. Design Tokens

Configure your styling system with these tokens:

- See `reader-plan/design-system/tokens.css` for CSS custom properties
- See `reader-plan/design-system/tailwind-colors.md` for Tailwind configuration
- See `reader-plan/design-system/fonts.md` for Google Fonts setup

**Color Palette:**
- Primary: `sky` — Used for buttons, links, key accents
- Secondary: `amber` — Used for stars, highlights, secondary elements
- Neutral: `slate` — Used for backgrounds, text, borders

**Typography:**
- Heading: Noto Sans
- Body: Noto Sans
- Mono: JetBrains Mono

### 2. Data Model Types

Create TypeScript interfaces for your core entities:

- See `reader-plan/data-model/types.ts` for interface definitions
- See `reader-plan/data-model/README.md` for entity relationships

**Core Entities:**
- `Folder` — Container for organizing feeds
- `Feed` — RSS/Atom feed source
- `Article` — Individual post from a feed
- `StarredArticle` — Reference to a saved article

### 3. Routing Structure

Create placeholder routes for each section:

- `/` or `/feeds` — Feed management page
- `/read` — Reading experience (3-pane layout)
- `/articles` — Article tracking views

### 4. Application Shell

Copy the shell components from `reader-plan/shell/components/` to your project:

- `AppShell.tsx` — Main layout wrapper with minimal header
- `MainNav.tsx` — Navigation component (placeholder for future use)
- `UserMenu.tsx` — User menu with avatar and dropdown

**Shell Layout:**
Reader uses a minimal header shell that keeps the focus on the reading experience:
- Fixed header at top (56px height)
- Logo/wordmark on the left
- User menu on the right
- Content area fills remaining viewport height

**Wire Up Navigation:**

The shell does not include section navigation. The 3-pane layout is the primary interface:
- Feed Management → Left pane (folder tree)
- Reading Experience → Center + right panes (article list + reader)
- Article Tracking → Integrated into article list and reader panes

**User Menu:**

The user menu expects:
- User name
- Avatar URL (optional)
- Logout callback

## Files to Reference

- `reader-plan/design-system/` — Design tokens
- `reader-plan/data-model/` — Type definitions
- `reader-plan/shell/README.md` — Shell design intent
- `reader-plan/shell/components/` — Shell React components

## Done When

- [ ] Design tokens are configured (colors, fonts)
- [ ] Data model types are defined
- [ ] Routes exist for all sections (can be placeholder pages)
- [ ] Shell renders with header and user menu
- [ ] User menu shows user info and logout option
- [ ] Content area fills remaining viewport height
- [ ] Responsive on mobile (header adapts)
