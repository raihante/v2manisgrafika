// MOCK cart service (localStorage). Runs in node with a minimal window stand-in.
import { beforeEach, describe, expect, it, vi } from "vitest";

function installWindow() {
  const store = new Map<string, string>();
  const listeners = new Map<string, Set<(e: unknown) => void>>();
  Object.assign(globalThis, {
    window: {
      localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) },
      addEventListener: (t: string, f: (e: unknown) => void) => void (listeners.get(t) ?? listeners.set(t, new Set()).get(t)!).add(f),
      removeEventListener: (t: string, f: (e: unknown) => void) => void listeners.get(t)?.delete(f),
    },
  });
  return store;
}

const line = {
  handle: "zyla-series", variantId: "2812", title: "Zyla Series", image: "/x.webp", price: 72391,
  options: [{ name: "Cover", value: "Spoon Leather Gold" }, { name: "Jenis Kertas", value: "HVS" }, { name: "Jumlah Halaman", value: "208" }],
};

describe("localCart", () => {
  let store: Map<string, string>;
  beforeEach(() => { vi.resetModules(); store = installWindow(); });

  it("adds, merges, updates and removes lines, persisting to storage", async () => {
    const { localCart, lineMeta } = await import("@/lib/cart");
    const seen = vi.fn();
    const off = localCart.subscribe(seen);
    localCart.add(line);
    localCart.add(line, 2);
    expect(localCart.getLines()).toHaveLength(1);
    expect(localCart.getLines()[0].quantity).toBe(3);
    expect(lineMeta(localCart.getLines()[0])).toBe("Spoon Leather Gold / HVS / 208");
    localCart.add({ ...line, variantId: "2813" });
    expect(localCart.getLines()).toHaveLength(2);
    const id = localCart.getLines()[0].id;
    localCart.setQuantity(id, 5);
    expect(localCart.getLines()[0].quantity).toBe(5);
    localCart.setQuantity(id, 0);
    expect(localCart.getLines().map((l) => l.variantId)).toEqual(["2813"]);
    expect(JSON.parse(store.get("mg-preview-cart")!)).toHaveLength(1);
    localCart.clear();
    expect(localCart.getLines()).toEqual([]);
    expect(seen).toHaveBeenCalled();
    off();
  });

  it("enforces the product minimum order", async () => {
    const { localCart } = await import("@/lib/cart");
    localCart.add({ ...line, minQuantity: 50 });
    expect(localCart.getLines()[0].quantity).toBe(50);
    localCart.add({ ...line, minQuantity: 50 }, 10);
    expect(localCart.getLines()[0].quantity).toBe(100);
    localCart.setQuantity(localCart.getLines()[0].id, 20);
    expect(localCart.getLines()[0].quantity).toBe(50);
  });

  it("keeps differently personalised lines apart", async () => {
    const { localCart } = await import("@/lib/cart");
    localCart.add({ ...line, personalisation: [{ key: "redaksi", label: "Teks", value: "A" }] });
    localCart.add({ ...line, personalisation: [{ key: "redaksi", label: "Teks", value: "B" }] });
    expect(localCart.getLines()).toHaveLength(2);
  });

  it("recovers from corrupt or outdated storage", async () => {
    store.set("mg-preview-cart", JSON.stringify([{ handle: "old", colour: "Navy", quantity: 1 }]));
    const { localCart } = await import("@/lib/cart");
    expect(localCart.getLines()).toEqual([]);
  });
});
