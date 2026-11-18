// Fixture collection adapter (server only): src/data/collections/collections.json and src/data/collection-list.json,
// built from the Manis Grafika products by scripts/manisgrafika/build-catalog.mjs. Only the cards of the
// initial grid ship in the page; the browser loads the full dataset through ./client.ts. The MySQL adapter replaces
// this module behind CollectionRepository (src/lib/data.ts).
import "server-only";
import listFixture from "@/data/collection-list.json";
import collectionFixtures from "@/data/collections/collections.json";
import { gridColumns, visibleKeys } from "./query";
import type { CollectionData, CollectionList, CollectionRepository } from "./types";

const fixtures = collectionFixtures as unknown as Record<string, CollectionData>;

export const fixtureCollections: CollectionRepository = {
  handles: async () => Object.keys(fixtures),
  getInitial: async (handle) => {
    const data = fixtures[handle];
    if (!data) return null;
    const { cards, views, ...meta } = data;
    const view = views[""];
    const { keys, hasMore } = visibleKeys(view, 1, data.pagination.perPage, gridColumns(data.gridClass), data.promos);
    return { ...meta, countText: view.countText, keys, hasMore, cards: Object.fromEntries(keys.map((k) => [k, cards[k]])) };
  },
  getList: async () => listFixture as CollectionList,
};
