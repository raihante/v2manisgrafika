// MOCK order hand-off between /checkout and /checkout/thank-you (sessionStorage, preview only).
// Card details are never stored. Replace with the Shopify checkout/order API (docs/mock-behaviors.md).
import type { CartLine } from "@/lib/cart";

export type MockOrder = {
  number: string;
  email: string;
  name: string;
  address: string;
  phone: string;
  shipping: { label: string; price: number };
  payment: string;
  lines: CartLine[];
  subtotal: number;
  total: number;
};

export const ORDER_KEY = "btv-preview-last-order";

// ASSUMPTION: shipping methods and rates are placeholders; the source checkout was not observed for this preview.
export const SHIPPING_METHODS = [
  { id: "standard", label: "Standard Delivery", eta: "2–5 business days", price: 25000 },
  { id: "express", label: "Express Delivery", eta: "1–2 business days", price: 50000 },
] as const;

export const PROVINCES = ["Bali", "Banten", "DI Yogyakarta", "DKI Jakarta", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Kalimantan Timur", "Sulawesi Selatan", "Sumatera Utara"];
