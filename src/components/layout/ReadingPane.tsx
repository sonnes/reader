import { Star, Share2, ExternalLink } from "lucide-react";
import type { Entry } from "./Layout";

interface ReadingPaneProps {
  entry: Entry | null;
  onToggleStar?: (entryId: string) => void;
}

export function ReadingPane({ entry, onToggleStar }: ReadingPaneProps) {
  if (!entry) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-lg mb-2">No item selected</p>
          <p className="text-sm">
            Select an item from the list or press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">j</kbd>/<kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">k</kbd> to navigate
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">
              {entry.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="text-[#4285f4] hover:underline cursor-pointer">
                {entry.feedTitle}
              </span>
              <span>·</span>
              <span>{entry.author}</span>
              <span>·</span>
              <span>{entry.publishedAt}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onToggleStar?.(entry.id)}
              className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                entry.isStarred ? "text-yellow-500" : "text-gray-400"
              }`}
              aria-label={entry.isStarred ? "Unstar" : "Star"}
            >
              <Star
                className={`w-5 h-5 ${entry.isStarred ? "fill-yellow-500" : ""}`}
              />
            </button>
            <button
              className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-400"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-400"
              aria-label="Open original"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <article
          className="max-w-3xl mx-auto px-6 py-6 prose prose-gray prose-sm
            prose-headings:font-semibold prose-headings:text-gray-900
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-a:text-[#4285f4] prose-a:no-underline hover:prose-a:underline
            prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-gray-100 prose-pre:text-gray-800"
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
      </div>
    </div>
  );
}
