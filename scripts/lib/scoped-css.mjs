// Shared generator for source-rule stylesheets (PDP, collection): takes the used-rules dump written by a
// reference/scripts/*-used-rules.mjs capture and scopes every selector to a page wrapper that carries the source body
// classes, with :where() so specificity is unchanged and the rules cannot leak into the shared shell or other routes.
// Duplicate rules (the source loads some sheets twice) keep their LAST position, which preserves the source cascade.
import { readFileSync } from "node:fs";

export function scopeSelector(sel, scope) {
  return sel.split(/,(?![^()]*\))/).map((s) => {
    s = s.trim();
    // `body.x .y` / `html .y`: the wrapper stands in for body (it carries the source body classes).
    const m = s.match(/^(html[^\s>]*\s*>?\s*)?body([^\s>]*)\s*(>?)\s*(.*)$/);
    if (m) return m[4] ? `${scope}${m[2]} ${m[3] ? "> " : ""}${m[4]}` : `${scope}${m[2]}`;
    if (/^html\b/.test(s)) s = s.replace(/^html[^\s]*\s+/, "");
    return `:where(${scope}) ${s}`;
  }).join(", ");
}

// Minified source -> one rule per line, @media kept inline.
export function splitRules(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out = [];
  let depth = 0, start = 0, media = null;
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === "{") {
      if (depth === 0 && css.slice(start, i).trim().startsWith("@media")) { media = css.slice(start, i).trim(); start = i + 1; }
      depth++;
    } else if (c === "}") {
      depth--;
      if (media && depth === 1) { out.push(`${media} { ${css.slice(start, i + 1).trim()} }`); start = i + 1; }
      else if (media && depth === 0) { media = null; start = i + 1; }
      else if (depth === 0) { out.push(css.slice(start, i + 1).trim()); start = i + 1; }
    }
  }
  return out.filter(Boolean);
}

/**
 * @param {object} o
 * @param {string} o.used        used-rules.css text (`/* ===== sheet ===== *\/` headers, one rule per line)
 * @param {Record<string,string>} o.vars  custom properties to declare on the scope
 * @param {string} o.scope       wrapper selector, e.g. ".template-product"
 * @param {RegExp} o.dropSheets  sheets written by vendor widgets / the shared shell that this stylesheet must not carry
 * @param {Record<string,string>} [o.wholeSheets]  sheet name -> file included whole (state classes only exist while open)
 * @param {string[]} o.header    comment lines for the top of the file
 * @returns {{ css: string, rules: number, dropped: number }}
 */
export function buildScopedCss({ used, vars, scope, dropSheets, wholeSheets = {}, header }) {
  const entries = [];
  let sheet = "";
  const emittedWhole = new Set();
  for (const line of used.split("\n")) {
    const head = line.match(/^\/\* ===== (.+) ===== \*\/$/);
    if (head) {
      sheet = head[1];
      if (wholeSheets[sheet] && !emittedWhole.has(sheet)) { emittedWhole.add(sheet); splitRules(readFileSync(wholeSheets[sheet], "utf8")).forEach((l) => entries.push({ sheet, line: l })); }
      continue;
    }
    if (!line.trim() || dropSheets.test(sheet) || wholeSheets[sheet]) continue;
    entries.push({ sheet, line });
  }
  // Keyframes span several lines in the input; re-join them.
  const joined = [];
  for (const e of entries) {
    const prev = joined[joined.length - 1];
    if (prev && prev.open > 0) { prev.line += "\n" + e.line; prev.open += (e.line.match(/{/g) || []).length - (e.line.match(/}/g) || []).length; continue; }
    joined.push({ ...e, open: (e.line.match(/{/g) || []).length - (e.line.match(/}/g) || []).length });
  }
  // Keep only keyframes that a kept rule animates (the extractor lists every @keyframes of every sheet).
  // @-webkit-keyframes counts too: Chrome treats it as the same name, and the later definition wins.
  const isKf = (l) => /^@(-webkit-)?keyframes\s/.test(l);
  const animated = new Set(joined.filter((e) => !isKf(e.line))
    .flatMap((e) => [...e.line.matchAll(/animation(?:-name)?:\s*([^;}]+)/g)].flatMap((m) => m[1].split(/[\s,]+/))));
  const out = [];
  const seen = new Map();
  for (const { sheet, line } of joined) {
    let text;
    if (isKf(line)) { if (!animated.has(line.match(/^@(?:-webkit-)?keyframes\s+([\w-]+)/)[1])) continue; text = line; }
    else {
      const media = line.match(/^((?:@(?:media|supports)[^{]+)+)\{ (.*) \}$/);
      const [chain, rule] = media ? [media[1].trim(), media[2]] : ["", line];
      const i = rule.indexOf("{");
      const body = `${scopeSelector(rule.slice(0, i), scope)}${rule.slice(i)}`;
      text = chain ? chain.split(/ (?=@)/).reduceRight((acc, c) => `${c} { ${acc} }`, body) : body;
    }
    if (seen.has(text)) out[seen.get(text)] = null;
    seen.set(text, out.length);
    out.push({ sheet, text });
  }
  const resolved = resolveDuplicateSelectors(out);
  const lines = [...header, `${scope}{${Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(";")}}`];
  let last = "";
  for (const e of resolved.entries) {
    if (!e) continue;
    if (e.sheet !== last) { lines.push(`\n/* --- ${e.sheet} --- */`); last = e.sheet; }
    lines.push(e.text);
  }
  const css = lines.join("\n") + "\n";
  return { css, rules: resolved.entries.filter(Boolean).length, dropped: out.filter((e) => !e).length, cascadeRewritten: resolved.rewritten, cascadeEmptied: resolved.emptied, bytes: lines.join("\n").length };
}

