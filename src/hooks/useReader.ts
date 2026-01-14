import { useState, useCallback, useEffect } from "react";

// Types for the reader state
export interface ReaderEntry {
  id: number;
  feed_id: number;
  title: string;
  url: string | null;
  author: string | null;
  content: string | null;
  summary: string | null;
  published_at: string | null;
  is_read: boolean;
  is_starred: boolean;
  feed_title: string;
  feed_favicon: string | null;
}

export interface ReaderFeed {
  id: number;
  title: string;
  url: string;
  favicon_url: string | null;
  unread_count: number;
  folder_id: number | null;
}

export interface ReaderFolder {
  id: number;
  name: string;
  feeds: ReaderFeed[];
  isExpanded: boolean;
}

export type ViewMode = "compact" | "expanded";
export type FilterType = "all" | "starred" | "feed" | "folder";

interface ReaderState {
  // Navigation
  selectedFilter: FilterType;
  selectedFeedId: number | null;
  selectedFolderId: number | null;
  selectedEntryId: number | null;
  selectedEntryIds: Set<number>; // For multi-select

  // View options
  viewMode: ViewMode;
  sidebarCollapsed: boolean;

  // Data
  folders: ReaderFolder[];
  uncategorizedFeeds: ReaderFeed[];
  entries: ReaderEntry[];

  // UI state
  showKeyboardHelp: boolean;
}

// Placeholder data for initial development
const PLACEHOLDER_ENTRIES: ReaderEntry[] = [
  {
    id: 1,
    feed_id: 1,
    title: "Understanding React Server Components",
    url: "https://example.com/rsc",
    author: "Dan Abramov",
    content:
      "<p>React Server Components represent a new paradigm in React development. They allow you to render components on the server, reducing the JavaScript bundle size sent to the client.</p><p>This has significant implications for performance and user experience, especially on slower devices and networks.</p>",
    summary: "An introduction to React Server Components and their benefits.",
    published_at: "2024-01-15T10:00:00Z",
    is_read: false,
    is_starred: true,
    feed_title: "React Blog",
    feed_favicon: null,
  },
  {
    id: 2,
    feed_id: 1,
    title: "What's New in React 19",
    url: "https://example.com/react19",
    author: "React Team",
    content:
      "<p>React 19 brings several exciting features including improved performance, better developer experience, and new hooks.</p>",
    summary: "Overview of new features in React 19.",
    published_at: "2024-01-14T15:30:00Z",
    is_read: true,
    is_starred: false,
    feed_title: "React Blog",
    feed_favicon: null,
  },
  {
    id: 3,
    feed_id: 2,
    title: "TypeScript 5.4 Released",
    url: "https://example.com/ts54",
    author: "TypeScript Team",
    content:
      "<p>TypeScript 5.4 includes new features for type narrowing, improved inference, and better error messages.</p>",
    summary: "TypeScript 5.4 release announcement.",
    published_at: "2024-01-13T09:00:00Z",
    is_read: false,
    is_starred: false,
    feed_title: "TypeScript Blog",
    feed_favicon: null,
  },
  {
    id: 4,
    feed_id: 3,
    title: "The State of CSS in 2024",
    url: "https://example.com/css2024",
    author: "CSS Working Group",
    content:
      "<p>CSS continues to evolve with new features like container queries, cascade layers, and improved color functions.</p>",
    summary: "A look at modern CSS features.",
    published_at: "2024-01-12T14:00:00Z",
    is_read: false,
    is_starred: true,
    feed_title: "CSS Tricks",
    feed_favicon: null,
  },
  {
    id: 5,
    feed_id: 4,
    title: "Bun 1.1: Even Faster",
    url: "https://example.com/bun11",
    author: "Jarred Sumner",
    content:
      "<p>Bun 1.1 brings significant performance improvements and new features for JavaScript developers.</p>",
    summary: "Bun 1.1 release notes.",
    published_at: "2024-01-11T11:00:00Z",
    is_read: true,
    is_starred: false,
    feed_title: "Bun Blog",
    feed_favicon: null,
  },
];

