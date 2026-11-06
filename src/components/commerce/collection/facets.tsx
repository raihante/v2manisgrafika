"use client";
// Facet UI shared by the collection grid and the search results grid (source snippets facets / facet drawer, theme t/33):
// facet bar (breadcrumb count, Filter toggle, fake Sort list), facet drawer (FacetFiltersFormMobile), the drawer open
// state, and updateGridHeightcollection. Behaviour follows reference/js/r257-collection/facets.js and
// reference/js/r256-header/jsc-reset-scripts.js (opencloseSort, changeSort, handleSortResize).
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Spinner } from "@/components/commerce/pdp/icons";
import { CLICK_CAPTURE_EVENT } from "@/components/shell/ShellPanels";
import type { CollectionCrumb, Facet, SortOption } from "@/lib/collections/types";
import { CloseIcon, FacetArrow, SelectArrow } from "./icons";

export const SORT_LABEL = "Translation missing: en.products.facets.sort_bg";

export type HiddenInput = { name: string; value: string };
const Hidden = ({ inputs }: { inputs: HiddenInput[] }) => <>{inputs.map((i) => <input key={i.name} type="hidden" name={i.name} value={i.value} />)}</>;

/**
 * Inner markup of div#ProductCount: breadcrumb + loading overlay. The last crumb is an <h1> link on collections and a
 * plain <span> on search results.
 */
export function ProductCount({ crumbs, current = "h1" }: { crumbs: CollectionCrumb[]; current?: "h1" | "span" }) {
  const last = crumbs.at(-1);
  return (
    <>
      <span className="facet-col-title">
        {crumbs.slice(0, -1).map((c) => <Fragment key={c.title}><a href={c.href} title={c.title}>{c.label}</a> <i>/</i> </Fragment>)}
        {current === "h1" ? <h1> <a href={last?.href} title={last?.title}>{last?.label}</a> </h1> : <span>{last?.label}</span>}
      </span>
      <span className="loading-overlay"><Spinner /></span>
    </>
  );
}

/** Facet drawer open state: body.open-cc + #Facet-Drawer.active; closed by the shared .click-capture and by Esc. */
export function useFacetDrawer(): [boolean, (open: boolean | ((o: boolean) => boolean)) => void] {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.classList.toggle("open-cc", open);
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener(CLICK_CAPTURE_EVENT, close);
    document.addEventListener("keydown", onKey);
    return () => { window.removeEventListener(CLICK_CAPTURE_EVENT, close); document.removeEventListener("keydown", onKey); };
  }, [open]);
  useEffect(() => () => document.body.classList.remove("open-cc"), []);
  return [open, setOpen];
}

/** updateGridHeightcollection: every card title (and pre-order line) gets the tallest card's height; re-run on width change. */
export function useEqualCardHeights(ref: React.RefObject<HTMLElement | null>, dep: unknown) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const run = () => {
      const titles = [...root.querySelectorAll<HTMLElement>(".product-card .product-card-title")];
      const ships = [...root.querySelectorAll<HTMLElement>(".product-card .jsc-preorder-grid-ship")];
      titles.concat(ships).forEach((el) => { el.style.height = "auto"; });
      const max = Math.max(0, ...titles.map((t) => t.getBoundingClientRect().height));
      const shipMax = Math.max(0, ...ships.map((s) => s.offsetHeight));
      titles.forEach((t) => { t.style.height = `${max}px`; });
      ships.forEach((s) => { s.style.height = `${shipMax}px`; });
    };
    run();
    let prev = window.innerWidth;
    const onResize = () => { if (window.innerWidth !== prev) { prev = window.innerWidth; run(); } };
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(run).catch(() => {});
    return () => window.removeEventListener("resize", onResize);
  }, [ref, dep]);
}

/** Bar sort choice: changeSort sets the select and submits the bar form natively, i.e. a full document navigation. */
export function navigateWithSort(search: string) {
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- the source submits the form natively
  window.setTimeout(() => window.location.assign(`${window.location.pathname}?${search}`), 10);
}

type BarProps = {
  crumbs: CollectionCrumb[];
  current?: "h1" | "span";
  hiddenInputs?: HiddenInput[];
  sort: string;
  options: SortOption[];
  list: SortOption[];
  clearHref: string;
  onToggleDrawer: () => void;
  onSort: (value: string) => void;
};

