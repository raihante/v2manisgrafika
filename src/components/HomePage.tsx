"use client";
/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import type { CSSProperties } from "react";
import { FormEvent, Fragment, useEffect, useRef, useState } from "react";
import data from "@/data/homepage.json";
import interactionData from "@/data/product-card-interactions.json";
import notifyIcon from "@/data/notify-icon.json";
import searchIcon from "@/data/search-icon.json";

type Overlay = "menu" | "search" | "cart" | null;
type Product = (typeof data.collections)[number]["products"][number];
type ProductInteraction = { secondaryImages: string[]; variants: { label: string; image: string | null; thumbnail: string | null; soldOut: boolean }[] };

const productInteractions = interactionData as Record<string, ProductInteraction>;

const mobileMenuSections: Record<string, { category: string[]; collection?: string[]; promotion?: string }> = {
  Bags: { category: ["New In", "Bags", "Pouches", "Shop All"], collection: ["Dumpling Series", "Carryall Series", "Para Series", "Studio Tote Series", "Envelope Series"], promotion: "/assets/source/a17469ea3386ccd7.webp" },
  Women: { category: ["New In", "Tops", "Bottoms", "Jumpsuits", "Dresses", "Shop All"], collection: ["Women Sets", "Women Denimwear", "Women Organic Cotton T Shirt"] },
  Men: { category: ["New In", "Tops", "Bottoms", "Shop All"], collection: ["Men Sets", "Men Denimwear", "Men Organic Cotton T Shirt"] },
  Kids: { category: ["New In", "Girls", "Boys", "Jumpsuits", "Bags", "Accessories", "Shop All"], collection: ["Kids STND01", "Kids Sets"] },
  Accessories: { category: ["New In", "Tech", "Pouches", "Caps", "Shop All"] },
  Lifestyle: { category: ["New In", "Homeware", "Key Tags", "Carabiners", "Stationery", "Shopper Tote", "Shop All"] },
};

