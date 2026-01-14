import { readFileSync, existsSync } from "fs";
import { join, extname } from "path";
import { getDAL, closeDatabase } from "./src/db";
import type { Folder, Entry } from "./src/types";

const PORT = parseInt(process.env.PORT || "3000", 10);

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
};

const distPath = join(import.meta.dir, "dist");

function getContentType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

function serveFile(filePath: string): Response | null {
  if (!existsSync(filePath)) {
    return null;
  }

  const content = readFileSync(filePath);
  return new Response(content, {
    headers: {
      "Content-Type": getContentType(filePath),
    },
  });
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

// Parse numeric ID from string like "folder-1" or just "1"
function parseId(idStr: string): number {
  const match = idStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : NaN;
}

// API Route Handlers
async function handleApiRequest(request: Request, url: URL): Promise<Response> {
  const dal = getDAL();
  const method = request.method;
  const path = url.pathname;

  // GET /api/folders - Get all folders with feeds
  if (method === "GET" && path === "/api/folders") {
    const folders = dal.getAllFoldersWithFeeds();
    return jsonResponse(folders);
  }

  // PATCH /api/folders/:id - Update folder
  if (method === "PATCH" && path.startsWith("/api/folders/")) {
    const id = parseId(path.split("/").pop() || "");
    if (isNaN(id)) return errorResponse("Invalid folder ID", 400);

    const body = await request.json() as { name?: string; isExpanded?: boolean };
    dal.updateFolder(id, body);
    return jsonResponse({ success: true });
  }

  // DELETE /api/folders/:id - Delete folder
  if (method === "DELETE" && path.startsWith("/api/folders/")) {
    const id = parseId(path.split("/").pop() || "");
    if (isNaN(id)) return errorResponse("Invalid folder ID", 400);

    dal.deleteFolder(id);
    return jsonResponse({ success: true });
  }

  // POST /api/folders - Create folder
  if (method === "POST" && path === "/api/folders") {
    const body = await request.json() as { name: string };
    if (!body.name) return errorResponse("Name is required", 400);

    const folder = dal.createFolder(body.name);
    return jsonResponse(folder, 201);
  }

  // GET /api/entries - Get all entries (with optional filters)
  if (method === "GET" && path === "/api/entries") {
    const feedIdParam = url.searchParams.get("feedId");
    const starred = url.searchParams.get("starred");
    const unread = url.searchParams.get("unread");

    const options: { feedId?: number; starred?: boolean; unread?: boolean } = {};
    if (feedIdParam) options.feedId = parseId(feedIdParam);
    if (starred !== null) options.starred = starred === "true";
    if (unread !== null) options.unread = unread === "true";

    const entries = dal.getAllEntries(options);
    return jsonResponse(entries);
  }

  // GET /api/entries/:id - Get single entry
  if (method === "GET" && path.match(/^\/api\/entries\/\d+$/)) {
    const id = parseId(path.split("/").pop() || "");
    if (isNaN(id)) return errorResponse("Invalid entry ID", 400);

    const entry = dal.getEntryById(id);
    if (!entry) return errorResponse("Entry not found", 404);

    return jsonResponse(entry);
  }

  // PATCH /api/entries/:id - Update entry (mark as read/starred)
  if (method === "PATCH" && path.match(/^\/api\/entries\/\d+$/)) {
    const id = parseId(path.split("/").pop() || "");
    if (isNaN(id)) return errorResponse("Invalid entry ID", 400);

    const body = await request.json() as { isRead?: boolean; isStarred?: boolean };
    dal.updateEntry(id, body);
    return jsonResponse({ success: true });
  }

  // POST /api/entries/mark-all-read - Mark all entries as read
  if (method === "POST" && path === "/api/entries/mark-all-read") {
    const body = await request.json() as { feedId?: string };
    const feedId = body.feedId ? parseId(body.feedId) : undefined;
    dal.markAllAsRead(feedId);
    return jsonResponse({ success: true });
  }

  // GET /api/stats - Get statistics
  if (method === "GET" && path === "/api/stats") {
    const stats = dal.getStats();
    return jsonResponse(stats);
  }

  // POST /api/feeds - Create feed
  if (method === "POST" && path === "/api/feeds") {
    const body = await request.json() as { folderId: string; title: string; url: string; siteUrl?: string };
    if (!body.folderId || !body.title || !body.url) {
      return errorResponse("folderId, title, and url are required", 400);
    }

    const folderId = parseId(body.folderId);
    const feed = dal.createFeed(folderId, body.title, body.url, body.siteUrl);
    return jsonResponse(feed, 201);
  }

  // DELETE /api/feeds/:id - Delete feed
  if (method === "DELETE" && path.startsWith("/api/feeds/")) {
    const id = parseId(path.split("/").pop() || "");
    if (isNaN(id)) return errorResponse("Invalid feed ID", 400);

    dal.deleteFeed(id);
    return jsonResponse({ success: true });
  }

  return errorResponse("Not found", 404);
}

// Generate SSR HTML with initial data
function generateSSRHtml(folders: Folder[], entries: Entry[]): string {
  const initialData = { folders, entries };

  // Read the built index.html
  const indexPath = join(distPath, "index.html");
  if (!existsSync(indexPath)) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reader</title>
</head>
<body>
  <div id="root"></div>
  <script>
    window.__INITIAL_DATA__ = ${JSON.stringify(initialData)};
  </script>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;
  }

  let html = readFileSync(indexPath, "utf-8");

  // Inject initial data script before the closing </head> or before the main script
  const initialDataScript = `<script>window.__INITIAL_DATA__ = ${JSON.stringify(initialData)};</script>`;

  // Try to insert before </head>
  if (html.includes("</head>")) {
    html = html.replace("</head>", `${initialDataScript}</head>`);
  } else {
    // Insert before closing body
    html = html.replace("</body>", `${initialDataScript}</body>`);
  }

  return html;
}

const server = Bun.serve({
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle API routes
    if (pathname.startsWith("/api/")) {
      try {
        return await handleApiRequest(request, url);
      } catch (error) {
        console.error("API error:", error);
        return errorResponse("Internal server error", 500);
      }
    }

    // Try to serve static files from dist
    if (pathname !== "/" && pathname !== "/index.html") {
      const filePath = join(distPath, pathname);
      const response = serveFile(filePath);
      if (response) return response;
    }

    // For the root path or SPA routes, serve SSR HTML
    try {
      const dal = getDAL();
      const folders = dal.getAllFoldersWithFeeds();
      const entries = dal.getAllEntries();
      const html = generateSSRHtml(folders, entries);

      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    } catch (error) {
      console.error("SSR error:", error);

      // Fallback to static index.html
      const indexPath = join(distPath, "index.html");
      const response = serveFile(indexPath);
      if (response) return response;

      return new Response("Internal Server Error", { status: 500 });
    }
  },
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  closeDatabase();
  process.exit(0);
});

process.on("SIGTERM", () => {
  closeDatabase();
  process.exit(0);
});

console.log(`Server running at http://localhost:${server.port}`);
