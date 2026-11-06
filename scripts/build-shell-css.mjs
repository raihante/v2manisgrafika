// Build src/app/shell-source.css from the source rules that apply to the shared shell (announcement bar, header
// section, side panels, click-capture). Run: node scripts/build-shell-css.mjs
// Input (private, Git-ignored): reference/css/shell/used-rules.css and root-vars.json, captured from the live source
// homepage over every shell state by reference/scripts/r256-shell-used-rules.mjs (ego-browser, 2026-11-06 snapshot).
// Scoping: the subject compound of every selector gets :where(<shell roots>, <shell roots> *), so specificity is
// unchanged and the rules only reach shell elements. Selectors whose subject is html/body/#wrapper (state classes
// such as body.overflow-hidden / body.open-cc) are kept as the source wrote them. Duplicate rules keep their LAST
// position, which preserves the source cascade.
import { readFileSync, writeFileSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const used = readFileSync(`${ROOT}reference/css/shell/used-rules.css`, "utf8");
const vars = JSON.parse(readFileSync(`${ROOT}reference/css/shell/root-vars.json`, "utf8"));

const SHELL = [".announcement-bar-section", ".header-section", ".side-panel", ".click-capture"];
const SCOPE = `:where(${SHELL.flatMap((s) => [s, `${s} *`]).join(", ")})`;
// Vendor widgets the clone does not reproduce, and the wishlist SVG's own <style> (rendered inside the SVG markup).
// The verify harness (tests/visual/ego-lib.mjs loadForShot) injects a marquee freeze into the page it captures; the
// used-rules capture records it as a source inline sheet. It is not source CSS and would stop the announcement marquee.
const HARNESS_RULE = /^\.announcement-bar--marquee > div\{animation: [^}]*none !important; transform: none !important;\}$/;
const DROP_SHEETS = /^(inline:hulk-fb-spinner-css|inline:discounty-global-styles|inline:swym-style-tag|inline:shopify-block-[\w-]+instafeed[\w-]*|inline:Layer_1|login-register-popup\.css)$/;

// Split on a top-level separator (outside (), [] and quotes).
function splitTop(s, isSep) {
  const out = [];
  let depth = 0, quote = null, start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) { if (c === quote && s[i - 1] !== "\\") quote = null; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    else if (depth === 0 && isSep(s, i)) { out.push(s.slice(start, i)); start = i + 1; }
  }
  out.push(s.slice(start));
  return out;
}

