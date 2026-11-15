import HomePage from "@/components/HomePage";
import { NewsletterSection, SiteChrome } from "@/components/shell/SiteChrome";
import { repositories } from "@/lib/data";

export default async function Page() {
  const data = await repositories.storefront.getHomepage();
  return <SiteChrome backToTop><HomePage data={data} /><NewsletterSection /></SiteChrome>;
}
