// Build the PDP fixture from private source captures (run with plain `node scripts/build-product-details.mjs`).
// Inputs: reference/data/product-details-raw.json + reference/data/products/<handle>/{page,recs-*}.html
//         (captured by scripts/fetch-product-details.mjs).
// Outputs: src/data/product-details.json (typed via src/lib/product-details.ts) and
//          reference/data/product-image-sources.json (placeholder URL -> source image URL, for the CMS migration).
// MOCK images (owner decision 2026-11-06): every product-page image is a https://dummyimage.com placeholder with the
// source dimensions and the source file name as its text; the CMS will supply the real images
// (docs/mock-behaviors.md "Product images"). No product image is downloaded or hotlinked from the source CDN.
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const raw = JSON.parse(readFileSync(`${ROOT}reference/data/product-details-raw.json`, "utf8")).out;
// Widths as the source requests them. Gallery: <img src=...&width=2000 srcset="352w,832w,1200w,1920w,2000w"
// sizes="(max-width: 1067px) 95vw, 45vw">; the placeholders keep that srcset/sizes markup.
const GALLERY_WIDTHS = [352, 832, 1200, 1920, 2000];
const GALLERY_SIZES = "(max-width: 1067px) 95vw, 45vw";
// Cards: no srcset; the source src carries its own &width= (2000 or 1999).
const widthOf = (url, fallback) => Number(decode(url).match(/[?&]width=(\d+)/)?.[1] ?? fallback);
const CARD_WIDTH = 2000;
const SWATCH_WIDTH = 40;

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const text = (s) => decode(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const sources = new Map();

// Placeholder for a source image at the requested size (text = source file name without extension).
function image(url, width, height) {
  const abs = new URL(decode(url).replace(/^\/\//, "https://"), "https://beyondthevines.co.id");
  abs.search = "";
  const name = decodeURIComponent(abs.pathname.split("/").pop()).replace(/\.[a-z0-9]+$/i, "");
  const h = Math.max(1, Math.round(height));
  const src = width <= 64 ? `https://dummyimage.com/${width}x${h}/d9d9d9/d9d9d9.png` : `https://dummyimage.com/${width}x${h}/f2f2f2/8c8c8c.png&text=${encodeURIComponent(name)}`;
  sources.set(src, abs.href);
  return src;
}

// Balanced <div> block starting at `start` (regex parsing is enough for this theme's server HTML).
function divBlock(html, start) {
  let depth = 0;
  const re = /<(\/?)div\b[^>]*>/g;
  re.lastIndex = start;
  for (let m; (m = re.exec(html)); ) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return html.slice(start, re.lastIndex);
  }
  return html.slice(start);
}
const inner = (block) => block.slice(block.indexOf(">") + 1, block.lastIndexOf("</div>"));

// Product cards (Pair It With / You May Also Like) with everything the source product-card markup renders.
function parseCards(html) {
  if (!html) return [];
  return [...html.matchAll(/<product-card\b[\s\S]*?<\/product-card>/g)].map(([card]) => {
    const attr = (re) => card.match(re)?.[1] ?? null;
    const titleLink = card.match(/<a href="([^"]+)"[^>]*class="product-card-title"[^>]*>([\s\S]*?)<\/a>/);
    const imageLink = card.match(/<a href="([^"]+)"[^>]*class="product-featured-image-link[^"]*"[^>]*style="--padding-bottom:\s*([\d.]+)%/);
    const price = card.match(/class="amount[^"]*">([\s\S]*?)<\//);
    const primary = card.match(/<img src="([^"]+)" class="(product-primary-image[^"]*)"/);
    const swatches = [...card.matchAll(/<div class="product-card-swatch([^"]*)" style="[^"]*--option-color-image:\s*url\('([^']+)'\)[^"]*"[^>]*data-href="([^"]+)"[\s\S]*?data-value="([^"]+)"/g)]
      .map((m) => ({ value: decode(m[4]), image: image(m[2], SWATCH_WIDTH, SWATCH_WIDTH), active: /\bactive\b/.test(m[1]), soldOut: /swatch-soldout/.test(m[1]), href: decode(m[3]) }));
    const swatchTitle = card.match(/<div class="product-card-swatches--title"><span class="var-selected">([^<]*)<\/span>([^<]*)<\/div>/);
    const labelsIn = (block) => [...(block ?? "").matchAll(/<div[^>]*class="(jsc-label[^"]*)"[^>]*>([^<]*)</g)]
      .filter((m) => !/display:\s*none/.test(m[0])).map((m) => ({ className: m[1].trim(), text: text(m[2]) }));
    const overlay = card.match(/<div class="label-discount-code-grid-wrap">([\s\S]*?)<\/div>\s*<\/div>/)?.[1];
    const info = card.slice(card.indexOf('<div class="product-card-info"'));
    const ratio = imageLink ? Number(imageLink[2]) : 150;
    const cardImage = (u) => { const w = widthOf(u, CARD_WIDTH); return image(u, w, (w * ratio) / 100); };
    const infoLabels = info.slice(info.lastIndexOf('<div class="label-wrap">'));
    return {
      title: titleLink ? text(titleLink[2]) : "",
      href: titleLink ? decode(titleLink[1]).split("?")[0] : "#",
      imageHref: imageLink ? decode(imageLink[1]) : "#",
      ratio: imageLink ? Number(imageLink[2]) : 150,
      handle: attr(/data-product-handle="([^"]+)"/),
      variantId: Number(attr(/data-variant-id="(\d+)"/)) || null,
      price: price ? text(price[1]) : "",
      priceFirst: info.indexOf('class="price"') < info.indexOf("product-card-swatches--container"),
      primary: primary ? cardImage(primary[1]) : null,
      primaryClass: primary ? primary[2] : "product-primary-image",
      secondary: [...card.matchAll(/<img src="([^"]+)" class="product-secondary-image/g)].map((m) => cardImage(m[1])),
      swatches,
      swatchSelected: swatchTitle ? decode(swatchTitle[1]) : "",
      swatchSuffix: swatchTitle ? text(swatchTitle[2]) : "",
      overlayLabels: labelsIn(overlay),
      labels: labelsIn(infoLabels),
      button: /<quick-view/.test(card) ? "add" : /Notify Me/.test(card) ? "notify" : "add",
    };
  });
}

