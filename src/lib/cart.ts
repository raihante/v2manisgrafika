"use client";
// MOCK CartService (preview only): persists line items in localStorage. No inventory, pricing, or order API is called.
// Replace with the server cart API when the backend phase starts (docs/mock-behaviors.md "Cart").
import { useSyncExternalStore } from "react";

export type CartOption = { name: string; value: string };
/** Personalisation answer. MOCK: a photo field stores only the chosen file name (no upload until the backend). */
export type CartPersonalisation = { key: string; label: string; value: string };

export type CartLine = {
  id: string;
  handle: string;
  variantId: string | null;
  title: string;
  image: string;
  price: number;
  options: CartOption[];
  personalisation: CartPersonalisation[];
  /** Smallest quantity allowed for this line (product minimum order). */
  minQuantity: number;
  quantity: number;
};

export type NewCartLine = Omit<CartLine, "id" | "quantity" | "personalisation" | "minQuantity"> & {
  personalisation?: CartPersonalisation[];
  minQuantity?: number;
};

export type CartService = {
  getLines(): CartLine[];
  /** Adds quantity (default: the line minimum) or merges into an identical line. */
  add(line: NewCartLine, quantity?: number): void;
  /** quantity <= 0 removes the line; otherwise it is raised to the line minimum. */
  setQuantity(id: string, quantity: number): void;
  remove(id: string): void;
  clear(): void;
  subscribe(listener: () => void): () => void;
};

const STORAGE_KEY = "mg-preview-cart";
const EMPTY: CartLine[] = [];
let cache: CartLine[] | null = null;
const listeners = new Set<() => void>();

/** Option values joined for cart, checkout and order summaries ("Spoon Leather Gold / HVS / 208"). */
export const lineMeta = (line: CartLine) => line.options.map((o) => o.value).filter(Boolean).join(" / ");

const isLine = (l: unknown): l is CartLine => !!l && typeof l === "object" && Array.isArray((l as CartLine).options) && typeof (l as CartLine).quantity === "number";

function read(): CartLine[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed) ? parsed.filter(isLine) : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(lines: CartLine[]) {
  cache = lines;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Storage unavailable (private mode): keep the in-memory cart for this page session.
  }
  listeners.forEach((listener) => listener());
}

const lineId = (line: NewCartLine) =>
  [line.handle, line.variantId ?? line.options.map((o) => o.value).join("|"), ...(line.personalisation ?? []).map((p) => `${p.key}=${p.value}`)].join("::");

export const localCart: CartService = {
  getLines: read,
  add(line, quantity) {
    const minQuantity = Math.max(1, line.minQuantity ?? 1);
    const qty = Math.max(minQuantity, quantity ?? minQuantity);
    const id = lineId(line);
    const lines = read();
    const existing = lines.find((l) => l.id === id);
    write(existing
      ? lines.map((l) => (l.id === id ? { ...l, quantity: l.quantity + qty } : l))
      : [...lines, { ...line, personalisation: line.personalisation ?? [], minQuantity, id, quantity: qty }]);
  },
  setQuantity(id, quantity) {
    write(quantity <= 0
      ? read().filter((l) => l.id !== id)
      : read().map((l) => (l.id === id ? { ...l, quantity: Math.max(l.minQuantity, quantity) } : l)));
  },
  remove(id) {
    write(read().filter((l) => l.id !== id));
  },
  clear() {
    write(EMPTY);
  },
  subscribe(listener) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        cache = null;
        listener();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
};

export function useCart(service: CartService = localCart) {
  const lines = useSyncExternalStore(service.subscribe, service.getLines, () => EMPTY);
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  return { lines, count, subtotal, service };
}
