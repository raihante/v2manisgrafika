// Download the shared-shell images listed in reference/data/header-asset-plan.json (built by
// scripts/build-header-data.mjs) into public/assets/source/header/ under their source file names.
// Run: node scripts/download-header-assets.mjs   (read-only GETs of public CDN images)
// Writes reference/data/header-assets.json (source URL, local path, sha256, bytes, dimensions) for docs/asset-manifest.md.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dimensions } from "./lib/image-info.mjs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const plan = JSON.parse(readFileSync(`${ROOT}reference/data/header-asset-plan.json`, "utf8"));
mkdirSync(`${ROOT}public/assets/source/header`, { recursive: true });

const out = [];
for (const [local, url] of Object.entries(plan)) {
  // Mega-menu promotions are requested by the source at &width=2500; mirror that request.
  const requestUrl = /\.webp$/i.test(local) && url.includes("/cdn/shop/files/") ? `${url}?width=2500` : url;
  const file = `${ROOT}public${local}`;
  let buf;
  if (existsSync(file)) buf = readFileSync(file);
  else {
    const res = await fetch(requestUrl, { headers: { "user-agent": "Mozilla/5.0 (clone asset fetch)" } });
    if (!res.ok) throw new Error(`${res.status} ${requestUrl}`);
    buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(file, buf);
  }
  const [width, height] = dimensions(buf) || [null, null];
  out.push({ local, source: requestUrl, sha256: createHash("sha256").update(buf).digest("hex"), bytes: buf.length, width, height });
}
writeFileSync(`${ROOT}reference/data/header-assets.json`, JSON.stringify(out, null, 1));
console.log(out.map((a) => `${a.local.split("/").pop()} ${a.width}x${a.height} ${a.bytes}`).join("\n"));
