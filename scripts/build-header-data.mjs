// Build the shared shell fixture (announcement, header, menus, side panels) from private source captures.
// Run: node scripts/build-header-data.mjs
// Inputs (Git-ignored, captured by reference/scripts/r256-header-capture*.mjs with ego-browser, 2026-11-06 snapshot,
// Indonesia market, logged out, empty cart): reference/dom/r256-header/{announcement,header,wrapper-shell}-1920.html.
// Outputs: src/data/header.json (typed by src/lib/navigation.ts) and reference/data/header-asset-plan.json
// (source URL -> public/assets/source/header/<source file name>, downloaded by scripts/download-header-assets.mjs).
import { readFileSync, writeFileSync } from "node:fs";
import { all, cleanText, hasClass, kids, one, outer, parse } from "./lib/mini-dom.mjs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const read = (f) => readFileSync(`${ROOT}reference/dom/r256-header/${f}`, "utf8");
const header = parse(read("header-1920.html"));
const announcement = parse(read("announcement-1920.html"));
const shell = parse(read("wrapper-shell-1920.html"));

// ---- assets: keep the source file name (AGENTS.md asset rules), drop query strings.
const assets = new Map();
function asset(src) {
  if (!src) return null;
  const abs = new URL(src.replace(/^\/\//, "https://"), "https://beyondthevines.co.id");
  const name = decodeURIComponent(abs.pathname.split("/").pop());
  const local = `/assets/source/header/${name}`;
  const prev = assets.get(local);
  if (prev && prev !== abs.href) throw new Error(`Asset name collision: ${name}`);
  assets.set(local, abs.href);
  return local;
}

// ---- SVG: attributes as React props + verbatim inner markup.
const REACT_ATTR = { class: "className", viewbox: "viewBox", preserveaspectratio: "preserveAspectRatio", "xmlns:xlink": "xmlnsXlink", "xlink:href": "xlinkHref", "stroke-width": "strokeWidth", "stroke-linecap": "strokeLinecap", "stroke-linejoin": "strokeLinejoin", "fill-rule": "fillRule", "clip-rule": "clipRule", "stroke-miterlimit": "strokeMiterlimit", tabindex: "tabIndex" };
function svg(root, el) {
  if (!el) throw new Error("missing svg");
  const props = {};
  for (const [k, v] of Object.entries(el.attrs)) props[REACT_ATTR[k] || k] = v;
  const html = outer(root, el);
  const innerHtml = html.slice(html.indexOf(">") + 1, html.lastIndexOf("</svg>")).replace(/\s+/g, " ").trim();
  return { props, inner: innerHtml };
}
// String.prototype.trim also strips U+00A0; the source text keeps its leading/trailing &nbsp;.
const asciiTrim = (s) => s.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, "");
const link = (a) => ({ label: cleanText(a), href: a.attrs.href, title: a.attrs.title ?? null });

// ---- announcement
const marquee = one(announcement, ".announcement-bar--inner");
const annGroup = kids(marquee, "div")[0];
const announcementData = {
  speed: (marquee.attrs.style.match(/--marquee-speed:\s*([^;]+)/) || [])[1]?.trim(),
  direction: marquee.attrs.class.match(/direction-(\w+)/)?.[1],
  // Text keeps the source non-breaking spaces; the trailing empty item is part of the source markup.
  items: kids(annGroup, "div").map((d) => { const a = one(d, "a"); return a ? { text: asciiTrim(a.children.map((c) => c.text ?? "").join("")), href: a.attrs.href, target: a.attrs.target ?? null } : null; }),
  groups: kids(marquee, "div").length,
};

// ---- logos
const logoImgs = all(one(header, "header > .row > .main-header-content"), "a.logolink img");
const logo = { alt: logoImgs[0].attrs.alt, width: Number(logoImgs[0].attrs.width), height: Number(logoImgs[0].attrs.height), images: logoImgs.map((i) => ({ src: asset(i.attrs.src), className: i.attrs.class })) };

// ---- desktop full menu (mounted, hidden at every width on the source)
const promotion = (root, el) => {
  if (!el) return null;
  const imgA = one(el, ".mega-menu-image-container a");
  const btn = one(el, ".promotion-button-cover a");
  return {
    image: asset(one(el, "img").attrs.src), imageAlt: one(el, "img").attrs.alt ?? "", href: imgA.attrs.href, target: imgA.attrs.target ?? null,
    title: cleanText(one(el, ".jsc-mega-menu-promotion p")), titleClass: one(el, ".jsc-mega-menu-promotion p").attrs.class,
    button: { label: cleanText(btn), href: btn.attrs.href, target: btn.attrs.target ?? null, className: btn.attrs.class },
    arrow: svg(root, one(el, ".promotion-button-cover svg")),
    className: el.attrs.class,
  };
};
const fullMenu = one(header, "full-menu > ul.thb-full-menu");
const desktopMenu = kids(fullMenu, "li").map((li) => {
  const a = kids(li, "a")[0];
  const mega = one(li, ".mega-menu-container");
  return {
    ...link(a), label: a.children.filter((c) => c.text !== undefined).map((c) => c.text).join("").trim(),
    className: li.attrs.class || "", itemTitle: li.attrs["data-item-title"] ?? null, role: li.attrs.role ?? null,
    arrow: one(a, "svg") ? svg(header, one(a, "svg")) : null,
    mega: mega && {
      columns: kids(one(mega, "ul.mega-menu-columns"), "li").map((col) => ({
        heading: link(kids(col, "a")[0]),
        links: kids(col, "ul")[0] ? kids(kids(col, "ul")[0], "li").map((l) => link(one(l, "a"))) : null,
      })),
      promotion: promotion(header, one(mega, ".mega-menu-promotion")),
    },
  };
});

// ---- mobile drawer menu (nested details)
const mobileList = one(header, "#mobile-menu ul.mobile-menu");
const backBtn = one(mobileList, ".parent-link-back button");
const mobileMenu = kids(mobileList, "li").map((li) => {
  const det = kids(li, "details")[0];
  if (!det) return { kind: "link", ...link(kids(li, "a")[0]) };
  const entries = [];
  let promo = null;
  for (const item of kids(one(det, "ul.sub-menu"), "li")) {
    if (hasClass(item, "parent-link-back")) continue;
    if (one(item, ".jsc-main_menu-title")) { entries.push({ kind: "title", label: cleanText(item), className: item.attrs.class }); continue; }
    if (one(item, ".sub_menu-title")) { entries.push({ kind: "heading", label: cleanText(one(item, ".sub_menu-title")), className: item.attrs.class, summaryClass: one(item, "summary").attrs.class }); continue; }
    if (one(item, ".mega-menu-promotion")) { promo = promotion(header, one(item, ".mega-menu-promotion")); continue; }
    const a = one(item, "a");
    entries.push({ kind: "link", ...link(a), className: item.attrs.class || "", role: a.attrs.role ?? null });
  }
  return { kind: "submenu", label: cleanText(kids(det, "summary")[0]), dataTitle: det.attrs["data-title"], summaryClass: kids(det, "summary")[0].attrs.class.trim(), entries, promotion: promo };
});

// ---- mobile drawer footer: account links, store + language selectors
const footer = one(header, ".thb-mobile-menu-footer");
const leftLinks = kids(one(footer, ".jsc-left-menu"), "a").map((a) => ({
  ...link(a), label: a.children.filter((c) => c.text !== undefined).map((c) => c.text).join("").trim(), className: a.attrs.class ?? null,
  icon: one(a, "svg") ? svg(header, one(a, "svg")) : null,
  // Whether the icon precedes the label ("<svg/> Login") or follows it ("Wishlist <svg/>").
  iconFirst: a.children.findIndex((c) => c.tag === "svg") < a.children.findIndex((c) => c.text !== undefined && c.text.trim()),
}));
const lists = all(footer, ".jsc-store-list-wrap");
const listData = (wrap) => {
  const sel = one(wrap, ".store_link_selected");
  return {
    selected: { label: cleanText(one(sel, "span")), className: sel.attrs.class, flag: one(sel, "img") ? asset(one(sel, "img").attrs.src) : null, chevron: svg(header, one(sel, "svg")) },
    options: kids(one(wrap, "ul.shopLinkList"), "li").map((li) => ({
      code: li.attrs["data-store"], href: li.attrs["data-href"], country: li.attrs["data-country"] ?? null, className: (li.attrs.class || "").trim(),
      // Inline style as a React style object ("width:100%;" -> { width: "100%" }).
      style: li.attrs.style ? Object.fromEntries(li.attrs.style.split(";").filter((d) => d.trim()).map((d) => { const [k, ...v] = d.split(":"); return [k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v.join(":").trim()]; })) : null,
      check: !!one(li, "i"), label: cleanText(one(li, ".disclosure__button")), flag: one(li, "img") ? asset(one(li, "img").attrs.src) : null,
    })),
  };
};

// ---- secondary area icons
const right = one(header, ".thb-secondary-area");
const searchWrap = one(right, ".header-search-wrap");
const wish = one(right, "a.index-swishlist");
const account = one(right, "a.myaccount-icon");
const cart = one(right, "#cart-drawer-toggle");
const mobileSearch = one(header, ".header-search-mobile");
const secondary = {
  search: { icon: svg(header, kids(searchWrap, "svg")[0]), close: svg(header, kids(searchWrap, "svg")[1]) },
  wishlist: { href: wish.attrs.href, className: wish.attrs.class.trim(), icon: svg(header, one(wish, "svg")), white: asset(one(wish, "img").attrs.src) },
  account: { href: account.attrs.href, title: account.attrs.title, icon: svg(header, one(account, "svg")), white: asset(one(account, "img").attrs.src) },
  cart: { href: cart.attrs.href, empty: asset(one(cart, "img.default-empty-icon").attrs.src), white: asset(one(cart, "img.jsc-secondary-empty-icon").attrs.src) },
};
const searchBar = {
  placeholder: one(mobileSearch, "input").attrs.placeholder,
  submitIcon: svg(header, one(mobileSearch, "button svg")),
  closeIcon: svg(header, one(mobileSearch, ".header-search-close svg")),
};

// ---- side panels
const cartDrawer = one(shell, "#Cart-Drawer");
const emptyCart = one(cartDrawer, ".cart-drawer__empty-cart");
const descP = one(emptyCart, ".jsc-cart-drawer-empty-cart-desc");
const sidePanels = {
  closeIcon: svg(shell, one(cartDrawer, "side-panel-close svg")),
  cart: {
    title: cleanText(one(cartDrawer, ".side-panel-header h2")), titleClass: one(cartDrawer, ".side-panel-header h2").attrs.class ?? null,
    empty: cleanText(kids(emptyCart, "p")[0]),
    desc: { text: cleanText(descP), icon: asset(one(descP, "img").attrs.src), iconAlt: one(descP, "img").attrs.alt },
    suggestionTitle: cleanText(one(cartDrawer, ".jsc-shopping-suggestion-title")),
    pills: all(cartDrawer, "a.jsc-shopping-suggestion-pill").map(link),
    continue: link(one(cartDrawer, "a.button")),
  },
  product: { title: cleanText(one(shell, "#Product-Drawer h2")) },
  search: { placeholder: one(shell, "#Search-Drawer input").attrs.placeholder, label: cleanText(one(shell, "#Search-Drawer label")) },
};

// ---- body-level page-loading overlay (hidden until cart operations), captured by r256-page-loading.mjs
const loading = parse(JSON.parse(read("page-loading.json")).html);
const loadingImg = one(loading, "img");
const pageLoading = { image: asset(loadingImg.attrs.src), alt: loadingImg.attrs.alt, className: loadingImg.attrs.class };

const data = {
  snapshot: "2026-11-06",
  pageLoading,
  sectionIds: { announcement: "shopify-section-sections--22799924887831__announcement-bar", header: "shopify-section-sections--22799924887831__header" },
  announcement: announcementData,
  logo,
  hamburgerBack: { label: cleanText(backBtn), icon: svg(header, one(backBtn, "svg")) },
  desktopMenu,
  mobileMenu,
  accountLinks: leftLinks,
  stores: listData(lists[0]),
  languages: listData(lists[1]),
  secondary,
  searchBar,
  sidePanels,
};
writeFileSync(`${ROOT}src/data/header.json`, JSON.stringify(data, null, 1) + "\n");
writeFileSync(`${ROOT}reference/data/header-asset-plan.json`, JSON.stringify(Object.fromEntries(assets), null, 1));
console.log(JSON.stringify({ desktop: desktopMenu.map((m) => `${m.label}${m.mega ? `(${m.mega.columns.length})` : ""}`), mobile: mobileMenu.map((m) => `${m.label}${m.entries ? `[${m.entries.length}${m.promotion ? "+promo" : ""}]` : ""}`), accountLinks: leftLinks.map((l) => l.label), stores: data.stores.options.length, languages: data.languages.options.map((o) => o.code), assets: assets.size, bytes: JSON.stringify(data).length }));
