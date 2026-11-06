"use client";
// /search in the source template markup (template search: main-collection-banner + main-search, theme t/33,
// 2026-11-06): banner with breadcrumbs, title, the search form and the results line; with a query, the product grid
// with the facet bar, numbered pagination and the facet drawer (shared facet UI). Without a query the main-search
// section is empty, as on the source.
// MOCK results: src/lib/search/query.ts over the /collections/new-in dataset (docs/mock-behaviors.md "Search page").
// URL behaviour follows the source: the banner and header forms and the bar sort list submit natively (?q=, ?sort_by=),
// pagination links are plain links, drawer changes push ?q=&options[prefix]=last&filter.*&sort_by=.
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SourceProductCard from "@/components/commerce/pdp/SourceProductCard";
import { FacetBar, FacetDrawer, navigateWithSort, sortFilters, useDrawerSubmit, useEqualCardHeights, useFacetDrawer } from "@/components/commerce/collection/facets";
import { SourceSvg } from "@/components/shell/SourceSvg";
import type { CollectionData, ProductCard } from "@/lib/collections/types";
import { shellRepository } from "@/lib/navigation";
import { fill, pageHref, pageParts, parseSearch, runSearch, searchParamsFor } from "@/lib/search/query";
import { searchRepository } from "@/lib/search/repository";
import type { SearchMeta, SearchQuery } from "@/lib/search/types";

const meta = searchRepository.meta();
const searchIcon = shellRepository.getShell().searchBar.submitIcon;

/** Static (server) render: the no-query state. Also the Suspense fallback of the route. */
export function SearchPageStatic() {
  return <SearchView query={{ q: "", sort: meta.sort.initial, page: 1, filters: [] }} index={null} />;
}

export default function SearchPage() {
  const params = useSearchParams();
  const query = useMemo(() => parseSearch(params.toString(), meta), [params]);
  const [index, setIndex] = useState<CollectionData | null>(null);
  useEffect(() => { if (query.q) searchRepository.loadSearchIndex().then(setIndex); }, [query.q]);
  return <SearchView key={params.toString()} query={query} index={index} />;
}

