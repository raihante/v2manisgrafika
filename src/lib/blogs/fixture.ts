// Fixture blog adapter (server only). OWN DESIGN, NOT SOURCE-FAITHFUL (AGENTS.md "Final build scope"). Fixtures come
// from scripts/build-blog-data.mjs. Only the reference article has its real body; every other article returns the
// shared placeholder body (MOCK, docs/mock-behaviors.md "Blog portal") until the CMS returns real content.
import "server-only";
import blogs from "@/data/blogs/blogs.json";
import bodies from "@/data/blogs/bodies.json";
import { sanitizeBlock } from "@/lib/pages/fixture";
import type { ContentBlock } from "@/lib/pages/types";
import type { BlogArticle, BlogCategory, BlogRepository } from "./types";

const categories = blogs.categories as BlogCategory[];
const articles = blogs.articles as BlogArticle[]; // newest first
const bodyMap = new Map<string, ContentBlock[]>(
  Object.entries(bodies as unknown as Record<string, Parameters<typeof sanitizeBlock>[0][]>).map(([slug, blocks]) => [slug, blocks.map(sanitizeBlock)]),
);

export const fixtureBlogs: BlogRepository = {
  listCategories: async () => categories,
  listArticles: async () => articles,
  getArticle: async (slug) => articles.find((a) => a.slug === slug) ?? null,
  getArticleBody: async (slug) => {
    const article = articles.find((a) => a.slug === slug);
    if (!article) return null;
    const real = article.hasBody ? bodyMap.get(slug) : undefined;
    return real ? { blocks: real, placeholder: false } : { blocks: bodyMap.get("placeholder") ?? [], placeholder: true };
  },
};
