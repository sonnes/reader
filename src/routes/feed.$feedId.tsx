import { createFileRoute } from '@tanstack/react-router'
import { ThreePanelLayout } from '~/components/layout/ThreePanelLayout'
import { FeedSidebar } from '~/components/FeedSidebar'
import { ArticleList } from '~/components/ArticleList'
import { ReadingPane } from '~/components/ReadingPane'

export const Route = createFileRoute('/feed/$feedId')({
  component: FeedPage,
})

function FeedPage() {
  const { feedId } = Route.useParams()

  return (
    <ThreePanelLayout
      left={<FeedSidebar activeFeedId={feedId} />}
      middle={<ArticleList filter={{ type: 'feed', feedId }} />}
      right={<ReadingPane />}
    />
  )
}
