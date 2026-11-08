// Build the /blogs portal + article fixtures (owner decisions 2026-11-06, /blogs grilling; AGENTS.md "Final build scope").
// Run with plain `node scripts/build-blog-data.mjs` AFTER the other data builders (it rewrites their blog hrefs):
//   node scripts/fetch-blogs.mjs && node scripts/fetch-blog-articles.mjs     (read-only GETs, reference/data/blogs/)
//   node scripts/build-blog-data.mjs && node scripts/download-collection-assets.mjs _blogs && node scripts/build-blog-data.mjs
// Output:
//   src/data/blogs/blogs.json       categories + article metadata (typed by src/lib/blogs/types.ts)
//   src/data/blogs/bodies.json      content blocks of the ONE reference article + the shared placeholder body
//   reference/data/collection-asset-plan-_blogs.json   heroes of every article + reference-article images
//   src/data/**/*.json              source blog hrefs rewritten to the local URL scheme (idempotent)
// OWN DESIGN, NOT SOURCE-FAITHFUL. "1 template artikel saja ... jangan banyak clone": only the reference article keeps
// its real body; media-stories descriptions and bodies (third-party press text) are never stored.
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const REF = `${ROOT}reference/data/blogs`;
const ASSET_DIR = "/assets/source/blogs";
const REFERENCE_SLUG = "a-little-love-for-your-carryall";
const { articles: raw } = JSON.parse(readFileSync(`${REF}/articles-meta.json`, "utf8"));
const promoDates = JSON.parse(readFileSync(`${REF}/promotions-dates.json`, "utf8")).published;

// Category display names from the source index <title>s (2026-11-06); descriptions from the index meta description
// where the source has one (the CMS field "category description").
const CATEGORIES = [
  { handle: "btv-city-guide", title: "BTV City Guide" },
  { handle: "collaborations", title: "Collaborations" },
  { handle: "events", title: "Events" },
  { handle: "media-stories", title: "Media Stories", description: "Explore media coverage of all things Beyond The Vines here." },
  { handle: "news", title: "News" },
  { handle: "promotions", title: "Promotions", description: "Learn more about our latest promotions, exclusive offers, free shipping and more!" },
  { handle: "travelling-btv-express", title: "Travelling BTV Express" },
];
// Generic source slugs get the blog prefix (owner decision Q4; `main-new` added as the same kind of generic slug).
const GENERIC = new Set(["01", "02", "03", "sia", "main-new"]);
export const localSlug = (blog, slug) => (GENERIC.has(slug) ? `${blog}-${slug}` : slug);

const assets = {};
const sizes = existsSync(`${ROOT}reference/data/collection-assets-_blogs.json`)
  ? Object.fromEntries(JSON.parse(readFileSync(`${ROOT}reference/data/collection-assets-_blogs.json`, "utf8")).map((a) => [a.local, [a.width, a.height]]))
  : {};
const image = (local, url, alt) => {
  assets[local] = url;
  const [width, height] = sizes[local] || [null, null];
  return { src: local, alt, width, height };
};
// Heroes are requested at 1200w from the Shopify CDN (own-design card/hero size; originals are up to 2000x3000).
const hero = (url, alt) => {
  const clean = url.split("?")[0];
  const name = decodeURIComponent(clean.split("/").pop());
  return image(`${ASSET_DIR}/${name}`, `${clean}?width=1200`, alt);
};
const isoFromCard = (d) => { const [dd, mm, yyyy] = d.split("."); return `${yyyy}-${mm}-${dd}`; };
const display = (iso) => iso.slice(0, 10).split("-").reverse().join("."); // source card format dd.mm.yyyy
const cleanTitle = (t) => t.replace(/\s*[–-]\s*Beyond The Vines Indonesia$/, "").replace(/&ndash;/g, "–").trim();

const articles = raw.map((a) => {
  const date = a.cardDate ? isoFromCard(a.cardDate) : promoDates[a.sourceSlug].slice(0, 10);
  const title = a.cardTitle ?? cleanTitle(a.ogTitle ?? a.title).replace(/^Promotions \| /, "");
  return {
    slug: localSlug(a.blog, a.sourceSlug),
    category: a.blog,
    title,
    documentTitle: cleanTitle(a.title),
    date,
    dateLabel: display(date),
    description: a.description ? a.description.replace(/\s+/g, " ").trim() : null,
    hero: a.image ? hero(a.image, title) : null,
    source: a.blog === "media-stories" && a.externalLink ? { url: a.externalLink, publication: new URL(a.externalLink).hostname.replace(/^www\./, "") } : null,
    hasBody: a.sourceSlug === REFERENCE_SLUG,
    sourceUrl: `https://beyondthevines.co.id/blogs/${a.blog}/${a.sourceSlug}`,
  };
});
// Newest first; same-day articles keep the source index order.
articles.sort((x, y) => (x.date === y.date ? 0 : x.date < y.date ? 1 : -1));
const slugs = new Set();
for (const a of articles) { if (slugs.has(a.slug)) throw new Error(`duplicate slug ${a.slug}`); slugs.add(a.slug); }
for (const c of CATEGORIES) if (slugs.has(c.handle)) throw new Error(`article slug equals category ${c.handle}`);

