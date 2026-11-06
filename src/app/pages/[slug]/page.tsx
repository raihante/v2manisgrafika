import { notFound } from "next/navigation";
import { NewsletterSection, SiteChrome } from "@/components/HomePage";
import ContentPage from "@/components/pages/ContentPage";
import { contentPageRepository } from "@/lib/pages/content";
// Own-design content-block template (not generated from source CSS).
import "./content-page.css";

// Only the content-block pages are generated; every other /pages/<slug> without its own route (size guides,
// the-btv-stores, the-vine-club, swym-wishlist, search) is a local 404 by owner decision (docs/page-inventory.md).
export const dynamicParams = false;

export function generateStaticParams() {
  return contentPageRepository.slugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: contentPageRepository.get(slug)?.documentTitle };
}

export default async function ContentRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = contentPageRepository.get(slug);
  if (!page) notFound();
  return (
    <SiteChrome backToTop>
      <ContentPage page={page} />
      <NewsletterSection />
    </SiteChrome>
  );
}
