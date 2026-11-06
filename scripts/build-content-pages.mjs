// Build the content-block pages (about-us + 4 policy pages; AGENTS.md "CMS-template scope reduction": own design, not
// source-faithful). Run with plain `node scripts/build-content-pages.mjs`.
// Input: reference/dom/r258-content/outline-<slug>.json (reference/scripts/r258-outline.mjs, read-only ego capture of the
// Shogun page-builder DOM 2026-11-06: ordered text/image/box leaves with desktop/mobile visibility and typography).
// Output:
//   src/data/pages/content/<slug>.json   typed by src/lib/pages/content.ts (ContentPageData)
//   reference/data/collection-asset-plan-_content.json -> `node scripts/download-collection-assets.mjs _content`
// Mapping rules (Shogun layout -> project blocks) are documented in docs/component-inventory.md "Content blocks".
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const SLUGS = ["about-us", "terms-of-service", "privacy-policy", "returns", "shipping-rate"];
const ASSET_DIR = "/assets/source/pages/shogun";
// Content types of the extension-less i.shgcdn.com originals (HEAD 2026-11-06).
const EXT = {
  "1ff6c171-7984-4985-8ed0-c64a9dcf35d0": "gif", "7d7651a5-efaf-46b9-971a-de1d5e1093c4": "gif", "8701e4cc-675f-4748-be52-99a9a412e360": "png",
  "cf4181a0-5acf-4be8-b578-1e6ca6a4a6cf": "jpg", "6508a3a6-bcd1-4c22-85ad-d022712833eb": "webp", "ad945522-6c2c-4ae5-8186-31a90e9906bf": "webp",
  "6249b8f0-d19a-45bf-bdc9-a2c7479dbc18": "png", "624f3295-07a6-4364-bc54-1ec139805de7": "png", "be7344e7-0ee6-41a9-a6ea-0112b31234f6": "png",
  "103fea8c-3826-4112-aec6-f7f51c37fcd5": "png", "2523d836-22bf-46d3-9842-a227bdf34a32": "png", "542d05af-b099-4cbf-9606-4bddccaa59b3": "webp",
  "03c72f13-24a7-479a-9457-3898c5fb29ea": "png", "bba6b5ca-55fe-41b7-b000-8486478dd81e": "gif", "c55c76ea-2cb9-4582-8b80-57e9e0b34dd9": "png",
  "216c1f7d-4018-4bb0-b7c8-c7c6d50d0348": "webp",
};
const assets = {};
const local = (url) => {
  const id = url.match(/i\.shgcdn\.com\/([0-9a-f-]+)\//)[1];
  if (!EXT[id]) throw new Error(`unknown content type for ${url}`);
  const path = `${ASSET_DIR}/${id}.${EXT[id]}`;
  assets[path] = `https://i.shgcdn.com/${id}/`;
  return path;
};
// Natural sizes come from the downloaded files (second run) so the <img> boxes reserve the right ratio.
const sizes = existsSync(`${ROOT}reference/data/collection-assets-_content.json`)
  ? Object.fromEntries(JSON.parse(readFileSync(`${ROOT}reference/data/collection-assets-_content.json`, "utf8")).map((a) => [a.local, [a.width, a.height]]))
  : {};
const img = (url, alt = "") => { const src = local(url); const [width, height] = sizes[src] || [null, null]; return { src, alt, width, height }; };

// Source links to the Indonesian storefront become site-relative; other hosts (the .com store, cookie sites, the
// /a/service returns app) stay absolute.
const html = (s) => s.replace(/href="https?:\/\/(?:www\.)?beyondthevines\.co\.id(\/(?!a\/)[^"]*)"/g, 'href="$1"').replace(/^(\s*<br>)+|(<br>\s*)+$/g, "").trim();
const plain = (s) => s.replace(/<[^>]+>/g, "").trim();
const titleOf = (doc) => doc.replace(/\s*[–-]\s*Beyond The Vines Indonesia$/, "").replace(/^Beyond The Vines \|\s*/, "").replace(/\s*\|\s*Beyond The Vines$/, "").trim();

