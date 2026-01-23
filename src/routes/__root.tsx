/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Menu, Rss } from 'lucide-react'
import * as React from 'react'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'
import { RefreshButton } from '~/components/RefreshButton'
import { KeyboardShortcutsHandler } from '~/components/KeyboardShortcutsHandler'
import { KeyboardHelpModal } from '~/components/KeyboardHelpModal'
import { HelpButton } from '~/components/HelpButton'
import { ArticleListProvider, KeyboardProvider, AppStateProvider, useAppState } from '~/context'
import { useMobileLayout } from '~/hooks/useMobileLayout'
import { refreshScheduler } from '~/lib/refresh-scheduler'
import { seedDefaultFeed } from '~/db/seed'
import appCss from '~/styles/app.css?url'
import { seo } from '~/utils/seo'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({
        title: 'Reader - RSS Feed Reader',
        description: 'A modern RSS feed reader with keyboard navigation.',
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <Layout>
          <DefaultCatchBoundary {...props} />
        </Layout>
      </RootDocument>
    )
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  React.useEffect(() => {
    seedDefaultFeed()
    refreshScheduler.start()
    return () => refreshScheduler.stop()
  }, [])

  return (
    <RootDocument>
      <AppStateProvider>
        <KeyboardProvider>
          <Layout>
            <ArticleListProvider>
              <KeyboardShortcutsHandler />
              <Outlet />
            </ArticleListProvider>
          </Layout>
          <KeyboardHelpModal />
        </KeyboardProvider>
      </AppStateProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        {import.meta.env.DEV && (
          <TanStackRouterDevtools position="bottom-right" />
        )}
        <Scripts />
      </body>
    </html>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppState()
  const { isMobile, isTablet } = useMobileLayout()
  const showMenuButton = isMobile || isTablet

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-slate-900">
      {/* Minimal Header - 56px height per spec */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 dark:border-slate-700 dark:bg-slate-900">
        {/* Left: Menu button + Logo/Wordmark */}
        <div className="flex items-center gap-2">
          {showMenuButton && (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <Rss className="h-5 w-5 text-sky-500" />
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Reader
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <HelpButton />
          <RefreshButton />
        </div>
      </header>

      {/* Content Area - fills remaining viewport height */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
