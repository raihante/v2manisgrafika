// Minimal dependency-free HTML tree builder for build scripts that read private source captures.
// Handles void elements, raw-text elements (script/style), attributes and text; enough for well-formed theme markup.
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const RAW = new Set(["script", "style"]);

export const decode = (s) =>
  s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));

function parseAttrs(src) {
  const attrs = {};
  for (const m of src.matchAll(/([^\s=/"'<>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) attrs[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? "");
  return attrs;
}

export function parse(html) {
  const root = { tag: "#root", attrs: {}, children: [], parent: null, start: 0, end: html.length };
  let cur = root;
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
  let last = 0;
  let m;
  while ((m = re.exec(html))) {
    if (m.index > last) cur.children.push({ text: decode(html.slice(last, m.index)) });
    last = re.lastIndex;
    if (m[0].startsWith("<!--")) continue;
    const tag = m[2].toLowerCase();
    if (m[1]) {
      // Close the nearest matching open element.
      let n = cur;
      while (n && n.tag !== tag) n = n.parent;
      if (n) { for (let c = cur; c !== n.parent; c = c.parent) c.end = m.index; n.outerEnd = re.lastIndex; cur = n.parent; }
      continue;
    }
    const el = { tag, attrs: parseAttrs(m[3]), children: [], parent: cur, start: m.index, innerStart: re.lastIndex };
    cur.children.push(el);
    if (VOID.has(tag) || m[3].trim().endsWith("/")) { el.outerEnd = re.lastIndex; continue; }
    if (RAW.has(tag)) {
      const close = html.toLowerCase().indexOf(`</${tag}`, re.lastIndex);
      el.children.push({ text: html.slice(re.lastIndex, close) });
      el.end = close;
      el.outerEnd = html.indexOf(">", close) + 1;
      re.lastIndex = last = el.outerEnd;
      continue;
    }
    cur = el;
  }
  root.source = html;
  return root;
}

const classes = (el) => (el.attrs?.class || "").split(/\s+/).filter(Boolean);
export const hasClass = (el, c) => classes(el).includes(c);

// Simple selector: tag, .class, #id, [attr], [attr=value] compounds; descendant combinator by space, child by ">".
function matchCompound(el, comp) {
  if (!el.tag || el.tag === "#root") return false;
  const m = comp.match(/^([a-z][\w-]*|\*)?((?:[.#][\w-]+|\[[^\]]+\])*)$/i);
  if (!m) throw new Error(`Unsupported selector part: ${comp}`);
  if (m[1] && m[1] !== "*" && el.tag !== m[1].toLowerCase()) return false;
  for (const p of m[2].match(/[.#][\w-]+|\[[^\]]+\]/g) || []) {
    if (p[0] === ".") { if (!hasClass(el, p.slice(1))) return false; }
    else if (p[0] === "#") { if (el.attrs.id !== p.slice(1)) return false; }
    else {
      const [k, v] = p.slice(1, -1).split("=");
      if (!(k in el.attrs)) return false;
      if (v !== undefined && el.attrs[k] !== v.replace(/^["']|["']$/g, "")) return false;
    }
  }
  return true;
}

function matches(el, sel) {
  const parts = sel.trim().split(/\s*(>)\s*|\s+/).filter(Boolean);
  const test = (node, i) => {
    if (!matchCompound(node, parts[i])) return false;
    if (i === 0) return true;
    if (parts[i - 1] === ">") return node.parent ? test(node.parent, i - 2) : false;
    for (let p = node.parent; p; p = p.parent) if (test(p, i - 1)) return true;
    return false;
  };
  return test(el, parts.length - 1);
}

export function all(node, sel) {
  const out = [];
  const walk = (n) => { for (const c of n.children || []) { if (c.tag) { if (matches(c, sel)) out.push(c); walk(c); } } };
  walk(node);
  return out;
}
export const one = (node, sel) => all(node, sel)[0] || null;
export const kids = (node, sel) => (node.children || []).filter((c) => c.tag && (!sel || matchCompound(c, sel)));
export const text = (node) => (node.text !== undefined ? node.text : (node.children || []).map(text).join(""));
// Collapse ASCII whitespace only: U+00A0 is content in theme markup and String.prototype.trim would strip it.
export const cleanText = (node) => text(node).replace(/[ \t\r\n]+/g, " ").replace(/^ | $/g, "");
// Raw outer HTML from the original source string.
export const outer = (root, el) => root.source.slice(el.start, el.outerEnd);
export const inner = (root, el) => root.source.slice(el.innerStart, el.end);
