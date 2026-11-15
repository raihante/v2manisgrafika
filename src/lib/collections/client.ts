// Browser-side collection data source (load more, filters, sort, search index). MOCK backend: the full source-derived
// dataset is a lazily imported fixture chunk instead of the Shopify section-rendering requests the source makes
// (docs/mock-behaviors.md "Collection filters and sort"). The backend phase replaces `fixtureCollectionSource` with a
// fetch to the collection API behind the same CollectionDataSource interface.
import type { CollectionData, CollectionDataSource } from "./types";

const loaders: Record<string, () => Promise<{ default: unknown }>> = {
  "new-in": () => import("@/data/collections/new-in.json"),
};
const cache = new Map<string, Promise<CollectionData>>();

const fixtureCollectionSource: CollectionDataSource = {
  load(handle) {
    const loader = loaders[handle];
    if (!loader) return Promise.reject(new Error(`No collection data for ${handle}`));
    if (!cache.has(handle)) cache.set(handle, loader().then((m) => m.default as CollectionData));
    return cache.get(handle)!;
  },
};

export const collectionSource: CollectionDataSource = fixtureCollectionSource;
