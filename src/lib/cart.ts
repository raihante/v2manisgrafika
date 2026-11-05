"use client";
// MOCK CartService (preview only): persists line items in localStorage. No inventory, pricing, or order API is called.
// Replace with the Shopify/CMS cart API when backend integration starts (docs/mock-behaviors.md).
import { useSyncExternalStore } from "react";

export type CartLine = {
  id: string;
  handle: string;
  title: string;
  image: string;
  price: number;
  colour: string;
  size: string | null;
  quantity: number;
};

export type CartService = {
  getLines(): CartLine[];
  add(line: Omit<CartLine, "id" | "quantity">, quantity?: number): void;
  setQuantity(id: string, quantity: number): void;
  remove(id: string): void;
  clear(): void;
  subscribe(listener: () => void): () => void;
};

const STORAGE_KEY = "btv-preview-cart";
const EMPTY: CartLine[] = [];
let cache: CartLine[] | null = null;
const listeners = new Set<() => void>();

function read(): CartLine[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as CartLine[]) : EMPTY;
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

export const localCart: CartService = {
  getLines: read,
  add(line, quantity = 1) {
    const id = `${line.handle}::${line.colour}::${line.size ?? ""}`;
    const lines = read();
    const existing = lines.find((l) => l.id === id);
    write(existing ? lines.map((l) => (l.id === id ? { ...l, quantity: l.quantity + quantity } : l)) : [...lines, { ...line, id, quantity }]);
  },
  setQuantity(id, quantity) {
    write(quantity <= 0 ? read().filter((l) => l.id !== id) : read().map((l) => (l.id === id ? { ...l, quantity } : l)));
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
