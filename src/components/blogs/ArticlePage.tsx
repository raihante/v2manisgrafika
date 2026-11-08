/* eslint-disable @next/next/no-img-element -- static export (images.unoptimized); plain <img> with local assets */
// The ONE article template for every blog article (owner decision 2026-11-06: "1 template artikel saja sudah cukup").
// OWN DESIGN, NOT SOURCE-FAITHFUL; styled after /blogs/promotions/a-little-love-for-your-carryall with source tokens.
// Body = content blocks (src/components/pages/ContentPage.tsx Block). Articles without a stored body render the shared
// placeholder body (MOCK until the CMS supplies the content).
import Link from "next/link";
import ArticleCard, { BlogArrow } from "@/components/blogs/ArticleCard";
import { Block } from "@/components/pages/ContentPage";
import type { BlogArticle } from "@/lib/blogs/repository";
import { blogRepository } from "@/lib/blogs/repository";

export default function ArticlePage({ article }: { article: BlogArticle }) {
  const category = blogRepository.category(article.category);
  const { blocks, placeholder } = blogRepository.body(article);
  const related = blogRepository.related(article);
  const categoryHref = blogRepository.categoryHref(article.category);
  return (
    <article className={`blog-article${placeholder ? " blog-article--placeholder" : ""}`}>
      <nav className="blog-breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/blogs">Blogs</Link></li>
          {category ? <li><Link href={categoryHref}>{category.title}</Link></li> : null}
          <li aria-current="page">{article.title}</li>
        </ol>
      </nav>
      <header className="blog-article__header">
        <p className="blog-article__meta">
          {category ? <Link className="blog-article__category" href={categoryHref}>{category.title}</Link> : null}
          <time dateTime={article.date}>{article.dateLabel}</time>
        </p>
        <h1 className="blog-article__title">{article.title}</h1>
        {article.source ? (
          <p className="blog-article__source">
            Featured in <span className="blog-article__publication">{article.source.publication}</span>
          </p>
        ) : null}
      </header>
      {article.hero ? (
        <figure className="blog-article__hero">
          <img src={article.hero.src} alt={article.hero.alt} width={article.hero.width ?? undefined} height={article.hero.height ?? undefined} decoding="async" fetchPriority="high" />
        </figure>
      ) : null}
      <div className="blog-article__body content-page">
        {placeholder ? <p className="blog-article__notice">Placeholder content: the full article will be supplied by the CMS.</p> : null}
        <div className="content-body">
          {blocks.map((block, i) => <Block block={block} key={i} />)}
        </div>
        {article.source ? (
          <p className="blog-article__external">
            <a className="blog-button" href={article.source.url} target="_blank" rel="noopener noreferrer">
              Read the full story <BlogArrow />
            </a>
          </p>
        ) : null}
      </div>
      <section className="blog-related" aria-labelledby="blog-related-title">
        <div className="blog-related__head">
          <h2 className="blog-related__title" id="blog-related-title">Related articles</h2>
          {category ? <Link className="blog-related__back" href={categoryHref}>Back to {category.title} <BlogArrow /></Link> : null}
        </div>
        <div className="blog-grid">
          {related.map((a) => <ArticleCard key={a.slug} article={a} category={blogRepository.category(a.category)} />)}
        </div>
      </section>
    </article>
  );
}
