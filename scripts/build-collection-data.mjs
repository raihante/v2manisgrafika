// Build the collection fixture from private source captures (run with plain `node scripts/build-collection-data.mjs <handle>`).
// Inputs: reference/data/collections/<handle>/{page-<n>.html, views.json} (scripts/fetch-collection.mjs, 2026-11-06).
// Outputs: src/data/collections/<handle>.json (typed via src/lib/collections.ts) and
//          reference/data/collection-asset-plan-<handle>.json (local path -> source URL of non-product images:
//          promotion banners, colour-filter swatches) for scripts/download-collection-assets.mjs.
// MOCK images: product card images are dummyimage.com placeholders (scripts/lib/product-cards.mjs); the
// placeholder -> source map is appended to reference/data/product-image-sources-collections.json.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { decode, parseCards, sources, text } from "./lib/product-cards.mjs";

const handle = process.argv[2];
if (!handle) throw new Error("usage: node scripts/build-collection-data.mjs <handle>");
const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const DIR = `${ROOT}reference/data/collections/${handle}`;
const page1 = readFileSync(`${DIR}/page-1.html`, "utf8");
// Facet, sort and promotion markup is parsed from a whitespace-normalized copy (the theme splits attributes over lines).
const page1n = page1.replace(/\s+/g, " ");
const ASSET_DIR = `/assets/source/collection`;
const assets = {};
// Non-product source image -> local path under its source file name (no query string).
// Files the downloader recorded as 404 on the source (second build pass) render without an image.
const downloaded = existsSync(`${ROOT}reference/data/collection-assets-${handle}.json`) ? JSON.parse(readFileSync(`${ROOT}reference/data/collection-assets-${handle}.json`, "utf8")) : [];
const missing = new Set(downloaded.filter((a) => a.missing).map((a) => a.local));
const localAsset = (url) => {
  const abs = new URL(decode(url).replace(/^\/\//, "https://"), "https://beyondthevines.co.id");
  const name = decodeURIComponent(abs.pathname.split("/").pop());
  assets[`${ASSET_DIR}/${name}`] = abs.href;
  return missing.has(`${ASSET_DIR}/${name}`) ? null : `${ASSET_DIR}/${name}`;
};

const between = (html, startRe, endStr) => {
  const s = html.search(startRe);
  if (s < 0) return "";
  const e = html.indexOf(endStr, s);
  return html.slice(s, e < 0 ? undefined : e + endStr.length);
};

// --- Facet bar: breadcrumb + title (span.facet-col-title) ---
const colTitle = between(page1n, /<span class="facet-col-title">/, "</span>");
const breadcrumb = [...colTitle.matchAll(/<a href="([^"]+)" title="([^"]*)">([^<]*)<\/a>/g)].map((m) => ({ href: decode(m[1]), title: decode(m[2]), label: text(m[3]) }));
const title = breadcrumb.at(-1)?.label ?? handle;

// --- Sort: bar <select> options, bar fake list (currencyList), mobile <select> options ---
const options = (html) => [...html.matchAll(/<option value="([^"]+)"[^>]*>([^<]*)<\/option>/g)].map((m) => ({ value: m[1], label: text(m[2]) }));
const barSelect = between(page1n, /<select name="sort_by"[^>]*id="SortByBar"/, "</select>");
const barList = [...between(page1n, /<ul class="currencyList">/, "</ul>").matchAll(/data-value="([^"]+)">\s*<span>([^<]*)<\/span>/g)].map((m) => ({ value: m[1], label: text(m[2]) }));
const mobileSelect = between(page1n, /<select name="sort_by"[^>]*id="SortByMobile"/, "</select>");

// --- Facet drawer (FacetFiltersFormMobile): collapsible rows ---
const mobileForm = between(page1n, /<form id="FacetFiltersFormMobile"/, "</form>");
const facets = [...mobileForm.matchAll(/<collapsible-row data-index="(\d+)">([\s\S]*?)<\/collapsible-row>/g)].map(([, index, row]) => {
  const titleText = text(row.match(/<summary class="thb-filter-title">([\s\S]*?)<span><\/span><\/summary>/)?.[1] ?? "");
  const listClass = row.match(/<div class="(list-[^"]*)">/)?.[1] ?? null;
  const open = /<details[^>]*\sopen>/.test(row);
  if (/thb-filter-availability/.test(row)) {
    const input = row.match(/<input type="checkbox" name="([^"]+)" value="([^"]+)" class="([^"]+)" id="([^"]+)"\s*>/);
    return { index: Number(index), title: titleText, open, kind: "availability", name: input[1], listClass: null,
      values: [{ value: input[2], id: input[4], inputClass: input[3], label: text(row.match(/<label class="jsc-filter-availability-label"[^>]*>([^<]*)</)?.[1] ?? ""), count: null, tooltip: null, bg: null, image: null }] };
  }
  const values = [...row.matchAll(/<input type="checkbox" name="([^"]+)" value="([^"]+)" id="([^"]+)"[^>]*>\s*<label for="[^"]+" class="([^"]+)" style="([^"]*)" data-tooltip="([^"]*)"[^>]*>\s*([^<]*?)\s*<span class="count">([^<]*)<\/span>/g)].map((m) => {
    const bg = m[5].match(/--bg-color:\s*([^;]*);/)?.[1]?.trim() ?? null;
    const img = m[5].match(/--option-color-image:\s*url\('([^']+)'\)/)?.[1];
    return { value: decode(m[2]), id: m[3], label: decode(m[7]).trim(), count: text(m[8]), tooltip: decode(m[6]), labelClass: m[4], bg, image: img ? localAsset(img) : null, name: m[1] };
  });
  return { index: Number(index), title: titleText, open, kind: values[0]?.image ? "swatch" : "list", name: values[0]?.name ?? "", listClass, values: values.map(({ name, ...v }) => v) };
});

