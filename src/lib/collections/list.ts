// Collection list repository (/collections, source template list-collections). Backed by the source-derived fixture
// src/data/collection-list.json (scripts/build-collection-list-data.mjs, 2026-11-06 snapshot); a CMS adapter that lists
// collections replaces it behind the same type.
import fixture from "@/data/collection-list.json";

export type CollectionListCard = {
  cardClass: string;
  imageClass: string;
  /** --var-media-aspect-ratio (image height / width, %). */
  ratio: number;
  href: string;
  title: string;
  width: number;
  height: number;
  /** Low-quality 20px placeholder the theme puts in src before lazysizes swaps in the srcset. */
  placeholder: string;
  srcset: { src: string; w: number }[];
  alt: string;
  /** Source URL of the full-size original (only requested by the <noscript> fallback; not mirrored). */
  original: string;
  label: string;
};

export type CollectionList = {
  documentTitle: string;
  sectionId: string;
  sectionClass: string;
  listClass: string;
  listStyle: string;
  headerClass: string;
  headerStyle: string;
  headingClass: string;
  heading: string;
  rowClass: string;
  rowStyle: string;
  sectionStyle: string;
  cards: CollectionListCard[];
};

export const collectionListRepository = { get: (): CollectionList => fixture as CollectionList };
