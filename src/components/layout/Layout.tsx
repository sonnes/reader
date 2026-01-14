import { useState, useCallback, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { EntryList } from "./EntryList";
import { ReadingPane } from "./ReadingPane";

export interface Feed {
  id: string;
  title: string;
  unreadCount: number;
}

export interface Folder {
  id: string;
  name: string;
  feeds: Feed[];
  isExpanded: boolean;
}

export interface Entry {
  id: string;
  feedId: string;
  feedTitle: string;
  title: string;
  author: string;
  publishedAt: string;
  content: string;
  isRead: boolean;
  isStarred: boolean;
}

// Placeholder data
const placeholderFolders: Folder[] = [
  {
    id: "folder-1",
    name: "News",
    isExpanded: true,
    feeds: [
      { id: "feed-1", title: "The Verge", unreadCount: 12 },
      { id: "feed-2", title: "Ars Technica", unreadCount: 8 },
      { id: "feed-3", title: "Hacker News", unreadCount: 25 },
    ],
  },
  {
    id: "folder-2",
    name: "Tech Blogs",
    isExpanded: true,
    feeds: [
      { id: "feed-4", title: "CSS-Tricks", unreadCount: 3 },
      { id: "feed-5", title: "Smashing Magazine", unreadCount: 5 },
    ],
  },
  {
    id: "folder-3",
    name: "Personal",
    isExpanded: false,
    feeds: [
      { id: "feed-6", title: "Wait But Why", unreadCount: 1 },
      { id: "feed-7", title: "Brain Pickings", unreadCount: 0 },
    ],
  },
];

const placeholderEntries: Entry[] = [
  {
    id: "entry-1",
    feedId: "feed-1",
    feedTitle: "The Verge",
    title: "Apple announces new MacBook Pro with M4 chip",
    author: "Nilay Patel",
    publishedAt: "2 hours ago",
    content: `<p>Apple has announced its latest MacBook Pro lineup featuring the new M4 chip, promising significant performance improvements over the previous generation.</p>
    <p>The new M4 chip brings a 10-core CPU and up to a 16-core GPU, delivering up to 50% faster performance compared to the M3. Apple claims the new machines can handle demanding workflows like 8K video editing and complex 3D rendering with ease.</p>
    <p>"This is the most powerful MacBook Pro we've ever made," said Apple's senior vice president of Hardware Engineering. "The M4 chip represents a major leap forward in both performance and efficiency."</p>
    <p>The new MacBook Pro starts at $1,999 for the 14-inch model and $2,499 for the 16-inch model. Both are available for pre-order today and will ship next week.</p>`,
    isRead: false,
    isStarred: false,
  },
  {
    id: "entry-2",
    feedId: "feed-2",
    feedTitle: "Ars Technica",
    title: "Scientists discover high-temperature superconductor breakthrough",
    author: "John Timmer",
    publishedAt: "4 hours ago",
    content: `<p>Researchers at a major university have announced a breakthrough in high-temperature superconductivity that could revolutionize energy transmission and storage.</p>
    <p>The new material, a complex oxide compound, exhibits superconducting properties at temperatures up to 250 Kelvin (-23°C), significantly higher than previous records. While still below room temperature, this represents a major step toward practical superconducting applications.</p>
    <p>The implications for power grids, magnetic levitation, and quantum computing are substantial.</p>`,
    isRead: false,
    isStarred: true,
  },
  {
    id: "entry-3",
    feedId: "feed-3",
    feedTitle: "Hacker News",
    title: "Show HN: I built a privacy-focused analytics platform",
    author: "techfounder",
    publishedAt: "6 hours ago",
    content: `<p>I've been working on this for the past year and finally ready to share it with the community.</p>
    <p>The platform provides comprehensive web analytics without using cookies or tracking personal data. All data is aggregated and anonymized by default.</p>
    <p>Key features include real-time dashboards, conversion tracking, and A/B testing - all while maintaining strict privacy standards.</p>
    <p>Would love to hear your feedback!</p>`,
    isRead: true,
    isStarred: false,
  },
  {
    id: "entry-4",
    feedId: "feed-4",
    feedTitle: "CSS-Tricks",
    title: "A Complete Guide to CSS Container Queries",
    author: "Chris Coyier",
    publishedAt: "1 day ago",
    content: `<p>Container queries are finally here, and they're changing how we think about responsive design.</p>
    <p>Unlike media queries which respond to the viewport, container queries let you style elements based on their container's size. This makes truly reusable, context-aware components possible.</p>
    <pre><code>@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}</code></pre>
    <p>Browser support is now excellent across all major browsers.</p>`,
    isRead: true,
    isStarred: false,
  },
  {
    id: "entry-5",
    feedId: "feed-1",
    feedTitle: "The Verge",
    title: "Google announces major Android update with AI features",
    author: "David Pierce",
    publishedAt: "1 day ago",
    content: `<p>Google's latest Android update brings a suite of AI-powered features designed to make everyday tasks easier.</p>
    <p>The update includes smart reply suggestions, automatic photo organization, and real-time translation in messaging apps.</p>`,
    isRead: false,
    isStarred: false,
  },
  {
    id: "entry-6",
    feedId: "feed-5",
    feedTitle: "Smashing Magazine",
    title: "Modern CSS Architecture: A Practical Guide",
    author: "Vitaly Friedman",
    publishedAt: "2 days ago",
    content: `<p>How do you structure CSS in large-scale projects? Here's a practical guide to modern CSS architecture patterns.</p>
    <p>We'll explore utility-first approaches, component-based styling, and the role of CSS custom properties in creating maintainable stylesheets.</p>`,
    isRead: true,
    isStarred: true,
  },
];

export function Layout() {
  const [folders, setFolders] = useState<Folder[]>(placeholderFolders);
  const [entries] = useState<Entry[]>(placeholderEntries);
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
  }, []);

  const handleSelectFeed = useCallback((feedId: string | null) => {
    setSelectedFeedId(feedId);
    setSelectedEntryId(null);
  }, []);

  const handleSelectEntry = useCallback((entryId: string) => {
    setSelectedEntryId(entryId);
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

      const currentIndex = filteredEntries.findIndex(
        (entry) => entry.id === selectedEntryId
      );

      switch (e.key) {
        case "j":
        case "ArrowDown":
          e.preventDefault();
          if (currentIndex < filteredEntries.length - 1) {
            setSelectedEntryId(filteredEntries[currentIndex + 1].id);
          } else if (currentIndex === -1 && filteredEntries.length > 0) {
            setSelectedEntryId(filteredEntries[0].id);
          }
          break;
        case "k":
        case "ArrowUp":
          e.preventDefault();
          if (currentIndex > 0) {
            setSelectedEntryId(filteredEntries[currentIndex - 1].id);
          }
          break;
        case "o":
        case "Enter":
          // Already selecting entry shows it in reading pane
          break;
        case "Escape":
          setSelectedEntryId(null);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredEntries, selectedEntryId]);

  // Handle responsive collapse
  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      <ReadingPane entry={selectedEntry} />
    </div>
  );
}
