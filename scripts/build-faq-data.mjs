// Build /pages/faqs from the private source capture (run with plain `node scripts/build-faq-data.mjs`).
// Input: reference/data/pages/faqs-main.html (server HTML, read-only GET 2026-11-06).
// Outputs: src/data/pages/faqs.json (typed via src/lib/pages/faq.ts) and
//          reference/data/collection-asset-plan-_faq.json (header image) for `node scripts/download-collection-assets.mjs _faq`.
// The answers are the source rich text (CMS field), kept as HTML.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { decode, text } from "./lib/product-cards.mjs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const html = readFileSync(`${ROOT}reference/data/pages/faqs-main.html`, "utf8").replace(/\s+/g, " ");
const ASSET_DIR = "/assets/source/pages";
const assets = {};
const local = (url) => {
  const abs = new URL(decode(url).replace(/^\/\//, "https://"), "https://beyondthevines.co.id");
  const name = decodeURIComponent(abs.pathname.split("/").pop());
  assets[`${ASSET_DIR}/${name}`] = abs.href;
  return `${ASSET_DIR}/${name}`;
};
// Section HTML by id (up to the next shopify section or the end of main content).
const sections = [...html.matchAll(/<div id="shopify-section-(template--\d+__[\w-]+)" class="([^"]+)">/g)].map((m, i, all) => ({ id: m[1], className: m[2], html: html.slice(m.index, all[i + 1]?.index ?? html.indexOf("<link href=\"//beyondthevines.co.id/cdn/shop/t/33/assets/login-register-popup.css", m.index)) }));

const headerSec = sections.find((s) => /__faq_header_/.test(s.id));
const hs = headerSec.html;
const header = {
  sectionId: headerSec.id,
  className: headerSec.className,
  wrapperClass: hs.match(/<div class="(jsc-faq-section [^"]*)">/)[1],
  headerClass: hs.match(/<div class="(jsc-faq-header [^"]*)" style="([^"]*)">/)[1],
  headerStyle: hs.match(/<div class="jsc-faq-header [^"]*" style="([^"]*)">/)[1],
  image: local(hs.match(/<img class="jsc-faq-header-image" src="([^"]+)"/)[1]),
  imageAlt: decode(hs.match(/<img class="jsc-faq-header-image" src="[^"]+"\s*alt="([^"]*)"/)[1]),
  buttons: [...hs.matchAll(/<div class="jsc-faq-column carousel__slide"> <a class="(text-button[^"]*)" onclick="clickFaqButton\(this, '([^']+)'\)"><span>([^<]*)<\/span><\/a> <\/div>/g)].map((m) => ({ label: decode(m[2]), text: decode(m[3]), active: /faq-active/.test(m[1]) })),
};

const spacerSec = sections.find((s) => /class="spacer"/.test(s.html));
const spacer = { sectionId: spacerSec.id, className: spacerSec.className, style: spacerSec.html.match(/<div class="spacer" style="([^"]*)">/)[1] };

// theme updateFaqID(): the live DOM ids replace runs of [,&\s-] with "_" ("Most Asked" -> "Most_Asked").
const faqId = (label) => label.replace(/[,&\s-]+/g, "_");
const groups = sections.filter((s) => /<div class="collapsible-content /.test(s.html)).map((s) => {
  const wrap = s.html.match(/<div class="(collapsible-content [^"]*)" id="([^"]+)">/);
  return {
    sectionId: s.id,
    className: s.className,
    contentClass: wrap[1],
    id: faqId(decode(wrap[2])),
    heading: text(s.html.match(/<div class="section-header--content"><h2 class="h3">([\s\S]*?)<\/h2>/)[1]),
    headerClass: s.html.match(/<div class="(section-header [^"]*)"/)[1],
    rows: [...s.html.matchAll(/<collapsible-row class="([^"]+)" > <details id="([^"]+)" > <summary> ([\s\S]*?) <span><\/span> <\/summary> <div class="([^"]+)" id="([^"]+)"> ([\s\S]*?) <\/div> <\/details> <\/collapsible-row>/g)]
      .map((m) => ({ rowClass: m[1].trim(), detailsId: m[2], question: text(m[3]), contentClass: m[4], contentId: m[5], answerHtml: m[6].trim() })),
  };
});

mkdirSync(`${ROOT}src/data/pages`, { recursive: true });
writeFileSync(`${ROOT}src/data/pages/faqs.json`, JSON.stringify({ documentTitle: text(readFileSync(`${ROOT}reference/data/pages/faqs.html`, "utf8").match(/<title>([\s\S]*?)<\/title>/)[1]).replace(/&ndash;/g, "–"), header, spacer, groups }, null, 1) + "\n");
writeFileSync(`${ROOT}reference/data/collection-asset-plan-_faq.json`, JSON.stringify(assets, null, 1));
console.log(JSON.stringify({ buttons: header.buttons.map((b) => b.label), groups: groups.map((g) => `${g.id}:${g.rows.length}`), assets: Object.keys(assets), title: html.match(/<title>/) ? "" : "" }));
