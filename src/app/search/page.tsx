import { Suspense } from "react";
import { NewsletterSection, SiteChrome } from "@/components/HomePage";
import SearchPage, { SearchPageStatic } from "@/components/commerce/search/SearchPage";
import { searchRepository } from "@/lib/search/repository";
// Source search-template rules (generated, scoped to .template-search) followed by local overrides.
import "./search-source.css";
import "./search-page.css";

export function generateMetadata() {
  return { title: searchRepository.meta().documentTitle.empty };
}

// The query lives in the URL (?q=); in the static export it is read on the client (useSearchParams), so the
// prerendered HTML is the no-query state, which is also the Suspense fallback.
export default function SearchRoute() {
  return (
    <SiteChrome backToTop>
      {/* Stands in for the source <body> classes of template-search (scopes search-source.css). */}
      <div className="template-search animations-false button-uppercase-false navigation-uppercase-true product-title-uppercase-false swym-ready swym-buttons-loaded">
        <Suspense fallback={<SearchPageStatic />}><SearchPage /></Suspense>
      </div>
      <NewsletterSection />
    </SiteChrome>
  );
}
