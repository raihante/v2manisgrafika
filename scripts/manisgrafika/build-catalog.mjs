// Build the Manis Grafika catalog fixtures from the manisgrafika.id WooCommerce Store API captures.
// Inputs:  reference/manisgrafika/<date>/{store-products-p1,store-variations,assets}.json
//          (scripts/manisgrafika/download-assets.mjs must have run first: image URLs are mapped to local files)
// Outputs: src/data/product-details.json      product records in the ProductDetail-compatible raw shape
//          src/data/product-card-interactions.json   hover images + cover swatches per card title
//          src/data/homepage.json               only `collections` (homepage rails) is rewritten
// Run: node scripts/manisgrafika/build-catalog.mjs [date]   (default 2026-11-16)
//
// Product fields that WooCommerce does not hold are filled with documented defaults the CMS will own:
//   minOrder 50 (22/23 MG descriptions say "Minimal Pembelian 50pcs"; Shaaira gets the same note via CONTENT_FIXES),
//   personalisation = the "halaman redaksi" config (5 free pages, Rp 3.000 per 2 extra pages, PLACEHOLDER fields).
import { readFileSync, writeFileSync } from "node:fs";

const ROOT = new URL("../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const DATE = process.argv[2] || "2026-11-16";
const SRC = `${ROOT}reference/manisgrafika/${DATE}`;
const read = (name) => JSON.parse(readFileSync(`${SRC}/${name}`, "utf8"));
const readData = (name) => JSON.parse(readFileSync(`${ROOT}src/data/${name}`, "utf8"));

// ---- Spelling clean-up of the client copy (owner 2026-11-18 "rapikan ejaannya juga", round 275) -------------------
// WooCommerce holds "Hardcover Standart"/"Standard" and "Coklat"; KBBI forms are "standar" and "cokelat". Applied to
// attribute term names (cover option values, swatches, the Bahan Cover facet) before anything else reads them.
const fixName = (s) => s.replace(/\bStandar[dt]\b/g, "Standar").replace(/\bCoklat\b/g, "Cokelat");
const products = read("store-products-p1.json");
for (const p of products) for (const a of p.attributes) for (const t of a.terms ?? []) t.name = fixName(t.name);
const variations = new Map(read("store-variations.json").map((v) => [v.id, v]));
const assets = new Map(read("assets.json").map((a) => [a.source, a]));

const decode = (s) => s.replace(/&#8211;/g, "–").replace(/&#8217;/g, "’").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#038;/g, "&");
const formatRp = (n) => `Rp ${n.toLocaleString("id-ID")}`;
const local = (url) => {
  const a = assets.get(url);
  if (!a) throw new Error(`Image not downloaded: ${url}`);
  return a;
};
// MG slug "gamilia-series-2" is a WordPress duplicate suffix; the storefront links "gamilia-series".
const handleOf = (slug) => slug.replace(/-2$/, "");

// ---- Collections a product belongs to (menu option A, owner decision 2026-11-16) ----------------------------------
function collectionsOf(p) {
  const cats = p.categories.map((c) => c.slug);
  const out = new Set();
  if (cats.includes("hardcover-non-paket")) {
    out.add("hardcover");
    const name = decode(p.name).toLowerCase();
    out.add(name.includes("bludru") ? "hardcover-bludru" : name.includes("spoon leather") ? "hardcover-spoon-leather" : "hardcover-standar");
  }
  if (cats.includes("paket-yassin")) out.add("paket");
  if (cats.includes("paket-dompet")) out.add("dompet");
  if (cats.includes("paket-mika-kecil")) out.add("mika").add("mika-kecil");
  if (cats.includes("paket-mika-besar-paket-yassin")) out.add("mika").add("mika-besar");
  if (cats.includes("tile-tasbih")) out.add("tasbih");
  if (/-series/.test(p.slug)) out.add(handleOf(p.slug));
  return [...out];
}

// ---- Cover swatch colours (cover names -> chip colour; names without a colour use the variation photo) ------------
const COVER_COLOURS = [
  [/biru dongker|navy/i, "#1f2a44"], [/biru/i, "#2f5d9b"], [/broken white|putih|white/i, "#f3efe6"], [/black|hitam/i, "#1a1a1a"],
  [/brown|cokelat/i, "#6b4430"], [/caramel/i, "#b07a3f"], [/cream/i, "#e9dcc2"], [/gold/i, "#c9a54a"], [/maroon/i, "#6e1f2b"],
  [/merah/i, "#b3262e"], [/tosca/i, "#3a9b97"], [/emerald/i, "#1e6b52"], [/hijau|green/i, "#2f6b3a"], [/lilac/i, "#b9a2c8"],
  [/pink/i, "#e8a0b4"], [/purple|ungu/i, "#5e3b7a"], [/grey/i, "#9a9a9a"],
];
const coverColour = (value) => COVER_COLOURS.find(([re]) => re.test(value))?.[1] ?? "";
const MATERIALS = ["Spoon Leather", "Bludru", "Hardcover Standar"];
const materialOf = (value) => MATERIALS.find((m) => value.startsWith(m)) ?? null;

// ---- Personalisation default (PLACEHOLDER until the CMS defines it per product) ------------------------------------
const PERSONALISATION = {
  freePages: 5,
  extraPagePrice: 3000,
  extraPageUnit: 2,
  fields: [
    { key: "foto", label: "Foto halaman redaksi", type: "photo", required: false, maxLength: null, help: "Maksimal 1 foto, mengisi 1 dari 5 halaman gratis." },
    { key: "redaksi", label: "Teks halaman redaksi", type: "textarea", required: true, maxLength: 2000, help: "Mengisi 4 halaman gratis; teks yang lebih panjang menambah halaman." },
    { key: "catatan", label: "Catatan untuk desainer", type: "textarea", required: false, maxLength: 500, help: null },
  ],
};

const imageOf = (url, alt) => {
  const a = local(url);
  const ratio = (a.height / a.width) * 100;
  return { src: a.local, srcset: `${a.local} ${a.width}w`, sizes: "(max-width: 1067px) 95vw, 45vw", thumb: a.local, alt, ratio };
};

// Tab panels as short bullet lists (round 273/274 PDP tidy-up, owner 2026-11-18 "deskripsi juga tidak rapi").
const TAB_SHIPPING = "<ul><li>Semua pesanan diproses dan dikirim dari workshop Manis Grafika di Surakarta, Jawa Tengah.</li><li>Pengerjaan sekitar 6–8 hari kerja setelah desain disetujui. Untuk percepatan, silakan hubungi admin Manis Grafika.</li><li>Harga belum termasuk ongkos kirim. Rincian di <a href=\"/pages/kebijakan-pengiriman\">Kebijakan Pengiriman</a>.</li></ul>";
const tabRedaksi = (p) => `<ul><li>Setiap pesanan mendapat ${p.freePages} halaman redaksi gratis (1 foto dan 4 halaman teks).</li><li>Tambahan halaman redaksi dikenakan biaya Rp ${p.extraPagePrice.toLocaleString("id-ID")} per ${p.extraPageUnit} halaman.</li><li>Desain redaksi dikirim untuk disetujui sebelum produksi dimulai.</li></ul>`;

// The WooCommerce descriptions all follow one loose pattern: optional intro paragraph, "Spesifikasi" paragraph, the
// spec lines in one <br>-separated paragraph, "Includes: a, b dan c", "Notes:" with "–"-prefixed lines (italic).
// Rebuild that as intro + <h3>/<ul> sections; English headings become Indonesian (Includes -> Isi Paket, Notes ->
// Catatan). The client's wording is kept apart from the spelling fixes in SPELLING (round 275). Unrecognised paragraphs
// pass through with only those fixes.
const SPELLING = [
  // Spec lines.
  [/\bHvs\b/g, "HVS"], [/(\d)gr\b/g, "$1 gr"], [/\bFinishing Artpaper\b/g, "Finishing"], [/\bFinishing\b/g, "finishing"],
  [/\bBlock Lem\b/g, "blok lem"], [/\bJahit kawat\/Straples\b/g, "jahit kawat/staples"], [/\bJahit Benang\b/g, "jahit benang"],
  [/Frame Warna Coklat Emas hasil cetakan Premium/g, "Frame warna cokelat emas hasil cetakan premium"],
  [/Gratis (\d+) Halaman Redaksi \(1 foto dan 4 Halaman Redaksi\)/g, "Gratis $1 halaman redaksi (1 foto dan 4 halaman teks)"],
  // Notes.
  [/Minimal Pembelian (\d+)pcs/g, "Minimal pembelian $1 pcs"], [/Harga Belum termasuk Ongkos Kirim/g, "Harga belum termasuk ongkos kirim"],
  [/Motif dan Warna Sajadah Random/g, "Motif dan warna sajadah acak"],
  // Intros: "Yassin" -> "Yasin", stray capitals mid-sentence, typos ("Tike", "Gamila"), a missing verb (Noura).
  [/\bYassin\b/g, "Yasin"], [/ Menghadirkan\b/g, " menghadirkan"], [/\bTike Eksklusif\b/g, "tile eksklusif"],
  [/\bMika Eksklusif\b/g, "mika eksklusif"], [/\bStandar[dt]\b/g, "Standar"], [/\bGamila Series\b/g, "Gamilia Series"],
  [/dengan Tile menawan/g, "dengan tile yang menawan"], [/Hardcover Series sentuhan/g, "Hardcover Series menghadirkan sentuhan"],
  [/\b([Cc]over) spoon leather\b/g, "$1 Spoon Leather"], [/(\S )Buku Yasin\b/g, "$1buku Yasin"],
  [/Sajadah Rajut Premium dan Tasbih Mutiara/g, "sajadah rajut premium dan tasbih mutiara"],
];
const spell = (text) => SPELLING.reduce((t, [re, to]) => t.replace(re, to), text);
// Package items: "Sticker Mika" -> "Stiker mika", "Sajadah Rajut" -> "Sajadah rajut" (sentence case like the other lists).
const item = (s) => s.replace(/^Sticker\b/, "Stiker").replace(/ (\S+)/g, (_, w) => ` ${w.toLowerCase()}`);
const plain = (html) => spell(html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&#8211;/g, "–").replace(/&nbsp;/g, " ").replace(/[ \t ]+/g, " ").trim());
const list = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
// Content fixes per product (owner 2026-11-19 "perbaiki"): Zyla and Shaaira are Dompet packages (Isi Paket: Dompet +
// Tasbih) but their WooCommerce intros say "dikemas dengan mika"; Shaaira's also says "Yasin Spoon Bludru" while its
// covers are Broken White / Grey, and it lacks the Catatan every other product has.
const DOMPET_INTRO = (name) => `Dikemas dengan dompet eksklusif yang menawan, koleksi Yasin ${name} menghadirkan`;
const CONTENT_FIXES = {
  "zyla-series": { intro: [/^Dikemas dengan mika eksklusif yang menawan, koleksi Yasin Zyla Series menghadirkan/, DOMPET_INTRO("Zyla Series")] },
  "shaaira-series": {
    intro: [/^Dikemas dengan mika eksklusif yang menawan, koleksi Yasin Spoon Bludru menghadirkan/, DOMPET_INTRO("Shaaira Series")],
    notes: ["Minimal pembelian 50 pcs.", "Harga belum termasuk ongkos kirim."],
  },
};
function fixContent(handle, html) {
  const fix = CONTENT_FIXES[handle];
  if (!fix) return html;
  let out = html;
  if (fix.intro) {
    const [re, to] = fix.intro;
    const next = out.replace(new RegExp(`<p>${re.source.slice(1)}`), `<p>${to}`);
    if (next === out) throw new Error(`Intro fix for ${handle} no longer matches the client copy`);
    out = next;
  }
  if (fix.notes && !out.includes("<h3>Catatan</h3>")) out += `<h3>Catatan</h3>${list(fix.notes)}`;
  return out;
}
function tidyDescription(html) {
  const paras = [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => m[1]);
  const out = [];
  for (let i = 0; i < paras.length; i++) {
    const text = plain(paras[i]);
    if (!text) continue;
    if (/^spesifikasi$/i.test(text) && paras[i + 1] !== undefined) {
      out.push("<h3>Spesifikasi</h3>", list(plain(paras[++i]).split("\n").map((s) => s.trim()).filter(Boolean)));
    } else if (/^includes:/i.test(text)) {
      const items = text.replace(/^includes:\s*/i, "").replace(/\.$/, "").split(/\s*,\s*|\s+dan\s+/).map((s) => item(s.replace(/^dan\s+/, "").trim())).filter(Boolean);
      out.push("<h3>Isi Paket</h3>", list(items));
    } else if (/^notes:/i.test(text)) {
      const items = text.replace(/^notes:\s*/i, "").split("\n").map((s) => s.replace(/^[–-]\s*/, "").trim()).filter(Boolean);
      out.push("<h3>Catatan</h3>", list(items));
    } else {
      out.push(`<p>${text.replace(/\n/g, "<br />").replace(/([^.!?])$/, "$1.")}</p>`);
    }
  }
  return out.join("");
}

const sorted = [...products].sort((a, b) => b.id - a.id); // newest first ("Terbaru")
const details = {};
const interactions = {};
const cards = {};

for (const p of sorted) {
  const handle = handleOf(p.slug);
  const title = decode(p.name);
  const attrs = p.attributes.filter((a) => a.has_variations);
  // Option order on the storefront: cover first (swatches), then paper type, then page count.
  const order = ["Variant", "Jenis Kertas", "Jumlah Halaman"].map((n) => attrs.find((a) => a.name === n)).filter(Boolean);
  const optionName = (a) => (a.name === "Variant" ? "Cover" : a.name);
  const termName = (a, slug) => a.terms.find((t) => t.slug === slug)?.name ?? slug;

  const vars = p.variations.map((ref) => {
    const v = variations.get(ref.id);
    if (!v) throw new Error(`Missing variation ${ref.id} of ${p.slug}`);
    const values = order.map((a) => termName(a, ref.attributes.find((x) => x.name === a.name).value));
    const price = Number(v.prices.price);
    const regular = Number(v.prices.regular_price);
    // 8 Zayna variations (HVS 484) have no price and is_purchasable=false on MG: kept, but unavailable.
    const buyable = price > 0 && v.is_purchasable !== false && v.is_in_stock;
    return { ref, v, values, price, compareAt: regular > price ? regular : null, buyable };
  });

  // Values in term order, restricted to values a variation uses.
  const options = order.map((a, i) => {
    const used = new Set(vars.map((x) => x.values[i]));
    const values = a.terms.map((t) => t.name).filter((n) => used.has(n));
    const isCover = a.name === "Variant";
    const groupsBy = isCover ? [...new Set(values.map(materialOf))] : [];
    return {
      name: optionName(a),
      handle: optionName(a).toLowerCase().replace(/\s+/g, "-"),
      values,
      ids: values.map((n) => a.terms.find((t) => t.name === n).id),
      colors: values.map((n) => (isCover ? coverColour(n) : "")),
      groups: isCover && groupsBy.length > 1 && !groupsBy.includes(null)
        ? groupsBy.map((g) => ({ name: g, values: values.filter((n) => materialOf(n) === g) }))
        : null,
    };
  });

  // Gallery per cover value: that cover's variation photos first, then the product photos.
  const productImages = p.images.map((i) => i.src);
  const coverValues = options[0].values;
  const galleries = coverValues.map((cover) => {
    const own = [...new Set(vars.filter((x) => x.values[0] === cover).flatMap((x) => x.v.images.map((i) => i.src)))];
    const urls = [...new Set([...own, ...productImages])];
    return { colour: cover, images: urls.map((u) => imageOf(u, `${title} - ${cover}`)) };
  });
  const swatches = Object.fromEntries(galleries.map((g) => [g.colour, coverColour(g.colour) ? "" : g.images[0].src]).filter(([, img]) => img));

  const priced = vars.filter((x) => x.buyable);
  const cheapest = priced.reduce((m, x) => (x.price < m.price ? x : m), priced[0]);
  const initial = cheapest.values;
  const price = cheapest.price;

  details[handle] = {
    handle,
    title,
    priceText: formatRp(price),
    options,
    initial,
    variants: vars.map((x) => ({
      id: x.v.id,
      options: x.values,
      available: x.buyable,
      sku: x.v.sku || `MG-${x.v.id}`,
      labels: [],
      price: x.price,
      compareAtPrice: x.compareAt,
    })),
    galleries,
    swatches,
    slideCount: galleries[0].images.length,
    tabs: [
      { key: "deskripsi", title: "Deskripsi", panelHtml: fixContent(handle, tidyDescription(p.description.trim())) },
      { key: "redaksi", title: "Halaman Redaksi", panelHtml: tabRedaksi(PERSONALISATION) },
      { key: "pengiriman", title: "Pengiriman", panelHtml: TAB_SHIPPING },
    ],
    pairItWith: [],
    related: [],
    multicolumn: null,
    template: "standard",
    minOrder: 50,
    personalisation: PERSONALISATION,
    collections: collectionsOf(p),
    sourceUrl: p.permalink,
  };

  const coverImage = (cover) => galleries.find((g) => g.colour === cover).images[0];
  const firstCover = initial[0];
  const extra = coverValues.length - 1;
  cards[handle] = {
    title,
    href: `/products/${handle}`,
    imageHref: `/products/${handle}?variant=${cheapest.v.id}`,
    ratio: coverImage(firstCover).ratio,
    handle,
    variantId: cheapest.v.id,
    price: formatRp(price),
    compareAtPrice: cheapest.compareAt ? formatRp(cheapest.compareAt) : null,
    priceFirst: false,
    primary: coverImage(firstCover).src,
    primaryClass: `product-primary-image${productImages.length > 1 ? "" : " no-secondary-image"}`,
    secondary: galleries[0].images.slice(1, 3).map((i) => i.src),
    swatches: coverValues.map((cover) => ({
      value: cover,
      image: coverColour(cover) ? "" : coverImage(cover).src,
      color: coverColour(cover),
      active: cover === firstCover,
      soldOut: !vars.some((x) => x.values[0] === cover && x.buyable),
      href: `/products/${handle}?variant=${vars.find((x) => x.values[0] === cover).v.id}`,
    })),
    swatchSelected: `${firstCover} `,
    swatchSuffix: extra > 0 ? `+ ${extra} Cover` : "",
    overlayLabels: [],
    labels: [],
    // "options": the card button opens the product page (labelled "Pilih Opsi") because the customer must choose
    // option values or fill required personalisation; "add" would add directly (none today: every product has a
    // required "halaman redaksi" field). Same rule as needsOptions in src/lib/catalog/fixture.ts.
    button: options.some((o) => o.values.length > 1) || details[handle].personalisation?.fields.some((f) => f.required) ? "options" : "add",
  };
  interactions[title] = {
    secondaryImages: galleries[0].images.slice(1, 3).map((i) => i.src),
    variants: coverValues.map((cover) => ({ label: cover, image: coverImage(cover).src, thumbnail: coverColour(cover) ? null : coverImage(cover).src, soldOut: cards[handle].swatches.find((s) => s.value === cover).soldOut })),
  };
}

// Pair It With: other products from the same most specific collection; You May Also Like: newest products elsewhere.
const handles = Object.keys(details);
for (const h of handles) {
  const d = details[h];
  const key = d.collections.find((c) => !["hardcover", "paket", "mika"].includes(c) && !c.endsWith("-series")) ?? d.collections[0];
  d.pairItWith = handles.filter((o) => o !== h && details[o].collections.includes(key)).slice(0, 3).map((o) => cards[o]);
  d.related = handles.filter((o) => o !== h && !details[o].collections.includes(key)).slice(0, 6).map((o) => cards[o]);
}

// Homepage rails (RawCard shape the homepage component renders).
const railCard = (h) => {
  const c = cards[h];
  return {
    title: c.title, href: c.href, price: c.price, compareAtPrice: c.compareAtPrice, image: c.primary,
    sourceImage: details[h].sourceUrl, swatchSelected: c.swatchSelected, swatchSuffix: c.swatchSuffix,
    labels: [], overlayLabels: [], button: c.button,
  };
};
const inCollection = (c) => handles.filter((h) => details[h].collections.includes(c));
const homepage = readData("homepage.json");
homepage.collections = [
  { title: "Terbaru", shopMore: "/collections/new-in", headerBackground: "#2b5865", products: handles.slice(0, 12).map(railCard) },
  { title: "Hardcover", shopMore: "/collections/hardcover", headerBackground: "#cc3366", products: inCollection("hardcover").map(railCard) },
  { title: "Paket Hadiah", shopMore: "/collections/paket", headerBackground: "#2b5865", products: inCollection("paket").map(railCard) },
];
homepage.collectionsCapturedAt = `manisgrafika.id Store API ${DATE}`;

// ---- Collections (one source collection template for every menu category and series) ----------------------------
// Keeps the BTV template markup values (section id, grid/pagination classes, 8 products per load-more page); views are
// computed here from the products instead of replayed from source captures. One card per product (key = cheapest
// variant), Featured = newest first.
const SERIES = handles.filter((h) => h.endsWith("-series"));
const COLLECTIONS = [
  ["new-in", "Terbaru", handles],
  ["hardcover", "Hardcover", inCollection("hardcover")],
  ["hardcover-standar", "Hardcover Standar", inCollection("hardcover-standar")],
  ["hardcover-bludru", "Hardcover Bludru", inCollection("hardcover-bludru")],
  ["hardcover-spoon-leather", "Hardcover Spoon Leather", inCollection("hardcover-spoon-leather")],
  ["paket", "Paket Hadiah", inCollection("paket")],
  ["dompet", "Paket Dompet", inCollection("dompet")],
  ["mika", "Paket Mika", inCollection("mika")],
  ["mika-kecil", "Paket Mika Kecil", inCollection("mika-kecil")],
  ["mika-besar", "Paket Mika Besar", inCollection("mika-besar")],
  ["tasbih", "Paket Tile Tasbih", inCollection("tasbih")],
  ...SERIES.map((h) => [h, details[h].title, [h]]),
];
const SORTS = [
  ["manual", "Unggulan"], ["best-selling", "Terlaris"], ["title-ascending", "Nama, A-Z"], ["title-descending", "Nama, Z-A"],
  ["price-ascending", "Harga, rendah ke tinggi"], ["price-descending", "Harga, tinggi ke rendah"],
  ["created-ascending", "Tanggal, lama ke baru"], ["created-descending", "Tanggal, baru ke lama"],
].map(([value, label]) => ({ value, label }));
const PER_PAGE = 8;
const keyOf = (h) => `variant:${cards[h].variantId}`;
const minPrice = (h) => Number(details[h].priceText.replace(/\D/g, ""));
const sorters = {
  "best-selling": (a, b) => handles.indexOf(a) - handles.indexOf(b),
  "title-ascending": (a, b) => details[a].title.localeCompare(details[b].title, "id"),
  "title-descending": (a, b) => details[b].title.localeCompare(details[a].title, "id"),
  "price-ascending": (a, b) => minPrice(a) - minPrice(b),
  "price-descending": (a, b) => minPrice(b) - minPrice(a),
  "created-ascending": (a, b) => handles.indexOf(b) - handles.indexOf(a),
  "created-descending": (a, b) => handles.indexOf(a) - handles.indexOf(b),
};
const view = (list) => {
  const pages = [];
  list.forEach((h, i) => (pages[Math.floor(i / PER_PAGE)] ??= []).push(keyOf(h)));
  return { countText: `${list.length} produk`, pages: pages.length ? pages : [[]] };
};
const material = (h) => [...new Set(details[h].options[0].values.map((v) => materialOf(v) ?? (details[h].collections.includes("hardcover-bludru") ? "Bludru" : details[h].collections.includes("hardcover-spoon-leather") ? "Spoon Leather" : "Hardcover Standar")))];
const valuesOf = (h, name) => details[h].options.find((o) => o.name === name)?.values ?? [];
const FACETS = [
  { title: "Bahan Cover", slug: "bahan-cover", values: material },
  { title: "Jenis Kertas", slug: "jenis-kertas", values: (h) => valuesOf(h, "Jenis Kertas") },
  { title: "Jumlah Halaman", slug: "jumlah-halaman", values: (h) => valuesOf(h, "Jumlah Halaman"), order: (a, b) => Number(a) - Number(b) },
];

const collectionData = {};
for (const [handle, title, members] of COLLECTIONS) {
  const featured = members; // handles are already newest first
  const views = { "": view(featured) };
  for (const s of SORTS) if (s.value !== "manual") views[`sort_by=${s.value}`] = view([...featured].sort(sorters[s.value]));
  const facets = [];
  for (const f of FACETS) {
    const all = [...new Set(featured.flatMap(f.values))].sort(f.order ?? ((a, b) => a.localeCompare(b, "id")));
    if (all.length < 2) continue;
    const name = `filter.v.option.${f.slug}`;
    facets.push({
      index: facets.length + 1, title: f.title, open: true, kind: "list", name, listClass: `list-${f.slug}`,
      values: all.map((value, i) => {
        const hits = featured.filter((h) => f.values(h).includes(value));
        views[`${name}=${value}`] = view(hits);
        return { value, id: `Filter-Mobile-${f.slug}-${i + 1}`, label: value, count: `(${hits.length})`, tooltip: `${value} (${hits.length})`, labelClass: "jsc-color-filter facet-checkbox", bg: "var(--bg-body)", image: null };
      }),
    });
  }
  const available = featured.filter((h) => details[h].variants.some((v) => v.available));
  views["filter.v.availability=1"] = view(available);
  facets.push({ index: facets.length + 1, title: "Ketersediaan", open: true, kind: "availability", name: "filter.v.availability", listClass: null, values: [{ value: "1", id: `Filter-Mobile-availability-${facets.length + 1}`, inputClass: "availability-checkbox thb-filter-switch custom-checkbox", label: "Tersedia", count: null, tooltip: null, bg: null, image: null }] });
  collectionData[handle] = {
    handle, title, documentTitle: `${title} – Manis Grafika`,
    sectionId: "template--22799925281047__product-grid",
    gridClass: "products collection row small-up-2 medium-up-4 pagination--loadmore",
    promoInterval: 5, promoRepeat: false,
    breadcrumb: [{ href: "/", title: "Beranda", label: "Beranda" }, { href: "/collections", title: "Koleksi", label: "Koleksi" }, { href: `/collections/${handle}`, title, label: title }],
    sort: { bar: SORTS, barList: SORTS, mobile: SORTS, initial: "manual" },
    facets, promos: [],
    pagination: { className: "pagination pagination-type--loadmore", perPage: PER_PAGE, totalPages: Math.max(1, Math.ceil(featured.length / PER_PAGE)) },
    cards: Object.fromEntries(featured.map((h) => [keyOf(h), cards[h]])),
    views,
  };
}

// /collections list page: one card per menu category, image = first product photo of the category.
const listBase = readData("collection-list.json");
const usedListImages = new Set();
const LIST = [["new-in", "Terbaru"], ["hardcover", "Hardcover"], ["dompet", "Dompet"], ["mika", "Mika"], ["tasbih", "Tasbih"]];
const collectionList = {
  ...listBase,
  documentTitle: "Koleksi – Manis Grafika",
  heading: "BELANJA BERDASARKAN KATEGORI",
  cards: LIST.map(([handle, label]) => {
    // First product photo of the category not already used by an earlier card (Terbaru and Hardcover share products).
    const keys = collectionData[handle].views[""].pages.flat();
    const card = keys.map((k) => collectionData[handle].cards[k]).find((c) => !usedListImages.has(c.primary)) ?? collectionData[handle].cards[keys[0]];
    usedListImages.add(card.primary);
    const a = [...assets.values()].find((x) => x.local === card.primary);
    return {
      cardClass: "collection-card style1", imageClass: "collection-card__image media-aspect-adapt",
      ratio: (a.height / a.width) * 100, href: `/collections/${handle}`, title: label, width: a.width, height: a.height,
      placeholder: a.local, srcset: [{ src: a.local, w: a.width }], alt: label, original: a.source, label,
    };
  }),
};

const json = (v) => `${JSON.stringify(v, null, 1)}
`;
writeFileSync(`${ROOT}src/data/product-details.json`, json(details));
writeFileSync(`${ROOT}src/data/product-card-interactions.json`, json(interactions));
writeFileSync(`${ROOT}src/data/homepage.json`, json(homepage));
writeFileSync(`${ROOT}src/data/collections/collections.json`, json(collectionData));
writeFileSync(`${ROOT}src/data/collection-list.json`, json(collectionList));
console.log(`collections: ${Object.entries(collectionData).map(([h, d]) => `${h}(${Object.keys(d.cards).length})`).join(" ")}`);
console.log(`${handles.length} products, ${handles.reduce((s, h) => s + details[h].variants.length, 0)} variants`);
console.log(handles.map((h) => `${h}: ${details[h].priceText} [${details[h].collections.join(", ")}] ${details[h].galleries.length} covers`).join("\n"));
