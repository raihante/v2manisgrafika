// Fetch a source collection into private reference data (read-only GETs only, run with plain `node`).
// Usage: node scripts/fetch-collection.mjs <handle> [--views]
// Writes reference/data/collections/<handle>/:
//   page-<n>.html   server HTML of every load-more page of the default view (Featured, no filter)
//   products.json   Shopify /collections/<handle>/products.json, all pages (titles, prices, created_at, options)
//   views.json      (--views) for every sort option and every single facet value: the card keys of each page, plus
//                   the card markup of every card seen (so the local mocks reproduce the source result sets and order)
// Snapshot conditions: Indonesia storefront (IDR), logged out, no cookies. Never posts anything to the source.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const [handle, flag] = process.argv.slice(2);
if (!handle) throw new Error("usage: node scripts/fetch-collection.mjs <handle> [--views]");
const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const OUT = `${ROOT}reference/data/collections/${handle}`;
mkdirSync(OUT, { recursive: true });
const BASE = "https://beyondthevines.co.id";
const HEADERS = { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "accept-language": "id-ID,id;q=0.9,en;q=0.8" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { headers: HEADERS });
    if (res.ok) return res.text();
    if (attempt >= 4 || res.status === 404) throw new Error(`${res.status} ${url}`);
    await sleep(3000 * attempt);
  }
}
const totalPagesOf = (html) => Number(html.match(/data-total-pages="(\d+)"/)?.[1] ?? 1);

// Top-level <li> elements of ul#product-grid (cards and promotion columns), as raw markup.
function gridItems(html) {
  const start = html.indexOf('<ul id="product-grid"');
  if (start < 0) return [];
  const end = html.indexOf("<pagination-theme", start);
  const ul = html.slice(start, end > 0 ? end : undefined);
  const items = [];
  const re = /<(\/?)li\b[^>]*>/g;
  re.lastIndex = ul.indexOf(">") + 1;
  let depth = 0, from = -1;
  for (let m; (m = re.exec(ul)); ) {
    if (!m[1]) { if (depth === 0) from = m.index; depth++; }
    else { depth--; if (depth === 0 && from >= 0) { items.push(ul.slice(from, re.lastIndex)); from = -1; } }
    if (depth < 0) break;
  }
  return items;
}
// Same identity as the theme's pagination getProductId(): "variant:<data-variant-id>", else the first link.
export const cardKey = (li) => {
  const v = li.match(/data-variant-id="(\d+)"/)?.[1];
  if (v) return `variant:${v}`;
  return `href:${li.match(/<a href="([^"]+)"/)?.[1] ?? li.length}`;
};

if (flag !== "--views-only") {
  const first = await get(`${BASE}/collections/${handle}`);
  writeFileSync(`${OUT}/page-1.html`, first);
  for (let p = 2; p <= totalPagesOf(first); p++) {
    await sleep(400);
    writeFileSync(`${OUT}/page-${p}.html`, await get(`${BASE}/collections/${handle}?page=${p}`));
  }
  const products = [];
  for (let p = 1; p < 20; p++) {
    await sleep(400);
    const batch = JSON.parse(await get(`${BASE}/collections/${handle}/products.json?limit=250&page=${p}`)).products;
    products.push(...batch);
    if (batch.length < 250) break;
  }
  writeFileSync(`${OUT}/products.json`, JSON.stringify({ fetched: new Date().toISOString(), products }, null, 1));
  console.log(JSON.stringify({ handle, totalPages: totalPagesOf(first), products: products.length }));
}

if (flag === "--views" || flag === "--views-only") {
  // Whitespace-normalized copy: the theme splits input attributes over several lines.
  const first = readFileSync(`${OUT}/page-1.html`, "utf8").replace(/\s+/g, " ");
  const sorts = [...new Set([...first.slice(first.indexOf('id="SortByBar"')).slice(0, 3000).matchAll(/<option value="([^"]+)"/g)].map((m) => m[1]))].filter((v) => v !== "manual");
  const facetInputs = [...new Set([...first.slice(first.indexOf("FacetFiltersFormMobile")).matchAll(/<input type="checkbox" name="(filter\.[^"]+)" value="([^"]+)"/g)].map((m) => `${m[1]}=${m[2]}`))];
  const queries = ["", ...sorts.map((s) => `sort_by=${s}`), ...facetInputs.map((q) => { const i = q.indexOf("="); return `${q.slice(0, i)}=${encodeURIComponent(q.slice(i + 1))}`; })];
  // Incremental: views already in views.json are kept (same snapshot day), only missing ones are fetched.
  const prev = existsSync(`${OUT}/views.json`) ? JSON.parse(readFileSync(`${OUT}/views.json`, "utf8")) : { views: {}, cards: {} };
  const cards = prev.cards;
  const views = prev.views;
  for (const q of queries) {
    if (views[q]) continue;
    const pages = [];
    let total = 1, countText = "";
    for (let p = 1; p <= total; p++) {
      await sleep(350);
      const html = await get(`${BASE}/collections/${handle}?${q}${q ? "&" : ""}page=${p}`);
      if (p === 1) { total = totalPagesOf(html); countText = html.match(/<span class="facets__label">([^<]*)<\/span>/)?.[1].trim() ?? ""; }
      const keys = [];
      for (const li of gridItems(html)) {
        if (/^<li class="promotion-column/.test(li)) continue;
        const key = cardKey(li);
        cards[key] ??= li;
        keys.push(key);
      }
      pages.push(keys);
    }
    views[q] = { countText, pages };
    console.log(q.slice(0, 60) || "(default)", pages.length, pages.flat().length, countText);
  }
  writeFileSync(`${OUT}/views.json`, JSON.stringify({ fetched: new Date().toISOString(), views, cards }));
  console.log(JSON.stringify({ views: Object.keys(views).length, cards: Object.keys(cards).length }));
}
