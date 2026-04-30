#!/usr/bin/env node
/**
 * Prerender static HTML for SEO.
 *
 * After `vite build`, this script spins up a tiny static server in front of
 * the build/ directory, loads the SPA in headless Chromium, waits for React
 * (incl. lazy-loaded sections) to render, and overwrites build/index.html
 * with the rendered DOM. Crawlers then see real HTML instead of an empty
 * <div id="root">.
 */
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { resolve, join, extname } from "node:path";
import puppeteer from "puppeteer";

const BUILD_DIR = resolve("build");
const PORT = 4173;
const ROUTES = ["/"];

const MIME = {
   ".html": "text/html; charset=utf-8",
   ".js": "application/javascript",
   ".mjs": "application/javascript",
   ".css": "text/css",
   ".json": "application/json",
   ".png": "image/png",
   ".jpg": "image/jpeg",
   ".jpeg": "image/jpeg",
   ".svg": "image/svg+xml",
   ".ico": "image/x-icon",
   ".pdf": "application/pdf",
   ".xml": "application/xml",
   ".txt": "text/plain",
   ".woff": "font/woff",
   ".woff2": "font/woff2",
   ".webp": "image/webp",
};

function serveStatic(req, res) {
   (async () => {
      try {
         let path = decodeURIComponent(req.url.split("?")[0]);
         if (path === "/" || !extname(path)) path = join(path, "index.html");
         const file = await readFile(join(BUILD_DIR, path));
         res.writeHead(200, {
            "Content-Type": MIME[extname(path)] || "application/octet-stream",
         });
         res.end(file);
      } catch {
         res.writeHead(404).end("Not found");
      }
   })();
}

async function prerenderRoute(browser, route) {
   const page = await browser.newPage();
   await page.setViewport({ width: 1280, height: 720 });

   // Block all external requests (analytics, CDNs) — we only need our own
   // bundle to render. This avoids hangs in CI where outbound traffic may
   // be slow or restricted.
   await page.setRequestInterception(true);
   page.on("request", (req) => {
      const url = req.url();
      if (url.startsWith(`http://localhost:${PORT}`) || url.startsWith("data:")) {
         req.continue();
      } else {
         req.abort();
      }
   });

   await page.goto(`http://localhost:${PORT}${route}`, {
      waitUntil: "load",
      timeout: 60000,
   });

   // Wait until React has mounted something into #root.
   await page.waitForFunction(
      () => document.getElementById("root")?.children.length > 0,
      { timeout: 15000 },
   );

   // Grace period for lazy-loaded chunks and async effects to settle.
   await new Promise((r) => setTimeout(r, 2000));

   const html = await page.content();
   await page.close();
   return html;
}

async function main() {
   console.log("[prerender] starting…");
   const server = createServer(serveStatic);
   await new Promise((r) => server.listen(PORT, r));

   const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
   });

   try {
      for (const route of ROUTES) {
         const html = await prerenderRoute(browser, route);
         const out =
            route === "/"
               ? "index.html"
               : join(route.replace(/^\/|\/$/g, ""), "index.html");
         await writeFile(join(BUILD_DIR, out), html);
         const kb = (html.length / 1024).toFixed(1);
         console.log(`[prerender]   ${route} -> build/${out} (${kb} KB)`);
      }
   } finally {
      await browser.close();
      server.close();
   }
   console.log("[prerender] done.");
}

main().catch((err) => {
   console.error("[prerender] failed:", err);
   process.exit(1);
});
