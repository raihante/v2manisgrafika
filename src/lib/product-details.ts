// Product detail repository: the only module that reads the PDP fixture (src/data/product-details.json, built by
// scripts/build-product-details.mjs from source captures). Server-side only, so the fixture stays out of client bundles;
// a CMS/Shopify adapter can replace it behind the same interface.
import detailData from "@/data/product-details.json";

export type CardLabel = { className: string; text: string };
export type CardSwatch = { value: string; image: string; active: boolean; soldOut: boolean; href: string };
// A product card as the source product-grid renders it (Pair It With, You May Also Like).
export type ProductCard = {
  title: string;
  href: string;
  imageHref: string;
  ratio: number;
  handle: string | null;
  variantId: number | null;
  price: string;
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
export type ProductVariant = { id: number; options: string[]; available: boolean; sku: string; labels: string[] };
// src = 2000w (the source <img src>), srcset/sizes exactly as the source gallery, thumb = 1200w copy (cart line image).
export type GalleryImage = { src: string; srcset: string; sizes: string; thumb: string; alt: string; ratio: number };
// panelHtml is the source rich text of the tab panel; {{SKU}} is replaced with the selected variant's SKU.
export type ProductTab = { key: string; title: string; panelHtml: string };
export type MulticolumnColumn = { className: string; href: string; image: string | null; width: number | null; height: number | null; ratio: number; title: string; html: string; button: { href: string; label: string } | null };
// Template multicolumn section (bags: "Compare ... Series"); html is the source rich text of each column.
export type Multicolumn = { heading: string; columns: MulticolumnColumn[] };
export type ProductDetail = {
  handle: string;
  title: string;
  priceText: string;
  // values in rendered order; ids = radio id suffix per value (product option order); colors = raw --option-color per value.
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
};
const details = detailData as unknown as Record<string, ProductDetail>;

export const productDetails = {
  // Standard-template products only; bundle products keep the fallback page until a bundle UI exists.
  // MOCK images: every image URL in the fixture is a dummyimage.com placeholder (docs/mock-behaviors.md "Product images").
  get: (handle: string): ProductDetail | undefined => {
    const d = details[handle];
    return d?.template === "standard" ? d : undefined;
  },
};
