import { SiteChrome } from "@/components/shell/SiteChrome";
import CartView from "@/components/commerce/CartView";

export const metadata = { title: "Keranjang Belanja – Manis Grafika" };

export default function CartPage() {
  return <SiteChrome><CartView /></SiteChrome>;
}
