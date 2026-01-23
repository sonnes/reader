import { useKeyboard } from '~/context'

const shortcuts = [
  { key: 'j', description: 'Next article' },
  { key: 'k', description: 'Previous article' },
  { key: 'm', description: 'Toggle read/unread' },
  { key: 's', description: 'Toggle star' },
  { key: 'o', description: 'Open in browser' },
  { key: 'c', description: 'Copy article link' },
  { key: 'r', description: 'Refresh feeds' },
  { key: '[', description: 'Toggle sidebar' },
  { key: 'f', description: 'Hide sidebar (focus)' },
  { key: 'v', description: 'Switch list/detail view' },
  { key: 'i', description: 'Show original website' },
  { key: 'g a', description: 'Go to Unread' },
  { key: '⌘V', description: 'Paste URL to add feed' },
  { key: '?', description: 'Show this help' },
  { key: 'Esc', description: 'Close / exit focus mode' },
]

export function KeyboardHelpModal() {
  const { showKeyboardHelp, toggleKeyboardHelp } = useKeyboard()

  if (!showKeyboardHelp) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={toggleKeyboardHelp}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Keyboard Shortcuts
        </h2>
        <div className="space-y-2">
          {shortcuts.map(({ key, description }) => (
            <div
              key={key}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-slate-600 dark:text-slate-400">
                {description}
              </span>
              <kbd className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                {key}
              </kbd>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
          Press <kbd className="rounded bg-slate-100 px-1 dark:bg-slate-700">Esc</kbd> or <kbd className="rounded bg-slate-100 px-1 dark:bg-slate-700">?</kbd> to close
        </p>
      </div>
    </div>
  )
}
