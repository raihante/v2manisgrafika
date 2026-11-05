// Browser helpers for the visual verify tool (moved from reference/scripts/r200-lib.mjs, 2026-11-06).
// Runs inside `ego-browser nodejs`; uses the persistent task space named in SPACE.
export const ROOT = "C:/Digitakarya/v2manisgrafika";
export const SOURCE_URL = "https://beyondthevines.co.id/";
export const LOCAL_URL = "http://localhost:3400/";
export const SPACE = "reverse beyondthevines homepage";

export async function getPages() {
  // One source tab and one local tab, reused across runs: pick by URL, else reuse a blank tab, and only then
  // open a new page. Extra blank tabs are closed so the space never hits its page budget.
  const task = await taskSpace(SPACE);
  const tabs = (await task.tabs()).filter((t) => t.label);
  const isBlank = (t) => !t.url || t.url === "about:blank" || t.url.startsWith("chrome://newtab");
  const used = new Set();
  const take = async (match) => {
    const tab = tabs.find((t) => !used.has(t.label) && t.url?.includes(match)) || tabs.find((t) => !used.has(t.label) && isBlank(t));
    if (tab) { used.add(tab.label); return task.page(tab.label); }
    const page = await task.newPage(); used.add(page.label); return page;
  };
  const source = await take("beyondthevines.co.id");
  const local = await take("localhost:3400");
  for (const t of tabs) if (!used.has(t.label) && isBlank(t)) await task.page(t.label).close().catch(() => {});
  return { task, source, local };
}

export async function setViewport(page, width, height, opts = {}) {
  // Foreground the tab: background tabs get no requestAnimationFrame, which leaves Flickity mid-animation
  // (isAnimating stays true and later resizes are ignored).
  await page.cdp("Page.bringToFront").catch(() => {});
  const mobile = opts.mobile ?? width <= 798;
  await page.cdp("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  if (opts.touch !== undefined) {
    await page.cdp("Emulation.setTouchEmulationEnabled", { enabled: !!opts.touch, maxTouchPoints: opts.touch ? 5 : 0 });
    await page.cdp("Emulation.setEmitTouchEventsForMouse", { enabled: !!opts.touch, configuration: opts.touch ? "mobile" : "desktop" });
  }
}

// Screenshot load path: no programmatic scroll, autoplay timers frozen identically on both sites.
export async function loadForShot(page, url, width, height, isSource, opts = {}) {
  await setViewport(page, width, height, opts);
  // Freeze autoplay only: drop timers with delay >= 4000ms (carousel players / title switchers run at 5000ms) on
  // both sites; shorter timers keep working. Comparison uses the shared post-resize gallery state below.
  const noScrollbar = opts.hideScrollbar ? "(()=>{const add=()=>{try{if(document.getElementById('__r200nosb'))return;const s=document.createElement('style');s.id='__r200nosb';s.textContent='html{scrollbar-width:none}';(document.head||document.documentElement).appendChild(s);}catch(e){}};try{add();}catch(e){}document.addEventListener('readystatechange',add);document.addEventListener('DOMContentLoaded',add);})();" : "";
  const stub = noScrollbar + "window.__realSetInterval=window.setInterval.bind(window);(()=>{const si=window.setInterval.bind(window),st=window.setTimeout.bind(window);window.setInterval=(f,d,...a)=>(d>=4000?0:si(f,d,...a));window.setTimeout=(f,d,...a)=>(d>=4000?0:st(f,d,...a));})();";
  const { identifier } = await page.cdp("Page.addScriptToEvaluateOnNewDocument", { source: stub });
  try {
    await page.goto(url, { timeout: 90000 });
    await page.waitForLoadState("load");
  } finally {
    await page.cdp("Page.removeScriptToEvaluateOnNewDocument", { identifier });
  }
  await page.evaluate(() => {
    const hide = () => {
      document.querySelectorAll("video").forEach((v) => v.pause());
      const popup = document.querySelector("#jsc-login-register-popup");
      if (popup && popup.style.display !== "none") popup.style.setProperty("display", "none", "important");
      if (popup && document.body.style.overflow === "hidden") document.body.style.overflow = "";
      document.querySelectorAll(".click-capture, .login-register__overlay").forEach((n) => { if (n.style.display !== "none") n.style.setProperty("display", "none", "important"); });
      document.querySelectorAll("img[loading=lazy]").forEach((img) => { img.loading = "eager"; });
      // Instafeed defers its media until scrolled into view; load it without scrolling.
      document.querySelectorAll("img.instafeed-lazy-image[data-instafeed-src]").forEach((img) => { const real = img.getAttribute("data-instafeed-src"); if (real && img.getAttribute("src") !== real) img.setAttribute("src", real); });
    };
    hide();
    window.__realSetInterval(hide, 150);
    const style = document.createElement("style");
    style.textContent = ".announcement-bar--marquee>div{animation:none!important;transform:none!important}nextjs-portal{display:none!important}";
    document.head.appendChild(style);
  });
  if (isSource) await page.waitForFunction(() => document.querySelectorAll(".instafeed-new-layout-item").length > 0, undefined, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(isSource ? 4500 : 1500);
  await page.waitForFunction(() => Array.from(document.images).filter((i) => i.getBoundingClientRect().width > 50).every((i) => i.complete), undefined, { timeout: 20000 }).catch(() => {});
  // Shared post-resize state: source Flickity re-measures galleries (drops the lazy-load gap), local clears its
  // initial gap. Instafeed ignores it (innerWidth unchanged).
  if (opts.postResize !== false) {
    await page.evaluate(() => dispatchEvent(new Event("resize")));
    await page.waitForTimeout(1200);
  }
  await page.mouse.move(2, 2);
  await page.waitForTimeout(500);
}
