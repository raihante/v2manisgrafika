// Collection data loader for the client grid (load more, filters, sort). MOCK backend: the full source-derived dataset
// is a lazily imported fixture chunk instead of the Shopify section-rendering requests the source makes
// (docs/mock-behaviors.md "Collection filters and sort"). A CMS adapter replaces `loadCollection` with real queries.
import type { CollectionData } from "./types";

const loaders: Record<string, () => Promise<{ default: unknown }>> = {
  "new-in": () => import("@/data/collections/new-in.json"),
};
const cache = new Map<string, Promise<CollectionData>>();

export function loadCollection(handle: string): Promise<CollectionData> {
  const loader = loaders[handle];
  if (!loader) return Promise.reject(new Error(`No collection data for ${handle}`));
  if (!cache.has(handle)) cache.set(handle, loader().then((m) => m.default as CollectionData));
  return cache.get(handle)!;
}
