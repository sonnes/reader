import { readFileSync, existsSync } from "fs";
import { join, extname } from "path";

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

const server = Bun.serve({
  port: PORT,
  fetch(request) {
    const url = new URL(request.url);
    let pathname = url.pathname;

    // Try to serve the requested file
    let filePath = join(distPath, pathname);
    let response = serveFile(filePath);
    if (response) return response;

    // For SPA routing, serve index.html for non-file requests
    const indexPath = join(distPath, "index.html");
    response = serveFile(indexPath);
    if (response) return response;

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
