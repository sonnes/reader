import { $ } from "bun";
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

// Collect all files from the dist directory
function collectDistFiles(dir: string, basePath: string = ""): Record<string, string> {
  const files: Record<string, string> = {};
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const relativePath = basePath ? `${basePath}/${entry}` : entry;
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      Object.assign(files, collectDistFiles(fullPath, relativePath));
    } else {
      files[relativePath] = readFileSync(fullPath, "base64");
    }
  }

  return files;
}

async function build() {
  console.log("Collecting dist files...");
  const distFiles = collectDistFiles("./dist");

  // Create a bundled server that includes the dist files
  const serverCode = `
import { extname } from "path";

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

const DIST_FILES: Record<string, string> = ${JSON.stringify(distFiles, null, 2)};

function getContentType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

function decodeFile(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

const server = Bun.serve({
  port: PORT,
  fetch(request) {
    const url = new URL(request.url);
    let pathname = url.pathname === "/" ? "index.html" : url.pathname.slice(1);

    // Try to serve the requested file
    if (DIST_FILES[pathname]) {
      return new Response(decodeFile(DIST_FILES[pathname]), {
        headers: { "Content-Type": getContentType(pathname) },
      });
    }

    // For SPA routing, serve index.html
    if (DIST_FILES["index.html"]) {
      return new Response(decodeFile(DIST_FILES["index.html"]), {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log("Server running at http://localhost:" + server.port);
`;

  console.log("Writing bundled server...");
  writeFileSync("./bundled-server.ts", serverCode);

  console.log("Compiling to executable...");
  await $`bun build --compile --minify ./bundled-server.ts --outfile ./reader`;

  // Clean up
  await $`rm ./bundled-server.ts`;

  console.log("Done! Executable created: ./reader");
}

build();
