# Mock Behaviors

These frontend simulations must be reviewed and replaced when CMS/API integration begins.

| Feature | Current behavior | Storage | Replacement required |
|---|---|---|---|
| Search | Opens a visual search drawer; no product query is executed | None | CMS/catalog search API |
| Cart | Opens an empty-cart drawer; Add to Bag does not persist products | None | Cart and inventory API |
| Wishlist | Displays wishlist controls without persistence | None | Customer/wishlist API |
| Account | Link is visual only | None | Authentication and customer account |
| Newsletter | Accepts a valid email and changes the button to `Thank You` | Component state | Newsletter provider/API |
| Product links | Stay on the homepage to avoid broken unimplemented routes | None | CMS product routes |
| Navigation/footer links | Stay on the homepage until the remaining routes exist | None | CMS route registry |
| Promotion/category sliders | Operate from local fixtures | Component state | CMS-managed slides and scheduling |
| Product-card colour selection | Changes the displayed local image and active swatch only; no inventory or purchasable variant is selected | Component state backed by local interaction fixtures | Product variant, availability, pricing, and inventory API |

Do not treat any row as production functionality. At the start of CMS work, explicitly notify the owner that this ledger remains outstanding.
