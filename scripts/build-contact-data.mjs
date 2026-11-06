// Build /pages/contact-us from private source captures (run with plain `node scripts/build-contact-data.mjs`).
// Inputs: reference/data/pages/contact-us-main.html (server HTML, read-only GET 2026-11-06) and the form iframe capture
// reference/dom/r257d-contact/frame-{markup.html,used-rules.css} (reference/scripts/r257d-frame-capture.mjs).
// Outputs:
//   src/data/pages/contact-us.json             page sections (typed via src/lib/pages/contact.ts)
//   public/mock/contact-form.html              MOCK of the third-party form (Hulk Form Builder) the source loads in an
//                                              iframe: source markup + the CSS rules it uses + a local script that
//                                              validates, shows the source success alert and sends NOTHING anywhere
//   reference/data/collection-asset-plan-_contact.json  header image -> `node scripts/download-collection-assets.mjs _contact`
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { decode, text } from "./lib/product-cards.mjs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const html = readFileSync(`${ROOT}reference/data/pages/contact-us-main.html`, "utf8").replace(/\s+/g, " ");
const ASSET_DIR = "/assets/source/pages";
const assets = {};
const local = (url) => {
  const abs = new URL(decode(url).replace(/^\/\//, "https://"), "https://beyondthevines.co.id");
  const name = decodeURIComponent(abs.pathname.split("/").pop());
  assets[`${ASSET_DIR}/${name}`] = abs.href;
  return `${ASSET_DIR}/${name}`;
};

// Section 1: rich text with one lazysizes image.
const rt = html.match(/<div id="shopify-section-(template--\d+__\w+)" class="shopify-section"><link[^>]*rich-text\.css[^>]*\/><div class="row grid"> <div class="small-12 columns"> <div class="(rich-text [^"]*)"style="([^"]*)"> <div class="rich-text__inner"> <div class="([^"]*)"> <img class="lazyload ([^"]*?) ?" width="(\d+)" height="(\d+)" data-sizes="auto" src="([^"]+)" data-srcset="([^"]+)" fetchpriority="low" alt="([^"]*)" style="([^"]*)" \/>/);
const richText = {
  sectionId: rt[1], className: rt[2], style: rt[3], innerClass: rt[4], imgClass: rt[5], width: Number(rt[6]), height: Number(rt[7]),
  placeholder: local(rt[8]),
  srcset: rt[9].split(",").map((s) => s.trim()).filter(Boolean).map((s) => { const [u, w] = s.split(/\s+/); return { src: local(u), w: Number(w.replace("w", "")) }; }),
  // "50.0% 50.0%" is written as the browser serializes it ("50% 50%"), so the hydrated style attribute matches.
  alt: decode(rt[10]), imgStyle: rt[11].replace(/(\d+)\.0%/g, "$1%"),
};

// Section 2: custom liquid with the form-builder iframe (MOCK target).
const cl = html.match(/<section id="shopify-section-(template--\d+__custom_liquid_\w+)" class="([^"]+)"> <div style="([^"]*)" class="(pxFormGenerator)" id="([^"]+)"> <iframe src="[^"]+" id="([^"]+)" frameborder="(\d+)" width="([^"]+)" style="height: (\d+)px;"><\/iframe>/);
const form = { sectionId: cl[1], className: cl[2], divStyle: cl[3], divClass: cl[4], divId: cl[5], iframeId: cl[6], frameborder: cl[7], width: cl[8], initialHeight: Number(cl[9]), src: "/mock/contact-form.html", title: `Form ${cl[5]}` };

// Section 3: multicolumn (contact addresses as rich text).
const mc = html.match(/<div id="shopify-section-(template--\d+__multicolumn_\w+)" class="([^"]+)">/);
const mcSec = html.slice(mc.index, html.indexOf("</style></div>", mc.index));
const columns = [...mcSec.matchAll(/<div class="(multicolumn__column [^"]*?) ?"> <h4 class="h5">([^<]*)<\/h4> <div class="rte" >([\s\S]*?)<\/div> <\/div>/g)].map((m) => ({ className: m[1], title: text(m[2]), html: m[3].trim() }));
const multicolumn = { sectionId: mc[1], className: mc[2], columns };

