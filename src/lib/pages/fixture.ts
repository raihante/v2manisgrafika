// Fixture page adapter (server only). Content-block pages: src/data/pages/content/<slug>.json
// (scripts/build-content-pages.mjs, own design mapped from the Shogun source pages); FAQ, contact and wishlist:
// src/data/pages/*.json (scripts/build-{faq,contact,wishlist}-data.mjs, 2026-11-06 snapshot). Rich text is sanitized on
// load. The MySQL adapter replaces this module behind PageRepository (src/lib/data.ts).
import "server-only";
import aboutUs from "@/data/pages/content/about-us.json";
import privacyPolicy from "@/data/pages/content/privacy-policy.json";
import returns from "@/data/pages/content/returns.json";
import shipping from "@/data/pages/content/kebijakan-pengiriman.json";
import termsOfService from "@/data/pages/content/terms-of-service.json";
import contactFixture from "@/data/pages/contact-us.json";
import faqFixture from "@/data/pages/faqs.json";
import wishlistFixture from "@/data/pages/wishlist.json";
import { sanitizeRichText } from "@/lib/html/sanitize";
import type { ContactPageData, ContentBlock, ContentPageData, FaqPageData, PageRepository, WishlistPageData } from "./types";

/** Block as stored in the fixtures: the same shape with unsanitized HTML strings. */
type RawBlock = { type: string; html?: string; items?: unknown[]; [key: string]: unknown };

export function sanitizeBlock(raw: RawBlock): ContentBlock {
  switch (raw.type) {
    case "richText":
    case "callout":
      return { ...raw, html: sanitizeRichText(raw.html ?? "") } as ContentBlock;
    case "iconList":
      return { ...raw, items: (raw.items as { html: string }[]).map((i) => ({ ...i, html: sanitizeRichText(i.html) })) } as ContentBlock;
    case "list":
      return { ...raw, items: (raw.items as string[]).map(sanitizeRichText) } as ContentBlock;
    default:
      return raw as unknown as ContentBlock;
  }
}

const contentPages = new Map<string, ContentPageData>(
  [aboutUs, termsOfService, privacyPolicy, returns, shipping].map((p) => [p.slug, { ...(p as unknown as ContentPageData), blocks: (p.blocks as RawBlock[]).map(sanitizeBlock) }]),
);

const faq: FaqPageData = {
  ...(faqFixture as unknown as FaqPageData),
  groups: faqFixture.groups.map((g) => ({ ...g, rows: g.rows.map((r) => ({ ...r, answerHtml: sanitizeRichText(r.answerHtml) })) })),
};

const contact: ContactPageData = {
  ...(contactFixture as unknown as ContactPageData),
  multicolumn: { ...contactFixture.multicolumn, columns: contactFixture.multicolumn.columns.map((c) => ({ ...c, html: sanitizeRichText(c.html) })) },
};

export const fixturePages: PageRepository = {
  contentSlugs: async () => [...contentPages.keys()],
  getContentPage: async (slug) => contentPages.get(slug) ?? null,
  getFaqPage: async () => faq,
  getContactPage: async () => contact,
  getWishlistPage: async () => wishlistFixture as WishlistPageData,
};
