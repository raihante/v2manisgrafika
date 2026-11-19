import { SiteChrome } from "@/components/shell/SiteChrome";
import AccountForms from "@/components/commerce/AccountForms";

export const metadata = { title: "Masuk – Manis Grafika" };

// MOCK account page (docs/mock-behaviors.md "Account"): no authentication until the Phase 2 backend.
export default function LoginPage() {
  return <SiteChrome><AccountForms initialView="login" /></SiteChrome>;
}