// --- Promotion columns (template#collection-grid-promo-template-...) ---
const grid = page1n.match(/<ul id="product-grid" data-id="([^"]+)" class="([^"]+)" data-promo-interval="(\d*)" data-promo-repeat="([^"]*)"/);
const promoTemplate = between(page1n, /<template id="collection-grid-promo-template-/, "</template>");
const promos = [...promoTemplate.matchAll(/<li class="(promotion-column[^"]*)" data-promo-block-id="([^"]+)" data-promo-position="(\d+)" data-promo-show-once="(\w+)" data-promo-after-grid="(\w+)">([\s\S]*?)<\/li>/g)].map((m) => {
  const body = m[6];
  const ratio = body.match(/--ratio-percent:\s*([\d.]+)%;\s*--ratio-percent-mobile:\s*([\d.]+)%/);
  const mobile = body.match(/<source media="([^"]+)" srcset="([^"]+)"/);
  const img = body.match(/<img style="([^"]*)" src="([^"]+)" alt="([^"]*)" class="([^"]*)"/);
  const link = body.match(/<a href="([^"]+)" class="gallery__item-content-link"( target="_blank")?/);
  return {
    className: m[1], id: m[2], position: Number(m[3]), showOnce: m[4] === "true", afterGrid: m[5] === "true",
    itemStyle: body.match(/<div class="gallery__item" style="([^"]*)"/)?.[1] ?? "",
    ratio: Number(ratio?.[1] ?? 100), ratioMobile: Number(ratio?.[2] ?? 100),
    mobileMedia: mobile?.[1] ?? null, mobileSrc: mobile ? localAsset(mobile[2]) : null,
    imgStyle: img?.[1] ?? "", src: img ? localAsset(img[2]) : null, alt: img ? decode(img[3]) : "", imgClass: img?.[4] ?? "",
    contentClass: body.match(/<div class="(gallery__item-content[^"]*)"/)?.[1] ?? "gallery__item-content",
    href: link ? decode(link[1]) : null, target: link?.[2] ? "_blank" : null,
  };
});

