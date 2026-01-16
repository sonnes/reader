/**
 * MainNav - Placeholder for potential future navigation needs
 *
 * Reader uses a minimal header shell without section navigation.
 * The 3-pane layout (folders | articles | reader) is the primary interface.
 * This component is included for consistency with the shell pattern but
 * is not rendered in the default shell configuration.
 */

export interface MainNavProps {
  items?: Array<{ label: string; href: string; isActive?: boolean }>
  onNavigate?: (href: string) => void
}

export function MainNav({ items = [], onNavigate }: MainNavProps) {
  if (items.length === 0) return null

  return (
    <nav className="flex items-center gap-1">
      {items.map((item) => (
        <button
          key={item.href}
          onClick={() => onNavigate?.(item.href)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            item.isActive
              ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
          }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
