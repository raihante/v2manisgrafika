import type { Metadata } from "next";
import "./globals.css";
import "./shell-source.css";
import "./commerce.css";
import "./overlays.css";
import "./shell.css";

export const metadata: Metadata = {
  title: "Beyond The Vines | Indonesia Online Store",
  description: "A local frontend reconstruction of the Beyond The Vines Indonesia homepage.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // The source theme sets html.js; shell rules such as `.js .mobile-toggle-wrapper[open].active .mobile-menu-drawer`
    // depend on it. data-scroll-behavior="smooth": Next 16 then disables the source's smooth scroll-behavior during
    // client navigations (the source always does full page loads, which never animate the scroll position).
    <html lang="en" className="js" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
