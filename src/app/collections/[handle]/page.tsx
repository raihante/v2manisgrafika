import { notFound } from "next/navigation";
import { NewsletterSection, SiteChrome } from "@/components/shell/SiteChrome";
import CollectionGrid from "@/components/commerce/CollectionGrid";
import CollectionPage from "@/components/commerce/collection/CollectionPage";
import { repositories } from "@/lib/data";
// Source collection-page rules (generated, scoped to .template-collection) followed by local overrides.
import "./collection-source.css";
import "./collection-page.css";

export const dynamicParams = false;

// Source-template collections (round 257: new-in) plus the round-251 preview grids that have no source capture yet
// (bags, your-favourites; replaced when the navigation collections are captured, SESSION_HANDOFF.md).
const { catalog, collections } = repositories;

export async function generateStaticParams() {
  const handles = new Set([...(await collections.handles()), ...(await catalog.listPreviewCollections()).map((c) => c.handle)]);
  return [...handles].map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const source = await collections.getInitial(handle);
  if (source) return { title: source.documentTitle };
  return { title: `${(await catalog.getPreviewCollection(handle))?.title ?? "Collection"} – Beyond The Vines Indonesia` };
}

export default async function CollectionRoute({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const initial = await collections.getInitial(handle);
  if (initial) {
    return (
      <SiteChrome backToTop>
        {/* Stands in for the source <body> classes of template-collection (scopes collection-source.css). */}
        <div className="template-collection animations-false button-uppercase-false navigation-uppercase-true product-title-uppercase-false swym-ready swym-buttons-loaded">
          <CollectionPage initial={initial} />
        </div>
        <NewsletterSection />
      </SiteChrome>
    );
  }
  const collection = await catalog.getPreviewCollection(handle);
  if (!collection) notFound();
  return <SiteChrome><CollectionGrid collection={collection} /></SiteChrome>;
}
