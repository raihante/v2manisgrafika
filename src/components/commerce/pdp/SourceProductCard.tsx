"use client";
/* eslint-disable @next/next/no-img-element -- source markup uses plain <img> inside <picture> */
// Product card in the source product-grid markup (snippets/product-card): wishlist button, overlay labels, primary
// and secondary images with the hover image nav, swatches + "<selected> + N Colours", price, Add to Bag (quick view)
// or Notify Me, and info labels. Used by Pair It With and You May Also Like on the product page.
import Link from "next/link";
import { useState } from "react";
import type { ProductCard } from "@/lib/product-details";
import { Spinner, WishlistIcons } from "./icons";

// Source label wraps always contain a newline text node, so they never match :empty (which would hide them).
const NL = "\n";

const Price = ({ text }: { text: string }) => (
  <span className="price">
    <span className="amount"> {text}</span>
    <small className="unit-price  hidden"><span></span><span className="unit-price-separator">/</span><span></span></small>
  </span>
);

type Props = { card: ProductCard; idPrefix: string; className?: string; style?: React.CSSProperties; ariaHidden?: boolean; onQuickView?: (card: ProductCard) => void };

export default function SourceProductCard({ card, idPrefix, className = "", style, ariaHidden, onQuickView }: Props) {
  // Source hover nav: moving across the image shows secondary image i (ul.product-secondary-images-nav li.active).
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);
  const swatches = (
    <div className="product-card-swatches--container no-js-hidden">
      <div className="product-card-swatches">
        {card.swatches.map((s, i) => (
          <div key={s.value} className={`product-card-swatch${s.active ? " active defaultswatch" : ""}${s.soldOut ? " swatch-soldout " : "  "}defaultswatchnoswap`} style={{ "--option-color": "var(--bg-body)", "--option-color-image": `url('${s.image}')` } as React.CSSProperties} data-href={s.href} data-value={s.value}>
            <span className="visually-hidden" data-for={`${idPrefix}-${i}`}>{s.value}</span>
          </div>
        ))}
      </div>
      <div className="product-card-swatches--title"><span className="var-selected">{card.swatchSelected}</span>{` ${card.swatchSuffix}`}</div>
    </div>
  );
  return (
    <product-card className={`product-card text-left${touched ? " hovergrid" : ""}${className ? ` ${className}` : ""}`} style={style} aria-hidden={ariaHidden} onTouchStart={() => setTouched(true)} onTouchEnd={() => setTouched(false)}>
      <figure className="product-featured-image thb-hover">
        <div className="swym-wishlist-button-custom-grid">
          {/* MOCK wishlist (docs/mock-behaviors.md "Wishlist"): no account storage, the button only toggles its pressed state. */}
          <WishlistButton label="Save it for later" />
        </div>
        <div className="label-discount-code-grid-wrap"><div className="label-wrap">{NL}{card.overlayLabels.map((l) => <div key={l.text} className={l.className}>{l.text}</div>)}</div></div>
        <Link
          href={card.imageHref}
          title={card.title}
          className="product-featured-image-link aspect-ratio aspect-ratio--adapt"
          style={{ "--padding-bottom": `${card.ratio}%` } as React.CSSProperties}
          onPointerMove={(e) => {
            if (e.pointerType !== "mouse" || !card.secondary.length) return;
            const r = e.currentTarget.getBoundingClientRect();
            setHoverIndex(Math.min(card.secondary.length - 1, Math.floor(((e.clientX - r.left) / r.width) * card.secondary.length)));
          }}
          onPointerLeave={() => setHoverIndex(null)}
        >
          {card.secondary.map((src, i) => (
            <picture key={src} className={i === 0 ? "firstimgsecond" : ""}>
              <img src={src} className={`product-secondary-image${hoverIndex === i ? " hover" : ""}`} alt={card.swatchSelected.trim()} />
            </picture>
          ))}
          <picture>{card.primary && <img src={card.primary} className={card.primaryClass} alt={card.swatchSelected.trim()} />}</picture>
          {card.secondary.length > 0 && <ul className="product-secondary-images-nav">{card.secondary.map((src, i) => <li key={src} className={hoverIndex === i ? "active" : undefined}></li>)}</ul>}
        </Link>
      </figure>
      <div className="product-card-info">
        <Link href={card.href} title={card.title} className="product-card-title"><h2 className="">{card.title}</h2></Link>
        {card.priceFirst ? <><Price text={card.price} />{swatches}</> : <>{swatches}<Price text={card.price} /></>}
        <div className="jsc-preorder-grid-ship" aria-hidden="true"></div>
        {card.button === "notify" ? (
          <div className="swym-bid-pdp swym-bid-grid product-card--add-to-cart-button button">Notify Me</div>
        ) : (
          <quick-view className="product-card--add-to-cart-button button" data-product-handle={card.handle ?? undefined} data-variant-id={card.variantId ?? undefined} tabIndex={-1} onClick={() => onQuickView?.(card)}>
            <span className="loading-overlay"><Spinner /></span>
            <span className="product-card--add-to-cart-text">Add to Bag</span>
          </quick-view>
        )}
        {/* Source whitespace between the button and the labels: it pushes the inline-flex .label-wrap to its own line. */}
        {NL}
        <div className="label-wrap">{NL}{card.labels.map((l) => <div key={l.text} className={l.className}>{l.text}</div>)}</div>
      </div>
    </product-card>
  );
}

export function WishlistButton({ label, children }: { label: string; children?: React.ReactNode }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button type="button" aria-label={label} data-with-epi="true" className={`swym-button swym-add-to-wishlist-view-product swym-iconbtnlink swym-heart swym-loaded${pressed ? " swym-added" : ""}`} data-swaction="addToWishlist" aria-pressed={pressed} onClick={(e) => { e.preventDefault(); setPressed((p) => !p); }}>
      <WishlistIcons />
      {children}
    </button>
  );
}
