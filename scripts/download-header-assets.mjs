// Download the shared-shell images listed in reference/data/header-asset-plan.json (built by
// scripts/build-header-data.mjs) into public/assets/source/header/ under their source file names.
// Run: node scripts/download-header-assets.mjs   (read-only GETs of public CDN images)
// Writes reference/data/header-assets.json (source URL, local path, sha256, bytes, dimensions) for docs/asset-manifest.md.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const plan = JSON.parse(readFileSync(`${ROOT}reference/data/header-asset-plan.json`, "utf8"));
mkdirSync(`${ROOT}public/assets/source/header`, { recursive: true });

function dimensions(buf) {
  if (buf.slice(1, 4).toString() === "PNG") return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  if (buf.slice(0, 3).toString() === "GIF") return [buf.readUInt16LE(6), buf.readUInt16LE(8)];
  if (buf.slice(0, 4).toString() === "RIFF" && buf.slice(8, 12).toString() === "WEBP") {
    const kind = buf.slice(12, 16).toString();
    if (kind === "VP8X") return [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)];
    if (kind === "VP8 ") return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
    if (kind === "VP8L") { const b = buf.readUInt32LE(21); return [1 + (b & 0x3fff), 1 + ((b >> 14) & 0x3fff)]; }
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    for (let i = 2; i < buf.length;) {
      const marker = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xc3) return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
      i += 2 + len;
    }
  }
  return null;
}

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
