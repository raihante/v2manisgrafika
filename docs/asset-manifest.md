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


## Shared shell (round 256, 2026-11-06 snapshot)

Source: header section, menu drawer, mega-menu and side panels of every route (`reference/dom/r256-header/`). Pipeline: `node scripts/build-header-data.mjs && node scripts/build-shell-css.mjs && node scripts/download-header-assets.mjs` (machine-readable list: private `reference/data/header-assets.json`). Authorization: owner-confirmed reproduction of source assets (AGENTS.md). Route usage: every route rendered through `SiteChrome`.

| Local path | Source URL | SHA-256 | Dimensions | Bytes | Usage | Repository |
|---|---|---|---|---:|---|---|
| `/assets/source/header/BTV_logo_black.png` | https://beyondthevines.co.id/cdn/shop/files/BTV_logo_black.png?v=1772174610 | `267213f50e61631bb3951d3c00e519f7111e196d6589a99da0e68778797923f5` | 5738x625 | 43255 | Header logo (black; white variant shown while the menu drawer is open) | Committed |
| `/assets/source/header/BTV_logo_white.png` | https://beyondthevines.co.id/cdn/shop/files/BTV_logo_white.png?v=1772174616 | `b7d8b045820d40fbad623394e6785f798f77cf36cc7dd8934b1509e3a84e86ae` | 5738x625 | 47142 | Header logo (black; white variant shown while the menu drawer is open) | Committed |
| `/assets/source/header/Seasonal_Dumpling_2026_10_BAGS_Hamburger.webp` | https://beyondthevines.co.id/cdn/shop/files/Seasonal_Dumpling_2026_10_BAGS_Hamburger.webp?v=1792488148&width=2500?width=2500 | `ca4c8a713e927b45a1fed3b33cc366b5ecb0dc695ab01079a9914f365b7cfadb` | 2500x3126 | 15649461 | Mega-menu + drawer submenu promotion image | Git-ignored (download script) |
| `/assets/source/header/PRE_FALL_09_2026_WOMENS_Hamburger_A.webp` | https://beyondthevines.co.id/cdn/shop/files/PRE_FALL_09_2026_WOMENS_Hamburger_A.webp?v=1789099413&width=2500?width=2500 | `243e935850e06a0450ff8858e67fd226b147813eec1653307b13c5ee410e2941` | 2500x3126 | 15659181 | Mega-menu + drawer submenu promotion image | Git-ignored (download script) |
| `/assets/source/header/TOYO_2026_07_MEN_Hamburger.webp` | https://beyondthevines.co.id/cdn/shop/files/TOYO_2026_07_MEN_Hamburger.webp?v=1786011353&width=2500?width=2500 | `650faf309634d630e62547bc42f5ed7607f280997f75e3ecf29487b59152daa7` | 2500x3126 | 3503049 | Mega-menu + drawer submenu promotion image | Git-ignored (download script) |
| `/assets/source/header/KIDS_BACKPACK_07_2026_HAMBURGER.webp` | https://beyondthevines.co.id/cdn/shop/files/KIDS_BACKPACK_07_2026_HAMBURGER.webp?v=1785558815&width=2500?width=2500 | `0cf82210d79076c512892f71f914115c8e5ad517dc663e3f99a104197a047d7e` | 2500x3126 | 12388804 | Mega-menu + drawer submenu promotion image | Git-ignored (download script) |
| `/assets/source/header/2026_10_ACC_Hamburger.webp` | https://beyondthevines.co.id/cdn/shop/files/2026_10_ACC_Hamburger.webp?v=1793847801&width=2500?width=2500 | `8a4ef511328a2cc0dd965f70c3f60c11fbd7de4d578c9b1289f3bed88ce0e8d6` | 2500x3126 | 13000481 | Mega-menu + drawer submenu promotion image | Git-ignored (download script) |
| `/assets/source/header/YASHICA_2026_10_LIFESTYLE_Hamburger.webp` | https://beyondthevines.co.id/cdn/shop/files/YASHICA_2026_10_LIFESTYLE_Hamburger.webp?v=1792487813&width=2500?width=2500 | `fa59d13f835726744bec4085c24aa078511f9eea19effc448f9b1857c419c15a` | 2500x3126 | 12811854 | Mega-menu + drawer submenu promotion image | Git-ignored (download script) |
| `/assets/source/header/white-wishlist.png` | https://beyondthevines.co.id/cdn/shop/files/white-wishlist.png?v=7276484692205141430 | `3e2cef8798ab40d3d25938fe6500dea041cf042e92d5266f11409d9c1020bbbf` | 81x80 | 1374 | Header icon, white variant (menu drawer open) | Committed |
| `/assets/source/header/white_account.png` | https://beyondthevines.co.id/cdn/shop/files/white_account.png?v=10437996038243710992 | `17528f2eab58f5c650536044079667e48a4c3231dc365290b2b9294a2e721d5f` | 80x80 | 1197 | Header icon, white variant (menu drawer open) | Committed |
| `/assets/source/header/Empty_Cart.png` | https://beyondthevines.co.id/cdn/shop/t/33/assets/Empty_Cart.png?v=104378246199969045621722496232 | `e53f300f039c957f6be9d9adba2ddee179e0108ff89ce422184e15c9e5c9f276` | 181x173 | 1360 | Header cart icon | Committed |
| `/assets/source/header/Empty_Cart_secondary.png` | https://beyondthevines.co.id/cdn/shop/files/Empty_Cart_secondary.png?v=8735655481167605875 | `61692dda8184b173419e887dc941b937373c9b598ce7a6e99035e849c63ddfd1` | 92x88 | 1376 | Header icon, white variant (menu drawer open) | Committed |
| `/assets/source/header/empty-cart-desc-icon.png` | https://beyondthevines.co.id/cdn/shop/t/33/assets/empty-cart-desc-icon.png?v=55977042238896792231722496232 | `62d015a9eb16449a04308c37cdf71aaa236f176b2f211a029ac05f6c645a98ac` | 136x136 | 2030 | Cart drawer empty-state delivery icon | Committed |
| `/assets/source/header/Country_flags-03.png` | https://cdn.shopify.com/s/files/1/0716/6912/1303/files/Country_flags-03.png?v=1698127815 | `97cadc5526295a712a7989e43cc9f2700d6491ec52f34b67292a2ef50da7b97c` | 417x417 | 2714 | Menu drawer store selector flag | Committed |
| `/assets/source/header/Country_flags-02.png` | https://cdn.shopify.com/s/files/1/0716/6912/1303/files/Country_flags-02.png?v=1698127816 | `559187a7aac9df5e198687654664b6472e80dbfdac4262a1d0b2274a6ea206d1` | 418x418 | 4645 | Menu drawer store selector flag | Committed |
| `/assets/source/header/thailand_flags.png` | https://cdn.shopify.com/s/files/1/0207/5974/0480/files/thailand_flags.png?v=1718940096 | `984da5cfb44f7b1ba3e0e7311efcf212816173c0ab4cdc9839871eca0ecf360f` | 417x417 | 2907 | Menu drawer store selector flag | Committed |
| `/assets/source/header/Philippines.png` | https://cdn.shopify.com/s/files/1/0207/5974/0480/files/Philippines.png?v=1712279485 | `199eeb9bd193c305f17076b4ca3fdbfacfefead9c2cdd329e91fbb23da89d483` | 4380x4380 | 91555 | Menu drawer store selector flag | Committed |
| `/assets/source/header/Country_flags-01.png` | https://cdn.shopify.com/s/files/1/0716/6912/1303/files/Country_flags-01.png?v=1698127816 | `5a91d97d7da4d78bf843d78242347d4bccb4c07905e51ac9791350d77013e1a1` | 418x418 | 4074 | Menu drawer store selector flag | Committed |
| `/assets/source/header/msia.png` | https://cdn.shopify.com/s/files/1/0207/5974/0480/files/msia.png?v=1773196804 | `14d384e673f0838500ef0084a2d8f2bcfb14cd1ca182626a8a461c32fa33bc2a` | 512x512 | 20654 | Menu drawer store selector flag | Committed |
| `/assets/source/header/australia.png` | https://cdn.shopify.com/s/files/1/0207/5974/0480/files/australia.png?v=1773196804 | `43fc82d2f09c7fc686d76b64867a3dadb16e5f3162a3c4e2be254b7db5bd90f1` | 512x512 | 24157 | Menu drawer store selector flag | Committed |
| `/assets/source/header/taiwan.png` | https://cdn.shopify.com/s/files/1/0207/5974/0480/files/taiwan.png?v=1773196804 | `52d6cfb51979e599f7295f4a5920f702f3a69bba3084cd872cc1dab722945fe4` | 512x512 | 18578 | Menu drawer store selector flag | Committed |
| `/assets/source/header/HK.png` | https://cdn.shopify.com/s/files/1/0207/5974/0480/files/HK.png?v=1773196804 | `320b612dbaa6416f842ff986057e9b8cdea5b0253f89da7e2a02a5ce085fd527` | 512x512 | 35500 | Menu drawer store selector flag | Committed |
| `/assets/source/header/NZ.png` | https://cdn.shopify.com/s/files/1/0207/5974/0480/files/NZ.png?v=1773196803 | `8ecd4eef01ce6cf0eac917bd148d90a1a94361500ed73b2887f33e97c944ae36` | 512x512 | 31976 | Menu drawer store selector flag | Committed |
| `/assets/source/header/USA.webp` | https://cdn.shopify.com/s/files/1/0207/5974/0480/files/USA.webp?v=1774316775 | `7125e433a10645e622dcb264ad2f33b31b3c30677612e62d3228521147192370` | 512x512 | 86098 | Menu drawer store selector flag | Committed |
| `/assets/source/header/global.png` | https://cdn.shopify.com/s/files/1/0716/6912/1303/files/global.png?v=1698136264 | `6d2a34dd4b6c26e241582aadf308dcfa5d3e9e901b370de5b52c9b4f6a4ce6b3` | 417x417 | 9454 | Menu drawer store selector flag | Committed |
| `/assets/source/header/X_GLOBAL.png` | https://beyondthevines.co.id/cdn/shop/files/X_GLOBAL.png | `173226fc6ec5f07d640274c1fcea9dec9b2d2327b5cfab39462720da088f1e09` | 1123x1127 | 21420 | Search bar close icon (CSS --search-png / --search-second-png) | Committed |
| `/assets/source/header/Close-white.png` | https://beyondthevines.co.id/cdn/shop/files/Close-white.png | `9460b79be43e0880a4644f3628f7e3d9413de10cbf3f9410f69dce9162b332d7` | 185x184 | 966 | Search bar close icon (CSS --search-png / --search-second-png) | Committed |
