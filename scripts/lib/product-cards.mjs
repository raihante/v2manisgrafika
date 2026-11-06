// Shared parsing helpers for build scripts that read private source captures (product page, collection grid).
// MOCK images (owner decision 2026-11-06): every product image becomes a https://dummyimage.com placeholder with the
// source dimensions and the source file name as its text (docs/mock-behaviors.md "Product images").
// `sources` collects placeholder URL -> source URL for the CMS migration; each builder writes it out.

export const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
export const text = (s) => decode(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
export const widthOf = (url, fallback) => Number(decode(url).match(/[?&]width=(\d+)/)?.[1] ?? fallback);
export const sources = new Map();

// Cards: no srcset; the source src carries its own &width= (2000 or 1999).
const CARD_WIDTH = 2000;
export const SWATCH_WIDTH = 40;

// Placeholder for a source image at the requested size (text = source file name without extension).
export function image(url, width, height) {
  const abs = new URL(decode(url).replace(/^\/\//, "https://"), "https://beyondthevines.co.id");
  abs.search = "";
  const name = decodeURIComponent(abs.pathname.split("/").pop()).replace(/\.[a-z0-9]+$/i, "");
  const h = Math.max(1, Math.round(height));
  const src = width <= 64 ? `https://dummyimage.com/${width}x${h}/d9d9d9/d9d9d9.png` : `https://dummyimage.com/${width}x${h}/f2f2f2/8c8c8c.png&text=${encodeURIComponent(name)}`;
  sources.set(src, abs.href);
  return src;
}

// Product cards (snippets/product-card) with everything the source product-card markup renders.
export function parseCards(html) {
  if (!html) return [];
  return [...html.matchAll(/<product-card\b[\s\S]*?<\/product-card>/g)].map(([card]) => {
    const attr = (re) => card.match(re)?.[1] ?? null;
    const titleLink = card.match(/<a href="([^"]+)"[^>]*class="product-card-title"[^>]*>([\s\S]*?)<\/a>/);
    const imageLink = card.match(/<a href="([^"]+)"[^>]*class="product-featured-image-link[^"]*"[^>]*style="--padding-bottom:\s*([\d.]+)%/);
    const price = card.match(/class="amount[^"]*">([\s\S]*?)<\//);
    const primary = card.match(/<img src="([^"]+)" class="(product-primary-image[^"]*)"/);
    const swatches = [...card.matchAll(/<div class="product-card-swatch([^"]*)" style="[^"]*--option-color-image:\s*url\('([^']+)'\)[^"]*"[^>]*data-href="([^"]+)"[\s\S]*?data-value="([^"]+)"/g)]
      .map((m) => ({ value: decode(m[4]), image: image(m[2], SWATCH_WIDTH, SWATCH_WIDTH), active: /\bactive\b/.test(m[1]), soldOut: /swatch-soldout/.test(m[1]), href: decode(m[3]) }));
    const swatchTitle = card.match(/<div class="product-card-swatches--title"><span class="var-selected">([^<]*)<\/span>([^<]*)<\/div>/);
    const labelsIn = (block) => [...(block ?? "").matchAll(/<div[^>]*class="(jsc-label[^"]*)"[^>]*>([^<]*)</g)]
      .filter((m) => !/display:\s*none/.test(m[0])).map((m) => ({ className: m[1].trim(), text: text(m[2]) }));
    const overlay = card.match(/<div class="label-discount-code-grid-wrap">([\s\S]*?)<\/div>\s*<\/div>/)?.[1];
    const info = card.slice(card.indexOf('<div class="product-card-info"'));
    const ratio = imageLink ? Number(imageLink[2]) : 150;
    const cardImage = (u) => { const w = widthOf(u, CARD_WIDTH); return image(u, w, (w * ratio) / 100); };
    const infoLabels = info.slice(info.lastIndexOf('<div class="label-wrap">'));
    return {
      title: titleLink ? text(titleLink[2]) : "",
      href: titleLink ? decode(titleLink[1]).split("?")[0] : "#",
      imageHref: imageLink ? decode(imageLink[1]) : "#",
      ratio: imageLink ? Number(imageLink[2]) : 150,
      handle: attr(/data-product-handle="([^"]+)"/),
      variantId: Number(attr(/data-variant-id="(\d+)"/)) || null,
      price: price ? text(price[1]) : "",
      priceFirst: info.indexOf('class="price"') < info.indexOf("product-card-swatches--container"),
      primary: primary ? cardImage(primary[1]) : null,
      primaryClass: primary ? primary[2] : "product-primary-image",
      secondary: [...card.matchAll(/<img src="([^"]+)" class="product-secondary-image/g)].map((m) => cardImage(m[1])),
      swatches,
      swatchSelected: swatchTitle ? decode(swatchTitle[1]) : "",
      swatchSuffix: swatchTitle ? text(swatchTitle[2]) : "",
      overlayLabels: labelsIn(overlay),
      labels: labelsIn(infoLabels),
      button: /<quick-view/.test(card) ? "add" : /Notify Me/.test(card) ? "notify" : "add",
    };
  });
}
