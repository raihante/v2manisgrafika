# Page Inventory

Source snapshot: 2026-11-05, Indonesia market, logged out, empty cart.

Discovery evidence: `reference/routes/discovery-01.json`, `reference/routes/js-candidate-probes.json`, and `reference/routes/product-sample-candidates.json`.

Status: route discovery captured; routes below are not visually verified unless separate route evidence says otherwise.

## Scope Decisions

- Inventory every evidenced frontend route; exclude assets, APIs, analytics endpoints, and `/agents.md`.
- Keep Indonesian `/id` alternatives paired with their default route instead of treating them as separate templates.
- Record every product URL, but use one complex product for deep capture and implementation.
- Representative product: `/products/womens-classic-long-sleeve-shirt` because live DOM exposes Colour and Size options with 12 variant IDs plus sticky purchase controls.
- Protected routes are listed only; authentication behavior is outside this inventory task.
- `/pages/guide` is excluded because the evidence probe returned the site's 404 page.

## Counts

| Template | Canonical/default routes |
|---|---:|
| Collection/listing | 109 |
| Commerce/state | 3 |
| Content/page | 18 |
| Editorial | 74 |
| Home | 1 |
| Product detail | 164 |
| Protected/account | 3 |
| **Total** | **372** |

Localized Indonesian alternatives paired: **363**. Raw discovered URLs before pairing/exclusions: **733**.

## Checkout Preview Batch (2026-11-05, approximate)

Owner-approved fast preview. Styled from homepage tokens only; source pages for these routes were **not captured**, so every row is **approximate / not visually verified**.

| Local route | Source route | Implementation | Verification |
|---|---|---|---|
| `/collections/[handle]` (`new-in`, `bags`, `your-favourites`) | `/collections/*` | Grid from homepage rail fixtures; no filter/sort | Click-through only |
| `/products/[handle]` (41 handles) | `/products/*` | Gallery, colour, size (representative only), qty, Add to Bag | Click-through only |
| `/cart` | `/cart` | Line items, qty, remove, subtotal | Click-through only |
| `/checkout` | Shopify checkout | Mock one-page checkout | Click-through only |
| `/checkout/thank-you` | Shopify order status | Mock confirmation | Click-through only |
| `/404` (not-found) | 404 | Local 404 with preview note | Click-through only |

## Core And Protected Routes

| Source route | Indonesian alternative | Template | Capture role | Evidence |
|---|---|---|---|---|
| `/` | `/id` | Home | Inventory only | homepage-dom, sitemap |
| `/account/login` | `-` | Protected/account | Inventory only | homepage-dom |
| `/account/orders` | `-` | Protected/account | Inventory only | compiled-js, HTTP 200 |
| `/account/register` | `-` | Protected/account | Inventory only | homepage-dom |
| `/cart` | `-` | Commerce/state | Inventory only | homepage-dom |
| `/checkout` | `-` | Commerce/state | Inventory only | compiled-js, HTTP 403 |
| `/search` | `-` | Commerce/state | Inventory only | compiled-js, HTTP 200 |

## Content Pages

| Source route | Indonesian alternative | Template | Capture role | Evidence |
|---|---|---|---|---|
| `/pages/about-us` | `/id/pages/about-us` | Content/page | Inventory only | homepage-dom, sitemap |
| `/pages/contact-us` | `/id/pages/contact-us` | Content/page | Inventory only | homepage-dom, sitemap |
| `/pages/faqs` | `/id/pages/faqs` | Content/page | Inventory only | homepage-dom, sitemap |
| `/pages/mens-size-guide` | `/id/pages/mens-size-guide` | Content/page | Inventory only | sitemap |
| `/pages/mens-size-guide-cm` | `/id/pages/mens-size-guide-cm` | Content/page | Inventory only | sitemap |
| `/pages/privacy-policy` | `/id/pages/privacy-policy` | Content/page | Inventory only | homepage-dom, sitemap |
| `/pages/returns` | `/id/pages/returns` | Content/page | Inventory only | homepage-dom, sitemap |
| `/pages/search` | `/id/pages/search` | Content/page | Inventory only | sitemap |
| `/pages/shipping-rate` | `/id/pages/shipping-rate` | Content/page | Inventory only | homepage-dom, sitemap |
| `/pages/swym-wishlist` | `/id/pages/swym-wishlist` | Content/page | Inventory only | sitemap |
| `/pages/terms-of-service` | `/id/pages/terms-of-service` | Content/page | Inventory only | homepage-dom, sitemap |
| `/pages/the-btv-stores` | `/id/pages/the-btv-stores` | Content/page | Inventory only | homepage-dom, sitemap |
| `/pages/the-vine-club` | `/id/pages/the-vine-club` | Content/page | Inventory only | homepage-dom, sitemap |
| `/pages/unisex-size-guide-cm` | `/id/pages/unisex-size-guide-cm` | Content/page | Inventory only | sitemap |
| `/pages/unisex-size-guide-inch` | `/id/pages/unisex-size-guide-inch` | Content/page | Inventory only | sitemap |
| `/pages/wishlist` | `/id/pages/wishlist` | Content/page | Inventory only | sitemap |
| `/pages/womens-size-guide` | `/id/pages/womens-size-guide` | Content/page | Inventory only | sitemap |
| `/pages/womens-size-guide-cm` | `/id/pages/womens-size-guide-cm` | Content/page | Inventory only | sitemap |

## Collections

