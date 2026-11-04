import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // The dev-mode Next.js badge overlays page content and would pollute fidelity screenshots.
  devIndicators: false,
};

export default nextConfig;
