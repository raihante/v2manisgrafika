// Read-only capture of source product data for the PDP template (run inside `ego-browser nodejs`).
// For every catalog product: /products/<handle>.js plus related and complementary recommendation JSON.
// Output: reference/data/product-details-raw.json and reference/data/products/<handle>/{page,recs-*}.html (private). Usage: see SESSION_HANDOFF.md round 254.
const fs = await import("node:fs/promises");
const lib = await import(`file:///C:/Digitakarya/v2manisgrafika/tests/visual/ego-lib.mjs?v=${Date.now()}`);
const BASE = "https://beyondthevines.co.id";
const homepage = JSON.parse(await fs.readFile(`${lib.ROOT}/src/data/homepage.json`, "utf8"));
const handles = [...new Set(homepage.collections.flatMap((c) => c.products.map((p) => p.href.split("/").filter(Boolean).pop())))];
const { source } = await lib.getPages();
if (!(await source.url()).startsWith(BASE)) await source.goto(`${BASE}/products/${handles[0]}`, { timeout: 60000 });
const pause = () => source.waitForTimeout(300);
const out = {}, failed = [];
for (const h of handles) {
  try {
    const p = await source.fetch(`${BASE}/products/${h}.js`, { timeout: 30000 });
    if (!p.ok) { failed.push([h, p.status]); continue; }
    const product = JSON.parse(p.body);
    await pause();
    const rel = await source.fetch(`${BASE}/recommendations/products.json?product_id=${product.id}&limit=12`, { timeout: 30000 });
    await pause();
    const comp = await source.fetch(`${BASE}/recommendations/products.json?product_id=${product.id}&limit=10&intent=complementary`, { timeout: 30000 });
    // Server-rendered page and the theme's recommendation section responses (URLs read from the page itself).
    const page = await source.fetch(`${BASE}/products/${h}`, { timeout: 30000 });
    const dir = `${lib.ROOT}/reference/data/products/${h}`;
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(`${dir}/page.html`, page.body);
    const urls = [...page.body.matchAll(/<product-recommendations[^>]*data-url="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, "&"));
    for (const u of urls) {
      await pause();
      const r = await source.fetch(BASE + u, { timeout: 30000 });
      await fs.writeFile(`${dir}/recs-${u.includes("intent=complementary") ? "complementary" : "related"}.html`, r.body);
    }
    out[h] = { product, related: rel.ok ? JSON.parse(rel.body).products : null, complementary: comp.ok ? JSON.parse(comp.body).products : null };
  } catch (e) { failed.push([h, String(e).slice(0, 80)]); }
}
await fs.writeFile(`${lib.ROOT}/reference/data/product-details-raw.json`, JSON.stringify({ stamp: new Date().toISOString(), state: "logged out, en, IDR", out }, null, 1));
console.log(JSON.stringify({ handles: handles.length, ok: Object.keys(out).length, failed }));
