import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/read')({
  component: ReadPage,
})

function ReadPage() {
  return (
    <div className="flex h-full items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Reading Experience
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          3-pane layout for reading articles
        </p>
      </div>
    </div>
  )
}