| Source route | Indonesian alternative | Template | Capture role | Evidence |
|---|---|---|---|---|
| `/collections/a-world-beyond` | `/id/collections/a-world-beyond` | Collection/listing | Inventory only | sitemap |
| `/collections/accessories-all` | `/id/collections/accessories-all` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/accessories-belts` | `/id/collections/accessories-belts` | Collection/listing | Inventory only | sitemap |
| `/collections/accessories-new-in` | `/id/collections/accessories-new-in` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/bags` | `/id/collections/bags` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/bags-best-sellers` | `/id/collections/bags-best-sellers` | Collection/listing | Inventory only | sitemap |
| `/collections/bags-new-in` | `/id/collections/bags-new-in` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/bags-shop-all` | `/id/collections/bags-shop-all` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/btv_liberty-fabric` | `/id/collections/btv_liberty-fabric` | Collection/listing | Inventory only | sitemap |
| `/collections/caps` | `/id/collections/caps` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/carnival-series` | `/id/collections/carnival-series` | Collection/listing | Inventory only | sitemap |
| `/collections/carryall-series` | `/id/collections/carryall-series` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/carryall-series-perk` | `/id/collections/carryall-series-perk` | Collection/listing | Inventory only | sitemap |
| `/collections/casetify-accessories-lifestyle` | `/id/collections/casetify-accessories-lifestyle` | Collection/listing | Inventory only | sitemap |
| `/collections/casetify-bags` | `/id/collections/casetify-bags` | Collection/listing | Inventory only | sitemap |
| `/collections/casetify-shop-all` | `/id/collections/casetify-shop-all` | Collection/listing | Inventory only | sitemap |
| `/collections/casetify-t-shirt` | `/id/collections/casetify-t-shirt` | Collection/listing | Inventory only | sitemap |
| `/collections/cc-corg-bundle` | `/id/collections/cc-corg-bundle` | Collection/listing | Inventory only | sitemap |
| `/collections/cherry-series` | `/id/collections/cherry-series` | Collection/listing | Inventory only | sitemap |
| `/collections/colourblock-dumpling-bag` | `/id/collections/colourblock-dumpling-bag` | Collection/listing | Inventory only | sitemap |
| `/collections/crunch-carryall-perk` | `/id/collections/crunch-carryall-perk` | Collection/listing | Inventory only | sitemap |
| `/collections/crunch-organiser` | `/id/collections/crunch-organiser` | Collection/listing | Inventory only | sitemap |
| `/collections/dumpling-series` | `/id/collections/dumpling-series` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/envelope-series` | `/id/collections/envelope-series` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/exclude-mrng` | `/id/collections/exclude-mrng` | Collection/listing | Inventory only | sitemap |
| `/collections/eyewear` | `/id/collections/eyewear` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/festive-bundles` | `/id/collections/festive-bundles` | Collection/listing | Inventory only | sitemap |
| `/collections/flash15-exclusion` | `/id/collections/flash15-exclusion` | Collection/listing | Inventory only | sitemap |
| `/collections/footwear` | `/id/collections/footwear` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/gift-card` | `/id/collections/gift-card` | Collection/listing | Inventory only | sitemap |
| `/collections/gift-wrap-l` | `/id/collections/gift-wrap-l` | Collection/listing | Inventory only | sitemap |
| `/collections/gift-wrap-nil` | `/id/collections/gift-wrap-nil` | Collection/listing | Inventory only | sitemap |
| `/collections/gift-wrap-s` | `/id/collections/gift-wrap-s` | Collection/listing | Inventory only | sitemap |
| `/collections/gift-wrap-xl` | `/id/collections/gift-wrap-xl` | Collection/listing | Inventory only | sitemap |
| `/collections/gift-wrap-xs` | `/id/collections/gift-wrap-xs` | Collection/listing | Inventory only | sitemap |
| `/collections/gifting` | `/id/collections/gifting` | Collection/listing | Inventory only | sitemap |
| `/collections/gifting-edition` | `/id/collections/gifting-edition` | Collection/listing | Inventory only | sitemap |
| `/collections/gifting-under-rp1000000` | `/id/collections/gifting-under-rp1000000` | Collection/listing | Inventory only | sitemap |
| `/collections/gifting-under-rp1500000` | `/id/collections/gifting-under-rp1500000` | Collection/listing | Inventory only | sitemap |
| `/collections/gifting-under-rp2000000` | `/id/collections/gifting-under-rp2000000` | Collection/listing | Inventory only | sitemap |
| `/collections/gifting-under-rp500000` | `/id/collections/gifting-under-rp500000` | Collection/listing | Inventory only | sitemap |
| `/collections/keytags` | `/id/collections/keytags` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/kids-accessories` | `/id/collections/kids-accessories` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/kids-all` | `/id/collections/kids-all` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/kids-bags` | `/id/collections/kids-bags` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/kids-best-sellers` | `/id/collections/kids-best-sellers` | Collection/listing | Inventory only | sitemap |
| `/collections/kids-boys` | `/id/collections/kids-boys` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/kids-clothing` | `/id/collections/kids-clothing` | Collection/listing | Inventory only | sitemap |
| `/collections/kids-girls` | `/id/collections/kids-girls` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/kids-jumpsuits` | `/id/collections/kids-jumpsuits` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/kids-new-in` | `/id/collections/kids-new-in` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/kids-sets` | `/id/collections/kids-sets` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/kids-stnd01` | `/id/collections/kids-stnd01` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/lifestyle-all` | `/id/collections/lifestyle-all` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/lifestyle-carabiners` | `/id/collections/lifestyle-carabiners` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/lifestyle-homeware` | `/id/collections/lifestyle-homeware` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/lifestyle-new-in` | `/id/collections/lifestyle-new-in` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/lifestyle-outdoors` | `/id/collections/lifestyle-outdoors` | Collection/listing | Inventory only | sitemap |
| `/collections/masks` | `/id/collections/masks` | Collection/listing | Inventory only | sitemap |
| `/collections/mens-all` | `/id/collections/mens-all` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/mens-best-sellers` | `/id/collections/mens-best-sellers` | Collection/listing | Inventory only | sitemap |
| `/collections/mens-bottoms` | `/id/collections/mens-bottoms` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/mens-denimwear` | `/id/collections/mens-denimwear` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/mens-jumpsuits` | `/id/collections/mens-jumpsuits` | Collection/listing | Inventory only | sitemap |
| `/collections/mens-new-in` | `/id/collections/mens-new-in` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/mens-organic-cotton-t-shirt` | `/id/collections/mens-organic-cotton-t-shirt` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/mens-outerwear` | `/id/collections/mens-outerwear` | Collection/listing | Inventory only | sitemap |
| `/collections/mens-sets` | `/id/collections/mens-sets` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/mens-tops` | `/id/collections/mens-tops` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/new-in` | `/id/collections/new-in` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/new-tops` | `/id/collections/new-tops` | Collection/listing | Inventory only | sitemap |
| `/collections/octflash15` | `/id/collections/octflash15` | Collection/listing | Inventory only | sitemap |
| `/collections/online-exclusive` | `/id/collections/online-exclusive` | Collection/listing | Inventory only | sitemap |
| `/collections/para-bag-and-pouch-bundle` | `/id/collections/para-bag-and-pouch-bundle` | Collection/listing | Inventory only | sitemap |
| `/collections/para-series` | `/id/collections/para-series` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/payday-sep26` | `/id/collections/payday-sep26` | Collection/listing | Inventory only | sitemap |
| `/collections/pets-new-in` | `/id/collections/pets-new-in` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/poofy-series` | `/id/collections/poofy-series` | Collection/listing | Inventory only | sitemap |
| `/collections/pouches` | `/id/collections/pouches` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/pre-order` | `/id/collections/pre-order` | Collection/listing | Inventory only | sitemap |
| `/collections/regular-price` | `/id/collections/regular-price` | Collection/listing | Inventory only | sitemap |
| `/collections/reversible-bag-series` | `/id/collections/reversible-bag-series` | Collection/listing | Inventory only | sitemap |
| `/collections/shop-all` | `/id/collections/shop-all` | Collection/listing | Inventory only | sitemap |
| `/collections/shop-all-1` | `/id/collections/shop-all-1` | Collection/listing | Inventory only | sitemap |
| `/collections/shopper-tote` | `/id/collections/shopper-tote` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/socks` | `/id/collections/socks` | Collection/listing | Inventory only | sitemap |
| `/collections/stationery` | `/id/collections/stationery` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/studio-tote-series` | `/id/collections/studio-tote-series` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/summer-holiday` | `/id/collections/summer-holiday` | Collection/listing | Inventory only | sitemap |
| `/collections/summer-ready-collection` | `/id/collections/summer-ready-collection` | Collection/listing | Inventory only | sitemap |
| `/collections/tech` | `/id/collections/tech` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/test-collection-1` | `/id/collections/test-collection-1` | Collection/listing | Inventory only | sitemap |
| `/collections/toggle-tote-series` | `/id/collections/toggle-tote-series` | Collection/listing | Inventory only | sitemap |
| `/collections/tvc-sale-sep-26` | `/id/collections/tvc-sale-sep-26` | Collection/listing | Inventory only | sitemap |
| `/collections/upsell-1` | `/id/collections/upsell-1` | Collection/listing | Inventory only | sitemap |
| `/collections/wallets` | `/id/collections/wallets` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/womens-all` | `/id/collections/womens-all` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/womens-best-sellers` | `/id/collections/womens-best-sellers` | Collection/listing | Inventory only | sitemap |
| `/collections/womens-bottoms` | `/id/collections/womens-bottoms` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/womens-denimwear` | `/id/collections/womens-denimwear` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/womens-dresses` | `/id/collections/womens-dresses` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/womens-jumpsuits` | `/id/collections/womens-jumpsuits` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/womens-new-in` | `/id/collections/womens-new-in` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/womens-organic-cotton-t-shirt` | `/id/collections/womens-organic-cotton-t-shirt` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/womens-outerwear` | `/id/collections/womens-outerwear` | Collection/listing | Inventory only | sitemap |
| `/collections/womens-sets` | `/id/collections/womens-sets` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/womens-stnd01` | `/id/collections/womens-stnd01` | Collection/listing | Inventory only | sitemap |
| `/collections/womens-tops` | `/id/collections/womens-tops` | Collection/listing | Inventory only | homepage-dom, sitemap |
| `/collections/your-favourites` | `/id/collections/your-favourites` | Collection/listing | Inventory only | homepage-dom, sitemap |

## Editorial

| Source route | Indonesian alternative | Template | Capture role | Evidence |
|---|---|---|---|---|
| `/blogs/btv-city-guide` | `/id/blogs/btv-city-guide` | Editorial | Inventory only | sitemap |
| `/blogs/btv-city-guide/01` | `/id/blogs/btv-city-guide/01` | Editorial | Inventory only | sitemap |
| `/blogs/btv-city-guide/02` | `/id/blogs/btv-city-guide/02` | Editorial | Inventory only | sitemap |
| `/blogs/btv-city-guide/03` | `/id/blogs/btv-city-guide/03` | Editorial | Inventory only | sitemap |
| `/blogs/btv-city-guide/main` | `/id/blogs/btv-city-guide/main` | Editorial | Inventory only | homepage-dom, sitemap |
| `/blogs/collaborations` | `/id/blogs/collaborations` | Editorial | Inventory only | sitemap |
| `/blogs/collaborations/casetify` | `/id/blogs/collaborations/casetify` | Editorial | Inventory only | sitemap |
| `/blogs/collaborations/liberty` | `/id/blogs/collaborations/liberty` | Editorial | Inventory only | sitemap |
| `/blogs/collaborations/main` | `/id/blogs/collaborations/main` | Editorial | Inventory only | homepage-dom, sitemap |
| `/blogs/collaborations/morning` | `/id/blogs/collaborations/morning` | Editorial | Inventory only | sitemap |
| `/blogs/collaborations/pokemon` | `/id/blogs/collaborations/pokemon` | Editorial | Inventory only | sitemap |
| `/blogs/collaborations/sia` | `/id/blogs/collaborations/sia` | Editorial | Inventory only | sitemap |
| `/blogs/events` | `/id/blogs/events` | Editorial | Inventory only | homepage-dom, sitemap |
| `/blogs/media-stories` | `/id/blogs/media-stories` | Editorial | Inventory only | homepage-dom, sitemap |
| `/blogs/media-stories/beyond-the-vines-aims-to-put-singapore-designs-on-the-world-map` | `/id/blogs/media-stories/beyond-the-vines-aims-to-put-singapore-designs-on-the-world-map` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/beyond-the-vines-co-founder-rebecca-ting-shares-her-go-to-looks` | `/id/blogs/media-stories/beyond-the-vines-co-founder-rebecca-ting-shares-her-go-to-looks` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/beyond-the-vines-commits-to-colour-blocking` | `/id/blogs/media-stories/beyond-the-vines-commits-to-colour-blocking` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/beyond-the-vines-cult-favourite-dumpling-bag-is-getting-a-revamp-and-refreshed-colours` | `/id/blogs/media-stories/beyond-the-vines-cult-favourite-dumpling-bag-is-getting-a-revamp-and-refreshed-colours` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/beyond-the-vines-daniel-chew-and-rebecca-ting-remove-what-isn-t-necessary-so-that-what-is-lasting-will-remain` | `/id/blogs/media-stories/beyond-the-vines-daniel-chew-and-rebecca-ting-remove-what-isn-t-necessary-so-that-what-is-lasting-will-remain` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/beyond-the-vines-design-post` | `/id/blogs/media-stories/beyond-the-vines-design-post` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/beyond-the-vines-design-store` | `/id/blogs/media-stories/beyond-the-vines-design-store` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/beyond-the-vines-founders-tell-us-about-their-new-design-studio-concept-and-minimalist-functional-wear` | `/id/blogs/media-stories/beyond-the-vines-founders-tell-us-about-their-new-design-studio-concept-and-minimalist-functional-wear` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/beyond-the-vines-ion-orchard-s-new-outlet-rethinks-the-store-of-the-future` | `/id/blogs/media-stories/beyond-the-vines-ion-orchard-s-new-outlet-rethinks-the-store-of-the-future` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/beyond-the-vines-new-lifestyle-store-looks-a-ma-zing` | `/id/blogs/media-stories/beyond-the-vines-new-lifestyle-store-looks-a-ma-zing` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/beyond-the-vines-newest-store-is-inspired-by-a-post-office` | `/id/blogs/media-stories/beyond-the-vines-newest-store-is-inspired-by-a-post-office` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/beyond-the-vines-opens-at-changi-airport-terminal-3` | `/id/blogs/media-stories/beyond-the-vines-opens-at-changi-airport-terminal-3` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/beyond-the-vines-pause-reset-and-renew` | `/id/blogs/media-stories/beyond-the-vines-pause-reset-and-renew` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/beyond-the-vines-reaches-further-heights` | `/id/blogs/media-stories/beyond-the-vines-reaches-further-heights` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/beyond-the-vines-rebrands-into-a-full-fledged-design-studio-with-a-permanent-menswear-collection-and-lifestyle-products` | `/id/blogs/media-stories/beyond-the-vines-rebrands-into-a-full-fledged-design-studio-with-a-permanent-menswear-collection-and-lifestyle-products` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/beyond-the-vines-unveils-a-vibrant-technicolour-collection` | `/id/blogs/media-stories/beyond-the-vines-unveils-a-vibrant-technicolour-collection` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/beyond-the-vines-unveils-revamped-concept-store-at-funan-singapore` | `/id/blogs/media-stories/beyond-the-vines-unveils-revamped-concept-store-at-funan-singapore` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/beyond-the-vines-x-casetify-announce-colourful-phone-cases-and-tech-accessories` | `/id/blogs/media-stories/beyond-the-vines-x-casetify-announce-colourful-phone-cases-and-tech-accessories` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/beyond-the-vines-x-morning-brew-your-perfect-cuppa-at-home-with-this-new-coffee-maker` | `/id/blogs/media-stories/beyond-the-vines-x-morning-brew-your-perfect-cuppa-at-home-with-this-new-coffee-maker` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/casetify-makes-southeast-asian-debut-with-beyond-the-vines-collaboration` | `/id/blogs/media-stories/casetify-makes-southeast-asian-debut-with-beyond-the-vines-collaboration` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/could-this-design-store-at-orchard-road-become-singapore-s-answer-to-muji` | `/id/blogs/media-stories/could-this-design-store-at-orchard-road-become-singapore-s-answer-to-muji` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/did-beyond-the-vines-just-open-singapore-s-coolest-lifestyle-store` | `/id/blogs/media-stories/did-beyond-the-vines-just-open-singapore-s-coolest-lifestyle-store` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/esquire-neighbourhood-2021-design-for-access-with-rebecca-ting-of-beyond-the-vines-and-toby-tan` | `/id/blogs/media-stories/esquire-neighbourhood-2021-design-for-access-with-rebecca-ting-of-beyond-the-vines-and-toby-tan` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/fashionable-masks-may-look-good-but-how-can-you-tell-if-they-protect-against-covid-19` | `/id/blogs/media-stories/fashionable-masks-may-look-good-but-how-can-you-tell-if-they-protect-against-covid-19` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/finally-restocked-how-to-score-beyond-the-vines-must-have-bags` | `/id/blogs/media-stories/finally-restocked-how-to-score-beyond-the-vines-must-have-bags` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/in-the-moo-d-for-love` | `/id/blogs/media-stories/in-the-moo-d-for-love` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/local-label-beyond-the-vines-launches-new-pokemon-themed-dumpling-bags` | `/id/blogs/media-stories/local-label-beyond-the-vines-launches-new-pokemon-themed-dumpling-bags` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/meet-the-new-dumpling-from-beyond-the-vines` | `/id/blogs/media-stories/meet-the-new-dumpling-from-beyond-the-vines` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/mensfoliomeets-the-creator-behind-the-iconic-beyond-the-vines-dumpling-bag` | `/id/blogs/media-stories/mensfoliomeets-the-creator-behind-the-iconic-beyond-the-vines-dumpling-bag` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/power-couple-behind-beyond-the-vines-shares-why-they-re-rebranding-the-label` | `/id/blogs/media-stories/power-couple-behind-beyond-the-vines-shares-why-they-re-rebranding-the-label` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/press-10-years-of-beyond-the-vines-how-this-singaporean-brand-redefined-everyday-design` | `/id/blogs/media-stories/press-10-years-of-beyond-the-vines-how-this-singaporean-brand-redefined-everyday-design` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/press-before-between-and-beyond-the-vines-with-rebecca-ting` | `/id/blogs/media-stories/press-before-between-and-beyond-the-vines-with-rebecca-ting` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/press-crafting-community-beyond-the-vines-s-new-bahru-store-is-pure-fun` | `/id/blogs/media-stories/press-crafting-community-beyond-the-vines-s-new-bahru-store-is-pure-fun` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/shop-for-lifestyle-items-made-with-retired-aircraft-materials-at-the-upcycling-project-pop-up-event` | `/id/blogs/media-stories/shop-for-lifestyle-items-made-with-retired-aircraft-materials-at-the-upcycling-project-pop-up-event` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/singapore-fave-beyond-the-vines-is-dropping-pokemon-dumpling-bags-and-we-gotta-catch-em-all` | `/id/blogs/media-stories/singapore-fave-beyond-the-vines-is-dropping-pokemon-dumpling-bags-and-we-gotta-catch-em-all` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/singapore-label-beyond-the-vines-new-retail-store-will-blow-your-mind` | `/id/blogs/media-stories/singapore-label-beyond-the-vines-new-retail-store-will-blow-your-mind` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/singapore-s-beyond-the-vines-to-open-first-store-in-japan` | `/id/blogs/media-stories/singapore-s-beyond-the-vines-to-open-first-store-in-japan` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/singapore-s-cult-fave-dumpling-bag-is-now-at-shangri-la-plaza` | `/id/blogs/media-stories/singapore-s-cult-fave-dumpling-bag-is-now-at-shangri-la-plaza` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/something-fun-is-brewing-at-beyond-the-vines` | `/id/blogs/media-stories/something-fun-is-brewing-at-beyond-the-vines` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/stylish-threads-to-dress-your-best-shop-new-arrivals-from-local-and-international-labels` | `/id/blogs/media-stories/stylish-threads-to-dress-your-best-shop-new-arrivals-from-local-and-international-labels` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/the-beyond-the-vines-for-pokemon-collection-sees-pikachu-inspired-dumpling-bags-and-utilitarian-wear` | `/id/blogs/media-stories/the-beyond-the-vines-for-pokemon-collection-sees-pikachu-inspired-dumpling-bags-and-utilitarian-wear` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/the-iconic-beyond-the-vines-micro-dumpling-bag-gets-a-new-look` | `/id/blogs/media-stories/the-iconic-beyond-the-vines-micro-dumpling-bag-gets-a-new-look` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/unsung-spore-icons-dumpling-bag-from-beyond-the-vines-goes-places` | `/id/blogs/media-stories/unsung-spore-icons-dumpling-bag-from-beyond-the-vines-goes-places` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/vogue-homegrown-label-beyond-the-vines-brings-its-signature-minimalist-style-to-a-new-design-studio` | `/id/blogs/media-stories/vogue-homegrown-label-beyond-the-vines-brings-its-signature-minimalist-style-to-a-new-design-studio` | Editorial | Inventory only | sitemap |
| `/blogs/media-stories/why-beyond-the-vines-is-so-big-on-functionality` | `/id/blogs/media-stories/why-beyond-the-vines-is-so-big-on-functionality` | Editorial | Inventory only | sitemap |
| `/blogs/news` | `/id/blogs/news` | Editorial | Inventory only | sitemap |
| `/blogs/promotions` | `/id/blogs/promotions` | Editorial | Inventory only | homepage-dom, sitemap |
| `/blogs/promotions/a-little-love-for-your-carryall` | `/id/blogs/promotions/a-little-love-for-your-carryall` | Editorial | Inventory only | homepage-dom, sitemap |
| `/blogs/promotions/beyond-the-vines-first-time-customer-promotion` | `/id/blogs/promotions/beyond-the-vines-first-time-customer-promotion` | Editorial | Inventory only | homepage-dom, sitemap |
| `/blogs/travelling-btv-express` | `/id/blogs/travelling-btv-express` | Editorial | Inventory only | sitemap |
| `/blogs/travelling-btv-express/daikanyama-t-site-mar-2023` | `/id/blogs/travelling-btv-express/daikanyama-t-site-mar-2023` | Editorial | Inventory only | sitemap |
| `/blogs/travelling-btv-express/daikanyama-t-site-nov-2023` | `/id/blogs/travelling-btv-express/daikanyama-t-site-nov-2023` | Editorial | Inventory only | sitemap |
| `/blogs/travelling-btv-express/main` | `/id/blogs/travelling-btv-express/main` | Editorial | Inventory only | homepage-dom, sitemap |
| `/blogs/travelling-btv-express/main-new` | `/id/blogs/travelling-btv-express/main-new` | Editorial | Inventory only | sitemap |
| `/blogs/travelling-btv-express/marina-bay-sands-apr-2023` | `/id/blogs/travelling-btv-express/marina-bay-sands-apr-2023` | Editorial | Inventory only | sitemap |
| `/blogs/travelling-btv-express/marina-bay-sands-jan-2024` | `/id/blogs/travelling-btv-express/marina-bay-sands-jan-2024` | Editorial | Inventory only | sitemap |
| `/blogs/travelling-btv-express/miyashita-park-jul-2023` | `/id/blogs/travelling-btv-express/miyashita-park-jul-2023` | Editorial | Inventory only | sitemap |
| `/blogs/travelling-btv-express/parco-shibuya-nov-2023` | `/id/blogs/travelling-btv-express/parco-shibuya-nov-2023` | Editorial | Inventory only | sitemap |
| `/blogs/travelling-btv-express/takashimaya-shopping-centre-dec-2022` | `/id/blogs/travelling-btv-express/takashimaya-shopping-centre-dec-2022` | Editorial | Inventory only | sitemap |
| `/blogs/travelling-btv-express/takashimaya-shopping-centre-feb-2024` | `/id/blogs/travelling-btv-express/takashimaya-shopping-centre-feb-2024` | Editorial | Inventory only | sitemap |

