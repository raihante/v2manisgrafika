/* eslint-disable @next/next/no-img-element -- static export (images.unoptimized); plain <img> with local assets */
// Blog article card (portal grid + related articles). OWN DESIGN styled with source blog tokens (jsc-reset-styles.css
// `.blog-post.jsc-custom-cover-image`: 19.2px Everett title clamped to 2 lines, 13px meta; `.blog-post-list` pink
// #fe4dd2 / grey #cecece and the 54.71x46.41 arrow).
import Link from "next/link";
import type { BlogArticle, BlogCategory } from "@/lib/blogs/repository";
import { blogRepository } from "@/lib/blogs/repository";

export function BlogArrow({ className = "blog-arrow" }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54.71 46.41" aria-hidden="true" focusable="false">
      <polygon points="36.71 0 25.06 0 39.08 17.93 0 17.93 0 28.48 39.08 28.48 25.06 46.41 36.71 46.41 54.71 23.21 36.71 0" />
    </svg>
  );
}

export default function ArticleCard({ article, category }: { article: BlogArticle; category: BlogCategory | null }) {
  return (
    <article className="blog-card">
      <Link className="blog-card__link" href={blogRepository.articleHref(article.slug)}>
        <span className="blog-card__media">
          {article.hero ? (
            <img src={article.hero.src} alt="" width={article.hero.width ?? undefined} height={article.hero.height ?? undefined} loading="lazy" decoding="async" />
          ) : null}
        </span>
        <span className="blog-card__meta">
          {category ? <span className="blog-card__category">{category.title}</span> : null}
          <time className="blog-card__date" dateTime={article.date}>{article.dateLabel}</time>
        </span>
        <span className="blog-card__title">{article.title}</span>
        {article.description ? <span className="blog-card__excerpt">{article.description}</span> : null}
        <span className="blog-card__more">Read more <BlogArrow /></span>
      </Link>
    </article>
  );
}
