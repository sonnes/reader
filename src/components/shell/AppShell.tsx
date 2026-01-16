import { Rss } from 'lucide-react'
import { UserMenu } from './UserMenu'

export interface AppShellProps {
  children: React.ReactNode
  user?: { name: string; avatarUrl?: string }
  onLogout?: () => void
}

export function AppShell({ children, user, onLogout }: AppShellProps) {
  return (
    <div className="flex h-screen flex-col bg-white dark:bg-slate-900">
      {/* Minimal Header - 56px height per spec */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 dark:border-slate-700 dark:bg-slate-900">
        {/* Left: Logo/Wordmark */}
        <div className="flex items-center gap-2">
          <Rss className="h-5 w-5 text-sky-500" />
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Reader
          </span>
        </div>

        {/* Right: User Menu */}
        {user && <UserMenu user={user} onLogout={onLogout} />}
      </header>

      {/* Content Area - fills remaining viewport height */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
