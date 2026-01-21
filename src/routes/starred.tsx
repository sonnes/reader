import { createFileRoute } from '@tanstack/react-router'
import { ThreePanelLayout } from '~/components/layout/ThreePanelLayout'
import { FeedSidebar } from '~/components/FeedSidebar'

export const Route = createFileRoute('/starred')({
  component: StarredPage,
})

function StarredPage() {
  return (
    <ThreePanelLayout
      left={<FeedSidebar view="starred" />}
      middle={<div className="p-4">Starred Articles</div>}
      right={<div className="p-4">Reading Pane</div>}
    />
  )
}
