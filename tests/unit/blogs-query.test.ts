import { describe, expect, it } from "vitest";
import { articleHref, categoryHref, PAGE_SIZE, queryPortal, relatedArticles, RELATED_COUNT } from "@/lib/blogs/query";
import type { BlogArticle, BlogCategory } from "@/lib/blogs/types";

const categories: BlogCategory[] = [{ handle: "news", title: "News" }, { handle: "events", title: "Events" }];
const article = (slug: string, category: string, date: string): BlogArticle => ({
  slug, category, title: slug, documentTitle: slug, date, dateLabel: date, description: null, hero: null, source: null, hasBody: false, sourceUrl: "",
});
const articles = Array.from({ length: 30 }, (_, i) => article(`a${i}`, i % 3 === 0 ? "events" : "news", `2026-01-${String(30 - i).padStart(2, "0")}`));

describe("queryPortal", () => {
  it("pages all articles 12 per page", () => {
    const q = queryPortal(categories, articles, null, 1);
    expect(q.category).toBeNull();
    expect(q.total).toBe(30);
    expect(q.pageCount).toBe(Math.ceil(30 / PAGE_SIZE));
    expect(q.items.map((a) => a.slug)).toEqual(articles.slice(0, PAGE_SIZE).map((a) => a.slug));
  });

  it("filters by category, treats unknown categories as All and clamps the page", () => {
    expect(queryPortal(categories, articles, "events", 1).items.every((a) => a.category === "events")).toBe(true);
    expect(queryPortal(categories, articles, "nope", 1).category).toBeNull();
    expect(queryPortal(categories, articles, null, 99).page).toBe(3);
    expect(queryPortal(categories, articles, null, -4).page).toBe(1);
    expect(queryPortal(categories, articles, null, Number.NaN).page).toBe(1);
  });

  it("keeps one empty page for an empty category", () => {
    const q = queryPortal([...categories, { handle: "empty", title: "Empty" }], articles, "empty", 3);
    expect(q).toMatchObject({ page: 1, pageCount: 1, total: 0, items: [] });
  });
});

describe("relatedArticles", () => {
  it("prefers the same category, then fills from the others, never the article itself", () => {
    const related = relatedArticles(articles, articles[0]);
    expect(related).toHaveLength(RELATED_COUNT);
    expect(related.map((a) => a.slug)).not.toContain("a0");
    expect(related.every((a) => a.category === "events")).toBe(true);
    const lonely = [article("x", "solo", "2026-01-01"), article("y", "news", "2026-01-02")];
    expect(relatedArticles(lonely, lonely[0]).map((a) => a.slug)).toEqual(["y"]);
  });
});

describe("hrefs", () => {
  it("builds flat article URLs and portal filter URLs", () => {
    expect(articleHref("a-little-love-for-your-carryall")).toBe("/blogs/a-little-love-for-your-carryall");
    expect(categoryHref(null)).toBe("/blogs");
    expect(categoryHref("news")).toBe("/blogs?category=news");
    expect(categoryHref("news", 2)).toBe("/blogs?category=news&page=2");
    expect(categoryHref(null, 3)).toBe("/blogs?page=3");
  });
});
