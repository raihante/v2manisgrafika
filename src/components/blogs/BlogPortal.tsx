"use client";
// /blogs portal (OWN DESIGN; the source has no /blogs page). Category filter and pagination live in the URL
// (?category=<blog>&page=N) and are resolved on the client because the site is a static export; the prerendered HTML
// (Suspense fallback) is the unfiltered first page. MOCK: client-side filtering over fixtures (docs/mock-behaviors.md).
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ArticleCard from "@/components/blogs/ArticleCard";
import { blogRepository } from "@/lib/blogs/repository";

export function BlogPortalView({ categoryHandle, page }: { categoryHandle: string | null; page: number }) {
  const { category, items, page: current, pageCount, total } = blogRepository.query(categoryHandle, page);
  const categories = blogRepository.categories();
  const title = category ? category.title : "Blogs";
  return (
    <div className="blog-portal">
      <nav className="blog-breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li><Link href="/">Home</Link></li>
          {category ? <li><Link href="/blogs">Blogs</Link></li> : <li aria-current="page">Blogs</li>}
          {category ? <li aria-current="page">{category.title}</li> : null}
        </ol>
      </nav>
      <header className="blog-portal__header">
        <h1 className="blog-portal__title">{title}</h1>
        {category?.description ? <p className="blog-portal__description">{category.description}</p> : null}
      </header>
      <nav className="blog-filter" aria-label="Blog categories">
        <ul>
          <li><Link className="blog-filter__chip" href="/blogs" aria-current={category ? undefined : "page"}>All</Link></li>
          {categories.map((c) => (
            <li key={c.handle}>
              <Link className="blog-filter__chip" href={blogRepository.categoryHref(c.handle)} aria-current={category?.handle === c.handle ? "page" : undefined}>{c.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="blog-portal__count" aria-live="polite">{total} {total === 1 ? "article" : "articles"}</p>
      {items.length ? (
        <div className="blog-grid">
          {items.map((a) => <ArticleCard key={a.slug} article={a} category={category ? null : blogRepository.category(a.category)} />)}
        </div>
      ) : (
        <div className="blog-empty">
          <p>There are no articles in {title} yet.</p>
          <Link className="blog-button" href="/blogs">View all articles</Link>
        </div>
      )}
      {pageCount > 1 ? (
        <nav className="blog-pagination" aria-label="Pagination">
          <ul>
            {current > 1 ? <li><Link className="blog-pagination__step" href={blogRepository.categoryHref(category?.handle ?? null, current - 1)} aria-label="Previous page">Prev</Link></li> : null}
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <li key={n}>
                {n === current ? (
                  <span className="blog-pagination__page" aria-current="page">{n}</span>
                ) : (
                  <Link className="blog-pagination__page" href={blogRepository.categoryHref(category?.handle ?? null, n)}>{n}</Link>
                )}
              </li>
            ))}
            {current < pageCount ? <li><Link className="blog-pagination__step" href={blogRepository.categoryHref(category?.handle ?? null, current + 1)} aria-label="Next page">Next</Link></li> : null}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}

export default function BlogPortal() {
  const params = useSearchParams();
  return <BlogPortalView categoryHandle={params.get("category")} page={Number(params.get("page") ?? 1)} />;
}
