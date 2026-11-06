import { NewsletterSection, SiteChrome } from "@/components/HomePage";
import CollectionListPage from "@/components/commerce/collection/CollectionListPage";
import { collectionListRepository } from "@/lib/collections/list";
// Source list-collections rules (generated, scoped to .template-list-collections) followed by local overrides.
import "./list-collections-source.css";
import "./list-collections.css";

export function generateMetadata() {
  return { title: collectionListRepository.get().documentTitle };
}

export default function CollectionsRoute() {
  return (
    <SiteChrome backToTop>
      {/* Stands in for the source <body> classes of template-list-collections (scopes list-collections-source.css). */}
      <div className="template-list-collections animations-false button-uppercase-false navigation-uppercase-true product-title-uppercase-false swym-buttons-loaded swym-ready">
        <CollectionListPage list={collectionListRepository.get()} />
      </div>
      <NewsletterSection />
    </SiteChrome>
  );
}
