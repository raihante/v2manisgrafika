"use client";
/* eslint-disable @next/next/no-img-element */
// Storefront overlays: promo popup (source "Backstage pass" slot, Manis Grafika placeholder copy, hidden until enabled)
// and Instagram lightbox. The open-cart event is consumed by SiteChrome,
// which drives the source side panels in src/components/shell/ShellPanels.tsx.
// APPROXIMATE / NOT VISUALLY VERIFIED. All behavior is MOCK (docs/mock-behaviors.md).

import { useEffect, useState } from "react";
import Link from "next/link";
import { useShell } from "@/components/shell/StorefrontContext";
import { createPortal } from "react-dom";

export const OPEN_CART_EVENT = "mg:open-cart";
export const openCartDrawer = () => window.dispatchEvent(new Event(OPEN_CART_EVENT));

function useEscape(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onEscape(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, onEscape]);
}

// The source popup locks scroll with body.style.overflow (not a class), so it never collides with the menu drawer's
// body.overflow-hidden toggle.
function useBodyOverflowLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [active]);
}

function useBodyClass(active: boolean, className: string) {
  useEffect(() => {
    if (!active) return;
    document.body.classList.add(className);
    return () => document.body.classList.remove(className);
  }, [active, className]);
}

// MOCK promo popup on the source "Backstage pass" markup. Opens `delayMs` after load and locks body scroll; dismissal
// is remembered for the browser session. Content comes from the shell data (`promoPopup`); nothing renders while
// `enabled` is false (owner decision 2026-11-17: placeholder copy, hidden until the client supplies a promotion).
const PROMO_KEY = "mg-promo-popup-dismissed";

export function PromoPopup() {
  const promo = useShell().promoPopup;
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!promo.enabled) return;
    try { if (window.sessionStorage.getItem(PROMO_KEY)) return; } catch { /* storage blocked: still show */ }
    const timer = window.setTimeout(() => setOpen(true), promo.delayMs);
    return () => window.clearTimeout(timer);
  }, [promo.enabled, promo.delayMs]);
  const close = () => {
    setOpen(false);
    try { window.sessionStorage.setItem(PROMO_KEY, "1"); } catch { /* ignore */ }
  };
  useEscape(open, close);
  useBodyOverflowLock(open);
  if (!open) return null;
  return (
    <>
      <div className="login-register__overlay" onClick={close} aria-hidden="true" />
      <div id="jsc-login-register-popup" className="login-register__popup open" role="dialog" aria-modal="true" aria-labelledby="promo-popup-title" onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
        <div className="login-register__popup-inner">
          <button className="login-register__close" type="button" aria-label="Tutup" onClick={close}>×</button>
          <div className="login-register__panels">
            <div id="login-popup-panel" className="login-register__panel active">
              <img className="jsc-login-header-img" src={promo.image} alt={promo.imageAlt} />
              <h4 className="jsc-login-header" id="promo-popup-title">{promo.title}</h4>
              <h4 className="jsc-login-subheader"><span>{promo.subtitle}</span></h4>
              <div className="field m-t-15">
                <Link className="button" href={promo.button.href} onClick={close}><span>{promo.button.label}</span></Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// MOCK Instagram post lightbox: local snapshot images only; captions, likes, and tagged products were not captured.
type InstagramAccount = { handle: string; url: string; links: string[] };
export function InstagramLightbox({ images, index, account, onClose, onNavigate }: { images: string[]; index: number; account: InstagramAccount; onClose: () => void; onNavigate: (index: number) => void }) {
  const name = account.handle.replace(/^@/, "");
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
    <div className="instafeed-lightbox-local" role="dialog" aria-modal="true" aria-label={`Postingan Instagram ${index + 1} dari ${images.length}`} onClick={onClose}>
      <div className="instafeed-lightbox-local__box" onClick={(event) => event.stopPropagation()}>
        <div className="instafeed-lightbox-local__media"><img src={images[index]} alt={`Postingan Instagram ${index + 1}`} /></div>
        <div className="instafeed-lightbox-local__side">
          <a className="instafeed-lightbox-local__account" href={account.url} target="_blank" rel="noreferrer">
            <img src="/assets/payments/instagram-icon-v2.svg" alt="" /><span>{name}</span>
          </a>
          <a className="instafeed-lightbox-local__view" href={account.links[index] ?? account.url} target="_blank" rel="noreferrer">Lihat di Instagram</a>
        </div>
      </div>
      <button type="button" className="instafeed-lightbox-local__close" aria-label="Tutup" onClick={onClose}>×</button>
      <button type="button" className="instafeed-lightbox-local__arrow instafeed-lightbox-local__arrow--prev" aria-label="Postingan sebelumnya" onClick={(event) => { event.stopPropagation(); onNavigate((index - 1 + images.length) % images.length); }}>‹</button>
      <button type="button" className="instafeed-lightbox-local__arrow instafeed-lightbox-local__arrow--next" aria-label="Postingan berikutnya" onClick={(event) => { event.stopPropagation(); onNavigate((index + 1) % images.length); }}>›</button>
    </div>,
    document.body,
  );
}
