// Browser-side collection data source (load more, filters, sort, search index). MOCK backend: the full source-derived
// dataset is a lazily imported fixture chunk instead of the Shopify section-rendering requests the source makes
// (docs/mock-behaviors.md "Collection filters and sort"). The backend phase replaces `fixtureCollectionSource` with a
// fetch to the collection API behind the same CollectionDataSource interface.
import type { CollectionData, CollectionDataSource } from "./types";

// Every Manis Grafika collection lives in one small chunk (23 products), loaded once.
let all: Promise<Record<string, CollectionData>> | null = null;

const fixtureCollectionSource: CollectionDataSource = {
  load(handle) {
    all ??= import("@/data/collections/collections.json").then((m) => m.default as unknown as Record<string, CollectionData>);
    return all.then((data) => data[handle] ?? Promise.reject(new Error(`No collection data for ${handle}`)));
  },
};

export const collectionSource: CollectionDataSource = fixtureCollectionSource;
