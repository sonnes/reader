import { Star } from "lucide-react";
import type { Entry } from "./Layout";

interface EntryListProps {
  entries: Entry[];
  selectedEntryId: string | null;
  onSelectEntry: (entryId: string) => void;
}

export function EntryList({
  entries,
  selectedEntryId,
  onSelectEntry,
}: EntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="flex-shrink-0 w-80 border-r border-gray-200 bg-white flex items-center justify-center">
        <p className="text-gray-400 text-sm">No items to display</p>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-80 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {entries.length} {entries.length === 1 ? "item" : "items"}
          </span>
          <span className="text-xs text-gray-400">
            {entries.filter((e) => !e.isRead).length} unread
          </span>
        </div>
      </div>

      {/* Entry List */}
      <div className="flex-1 overflow-y-auto">
        {entries.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onSelectEntry(entry.id)}
            className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-blue-50 ${
              selectedEntryId === entry.id ? "bg-blue-50" : ""
            }`}
          >
            {/* Feed title */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-400 truncate flex-1">
                {entry.feedTitle}
              </span>
              {entry.isStarred && (
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
              )}
            </div>

            {/* Entry title */}
            <h3
              className={`text-sm leading-snug mb-1 line-clamp-2 ${
                entry.isRead
                  ? "font-normal text-gray-500"
                  : "font-semibold text-gray-900"
              }`}
            >
              {entry.title}
            </h3>

            {/* Meta info */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="truncate">{entry.author}</span>
              <span>·</span>
              <span className="flex-shrink-0">{entry.publishedAt}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
