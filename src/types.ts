// Shared types used by both client and server

export interface Feed {
  id: string;
  title: string;
  url?: string;
  siteUrl?: string | null;
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
  url?: string | null;
  publishedAt: string;
  content: string;
  isRead: boolean;
  isStarred: boolean;
}

export interface AppState {
  folders: Folder[];
  entries: Entry[];
}
