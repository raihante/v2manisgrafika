import { NewsletterSection, SiteChrome } from "@/components/HomePage";
import FaqPage from "@/components/pages/FaqPage";
import { faqRepository } from "@/lib/pages/faq";
// Source page.faq rules (generated, scoped to .template-page-faq) followed by local overrides.
import "./faq-source.css";
import "./faq-page.css";

export function generateMetadata() {
  return { title: faqRepository.get().documentTitle };
}

export default function FaqRoute() {
  return (
    <SiteChrome backToTop>
      {/* Stands in for the source <body> classes of template-page-faq (scopes faq-source.css). */}
      <div className="template-page template-page-faq animations-false button-uppercase-false navigation-uppercase-true product-title-uppercase-false swym-ready swym-buttons-loaded">
        <FaqPage page={faqRepository.get()} />
      </div>
      <NewsletterSection />
    </SiteChrome>
  );
}
