import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { UseReaderReturn } from "@/hooks/useReader";
import { useEffect } from "react";

interface ReadingPaneProps {
  reader: UseReaderReturn;
  className?: string;
}

export function ReadingPane({ reader, className }: ReadingPaneProps) {
  const {
    selectedEntry,
    filteredEntries,
    selectNextEntry,
    selectPreviousEntry,
    toggleStar,
    toggleRead,
    markAsRead,
  } = reader;

  // Mark as read when entry is selected
  useEffect(() => {
    if (selectedEntry && !selectedEntry.is_read) {
      markAsRead(selectedEntry.id);
    }
  }, [selectedEntry?.id, selectedEntry?.is_read, markAsRead]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const currentIndex = selectedEntry
    ? filteredEntries.findIndex((e) => e.id === selectedEntry.id)
    : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < filteredEntries.length - 1;

  if (!selectedEntry) {
    return (
      <div className={cn("flex h-full flex-col items-center justify-center bg-gray-50", className)}>
        <EmptyIcon className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-gray-400">Select an entry to read</p>
        <p className="text-xs text-gray-300 mt-2">
          Use <kbd className="px-1 py-0.5 bg-gray-200 rounded text-gray-500">j</kbd> and{" "}
          <kbd className="px-1 py-0.5 bg-gray-200 rounded text-gray-500">k</kbd> to navigate
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full flex-col bg-white", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <div className="flex items-center gap-1">
          <TooltipProvider delayDuration={300}>
            {/* Previous/Next */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={selectPreviousEntry}
                  disabled={!hasPrevious}
                >
                  <ChevronUpIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Previous (k)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={selectNextEntry}
                  disabled={!hasNext}
                >
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Next (j)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-1">
          <TooltipProvider delayDuration={300}>
            {/* Star */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => toggleStar(selectedEntry.id)}
                  className={selectedEntry.is_starred ? "text-yellow-400" : "text-gray-400"}
                >
                  {selectedEntry.is_starred ? (
                    <StarFilledIcon className="h-4 w-4" />
                  ) : (
                    <StarIcon className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {selectedEntry.is_starred ? "Unstar (s)" : "Star (s)"}
              </TooltipContent>
            </Tooltip>

            {/* Mark read/unread */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => toggleRead(selectedEntry.id)}
                  className="text-gray-400"
                >
                  {selectedEntry.is_read ? (
                    <EnvelopeOpenIcon className="h-4 w-4" />
                  ) : (
                    <EnvelopeIcon className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {selectedEntry.is_read ? "Mark unread (m)" : "Mark read (m)"}
              </TooltipContent>
            </Tooltip>

            {/* Open original */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => selectedEntry.url && window.open(selectedEntry.url, "_blank")}
                  disabled={!selectedEntry.url}
                  className="text-gray-400"
                >
                  <ExternalLinkIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open original</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <article className="p-6 max-w-3xl mx-auto">
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            {selectedEntry.url ? (
              <a
                href={selectedEntry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#4285f4] transition-colors"
              >
                {selectedEntry.title || "Untitled"}
              </a>
            ) : (
              selectedEntry.title || "Untitled"
            )}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
            <span className="font-medium text-gray-700">{selectedEntry.feed_title}</span>
            {selectedEntry.author && (
              <>
                <span>-</span>
                <span>{selectedEntry.author}</span>
              </>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {formatDate(selectedEntry.published_at)}
          </div>

          {/* Content */}
          <div
            className="mt-6 prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-[#4285f4] prose-img:rounded-lg"
            dangerouslySetInnerHTML={{
              __html: selectedEntry.content || selectedEntry.summary || "<p>No content available.</p>",
            }}
          />
        </article>
      </ScrollArea>
    </div>
  );
}

// Icons
function EmptyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
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

function StarFilledIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function EnvelopeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function EnvelopeOpenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}
