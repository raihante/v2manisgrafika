import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = "C:/Digitakarya/v2manisgrafika";
const content = JSON.parse(await readFile(path.join(ROOT, "reference/data/homepage-content.json"), "utf8"));
const manifest = JSON.parse(await readFile(path.join(ROOT, "reference/data/download-manifest.json"), "utf8"));
const localByUrl = new Map(
  manifest.filter((item) => item.status === "ok" && item.path).map((item) => [item.url, `/${item.path.replace(/^public\//, "")}`]),
);
const localByPath = new Map(
  manifest
    .filter((item) => item.status === "ok" && item.path && item.group === "assets")
    .map((item) => [new URL(item.url).pathname, `/${item.path.replace(/^public\//, "")}`]),
);

const localAsset = (url) => (url ? localByUrl.get(url) || localByPath.get(new URL(url).pathname) || null : null);
const sectionBy = (fragment) => content.sections.find((section) => section.id.includes(fragment));

const normalizeProducts = (section, limit = 12) => {
  const seen = new Set();
  const products = [];
  for (const product of section?.products || []) {
    if (!product.title || !product.href || seen.has(product.href)) continue;
    const imageUrl = (product.images || []).find((url) => !/PIXEL_HEART|HEART_FILL/i.test(url));
    const image = localAsset(imageUrl);
    if (!image) continue;
    seen.add(product.href);
    products.push({
      title: product.title,
      price: product.price.replace(/\s*\/\s*$/, ""),
      href: new URL(product.href).pathname,
      image,
      sourceImage: imageUrl,
    });
    if (products.length >= limit) break;
  }
  return products;
};

const hero = sectionBy("featured_collection_list_slider");
const slideshow = sectionBy("slideshow_");
const announcement = sectionBy("announcement-bar");
const header = sectionBy("__header");
const footer = sectionBy("__footer");
const assetUrls = manifest.filter((item) => item.status === "ok" && item.group === "assets").map((item) => item.url);
const findAsset = (pattern) => assetUrls.find((url) => pattern.test(url));
const mobileHeroImages = [
  findAsset(/LANDSCAPE_STUDIO.*Mobile_Top/i),
  findAsset(/Seasonal_Dumpling.*Mobile_Top/i),
  findAsset(/PRE_FALL.*Mobile_Top/i),
  findAsset(/TOYO.*Mobile_Top/i),
  findAsset(/KIDS_BACKPACK.*MOBILE_TOP/i),
  findAsset(/PARAPOUCH.*Mobile_Top/i),
  findAsset(/EYEWEAR.*Mobile_Top/i),
  findAsset(/BTV_Homepage_Banner_CNY_PETS.*Mobile_Top/i),
];
const mobilePromotionImages = [
  findAsset(/Pocket_Mirror_GWP_Mobile_Bottom/i),
  findAsset(/ID_TVC/i),
  findAsset(/181225MOB.*Mobile_Bottom/i),
];

const fixture = {
  source: "https://beyondthevines.co.id/",
  capturedAt: "2026-11-03",
  logo: localAsset(header?.images.find((image) => /BTV_logo_black/i.test(image.src))?.src),
  announcement: announcement?.links.map((link) => link.text).filter(Boolean).slice(0, 3) || [],
  navigation: ["New In", "Bags", "Women", "Men", "Kids", "Accessories", "Lifestyle", "Pets"],
  categoryHero: (hero?.images || []).map((image, index) => ({
    label: ["New In", "Bags", "Women", "Men", "Kids", "Accessories", "Eyewear", "Pets"][index],
    image: localAsset(image.src),
    mobileImage: localAsset(mobileHeroImages[index]),
    sourceImage: image.src,
  })).filter((item) => item.image),
  promotions: (slideshow?.images || []).map((image) => ({
    image: localAsset(image.src),
    mobileImage: null,
    sourceImage: image.src,
  })).filter((item) => item.image).map((item, index) => ({ ...item, mobileImage: localAsset(mobilePromotionImages[index]) })),
  collections: [
    { title: "New In", products: normalizeProducts(sectionBy("166366563622039b3e")) },
    { title: "BTV Bags", products: normalizeProducts(sectionBy("featured_collection_CkeWEU")) },
    { title: "Your Favourites", products: normalizeProducts(sectionBy("featured_collection_KRqwWN")) },
  ],
  social: {
    title: "BTVON YOU",
    description: "See it on, cart it out! BTV Community in Beyond The Vines. Tag us @aworldbeyondthevines",
    images: (sectionBy("1746601516c5597009")?.images || [])
      .map((image) => localAsset(image.src))
      .filter(Boolean)
      .slice(0, 12),
  },
  newsletter: {
    title: "Newsletter",
    description:
      "Be the first to know! Sign up for the latest launches, early access, special collaborations, you already know it! Here's the place!",
  },
  footerLinks: footer?.links
    .filter((link) => link.text)
    .map((link) => ({ text: link.text, href: new URL(link.href).pathname }))
    .slice(0, 24) || [],
};

await mkdir(path.join(ROOT, "src/data"), { recursive: true });
await writeFile(path.join(ROOT, "src/data/homepage.json"), JSON.stringify(fixture, null, 2), "utf8");
console.log({
  heroSlides: fixture.categoryHero.length,
  promotions: fixture.promotions.length,
  collections: fixture.collections.map((collection) => `${collection.title}:${collection.products.length}`),
  socialImages: fixture.social.images.length,
});
