import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = "C:/Digitakarya/v2manisgrafika";
const source = JSON.parse(await readFile(path.join(root, "reference/data/round78-source-product-interaction-data.json"), "utf8"));
const hoverSource = JSON.parse(await readFile(path.join(root, "reference/data/round86-source-product-hover-images.json"), "utf8"));
const manifest = JSON.parse(await readFile(path.join(root, "reference/data/download-manifest.json"), "utf8"));
const outputDir = path.join(root, "public/assets/product-variants");
await mkdir(outputDir, { recursive: true });

const absoluteUrl = (value) => value?.startsWith("//") ? `https:${value}` : value;
const assetKey = (value) => {
  if (!value) return "";
  const filename = new URL(absoluteUrl(value)).pathname.split("/").at(-1).toLowerCase();
  return filename.replace(/_\d+x_crop_center(?=\.)/, "");
};
const existing = new Map(manifest.filter((item) => item.status === "ok").map((item) => [assetKey(item.url), `/${item.path.replace(/^public[\\/]/, "").replaceAll("\\", "/")}`]));
const downloads = new Map();
const hoverImages = new Map(hoverSource.flatMap((section) => section.products).map((product) => [product.title, product.secondaryImages]));

async function localAsset(value) {
  if (!value) return null;
  const url = absoluteUrl(value);
  const matched = existing.get(assetKey(url));
  if (matched) return matched;
  if (downloads.has(url)) return downloads.get(url);

  const promise = (async () => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status} ${url}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    const urlPath = new URL(url).pathname;
    const extension = path.extname(urlPath) || ".jpg";
    const filename = `${createHash("sha256").update(url).digest("hex").slice(0, 16)}${extension}`;
    await writeFile(path.join(outputDir, filename), bytes);
    return `/assets/product-variants/${filename}`;
  })();
  downloads.set(url, promise);
  return promise;
}

const products = {};
for (const section of source) {
  for (const product of section.products) {
    if (products[product.title]) continue;
    products[product.title] = {
      secondaryImages: await Promise.all((hoverImages.get(product.title) || []).map(localAsset)),
      variants: await Promise.all(product.variants.map(async (variant) => ({
        label: variant.label,
        image: await localAsset(variant.image),
        thumbnail: await localAsset(variant.thumbnail),
        soldOut: variant.soldOut,
      }))),
    };
  }
}

await writeFile(path.join(root, "src/data/product-card-interactions.json"), `${JSON.stringify(products, null, 2)}\n`);
console.log(JSON.stringify({ products: Object.keys(products).length, variants: Object.values(products).reduce((sum, product) => sum + product.variants.length, 0), downloaded: downloads.size }));
