// Shared storefront shell on the source container hierarchy: #wrapper > announcement + header sections,
// div#main-content (role=main), footer group, then the side panels and .click-capture (reference/dom/r256-header/).
// Server component: reads the chrome content from the storefront repository and hands it to the client shell.
import { repositories } from "@/lib/data";
import { SiteChromeView } from "./SiteChromeView";
import { StorefrontProvider } from "./StorefrontContext";

export { NewsletterSection } from "./SiteChromeView";

export async function SiteChrome({ children, backToTop = false }: { children: React.ReactNode; backToTop?: boolean }) {
  const chrome = await repositories.storefront.getChrome();
  return (
    <StorefrontProvider chrome={chrome}>
      <SiteChromeView backToTop={backToTop}>{children}</SiteChromeView>
    </StorefrontProvider>
  );
}
