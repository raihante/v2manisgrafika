# Mock Behaviors

These frontend simulations must be reviewed and replaced when CMS/API integration begins.

| Feature | Current behavior | Storage | Replacement required |
|---|---|---|---|
| Search | Opens a visual search drawer; no product query is executed | None | CMS/catalog search API |
| Cart | `/cart` page lists line items; quantity/remove update locally; header badge shows count. Add to Bag (product page, or card for size-less products) writes to `localCart` | `localStorage` key `btv-preview-cart` via `CartService` (`src/lib/cart.ts`) | Shopify/CMS cart and inventory API |
| Wishlist | Displays wishlist controls without persistence | None | Customer/wishlist API |
| Account | Link is visual only | None | Authentication and customer account |
| Newsletter | Accepts a valid email and changes the button to `Thank You` | Component state | Newsletter provider/API |
| Product links | Open `/products/[handle]` for the 41 products captured from homepage rails; other handles 404 | Static params from `catalog` (`src/lib/catalog.ts`) | CMS product routes |
| Navigation/footer links | Point at source-equivalent paths; only `/collections/{new-in,bags,your-favourites}` exist, everything else shows the local 404 with a preview note | None | CMS route registry |
| Promotion/category sliders | Operate from local fixtures | Component state | CMS-managed slides and scheduling |
| Product-card colour selection | Changes the displayed local image and active swatch only; no inventory or purchasable variant is selected | Component state backed by local interaction fixtures | Product variant, availability, pricing, and inventory API |
| Collections | Only 3 collections, built from homepage rail fixtures; no filter, sort, or pagination | Fixture via `catalog` | CMS collection/listing API |
| Product detail | Colour from captured card variants; Size only on `womens-classic-long-sleeve-shirt` (assumed XS-XXL); no description, stock, or variant IDs | Fixture via `catalog` | Product, variant, inventory API |
| Checkout | One-page checkout at `/checkout`; HTML validation only; shipping methods/rates (Standard Rp 25.000, Express Rp 50.000) and province list are placeholders; card inputs are unnamed and never stored; Pay now waits 900ms, clears cart | Order summary (no card data) in `sessionStorage` key `btv-preview-last-order` | Shopify checkout / payment gateway (Visa, Mastercard, QRIS) |
| Order confirmation | `/checkout/thank-you` renders the mock order from `sessionStorage`; number is `#BTV` + timestamp digits | `sessionStorage` | Shopify order status page |
| 404 | All unimplemented routes show a local 404 with "Preview" note | None | Real routes as they are built |

Do not treat any row as production functionality. At the start of CMS work, explicitly notify the owner that this ledger remains outstanding.
