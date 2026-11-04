import { access, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = "C:/Digitakarya/v2manisgrafika";
const data = JSON.parse(await readFile(path.join(ROOT, "src/data/homepage.json"), "utf8"));
const urls = new Set();
const collect = (value) => {
  if (typeof value === "string" && value.startsWith("/assets/")) urls.add(value);
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === "object") Object.values(value).forEach(collect);
};
collect(data);

const missing = [];
for (const url of urls) {
  try {
    await access(path.join(ROOT, "public", url));
  } catch {
    missing.push(url);
  }
}

console.log({ referencedAssets: urls.size, missingAssets: missing.length, missing });
if (missing.length) process.exitCode = 1;
