// Page types: content-block pages (about-us, policy pages; blocks are reused by the blog article template), the FAQ,
// contact and wishlist pages. Rich-text fields are SafeHtml, sanitized by the adapter.
import type { SafeHtml } from "@/lib/html/safe-html";

export type ContentImage = { src: string; alt: string; width: number | null; height: number | null };

export type ContentBlock =
  /** Plain-text heading (rendered as text, never as HTML). */
  | { type: "heading"; html: string; align: "left" | "center" }
  /** Inline rich text: <p>, <a href>, <strong>/<b>, <em>/<i>, <u>, <br>. */
  | { type: "richText"; html: SafeHtml; variant: "body" | "lead" | "note" }
  | { type: "image"; image: ContentImage; mobile?: ContentImage; background?: string; mobileBackground?: string; href?: string; maxWidth?: number }
  | { type: "imageGrid"; items: ContentImage[] }
  | { type: "button"; label: string; href: string }
  | { type: "video"; src: string; poster?: string }
  | { type: "iconList"; variant: "steps" | "bullets"; items: { icon: ContentImage; title?: string; html: SafeHtml }[] }
  | { type: "list"; ordered: boolean; items: SafeHtml[] }
  | { type: "callout"; title: string; html: SafeHtml };

/** Own-design content-block page (AGENTS.md "CMS-template scope reduction"). */
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

export type FaqRow = { rowClass: string; detailsId: string; question: string; contentClass: string; contentId: string; answerHtml: SafeHtml };
export type FaqGroup = { sectionId: string; className: string; contentClass: string; id: string; heading: string; headerClass: string; rows: FaqRow[] };
/** /pages/faqs (source template page.faq). */
export type FaqPageData = {
  documentTitle: string;
  header: { sectionId: string; className: string; wrapperClass: string; headerClass: string; headerStyle: string; image: string; imageAlt: string; buttons: { label: string; text: string; active: boolean }[] };
  spacer: { sectionId: string; className: string; style: string };
  groups: FaqGroup[];
};

/** /pages/contact-us (source template page.contact). */
export type ContactPageData = {
  documentTitle: string;
  richText: {
    sectionId: string; className: string; style: string; innerClass: string; imgClass: string;
    width: number; height: number; placeholder: string; srcset: { src: string; w: number }[]; alt: string; imgStyle: string;
  };
  /** Third-party form embed. MOCK: `src` points at public/mock/contact-form.html (docs/mock-behaviors.md "Contact form"). */
  form: { sectionId: string; className: string; divStyle: string; divClass: string; divId: string; iframeId: string; frameborder: string; width: string; initialHeight: number; src: string; title: string };
  multicolumn: { sectionId: string; className: string; columns: { className: string; title: string; html: SafeHtml }[] };
};

/** /pages/wishlist (source template page.swym), logged-out empty state. MOCK (docs/mock-behaviors.md "Wishlist page"). */
export type WishlistPageData = {
  documentTitle: string;
  pageClass: string;
  titleBarClass: string;
  title: string;
  user: { label: string; text: string };
  tabs: { className: string; label: string; selected: boolean; text: string }[];
  detailClass: string;
  detailTitle: string;
  shareLabel: string;
  menuLabel: string;
  empty: { title: string; text: string; button: string };
};

export interface PageRepository {
  contentSlugs(): Promise<string[]>;
  getContentPage(slug: string): Promise<ContentPageData | null>;
  getFaqPage(): Promise<FaqPageData>;
  getContactPage(): Promise<ContactPageData>;
  getWishlistPage(): Promise<WishlistPageData>;
}
