"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { formatPrice, storefront } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { ORDER_KEY, PROVINCES, SHIPPING_METHODS, type MockOrder } from "./order";

export function CheckoutHeader() {
  return (
    <header className="co-header">
      <Link href="/"><img src={storefront.logo} alt="Beyond The Vines" width={194} height={42} /></Link>
      <Link href="/cart" className="co-header-cart">Cart</Link>
    </header>
  );
}

export default function CheckoutForm() {
  const router = useRouter();
  const { lines, subtotal, count, service } = useCart();
  const [shippingId, setShippingId] = useState<string>(SHIPPING_METHODS[0].id);
  const [payment, setPayment] = useState<"card" | "qris">("card");
  const [submitting, setSubmitting] = useState(false);
  const shipping = SHIPPING_METHODS.find((m) => m.id === shippingId) ?? SHIPPING_METHODS[0];
  const total = subtotal + shipping.price;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const get = (key: string) => String(form.get(key) ?? "").trim();
    setSubmitting(true);
    // MOCK payment: nothing is sent anywhere. Card inputs have no name, so they never enter FormData or storage.
    const order: MockOrder = {
      number: `#BTV${Date.now().toString().slice(-6)}`,
      email: get("email"),
      name: `${get("firstName")} ${get("lastName")}`.trim(),
      address: [get("address"), get("apartment"), `${get("city")}, ${get("province")} ${get("postal")}`, "Indonesia"].filter(Boolean).join(", "),
      phone: get("phone"),
      shipping: { label: shipping.label, price: shipping.price },
      payment: payment === "card" ? "Credit / Debit Card" : "QRIS",
      lines,
      subtotal,
      total,
    };
    try {
      window.sessionStorage.setItem(ORDER_KEY, JSON.stringify(order));
    } catch {
      // Storage unavailable: the thank-you page falls back to its empty state.
    }
    window.setTimeout(() => {
      service.clear();
      router.push("/checkout/thank-you");
    }, 900);
  };

  if (lines.length === 0) {
    return (
      <div className="co-page">
        <CheckoutHeader />
        <div className="co-empty"><p>Your cart is empty.</p><Link className="cm-button" href="/collections/new-in">Continue shopping</Link></div>
      </div>
    );
  }

  return (
    <div className="co-page">
      <CheckoutHeader />
      <div className="co-layout">
        <form className="co-main" onSubmit={submit}>
          <p className="co-preview-banner">Preview checkout: no payment is processed and no order is created.</p>

          <section className="co-section">
            <div className="co-section-head"><h2>Contact</h2><Link href="/account/login" className="cm-link">Log in</Link></div>
            <input className="co-input" name="email" type="email" placeholder="Email" autoComplete="email" required />
            <label className="co-check"><input type="checkbox" name="newsletter" defaultChecked /> Email me with news and offers</label>
          </section>

          <section className="co-section">
            <h2>Delivery</h2>
            <select className="co-input" name="country" defaultValue="Indonesia" aria-label="Country/Region"><option>Indonesia</option></select>
            <div className="co-row">
              <input className="co-input" name="firstName" placeholder="First name" autoComplete="given-name" required />
              <input className="co-input" name="lastName" placeholder="Last name" autoComplete="family-name" required />
            </div>
            <input className="co-input" name="address" placeholder="Address" autoComplete="address-line1" required />
            <input className="co-input" name="apartment" placeholder="Apartment, suite, etc. (optional)" autoComplete="address-line2" />
            <div className="co-row co-row-3">
              <input className="co-input" name="city" placeholder="City" autoComplete="address-level2" required />
              <select className="co-input" name="province" defaultValue="" required aria-label="Province">
                <option value="" disabled>Province</option>
                {PROVINCES.map((p) => <option key={p}>{p}</option>)}
              </select>
              <input className="co-input" name="postal" placeholder="Postal code" inputMode="numeric" pattern="[0-9]{5}" title="5-digit postal code" autoComplete="postal-code" required />
            </div>
            <input className="co-input" name="phone" type="tel" placeholder="Phone" autoComplete="tel" required />
          </section>

          <section className="co-section">
            <h2>Shipping method</h2>
            <div className="co-choices">
              {SHIPPING_METHODS.map((m) => (
                <label key={m.id} className={`co-choice ${shippingId === m.id ? "active" : ""}`}>
                  <input type="radio" name="shipping" value={m.id} checked={shippingId === m.id} onChange={() => setShippingId(m.id)} />
                  <span className="co-choice-text"><b>{m.label}</b><small>{m.eta}</small></span>
                  <span>{formatPrice(m.price)}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="co-section">
            <h2>Payment</h2>
            <p className="cm-muted">All transactions are secure and encrypted.</p>
            <div className="co-choices">
              <label className={`co-choice ${payment === "card" ? "active" : ""}`}>
                <input type="radio" name="payment" checked={payment === "card"} onChange={() => setPayment("card")} />
                <span className="co-choice-text"><b>Credit / Debit Card</b></span>
                <span className="co-marks">{storefront.payments.filter((p) => p.name !== "QRIS").map((p) => <img key={p.name} src={p.image} alt={p.name} />)}</span>
              </label>
              {payment === "card" && (
                <div className="co-card-fields">
                  <input className="co-input" placeholder="Card number" inputMode="numeric" autoComplete="off" required />
                  <div className="co-row">
                    <input className="co-input" placeholder="Expiration date (MM / YY)" autoComplete="off" required />
                    <input className="co-input" placeholder="Security code" inputMode="numeric" autoComplete="off" required />
                  </div>
                  <input className="co-input" placeholder="Name on card" autoComplete="off" required />
                </div>
              )}
              <label className={`co-choice ${payment === "qris" ? "active" : ""}`}>
                <input type="radio" name="payment" checked={payment === "qris"} onChange={() => setPayment("qris")} />
                <span className="co-choice-text"><b>QRIS</b><small>Scan to pay with any QRIS-supported e-wallet or banking app</small></span>
                <span className="co-marks">{storefront.payments.filter((p) => p.name === "QRIS").map((p) => <img key={p.name} src={p.image} alt={p.name} />)}</span>
              </label>
            </div>
          </section>

          <button type="submit" className="cm-button cm-button-full co-pay" disabled={submitting}>{submitting ? "Processing..." : "Pay now"}</button>
          <Link href="/cart" className="cm-link">&lsaquo; Return to cart</Link>
        </form>

        <aside className="co-summary">
          <ul className="co-items">
            {lines.map((line) => (
              <li key={line.id}>
                <span className="co-item-image"><Image src={line.image} alt={line.title} fill sizes="64px" className="cover-image" /><i>{line.quantity}</i></span>
                <span className="co-item-info"><b>{line.title}</b><small>{[line.colour, line.size].filter(Boolean).join(" / ")}</small></span>
                <span>{formatPrice(line.price * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="co-totals">
            <div><span>Subtotal &middot; {count} {count === 1 ? "item" : "items"}</span><span>{formatPrice(subtotal)}</span></div>
            <div><span>Shipping</span><span>{formatPrice(shipping.price)}</span></div>
            <div className="co-total"><span>Total</span><span><small>IDR</small> {formatPrice(total)}</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
