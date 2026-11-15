// Blog types (own-design portal /blogs and the one article template /blogs/<slug>; owner decisions 2026-11-06).
import type { ContentBlock, ContentImage } from "@/lib/pages/types";

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

/** Article body; placeholder = the shared MOCK body shown until the CMS supplies the article. */
export type ArticleBody = { blocks: ContentBlock[]; placeholder: boolean };

export interface BlogRepository {
  listCategories(): Promise<BlogCategory[]>;
  /** Every article, newest first. */
  listArticles(): Promise<BlogArticle[]>;
  getArticle(slug: string): Promise<BlogArticle | null>;
  getArticleBody(slug: string): Promise<ArticleBody | null>;
}
