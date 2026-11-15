import { NewsletterSection, SiteChrome } from "@/components/shell/SiteChrome";
import FaqPage from "@/components/pages/FaqPage";
import { repositories } from "@/lib/data";
// Source page.faq rules (generated, scoped to .template-page-faq) followed by local overrides.
import "./faq-source.css";
import "./faq-page.css";

export async function generateMetadata() {
  return { title: (await repositories.pages.getFaqPage()).documentTitle };
}

export default async function FaqRoute() {
  const data = await repositories.pages.getFaqPage();
  return (
    <SiteChrome backToTop>
      {/* Stands in for the source <body> classes of template-page-faq (scopes faq-source.css). */}
      <div className="template-page template-page-faq animations-false button-uppercase-false navigation-uppercase-true product-title-uppercase-false swym-ready swym-buttons-loaded">
        <FaqPage page={data} />
      </div>
      <NewsletterSection />
    </SiteChrome>
  );
}
