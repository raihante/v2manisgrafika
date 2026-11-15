// Storefront content types: the shared shell (announcement bar, header menus, mobile drawer, side panels), the
// site-wide chrome (footer, newsletter, payment marks, logo), layout hidden inputs and the homepage sections.
// Shapes follow the source theme markup (2026-11-06 snapshot) so the CMS can store the same fields.
import type { RailCard } from "@/lib/catalog/types";
import type { SafeSvg } from "@/lib/html/safe-html";

/** Inline SVG captured from the source theme: React props for the <svg> element plus its sanitized inner markup. */
export type SourceIcon = { props: Record<string, string>; inner: SafeSvg };
export type NavLink = { label: string; href: string; title: string | null };

export type MenuPromotion = {
  image: string; imageAlt: string; href: string; target: string | null;
  title: string; titleClass: string;
  button: { label: string; href: string; target: string | null; className: string };
  arrow: SourceIcon; className: string;
};

export type DesktopMenuItem = NavLink & {
  className: string; itemTitle: string | null; role: string | null; arrow: SourceIcon | null;
  mega: { columns: { heading: NavLink; links: NavLink[] | null }[]; promotion: MenuPromotion | null } | null;
};

export type MobileMenuEntry =
  | { kind: "title"; label: string; className: string }
  | { kind: "heading"; label: string; className: string; summaryClass: string }
  | ({ kind: "link"; className: string; role: string | null } & NavLink);

export type MobileMenuItem =
  | ({ kind: "link" } & NavLink)
  | { kind: "submenu"; label: string; dataTitle: string; summaryClass: string; entries: MobileMenuEntry[]; promotion: MenuPromotion | null };

export type SelectorList = {
  selected: { label: string; className: string; flag: string | null; chevron: SourceIcon };
  options: { code: string; href: string; country: string | null; className: string; style: Record<string, string> | null; check: boolean; label: string; flag: string | null }[];
};

export type ShellData = {
  snapshot: string;
  pageLoading: { image: string; alt: string; className: string };
  sectionIds: { announcement: string; header: string };
  announcement: { speed: string; direction: string; groups: number; items: ({ text: string; href: string; target: string | null } | null)[] };
  logo: { alt: string; width: number; height: number; images: { src: string; className: string }[] };
  hamburgerBack: { label: string; icon: SourceIcon };
  desktopMenu: DesktopMenuItem[];
  mobileMenu: MobileMenuItem[];
  accountLinks: (NavLink & { className: string | null; icon: SourceIcon | null; iconFirst: boolean })[];
  stores: SelectorList;
  languages: SelectorList;
  secondary: {
    search: { icon: SourceIcon; close: SourceIcon };
    wishlist: { href: string; className: string; icon: SourceIcon; white: string };
    account: { href: string; title: string; icon: SourceIcon; white: string };
    cart: { href: string; empty: string; white: string };
  };
  searchBar: { placeholder: string; submitIcon: SourceIcon; closeIcon: SourceIcon };
  sidePanels: {
    closeIcon: SourceIcon;
    cart: { title: string; titleClass: string | null; empty: string; desc: { text: string; icon: string; iconAlt: string }; suggestionTitle: string; pills: NavLink[]; continue: NavLink };
    product: { title: string };
    search: { placeholder: string; label: string };
  };
};

/** Layout-level hidden inputs the source renders at the top of #main-content on every template (free-shipping copy
 *  read by the theme cart scripts). */
export type LayoutData = { hiddenInputs: { id: string; value: string }[] };

export type PaymentMark = { name: string; image: string };
export type FooterLink = { text: string; href: string };
export type Newsletter = {
  title: string; tagline: string; placeholder: string; buttonText: string;
  descriptionDesktop: string[]; descriptionMobile: string[]; successMessage: string;
};

/** Product predictive search entry (header search bar). */
export type SearchSuggestion = { handle: string; title: string; image: string; price: number };

/** Everything SiteChrome renders around a page. */
export type ChromeData = {
  shell: ShellData;
  layout: LayoutData;
  footerLinks: FooterLink[];
  payments: PaymentMark[];
  newsletter: Newsletter;
  /** MOCK predictive search index (docs/mock-behaviors.md "Header search"). */
  searchSuggestions: SearchSuggestion[];
};

/** Checkout header and payment marks (the checkout is rendered without SiteChrome). */
export type CheckoutBranding = { logo: string; payments: PaymentMark[] };

export type HeroSlide = { label: string; image: string; mobileImage: string; sourceImage: string };
export type PromotionSlide = { image: string; mobileImage: string; mobileSrcSet: string; href: string; sourceImage: string };
export type ProductRailData = { title: string; shopMore: string; headerBackground: string; products: RailCard[] };
export type SocialSection = {
  titleLines: string[]; subtitle: string; instagramHandle: string; instagramUrl: string;
  feedImages: string[]; feedLoops: number; images: string[]; feedSnapshot: string;
};
export type HomepageData = { categoryHero: HeroSlide[]; promotions: PromotionSlide[]; rails: ProductRailData[]; social: SocialSection };

export interface StorefrontRepository {
  getChrome(): Promise<ChromeData>;
  getCheckoutBranding(): Promise<CheckoutBranding>;
  getHomepage(): Promise<HomepageData>;
}
