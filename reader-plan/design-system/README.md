# Design System

This directory contains the design tokens and guidelines for the Reader RSS application.

## Files

| File                                     | Description                                |
| ---------------------------------------- | ------------------------------------------ |
| [tokens.css](tokens.css)                 | CSS custom properties for colors and fonts |
| [tailwind-colors.md](tailwind-colors.md) | Tailwind color class reference             |
| [fonts.md](fonts.md)                     | Typography setup and usage                 |

## Quick Start

1. **Install fonts** - See [fonts.md](fonts.md) for Google Fonts setup
2. **Configure Tailwind** - Use the color palette documented in [tailwind-colors.md](tailwind-colors.md)
3. **Optional: Import tokens** - Use [tokens.css](tokens.css) if you prefer CSS custom properties

## Color Palette

| Role      | Tailwind Color | Usage                                            |
| --------- | -------------- | ------------------------------------------------ |
| Primary   | `sky`          | Buttons, links, active states, unread indicators |
| Secondary | `amber`        | Stars, favorites, warnings                       |
| Neutral   | `slate`        | Text, backgrounds, borders                       |

## Typography

| Role     | Font                      |
| -------- | ------------------------- |
| Headings | Noto Sans (600, 700)      |
| Body     | Noto Sans (400, 500)      |
| Code     | JetBrains Mono (400, 500) |

## Dark Mode

All components support dark mode using Tailwind's `dark:` variant. The design system uses:

- Light backgrounds: `slate-50`, white
- Dark backgrounds: `slate-950`, `slate-900`
- Automatic contrast adjustments for text and borders

## Accessibility

- All color combinations meet WCAG AA contrast requirements
- Interactive elements have visible focus states
- Status indicators use more than color alone (icons, text, patterns)
