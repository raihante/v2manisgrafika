"use client";
/* eslint-disable @next/next/no-img-element */
// Side panels mounted at the end of #wrapper on every source page (reference/dom/r256-header/wrapper-shell-1920.html):
// #Cart-Drawer, #Product-Drawer, #Search-Drawer and .click-capture. Open state follows the source theme: the panel gets
// .active and body gets open-cc + open-cart; styles from src/app/shell-source.css.
// MOCK: the cart is the localStorage CartService (src/lib/cart.ts). The filled-cart markup was not captured from the
// source (no item is ever added to the source cart) and is an approximation (docs/mock-behaviors.md).
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/catalog/format";
import { lineMeta, useCart } from "@/lib/cart";
import LinePersonalisation from "@/components/commerce/LinePersonalisation";
import QuickView from "@/components/commerce/QuickView";
import { OPEN_QUICK_VIEW_EVENT, type QuickViewRequest } from "@/components/Overlays";
import { quickViewSource } from "@/lib/catalog/client";
import type { QuickViewProduct } from "@/lib/catalog/types";
import { SourceSvg } from "@/components/shell/SourceSvg";
import { useShell } from "@/components/shell/StorefrontContext";


// Body-level loading overlay; the source keeps it at display:none and shows it during cart requests (the clone's
// mock cart is synchronous, so it stays hidden). Rendered after #wrapper by SiteChrome.
export function PageLoading() {
  const shell = useShell();
  const l = shell.pageLoading;
  return <div className="jsc-page-loading" style={{ display: "none" }}><div className="jsc-spinner-container"><img src={l.image} alt={l.alt} className={l.className} /></div></div>;
}

function PanelClose({ onClick }: { onClick?: () => void }) {
  const panels = useShell().sidePanels;
  return <side-panel-close className="side-panel-close" onClick={onClick} role="button" aria-label="Tutup"><SourceSvg icon={panels.closeIcon} /></side-panel-close>;
}

