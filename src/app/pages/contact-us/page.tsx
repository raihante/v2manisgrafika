import { NewsletterSection, SiteChrome } from "@/components/HomePage";
import ContactPage from "@/components/pages/ContactPage";
import { contactRepository } from "@/lib/pages/contact";
// Source page.contact rules (generated, scoped to .template-page-contact) followed by local overrides.
import "./contact-source.css";
import "./contact-page.css";

export function generateMetadata() {
  return { title: contactRepository.get().documentTitle };
}

export default function ContactRoute() {
  return (
    <SiteChrome backToTop>
      {/* Stands in for the source <body> classes of template-page-contact (scopes contact-source.css). */}
      <div className="template-page template-page-contact animations-false button-uppercase-false navigation-uppercase-true product-title-uppercase-false swym-buttons-loaded swym-ready">
        <ContactPage page={contactRepository.get()} />
      </div>
      <NewsletterSection />
    </SiteChrome>
  );
}
