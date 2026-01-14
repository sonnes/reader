# Google Reader Clone - Development Prompts

Series of prompts for building a Google Reader clone using Claude Code with the Ralph Loop methodology.

---

/ralph-loop:ralph-loop "Bootstrap the project using - React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui for styling and components" --completion-promise DONE

---

/ralph-loop:ralph-loop --completion-promise DONE "Create the UI layout mimicking classic Google Reader using React, Tailwind CSS v4, and shadcn/ui.

Requirements: Create a three-panel layout in src/components/layout/Layout.tsx:

- Match Google Reader's clean, utilitarian aesthetic
- Color scheme: White background, blue accents (#4285f4), gray borders
- Unread items: Bold title
- Read items: Normal weight, slightly muted
- Hover states on interactive elements
- Responsive: Collapse sidebar on narrow screens

When complete:

- Layout renders with all three panels
- Sidebar shows placeholder feeds and folders
- Entry list shows placeholder entries
- Reading pane shows selected entry content
- Basic keyboard navigation works
- Looks similar to classic Google Reader
- No console errors
- Output: DONE"

---

/ralph-loop:ralph-loop --completion-promise DONE "Implement the backend using bun sqlite3 and SSR for rendering the app.

when complete:

- The app is rendered via SSR
- The database is used to store the data
- The data is fetched from the database and rendered in the app
- The app is responsive and works on all devices
  "
