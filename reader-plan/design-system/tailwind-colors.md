# Tailwind Color Usage

This product uses the following Tailwind CSS color palette:

## Primary: Sky

Use `sky-*` classes for primary actions, links, and interactive elements.

| Use Case | Light Mode | Dark Mode |
|----------|------------|-----------|
| Primary buttons | `bg-sky-500 hover:bg-sky-600` | `dark:bg-sky-600 dark:hover:bg-sky-700` |
| Links | `text-sky-600` | `dark:text-sky-400` |
| Focus rings | `focus:ring-sky-500` | `dark:focus:ring-sky-400` |
| Active states | `bg-sky-100` | `dark:bg-sky-900` |
| Badges | `bg-sky-100 text-sky-700` | `dark:bg-sky-900 dark:text-sky-300` |

## Secondary: Amber

Use `amber-*` classes for stars, favorites, warnings, and secondary accents.

| Use Case | Light Mode | Dark Mode |
|----------|------------|-----------|
| Star icons | `text-amber-500` | `dark:text-amber-400` |
| Warnings | `bg-amber-100 text-amber-800` | `dark:bg-amber-900 dark:text-amber-200` |
| Secondary buttons | `bg-amber-500 hover:bg-amber-600` | `dark:bg-amber-600 dark:hover:bg-amber-700` |

## Neutral: Slate

Use `slate-*` classes for backgrounds, text, borders, and UI chrome.

| Use Case | Light Mode | Dark Mode |
|----------|------------|-----------|
| Page background | `bg-slate-50` | `dark:bg-slate-950` |
| Card background | `bg-white` | `dark:bg-slate-900` |
| Primary text | `text-slate-900` | `dark:text-slate-50` |
| Secondary text | `text-slate-600` | `dark:text-slate-400` |
| Muted text | `text-slate-500` | `dark:text-slate-500` |
| Borders | `border-slate-200` | `dark:border-slate-800` |
| Dividers | `divide-slate-200` | `dark:divide-slate-800` |
| Hover backgrounds | `hover:bg-slate-100` | `dark:hover:bg-slate-800` |

## Common Patterns

### Buttons

```jsx
// Primary button
<button className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg dark:bg-sky-600 dark:hover:bg-sky-700">
  Primary Action
</button>

// Secondary button
<button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300">
  Secondary Action
</button>

// Ghost button
<button className="hover:bg-slate-100 text-slate-600 px-4 py-2 rounded-lg dark:hover:bg-slate-800 dark:text-slate-400">
  Ghost Action
</button>
```

### Cards

```jsx
<div className="bg-white border border-slate-200 rounded-lg p-4 dark:bg-slate-900 dark:border-slate-800">
  <h3 className="text-slate-900 font-medium dark:text-slate-50">Card Title</h3>
  <p className="text-slate-600 dark:text-slate-400">Card content</p>
</div>
```

### Unread Indicator

```jsx
// Unread dot
<span className="w-2 h-2 rounded-full bg-sky-500" />

// Unread text styling
<span className="font-semibold text-slate-900 dark:text-slate-50">Unread Title</span>

// Read text styling
<span className="text-slate-600 dark:text-slate-400">Read Title</span>
```

### Star Icon

```jsx
// Starred
<StarIcon className="w-5 h-5 text-amber-500 fill-amber-500" />

// Not starred
<StarIcon className="w-5 h-5 text-slate-400 dark:text-slate-600" />
```
