// Search repository: template metadata from src/data/search.json (scripts/build-search-data.mjs, 2026-11-06 snapshot)
// and the MOCK search index (the /collections/new-in dataset, loaded lazily on the client). A CMS/Shopify adapter
// replaces `loadSearchIndex` + `runSearch` with the storefront search API.
import meta from "@/data/search.json";
import { loadCollection } from "@/lib/collections/client";
import type { SearchMeta } from "./types";

export const searchRepository = {
  meta: (): SearchMeta => meta as SearchMeta,
  loadSearchIndex: () => loadCollection("new-in"),
};