// ---- Reference article body (server HTML of the Shogun article; desktop copy of the duplicated desktop/mobile text) ----
const html = readFileSync(`${REF}/article-${REFERENCE_SLUG}.html`, "utf8");
const root = html.slice(html.indexOf('class="shogun-root'), html.indexOf("</article", html.indexOf('class="shogun-root')));
const text = (s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const paras = [...root.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => text(m[1]));
const lists = [...root.matchAll(/<ul[^>]*>([\s\S]*?)<\/ul>/g)].map((m) => [...m[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((li) => text(li[1])));
const shg = (id) => `https://i.shgcdn.com/${id}/-/format/auto/-/quality/normal/`;
const firstImg = root.match(/<img[^>]*src="https:\/\/i\.shgcdn\.com\/([0-9a-f-]+)\//)[1];
const button = root.match(/<a[^>]*href="https?:\/\/(?:www\.)?beyondthevines\.co\.id(\/products\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/);
// paras: [eyebrow (desktop), eyebrow (mobile), lead, p, p, p, "Terms & Conditions:", ...mobile duplicates]
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const referenceBody = [
  { type: "richText", variant: "lead", html: `<p>${esc(paras[0])}</p>` },
  { type: "image", image: image(`${ASSET_DIR}/${firstImg}.webp`, shg(firstImg), paras[2]) },
  { type: "heading", html: paras[2], align: "left" },
  { type: "richText", variant: "body", html: paras.slice(3, 6).map((p) => `<p>${esc(p)}</p>`).join("") },
  { type: "richText", variant: "body", html: `<p><strong>${esc(paras[6])}</strong></p>` },
  { type: "list", ordered: false, items: lists[0].map(esc) },
  { type: "button", label: text(button[2]), href: button[1] },
];
// One shared placeholder body for every other article (MOCK until the CMS supplies the content; original text).
const placeholderImage = { src: "https://dummyimage.com/1200x800/f2f2f2/8c8c8c.png&text=Article+image", alt: "", width: 1200, height: 800 };
const P = "This is placeholder text for the article body. The full story will be supplied by the CMS; until then every article shares this layout so the template can be reviewed with realistic spacing and line lengths.";
const placeholderBody = [
  { type: "richText", variant: "lead", html: `<p>Placeholder introduction. This article's content is not part of the local snapshot.</p>` },
  { type: "richText", variant: "body", html: `<p>${P}</p><p>${P}</p>` },
  { type: "image", image: placeholderImage },
  { type: "heading", html: "Placeholder section title", align: "left" },
  { type: "richText", variant: "body", html: `<p>${P}</p><p>${P}</p>` },
];

mkdirSync(`${ROOT}src/data/blogs`, { recursive: true });
writeFileSync(`${ROOT}src/data/blogs/blogs.json`, `${JSON.stringify({ snapshot: "2026-11-06", categories: CATEGORIES, articles }, null, 1)}\n`);
writeFileSync(`${ROOT}src/data/blogs/bodies.json`, `${JSON.stringify({ [REFERENCE_SLUG]: referenceBody, placeholder: placeholderBody }, null, 1)}\n`);
writeFileSync(`${ROOT}reference/data/collection-asset-plan-_blogs.json`, JSON.stringify(assets, null, 1));

// ---- Rewrite source blog hrefs in every fixture (no redirects; source-format URLs 404 locally) ----
const bySource = new Map(raw.map((a) => [`${a.blog}/${a.sourceSlug}`, localSlug(a.blog, a.sourceSlug)]));
const handles = CATEGORIES.map((c) => c.handle).join("|");
const re = new RegExp(`(?:https?:\\/\\/(?:www\\.)?beyondthevines\\.co\\.id)?\\/blogs\\/(${handles})(?:\\/([a-z0-9-]+))?(?=["'?#\\s<\\\\]|$)`, "g");
const rewrite = (s) =>
  s.replace(re, (all, blog, slug) => {
    if (!slug || slug === "main") return `/blogs?category=${blog}`;
    const local = bySource.get(`${blog}/${slug}`);
    if (!local) throw new Error(`unknown article href ${all}`);
    return `/blogs/${local}`;
  });
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(`${dir}/${f}`).isDirectory() ? walk(`${dir}/${f}`) : f.endsWith(".json") ? [`${dir}/${f}`] : []));
let changed = 0;
for (const file of walk(`${ROOT}src/data`)) {
  if (file.includes("/src/data/blogs/")) continue;
  const before = readFileSync(file, "utf8");
  const after = rewrite(before);
  if (after !== before) { writeFileSync(file, after); changed++; console.log("rewrote blog hrefs in", file.slice(ROOT.length)); }
}
console.log(`${articles.length} articles, ${Object.keys(assets).length} assets planned, ${changed} fixtures rewritten`);
