// Collection page data types (source template `collection` / section `product-grid`). The fixture behind them is built
// by scripts/build-collection-data.mjs from source captures; the CMS adapter must return the same shapes.
import type { ProductCard } from "@/lib/catalog/types";

export type { ProductCard };

export type CollectionCrumb = { href: string; title: string; label: string };
export type SortOption = { value: string; label: string };

export type FacetValue = {
  value: string;
  id: string;
  label: string;
  /** Source count text such as "(75)" (product count of the unfiltered collection), or null. */
  count: string | null;
  tooltip: string | null;
  labelClass?: string;
  inputClass?: string;
  /** Raw --bg-color written by the theme (a colour name, a size handle or var(--bg-body)). */
  bg: string | null;
  /** Local swatch image (null when the source has none or its file is missing on the source CDN). */
  image: string | null;
};

export type Facet = {
  index: number;
  title: string;
  open: boolean;
  kind: "swatch" | "list" | "availability";
  /** Query parameter name, e.g. filter.v.option.colour. */
  name: string;
  listClass: string | null;
  values: FacetValue[];
};

export type CollectionPromo = {
  className: string;
  id: string;
  /** 1-based grid slot the promotion occupies (theme promo config). */
  position: number;
  showOnce: boolean;
  afterGrid: boolean;
  itemStyle: string;
  ratio: number;
  ratioMobile: number;
  mobileMedia: string | null;
  mobileSrc: string | null;
  imgStyle: string;
  src: string | null;
  alt: string;
  imgClass: string;
  contentClass: string;
  href: string | null;
  target: string | null;
};

/** Card keys (theme getProductId identity, "variant:<id>") of each load-more page of one source result set. */
export type CollectionView = { countText: string; pages: string[][] };

export type CollectionMeta = {
  handle: string;
  title: string;
  documentTitle: string;
  sectionId: string;
  gridClass: string;
  promoInterval: number;
  promoRepeat: boolean;
  breadcrumb: CollectionCrumb[];
  sort: { bar: SortOption[]; barList: SortOption[]; mobile: SortOption[]; initial: string };
  facets: Facet[];
  promos: CollectionPromo[];
  pagination: { className: string; perPage: number; totalPages: number };
};

/** Full dataset of one collection: metadata, every card, and every captured source view (sorts, single facets). */
export type CollectionData = CollectionMeta & {
  cards: Record<string, ProductCard>;
  /** Keyed by the decoded query string of the source request ("" = Featured, "sort_by=price-ascending",
   *  "filter.v.option.size=XS", ...). */
  views: Record<string, CollectionView>;
};

/** Filter + sort state, mirroring the source URL parameters. */
export type CollectionQuery = { sort: string; filters: { name: string; value: string }[] };

/** What the first server render needs: metadata plus the cards of the initial (unfiltered, Featured) grid. */
export type CollectionInitial = CollectionMeta & { countText: string; keys: string[]; cards: Record<string, ProductCard>; hasMore: boolean };

/** /collections list page (source template list-collections). */
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

/** Server-side collection reads (page render). */
export interface CollectionRepository {
  handles(): Promise<string[]>;
  /** Metadata plus the cards of the initial grid (Featured, no filter, first load-more page + row fill). */
  getInitial(handle: string): Promise<CollectionInitial | null>;
  getList(): Promise<CollectionList>;
}

/** Browser-side source of the full collection dataset (load more, filters, sort, search index). */
export interface CollectionDataSource {
  load(handle: string): Promise<CollectionData>;
}
