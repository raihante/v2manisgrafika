"use client";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

export default function CartView() {
  const { lines, subtotal, count, service } = useCart();
  return (
    <section className="cm-page cm-cart">
      <h1>Your Shopping Cart</h1>
      {lines.length === 0 ? (
        <div className="cm-empty">
          <p>Your cart is currently empty.</p>
          <Link className="cm-button" href="/collections/new-in">Continue shopping</Link>
        </div>
      ) : (
        <div className="cm-cart-layout">
          <ul className="cm-lines">
            {lines.map((line) => (
              <li className="cm-line" key={line.id}>
                <Link href={`/products/${line.handle}`} className="cm-line-image"><Image src={line.image} alt={line.title} fill sizes="120px" className="cover-image" /></Link>
                <div className="cm-line-info">
                  <Link href={`/products/${line.handle}`} className="cm-line-title">{line.title}</Link>
                  <p className="cm-line-meta">{[line.colour, line.size].filter(Boolean).join(" / ")}</p>
                  <p className="cm-line-price">{formatPrice(line.price)}</p>
                  <div className="cm-line-actions">
                    <div className="cm-qty" aria-label={`Quantity for ${line.title}`}>
                      <button type="button" onClick={() => service.setQuantity(line.id, line.quantity - 1)} aria-label="Decrease quantity">−</button>
                      <span>{line.quantity}</span>
                      <button type="button" onClick={() => service.setQuantity(line.id, line.quantity + 1)} aria-label="Increase quantity">+</button>
                    </div>
                    <button type="button" className="cm-link" onClick={() => service.remove(line.id)}>Remove</button>
                  </div>
                </div>
                <p className="cm-line-total">{formatPrice(line.price * line.quantity)}</p>
              </li>
            ))}
          </ul>
          <aside className="cm-summary">
            <div className="cm-summary-row"><span>Subtotal ({count} {count === 1 ? "item" : "items"})</span><b>{formatPrice(subtotal)}</b></div>
            <p className="cm-muted">Taxes and shipping calculated at checkout.</p>
            <Link className="cm-button cm-button-full" href="/checkout">Check Out</Link>
            <Link className="cm-link cm-center" href="/collections/new-in">Continue shopping</Link>
          </aside>
        </div>
      )}
    </section>
  );
}
