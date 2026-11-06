// Wishlist page repository (/pages/wishlist, source template page.swym). MOCK (docs/mock-behaviors.md "Wishlist page"):
// the source page is rendered by the Swym wishlist app; the fixture src/data/pages/wishlist.json
// (scripts/build-wishlist-data.mjs) holds its logged-out empty state only. A customer/wishlist API replaces it.
import fixture from "@/data/pages/wishlist.json";

export type WishlistPageData = {
  documentTitle: string;
  pageClass: string;
  titleBarClass: string;
  title: string;
  user: { label: string; text: string };
  tabs: { className: string; label: string; selected: boolean; text: string }[];
  detailClass: string;
  detailTitle: string;
  shareLabel: string;
  menuLabel: string;
  empty: { title: string; text: string; button: string };
};

export const wishlistRepository = { get: (): WishlistPageData => fixture as WishlistPageData };
