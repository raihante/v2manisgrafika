import { notFound } from "next/navigation";
import { NewsletterSection, SiteChrome } from "@/components/shell/SiteChrome";
import ProductPage from "@/components/commerce/ProductPage";
import { repositories } from "@/lib/data";
// Product-page CSS (pdp-source.css, product-page.css) is imported globally by src/app/layout.tsx (round 282).

export const dynamicParams = false;

const { catalog } = repositories;

export async function generateStaticParams() {
  return (await catalog.listSummaries()).map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const title = (await catalog.getProduct(handle))?.title ?? "Produk";
  return { title: `${title} – Manis Grafika` };
}

export default async function ProductRoute({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const detail = await catalog.getProductPage(handle);
  if (!detail) notFound();
  return <SiteChrome backToTop><ProductPage product={detail} /><NewsletterSection /></SiteChrome>;
}
