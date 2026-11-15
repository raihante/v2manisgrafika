import { NewsletterSection, SiteChrome } from "@/components/shell/SiteChrome";
import CollectionListPage from "@/components/commerce/collection/CollectionListPage";
import { repositories } from "@/lib/data";
// Source list-collections rules (generated, scoped to .template-list-collections) followed by local overrides.
import "./list-collections-source.css";
import "./list-collections.css";

export async function generateMetadata() {
  return { title: (await repositories.collections.getList()).documentTitle };
}

export default async function CollectionsRoute() {
  const data = await repositories.collections.getList();
  return (
    <SiteChrome backToTop>
      {/* Stands in for the source <body> classes of template-list-collections (scopes list-collections-source.css). */}
      <div className="template-list-collections animations-false button-uppercase-false navigation-uppercase-true product-title-uppercase-false swym-buttons-loaded swym-ready">
        <CollectionListPage list={data} />
      </div>
      <NewsletterSection />
    </SiteChrome>
  );
}
