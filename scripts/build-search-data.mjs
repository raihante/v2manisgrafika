// Build the /search template fixture (markup metadata only) from private source captures
// (run with plain `node scripts/build-search-data.mjs`).
// Inputs: reference/data/search/{empty,bag}.html (server HTML of /search and /search?q=bag, read-only GETs 2026-11-06).
// Output: src/data/search.json (typed via src/lib/search/types.ts). Result data is NOT taken from the source: the local
// MOCK search runs over the /collections/new-in dataset (docs/mock-behaviors.md "Search page").
import { readFileSync, writeFileSync } from "node:fs";
import { decode, text } from "./lib/product-cards.mjs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const read = (f) => readFileSync(`${ROOT}reference/data/search/${f}`, "utf8").replace(/\s+/g, " ");
const empty = read("empty.html");
const bag = read("bag.html");

const sectionId = (html, kind) => html.match(new RegExp(`id="shopify-section-(template--\\d+__${kind})"`))[1];
const banner = bag.match(/<div class="(collection-banner [^"]*)" style="([^"]*)">/);
const crumbs = bag.match(/<span class="facet-col-title">([\s\S]*?)<\/span><\/span>/)?.[1] ?? "";
const options = (html) => [...html.matchAll(/<option value="([^"]+)"[^>]*>([^<]*)<\/option>/g)].map((m) => ({ value: m[1], label: text(m[2]) }));
const between = (html, start, end) => { const s = html.indexOf(start); return s < 0 ? "" : html.slice(s, html.indexOf(end, s) + end.length); };
const pagination = bag.match(/<pagination-theme class="([^"]+)" data-section="([^"]+)" data-products-per-page="(\d+)"/);

const data = {
  documentTitle: { empty: text(empty.match(/<title>([\s\S]*?)<\/title>/)[1]).replace(/&ndash;/g, "–"), results: 'Search: {count} results found for "{q}" – Beyond The Vines Indonesia' },
  bannerSectionId: sectionId(empty, "main-collection-banner"),
  searchSectionId: sectionId(empty, "main-search"),
  bannerClass: banner[1],
  bannerStyle: banner[2],
  breadcrumbHome: { href: "/", label: text(bag.match(/<nav class="breadcrumbs" aria-label="breadcrumbs"> <a href="\/">([^<]*)<\/a>/)[1]) },
  breadcrumbCurrent: text(bag.match(/<i>\/<\/i> ([^<]*?) <\/nav>/)[1]),
  title: text(bag.match(/<h1 class="collection-banner--title">([^<]*)<\/h1>/)[1]),
  placeholder: decode(bag.match(/class="search-field searchpageinput" placeholder="([^"]*)"/)[1]),
  // Banner description as the browser parses the theme's nested <p>: "<p> </p><p>{count} results found for “{q}”</p> <p></p>".
  resultsText: "{count} results found for “{q}”",
  // Facet bar breadcrumb: Home / Shop (-> /collections/new-in) / <span>Search</span>.
  barCrumbs: [...crumbs.matchAll(/<a href="([^"]+)" title="([^"]*)">([^<]*)<\/a>/g)].map((m) => ({ href: decode(m[1]), title: decode(m[2]), label: text(m[3]) }))
    .concat([{ href: "", title: "", label: text(crumbs.match(/<span>([^<]*)<\/span>$/)?.[1] ?? "Search") }]),
  hiddenInputs: [{ name: "options[prefix]", value: decode(bag.match(/<input name="options\[prefix\]" type="hidden" value="([^"]*)"/)[1]) }],
  sort: { bar: options(between(bag, 'id="SortByBar"', "</select>")), barList: [...between(bag, '<ul class="currencyList">', "</ul>").matchAll(/data-value="([^"]+)"> <span>([^<]*)<\/span>/g)].map((m) => ({ value: m[1], label: text(m[2]) })), mobile: options(between(bag, 'id="SortByMobile"', "</select>")), initial: "relevance" },
  gridClass: bag.match(/<ul id="product-grid" data-id="[^"]+" class="([^"]+)"/)[1],
  paginationClass: pagination[1],
  perPage: Number(pagination[3]),
  countLabel: "{count} results",
  facetTitles: [...between(bag, 'id="FacetFiltersFormMobile"', "</form>").matchAll(/<summary class="thb-filter-title">([^<]*)<span><\/span><\/summary>/g)].map((m) => text(m[1])),
};
writeFileSync(`${ROOT}src/data/search.json`, JSON.stringify(data, null, 1) + "\n");
console.log(JSON.stringify(data, null, 1));
