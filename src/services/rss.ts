import type { ParsedFeed, ParsedFeedEntry } from "../db/types";
import * as feedsRepo from "../db/repositories/feeds";
import * as entriesRepo from "../db/repositories/entries";

// ============================================================================
// RSS/Atom Feed Parser
// ============================================================================

/**
 * Fetch and parse an RSS or Atom feed from a URL
 */
export async function parseFeed(url: string): Promise<ParsedFeed> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Reader/1.0",
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  return parseXml(xml, url);
}

/**
 * Parse XML string into a ParsedFeed object
 */
function parseXml(xml: string, feedUrl: string): ParsedFeed {
  // Detect feed type and parse accordingly
  if (xml.includes("<feed") && xml.includes("xmlns=\"http://www.w3.org/2005/Atom\"")) {
    return parseAtom(xml, feedUrl);
  } else if (xml.includes("<rss") || xml.includes("<channel>")) {
    return parseRss(xml, feedUrl);
  } else {
    throw new Error("Unknown feed format");
  }
}

/**
 * Parse RSS 2.0 format
 */
function parseRss(xml: string, feedUrl: string): ParsedFeed {
  const title = extractTag(xml, "title", "channel") || "Untitled Feed";
  const link = extractTag(xml, "link", "channel");
  const siteUrl = link && !link.includes("<?xml") ? link : null;

  const entries: ParsedFeedEntry[] = [];
  const items = extractAllTags(xml, "item");

  for (const item of items) {
    const guid = extractTag(item, "guid") || extractTag(item, "link") || generateGuid(item);
    const entryTitle = extractTag(item, "title");
    const entryLink = extractTag(item, "link");
    const author = extractTag(item, "author") || extractTag(item, "dc:creator");
    const content = extractTag(item, "content:encoded") || extractTag(item, "description");
    const summary = extractTag(item, "description");
    const pubDate = extractTag(item, "pubDate");

    entries.push({
      guid,
      title: decodeHtmlEntities(entryTitle),
      url: entryLink,
      author: decodeHtmlEntities(author),
      content: content,
      summary: content !== summary ? summary : null,
      published_at: parseDate(pubDate),
    });
  }

  return {
    title: decodeHtmlEntities(title) || "Untitled Feed",
    url: feedUrl,
    site_url: siteUrl,
    favicon_url: siteUrl ? getFaviconUrl(siteUrl) : null,
    entries,
  };
}

/**
 * Parse Atom format
 */
function parseAtom(xml: string, feedUrl: string): ParsedFeed {
  const title = extractTag(xml, "title", "feed") || "Untitled Feed";

  // Find alternate link for site URL
  const linkMatch = xml.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["'][^>]*\/?>/);
  const linkMatch2 = xml.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']alternate["'][^>]*\/?>/);
  const siteUrl = linkMatch?.[1] || linkMatch2?.[1] || null;

  const entries: ParsedFeedEntry[] = [];
  const items = extractAllTags(xml, "entry");

  for (const item of items) {
    const id = extractTag(item, "id");
    const entryTitle = extractTag(item, "title");

    // Find entry link - prefer alternate
    const entryLinkMatch = item.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["'][^>]*\/?>/);
    const entryLinkMatch2 = item.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/);
    const entryLink = entryLinkMatch?.[1] || entryLinkMatch2?.[1] || null;

    // Author
    const authorName = extractTag(item, "name", "author");

    // Content
    const content = extractTag(item, "content") || extractTag(item, "summary");
    const summary = extractTag(item, "summary");

    // Date
    const published = extractTag(item, "published") || extractTag(item, "updated");

    entries.push({
      guid: id || entryLink || generateGuid(item),
      title: decodeHtmlEntities(entryTitle),
      url: entryLink,
      author: decodeHtmlEntities(authorName),
      content: content,
      summary: content !== summary ? summary : null,
      published_at: parseDate(published),
    });
  }

  return {
    title: decodeHtmlEntities(title) || "Untitled Feed",
    url: feedUrl,
    site_url: siteUrl,
    favicon_url: siteUrl ? getFaviconUrl(siteUrl) : null,
    entries,
  };
}

// ============================================================================
// Feed Refresh
// ============================================================================

/**
 * Refresh a feed and return count of new/updated entries
 */
export async function refreshFeed(feedId: number): Promise<{ new: number; updated: number }> {
  const feed = feedsRepo.getFeedById(feedId);
  if (!feed) {
    throw new Error(`Feed not found: ${feedId}`);
  }

  const parsed = await parseFeed(feed.url);
  let newCount = 0;
  let updatedCount = 0;

  for (const entry of parsed.entries) {
    const existing = entriesRepo.getEntryByGuid(feedId, entry.guid);

    if (!existing) {
      entriesRepo.createEntry({
        feed_id: feedId,
        guid: entry.guid,
        title: entry.title,
        url: entry.url,
        author: entry.author,
        content: entry.content,
        summary: entry.summary,
        published_at: entry.published_at,
      });
      newCount++;
    }
    // Note: We could update existing entries here if needed
  }

  // Update feed metadata if changed
  if (parsed.title !== feed.title || parsed.site_url !== feed.site_url) {
    feedsRepo.updateFeed(feedId, {
      title: parsed.title,
      site_url: parsed.site_url,
      favicon_url: parsed.favicon_url,
    });
  }

  return { new: newCount, updated: updatedCount };
}

