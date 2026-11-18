"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { lineMeta } from "@/lib/cart";
import { formatPrice } from "@/lib/catalog/format";
import type { CheckoutBranding } from "@/lib/storefront/types";
import { CheckoutHeader } from "./CheckoutForm";
import { ORDER_KEY, type MockOrder } from "./order";

const readOrder = () => {
  try {
    return window.sessionStorage.getItem(ORDER_KEY);
  } catch {
    return null;
  }
};
const noSubscribe = () => () => {};

export default function ThankYou({ branding }: { branding: CheckoutBranding }) {
  const raw = useSyncExternalStore(noSubscribe, readOrder, () => null);
  const order = raw ? (JSON.parse(raw) as MockOrder) : null;

  return (
    <div className="co-page">
      <CheckoutHeader logo={branding.logo} />
      <div className="co-thanks">
        {!order ? (
          <div className="co-empty"><p>Belum ada pesanan simulasi terbaru.</p><Link className="cm-button" href="/">Lanjut Belanja</Link></div>
        ) : (
          <>
            <p className="co-preview-banner">Simulasi: ini konfirmasi contoh. Tidak ada pembayaran yang diproses.</p>
            <p className="cm-muted">Pesanan {order.number}</p>
            <h1>Terima kasih{order.name ? `, ${order.name.split(" ")[0]}` : ""}!</h1>
            <div className="co-box">
              <h2>Pesanan Anda sudah kami terima</h2>
              <p>Konfirmasi pesanan akan dikirim ke <b>{order.email}</b>. Tim kami akan menghubungi Anda melalui WhatsApp untuk proses desain.</p>
            </div>
            <div className="co-box co-details">
              <div><h3>Alamat pengiriman</h3><p>{order.name}<br />{order.address}<br />{order.phone}</p></div>
              <div><h3>Metode pengiriman</h3><p>{order.shipping.label}</p></div>
              <div><h3>Metode pembayaran</h3><p>{order.payment} &middot; {formatPrice(order.total)}</p></div>
            </div>
            <ul className="co-items co-box">
              {order.lines.map((line) => (
                <li key={line.id}><span className="co-item-info"><b>{line.quantity} &times; {line.title}</b><small>{lineMeta(line)}</small></span><span>{formatPrice(line.price * line.quantity)}</span></li>
              ))}
              <li><span>Ongkos kirim</span><span>{formatPrice(order.shipping.price)}</span></li>
              <li className="co-total"><span>Total</span><span>{formatPrice(order.total)}</span></li>
            </ul>
            <Link className="cm-button" href="/">Lanjut Belanja</Link>
          </>
        )}
      </div>
    </div>
  );
}
