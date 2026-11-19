// Quick-view data of one product (round 282): the purchase-form subset of the product page view model, prerendered
// as a static file per product (static export). It stands in for the source's `/products/<handle>?view=quick-view`
// section request that fills #Product-Drawer; the backend phase replaces it with the product API behind
// `quickViewSource` (src/lib/catalog/client.ts).
import { repositories } from "@/lib/data";
import type { QuickViewProduct } from "@/lib/catalog/types";

export const dynamic = "force-static";
export const dynamicParams = false;

const { catalog } = repositories;

export async function generateStaticParams() {
  return (await catalog.listSummaries()).map((p) => ({ handle: p.handle }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const detail = await catalog.getProductPage(handle);
  if (!detail) return Response.json({ error: "not found" }, { status: 404 });
  const { title, priceText, options, initial, variants, galleries, swatches, minOrder, personalisation } = detail;
  const body: QuickViewProduct = { handle, title, priceText, options, initial, variants, galleries, swatches, minOrder, personalisation };
  return Response.json(body);
}
