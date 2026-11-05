// PDP interaction smoke on the LOCAL clone only (Add To Bag is never clicked on the source).
// Run: ego-browser nodejs -e "await import('file:///C:/Digitakarya/v2manisgrafika/tests/visual/pdp-interactions.mjs')"
// Expected source behaviour (captured 2026-11-06): colour change keeps the chosen size, URL gains ?variant=<id>.
const fs = await import("node:fs/promises");
const lib = await import(`file:///C:/Digitakarya/v2manisgrafika/tests/visual/ego-lib.mjs?v=${Date.now()}`);
const URL_ = "http://localhost:3400/products/womens-classic-long-sleeve-shirt/";
const { local } = await lib.getPages();
await local.cdp("egoAutomated.disable").catch(() => {});
await local.cdp("Runtime.enable");
await lib.setViewport(local, 1920, 900);
await local.goto(URL_, { timeout: 60000 });
await local.evaluate(() => { localStorage.clear(); sessionStorage.setItem("btv-backstage-dismissed", "1"); });
await local.goto(URL_, { timeout: 60000 });
await local.waitForTimeout(1500);
await local.events();
await local.evaluate(() => { const st = document.createElement("style"); st.textContent = "#jsc-login-register-popup,.login-register__overlay{display:none!important}"; document.head.appendChild(st); });
const state = () => local.evaluate(() => ({
  labels: [...document.querySelectorAll(".pdp-opt-label")].map((e) => e.textContent.trim()),
  url: location.search,
  img: document.querySelector(".pdp-stage>img")?.getAttribute("src")?.split("/").pop(),
  atc: document.querySelector(".pdp-atc")?.textContent,
  pills: [...document.querySelectorAll(".pdp-info>.pdp-pill")].map((e) => e.textContent),
  tab: document.querySelector(".pdp-tab-body")?.textContent.trim().replace(/\s+/g, " ").slice(0, 120),
  sku: document.querySelector(".pdp-sku")?.textContent,
  drawer: !!document.querySelector("#Cart-Drawer.active, .side-panel.active"),
  cartCount: document.querySelector(".thb-secondary-cart")?.getAttribute("aria-label"),
}));
const checks = [];
const expect = (name, ok, got) => checks.push({ name, ok: !!ok, got });
let s = await state();
expect("initial Maroon / S", s.labels[0] === "Maroon Checkered" && s.labels[1] === "Size: S", s);
await local.click("button[aria-label='Dark Chambray']"); await local.waitForTimeout(400); s = await state();
expect("colour keeps size S, image + URL update", s.labels[0] === "Dark Chambray" && s.labels[1] === "Size: S" && /CHAMBRAY/.test(s.img) && s.url === "?variant=62276396843378", s);
await local.click(".pdp-sizes button:nth-child(4)"); await local.waitForTimeout(400); s = await state();
expect("size L, URL + SKU update", s.labels[1] === "Size: L" && s.url === "?variant=62276396908914" && /DKCY-26-L$/.test(s.sku ?? ""), s);
await local.click("text=\"Care Guide\""); await local.waitForTimeout(300); s = await state();
expect("Care Guide tab content", /Machine wash cold/.test(s.tab ?? ""), s);
await local.click("text=\"Product Measurements\""); await local.waitForTimeout(300); s = await state();
const cmText = s.tab;
await local.click(".pdp-unit"); await local.waitForTimeout(300); s = await state();
expect("CM/IN switch changes content", /1\.5cm/.test(cmText ?? "") && s.tab !== cmText, { cmText, inText: s.tab });
await local.click(".pdp-atc"); await local.waitForTimeout(800); s = await state();
expect("Add To Bag opens drawer and counts 1", s.drawer && /\(1\)/.test(s.cartCount ?? ""), s);
await local.goto(URL_ + "?variant=62276396843378", { timeout: 60000 }); await local.waitForTimeout(1500); s = await state();
expect("?variant= preselects Dark Chambray / S on load", s.labels[0] === "Dark Chambray" && s.labels[1] === "Size: S", s);
const ev = await local.events();
const errors = ev.filter((e) => e.method === "Runtime.exceptionThrown" || (e.method === "Runtime.consoleAPICalled" && e.params.type === "error")).map((e) => (e.params.exceptionDetails?.exception?.description || JSON.stringify(e.params.args?.map((a) => a.value ?? a.description))).slice(0, 160));
expect("zero console errors", errors.length === 0, errors);
await local.evaluate(() => localStorage.clear());
await fs.writeFile(`${lib.ROOT}/reference/verify/pdp-interactions.json`, JSON.stringify({ stamp: new Date().toISOString(), checks }, null, 1));
for (const c of checks) console.log(c.ok ? "PASS" : "FAIL", c.name, c.ok ? "" : JSON.stringify(c.got).slice(0, 300));
