import CheckoutForm from "@/components/commerce/CheckoutForm";
import { repositories } from "@/lib/data";

export const metadata = { title: "Checkout – Manis Grafika" };

export default async function CheckoutPage() {
  return <CheckoutForm branding={await repositories.storefront.getCheckoutBranding()} />;
}
