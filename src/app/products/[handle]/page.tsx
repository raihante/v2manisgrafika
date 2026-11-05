import { notFound } from "next/navigation";
import { NewsletterSection, SiteChrome } from "@/components/HomePage";
import ProductDetail from "@/components/commerce/ProductDetail";
import ProductPage from "@/components/commerce/ProductPage";
import { catalog } from "@/lib/catalog";
import { productDetails } from "@/lib/product-details";
// Source product-page rules (generated, scoped to .template-product) followed by local overrides.
import "./pdp-source.css";
import "./product-page.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return catalog.listProducts().map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const title = productDetails.get(handle)?.title ?? catalog.getProduct(handle)?.title ?? "Product";
  return { title: `${title} | Beyond The Vines – Beyond The Vines Indonesia` };
}

export default async function ProductRoute({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const detail = productDetails.get(handle);
  if (detail) return <SiteChrome backToTop><ProductPage product={detail} /><NewsletterSection /></SiteChrome>;
  // Bundle products (btv-to-go-phone-strap) keep the round-251 approximate page until a bundle UI exists (SESSION_HANDOFF.md).
  const product = catalog.getProduct(handle);
  if (!product) notFound();
  const related = catalog.listProducts().filter((p) => p.handle !== handle).slice(0, 4);
  return <SiteChrome><ProductDetail product={product} related={related} /></SiteChrome>;
}
