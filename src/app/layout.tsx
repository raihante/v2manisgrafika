import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beyond The Vines | Indonesia Online Store",
  description: "A local frontend reconstruction of the Beyond The Vines Indonesia homepage.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
