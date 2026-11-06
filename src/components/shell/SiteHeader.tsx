"use client";
/* eslint-disable @next/next/no-img-element */
// Shared header shell rebuilt on the source DOM (reference/dom/r256-header/header-1920.html, 2026-11-06 snapshot):
// announcement marquee, header section with the hidden-but-mounted desktop mega-menu, the hamburger drawer used at
// every width, secondary icons, the inline search bar and the predictive-search container. Styles come from
// src/app/shell-source.css (generated) + src/app/shell.css. State timing mirrors the source theme scripts
// (reference/js/d57b4de829f727fa.js class Header, reference/js/r256-header/functions.js).
// APPROXIMATE / NOT VISUALLY VERIFIED until the paired state screenshots are accepted (SESSION_HANDOFF.md).
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";
import { catalog, formatPrice } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { shellRepository, type MenuPromotion, type SelectorList } from "@/lib/navigation";
import { SourceSvg } from "@/components/shell/SourceSvg";

const shell = shellRepository.getShell();
const HAMBURGER_BG: CSSProperties = { background: "var(--hamburger-active-color)" };

function Promotion({ promo }: { promo: MenuPromotion }) {
  return (
    <div className={promo.className}>
      <div className="mega-menu-image-container"><a href={promo.href} target={promo.target ?? undefined}><picture><img src={promo.image} alt={promo.imageAlt} /></picture></a></div>
      <div className="jsc-mega-menu-promotion"><p className={promo.titleClass}>{promo.title}</p><span className="promotion-button-cover"><a href={promo.button.href} target={promo.button.target ?? undefined} className={promo.button.className}>{promo.button.label}</a><span><SourceSvg icon={promo.arrow} /></span></span></div>
    </div>
  );
}

function Logo() {
  return (
    <Link className="logolink" href="/">
      <picture>{shell.logo.images.map((img) => <img key={img.className} src={img.src} className={img.className} alt={shell.logo.alt} width={shell.logo.width} height={shell.logo.height} />)}</picture>
    </Link>
  );
}