mkdirSync(`${ROOT}src/data/pages`, { recursive: true });
writeFileSync(`${ROOT}src/data/pages/contact-us.json`, JSON.stringify({ documentTitle: "Contact Us – Beyond The Vines Indonesia", richText, form, multicolumn }, null, 1) + "\n");
writeFileSync(`${ROOT}reference/data/collection-asset-plan-_contact.json`, JSON.stringify(assets, null, 1));

// --- MOCK form document ---
const frameDir = `${ROOT}reference/dom/r257d-contact`;
let markup = readFileSync(`${frameDir}/frame-markup.html`, "utf8").replace(/\s+/g, " ");
// The vendor's advanced CSS block (fonts on another domain, sweet-alert) is replaced by the used rules below.
markup = markup.replace(/<style id="advance_css_text">[\s\S]*?<\/style>/, "").replace(/ style="opacity: [\d.]+;"/, "")
  // The reCAPTCHA block is not reproduced, but on the source it takes 85px of layout between the message field and
  // Submit (form document 599 vs 514px without it at 1920, 526 vs 441 at 390): keep an empty placeholder of that height.
  .replace('<div class="clearfix"></div> <div class="form_submit_div text-center">', '<div class="form_captcha_div form_captcha_v3_div" data-mock="reCAPTCHA not reproduced" style="height:85px"></div> <div class="clearfix"></div> <div class="form_submit_div text-center">');
const rules = readFileSync(`${frameDir}/frame-used-rules.css`, "utf8");
const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Contact Us 2.0</title>
<!-- MOCK (docs/mock-behaviors.md "Contact form"): local stand-in for the Hulk Form Builder form the source embeds in an
     iframe on /pages/contact-us. Markup and the CSS rules it uses were captured read-only on 2026-11-06
     (reference/scripts/r257d-frame-capture.mjs). Submitting sends nothing: it only validates and shows the source
     success alert. reCAPTCHA and the PayPal drop-in are not reproduced. Generated by scripts/build-contact-data.mjs. -->
<style>
@font-face{font-family:Everett-Light;src:url(/fonts/Everett-Light.woff) format("woff")}
@font-face{font-family:Everett-regular;src:url(/fonts/Everett-Regular.woff) format("woff")}
${rules}
</style>
</head>
<body>
${markup}
<script>
(function () {
  var form = document.getElementById("formGeneratorForm");
  form.setAttribute("data-mock", "no data is sent");
  function report() { parent.postMessage({ type: "mock-form-height", id: ${JSON.stringify(form.divId)}, height: document.body.scrollHeight }, location.origin); }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var missing = Array.prototype.filter.call(form.querySelectorAll(".required"), function (f) { return !f.value.trim(); });
    Array.prototype.forEach.call(form.querySelectorAll(".required"), function (f) { f.setAttribute("aria-invalid", missing.indexOf(f) >= 0 ? "true" : "false"); });
    if (missing.length) { missing[0].focus(); return; }
    form.querySelector(".alert_message").style.display = "block";
    form.reset();
    report();
  });
  form.querySelector(".alert_message .close").addEventListener("click", function () { form.querySelector(".alert_message").style.display = "none"; report(); });
  addEventListener("message", function (e) { if (e.origin === location.origin && e.data && e.data.type === "mock-form-height-request") report(); });
  addEventListener("load", report);
  addEventListener("resize", report);
  report();
})();
</script>
</body>
</html>
`;
mkdirSync(`${ROOT}public/mock`, { recursive: true });
writeFileSync(`${ROOT}public/mock/contact-form.html`, page);
console.log(JSON.stringify({ richText: { id: richText.sectionId, img: richText.srcset }, form, columns: columns.map((c) => c.title), assets: Object.keys(assets), mockKB: Math.round(page.length / 1024) }, null, 1));
