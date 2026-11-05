// Catalog repository: the only module that reads product/collection fixtures.
// Components receive typed data from here so a CMS/Shopify adapter can replace the fixture backing later.
// PREVIEW SCOPE: data is limited to the products captured from the homepage rails (see docs/mock-behaviors.md).
import homepage from "@/data/homepage.json";
import interactionData from "@/data/product-card-interactions.json";

export type Colour = { label: string; image: string; thumbnail: string | null; soldOut: boolean };

export type Product = {
  handle: string;
  title: string;
  price: number;
  image: string;
  images: string[];
  colours: Colour[];
  sizes: string[];
  soldOut: boolean;
  labels: string[];
};

export type Collection = { handle: string; title: string; products: Product[] };

type Interaction = { secondaryImages: string[]; variants: { label: string; image: string | null; thumbnail: string | null; soldOut: boolean }[] };
const interactions = interactionData as Record<string, Interaction>;

// ASSUMPTION (not captured): only the representative product exposes a Size option in this preview.
// Discovery recorded Colour + Size with 12 variants (2 colours x 6 sizes); size labels follow the sampled apparel product.
const SIZE_OVERRIDES: Record<string, string[]> = {
  "womens-classic-long-sleeve-shirt": ["XS", "S", "M", "L", "XL", "XXL"],
};

const handleOf = (href: string) => href.split("/").filter(Boolean).pop() ?? href;
const parsePrice = (text: string) => Number(text.replace(/[^0-9]/g, "")) || 0;

type RawProduct = (typeof homepage.collections)[number]["products"][number];

function toProduct(raw: RawProduct): Product {
  const handle = handleOf(raw.href);
  const interaction = interactions[raw.title];
  const colours: Colour[] = interaction?.variants.length
    ? interaction.variants.map((v) => ({ label: v.label, image: v.image || raw.image, thumbnail: v.thumbnail, soldOut: v.soldOut }))
    : [{ label: raw.swatchSelected, image: raw.image, thumbnail: null, soldOut: false }];
  return {
    handle,
    title: raw.title,
    price: parsePrice(raw.price),
    image: raw.image,
    images: [raw.image, ...(interaction?.secondaryImages ?? [])],
    colours,
    sizes: SIZE_OVERRIDES[handle] ?? [],
    soldOut: raw.button === "notify",
    labels: raw.labels.map((l) => l.text),
  };
}

const products = new Map<string, Product>();
const collections: Collection[] = homepage.collections.map((c) => ({
  handle: handleOf(c.shopMore),
  title: c.title,
  products: c.products.map((raw) => {
    const product = products.get(handleOf(raw.href)) ?? toProduct(raw);
    products.set(product.handle, product);
    return product;
  }),
}));

export const catalog = {
  listCollections: (): Collection[] => collections,
  getCollection: (handle: string): Collection | undefined => collections.find((c) => c.handle === handle),
  listProducts: (): Product[] => [...products.values()],
  getProduct: (handle: string): Product | undefined => products.get(handle),
};

export const formatPrice = (amount: number) => `Rp ${amount.toLocaleString("id-ID")}`;

// Storefront branding used outside the homepage shell (checkout header, payment marks).
export const storefront = { logo: homepage.logo, payments: homepage.payments };
