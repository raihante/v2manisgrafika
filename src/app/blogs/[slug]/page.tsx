import { notFound } from "next/navigation";
import { NewsletterSection, SiteChrome } from "@/components/HomePage";
import ArticlePage from "@/components/blogs/ArticlePage";
import { blogRepository } from "@/lib/blogs/repository";
// Content-block styles (shared with /pages/<slug>) followed by the blog styles.
import "../../pages/[slug]/content-page.css";
import "../blogs.css";

// Every article has a flat URL /blogs/<slug>; anything else under /blogs/ (including the source-format
// /blogs/<blog> and /blogs/<blog>/<slug>) is a local 404 by owner decision (no redirects).
export const dynamicParams = false;

export function generateStaticParams() {
  return blogRepository.slugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = blogRepository.article(slug);
  if (!article) return {};
  return {
    title: article.documentTitle,
    description: article.description ?? undefined,
    alternates: { canonical: `${blogRepository.articleHref(slug)}/` },
  };
}

export default async function ArticleRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = blogRepository.article(slug);
  if (!article) notFound();
  return (
    <SiteChrome backToTop>
      <ArticlePage article={article} />
      <NewsletterSection />
    </SiteChrome>
  );
}
