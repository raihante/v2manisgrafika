import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = "C:/Digitakarya/v2manisgrafika";
const source = JSON.parse(await readFile(path.join(root, "reference/data/round78-source-product-interaction-data.json"), "utf8"));
const urls = new Set();
for (const section of source) {
  for (const product of section.products) {
    for (const variant of product.variants) {
      for (const value of [variant.image, variant.thumbnail]) if (value) urls.add(value.startsWith("//") ? `https:${value}` : value);
    }
  }
}

const records = [];
for (const sourceUrl of urls) {
  const extension = path.extname(new URL(sourceUrl).pathname) || ".jpg";
  const filename = `${createHash("sha256").update(sourceUrl).digest("hex").slice(0, 16)}${extension}`;
  const localPath = `public/assets/product-variants/${filename}`;
  try {
    const bytes = await readFile(path.join(root, localPath));
    records.push({
      sourceUrl,
      localPath,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      bytes: bytes.length,
      dimensions: null,
      routeUsage: ["/"],
      authorization: "Project-owner authorized reproduction",
    });
  } catch {}
}

await writeFile(path.join(root, "reference/data/product-variant-asset-manifest.json"), `${JSON.stringify(records, null, 2)}\n`);
console.log(JSON.stringify({ records: records.length }));