export function FacetBar({ crumbs, current = "h1", hiddenInputs = [], sort, options, list, clearHref, onToggleDrawer, onSort }: BarProps) {
  const [sortList, setSortList] = useState<{ open: boolean; mobile: boolean } | null>(null);
  // handleSortResize: a width change hides the open sort list.
  useEffect(() => {
    let prev = window.innerWidth;
    const onResize = () => { if (window.innerWidth !== prev) { prev = window.innerWidth; setSortList((s) => (s ? { open: false, mobile: false } : s)); } };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  // opencloseSort: <=768 toggles .sort-button-open / .sortList as well as the list display.
  const opencloseSort = () => {
    const mobile = window.innerWidth <= 768;
    setSortList((s) => ({ open: !(s?.open ?? false), mobile: mobile ? !(s?.mobile ?? false) : (s?.mobile ?? false) }));
  };
  return (
    <facet-filters-form className="facets--bar">
      <form id="FacetFiltersForm-bar" className="facets__form" onSubmit={(e) => e.preventDefault()}>
        <div className="facets-wrap">
          <div className="thb-filter-count" id="ProductCount"><ProductCount crumbs={crumbs} current={current} /></div>
          <div className="facets-wrap-button">
            <Hidden inputs={hiddenInputs} />
            <div className="filter-btn-wrap">
              <a href="#SideFilters" className="facets-toggle" id="Facets-Toggle" onClick={(e) => { e.preventDefault(); onToggleDrawer(); }}>Filter <FacetArrow /> </a>
            </div>
            <div className="thb-filter-sort-count">
              <div className="thb-filter-sort">
                <div className="select">
                  <label htmlFor="SortByBar" className="visually-hidden">{SORT_LABEL}</label>
                  <select name="sort_by" className="facet-filters__sort select__select resize-select hideimportant" id="SortByBar" aria-describedby="a11y-refresh-page-message" value={sort} onChange={(e) => onSort(e.target.value)}>
                    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <div className={`fake-sort-button${sortList?.mobile ? " sort-button-open" : ""}`} onClick={opencloseSort}> Sort <FacetArrow /> </div>
                  <ul className={`currencyList${sortList?.mobile ? " sortList" : ""}`} style={sortList ? { display: sortList.open ? "block" : "none" } : undefined}>
                    {list.map((o) => (
                      <li key={o.value} className={`currency-li${o.value === sort ? " sort-selected" : ""}`} data-value={o.value} onClick={() => onSort(o.value)}> <span>{o.label}</span> </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
      <facet-remove className="active-facets">
        <a href={clearHref} className="active-facets__button-remove text-button">Clear all</a>
      </facet-remove>
    </facet-filters-form>
  );
}

type DrawerProps = {
  facets: Facet[];
  hiddenInputs?: HiddenInput[];
  sortOptions: SortOption[];
  sort: string;
  countText: string;
  /** After a facet render the theme copies #ProductCount into the drawer count (renderProductCount). */
  countAsCrumbs: { crumbs: CollectionCrumb[]; current: "h1" | "span" } | null;
  active: boolean;
  clearHref: string;
  isChecked: (name: string, value: string) => boolean;
  onToggle: (name: string, value: string, checked: boolean) => void;
  onSort: (sort: string) => void;
  onClose: () => void;
  /**
   * The drawer is mounted on the client (search results). React warns when it creates the hyphen-less source tag
   * <facetfiltersformmobile> itself, so the element is created with document.createElement and the drawer is rendered
   * into it through a portal. Server-rendered drawers (collection) hydrate the tag without a warning.
   */
  clientMounted?: boolean;
};

export function FacetDrawer({ facets, hiddenInputs = [], sortOptions, sort, countText, countAsCrumbs, active, clearHref, isChecked, onToggle, onSort, onClose, clientMounted = false }: DrawerProps) {
  const swatchStyle = (bg: string | null, image: string | null) => ({ "--bg-color": bg ?? undefined, "--option-color-image": image ? `url('${image}')` : undefined } as React.CSSProperties);
  return (
    <DrawerHost clientMounted={clientMounted}>
      <div className={`side-panel facet-drawer${active ? " active" : ""}`} id="Facet-Drawer">
        <div className="side-panel-inner">
          <div className="side-panel-header">
            <div>
              <h1 className="body-font"> Filter <span className="thb-filter-count mobile-filter-count body-font">{countAsCrumbs ? <ProductCount crumbs={countAsCrumbs.crumbs} current={countAsCrumbs.current} /> : <><span className="facets__label">{countText} </span><span className="loading-overlay"><Spinner /></span></>}</span></h1>
              <side-panel-close className="side-panel-close" onClick={onClose}><CloseIcon /></side-panel-close>
            </div>
          </div>
          <div className="side-panel-content">
            <facet-filters-form className="facets">
              <form id="FacetFiltersFormMobile" className="facets__mobile_form" onSubmit={(e) => e.preventDefault()}>
                <Hidden inputs={hiddenInputs} />
                {facets.map((facet) => (
                  <collapsible-row key={facet.index} data-index={facet.index}>
                    <details className="thb-filter js-filter" data-index={facet.index} open={facet.open}>
                      <summary className="thb-filter-title">{facet.title}<span></span></summary>
                      <div className="thb-filter-content collapsible__content">
                        {facet.kind === "availability" ? (
                          <div className="thb-filter-availability">
                            {facet.values.map((v) => [
                              <input key={`i-${v.id}`} type="checkbox" name={facet.name} value={v.value} className={v.inputClass} id={v.id} checked={isChecked(facet.name, v.value)} onChange={(e) => onToggle(facet.name, v.value, e.target.checked)} />,
                              <label key={`l-${v.id}`} className="jsc-filter-availability-label" htmlFor={v.id}>{v.label}</label>,
                            ])}
                          </div>
                        ) : (
                          <div className={facet.listClass ?? undefined}>
                            {facet.values.map((v) => [
                              <input key={`i-${v.id}`} type="checkbox" name={facet.name} value={v.value} id={v.id} checked={isChecked(facet.name, v.value)} onChange={(e) => onToggle(facet.name, v.value, e.target.checked)} />,
                              <label key={`l-${v.id}`} htmlFor={v.id} className={v.labelClass} style={swatchStyle(v.bg, v.image)} data-tooltip={v.tooltip ?? undefined} data-filter-value={v.value}>
                                {` ${v.label} `}<span className="count">{v.count}</span> <div className="jsc-filter-swatch-color" style={swatchStyle(v.bg, v.image)}></div>
                              </label>,
                            ])}
                          </div>
                        )}
                      </div>
                    </details>
                  </collapsible-row>
                ))}
                <div className="thb-filter-sort-count thb-filter">
                  <div className="thb-filter-sort">
                    <div className="thb-filter-title">Sort by</div>
                    <div className="select">
                      <label htmlFor="SortByMobile" className="visually-hidden">{SORT_LABEL}</label>
                      <select name="sort_by" className="facet-filters__sort select__select caption-large" id="SortByMobile" aria-describedby="a11y-refresh-page-message" value={sort} onChange={(e) => onSort(e.target.value)}>
                        {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <div className="select-arrow"><SelectArrow /></div>
                    </div>
                  </div>
                </div>
              </form>
            </facet-filters-form>
          </div>
          <div className="side-panel-footer">
            <div><a className="mobile-filters-clear text-button" href={clearHref}>Clear</a></div>
            {/* Source: onclick="document.querySelector('.click-capture').click()". */}
            <button type="button" className="button mobile-filters-apply" onClick={() => (document.querySelector(".click-capture") as HTMLElement | null)?.click()}><span>Apply</span></button>
          </div>
        </div>
      </div>
    </DrawerHost>
  );
}

/** <facetfiltersformmobile> host: rendered by React on the server, created imperatively (portal) on the client. */
function DrawerHost({ clientMounted, children }: { clientMounted: boolean; children: React.ReactNode }) {
  const anchor = useRef<HTMLTemplateElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (!clientMounted || !anchor.current?.parentNode) return;
    const el = document.createElement("facetfiltersformmobile");
    anchor.current.after(el);
    setHost(el);
    return () => el.remove();
  }, [clientMounted]);
  if (!clientMounted) return <facetfiltersformmobile>{children}</facetfiltersformmobile>;
  // An inert <template> marks the position; the host element is inserted right after it.
  return <><template ref={anchor} />{host && createPortal(children, host)}</>;
}

/** Debounced drawer submit (facets.js: 500 ms), then pushState and a smooth scroll to the grid. */
export function useDrawerSubmit() {
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (run: () => Promise<string>) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      run().then((search) => {
        history.pushState({ searchParams: search }, "", `${window.location.pathname}${search ? `?${search}` : ""}`);
        const container = document.getElementById("ProductGridContainer");
        if (container) {
          const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-height"), 10) || 0;
          window.scrollTo({ top: container.getBoundingClientRect().top + document.documentElement.scrollTop - headerHeight - 30, left: 0, behavior: "smooth" });
        }
      });
    }, 500);
  };
}

/** Facet values in form DOM order (facet rows, then values), as FormData serializes them. */
export function sortFilters(facets: Facet[], filters: HiddenInput[]): HiddenInput[] {
  const order = (f: HiddenInput) => {
    const facet = facets.findIndex((x) => x.name === f.name);
    return facet * 1000 + Math.max(0, facets[facet]?.values.findIndex((v) => v.value === f.value) ?? 0);
  };
  return [...filters].sort((a, b) => order(a) - order(b));
}
