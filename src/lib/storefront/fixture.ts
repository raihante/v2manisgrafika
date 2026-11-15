// Fixture storefront adapter (server only): shell from src/data/header.json (scripts/build-header-data.mjs,
// 2026-11-06 snapshot), layout inputs from src/data/layout.json, footer/newsletter/homepage sections from
// src/data/homepage.json. Every captured SVG icon is sanitized on load. The MySQL adapter replaces this module behind
// StorefrontRepository (src/lib/data.ts).
import "server-only";
import headerFixture from "@/data/header.json";
import homepage from "@/data/homepage.json";
import layoutFixture from "@/data/layout.json";
import { fixtureCatalog, toRailCard } from "@/lib/catalog/fixture";
import { sanitizeSvgInner } from "@/lib/html/sanitize";
import type { ChromeData, HomepageData, ShellData, StorefrontRepository } from "./types";

/** Deep-copies the fixture, sanitizing the inner markup of every { props, inner } icon. */
function sanitizeIcons<T>(value: T): T {
  if (Array.isArray(value)) return value.map(sanitizeIcons) as T;
  if (value && typeof value === "object") {
    const entries = Object.entries(value).map(([k, v]) => [k, sanitizeIcons(v)]);
    const out = Object.fromEntries(entries) as Record<string, unknown>;
    if ("props" in out && typeof out.inner === "string") out.inner = sanitizeSvgInner(out.inner);
    return out as T;
  }
  return value;
}

const shell = sanitizeIcons(headerFixture) as unknown as ShellData;

let chrome: Promise<ChromeData> | null = null;
let home: HomepageData | null = null;

export const fixtureStorefront: StorefrontRepository = {
  getChrome: () => (chrome ??= fixtureCatalog.listSummaries().then((summaries) => ({
    shell,
    layout: layoutFixture,
    footerLinks: homepage.footerLinks,
    payments: homepage.payments,
    newsletter: homepage.newsletter,
    searchSuggestions: summaries.map(({ handle, title, image, price }) => ({ handle, title, image, price })),
  }))),
  getCheckoutBranding: async () => ({ logo: homepage.logo, payments: homepage.payments }),
  getHomepage: async () => (home ??= {
    categoryHero: homepage.categoryHero,
    promotions: homepage.promotions,
    rails: homepage.collections.map((c) => ({ title: c.title, shopMore: c.shopMore, headerBackground: c.headerBackground, products: c.products.map(toRailCard) })),
    social: homepage.social,
  }),
};
