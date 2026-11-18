import { describe, expect, it } from "vitest";
import collectionFixtures from "@/data/collections/collections.json";
import searchMeta from "@/data/search.json";
import type { CollectionData } from "@/lib/collections/types";
import { fill, pageHref, pageParts, parseSearch, runSearch, searchParamsFor } from "@/lib/search/query";
import type { SearchMeta } from "@/lib/search/types";

const index = (collectionFixtures as unknown as Record<string, CollectionData>)["new-in"];
const meta = searchMeta as SearchMeta;
const priceOf = (text: string) => Number(text.replace(/[^0-9]/g, ""));

describe("search URL state", () => {
  it("parses q, sort, page and filters", () => {
    expect(parseSearch("q=+tote+&page=2&filter.v.option.colour=Black", meta)).toEqual({ q: "tote", sort: "relevance", page: 2, filters: [{ name: "filter.v.option.colour", value: "Black" }] });
    expect(parseSearch("page=abc", meta).page).toBe(1);
  });

  it("serializes like the source facet form and pagination", () => {
    const q = { q: "tote", sort: "price-ascending", page: 1, filters: [{ name: "filter.v.option.colour", value: "Black" }] };
    expect(searchParamsFor(q, meta, { filters: true, sort: true })).toBe("q=tote&options%5Bprefix%5D=last&filter.v.option.colour=Black&sort_by=price-ascending");
    expect(pageHref(2, { ...q, filters: [], sort: "relevance" })).toBe("/search?page=2&q=tote");
    expect(pageParts(1, 1)).toEqual([]);
    expect(pageParts(6, 12)).toEqual([1, "deco", 4, 5, 6, 7, 8, "deco", 12]);
    expect(fill("{count} results for “{q}”", { count: 3, q: "bag" })).toBe("3 results for “bag”");
  });
});

describe("runSearch (MOCK over the Manis Grafika new-in dataset)", () => {
  it("matches every term case- and accent-insensitively, 12 products per page", () => {
    const r = runSearch(index, meta, { q: "SERIES", sort: "relevance", page: 1, filters: [] });
    expect(r.count).toBeGreaterThan(0);
    const products = new Set(r.keys.map((k) => r.cards[k].href));
    expect(products.size).toBeLessThanOrEqual(meta.perPage);
    for (const k of r.keys) expect(r.cards[k].title.toLowerCase()).toContain("series");
  });

  it("sorts by price and returns nothing for unknown terms", () => {
    const r = runSearch(index, meta, { q: "hardcover", sort: "price-ascending", page: 1, filters: [] });
    const firstCardPrices = [...new Map(r.keys.map((k) => [r.cards[k].href, priceOf(r.cards[k].price)])).values()];
    expect(firstCardPrices).toEqual([...firstCardPrices].sort((a, b) => a - b));
    expect(runSearch(index, meta, { q: "zzzz-no-match", sort: "relevance", page: 1, filters: [] }).count).toBe(0);
  });
});