## Products

| Source route | Indonesian alternative | Template | Capture role | Evidence |
|---|---|---|---|---|
| `/products/3-part-modular-candle` | `/id/products/3-part-modular-candle` | Product detail | Inventory only | sitemap |
| `/products/a-world-beyond-500-piece-puzzle` | `/id/products/a-world-beyond-500-piece-puzzle` | Product detail | Inventory only | sitemap |
| `/products/alphabet-key-tag` | `/id/products/alphabet-key-tag` | Product detail | Inventory only | sitemap |
| `/products/beyond-boulevard-gift-wrap-l` | `/id/products/beyond-boulevard-gift-wrap-l` | Product detail | Inventory only | sitemap |
| `/products/beyond-boulevard-gift-wrap-xl` | `/id/products/beyond-boulevard-gift-wrap-xl` | Product detail | Inventory only | sitemap |
| `/products/beyond-boulevard-gift-wrap-xs` | `/id/products/beyond-boulevard-gift-wrap-xs` | Product detail | Inventory only | sitemap |
| `/products/beyond-boulevard-pocket-mirror` | `/id/products/beyond-boulevard-pocket-mirror` | Product detail | Inventory only | sitemap |
| `/products/beyond-boulevard-squishy` | `/id/products/beyond-boulevard-squishy` | Product detail | Inventory only | sitemap |
| `/products/beyond-the-vines-heart-glass-cup` | `/id/products/beyond-the-vines-heart-glass-cup` | Product detail | Inventory only | sitemap |
| `/products/beyond-the-vines-x-yashica-funtastic-keychain-camera` | `/id/products/beyond-the-vines-x-yashica-funtastic-keychain-camera` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/bow-pet-charm` | `/id/products/bow-pet-charm` | Product detail | Inventory only | sitemap |
| `/products/boxy-t-shirt-with-back-yoke` | `/id/products/boxy-t-shirt-with-back-yoke` | Product detail | Inventory only | sitemap |
| `/products/boxy-zipper-polo-tee` | `/id/products/boxy-zipper-polo-tee` | Product detail | Inventory only | sitemap |
| `/products/btv_liberty-fabric-heart-pouch` | `/id/products/btv_liberty-fabric-heart-pouch` | Product detail | Inventory only | sitemap |
| `/products/btv_liberty-fabric-round-pouch` | `/id/products/btv_liberty-fabric-round-pouch` | Product detail | Inventory only | sitemap |
| `/products/btv-shopper-tote-m` | `/id/products/btv-shopper-tote-m` | Product detail | Inventory only | sitemap |
| `/products/btv-to-go-phone-strap` | `/id/products/btv-to-go-phone-strap` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/btv-to-go-phone-strap-part-a` | `/id/products/btv-to-go-phone-strap-part-a` | Product detail | Inventory only | sitemap |
| `/products/btv-to-go-phone-strap-part-b` | `/id/products/btv-to-go-phone-strap-part-b` | Product detail | Inventory only | sitemap |
| `/products/btv-to-go-phone-strap-part-c` | `/id/products/btv-to-go-phone-strap-part-c` | Product detail | Inventory only | sitemap |
| `/products/canvas-carryall-0-5-special-edition` | `/id/products/canvas-carryall-0-5-special-edition` | Product detail | Inventory only | sitemap |
| `/products/canvas-carryall-1-5-special-edition` | `/id/products/canvas-carryall-1-5-special-edition` | Product detail | Inventory only | sitemap |
| `/products/canvas-logo-cap-special-edition` | `/id/products/canvas-logo-cap-special-edition` | Product detail | Inventory only | sitemap |
| `/products/chambray-boxy-short-sleeve-shirt` | `/id/products/chambray-boxy-short-sleeve-shirt` | Product detail | Inventory only | sitemap |
| `/products/chambray-toggle-midi-skirt` | `/id/products/chambray-toggle-midi-skirt` | Product detail | Inventory only | sitemap |
| `/products/classic-twill-logo-cap` | `/id/products/classic-twill-logo-cap` | Product detail | Inventory only | sitemap |
| `/products/classic-washed-twill-logo-cap` | `/id/products/classic-washed-twill-logo-cap` | Product detail | Inventory only | sitemap |
| `/products/colourblock-box-pouch` | `/id/products/colourblock-box-pouch` | Product detail | Inventory only | sitemap |
| `/products/colourblock-box-pouch-wristlet` | `/id/products/colourblock-box-pouch-wristlet` | Product detail | Inventory only | sitemap |
| `/products/colourblock-heart-pouch` | `/id/products/colourblock-heart-pouch` | Product detail | Inventory only | sitemap |
| `/products/colourblock-round-pouch` | `/id/products/colourblock-round-pouch` | Product detail | Inventory only | sitemap |
| `/products/colourblock-round-pouch-wristlet` | `/id/products/colourblock-round-pouch-wristlet` | Product detail | Inventory only | sitemap |
| `/products/colourblock-small-box-pouch` | `/id/products/colourblock-small-box-pouch` | Product detail | Inventory only | sitemap |
| `/products/confetti-dumpling-bag` | `/id/products/confetti-dumpling-bag` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/contrast-detail-baby-tee` | `/id/products/contrast-detail-baby-tee` | Product detail | Inventory only | sitemap |
| `/products/contrast-detail-long-sleeve-baby-tee` | `/id/products/contrast-detail-long-sleeve-baby-tee` | Product detail | Inventory only | sitemap |
| `/products/contrast-eyewear-pouch` | `-` | Product detail | Inventory only | homepage-dom |
| `/products/contrast-flat-pouch-set` | `-` | Product detail | Inventory only | homepage-dom |
| `/products/contrast-pet-collar` | `/id/products/contrast-pet-collar` | Product detail | Inventory only | sitemap |
| `/products/contrast-pet-leash` | `/id/products/contrast-pet-leash` | Product detail | Inventory only | sitemap |
| `/products/contrast-ribbed-tank-top` | `/id/products/contrast-ribbed-tank-top` | Product detail | Inventory only | sitemap |
| `/products/contrast-stitched-relaxed-organic-cotton-t-shirt` | `/id/products/contrast-stitched-relaxed-organic-cotton-t-shirt` | Product detail | Inventory only | sitemap |
| `/products/contrast-zip-wallet` | `-` | Product detail | Inventory only | homepage-dom |
| `/products/crunch-carryall-0-5` | `/id/products/crunch-carryall-0-5` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/crunch-carryall-01` | `/id/products/crunch-carryall-01` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/crunch-carryall-02` | `/id/products/crunch-carryall-02` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/crunch-carryall-03` | `/id/products/crunch-carryall-03` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/crunch-carryall-1-5` | `/id/products/crunch-carryall-1-5` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/crunch-organiser-01` | `/id/products/crunch-organiser-01` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/crunch-organiser-02` | `/id/products/crunch-organiser-02` | Product detail | Inventory only | sitemap |
| `/products/d-ring-carabiner-large` | `/id/products/d-ring-carabiner-large` | Product detail | Inventory only | sitemap |
| `/products/d-ring-carabiner-medium` | `/id/products/d-ring-carabiner-medium` | Product detail | Inventory only | sitemap |
| `/products/denim-logo-cap` | `/id/products/denim-logo-cap` | Product detail | Inventory only | sitemap |
| `/products/doodle` | `/id/products/doodle` | Product detail | Inventory only | sitemap |
| `/products/envelope-bag` | `/id/products/envelope-bag` | Product detail | Inventory only | sitemap |
| `/products/extra-small-studio-tote` | `/id/products/extra-small-studio-tote` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/eyewear-engraving` | `/id/products/eyewear-engraving` | Product detail | Inventory only | sitemap |
| `/products/furry-formies-set-of-4` | `/id/products/furry-formies-set-of-4` | Product detail | Inventory only | sitemap |
| `/products/geometric-pouch-set` | `/id/products/geometric-pouch-set` | Product detail | Inventory only | sitemap |
| `/products/gift-wrap-l` | `/id/products/gift-wrap-l` | Product detail | Inventory only | sitemap |
| `/products/gift-wrap-s` | `/id/products/gift-wrap-s` | Product detail | Inventory only | sitemap |
| `/products/gift-wrap-xl` | `/id/products/gift-wrap-xl` | Product detail | Inventory only | sitemap |
| `/products/gift-wrap-xs` | `/id/products/gift-wrap-xs` | Product detail | Inventory only | sitemap |
| `/products/glazed-poofy-bag` | `/id/products/glazed-poofy-bag` | Product detail | Inventory only | sitemap |
| `/products/glazed-poofy-trapeze-bag` | `/id/products/glazed-poofy-trapeze-bag` | Product detail | Inventory only | sitemap |
| `/products/gwp-3-part-modular-candle-box` | `/id/products/gwp-3-part-modular-candle-box` | Product detail | Inventory only | sitemap |
| `/products/gwp-leather-shoe-horn` | `/id/products/gwp-leather-shoe-horn` | Product detail | Inventory only | sitemap |
| `/products/heart-pet-charm` | `/id/products/heart-pet-charm` | Product detail | Inventory only | sitemap |
| `/products/holiday-round-pouch` | `/id/products/holiday-round-pouch` | Product detail | Inventory only | sitemap |
| `/products/kids-chambray-dress` | `/id/products/kids-chambray-dress` | Product detail | Inventory only | sitemap |
| `/products/kids-chambray-shirt` | `/id/products/kids-chambray-shirt` | Product detail | Inventory only | sitemap |
| `/products/kids-chambray-shorts` | `/id/products/kids-chambray-shorts` | Product detail | Inventory only | sitemap |
| `/products/kids-colourblock-backpack` | `/id/products/kids-colourblock-backpack` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/kids-colourblock-seersucker-skorts` | `/id/products/kids-colourblock-seersucker-skorts` | Product detail | Inventory only | sitemap |
| `/products/kids-colourblock-waffle-knit-shorts` | `/id/products/kids-colourblock-waffle-knit-shorts` | Product detail | Inventory only | sitemap |
| `/products/kids-contrast-striped-polo-dress` | `/id/products/kids-contrast-striped-polo-dress` | Product detail | Inventory only | sitemap |
| `/products/kids-contrast-striped-shorts` | `/id/products/kids-contrast-striped-shorts` | Product detail | Inventory only | sitemap |
| `/products/kids-striped-gathered-dress` | `/id/products/kids-striped-gathered-dress` | Product detail | Inventory only | sitemap |
| `/products/kids-striped-seersucker-shorts` | `/id/products/kids-striped-seersucker-shorts` | Product detail | Inventory only | sitemap |
| `/products/kids-striped-tank-top` | `/id/products/kids-striped-tank-top` | Product detail | Inventory only | sitemap |
| `/products/kids-striped-waffle-knit-shorts` | `/id/products/kids-striped-waffle-knit-shorts` | Product detail | Inventory only | sitemap |
| `/products/kids-waffle-knit-dress` | `/id/products/kids-waffle-knit-dress` | Product detail | Inventory only | sitemap |
| `/products/kids-waffle-knit-shirt` | `/id/products/kids-waffle-knit-shirt` | Product detail | Inventory only | sitemap |
| `/products/kids-waffle-knit-shorts` | `/id/products/kids-waffle-knit-shorts` | Product detail | Inventory only | sitemap |
| `/products/landscape-studio-tote` | `/id/products/landscape-studio-tote` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/large-colourblock-lunch-bag` | `/id/products/large-colourblock-lunch-bag` | Product detail | Inventory only | sitemap |
| `/products/large-stretch-studio-tote` | `/id/products/large-stretch-studio-tote` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/large-studio-tote` | `/id/products/large-studio-tote` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/m-dumpling-bag` | `/id/products/m-dumpling-bag` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/mens-belted-trouser` | `/id/products/mens-belted-trouser` | Product detail | Inventory only | sitemap |
| `/products/mens-cocoon-fit-denim-trouser` | `/id/products/mens-cocoon-fit-denim-trouser` | Product detail | Inventory only | sitemap |
| `/products/mens-jersey-cargo-trouser` | `/id/products/mens-jersey-cargo-trouser` | Product detail | Inventory only | sitemap |
| `/products/mens-long-sleeve-oxford-shirt` | `/id/products/mens-long-sleeve-oxford-shirt` | Product detail | Inventory only | sitemap |
| `/products/mens-long-sleeve-t-shirt` | `/id/products/mens-long-sleeve-t-shirt` | Product detail | Inventory only | sitemap |
| `/products/mens-relaxed-organic-cotton-t-shirt` | `/id/products/mens-relaxed-organic-cotton-t-shirt` | Product detail | Inventory only | sitemap |
| `/products/mens-relaxed-pocket-t-shirt` | `/id/products/mens-relaxed-pocket-t-shirt` | Product detail | Inventory only | sitemap |
| `/products/mens-short-sleeve-jersey-overshirt` | `/id/products/mens-short-sleeve-jersey-overshirt` | Product detail | Inventory only | sitemap |
| `/products/mens-straight-leg-denim-trouser` | `/id/products/mens-straight-leg-denim-trouser` | Product detail | Inventory only | sitemap |
| `/products/mens-striped-relaxed-t-shirt` | `/id/products/mens-striped-relaxed-t-shirt` | Product detail | Inventory only | sitemap |
| `/products/mens-tapered-fit-denim-trouser` | `/id/products/mens-tapered-fit-denim-trouser` | Product detail | Inventory only | sitemap |
| `/products/micro-dumpling-bag` | `/id/products/micro-dumpling-bag` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/mini-parapouch` | `/id/products/mini-parapouch` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/mini-tools-charm-set` | `/id/products/mini-tools-charm-set` | Product detail | Inventory only | sitemap |
| `/products/monster-fur-friends-key-tag` | `/id/products/monster-fur-friends-key-tag` | Product detail | Inventory only | sitemap |
| `/products/oval-carabiner-small` | `/id/products/oval-carabiner-small` | Product detail | Inventory only | sitemap |
| `/products/oxford-long-sleeve-shirt` | `/id/products/oxford-long-sleeve-shirt` | Product detail | Inventory only | sitemap |
| `/products/parallel-eyewear-contour` | `/id/products/parallel-eyewear-contour` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/parallel-eyewear-horizon` | `/id/products/parallel-eyewear-horizon` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/parallel-eyewear-tangent` | `/id/products/parallel-eyewear-tangent` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/parapack-001` | `/id/products/parapack-001` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/parapack-002` | `/id/products/parapack-002` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/parapocket-001` | `/id/products/parapocket-001` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/parapocket-002` | `/id/products/parapocket-002` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/parapouch` | `/id/products/parapouch` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/parasatchel-002` | `/id/products/parasatchel-002` | Product detail | Inventory only | sitemap |
| `/products/pet-cap` | `/id/products/pet-cap` | Product detail | Inventory only | sitemap |
| `/products/pet-carrier` | `/id/products/pet-carrier` | Product detail | Inventory only | sitemap |
| `/products/pet-collapsible-bowl-large` | `/id/products/pet-collapsible-bowl-large` | Product detail | Inventory only | sitemap |
| `/products/pet-collapsible-bowl-small` | `/id/products/pet-collapsible-bowl-small` | Product detail | Inventory only | sitemap |
| `/products/pet-harness` | `/id/products/pet-harness` | Product detail | Inventory only | sitemap |
| `/products/pet-t-shirt` | `/id/products/pet-t-shirt` | Product detail | Inventory only | sitemap |
| `/products/petal-pocket-mirror` | `/id/products/petal-pocket-mirror` | Product detail | Inventory only | sitemap |
| `/products/pocket-mirror` | `/id/products/pocket-mirror` | Product detail | Inventory only | sitemap |
| `/products/pocket-poofy-bag` | `/id/products/pocket-poofy-bag` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/poofy-bag` | `/id/products/poofy-bag` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/relaxed-t-shirt-with-pocket` | `/id/products/relaxed-t-shirt-with-pocket` | Product detail | Inventory only | sitemap |
| `/products/round-carabiner-small` | `/id/products/round-carabiner-small` | Product detail | Inventory only | sitemap |
| `/products/small-colourblock-lunch-bag` | `/id/products/small-colourblock-lunch-bag` | Product detail | Inventory only | sitemap |
| `/products/small-stretch-studio-tote` | `/id/products/small-stretch-studio-tote` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/small-studio-tote` | `/id/products/small-studio-tote` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/soft-jersey-reusable-face-mask` | `/id/products/soft-jersey-reusable-face-mask` | Product detail | Inventory only | sitemap |
| `/products/stretch-pouch-large` | `/id/products/stretch-pouch-large` | Product detail | Inventory only | sitemap |
| `/products/studio-sneaker` | `/id/products/studio-sneaker` | Product detail | Inventory only | sitemap |
| `/products/suede-dumpling-bag` | `/id/products/suede-dumpling-bag` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/teeny-tiny-micro-mini-dumpling-bag` | `/id/products/teeny-tiny-micro-mini-dumpling-bag` | Product detail | Inventory only | sitemap |
| `/products/the-carnival-bag` | `/id/products/the-carnival-bag` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/toggle-midi-skirt` | `/id/products/toggle-midi-skirt` | Product detail | Inventory only | sitemap |
| `/products/two-tone-travel-pouch-extra-small` | `/id/products/two-tone-travel-pouch-extra-small` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/two-tone-travel-pouch-small` | `/id/products/two-tone-travel-pouch-small` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/unisex-boxy-denim-shirt` | `/id/products/unisex-boxy-denim-shirt` | Product detail | Inventory only | sitemap |
| `/products/utility-pinstripe-suiting-shorts` | `/id/products/utility-pinstripe-suiting-shorts` | Product detail | Inventory only | sitemap |
| `/products/utility-pinstripe-suiting-trouser` | `/id/products/utility-pinstripe-suiting-trouser` | Product detail | Inventory only | sitemap |
| `/products/womens-barrel-jersey-trouser` | `/id/products/womens-barrel-jersey-trouser` | Product detail | Inventory only | sitemap |
| `/products/womens-belt-detail-cami-top` | `/id/products/womens-belt-detail-cami-top` | Product detail | Inventory only | sitemap |
| `/products/womens-belt-detail-jumpsuit` | `/id/products/womens-belt-detail-jumpsuit` | Product detail | Inventory only | sitemap |
| `/products/womens-boxy-sleeveless-top` | `/id/products/womens-boxy-sleeveless-top` | Product detail | Inventory only | sitemap |
| `/products/womens-classic-long-sleeve-shirt` | `/id/products/womens-classic-long-sleeve-shirt` | Product detail | Representative product | homepage-dom, sitemap |
| `/products/womens-contrast-ribbed-tank-top` | `/id/products/womens-contrast-ribbed-tank-top` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/womens-cotton-boxy-shirt-dress` | `/id/products/womens-cotton-boxy-shirt-dress` | Product detail | Inventory only | sitemap |
| `/products/womens-front-wrap-shorts` | `/id/products/womens-front-wrap-shorts` | Product detail | Inventory only | sitemap |
| `/products/womens-front-wrap-trouser` | `/id/products/womens-front-wrap-trouser` | Product detail | Inventory only | sitemap |
| `/products/womens-knit-cardigan` | `/id/products/womens-knit-cardigan` | Product detail | Inventory only | sitemap |
| `/products/womens-linen-long-sleeve-shirt` | `/id/products/womens-linen-long-sleeve-shirt` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/womens-panelled-overshirt` | `/id/products/womens-panelled-overshirt` | Product detail | Inventory only | sitemap |
| `/products/womens-pleated-barrel-jersey-trouser` | `/id/products/womens-pleated-barrel-jersey-trouser` | Product detail | Inventory only | sitemap |
| `/products/womens-racer-back-dress` | `/id/products/womens-racer-back-dress` | Product detail | Inventory only | sitemap |
| `/products/womens-relaxed-fit-denim-trouser` | `/id/products/womens-relaxed-fit-denim-trouser` | Product detail | Inventory only | sitemap |
| `/products/womens-relaxed-organic-cotton-t-shirt` | `/id/products/womens-relaxed-organic-cotton-t-shirt` | Product detail | Inventory only | sitemap |
| `/products/womens-shrunken-organic-cotton-t-shirt` | `/id/products/womens-shrunken-organic-cotton-t-shirt` | Product detail | Inventory only | sitemap |
| `/products/womens-straight-leg-denim-trouser` | `/id/products/womens-straight-leg-denim-trouser` | Product detail | Inventory only | sitemap |
| `/products/womens-striped-relaxed-t-shirt` | `/id/products/womens-striped-relaxed-t-shirt` | Product detail | Inventory only | sitemap |
| `/products/womens-tapered-barrel-denim-trouser` | `/id/products/womens-tapered-barrel-denim-trouser` | Product detail | Inventory only | sitemap |
| `/products/xl-dumpling-bag` | `/id/products/xl-dumpling-bag` | Product detail | Inventory only | homepage-dom, sitemap |
| `/products/xs-dumpling-bag` | `/id/products/xs-dumpling-bag` | Product detail | Inventory only | homepage-dom, sitemap |

## Homepage Sections

Homepage section inventory remains supported by `reference/data/homepage-sections.json`. Homepage visual verification remains open per `SESSION_HANDOFF.md`.

The source is Shopify-rendered. Earlier homepage discovery found 18 CSS resources, 4 font resources, 41 JavaScript resources, 190 media assets, 390 links, and 435 runtime animations.
