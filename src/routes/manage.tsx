import { createFileRoute } from '@tanstack/react-router'
import { FeedSidebar } from '~/components/FeedSidebar'
import { FeedManagement } from '~/components/feeds'

export const Route = createFileRoute('/manage')({
  component: ManagePage,
})

function ManagePage() {
  return (
    <div className="h-full flex">
      <div className="w-56 flex-shrink-0">
        <FeedSidebar view="manage" />
      </div>
      <div className="flex-1 overflow-hidden">
        <FeedManagement />
      </div>
    </div>
  )
}
