// Pilot verify tool: one command captures source + local targets at each width in the same normalized state,
// runs the clone-website eval probe (in-page part copied from tools/eval-probe.js), and saves fullPage shots.
// Scoring is done afterwards by score.py (wraps clone-website scripts/eval_score.py + region pixel diff).
// Usage: see AGENTS.md "Verify tool". Config: reference/verify/verify-cfg.json; output: reference/verify/<out>/ (both private).
const fs = await import("node:fs/promises");
const lib = await import(`file:///C:/Digitakarya/v2manisgrafika/tests/visual/ego-lib.mjs?v=${Date.now()}`);
const cfg = JSON.parse(await fs.readFile(`${lib.ROOT}/reference/verify/verify-cfg.json`, "utf8"));
const OUT = `${lib.ROOT}/reference/verify/${cfg.out}`;
await fs.mkdir(OUT, { recursive: true });
const { task, source, local } = await lib.getPages();
// A minimized ego window cannot be screenshotted; restore it first (window state only, no page change).
for (const p of [source, local]) {
  const tab = (await task.tabs()).find((x) => x.label === p.label);
  const { windowId, bounds } = await task.cdp("Browser.getWindowForTarget", { targetId: tab.targetId });
  if (bounds.windowState === "minimized") await task.cdp("Browser.setWindowBounds", { windowId, bounds: { windowState: "normal" } });
}

