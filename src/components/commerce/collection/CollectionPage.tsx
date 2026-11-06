"use client";
/* eslint-disable @next/next/no-img-element -- source markup uses plain <img> inside <picture> */
// Collection page in the source template markup (sections/main-collection product-grid, theme t/33, 2026-11-06):
// facet bar, ul#product-grid with source product cards and the promotion column, load-more pagination, and the facet
// drawer (shared facet UI in ./facets.tsx).
// Behaviour follows the theme scripts in reference/js/r257-collection/ and reference/js/r256-header/jsc-reset-scripts.js:
// - Filter toggles body.open-cc + #Facet-Drawer.active; .click-capture (and Apply) closes it.
// - Drawer inputs submit after a 500 ms debounce, push ?filter.*&sort_by= and smooth-scroll to the grid.
// - The bar Sort list submits the bar form: a full navigation to ?sort_by=<value> (filters dropped).
// - Load more appends the next page and completes the last row (src/lib/collections/query.ts).
// MOCK data source and filter semantics: docs/mock-behaviors.md "Collection grid, load more, filters and sort".
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SourceProductCard from "@/components/commerce/pdp/SourceProductCard";
import { Spinner } from "@/components/commerce/pdp/icons";
import { loadCollection } from "@/lib/collections/client";
import { DEFAULT_SORT, gridColumns, parseQuery, promoPlan, queryToSearch, resolveView, visibleKeys } from "@/lib/collections/query";
import type { CollectionData, CollectionInitial, CollectionPromo, CollectionQuery, ProductCard } from "@/lib/collections/types";
import { FacetBar, FacetDrawer, navigateWithSort, sortFilters, useDrawerSubmit, useEqualCardHeights, useFacetDrawer } from "./facets";

type Grid = { keys: string[]; hasMore: boolean; countText: string; cards: Record<string, ProductCard> };

export default function CollectionPage({ initial }: { initial: CollectionInitial }) {
  const router = useRouter();
  const [query, setQuery] = useState<CollectionQuery>({ sort: initial.sort.initial, filters: [] });
  const [loadedPages, setLoadedPages] = useState(1);
  const [grid, setGrid] = useState<Grid>({ keys: initial.keys, hasMore: initial.hasMore, countText: initial.countText, cards: initial.cards });
  const [drawerOpen, setDrawerOpen] = useFacetDrawer();
  // True after the first facet-form render: facets.js renderProductCount then copies #ProductCount (the breadcrumb)
  // into every .thb-filter-count, including the drawer header count (hidden by CSS).
  const [facetRendered, setFacetRendered] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const columns = gridColumns(initial.gridClass);
  const ensureData = useCallback(() => loadCollection(initial.handle), [initial.handle]);
  const submitDrawer = useDrawerSubmit();

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

  const applyDrawer = (next: CollectionQuery) => {
    setQuery(next);
    submitDrawer(() => ensureData().then((d) => {
      setLoadedPages(1);
      show(d, next, 1);
      setFacetRendered(true);
      return queryToSearch(next, true);
    }));
  };
  const toggleFilter = (name: string, value: string, checked: boolean) => {
    const filters = checked ? [...query.filters, { name, value }] : query.filters.filter((f) => !(f.name === name && f.value === value));
    applyDrawer({ ...query, filters: sortFilters(initial.facets, filters) });
  };
  const loadMore = () => {
    ensureData().then((d) => { const pages = loadedPages + 1; setLoadedPages(pages); show(d, query, pages); });
  };

  useEqualCardHeights(gridRef, grid);
  const plan = useMemo(() => promoPlan(grid.keys.length, initial.promos), [grid.keys.length, initial.promos]);
  const quickView = (card: ProductCard) => router.push(card.imageHref);
  const checked = (name: string, value: string) => query.filters.some((f) => f.name === name && f.value === value);
  const clearHref = `/collections/${initial.handle}`;

  return (
    <div id={`shopify-section-${initial.sectionId}`} className="shopify-section">
      <div className="collection-section-grid row full-width-row">
        <div className="small-12 columns">
          <div className="collection-container collection-container-wrap section-spacing-bottom" ref={gridRef}>
            <div id="ProductGridContainer">
              <div className={`sidebar-container facets--drawer results--${initial.pagination.perPage}`}>
                <div>
                  <FacetBar
                    crumbs={initial.breadcrumb}
                    sort={query.sort}
                    options={initial.sort.bar}
                    list={initial.sort.barList}
                    clearHref={clearHref}
                    onToggleDrawer={() => setDrawerOpen((o) => !o)}
                    onSort={(value) => navigateWithSort(`sort_by=${encodeURIComponent(value)}`)}
                  />
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
        countAsCrumbs={facetRendered ? { crumbs: initial.breadcrumb, current: "h1" } : null}
        active={drawerOpen}
        clearHref={clearHref}
        isChecked={checked}
        onToggle={toggleFilter}
        onSort={(sort) => applyDrawer({ ...query, sort })}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
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
