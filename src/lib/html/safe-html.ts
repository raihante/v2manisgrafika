// Branded HTML string types and client-safe helpers. Values of these types are only produced by
// ./sanitize.ts (server side, inside repository adapters) or by the escaping helpers below.

declare const safeHtmlBrand: unique symbol;
declare const safeSvgBrand: unique symbol;
/** Rich-text HTML that went through sanitizeRichText. */
export type SafeHtml = string & { readonly [safeHtmlBrand]: true };
/** Inline SVG child markup that went through sanitizeSvgInner. */
export type SafeSvg = string & { readonly [safeSvgBrand]: true };

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (c) => ESCAPES[c]);

/** Replaces the first occurrence of a placeholder token (e.g. {{SKU}}) with escaped plain text. */
export const fillSafeHtml = (html: SafeHtml, token: string, text: string): SafeHtml => html.replace(token, () => escapeHtml(text)) as SafeHtml;
