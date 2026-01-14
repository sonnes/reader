import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UseReaderReturn } from "@/hooks/useReader";

interface SidebarProps {
  reader: UseReaderReturn;
  className?: string;
}

export function Sidebar({ reader, className }: SidebarProps) {
  const {
    folders,
    uncategorizedFeeds,
    selectedFilter,
    selectedFeedId,
    selectedFolderId,
    totalUnreadCount,
    selectFilter,
    toggleFolderExpanded,
  } = reader;

  return (
    <div className={cn("flex h-full flex-col bg-white border-r border-gray-200", className)}>
      {/* Add Subscription Button */}
      <div className="p-2 border-b border-gray-200">
        <Button variant="outline" className="w-full justify-start gap-2 text-[#4285f4]">
          <PlusIcon className="h-4 w-4" />
          Subscribe
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="py-2">
          {/* All Items */}
          <button
            onClick={() => selectFilter("all")}
            className={cn(
              "w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-100 transition-colors",
              selectedFilter === "all" && !selectedFeedId && !selectedFolderId
                ? "bg-blue-50 text-[#4285f4] font-medium"
                : "text-gray-700"
            )}
          >
            <span className="flex items-center gap-2">
              <InboxIcon className="h-4 w-4" />
              All items
            </span>
            {totalUnreadCount > 0 && (
              <Badge variant="secondary" className="bg-gray-200 text-gray-700 text-xs">
                {totalUnreadCount}
              </Badge>
            )}
          </button>

          {/* Starred */}
          <button
            onClick={() => selectFilter("starred")}
            className={cn(
              "w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 transition-colors",
              selectedFilter === "starred"
                ? "bg-blue-50 text-[#4285f4] font-medium"
                : "text-gray-700"
            )}
          >
            <StarIcon className="h-4 w-4" />
            Starred
          </button>

          {/* Folders */}
          {folders.map((folder) => (
            <div key={folder.id}>
              {/* Folder Header */}
              <div
                className={cn(
                  "flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer transition-colors",
                  selectedFilter === "folder" && selectedFolderId === folder.id
                    ? "bg-blue-50 text-[#4285f4] font-medium"
                    : "text-gray-700"
                )}
              >
                <button
                  onClick={() => toggleFolderExpanded(folder.id)}
                  className="flex items-center gap-2"
                >
                  <ChevronIcon
                    className={cn(
                      "h-3 w-3 transition-transform",
                      folder.isExpanded && "rotate-90"
                    )}
                  />
                  <FolderIcon className="h-4 w-4" />
                  <span>{folder.name}</span>
                </button>
                <div className="flex items-center gap-1">
                  {folder.feeds.reduce((sum, f) => sum + f.unread_count, 0) > 0 && (
                    <Badge variant="secondary" className="bg-gray-200 text-gray-700 text-xs">
                      {folder.feeds.reduce((sum, f) => sum + f.unread_count, 0)}
                    </Badge>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="opacity-0 group-hover:opacity-100 hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreIcon className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Rename folder</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Delete folder</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Folder Feeds */}
              {folder.isExpanded && (
                <div className="ml-4">
                  {folder.feeds.map((feed) => (
                    <button
                      key={feed.id}
                      onClick={() => selectFilter("feed", feed.id)}
                      className={cn(
                        "w-full flex items-center justify-between pl-6 pr-4 py-1.5 text-sm hover:bg-gray-100 transition-colors",
                        selectedFilter === "feed" && selectedFeedId === feed.id
                          ? "bg-blue-50 text-[#4285f4] font-medium"
                          : "text-gray-600"
                      )}
                    >
                      <span className="flex items-center gap-2 truncate">
                        {feed.favicon_url ? (
                          <img
                            src={feed.favicon_url}
                            alt=""
                            className="h-4 w-4 rounded"
                          />
                        ) : (
                          <RssIcon className="h-4 w-4 text-orange-500" />
                        )}
                        <span className="truncate">{feed.title}</span>
                      </span>
                      {feed.unread_count > 0 && (
                        <Badge variant="secondary" className="bg-gray-200 text-gray-700 text-xs ml-2">
                          {feed.unread_count}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Uncategorized Feeds */}
          {uncategorizedFeeds.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              {uncategorizedFeeds.map((feed) => (
                <button
                  key={feed.id}
                  onClick={() => selectFilter("feed", feed.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-1.5 text-sm hover:bg-gray-100 transition-colors",
                    selectedFilter === "feed" && selectedFeedId === feed.id
                      ? "bg-blue-50 text-[#4285f4] font-medium"
                      : "text-gray-600"
                  )}
                >
                  <span className="flex items-center gap-2 truncate">
                    {feed.favicon_url ? (
                      <img
                        src={feed.favicon_url}
                        alt=""
                        className="h-4 w-4 rounded"
                      />
                    ) : (
                      <RssIcon className="h-4 w-4 text-orange-500" />
                    )}
                    <span className="truncate">{feed.title}</span>
                  </span>
                  {feed.unread_count > 0 && (
                    <Badge variant="secondary" className="bg-gray-200 text-gray-700 text-xs ml-2">
                      {feed.unread_count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Add Folder Button */}
      <div className="p-2 border-t border-gray-200">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-gray-500">
          <PlusIcon className="h-4 w-4" />
          New folder
        </Button>
      </div>
    </div>
  );
}

// Simple icon components
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function InboxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function RssIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
    </svg>
  );
}

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  );
}
