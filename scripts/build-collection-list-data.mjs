// Build the /collections (template-list-collections) fixture from the private source capture
// (run with plain `node scripts/build-collection-list-data.mjs`).
// Input: reference/data/collections/_index/page-1.html (server HTML, read-only GET 2026-11-06).
// Outputs: src/data/collection-list.json (typed via src/lib/collections/list.ts) and
//          reference/data/collection-asset-plan-_index.json (local path -> source URL) for
//          `node scripts/download-collection-assets.mjs _index`. Collection banner images are real source images.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { decode, text } from "./lib/product-cards.mjs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const html = readFileSync(`${ROOT}reference/data/collections/_index/page-1.html`, "utf8").replace(/\s+/g, " ");
const ASSET_DIR = "/assets/source/collections";
const assets = {};
const local = (url) => {
  const abs = new URL(decode(url).replace(/^\/\//, "https://"), "https://beyondthevines.co.id");
  const name = decodeURIComponent(abs.pathname.split("/").pop());
  assets[`${ASSET_DIR}/${name}`] = abs.href;
  return `${ASSET_DIR}/${name}`;
};

const sectionMatch = html.match(/<div id="shopify-section-(template--\d+__main)" class="([^"]+)">/);
const sec = html.slice(sectionMatch.index, html.indexOf("<!-- BEGIN sections: footer-group -->", sectionMatch.index));
const list = sec.match(/<div class="(list-collections[^"]*)" style="([^"]*)">/);
const header = sec.match(/<div class="(section-header[^"]*)" style="([^"]*)"> <div class="section-header--content"><h2 class="([^"]*)">([^<]*)<\/h2>/);
const row = sec.match(/<div class="(row no-padding)" style="([^"]*)">/);
// Section-level <style> the theme prints after the grid (card title size/weight for this section).
const style = sec.match(/<style>([\s\S]*?)<\/style>/)?.[1].trim() ?? "";

const cards = [...sec.matchAll(/<div class="small-12 "> <div class="(collection-card[^"]*)"> <div class="(collection-card__image[^"]*)" style="--var-media-aspect-ratio: ([\d.]+)%"> <a href="([^"]+)" class="collection-card__link" title="([^"]*)"> <img class="lazyload " width="(\d+)" height="(\d+)" data-sizes="auto" src="([^"]+)" data-srcset="([^"]+)" fetchpriority="low" alt="([^"]*)" \/> <noscript> <img [^>]*src="([^"]+)"[\s\S]*?<\/noscript> <\/a> <\/div> <div class="collection-card__content"> <a href="[^"]+" class="collection-card__link" title="[^"]*">([^<]*)<\/a>/g)].map((m) => ({
  cardClass: m[1],
  imageClass: m[2],
  ratio: Number(m[3]),
  href: decode(m[4]),
  title: decode(m[5]),
  width: Number(m[6]),
  height: Number(m[7]),
  placeholder: local(m[8]),
  srcset: m[9].split(",").map((s) => s.trim()).filter(Boolean).map((s) => { const [u, w] = s.split(/\s+/); return { src: local(u), w: Number(w.replace("w", "")) }; }),
  alt: decode(m[10]),
  // The <noscript> fallback requests the full-size original (3390x3925 and similar); it is never fetched with scripts
  // enabled, so it is not mirrored: the clone's noscript image uses the largest mirrored width instead.
  original: decode(m[11]).replace(/^\/\//, "https://"),
  label: text(m[12]),
}));

const data = {
  documentTitle: text(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "Collections").replace(/&ndash;/g, "–"),
  sectionId: sectionMatch[1],
  sectionClass: sectionMatch[2],
  listClass: list[1],
  listStyle: list[2],
  headerClass: header[1],
  headerStyle: header[2],
  headingClass: header[3],
  heading: text(header[4]),
  rowClass: row[1],
  rowStyle: row[2],
  sectionStyle: style,
  cards,
};
mkdirSync(`${ROOT}src/data`, { recursive: true });
writeFileSync(`${ROOT}src/data/collection-list.json`, JSON.stringify(data, null, 1) + "\n");
writeFileSync(`${ROOT}reference/data/collection-asset-plan-_index.json`, JSON.stringify(assets, null, 1));
console.log(JSON.stringify({ heading: data.heading, cards: cards.map((c) => c.label), assets: Object.keys(assets).length }));
