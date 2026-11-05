"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { formatPrice } from "@/lib/catalog";
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

export default function ThankYou() {
  const raw = useSyncExternalStore(noSubscribe, readOrder, () => null);
  const order = raw ? (JSON.parse(raw) as MockOrder) : null;

  return (
    <div className="co-page">
      <CheckoutHeader />
      <div className="co-thanks">
        {!order ? (
          <div className="co-empty"><p>No recent preview order found.</p><Link className="cm-button" href="/">Continue shopping</Link></div>
        ) : (
          <>
            <p className="co-preview-banner">Preview only: this is a simulated confirmation. No payment was taken.</p>
            <p className="cm-muted">Order {order.number}</p>
            <h1>Thank you{order.name ? `, ${order.name.split(" ")[0]}` : ""}!</h1>
            <div className="co-box">
              <h2>Your order is confirmed</h2>
              <p>You will receive a confirmation email at <b>{order.email}</b> soon.</p>
            </div>
            <div className="co-box co-details">
              <div><h3>Shipping address</h3><p>{order.name}<br />{order.address}<br />{order.phone}</p></div>
              <div><h3>Shipping method</h3><p>{order.shipping.label}</p></div>
              <div><h3>Payment method</h3><p>{order.payment} &middot; {formatPrice(order.total)}</p></div>
            </div>
            <ul className="co-items co-box">
              {order.lines.map((line) => (
                <li key={line.id}><span className="co-item-info"><b>{line.quantity} &times; {line.title}</b><small>{[line.colour, line.size].filter(Boolean).join(" / ")}</small></span><span>{formatPrice(line.price * line.quantity)}</span></li>
              ))}
              <li><span>Shipping</span><span>{formatPrice(order.shipping.price)}</span></li>
              <li className="co-total"><span>Total</span><span>{formatPrice(order.total)}</span></li>
            </ul>
            <Link className="cm-button" href="/">Continue shopping</Link>
          </>
        )}
      </div>
    </div>
  );
}
