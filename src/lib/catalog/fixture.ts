// Fixture catalog adapter (server only). Products come from src/data/product-details.json, built from the
// manisgrafika.id WooCommerce captures by scripts/manisgrafika/build-catalog.mjs; homepage rail cards and their hover
// images come from src/data/homepage.json and product-card-interactions.json (same builder).
// The MySQL adapter replaces this module behind CatalogRepository (src/lib/data.ts).
import "server-only";
import detailData from "@/data/product-details.json";
import homepage from "@/data/homepage.json";
import interactionData from "@/data/product-card-interactions.json";
import { sanitizeRichText } from "@/lib/html/sanitize";
import { isSoldOut, optionValues } from "./types";
import type { CatalogRepository, CardLabel, PreviewCollection, Product, ProductDetail, ProductSummary, RailCard } from "./types";

type RawDetail = Omit<ProductDetail, "tabs" | "multicolumn"> & {
  tabs: { key: string; title: string; panelHtml: string }[];
  multicolumn: { heading: string; columns: (Omit<NonNullable<ProductDetail["multicolumn"]>["columns"][number], "html"> & { html: string })[] } | null;
  collections: string[];
  sourceUrl: string;
};
type RawCard = (typeof homepage.collections)[number]["products"][number];
type Interaction = NonNullable<RailCard["interaction"]>;

const rawDetails = detailData as unknown as Record<string, RawDetail>;
const interactions = interactionData as Record<string, Interaction>;

export const handleOf = (href: string) => href.split("/").filter(Boolean).pop() ?? href;
const parsePrice = (text: string) => Number(text.replace(/[^0-9]/g, "")) || 0;

function toDomain(d: RawDetail): Product {
  return {
    handle: d.handle,
    title: d.title,
    price: parsePrice(d.priceText),
    options: d.options.map((o, i) => ({ name: o.name, values: [...new Set([...o.values, ...d.variants.map((v) => v.options[i])])] })),
    variants: d.variants.map((v) => ({
      id: String(v.id), sku: v.sku, options: v.options, price: v.price, compareAtPrice: v.compareAtPrice, available: v.available,
      visible: v.options.every((value, i) => d.options[i].values.includes(value)),
    })),
    images: d.galleries.flatMap((g) => g.images.map((i) => ({ src: i.src, alt: i.alt, option: g.colour }))),
    labels: [...new Set(d.variants.flatMap((v) => v.labels))],
    template: d.template,
    minOrder: d.minOrder,
    personalisation: d.personalisation,
    collections: d.collections,
  };
}

function toDetail(d: RawDetail): ProductDetail {
  const { collections: _collections, sourceUrl: _sourceUrl, ...view } = d;
  return {
    ...view,
    tabs: d.tabs.map((t) => ({ ...t, panelHtml: sanitizeRichText(t.panelHtml) })),
    multicolumn: d.multicolumn ? { ...d.multicolumn, columns: d.multicolumn.columns.map((c) => ({ ...c, html: sanitizeRichText(c.html) })) } : null,
  };
}

const products = new Map(Object.values(rawDetails).map((d) => [d.handle, toDomain(d)]));
const details = new Map<string, ProductDetail>();

/** A product needs the product page when the customer has to choose between option values or personalise it. */
const needsOptions = (p: Product) => p.options.some((o) => o.values.length > 1) || !!p.personalisation?.fields.some((f) => f.required);

/** Summary = domain product (price, options, availability) + its card presentation (first image, cover swatches). */
function toSummary(product: Product): ProductSummary {
  const interaction = interactions[product.title];
  const image = product.images[0]?.src ?? "";
  return {
    handle: product.handle,
    title: product.title,
    price: product.price,
    image,
    images: [image, ...(interaction?.secondaryImages ?? [])],
    colours: interaction?.variants.length
      ? interaction.variants.map((v) => ({ label: v.label, image: v.image || image, thumbnail: v.thumbnail, soldOut: v.soldOut }))
      : [],
    sizes: optionValues(product, "Size"),
    soldOut: isSoldOut(product),
    labels: product.labels,
    needsOptions: needsOptions(product),
  };
}

const summaries = new Map([...products.values()].map((p) => [p.handle, toSummary(p)]));
const previewCollections: PreviewCollection[] = homepage.collections.map((c) => ({
  handle: handleOf(c.shopMore),
  title: c.title,
  products: c.products.map((card) => {
    const summary = summaries.get(handleOf(card.href));
    if (!summary) throw new Error(`Homepage card ${card.href} has no product record`);
    return summary;
  }),
}));

export function toRailCard(card: RawCard): RailCard {
  const product = products.get(handleOf(card.href))!;
  const summary = summaries.get(product.handle)!;
  return {
    title: card.title,
    href: card.href,
    price: card.price,
    compareAtPrice: card.compareAtPrice ?? null,
    image: card.image,
    swatchSelected: card.swatchSelected,
    swatchSuffix: card.swatchSuffix,
    labels: card.labels as CardLabel[],
    overlayLabels: card.overlayLabels as CardLabel[],
    button: card.button === "notify" ? "notify" : "add",
    interaction: interactions[card.title] ?? null,
    quickAdd: { handle: summary.handle, price: summary.price, needsOptions: summary.needsOptions, minOrder: product.minOrder },
  };
}

export const fixtureCatalog: CatalogRepository = {
  listProducts: async () => [...products.values()],
  getProduct: async (handle) => products.get(handle) ?? null,
  listSummaries: async () => [...summaries.values()],
  getSummary: async (handle) => summaries.get(handle) ?? null,
  getProductPage: async (handle) => {
    const raw = rawDetails[handle];
    if (!raw || raw.template !== "standard") return null;
    if (!details.has(handle)) details.set(handle, toDetail(raw));
    return details.get(handle)!;
  },
  listPreviewCollections: async () => previewCollections,
  getPreviewCollection: async (handle) => previewCollections.find((c) => c.handle === handle) ?? null,
};