function scopeComplex(sel) {
  sel = sel.trim();
  // Subject compound = text after the last top-level combinator.
  let depth = 0, cut = 0;
  for (let i = 0; i < sel.length; i++) {
    const c = sel[i];
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    else if (depth === 0 && (c === " " || c === ">" || c === "+" || c === "~")) cut = i + 1;
  }
  const head = sel.slice(0, cut);
  const subject = sel.slice(cut);
  if (/^(html|body|#wrapper)\b/.test(subject) || /^:root\b/.test(subject)) return sel;
  // Insert before a pseudo-element (::x or legacy :before/:after/:first-letter/:first-line/:placeholder).
  let depth2 = 0, at = subject.length;
  for (let i = 0; i < subject.length; i++) {
    const c = subject[i];
    if (c === "(" || c === "[") depth2++;
    else if (c === ")" || c === "]") depth2--;
    else if (depth2 === 0 && c === ":" && (subject[i + 1] === ":" || /^:(before|after|first-letter|first-line|placeholder)\b/.test(subject.slice(i)))) { at = i; break; }
  }
  return `${head}${subject.slice(0, at)}${SCOPE}${subject.slice(at)}`;
}
const scopeList = (list) => splitTop(list, (s, i) => s[i] === ",").map(scopeComplex).join(", ");

// Parse used-rules.css into top-level statements by brace balance (keyframe cssText spans several lines), keeping the
// sheet banners; each statement may carry "@media ... { rule }" wrappers.
function statements(text) {
  const out = [];
  let depth = 0, start = 0;
  for (let i = 0; i < text.length; i++) {
    if (depth === 0 && text.startsWith("/*", i)) {
      const end = text.indexOf("*/", i) + 2;
      out.push(text.slice(i, end));
      i = end - 1; start = end;
      continue;
    }
    const c = text[i];
    if (c === "{") depth++;
    else if (c === "}" && --depth === 0) { out.push(text.slice(start, i + 1).trim()); start = i + 1; }
  }
  return out.map((s) => s.trim()).filter(Boolean);
}
const rules = [];
let sheet = "";
for (const statement of statements(used)) {
  const line = statement.replace(/\s*\n\s*/g, " ");
  const banner = line.match(/^\/\* ===== (.+) ===== \*\/$/);
  if (banner) { sheet = banner[1]; continue; }
  if (line.startsWith("/*") || DROP_SHEETS.test(sheet) || HARNESS_RULE.test(line)) continue;
  let media = [];
  let body = line;
  while (/^@(media|supports)/.test(body)) {
    const open = body.indexOf("{");
    media.push(body.slice(0, open).trim());
    body = body.slice(open + 1, body.lastIndexOf("}")).trim();
  }
  rules.push({ sheet, media, body });
}

// Keyframes: keep only the ones referenced by kept declarations.
const KEYFRAMES = /^@(?:-[a-z]+-)?keyframes\s+([\w-]+)/;
const declText = rules.filter((r) => !r.body.startsWith("@")).map((r) => r.body).join("\n");
const referenced = new Set([...declText.matchAll(/animation(?:-name)?\s*:\s*([^;}]+)/g)].flatMap((m) => m[1].split(/[\s,]+/)));

const out = [];
const seenAt = new Map();
for (const r of rules) {
  let text;
  if (KEYFRAMES.test(r.body)) {
    if (!referenced.has(r.body.match(KEYFRAMES)[1])) continue;
    text = r.body;
  } else if (r.body.startsWith("@")) {
    text = r.body; // other at-rules (e.g. @font-face) pass through unscoped
  } else {
    const open = r.body.indexOf("{");
    text = `${scopeList(r.body.slice(0, open))}${r.body.slice(open)}`;
  }
  const full = r.media.length ? `${r.media.join(" { ")} { ${text}${" }".repeat(r.media.length)}` : text;
  if (seenAt.has(full)) out[seenAt.get(full)] = null;
  seenAt.set(full, out.length);
  out.push(full);
}

// Source CDN images referenced from CSS -> local copies (no hotlinking); appended to the shell asset plan that
// scripts/download-header-assets.mjs downloads. Run scripts/build-header-data.mjs first (it rewrites the plan).
const planFile = `${ROOT}reference/data/header-asset-plan.json`;
const plan = JSON.parse(readFileSync(planFile, "utf8"));
const localize = (css) => css.replace(/url\((["']?)(\/\/beyondthevines\.co\.id\/cdn\/shop\/[^)"']+)\1\)/g, (_, q, src) => {
  const abs = new URL(`https:${src}`);
  const local = `/assets/source/header/${decodeURIComponent(abs.pathname.split("/").pop())}`;
  abs.search = "";
  plan[local] = abs.href;
  return `url(${local})`;
});
for (const k of Object.keys(vars)) vars[k] = localize(vars[k]);
for (let i = 0; i < out.length; i++) if (out[i]) out[i] = localize(out[i]);
writeFileSync(planFile, JSON.stringify(plan, null, 1));

const rootVars = Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join("\n");
const header = `/* GENERATED by scripts/build-shell-css.mjs - do not edit by hand.
   Source rules for the shared shell (announcement bar, header section, side panels, click-capture), captured from
   the live source homepage (2026-11-06 snapshot) over every shell state, scoped to the shell subtrees with :where()
   (specificity unchanged). Project overrides live in src/app/shell.css. */\n`;
writeFileSync(`${ROOT}src/app/shell-source.css`, `${header}:root {\n${rootVars}\n}\n${out.filter(Boolean).join("\n")}\n`);
console.log(JSON.stringify({ rules: out.filter(Boolean).length, dropped: rules.length - out.filter(Boolean).length, keyframes: [...referenced].filter((n) => rules.some((r) => r.body.startsWith(`@keyframes ${n}`))), vars: Object.keys(vars).length }));
