// Guards the data-layer boundary (AGENTS.md "Store product, navigation, editorial, and page data behind typed
// repository/service interfaces ... UI components must not import fixture files directly").
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..", "..");
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(f) ? [p] : []; });
const files = walk(join(root, "src")).map((p) => ({ path: relative(root, p).split("\\").join("/"), src: readFileSync(p, "utf8") }));
const imports = (src: string) => [...src.matchAll(/(?:from\s+|import\s*\(\s*|import\s+)["']([^"']+)["']/g)].map((m) => m[1]);
const isClient = (src: string) => /^\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*["']use client["']/.test(src);

// The browser-side mock collection source is the one documented lazy fixture loader (docs/mock-behaviors.md).
const FIXTURE_READERS = /^src\/lib\/[a-z-]+\/(fixture|client)\.ts$/;

describe("data-layer boundary", () => {
  it("only fixture adapters read src/data", () => {
    const offenders = files.filter((f) => imports(f.src).some((i) => i.startsWith("@/data/")) && !FIXTURE_READERS.test(f.path)).map((f) => f.path);
    expect(offenders).toEqual([]);
  });

  it("components and routes never import adapters or the sanitizer directly", () => {
    const offenders = files
      .filter((f) => f.path.startsWith("src/components/") || f.path.startsWith("src/app/"))
      .filter((f) => imports(f.src).some((i) => /\/fixture$/.test(i) || i === "@/lib/html/sanitize"))
      .map((f) => f.path);
    expect(offenders).toEqual([]);
  });

  it("client components never import the composition root or server-only modules", () => {
    const offenders = files
      .filter((f) => isClient(f.src))
      .filter((f) => imports(f.src).some((i) => i === "@/lib/data" || i === "@/lib/html/sanitize" || /\/fixture$/.test(i) || i === "server-only"))
      .map((f) => f.path);
    expect(offenders).toEqual([]);
  });

  it("raw HTML reaches the DOM only through RichText, SourceSvg or the escaped promo template", () => {
    const allowed = ["src/components/shared/RichText.tsx", "src/components/shell/SourceSvg.tsx", "src/components/commerce/collection/CollectionPage.tsx"];
    const offenders = files.filter((f) => /dangerouslySetInnerHTML=/.test(f.src) && !allowed.includes(f.path)).map((f) => f.path);
    expect(offenders).toEqual([]);
  });
});
