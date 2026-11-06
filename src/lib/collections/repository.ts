// Collection repository (server side): the only module that reads the collection fixtures at build time
// (src/data/collections/<handle>.json, built by scripts/build-collection-data.mjs from 2026-11-06 source captures).
// The client grid loads the full dataset lazily through ./client.ts, so only the initial grid ships in the page.
// A CMS/Shopify adapter replaces both behind the same types (src/lib/collections/types.ts).
import newIn from "@/data/collections/new-in.json";
import { gridColumns, visibleKeys } from "./query";
import type { CollectionData, CollectionInitial } from "./types";

const fixtures: Record<string, CollectionData> = { "new-in": newIn as unknown as CollectionData };

export const collectionRepository = {
  handles: (): string[] => Object.keys(fixtures),
  get: (handle: string): CollectionData | undefined => fixtures[handle],
  /** Metadata plus the cards of the initial grid (Featured, no filter, first load-more page + row fill). */
  initial: (handle: string): CollectionInitial | undefined => {
    const data = fixtures[handle];
    if (!data) return undefined;
    const { cards, views, ...meta } = data;
    const view = views[""];
    const { keys, hasMore } = visibleKeys(view, 1, data.pagination.perPage, gridColumns(data.gridClass), data.promos);
    return { ...meta, countText: view.countText, keys, hasMore, cards: Object.fromEntries(keys.map((k) => [k, cards[k]])) };
  },
};