// ============================================================================
// Feed Discovery
// ============================================================================

const COMMON_FEED_PATHS = [
  "/feed",
  "/feed/",
  "/rss",
  "/rss/",
  "/atom.xml",
  "/feed.xml",
  "/rss.xml",
  "/index.xml",
  "/feeds/posts/default",
  "/?feed=rss2",
];

/**
 * Discover RSS feed URL from a website URL
 */
export async function discoverFeedUrl(siteUrl: string): Promise<string | null> {
  // Normalize URL
  let baseUrl: URL;
  try {
    baseUrl = new URL(siteUrl);
    if (!baseUrl.protocol.startsWith("http")) {
      baseUrl = new URL(`https://${siteUrl}`);
    }
  } catch {
    return null;
  }

  // First, try to fetch the page and look for feed link tags
  try {
    const response = await fetch(baseUrl.href, {
      headers: {
        "User-Agent": "Reader/1.0",
        Accept: "text/html",
      },
    });

    if (response.ok) {
      const html = await response.text();
      const feedUrl = extractFeedLinkFromHtml(html, baseUrl.href);
      if (feedUrl) {
        return feedUrl;
      }
    }
  } catch {
    // Continue to try common paths
  }

  // Try common feed paths
  for (const path of COMMON_FEED_PATHS) {
    const feedUrl = new URL(path, baseUrl).href;
    try {
      const response = await fetch(feedUrl, {
        method: "HEAD",
        headers: { "User-Agent": "Reader/1.0" },
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (
          contentType.includes("xml") ||
          contentType.includes("rss") ||
          contentType.includes("atom")
        ) {
          return feedUrl;
        }
      }
    } catch {
      // Continue trying other paths
    }
  }

  return null;
}

/**
 * Extract feed URL from HTML link tags
 */
function extractFeedLinkFromHtml(html: string, baseUrl: string): string | null {
  // Look for RSS/Atom link tags
  const patterns = [
    /<link[^>]*type=["']application\/rss\+xml["'][^>]*href=["']([^"']+)["'][^>]*\/?>/gi,
    /<link[^>]*href=["']([^"']+)["'][^>]*type=["']application\/rss\+xml["'][^>]*\/?>/gi,
    /<link[^>]*type=["']application\/atom\+xml["'][^>]*href=["']([^"']+)["'][^>]*\/?>/gi,
    /<link[^>]*href=["']([^"']+)["'][^>]*type=["']application\/atom\+xml["'][^>]*\/?>/gi,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(html);
    if (match) {
      const href = match[1];
      // Handle relative URLs
      try {
        return new URL(href, baseUrl).href;
      } catch {
        return href;
      }
    }
  }

  return null;
}

// ============================================================================
// XML Parsing Helpers
// ============================================================================

/**
 * Extract content from an XML tag
 */
function extractTag(xml: string, tagName: string, parentTag?: string): string | null {
  let searchXml = xml;

  // If parentTag specified, first extract the parent content
  if (parentTag) {
    const parentMatch = searchXml.match(new RegExp(`<${parentTag}[^>]*>([\\s\\S]*?)</${parentTag}>`, "i"));
    if (parentMatch) {
      searchXml = parentMatch[1];
    }
  }

  // Handle CDATA
  const cdataPattern = new RegExp(
    `<${tagName}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tagName}>`,
    "i"
  );
  const cdataMatch = searchXml.match(cdataPattern);
  if (cdataMatch) {
    return cdataMatch[1].trim();
  }

  // Handle regular content
  const pattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, "i");
  const match = searchXml.match(pattern);
  if (match) {
    return match[1].trim();
  }

  return null;
}

/**
 * Extract all instances of a tag
 */
function extractAllTags(xml: string, tagName: string): string[] {
  const pattern = new RegExp(`<${tagName}[^>]*>[\\s\\S]*?</${tagName}>`, "gi");
  return xml.match(pattern) || [];
}

/**
 * Parse various date formats to ISO string
 */
function parseDate(dateStr: string | null): string | null {
  if (!dateStr) return null;

  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch {
    // Fall through to return null
  }

  return null;
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(str: string | null): string | null {
  if (!str) return null;

  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
    .replace(/&#x([a-fA-F0-9]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * Generate a GUID from content if none provided
 */
function generateGuid(content: string): string {
  // Simple hash-like function for generating unique IDs
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `generated-${Math.abs(hash).toString(36)}`;
}

/**
 * Get favicon URL from site URL
 */
function getFaviconUrl(siteUrl: string): string {
  try {
    const url = new URL(siteUrl);
    return `${url.origin}/favicon.ico`;
  } catch {
    return `${siteUrl}/favicon.ico`;
  }
}
