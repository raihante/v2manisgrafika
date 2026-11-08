// Blog portal + article repository. OWN DESIGN, NOT SOURCE-FAITHFUL (owner decisions 2026-11-06, AGENTS.md "Final build
// scope"): flat article URLs /blogs/<slug>, portal filter /blogs?category=<blog>&page=N. Fixtures come from
// scripts/build-blog-data.mjs. Only the reference article has its real body; every other article renders the shared
// placeholder body (MOCK, docs/mock-behaviors.md "Blog portal") until a CMS adapter returns real content in the same
// shapes.
import blogs from "@/data/blogs/blogs.json";
import bodies from "@/data/blogs/bodies.json";
import type { ContentBlock, ContentImage } from "@/lib/pages/content";

export type BlogCategory = { handle: string; title: string; description?: string };

export type BlogArticle = {
  slug: string;
  category: string;
  title: string;
  documentTitle: string;
  /** ISO date (yyyy-mm-dd) and the source display format (dd.mm.yyyy). */
  date: string;
  dateLabel: string;
  /** Owner articles only; media-stories descriptions are third-party text and are not stored. */
  description: string | null;
  hero: ContentImage | null;
  /** Media-stories: the publication's original article. */
  source: { url: string; publication: string } | null;
  hasBody: boolean;
  sourceUrl: string;
};

export const PAGE_SIZE = 12;
export const RELATED_COUNT = 3;

const categories = blogs.categories as BlogCategory[];
const articles = blogs.articles as BlogArticle[]; // newest first
const bodyMap = bodies as unknown as Record<string, ContentBlock[]>;

export type PortalQuery = { category: BlogCategory | null; page: number; pageCount: number; total: number; items: BlogArticle[] };

export const blogRepository = {
  categories: (): BlogCategory[] => categories,
  category: (handle: string | null | undefined): BlogCategory | null => categories.find((c) => c.handle === handle) ?? null,
  articles: (): BlogArticle[] => articles,
  slugs: (): string[] => articles.map((a) => a.slug),
  article: (slug: string): BlogArticle | null => articles.find((a) => a.slug === slug) ?? null,
  /** Real blocks for the reference article, the shared placeholder body for every other article. */
  body: (article: BlogArticle): { blocks: ContentBlock[]; placeholder: boolean } =>
    article.hasBody && bodyMap[article.slug] ? { blocks: bodyMap[article.slug], placeholder: false } : { blocks: bodyMap.placeholder, placeholder: true },
  /** Unknown category -> All; page clamped to 1..pageCount (out of range -> last page). */
  query: (categoryHandle: string | null, page: number): PortalQuery => {
    const category = blogRepository.category(categoryHandle);
    const list = category ? articles.filter((a) => a.category === category.handle) : articles;
    const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    const current = Math.min(Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1), pageCount);
    return { category, page: current, pageCount, total: list.length, items: list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE) };
  },
  /** Same category first (newest first), filled up from the other categories. */
  related: (article: BlogArticle): BlogArticle[] => {
    const others = articles.filter((a) => a.slug !== article.slug);
    return [...others.filter((a) => a.category === article.category), ...others.filter((a) => a.category !== article.category)].slice(0, RELATED_COUNT);
  },
  articleHref: (slug: string) => `/blogs/${slug}`,
  categoryHref: (handle: string | null, page = 1) => {
    const params = new URLSearchParams();
    if (handle) params.set("category", handle);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `/blogs?${qs}` : "/blogs";
  },
};
