// Build /pages/wishlist from the private live-DOM capture (run with plain `node scripts/build-wishlist-data.mjs`).
// The source page is rendered by the Swym wishlist app on the client, so the input is the captured live DOM
// reference/dom/wishlist/main-0-1920.html (r257-capture-page.mjs, logged out, empty wishlist, 2026-11-06), not server HTML.
// Output: src/data/pages/wishlist.json (typed via src/lib/pages/wishlist.ts). MOCK: logged-out empty state only.
import { readFileSync, writeFileSync } from "node:fs";
import { decode, text } from "./lib/product-cards.mjs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const html = readFileSync(`${ROOT}reference/dom/wishlist/main-0-1920.html`, "utf8").replace(/\s+/g, " ");
const title = readFileSync(`${ROOT}reference/data/pages/wishlist.html`, "utf8").match(/<title>([\s\S]*?)<\/title>/)[1];
const m = (re) => { const r = html.match(re); if (!r) throw new Error(`no match ${re}`); return r; };
const attr = (re) => decode(m(re)[1]);

const data = {
  documentTitle: text(title).replace(/&ndash;/g, "–"),
  pageClass: attr(/<div id="swym-wishlist-render-container"><div class="([^"]+)">/),
  titleBarClass: attr(/<div class="(swym-wishlist-container-title-bar [^"]+)">/),
  title: text(m(/<div class="swym-wishlist-main-title [^"]+" role="heading" aria-level="1">([^<]*)</)[1]),
  user: { label: attr(/<button id="swym-user-login-status-btn"[^>]*aria-label="([^"]*)"/), text: text(m(/<span class="swym-user-text [^"]+">([^<]*)</)[1]) },
  tabs: [...html.matchAll(/<li class="(swym-htc-tab-item [^"]*)" tabindex="0" role="tab" aria-label="([^"]*)" aria-selected="(true|false)">([^<]*)<\/li>/g)]
    .map((t) => ({ className: t[1].replace(/\s*swym-bg-2\s*|\s*swym-selected\s*/g, " ").trim(), label: decode(t[2]), selected: t[3] === "true", text: text(t[4]) })),
  detailClass: attr(/<div class="(swym-wishlist-detail [^"]+)">/),
  detailTitle: text(m(/<h2 class="swym-wishlist-main-title [^"]+" id="swym-modal-wishlist-title">([^<]*)</)[1]),
  shareLabel: attr(/<button disabled="" class="swym-share-btn [^"]+" title="[^"]*" aria-label="([^"]*)"/),
  menuLabel: attr(/id="swym-wishlist-context-menu" aria-label="([^"]*)"/),
  empty: {
    title: text(m(/<h3 class="swym-empty-wishlist-title [^"]+" aria-level="2">([^<]*)</)[1]),
    text: text(m(/<p class="swym-empty-wishlist-text [^"]+">([^<]*)</)[1]),
    button: text(m(/<button class="swym-empty-wishlist-continue-btn [^"]+" role="link" aria-label="[^"]*">([^<]*)</)[1]),
  },
};
writeFileSync(`${ROOT}src/data/pages/wishlist.json`, JSON.stringify(data, null, 1) + "\n");
console.log(JSON.stringify(data, null, 1));
