"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice, type Product } from "@/lib/catalog";
import { localCart } from "@/lib/cart";
import { ProductTile } from "./CollectionGrid";

export default function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const router = useRouter();
  const [colourIndex, setColourIndex] = useState(() => Math.max(0, product.colours.findIndex((c) => !c.soldOut)));
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const colour = product.colours[colourIndex];
  const gallery = [colour?.image ?? product.image, ...product.images.slice(1)].filter((src, i, all) => all.indexOf(src) === i);
  const [activeImage, setActiveImage] = useState(0);
  const unavailable = product.soldOut || colour?.soldOut;

  const addToBag = () => {
    if (product.sizes.length > 0 && !size) return setError("Please select a size.");
    localCart.add({ handle: product.handle, title: product.title, image: gallery[0], price: product.price, colour: colour?.label ?? "", size }, quantity);
    router.push("/cart");
  };

  return (
    <section className="cm-page cm-product">
      <nav className="cm-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>{product.title}</span></nav>
      <div className="cm-product-layout">
        <div className="cm-gallery">
          <div className="cm-gallery-main">
            <Image src={gallery[Math.min(activeImage, gallery.length - 1)]} alt={product.title} fill sizes="(max-width: 767px) 100vw, 55vw" className="cover-image" priority />
          </div>
          {gallery.length > 1 && (
            <div className="cm-gallery-thumbs">
              {gallery.map((src, index) => (
                <button type="button" key={src} className={index === activeImage ? "active" : ""} onClick={() => setActiveImage(index)} aria-label={`Show image ${index + 1}`}>
                  <Image src={src} alt="" fill sizes="80px" className="cover-image" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="cm-product-info">
          {product.labels[0] && <span className="cm-tile-label static">{product.labels[0]}</span>}
          <h1>{product.title}</h1>
          <p className="cm-product-price">{formatPrice(product.price)}</p>

          <fieldset className="cm-option">
            <legend>Colour: <b>{colour?.label}</b></legend>
            <div className="cm-swatches">
              {product.colours.map((c, index) => (
                <button type="button" key={c.label} aria-pressed={index === colourIndex} aria-label={`${c.label}${c.soldOut ? " (sold out)" : ""}`} className={`${index === colourIndex ? "active" : ""} ${c.soldOut ? "sold-out" : ""}`} style={{ backgroundImage: `url(${c.thumbnail ?? c.image})` }} onClick={() => { setColourIndex(index); setActiveImage(0); }} />
              ))}
            </div>
          </fieldset>

          {product.sizes.length > 0 && (
            <fieldset className="cm-option">
              <legend>Size: <b>{size ?? "Select"}</b></legend>
              <div className="cm-sizes">
                {product.sizes.map((s) => <button type="button" key={s} aria-pressed={s === size} className={s === size ? "active" : ""} onClick={() => { setSize(s); setError(""); }}>{s}</button>)}
              </div>
              <Link className="cm-link" href="/pages/womens-size-guide">Size guide</Link>
            </fieldset>
          )}

          <div className="cm-buy">
            <div className="cm-qty" aria-label="Quantity">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity">+</button>
            </div>
            <button type="button" className="cm-button cm-button-full" disabled={unavailable} onClick={addToBag}>{unavailable ? "Sold Out" : "Add to Bag"}</button>
          </div>
          {error && <p className="cm-error" role="alert">{error}</p>}
          <p className="cm-note">Preview: stock and pricing are sample data; no order is placed.</p>

          <details className="cm-accordion" open>
            <summary>Shipping &amp; Returns</summary>
            <p>See our <Link href="/pages/shipping-rate">shipping rates</Link> and <Link href="/pages/returns">returns policy</Link>.</p>
          </details>
        </div>
      </div>
      {related.length > 0 && (
        <div className="cm-related">
          <h2>You May Also Like</h2>
          <div className="cm-grid">{related.map((p) => <ProductTile product={p} key={p.handle} />)}</div>
        </div>
      )}
    </section>
  );
}
