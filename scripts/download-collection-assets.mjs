// Download the non-product images of a collection page listed in reference/data/collection-asset-plan-<handle>.json
// (built by scripts/build-collection-data.mjs: promotion banners, colour-filter swatches, facet CSS icons; or by
// scripts/build-collection-list-data.mjs for handle "_index": /collections card banners) under their source file names.
// Product card images stay dummyimage.com placeholders.
// Run: node scripts/download-collection-assets.mjs <handle>   (read-only GETs of public CDN images)
// Writes reference/data/collection-assets-<handle>.json (source URL, local path, sha256, bytes, dimensions) for
// docs/asset-manifest.md.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dimensions } from "./lib/image-info.mjs";

const handle = process.argv[2];
if (!handle) throw new Error("usage: node scripts/download-collection-assets.mjs <handle>");
const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const plan = JSON.parse(readFileSync(`${ROOT}reference/data/collection-asset-plan-${handle}.json`, "utf8"));
for (const local of Object.keys(plan)) mkdirSync(`${ROOT}public${local.slice(0, local.lastIndexOf("/"))}`, { recursive: true });

// Request widths as the source page requests them (promotion banner img src / mobile <source> carry &width=).
const page1 = readFileSync(`${ROOT}reference/data/collections/${handle}/page-1.html`, "utf8");
const requested = (url) => {
  const name = url.split("/").pop();
  const m = page1.match(new RegExp(`//beyondthevines\\.co\\.id/cdn/shop/files/${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\?v=\\d+(?:&amp;width=(\\d+))?`));
  return m?.[1] ? `${url}?width=${m[1]}` : url;
};

const out = [];
for (const [local, url] of Object.entries(plan)) {
  const requestUrl = requested(url);
  const file = `${ROOT}public${local}`;
  let buf;
  if (existsSync(file)) buf = readFileSync(file);
  else {
    const res = await fetch(requestUrl, { headers: { "user-agent": "Mozilla/5.0 (clone asset fetch)" } });
    // A 404 on the source (e.g. the Ivory filter swatch) is recorded as missing; the data builder then renders that
    // swatch without an image instead of requesting a file that does not exist.
    if (res.status === 404) { out.push({ local, source: requestUrl, missing: true }); continue; }
    if (!res.ok) throw new Error(`${res.status} ${requestUrl}`);
    buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(file, buf);
  }
  const [width, height] = dimensions(buf) || [null, null];
  out.push({ local, source: requestUrl, sha256: createHash("sha256").update(buf).digest("hex"), bytes: buf.length, width, height });
}
writeFileSync(`${ROOT}reference/data/collection-assets-${handle}.json`, JSON.stringify(out, null, 1));
console.log(out.map((a) => `${a.local.split("/").pop()} ${a.missing ? "MISSING (source 404)" : `${a.width}x${a.height} ${a.bytes}`}`).join("\n"));
