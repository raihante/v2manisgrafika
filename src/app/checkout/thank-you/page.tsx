import ThankYou from "@/components/commerce/ThankYou";
import { repositories } from "@/lib/data";

export const metadata = { title: "Terima Kasih – Manis Grafika" };

export default async function ThankYouPage() {
  return <ThankYou branding={await repositories.storefront.getCheckoutBranding()} />;
}
