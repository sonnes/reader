import { createFileRoute } from '@tanstack/react-router'
import { ThreePanelLayout } from '~/components/layout/ThreePanelLayout'
import { FeedSidebar } from '~/components/FeedSidebar'
import { ArticleList } from '~/components/ArticleList'
import { ReadingPane } from '~/components/ReadingPane'

export const Route = createFileRoute('/folder/$folderId')({
  component: FolderPage,
})

function FolderPage() {
  const { folderId } = Route.useParams()

  return (
    <ThreePanelLayout
      left={<FeedSidebar activeFolderId={folderId} />}
      middle={<ArticleList filter={{ type: 'folder', folderId }} />}
      right={<ReadingPane />}
    />
  )
}
