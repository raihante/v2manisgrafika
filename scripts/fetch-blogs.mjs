// Fetch the source blog indexes into private reference data (read-only GETs only, run with plain `node`).
// Usage: node scripts/fetch-blogs.mjs
// Writes reference/data/blogs/:
//   <blog>/page-<n>.html   server HTML of every page of each of the 7 blog indexes (card metadata only is used)
//   article-<slug>.html    server HTML of the one reference article (owner decision 2026-11-06: one article template,
//                          only the reference article keeps its real body)
// Media-stories article bodies are third-party press text and are never fetched or stored.
// Snapshot conditions: Indonesia storefront (IDR), logged out, no cookies. Never posts anything to the source.
import { mkdirSync, writeFileSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const OUT = `${ROOT}reference/data/blogs`;
const BASE = "https://beyondthevines.co.id";
const HEADERS = { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "accept-language": "id-ID,id;q=0.9,en;q=0.8" };
export const BLOGS = ["btv-city-guide", "collaborations", "events", "media-stories", "news", "promotions", "travelling-btv-express"];
export const REFERENCE_ARTICLE = ["promotions", "a-little-love-for-your-carryall"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { headers: HEADERS });
    if (res.ok) return res.text();
    if (attempt >= 4 || res.status === 404) throw new Error(`${res.status} ${url}`);
    await sleep(3000 * attempt);
  }
}
// Highest ?page=N linked from the pagination of an index page.
const lastPageOf = (html, blog) =>
  Math.max(1, ...[...html.matchAll(new RegExp(`/blogs/${blog}\\?page=(\\d+)`, "g"))].map((m) => Number(m[1])));

for (const blog of BLOGS) {
  mkdirSync(`${OUT}/${blog}`, { recursive: true });
  const first = await get(`${BASE}/blogs/${blog}`);
  writeFileSync(`${OUT}/${blog}/page-1.html`, first);
  const last = lastPageOf(first, blog);
  for (let p = 2; p <= last; p++) {
    await sleep(400);
    writeFileSync(`${OUT}/${blog}/page-${p}.html`, await get(`${BASE}/blogs/${blog}?page=${p}`));
  }
  console.log(blog, "pages", last);
  await sleep(400);
}
const [blog, slug] = REFERENCE_ARTICLE;
writeFileSync(`${OUT}/article-${slug}.html`, await get(`${BASE}/blogs/${blog}/${slug}`));
console.log("reference article saved");
