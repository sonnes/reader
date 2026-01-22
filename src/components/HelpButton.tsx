import { HelpCircle } from 'lucide-react'
import { useKeyboard } from '~/context'

export function HelpButton() {
  const { toggleKeyboardHelp } = useKeyboard()

  return (
    <button
      onClick={toggleKeyboardHelp}
      className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
      title="Keyboard shortcuts (?)"
    >
      <HelpCircle className="h-5 w-5" />
    </button>
  )
}