function CartDrawer({ active, close }: { active: boolean; close: () => void }) {
  const panels = useShell().sidePanels;
  const { lines, subtotal, service } = useCart();
  const cart = panels.cart;
  return (
    <div className={`side-panel cart-drawer${active ? " active" : ""}`} id="Cart-Drawer" tabIndex={-1}>
      <div className="side-panel-inner">
        <div className="side-panel-header"><div><h2 className={cart.titleClass ?? undefined}>{cart.title}</h2><PanelClose onClick={close} /></div></div>
        <div className="side-panel-content jsc-empty-cart-side-panel-content">
          {lines.length === 0 ? (
            <div>
              <input className="disabledoptout" type="hidden" />
              <div className="cart-drawer__empty-cart">
                <p>{cart.empty}</p>
                <p className="jsc-cart-drawer-empty-cart-desc"><img src={cart.desc.icon} aria-label={cart.desc.iconAlt} alt={cart.desc.iconAlt} />{cart.desc.text}</p>
              </div>
              <div className="jsc-shopping-suggestion-section">
                <p className="jsc-shopping-suggestion-title">{cart.suggestionTitle}</p>
                <div className="jsc-shopping-suggestion-pill-section">{cart.pills.map((p) => <Link key={p.href} href={p.href} className="jsc-shopping-suggestion-pill" onClick={close}>{p.label}</Link>)}</div>
              </div>
              <Link className="button accent2" href={cart.continue.href} onClick={close}><span>{cart.continue.label}</span></Link>
            </div>
          ) : (
            <ul className="cart-drawer-local__lines">
              {lines.map((line) => (
                <li key={line.id} className="cart-drawer-local__line">
                  <Link href={`/products/${line.handle}`} onClick={close}><img src={line.image} alt="" /></Link>
                  <div>
                    <Link href={`/products/${line.handle}`} onClick={close} className="cart-drawer-local__title">{line.title}</Link>
                    <p className="cart-drawer-local__meta">{lineMeta(line)}</p>
                    <LinePersonalisation line={line} />
                    <div className="cart-drawer-local__row">
                      <div className="cart-drawer-local__qty">
                        <button type="button" aria-label="Kurangi jumlah" onClick={() => service.setQuantity(line.id, line.quantity - 1)}>−</button>
                        <span>{line.quantity}</span>
                        <button type="button" aria-label="Tambah jumlah" onClick={() => service.setQuantity(line.id, line.quantity + 1)}>+</button>
                      </div>
                      <span>{formatPrice(line.price * line.quantity)}</span>
                    </div>
                    <button type="button" className="cart-drawer-local__remove" onClick={() => service.remove(line.id)}>Hapus</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {lines.length > 0 && (
          <div className="side-panel-footer">
            <div className="mini-cart__row total"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <Link className="button" href="/checkout" onClick={close}><span>Checkout</span></Link>
            <Link className="text-button cart-drawer-local__view" href="/cart" onClick={close}>Lihat Keranjang</Link>
          </div>
        )}
      </div>
    </div>
  );
}

/** Dispatched on window when .click-capture is clicked: every open side panel closes (cart here; the collection facet
 *  drawer listens for it). The source theme closes all side panels from the same click. */
export const CLICK_CAPTURE_EVENT = "shell:click-capture";

type QuickViewState = { product: QuickViewProduct; variantId: number | null; key: number };

/** Card quick view (source QuickView element): load the product, then open #Product-Drawer with its purchase form. */
function useQuickView() {
  const router = useRouter();
  const [state, setState] = useState<QuickViewState | null>(null);
  useEffect(() => {
    let latest = 0;
    const onOpen = (event: Event) => {
      const { handle, variantId } = (event as CustomEvent<QuickViewRequest>).detail;
      const request = ++latest;
      quickViewSource
        .load(handle)
        .then((product) => { if (request === latest) setState({ product, variantId, key: request }); })
        // Data unavailable: fall back to the product page (the pre-round-282 behaviour).
        .catch(() => router.push(`/products/${handle}`));
    };
    window.addEventListener(OPEN_QUICK_VIEW_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_QUICK_VIEW_EVENT, onOpen);
  }, [router]);
  const close = useCallback(() => setState(null), []);
  return { state, close };
}

export function ShellPanels({ cartOpen, closeCart }: { cartOpen: boolean; closeCart: () => void }) {
  const panels = useShell().sidePanels;
  const quick = useQuickView();
  const closeQuickView = quick.close;
  const quickOpen = quick.state !== null;
  const productDrawerRef = useRef<HTMLDivElement>(null);
  // Body state for both panels (source: open-cc for the overlay, open-cart / open-quick-view per panel).
  useEffect(() => {
    const anyOpen = cartOpen || quickOpen;
    document.body.classList.toggle("open-cc", anyOpen);
    document.body.classList.toggle("open-cart", cartOpen);
    document.body.classList.toggle("open-quick-view", quickOpen);
    if (!anyOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { closeCart(); closeQuickView(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [cartOpen, quickOpen, closeCart, closeQuickView]);
  useEffect(() => () => { document.body.classList.remove("open-cc", "open-cart", "open-quick-view"); }, []);
  // Source focuses the drawer's close control on open; the drawer itself (tabIndex -1) takes focus here.
  useEffect(() => { if (quickOpen) productDrawerRef.current?.focus({ preventScroll: true }); }, [quickOpen, quick.state?.key]);
  return (
    <>
      <CartDrawer active={cartOpen} close={closeCart} />
      <div className={`side-panel product-drawer${quickOpen ? " active" : ""}`} id="Product-Drawer" tabIndex={-1} ref={productDrawerRef} role={quickOpen ? "dialog" : undefined} aria-modal={quickOpen || undefined} aria-label={quickOpen ? panels.product.title : undefined}>
        <div className="side-panel-inner">
          <div className="side-panel-header"><div><h2>{panels.product.title}</h2><PanelClose onClick={closeQuickView} /></div></div>
          <div className="side-panel-content" id="Product-Drawer-Content">
            {quick.state && <QuickView key={quick.state.key} product={quick.state.product} initialVariantId={quick.state.variantId} onClose={closeQuickView} />}
          </div>
        </div>
      </div>
      <div className="side-panel search-drawer" tabIndex={-1} id="Search-Drawer">
        <div className="side-panel-inner">
          <div className="side-panel-header">
            <div>
              <form role="search" method="get" className="searchform" action="/search">
                <fieldset>
                  <label htmlFor="side-panel-search-input visually-hidden">{panels.search.label}</label>
                  <input id="side-panel-search-input" type="search" className="search-field" placeholder={panels.search.placeholder} defaultValue="" name="q" autoComplete="off" />
                </fieldset>
              </form>
              <PanelClose />
            </div>
          </div>
          <div className="side-panel-content side-panel-content--has-tabs" />
          <div className="side-panel-content side-panel-content--initial">
            <div className="thb-predictive-search"><div className="thb-predictive-search--promotion"><span className="thb-predictive-search--label" /><div className="thb-predictive-search--promotion-products"><ul className="products collection row small-up-1 medium-up-2" /></div></div></div>
          </div>
        </div>
      </div>
      {/* Source raises the overlay to z-index 90 while the quick view is open (QuickView.renderQuickview). */}
      <div className="click-capture" style={quickOpen ? { zIndex: 90 } : undefined} onClick={() => { closeCart(); closeQuickView(); window.dispatchEvent(new Event(CLICK_CAPTURE_EVENT)); }} />
    </>
  );
}
