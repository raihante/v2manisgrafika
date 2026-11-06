"use client";
/* eslint-disable @next/next/no-img-element -- source markup uses a plain <img> */
// /pages/faqs in the source template markup (template page.faq, theme t/33, 2026-11-06): faq_header (image + Flickity
// category carousel), a spacer, and one collapsible-content section per category (source rich-text answers).
// Behaviour follows reference/js/r256-header/jsc-reset-scripts.js:
// - clickFaqButton: moves .faq-active / .is-selected to the clicked button and animates the scroll (jQuery swing, 500 ms)
//   to the category section at offset -303 px.
// - updateFaqID: section ids use "_" for runs of [,&\s-] (applied in the fixture).
import { useState } from "react";
import CollapsibleRow from "@/components/shared/CollapsibleRow";
import { useCellCarousel } from "@/components/shared/useCellCarousel";
import { inlineStyle } from "@/components/pages/ContactPage";
import type { FaqPageData } from "@/lib/pages/faq";

const faqId = (label: string) => label.replace(/[,&\s-]+/g, "_");

/**
 * jQuery $("html, body").animate({ scrollTop }, 500) with the default "swing" easing, ticked by requestAnimationFrame
 * (jQuery 3 when the page is visible). Each tick jumps instantly: the tween itself is the animation, so the page's
 * `html{scroll-behavior:smooth}` must not turn every tick into a separate smooth scroll (measured: with smooth ticks the
 * local page did not move at all in the probe browser; reference/scripts/r257e-scroll-debug*.mjs).
 */
function animateScroll(to: number, duration = 500) {
  const from = window.scrollY;
  const t0 = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / duration);
    window.scrollTo({ top: from + (to - from) * (0.5 - Math.cos(p * Math.PI) / 2), behavior: "instant" });
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export default function FaqPage({ page }: { page: FaqPageData }) {
  const { header, spacer, groups } = page;
  const { viewportRef, sliderRef, selected, height, dragged, handlers } = useCellCarousel(header.buttons.length);
  // clickFaqButton moves .faq-active; it also sets .is-selected on the clicked cell, but Flickity re-applies its own
  // selection right after (measured: the source keeps "Most Asked" .is-selected after clicking "Delivery"), so the
  // carousel selection only changes by dragging.
  const [active, setActive] = useState(Math.max(0, header.buttons.findIndex((b) => b.active)));
  const select = (i: number, label: string) => {
    if (dragged()) return;
    setActive(i);
    const el = document.getElementById(faqId(label));
    if (el) animateScroll(el.getBoundingClientRect().top + window.scrollY - 303);
  };
  return (
    <>
      <div id={`shopify-section-${header.sectionId}`} className={header.className}>
        <div className={header.wrapperClass}>
          <div className="jsc-faq-row">
            <div className="small-12">
              <div className={header.headerClass} style={inlineStyle(header.headerStyle)}><img className="jsc-faq-header-image" src={header.image} alt={header.imageAlt} /></div>
              <div className="jsc-carousel flickity-enabled is-draggable" tabIndex={0}>
                <div className="flickity-viewport" ref={viewportRef} style={height !== null ? { height: `${height}px` } : undefined} onPointerDown={handlers.onPointerDown} onPointerMove={handlers.onPointerMove} onPointerUp={handlers.onPointerUp} onPointerCancel={handlers.onPointerCancel}>
                  <div className="flickity-slider" ref={sliderRef}>
                    {header.buttons.map((b, i) => (
                      <div key={b.label} className={`jsc-faq-column carousel__slide flickity-cell${i === selected ? " is-selected" : ""}`} aria-hidden={i === selected ? undefined : true}>
                        <a className={`text-button${i === active ? " faq-active" : ""}`} onClick={() => select(i, b.label)}><span>{b.text}</span></a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id={`shopify-section-${spacer.sectionId}`} className={spacer.className}>
        <div className="row"><div className="small-12 columns"><div className="spacer" style={inlineStyle(spacer.style)}></div></div></div>
      </div>
      {groups.map((g) => (
        <div key={g.sectionId} id={`shopify-section-${g.sectionId}`} className={g.className}>
          <div className={g.contentClass} id={g.id}>
            <div className="row jsc-collapsible-content">
              <div className="small-12 columns">
                {/* Source style="background-color: ;" has no value, so browsers ignore it; not reproduced. */}
                <div className={g.headerClass}><div className="section-header--content"><h2 className="h3">{g.heading}</h2></div></div>
                <div className="collapsible-content__inner">
                  {g.rows.map((r) => (
                    <CollapsibleRow key={r.detailsId} className={r.rowClass} detailsId={r.detailsId} summary={r.question}>
                      {/* Source rich text (CMS field). */}
                      <div className={r.contentClass} id={r.contentId} dangerouslySetInnerHTML={{ __html: r.answerHtml }} />
                    </CollapsibleRow>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
