"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { formatPrice } from "@/lib/catalog/format";
import type { CheckoutBranding } from "@/lib/storefront/types";
import { lineMeta, useCart } from "@/lib/cart";
import { ORDER_KEY, PROVINCES, SHIPPING_METHODS, VA_BANKS, type MockOrder } from "./order";

export function CheckoutHeader({ logo }: { logo: string }) {
  return (
    <header className="co-header">
      <Link href="/"><img src={logo} alt="Manis Grafika" width={194} height={42} /></Link>
      <Link href="/cart" className="co-header-cart">Keranjang</Link>
    </header>
  );
}

export default function CheckoutForm({ branding }: { branding: CheckoutBranding }) {
  const router = useRouter();
  const { lines, subtotal, count, service } = useCart();
  const [shippingId, setShippingId] = useState<string>(SHIPPING_METHODS[0].id);
  const [payment, setPayment] = useState<"va" | "qris">("va");
  const [bank, setBank] = useState<string>(VA_BANKS[0]);
  const [submitting, setSubmitting] = useState(false);
  const shipping = SHIPPING_METHODS.find((m) => m.id === shippingId) ?? SHIPPING_METHODS[0];
  const total = subtotal + shipping.price;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const get = (key: string) => String(form.get(key) ?? "").trim();
    setSubmitting(true);
    // MOCK payment: nothing is sent anywhere; the order lives only in sessionStorage for the thank-you page.
    const order: MockOrder = {
      number: `#MG${Date.now().toString().slice(-6)}`,
      email: get("email"),
      name: `${get("firstName")} ${get("lastName")}`.trim(),
      address: [get("address"), get("apartment"), `${get("city")}, ${get("province")} ${get("postal")}`, "Indonesia"].filter(Boolean).join(", "),
      phone: get("phone"),
      shipping: { label: shipping.label, price: shipping.price },
      payment: payment === "va" ? `Virtual Account ${bank}` : "QRIS",
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
        <CheckoutHeader logo={branding.logo} />
        <div className="co-empty"><p>Keranjang Anda masih kosong.</p><Link className="cm-button" href="/collections/new-in">Lanjut Belanja</Link></div>
      </div>
    );
  }

  return (
    <div className="co-page">
      <CheckoutHeader logo={branding.logo} />
      <div className="co-layout">
        <form className="co-main" onSubmit={submit}>
          <p className="co-preview-banner">Simulasi checkout: tidak ada pembayaran yang diproses dan tidak ada pesanan yang dibuat.</p>

          <section className="co-section">
            <div className="co-section-head"><h2>Kontak</h2><Link href="/account/login" className="cm-link">Masuk</Link></div>
            <input className="co-input" name="email" type="email" placeholder="Email" autoComplete="email" required />
            <label className="co-check"><input type="checkbox" name="newsletter" defaultChecked /> Kirimi saya kabar dan penawaran lewat email</label>
          </section>

          <section className="co-section">
            <h2>Pengiriman</h2>
            <select className="co-input" name="country" defaultValue="Indonesia" aria-label="Negara"><option>Indonesia</option></select>
            <div className="co-row">
              <input className="co-input" name="firstName" placeholder="Nama depan" autoComplete="given-name" required />
              <input className="co-input" name="lastName" placeholder="Nama belakang" autoComplete="family-name" required />
            </div>
            <input className="co-input" name="address" placeholder="Alamat lengkap" autoComplete="address-line1" required />
            <input className="co-input" name="apartment" placeholder="Detail alamat: RT/RW, blok, patokan (opsional)" autoComplete="address-line2" />
            <div className="co-row co-row-3">
              <input className="co-input" name="city" placeholder="Kota/Kabupaten" autoComplete="address-level2" required />
              <select className="co-input" name="province" defaultValue="" required aria-label="Provinsi">
                <option value="" disabled>Provinsi</option>
                {PROVINCES.map((p) => <option key={p}>{p}</option>)}
              </select>
              <input className="co-input" name="postal" placeholder="Kode pos" inputMode="numeric" pattern="[0-9]{5}" title="Kode pos 5 digit" autoComplete="postal-code" required />
            </div>
            <input className="co-input" name="phone" type="tel" placeholder="No. HP / WhatsApp" autoComplete="tel" required />
          </section>

          <section className="co-section">
            <h2>Metode pengiriman</h2>
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
            <h2>Pembayaran</h2>
            <p className="cm-muted">Pilih metode pembayaran. Instruksi pembayaran muncul setelah pesanan dibuat.</p>
            <div className="co-choices">
              <label className={`co-choice ${payment === "va" ? "active" : ""}`}>
                <input type="radio" name="payment" checked={payment === "va"} onChange={() => setPayment("va")} />
                <span className="co-choice-text"><b>Transfer Virtual Account</b><small>{VA_BANKS.join(", ")}</small></span>
              </label>
              {payment === "va" && (
                <div className="co-pay-fields">
                  <select className="co-input" value={bank} onChange={(e) => setBank(e.target.value)} aria-label="Bank virtual account">
                    {VA_BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}
              <label className={`co-choice ${payment === "qris" ? "active" : ""}`}>
                <input type="radio" name="payment" checked={payment === "qris"} onChange={() => setPayment("qris")} />
                <span className="co-choice-text"><b>QRIS</b><small>Bayar dengan scan QR lewat e-wallet atau mobile banking</small></span>
                <span className="co-marks">{branding.payments.filter((p) => p.name === "QRIS").map((p) => <img key={p.name} src={p.image} alt={p.name} />)}</span>
              </label>
            </div>
          </section>

          <button type="submit" className="cm-button cm-button-full co-pay" disabled={submitting}>{submitting ? "Memproses..." : "Bayar sekarang"}</button>
          <Link href="/cart" className="cm-link">&lsaquo; Kembali ke keranjang</Link>
        </form>

        <aside className="co-summary">
          <ul className="co-items">
            {lines.map((line) => (
              <li key={line.id}>
                <span className="co-item-image"><Image src={line.image} alt={line.title} fill sizes="64px" className="cover-image" /><i>{line.quantity}</i></span>
                <span className="co-item-info"><b>{line.title}</b><small>{lineMeta(line)}</small></span>
                <span>{formatPrice(line.price * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="co-totals">
            <div><span>Subtotal &middot; {count} pcs</span><span>{formatPrice(subtotal)}</span></div>
            <div><span>Ongkos kirim</span><span>{formatPrice(shipping.price)}</span></div>
            <div className="co-total"><span>Total</span><span><small>IDR</small> {formatPrice(total)}</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
