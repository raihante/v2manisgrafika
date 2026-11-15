import { notFound } from "next/navigation";
import { NewsletterSection, SiteChrome } from "@/components/shell/SiteChrome";
import ArticlePage from "@/components/blogs/ArticlePage";
import { articleHref, findCategory, relatedArticles } from "@/lib/blogs/query";
import { repositories } from "@/lib/data";
// Content-block styles (shared with /pages/<slug>) followed by the blog styles.
import "../../pages/[slug]/content-page.css";
import "../blogs.css";

// Every article has a flat URL /blogs/<slug>; anything else under /blogs/ (including the source-format
// /blogs/<blog> and /blogs/<blog>/<slug>) is a local 404 by owner decision (no redirects).
export const dynamicParams = false;

const { blogs } = repositories;

export async function generateStaticParams() {
  return (await blogs.listArticles()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await blogs.getArticle(slug);
  if (!article) return {};
  return {
    title: article.documentTitle,
    description: article.description ?? undefined,
    alternates: { canonical: `${articleHref(slug)}/` },
  };
}

export default async function ArticleRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await blogs.getArticle(slug);
  const body = await blogs.getArticleBody(slug);
  if (!article || !body) notFound();
  const [categories, articles] = await Promise.all([blogs.listCategories(), blogs.listArticles()]);
  const related = relatedArticles(articles, article).map((a) => ({ article: a, category: findCategory(categories, a.category) }));
  return (
    <SiteChrome backToTop>
      <ArticlePage article={article} category={findCategory(categories, article.category)} body={body} related={related} />
      <NewsletterSection />
    </SiteChrome>
  );
}
