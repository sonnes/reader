interface KeyboardHelpProps {
  onClose?: () => void
}

const shortcuts = [
  {
    category: 'Navigation',
    items: [
      { key: 'j', description: 'Next article' },
      { key: 'k', description: 'Previous article' },
      { key: 'g f', description: 'Go to feeds' },
      { key: 'g a', description: 'Go to all articles' },
    ],
  },
  {
    category: 'Article Actions',
    items: [
      { key: 'o', description: 'Open in browser' },
      { key: 'm', description: 'Toggle read/unread' },
      { key: 's', description: 'Toggle star' },
      { key: 'r', description: 'Refresh feeds' },
    ],
  },
  {
    category: 'View',
    items: [
      { key: '[', description: 'Collapse sidebar' },
      { key: 'f', description: 'Toggle focus mode' },
      { key: 'v', description: 'Toggle list/card view' },
      { key: '?', description: 'Show keyboard shortcuts' },
    ],
  },
]

export function KeyboardHelp({ onClose }: KeyboardHelpProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid gap-6">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((shortcut) => (
                    <div
                      key={shortcut.key}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 min-w-[2rem] text-center">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Press{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">
              Esc
            </kbd>{' '}
            or{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">
              ?
            </kbd>{' '}
            to close
          </p>
        </div>
      </div>
    </div>
  )
}
