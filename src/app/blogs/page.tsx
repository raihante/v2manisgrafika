import { Suspense } from "react";
import { NewsletterSection, SiteChrome } from "@/components/shell/SiteChrome";
import BlogPortal, { BlogPortalView } from "@/components/blogs/BlogPortal";
import { repositories } from "@/lib/data";
// Own-design blog portal + article styles (not generated from source CSS).
import "./blogs.css";

export const metadata = { title: "Blog – Manis Grafika", alternates: { canonical: "/blogs/" } };

// ?category= and ?page= are read on the client (static export); the prerendered HTML is the unfiltered first page.
export default async function BlogsRoute() {
  const data = { categories: await repositories.blogs.listCategories(), articles: await repositories.blogs.listArticles() };
  return (
    <SiteChrome backToTop>
      <Suspense fallback={<BlogPortalView {...data} categoryHandle={null} page={1} />}><BlogPortal {...data} /></Suspense>
      <NewsletterSection />
    </SiteChrome>
  );
}
