import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = "C:/Digitakarya/v2manisgrafika";
const source = JSON.parse(await readFile(path.join(ROOT, "reference/data/homepage-urls.json"), "utf8"));

const groups = [
  { name: "css", urls: source.resources.css, directory: "reference/css" },
  { name: "js", urls: source.resources.js, directory: "reference/js" },
  { name: "fonts", urls: source.resources.fonts, directory: "public/fonts" },
  { name: "assets", urls: source.assets, directory: "public/assets/source" },
];

const extensionFor = (url, contentType) => {
  const pathname = new URL(url).pathname;
  const extension = path.extname(pathname).toLowerCase();
  if (extension && extension.length <= 8) return extension;
  const types = {
    "text/css": ".css",
    "text/javascript": ".js",
    "application/javascript": ".js",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/svg+xml": ".svg",
    "video/mp4": ".mp4",
    "font/woff2": ".woff2",
    "font/woff": ".woff",
  };
  return types[String(contentType || "").split(";")[0]] || ".bin";
};

const manifest = [];
for (const group of groups) {
  const urls = Array.from(new Set(group.urls.filter((url) => /^https?:\/\//.test(url))));
  await mkdir(path.join(ROOT, group.directory), { recursive: true });

  let cursor = 0;
  const workers = Array.from({ length: 8 }, async () => {
    while (cursor < urls.length) {
      const url = urls[cursor++];
      try {
        const response = await fetch(url, {
          headers: {
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/156.0.0.0 Safari/537.36",
          },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const contentType = response.headers.get("content-type") || "";
        const extension = extensionFor(url, contentType);
        const hash = createHash("sha1").update(url).digest("hex").slice(0, 16);
        const filename = `${hash}${extension}`;
        const relativePath = `${group.directory}/${filename}`.replaceAll("\\", "/");
        const bytes = Buffer.from(await response.arrayBuffer());
        await writeFile(path.join(ROOT, relativePath), bytes);
        manifest.push({ group: group.name, url, path: relativePath, contentType, bytes: bytes.length, status: "ok" });
      } catch (error) {
        manifest.push({ group: group.name, url, status: "failed", error: String(error.message || error) });
      }
    }
  });
  await Promise.all(workers);
}

manifest.sort((a, b) => a.group.localeCompare(b.group) || a.url.localeCompare(b.url));
await writeFile(path.join(ROOT, "reference/data/download-manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

const summary = Object.groupBy(manifest, (item) => `${item.group}:${item.status}`);
console.log(
  Object.fromEntries(Object.entries(summary).map(([key, entries]) => [key, entries.length])),
);
