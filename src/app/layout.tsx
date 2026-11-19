import type { Metadata } from "next";
import "./globals.css";
import "./shell-source.css";
import "./commerce.css";
import "./overlays.css";
import "./shell.css";
// Source product-page rules (generated, every selector scoped to .template-product) + local overrides. Global since
// round 282: the card quick-view drawer (#Product-Drawer, every route) renders the same purchase form.
import "./products/[handle]/pdp-source.css";
import "./products/[handle]/product-page.css";
import "./quick-view.css";
import "./brand.css";

export const metadata: Metadata = {
  title: "Manis Grafika – Buku Yasin & Paket Hadiah",
  description: "Manis Grafika: buku Yasin, Majmu Syarif dan paket hadiah premium dari Surakarta, dikirim ke seluruh Indonesia.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // The source theme sets html.js; shell rules such as `.js .mobile-toggle-wrapper[open].active .mobile-menu-drawer`
    // depend on it. data-scroll-behavior="smooth": Next 16 then disables the source's smooth scroll-behavior during
    // client navigations (the source always does full page loads, which never animate the scroll position).
    <html lang="id" className="js" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
