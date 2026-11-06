"use client";
/* eslint-disable @next/next/no-img-element */
// Storefront overlays: Backstage Pass popup and Instagram lightbox. The open-cart event is consumed by SiteChrome,
// which drives the source side panels in src/components/shell/ShellPanels.tsx.
// APPROXIMATE / NOT VISUALLY VERIFIED. All behavior is MOCK (docs/mock-behaviors.md).

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

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
  useBodyOverflowLock(open);
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
