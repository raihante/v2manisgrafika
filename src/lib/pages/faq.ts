// FAQ page repository (/pages/faqs, source template page.faq). Backed by the source-derived fixture
// src/data/pages/faqs.json (scripts/build-faq-data.mjs, 2026-11-06 snapshot); a CMS adapter replaces it.
import fixture from "@/data/pages/faqs.json";

export type FaqRow = { rowClass: string; detailsId: string; question: string; contentClass: string; contentId: string; answerHtml: string };
export type FaqGroup = { sectionId: string; className: string; contentClass: string; id: string; heading: string; headerClass: string; rows: FaqRow[] };
export type FaqPageData = {
  documentTitle: string;
  header: { sectionId: string; className: string; wrapperClass: string; headerClass: string; headerStyle: string; image: string; imageAlt: string; buttons: { label: string; text: string; active: boolean }[] };
  spacer: { sectionId: string; className: string; style: string };
  groups: FaqGroup[];
};

export const faqRepository = { get: (): FaqPageData => fixture as FaqPageData };
