# Section Implementation Prompt Template

Use this template when implementing one section at a time. Replace `[SECTION]` with the section name.

---

[SECTION]=feed-management

## Prompt

I want you to implement the **[SECTION]** section of the Reader RSS application. Reuse existing components and data model. Only add new components and functions.

Organize db functions as defined In the documentation.

### Context

Reader is an RSS feed reader with three main sections:

1. **Feed Management** - Subscribe to feeds, organize into folders
2. **Reading Experience** - 3-pane layout for reading articles
3. **Article Tracking** - View and manage all articles

We're implementing **[SECTION]** now.

### Before We Start

Please ask me about:

1. **Current state** - What's already implemented?
2. **Tech stack** - What framework and libraries are we using?
3. **Data layer** - How is data currently being managed?

### Implementation Package

For this section, please reference:

- `sections/[SECTION]/README.md` - Overview and requirements
- `sections/[SECTION]/components/` - Reference React components
- `sections/[SECTION]/tests.md` - Test-Driven Development specs
- `data-model/types.ts` - TypeScript interfaces
- `design-system/` - Colors and typography

### Implementation Steps

1. Read the section README for requirements
2. Review the test specs in tests.md
3. Implement components following the reference code
4. Write tests as you go (TDD approach)
5. Ensure dark mode and responsive design work

### Key Requirements

- Use TypeScript with strict types
- Support light and dark modes (`dark:` variants)
- Make all components responsive
- Follow the design system (sky/amber/slate colors)
- Write tests for user flows and edge cases

Please start by asking your clarifying questions, then we'll implement this section.

---

## Section-Specific Details

### For Feed Management

Focus on:

- Feed subscription flow (URL input, preview, confirm)
- Folder organization (create, rename, delete folders)
- OPML import/export
- Empty states when no feeds exist

### For Reading Experience

Focus on:

- 3-pane layout (sidebar, list, reading pane)
- Keyboard shortcuts (j/k for navigation, o to open, etc.)
- Focus mode (full-screen reading)
- Automatic read marking

### For Article Tracking

Focus on:

- List and card view modes
- Filtering (all, unread, starred)
- Sorting (newest, oldest)
- Bulk actions (mark all read)
