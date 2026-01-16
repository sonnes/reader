# Typography

This product uses the following fonts from Google Fonts:

## Font Family

| Purpose  | Font           | Weights  |
| -------- | -------------- | -------- |
| Headings | Noto Sans      | 600, 700 |
| Body     | Noto Sans      | 400, 500 |
| Code     | JetBrains Mono | 400, 500 |

## Installation

### Option 1: Google Fonts CDN (Recommended)

Add to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Noto+Sans:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

### Option 2: CSS @import

Add to your main CSS file:

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Noto+Sans:wght@400;500;600;700&display=swap');
```

### Option 3: Self-hosted (Fontsource)

Install packages:

```bash
npm install @fontsource/noto-sans @fontsource/jetbrains-mono
```

Import in your app entry point:

```javascript
import '@fontsource/noto-sans/400.css'
import '@fontsource/noto-sans/500.css'
import '@fontsource/noto-sans/600.css'
import '@fontsource/noto-sans/700.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
```

## Tailwind CSS Configuration

For Tailwind CSS v4, add to your CSS:

```css
@theme {
  --font-sans: 'Noto Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
}
```

Then use in your components:

```jsx
<h1 className="font-sans font-semibold">Heading</h1>
<p className="font-sans">Body text</p>
<code className="font-mono">Code snippet</code>
```

## Typography Scale

| Element         | Classes                  |
| --------------- | ------------------------ |
| Page title      | `text-2xl font-semibold` |
| Section heading | `text-xl font-semibold`  |
| Card title      | `text-lg font-medium`    |
| Body text       | `text-base`              |
| Small text      | `text-sm`                |
| Caption         | `text-xs text-slate-500` |
| Code            | `font-mono text-sm`      |

## Usage Examples

```jsx
// Page title
<h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
  All Articles
</h1>

// Article title
<h2 className="text-lg font-medium text-slate-900 dark:text-slate-50">
  Article Title Here
</h2>

// Body text
<p className="text-slate-600 dark:text-slate-400">
  Article preview or description text goes here.
</p>

// Muted text
<span className="text-sm text-slate-500">
  Published 2 hours ago
</span>

// Code block
<pre className="font-mono text-sm bg-slate-100 dark:bg-slate-900 p-4 rounded-lg">
  <code>const reader = new FeedReader();</code>
</pre>
```