// Store / language selector: opencloseStore() toggles the list with jQuery .toggle() (inline display).
// MOCK: choosing an option does not leave the clone (source navigates to the regional store or /id/ locale).
function Selector({ list, display, onToggle, onChoose }: { list: SelectorList; display: string | undefined; onToggle: () => void; onChoose: () => void }) {
  return (
    <div className="jsc-store-list-wrap">
      <div className={list.selected.className} onClick={onToggle}>
        {list.selected.flag && <img className="img_store_flag" src={list.selected.flag} alt="" />}
        <span className="everett-light-r">{list.selected.label}</span>
        <SourceSvg icon={list.selected.chevron} />
      </div>
      <ul className="shopLinkList" style={display ? { display } : undefined}>
        {list.options.map((o) => (
          <li key={o.code} onClick={onChoose} data-href={o.href} data-store={o.code} data-country={o.country ?? undefined} className={o.className} style={o.style ?? undefined}>
            {o.check && <i className="fa-solid fa-check" />}
            <div className="disclosure__button">{o.flag && <img src={o.flag} alt="" />} {o.label}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// MOCK predictive search over the local catalog fixture (source calls Shopify predictive search).
function PredictiveResults({ query, close }: { query: string; close: () => void }) {
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return catalog.listProducts().filter((p) => p.title.toLowerCase().includes(term)).slice(0, 8);
  }, [query]);
  if (!query.trim()) return null;
  return (
    <div className="predictive-search-local">
      <span className="thb-predictive-search--label">{results.length ? `Products (${results.length})` : `No results for “${query.trim()}”`}</span>
      <ul className="predictive-search-local__list">
        {results.map((p) => (
          <li key={p.handle}><Link href={`/products/${p.handle}`} onClick={close}><img src={p.image} alt="" /><span><span className="predictive-search-local__title">{p.title}</span><span className="predictive-search-local__price">{formatPrice(p.price)}</span></span></Link></li>
        ))}
      </ul>
    </div>
  );
}

export function AnnouncementBar() {
  const a = shell.announcement;
  return (
    <div id={shell.sectionIds.announcement} className="shopify-section shopify-section-group-header-group announcement-bar-section">
      <div className="announcement-bar">
        <div className={`announcement-bar--inner direction-${a.direction} announcement-bar--marquee`} style={{ "--marquee-speed": a.speed } as CSSProperties}>
          {Array.from({ length: a.groups }, (_, g) => (
            <div key={g}>{a.items.map((item, i) => <div className="announcement-bar--item" key={i}>{item && <a href={item.href} target={item.target ?? undefined}>{item.text}</a>}</div>)}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SiteHeader({ onOpenCart }: { onOpenCart: () => void }) {
  const router = useRouter();
  const { count } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false); // details[open]
  const [toggleActive, setToggleActive] = useState(false); // .mobile-toggle-wrapper.active
  const [hamburgerStyled, setHamburgerStyled] = useState(false); // inline hamburger background + jsc-show-secondary-icons
  const [menuColor, setMenuColor] = useState(false);
  const [secondLevel, setSecondLevel] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null); // details[open] of a submenu
  const [openingSub, setOpeningSub] = useState<string | null>(null); // .menu-opening
  const [stickySub, setStickySub] = useState<Set<string>>(() => new Set()); // .submenu-open (source never removes it on Back)
  const [listDisplay, setListDisplay] = useState<(string | undefined)[]>([undefined, undefined]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sticky, setSticky] = useState(false);
  const timers = useRef<number[]>([]);
  const later = useCallback((fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); }, []);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Source Header(): --header-offset / --header-height on scroll, is-sticky once the header reaches the top.
  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current, header = headerRef.current;
      if (!section || !header) return;
      const root = document.documentElement;
      root.style.setProperty("--header-offset", `${section.getBoundingClientRect().top}px`);
      root.style.setProperty("--header-height", `${header.clientHeight}px`);
      const offset = parseInt(String(header.getBoundingClientRect().top), 10) + root.scrollTop;
      setSticky(window.scrollY >= offset && window.scrollY > 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Source body.overflow-hidden while the drawer is open; search adds body.search-mobile-overlay-active.
  useEffect(() => { document.body.classList.toggle("overflow-hidden", toggleActive); }, [toggleActive]);
  useEffect(() => { document.body.classList.toggle("search-mobile-overlay-active", searchOpen); }, [searchOpen]);
  useEffect(() => () => { document.body.classList.remove("overflow-hidden", "search-mobile-overlay-active"); }, []);

  // closeAnimation(): remove [open] (and nested submenu state) after 400ms.
  const closeDrawer = useCallback(() => {
    setMenuColor(false);
    setToggleActive(false);
    later(() => { setHamburgerStyled(false); setSecondLevel(false); }, 250);
    later(() => { setDrawerOpen(false); setOpenSub(null); setOpeningSub(null); setStickySub(new Set()); setListDisplay([undefined, undefined]); }, 400);
  }, [later]);

  const onToggle = (event: ReactMouseEvent) => {
    event.preventDefault();
    const root = document.documentElement;
    if (sectionRef.current) root.style.setProperty("--announcement-height", `${sectionRef.current.clientHeight}px`);
    if (toggleActive) { closeDrawer(); return; }
    setMenuColor(false);
    setDrawerOpen(true);
    setListDisplay(["none", "none"]);
    later(() => setToggleActive(true), 0);
    later(() => { setHamburgerStyled(true); setSecondLevel(false); }, 250);
  };

  useEffect(() => {
    if (!toggleActive) return;
    const onKey = (e: KeyboardEvent) => { if (e.code && e.code.toUpperCase() === "ESCAPE") closeDrawer(); };
    document.addEventListener("keyup", onKey);
    return () => document.removeEventListener("keyup", onKey);
  }, [toggleActive, closeDrawer]);

  // onSummaryClick + headerbgchange(): open the submenu, menu-color after 500ms, menu-opening/submenu-open after 100ms,
  // jsc-second-level-active after 280ms.
  const openSubmenu = (event: ReactMouseEvent, title: string) => {
    event.preventDefault();
    setOpenSub(title);
    later(() => setMenuColor(true), 500);
    later(() => { setOpeningSub(title); setStickySub((s) => new Set(s).add(title)); }, 100);
    later(() => setSecondLevel(true), 280);
  };
  // onCloseButtonClick -> closeSubmenu(): drop menu-opening, closeMenuColor(), [open] removed after 400ms;
  // headerbgclose() clears jsc-second-level-active after 300ms.
  const closeSubmenu = (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setOpeningSub(null);
    setMenuColor(false);
    later(() => setOpenSub(null), 400);
    later(() => setSecondLevel(false), 300);
  };

  // openclosesearchmobile(): toggle the inline search bar and hide .main-header-content.
  const toggleSearch = () => {
    setSearchOpen((open) => {
      if (open) setQuery("");
      return !open;
    });
  };
  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    setSearchOpen(false);
    setQuery("");
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  const headerClass = ["header style1 header--shadow-none transparent--false header-sticky--active", sticky && "is-sticky", hamburgerStyled && "jsc-show-secondary-icons", secondLevel && "jsc-second-level-active"].filter(Boolean).join(" ");
  const bg = hamburgerStyled ? HAMBURGER_BG : undefined;
  const firstLevel: CSSProperties | undefined = hamburgerStyled ? { color: "var(--first-level-text-color)" } : undefined;
  const toggleList = (i: number) => setListDisplay((d) => d.map((v, j) => (j === i ? (v === "block" ? "none" : "block") : v)));

  return (
    <div id={shell.sectionIds.header} className="shopify-section shopify-section-group-header-group header-section" ref={sectionRef}>
      <header id="header" className={headerClass} style={bg} ref={headerRef}>
        <div className="row expanded">
          <div className="small-12 columns main-header-content" style={searchOpen ? { display: "none" } : undefined}>
            <div className="thb-header-mobile-left">
              <details className={`mobile-toggle-wrapper${toggleActive ? " active" : ""}`} open={drawerOpen}>
                <summary className="mobile-toggle" onClick={onToggle}>{[0, 1, 2].map((i) => <span key={i} style={hamburgerStyled ? { background: "var(--first-level-text-color)" } : undefined} />)}</summary>
                <nav id="mobile-menu" className={`mobile-menu-drawer${menuColor ? " menu-color" : ""}`} role="dialog" tabIndex={-1} style={bg}>
                  <div className="mobile-menu-drawer--inner">
                    <ul className="mobile-menu">
                      {shell.mobileMenu.map((item) => (
                        <li key={item.label}>
                          {item.kind === "link" ? (
                            <Link href={item.href} title={item.title ?? undefined} onClick={closeDrawer}> {item.label} </Link>
                          ) : (
                            <details data-bg-menu="true" className={["jsc-link-container link-container", openingSub === item.dataTitle && "menu-opening", stickySub.has(item.dataTitle) && "submenu-open"].filter(Boolean).join(" ")} data-title={item.dataTitle} open={openSub === item.dataTitle}>
                              <summary className={`${item.summaryClass} `} onClick={(e) => openSubmenu(e, item.dataTitle)}> {item.label} </summary>
                              <ul className="sub-menu">
                                <li className="parent-link-back"><button type="button" onClick={closeSubmenu}><span><SourceSvg icon={shell.hamburgerBack.icon} /></span>{shell.hamburgerBack.label}</button></li>
                                {item.entries.map((entry, i) => {
                                  if (entry.kind === "title") return <li key={i} className={entry.className}><span className="jsc-main_menu-title">{entry.label}</span></li>;
                                  if (entry.kind === "heading") return <li key={i} className={entry.className}><summary className={entry.summaryClass}><span className="sub_menu-title">{entry.label}</span></summary></li>;
                                  return <li key={i} className={entry.className || undefined}><Link href={entry.href} title={entry.title ?? undefined} role={entry.role ?? undefined} onClick={closeDrawer}> {entry.label} </Link></li>;
                                })}
                                {item.promotion && <li><Promotion promo={item.promotion} /></li>}
                              </ul>
                            </details>
                          )}
                        </li>
                      ))}
                    </ul>
                    <div className="thb-mobile-menu-footer jsc-account-menu" style={bg}>
                      <div className="jsc-left-menu">
                        {shell.accountLinks.map((l) => {
                          // MOCK: the source #swym-wishlist anchor opens the Swym wishlist app; the clone routes to /pages/wishlist.
                          const href = l.href === "#swym-wishlist" ? "/pages/wishlist" : l.href;
                          return <Link key={l.label} href={href} title={l.title ?? undefined} className={l.className ?? undefined} style={firstLevel} onClick={closeDrawer}>{l.icon && l.iconFirst ? <><SourceSvg icon={l.icon} /> {l.label}</> : <>{l.label}{l.icon && <> <SourceSvg icon={l.icon} /></>}</>}</Link>;
                        })}
                      </div>
                      <div className="jsc-right-menu">
                        <Selector list={shell.stores} display={listDisplay[0]} onToggle={() => toggleList(0)} onChoose={() => toggleList(0)} />
                        <div className="jsc-store-currency-switcher" />
                        <Selector list={shell.languages} display={listDisplay[1]} onToggle={() => toggleList(1)} onChoose={() => toggleList(1)} />
                      </div>
                    </div>
                  </div>
                </nav>
                <div className="menu-overlay" onClick={(e) => { e.preventDefault(); e.stopPropagation(); closeDrawer(); }} />
              </details>
            </div>
            <Logo />
            <full-menu className="full-menu">
              <ul className="thb-full-menu" role="menubar">
                {shell.desktopMenu.map((item) => (
                  <li key={item.label} role={item.role ?? undefined} className={item.className} data-item-title={item.itemTitle ?? undefined}>
                    <Link href={item.href} title={item.title ?? undefined}>{item.label}{item.arrow && <> <SourceSvg icon={item.arrow} /></>}</Link>
                    {item.mega && (
                      <div className="sub-menu mega-menu-container" tabIndex={-1}>
                        <ul className="mega-menu-columns" tabIndex={-1}>
                          {item.mega.columns.map((col) => (
                            <li key={col.heading.label} className="" role="none">
                              <Link href={col.heading.href} title={col.heading.title ?? undefined} className="mega-menu-columns__heading" role="menuitem">{col.heading.label}</Link>
                              {col.links && <ul role="menu">{col.links.map((l) => <li key={l.href} className="" role="none"><Link href={l.href} title={l.title ?? undefined} role="menuitem">{l.label}</Link></li>)}</ul>}
                            </li>
                          ))}
                        </ul>
                        {item.mega.promotion && <Promotion promo={item.mega.promotion} />}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </full-menu>
            <div className="thb-secondary-area thb-header-right">
              <div className="no-js-hidden" />
              <div className="header-search-wrap" onClick={toggleSearch}>
                <SourceSvg icon={shell.secondary.search.icon} />
                <SourceSvg icon={shell.secondary.search.close} />
              </div>
              {/* MOCK: source opens the Swym wishlist app; the clone routes to the /pages/wishlist empty-state mock. */}
              <a href={shell.secondary.wishlist.href} className={`${shell.secondary.wishlist.className} `} data-swym-loaded="true" onClick={(e) => { e.preventDefault(); router.push("/pages/wishlist"); }}>
                <SourceSvg icon={shell.secondary.wishlist.icon} />
                <img className="jsc-secondary-wishlist-icon d-none" src={shell.secondary.wishlist.white} width="23px" height="22px" alt="" />
              </a>
              <Link className="thb-secondary-area-item myaccount-icon thb-secondary-myaccount" href={shell.secondary.account.href} title={shell.secondary.account.title}>
                <SourceSvg icon={shell.secondary.account.icon} />
                <img className="jsc-secondary-account-icon d-none" src={shell.secondary.account.white} width="23px" height="22px" alt="" />
              </Link>
              <a className="thb-secondary-area-item thb-secondary-cart" href={shell.secondary.cart.href} id="cart-drawer-toggle" onClick={(e) => { e.preventDefault(); onOpenCart(); }}>
                <div className="thb-secondary-item-icon">
                  <img className="default-empty-icon" src={shell.secondary.cart.empty} width="23px" height="22px" alt="" />
                  <img className="jsc-secondary-empty-icon d-none" src={shell.secondary.cart.white} width="23px" height="22px" alt="" />
                  <span className="thb-item-count">{count > 0 ? count : null}</span>
                </div>
              </a>
            </div>
          </div>
          <div className={`header-search-wrap header-search-mobile${searchOpen ? " active" : ""}`}>
            <div className="header-search-logo"><Logo /></div>
            <form role="search" method="get" className="searchform header-search-form" action="/search" onSubmit={submitSearch}>
              <fieldset>
                <input id="side-panel-search-input" type="search" className="search-field search-field-mob " placeholder={shell.searchBar.placeholder} value={query} onChange={(e) => setQuery(e.target.value)} name="q" autoComplete="off" />
                <button type="submit" className="thb-search-submit"><SourceSvg icon={shell.searchBar.submitIcon} /></button>
              </fieldset>
            </form>
            <div className="header-search-close"><div className="header-search-close-icon" style={{ cursor: "pointer" }} onClick={toggleSearch}><SourceSvg icon={shell.searchBar.closeIcon} /></div></div>
          </div>
          <div className="predictive-search-custom">
            <div className={`side-panel-content side-panel-content--has-tabs${searchOpen && query.trim() ? " active" : ""}`}>{searchOpen && <PredictiveResults query={query} close={toggleSearch} />}</div>
            <div className="side-panel-content side-panel-content--initial">
              <div className="thb-predictive-search"><div className="thb-predictive-search--promotion"><span className="thb-predictive-search--label" /><div className="thb-predictive-search--promotion-products"><ul className="products collection row small-up-1 medium-up-2" /></div></div></div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
