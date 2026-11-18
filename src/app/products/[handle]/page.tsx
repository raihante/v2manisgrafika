import { notFound } from "next/navigation";
import { NewsletterSection, SiteChrome } from "@/components/shell/SiteChrome";
import ProductPage from "@/components/commerce/ProductPage";
import { repositories } from "@/lib/data";
// Source product-page rules (generated, scoped to .template-product) followed by local overrides.
import "./pdp-source.css";
import "./product-page.css";

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