const PLACEHOLDER_FEEDS: ReaderFeed[] = [
  { id: 1, title: "React Blog", url: "https://react.dev/feed", favicon_url: null, unread_count: 1, folder_id: 1 },
  { id: 2, title: "TypeScript Blog", url: "https://typescript.dev/feed", favicon_url: null, unread_count: 1, folder_id: 1 },
  { id: 3, title: "CSS Tricks", url: "https://css-tricks.com/feed", favicon_url: null, unread_count: 1, folder_id: 2 },
  { id: 4, title: "Bun Blog", url: "https://bun.sh/feed", favicon_url: null, unread_count: 0, folder_id: null },
];

const PLACEHOLDER_FOLDERS: ReaderFolder[] = [
  {
    id: 1,
    name: "Development",
    feeds: PLACEHOLDER_FEEDS.filter((f) => f.folder_id === 1),
    isExpanded: true,
  },
  {
    id: 2,
    name: "Design",
    feeds: PLACEHOLDER_FEEDS.filter((f) => f.folder_id === 2),
    isExpanded: true,
  },
];

export function useReader() {
  const [state, setState] = useState<ReaderState>({
    selectedFilter: "all",
    selectedFeedId: null,
    selectedFolderId: null,
    selectedEntryId: null,
    selectedEntryIds: new Set(),
    viewMode: "expanded",
    sidebarCollapsed: false,
    folders: PLACEHOLDER_FOLDERS,
    uncategorizedFeeds: PLACEHOLDER_FEEDS.filter((f) => f.folder_id === null),
    entries: PLACEHOLDER_ENTRIES,
    showKeyboardHelp: false,
  });

  // Computed values
  const selectedEntry = state.entries.find((e) => e.id === state.selectedEntryId) ?? null;

  const filteredEntries = state.entries.filter((entry) => {
    if (state.selectedFilter === "starred") return entry.is_starred;
    if (state.selectedFilter === "feed" && state.selectedFeedId)
      return entry.feed_id === state.selectedFeedId;
    if (state.selectedFilter === "folder" && state.selectedFolderId) {
      const folder = state.folders.find((f) => f.id === state.selectedFolderId);
      if (folder) {
        const feedIds = folder.feeds.map((f) => f.id);
        return feedIds.includes(entry.feed_id);
      }
    }
    return true;
  });

  const totalUnreadCount = state.entries.filter((e) => !e.is_read).length;

  // Actions
  const selectEntry = useCallback((entryId: number, addToSelection = false) => {
    setState((prev) => {
      const newSelectedIds = new Set(addToSelection ? prev.selectedEntryIds : []);
      if (addToSelection && newSelectedIds.has(entryId)) {
        newSelectedIds.delete(entryId);
      } else {
        newSelectedIds.add(entryId);
      }
      return {
        ...prev,
        selectedEntryId: entryId,
        selectedEntryIds: newSelectedIds,
      };
    });
  }, []);

  const selectFilter = useCallback(
    (filter: FilterType, feedId?: number, folderId?: number) => {
      setState((prev) => ({
        ...prev,
        selectedFilter: filter,
        selectedFeedId: feedId ?? null,
        selectedFolderId: folderId ?? null,
        selectedEntryId: null,
        selectedEntryIds: new Set(),
      }));
    },
    []
  );

  const toggleFolderExpanded = useCallback((folderId: number) => {
    setState((prev) => ({
      ...prev,
      folders: prev.folders.map((f) =>
        f.id === folderId ? { ...f, isExpanded: !f.isExpanded } : f
      ),
    }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setState((prev) => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setState((prev) => ({ ...prev, viewMode: mode }));
  }, []);

  const markAsRead = useCallback((entryId: number) => {
    setState((prev) => ({
      ...prev,
      entries: prev.entries.map((e) =>
        e.id === entryId ? { ...e, is_read: true } : e
      ),
    }));
  }, []);

  const markAsUnread = useCallback((entryId: number) => {
    setState((prev) => ({
      ...prev,
      entries: prev.entries.map((e) =>
        e.id === entryId ? { ...e, is_read: false } : e
      ),
    }));
  }, []);

  const toggleRead = useCallback((entryId: number) => {
    setState((prev) => ({
      ...prev,
      entries: prev.entries.map((e) =>
        e.id === entryId ? { ...e, is_read: !e.is_read } : e
      ),
    }));
  }, []);

  const toggleStar = useCallback((entryId: number) => {
    setState((prev) => ({
      ...prev,
      entries: prev.entries.map((e) =>
        e.id === entryId ? { ...e, is_starred: !e.is_starred } : e
      ),
    }));
  }, []);

  const markAllAsRead = useCallback(() => {
    setState((prev) => {
      const entriesToMark =
        prev.selectedFilter === "all"
          ? prev.entries
          : prev.selectedFilter === "feed" && prev.selectedFeedId
          ? prev.entries.filter((e) => e.feed_id === prev.selectedFeedId)
          : prev.selectedFilter === "folder" && prev.selectedFolderId
          ? prev.entries.filter((e) => {
              const folder = prev.folders.find(
                (f) => f.id === prev.selectedFolderId
              );
              return folder?.feeds.some((f) => f.id === e.feed_id);
            })
          : [];

      const entryIds = new Set(entriesToMark.map((e) => e.id));
      return {
        ...prev,
        entries: prev.entries.map((e) =>
          entryIds.has(e.id) ? { ...e, is_read: true } : e
        ),
      };
    });
  }, []);

  const selectNextEntry = useCallback(() => {
    setState((prev) => {
      const currentIdx = filteredEntries.findIndex(
        (e) => e.id === prev.selectedEntryId
      );
      const nextIdx = currentIdx < filteredEntries.length - 1 ? currentIdx + 1 : currentIdx;
      const nextEntry = filteredEntries[nextIdx];
      return nextEntry
        ? { ...prev, selectedEntryId: nextEntry.id, selectedEntryIds: new Set([nextEntry.id]) }
        : prev;
    });
  }, [filteredEntries]);

  const selectPreviousEntry = useCallback(() => {
    setState((prev) => {
      const currentIdx = filteredEntries.findIndex(
        (e) => e.id === prev.selectedEntryId
      );
      const prevIdx = currentIdx > 0 ? currentIdx - 1 : 0;
      const prevEntry = filteredEntries[prevIdx];
      return prevEntry
        ? { ...prev, selectedEntryId: prevEntry.id, selectedEntryIds: new Set([prevEntry.id]) }
        : prev;
    });
  }, [filteredEntries]);

  const toggleKeyboardHelp = useCallback(() => {
    setState((prev) => ({ ...prev, showKeyboardHelp: !prev.showKeyboardHelp }));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case "j":
        case "n":
          e.preventDefault();
          selectNextEntry();
          break;
        case "k":
        case "p":
          e.preventDefault();
          selectPreviousEntry();
          break;
        case "o":
        case "Enter":
          // Open entry (already selected, so just mark as read)
          if (selectedEntry && !selectedEntry.is_read) {
            markAsRead(selectedEntry.id);
          }
          break;
        case "s":
          e.preventDefault();
          if (selectedEntry) {
            toggleStar(selectedEntry.id);
          }
          break;
        case "m":
          e.preventDefault();
          if (selectedEntry) {
            toggleRead(selectedEntry.id);
          }
          break;
        case "A":
          if (e.shiftKey) {
            e.preventDefault();
            markAllAsRead();
          }
          break;
        case "?":
          e.preventDefault();
          toggleKeyboardHelp();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedEntry,
    selectNextEntry,
    selectPreviousEntry,
    markAsRead,
    toggleStar,
    toggleRead,
    markAllAsRead,
    toggleKeyboardHelp,
  ]);

  return {
    // State
    ...state,
    selectedEntry,
    filteredEntries,
    totalUnreadCount,

    // Actions
    selectEntry,
    selectFilter,
    toggleFolderExpanded,
    toggleSidebar,
    setViewMode,
    markAsRead,
    markAsUnread,
    toggleRead,
    toggleStar,
    markAllAsRead,
    selectNextEntry,
    selectPreviousEntry,
    toggleKeyboardHelp,
  };
}

export type UseReaderReturn = ReturnType<typeof useReader>;