function build(slug) {
  const { docTitle, items } = JSON.parse(readFileSync(`${ROOT}reference/dom/r258-content/outline-${slug}.json`, "utf8"));
  const desk = (it) => it.vis || (it.kind === "img" && it.r[2] > 0); // lazy images report height 0 before decoding
  const mob = (it) => it.vis390 || (it.kind === "img" && it.r390?.[2] > 0);
  const page = { slug, documentTitle: docTitle.replace(/�/g, "–"), title: titleOf(docTitle.replace(/�/g, "–")), accent: "rgb(0, 96, 212)", blocks: [] };
  const boxes = items.filter((it) => it.kind === "box");
  const accentBox = boxes.find((b) => b.bg !== "rgba(0, 0, 0, 0)" && b.r[2] >= 1000);
  if (accentBox) page.accent = accentBox.bg;
  const textColor = items.find((it) => it.kind === "text" && desk(it) && it.size < 40)?.color;
  if (textColor && textColor !== "rgb(0, 0, 0)") page.textColor = textColor;

  // Hero: display-size title lines (>= 150px on desktop) or a leading background-image box without an <img> inside.
  const heroLines = items.filter((it) => it.kind === "text" && it.vis && it.size >= 150);
  // The source terms-of-service page keeps the Privacy Policy <title> and body (source quirk, SESSION_HANDOFF.md round
  // 258); its own display title names the page, so the visible title wins over the document title.
  if (heroLines.length) { page.heroTitle = heroLines.map((it) => plain(it.html)); page.title = page.heroTitle.join(" "); }
  const inside = (box, it) => it.r[0] >= box.r[0] && it.r[1] >= box.r[1] && it.r[0] + it.r[2] <= box.r[0] + box.r[2] + 1 && it.r[1] + it.r[3] <= box.r[1] + box.r[3] + 1;
  const firstText = items.findIndex((it) => it.kind === "text" && it.vis);
  const heroBox = boxes.find((b) => b.bgi && items.indexOf(b) < firstText && !items.some((it) => it.kind === "img" && desk(it) && inside(b, it)));
  if (heroBox) page.hero = { image: img(heroBox.bgi, page.title), fit: heroBox.size === "contain" ? "contain" : "cover", maxWidth: heroBox.r[2], height: heroBox.r[3], mobileHeight: heroBox.r390?.[3] || null };

  const used = new Set([...heroLines, heroBox].filter(Boolean));
  const push = (block) => {
    const prev = page.blocks.at(-1);
    if (block.type === "richText" && prev?.type === "richText" && prev.variant === block.variant) { prev.html += block.html; return; }
    if (block.type === "iconList" && prev?.type === "iconList" && prev.variant === block.variant) { prev.items.push(...block.items); return; }
    if (block.type === "list" && prev?.type === "list") { prev.items.push(...block.items); return; }
    page.blocks.push(block);
  };
  const variantOf = (it) => (it.color === "rgb(183, 183, 183)" ? "note" : it.size >= 24 ? "lead" : "body");

  for (let k = 0; k < items.length; k++) {
    const it = items[k];
    if (used.has(it)) continue;
    if (it.row) {
      // A Shogun row (columns) becomes one list item; collect all its leaves.
      const row = items.filter((x) => x.row === it.row);
      row.forEach((x) => used.add(x));
      const shown = row.filter(desk);
      const texts = shown.filter((x) => x.kind === "text");
      const imgs = shown.filter((x) => x.kind === "img");
      if (!shown.length) continue; // hidden on the source at desktop (returns: second option card)
      if (imgs.length && !texts.length) {
        const a = imgs.at(-1);
        push({ type: "image", image: img(a.src, page.title), href: a.href ? html(`href="${a.href}"`).slice(6, -1) : undefined, maxWidth: a.r[2] });
        continue;
      }
      if (imgs.length) {
        const title = texts.find((x) => x.size >= 40);
        const body = texts.filter((x) => x !== title).map((x) => `<p>${html(x.html)}</p>`).join("");
        push({ type: "iconList", variant: title ? "steps" : "bullets", items: [{ icon: img(imgs.at(-1).src), title: title ? plain(title.html) : undefined, html: body }] });
        continue;
      }
      const c0 = texts.filter((x) => x.col === 0);
      const c1 = texts.filter((x) => x.col === 1);
      if (c0.length === 1 && plain(c0[0].html).length <= 3 && c1.length) {
        push({ type: "list", ordered: true, items: [c1.map((x) => html(x.html)).join("<br>")] });
        continue;
      }
      if (c0.some((x) => x.size >= 80)) {
        const big = c0.find((x) => x.size >= 80);
        push({ type: "callout", title: plain(big.html), html: c0.filter((x) => x !== big).map((x) => `<p>${html(x.html)}</p>`).join("") });
        continue;
      }
      texts.forEach((x) => push({ type: "richText", variant: variantOf(x), html: `<p>${html(x.html)}</p>` }));
      continue;
    }
    if (it.kind === "box") {
      // A background box around a desktop <img>: the image block carries the background (about-us layout).
      const inner = items.find((x) => x.kind === "img" && !used.has(x) && (desk(x) ? desk(it) && inside(it, x) : false));
      if (inner) {
        used.add(inner);
        const mBox = items.slice(k + 1).find((x) => x.kind === "box" && x.bgi && !desk(x) && mob(x));
        const mImg = items.slice(k + 1).find((x) => x.kind === "img" && !desk(x) && mob(x));
        [mBox, mImg].forEach((x) => x && used.add(x));
        push({ type: "image", image: img(inner.src, page.title), mobile: mImg ? img(mImg.src, page.title) : undefined, background: it.bgi ? local(it.bgi) : undefined, mobileBackground: mBox ? local(mBox.bgi) : undefined, maxWidth: inner.r[2] });
      }
      continue;
    }
    if (!desk(it)) continue; // mobile-only duplicates of desktop copy (Shogun hides one per breakpoint)
    if (it.kind === "img") { push({ type: "image", image: img(it.src, page.title), maxWidth: it.r[2] }); continue; }
    if (it.size >= 40 && /Medium/.test(it.font)) { push({ type: "heading", html: plain(it.html), align: it.align === "center" ? "center" : "left" }); continue; }
    push({ type: "richText", variant: variantOf(it), html: `<p>${html(it.html)}</p>` });
  }
  return page;
}

mkdirSync(`${ROOT}src/data/pages/content`, { recursive: true });
for (const slug of SLUGS) {
  const page = build(slug);
  writeFileSync(`${ROOT}src/data/pages/content/${slug}.json`, `${JSON.stringify(page, null, 1)}\n`);
  console.log(slug, page.blocks.map((b) => b.type + (b.items ? `(${b.items.length})` : "")).join(" "));
}
writeFileSync(`${ROOT}reference/data/collection-asset-plan-_content.json`, JSON.stringify(assets, null, 1));
console.log(`${Object.keys(assets).length} assets planned`);
