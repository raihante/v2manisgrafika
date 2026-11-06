"use client";
/* eslint-disable @next/next/no-img-element -- source markup uses plain <img> inside <picture> */
// Collection page in the source template markup (sections/main-collection product-grid, theme t/33, 2026-11-06):
// facet bar (breadcrumb title, Filter toggle, fake Sort list), ul#product-grid with source product cards and the
// promotion column, load-more pagination, and the facet drawer (FacetFiltersFormMobile) with colour / size /
// availability filters and the drawer sort <select>.
// Behaviour follows the theme scripts in reference/js/r257-collection/ and reference/js/r256-header/jsc-reset-scripts.js:
// - Filter toggles body.open-cc + #Facet-Drawer.active; .click-capture (and Apply) closes it.
// - Drawer inputs submit after a 500 ms debounce, push ?filter.*&sort_by= and smooth-scroll to the grid.
// - The bar Sort list (opencloseSort / changeSort) submits the bar form: a full navigation to ?sort_by=<value>.
// - Load more appends the next page and completes the last row (src/lib/collections/query.ts).
// - updateGridHeightcollection: every card title (and pre-order line) gets the tallest card's height.
// MOCK data source and filter semantics: docs/mock-behaviors.md "Collection filters and sort".
import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SourceProductCard from "@/components/commerce/pdp/SourceProductCard";
import { Spinner } from "@/components/commerce/pdp/icons";
import { CLICK_CAPTURE_EVENT } from "@/components/shell/ShellPanels";
import { loadCollection } from "@/lib/collections/client";
import { DEFAULT_SORT, gridColumns, parseQuery, promoPlan, queryToSearch, resolveView, visibleKeys } from "@/lib/collections/query";
import type { CollectionCrumb, CollectionData, CollectionInitial, CollectionPromo, CollectionQuery, Facet, ProductCard } from "@/lib/collections/types";
import { CloseIcon, FacetArrow, SelectArrow } from "./icons";

type Grid = { keys: string[]; hasMore: boolean; countText: string; cards: Record<string, ProductCard> };
const SORT_LABEL = "Translation missing: en.products.facets.sort_bg";

