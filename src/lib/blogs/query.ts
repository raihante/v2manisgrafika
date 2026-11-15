// Pure blog helpers shared by the server routes and the client portal (no data access).
import type { BlogArticle, BlogCategory } from "./types";

export const PAGE_SIZE = 12;
export const RELATED_COUNT = 3;

export type PortalQuery = { category: BlogCategory | null; page: number; pageCount: number; total: number; items: BlogArticle[] };

export const findCategory = (categories: BlogCategory[], handle: string | null | undefined): BlogCategory | null =>
  categories.find((c) => c.handle === handle) ?? null;

/** Unknown category -> All; page clamped to 1..pageCount (out of range -> last page). */
export function queryPortal(categories: BlogCategory[], articles: BlogArticle[], categoryHandle: string | null, page: number): PortalQuery {
  const category = findCategory(categories, categoryHandle);
  const list = category ? articles.filter((a) => a.category === category.handle) : articles;
  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1), pageCount);
  return { category, page: current, pageCount, total: list.length, items: list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE) };
}

/** Same category first (newest first), filled up from the other categories. */
export function relatedArticles(articles: BlogArticle[], article: BlogArticle): BlogArticle[] {
  const others = articles.filter((a) => a.slug !== article.slug);
  return [...others.filter((a) => a.category === article.category), ...others.filter((a) => a.category !== article.category)].slice(0, RELATED_COUNT);
}

export const articleHref = (slug: string) => `/blogs/${slug}`;

export function categoryHref(handle: string | null, page = 1) {
  const params = new URLSearchParams();
  if (handle) params.set("category", handle);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/blogs?${qs}` : "/blogs";
}
