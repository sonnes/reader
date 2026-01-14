import { ChevronDown, ChevronRight, Rss, Folder, Home, Menu } from "lucide-react";
import type { Folder as FolderType } from "./Layout";

interface SidebarProps {
  folders: FolderType[];
  selectedFeedId: string | null;
  onToggleFolder: (folderId: string) => void;
  onSelectFeed: (feedId: string | null) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  folders,
  selectedFeedId,
  onToggleFolder,
  onSelectFeed,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const totalUnread = folders.reduce(
    (acc, folder) =>
      acc + folder.feeds.reduce((feedAcc, feed) => feedAcc + feed.unreadCount, 0),
    0
  );

  if (isCollapsed) {
    return (
      <div className="flex-shrink-0 w-12 border-r border-gray-200 bg-gray-50 flex flex-col items-center py-2">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          aria-label="Expand sidebar"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-64 border-r border-gray-200 bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <h1 className="text-lg font-semibold text-gray-800">Reader</h1>
        <button
          onClick={onToggleCollapse}
          className="p-1 hover:bg-gray-100 rounded transition-colors md:hidden"
          aria-label="Collapse sidebar"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* All Items */}
        <button
          onClick={() => onSelectFeed(null)}
          className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 transition-colors ${
            selectedFeedId === null ? "bg-blue-50 text-[#4285f4]" : "text-gray-700"
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="flex-1 font-medium">All items</span>
          {totalUnread > 0 && (
            <span className="text-xs font-semibold text-gray-500">
              {totalUnread}
            </span>
          )}
        </button>

        {/* Folders */}
        <div className="mt-2">
          {folders.map((folder) => (
            <div key={folder.id}>
              {/* Folder Header */}
              <button
                onClick={() => onToggleFolder(folder.id)}
                className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 transition-colors text-gray-700"
              >
                {folder.isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
                <Folder className="w-4 h-4 text-gray-500" />
                <span className="flex-1 text-sm font-medium">{folder.name}</span>
                <span className="text-xs text-gray-400">
                  {folder.feeds.reduce((acc, f) => acc + f.unreadCount, 0)}
                </span>
              </button>

              {/* Feeds in Folder */}
              {folder.isExpanded && (
                <div className="ml-6">
                  {folder.feeds.map((feed) => (
                    <button
                      key={feed.id}
                      onClick={() => onSelectFeed(feed.id)}
                      className={`w-full flex items-center gap-2 px-4 py-1.5 text-left hover:bg-gray-100 transition-colors ${
                        selectedFeedId === feed.id
                          ? "bg-blue-50 text-[#4285f4]"
                          : "text-gray-600"
                      }`}
                    >
                      <Rss className="w-3.5 h-3.5 text-gray-400" />
                      <span className="flex-1 text-sm truncate">{feed.title}</span>
                      {feed.unreadCount > 0 && (
                        <span
                          className={`text-xs ${
                            selectedFeedId === feed.id
                              ? "text-[#4285f4]"
                              : "text-gray-500 font-semibold"
                          }`}
                        >
                          {feed.unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-400">
        <span>j/k to navigate, Enter to read</span>
      </div>
    </div>
  );
}
