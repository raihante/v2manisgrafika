// Pure collection-grid logic shared by the server render and the client grid (no fixture import).
// Reproduces the theme's pagination.js / initial-fill script (reference/js/r257-collection/): cards are appended page by
// page, de-duplicated by card key, and every load completes the last visual row of `columns` slots, counting the
// promotion columns, by pulling cards from the following page.
// MOCK filter/sort (docs/mock-behaviors.md "Collection filters and sort"): each single facet value and each sort option
// replays the source result set captured on 2026-11-06; combinations are derived locally (union within one facet,
// intersection across facets, order taken from the selected sort).
import type { CollectionData, CollectionPromo, CollectionQuery, CollectionView } from "./types";

export const DEFAULT_SORT = "manual";

/** Grid columns as the theme reads them: the medium-up-N class of ul#product-grid (4 at every viewport). */
export function gridColumns(gridClass: string): number {
  return Number(gridClass.match(/medium-up-(\d+)/)?.[1] ?? 4);
}

/** Parse the source URL parameters (sort_by, filter.*). */
export function parseQuery(search: string): CollectionQuery {
  const params = new URLSearchParams(search);
  const filters: CollectionQuery["filters"] = [];
  params.forEach((value, name) => { if (name.startsWith("filter.")) filters.push({ name, value }); });
  return { sort: params.get("sort_by") || DEFAULT_SORT, filters };
}

/** URL parameters in the order the source facet form serializes them (facet inputs, then sort_by). */
export function queryToSearch(query: CollectionQuery, includeSort: boolean): string {
  const params = new URLSearchParams();
  for (const f of query.filters) params.append(f.name, f.value);
  if (includeSort) params.append("sort_by", query.sort);
  return params.toString();
}

const viewKey = (name: string, value: string) => `${name}=${value}`;
const productOf = (data: CollectionData, key: string) => data.cards[key]?.href ?? key;

/** Result set of a query: the card keys of each page, plus the source count label. */
export function resolveView(data: CollectionData, query: CollectionQuery): CollectionView {
  const sortView = data.views[query.sort === DEFAULT_SORT ? "" : `sort_by=${query.sort}`] ?? data.views[""];
  if (!query.filters.length) return sortView;
  if (query.filters.length === 1 && query.sort === DEFAULT_SORT) {
    const single = data.views[viewKey(query.filters[0].name, query.filters[0].value)];
    if (single) return single;
  }
  // Combination (MOCK): union of the captured single-value sets inside one facet, intersection across facets.
  const byName = new Map<string, Set<string>>();
  for (const f of query.filters) {
    const set = byName.get(f.name) ?? new Set<string>();
    for (const key of (data.views[viewKey(f.name, f.value)]?.pages ?? []).flat()) set.add(key);
    byName.set(f.name, set);
  }
  const sets = [...byName.values()];
  const order = sortView.pages.flat();
  const extra = sets.flatMap((s) => [...s]).filter((k) => !order.includes(k));
  const keys = [...new Set([...order, ...extra])].filter((k) => sets.every((s) => s.has(k)));
  // Pages hold `perPage` products (every colour card of a product stays on its product's page).
  const pages: string[][] = [];
  const seen = new Map<string, number>();
  for (const key of keys) {
    const product = productOf(data, key);
    if (!seen.has(product)) seen.set(product, Math.floor(seen.size / data.pagination.perPage));
    const page = seen.get(product)!;
    (pages[page] ??= []).push(key);
  }
  const total = data.views[""].countText.match(/(\d+)\s+products?/)?.[1] ?? "";
  return { countText: `${seen.size} of ${total} products`, pages: pages.length ? pages : [[]] };
}

// --- Promotion placement (pagination.js buildPromoPlacementPlan, "before" promos; afterGrid promos trail) ---
type PromoCfg = Pick<CollectionPromo, "id" | "position" | "showOnce" | "afterGrid">;

function placesAt(slot: number, c: PromoCfg, placed: Set<string>): boolean {
  if (!c.position || slot < 1) return false;
  if (c.showOnce) return !(c.id && placed.has(c.id)) && slot === c.position;
  return c.position === 1 || slot % c.position === 0;
}

/** For `count` cards: the promotions to insert before each card index, and those appended after the grid. */
export function promoPlan(count: number, promos: PromoCfg[]): { before: Map<number, number[]>; trailing: number[] } {
  const before = new Map<number, number[]>();
  const trailing: number[] = [];
  if (!promos.length || count < 1) return { before, trailing };
  const placed = new Set<string>();
  let slot = 1;
  for (let i = 0; i < count; i++) {
    for (let again = true; again; ) {
      again = false;
      for (let p = 0; p < promos.length; p++) {
        const c = promos[p];
        if (!c.afterGrid && placesAt(slot, c, placed)) {
          (before.get(i) ?? before.set(i, []).get(i)!).push(p);
          if (c.showOnce && c.id) placed.add(c.id);
          slot++;
          again = true;
          break;
        }
      }
    }
    slot++;
  }
  promos.forEach((c, p) => { if (c.afterGrid && c.position && !(c.id && placed.has(c.id)) && (slot === c.position || c.position >= count)) { trailing.push(p); slot++; } });
  return { before, trailing };
}

const slotCount = (count: number, promos: PromoCfg[]) => {
  const { before, trailing } = promoPlan(count, promos);
  return count + [...before.values()].reduce((n, l) => n + l.length, 0) + trailing.length;
};

/** Cards needed to complete the last visual row (getProductsNeededToFillRow). */
export function neededToFillRow(count: number, perPage: number, columns: number, promos: PromoCfg[]): number {
  if (count < 1) return 0;
  if (count < perPage) return perPage - count;
  for (let add = 0; add <= columns * 4; add++) if (slotCount(count + add, promos) % columns === 0) return add;
  return 0;
}

/**
 * Visible card keys after `loadedPages` pages (1 = initial render): the pages' cards de-duplicated, then extended from
 * the following cards until the last row is complete (or every card is shown).
 */
export function visibleKeys(view: CollectionView, loadedPages: number, perPage: number, columns: number, promos: PromoCfg[]): { keys: string[]; hasMore: boolean } {
  const all: string[] = [];
  const seen = new Set<string>();
  let shown = 0;
  view.pages.forEach((page, i) => {
    for (const key of page) if (!seen.has(key)) { seen.add(key); all.push(key); }
    if (i < loadedPages) shown = all.length;
  });
  const fill = shown < all.length ? neededToFillRow(shown, perPage, columns, promos) : 0;
  const count = Math.min(all.length, shown + fill);
  return { keys: all.slice(0, count), hasMore: count < all.length };
}
