import { createFileRoute } from '@tanstack/react-router'
import { ThreePanelLayout } from '~/components/layout/ThreePanelLayout'
import { FeedSidebar } from '~/components/FeedSidebar'

export const Route = createFileRoute('/folder/$folderId')({
  component: FolderPage,
})

function FolderPage() {
  const { folderId } = Route.useParams()

  return (
    <ThreePanelLayout
      left={<FeedSidebar activeFolderId={folderId} />}
      middle={<div className="p-4">Folder: {folderId}</div>}
      right={<div className="p-4">Reading Pane</div>}
    />
  )
}
