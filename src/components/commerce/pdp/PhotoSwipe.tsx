"use client";
/* eslint-disable @next/next/no-img-element -- PhotoSwipe renders plain <img class="pswp__img"> */
// Product image lightbox in the source PhotoSwipe v4 markup (snippets/photoswipe + product.js setupProductGallery):
// options loop:false, maxSpreadZoom:2, vertical gap 50/50, counter + arrows + close, Esc / arrow keys, click toggles
// between the fitted size and 1:1 (zoom origin at the pointer), drag pans while zoomed. The closed state is the
// hidden-but-mounted skeleton the source keeps in the DOM.
import { useCallback, useEffect, useRef, useState } from "react";

export type LightboxItem = { src: string; w: number; h: number };
type Props = { items: LightboxItem[]; index: number | null; onIndex: (i: number) => void; onClose: () => void };

const GAP = 50; // item.vGap top/bottom (product.js parseVerticalMargin)
const SPACING = 0.12; // PhotoSwipe default spacing between slides (fraction of viewport width)

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 1L1 13M13 13L1 1" stroke="var(--color-body)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const ArrowLeft = () => (
  <svg width="15" height="11" viewBox="0 0 15 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 5.5H2" stroke="var(--color-accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M5.30002 1L0.800018 5.5L5.30002 10" stroke="var(--color-accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const ArrowRight = () => (
  <svg width="15" height="11" viewBox="0 0 15 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 5.5H13" stroke="var(--color-accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M9.69995 1L14.2 5.5L9.69995 10" stroke="var(--color-accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export default function PhotoSwipe({ items, index, onIndex, onClose }: Props) {
  const open = index !== null;
  // Viewport size and PhotoSwipe's likelyTouchDevice (PointerEvent ? maxTouchPoints > 1 : 'ontouchstart' in window).
  // Lazy initialisers: the component only renders open on the client, after a click.
  const [vp, setVp] = useState(() => (typeof window === "undefined" ? { w: 0, h: 0 } : { w: window.innerWidth, h: window.innerHeight }));
  const [touch] = useState(() => typeof window !== "undefined" && ("PointerEvent" in window ? navigator.maxTouchPoints > 1 : "ontouchstart" in window));
  const [zoom, setZoom] = useState<{ s: number; x: number; y: number } | null>(null); // null = fitted
  const drag = useRef<{ x: number; y: number; ox: number; oy: number; moved: boolean } | null>(null);
  // UI "mouseUsed": first mousemove adds pswp--has_mouse; on likely-touch devices desktop zoom is set up only then.
  const [hasMouse, setHasMouse] = useState(false);

  useEffect(() => {
    const size = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", size);
    return () => window.removeEventListener("resize", size);
  }, []);
  useEffect(() => {
    if (!open) return;
    const mouse = () => setHasMouse(true);
    window.addEventListener("mousemove", mouse, { once: true });
    return () => window.removeEventListener("mousemove", mouse);
  }, [open]);

  const go = useCallback((i: number) => { if (i >= 0 && i < items.length) { setZoom(null); onIndex(i); } }, [items.length, onIndex]);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go((index ?? 0) - 1);
      else if (e.key === "ArrowRight") go((index ?? 0) + 1);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [go, index, onClose, open]);

  // Fitted size: PhotoSwipe v4 sizes the <img> itself to the fitted box and keeps the zoom-wrap at scale(1).
  const fit = (it: LightboxItem) => {
    const r = Math.min(vp.w / it.w, (vp.h - 2 * GAP) / it.h);
    const w = Math.round(it.w * r), h = Math.round(it.h * r);
    return { r, w, h, x: Math.round((vp.w - it.w * r) / 2), y: Math.round(GAP + (vp.h - 2 * GAP - it.h * r) / 2) };
  };
  const current = open ? items[index] : null;

  // Click toggles fit <-> 1:1 (capped by maxSpreadZoom: 2 x the fit ratio) around the pointer; scale is relative to the fit.
  const toggleZoom = (e: React.MouseEvent) => {
    if (!current || drag.current?.moved || !zoomAllowed) return;
    if (zoom) { setZoom(null); return; }
    const f = fit(current);
    const s = Math.min(1, f.r * 2) / f.r;
    const px = e.clientX - f.x, py = e.clientY - f.y; // fitted-image coords under the pointer
    setZoom({ s, x: e.clientX - px * s, y: e.clientY - py * s });
  };

  // Opened classes in PhotoSwipe v4 order: open, touch/notouch, css_animation, svg, visible, animated-in; zoom-allowed when the
  // fitted ratio is < 1 and desktop zoom is set up (immediately, or after the first mouse use on likely-touch devices).
  const zoomAllowed = !!current && fit(current).r < 1 && (!touch || hasMouse);
  const className = open
    ? `pswp no-js-hidden pswp--open ${touch ? "pswp--touch" : "pswp--notouch"} pswp--css_animation pswp--svg pswp--visible pswp--animated-in${zoomAllowed ? " pswp--zoom-allowed" : ""}${hasMouse ? " pswp--has_mouse" : ""}${zoom ? " pswp--zoomed-in" : ""}`
    : "pswp no-js-hidden";
  const slide = vp.w * (1 + SPACING);

  return (
    <div className={className} tabIndex={-1} role="dialog" aria-hidden={open ? "false" : "true"} style={open ? { position: "fixed" } : undefined}>
      <div className="pswp__bg" style={open ? { opacity: 1 } : undefined}></div>
      <div className="pswp__scroll-wrap">
        <div className="pswp__container" style={open ? { transform: "translate3d(0px, 0px, 0px)" } : undefined}>
          {[-1, 0, 1].map((offset) => {
            const i = (index ?? 0) + offset;
            const it = open ? items[i] : undefined;
            const f = it ? fit(it) : null;
            const t = f ? (offset === 0 && zoom ? { x: zoom.x, y: zoom.y, s: zoom.s } : { x: f.x, y: f.y, s: 1 }) : null;
            // Slot styles as PhotoSwipe writes them: side slots display:block, the centre slot only a transform.
            const slotStyle = open ? (offset === 0 ? { transform: "translate3d(0px, 0px, 0px)" } : { display: "block", transform: `translate3d(${Math.round(offset * slide)}px, 0px, 0px)` }) : undefined;
            return (
              <div key={offset} className="pswp__item" style={slotStyle}>
                {it && f && t && (
                  <div
                    className="pswp__zoom-wrap"
                    style={{ transform: `translate3d(${t.x}px, ${t.y}px, 0px) scale(${t.s})` }}
                    onClick={offset === 0 ? toggleZoom : undefined}
                    onPointerDown={offset === 0 && zoom ? (e) => { drag.current = { x: e.clientX, y: e.clientY, ox: zoom.x, oy: zoom.y, moved: false }; (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); } : undefined}
                    onPointerMove={offset === 0 && zoom ? (e) => { const d = drag.current; if (!d) return; if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 3) d.moved = true; setZoom({ ...zoom, x: d.ox + e.clientX - d.x, y: d.oy + e.clientY - d.y }); } : undefined}
                    onPointerUp={() => { window.setTimeout(() => { drag.current = null; }); }}
                  >
                    {offset === 0 && <img className="pswp__img pswp__img--placeholder" src={it.src} alt="" style={{ width: `${f.w}px`, height: `${f.h}px`, display: "none" }} draggable={false} />}
                    <img className="pswp__img" src={it.src} alt="" style={offset === 0 ? { display: "block", width: `${f.w}px`, height: `${f.h}px` } : { opacity: 1, width: `${f.w}px`, height: `${f.h}px` }} draggable={false} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className={open ? `pswp__ui pswp__ui--fit${items.length < 2 ? " pswp__ui--one-slide" : ""}` : "pswp__ui pswp__ui--hidden"}>
          <div className="pswp__top-bar">
            <div className="pswp__button pswp__counter">{open ? `${(index ?? 0) + 1} / ${items.length}` : ""}</div>
            <button type="button" className="pswp__button pswp__button--close" title="Close (Esc)" onClick={onClose}><CloseIcon /></button>
            <div className="pswp__preloader"></div>
          </div>
          <button type="button" className="pswp__button pswp__button--arrow--left" title="Previous (arrow left)" onClick={() => go((index ?? 0) - 1)}><ArrowLeft /></button>
          <button type="button" className="pswp__button pswp__button--arrow--right" title="Next (arrow right)" onClick={() => go((index ?? 0) + 1)}><ArrowRight /></button>
          <div className="pswp__caption"><div className="pswp__caption__center"></div></div>
        </div>
      </div>
    </div>
  );
}
