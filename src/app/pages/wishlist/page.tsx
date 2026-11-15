import { NewsletterSection, SiteChrome } from "@/components/shell/SiteChrome";
import WishlistPage from "@/components/pages/WishlistPage";
import { repositories } from "@/lib/data";
// Source page.swym rules (generated, scoped to .template-page-swym) followed by local overrides.
import "./wishlist-source.css";
import "./wishlist-page.css";

export async function generateMetadata() {
  return { title: (await repositories.pages.getWishlistPage()).documentTitle };
}

export default async function WishlistRoute() {
  const data = await repositories.pages.getWishlistPage();
  return (
    <SiteChrome backToTop>
      {/* Stands in for the source <body> classes of template-page-swym (scopes wishlist-source.css). */}
      <div className="template-page template-page-swym animations-false button-uppercase-false navigation-uppercase-true product-title-uppercase-false swym-ready swym-wishlist-container-rendered swym-buttons-loaded">
        <WishlistPage page={data} />
      </div>
      <NewsletterSection />
    </SiteChrome>
  );
}