export default function CollectionPage({ initial }: { initial: CollectionInitial }) {
  const router = useRouter();
  const [data, setData] = useState<CollectionData | null>(null);
  const [query, setQuery] = useState<CollectionQuery>({ sort: initial.sort.initial, filters: [] });
  const [loadedPages, setLoadedPages] = useState(1);
  const [grid, setGrid] = useState<Grid>({ keys: initial.keys, hasMore: initial.hasMore, countText: initial.countText, cards: initial.cards });
  const [drawerOpen, setDrawerOpen] = useState(false);
  // True after the first facet-form render: facets.js renderProductCount then copies #ProductCount (the breadcrumb)
  // into every .thb-filter-count, including the drawer header count (hidden by CSS).
  const [facetRendered, setFacetRendered] = useState(false);
  const [sortList, setSortList] = useState<{ open: boolean; mobile: boolean } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const columns = gridColumns(initial.gridClass);
  const ensureData = useCallback(() => loadCollection(initial.handle).then((d) => { setData(d); return d; }), [initial.handle]);

  const show = useCallback((d: CollectionData, q: CollectionQuery, pages: number) => {
    const view = resolveView(d, q);
    const { keys, hasMore } = visibleKeys(view, pages, d.pagination.perPage, columns, d.promos);
    setGrid({ keys, hasMore, countText: view.countText, cards: d.cards });
  }, [columns]);

  // Source renders ?sort_by= / ?filter.* on the server; the static clone applies them once the dataset is loaded.
  useEffect(() => {
    const q = parseQuery(window.location.search);
    if (q.sort === DEFAULT_SORT && !q.filters.length) return;
    ensureData().then((d) => { setQuery(q); show(d, q, 1); });
  }, [ensureData, show]);

  // Back/forward between pushed filter states (FacetFiltersForm onHistoryChange).
  useEffect(() => {
    const onPop = () => ensureData().then((d) => { const q = parseQuery(window.location.search); setQuery(q); setLoadedPages(1); show(d, q, 1); });
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [ensureData, show]);

  // Facet drawer open state: body.open-cc + #Facet-Drawer.active; closed by the shared .click-capture.
  useEffect(() => {
    document.body.classList.toggle("open-cc", drawerOpen);
    if (!drawerOpen) return;
    const close = () => setDrawerOpen(false);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener(CLICK_CAPTURE_EVENT, close);
    document.addEventListener("keydown", onKey);
    return () => { window.removeEventListener(CLICK_CAPTURE_EVENT, close); document.removeEventListener("keydown", onKey); };
  }, [drawerOpen]);
  useEffect(() => () => document.body.classList.remove("open-cc"), []);

  // handleSortResize: a width change hides the open sort list.
  useEffect(() => {
    let prev = window.innerWidth;
    const onResize = () => { if (window.innerWidth !== prev) { prev = window.innerWidth; setSortList((s) => (s ? { open: false, mobile: false } : s)); } };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Drawer form: debounced submit (500 ms), pushState, smooth scroll to the grid (renderProductGridContainer).
  const submitTimer = useRef<number | undefined>(undefined);
  const submitDrawer = (next: CollectionQuery) => {
    setQuery(next);
    window.clearTimeout(submitTimer.current);
    submitTimer.current = window.setTimeout(() => {
      ensureData().then((d) => {
        const search = queryToSearch(next, true);
        history.pushState({ searchParams: search }, "", `${window.location.pathname}${search ? `?${search}` : ""}`);
        setLoadedPages(1);
        show(d, next, 1);
        setFacetRendered(true);
        const container = document.getElementById("ProductGridContainer");
        if (container) {
          const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-height"), 10) || 0;
          window.scrollTo({ top: container.getBoundingClientRect().top + document.documentElement.scrollTop - headerHeight - 30, left: 0, behavior: "smooth" });
        }
      });
    }, 500);
  };
  useEffect(() => () => window.clearTimeout(submitTimer.current), []);
  const toggleFilter = (name: string, value: string, checked: boolean) => {
    const filters = checked ? [...query.filters, { name, value }] : query.filters.filter((f) => !(f.name === name && f.value === value));
    // Keep the form's DOM order (facet rows, then values) like FormData does.
    const order = (f: { name: string; value: string }) => {
      const facet = initial.facets.findIndex((x) => x.name === f.name);
      return facet * 1000 + Math.max(0, initial.facets[facet]?.values.findIndex((v) => v.value === f.value) ?? 0);
    };
    submitDrawer({ ...query, filters: filters.sort((a, b) => order(a) - order(b)) });
  };

  // Bar sort list: changeSort -> select value -> native form submit (navigation to ?sort_by=, filters dropped).
  const changeSort = (value: string) => {
    // A full document navigation on purpose: the source submits the bar form natively (no client transition).
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.setTimeout(() => window.location.assign(`${window.location.pathname}?sort_by=${encodeURIComponent(value)}`), 10);
  };
  const opencloseSort = () => {
    const mobile = window.innerWidth <= 768;
    setSortList((s) => ({ open: !(s?.open ?? false), mobile: mobile ? !(s?.mobile ?? false) : (s?.mobile ?? false) }));
  };

  const loadMore = () => {
    ensureData().then((d) => { const pages = loadedPages + 1; setLoadedPages(pages); show(d, query, pages); });
  };

  // updateGridHeightcollection (jsc-reset-scripts.js): equalize title and pre-order heights across the grid.
  useLayoutEffect(() => {
    const root = gridRef.current;
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
  }, [grid]);

  const plan = useMemo(() => promoPlan(grid.keys.length, initial.promos), [grid.keys.length, initial.promos]);
  const quickView = (card: ProductCard) => router.push(card.imageHref);
  const checked = (name: string, value: string) => query.filters.some((f) => f.name === name && f.value === value);

  return (
    <div id={`shopify-section-${initial.sectionId}`} className="shopify-section">
        <div className="collection-section-grid row full-width-row">
          <div className="small-12 columns">
            <div className="collection-container collection-container-wrap section-spacing-bottom" ref={gridRef}>
              <div id="ProductGridContainer">
                <div className={`sidebar-container facets--drawer results--${initial.pagination.perPage}`}>
                  <div>
                    <facet-filters-form className="facets--bar">
                      <form id="FacetFiltersForm-bar" className="facets__form" onSubmit={(e) => e.preventDefault()}>
                        <div className="facets-wrap">
                          <div className="thb-filter-count" id="ProductCount">
                            <ProductCount crumbs={initial.breadcrumb} />
                          </div>
                          <div className="facets-wrap-button">
                            <div className="filter-btn-wrap">
                              <a href="#SideFilters" className="facets-toggle" id="Facets-Toggle" onClick={(e) => { e.preventDefault(); setDrawerOpen((o) => !o); }}>Filter <FacetArrow /> </a>
                            </div>
                            <div className="thb-filter-sort-count">
                              <div className="thb-filter-sort">
                                <div className="select">
                                  <label htmlFor="SortByBar" className="visually-hidden">{SORT_LABEL}</label>
                                  <select name="sort_by" className="facet-filters__sort select__select resize-select hideimportant" id="SortByBar" aria-describedby="a11y-refresh-page-message" value={query.sort} onChange={(e) => changeSort(e.target.value)}>
                                    {initial.sort.bar.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                  </select>
                                  <div className={`fake-sort-button${sortList?.mobile ? " sort-button-open" : ""}`} onClick={opencloseSort}> Sort <FacetArrow /> </div>
                                  <ul className={`currencyList${sortList?.mobile ? " sortList" : ""}`} style={sortList ? { display: sortList.open ? "block" : "none" } : undefined}>
                                    {initial.sort.barList.map((o) => (
                                      <li key={o.value} className={`currency-li${o.value === query.sort ? " sort-selected" : ""}`} data-value={o.value} onClick={() => changeSort(o.value)}> <span>{o.label}</span> </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                      <facet-remove className="active-facets">
                        <a href={`/collections/${initial.handle}`} className="active-facets__button-remove text-button">Clear all</a>
                      </facet-remove>
                    </facet-filters-form>
                    <template id={`collection-grid-promo-template-${initial.sectionId}`} dangerouslySetInnerHTML={{ __html: initial.promos.map(promoMarkup).join("") }} />
                    <ul id="product-grid" data-id={initial.sectionId} className={initial.gridClass} data-promo-interval={initial.promoInterval || undefined} data-promo-repeat={String(initial.promoRepeat)} data-promo-configs={JSON.stringify(initial.promos.map(({ id, position, showOnce, afterGrid }) => ({ id, position, showOnce, afterGrid })))}>
                      {grid.keys.map((key, i) => {
                        const card = grid.cards[key];
                        return [
                          ...(plan.before.get(i) ?? []).map((p) => <PromoColumn key={`promo-${initial.promos[p].id}`} promo={initial.promos[p]} />),
                          <li key={key} className="column">{card && <SourceProductCard card={card} idPrefix={`${initial.sectionId}-${i + 1}`} onQuickView={quickView} />}</li>,
                        ];
                      })}
                      {plan.trailing.map((p) => <PromoColumn key={`promo-${initial.promos[p].id}`} promo={initial.promos[p]} />)}
                    </ul>
                    <pagination-theme className={initial.pagination.className} data-section={initial.sectionId} data-products-per-page={initial.pagination.perPage} data-total-pages={initial.pagination.totalPages} data-current-page={loadedPages}>
                      <div className="row">
                        <div className="small-12 columns">
                          <button className={`load-more button${grid.hasMore ? "" : " hidden"}`} style={grid.hasMore ? undefined : { display: "none" }} onClick={(e) => { e.currentTarget.blur(); loadMore(); }}>
                            <span>Load more</span>
                            <span className="loading-overlay" style={grid.hasMore ? undefined : { display: "none" }}><Spinner /></span>
                          </button>
                        </div>
                      </div>
                    </pagination-theme>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <FacetDrawer
          facets={initial.facets}
          sortOptions={initial.sort.mobile}
          sort={query.sort}
          countText={grid.countText}
          countAsCrumbs={facetRendered ? initial.breadcrumb : null}
          active={drawerOpen}
          handle={initial.handle}
          isChecked={checked}
          onToggle={toggleFilter}
          onSort={(sort) => submitDrawer({ ...query, sort })}
          onClose={() => setDrawerOpen(false)}
        />
    </div>
  );
}

/** Inner markup of div#ProductCount: breadcrumb title + loading overlay. */
function ProductCount({ crumbs }: { crumbs: CollectionCrumb[] }) {
  const last = crumbs.at(-1);
  return (
    <>
      <span className="facet-col-title">
        {crumbs.slice(0, -1).map((c) => <Fragment key={c.title}><a href={c.href} title={c.title}>{c.label}</a> <i>/</i> </Fragment>)}
        <h1> <a href={last?.href} title={last?.title}>{last?.label}</a> </h1>
      </span>
      <span className="loading-overlay"><Spinner /></span>
    </>
  );
}

function PromoColumn({ promo }: { promo: CollectionPromo }) {
  // The source img style "max-width: 2344;" has no unit, so browsers drop it; it is not reproduced.
  return (
    <li className={promo.className} data-promo-block-id={promo.id} data-promo-position={promo.position} data-promo-show-once={String(promo.showOnce)} data-promo-after-grid={String(promo.afterGrid)}>
      <div className="gallery__item" style={styleVars(promo.itemStyle)}>
        <figure className="aspect-ratio aspect-ratio--adapt" style={{ "--ratio-percent": `${promo.ratio}%`, "--ratio-percent-mobile": `${promo.ratioMobile}%` } as React.CSSProperties}>
          <picture>
            {promo.mobileSrc && <source media={promo.mobileMedia ?? undefined} srcSet={promo.mobileSrc} />}
            {promo.src && <img src={promo.src} alt={promo.alt} className={promo.imgClass} />}
          </picture>
          <div className={promo.contentClass}>
            <div>{promo.href && <a href={promo.href} className="gallery__item-content-link" target={promo.target ?? undefined}></a>}</div>
          </div>
        </figure>
      </div>
    </li>
  );
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
/** Same markup as PromoColumn, for the inert <template> the theme keeps as the promotion source. */
function promoMarkup(p: CollectionPromo): string {
  return `<li class="${esc(p.className)}" data-promo-block-id="${esc(p.id)}" data-promo-position="${p.position}" data-promo-show-once="${p.showOnce}" data-promo-after-grid="${p.afterGrid}"><div class="gallery__item" style="${esc(p.itemStyle)}"><figure class="aspect-ratio aspect-ratio--adapt" style="--ratio-percent: ${p.ratio}%; --ratio-percent-mobile: ${p.ratioMobile}%;"><picture>${p.mobileSrc ? `<source media="${esc(p.mobileMedia ?? "")}" srcset="${esc(p.mobileSrc)}">` : ""}${p.src ? `<img src="${esc(p.src)}" alt="${esc(p.alt)}" class="${esc(p.imgClass)}">` : ""}</picture><div class="${esc(p.contentClass)}"><div>${p.href ? `<a href="${esc(p.href)}" class="gallery__item-content-link"${p.target ? ` target="${p.target}"` : ""}></a>` : ""}</div></div></figure></div></li>`;
}

/** "--a: 1; --b: 2" -> React style object (custom properties only). */
function styleVars(css: string): React.CSSProperties {
  return Object.fromEntries(css.split(";").map((d) => d.split(":")).filter(([k, v]) => k?.trim() && v !== undefined).map(([k, ...v]) => [k.trim(), v.join(":").trim()])) as React.CSSProperties;
}

type DrawerProps = {
  facets: Facet[];
  sortOptions: { value: string; label: string }[];
  sort: string;
  countText: string;
  countAsCrumbs: CollectionCrumb[] | null;
  active: boolean;
  handle: string;
  isChecked: (name: string, value: string) => boolean;
  onToggle: (name: string, value: string, checked: boolean) => void;
  onSort: (sort: string) => void;
  onClose: () => void;
};

function FacetDrawer({ facets, sortOptions, sort, countText, countAsCrumbs, active, handle, isChecked, onToggle, onSort, onClose }: DrawerProps) {
  const swatchStyle = (bg: string | null, image: string | null) => ({ "--bg-color": bg ?? undefined, "--option-color-image": image ? `url('${image}')` : undefined } as React.CSSProperties);
  return (
    <facetfiltersformmobile>
      <div className={`side-panel facet-drawer${active ? " active" : ""}`} id="Facet-Drawer">
        <div className="side-panel-inner">
          <div className="side-panel-header">
            <div>
              <h1 className="body-font"> Filter <span className="thb-filter-count mobile-filter-count body-font">{countAsCrumbs ? <ProductCount crumbs={countAsCrumbs} /> : <><span className="facets__label">{countText} </span><span className="loading-overlay"><Spinner /></span></>}</span></h1>
              <side-panel-close className="side-panel-close" onClick={onClose}><CloseIcon /></side-panel-close>
            </div>
          </div>
          <div className="side-panel-content">
            <facet-filters-form className="facets">
              <form id="FacetFiltersFormMobile" className="facets__mobile_form" onSubmit={(e) => e.preventDefault()}>
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
            <div><a className="mobile-filters-clear text-button" href={`/collections/${handle}`}>Clear</a></div>
            {/* Source: onclick="document.querySelector('.click-capture').click()". */}
            <button type="button" className="button mobile-filters-apply" onClick={() => (document.querySelector(".click-capture") as HTMLElement | null)?.click()}><span>Apply</span></button>
          </div>
        </div>
      </div>
    </facetfiltersformmobile>
  );
}
