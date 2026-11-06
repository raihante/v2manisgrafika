// Content-block page repository (/pages/about-us and the 4 policy pages). OWN DESIGN, NOT SOURCE-FAITHFUL
// (AGENTS.md "CMS-template scope reduction"): the source pages are Shogun page-builder layouts; each page's content is
// mapped into the project's block types by scripts/build-content-pages.mjs and stored in src/data/pages/content/.
// A CMS adapter replaces the fixtures by returning the same ContentPageData shape.
import aboutUs from "@/data/pages/content/about-us.json";
import privacyPolicy from "@/data/pages/content/privacy-policy.json";
import returns from "@/data/pages/content/returns.json";
import shippingRate from "@/data/pages/content/shipping-rate.json";
import termsOfService from "@/data/pages/content/terms-of-service.json";

export type ContentImage = { src: string; alt: string; width: number | null; height: number | null };

export type ContentBlock =
  | { type: "heading"; html: string; align: "left" | "center" }
  /** Sanitized inline HTML: <p>, <a href>, <strong>/<b>, <em>/<i>, <u>, <br>. */
  | { type: "richText"; html: string; variant: "body" | "lead" | "note" }
  | { type: "image"; image: ContentImage; mobile?: ContentImage; background?: string; mobileBackground?: string; href?: string; maxWidth?: number }
  | { type: "imageGrid"; items: ContentImage[] }
  | { type: "button"; label: string; href: string }
  | { type: "video"; src: string; poster?: string }
  | { type: "iconList"; variant: "steps" | "bullets"; items: { icon: ContentImage; title?: string; html: string }[] }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "callout"; title: string; html: string };

export type ContentPageData = {
  slug: string;
  documentTitle: string;
  title: string;
  /** Display title lines rendered on the accent band; pages without it render the title visually hidden. */
  heroTitle?: string[];
  /** Title artwork shown instead of a text band (returns, shipping-rate). */
  hero?: { image: ContentImage; fit: "contain" | "cover"; maxWidth: number; height: number; mobileHeight: number | null };
  /** Page accent colour taken from the source page background. */
  accent: string;
  textColor?: string;
  blocks: ContentBlock[];
};

const pages: Record<string, ContentPageData> = Object.fromEntries(
  [aboutUs, termsOfService, privacyPolicy, returns, shippingRate].map((p) => [p.slug, p as ContentPageData]),
);

export const contentPageRepository = {
  slugs: (): string[] => Object.keys(pages),
  get: (slug: string): ContentPageData | null => pages[slug] ?? null,
};