function inPageProbe(maxPer) {
  const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
  const base = (u) => { try { const p = new URL(u, location.href); const q = p.searchParams.get("url"); const path = p.pathname === "/_next/image" && q ? decodeURIComponent(q) : p.pathname; return path.split("/").pop(); } catch { return u; } };
  const pageH = document.body.scrollHeight;
  const candidates = Array.from(document.querySelectorAll("body section, body header, body footer, body main > div, body > div > section, body > div > div"))
    .map((el) => ({ el, r: el.getBoundingClientRect() }))
    .filter((s) => s.r.height > 40 && s.r.height < pageH * 0.5)
    .sort((a, b) => b.r.height * b.r.width - a.r.height * a.r.width);
  const sectionEls = [];
  for (const s of candidates) {
    const y1 = s.r.top + scrollY;
    const overlaps = sectionEls.some((k) => { const ky1 = k.r.top + scrollY; const inter = Math.min(ky1 + k.r.height, y1 + s.r.height) - Math.max(ky1, y1); return inter > 0.5 * Math.min(k.r.height, s.r.height); });
    if (!overlaps) sectionEls.push(s);
  }
  sectionEls.sort((a, b) => a.r.top - b.r.top);
  const sections = sectionEls.map(({ el, r }, si) => {
    const samples = Array.from(el.querySelectorAll("h1,h2,h3,h4,a,button,img,p,li"))
      .filter((n) => { const b = n.getBoundingClientRect(); return b.width > 4 && b.height > 4; })
      .slice(0, maxPer)
      .map((n) => { const b = n.getBoundingClientRect(); const c = getComputedStyle(n);
        return { key: n.tagName + "|" + (n.tagName === "IMG" ? base(n.src) : clean(n.textContent).slice(0, 40)),
          rect: { x: Math.round(b.x), y: Math.round(b.y + scrollY), w: Math.round(b.width), h: Math.round(b.height) },
          font: { family: c.fontFamily.split(",")[0].replace(/["']/g, "").trim(), size: c.fontSize, weight: c.fontWeight },
          color: c.color, bg: c.backgroundColor, radius: c.borderRadius }; });
    return { index: si, tag: el.tagName, y: Math.round(r.top + scrollY), h: Math.round(r.height),
      density: { textLen: clean(el.innerText).length, imgs: el.querySelectorAll("img").length, svgs: el.querySelectorAll("svg").length }, samples };
  });
  const animations = document.getAnimations({ subtree: true }).filter((a) => a.constructor.name !== "CSSTransition")
    .map((a) => ({ timeline: a.timeline?.constructor?.name || "none",
      props: [...new Set((a.effect?.getKeyframes?.() || []).flatMap((k) => Object.keys(k)))].filter((p) => !["offset", "computedOffset", "easing", "composite"].includes(p)).sort() }));
  // Region anchors for the PDP-specific pixel diff (main product + breadcrumbs).
  const anchor = (sels) => { for (const s of sels) { const el = document.querySelector(s); if (el) { const r = el.getBoundingClientRect(); if (r.height > 0) return { y: Math.round(r.top + scrollY), h: Math.round(r.height) }; } } return null; };
  return {
    url: location.href, title: document.title, pageH: document.body.scrollHeight, sections,
    innerViewport: { w: innerWidth, h: innerHeight }, viewport: { w: innerWidth, h: innerHeight },
    fonts: [...new Set(Array.from(document.fonts).filter((f) => f.status === "loaded").map((f) => f.family.replace(/["']/g, "")))].sort(),
    assets: { imgs: [...new Set(Array.from(document.querySelectorAll("img[src]")).map((i) => base(i.src)))].sort(), videos: [] },
    animations: { count: animations.length, byTimeline: animations.reduce((m, a) => ((m[a.timeline] = (m[a.timeline] || 0) + 1), m), {}), propSets: animations.map((a) => a.props.join(",")).sort() },
    region: { crumbs: anchor([".breadcrumbs-section", ".pdp-crumbs", "[data-pilot=crumbs]"]), main: anchor([".product-section", ".pdp-main", "[data-pilot=main]"]) },
  };
}

const summary = {};
for (const width of cfg.widths) {
  for (const t of cfg.targets) {
    const page = t.source ? source : local;
    // Same origin-scoped storage reset on every target (empty cart, no recently-viewed history, popup state fresh).
    try { await page.goto(t.url, { timeout: 90000 }); await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} }); } catch (e) {}
    await lib.loadForShot(page, t.url, width, cfg.height || 900, !!t.source, { hideScrollbar: width > 798 });
    // Popup can be re-shown by theme jQuery after lib's inline hide; hide it by stylesheet on every target.
    await page.evaluate(() => { const st = document.createElement("style"); st.textContent = "#jsc-login-register-popup,.login-register__overlay{display:none!important}"; document.head.appendChild(st); document.body.style.overflow = ""; document.body.classList.remove("overflow-hidden"); });
    // Flickity autoplay (2s on Pair It With) and late image sizing make carousel state timing-dependent:
    // stop players, re-measure, and settle every carousel on its first cell, identically on every target.
    await page.evaluate(() => {
      // Local carousels mark themselves [data-autoplay]: pause via hover (as Flickity pauseAutoPlayOnHover) and select slide 1.
      document.querySelectorAll("[data-autoplay]").forEach((el) => { el.dispatchEvent(new PointerEvent("pointerover", { bubbles: true })); if (!el.flickity) el.querySelector("[aria-label='View slide 1']")?.click(); });
      // Product-page carousels expose a Flickity-like handle (src/components/commerce/pdp/useFlickity.ts): same instant reset.
      document.querySelectorAll(".flickity-enabled").forEach((el) => { if (el.flickity) { el.flickity.stopPlayer(); el.flickity.select(0, true); } });
      if (!window.Flickity) return; document.querySelectorAll(".flickity-enabled").forEach((el) => { const F = Flickity.data(el); if (!F) return; try { F.stopPlayer && F.stopPlayer(); F.resize(); F.select(0, false, true); } catch (e) {} }); });
    // Local carousels animate back to cell 1 with Flickity physics (~1 s); source ones are reset instantly.
    await page.waitForTimeout(2000);
    const info = await page.info();
    if (!info.w || !info.h) throw new Error("viewport 0 " + JSON.stringify(info));
    const probe = await page.evaluate(inPageProbe, 8);
    const key = `${t.label}-${width}`;
    await fs.writeFile(`${OUT}/${key}.json`, JSON.stringify(probe, null, 2));
    await page.screenshot({ path: `${OUT}/${key}.png`, fullPage: true });
    summary[key] = { title: probe.title.slice(0, 40), pageH: probe.pageH, sections: probe.sections.length, region: probe.region };
    console.log(key, JSON.stringify(summary[key]));
  }
}
await fs.writeFile(`${OUT}/capture.json`, JSON.stringify({ stamp: new Date().toISOString(), cfg, state: "origin storage cleared; loadForShot: timers>=4s frozen, popup hidden, lazy eager, no scroll, post-resize", summary }, null, 2));
