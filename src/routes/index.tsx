import { createFileRoute } from '@tanstack/react-router'
import { ThreePanelLayout } from '~/components/layout/ThreePanelLayout'
import { FeedSidebar } from '~/components/FeedSidebar'
import { ArticleList } from '~/components/ArticleList'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <ThreePanelLayout
      left={<FeedSidebar view="home" />}
      middle={<ArticleList filter={{ type: 'unread' }} />}
      right={<div className="p-4">Reading Pane</div>}
    />
  )
}
