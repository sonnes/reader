interface ThreePanelLayoutProps {
  left?: React.ReactNode
  middle?: React.ReactNode
  right?: React.ReactNode
}

export function ThreePanelLayout({
  left,
  middle,
  right,
}: ThreePanelLayoutProps) {
  return (
    <div className="h-full flex">
      <div className="w-56 flex-shrink-0">{left}</div>
      <div className="w-80 flex-shrink-0">{middle}</div>
      <div className="flex-1 min-w-0">{right}</div>
    </div>
  )
}
