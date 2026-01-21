import { createFileRoute } from '@tanstack/react-router'
import { ThreePanelLayout } from '~/components/layout/ThreePanelLayout'
import { FeedSidebar } from '~/components/FeedSidebar'
import { ArticleList } from '~/components/ArticleList'
import { ReadingPane } from '~/components/ReadingPane'

export const Route = createFileRoute('/starred')({
  component: StarredPage,
})

function StarredPage() {
  return (
    <ThreePanelLayout
      left={<FeedSidebar view="starred" />}
      middle={<ArticleList filter={{ type: 'starred' }} />}
      right={<ReadingPane />}
    />
  )
}