function SearchView({ query: urlQuery, index }: { query: SearchQuery; index: CollectionData | null }) {
  const router = useRouter();
  // Drawer edits apply immediately to the controls and to the URL after the source's 500 ms debounce.
  const [query, setQuery] = useState(urlQuery);
  const [drawerOpen, setDrawerOpen] = useFacetDrawer();
  const [facetRendered, setFacetRendered] = useState(false);
  const submitDrawer = useDrawerSubmit();
  const gridRef = useRef<HTMLDivElement>(null);
  const result = useMemo(() => (index && query.q ? runSearch(index, meta, query) : null), [index, query]);
  useEqualCardHeights(gridRef, result);
  useEffect(() => {
    document.title = query.q && result ? fill(meta.documentTitle.results, { count: result.count, q: query.q }) : meta.documentTitle.empty;
  }, [query.q, result]);

  const applyDrawer = (next: SearchQuery) => {
    setQuery(next);
    submitDrawer(async () => { setFacetRendered(true); return searchParamsFor(next, meta, { filters: true, sort: true }); });
  };
  const toggleFilter = (name: string, value: string, checked: boolean) => {
    const filters = checked ? [...query.filters, { name, value }] : query.filters.filter((f) => !(f.name === name && f.value === value));
    applyDrawer({ ...query, page: 1, filters: sortFilters(result?.facets ?? [], filters) });
  };
  const quickView = (card: ProductCard) => router.push(card.imageHref);
  const clearHref = `?${searchParamsFor({ ...query, sort: meta.sort.initial }, meta, { filters: false, sort: true })}`;
  const hidden = [{ name: "q", value: query.q }, ...meta.hiddenInputs];

  return (
    <>
      <div id={`shopify-section-${meta.bannerSectionId}`} className="shopify-section">
        <div className={meta.bannerClass} style={styleVars(meta.bannerStyle)}>
          <div className="collection-banner--breadcrumbs">
            <nav className="breadcrumbs" aria-label="breadcrumbs"> <a href={meta.breadcrumbHome.href}>{meta.breadcrumbHome.label}</a> <i>/</i> {meta.breadcrumbCurrent} </nav>
          </div>
          <div className="row full-width-row">
            <div className="small-12 columns">
              <div className="collection-banner--content">
                <h1 className="collection-banner--title">{meta.title}</h1>
                <form role="search" method="get" className="searchform" action="/search">
                  <fieldset>
                    <input type="search" className="search-field searchpageinput" placeholder={meta.placeholder} defaultValue={query.q} name="q" autoComplete="off" />
                    <button type="submit" className="thb-search-submit"><SourceSvg icon={searchIcon} /></button>
                  </fieldset>
                </form>
                {/* The theme nests <p> elements; this is the tree the browser parser builds from them. */}
                <div className="collection-banner--description">
                  <p> </p>
                  {query.q && result && <><p>{fill(meta.resultsText, { count: result.count, q: query.q })}</p> <p></p></>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id={`shopify-section-${meta.searchSectionId}`} className="shopify-section">
        {query.q && result && (
          <>
            <div className="collection-section-grid row full-width-row">
              <div className="small-12 columns">
                <div className="collection-container section-spacing-bottom" ref={gridRef}>
                  <div id="ProductGridContainer">
                    {/* Source nests a second container (the search section renders the grid snippet inside its own). */}
                    <div className="collection-container section-spacing-bottom">
                      <div id="ProductGridContainer">
                        <div className="sidebar-container facets--drawer results--">
                          <div>
                            <FacetBar
                              crumbs={meta.barCrumbs}
                              current="span"
                              hiddenInputs={hidden}
                              sort={query.sort}
                              options={meta.sort.bar}
                              list={meta.sort.barList}
                              clearHref={clearHref}
                              onToggleDrawer={() => setDrawerOpen((o) => !o)}
                              onSort={(value) => navigateWithSort(searchParamsFor({ ...query, sort: value }, meta, { filters: false, sort: true }))}
                            />
                            <ul id="product-grid" data-id={meta.searchSectionId} className={meta.gridClass}>
                              {result.keys.map((key, i) => (
                                <li key={key} className="column"><SourceProductCard card={result.cards[key]} idPrefix={`${meta.searchSectionId}-${i + 1}`} onQuickView={quickView} /></li>
                              ))}
                            </ul>
                            <Pagination query={query} total={result.totalPages} meta={meta} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <FacetDrawer
              facets={result.facets}
              hiddenInputs={hidden}
              sortOptions={meta.sort.mobile}
              sort={query.sort}
              countText={fill(meta.countLabel, { count: result.count })}
              countAsCrumbs={facetRendered ? { crumbs: meta.barCrumbs, current: "span" } : null}
              active={drawerOpen}
              clearHref={clearHref}
              isChecked={(name, value) => query.filters.some((f) => f.name === name && f.value === value)}
              onToggle={toggleFilter}
              onSort={(sort) => applyDrawer({ ...query, page: 1, sort })}
              onClose={() => setDrawerOpen(false)}
              clientMounted
            />
          </>
        )}
      </div>
    </>
  );
}

function Pagination({ query, total, meta }: { query: SearchQuery; total: number; meta: SearchMeta }) {
  const current = Math.min(query.page, total);
  const parts = pageParts(current, total);
  return (
    <pagination-theme className={meta.paginationClass} data-section={meta.searchSectionId} data-products-per-page={meta.perPage} data-next-url={current < total ? pageHref(current + 1, query) : undefined} data-total-pages={total} data-current-page={current}>
      <div className="row">
        <div className="small-12 columns">
          {parts.length > 0 && (
            <div className="page-numbers nav-links">
              {current > 1 && <><span className="prev"><a href={pageHref(current - 1, query)} title=""> Previous </a></span> </>}
              {parts.map((p, i) => (
                <Fragment key={p === "deco" ? `d${i}` : p}>
                  {p === "deco" ? <span className="deco">&hellip;</span> : p === current ? <span className="page current">{p}</span> : <span className="page"><a href={pageHref(p, query)} title="">{p}</a></span>}{" "}
                </Fragment>
              ))}
              {current < total && <span className="next"><a href={pageHref(current + 1, query)} title=""> Next </a></span>}
            </div>
          )}
        </div>
      </div>
    </pagination-theme>
  );
}

/** "--a: 1; --b: 2" -> React style object. */
function styleVars(css: string): React.CSSProperties {
  return Object.fromEntries(css.split(";").map((d) => d.split(":")).filter(([k, ...v]) => k?.trim() && v.join(":").trim()).map(([k, ...v]) => [k.trim(), v.join(":").trim()])) as React.CSSProperties;
}
