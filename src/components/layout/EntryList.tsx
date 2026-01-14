import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UseReaderReturn, ReaderEntry } from "@/hooks/useReader";

interface EntryListProps {
  reader: UseReaderReturn;
  className?: string;
}

export function EntryList({ reader, className }: EntryListProps) {
  const {
    filteredEntries,
    selectedEntryId,
    selectedEntryIds,
    viewMode,
    selectEntry,
    markAllAsRead,
    setViewMode,
    markAsRead,
  } = reader;

  const handleEntryClick = (entry: ReaderEntry, e: React.MouseEvent) => {
    if (e.shiftKey) {
      selectEntry(entry.id, true);
    } else {
      selectEntry(entry.id);
    }
  };

  const handleEntryDoubleClick = (entry: ReaderEntry) => {
    if (entry.url) {
      window.open(entry.url, "_blank");
    }
    if (!entry.is_read) {
      markAsRead(entry.id);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const stripHtml = (html: string | null): string => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").slice(0, 200);
  };

  return (
    <div className={cn("flex h-full flex-col bg-white border-r border-gray-200", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-gray-600 hover:text-[#4285f4]"
          >
            <CheckAllIcon className="h-4 w-4 mr-1" />
            Mark all as read
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-600">
                <ViewIcon className="h-4 w-4 mr-1" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setViewMode("compact")}>
                <span className={viewMode === "compact" ? "font-medium" : ""}>
                  Compact
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode("expanded")}>
                <span className={viewMode === "expanded" ? "font-medium" : ""}>
                  Expanded
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Entry List */}
      <ScrollArea className="flex-1">
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <InboxIcon className="h-12 w-12 mb-2" />
            <p>No entries to display</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={(e) => handleEntryClick(entry, e)}
                onDoubleClick={() => handleEntryDoubleClick(entry)}
                className={cn(
                  "px-4 py-3 cursor-pointer transition-colors",
                  selectedEntryId === entry.id
                    ? "bg-blue-50"
                    : selectedEntryIds.has(entry.id)
                    ? "bg-blue-25"
                    : "hover:bg-gray-50",
                  !entry.is_read && "bg-white"
                )}
              >
                {viewMode === "compact" ? (
                  <CompactEntry entry={entry} formatDate={formatDate} />
                ) : (
                  <ExpandedEntry
                    entry={entry}
                    formatDate={formatDate}
                    stripHtml={stripHtml}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

interface EntryRowProps {
  entry: ReaderEntry;
  formatDate: (date: string | null) => string;
}

function CompactEntry({ entry, formatDate }: EntryRowProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Star indicator */}
      <div className="flex-shrink-0 w-4">
        {entry.is_starred && (
          <StarFilledIcon className="h-4 w-4 text-yellow-400" />
        )}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h3
          className={cn(
            "text-sm truncate",
            entry.is_read ? "text-gray-500 font-normal" : "text-gray-900 font-semibold"
          )}
        >
          {entry.title || "Untitled"}
        </h3>
      </div>

      {/* Feed name */}
      <span className="flex-shrink-0 text-xs text-gray-400 truncate max-w-[100px]">
        {entry.feed_title}
      </span>

      {/* Date */}
      <span className="flex-shrink-0 text-xs text-gray-400 w-16 text-right">
        {formatDate(entry.published_at)}
      </span>
    </div>
  );
}

interface ExpandedEntryRowProps extends EntryRowProps {
  stripHtml: (html: string | null) => string;
}

function ExpandedEntry({ entry, formatDate, stripHtml }: ExpandedEntryRowProps) {
  return (
    <div>
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Star indicator */}
        <div className="flex-shrink-0 w-4 pt-0.5">
          {entry.is_starred && (
            <StarFilledIcon className="h-4 w-4 text-yellow-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3
            className={cn(
              "text-sm leading-tight",
              entry.is_read ? "text-gray-500 font-normal" : "text-gray-900 font-semibold"
            )}
          >
            {entry.title || "Untitled"}
          </h3>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <span className="truncate">{entry.feed_title}</span>
            {entry.author && (
              <>
                <span>-</span>
                <span className="truncate">{entry.author}</span>
              </>
            )}
            <span>-</span>
            <span className="flex-shrink-0">{formatDate(entry.published_at)}</span>
          </div>

          {/* Snippet */}
          <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">
            {stripHtml(entry.summary || entry.content)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Icons
function CheckAllIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ViewIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
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

function StarFilledIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}
