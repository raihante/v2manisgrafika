// Fixture collection adapter (server only): src/data/collections/<handle>.json (scripts/build-collection-data.mjs) and
// src/data/collection-list.json (scripts/build-collection-list-data.mjs), 2026-11-06 snapshot. Only the cards of the
// initial grid ship in the page; the browser loads the full dataset through ./client.ts. The MySQL adapter replaces
// this module behind CollectionRepository (src/lib/data.ts).
import "server-only";
import listFixture from "@/data/collection-list.json";
import newIn from "@/data/collections/new-in.json";
import { gridColumns, visibleKeys } from "./query";
import type { CollectionData, CollectionList, CollectionRepository } from "./types";

const fixtures: Record<string, CollectionData> = { "new-in": newIn as unknown as CollectionData };

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
