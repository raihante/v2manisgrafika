// Fetch article METADATA for every source article (read-only GETs only, run with plain `node` after fetch-blogs.mjs).
// Usage: node scripts/fetch-blog-articles.mjs
// Reads the article list from reference/data/blogs/<blog>/page-*.html (plus the announcement-bar links for
// `promotions`, whose index lists no cards) and writes reference/data/blogs/articles-meta.json.
// Owner decision 2026-11-06 ("1 template artikel saja ... jangan banyak clone"): article HTML is NOT stored; only
// title, og:image (hero), og:title, meta description (owner articles only) and, for media-stories, the first
// external link of the article body (the publication link). Media-stories descriptions and bodies are third-party
// press text and are dropped. The `main` landings are skipped (not routes).
// Snapshot conditions: Indonesia storefront (IDR), logged out, no cookies. Never posts anything to the source.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

// Same list as scripts/fetch-blogs.mjs (not imported: that module fetches on load).
const BLOGS = ["btv-city-guide", "collaborations", "events", "media-stories", "news", "promotions", "travelling-btv-express"];

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const DIR = `${ROOT}reference/data/blogs`;
const BASE = "https://beyondthevines.co.id";
const HEADERS = { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "accept-language": "id-ID,id;q=0.9,en;q=0.8" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").trim();
const meta = (html, key) => {
  const m = html.match(new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`));
  return m ? decode(m[1]) : null;
};

async function get(url) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { headers: HEADERS });
    if (res.ok) return res.text();
    if (attempt >= 4 || res.status === 404) throw new Error(`${res.status} ${url}`);
    await sleep(3000 * attempt);
  }
}

const list = [];
for (const blog of BLOGS) {
  const pages = readdirSync(`${DIR}/${blog}`).filter((f) => /^page-\d+\.html$/.test(f)).sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5)));
  for (const file of pages) {
    const html = readFileSync(`${DIR}/${blog}/${file}`, "utf8");
    const re = blog === "promotions" ? /href="\/blogs\/promotions\/([a-z0-9-]+)"/g : new RegExp(`<div class="blog-post-list [^"]*">\\s*<a href="/blogs/${blog}/([a-z0-9-]+)">([\\s\\S]*?)</a>\\s*</div>`, "g");
    for (const m of html.matchAll(re)) {
      if (m[1] === "main" || list.some((a) => a.blog === blog && a.sourceSlug === m[1])) continue;
      const card = m[2] ?? "";
      const strip = (s) => decode(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
      list.push({
        blog,
        sourceSlug: m[1],
        indexOrder: list.filter((a) => a.blog === blog).length,
        cardDate: card.match(/class="date-blog">([\s\S]*?)<\/div>/)?.[1] ? strip(card.match(/class="date-blog">([\s\S]*?)<\/div>/)[1]) : null,
        cardTitle: card.match(/class="blog-post-list-title">([\s\S]*?)<\/div>/)?.[1] ? strip(card.match(/class="blog-post-list-title">([\s\S]*?)<\/div>/)[1]) : null,
        cardImage: card.match(/<img[^>]*?src="([^"]+)"/)?.[1] ?? null,
      });
    }
  }
}

for (const a of list) {
  await sleep(400);
  const html = await get(`${BASE}/blogs/${a.blog}/${a.sourceSlug}`);
  const isPress = a.blog === "media-stories";
  a.title = decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "").replace(/\s+/g, " ");
  a.ogTitle = meta(html, "og:title");
  a.description = isPress ? null : meta(html, "description");
  a.image = meta(html, "og:image:secure_url");
  a.imageWidth = Number(meta(html, "og:image:width")) || null;
  a.imageHeight = Number(meta(html, "og:image:height")) || null;
  a.publishedTime = meta(html, "article:published_time");
  a.template = html.match(/template-article[\w-]*/g)?.at(-1) ?? null;
  if (isPress) {
    const start = html.indexOf('class="post-content');
    const body = start >= 0 ? html.slice(start, html.indexOf("</article", start) > 0 ? html.indexOf("</article", start) : start + 200000) : "";
    a.externalLink =
      [...body.matchAll(/<a [^>]*href="(https?:\/\/[^"]+)"/g)].map((m) => decode(m[1])).find((u) => !/beyondthevines\.|instagram\.com|facebook\.com|tiktok\.com/.test(u)) ?? null;
  }
  console.log(a.blog, a.sourceSlug, a.image ? "img" : "-", a.externalLink ?? "");
}
writeFileSync(`${DIR}/articles-meta.json`, JSON.stringify({ snapshot: "2026-11-06", market: "Indonesia (IDR), logged out", articles: list }, null, 2));
console.log("articles", list.length);
