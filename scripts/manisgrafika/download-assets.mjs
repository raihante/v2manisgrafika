// Download every Manis Grafika image the rebrand uses (logos, product and variation photos, homepage and Tentang Kami
// images) from the manisgrafika.id captures in reference/manisgrafika/<date>/ into public/assets/manisgrafika/ under
// their source file names. Read-only GETs of public wp-content/uploads files.
// Run: node scripts/manisgrafika/download-assets.mjs [date]   (default 2026-11-16)
// Writes reference/manisgrafika/<date>/assets.json (source URL, local path, sha256, bytes, dimensions) for
// docs/asset-manifest.md and for the fixture builder (source URL -> local path).
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dimensions } from "../lib/image-info.mjs";

const ROOT = new URL("../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const DATE = process.argv[2] || "2026-11-16";
const SRC = `${ROOT}reference/manisgrafika/${DATE}`;
const OUT_DIR = `${ROOT}public/assets/manisgrafika`;
const read = (name) => JSON.parse(readFileSync(`${SRC}/${name}`, "utf8"));

const urls = new Set();
for (const p of read("store-products-p1.json")) p.images.forEach((i) => urls.add(i.src));
for (const v of read("store-variations.json")) v.images.forEach((i) => urls.add(i.src));
read("home-faq-2.json").images.forEach((i) => urls.add(i.src));
read("home-content.json").images.forEach((i) => urls.add(i.src));
read("tentang-kami.json").images.forEach((i) => urls.add(i.src));

const wanted = [...urls].filter((u) => u.includes("/wp-content/uploads/"));
mkdirSync(OUT_DIR, { recursive: true });

const byName = new Map();
const out = [];
for (const url of wanted.sort()) {
  const name = decodeURIComponent(url.split("/").pop());
  // Normalize a name collision (same file name in different upload months) with the year-month prefix.
  const local = byName.has(name) && byName.get(name) !== url
    ? `/assets/manisgrafika/${url.match(/uploads\/(\d{4})\/(\d{2})\//).slice(1).join("-")}-${name}`
    : `/assets/manisgrafika/${name}`;
  byName.set(name, url);
  const file = `${ROOT}public${local}`;
  let buf;
  if (existsSync(file)) buf = readFileSync(file);
  else {
    const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (asset fetch)" } });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(file, buf);
  }
  const [width, height] = dimensions(buf) || [null, null];
  out.push({ local, source: url, sha256: createHash("sha256").update(buf).digest("hex"), bytes: buf.length, width, height });
}

// Identical files under different names: report them so the manifest can deduplicate.
const seen = new Map();
const duplicates = out.filter((a) => (seen.has(a.sha256) ? true : (seen.set(a.sha256, a.local), false))).map((a) => `${a.local} == ${seen.get(a.sha256)}`);
writeFileSync(`${SRC}/assets.json`, JSON.stringify(out, null, 1));
const mb = (out.reduce((s, a) => s + a.bytes, 0) / 1e6).toFixed(1);
console.log(`${out.length} files, ${mb} MB${duplicates.length ? `\nduplicates:\n${duplicates.join("\n")}` : ""}`);
