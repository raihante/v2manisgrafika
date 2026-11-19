import { SiteChrome } from "@/components/shell/SiteChrome";
import AccountForms from "@/components/commerce/AccountForms";

export const metadata = { title: "Daftar – Manis Grafika" };

// MOCK account page (docs/mock-behaviors.md "Account"): no account is created until the Phase 2 backend.
export default function RegisterPage() {
  return <SiteChrome><AccountForms initialView="register" /></SiteChrome>;
}
