// MOCK search (docs/mock-behaviors.md "Search page"): the source runs Shopify's storefront search over the whole catalog
// (fuzzy; even random strings return results, and the counts vary between requests). The clone searches the
// /collections/new-in dataset (152 products, 561 colour cards captured 2026-11-06):
// - a product matches when its title or one of its colour-card titles contains every query term (case and accents
//   ignored; substring match, which covers the source's options[prefix]=last prefix matching);
// - relevance = the collection's Featured order; price sorts use the card price;
// - facet values and memberships come from the captured single-facet views (card level, like the collection mock);
//   counts are matching products per value, and values without results are not rendered;
// - 12 products per page (data-products-per-page), all colour cards of a product on its page.
import type { CollectionData, Facet } from "@/lib/collections/types";
import type { SearchMeta, SearchQuery, SearchResult } from "./types";

export function parseSearch(search: string, meta: SearchMeta): SearchQuery {
  const params = new URLSearchParams(search);
  const filters: SearchQuery["filters"] = [];
  params.forEach((value, name) => { if (name.startsWith("filter.")) filters.push({ name, value }); });
  return { q: (params.get("q") ?? "").trim(), sort: params.get("sort_by") || meta.sort.initial, page: Math.max(1, Number(params.get("page")) || 1), filters };
}

/** Facet-form serialization: q, hidden inputs, facet values, sort_by (the order FormData produces). */
export function searchParamsFor(query: SearchQuery, meta: SearchMeta, opts: { filters: boolean; sort: boolean }): string {
  const p = new URLSearchParams();
  p.append("q", query.q);
  for (const h of meta.hiddenInputs) p.append(h.name, h.value);
  if (opts.filters) for (const f of query.filters) p.append(f.name, f.value);
  if (opts.sort) p.append("sort_by", query.sort);
  return p.toString();
}

/** Pagination link (Shopify paginate: page first, then the request's other parameters). */
export function pageHref(n: number, query: SearchQuery): string {
  const p = new URLSearchParams();
  p.append("page", String(n));
  p.append("q", query.q);
  for (const f of query.filters) p.append(f.name, f.value);
  if (query.filters.length || query.sort !== "relevance") p.append("sort_by", query.sort);
  return `/search?${p.toString()}`;
}

/** Shopify default paginate parts (window 2): 1 … current±2 … last. */
export function pageParts(current: number, total: number): (number | "deco")[] {
  if (total <= 1) return [];
  const parts: (number | "deco")[] = [1];
  const from = Math.max(2, current - 2);
  const to = Math.min(total - 1, current + 2);
  if (from > 2) parts.push("deco");
  for (let i = from; i <= to; i++) parts.push(i);
  if (to < total - 1) parts.push("deco");
  parts.push(total);
  return parts;
}

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const priceOf = (text: string) => Number(text.replace(/[^0-9]/g, "")) || 0;

export function runSearch(index: CollectionData, meta: SearchMeta, query: SearchQuery): SearchResult {
  const terms = norm(query.q).split(/\s+/).filter(Boolean);
  // Products in the collection's Featured order, each with its colour cards.
  const products = new Map<string, string[]>();
  for (const key of index.views[""].pages.flat()) {
    const card = index.cards[key];
    if (!card) continue;
    const list = products.get(card.href) ?? [];
    if (!list.includes(key)) list.push(key);
    products.set(card.href, list);
  }
  let matched = [...products.entries()].filter(([, keys]) => {
    const hay = norm(keys.map((k) => index.cards[k].title).join(" "));
    return terms.every((t) => hay.includes(t));
  });
  if (query.sort === "price-ascending" || query.sort === "price-descending") {
    const dir = query.sort === "price-ascending" ? 1 : -1;
    matched = matched.map((m, i) => ({ m, i, p: priceOf(index.cards[m[1][0]].price) })).sort((a, b) => dir * (a.p - b.p) || a.i - b.i).map((x) => x.m);
  }
  const setOf = (name: string, value: string) => new Set((index.views[`${name}=${value}`]?.pages ?? []).flat());

  // Facets over the query results (before filters), values with at least one product.
  const facets: Facet[] = index.facets.map((facet) => {
    if (facet.kind === "availability") return facet;
    let n = 0;
    const prefix = facet.values[0]?.id.replace(/-\d+$/, "") ?? "";
    const values = facet.values.flatMap((v) => {
      const set = setOf(facet.name, v.value);
      const count = matched.filter(([, keys]) => keys.some((k) => set.has(k))).length;
      if (!count) return [];
      n++;
      return [{ ...v, id: `${prefix}-${n}`, count: `(${count})`, tooltip: `${v.label} (${count})` }];
    });
    return { ...facet, values };
  });

  // Filters: union within a facet, intersection across facets, at card level.
  const groups = new Map<string, Set<string>>();
  for (const f of query.filters) {
    const set = groups.get(f.name) ?? new Set<string>();
    setOf(f.name, f.value).forEach((k) => set.add(k));
    groups.set(f.name, set);
  }
  const filtered = matched
    .map(([href, keys]) => [href, keys.filter((k) => [...groups.values()].every((s) => s.has(k)))] as const)
    .filter(([, keys]) => keys.length);
  const totalPages = Math.max(1, Math.ceil(filtered.length / meta.perPage));
  const page = Math.min(query.page, totalPages);
  const keys = filtered.slice((page - 1) * meta.perPage, page * meta.perPage).flatMap(([, k]) => k);
  return { count: filtered.length, totalPages, keys, cards: Object.fromEntries(keys.map((k) => [k, index.cards[k]])), facets };
}

export const fill = (template: string, values: Record<string, string | number>) => template.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? ""));