function Icon({ name }: { name: "menu" | "search" | "user" | "heart" | "bag" | "close" | "arrow" }) {
  const paths = {
    menu: <><path d="M3 7h18M3 12h18M3 17h18" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 21c.8-5 3.3-7 7.5-7s6.7 2 7.5 7" /></>,
    heart: <path d="M20.8 5.7c-2.6-2.7-6.8-1.1-8.8 1.6-2-2.7-6.2-4.3-8.8-1.6-2.8 2.9-1 7.5 8.8 14.3 9.8-6.8 11.6-11.4 8.8-14.3Z" />,
    bag: <><path d="M5 8h14l-1 13H6L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    close: <><path d="m5 5 14 14M19 5 5 19" /></>,
    arrow: <path d="m9 5 7 7-7 7" />,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function Header({ open, menuOpen }: { open: (overlay: Overlay) => void; menuOpen: boolean }) {
  return (
    <>
      {/* Source marquee: three identical groups, each translating its own width over --marquee-speed. */}
      <div className="announcement-bar-section"><div className="announcement-bar"><div className="announcement-bar--inner direction-left announcement-bar--marquee" style={{ "--marquee-speed": "16s" } as CSSProperties}>{[0, 1, 2].map((group) => <div key={group} aria-hidden={group > 0 || undefined}>{data.announcement.map((item) => <div className="announcement-bar--item" key={item.href}><a href={item.href} target="_blank" rel="noreferrer" tabIndex={group > 0 ? -1 : undefined}>{item.text}</a></div>)}<div className="announcement-bar--item" /></div>)}</div></div></div>
      <header className={`site-header${menuOpen ? " mobile-menu-header-open" : ""}`}>
        <button className={`icon-button menu-trigger${menuOpen ? " menu-open" : ""}`} onClick={() => open("menu")} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}><span /><span /><span /></button>
        <a className="logo" href="#top"><img src={menuOpen ? "/assets/source/7abbb90a55ef138d.png" : data.logo} alt="Beyond The Vines" width={194} height={42} /></a>
        <div className="header-actions">
          <button className="thb-secondary-area-item header-search-button" onClick={() => open("search")} aria-label="Search"><svg className="search-icon" width={20} height={20} viewBox={searchIcon.viewBox} aria-hidden="true">{searchIcon.paths.map((d) => <path className="cls-1" d={d} key={d.slice(0, 24)} />)}</svg></button>
          <a className="thb-secondary-area-item thb-secondary-myaccount index-swishlist" href="#swym-wishlist" aria-label="My Wishlist">
            <svg className="wishlist-icon" width={20} height={20} viewBox="0 0 47.33 44.03" aria-hidden="true">
              <path className="cls-1" d="M47.29,14.84h0c0-.72-.09-1.45-.25-2.31-.34-1.81-.95-3.49-1.81-4.99-.85-1.48-1.91-2.78-3.14-3.85-1.07-.94-2.24-1.71-3.48-2.29-1.63-.77-3.32-1.22-5.05-1.34-1.19-.08-2.25-.04-3.25.13-1.57.26-3.04.76-4.38,1.48-.8.43-1.56.94-2.27,1.53-.12-.1-.25-.2-.37-.3C21.15,1.24,18.72.28,16.06.06c-1.62-.14-3.2-.01-4.69.38-3.03.8-5.59,2.39-7.62,4.75-1.05,1.22-1.89,2.6-2.52,4.12C.46,11.19.04,13.24,0,15.41c-.02,1.01.06,2.04.25,3.26.18,1.18.46,2.36.87,3.6.53,1.64,1.23,3.23,2.08,4.73.57,1.01,1.13,1.9,1.71,2.71.82,1.16,1.51,2.03,2.23,2.83l.29.32c.51.57,1.04,1.15,1.62,1.73.65.65,1.31,1.24,1.94,1.78.63.55,1.39,1.2,2.18,1.81,1.52,1.18,3.11,2.28,4.73,3.26,1.38.84,2.67,1.54,3.94,2.15.58.29,1.2.43,1.83.43s1.24-.14,1.82-.42c1.11-.53,2.25-1.14,3.37-1.81,1.9-1.13,3.68-2.34,5.29-3.6,1.18-.91,2.21-1.78,3.15-2.67.78-.73,1.5-1.48,2.19-2.21l.16-.17c.73-.76,1.45-1.63,2.27-2.74,1.23-1.66,2.22-3.29,3.03-5,.69-1.44,1.25-2.96,1.66-4.52.46-1.73.7-3.53.72-5.37,0-.3-.02-.55-.04-.69ZM42.81,19.97c-.35,1.32-.82,2.6-1.41,3.84-.73,1.53-1.62,2.97-2.63,4.33-.61.82-1.25,1.62-1.96,2.37-.71.75-1.42,1.5-2.18,2.21-.91.85-1.86,1.65-2.85,2.41-1.55,1.2-3.18,2.3-4.87,3.31-.99.59-2,1.13-3.03,1.63-.16.08-.28.08-.44,0-1.23-.6-2.43-1.26-3.6-1.97-1.5-.91-2.94-1.91-4.33-2.98-.69-.53-1.35-1.09-2-1.66-.59-.51-1.17-1.03-1.72-1.58-.61-.61-1.19-1.26-1.77-1.9-.7-.77-1.33-1.6-1.93-2.45-.54-.76-1.03-1.55-1.48-2.36-.72-1.28-1.31-2.62-1.76-4.01-.32-.98-.57-1.97-.72-2.98-.13-.87-.22-1.74-.21-2.61.03-1.63.32-3.2.94-4.71.47-1.12,1.09-2.15,1.88-3.08,1.53-1.78,3.43-2.95,5.69-3.54,1.11-.29,2.25-.37,3.39-.27,1.94.17,3.69.86,5.23,2.05.8.61,1.49,1.32,2.1,2.13.13.17.25.33.39.52.05.07.16.07.21,0,.12-.16.24-.32.35-.47.95-1.27,2.11-2.31,3.51-3.07,1-.54,2.07-.89,3.2-1.08.78-.13,1.57-.14,2.36-.08,1.28.09,2.51.43,3.68.98.95.45,1.81,1.03,2.6,1.72.95.83,1.72,1.79,2.34,2.88.68,1.18,1.12,2.45,1.37,3.79.11.56.18,1.12.18,1.69,0,.19.04.38.04.58-.01,1.49-.21,2.95-.59,4.38Z" />
            </svg>
          </a>
          <a className="thb-secondary-area-item myaccount-icon thb-secondary-myaccount" href="#" aria-label="My Account">
            <svg className="login-icon" width={20} height={20} viewBox="0 0 16.46 18.23" aria-hidden="true">
              <rect className="cls-1" x={4.58} y={0.86} width={7.3} height={7.3} rx={3.65} ry={3.65} />
              <path className="cls-1" d="M.86,17.37v-3.65c0-3.06,2.5-5.56,5.56-5.56h3.64c3.06,0,5.56,2.5,5.56,5.56v3.65" />
            </svg>
          </a>
          <button className="thb-secondary-area-item thb-secondary-cart" onClick={() => open("cart")} aria-label="Cart">
            <div className="thb-secondary-item-icon"><img src="/assets/source/d6fc4f371f8c4447.png" alt="" /><span className="thb-item-count" /></div>
          </button>
        </div>
      </header>
    </>
  );
}

const HERO_SWITCH_INTERVAL_MS = 5000;

// Source hero and promotion heights are Flickity gallery sizes: measured at init, after document.fonts.ready,
// and 150ms after the last window resize (Flickity's debounced onresize). Mirrors that timing.
function flickityResizeListener(measure: () => void) {
  measure();
  let timer = 0;
  let active = true;
  const onResize = () => { window.clearTimeout(timer); timer = window.setTimeout(measure, 150); };
  document.fonts?.ready.then(() => { if (active) measure(); });
  window.addEventListener("resize", onResize);
  return () => { active = false; window.clearTimeout(timer); window.removeEventListener("resize", onResize); };
}

function CategoryHero() {
  const slides = data.categoryHero;
  const count = slides.length;
  const [selected, setSelected] = useState(0);
  const [activeTitle, setActiveTitle] = useState(0);
  const positionRef = useRef(0);
  const velocityRef = useRef(0);
  const rafRef = useRef(0);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragRef = useRef<{ startX: number; startPosition: number; moved: boolean; lastX: number; lastTime: number; velocity: number } | null>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bgRef.current;
    if (!el) return;
    const setHeight = () => {
      const mobile = window.matchMedia("(max-width: 798px)").matches;
      const width = el.parentElement?.clientWidth ?? el.clientWidth;
      el.style.height = `${width * (mobile ? 3925 / 3390 : 2009 / 4000)}px`;
    };
    return flickityResizeListener(setHeight);
  }, []);

  const applyTransform = () => {
    const position = positionRef.current;
    cellRefs.current.forEach((cell, index) => {
      if (!cell) return;
      let relative = (((index - position) % count) + count) % count;
      if (relative > count / 2) relative -= count;
      cell.style.transform = `translateX(${relative * 100}%)`;
    });
    const next = ((Math.round(position) % count) + count) % count;
    setSelected((previous) => (previous === next ? previous : next));
  };

  const animateTo = (target: number) => {
    cancelAnimationFrame(rafRef.current);
    const step = () => {
      velocityRef.current += (target - positionRef.current) * 0.025;
      positionRef.current += velocityRef.current;
      velocityRef.current *= 1 - 0.28;
      if (Math.abs(target - positionRef.current) < 0.002 && Math.abs(velocityRef.current) < 0.002) {
        positionRef.current = target;
        velocityRef.current = 0;
        applyTransform();
        return;
      }
      applyTransform();
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const selectIndex = (index: number, syncTitle = true) => {
    if (syncTitle) setActiveTitle(index);
    const current = positionRef.current;
    let delta = (((index - current) % count) + count) % count;
    if (delta > count / 2) delta -= count;
    animateTo(current + delta);
  };

  const advance = () => {
    const target = Math.round(positionRef.current) + 1;
    setActiveTitle(((target % count) + count) % count);
    animateTo(target);
  };

  useEffect(() => {
    applyTransform();
    const timer = window.setInterval(advance, HERO_SWITCH_INTERVAL_MS);
    return () => {
      window.clearInterval(timer);
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    cancelAnimationFrame(rafRef.current);
    velocityRef.current = 0;
    dragRef.current = { startX: event.clientX, startPosition: positionRef.current, moved: false, lastX: event.clientX, lastTime: event.timeStamp, velocity: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const width = event.currentTarget.clientWidth || 1;
    const delta = event.clientX - drag.startX;
    if (Math.abs(delta) > 3) drag.moved = true;
    positionRef.current = drag.startPosition - delta / width;
    if (event.timeStamp > drag.lastTime) {
      drag.velocity = (event.clientX - drag.lastX) / (event.timeStamp - drag.lastTime);
      drag.lastX = event.clientX;
      drag.lastTime = event.timeStamp;
    }
    applyTransform();
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    const width = event.currentTarget.clientWidth || 1;
    const movedCells = (drag.startX - event.clientX) / width;
    let target = Math.round(positionRef.current);
    if (target === Math.round(drag.startPosition) && Math.abs(movedCells) > 0.12) {
      target = Math.round(drag.startPosition) + (movedCells > 0 ? 1 : -1);
    }
    setActiveTitle(((target % count) + count) % count);
    animateTo(target);
  };

  return (
    <section className="category-hero">
      <div className="category-links featured-collection-list--inner--content">{slides.map((item, index) => <button
        type="button"
        className={`featured-collection-list--button featured-collection-list--button-${index + 1}${index === activeTitle ? " active" : ""}`}
        key={item.label}
        onMouseEnter={() => selectIndex(index)}
        onClick={() => selectIndex(index)}
      ><span className="h1-large">{item.label}</span>{index < slides.length - 1 && <span className="slash-fea-col h1-large">/</span>}</button>)}</div>
      <div
        ref={bgRef}
        className="featured-collection-list--bg jsc-fc-slider-carousel flickity-enabled is-draggable"
        data-title-switcher="true"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="flickity-viewport">
          <div className="flickity-slider hero-flickity-track">
            {slides.map((slide, index) => (
              <div
                key={slide.label}
                ref={(node) => { cellRefs.current[index] = node; }}
                className={`jsc-feat-coll-image flickity-cell hero-flickity-cell${index === selected ? " is-selected" : ""}`}
                data-title={slide.label}
                aria-hidden={index !== selected}
              >
                <picture>
                  {slide.mobileImage && <source media="(max-width: 798px)" srcSet={slide.mobileImage} />}
                  <img src={slide.image} alt="" width={index === 2 || index === 4 || index === 5 ? 4001 : 4000} height={2009} loading="eager" fetchPriority={index === 0 ? "high" : "auto"} className={`featured-collection-list--img${index === selected ? " active" : ""}`} />
                </picture>
              </div>
            ))}
          </div>
        </div>
        <div className="flickity-page-dots">
          {slides.map((slide, index) => (
            <button
              key={slide.label}
              type="button"
              className={`flickity-page-dot hero-flickity-dot${index === selected ? " is-selected" : ""}`}
              aria-current={index === selected ? "step" : undefined}
              aria-label={`View slide ${index + 1}`}
              onClick={() => selectIndex(index, false)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PromotionSlider() {
  const slides = data.promotions;
  const count = slides.length;
  const [selected, setSelected] = useState(0);
  const positionRef = useRef(0);
  const velocityRef = useRef(0);
  const rafRef = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragRef = useRef<{ startX: number; startPosition: number } | null>(null);

  const applyTransform = () => {
    const position = positionRef.current;
    cellRefs.current.forEach((cell, index) => {
      if (!cell) return;
      let relative = (((index - position) % count) + count) % count;
      if (relative > count / 2) relative -= count;
      cell.style.transform = `translateX(${relative * 100}%)`;
    });
  };

  const animateTo = (target: number) => {
    cancelAnimationFrame(rafRef.current);
    setSelected(((Math.round(target) % count) + count) % count);
    const step = () => {
      velocityRef.current += (target - positionRef.current) * 0.025;
      positionRef.current += velocityRef.current;
      velocityRef.current *= 0.72;
      if (Math.abs(target - positionRef.current) < 0.002 && Math.abs(velocityRef.current) < 0.002) {
        positionRef.current = target;
        velocityRef.current = 0;
        applyTransform();
        return;
      }
      applyTransform();
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const selectIndex = (index: number) => {
    const current = positionRef.current;
    let delta = (((index - current) % count) + count) % count;
    if (delta > count / 2) delta -= count;
    animateTo(current + delta);
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const setHeight = () => {
      const mobile = window.matchMedia("(max-width: 798px)").matches;
      const width = root.parentElement?.clientWidth ?? root.clientWidth;
      root.style.height = `${width * (mobile ? 624 / 832 : 2449 / 4001)}px`;
    };
    applyTransform();
    const stopResize = flickityResizeListener(setHeight);
    const timer = window.setInterval(() => animateTo(Math.round(positionRef.current) + 1), 5000);
    return () => {
      stopResize();
      window.clearInterval(timer);
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    cancelAnimationFrame(rafRef.current);
    velocityRef.current = 0;
    dragRef.current = { startX: event.clientX, startPosition: positionRef.current };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    positionRef.current = drag.startPosition - (event.clientX - drag.startX) / (event.currentTarget.clientWidth || 1);
    applyTransform();
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    const moved = (drag.startX - event.clientX) / (event.currentTarget.clientWidth || 1);
    let target = Math.round(positionRef.current);
    if (target === Math.round(drag.startPosition) && Math.abs(moved) > 0.12) target = Math.round(drag.startPosition) + (moved > 0 ? 1 : -1);
    setSelected(((target % count) + count) % count);
    animateTo(target);
  };

  return (
    <section className="promotion-slider-section">
      <div
        ref={rootRef}
        className="promotion-slider slideshow main-slideshow carousel custom-dots mobile-height-image desktop-height-image transition--slide flickity-enabled is-draggable"
        data-dots="true"
        data-autoplay="5000"
        data-fade="false"
        data-transition="slide"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <ol className="flickity-page-dots">
          {slides.map((item, index) => <li
            className={`dot${index === selected ? " is-selected" : ""}`}
            aria-label={`${index + 1}`}
            onClick={() => selectIndex(index)}
            key={item.image}
          ><svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="thb-pagination-svg" preserveAspectRatio="none"><circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></li>)}
        </ol>
        <div className="flickity-viewport">
          <div className="flickity-slider">
            {slides.map((item, index) => <div
              ref={(node) => { cellRefs.current[index] = node; }}
              className={`slideshow__slide carousel__slide mobile-height-image desktop-height-image ${index === 2 ? "text-center" : "text-left"} content-size-medium${index === selected ? " is-selected" : ""}`}
              aria-hidden={index === selected ? undefined : true}
              key={item.image}
            >
              <div className="slideshow__slide-adapt-to-image">
                <picture>
                  <source media="(max-width: 798px)" srcSet={item.mobileSrcSet} sizes="100vw" />
                  <img src={item.image} alt="" width={index === 2 ? 4000 : 4001} height={index === 1 ? 2449 : 2448} loading="eager" fetchPriority={index === 0 ? "high" : "auto"} />
                </picture>
              </div>
              <div className="slideshow__slide-overlay" />
              <div className={`slideshow__slide-inner ${index === 2 ? "content-middle-center" : "content-bottom-left"}`}><div className="slideshow__slide-content"><a href={item.href} className="slideshow__slide-content-link" tabIndex={-1} aria-label={`Open promotion ${index + 1}`} /></div></div>
            </div>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const interaction = productInteractions[product.title];
  const [variantIndex, setVariantIndex] = useState(0);
  const [hoverImageIndex, setHoverImageIndex] = useState<number | null>(null);
  const [touchSwatchesOpen, setTouchSwatchesOpen] = useState(false);
  const selectedVariant = interaction?.variants[variantIndex];
  const primaryImage = selectedVariant?.image || product.image;
  const selectedLabel = selectedVariant?.label ?? product.swatchSelected;

  return (
    <article
      className={`product-card ${touchSwatchesOpen ? "swatches-open" : ""}`}
      onPointerDown={(event) => { if (event.pointerType === "touch") setTouchSwatchesOpen(true); }}
    >
      <a
        href="#"
        className="product-image"
        onPointerMove={(event) => {
          if (event.pointerType !== "mouse" || !interaction?.secondaryImages.length) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          const index = Math.min(interaction.secondaryImages.length - 1, Math.floor(((event.clientX - bounds.left) / bounds.width) * interaction.secondaryImages.length));
          setHoverImageIndex(index);
        }}
        onPointerLeave={() => setHoverImageIndex(null)}
      >
        <Image src={primaryImage} alt={product.title} fill sizes="(max-width: 767px) 60vw, 25vw" className="cover-image product-primary-local" />
        {hoverImageIndex !== null && interaction?.secondaryImages[hoverImageIndex] && <Image src={interaction.secondaryImages[hoverImageIndex]} alt="" fill sizes="(max-width: 767px) 60vw, 25vw" className="cover-image product-secondary-local active" />}
        {interaction?.secondaryImages.length > 0 && <span className="product-image-dots" aria-hidden="true">{interaction.secondaryImages.map((image, index) => <i className={hoverImageIndex === index ? "active" : ""} key={image} />)}</span>}
      </a>
      {product.overlayLabels.length > 0 && <div className="label-discount-code-grid-wrap"><div className="label-wrap">{product.overlayLabels.map((label) => <div className={label.className} key={label.text}>{label.text}</div>)}</div></div>}
      <button className="wishlist" aria-label={`Add ${product.title} to wishlist`}><Icon name="heart" /></button>
      <div className="product-info">
        <a href="#">{product.title}</a>
        <div className="product-swatches-local">
          <p><b>{`${selectedLabel} `}</b>{` ${product.swatchSuffix}`}</p>
          {interaction?.variants.length > 0 && <div className="product-swatch-track" role="group" aria-label={`${product.title} colours`}>
            {interaction.variants.map((variant, index) => <button
              type="button"
              className={`${index === variantIndex ? "active" : ""} ${variant.soldOut ? "sold-out" : ""}`}
              style={variant.thumbnail || variant.image ? { "--swatch-image": `url(${variant.thumbnail || variant.image})` } as CSSProperties : undefined}
              aria-label={`${variant.label}${variant.soldOut ? " (sold out)" : ""}`}
              aria-pressed={index === variantIndex}
              onMouseEnter={() => setVariantIndex(index)}
              onClick={() => setVariantIndex(index)}
              key={`${variant.label}-${index}`}
            />)}
          </div>}
        </div>
        <span className="price"><span className="amount">{product.price}</span></span>
        {product.button === "notify"
          ? <button className="notify-button" type="button">Notify Me <svg className="notify-icon" viewBox={notifyIcon.viewBox} aria-hidden="true">{notifyIcon.paths.map((d) => <path d={d} key={d.slice(0, 24)} />)}</svg></button>
          : <button type="button">Add to Bag</button>}
        {product.labels.length > 0 && <div className="label-wrap">{product.labels.map((label) => <div className={label.className} key={label.text}>{label.text}</div>)}</div>}
      </div>
    </article>
  );
}

// Source Flickity measures its viewport before cells are wrapped: titles are still 48px under
// (max-width:1067.99px) and swatch carousels are 25px tall, so the first gallery height is the
// tallest card + 9px (or + 7px wider). Any later resize re-measures without that offset.
const railInitialGap = () => 7 + (window.matchMedia("(max-width: 1067.99px)").matches ? 2 : 0);

// Source product carousels: Flickity { wrapAround, groupCells, cellAlign: left, draggable } inside a viewport that
// overflows the content box by one gutter (only the section clips), so neighbour cards peek into the side margins.
// Cells stay in flex flow (height comes from content) and are shifted per cell to their wrapped position.
const cellsPerView = () => (window.matchMedia("(min-width: 66.75em)").matches ? 6 : 2);

function ProductRail({ collection }: { collection: (typeof data.collections)[number] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const positionRef = useRef(0);
  const velocityRef = useRef(0);
  const rafRef = useRef(0);
  const perViewRef = useRef(2);
  const dragRef = useRef<{ startX: number; startPosition: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);
  const [initialGap, setInitialGap] = useState(0);
  const [navTop, setNavTop] = useState<number | null>(null);
  const count = collection.products.length;

  const applyTransform = () => {
    const position = positionRef.current;
    cellRefs.current.forEach((cell, index) => {
      if (!cell) return;
      const relative = ((((index - position + 1) % count) + count) % count) - 1;
      cell.style.transform = `translateX(${(relative - index) * 100}%)`;
    });
  };

  const animateTo = (target: number) => {
    cancelAnimationFrame(rafRef.current);
    const step = () => {
      velocityRef.current += (target - positionRef.current) * 0.025;
      positionRef.current += velocityRef.current;
      velocityRef.current *= 1 - 0.28;
      if (Math.abs(target - positionRef.current) < 0.002 && Math.abs(velocityRef.current) < 0.002) {
        positionRef.current = target;
        velocityRef.current = 0;
        applyTransform();
        return;
      }
      applyTransform();
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const selectRelative = (direction: number) => {
    const perView = perViewRef.current;
    animateTo(Math.round(positionRef.current / perView) * perView + direction * perView);
  };

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    // Source positions the arrows at the vertical centre of the product image (rounded offsetHeight).
    const measure = () => {
      perViewRef.current = cellsPerView();
      const image = wrap.querySelector<HTMLElement>(".product-image");
      if (image) setNavTop(image.offsetHeight / 2 - 15);
      positionRef.current = Math.round(positionRef.current / perViewRef.current) * perViewRef.current;
      applyTransform();
    };
    setInitialGap(railInitialGap());
    measure();
    let timer = 0;
    const onResize = () => { window.clearTimeout(timer); timer = window.setTimeout(() => { setInitialGap(0); measure(); }, 150); };
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); window.clearTimeout(timer); cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Flickity drag: 3px threshold, pointer capture once dragging, boost to the next group past 12% of a page.
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.pointerType === "mouse" && event.button !== 0) || (event.target as HTMLElement).closest(".product-rail-arrow")) return;
    cancelAnimationFrame(rafRef.current);
    velocityRef.current = 0;
    dragRef.current = { startX: event.clientX, startPosition: positionRef.current, moved: false };
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const wrap = wrapRef.current;
    if (!drag || !wrap) return;
    const delta = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(delta) <= 3) return;
    if (!drag.moved) { drag.moved = true; wrap.setPointerCapture(event.pointerId); }
    positionRef.current = drag.startPosition - delta / (wrap.clientWidth / perViewRef.current || 1);
    applyTransform();
  };
  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const wrap = wrapRef.current;
    dragRef.current = null;
    if (!drag || !wrap) return;
    if (!drag.moved) { animateTo(positionRef.current); return; }
    suppressClickRef.current = true;
    window.setTimeout(() => { suppressClickRef.current = false; }, 0);
    const perView = perViewRef.current;
    const movedPages = (drag.startX - event.clientX) / (wrap.clientWidth || 1);
    const startPage = Math.round(drag.startPosition / perView);
    let page = Math.round(positionRef.current / perView);
    if (page === startPage && Math.abs(movedPages) > 0.12) page = startPage + (movedPages > 0 ? 1 : -1);
    animateTo(page * perView);
  };

  const wrapStyle = { "--rail-initial-gap": `${initialGap}px`, ...(navTop !== null ? { "--rail-nav-top": `${navTop}px` } : {}) } as CSSProperties;
  return (
    <section className="product-section">
      <div className="section-heading" style={{ backgroundColor: collection.headerBackground }}>
        <div className="section-header--content"><h2>{collection.title}</h2></div>
        <div className="section-header--button"><a className="text-button" href="#">Shop More <svg width="15" height="11" viewBox="0 0 15 11" fill="none" aria-hidden="true"><path d="M0.799805 5.5H12.7998" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M9.49976 1L13.9998 5.5L9.49976 10" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg></a></div>
      </div>
      <div
        className="product-rail-wrap flickity-enabled is-draggable"
        ref={wrapRef}
        style={wrapStyle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={(event) => { if (suppressClickRef.current) { event.preventDefault(); event.stopPropagation(); } }}
      >
        <div className="product-rail">{collection.products.map((product, index) => (
          <div className="product-rail-cell carousel__slide" ref={(node) => { cellRefs.current[index] = node; }} key={product.href}>
            <ProductCard product={product} />
          </div>
        ))}</div>
        <button className="product-rail-arrow product-rail-arrow-prev" type="button" aria-label="Previous products" onClick={() => selectRelative(-1)}><svg width="16" height="16" viewBox="0 0 15 11" fill="none" aria-hidden="true"><path d="M9.75 1L5.25 5.5L9.75 10" stroke="#151515" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
        <button className="product-rail-arrow product-rail-arrow-next" type="button" aria-label="Next products" onClick={() => selectRelative(1)}><svg width="16" height="16" viewBox="0 0 15 11" fill="none" aria-hidden="true"><path d="M5.25 1L9.75 5.5L5.25 10" stroke="#151515" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
      </div>
    </section>
  );
}

function SocialHandle() {
  return (
    <section className="social-handle text-center text-position-center text-width-xlarge section-spacing-padding section-spacing--disable-top section-spacing--disable-bottom">
      <div className="row grid">
        <div className="small-12 columns">
          <div className="rich-text__inner">
            <h3 className="h3 jsc-header-text jsc-desktop-text"><p>{data.social.titleLines[0]}<br />{data.social.titleLines[1]}</p></h3>
            <h3 className="h3 jsc-header-text jsc-mobile-text"><p>{data.social.titleLines[0]}<br />{data.social.titleLines[1]}</p></h3>
            <div className="rte text-size-regular jsc-subtitle-text jsc-desktop-text">
              <p>{data.social.subtitle}<a href={data.social.instagramUrl} target="_blank" rel="noreferrer" title={data.social.instagramUrl}><strong>{data.social.instagramHandle}</strong></a></p>
            </div>
            <div className="rte text-size-regular jsc-subtitle-text jsc-mobile-text">
              <p>{data.social.subtitle}<a href={data.social.instagramUrl} target="_blank" rel="noreferrer" title={data.social.instagramUrl}><strong>{data.social.instagramHandle}</strong></a></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Mirrors the source Instafeed app (layout 7 slider, autoLayout, space 5, rowsLimit 4, sliderBehavior 0):
// columns follow the feed width, tile = (n - (k - 1) * d) / k with d = n / k * 5%, while the rendered gap
// is the section's 5px override. Arrows move one page (n + d) and wrap between the first and last page.
const instafeedColumns = (width: number) => [{ width: 480, columns: 2 }, { width: 768, columns: 3 }, { width: 1024, columns: 4 }, { width: 1200, columns: 5 }, { width: 1440, columns: 6 }, { width: 1680, columns: 7 }, { width: 1920, columns: 8 }].find((entry) => width < entry.width)?.columns ?? 8;
const round3 = (value: number) => parseFloat(value.toFixed(3));
type FeedLayout = { width: number; columns: number; space: number; tile: number; total: number };

function SocialFeed() {
  const feedRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<FeedLayout | null>(null);
  const slider = useRef({ current: 0, step: 0, transitioning: false });

  useEffect(() => {
    const build = () => {
      const feed = feedRef.current;
      if (!feed) return;
      const width = round3(feed.offsetWidth);
      const columns = instafeedColumns(feed.clientWidth);
      const space = round3((width / columns) * 0.05);
      const tile = round3(round3(width - round3((columns - 1) * space)) / columns);
      const total = Math.min(data.social.feedImages.length, 4 * columns);
      slider.current = { current: 0, step: width + space, transitioning: false };
      if (wrapperRef.current) { wrapperRef.current.style.transition = ""; wrapperRef.current.style.transform = ""; }
      setLayout({ width, columns, space, tile, total });
    };
    build();
    let timer = 0;
    let lastWidth = window.innerWidth;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => { if (window.innerWidth !== lastWidth) { lastWidth = window.innerWidth; build(); } }, 100);
    };
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); window.clearTimeout(timer); };
  }, []);

  const move = (direction: number) => {
    const state = slider.current;
    const wrapper = wrapperRef.current;
    if (!layout || !wrapper || state.transitioning) return;
    const max = round3((layout.width + layout.space) * (layout.total / layout.columns - 1));
    if (max - state.current < state.step) state.step = max - state.current;
    state.current = round3(state.current + direction * -state.step);
    if (state.current < -max) state.current = 0;
    if (state.current > 0) state.current = -max;
    wrapper.style.transition = "transform 0.5s ease-in-out";
    wrapper.style.transform = `translateX(${state.current}px)`;
    state.transitioning = true;
    window.setTimeout(() => { wrapper.style.transition = ""; state.transitioning = false; }, 500);
  };

  // Source dispatches a swipe as soon as a mouse drag passes 5px (one page per 500ms transition).
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !(event.target as HTMLElement).closest(".instafeed-hover-layer, .instafeed-new-layout-item-container")) return;
    const startX = event.clientX;
    const onMove = (moveEvent: PointerEvent) => { const delta = startX - moveEvent.clientX; if (Math.abs(delta) > 5) move(delta > 0 ? 1 : -1); };
    const onUp = () => { document.removeEventListener("pointermove", onMove); document.removeEventListener("pointerup", onUp); };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  };

  const images = layout ? data.social.feedImages.slice(0, layout.total) : [];
  return (
    <section className="social-feed">
      <div id="insta-feed" ref={feedRef}>
        {layout && <div className="instafeed-new-layout-container" data-layout="7" style={{ width: `${layout.width}px`, height: `${layout.tile}px` }} onPointerDown={onPointerDown}>
          <div className="instafeed-new-layout-wrapper" ref={wrapperRef}>
            {images.map((image, index) => (
              <div className="instafeed-new-layout-item image-loaded" style={{ width: `${layout.tile}px`, height: `${layout.tile}px` }} key={image}>
                <img className="instafeed-lazy-image" src={image} alt={`Instagram post ${index + 1}`} draggable={false} />
                <div className="instafeed-new-layout-item-container" role="button" tabIndex={0} aria-haspopup="dialog" aria-label="Instagram post opens in a popup">
                  <div className="instafeed-hover-layer"><div className="instafeed-hover-icon"><img src="/assets/payments/instagram-icon-v2.svg" alt="" /></div></div>
                </div>
              </div>
            ))}
          </div>
          {layout.total > layout.columns && <>
            <button aria-label="previous post" className="instafeed-new-arrow instafeed-new-arrow-prev" style={{ marginLeft: "10px", paddingRight: "2px" }} onClick={() => move(-1)} />
            <button aria-label="next post" className="instafeed-new-arrow instafeed-new-arrow-next" style={{ marginRight: "10px", paddingLeft: "2px" }} onClick={() => move(1)} />
          </>}
        </div>}
      </div>
    </section>
  );
}

function Footer() {
  const groups = [
    { title: "About BTV", links: data.footerLinks.slice(0, 3) },
    { title: "BTV Rewards", links: data.footerLinks.slice(3, 7) },
    { title: "Explore", links: data.footerLinks.slice(7, 12) },
    { title: "Support", links: data.footerLinks.slice(12, 17) },
  ];
  const socialLinks = data.footerLinks.slice(17);
  // Source wraps each social PNG in an SVG <image>; Pinterest carries its own offset transform.
  const socialTransform = (name: string) => (name === "pinterest" ? "translate(-2.44 -4.23) scale(.3)" : "scale(.29)");
  const paymentIcons = (
    <div className="footer-payment-icons">{data.payments.map((payment) => <Fragment key={payment.name}>{" "}<figure><img className="payment-icon-img" src={payment.image} alt={payment.name} width="100%" height="100%" /></figure></Fragment>)}{" "}</div>
  );
  return (
    <footer className="footer">
      <div className="footer-column-wrap-left">
        <div className="row full-width-row jsc-container-padding">
          {groups.map((group) => (
            <div className="small-12 medium-3 columns widget--menu-column" key={group.title}>
              <div className="widget widget--menu">
                <div className="thb-widget-title collapsible"><div className="jsc-widget-title">{group.title}</div></div>
                <ul className="thb-widget-menu">{group.links.map((link) => <li key={link.text}><a href="#">{link.text}</a></li>)}</ul>
              </div>
            </div>
          ))}
        </div>
        <div className="sub-footer">
          <div className="row full-width-row small-down--p-r-15 small-down--p-l-15">
            <div className="sub-footer-left">
              <div className="social-footer small-12 columns">
                <ul className="social-links">{socialLinks.map((link) => {
                  const name = link.text.toLowerCase();
                  return <li key={link.text}><a className={`social ${name}`} href={link.href} target="_blank" rel="noreferrer"><svg width="16" className={`icon icon-${name}`} viewBox="0 0 150 150" aria-hidden="true"><image width="512" height="512" transform={socialTransform(name)} href={`/assets/social-icons/${name}.png`} /></svg><span>{link.text}</span></a></li>;
                })}</ul>
              </div>
              <div className="small-12 columns"><p className="copyright-label">© Beyond The Vines Indonesia</p></div>
            </div>
            <div className="sub-footer copyright-desc">
              <div><p className="payment-icons-title">Beyond The Vines accepts</p></div>
              {paymentIcons}
            </div>
            <div className="copyright-desc-mobile">
              <div><p className="payment-icons-title">Beyond The Vines accepts</p></div>
              {paymentIcons}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function OverlayPanel({ type, close }: { type: Exclude<Overlay, null>; close: () => void }) {
  const [menuSection, setMenuSection] = useState<string | null>(null);
  if (type === "menu") {
    const menuItems = ["New In", "Bags", "Women", "Men", "Kids", "Accessories", "Eyewear", "Footwear", "Lifestyle", "Pets", "Online Exclusives"];
    const section = menuSection ? mobileMenuSections[menuSection] : null;
    return <><div className="menu-overlay-local" role="button" tabIndex={0} aria-label="Close menu" onClick={close} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") close(); }} /><nav className="mobile-menu-drawer-local" aria-label="Mobile navigation"><div className="mobile-menu-drawer-inner-local"><ul className="mobile-menu-local">{menuItems.map((item) => <li key={item}>{mobileMenuSections[item] ? <button type="button" onClick={() => setMenuSection(item)}>{item}</button> : <a href="#">{item}</a>}</li>)}</ul><div className="mobile-menu-footer-local"><div className="mobile-menu-account-links"><a href="#">Sign In</a><a href="#">Need Help?</a><a href="#">Store Locator</a><a className="mobile-menu-wishlist" href="#"><span>Wishlist</span><svg className="pixel-heart" width="20" height="20" viewBox="0 0 48.93 48.93" aria-hidden="true"><g fill="red"><rect x="20.97" y="13.99" width="6.99" height="6.99"/><rect x="20.98" y="27.96" width="6.99" height="6.99"/><rect x="6.99" y=".02" width="6.99" height="6.99"/><rect x="0" y="7.01" width="6.99" height="6.99"/><rect x="13.98" y="7" width="6.99" height="6.99"/><rect x="6.99" y="13.99" width="6.99" height="6.99"/><rect x="0" y="20.99" width="6.99" height="6.99"/><rect x="13.99" y="20.98" width="6.99" height="6.99"/><rect x="7" y="27.97" width="6.99" height="6.99"/><rect x="27.96" y="20.97" width="6.99" height="6.99"/><rect x="41.94" y="20.96" width="6.99" height="6.99"/><rect x="34.95" y="27.95" width="6.99" height="6.99"/><rect x="13.99" y="34.95" width="6.99" height="6.99"/><rect x="27.97" y="34.95" width="6.99" height="6.99"/><rect x="20.99" y="41.94" width="6.99" height="6.99"/><rect x="34.94" y="0" width="6.99" height="6.99"/><rect x="27.95" y="6.99" width="6.99" height="6.99"/><rect x="41.93" y="6.99" width="6.99" height="6.99"/><rect x="34.95" y="13.98" width="6.99" height="6.99"/></g></svg></a></div><div className="mobile-menu-markets"><button type="button"><span>EN</span><svg width="8" height="6" viewBox="0 0 8 6" aria-hidden="true"><path d="M6.75 1.5 3.75 4.5.75 1.5" /></svg></button><button type="button"><img src="/assets/source/930df51bb2514341.png" alt="Indonesia" /><span>ID</span><svg width="8" height="6" viewBox="0 0 8 6" aria-hidden="true"><path d="M6.75 1.5 3.75 4.5.75 1.5" /></svg></button></div></div>{menuSection && section && <div className="mobile-submenu-local"><button className="mobile-submenu-back" type="button" onClick={() => setMenuSection(null)}><span aria-hidden="true">←</span>Back</button><h2>{menuSection}</h2><h3>Shop By Category</h3>{section.category.map((item) => <a href="#" key={item}>{item}</a>)}{section.collection && <><h3>Shop By Collection</h3>{section.collection.map((item) => <a href="#" key={item}>{item}</a>)}</>}{section.promotion && <img className="mobile-submenu-promotion" src={section.promotion} alt="" />}</div>}</div></nav></>;
  }
  return <div className="overlay-backdrop" onClick={close}><aside className="overlay-panel" onClick={(event) => event.stopPropagation()}><button className="overlay-close" onClick={close} aria-label="Close"><Icon name="close" /></button>{type === "search" && <><h2>Search</h2><label><span className="sr-only">Search products</span><input autoFocus placeholder="Search products" /></label><p>Start typing to search the local product fixtures.</p></>}{type === "cart" && <><h2>Your Cart</h2><div className="empty-cart"><Icon name="bag" /><p>Your cart is empty.</p><button onClick={close}>Continue Shopping</button></div></>}</aside></div>;
}

function NewsletterSection() {
  const [subscribed, setSubscribed] = useState(false);
  const subscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribed(true);
  };
  return (
    <section className="newsletter">
      <div className="email-signup-inner">
        <div className="email-signup-column">
          <div className="section-header">
            <div className="section-header--content">
              <h2 className="h3">{data.newsletter.title}</h2>
              <div className="rte"><p>{data.newsletter.tagline}</p></div>
            </div>
          </div>
        </div>
        <div className="email-signup-column email-signup-column-2">
          <div className="email-signup-description show-desktop">
            <p>{data.newsletter.descriptionDesktop[0]}</p>
            <p>{data.newsletter.descriptionDesktop[1]}</p>
          </div>
          <div className="email-signup-description show-mobile">
            <p>{data.newsletter.descriptionMobile[0]}</p>
            <p>{data.newsletter.descriptionMobile[1]}</p>
          </div>
          <div className="signup-container">
            <form className="signup-form" onSubmit={subscribe}>
              <fieldset>
                <div className="field">
                  <input required type="email" id="NewsletterForm-email" name="contact[email]" placeholder={data.newsletter.placeholder} autoComplete="email" />
                  <label className="field__label" htmlFor="NewsletterForm-email">{data.newsletter.placeholder}</label>
                </div>
                <button className="submit" type="submit" aria-label="Enter your email">
                  {data.newsletter.buttonText}
                  <svg width="15" height="11" viewBox="0 0 15 11" fill="none" aria-hidden="true">
                    <path d="M0.799805 5.5H12.7998" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.49976 1L13.9998 5.5L9.49976 10" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </fieldset>
              {subscribed && <div className="jsc-newsletter-message-section">{data.newsletter.successMessage}</div>}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// Source <back-to-top>: fixed pill that slides in once the page is scrolled past one viewport height.
function BackToTop() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const update = () => setActive(window.scrollY > window.innerHeight);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return (
    <button type="button" className={`back-to-top${active ? " back-to-top--active" : ""}`} aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
      <svg width="11" height="16" viewBox="0 0 11 16" fill="none" aria-hidden="true">
        <path className="back-to-top--bar" d="M4.87654 2.34497C4.87654 1.99178 5.16285 1.70547 5.51604 1.70547C5.86922 1.70547 6.15554 1.99179 6.15554 2.34497V15.5613C6.15554 15.9144 5.86922 16.2008 5.51604 16.2008C5.16285 16.2008 4.87654 15.9144 4.87654 15.5613V2.34497Z" fill="#151515" />
        <path className="back-to-top--handle" d="M0.197525 5.0502L5.02195 0.225769C5.14739 0.100345 5.32293 0.0251028 5.48588 0C5.66143 -7.67342e-09 5.83696 0.0752197 5.96239 0.200647L10.7994 5.03761C10.9373 5.17554 11 5.33858 11 5.51412C11 5.68967 10.9248 5.8652 10.7994 5.99063C10.5486 6.254 10.1223 6.254 9.85892 5.99063L6.16301 2.30726C5.72921 2.1318 5.72921 1.70547 4.83387 2.29472L1.13796 5.99063C0.887198 6.254 0.460891 6.254 0.197525 5.99063C-0.0658415 5.73987 -0.0658415 5.31356 0.197525 5.0502Z" fill="#151515" />
      </svg>
    </button>
  );
}

export default function HomePage() {
  const [overlay, setOverlay] = useState<Overlay>(null);
  useEffect(() => {
    document.querySelectorAll<HTMLElement>(".product-rail, .instafeed-layout-wrapper").forEach((rail) => { rail.scrollLeft = 0; rail.style.transform = ""; });
  }, []);
  return <main id="top"><Header menuOpen={overlay === "menu"} open={(next) => setOverlay((current) => current === next ? null : next)} /><CategoryHero /><PromotionSlider />{data.collections.map((collection) => <ProductRail collection={collection} key={collection.title} />)}<SocialHandle /><SocialFeed /><NewsletterSection /><Footer /><BackToTop />{overlay && <OverlayPanel type={overlay} close={() => setOverlay(null)} />}</main>;
}
