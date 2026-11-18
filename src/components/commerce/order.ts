// MOCK order hand-off between /checkout and /checkout/thank-you (sessionStorage, preview only).
// Nothing is sent anywhere. Replace with the custom order API + Komerce payment (docs/mock-behaviors.md).
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

export const ORDER_KEY = "mg-preview-last-order";

// MOCK: flat placeholder rates until the RajaOngkir (Komerce) Shipping Cost API is integrated.
export const SHIPPING_METHODS = [
  { id: "reguler", label: "Reguler", eta: "2–5 hari kerja setelah produksi", price: 25000 },
  { id: "ekspres", label: "Ekspres", eta: "1–2 hari kerja setelah produksi", price: 50000 },
] as const;

// MOCK: Komerce Payment API virtual-account banks (docs read 2026-11-15); the real list comes from its /methods endpoint.
export const VA_BANKS = ["BCA", "BNI", "BRI", "Mandiri", "Permata"] as const;

// The 38 provinces of Indonesia (since the 2022 Papua expansion), alphabetical.
export const PROVINCES = [
  "Aceh", "Bali", "Banten", "Bengkulu", "DI Yogyakarta", "DKI Jakarta", "Gorontalo", "Jambi", "Jawa Barat", "Jawa Tengah",
  "Jawa Timur", "Kalimantan Barat", "Kalimantan Selatan", "Kalimantan Tengah", "Kalimantan Timur", "Kalimantan Utara",
  "Kepulauan Bangka Belitung", "Kepulauan Riau", "Lampung", "Maluku", "Maluku Utara", "Nusa Tenggara Barat",
  "Nusa Tenggara Timur", "Papua", "Papua Barat", "Papua Barat Daya", "Papua Pegunungan", "Papua Selatan", "Papua Tengah",
  "Riau", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tengah", "Sulawesi Tenggara", "Sulawesi Utara",
  "Sumatera Barat", "Sumatera Selatan", "Sumatera Utara",
];
