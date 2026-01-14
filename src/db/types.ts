// Type definitions for the Google Reader clone database entities

// ============================================================================
// Database Entities
// ============================================================================

export interface Feed {
  id: number;
  title: string;
  url: string;
  site_url: string | null;
  favicon_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewFeed {
  title: string;
  url: string;
  site_url?: string | null;
  favicon_url?: string | null;
}

export interface Entry {
  id: number;
  feed_id: number;
  guid: string;
  title: string | null;
  url: string | null;
  author: string | null;
  content: string | null;
  summary: string | null;
  published_at: string | null;
  created_at: string;
}

export interface NewEntry {
  feed_id: number;
  guid: string;
  title?: string | null;
  url?: string | null;
  author?: string | null;
  content?: string | null;
  summary?: string | null;
  published_at?: string | null;
}

export interface Folder {
  id: number;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface Subscription {
  id: number;
  feed_id: number;
  folder_id: number | null;
  title_override: string | null;
  created_at: string;
}

export interface SubscriptionWithFeed extends Subscription {
  feed: Feed;
  unread_count?: number;
}

export interface ReadStatus {
  entry_id: number;
  read_at: string;
}

export interface Starred {
  entry_id: number;
  starred_at: string;
}

// ============================================================================
// Entry with read/starred status
// ============================================================================

export interface EntryWithStatus extends Entry {
  is_read: boolean;
  is_starred: boolean;
}

// ============================================================================
// RSS Parser Types
// ============================================================================

export interface ParsedFeedEntry {
  guid: string;
  title: string | null;
  url: string | null;
  author: string | null;
  content: string | null;
  summary: string | null;
  published_at: string | null;
}

export interface ParsedFeed {
  title: string;
  url: string;
  site_url: string | null;
  favicon_url: string | null;
  entries: ParsedFeedEntry[];
}

// ============================================================================
// Query Options
// ============================================================================

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface GetEntriesOptions extends PaginationOptions {
  feedId?: number;
  folderId?: number;
}
