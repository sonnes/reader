import { useState, useCallback, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { EntryList } from "./EntryList";
import { ReadingPane } from "./ReadingPane";
import type { Folder, Entry, AppState } from "@/types";

// Re-export types for child components
export type { Feed, Folder, Entry } from "@/types";

interface LayoutProps {
  initialData?: AppState;
}

export function Layout({ initialData }: LayoutProps) {
  const [folders, setFolders] = useState<Folder[]>(initialData?.folders || []);
  const [entries, setEntries] = useState<Entry[]>(initialData?.entries || []);
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialData);

  // Fetch data from API if not provided via SSR
  useEffect(() => {
    if (initialData) return;

    const fetchData = async () => {
      try {
        const [foldersRes, entriesRes] = await Promise.all([
          fetch("/api/folders"),
          fetch("/api/entries"),
        ]);

        if (foldersRes.ok && entriesRes.ok) {
          const foldersData = await foldersRes.json();
          const entriesData = await entriesRes.json();
          setFolders(foldersData);
          setEntries(entriesData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [initialData]);

  // Filter entries based on selected feed
  const filteredEntries = selectedFeedId
    ? entries.filter((e) => e.feedId === selectedFeedId)
    : entries;

  const selectedEntry = entries.find((e) => e.id === selectedEntryId) || null;

  const handleToggleFolder = useCallback((folderId: string) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId ? { ...f, isExpanded: !f.isExpanded } : f
      )
    );

    // Update folder expansion state on the server
    const numericId = parseInt(folderId.replace("folder-", ""), 10);
    const folder = folders.find((f) => f.id === folderId);
    if (folder) {
      fetch(`/api/folders/${numericId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isExpanded: !folder.isExpanded }),
      }).catch(console.error);
    }
  }, [folders]);

  const handleSelectFeed = useCallback((feedId: string | null) => {
    setSelectedFeedId(feedId);
    setSelectedEntryId(null);
  }, []);

  const handleSelectEntry = useCallback((entryId: string) => {
    setSelectedEntryId(entryId);

    // Mark entry as read
    const entry = entries.find((e) => e.id === entryId);
    if (entry && !entry.isRead) {
      setEntries((prev) =>
        prev.map((e) => (e.id === entryId ? { ...e, isRead: true } : e))
      );

      // Update unread counts in folders
      setFolders((prev) =>
        prev.map((folder) => ({
          ...folder,
          feeds: folder.feeds.map((feed) =>
            feed.id === entry.feedId
              ? { ...feed, unreadCount: Math.max(0, feed.unreadCount - 1) }
              : feed
          ),
        }))
      );

      // Persist to server
      const numericId = parseInt(entryId.replace("entry-", ""), 10);
      fetch(`/api/entries/${numericId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      }).catch(console.error);
    }
  }, [entries]);

  const handleToggleStar = useCallback((entryId: string) => {
    const entry = entries.find((e) => e.id === entryId);
    if (entry) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId ? { ...e, isStarred: !e.isStarred } : e
        )
      );

      // Persist to server
      const numericId = parseInt(entryId.replace("entry-", ""), 10);
      fetch(`/api/entries/${numericId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isStarred: !entry.isStarred }),
      }).catch(console.error);
    }
  }, [entries]);

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

      const currentIndex = filteredEntries.findIndex(
        (entry) => entry.id === selectedEntryId
      );

      switch (e.key) {
        case "j":
        case "ArrowDown":
          e.preventDefault();
          if (currentIndex < filteredEntries.length - 1) {
            handleSelectEntry(filteredEntries[currentIndex + 1].id);
          } else if (currentIndex === -1 && filteredEntries.length > 0) {
            handleSelectEntry(filteredEntries[0].id);
          }
          break;
        case "k":
        case "ArrowUp":
          e.preventDefault();
          if (currentIndex > 0) {
            handleSelectEntry(filteredEntries[currentIndex - 1].id);
          }
          break;
        case "s":
          // Toggle star on current entry
          if (selectedEntryId) {
            handleToggleStar(selectedEntryId);
          }
          break;
        case "Escape":
          setSelectedEntryId(null);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredEntries, selectedEntryId, handleSelectEntry, handleToggleStar]);

  // Handle responsive collapse
  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <div className="text-center text-gray-400">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <Sidebar
        folders={folders}
        selectedFeedId={selectedFeedId}
        onToggleFolder={handleToggleFolder}
        onSelectFeed={handleSelectFeed}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Entry List */}
      <EntryList
        entries={filteredEntries}
        selectedEntryId={selectedEntryId}
        onSelectEntry={handleSelectEntry}
      />

      {/* Reading Pane */}
      <ReadingPane
        entry={selectedEntry}
        onToggleStar={handleToggleStar}
      />
    </div>
  );
}
