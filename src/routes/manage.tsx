import { createFileRoute } from '@tanstack/react-router'
import { FeedSidebar } from '~/components/FeedSidebar'

export const Route = createFileRoute('/manage')({
  component: ManagePage,
})

function ManagePage() {
  return (
    <div className="h-full flex">
      <div className="w-56 flex-shrink-0">
        <FeedSidebar view="manage" />
      </div>
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
          Manage Subscriptions
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Subscription management coming soon.
        </p>
      </div>
    </div>
  )
}
