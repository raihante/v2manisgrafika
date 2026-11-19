// Browser-side product data for the card quick-view drawer. MOCK backend: reads the static per-product file
// /products/<handle>/quick-view.json prerendered at build time (src/app/products/[handle]/quick-view.json/route.ts)
// instead of the source's `?view=quick-view` section request (docs/mock-behaviors.md "Quick view"). The backend phase
// points `quickViewSource` at the product API behind the same interface.
import type { QuickViewProduct } from "./types";

export type QuickViewSource = { load(handle: string): Promise<QuickViewProduct> };

const cache = new Map<string, Promise<QuickViewProduct>>();

const staticQuickViewSource: QuickViewSource = {
  load(handle) {
    let pending = cache.get(handle);
    if (!pending) {
      pending = fetch(`/products/${encodeURIComponent(handle)}/quick-view.json`).then((r) => {
        if (!r.ok) throw new Error(`Quick view ${handle}: HTTP ${r.status}`);
        return r.json() as Promise<QuickViewProduct>;
      });
      pending.catch(() => cache.delete(handle));
      cache.set(handle, pending);
    }
    return pending;
  },
};

export const quickViewSource: QuickViewSource = staticQuickViewSource;
