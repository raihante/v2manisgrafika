import { describe, expect, it } from "vitest";
import { escapeHtml, fillSafeHtml } from "@/lib/html/safe-html";
import { sanitizeRichText, sanitizeSvgInner } from "@/lib/html/sanitize";

describe("sanitizeRichText", () => {
  it("keeps the source rich-text markup", () => {
    const html = '<p class="p1"><span style="font-weight: 400" data-mce-style="x">Care</span><br /><a href="https://example.com" target="_blank" title="t">link</a> <a href="mailto:hi@example.com">mail</a></p><table class="t"><tbody><tr><td style="width: 50%">XS</td></tr></tbody></table>';
    const out = sanitizeRichText(html);
    for (const part of ['class="p1"', 'style="font-weight: 400"', 'data-mce-style="x"', 'href="https://example.com"', 'target="_blank"', 'href="mailto:hi@example.com"', "<table", 'style="width: 50%"']) expect(out).toContain(part);
  });

  it("removes scripts, event handlers, frames and script URLs", () => {
    const out = sanitizeRichText('<p onclick="x()">a<script>alert(1)</script><img src=x onerror="alert(1)"><iframe src="https://evil"></iframe><a href="javascript:alert(1)">b</a><a href="data:text/html,x">c</a></p>');
    expect(out).not.toMatch(/script|onclick|onerror|iframe|<img|javascript:|data:/i);
    expect(out).toContain("<p>a<a>b</a><a>c</a></p>");
  });

  it("drops pasted <meta> tags and non-checkbox inputs, keeps theme checkboxes", () => {
    expect(sanitizeRichText('<div><meta charset="utf-8"><p>x</p></div>')).toBe("<div><p>x</p></div>");
    expect(sanitizeRichText('<label><input type="checkbox" /></label><input type="text" /><input type="submit" />')).toBe('<label><input type="checkbox" /></label>');
  });
});

describe("sanitizeSvgInner", () => {
  it("keeps icon geometry and icon CSS", () => {
    const out = sanitizeSvgInner('<defs><style>.cls-1{fill:#27BFEF;}</style></defs> <path class="cls-1 " d="M0 0h1"></path><rect x="1" y="2" width="3" height="4" rx="1"></rect>');
    expect(out).toContain("<style>.cls-1{fill:#27BFEF;}</style>");
    expect(out).toContain('class="cls-1 "');
    expect(out).toContain('d="M0 0h1"');
    expect(out).toContain('rx="1"');
  });

  it("removes scripts, handlers and foreign elements", () => {
    const out = sanitizeSvgInner('<path d="M0" onload="x()"/><script>alert(1)</script><foreignObject><p>x</p></foreignObject><a href="javascript:x"><path d="M1"/></a>');
    expect(out).not.toMatch(/onload|script|foreignObject|javascript|<p>/i);
  });
});

describe("safe-html helpers", () => {
  it("escapes text placed into sanitized HTML", () => {
    expect(escapeHtml(`<b>"'&`)).toBe("&lt;b&gt;&quot;&#39;&amp;");
    expect(fillSafeHtml(sanitizeRichText("<p>SKU: {{SKU}}</p>"), "{{SKU}}", "A<1>&$&")).toBe("<p>SKU: A&lt;1&gt;&amp;$&amp;</p>");
  });
});
