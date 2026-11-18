import { notFound } from "next/navigation";
import { NewsletterSection, SiteChrome } from "@/components/shell/SiteChrome";
import ProductDetail from "@/components/commerce/ProductDetail";
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
  const title = (await catalog.getProduct(handle))?.title ?? "Product";
  return { title: `${title} – Manis Grafika` };
}

export default async function ProductRoute({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const detail = await catalog.getProductPage(handle);
  if (detail) return <SiteChrome backToTop><ProductPage product={detail} /><NewsletterSection /></SiteChrome>;
  // Bundle products (btv-to-go-phone-strap) keep the round-251 approximate page until a bundle UI exists (SESSION_HANDOFF.md).
  const product = await catalog.getSummary(handle);
  if (!product) notFound();
  const related = (await catalog.listSummaries()).filter((p) => p.handle !== handle).slice(0, 4);
  return <SiteChrome><ProductDetail product={product} related={related} /></SiteChrome>;
}
