// Search page (source template `search`: main-collection-banner + main-search) data types. The markup metadata comes from
// src/data/search.json (scripts/build-search-data.mjs); results come from the local MOCK search (./query.ts).
import type { CollectionCrumb, Facet, ProductCard, SortOption } from "@/lib/collections/types";

export type SearchMeta = {
  documentTitle: { empty: string; results: string };
  bannerSectionId: string;
  searchSectionId: string;
  bannerClass: string;
  bannerStyle: string;
  breadcrumbHome: { href: string; label: string };
  breadcrumbCurrent: string;
  title: string;
  placeholder: string;
  /** "{count} results found for “{q}”" */
  resultsText: string;
  barCrumbs: CollectionCrumb[];
  /** Hidden inputs after q in both facet forms (options[prefix]=last). */
  hiddenInputs: { name: string; value: string }[];
  sort: { bar: SortOption[]; barList: SortOption[]; mobile: SortOption[]; initial: string };
  gridClass: string;
  paginationClass: string;
  perPage: number;
  countLabel: string;
  facetTitles: string[];
};

/** Search state as the source URL carries it: ?q=&options[prefix]=last&filter.*=&sort_by=&page=. */
export type SearchQuery = { q: string; sort: string; page: number; filters: { name: string; value: string }[] };

export type SearchResult = {
  /** Number of matching products after filters. */
  count: number;
  totalPages: number;
  /** Card keys shown on the current page. */
  keys: string[];
  cards: Record<string, ProductCard>;
  /** Facets with the values present in the query results, counts and input ids as the source renders them. */
  facets: Facet[];
};