// Template multicolumn section (e.g. "Compare Dumpling Series" on bags); empty on most products -> null.
const MULTICOLUMN_WIDTH = 1200;
function parseMulticolumn(page) {
  const start = page.indexOf('id="shopify-section-template--22834210603287__multicolumn_');
  if (start < 0) return null;
  const end = page.indexOf('<div id="shopify-section', start + 10);
  const sec = page.slice(start, end < 0 ? undefined : end);
  const path = (u) => decode(u).replace(/^https?:\/\/(www\.)?beyondthevines\.co\.id/, "");
  const columns = sec.split('<div class="multicolumn__column').slice(1).map((col) => {
    const img = col.match(/<noscript>\s*<img width="(\d+)" height="(\d+)"[^>]*src="([^"]+)"/);
    const rte = col.match(/<div class="rte"\s*>([\s\S]*?)<\/div>\s*<a class="text-button"/);
    const button = col.match(/<a class="text-button" href="([^"]+)"><span>([^<]*)<\/span>/);
    return {
      className: `multicolumn__column${col.slice(0, col.indexOf('"'))}`,
      href: path(col.match(/<a href="([^"]+)"/)?.[1] ?? "#"),
      image: img ? image(img[3], MULTICOLUMN_WIDTH, (MULTICOLUMN_WIDTH * Number(img[2])) / Number(img[1])) : null,
      width: img ? Number(img[1]) : null,
      height: img ? Number(img[2]) : null,
      ratio: Number(col.match(/--ratio-percent:\s*([\d.]+)%/)?.[1] ?? 100),
      title: text(col.match(/<h4 class="h6">([\s\S]*?)<\/h4>/)?.[1] ?? ""),
      html: rte ? rte[1].trim() : "",
      button: button ? { href: path(button[1]), label: text(button[2]) } : null,
    };
  });
  if (!columns.length) return null;
  return { heading: text(sec.match(/<h2 class="h3">([\s\S]*?)<\/h2>/)?.[1] ?? ""), columns };
}