const pagination = page1n.match(/<pagination-theme class="([^"]+)" data-section="([^"]+)" data-products-per-page="(\d+)" data-next-url="([^"]*)" data-total-pages="(\d+)" data-current-page="(\d+)"/);

// --- Cards and views ---
// views.json holds the card markup and per-page card keys of every sort and single-facet view; without it, the
// default view is rebuilt from page-<n>.html.
const cards = {};
const views = {};
const keyOf = (li) => { const v = li.match(/data-variant-id="(\d+)"/)?.[1]; return v ? `variant:${v}` : `href:${li.match(/<a href="([^"]+)"/)?.[1] ?? li.length}`; };
if (existsSync(`${DIR}/views.json`)) {
  const raw = JSON.parse(readFileSync(`${DIR}/views.json`, "utf8"));
  for (const [key, li] of Object.entries(raw.cards)) cards[key] = parseCards(li)[0];
  for (const [q, v] of Object.entries(raw.views)) views[decodeURIComponent(q)] = v;
} else {
  const total = Number(pagination?.[5] ?? 1);
  const pages = [];
  for (let p = 1; p <= total; p++) {
    const html = readFileSync(`${DIR}/page-${p}.html`, "utf8");
    const ul = html.slice(html.indexOf('<ul id="product-grid"'), html.indexOf("<pagination-theme"));
    const keys = [];
    for (const [li] of ul.matchAll(/<li class="column">[\s\S]*?<\/product-card>\s*<\/li>/g)) { const k = keyOf(li); cards[k] ??= parseCards(li)[0]; keys.push(k); }
    pages.push(keys);
  }
  views[""] = { countText: text(page1.match(/<span class="facets__label">([^<]*)<\/span>/)?.[1] ?? ""), pages };
}

const data = {
  handle,
  title,
  documentTitle: text(page1.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? title).replace(/&ndash;/g, "–"),
  sectionId: grid?.[1] ?? "",
  gridClass: grid?.[2] ?? "products collection row small-up-2 medium-up-4 pagination--loadmore",
  promoInterval: Number(grid?.[3] || 0),
  promoRepeat: grid?.[4] !== "false",
  breadcrumb,
  sort: { bar: options(barSelect), barList, mobile: options(mobileSelect), initial: barSelect.match(/<option value="([^"]+)" selected/)?.[1] ?? "manual" },
  facets,
  promos,
  pagination: { className: pagination?.[1] ?? "pagination pagination-type--loadmore", perPage: Number(pagination?.[3] ?? 8), totalPages: Number(pagination?.[5] ?? 1) },
  cards,
  views,
};
mkdirSync(`${ROOT}src/data/collections`, { recursive: true });
writeFileSync(`${ROOT}src/data/collections/${handle}.json`, JSON.stringify(data));
// facets.css: background:url(./tick-icon-white.png) on the checked availability switch (theme asset folder).
assets[`${ASSET_DIR}/tick-icon-white.png`] = "https://beyondthevines.co.id/cdn/shop/t/33/assets/tick-icon-white.png";
writeFileSync(`${ROOT}reference/data/collection-asset-plan-${handle}.json`, JSON.stringify(assets, null, 1));
const imgMap = `${ROOT}reference/data/product-image-sources-collections.json`;
const prev = existsSync(imgMap) ? JSON.parse(readFileSync(imgMap, "utf8")) : {};
writeFileSync(imgMap, JSON.stringify({ ...prev, ...Object.fromEntries(sources) }, null, 1));
console.log(JSON.stringify({ handle, title, cards: Object.keys(cards).length, views: Object.keys(views).length, facets: facets.map((f) => `${f.title}:${f.values.length}`), promos: promos.length, sort: data.sort.bar.length, assets: Object.keys(assets).length, kb: Math.round(JSON.stringify(data).length / 1024) }));
