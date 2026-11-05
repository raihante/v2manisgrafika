"use client";
/* eslint-disable @next/next/no-img-element */
// Storefront overlays: search drawer, cart drawer, Backstage Pass popup, Instagram lightbox.
// Markup/CSS follow the captured source DOM (reference/dom/homepage.html) and theme CSS
// (reference/css/ddbf5bc5318e0c37.css, 87b48e5878c19325.css, 985c6b2ef092b562.css).
// APPROXIMATE / NOT VISUALLY VERIFIED. All behavior is MOCK (docs/mock-behaviors.md).

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { catalog, formatPrice } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

export const OPEN_CART_EVENT = "btv:open-cart";
export const openCartDrawer = () => window.dispatchEvent(new Event(OPEN_CART_EVENT));

function useEscape(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onEscape(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, onEscape]);
}

function useBodyClass(active: boolean, className: string) {
  useEffect(() => {
    if (!active) return;
    document.body.classList.add(className);
    return () => document.body.classList.remove(className);
  }, [active, className]);
}

function PanelClose({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="side-panel-close" onClick={onClick} aria-label="Close">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M13 1L1 13M13 13L1 1" stroke="var(--color-body, #000)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
}

// MOCK predictive search: filters the local catalog fixture by title; no search API is called.
function SearchDrawer({ active, close }: { active: boolean; close: () => void }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return catalog.listProducts().filter((product) => product.title.toLowerCase().includes(term)).slice(0, 8);
  }, [query]);
  const submit = (event: FormEvent) => event.preventDefault();
  return (
    <div className={`side-panel search-drawer${active ? " active" : ""}`} id="Search-Drawer" tabIndex={-1} aria-hidden={!active} role="dialog" aria-label="Search">
      <div className="side-panel-inner">
        <div className="side-panel-header">
          <div>
            <form role="search" className="searchform" onSubmit={submit}>
              <fieldset>
                <label htmlFor="side-panel-search-input">Search</label>
                {active && <input id="side-panel-search-input" type="search" className="search-field" placeholder="Search for anything" value={query} onChange={(event) => setQuery(event.target.value)} name="q" autoComplete="off" autoFocus />}
              </fieldset>
            </form>
            <PanelClose onClick={close} />
          </div>
        </div>
        <div className="side-panel-content side-panel-content--initial">
          <div className="thb-predictive-search">
            {query.trim() && (
              <div className="predictive-search-local">
                <span className="thb-predictive-search--label">{results.length ? `Products (${results.length})` : `No results for “${query.trim()}”`}</span>
                <ul className="predictive-search-local__list">
                  {results.map((product) => (
                    <li key={product.handle}>
                      <Link href={`/products/${product.handle}`} onClick={close}>
                        <img src={product.image} alt="" />
                        <span><span className="predictive-search-local__title">{product.title}</span><span className="predictive-search-local__price">{formatPrice(product.price)}</span></span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  { label: "New In", href: "/collections/new-in" },
  { label: "Bags", href: "/collections/bags" },
  { label: "Accessories", href: "/collections/accessories-all" },
];

// MOCK cart drawer backed by localStorage CartService (src/lib/cart.ts). Empty state mirrors source markup;
// the filled state was not captured from source and is an approximation.
function CartDrawer({ active, close }: { active: boolean; close: () => void }) {
  const { lines, subtotal, service } = useCart();
  return (
    <div className={`side-panel cart-drawer${active ? " active" : ""}`} id="Cart-Drawer" tabIndex={-1} aria-hidden={!active} role="dialog" aria-label="Your Shopping Bag">
      <div className="side-panel-inner">
        <div className="side-panel-header">
          <div>
            <h2 className="body-font">Your Shopping Bag</h2>
            <PanelClose onClick={close} />
          </div>
        </div>
        <div className="side-panel-content jsc-empty-cart-side-panel-content">
          {lines.length === 0 ? (
            <div>
              <div className="cart-drawer__empty-cart">
                <p>Your bag is currently empty.</p>
                <p className="jsc-cart-drawer-empty-cart-desc"><img src="/assets/source/empty-cart-desc-icon.png" alt="cart empty image" />Free delivery with no min. spend</p>
              </div>
              <div className="jsc-shopping-suggestion-section">
                <p className="jsc-shopping-suggestion-title">Shopping suggestion</p>
                <div className="jsc-shopping-suggestion-pill-section">
                  {SUGGESTIONS.map((item) => <Link key={item.href} href={item.href} className="jsc-shopping-suggestion-pill" onClick={close}>{item.label}</Link>)}
                </div>
              </div>
              <Link className="button accent2" href="/collections/new-in" onClick={close}><span>Continue Shopping</span></Link>
            </div>
          ) : (
            <ul className="cart-drawer-local__lines">
              {lines.map((line) => (
                <li key={line.id} className="cart-drawer-local__line">
                  <Link href={`/products/${line.handle}`} onClick={close}><img src={line.image} alt="" /></Link>
                  <div>
                    <Link href={`/products/${line.handle}`} onClick={close} className="cart-drawer-local__title">{line.title}</Link>
                    <p className="cart-drawer-local__meta">{[line.colour, line.size].filter(Boolean).join(" / ")}</p>
                    <div className="cart-drawer-local__row">
                      <div className="cart-drawer-local__qty">
                        <button type="button" aria-label="Decrease quantity" onClick={() => service.setQuantity(line.id, line.quantity - 1)}>−</button>
                        <span>{line.quantity}</span>
                        <button type="button" aria-label="Increase quantity" onClick={() => service.setQuantity(line.id, line.quantity + 1)}>+</button>
                      </div>
                      <span>{formatPrice(line.price * line.quantity)}</span>
                    </div>
                    <button type="button" className="cart-drawer-local__remove" onClick={() => service.remove(line.id)}>Remove</button>
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
            <Link className="text-button cart-drawer-local__view" href="/cart" onClick={close}>View Bag</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function SidePanels({ open, close }: { open: "search" | "cart" | null; close: () => void }) {
  useEscape(open !== null, close);
  useBodyClass(open !== null, "open-cc");
  return (
    <>
      <CartDrawer active={open === "cart"} close={close} />
      <SearchDrawer active={open === "search"} close={close} />
      <div className={`click-capture${open ? " is-active" : ""}`} onClick={close} aria-hidden="true" />
    </>
  );
}

// MOCK Backstage Pass popup. Source opens it ~2-4s after load and locks body scroll; dismissal is remembered
// for the browser session here (source persistence rule not captured). Sign-up links to /account/register (local 404).
const BACKSTAGE_KEY = "btv-preview-backstage-dismissed";
const BACKSTAGE_DELAY_MS = 3000;

export function BackstagePassPopup() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try { if (window.sessionStorage.getItem(BACKSTAGE_KEY)) return; } catch { /* storage blocked: still show */ }
    const timer = window.setTimeout(() => setOpen(true), BACKSTAGE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);
  const close = () => {
    setOpen(false);
    try { window.sessionStorage.setItem(BACKSTAGE_KEY, "1"); } catch { /* ignore */ }
  };
  useEscape(open, close);
  useBodyClass(open, "overflow-hidden");
  if (!open) return null;
  return (
    <>
      <div className="login-register__overlay" onClick={close} aria-hidden="true" />
      <div id="jsc-login-register-popup" className="login-register__popup open" role="dialog" aria-modal="true" aria-labelledby="backstage-pass-title" onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
        <div className="login-register__popup-inner">
          <button className="login-register__close" type="button" aria-label="Close" onClick={close}>×</button>
          <div className="login-register__panels">
            <div id="login-popup-panel" className="login-register__panel active">
              <img className="jsc-login-header-img" src="/assets/source/VINE_CLUB.gif" alt="vine club gif" />
              <h4 className="jsc-login-header" id="backstage-pass-title">Backstage pass with BTV</h4>
              <h4 className="jsc-login-subheader"><span>First things first, here&apos;s Rp100.000 when you join<br />The Vine Club.</span></h4>
              <div className="field m-t-15">
                <Link className="button" href="/account/register" onClick={close}><span>Sign up here</span></Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// MOCK Instagram post lightbox: local snapshot images only; captions, likes, and tagged products were not captured.
export function InstagramLightbox({ images, index, onClose, onNavigate }: { images: string[]; index: number; onClose: () => void; onNavigate: (index: number) => void }) {
  useEscape(true, onClose);
  useBodyClass(true, "overflow-hidden");
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") onNavigate((index + 1) % images.length);
      if (event.key === "ArrowLeft") onNavigate((index - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [images.length, index, onNavigate]);
  return createPortal(
    <div className="instafeed-lightbox-local" role="dialog" aria-modal="true" aria-label={`Instagram post ${index + 1} of ${images.length}`} onClick={onClose}>
      <div className="instafeed-lightbox-local__box" onClick={(event) => event.stopPropagation()}>
        <div className="instafeed-lightbox-local__media"><img src={images[index]} alt={`Instagram post ${index + 1}`} /></div>
        <div className="instafeed-lightbox-local__side">
          <a className="instafeed-lightbox-local__account" href="https://instagram.com/beyondthevines/" target="_blank" rel="noreferrer">
            <img src="/assets/payments/instagram-icon-v2.svg" alt="" /><span>beyondthevines</span>
          </a>
          <a className="instafeed-lightbox-local__view" href="https://instagram.com/beyondthevines/" target="_blank" rel="noreferrer">View on Instagram</a>
        </div>
      </div>
      <button type="button" className="instafeed-lightbox-local__close" aria-label="Close" onClick={onClose}>×</button>
      <button type="button" className="instafeed-lightbox-local__arrow instafeed-lightbox-local__arrow--prev" aria-label="Previous post" onClick={(event) => { event.stopPropagation(); onNavigate((index - 1 + images.length) % images.length); }}>‹</button>
      <button type="button" className="instafeed-lightbox-local__arrow instafeed-lightbox-local__arrow--next" aria-label="Next post" onClick={(event) => { event.stopPropagation(); onNavigate((index + 1) % images.length); }}>›</button>
    </div>,
    document.body,
  );
}
