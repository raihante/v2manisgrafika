// Shared shell repository: announcement bar, header menus, mobile drawer footer, secondary icons and side-panel copy.
// Backed by the source-derived fixture src/data/header.json (scripts/build-header-data.mjs, 2026-11-06 snapshot).
// A CMS adapter replaces `fixtureShell` without changing the shell components (AGENTS.md repository boundary).
import fixture from "@/data/header.json";

/** Inline SVG captured verbatim: React props for the <svg> element plus its inner markup. */
export type SourceIcon = { props: Record<string, string>; inner: string };
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

export interface ShellRepository {
  getShell(): ShellData;
}

const fixtureShell: ShellRepository = { getShell: () => fixture as unknown as ShellData };

export const shellRepository: ShellRepository = fixtureShell;
