import { createRouter, Link } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

function NotFound() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
      <h1 className="text-6xl font-bold text-slate-300 dark:text-slate-700">
        404
      </h1>
      <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
        Page not found
      </p>
      <Link
        to="/"
        className="mt-6 px-4 py-2 text-sm font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600 transition-colors"
      >
        Go home
      </Link>
    </div>
  )
}

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: NotFound,
  })

  return router
}
