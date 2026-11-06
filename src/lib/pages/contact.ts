// Contact page repository (/pages/contact-us, source template page.contact). Backed by the source-derived fixture
// src/data/pages/contact-us.json (scripts/build-contact-data.mjs, 2026-11-06 snapshot); a CMS adapter replaces it.
import fixture from "@/data/pages/contact-us.json";

export type ContactPageData = {
  documentTitle: string;
  richText: {
    sectionId: string; className: string; style: string; innerClass: string; imgClass: string;
    width: number; height: number; placeholder: string; srcset: { src: string; w: number }[]; alt: string; imgStyle: string;
  };
  /** Third-party form embed. MOCK: `src` points at public/mock/contact-form.html (docs/mock-behaviors.md "Contact form"). */
  form: { sectionId: string; className: string; divStyle: string; divClass: string; divId: string; iframeId: string; frameborder: string; width: string; initialHeight: number; src: string; title: string };
  multicolumn: { sectionId: string; className: string; columns: { className: string; title: string; html: string }[] };
};

export const contactRepository = { get: (): ContactPageData => fixture as ContactPageData };
