"use client";
/* eslint-disable @next/next/no-img-element */
// Side panels mounted at the end of #wrapper on every source page (reference/dom/r256-header/wrapper-shell-1920.html):
// #Cart-Drawer, #Product-Drawer, #Search-Drawer and .click-capture. Open state follows the source theme: the panel gets
// .active and body gets open-cc + open-cart; styles from src/app/shell-source.css.
// MOCK: the cart is the localStorage CartService (src/lib/cart.ts). The filled-cart markup was not captured from the
// source (no item is ever added to the source cart) and is an approximation (docs/mock-behaviors.md).
import Link from "next/link";
import { useEffect } from "react";
import { formatPrice } from "@/lib/catalog/format";
import { lineMeta, useCart } from "@/lib/cart";
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

export function ShellPanels({ cartOpen, closeCart }: { cartOpen: boolean; closeCart: () => void }) {
  const panels = useShell().sidePanels;
  useEffect(() => {
    document.body.classList.toggle("open-cc", cartOpen);
    document.body.classList.toggle("open-cart", cartOpen);
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeCart(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [cartOpen, closeCart]);
  useEffect(() => () => { document.body.classList.remove("open-cc", "open-cart"); }, []);
  return (
    <>
      <CartDrawer active={cartOpen} close={closeCart} />
      <div className="side-panel product-drawer" id="Product-Drawer" tabIndex={-1}>
        <div className="side-panel-inner">
          <div className="side-panel-header"><div><h2>{panels.product.title}</h2><PanelClose /></div></div>
          <div className="side-panel-content" id="Product-Drawer-Content" />
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
      <div className="click-capture" onClick={() => { closeCart(); window.dispatchEvent(new Event(CLICK_CAPTURE_EVENT)); }} />
    </>
  );
}
