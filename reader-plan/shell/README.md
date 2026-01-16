# Application Shell

## Overview

Reader uses a minimal header shell that keeps the focus on the reading experience. The shell provides branding and user account access while leaving the main viewport for the 3-pane RSS reader layout.

## Components

- `AppShell.tsx` — Main layout wrapper with header and content area
- `MainNav.tsx` — Placeholder for future navigation (not used in default config)
- `UserMenu.tsx` — User menu dropdown with logout

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Reader                                    [User ▼]  │  ← Header (56px)
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    Content Area                             │
│           (3-pane layout renders here)                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Props

### AppShell

| Prop       | Type                                   | Description                    |
| ---------- | -------------------------------------- | ------------------------------ |
| `children` | `React.ReactNode`                      | Content to render in main area |
| `user`     | `{ name: string; avatarUrl?: string }` | Current user info              |
| `onLogout` | `() => void`                           | Called when user clicks logout |

### UserMenu

| Prop       | Type                                   | Description                        |
| ---------- | -------------------------------------- | ---------------------------------- |
| `user`     | `{ name: string; avatarUrl?: string }` | User info for display              |
| `onLogout` | `() => void`                           | Called when user clicks "Sign out" |

## Design Tokens

- **Colors:** sky (primary), amber (secondary), slate (neutral)
- **Typography:** Noto Sans (heading/body), JetBrains Mono (mono)

## Responsive Behavior

- **Desktop (≥1024px):** Full header with logo and user menu visible
- **Tablet (768px-1023px):** Same as desktop
- **Mobile (<768px):** Compact header, user menu condensed to avatar only
