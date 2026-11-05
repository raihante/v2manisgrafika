// Element-level source/local comparison: for each selector, the first match's box and key computed styles on both
// sites at each width (same normalized load as verify.mjs). Prints only the differences.
// Config: reference/verify/probe-cfg.json -> {"path":"/products/x","widths":[1440],"selectors":[".a",".b"],"out":"probe-x"}
// Run: ego-browser nodejs -e "await import('file:///C:/Digitakarya/v2manisgrafika/tests/visual/probe-pairs.mjs')"
const fs = await import("node:fs/promises");
const lib = await import(`file:///C:/Digitakarya/v2manisgrafika/tests/visual/ego-lib.mjs?v=${Date.now()}`);
const cfg = JSON.parse(await fs.readFile(`${lib.ROOT}/reference/verify/probe-cfg.json`, "utf8"));
const { source, local } = await lib.getPages();
const PROPS = ["display", "position", "width", "height", "marginTop", "marginRight", "marginBottom", "marginLeft", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "fontFamily", "fontSize", "lineHeight", "fontWeight", "letterSpacing", "textTransform", "color", "backgroundColor", "borderTopWidth", "borderTopColor", "borderRadius", "gridTemplateColumns", "gap", "transform", "opacity", "visibility", "boxShadow"];
const probe = (args) => args.selectors.map((sel) => {
  const el = document.querySelector(sel);
  if (!el) return { sel, missing: true };
  const r = el.getBoundingClientRect(), c = getComputedStyle(el);
  const st = {}; for (const p of args.props) st[p] = c[p];
  return { sel, box: [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height)], st };
});
const all = {};
for (const width of cfg.widths) {
  const res = {};
  for (const [name, page, base, isSource] of [["source", source, "https://beyondthevines.co.id", true], ["local", local, "http://localhost:3400", false]]) {
    const url = base + cfg.path + (isSource ? "" : "/");
    try { await page.goto(url, { timeout: 90000 }); await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} }); } catch (e) {}
    await lib.loadForShot(page, url, width, 900, isSource, { hideScrollbar: width > 798 });
    await page.evaluate(() => { const st = document.createElement("style"); st.textContent = "#jsc-login-register-popup,.login-register__overlay{display:none!important}"; document.head.appendChild(st); });
    res[name] = await page.evaluate(probe, { selectors: cfg.selectors, props: PROPS });
  }
  all[width] = res;
  console.log(`== ${width}`);
  cfg.selectors.forEach((sel, i) => {
    const s = res.source[i], l = res.local[i];
    if (s.missing || l.missing) { console.log(`${sel}: ${s.missing ? "MISSING in source" : ""} ${l.missing ? "MISSING in local" : ""}`); return; }
    const diffs = [];
    if (s.box.some((v, k) => Math.abs(v - l.box[k]) > 1)) diffs.push(`box ${s.box.join(",")} vs ${l.box.join(",")}`);
    for (const p of PROPS) if (s.st[p] !== l.st[p]) diffs.push(`${p}: ${s.st[p]} | ${l.st[p]}`);
    if (diffs.length) console.log(`${sel}\n   ${diffs.join("\n   ")}`);
  });
}
await fs.writeFile(`${lib.ROOT}/reference/verify/${cfg.out || "probe"}.json`, JSON.stringify(all, null, 1));
