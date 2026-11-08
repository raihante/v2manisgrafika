import { Suspense } from "react";
import { NewsletterSection, SiteChrome } from "@/components/HomePage";
import BlogPortal, { BlogPortalView } from "@/components/blogs/BlogPortal";
// Own-design blog portal + article styles (not generated from source CSS).
import "./blogs.css";

export const metadata = { title: "Blogs – Beyond The Vines Indonesia", alternates: { canonical: "/blogs/" } };

// ?category= and ?page= are read on the client (static export); the prerendered HTML is the unfiltered first page.
export default function BlogsRoute() {
  return (
    <SiteChrome backToTop>
      <Suspense fallback={<BlogPortalView categoryHandle={null} page={1} />}><BlogPortal /></Suspense>
      <NewsletterSection />
    </SiteChrome>
  );
}
