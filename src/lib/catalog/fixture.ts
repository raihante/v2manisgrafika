// Fixture catalog adapter (server only). Domain products and the product page view come from
// src/data/product-details.json (scripts/build-product-details.mjs, 2026-11-06 captures); the compact summaries and
// homepage rail cards add the homepage card data (src/data/homepage.json, product-card-interactions.json).
// The MySQL adapter replaces this module behind CatalogRepository (src/lib/data.ts).
// MOCK images: every PDP image URL is a dummyimage.com placeholder (docs/mock-behaviors.md "Product images").
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
};
type RawCard = (typeof homepage.collections)[number]["products"][number];
type Interaction = NonNullable<RailCard["interaction"]>;

const rawDetails = detailData as unknown as Record<string, RawDetail>;
const interactions = interactionData as Record<string, Interaction>;

export const handleOf = (href: string) => href.split("/").filter(Boolean).pop() ?? href;
const parsePrice = (text: string) => Number(text.replace(/[^0-9]/g, "")) || 0;

function toDomain(d: RawDetail): Product {
  const price = parsePrice(d.priceText);
  return {
    handle: d.handle,
    title: d.title,
    price,
    options: d.options.map((o, i) => ({ name: o.name, values: [...new Set([...o.values, ...d.variants.map((v) => v.options[i])])] })),
    variants: d.variants.map((v) => ({
      id: String(v.id), sku: v.sku, options: v.options, price, available: v.available,
      visible: v.options.every((value, i) => d.options[i].values.includes(value)),
    })),
    images: d.galleries.flatMap((g) => g.images.map((i) => ({ src: i.src, alt: i.alt, option: g.colour }))),
    labels: [...new Set(d.variants.flatMap((v) => v.labels))],
    template: d.template,
  };
}

function toDetail(d: RawDetail): ProductDetail {
  return {
    ...d,
    tabs: d.tabs.map((t) => ({ ...t, panelHtml: sanitizeRichText(t.panelHtml) })),
    multicolumn: d.multicolumn ? { ...d.multicolumn, columns: d.multicolumn.columns.map((c) => ({ ...c, html: sanitizeRichText(c.html) })) } : null,
  };
}

const products = new Map(Object.values(rawDetails).map((d) => [d.handle, toDomain(d)]));
const details = new Map<string, ProductDetail>();

/** Summary = domain product (price, sizes, availability) + the homepage card presentation (image, hover images, swatches). */
function toSummary(card: RawCard, product: Product): ProductSummary {
  const interaction = interactions[card.title];
  return {
    handle: product.handle,
    title: product.title,
    price: product.price,
    image: card.image,
    images: [card.image, ...(interaction?.secondaryImages ?? [])],
    colours: interaction?.variants.length
      ? interaction.variants.map((v) => ({ label: v.label, image: v.image || card.image, thumbnail: v.thumbnail, soldOut: v.soldOut }))
      : [{ label: card.swatchSelected, image: card.image, thumbnail: null, soldOut: false }],
    sizes: optionValues(product, "Size"),
    soldOut: isSoldOut(product),
    labels: card.labels.map((l) => l.text),
  };
}

const summaries = new Map<string, ProductSummary>();
const previewCollections: PreviewCollection[] = homepage.collections.map((c) => ({
  handle: handleOf(c.shopMore),
  title: c.title,
  products: c.products.map((card) => {
    const handle = handleOf(card.href);
    const product = products.get(handle);
    if (!product) throw new Error(`Homepage card ${handle} has no product record`);
    if (!summaries.has(handle)) summaries.set(handle, toSummary(card, product));
    return summaries.get(handle)!;
  }),
}));

export function toRailCard(card: RawCard): RailCard {
  const summary = summaries.get(handleOf(card.href))!;
  return {
    title: card.title,
    href: card.href,
    price: card.price,
    image: card.image,
    swatchSelected: card.swatchSelected,
    swatchSuffix: card.swatchSuffix,
    labels: card.labels as CardLabel[],
    overlayLabels: card.overlayLabels as CardLabel[],
    button: card.button === "notify" ? "notify" : "add",
    interaction: interactions[card.title] ?? null,
    quickAdd: { handle: summary.handle, price: summary.price, needsOptions: summary.sizes.length > 0 },
  };
}

export const fixtureCatalog: CatalogRepository = {
  listProducts: async () => [...products.values()],
  getProduct: async (handle) => products.get(handle) ?? null,
  // Summaries exist for the homepage rail products (the 41-product preview catalog), in rail order.
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
