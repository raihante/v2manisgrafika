// Catalog types: the canonical domain product (what the future database stores) plus the view models the storefront
// components render. Adapters (fixtures today, the CMS database later) build the view models from the same product
// records, so there is one product model and several read shapes.
import type { SafeHtml } from "@/lib/html/safe-html";

/** Integer amount in Indonesian rupiah (IDR has no minor unit in the storefront). */
export type Money = number;

// ---------------------------------------------------------------------------------------------------------------
// Domain model
// ---------------------------------------------------------------------------------------------------------------

/** values = every value used by a variant: the storefront-visible values first (display order), then archived ones. */
export type ProductOptionDef = { name: string; values: string[] };

export type CatalogVariant = {
  id: string;
  sku: string;
  /** One value per product option, in option order. */
  options: string[];
  price: Money;
  /** Regular price shown struck through while a promotion runs; null when there is no promotion. */
  compareAtPrice: Money | null;
  available: boolean;
  /** False for archived colours the storefront no longer offers (the source keeps these variants but hides their
   *  option values; nearly all are sold out, parapack-002 "Cobalt" is still marked available). */
  visible: boolean;
};

/** One input the customer fills in for a personalised product (Manis Grafika "halaman redaksi"). */
export type PersonalisationField = {
  key: string;
  label: string;
  type: "photo" | "text" | "textarea";
  required: boolean;
  maxLength: number | null;
  help: string | null;
};

/** Per-product personalisation config (CMS-owned). Pages beyond freePages cost extraPagePrice per extraPageUnit pages. */
export type Personalisation = {
  freePages: number;
  extraPagePrice: Money;
  extraPageUnit: number;
  fields: PersonalisationField[];
};

export type CatalogImage = { src: string; alt: string; /** Colour value the image belongs to, or null for all. */ option: string | null };

export type Product = {
  handle: string;
  title: string;
  price: Money;
  options: ProductOptionDef[];
  variants: CatalogVariant[];
  images: CatalogImage[];
  labels: string[];
  /** "bundle" = product made of parts; it renders the approximate fallback page. */
  template: "standard" | "bundle";
  /** Smallest quantity per order line (Manis Grafika default 50 pcs). */
  minOrder: number;
  personalisation: Personalisation | null;
  /** Collection handles the product belongs to (category, sub-category and series). */
  collections: string[];
};

export const isSoldOut = (p: Product) => p.variants.length > 0 && p.variants.every((v) => !v.available);
export const optionValues = (p: Product, name: string) => p.options.find((o) => o.name.toLowerCase() === name.toLowerCase())?.values ?? [];

// ---------------------------------------------------------------------------------------------------------------
// View models
// ---------------------------------------------------------------------------------------------------------------

export type Colour = { label: string; image: string; thumbnail: string | null; soldOut: boolean };

/** Compact product used by predictive search, the cart quick add and the preview grids. */
export type ProductSummary = {
  handle: string;
  title: string;
  price: Money;
  image: string;
  images: string[];
  colours: Colour[];
  sizes: string[];
  soldOut: boolean;
  labels: string[];
  /** True when quick add cannot add directly (option choices, personalisation): the card opens the product page. */
  needsOptions: boolean;
};

/** Preview grid of the round-251 collections without a source capture (bags, your-favourites). */
export type PreviewCollection = { handle: string; title: string; products: ProductSummary[] };

export type CardLabel = { className: string; text: string };
/** image = swatch photo (empty when the swatch is a plain colour chip); color = chip colour or "". */
export type CardSwatch = { value: string; image: string; color?: string; active: boolean; soldOut: boolean; href: string };
/** A product card as the source product-grid renders it (collections, search, Pair It With, You May Also Like). */
export type ProductCard = {
  title: string;
  href: string;
  imageHref: string;
  ratio: number;
  handle: string | null;
  variantId: number | null;
  price: string;
  compareAtPrice?: string | null;
  priceFirst: boolean;
  primary: string | null;
  primaryClass: string;
  secondary: string[];
  swatches: CardSwatch[];
  swatchSelected: string;
  swatchSuffix: string;
  overlayLabels: CardLabel[];
  labels: CardLabel[];
  button: "add" | "notify";
};

export type ProductVariant = { id: number; options: string[]; available: boolean; sku: string; labels: string[]; price: Money; compareAtPrice: Money | null };
/** src = 2000w (the source <img src>), srcset/sizes exactly as the source gallery, thumb = 1200w copy (cart line image). */
export type GalleryImage = { src: string; srcset: string; sizes: string; thumb: string; alt: string; ratio: number };
/** panelHtml is sanitized rich text; {{SKU}} is replaced with the selected variant's SKU. */
export type ProductTab = { key: string; title: string; panelHtml: SafeHtml };
export type MulticolumnColumn = { className: string; href: string; image: string | null; width: number | null; height: number | null; ratio: number; title: string; html: SafeHtml; button: { href: string; label: string } | null };
/** Template multicolumn section (bags: "Compare ... Series"). */
export type Multicolumn = { heading: string; columns: MulticolumnColumn[] };

/** Product page view model (source product template). */
export type ProductDetail = {
  handle: string;
  title: string;
  priceText: string;
  /** values in rendered order; ids = radio id suffix per value (product option order); colors = raw --option-color per value. */
  options: { name: string; handle: string; values: string[]; ids: number[]; colors: string[]; groups: { name: string; values: string[] }[] | null }[];
  initial: string[];
  variants: ProductVariant[];
  galleries: { colour: string | null; images: GalleryImage[] }[];
  swatches: Record<string, string>;
  slideCount: number;
  tabs: ProductTab[];
  pairItWith: ProductCard[];
  related: ProductCard[];
  multicolumn: Multicolumn | null;
  template: "standard" | "bundle";
  minOrder: number;
  personalisation: Personalisation | null;
};

/** Homepage rail card (source featured-collection markup) with the quick-add data the card needs. */
export type RailCard = {
  title: string;
  href: string;
  price: string;
  compareAtPrice: string | null;
  image: string;
  swatchSelected: string;
  swatchSuffix: string;
  labels: CardLabel[];
  overlayLabels: CardLabel[];
  button: "add" | "notify";
  /** Hover images and colour swatches captured from the source card. */
  interaction: { secondaryImages: string[]; variants: { label: string; image: string | null; thumbnail: string | null; soldOut: boolean }[] } | null;
  /** Quick add: products that need choices (options, personalisation) open the product page instead. */
  quickAdd: { handle: string; price: Money; needsOptions: boolean; minOrder: number };
};

// ---------------------------------------------------------------------------------------------------------------
// Repository contract
// ---------------------------------------------------------------------------------------------------------------

export interface CatalogRepository {
  listProducts(): Promise<Product[]>;
  getProduct(handle: string): Promise<Product | null>;
  listSummaries(): Promise<ProductSummary[]>;
  getSummary(handle: string): Promise<ProductSummary | null>;
  /** Product page view; null for unknown handles and for bundle products (fallback page). */
  getProductPage(handle: string): Promise<ProductDetail | null>;
  listPreviewCollections(): Promise<PreviewCollection[]>;
  getPreviewCollection(handle: string): Promise<PreviewCollection | null>;
}
