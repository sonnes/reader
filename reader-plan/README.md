# Reader - Implementation Package

This package contains everything needed to implement the **Reader** RSS feed reader application.

## Quick Start

### Option 1: One-Shot Implementation

Use this approach to build the entire application in one session:

1. Copy the prompt from `prompts/one-shot-prompt.md` to your AI coding assistant
2. Provide `product-overview.md` for context
3. Follow `instructions/one-shot-instructions.md` for implementation steps

### Option 2: Incremental Implementation

Build one section at a time:

1. Start with `instructions/incremental/01-foundation.md` (setup, types, shell)
2. Then implement sections in order:
   - `02-feed-management.md`
   - `03-reading-experience.md`
   - `04-article-tracking.md`
3. Use `prompts/section-prompt.md` as a template for each section

## Package Contents

```
reader-plan/
├── README.md                    # This file
├── product-overview.md          # Product description and features
│
├── prompts/                     # Ready-to-use prompts for AI assistants
│   ├── one-shot-prompt.md       # Full implementation prompt
│   └── section-prompt.md        # Section-by-section template
│
├── instructions/                # Implementation guides
│   ├── one-shot-instructions.md # All milestones combined
│   └── incremental/             # Milestone-by-milestone
│       ├── 01-foundation.md
│       ├── 02-feed-management.md
│       ├── 03-reading-experience.md
│       └── 04-article-tracking.md
│
├── design-system/               # Visual design specifications
│   ├── README.md
│   ├── tokens.css               # CSS custom properties
│   ├── tailwind-colors.md       # Tailwind class reference
│   └── fonts.md                 # Typography setup
│
├── data-model/                  # Data structures
│   ├── README.md
│   ├── types.ts                 # TypeScript interfaces
│   └── sample-data.json         # Example data
│
├── shell/                       # Application shell components
│   ├── README.md
│   └── components/
│       ├── AppShell.tsx
│       ├── MainNav.tsx
│       ├── UserMenu.tsx
│       └── index.ts
│
└── sections/                    # Feature sections
    ├── feed-management/
    │   ├── README.md
    │   ├── tests.md             # TDD test instructions
    │   ├── types.ts
    │   ├── data.json
    │   └── components/
    │
    ├── reading-experience/
    │   ├── README.md
    │   ├── tests.md
    │   ├── types.ts
    │   ├── data.json
    │   └── components/
    │
    └── article-tracking/
        ├── README.md
        ├── tests.md
        ├── types.ts
        ├── data.json
        └── components/
```

## Product Overview

**Reader** is an RSS feed reader that helps users stay informed by aggregating content from their favorite websites. Key features:

- **Feed Management** - Subscribe to RSS/Atom feeds, organize into folders, import/export OPML
- **Reading Experience** - Clean 3-pane interface with keyboard shortcuts and focus mode
- **Article Tracking** - Mark read/unread, star favorites, filter and sort

## Design System

| Token           | Value            |
| --------------- | ---------------- |
| Primary color   | Sky (Tailwind)   |
| Secondary color | Amber (Tailwind) |
| Neutral color   | Slate (Tailwind) |
| Heading font    | Noto Sans        |
| Body font       | Noto Sans        |
| Monospace font  | JetBrains Mono   |

## Test-Driven Development

Each section includes a `tests.md` file with:

- User flow tests (happy path scenarios)
- Empty state tests
- Component interaction tests
- Edge case tests
- Accessibility checks
- Sample test data

These specs are **framework-agnostic** - adapt them to Jest, Vitest, Playwright, Cypress, or any testing framework.

## Technology Recommendations

This package is framework-agnostic, but we recommend:

- **React 18+** with TypeScript
- **Tailwind CSS v4** for styling
- **Vite** or **Next.js** for build tooling
- **Vitest** or **Jest** for testing
- **React Testing Library** for component tests

## Getting Help

The implementation instructions include step-by-step guidance. If you encounter issues:

1. Check the relevant `tests.md` for expected behavior
2. Reference the component code for implementation patterns
3. Review `data-model/types.ts` for correct data structures