function parseTabs(page, descriptionHtml) {
  const titles = [...page.matchAll(/<button[^>]*class="product-info-tabs__tab[^"]*"[^>]*>([\s\S]*?)<\/button>/g)].map((m) => text(m[1]));
  const panels = [...page.matchAll(/<div\s+class="product-info-tabs__panel\b(?!s)/g)].map((m) => inner(divBlock(page, m.index)));
  // The theme renders the product description (its own ul.tabs: tab1 details, tab2 washcare, tab3 measurements)
  // inside the first panels and shows one li per panel; keep only the li that panel displays.
  const descTab = (n) => descriptionHtml.match(new RegExp(`<li id="tab${n}"[^>]*>([\\s\\S]*?)</li>`))?.[1]?.trim() ?? null;
  const clean = (h) => h.replace(/<div class="product-sku[\s\S]*?<\/div>/, "").replace(/<meta[^>]*>/g, "").trim();
  const keys = [...page.matchAll(/class="product-info-tabs__tab[^"]*"[^>]*data-tab-target="([^"]+)"/g)].map((m) => m[1]);
  // Panel markup exactly as the source renders it (rich text, like a CMS field): inline handlers removed (the
  // component handles the CM/IN switch), the variant SKU replaced by a {{SKU}} token filled per variant.
  const panelHtml = (panel) => panel.replace(/\son\w+="[^"]*"/g, "")
    .replace(/(<div class="product-sku[^"]*"[^>]*>)[\s\S]*?(<\/div>)/, "$1{{SKU}}$2").trim();
  return titles.map((title, i) => {
    const panel = panels[i] ?? "";
    const common = { key: keys[i] ?? `tab_${i}`, panelHtml: panelHtml(panel) };
    // Measurements panel: CM table shown by default, inch version (description tab3) behind a CM/IN switch.
    const cm = panel.indexOf('<div class="cmdescription');
    if (cm >= 0) return { ...common, title, html: clean(inner(divBlock(panel, cm))), inchHtml: descTab(3) ? clean(descTab(3)) : null };
    const html = /<ul class="tabs"/.test(panel) && descTab(i + 1) ? descTab(i + 1) : panel;
    return { ...common, title, html: clean(html) };
  });
}

const details = {};
for (const [handle, entry] of Object.entries(raw)) {
  const p = entry.product;
  const dir = `${ROOT}reference/data/products/${handle}`;
  const page = readFileSync(`${dir}/page.html`, "utf8");
  const read = (f) => (existsSync(`${dir}/${f}`) ? readFileSync(`${dir}/${f}`, "utf8") : "");
  // Options as the source renders them (variant-selects): rendered values and order (fully sold-out colours are
  // omitted by the theme), optional colour categories, and the initially checked value per option.
  const selects = page.slice(page.indexOf("<variant-selects"), page.indexOf("</variant-selects>"));
  const fieldsets = [...selects.matchAll(/<fieldset[^>]*data-index="option(\d)"[^>]*>([\s\S]*?)<\/fieldset>/g)];
  const options = p.options.map((o, i) => {
    const fs = fieldsets.find((f) => Number(f[1]) === i + 1)?.[2] ?? "";
    const inputs = [...fs.matchAll(/<input type="radio"\s+id="[^"]*-(\d+)"[^>]*?value="([^"]+)"[^>]*>\s*(<label[^>]*>)/g)]
      .map((m) => [m[0], m[1], m[2], m[3].match(/--option-color:\s*([^;]*);/)?.[1]]);
    const values = inputs.map((m) => decode(m[2]));
    const groups = [...fs.matchAll(/data-color-category="([^"]+)"[\s\S]*?<div class="product-form__color-category-swatches">([\s\S]*?)<\/div>\s*<\/div>/g)]
      .map((g) => ({ name: decode(g[1]), values: [...g[2].matchAll(/value="([^"]+)"/g)].map((m) => decode(m[1])) }));
    return {
      name: o.name,
      // Option handle as the theme writes it on the fieldset (data-handle="colour" / "color" / "size").
      handle: fs ? (selects.match(new RegExp(`data-index="option${i + 1}" data-handle="([^"]+)"`))?.[1] ?? o.name.toLowerCase()) : o.name.toLowerCase(),
      values: values.length ? values : o.values,
      // Radio id suffix per value (the product's option order, which differs from the rendered order for categories).
      ids: values.length ? inputs.map((m) => Number(m[1])) : o.values.map((_, k) => k),
      // Raw --option-color of each swatch label (the theme writes the colour name or var(--bg-body)).
      colors: values.length ? inputs.map((m) => (m[3] ?? "").trim()) : [],
      groups: groups.length ? groups : null,
    };
  });
  const initial = options.map((o, i) => {
    const fs = fieldsets.find((f) => Number(f[1]) === i + 1)?.[2] ?? "";
    const checked = fs.match(/<input type="radio"[^>]*value="([^"]+)"[^>]*checked/);
    return checked ? decode(checked[1]) : o.values[0];
  });
  const colourIndex = p.options.findIndex((o) => /^colou?r$/i.test(o.name));
  const colours = colourIndex >= 0 ? options[colourIndex].values : [];
  // Gallery = rendered slides filtered like the theme's variantImageSwap: alt equals the colour or the product
  // title (shared images); products without a colour option show every slide. The theme also tests
  // alt.includes(colour + "-textMain") on the lowercased alt, which can never match, so that clause is not reproduced.
  const slideData = [...page.matchAll(/<div\s+id="Slide-[^"]*"\s+class="product-images__slide product-images__slide--image[^"]*"[^>]*data-img-alt="([^"]*)"\s*>\s*<div[^>]*>\s*<a\s+href="([^"]+)"/g)]
    .map((m) => ({ alt: decode(m[1]).toLowerCase(), altRaw: decode(m[1]), src: m[2] }));
  // --padding-bottom of each slide = height / width of the source media (product JSON).
  const fileOf = (u) => decode(u).split("?")[0].split("/").pop();
  const ratios = new Map((p.media ?? []).filter((m) => m.src && m.width).map((m) => [fileOf(m.src), (m.height / m.width) * 100]));
  const ratioOf = (u) => ratios.get(fileOf(u)) ?? 150;
  const title = p.title.toLowerCase();
  const galleries = (colours.length ? colours : [null]).map((colour) => ({
    colour,
    images: slideData.filter((s) => !colour || s.alt === colour.toLowerCase() || s.alt === title)
      .map((s) => ({
        src: image(s.src, 2000, 20 * ratioOf(s.src)),
        srcset: GALLERY_WIDTHS.map((w) => `${image(s.src, w, (w * ratioOf(s.src)) / 100)} ${w}w`).join(", "),
        sizes: GALLERY_SIZES,
        thumb: image(s.src, 1200, 12 * ratioOf(s.src)), // cart line / sticky bar image
        alt: s.altRaw,
        ratio: ratioOf(s.src),
      })),
  }));
  const swatches = {};
  for (const m of selects.matchAll(/value="([^"]+)"[^>]*>\s*<label[^>]*--option-color-image:\s*url\('([^']+)'\)/g)) swatches[decode(m[1])] = image(m[2], SWATCH_WIDTH, SWATCH_WIDTH);
  const labels = {};
  for (const m of page.matchAll(/<div data-label-id="(\d+)"[^>]*class="jsc-label[^"]*"[^>]*>([^<]*)</g)) (labels[m[1]] ??= []).push(text(m[2]));
  const priceMatch = page.match(/id="price-template[^"]*"[\s\S]*?class="amount[^"]*">([\s\S]*?)<\//);
  const detail = {
    handle,
    title: p.title,
    priceText: priceMatch ? text(priceMatch[1]) : "",
    options,
    initial,
    variants: p.variants.map((v) => ({ id: v.id, options: v.options, available: v.available, sku: v.sku ?? "", labels: labels[v.id] ?? [] })),
    galleries,
    swatches,
    // Server-rendered "n / total" counter of the mobile gallery buttons (theme value, not the mounted slide count).
    slideCount: Number(page.match(/slider-counter--total">(\d+)/)?.[1] ?? slideData.length),
    tabs: parseTabs(page, p.description ?? ""),
    pairItWith: parseCards(read("recs-complementary.html")),
    related: parseCards(read("recs-related.html")),
    multicolumn: parseMulticolumn(page),
  };
  // Bundle products (Part A / Part B child swatches, e.g. btv-to-go-phone-strap) need their own UI; not served yet.
  detail.template = /class="bundle-child-swatch/.test(page) ? "bundle" : "standard";
  details[handle] = detail;
}

writeFileSync(`${ROOT}src/data/product-details.json`, JSON.stringify(details, null, 1));
writeFileSync(`${ROOT}reference/data/product-image-sources.json`, JSON.stringify(Object.fromEntries(sources), null, 1));
const standard = Object.values(details).filter((d) => d.template === "standard").map((d) => d.handle);
const bundles = Object.values(details).filter((d) => d.template === "bundle").map((d) => d.handle);
console.log(JSON.stringify({ products: Object.keys(details).length, placeholders: sources.size, standard: standard.length, bundles }));
