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
    // depend on it.
    <html lang="en" className="js">
      <body>{children}</body>
    </html>
  );
}