// Split a declaration block ("a: 1; b: url(x;y) !important") on top-level semicolons.
function splitDecls(body) {
  const out = [];
  let depth = 0, quote = null, start = 0;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (quote) { if (c === "\\") i++; else if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'") quote = c;
    else if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (c === ";" && depth === 0) { out.push(body.slice(start, i)); start = i + 1; }
  }
  out.push(body.slice(start));
  return out.map((d) => d.trim()).filter(Boolean).map((d) => {
    const k = d.indexOf(":");
    return { prop: d.slice(0, k).trim().toLowerCase(), text: d, important: /!\s*important\s*$/i.test(d) };
  });
}

/**
 * Several source sheets style the same selector (e.g. collection-banner.css `h1{text-transform:uppercase}` and the
 * later-loaded jsc-reset-styles.css `h1{text-transform:unset !important}`). Next's CSS pipeline merges rules with an
 * identical selector and media chain and keeps the LAST declaration of each property, ignoring !important, which
 * inverts the source cascade (measured on /search, round 257c: the title rendered uppercase). This pass applies the
 * cascade here instead, for rules with the same media chain + selector: a later normal declaration that loses to an
 * earlier !important one is removed, and an earlier declaration that a later one overrides is removed. Rule positions
 * are unchanged, so no pair is left for the pipeline to merge wrongly.
 */
function resolveDuplicateSelectors(entries) {
  const parsed = entries.map((e) => {
    if (!e || /^@(-webkit-)?keyframes\s/.test(e.text)) return null;
    // "<@media ...> { ... { <sel>{decls} } }" or "<sel>{decls}"
    const open = e.text.lastIndexOf("{", e.text.indexOf("}"));
    const close = e.text.indexOf("}", open);
    const head = e.text.slice(0, open);
    const at = head.lastIndexOf("{");
    const chain = at >= 0 ? head.slice(0, at + 1) : "";
    const sel = (at >= 0 ? head.slice(at + 1) : head).trim();
    return { chain, sel, tail: e.text.slice(close), decls: splitDecls(e.text.slice(open + 1, close)), changed: false };
  });
  const winners = new Map(); // chain||sel||prop -> { idx, decl }
  parsed.forEach((p, idx) => {
    if (!p) return;
    p.decls = p.decls.filter((d) => {
      const key = `${p.chain}||${p.sel}||${d.prop}`;
      const prev = winners.get(key);
      if (prev && prev.decl.important && !d.important) { p.changed = true; return false; }
      if (prev) { const q = parsed[prev.idx]; q.decls = q.decls.filter((x) => x !== prev.decl); q.changed = true; }
      winners.set(key, { idx, decl: d });
      return true;
    });
  });
  let rewritten = 0, emptied = 0;
  const result = entries.map((e, i) => {
    const p = parsed[i];
    if (!e || !p || !p.changed) return e;
    rewritten++;
    if (!p.decls.length) { emptied++; return null; }
    return { ...e, text: `${p.chain}${p.chain ? " " : ""}${p.sel}{${p.decls.map((d) => d.text).join("; ")};${p.tail}` };
  });
  return { entries: result, rewritten, emptied };
}
