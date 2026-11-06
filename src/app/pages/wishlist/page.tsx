import { NewsletterSection, SiteChrome } from "@/components/HomePage";
import WishlistPage from "@/components/pages/WishlistPage";
import { wishlistRepository } from "@/lib/pages/wishlist";
// Source page.swym rules (generated, scoped to .template-page-swym) followed by local overrides.
import "./wishlist-source.css";
import "./wishlist-page.css";

export function generateMetadata() {
  return { title: wishlistRepository.get().documentTitle };
}

export default function WishlistRoute() {
  return (
    <SiteChrome backToTop>
      {/* Stands in for the source <body> classes of template-page-swym (scopes wishlist-source.css). */}
      <div className="template-page template-page-swym animations-false button-uppercase-false navigation-uppercase-true product-title-uppercase-false swym-ready swym-wishlist-container-rendered swym-buttons-loaded">
        <WishlistPage page={wishlistRepository.get()} />
      </div>
      <NewsletterSection />
    </SiteChrome>
  );
}
