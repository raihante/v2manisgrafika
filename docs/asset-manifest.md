# Asset Manifest

The machine-readable manifest is private at `reference/data/download-manifest.json`.

- 189 homepage media assets downloaded to `public/assets/source/`.
- 4 source fonts downloaded to `public/fonts/`, verified byte-identical to source by SHA-256 and renamed to their source family names:
- 18 CSS resources retained privately in `reference/css/`.
- 41 JavaScript resources retained privately in `reference/js/`.
- Every downloaded item records source URL, local path, content type, byte size, and download status.
- All 252 discovered resources downloaded successfully.
- 32 current Instagram feed images captured from the source feed's lazy-load URLs and stored under `public/assets/social/`; the homepage currently mounts the first 12 in source order.
- 6 exact footer social icons extracted from the source's embedded PNG data and stored under `public/assets/social-icons/`.
- Product-card media was reconciled against the live visible primary image for all 36 cards; fixture paths now reference the matching locally mirrored files.
- 277 product-variant and exact swatch-thumbnail images are stored under `public/assets/product-variants/` for product-card colour interaction. Their source URLs, local paths, SHA-256 hashes, byte sizes, measured dimensions, route usage, and authorization status are recorded in `reference/data/product-variant-asset-manifest.json`.
- 23 responsive WebP derivatives are stored under `public/assets/optimized/`: 16 category-hero variants (1920px desktop, 900px mobile) and 7 promotion variants. Source originals remain under `public/assets/source/`; derivatives use quality 88 and preserve source aspect ratios. Current promotion slide 2 uses the corrected mobile derivative from `TVC_BOTTOM_ID.webp`; its older desktop-derived mobile file remains unused.

## Fonts

Source declares separate single-weight families (`Everett-Light`, `Everett-regular`/`Everett-Regular`, `Everett-Medium`) rather than one family with multiple weights. Local `@font-face` blocks mirror this so weight-400 text resolves to the same face as the source.

| Local path | SHA-256 (first 16) | Bytes | Source face | Source URL | Usage |
|---|---|---:|---|---|---|
| `public/fonts/Everett-Light.woff` | `2675b4bc82910619` | 21692 | `Everett-Light` | `.../assets/Everett-Light.woff?v=125009213952062228731719543686` | Newsletter tagline, Subscribe button |
| `public/fonts/Everett-Regular.woff` | `47a3f911b03ff2c7` | 24520 | `Everett-regular` / `Everett-Regular` | `cdn.shopify.com/.../Everett-Regular_4496b459-....woff?v=1720495474` | Body, inputs, footer labels |
| `public/fonts/Everett-Medium.woff` | `2232634200f723d3` | 25668 | `Everett-Medium` | `.../assets/Everett-Medium.woff?v=165792582726285328841719543686` | Newsletter heading |
| `public/fonts/Recoleta-regular.woff` | `5bedd85434ff7288` | 47336 | `Recoleta-regular` | `cdn.shopify.com/.../Latinotype_-_Recoleta_Regular_1.woff?v=1743735549` | Social-handle heading |
| `public/assets/source/VINE_CLUB.gif` | `21bdc1f71a6aec77` | 1756292 | 600x544 GIF | `beyondthevines.co.id/cdn/shop/t/33/assets/VINE_CLUB.gif?v=31481856497854272171722996347` | Backstage Pass popup header image (all SiteChrome routes); authorized |
| `public/assets/source/empty-cart-desc-icon.png` | `62d015a9eb16449a` | 2030 | 136x136 PNG | `beyondthevines.co.id/cdn/shop/t/33/assets/empty-cart-desc-icon.png?v=55977042238896792231722496232` | Cart drawer empty state; authorized |

Assets are authorized for this project and must remain local; do not hotlink the production storefront.

- Product detail pages (2026-11-06, round 255): **no product images are stored locally.** Owner decision 2026-11-06: product-page images (gallery, srcset widths, thumbnails, cards, swatches, multicolumn) are dummyimage.com placeholders with source dimensions (mock, see `docs/mock-behaviors.md` "Product images"); the previously mirrored `public/assets/products/` (2,296 + 421 partial srcset files, ~626 MB) was deleted and the download/hash scripts removed. Placeholder -> source URL map: private `reference/data/product-image-sources.json` (8,556 entries). Theme assets used by the PDP are still local and real: `public/assets/source/share-button-outline.png` (537x541, sha256 cf8665c2...a3d2be, source theme share icon); `public/assets/source/PIXEL_HEART.gif` (600x964, sha256 9147c9d1...164653, source cdn.shopify.com/s/files/1/0207/5974/0480/files/PIXEL_HEART.gif) and `HEART_FILL.gif` (400x400, sha256 8b486102...848d66, same folder) - Swym wishlist heart animations; `public/fonts/swym_fonts.woff2` (sha256 749aae5c...32a9, source procdn.swymrelay.com/code/v3/swym_fonts.woff2) - Swym icon font. Authorization: owner-confirmed (AGENTS.md).
