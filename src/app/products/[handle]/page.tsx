import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/HomePage";
import ProductDetail from "@/components/commerce/ProductDetail";
import { catalog } from "@/lib/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return catalog.listProducts().map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return { title: `${catalog.getProduct(handle)?.title ?? "Product"} | Beyond The Vines – Beyond The Vines Indonesia` };
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = catalog.getProduct(handle);
  if (!product) notFound();
  const related = catalog.listProducts().filter((p) => p.handle !== handle).slice(0, 4);
  return <SiteChrome><ProductDetail product={product} related={related} /></SiteChrome>;
}
