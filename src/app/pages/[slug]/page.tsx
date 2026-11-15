import { notFound } from "next/navigation";
import { NewsletterSection, SiteChrome } from "@/components/shell/SiteChrome";
import ContentPage from "@/components/pages/ContentPage";
import { repositories } from "@/lib/data";
// Own-design content-block template (not generated from source CSS).
import "./content-page.css";

// Only the content-block pages are generated; every other /pages/<slug> without its own route (size guides,
// the-btv-stores, the-vine-club, swym-wishlist, search) is a local 404 by owner decision (docs/page-inventory.md).
export const dynamicParams = false;

const { pages } = repositories;

export async function generateStaticParams() {
  return (await pages.contentSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: (await pages.getContentPage(slug))?.documentTitle };
}

export default async function ContentRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await pages.getContentPage(slug);
  if (!page) notFound();
  return (
    <SiteChrome backToTop>
      <ContentPage page={page} />
      <NewsletterSection />
    </SiteChrome>
  );
}
