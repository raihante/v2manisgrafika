import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/HomePage";
import CollectionGrid from "@/components/commerce/CollectionGrid";
import { catalog } from "@/lib/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return catalog.listCollections().map((c) => ({ handle: c.handle }));
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return { title: `${catalog.getCollection(handle)?.title ?? "Collection"} – Beyond The Vines Indonesia` };
}

export default async function CollectionPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const collection = catalog.getCollection(handle);
  if (!collection) notFound();
  return <SiteChrome><CollectionGrid collection={collection} /></SiteChrome>;
}
