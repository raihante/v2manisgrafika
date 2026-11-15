import { SiteChrome } from "@/components/shell/SiteChrome";
import CartView from "@/components/commerce/CartView";

export const metadata = { title: "Your Shopping Cart – Beyond The Vines Indonesia" };

export default function CartPage() {
  return <SiteChrome><CartView /></SiteChrome>;
}
