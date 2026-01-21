import { createFileRoute } from '@tanstack/react-router'
import { ThreePanelLayout } from '~/components/layout/ThreePanelLayout'
import { FeedSidebar } from '~/components/FeedSidebar'

export const Route = createFileRoute('/feed/$feedId')({
  component: FeedPage,
})

function FeedPage() {
  const { feedId } = Route.useParams()

  return (
    <ThreePanelLayout
      left={<FeedSidebar activeFeedId={feedId} />}
      middle={<div className="p-4">Feed: {feedId}</div>}
      right={<div className="p-4">Reading Pane</div>}
    />
  )
}
