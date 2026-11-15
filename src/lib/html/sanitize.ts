// Server-side HTML sanitizer for every rich-text field a repository returns (fixtures today, the CMS database later).
// Components only accept the branded SafeHtml / SafeSvg types (src/components/shared/RichText.tsx), so raw strings from
// an adapter cannot reach dangerouslySetInnerHTML without passing through here. sanitize-html stays out of client
// bundles because only repository adapters import this module.
import "server-only";
import sanitizeHtml from "sanitize-html";
import type { SafeHtml, SafeSvg } from "./safe-html";

export type { SafeHtml, SafeSvg };

// Allowlist = every tag/attribute found in the 2026-11-06 fixtures (PDP tabs and multicolumns, FAQ answers, contact
// columns, content blocks, blog bodies), minus anything that can run script. Attributes are kept verbatim.
const TEXT_ATTRS = ["class", "id", "title", "dir", "style", "data-*"];
const RICH_TEXT: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "span", "div", "strong", "b", "em", "i", "u", "a", "ul", "ol", "li", "table", "thead", "tbody", "tr", "th", "td", "label", "input", "h2", "h3", "h4"],
  allowedAttributes: {
    "*": TEXT_ATTRS,
    a: [...TEXT_ATTRS, "href", "target", "rel"],
    td: [...TEXT_ATTRS, "colspan", "rowspan"],
    th: [...TEXT_ATTRS, "colspan", "rowspan"],
    input: ["type", "class", "id"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowProtocolRelative: false,
  // Source theme accordions use bare checkbox inputs; any other input type is dropped.
  exclusiveFilter: (frame) => frame.tag === "input" && !["checkbox", "radio"].includes(frame.attribs.type ?? ""),
  parseStyleAttributes: false,
  // Pasted editor junk such as <meta charset> inside the PDP tabs is removed with its (empty) content.
  disallowedTagsMode: "discard",
};

const SVG_ATTRS = ["class", "id", "d", "fill", "fill-rule", "clip-rule", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "opacity", "transform", "x", "y", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry", "width", "height", "points", "viewBox"];
// Theme icons (header, search, collection facets). <style> inside <defs> is source icon CSS (class fills).
const SVG_INNER: sanitizeHtml.IOptions = {
  allowedTags: ["path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "g", "defs", "style", "title"],
  allowedAttributes: { "*": SVG_ATTRS },
  allowVulnerableTags: true, // only for <style>; script and event handlers stay disallowed
  parser: { xmlMode: true, lowerCaseAttributeNames: false, lowerCaseTags: false },
  selfClosing: ["path", "rect", "circle", "ellipse", "line", "polyline", "polygon"],
  allowedSchemes: [],
  parseStyleAttributes: false,
};

export function sanitizeRichText(html: string): SafeHtml {
  return sanitizeHtml(html, RICH_TEXT) as SafeHtml;
}

export function sanitizeSvgInner(markup: string): SafeSvg {
  return sanitizeHtml(markup, SVG_INNER) as SafeSvg;
}
