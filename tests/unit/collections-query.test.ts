import { describe, expect, it } from "vitest";
import collectionFixtures from "@/data/collections/collections.json";
import { DEFAULT_SORT, gridColumns, parseQuery, queryToSearch, resolveView, visibleKeys } from "@/lib/collections/query";
import type { CollectionData } from "@/lib/collections/types";

// Test data: the Manis Grafika new-in collection (tests may read fixtures; components may not).
const data = (collectionFixtures as unknown as Record<string, CollectionData>)["new-in"];

describe("collection URL state", () => {
  it("parses and serializes the source parameters", () => {
    const q = parseQuery("filter.v.option.colour=Black&filter.v.option.colour=Olive&sort_by=price-ascending");
    expect(q).toEqual({ sort: "price-ascending", filters: [{ name: "filter.v.option.colour", value: "Black" }, { name: "filter.v.option.colour", value: "Olive" }] });
    expect(queryToSearch(q, true)).toBe("filter.v.option.colour=Black&filter.v.option.colour=Olive&sort_by=price-ascending");
    expect(parseQuery("").sort).toBe(DEFAULT_SORT);
  });

  it("reads the grid columns from the theme class", () => {
    expect(gridColumns("grid small-up-2 medium-up-4")).toBe(4);
    expect(gridColumns("grid")).toBe(4);
  });
});

describe("resolveView", () => {
  it("returns the captured Featured view without filters", () => {
    expect(resolveView(data, { sort: DEFAULT_SORT, filters: [] })).toBe(data.views[""]);
  });

  it("intersects facets and keeps every result inside the unfiltered set", () => {
    const facet = data.facets.find((f) => f.kind !== "availability" && f.values.length > 1)!;
    const [a, b] = facet.values;
    const union = resolveView(data, { sort: DEFAULT_SORT, filters: [{ name: facet.name, value: a.value }, { name: facet.name, value: b.value }] });
    const single = resolveView(data, { sort: DEFAULT_SORT, filters: [{ name: facet.name, value: a.value }] });
    const all = new Set(data.views[""].pages.flat());
    expect(union.pages.flat().length).toBeGreaterThanOrEqual(single.pages.flat().length);
    for (const key of union.pages.flat()) expect(all.has(key) || key in data.cards).toBe(true);
  });
});

describe("visibleKeys", () => {
  it("shows the first page and reports more pages", () => {
    const view = data.views[""];
    const { keys, hasMore } = visibleKeys(view, 1, data.pagination.perPage, gridColumns(data.gridClass), data.promos);
    expect(keys.length).toBeGreaterThanOrEqual(view.pages[0].length);
    expect(hasMore).toBe(view.pages.length > 1);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
