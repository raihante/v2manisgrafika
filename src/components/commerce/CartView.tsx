"use client";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/catalog/format";
import { lineMeta, useCart } from "@/lib/cart";

export default function CartView() {
  const { lines, subtotal, count, service } = useCart();
  return (
    <section className="cm-page cm-cart">
      <h1>Keranjang Belanja</h1>
      {lines.length === 0 ? (
        <div className="cm-empty">
          <p>Keranjang Anda masih kosong.</p>
          <Link className="cm-button" href="/collections/new-in">Lanjut Belanja</Link>
        </div>
      ) : (
        <div className="cm-cart-layout">
          <ul className="cm-lines">
            {lines.map((line) => (
              <li className="cm-line" key={line.id}>
                <Link href={`/products/${line.handle}`} className="cm-line-image"><Image src={line.image} alt={line.title} fill sizes="120px" className="cover-image" /></Link>
                <div className="cm-line-info">
                  <Link href={`/products/${line.handle}`} className="cm-line-title">{line.title}</Link>
                  <p className="cm-line-meta">{lineMeta(line)}</p>
                  <p className="cm-line-price">{formatPrice(line.price)}</p>
                  <div className="cm-line-actions">
                    <div className="cm-qty" aria-label={`Jumlah ${line.title}`}>
                      <button type="button" onClick={() => service.setQuantity(line.id, line.quantity - 1)} aria-label="Kurangi jumlah">−</button>
                      <span>{line.quantity}</span>
                      <button type="button" onClick={() => service.setQuantity(line.id, line.quantity + 1)} aria-label="Tambah jumlah">+</button>
                    </div>
                    <button type="button" className="cm-link" onClick={() => service.remove(line.id)}>Hapus</button>
                  </div>
                </div>
                <p className="cm-line-total">{formatPrice(line.price * line.quantity)}</p>
              </li>
            ))}
          </ul>
          <aside className="cm-summary">
            <div className="cm-summary-row"><span>Subtotal ({count} pcs)</span><b>{formatPrice(subtotal)}</b></div>
            <p className="cm-muted">Ongkos kirim dihitung saat checkout.</p>
            <Link className="cm-button cm-button-full" href="/checkout">Checkout</Link>
            <Link className="cm-link cm-center" href="/collections/new-in">Lanjut Belanja</Link>
          </aside>
        </div>
      )}
    </section>
  );
}
