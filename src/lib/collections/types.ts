// Collection page data types (source template `collection` / section `product-grid`). The fixture behind them is built
// by scripts/build-collection-data.mjs from source captures; a CMS/Shopify adapter must return the same shapes.
import type { ProductCard } from "@/lib/product-details";

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
