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

const line = { handle: "landscape-studio-tote", title: "Landscape Studio Tote", image: "/x.jpg", price: 1299000, colour: "Navy/Black", size: null };

describe("localCart", () => {
  let store: Map<string, string>;
  beforeEach(() => { vi.resetModules(); store = installWindow(); });

  it("adds, merges, updates and removes lines, persisting to storage", async () => {
    const { localCart } = await import("@/lib/cart");
    const seen = vi.fn();
    const off = localCart.subscribe(seen);
    localCart.add(line);
    localCart.add(line, 2);
    expect(localCart.getLines()).toHaveLength(1);
    expect(localCart.getLines()[0].quantity).toBe(3);
    localCart.add({ ...line, colour: "Terracotta/Plum" });
    expect(localCart.getLines()).toHaveLength(2);
    const id = localCart.getLines()[0].id;
    localCart.setQuantity(id, 5);
    expect(localCart.getLines()[0].quantity).toBe(5);
    localCart.setQuantity(id, 0);
    expect(localCart.getLines().map((l) => l.colour)).toEqual(["Terracotta/Plum"]);
    expect(JSON.parse(store.get("btv-preview-cart")!)).toHaveLength(1);
    localCart.clear();
    expect(localCart.getLines()).toEqual([]);
    expect(seen).toHaveBeenCalled();
    off();
  });

  it("recovers from corrupt storage", async () => {
    store.set("btv-preview-cart", "{not json");
    const { localCart } = await import("@/lib/cart");
    expect(localCart.getLines()).toEqual([]);
  });
});
