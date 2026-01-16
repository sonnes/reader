import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface UserMenuProps {
  user: { name: string; avatarUrl?: string }
  onLogout?: () => void
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger - Simple text link style */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs text-sky-100 hover:text-white"
      >
        {user.name}
        <ChevronDown
          className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-32 overflow-hidden rounded border border-slate-300 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-800">
          <button
            onClick={() => {
              setIsOpen(false)
              onLogout?.()
            }}
            className="flex w-full items-center px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
